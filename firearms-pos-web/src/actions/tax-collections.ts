'use server'

import { db } from '@/lib/db'
import { sales, saleItems, products } from '@/lib/db/schema'
import { eq, and, sql, between, count, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getTaxSummary() {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      totalTaxCollected: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      totalTaxableSales: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
      totalSalesWithTax: sql<number>`COUNT(*) FILTER (WHERE ${sales.taxAmount}::numeric > 0)`,
      avgTaxRate: sql<string>`CASE WHEN SUM(${sales.subtotal})::numeric > 0 THEN ROUND(SUM(${sales.taxAmount})::numeric / SUM(${sales.subtotal})::numeric * 100, 2) ELSE 0 END`,
      totalSaleCount: count(),
    })
    .from(sales)
    .where(and(eq(sales.tenantId, tenantId), eq(sales.isVoided, false)))

  return { success: true, data: result }
}

export async function getTaxByPeriod(dateFrom: string, dateTo: string, groupBy: 'day' | 'month' = 'day') {
  const tenantId = await getTenantId()

  const dateExpr = groupBy === 'month'
    ? sql`TO_CHAR(${sales.saleDate}, 'YYYY-MM')`
    : sql`${sales.saleDate}::date`

  const data = await db
    .select({
      period: dateExpr.as('period'),
      taxCollected: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      taxableSales: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
      saleCount: count(),
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(dateExpr)
    .orderBy(dateExpr)

  return { success: true, data }
}

export async function getTaxSaleDetails(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      saleId: sales.id,
      invoiceNumber: sales.invoiceNumber,
      saleDate: sales.saleDate,
      subtotal: sales.subtotal,
      taxAmount: sales.taxAmount,
      totalAmount: sales.totalAmount,
      paymentMethod: sales.paymentMethod,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        sql`${sales.taxAmount}::numeric > 0`,
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .orderBy(desc(sales.saleDate))

  return { success: true, data }
}

export async function getTaxReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalTaxCollected: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      totalTaxableSales: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
      totalSaleCount: count(),
      cashTax: sql<string>`COALESCE(SUM(CASE WHEN ${sales.paymentMethod} = 'cash' THEN ${sales.taxAmount} ELSE 0 END)::numeric, 0)`,
      cardTax: sql<string>`COALESCE(SUM(CASE WHEN ${sales.paymentMethod} = 'card' THEN ${sales.taxAmount} ELSE 0 END)::numeric, 0)`,
      creditTax: sql<string>`COALESCE(SUM(CASE WHEN ${sales.paymentMethod} IN ('credit', 'receivable') THEN ${sales.taxAmount} ELSE 0 END)::numeric, 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  // Monthly breakdown
  const monthly = await db
    .select({
      month: sql<string>`TO_CHAR(${sales.saleDate}, 'YYYY-MM')`,
      taxCollected: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      taxableSales: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
      saleCount: count(),
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(sql`TO_CHAR(${sales.saleDate}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${sales.saleDate}, 'YYYY-MM')`)

  return { success: true, data: { summary, monthly } }
}
