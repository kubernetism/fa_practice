'use server'

import { db } from '@/lib/db'
import { inventory, products, branches, stockAdjustments, stockTransfers, users } from '@/lib/db/schema'
import { eq, and, lte, desc, sql, count, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { postStockAdjustmentToGL } from '@/lib/accounting/gl-posting'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getInventory(params?: { branchId?: number; search?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(inventory.tenantId, tenantId)]
  if (params?.branchId) {
    conditions.push(eq(inventory.branchId, params.branchId))
  }

  let query = db
    .select({
      inventory: inventory,
      productName: products.name,
      productCode: products.code,
      productUnit: products.unit,
      isSerialTracked: products.isSerialTracked,
      branchName: branches.name,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .leftJoin(branches, eq(inventory.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(products.name)

  const data = await query

  return { success: true, data }
}

export async function getInventorySummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalItems: count(),
      totalQuantity: sql<number>`COALESCE(SUM(${inventory.quantity}), 0)`,
      lowStockCount: sql<number>`COUNT(*) FILTER (WHERE ${inventory.quantity} <= ${inventory.minQuantity})`,
      outOfStockCount: sql<number>`COUNT(*) FILTER (WHERE ${inventory.quantity} = 0)`,
    })
    .from(inventory)
    .where(eq(inventory.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getLowStockItems(branchId?: number) {
  const tenantId = await getTenantId()

  const conditions = [
    eq(inventory.tenantId, tenantId),
    lte(inventory.quantity, inventory.minQuantity),
  ]
  if (branchId) {
    conditions.push(eq(inventory.branchId, branchId))
  }

  const data = await db
    .select({
      inventory: inventory,
      productName: products.name,
      productCode: products.code,
      branchName: branches.name,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .leftJoin(branches, eq(inventory.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(inventory.quantity)

  return { success: true, data }
}

export async function adjustStock(input: {
  productId: number
  branchId: number
  adjustmentType: string
  quantityChange: number
  reason: string
  serialNumber?: string
  reference?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [inv] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(inventory.productId, input.productId),
        eq(inventory.branchId, input.branchId)
      )
    )

  const quantityBefore = inv?.quantity ?? 0
  const isAddition = input.adjustmentType === 'add'
  const quantityAfter = isAddition
    ? quantityBefore + input.quantityChange
    : quantityBefore - input.quantityChange

  if (quantityAfter < 0) {
    return { success: false, message: 'Insufficient stock for this adjustment' }
  }

  if (inv) {
    await db
      .update(inventory)
      .set({ quantity: quantityAfter, updatedAt: new Date() })
      .where(eq(inventory.id, inv.id))
  } else {
    await db.insert(inventory).values({
      tenantId,
      productId: input.productId,
      branchId: input.branchId,
      quantity: quantityAfter,
    })
  }

  const [adjustment] = await db
    .insert(stockAdjustments)
    .values({
      tenantId,
      productId: input.productId,
      branchId: input.branchId,
      userId,
      adjustmentType: input.adjustmentType as any,
      quantityBefore,
      quantityChange: input.quantityChange,
      quantityAfter,
      reason: input.reason,
      serialNumber: input.serialNumber || null,
      reference: input.reference || null,
    })
    .returning()

  // Auto GL posting for stock adjustments
  try {
    // Get product cost for GL amount estimation
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.productId))

    const unitCost = product ? Number(product.costPrice) : 0
    const adjustmentAmount = unitCost * input.quantityChange

    if (adjustmentAmount > 0) {
      await postStockAdjustmentToGL({
        tenantId,
        adjustmentId: adjustment.id,
        branchId: input.branchId,
        userId,
        amount: adjustmentAmount,
        isAddition,
      })
    }
  } catch (e) {
    console.error('GL posting failed for stock adjustment:', e)
  }

  return { success: true, data: adjustment }
}

export async function reverseStockAdjustment(adjustmentId: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [adjustment] = await db
    .select()
    .from(stockAdjustments)
    .where(and(eq(stockAdjustments.id, adjustmentId), eq(stockAdjustments.tenantId, tenantId)))

  if (!adjustment) return { success: false, message: 'Adjustment not found' }

  // Reverse the inventory change
  const isAddition = adjustment.adjustmentType === 'add'
  const reverseQuantity = isAddition ? -adjustment.quantityChange : adjustment.quantityChange

  const [inv] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(inventory.productId, adjustment.productId),
        eq(inventory.branchId, adjustment.branchId)
      )
    )

  if (!inv) return { success: false, message: 'Inventory record not found' }

  const newQuantity = inv.quantity + reverseQuantity
  if (newQuantity < 0) {
    return { success: false, message: 'Cannot reverse: would result in negative stock' }
  }

  await db
    .update(inventory)
    .set({ quantity: newQuantity, updatedAt: new Date() })
    .where(eq(inventory.id, inv.id))

  // Create a reversal adjustment record
  const [reversal] = await db
    .insert(stockAdjustments)
    .values({
      tenantId,
      productId: adjustment.productId,
      branchId: adjustment.branchId,
      userId,
      adjustmentType: isAddition ? 'remove' : 'add',
      quantityBefore: inv.quantity,
      quantityChange: adjustment.quantityChange,
      quantityAfter: newQuantity,
      reason: `Reversal of adjustment #${adjustmentId}`,
      reference: `REV-${adjustmentId}`,
    })
    .returning()

  // Reverse GL posting
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, adjustment.productId))

    const unitCost = product ? Number(product.costPrice) : 0
    const adjustmentAmount = unitCost * adjustment.quantityChange

    if (adjustmentAmount > 0) {
      await postStockAdjustmentToGL({
        tenantId,
        adjustmentId: reversal.id,
        branchId: adjustment.branchId,
        userId,
        amount: adjustmentAmount,
        isAddition: !isAddition,
      })
    }
  } catch (e) {
    console.error('GL posting failed for reversed stock adjustment:', e)
  }

  return { success: true, data: reversal }
}

export async function getStockAdjustments(params?: { productId?: number; branchId?: number }) {
  const tenantId = await getTenantId()

  const conditions = [eq(stockAdjustments.tenantId, tenantId)]
  if (params?.productId) conditions.push(eq(stockAdjustments.productId, params.productId))
  if (params?.branchId) conditions.push(eq(stockAdjustments.branchId, params.branchId))

  const data = await db
    .select({
      adjustment: stockAdjustments,
      productName: products.name,
      productCode: products.code,
    })
    .from(stockAdjustments)
    .leftJoin(products, eq(stockAdjustments.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(stockAdjustments.createdAt))
    .limit(100)

  return { success: true, data }
}

export async function getStockTransfers(branchId?: number) {
  const tenantId = await getTenantId()

  const conditions = [eq(stockTransfers.tenantId, tenantId)]
  if (branchId) {
    conditions.push(
      or(
        eq(stockTransfers.fromBranchId, branchId),
        eq(stockTransfers.toBranchId, branchId)
      )!
    )
  }

  const data = await db
    .select({
      transfer: stockTransfers,
      productName: products.name,
    })
    .from(stockTransfers)
    .leftJoin(products, eq(stockTransfers.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(stockTransfers.createdAt))
    .limit(100)

  return { success: true, data }
}

export async function getProductStock(productId: number, branchId: number) {
  const tenantId = await getTenantId()

  const [inv] = await db
    .select({
      inventory: inventory,
      productName: products.name,
      productCode: products.code,
      branchName: branches.name,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .leftJoin(branches, eq(inventory.branchId, branches.id))
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(inventory.productId, productId),
        eq(inventory.branchId, branchId)
      )
    )

  return { success: true, data: inv || null }
}

export async function createStockTransfer(data: {
  productId: number
  fromBranchId: number
  toBranchId: number
  quantity: number
  serialNumbers?: string[]
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  if (data.fromBranchId === data.toBranchId) {
    return { success: false, message: 'Source and destination branches must be different' }
  }

  // Check source inventory
  const [sourceInv] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(inventory.productId, data.productId),
        eq(inventory.branchId, data.fromBranchId)
      )
    )

  if (!sourceInv || sourceInv.quantity < data.quantity) {
    return { success: false, message: 'Insufficient stock in source branch' }
  }

  const transferNumber = `TRF-${Date.now()}`

  // Deduct from source branch
  await db
    .update(inventory)
    .set({
      quantity: sourceInv.quantity - data.quantity,
      updatedAt: new Date(),
    })
    .where(eq(inventory.id, sourceInv.id))

  // Create transfer record
  const [transfer] = await db
    .insert(stockTransfers)
    .values({
      tenantId,
      transferNumber,
      productId: data.productId,
      fromBranchId: data.fromBranchId,
      toBranchId: data.toBranchId,
      userId,
      quantity: data.quantity,
      serialNumbers: data.serialNumbers ? JSON.stringify(data.serialNumbers) : '[]',
      status: 'in_transit',
      notes: data.notes || null,
    })
    .returning()

  return { success: true, data: transfer }
}

export async function receiveStockTransfer(transferId: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [transfer] = await db
    .select()
    .from(stockTransfers)
    .where(
      and(
        eq(stockTransfers.id, transferId),
        eq(stockTransfers.tenantId, tenantId),
        eq(stockTransfers.status, 'in_transit')
      )
    )

  if (!transfer) return { success: false, message: 'Transfer not found or not in transit' }

  // Add to destination branch inventory
  const [destInv] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.tenantId, tenantId),
        eq(inventory.productId, transfer.productId),
        eq(inventory.branchId, transfer.toBranchId)
      )
    )

  if (destInv) {
    await db
      .update(inventory)
      .set({
        quantity: destInv.quantity + transfer.quantity,
        lastRestockDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, destInv.id))
  } else {
    await db.insert(inventory).values({
      tenantId,
      productId: transfer.productId,
      branchId: transfer.toBranchId,
      quantity: transfer.quantity,
      lastRestockDate: new Date(),
    })
  }

  // Update transfer status
  const [updated] = await db
    .update(stockTransfers)
    .set({
      status: 'completed',
      receivedDate: new Date(),
      receivedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(stockTransfers.id, transferId))
    .returning()

  return { success: true, data: updated }
}

export async function getPendingTransfers(branchId?: number) {
  const tenantId = await getTenantId()

  const conditions: any[] = [
    eq(stockTransfers.tenantId, tenantId),
    or(eq(stockTransfers.status, 'pending'), eq(stockTransfers.status, 'in_transit'))!,
  ]
  if (branchId) {
    conditions.push(
      or(
        eq(stockTransfers.fromBranchId, branchId),
        eq(stockTransfers.toBranchId, branchId)
      )!
    )
  }

  const data = await db
    .select({
      transfer: stockTransfers,
      productName: products.name,
      productCode: products.code,
    })
    .from(stockTransfers)
    .leftJoin(products, eq(stockTransfers.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(stockTransfers.createdAt))

  return { success: true, data }
}

export async function cancelStockTransfer(transferId: number) {
  const tenantId = await getTenantId()

  const [transfer] = await db
    .select()
    .from(stockTransfers)
    .where(
      and(
        eq(stockTransfers.id, transferId),
        eq(stockTransfers.tenantId, tenantId)
      )
    )

  if (!transfer) return { success: false, message: 'Transfer not found' }
  if (transfer.status === 'completed') {
    return { success: false, message: 'Cannot cancel a completed transfer' }
  }

  // If in_transit, restore source inventory
  if (transfer.status === 'in_transit') {
    const [sourceInv] = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.tenantId, tenantId),
          eq(inventory.productId, transfer.productId),
          eq(inventory.branchId, transfer.fromBranchId)
        )
      )

    if (sourceInv) {
      await db
        .update(inventory)
        .set({
          quantity: sourceInv.quantity + transfer.quantity,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, sourceInv.id))
    }
  }

  const [updated] = await db
    .update(stockTransfers)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(stockTransfers.id, transferId))
    .returning()

  return { success: true, data: updated }
}
