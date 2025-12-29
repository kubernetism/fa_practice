import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import { expenses, type NewExpense } from '../db/schema'
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

      const result = await db
        .insert(expenses)
        .values({
          ...data,
          userId: session?.userId ?? 0,
        })
        .returning()

      const newExpense = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'expense',
        entityId: newExpense.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created expense: ${data.category} - $${data.amount}`,
      })

      return { success: true, data: newExpense }
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
      })

      if (!existing) {
        return { success: false, message: 'Expense not found' }
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
      })

      if (!existing) {
        return { success: false, message: 'Expense not found' }
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
