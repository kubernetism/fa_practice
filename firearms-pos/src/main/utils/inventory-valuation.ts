import { eq, and, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db/index'
import { inventoryCostLayers, products, type NewInventoryCostLayer } from '../db/schema'

interface CostLayerResult {
  totalCost: number
  layersConsumed: Array<{
    layerId: number
    quantityConsumed: number
    unitCost: number
    cost: number
  }>
}

/**
 * Consume inventory cost layers using FIFO (First-In, First-Out) method.
 *
 * This function:
 * 1. Finds the oldest non-consumed cost layers for the product/branch
 * 2. Consumes the required quantity from each layer in order
 * 3. Updates layer quantities and marks fully consumed layers
 * 4. Returns the actual cost of goods sold
 *
 * @param productId - The product to consume from
 * @param branchId - The branch location
 * @param quantity - The quantity to consume
 * @returns The total COGS and details of consumed layers
 */
export async function consumeCostLayersFIFO(
  productId: number,
  branchId: number,
  quantity: number
): Promise<CostLayerResult> {
  const db = getDatabase()

  // Get active cost layers ordered by received date (FIFO - oldest first)
  const layers = await db.query.inventoryCostLayers.findMany({
    where: and(
      eq(inventoryCostLayers.productId, productId),
      eq(inventoryCostLayers.branchId, branchId),
      eq(inventoryCostLayers.isFullyConsumed, false)
    ),
    orderBy: asc(inventoryCostLayers.receivedDate),
  })

  let remainingQty = quantity
  let totalCost = 0
  const layersConsumed: CostLayerResult['layersConsumed'] = []

  for (const layer of layers) {
    if (remainingQty <= 0) break

    const consumeQty = Math.min(remainingQty, layer.quantity)
    const layerCost = consumeQty * layer.unitCost

    totalCost += layerCost
    remainingQty -= consumeQty

    layersConsumed.push({
      layerId: layer.id,
      quantityConsumed: consumeQty,
      unitCost: layer.unitCost,
      cost: layerCost,
    })

    // Update the layer
    const newQuantity = layer.quantity - consumeQty
    const isFullyConsumed = newQuantity <= 0

    await db
      .update(inventoryCostLayers)
      .set({
        quantity: newQuantity,
        isFullyConsumed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventoryCostLayers.id, layer.id))
  }

  // If we couldn't fulfill the entire quantity from cost layers,
  // fall back to product's default cost price for the remainder
  if (remainingQty > 0) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    if (product) {
      const fallbackCost = remainingQty * product.costPrice
      totalCost += fallbackCost

      layersConsumed.push({
        layerId: -1, // Indicates fallback to product cost
        quantityConsumed: remainingQty,
        unitCost: product.costPrice,
        cost: fallbackCost,
      })

      console.warn(
        `FIFO: Insufficient cost layers for product ${productId}. ` +
        `Used product.costPrice (${product.costPrice}) for ${remainingQty} units.`
      )
    }
  }

  return { totalCost, layersConsumed }
}

/**
 * Add a new cost layer when inventory is received.
 *
 * @param data - The cost layer data
 * @returns The created cost layer ID
 */
export async function addCostLayer(
  data: {
    productId: number
    branchId: number
    purchaseItemId?: number
    quantity: number
    unitCost: number
    receivedDate?: string
  }
): Promise<number> {
  const db = getDatabase()

  const [layer] = await db
    .insert(inventoryCostLayers)
    .values({
      productId: data.productId,
      branchId: data.branchId,
      purchaseItemId: data.purchaseItemId,
      quantity: data.quantity,
      originalQuantity: data.quantity,
      unitCost: data.unitCost,
      receivedDate: data.receivedDate || new Date().toISOString(),
      isFullyConsumed: false,
    })
    .returning()

  return layer.id
}

/**
 * Restore cost layers when a sale is voided or items are returned.
 * This creates a new cost layer with the original cost.
 *
 * For returns, we could either:
 * 1. Create a new layer at the original cost (what we implement here)
 * 2. Try to restore to the original layer (more complex, less common)
 *
 * @param data - The restoration data
 * @returns The created cost layer ID
 */
export async function restoreCostLayers(
  data: {
    productId: number
    branchId: number
    quantity: number
    unitCost: number
    referenceType: 'void' | 'return'
    referenceId: number
  }
): Promise<number> {
  const db = getDatabase()

  const [layer] = await db
    .insert(inventoryCostLayers)
    .values({
      productId: data.productId,
      branchId: data.branchId,
      purchaseItemId: null, // Not linked to a purchase
      quantity: data.quantity,
      originalQuantity: data.quantity,
      unitCost: data.unitCost,
      receivedDate: new Date().toISOString(),
      isFullyConsumed: false,
    })
    .returning()

  return layer.id
}

/**
 * Get the total inventory value for a product using FIFO layers.
 *
 * @param productId - The product ID
 * @param branchId - Optional branch ID (if not provided, returns all branches)
 * @returns Total value and quantity
 */
export async function getInventoryValueFIFO(
  productId: number,
  branchId?: number
): Promise<{ totalValue: number; totalQuantity: number; layers: Array<{ quantity: number; unitCost: number; value: number }> }> {
  const db = getDatabase()

  const conditions = [
    eq(inventoryCostLayers.productId, productId),
    eq(inventoryCostLayers.isFullyConsumed, false),
  ]

  if (branchId) {
    conditions.push(eq(inventoryCostLayers.branchId, branchId))
  }

  const layers = await db.query.inventoryCostLayers.findMany({
    where: and(...conditions),
    orderBy: asc(inventoryCostLayers.receivedDate),
  })

  let totalValue = 0
  let totalQuantity = 0
  const layerDetails: Array<{ quantity: number; unitCost: number; value: number }> = []

  for (const layer of layers) {
    const value = layer.quantity * layer.unitCost
    totalValue += value
    totalQuantity += layer.quantity
    layerDetails.push({
      quantity: layer.quantity,
      unitCost: layer.unitCost,
      value,
    })
  }

  return { totalValue, totalQuantity, layers: layerDetails }
}

/**
 * Calculate weighted average cost for a product.
 * Useful as an alternative to FIFO.
 *
 * @param productId - The product ID
 * @param branchId - Optional branch ID
 * @returns Average cost per unit
 */
export async function getWeightedAverageCost(
  productId: number,
  branchId?: number
): Promise<number> {
  const { totalValue, totalQuantity } = await getInventoryValueFIFO(productId, branchId)

  if (totalQuantity === 0) {
    // Fall back to product cost price
    const db = getDatabase()
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })
    return product?.costPrice || 0
  }

  return totalValue / totalQuantity
}

/**
 * Consume cost layers for multiple items at once.
 * Useful for processing an entire sale.
 *
 * @param items - Array of items to consume
 * @returns Array of cost results for each item
 */
export async function consumeMultipleCostLayersFIFO(
  items: Array<{ productId: number; branchId: number; quantity: number }>
): Promise<Array<{ productId: number; result: CostLayerResult }>> {
  const results: Array<{ productId: number; result: CostLayerResult }> = []

  for (const item of items) {
    const result = await consumeCostLayersFIFO(
      item.productId,
      item.branchId,
      item.quantity
    )
    results.push({ productId: item.productId, result })
  }

  return results
}
