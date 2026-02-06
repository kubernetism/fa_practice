'use server'

import { db } from '@/lib/db'
import { sales, saleItems, salePayments, customers, products } from '@/lib/db/schema'
import { eq, and, desc, sql, count, between, ilike, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getSales(params?: {
  search?: string
  paymentStatus?: string
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  showVoided?: boolean
  limit?: number
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(sales.tenantId, tenantId)]

  if (params?.paymentStatus && params.paymentStatus !== 'all') {
    conditions.push(eq(sales.paymentStatus, params.paymentStatus as any))
  }
  if (params?.paymentMethod && params.paymentMethod !== 'all') {
    conditions.push(eq(sales.paymentMethod, params.paymentMethod as any))
  }
  if (!params?.showVoided) {
    conditions.push(eq(sales.isVoided, false))
  }
  if (params?.dateFrom && params?.dateTo) {
    conditions.push(
      between(sales.saleDate, new Date(params.dateFrom), new Date(params.dateTo))
    )
  }
  if (params?.search) {
    conditions.push(ilike(sales.invoiceNumber, `%${params.search}%`))
  }

  const data = await db
    .select({
      sale: sales,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(sales.saleDate))
    .limit(params?.limit ?? 100)

  return { success: true, data }
}

export async function getSalesSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalSales: count(),
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      todaySales: sql<number>`COUNT(*) FILTER (WHERE ${sales.saleDate}::date = CURRENT_DATE AND ${sales.isVoided} = false)`,
      todayRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${sales.saleDate}::date = CURRENT_DATE AND ${sales.isVoided} = false THEN ${sales.totalAmount} ELSE 0 END), 0)`,
      paidCount: sql<number>`COUNT(*) FILTER (WHERE ${sales.paymentStatus} = 'paid' AND ${sales.isVoided} = false)`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${sales.paymentStatus} != 'paid' AND ${sales.isVoided} = false)`,
    })
    .from(sales)
    .where(eq(sales.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getSaleById(saleId: number) {
  const tenantId = await getTenantId()

  const [sale] = await db
    .select({
      sale: sales,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(and(eq(sales.id, saleId), eq(sales.tenantId, tenantId)))

  if (!sale) return { success: false, message: 'Sale not found' }

  const items = await db
    .select({
      item: saleItems,
      productName: products.name,
      productCode: products.code,
    })
    .from(saleItems)
    .leftJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.saleId, saleId))

  const payments = await db
    .select()
    .from(salePayments)
    .where(eq(salePayments.saleId, saleId))

  return { success: true, data: { ...sale, items, payments } }
}

export async function voidSale(id: number, reason: string) {
  const tenantId = await getTenantId()

  const [sale] = await db
    .update(sales)
    .set({
      isVoided: true,
      voidReason: reason,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sales.id, id),
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false)
      )
    )
    .returning()

  if (!sale) return { success: false, message: 'Sale not found or already voided' }

  return { success: true, data: sale }
}
