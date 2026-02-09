'use server'

import { db } from '@/lib/db'
import {
  tenants,
  users,
  branches,
  subscriptionInvoices,
  subscriptionPlans,
} from '@/lib/db/schema'
import { eq, and, ilike, or, sql, count, desc } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

export async function getTenants(params?: {
  search?: string
  status?: string
  plan?: string
}) {
  await getPlatformAdmin()

  const conditions: any[] = []

  if (params?.search) {
    conditions.push(
      or(
        ilike(tenants.name, `%${params.search}%`),
        ilike(tenants.slug, `%${params.search}%`)
      )
    )
  }
  if (params?.status) {
    conditions.push(eq(tenants.subscriptionStatus, params.status as any))
  }
  if (params?.plan) {
    conditions.push(eq(tenants.subscriptionPlan, params.plan as any))
  }

  const data = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      subscriptionStatus: tenants.subscriptionStatus,
      subscriptionPlan: tenants.subscriptionPlan,
      trialEndsAt: tenants.trialEndsAt,
      createdAt: tenants.createdAt,
      userCount: sql<number>`(SELECT COUNT(*) FROM users WHERE users.tenant_id = ${tenants.id})`,
      branchCount: sql<number>`(SELECT COUNT(*) FROM branches WHERE branches.tenant_id = ${tenants.id})`,
    })
    .from(tenants)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tenants.createdAt))

  return { success: true, data }
}

export async function getTenantById(id: number) {
  await getPlatformAdmin()

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))

  if (!tenant) return { success: false, message: 'Tenant not found' }

  const tenantUsers = await db
    .select()
    .from(users)
    .where(eq(users.tenantId, id))

  const tenantBranches = await db
    .select()
    .from(branches)
    .where(eq(branches.tenantId, id))

  const invoices = await db
    .select({
      invoice: subscriptionInvoices,
      planName: subscriptionPlans.name,
    })
    .from(subscriptionInvoices)
    .leftJoin(subscriptionPlans, eq(subscriptionInvoices.planId, subscriptionPlans.id))
    .where(eq(subscriptionInvoices.tenantId, id))
    .orderBy(desc(subscriptionInvoices.createdAt))

  return {
    success: true,
    data: {
      tenant,
      users: tenantUsers,
      branches: tenantBranches,
      invoices: invoices.map((i) => ({ ...i.invoice, planName: i.planName })),
    },
  }
}

export async function updateTenantStatus(
  id: number,
  status: 'trial' | 'active' | 'suspended' | 'cancelled'
) {
  await getPlatformAdmin()

  const [updated] = await db
    .update(tenants)
    .set({ subscriptionStatus: status, updatedAt: new Date() })
    .where(eq(tenants.id, id))
    .returning()

  if (!updated) return { success: false, message: 'Tenant not found' }
  return { success: true, data: updated }
}

export async function updateTenantPlan(
  id: number,
  plan: 'basic' | 'pro' | 'enterprise'
) {
  await getPlatformAdmin()

  const [updated] = await db
    .update(tenants)
    .set({ subscriptionPlan: plan, updatedAt: new Date() })
    .where(eq(tenants.id, id))
    .returning()

  if (!updated) return { success: false, message: 'Tenant not found' }
  return { success: true, data: updated }
}
