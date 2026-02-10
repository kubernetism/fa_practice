'use server'

import { db } from '@/lib/db'
import {
  tenants,
  users,
  branches,
  subscriptionInvoices,
  subscriptionPlans,
  paymentSubmissions,
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

export async function getPendingPayments(statusFilter?: string) {
  await getPlatformAdmin()

  const conditions: any[] = []
  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(paymentSubmissions.status, statusFilter as any))
  }

  const data = await db
    .select({
      id: paymentSubmissions.id,
      tenantId: paymentSubmissions.tenantId,
      tenantName: tenants.name,
      planSlug: paymentSubmissions.planSlug,
      amount: paymentSubmissions.amount,
      transactionId: paymentSubmissions.transactionId,
      paymentType: paymentSubmissions.paymentType,
      paymentDate: paymentSubmissions.paymentDate,
      senderAccount: paymentSubmissions.senderAccount,
      receiverAccount: paymentSubmissions.receiverAccount,
      notes: paymentSubmissions.notes,
      status: paymentSubmissions.status,
      adminNotes: paymentSubmissions.adminNotes,
      statsBranches: paymentSubmissions.statsBranches,
      statsUsers: paymentSubmissions.statsUsers,
      statsProducts: paymentSubmissions.statsProducts,
      statsCustomers: paymentSubmissions.statsCustomers,
      statsRevenue: paymentSubmissions.statsRevenue,
      statsExpenses: paymentSubmissions.statsExpenses,
      statsNetProfit: paymentSubmissions.statsNetProfit,
      statsTotalSales: paymentSubmissions.statsTotalSales,
      statsMonthRevenue: paymentSubmissions.statsMonthRevenue,
      createdAt: paymentSubmissions.createdAt,
      updatedAt: paymentSubmissions.updatedAt,
    })
    .from(paymentSubmissions)
    .leftJoin(tenants, eq(paymentSubmissions.tenantId, tenants.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(paymentSubmissions.createdAt))

  return { success: true, data }
}

export async function getPaymentSubmissionById(id: number) {
  await getPlatformAdmin()

  const [submission] = await db
    .select({
      id: paymentSubmissions.id,
      tenantId: paymentSubmissions.tenantId,
      tenantName: tenants.name,
      planSlug: paymentSubmissions.planSlug,
      amount: paymentSubmissions.amount,
      transactionId: paymentSubmissions.transactionId,
      paymentType: paymentSubmissions.paymentType,
      paymentDate: paymentSubmissions.paymentDate,
      senderAccount: paymentSubmissions.senderAccount,
      receiverAccount: paymentSubmissions.receiverAccount,
      notes: paymentSubmissions.notes,
      status: paymentSubmissions.status,
      adminNotes: paymentSubmissions.adminNotes,
      statsBranches: paymentSubmissions.statsBranches,
      statsUsers: paymentSubmissions.statsUsers,
      statsProducts: paymentSubmissions.statsProducts,
      statsCustomers: paymentSubmissions.statsCustomers,
      statsRevenue: paymentSubmissions.statsRevenue,
      statsExpenses: paymentSubmissions.statsExpenses,
      statsNetProfit: paymentSubmissions.statsNetProfit,
      statsTotalSales: paymentSubmissions.statsTotalSales,
      statsMonthRevenue: paymentSubmissions.statsMonthRevenue,
      createdAt: paymentSubmissions.createdAt,
      updatedAt: paymentSubmissions.updatedAt,
    })
    .from(paymentSubmissions)
    .leftJoin(tenants, eq(paymentSubmissions.tenantId, tenants.id))
    .where(eq(paymentSubmissions.id, id))

  if (!submission) return { success: false, message: 'Submission not found' }
  return { success: true, data: submission }
}

export async function approvePayment(id: number, adminNotes?: string) {
  await getPlatformAdmin()

  const [submission] = await db
    .select()
    .from(paymentSubmissions)
    .where(eq(paymentSubmissions.id, id))

  if (!submission) return { success: false, message: 'Submission not found' }
  if (submission.status !== 'pending') return { success: false, message: 'Submission is not pending' }

  // Find or create the plan to get its ID for the invoice
  let [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, submission.planSlug))

  if (!plan) {
    const planDefaults: Record<string, { name: string; price: string; maxBranches: number; maxUsers: number; maxProducts: number | null }> = {
      basic: { name: 'Starter', price: '4999', maxBranches: 1, maxUsers: 3, maxProducts: 500 },
      pro: { name: 'Professional', price: '14999', maxBranches: 5, maxUsers: 15, maxProducts: 5000 },
      enterprise: { name: 'Enterprise', price: '39999', maxBranches: -1, maxUsers: -1, maxProducts: null },
    }
    const def = planDefaults[submission.planSlug] || planDefaults.basic
    const [created] = await db
      .insert(subscriptionPlans)
      .values({
        name: def.name,
        slug: submission.planSlug,
        priceMonthly: def.price,
        maxBranches: def.maxBranches,
        maxUsers: def.maxUsers,
        maxProducts: def.maxProducts,
      })
      .returning()
    plan = created
  }

  const now = new Date()
  const subscriptionEnd = new Date(now)
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

  // Update payment submission status
  await db
    .update(paymentSubmissions)
    .set({
      status: 'approved',
      adminNotes: adminNotes || null,
      updatedAt: now,
    })
    .where(eq(paymentSubmissions.id, id))

  // Create subscription invoice
  await db.insert(subscriptionInvoices).values({
    tenantId: submission.tenantId,
    planId: plan.id,
    amount: submission.amount,
    status: 'paid',
    kuickpayReference: submission.transactionId,
    billingPeriodStart: now,
    billingPeriodEnd: subscriptionEnd,
    paidAt: new Date(submission.paymentDate),
  })

  // Activate tenant subscription
  await db
    .update(tenants)
    .set({
      subscriptionStatus: 'active',
      subscriptionPlan: submission.planSlug,
      subscriptionEndsAt: subscriptionEnd,
      updatedAt: now,
    })
    .where(eq(tenants.id, submission.tenantId))

  return { success: true }
}

export async function rejectPayment(id: number, adminNotes: string) {
  await getPlatformAdmin()

  const [submission] = await db
    .select()
    .from(paymentSubmissions)
    .where(eq(paymentSubmissions.id, id))

  if (!submission) return { success: false, message: 'Submission not found' }
  if (submission.status !== 'pending') return { success: false, message: 'Submission is not pending' }

  await db
    .update(paymentSubmissions)
    .set({
      status: 'rejected',
      adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(paymentSubmissions.id, id))

  return { success: true }
}
