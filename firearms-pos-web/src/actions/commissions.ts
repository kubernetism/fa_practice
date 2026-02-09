'use server'

import { db } from '@/lib/db'
import { commissions, users, referralPersons, sales } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getCommissions(filters?: { status?: string; type?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(commissions.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(commissions.status, filters.status as any))
  }
  if (filters?.type && filters.type !== 'all') {
    conditions.push(eq(commissions.commissionType, filters.type as any))
  }

  const data = await db
    .select({
      commission: commissions,
      userName: users.fullName,
      referralName: referralPersons.name,
    })
    .from(commissions)
    .leftJoin(users, eq(commissions.userId, users.id))
    .leftJoin(referralPersons, eq(commissions.referralPersonId, referralPersons.id))
    .where(and(...conditions))
    .orderBy(desc(commissions.createdAt))

  return { success: true, data }
}

export async function getCommissionSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalEarned: sql<string>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
      totalPending: sql<string>`COALESCE(SUM(${commissions.commissionAmount}) FILTER (WHERE ${commissions.status} = 'pending'), 0)`,
      totalPaid: sql<string>`COALESCE(SUM(${commissions.commissionAmount}) FILTER (WHERE ${commissions.status} = 'paid'), 0)`,
      totalCount: count(),
    })
    .from(commissions)
    .where(eq(commissions.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function approveCommission(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(commissions)
    .set({ status: 'approved', updatedAt: new Date() })
    .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))

  return { success: true }
}

export async function payCommission(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(commissions)
    .set({ status: 'paid', paidDate: new Date(), updatedAt: new Date() })
    .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))

  return { success: true }
}

export async function getCommissionById(id: number) {
  const tenantId = await getTenantId()

  const [commission] = await db
    .select({
      commission: commissions,
      userName: users.fullName,
      referralName: referralPersons.name,
    })
    .from(commissions)
    .leftJoin(users, eq(commissions.userId, users.id))
    .leftJoin(referralPersons, eq(commissions.referralPersonId, referralPersons.id))
    .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))

  if (!commission) return { success: false, message: 'Commission not found' }

  return { success: true, data: commission }
}

export async function createCommission(data: {
  saleId: number
  branchId: number
  commissionType: string
  userId?: number
  referralPersonId?: number
  baseAmount: string
  rate: string
  notes?: string
}) {
  const tenantId = await getTenantId()

  const commissionAmount = Number(data.baseAmount) * (Number(data.rate) / 100)

  const [commission] = await db
    .insert(commissions)
    .values({
      tenantId,
      saleId: data.saleId,
      branchId: data.branchId,
      userId: data.userId || null,
      referralPersonId: data.referralPersonId || null,
      commissionType: data.commissionType as any,
      baseAmount: data.baseAmount,
      rate: data.rate,
      commissionAmount: String(commissionAmount),
      status: 'pending',
      notes: data.notes || null,
    })
    .returning()

  return { success: true, data: commission }
}

export async function deleteCommission(id: number) {
  const tenantId = await getTenantId()

  const [commission] = await db
    .select()
    .from(commissions)
    .where(and(eq(commissions.id, id), eq(commissions.tenantId, tenantId)))

  if (!commission) return { success: false, message: 'Commission not found' }
  if (commission.status === 'paid') return { success: false, message: 'Cannot delete a paid commission' }

  await db
    .delete(commissions)
    .where(eq(commissions.id, id))

  return { success: true }
}

export async function getAvailableInvoices() {
  const tenantId = await getTenantId()

  // Get sales that don't already have commissions
  const data = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      saleDate: sales.saleDate,
      totalAmount: sales.totalAmount,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        sql`${sales.id} NOT IN (SELECT ${commissions.saleId} FROM ${commissions} WHERE ${commissions.tenantId} = ${tenantId})`
      )
    )
    .orderBy(desc(sales.saleDate))
    .limit(100)

  return { success: true, data }
}
