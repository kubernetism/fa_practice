'use server'

import { db } from '@/lib/db'
import { expenses } from '@/lib/db/schema'
import { eq, and, desc, sql, between, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { postExpenseToGL } from '@/lib/accounting/gl-posting'
import { logCreate } from '@/lib/audit/logger'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getExpenses(filters?: {
  category?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(expenses.tenantId, tenantId)]

  if (filters?.category && filters.category !== 'all') {
    conditions.push(eq(expenses.category, filters.category as any))
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    conditions.push(eq(expenses.paymentStatus, filters.paymentStatus as any))
  }
  if (filters?.dateFrom && filters?.dateTo) {
    conditions.push(
      between(expenses.expenseDate, new Date(filters.dateFrom), new Date(filters.dateTo))
    )
  }

  const data = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.expenseDate))

  return { success: true, data }
}

export async function getExpenseSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      paidCount: sql<number>`COUNT(*) FILTER (WHERE ${expenses.paymentStatus} = 'paid')`,
      unpaidCount: sql<number>`COUNT(*) FILTER (WHERE ${expenses.paymentStatus} = 'unpaid')`,
      totalCount: count(),
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function createExpense(data: {
  branchId: number
  category: string
  amount: string
  description?: string
  paymentMethod: string
  reference?: string
  paymentStatus: string
  expenseDate?: string
  supplierId?: number
  dueDate?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [expense] = await db
    .insert(expenses)
    .values({
      tenantId,
      branchId: data.branchId,
      userId,
      category: data.category as any,
      amount: data.amount,
      description: data.description || null,
      paymentMethod: data.paymentMethod as any,
      reference: data.reference || null,
      paymentStatus: data.paymentStatus as any,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      supplierId: data.supplierId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    })
    .returning()

  // Auto GL posting
  try {
    await postExpenseToGL({
      tenantId,
      expenseId: expense.id,
      branchId: data.branchId,
      userId,
      amount: Number(data.amount),
      category: data.category,
      paymentMethod: data.paymentMethod,
    })
  } catch (e) {
    console.error('GL posting failed for expense:', e)
  }

  logCreate('expense', expense.id, { category: data.category, amount: data.amount })

  return { success: true, data: expense }
}

export async function getExpenseById(id: number) {
  const tenantId = await getTenantId()

  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)))

  if (!expense) return { success: false, message: 'Expense not found' }

  return { success: true, data: expense }
}

export async function updateExpense(
  id: number,
  data: {
    category?: string
    amount?: string
    description?: string
    paymentMethod?: string
    reference?: string
    paymentStatus?: string
    expenseDate?: string
    dueDate?: string
  }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (data.category) updateData.category = data.category
  if (data.amount) updateData.amount = data.amount
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod
  if (data.reference !== undefined) updateData.reference = data.reference || null
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus
  if (data.expenseDate) updateData.expenseDate = new Date(data.expenseDate)
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null

  const [expense] = await db
    .update(expenses)
    .set(updateData)
    .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)))
    .returning()

  if (!expense) return { success: false, message: 'Expense not found' }

  return { success: true, data: expense }
}

export async function getExpensesByCategory() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      category: expenses.category,
      expenseCount: count(),
      totalAmount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))
    .groupBy(expenses.category)
    .orderBy(sql`SUM(${expenses.amount}) DESC`)

  return { success: true, data }
}

export async function deleteExpense(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)))

  return { success: true }
}
