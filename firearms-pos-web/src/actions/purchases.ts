'use server'

import { db } from '@/lib/db'
import { purchases, purchaseItems, suppliers, products } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getPurchases(filters?: { status?: string; paymentStatus?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(purchases.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(purchases.status, filters.status as any))
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    conditions.push(eq(purchases.paymentStatus, filters.paymentStatus as any))
  }

  const data = await db
    .select({
      purchase: purchases,
      supplierName: suppliers.name,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .where(and(...conditions))
    .orderBy(desc(purchases.createdAt))

  return { success: true, data }
}

export async function getPurchaseSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalPurchases: sql<string>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
      totalCount: count(),
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${purchases.status} IN ('draft', 'ordered'))`,
      receivedCount: sql<number>`COUNT(*) FILTER (WHERE ${purchases.status} = 'received')`,
      unpaidAmount: sql<string>`COALESCE(SUM(CASE WHEN ${purchases.paymentStatus} != 'paid' THEN ${purchases.totalAmount} ELSE 0 END), 0)`,
    })
    .from(purchases)
    .where(eq(purchases.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getPurchaseItems(purchaseId: number) {
  const tenantId = await getTenantId()

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.id, purchaseId), eq(purchases.tenantId, tenantId)))

  if (!purchase) return { success: false, message: 'Purchase not found' }

  const items = await db
    .select({
      item: purchaseItems,
      productName: products.name,
    })
    .from(purchaseItems)
    .leftJoin(products, eq(purchaseItems.productId, products.id))
    .where(eq(purchaseItems.purchaseId, purchaseId))

  return { success: true, data: { purchase, items } }
}

export async function createPurchase(data: {
  supplierId: number
  branchId: number
  paymentMethod: string
  expectedDeliveryDate?: string
  notes?: string
  items: { productId: number; quantity: number; unitCost: string }[]
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const subtotal = data.items.reduce((s, i) => s + Number(i.unitCost) * i.quantity, 0)
  const poNumber = `PO-${Date.now()}`

  const [purchase] = await db
    .insert(purchases)
    .values({
      tenantId,
      purchaseOrderNumber: poNumber,
      supplierId: data.supplierId,
      branchId: data.branchId,
      userId,
      subtotal: String(subtotal),
      totalAmount: String(subtotal),
      paymentMethod: data.paymentMethod as any,
      status: 'draft',
      paymentStatus: 'pending',
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
      notes: data.notes || null,
    })
    .returning()

  for (const item of data.items) {
    await db.insert(purchaseItems).values({
      purchaseId: purchase.id,
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: String(Number(item.unitCost) * item.quantity),
    })
  }

  return { success: true, data: purchase }
}

export async function updatePurchaseStatus(id: number, status: string) {
  const tenantId = await getTenantId()

  const updateData: any = {
    status: status as any,
    updatedAt: new Date(),
  }
  if (status === 'received') {
    updateData.receivedDate = new Date()
  }

  const [purchase] = await db
    .update(purchases)
    .set(updateData)
    .where(and(eq(purchases.id, id), eq(purchases.tenantId, tenantId)))
    .returning()

  if (!purchase) return { success: false, message: 'Purchase not found' }

  return { success: true, data: purchase }
}
