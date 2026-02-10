'use server'

import { db } from '@/lib/db'
import {
  tenants,
  subscriptionPlans,
  subscriptionInvoices,
  paymentSubmissions,
  branches,
  users,
  products,
  sales,
  customers,
  expenses,
} from '@/lib/db/schema'
import { eq, and, sql, count, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getBillingData() {
  const tenantId = await getTenantId()

  // Get tenant info
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  })

  if (!tenant) throw new Error('Tenant not found')

  // Get subscription plans from DB
  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.priceMonthly)

  // Get invoice history
  const invoices = await db
    .select({
      id: subscriptionInvoices.id,
      amount: subscriptionInvoices.amount,
      status: subscriptionInvoices.status,
      billingPeriodStart: subscriptionInvoices.billingPeriodStart,
      billingPeriodEnd: subscriptionInvoices.billingPeriodEnd,
      paidAt: subscriptionInvoices.paidAt,
      createdAt: subscriptionInvoices.createdAt,
      planName: subscriptionPlans.name,
    })
    .from(subscriptionInvoices)
    .leftJoin(subscriptionPlans, eq(subscriptionInvoices.planId, subscriptionPlans.id))
    .where(eq(subscriptionInvoices.tenantId, tenantId))
    .orderBy(desc(subscriptionInvoices.createdAt))
    .limit(20)

  // Get business stats
  const [branchStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${branches.isActive} = true)`,
    })
    .from(branches)
    .where(eq(branches.tenantId, tenantId))

  const [userStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${users.isActive} = true)`,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))

  const [productStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true)`,
    })
    .from(products)
    .where(eq(products.tenantId, tenantId))

  const [customerStats] = await db
    .select({ total: count() })
    .from(customers)
    .where(eq(customers.tenantId, tenantId))

  const [salesStats] = await db
    .select({
      totalSales: count(),
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      monthRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate} >= date_trunc('month', CURRENT_DATE) AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
    })
    .from(sales)
    .where(eq(sales.tenantId, tenantId))

  const [expenseStats] = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  return {
    success: true,
    data: {
      tenant: {
        name: tenant.name,
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionPlan: tenant.subscriptionPlan,
        trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
        subscriptionEndsAt: tenant.subscriptionEndsAt?.toISOString() ?? null,
        createdAt: tenant.createdAt.toISOString(),
      },
      plans,
      invoices,
      stats: {
        branches: { total: Number(branchStats.total), active: Number(branchStats.active) },
        users: { total: Number(userStats.total), active: Number(userStats.active) },
        products: { total: Number(productStats.total), active: Number(productStats.active) },
        customers: Number(customerStats.total),
        totalSales: Number(salesStats.totalSales),
        totalRevenue: salesStats.totalRevenue,
        monthRevenue: salesStats.monthRevenue,
        totalExpenses: expenseStats.totalExpenses,
        totalPaid,
      },
    },
  }
}

export async function submitPayment(data: {
  planSlug: 'basic' | 'pro' | 'enterprise'
  amount: string
  transactionId: string
  paymentType: 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'nayapay'
  paymentDate: string
  senderAccount: string
  receiverAccount: string
  notes?: string
}) {
  const tenantId = await getTenantId()

  // Gather business stats snapshot
  const [branchStats] = await db
    .select({
      active: sql<number>`COUNT(*) FILTER (WHERE ${branches.isActive} = true)`,
    })
    .from(branches)
    .where(eq(branches.tenantId, tenantId))

  const [userStats] = await db
    .select({
      active: sql<number>`COUNT(*) FILTER (WHERE ${users.isActive} = true)`,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))

  const [productStats] = await db
    .select({
      active: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true)`,
    })
    .from(products)
    .where(eq(products.tenantId, tenantId))

  const [customerStats] = await db
    .select({ total: count() })
    .from(customers)
    .where(eq(customers.tenantId, tenantId))

  const [salesStats] = await db
    .select({
      totalSales: count(),
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      monthRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate} >= date_trunc('month', CURRENT_DATE) AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
    })
    .from(sales)
    .where(eq(sales.tenantId, tenantId))

  const [expenseStats] = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))

  const revenue = Number(salesStats.totalRevenue)
  const expensesTotal = Number(expenseStats.totalExpenses)

  const [submission] = await db
    .insert(paymentSubmissions)
    .values({
      tenantId,
      planSlug: data.planSlug,
      amount: data.amount,
      transactionId: data.transactionId,
      paymentType: data.paymentType,
      paymentDate: new Date(data.paymentDate),
      senderAccount: data.senderAccount,
      receiverAccount: data.receiverAccount,
      notes: data.notes || null,
      statsBranches: Number(branchStats.active),
      statsUsers: Number(userStats.active),
      statsProducts: Number(productStats.active),
      statsCustomers: Number(customerStats.total),
      statsRevenue: String(revenue),
      statsExpenses: String(expensesTotal),
      statsNetProfit: String(revenue - expensesTotal),
      statsTotalSales: Number(salesStats.totalSales),
      statsMonthRevenue: salesStats.monthRevenue,
    })
    .returning()

  return { success: true, data: submission }
}

export async function getMySubmissions() {
  const tenantId = await getTenantId()

  const submissions = await db
    .select()
    .from(paymentSubmissions)
    .where(eq(paymentSubmissions.tenantId, tenantId))
    .orderBy(desc(paymentSubmissions.createdAt))
    .limit(20)

  return { success: true, data: submissions }
}
