'use server'

import { db } from '@/lib/db'
import { commissions, users, referralPersons } from '@/lib/db/schema'
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
