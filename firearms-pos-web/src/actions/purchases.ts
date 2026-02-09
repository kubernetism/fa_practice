'use server'

import { db } from '@/lib/db'
import { purchases, purchaseItems, suppliers, products, inventory } from '@/lib/db/schema'
import { eq, and, desc, sql, count, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { createCostLayer } from '@/lib/accounting/cost-layers'
import { postPurchaseToGL } from '@/lib/accounting/gl-posting'

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

export async function getPendingPurchases() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      purchase: purchases,
      supplierName: suppliers.name,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .where(
      and(
        eq(purchases.tenantId, tenantId),
        or(
          eq(purchases.status, 'ordered'),
          eq(purchases.status, 'partial')
        )
      )
    )
    .orderBy(desc(purchases.createdAt))

  return { success: true, data }
}

export async function receivePurchase(
  purchaseId: number,
  receivedItems: { purchaseItemId: number; receivedQuantity: number }[]
) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  // Get purchase
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.id, purchaseId), eq(purchases.tenantId, tenantId)))

  if (!purchase) return { success: false, message: 'Purchase not found' }
  if (purchase.status === 'received') return { success: false, message: 'Already fully received' }
  if (purchase.status === 'cancelled') return { success: false, message: 'Purchase is cancelled' }

  let allFullyReceived = true
  let totalReceivedCost = 0

  for (const ri of receivedItems) {
    if (ri.receivedQuantity <= 0) continue

    // Get purchase item
    const [pItem] = await db
      .select()
      .from(purchaseItems)
      .where(
        and(eq(purchaseItems.id, ri.purchaseItemId), eq(purchaseItems.purchaseId, purchaseId))
      )

    if (!pItem) continue

    const newReceivedQty = (pItem.receivedQuantity ?? 0) + ri.receivedQuantity
    const cappedQty = Math.min(newReceivedQty, pItem.quantity)

    // Update purchase item received quantity
    await db
      .update(purchaseItems)
      .set({ receivedQuantity: cappedQty })
      .where(eq(purchaseItems.id, pItem.id))

    // Update inventory
    const [inv] = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.tenantId, tenantId),
          eq(inventory.productId, pItem.productId),
          eq(inventory.branchId, purchase.branchId)
        )
      )

    if (inv) {
      await db
        .update(inventory)
        .set({
          quantity: inv.quantity + ri.receivedQuantity,
          lastRestockDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, inv.id))
    } else {
      await db.insert(inventory).values({
        tenantId,
        productId: pItem.productId,
        branchId: purchase.branchId,
        quantity: ri.receivedQuantity,
        lastRestockDate: new Date(),
      })
    }

    // Create cost layer for FIFO tracking
    await createCostLayer({
      tenantId,
      productId: pItem.productId,
      branchId: purchase.branchId,
      purchaseItemId: pItem.id,
      quantity: ri.receivedQuantity,
      unitCost: Number(pItem.unitCost),
    })

    totalReceivedCost += ri.receivedQuantity * Number(pItem.unitCost)

    if (cappedQty < pItem.quantity) {
      allFullyReceived = false
    }
  }

  // Check all items to determine overall status
  const allItems = await db
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, purchaseId))

  const overallFullyReceived = allItems.every((item) => (item.receivedQuantity ?? 0) >= item.quantity)
  const anyReceived = allItems.some((item) => (item.receivedQuantity ?? 0) > 0)

  const newStatus = overallFullyReceived ? 'received' : anyReceived ? 'partial' : purchase.status

  const updateData: any = {
    status: newStatus as any,
    updatedAt: new Date(),
  }
  if (overallFullyReceived) {
    updateData.receivedDate = new Date()
  }

  const [updated] = await db
    .update(purchases)
    .set(updateData)
    .where(eq(purchases.id, purchaseId))
    .returning()

  // Post to GL
  if (totalReceivedCost > 0) {
    try {
      await postPurchaseToGL({
        tenantId,
        purchaseId,
        branchId: purchase.branchId,
        userId,
        totalAmount: totalReceivedCost,
        paymentMethod: purchase.paymentMethod,
      })
    } catch (e) {
      // GL posting is non-blocking — log but don't fail
      console.error('GL posting failed for purchase receive:', e)
    }
  }

  return { success: true, data: updated }
}

export async function cancelPurchase(purchaseId: number) {
  const tenantId = await getTenantId()

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.id, purchaseId), eq(purchases.tenantId, tenantId)))

  if (!purchase) return { success: false, message: 'Purchase not found' }
  if (purchase.status === 'received') {
    return { success: false, message: 'Cannot cancel a fully received purchase' }
  }

  const [updated] = await db
    .update(purchases)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(purchases.id, purchaseId))
    .returning()

  return { success: true, data: updated }
}
