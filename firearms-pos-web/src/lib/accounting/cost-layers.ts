'use server'

import { db } from '@/lib/db'
import { inventoryCostLayers, inventory } from '@/lib/db/schema'
import { eq, and, asc, sql } from 'drizzle-orm'

/**
 * Create a new cost layer when purchase items are received.
 */
export async function createCostLayer(params: {
  tenantId: number
  productId: number
  branchId: number
  purchaseItemId: number
  quantity: number
  unitCost: number
}) {
  const [layer] = await db
    .insert(inventoryCostLayers)
    .values({
      tenantId: params.tenantId,
      productId: params.productId,
      branchId: params.branchId,
      purchaseItemId: params.purchaseItemId,
      quantity: params.quantity,
      originalQuantity: params.quantity,
      unitCost: String(params.unitCost),
      receivedDate: new Date(),
      isFullyConsumed: false,
    })
    .returning()

  return layer
}

/**
 * Consume cost layers using FIFO for a sale.
 * Returns the total COGS for the consumed quantity.
 */
export async function consumeCostLayers(params: {
  tenantId: number
  productId: number
  branchId: number
  quantity: number
}): Promise<{ totalCost: number; layersConsumed: number }> {
  let remaining = params.quantity
  let totalCost = 0
  let layersConsumed = 0

  // Get active cost layers ordered by received date (FIFO)
  const layers = await db
    .select()
    .from(inventoryCostLayers)
    .where(
      and(
        eq(inventoryCostLayers.tenantId, params.tenantId),
        eq(inventoryCostLayers.productId, params.productId),
        eq(inventoryCostLayers.branchId, params.branchId),
        eq(inventoryCostLayers.isFullyConsumed, false)
      )
    )
    .orderBy(asc(inventoryCostLayers.receivedDate))

  for (const layer of layers) {
    if (remaining <= 0) break

    const available = layer.quantity
    const consume = Math.min(available, remaining)
    const cost = consume * Number(layer.unitCost)

    totalCost += cost
    remaining -= consume
    layersConsumed++

    const newQty = available - consume
    await db
      .update(inventoryCostLayers)
      .set({
        quantity: newQty,
        isFullyConsumed: newQty === 0,
        updatedAt: new Date(),
      })
      .where(eq(inventoryCostLayers.id, layer.id))
  }

  // If we still have remaining quantity with no cost layers,
  // use a fallback of 0 cost (no cost layer data)
  return { totalCost, layersConsumed }
}

/**
 * Restore cost layers when a return is processed (re-add consumed quantity).
 */
export async function restoreCostLayers(params: {
  tenantId: number
  productId: number
  branchId: number
  quantity: number
  unitCost: number
}) {
  // Create a new layer for the returned items
  const [layer] = await db
    .insert(inventoryCostLayers)
    .values({
      tenantId: params.tenantId,
      productId: params.productId,
      branchId: params.branchId,
      quantity: params.quantity,
      originalQuantity: params.quantity,
      unitCost: String(params.unitCost),
      receivedDate: new Date(),
      isFullyConsumed: false,
    })
    .returning()

  return layer
}

/**
 * Get the current FIFO inventory valuation for a tenant (or specific product/branch).
 */
export async function getInventoryValuation(params: {
  tenantId: number
  productId?: number
  branchId?: number
}): Promise<{ totalValue: number; totalQuantity: number }> {
  const conditions = [
    eq(inventoryCostLayers.tenantId, params.tenantId),
    eq(inventoryCostLayers.isFullyConsumed, false),
  ]
  if (params.productId) {
    conditions.push(eq(inventoryCostLayers.productId, params.productId))
  }
  if (params.branchId) {
    conditions.push(eq(inventoryCostLayers.branchId, params.branchId))
  }

  const [result] = await db
    .select({
      totalValue: sql<string>`COALESCE(SUM(${inventoryCostLayers.quantity} * ${inventoryCostLayers.unitCost}::numeric), 0)`,
      totalQuantity: sql<number>`COALESCE(SUM(${inventoryCostLayers.quantity}), 0)`,
    })
    .from(inventoryCostLayers)
    .where(and(...conditions))

  return {
    totalValue: Number(result.totalValue),
    totalQuantity: result.totalQuantity,
  }
}
