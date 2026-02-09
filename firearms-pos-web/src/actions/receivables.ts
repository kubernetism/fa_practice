'use server'

import { db } from '@/lib/db'
import { accountReceivables, receivablePayments, customers } from '@/lib/db/schema'
import { eq, and, desc, sql, count, SQL, lt, lte } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { postReceivablePaymentToGL } from '@/lib/accounting/gl-posting'

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

  const [payment] = await db.insert(receivablePayments).values({
    receivableId: data.receivableId,
    amount: data.amount,
    paymentMethod: data.paymentMethod as any,
    referenceNumber: data.referenceNumber || null,
    notes: data.notes || null,
    receivedBy: userId,
  }).returning()

  await db
    .update(accountReceivables)
    .set({
      paidAmount: String(newPaidAmount),
      remainingAmount: String(Math.max(0, newRemaining)),
      status: newStatus as any,
      updatedAt: new Date(),
    })
    .where(eq(accountReceivables.id, data.receivableId))

  // Auto GL posting
  try {
    await postReceivablePaymentToGL({
      tenantId,
      receivableId: data.receivableId,
      paymentId: payment.id,
      branchId: receivable.branchId,
      userId,
      amount: Number(data.amount),
    })
  } catch (e) {
    console.error('GL posting failed for receivable payment:', e)
  }

  return { success: true }
}

export async function getReceivableById(id: number) {
  const tenantId = await getTenantId()

  const [receivable] = await db
    .select({
      receivable: accountReceivables,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(accountReceivables)
    .leftJoin(customers, eq(accountReceivables.customerId, customers.id))
    .where(and(eq(accountReceivables.id, id), eq(accountReceivables.tenantId, tenantId)))

  if (!receivable) return { success: false, message: 'Receivable not found' }

  return { success: true, data: receivable }
}

export async function getReceivablesByCustomer(customerId: number) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      receivable: accountReceivables,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(accountReceivables)
    .leftJoin(customers, eq(accountReceivables.customerId, customers.id))
    .where(
      and(eq(accountReceivables.tenantId, tenantId), eq(accountReceivables.customerId, customerId))
    )
    .orderBy(desc(accountReceivables.createdAt))

  return { success: true, data }
}

export async function getCustomerBalance(customerId: number) {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`,
      totalPaid: sql<string>`COALESCE(SUM(${accountReceivables.paidAmount}), 0)`,
      totalAmount: sql<string>`COALESCE(SUM(${accountReceivables.totalAmount}), 0)`,
      invoiceCount: count(),
    })
    .from(accountReceivables)
    .where(
      and(eq(accountReceivables.tenantId, tenantId), eq(accountReceivables.customerId, customerId))
    )

  return { success: true, data: result }
}

export async function getOverdueReceivables() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      receivable: accountReceivables,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
      daysOverdue: sql<number>`EXTRACT(DAY FROM NOW() - ${accountReceivables.dueDate})`,
    })
    .from(accountReceivables)
    .leftJoin(customers, eq(accountReceivables.customerId, customers.id))
    .where(
      and(
        eq(accountReceivables.tenantId, tenantId),
        sql`${accountReceivables.status} IN ('pending', 'partial')`,
        sql`${accountReceivables.dueDate} < NOW()`
      )
    )
    .orderBy(accountReceivables.dueDate)

  return { success: true, data }
}

export async function getReceivableAgingReport() {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      current: sql<string>`COALESCE(SUM(CASE WHEN ${accountReceivables.dueDate} >= NOW() THEN ${accountReceivables.remainingAmount} ELSE 0 END), 0)`,
      days1to30: sql<string>`COALESCE(SUM(CASE WHEN ${accountReceivables.dueDate} < NOW() AND ${accountReceivables.dueDate} >= NOW() - INTERVAL '30 days' THEN ${accountReceivables.remainingAmount} ELSE 0 END), 0)`,
      days31to60: sql<string>`COALESCE(SUM(CASE WHEN ${accountReceivables.dueDate} < NOW() - INTERVAL '30 days' AND ${accountReceivables.dueDate} >= NOW() - INTERVAL '60 days' THEN ${accountReceivables.remainingAmount} ELSE 0 END), 0)`,
      days61to90: sql<string>`COALESCE(SUM(CASE WHEN ${accountReceivables.dueDate} < NOW() - INTERVAL '60 days' AND ${accountReceivables.dueDate} >= NOW() - INTERVAL '90 days' THEN ${accountReceivables.remainingAmount} ELSE 0 END), 0)`,
      over90: sql<string>`COALESCE(SUM(CASE WHEN ${accountReceivables.dueDate} < NOW() - INTERVAL '90 days' THEN ${accountReceivables.remainingAmount} ELSE 0 END), 0)`,
      totalOutstanding: sql<string>`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`,
    })
    .from(accountReceivables)
    .where(
      and(
        eq(accountReceivables.tenantId, tenantId),
        sql`${accountReceivables.status} IN ('pending', 'partial', 'overdue')`
      )
    )

  return { success: true, data: result }
}

export async function cancelReceivable(id: number, reason?: string) {
  const tenantId = await getTenantId()

  const [receivable] = await db
    .update(accountReceivables)
    .set({
      status: 'cancelled',
      notes: reason ? sql`COALESCE(${accountReceivables.notes}, '') || ' [Cancelled: ' || ${reason} || ']'` : accountReceivables.notes,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(accountReceivables.id, id),
        eq(accountReceivables.tenantId, tenantId),
        sql`${accountReceivables.status} != 'paid'`
      )
    )
    .returning()

  if (!receivable) return { success: false, message: 'Receivable not found or already paid' }

  return { success: true, data: receivable }
}

export async function getReceivablePayments(receivableId: number) {
  const tenantId = await getTenantId()

  // Verify ownership
  const [receivable] = await db
    .select()
    .from(accountReceivables)
    .where(
      and(eq(accountReceivables.id, receivableId), eq(accountReceivables.tenantId, tenantId))
    )

  if (!receivable) return { success: false, message: 'Receivable not found' }

  const data = await db
    .select()
    .from(receivablePayments)
    .where(eq(receivablePayments.receivableId, receivableId))
    .orderBy(desc(receivablePayments.paymentDate))

  return { success: true, data }
}

export async function syncReceivablesWithSales() {
  const tenantId = await getTenantId()

  // Mark overdue receivables
  const updated = await db
    .update(accountReceivables)
    .set({ status: 'overdue', updatedAt: new Date() })
    .where(
      and(
        eq(accountReceivables.tenantId, tenantId),
        sql`${accountReceivables.status} IN ('pending', 'partial')`,
        sql`${accountReceivables.dueDate} IS NOT NULL`,
        sql`${accountReceivables.dueDate} < NOW()`
      )
    )
    .returning()

  return { success: true, data: { updatedCount: updated.length } }
}
