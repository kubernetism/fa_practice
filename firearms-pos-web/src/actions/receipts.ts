'use server'

import { db } from '@/lib/db'
import {
  sales,
  saleItems,
  salePayments,
  customers,
  products,
  businessSettings,
  branches,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export interface ReceiptData {
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  taxId: string
  branchName: string
  invoiceNumber: string
  saleDate: string
  customerName: string | null
  customerPhone: string | null
  items: {
    name: string
    code: string
    quantity: number
    unitPrice: number
    discount: number
    tax: number
    total: number
  }[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeGiven: number
  paymentMethod: string
  payments: { method: string; amount: number; reference: string | null }[]
  receiptFooter: string | null
  cashierName: string | null
}

/**
 * Generate receipt data for a sale (returns structured data for frontend rendering/printing)
 */
export async function generateReceipt(saleId: number): Promise<{
  success: boolean
  data?: ReceiptData
  message?: string
}> {
  const tenantId = await getTenantId()

  // Get sale
  const [sale] = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, saleId), eq(sales.tenantId, tenantId)))

  if (!sale) return { success: false, message: 'Sale not found' }

  // Get business settings
  const [settings] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))
    .limit(1)

  // Get branch
  const [branch] = await db.select().from(branches).where(eq(branches.id, sale.branchId))

  // Get customer
  let customerName: string | null = null
  let customerPhone: string | null = null
  if (sale.customerId) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, sale.customerId))
    if (customer) {
      customerName = `${customer.firstName} ${customer.lastName}`
      customerPhone = customer.phone
    }
  }

  // Get items
  const itemRows = await db
    .select({
      item: saleItems,
      productName: products.name,
      productCode: products.code,
    })
    .from(saleItems)
    .leftJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.saleId, saleId))

  // Get payments
  const paymentRows = await db
    .select()
    .from(salePayments)
    .where(eq(salePayments.saleId, saleId))

  // Get cashier name
  const session = await auth()
  const cashierName = session?.user?.name || null

  const receiptData: ReceiptData = {
    businessName: settings?.businessName || 'Business',
    businessAddress: [settings?.businessAddress, settings?.businessCity, settings?.businessState]
      .filter(Boolean)
      .join(', '),
    businessPhone: settings?.businessPhone || '',
    businessEmail: settings?.businessEmail || '',
    taxId: settings?.taxId || '',
    branchName: branch?.name || '',
    invoiceNumber: sale.invoiceNumber,
    saleDate: sale.saleDate.toISOString(),
    customerName,
    customerPhone,
    items: itemRows.map((r) => ({
      name: r.productName || 'Unknown',
      code: r.productCode || '',
      quantity: r.item.quantity,
      unitPrice: Number(r.item.unitPrice),
      discount: Number(r.item.discountAmount),
      tax: Number(r.item.taxAmount),
      total: Number(r.item.totalPrice),
    })),
    subtotal: Number(sale.subtotal),
    taxAmount: Number(sale.taxAmount),
    discountAmount: Number(sale.discountAmount),
    totalAmount: Number(sale.totalAmount),
    amountPaid: Number(sale.amountPaid),
    changeGiven: Number(sale.changeGiven),
    paymentMethod: sale.paymentMethod,
    payments: paymentRows.map((p) => ({
      method: p.paymentMethod,
      amount: Number(p.amount),
      reference: p.referenceNumber,
    })),
    receiptFooter: settings?.receiptFooter || null,
    cashierName,
  }

  return { success: true, data: receiptData }
}

/**
 * Get receipt settings for configuration
 */
export async function getReceiptSettings() {
  const tenantId = await getTenantId()

  const [settings] = await db
    .select({
      businessName: businessSettings.businessName,
      businessLogo: businessSettings.businessLogo,
      businessAddress: businessSettings.businessAddress,
      businessCity: businessSettings.businessCity,
      businessPhone: businessSettings.businessPhone,
      businessEmail: businessSettings.businessEmail,
      taxId: businessSettings.taxId,
      receiptFooter: businessSettings.receiptFooter,
    })
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))
    .limit(1)

  return { success: true, data: settings || null }
}
