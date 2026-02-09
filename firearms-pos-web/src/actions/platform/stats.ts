'use server'

import { db } from '@/lib/db'
import { tenants, users, subscriptionInvoices, subscriptionPlans } from '@/lib/db/schema'
import { eq, sql, count, gte } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

export async function getPlatformStats() {
  await getPlatformAdmin()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [tenantStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${tenants.subscriptionStatus} = 'active')`,
      trial: sql<number>`COUNT(*) FILTER (WHERE ${tenants.subscriptionStatus} = 'trial')`,
      suspended: sql<number>`COUNT(*) FILTER (WHERE ${tenants.subscriptionStatus} = 'suspended')`,
      cancelled: sql<number>`COUNT(*) FILTER (WHERE ${tenants.subscriptionStatus} = 'cancelled')`,
      newSignups: sql<number>`COUNT(*) FILTER (WHERE ${tenants.createdAt} >= ${thirtyDaysAgo})`,
    })
    .from(tenants)

  const [userStats] = await db
    .select({ total: count() })
    .from(users)

  const [mrrResult] = await db
    .select({
      mrr: sql<string>`COALESCE(SUM(${subscriptionPlans.priceMonthly}), 0)`,
    })
    .from(tenants)
    .innerJoin(
      subscriptionPlans,
      eq(tenants.subscriptionPlan, subscriptionPlans.slug)
    )
    .where(eq(tenants.subscriptionStatus, 'active'))

  return {
    success: true,
    data: {
      totalTenants: tenantStats.total,
      activeTenants: tenantStats.active,
      trialTenants: tenantStats.trial,
      suspendedTenants: tenantStats.suspended,
      cancelledTenants: tenantStats.cancelled,
      newSignups: tenantStats.newSignups,
      totalUsers: userStats.total,
      mrr: mrrResult.mrr,
    },
  }
}

export async function getRecentSignups(limit = 10) {
  await getPlatformAdmin()

  const data = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      subscriptionStatus: tenants.subscriptionStatus,
      subscriptionPlan: tenants.subscriptionPlan,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .orderBy(sql`${tenants.createdAt} DESC`)
    .limit(limit)

  return { success: true, data }
}
