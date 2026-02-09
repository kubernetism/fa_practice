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

export async function createSale(input: {
  customerId?: number | null
  branchId: number
  items: {
    productId: number
    quantity: number
    unitPrice: number
    costPrice: number
    serialNumber?: string
    discountPercent?: number
    discountAmount?: number
    taxAmount?: number
  }[]
  paymentMethod: string
  payments: {
    paymentMethod: string
    amount: number
    referenceNumber?: string
  }[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeGiven: number
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session!.user.id)

  // Generate invoice number
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const [countResult] = await db
    .select({ c: count() })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        sql`${sales.saleDate}::date = CURRENT_DATE`
      )
    )
  const seq = String((countResult.c || 0) + 1).padStart(3, '0')
  const invoiceNumber = `INV-${dateStr}-${seq}`

  const paymentStatus =
    Number(input.amountPaid) >= Number(input.totalAmount)
      ? 'paid'
      : Number(input.amountPaid) > 0
        ? 'partial'
        : 'pending'

  const [sale] = await db
    .insert(sales)
    .values({
      tenantId,
      invoiceNumber,
      customerId: input.customerId || null,
      branchId: input.branchId,
      userId,
      subtotal: String(input.subtotal),
      taxAmount: String(input.taxAmount),
      discountAmount: String(input.discountAmount),
      totalAmount: String(input.totalAmount),
      paymentMethod: input.paymentMethod as any,
      paymentStatus: paymentStatus as any,
      amountPaid: String(input.amountPaid),
      changeGiven: String(input.changeGiven),
      notes: input.notes || null,
    })
    .returning()

  // Insert sale items
  if (input.items.length > 0) {
    await db.insert(saleItems).values(
      input.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        serialNumber: item.serialNumber || null,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        costPrice: String(item.costPrice),
        discountPercent: String(item.discountPercent ?? 0),
        discountAmount: String(item.discountAmount ?? 0),
        taxAmount: String(item.taxAmount ?? 0),
        totalPrice: String(item.unitPrice * item.quantity),
      }))
    )
  }

  // Insert payments
  if (input.payments.length > 0) {
    await db.insert(salePayments).values(
      input.payments.map((p) => ({
        saleId: sale.id,
        paymentMethod: p.paymentMethod as any,
        amount: String(p.amount),
        referenceNumber: p.referenceNumber || null,
      }))
    )
  }

  return { success: true, data: sale }
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
