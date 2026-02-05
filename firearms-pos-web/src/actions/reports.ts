'use server'

import { db } from '@/lib/db'
import {
  sales,
  expenses,
  purchases,
  chartOfAccounts,
  products,
} from '@/lib/db/schema'
import { eq, and, sql, between, desc, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getProfitAndLoss(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const revenue = await db
    .select({
      total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  const expenseTotal = await db
    .select({
      total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        between(expenses.expenseDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  const purchaseTotal = await db
    .select({
      total: sql<string>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.tenantId, tenantId),
        eq(purchases.status, 'received'),
        between(purchases.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      revenue: revenue[0].total,
      expenses: expenseTotal[0].total,
      costOfGoods: purchaseTotal[0].total,
      netProfit: String(
        Number(revenue[0].total) - Number(expenseTotal[0].total) - Number(purchaseTotal[0].total)
      ),
    },
  }
}

export async function getBalanceSheet() {
  const tenantId = await getTenantId()

  const accounts = await db
    .select({
      accountType: chartOfAccounts.accountType,
      totalBalance: sql<string>`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)`,
    })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))
    .groupBy(chartOfAccounts.accountType)

  const result: Record<string, string> = {}
  for (const row of accounts) {
    result[row.accountType] = row.totalBalance
  }

  return {
    success: true,
    data: {
      assets: result.asset || '0',
      liabilities: result.liability || '0',
      equity: result.equity || '0',
      revenue: result.revenue || '0',
      expenses: result.expense || '0',
    },
  }
}

export async function getSalesReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalSales: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      totalDiscount: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      totalTax: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      saleCount: count(),
      avgSale: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return { success: true, data: result[0] }
}

export async function getTopProducts(limit: number = 10) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: products.id,
      name: products.name,
      code: products.code,
      sellingPrice: products.sellingPrice,
      costPrice: products.costPrice,
    })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
    .orderBy(desc(products.sellingPrice))
    .limit(limit)

  return { success: true, data }
}

export async function getTaxReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const salesTax = await db
    .select({
      totalTax: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      taxableAmount: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      salesTax: salesTax[0].totalTax,
      taxableRevenue: salesTax[0].taxableAmount,
    },
  }
}
