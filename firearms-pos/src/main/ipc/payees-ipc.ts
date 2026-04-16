import { ipcMain } from 'electron'
import { eq, and, desc, sql, like } from 'drizzle-orm'
import { getDatabase } from '../db'
import { payees, type NewPayee } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { handleIpcError } from '../utils/error-handling'

export function registerPayeeHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'payees:getAll',
    async (
      _,
      params: {
        payeeType?: string
        isActive?: boolean
        search?: string
        limit?: number
        page?: number
      }
    ) => {
      try {
        const { payeeType, isActive, search, limit = 1000, page = 1 } = params || {}

        const conditions = []
        if (payeeType) conditions.push(eq(payees.payeeType, payeeType as any))
        if (isActive !== undefined) conditions.push(eq(payees.isActive, isActive))
        if (search) conditions.push(like(payees.name, '%' + search + '%'))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(payees)
          .where(whereClause)
        const total = countResult[0].count

        const data = await db.query.payees.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: desc(payees.name),
          with: {
            linkedSupplier: true,
          },
        })

        return { success: true, data, total, page, limit, totalPages: Math.ceil(total / limit) }
      } catch (error) {
        return handleIpcError('Get payees', error)
      }
    }
  )

  ipcMain.handle('payees:getById', async (_, id: number) => {
    try {
      const payee = await db.query.payees.findFirst({
        where: eq(payees.id, id),
        with: { linkedSupplier: true },
      })
      if (!payee) return { success: false, message: 'Payee not found' }
      return { success: true, data: payee }
    } catch (error) {
      return handleIpcError('Get payee', error)
    }
  })

  ipcMain.handle('payees:create', async (_, data: NewPayee) => {
    try {
      const session = getCurrentSession()

      if (!data.name?.trim()) {
        return { success: false, message: 'Payee name is required' }
      }
      if (!data.payeeType) {
        return { success: false, message: 'Payee type is required' }
      }
      // Block manual creation of vendor type without linked supplier
      if (data.payeeType === 'vendor' && !data.linkedSupplierId) {
        return {
          success: false,
          message: 'Vendor payees are auto-created from the Suppliers screen',
        }
      }

      const result = await db.insert(payees).values(data).returning()
      const newPayee = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'payee',
        entityId: newPayee.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: 'Created payee: ' + data.name + ' (' + data.payeeType + ')',
      })

      return { success: true, data: newPayee }
    } catch (error) {
      return handleIpcError('Create payee', error)
    }
  })

  ipcMain.handle('payees:update', async (_, id: number, data: Partial<NewPayee>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.payees.findFirst({ where: eq(payees.id, id) })
      if (!existing) return { success: false, message: 'Payee not found' }

      // Block type change from/to vendor
      if (data.payeeType && data.payeeType !== existing.payeeType) {
        if (existing.payeeType === 'vendor' || data.payeeType === 'vendor') {
          return {
            success: false,
            message: 'Cannot change payee type from/to vendor. Manage vendors via the Suppliers screen.',
          }
        }
      }

      const result = await db
        .update(payees)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(payees.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'payee',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: 'Updated payee: ' + existing.name,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      return handleIpcError('Update payee', error)
    }
  })

  ipcMain.handle('payees:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.payees.findFirst({ where: eq(payees.id, id) })
      if (!existing) return { success: false, message: 'Payee not found' }

      // Check if referenced by expenses
      const { expenses: expensesTable } = await import('../db/schema')
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(expensesTable)
        .where(eq(expensesTable.payeeId, id))
      if (usageCount[0].count > 0) {
        return {
          success: false,
          message: 'Cannot delete payee -- referenced by ' + usageCount[0].count + ' expense(s). Deactivate instead.',
        }
      }

      // Soft-delete: set isActive = false
      await db
        .update(payees)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(payees.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'payee',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: 'Deactivated payee: ' + existing.name,
      })

      return { success: true, message: 'Payee deactivated successfully' }
    } catch (error) {
      return handleIpcError('Delete payee', error)
    }
  })
}
