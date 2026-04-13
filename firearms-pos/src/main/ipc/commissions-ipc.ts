import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, isNull, isNotNull } from 'drizzle-orm'
import { getDatabase } from '../db'
import { commissions, users, sales, referralPersons, cashRegisterSessions, cashTransactions, type NewCommission } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'
import { postCommissionPaymentToGL } from '../utils/gl-posting'

export function registerCommissionHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'commissions:get-all',
    async (
      _,
      params: PaginationParams & {
        userId?: number
        referralPersonId?: number
        branchId?: number
        status?: string
        commissionType?: string
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortOrder = 'desc',
          userId,
          referralPersonId,
          branchId,
          status,
          commissionType,
          startDate,
          endDate,
        } = params

        const conditions = []

        if (userId) conditions.push(eq(commissions.userId, userId))
        if (referralPersonId) conditions.push(eq(commissions.referralPersonId, referralPersonId))
        if (branchId) conditions.push(eq(commissions.branchId, branchId))
        if (status)
          conditions.push(eq(commissions.status, status as 'pending' | 'approved' | 'paid' | 'cancelled'))
        if (commissionType) conditions.push(eq(commissions.commissionType, commissionType))
        if (startDate && endDate) {
          conditions.push(between(commissions.createdAt, startDate, endDate))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(commissions)
          .where(whereClause)

        const total = countResult[0].count

        const data = await db
          .select({
            commission: commissions,
            user: {
              id: users.id,
              fullName: users.fullName,
              username: users.username,
            },
            referralPerson: {
              id: referralPersons.id,
              name: referralPersons.name,
              contact: referralPersons.contact,
            },
            sale: {
              id: sales.id,
              invoiceNumber: sales.invoiceNumber,
              totalAmount: sales.totalAmount,
              saleDate: sales.saleDate,
            },
          })
          .from(commissions)
          .leftJoin(users, eq(commissions.userId, users.id))
          .leftJoin(referralPersons, eq(commissions.referralPersonId, referralPersons.id))
          .innerJoin(sales, eq(commissions.saleId, sales.id))
          .where(whereClause)
          .limit(limit)
          .offset((page - 1) * limit)
          .orderBy(sortOrder === 'desc' ? desc(commissions.createdAt) : commissions.createdAt)

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get commissions error:', error)
        return { success: false, message: 'Failed to fetch commissions' }
      }
    }
  )

  ipcMain.handle('commissions:get-by-id', async (_, id: number) => {
    try {
      const [commission] = await db
        .select({
          commission: commissions,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username,
          },
          referralPerson: {
            id: referralPersons.id,
            name: referralPersons.name,
            contact: referralPersons.contact,
          },
          sale: {
            id: sales.id,
            invoiceNumber: sales.invoiceNumber,
            totalAmount: sales.totalAmount,
            saleDate: sales.saleDate,
          },
        })
        .from(commissions)
        .leftJoin(users, eq(commissions.userId, users.id))
        .leftJoin(referralPersons, eq(commissions.referralPersonId, referralPersons.id))
        .innerJoin(sales, eq(commissions.saleId, sales.id))
        .where(eq(commissions.id, id))
        .limit(1)

      if (!commission) {
        return { success: false, message: 'Commission not found' }
      }

      return { success: true, data: commission }
    } catch (error) {
      console.error('Get commission error:', error)
      return { success: false, message: 'Failed to fetch commission' }
    }
  })

  ipcMain.handle('commissions:get-available-invoices', async (_, referralPersonId?: number) => {
    try {
      const session = getCurrentSession()
      const branchId = session?.branchId

      // Get ALL non-voided invoices (no filtering by existing commissions)
      const whereClause = branchId
        ? and(eq(sales.isVoided, false), eq(sales.branchId, branchId))
        : eq(sales.isVoided, false)

      const data = await db
        .select()
        .from(sales)
        .where(whereClause)
        .orderBy(desc(sales.saleDate))
        .limit(100)

      return { success: true, data }
    } catch (error) {
      console.error('Get available invoices error:', error)
      return { success: false, message: 'Failed to fetch available invoices' }
    }
  })

  ipcMain.handle(
    'commissions:create',
    async (
      _,
      data: {
        saleId: number
        userId?: number
        referralPersonId?: number
        commissionType: string
        baseAmount: number
        rate: number
        notes?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        // Validate: at least userId or referralPersonId must be provided
        if (!data.userId && !data.referralPersonId) {
          return {
            success: false,
            message: 'Either user or referral person must be specified',
          }
        }

        const commissionAmount = (data.baseAmount * data.rate) / 100

        const [newCommission] = await db
          .insert(commissions)
          .values({
            saleId: data.saleId,
            userId: data.userId || null,
            referralPersonId: data.referralPersonId || null,
            branchId: session?.branchId || 1,
            commissionType: data.commissionType as 'sale' | 'referral' | 'bonus',
            baseAmount: data.baseAmount,
            rate: data.rate,
            commissionAmount,
            status: 'pending',
            notes: data.notes,
          })
          .returning()

        // Update referral person's total commission
        if (data.referralPersonId) {
          await db
            .update(referralPersons)
            .set({
              totalCommissionEarned: sql`${referralPersons.totalCommissionEarned} + ${commissionAmount}`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(referralPersons.id, data.referralPersonId))
        }

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'create',
          entityType: 'commission',
          entityId: newCommission.id,
          newValues: {
            saleId: data.saleId,
            referralPersonId: data.referralPersonId,
            commissionAmount,
          },
          description: `Created ${data.commissionType} commission for sale #${data.saleId}`,
        })

        return { success: true, data: newCommission }
      } catch (error) {
        console.error('Create commission error:', error)
        return { success: false, message: 'Failed to create commission' }
      }
    }
  )

  ipcMain.handle(
    'commissions:update',
    async (
      _,
      id: number,
      data: {
        commissionType?: string
        baseAmount?: number
        rate?: number
        notes?: string
        status?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        const [existing] = await db
          .select()
          .from(commissions)
          .where(eq(commissions.id, id))
          .limit(1)

        if (!existing) {
          return { success: false, message: 'Commission not found' }
        }

        const updates: any = {
          ...data,
          updatedAt: new Date().toISOString(),
        }

        // Recalculate commission amount if baseAmount or rate changed
        if (data.baseAmount !== undefined || data.rate !== undefined) {
          const baseAmount = data.baseAmount ?? existing.baseAmount
          const rate = data.rate ?? existing.rate
          updates.commissionAmount = (baseAmount * rate) / 100
        }

        const [updated] = await db
          .update(commissions)
          .set(updates)
          .where(eq(commissions.id, id))
          .returning()

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'update',
          entityType: 'commission',
          entityId: id,
          newValues: data,
          oldValues: existing,
          description: `Updated commission #${id}`,
        })

        return { success: true, data: updated }
      } catch (error) {
        console.error('Update commission error:', error)
        return { success: false, message: 'Failed to update commission' }
      }
    }
  )

  ipcMain.handle('commissions:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const [existing] = await db
        .select()
        .from(commissions)
        .where(eq(commissions.id, id))
        .limit(1)

      if (!existing) {
        return { success: false, message: 'Commission not found' }
      }

      // If commission was for referral person, adjust their total
      if (existing.referralPersonId) {
        await db
          .update(referralPersons)
          .set({
            totalCommissionEarned: sql`MAX(0, ${referralPersons.totalCommissionEarned} - ${existing.commissionAmount})`,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(referralPersons.id, existing.referralPersonId))
      }

      await db.delete(commissions).where(eq(commissions.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'commission',
        entityId: id,
        oldValues: existing,
        description: `Deleted commission #${id}`,
      })

      return { success: true, message: 'Commission deleted successfully' }
    } catch (error) {
      console.error('Delete commission error:', error)
      return { success: false, message: 'Failed to delete commission' }
    }
  })

  ipcMain.handle('commissions:approve', async (_, ids: number[]) => {
    try {
      const session = getCurrentSession()

      await db
        .update(commissions)
        .set({
          status: 'approved',
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(commissions.status, 'pending'),
            sql`${commissions.id} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
          )
        )

      for (const id of ids) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'update',
          entityType: 'commission',
          entityId: id,
          newValues: { status: 'approved' },
          description: `Approved commission #${id}`,
        })
      }

      return { success: true, message: `${ids.length} commission(s) approved` }
    } catch (error) {
      console.error('Approve commissions error:', error)
      return { success: false, message: 'Failed to approve commissions' }
    }
  })

  ipcMain.handle('commissions:mark-paid', async (_, ids: number[]) => {
    try {
      const session = getCurrentSession()

      // Get commissions to update referral person paid totals
      const commissionRecords = await db
        .select()
        .from(commissions)
        .where(
          and(
            eq(commissions.status, 'approved'),
            sql`${commissions.id} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
          )
        )

      await db
        .update(commissions)
        .set({
          status: 'paid',
          paidDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(commissions.status, 'approved'),
            sql`${commissions.id} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
          )
        )

      // Update referral person paid totals, post GL entries, and record cash register
      for (const commission of commissionRecords) {
        if (commission.referralPersonId) {
          await db
            .update(referralPersons)
            .set({
              totalCommissionPaid: sql`${referralPersons.totalCommissionPaid} + ${commission.commissionAmount}`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(referralPersons.id, commission.referralPersonId))
        }

        // Post to General Ledger
        await postCommissionPaymentToGL(
          {
            id: commission.id,
            branchId: commission.branchId,
            commissionAmount: commission.commissionAmount,
            commissionType: commission.commissionType,
            saleId: commission.saleId,
          },
          session?.userId ?? 0
        )

        // Record cash register outflow (commissions are paid in cash)
        const today = new Date().toISOString().split('T')[0]
        const openSession = await db.query.cashRegisterSessions.findFirst({
          where: and(
            eq(cashRegisterSessions.branchId, commission.branchId),
            eq(cashRegisterSessions.sessionDate, today),
            eq(cashRegisterSessions.status, 'open')
          ),
        })

        if (openSession) {
          await db.insert(cashTransactions).values({
            sessionId: openSession.id,
            branchId: commission.branchId,
            transactionType: 'expense',
            amount: -commission.commissionAmount,
            referenceType: 'commission',
            referenceId: commission.id,
            description: `Commission payment: ${commission.commissionType} #${commission.id}`,
            recordedBy: session?.userId ?? 0,
          })
        }

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'update',
          entityType: 'commission',
          entityId: commission.id,
          newValues: { status: 'paid' },
          description: `Marked commission #${commission.id} as paid`,
        })
      }

      return { success: true, message: `${ids.length} commission(s) marked as paid` }
    } catch (error) {
      console.error('Mark paid commissions error:', error)
      return { success: false, message: 'Failed to mark commissions as paid' }
    }
  })

  ipcMain.handle('commissions:get-summary', async (_, referralPersonId?: number, startDate?: string, endDate?: string) => {
    try {
      const conditions: any[] = []
      if (referralPersonId) conditions.push(eq(commissions.referralPersonId, referralPersonId))
      if (startDate && endDate) conditions.push(between(commissions.createdAt, startDate, endDate))

      const data = await db
        .select({
          status: commissions.status,
          total: sql<number>`sum(${commissions.commissionAmount})`,
          count: sql<number>`count(*)`,
        })
        .from(commissions)
        .where(and(...conditions))
        .groupBy(commissions.status)

      return { success: true, data }
    } catch (error) {
      console.error('Get commission summary error:', error)
      return { success: false, message: 'Failed to fetch commission summary' }
    }
  })
}
