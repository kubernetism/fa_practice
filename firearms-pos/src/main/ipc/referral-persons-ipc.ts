import { ipcMain } from 'electron'
import { eq, and, desc, sql, like, or } from 'drizzle-orm'
import { getDatabase } from '../db'
import { referralPersons, type NewReferralPerson } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerReferralPersonHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'referral-persons:get-all',
    async (
      _,
      params: PaginationParams & {
        branchId?: number
        isActive?: boolean
        searchTerm?: string
      }
    ) => {
      try {
        const { page = 1, limit = 20, sortOrder = 'desc', branchId, isActive, searchTerm } = params

        const conditions = []

        if (branchId) conditions.push(eq(referralPersons.branchId, branchId))
        if (isActive !== undefined)
          conditions.push(eq(referralPersons.isActive, isActive))
        if (searchTerm) {
          conditions.push(
            or(
              like(referralPersons.name, `%${searchTerm}%`),
              like(referralPersons.contact, `%${searchTerm}%`),
              like(referralPersons.address, `%${searchTerm}%`)
            )
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(referralPersons)
          .where(whereClause)

        const total = countResult[0].count

        const data = await db
          .select()
          .from(referralPersons)
          .where(whereClause)
          .limit(limit)
          .offset((page - 1) * limit)
          .orderBy(
            sortOrder === 'desc'
              ? desc(referralPersons.createdAt)
              : referralPersons.createdAt
          )

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get referral persons error:', error)
        return { success: false, message: 'Failed to fetch referral persons' }
      }
    }
  )

  ipcMain.handle('referral-persons:get-by-id', async (_, id: number) => {
    try {
      const [referralPerson] = await db
        .select()
        .from(referralPersons)
        .where(eq(referralPersons.id, id))
        .limit(1)

      if (!referralPerson) {
        return { success: false, message: 'Referral person not found' }
      }

      return { success: true, data: referralPerson }
    } catch (error) {
      console.error('Get referral person error:', error)
      return { success: false, message: 'Failed to fetch referral person' }
    }
  })

  ipcMain.handle('referral-persons:create', async (_, data: NewReferralPerson) => {
    try {
      const session = getCurrentSession()

      const [newReferralPerson] = await db
        .insert(referralPersons)
        .values({
          ...data,
          branchId: data.branchId || session?.branchId || 1,
          totalCommissionEarned: data.totalCommissionEarned || 0,
          totalCommissionPaid: data.totalCommissionPaid || 0,
        })
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId || data.branchId,
        action: 'create',
        entityType: 'referral_person',
        entityId: newReferralPerson.id,
        newValues: { name: data.name, contact: data.contact },
        description: `Created referral person: ${data.name}`,
      })

      return { success: true, data: newReferralPerson }
    } catch (error) {
      console.error('Create referral person error:', error)
      return { success: false, message: 'Failed to create referral person' }
    }
  })

  ipcMain.handle(
    'referral-persons:update',
    async (_, id: number, data: Partial<NewReferralPerson>) => {
      try {
        const session = getCurrentSession()

        const [existing] = await db
          .select()
          .from(referralPersons)
          .where(eq(referralPersons.id, id))
          .limit(1)

        if (!existing) {
          return { success: false, message: 'Referral person not found' }
        }

        const [updated] = await db
          .update(referralPersons)
          .set({ ...data, updatedAt: new Date().toISOString() })
          .where(eq(referralPersons.id, id))
          .returning()

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'update',
          entityType: 'referral_person',
          entityId: id,
          newValues: data,
          oldValues: existing,
          description: `Updated referral person: ${existing.name}`,
        })

        return { success: true, data: updated }
      } catch (error) {
        console.error('Update referral person error:', error)
        return { success: false, message: 'Failed to update referral person' }
      }
    }
  )

  ipcMain.handle('referral-persons:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const [existing] = await db
        .select()
        .from(referralPersons)
        .where(eq(referralPersons.id, id))
        .limit(1)

      if (!existing) {
        return { success: false, message: 'Referral person not found' }
      }

      await db.delete(referralPersons).where(eq(referralPersons.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'referral_person',
        entityId: id,
        oldValues: existing,
        description: `Deleted referral person: ${existing.name}`,
      })

      return { success: true, message: 'Referral person deleted successfully' }
    } catch (error) {
      console.error('Delete referral person error:', error)
      return { success: false, message: 'Failed to delete referral person' }
    }
  })

  ipcMain.handle('referral-persons:get-for-select', async (_, branchId?: number) => {
    try {
      const session = getCurrentSession()
      const targetBranchId = branchId || session?.branchId

      const data = await db
        .select()
        .from(referralPersons)
        .where(
          and(
            targetBranchId ? eq(referralPersons.branchId, targetBranchId) : undefined,
            eq(referralPersons.isActive, true)
          )
        )
        .orderBy(referralPersons.name)

      return { success: true, data }
    } catch (error) {
      console.error('Get referral persons for select error:', error)
      return { success: false, message: 'Failed to fetch referral persons' }
    }
  })

  // Update commission totals for a referral person
  ipcMain.handle('referral-persons:update-commission', async (_, id: number, amount: number, isPaid: boolean = false) => {
    try {
      const [existing] = await db
        .select()
        .from(referralPersons)
        .where(eq(referralPersons.id, id))
        .limit(1)

      if (!existing) {
        return { success: false, message: 'Referral person not found' }
      }

      const updates: any = {
        updatedAt: new Date().toISOString(),
      }

      if (isPaid) {
        updates.totalCommissionPaid = (existing.totalCommissionPaid || 0) + amount
      } else {
        updates.totalCommissionEarned = (existing.totalCommissionEarned || 0) + amount
      }

      const [updated] = await db
        .update(referralPersons)
        .set(updates)
        .where(eq(referralPersons.id, id))
        .returning()

      return { success: true, data: updated }
    } catch (error) {
      console.error('Update commission error:', error)
      return { success: false, message: 'Failed to update commission totals' }
    }
  })
}
