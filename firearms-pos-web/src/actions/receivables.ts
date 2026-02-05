'use server'

import { db } from '@/lib/db'
import { accountReceivables, receivablePayments, customers } from '@/lib/db/schema'
import { eq, and, desc, sql, count, SQL } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getReceivables(filters?: { status?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(accountReceivables.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(accountReceivables.status, filters.status as any))
  }

  const data = await db
    .select({
      receivable: accountReceivables,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(accountReceivables)
    .leftJoin(customers, eq(accountReceivables.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(accountReceivables.createdAt))

  return { success: true, data }
}

export async function getReceivableSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`,
      totalCollected: sql<string>`COALESCE(SUM(${accountReceivables.paidAmount}), 0)`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${accountReceivables.status} IN ('pending', 'partial'))`,
      overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${accountReceivables.status} = 'overdue')`,
      totalCount: count(),
    })
    .from(accountReceivables)
    .where(eq(accountReceivables.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function createReceivable(data: {
  customerId: number
  branchId: number
  invoiceNumber: string
  totalAmount: string
  dueDate?: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [receivable] = await db
    .insert(accountReceivables)
    .values({
      tenantId,
      customerId: data.customerId,
      branchId: data.branchId,
      invoiceNumber: data.invoiceNumber,
      totalAmount: data.totalAmount,
      paidAmount: '0',
      remainingAmount: data.totalAmount,
      status: 'pending',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      createdBy: userId,
    })
    .returning()

  return { success: true, data: receivable }
}

export async function recordReceivablePayment(data: {
  receivableId: number
  amount: string
  paymentMethod: string
  referenceNumber?: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [receivable] = await db
    .select()
    .from(accountReceivables)
    .where(
      and(eq(accountReceivables.id, data.receivableId), eq(accountReceivables.tenantId, tenantId))
    )

  if (!receivable) return { success: false, message: 'Receivable not found' }

  const newPaidAmount = Number(receivable.paidAmount) + Number(data.amount)
  const newRemaining = Number(receivable.totalAmount) - newPaidAmount
  const newStatus = newRemaining <= 0 ? 'paid' : 'partial'

  await db.insert(receivablePayments).values({
    receivableId: data.receivableId,
    amount: data.amount,
    paymentMethod: data.paymentMethod as any,
    referenceNumber: data.referenceNumber || null,
    notes: data.notes || null,
    receivedBy: userId,
  })

  await db
    .update(accountReceivables)
    .set({
      paidAmount: String(newPaidAmount),
      remainingAmount: String(Math.max(0, newRemaining)),
      status: newStatus as any,
      updatedAt: new Date(),
    })
    .where(eq(accountReceivables.id, data.receivableId))

  return { success: true }
}
