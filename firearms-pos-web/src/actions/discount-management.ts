'use server'

import { db } from '@/lib/db'
import { sales, saleItems, products, vouchers } from '@/lib/db/schema'
import { eq, and, sql, between, count, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getDiscountSummary() {
  const tenantId = await getTenantId()

  const [result] = await db
    .select({
      totalDiscountGiven: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      totalSalesWithDiscount: sql<number>`COUNT(*) FILTER (WHERE ${sales.discountAmount}::numeric > 0)`,
      totalSales: count(),
      avgDiscountPerSale: sql<string>`COALESCE(AVG(CASE WHEN ${sales.discountAmount}::numeric > 0 THEN ${sales.discountAmount}::numeric ELSE NULL END), 0)`,
      maxDiscount: sql<string>`COALESCE(MAX(${sales.discountAmount}), 0)`,
      discountRate: sql<string>`CASE WHEN SUM(${sales.subtotal})::numeric > 0 THEN ROUND(SUM(${sales.discountAmount})::numeric / SUM(${sales.subtotal})::numeric * 100, 2) ELSE 0 END`,
    })
    .from(sales)
    .where(and(eq(sales.tenantId, tenantId), eq(sales.isVoided, false)))

  return { success: true, data: result }
}

export async function getDiscountDetails(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      saleId: sales.id,
      invoiceNumber: sales.invoiceNumber,
      saleDate: sales.saleDate,
      subtotal: sales.subtotal,
      discountAmount: sales.discountAmount,
      totalAmount: sales.totalAmount,
      paymentMethod: sales.paymentMethod,
      discountPercent: sql<string>`CASE WHEN ${sales.subtotal}::numeric > 0 THEN ROUND(${sales.discountAmount}::numeric / ${sales.subtotal}::numeric * 100, 2) ELSE 0 END`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        sql`${sales.discountAmount}::numeric > 0`,
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .orderBy(desc(sales.saleDate))

  return { success: true, data }
}

export async function getDiscountReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalDiscountGiven: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      totalSubtotal: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
      totalSalesWithDiscount: sql<number>`COUNT(*) FILTER (WHERE ${sales.discountAmount}::numeric > 0)`,
      totalSalesCount: count(),
      avgDiscount: sql<string>`COALESCE(AVG(CASE WHEN ${sales.discountAmount}::numeric > 0 THEN ${sales.discountAmount}::numeric ELSE NULL END), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  // Daily breakdown
  const daily = await db
    .select({
      date: sql<string>`${sales.saleDate}::date`,
      discountGiven: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      salesWithDiscount: sql<number>`COUNT(*) FILTER (WHERE ${sales.discountAmount}::numeric > 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(sql`${sales.saleDate}::date`)
    .orderBy(sql`${sales.saleDate}::date`)

  return { success: true, data: { summary, daily } }
}

export async function analyzeDiscountImpact(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  // Revenue with and without discounts
  const [withDiscount] = await db
    .select({
      saleCount: count(),
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      totalDiscount: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      avgOrderValue: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        sql`${sales.discountAmount}::numeric > 0`,
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  const [withoutDiscount] = await db
    .select({
      saleCount: count(),
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      avgOrderValue: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        sql`(${sales.discountAmount}::numeric = 0 OR ${sales.discountAmount} IS NULL)`,
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  // Voucher usage stats
  const [voucherStats] = await db
    .select({
      totalVouchers: count(),
      usedCount: sql<number>`COUNT(*) FILTER (WHERE ${vouchers.isUsed} = true)`,
      totalVoucherDiscount: sql<string>`COALESCE(SUM(CASE WHEN ${vouchers.isUsed} = true THEN ${vouchers.discountAmount} ELSE 0 END), 0)`,
    })
    .from(vouchers)
    .where(eq(vouchers.tenantId, tenantId))

  return {
    success: true,
    data: {
      withDiscount,
      withoutDiscount,
      voucherStats,
      potentialRevenueLost: withDiscount.totalDiscount,
    },
  }
}
