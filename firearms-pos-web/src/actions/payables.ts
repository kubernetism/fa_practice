'use server'

import { db } from '@/lib/db'
import { accountPayables, payablePayments, suppliers } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

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
  await db.insert(payablePayments).values({
    payableId: data.payableId,
    amount: data.amount,
    paymentMethod: data.paymentMethod as any,
    referenceNumber: data.referenceNumber || null,
    notes: data.notes || null,
    paidBy: userId,
  })

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

  return { success: true }
}
