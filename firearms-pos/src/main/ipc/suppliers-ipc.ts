import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { suppliers, type NewSupplier } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerSupplierHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'suppliers:get-all',
    async (_, params: PaginationParams & { search?: string; isActive?: boolean }) => {
      try {
        const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc', search, isActive } = params

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(suppliers.name, `%${search}%`),
              like(suppliers.contactPerson, `%${search}%`),
              like(suppliers.email, `%${search}%`)
            )
          )
        }

        if (isActive !== undefined) {
          conditions.push(eq(suppliers.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(suppliers)
          .where(whereClause)

        const total = countResult[0].count

        const orderColumn = suppliers[sortBy as keyof typeof suppliers] ?? suppliers.name
        const data = await db.query.suppliers.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any),
        })

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get suppliers error:', error)
        return { success: false, message: 'Failed to fetch suppliers' }
      }
    }
  )

  ipcMain.handle('suppliers:get-by-id', async (_, id: number) => {
    try {
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!supplier) {
        return { success: false, message: 'Supplier not found' }
      }

      return { success: true, data: supplier }
    } catch (error) {
      console.error('Get supplier error:', error)
      return { success: false, message: 'Failed to fetch supplier' }
    }
  })

  ipcMain.handle('suppliers:create', async (_, data: NewSupplier) => {
    try {
      const session = getCurrentSession()

      const result = await db.insert(suppliers).values(data).returning()
      const newSupplier = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'supplier',
        entityId: newSupplier.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created supplier: ${data.name}`,
      })

      return { success: true, data: newSupplier }
    } catch (error) {
      console.error('Create supplier error:', error)
      return { success: false, message: 'Failed to create supplier' }
    }
  })

  ipcMain.handle('suppliers:update', async (_, id: number, data: Partial<NewSupplier>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Supplier not found' }
      }

      const result = await db
        .update(suppliers)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(suppliers.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'supplier',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated supplier: ${existing.name}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update supplier error:', error)
      return { success: false, message: 'Failed to update supplier' }
    }
  })

  ipcMain.handle('suppliers:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Supplier not found' }
      }

      await db
        .update(suppliers)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(suppliers.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'supplier',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated supplier: ${existing.name}`,
      })

      return { success: true, message: 'Supplier deactivated successfully' }
    } catch (error) {
      console.error('Delete supplier error:', error)
      return { success: false, message: 'Failed to delete supplier' }
    }
  })
}
