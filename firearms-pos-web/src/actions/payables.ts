'use server'

import { db } from '@/lib/db'
import { accountPayables, payablePayments, suppliers } from '@/lib/db/schema'
import { eq, and, desc, sql, count, lt } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { postPayablePaymentToGL } from '@/lib/accounting/gl-posting'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getPayables(filters?: { status?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(accountPayables.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(accountPayables.status, filters.status as any))
  }

  const data = await db
    .select({
      payable: accountPayables,
      supplierName: suppliers.name,
    })
    .from(accountPayables)
    .leftJoin(suppliers, eq(accountPayables.supplierId, suppliers.id))
    .where(and(...conditions))
    .orderBy(desc(accountPayables.createdAt))

  return { success: true, data }
}

export async function getPayableSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`,
      totalPaid: sql<string>`COALESCE(SUM(${accountPayables.paidAmount}), 0)`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${accountPayables.status} IN ('pending', 'partial'))`,
      overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${accountPayables.status} = 'overdue')`,
      totalCount: count(),
    })
    .from(accountPayables)
    .where(eq(accountPayables.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function createPayable(data: {
  supplierId: number
  branchId: number
  invoiceNumber: string
  totalAmount: string
  dueDate?: string
  paymentTerms?: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [payable] = await db
    .insert(accountPayables)
    .values({
      tenantId,
      supplierId: data.supplierId,
      branchId: data.branchId,
      invoiceNumber: data.invoiceNumber,
      totalAmount: data.totalAmount,
      paidAmount: '0',
      remainingAmount: data.totalAmount,
      status: 'pending',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paymentTerms: data.paymentTerms || null,
      notes: data.notes || null,
      createdBy: userId,
    })
    .returning()

  return { success: true, data: payable }
}

export async function recordPayablePayment(data: {
  payableId: number
  amount: string
  paymentMethod: string
  referenceNumber?: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  // Get current payable
  const [payable] = await db
    .select()
    .from(accountPayables)
    .where(and(eq(accountPayables.id, data.payableId), eq(accountPayables.tenantId, tenantId)))

  if (!payable) return { success: false, message: 'Payable not found' }

  const newPaidAmount = Number(payable.paidAmount) + Number(data.amount)
  const newRemaining = Number(payable.totalAmount) - newPaidAmount
  const newStatus = newRemaining <= 0 ? 'paid' : 'partial'

  // Record payment
  const [payment] = await db.insert(payablePayments).values({
    payableId: data.payableId,
    amount: data.amount,
    paymentMethod: data.paymentMethod as any,
    referenceNumber: data.referenceNumber || null,
    notes: data.notes || null,
    paidBy: userId,
  }).returning()

  // Update payable
  await db
    .update(accountPayables)
    .set({
      paidAmount: String(newPaidAmount),
      remainingAmount: String(Math.max(0, newRemaining)),
      status: newStatus as any,
      updatedAt: new Date(),
    })
    .where(eq(accountPayables.id, data.payableId))

  // Auto GL posting
  try {
    await postPayablePaymentToGL({
      tenantId,
      payableId: data.payableId,
      paymentId: payment.id,
      branchId: payable.branchId,
      userId,
      amount: Number(data.amount),
    })
  } catch (e) {
    console.error('GL posting failed for payable payment:', e)
  }

  return { success: true }
}

export async function getPayableById(id: number) {
  const tenantId = await getTenantId()

  const [payable] = await db
    .select({
      payable: accountPayables,
      supplierName: suppliers.name,
    })
    .from(accountPayables)
    .leftJoin(suppliers, eq(accountPayables.supplierId, suppliers.id))
    .where(and(eq(accountPayables.id, id), eq(accountPayables.tenantId, tenantId)))

  if (!payable) return { success: false, message: 'Payable not found' }

  return { success: true, data: payable }
}

export async function getPayablesBySupplier(supplierId: number) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      payable: accountPayables,
      supplierName: suppliers.name,
    })
    .from(accountPayables)
    .leftJoin(suppliers, eq(accountPayables.supplierId, suppliers.id))
    .where(
      and(eq(accountPayables.tenantId, tenantId), eq(accountPayables.supplierId, supplierId))
    )
    .orderBy(desc(accountPayables.createdAt))

  return { success: true, data }
}

export async function getSupplierBalance(supplierId: number) {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`,
      totalPaid: sql<string>`COALESCE(SUM(${accountPayables.paidAmount}), 0)`,
      totalAmount: sql<string>`COALESCE(SUM(${accountPayables.totalAmount}), 0)`,
      invoiceCount: count(),
    })
    .from(accountPayables)
    .where(
      and(eq(accountPayables.tenantId, tenantId), eq(accountPayables.supplierId, supplierId))
    )

  return { success: true, data: result }
}

export async function getOverduePayables() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      payable: accountPayables,
      supplierName: suppliers.name,
      daysOverdue: sql<number>`EXTRACT(DAY FROM NOW() - ${accountPayables.dueDate})`,
    })
    .from(accountPayables)
    .leftJoin(suppliers, eq(accountPayables.supplierId, suppliers.id))
    .where(
      and(
        eq(accountPayables.tenantId, tenantId),
        sql`${accountPayables.status} IN ('pending', 'partial')`,
        sql`${accountPayables.dueDate} < NOW()`
      )
    )
    .orderBy(accountPayables.dueDate)

  return { success: true, data }
}

export async function getPayableAgingReport() {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      current: sql<string>`COALESCE(SUM(CASE WHEN ${accountPayables.dueDate} >= NOW() THEN ${accountPayables.remainingAmount} ELSE 0 END), 0)`,
      days1to30: sql<string>`COALESCE(SUM(CASE WHEN ${accountPayables.dueDate} < NOW() AND ${accountPayables.dueDate} >= NOW() - INTERVAL '30 days' THEN ${accountPayables.remainingAmount} ELSE 0 END), 0)`,
      days31to60: sql<string>`COALESCE(SUM(CASE WHEN ${accountPayables.dueDate} < NOW() - INTERVAL '30 days' AND ${accountPayables.dueDate} >= NOW() - INTERVAL '60 days' THEN ${accountPayables.remainingAmount} ELSE 0 END), 0)`,
      days61to90: sql<string>`COALESCE(SUM(CASE WHEN ${accountPayables.dueDate} < NOW() - INTERVAL '60 days' AND ${accountPayables.dueDate} >= NOW() - INTERVAL '90 days' THEN ${accountPayables.remainingAmount} ELSE 0 END), 0)`,
      over90: sql<string>`COALESCE(SUM(CASE WHEN ${accountPayables.dueDate} < NOW() - INTERVAL '90 days' THEN ${accountPayables.remainingAmount} ELSE 0 END), 0)`,
      totalOutstanding: sql<string>`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`,
    })
    .from(accountPayables)
    .where(
      and(
        eq(accountPayables.tenantId, tenantId),
        sql`${accountPayables.status} IN ('pending', 'partial', 'overdue')`
      )
    )

  return { success: true, data: result }
}

export async function cancelPayable(id: number, reason?: string) {
  const tenantId = await getTenantId()

  const [payable] = await db
    .update(accountPayables)
    .set({
      status: 'cancelled',
      notes: reason ? sql`COALESCE(${accountPayables.notes}, '') || ' [Cancelled: ' || ${reason} || ']'` : accountPayables.notes,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(accountPayables.id, id),
        eq(accountPayables.tenantId, tenantId),
        sql`${accountPayables.status} != 'paid'`
      )
    )
    .returning()

  if (!payable) return { success: false, message: 'Payable not found or already paid' }

  return { success: true, data: payable }
}

export async function getPayablePayments(payableId: number) {
  const tenantId = await getTenantId()

  const [payable] = await db
    .select()
    .from(accountPayables)
    .where(and(eq(accountPayables.id, payableId), eq(accountPayables.tenantId, tenantId)))

  if (!payable) return { success: false, message: 'Payable not found' }

  const data = await db
    .select()
    .from(payablePayments)
    .where(eq(payablePayments.payableId, payableId))
    .orderBy(desc(payablePayments.paymentDate))

  return { success: true, data }
}
