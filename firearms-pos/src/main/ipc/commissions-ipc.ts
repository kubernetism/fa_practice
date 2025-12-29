import { ipcMain } from 'electron'
import { eq, and, desc, sql, between } from 'drizzle-orm'
import { getDatabase } from '../db'
import { commissions, users, sales, type NewCommission } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerCommissionHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'commissions:get-all',
    async (
      _,
      params: PaginationParams & {
        userId?: number
        branchId?: number
        status?: string
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const { page = 1, limit = 20, sortOrder = 'desc', userId, branchId, status, startDate, endDate } = params

        const conditions = []

        if (userId) conditions.push(eq(commissions.userId, userId))
        if (branchId) conditions.push(eq(commissions.branchId, branchId))
        if (status)
          conditions.push(eq(commissions.status, status as 'pending' | 'approved' | 'paid' | 'cancelled'))
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
            sale: {
              id: sales.id,
              invoiceNumber: sales.invoiceNumber,
            },
          })
          .from(commissions)
          .innerJoin(users, eq(commissions.userId, users.id))
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

  ipcMain.handle('commissions:get-summary', async (_, userId: number, startDate?: string, endDate?: string) => {
    try {
      const conditions = [eq(commissions.userId, userId)]

      if (startDate && endDate) {
        conditions.push(between(commissions.createdAt, startDate, endDate))
      }

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

  ipcMain.handle('commissions:approve', async (_, ids: number[]) => {
    try {
      const session = getCurrentSession()

      await db
        .update(commissions)
        .set({
          status: 'approved',
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(commissions.status, 'pending'), sql`${commissions.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`))

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

      await db
        .update(commissions)
        .set({
          status: 'paid',
          paidDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(commissions.status, 'approved'), sql`${commissions.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`))

      for (const id of ids) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'update',
          entityType: 'commission',
          entityId: id,
          newValues: { status: 'paid' },
          description: `Marked commission #${id} as paid`,
        })
      }

      return { success: true, message: `${ids.length} commission(s) marked as paid` }
    } catch (error) {
      console.error('Mark paid commissions error:', error)
      return { success: false, message: 'Failed to mark commissions as paid' }
    }
  })

  ipcMain.handle(
    'commissions:calculate',
    async (_, saleId: number, userId: number, branchId: number, baseAmount: number, rate: number) => {
      try {
        const session = getCurrentSession()
        const commissionAmount = baseAmount * (rate / 100)

        const [newCommission] = await db
          .insert(commissions)
          .values({
            saleId,
            userId,
            branchId,
            commissionType: 'sale',
            baseAmount,
            rate,
            commissionAmount,
            status: 'pending',
          })
          .returning()

        await createAuditLog({
          userId: session?.userId,
          branchId,
          action: 'create',
          entityType: 'commission',
          entityId: newCommission.id,
          newValues: { saleId, userId, commissionAmount },
          description: `Created commission for sale #${saleId}`,
        })

        return { success: true, data: newCommission }
      } catch (error) {
        console.error('Calculate commission error:', error)
        return { success: false, message: 'Failed to calculate commission' }
      }
    }
  )
}
