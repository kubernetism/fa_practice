import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import { expenses, type NewExpense, accountPayables } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerExpenseHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'expenses:get-all',
    async (
      _,
      params: PaginationParams & {
        branchId?: number
        category?: string
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const { page = 1, limit = 20, sortOrder = 'desc', branchId, category, startDate, endDate } = params

        const conditions = []

        if (branchId) conditions.push(eq(expenses.branchId, branchId))
        if (category)
          conditions.push(
            eq(
              expenses.category,
              category as 'rent' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other'
            )
          )
        if (startDate && endDate) {
          conditions.push(between(expenses.expenseDate, startDate, endDate))
        } else if (startDate) {
          conditions.push(gte(expenses.expenseDate, startDate))
        } else if (endDate) {
          conditions.push(lte(expenses.expenseDate, endDate))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(expenses).where(whereClause)

        const total = countResult[0].count

        const data = await db.query.expenses.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(expenses.expenseDate) : expenses.expenseDate,
          with: {
            supplier: true,
            payable: true,
            branch: true,
            user: {
              columns: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
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
        console.error('Get expenses error:', error)
        return { success: false, message: 'Failed to fetch expenses' }
      }
    }
  )

  ipcMain.handle('expenses:get-by-id', async (_, id: number) => {
    try {
      const expense = await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
        with: {
          supplier: true,
          payable: true,
          branch: true,
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      })

      if (!expense) {
        return { success: false, message: 'Expense not found' }
      }

      return { success: true, data: expense }
    } catch (error) {
      console.error('Get expense error:', error)
      return { success: false, message: 'Failed to fetch expense' }
    }
  })

  ipcMain.handle('expenses:create', async (_, data: NewExpense) => {
    try {
      const session = getCurrentSession()

      // Validation: Unpaid expenses must have a supplier
      if (data.paymentStatus === 'unpaid' && !data.supplierId) {
        return {
          success: false,
          message: 'Supplier is required for unpaid expenses',
        }
      }

      // Validation: Unpaid expenses should have a due date
      if (data.paymentStatus === 'unpaid' && !data.dueDate) {
        return {
          success: false,
          message: 'Due date is required for unpaid expenses',
        }
      }

      let payableId: number | undefined = undefined

      // Create expense first
      const result = await db
        .insert(expenses)
        .values({
          ...data,
          userId: session?.userId ?? 0,
          payableId: undefined, // Will be updated after payable creation
        })
        .returning()

      const newExpense = result[0]

      // Auto-create payable for unpaid expenses
      if (data.paymentStatus === 'unpaid' && data.supplierId) {
        try {
          // Generate invoice number for the payable
          const invoiceNumber = `EXP-${newExpense.id}-${Date.now()}`

          const payableResult = await db
            .insert(accountPayables)
            .values({
              supplierId: data.supplierId,
              purchaseId: null,
              branchId: data.branchId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount,
              paidAmount: 0,
              remainingAmount: data.amount,
              status: 'pending',
              dueDate: data.dueDate,
              paymentTerms: data.paymentTerms,
              notes: `Auto-created from expense: ${data.category} - ${data.description || 'No description'}`,
              createdBy: session?.userId,
            })
            .returning()

          const newPayable = payableResult[0]
          payableId = newPayable.id

          // Update expense with payableId
          await db
            .update(expenses)
            .set({ payableId: newPayable.id })
            .where(eq(expenses.id, newExpense.id))

          // Audit log for payable creation
          await createAuditLog({
            userId: session?.userId,
            branchId: data.branchId,
            action: 'create',
            entityType: 'account_payable',
            entityId: newPayable.id,
            newValues: {
              supplierId: data.supplierId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount,
              source: 'expense',
              expenseId: newExpense.id,
            },
            description: `Auto-created payable from expense #${newExpense.id}`,
          })
        } catch (payableError) {
          console.error('Failed to create payable for expense:', payableError)
          // Don't fail the entire expense creation, but log the error
          // The expense is still created, payable can be created manually
        }
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'expense',
        entityId: newExpense.id,
        newValues: sanitizeForAudit({
          ...data,
          payableId,
        } as Record<string, unknown>),
        description: `Created ${data.paymentStatus || 'paid'} expense: ${data.category} - $${data.amount}`,
      })

      return {
        success: true,
        data: { ...newExpense, payableId },
        payableCreated: !!payableId,
      }
    } catch (error) {
      console.error('Create expense error:', error)
      return { success: false, message: 'Failed to create expense' }
    }
  })

  ipcMain.handle('expenses:update', async (_, id: number, data: Partial<NewExpense>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
        with: {
          payable: true,
        },
      })

      if (!existing) {
        return { success: false, message: 'Expense not found' }
      }

      // Validation: Can't change to unpaid if no supplier provided
      if (data.paymentStatus === 'unpaid' && !data.supplierId && !existing.supplierId) {
        return {
          success: false,
          message: 'Supplier is required for unpaid expenses',
        }
      }

      // Validation: Can't change amount if payable exists and has payments
      if (existing.payableId && data.amount && data.amount !== existing.amount) {
        const payable = await db.query.accountPayables.findFirst({
          where: eq(accountPayables.id, existing.payableId),
        })

        if (payable && payable.paidAmount > 0) {
          return {
            success: false,
            message: 'Cannot change amount - payable has existing payments',
          }
        }

        // Update payable amount if no payments yet
        if (payable) {
          await db
            .update(accountPayables)
            .set({
              totalAmount: data.amount,
              remainingAmount: data.amount,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(accountPayables.id, existing.payableId))
        }
      }

      // Handle status change: from unpaid to paid
      if (existing.paymentStatus === 'unpaid' && data.paymentStatus === 'paid') {
        if (existing.payableId) {
          // Check if payable is fully paid
          const payable = await db.query.accountPayables.findFirst({
            where: eq(accountPayables.id, existing.payableId),
          })

          if (payable && payable.status !== 'paid') {
            return {
              success: false,
              message: 'Cannot mark expense as paid - linked payable is not fully paid',
            }
          }
        }
      }

      // Handle status change: from paid to unpaid
      if (existing.paymentStatus === 'paid' && data.paymentStatus === 'unpaid') {
        const supplierIdToUse = data.supplierId || existing.supplierId
        if (!supplierIdToUse) {
          return {
            success: false,
            message: 'Supplier is required to change expense to unpaid',
          }
        }

        if (!data.dueDate && !existing.dueDate) {
          return {
            success: false,
            message: 'Due date is required to change expense to unpaid',
          }
        }

        // Create payable if changing to unpaid
        if (!existing.payableId) {
          const invoiceNumber = `EXP-${existing.id}-${Date.now()}`

          const payableResult = await db
            .insert(accountPayables)
            .values({
              supplierId: supplierIdToUse,
              purchaseId: null,
              branchId: existing.branchId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount || existing.amount,
              paidAmount: 0,
              remainingAmount: data.amount || existing.amount,
              status: 'pending',
              dueDate: data.dueDate || existing.dueDate,
              paymentTerms: data.paymentTerms || existing.paymentTerms,
              notes: `Created from expense status change: ${existing.category}`,
              createdBy: session?.userId,
            })
            .returning()

          data.payableId = payableResult[0].id

          await createAuditLog({
            userId: session?.userId,
            branchId: existing.branchId,
            action: 'create',
            entityType: 'account_payable',
            entityId: payableResult[0].id,
            newValues: {
              supplierId: supplierIdToUse,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount || existing.amount,
              source: 'expense_status_change',
              expenseId: existing.id,
            },
            description: `Created payable from expense #${existing.id} status change`,
          })
        }
      }

      const result = await db
        .update(expenses)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(expenses.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: existing.branchId,
        action: 'update',
        entityType: 'expense',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated expense: ${existing.category}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update expense error:', error)
      return { success: false, message: 'Failed to update expense' }
    }
  })

  ipcMain.handle('expenses:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
        with: {
          payable: true,
        },
      })

      if (!existing) {
        return { success: false, message: 'Expense not found' }
      }

      // Validation: Can't delete if linked payable has payments
      if (existing.payableId) {
        const payable = await db.query.accountPayables.findFirst({
          where: eq(accountPayables.id, existing.payableId),
        })

        if (payable && payable.paidAmount > 0) {
          return {
            success: false,
            message: 'Cannot delete expense - linked payable has existing payments',
          }
        }

        // Cancel the payable if no payments
        if (payable && payable.status !== 'cancelled') {
          await db
            .update(accountPayables)
            .set({
              status: 'cancelled',
              notes: `${payable.notes || ''}\nCancelled: Expense deleted`.trim(),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(accountPayables.id, existing.payableId))

          await createAuditLog({
            userId: session?.userId,
            branchId: existing.branchId,
            action: 'update',
            entityType: 'account_payable',
            entityId: existing.payableId,
            oldValues: { status: payable.status },
            newValues: { status: 'cancelled' },
            description: `Cancelled payable #${existing.payableId} due to expense deletion`,
          })
        }
      }

      await db.delete(expenses).where(eq(expenses.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: existing.branchId,
        action: 'delete',
        entityType: 'expense',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deleted expense: ${existing.category}`,
      })

      return { success: true, message: 'Expense deleted successfully' }
    } catch (error) {
      console.error('Delete expense error:', error)
      return { success: false, message: 'Failed to delete expense' }
    }
  })

  ipcMain.handle('expenses:get-by-category', async (_, branchId: number, startDate?: string, endDate?: string) => {
    try {
      const conditions = [eq(expenses.branchId, branchId)]

      if (startDate && endDate) {
        conditions.push(between(expenses.expenseDate, startDate, endDate))
      }

      const data = await db
        .select({
          category: expenses.category,
          total: sql<number>`sum(${expenses.amount})`,
          count: sql<number>`count(*)`,
        })
        .from(expenses)
        .where(and(...conditions))
        .groupBy(expenses.category)

      return { success: true, data }
    } catch (error) {
      console.error('Get expenses by category error:', error)
      return { success: false, message: 'Failed to fetch expenses by category' }
    }
  })
}
