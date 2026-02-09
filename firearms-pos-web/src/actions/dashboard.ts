'use server'

import { db } from '@/lib/db'
import { sales, products, customers, inventory, categories } from '@/lib/db/schema'
import { eq, and, sql, count, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getDashboardStats() {
  const tenantId = await getTenantId()

  const [salesStats] = await db
    .select({
      todaySales: sql<number>`COUNT(*) FILTER (WHERE ${sales.saleDate}::date = CURRENT_DATE AND ${sales.isVoided} = false)`,
      todayRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate}::date = CURRENT_DATE AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      monthRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate} >= date_trunc('month', CURRENT_DATE) AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      lastMonthRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate} >= date_trunc('month', CURRENT_DATE - interval '1 month') AND ${sales.saleDate} < date_trunc('month', CURRENT_DATE) AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      yesterdaySales: sql<number>`COUNT(*) FILTER (WHERE ${sales.saleDate}::date = CURRENT_DATE - 1 AND ${sales.isVoided} = false)`,
    })
    .from(sales)
    .where(eq(sales.tenantId, tenantId))

  const [productStats] = await db
    .select({
      totalProducts: count(),
      activeProducts: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true)`,
    })
    .from(products)
    .where(eq(products.tenantId, tenantId))

  const [lowStockCount] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        sql`${inventory.quantity} <= ${products.reorderLevel}`
      )
    )

  return {
    success: true,
    data: {
      todaySales: Number(salesStats.todaySales),
      todayRevenue: salesStats.todayRevenue,
      monthRevenue: salesStats.monthRevenue,
      lastMonthRevenue: salesStats.lastMonthRevenue,
      yesterdaySales: Number(salesStats.yesterdaySales),
      totalProducts: Number(productStats.totalProducts),
      activeProducts: Number(productStats.activeProducts),
      lowStockCount: Number(lowStockCount.count),
    },
  }
}

export async function getRecentSales(limit = 5) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      totalAmount: sales.totalAmount,
      paymentMethod: sales.paymentMethod,
      saleDate: sales.saleDate,
      customerName: sql<string>`COALESCE(${customers.firstName} || ' ' || ${customers.lastName}, 'Walk-in')`,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(and(eq(sales.tenantId, tenantId), eq(sales.isVoided, false)))
    .orderBy(desc(sales.saleDate))
    .limit(limit)

  return { success: true, data }
}

export async function getLowStockItems(limit = 10) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      productName: products.name,
      productCode: products.code,
      quantity: inventory.quantity,
      reorderLevel: products.reorderLevel,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(products.isActive, true),
        sql`${inventory.quantity} <= ${products.reorderLevel}`
      )
    )
    .orderBy(sql`${inventory.quantity} - ${products.reorderLevel}`)
    .limit(limit)

  return { success: true, data }
}
