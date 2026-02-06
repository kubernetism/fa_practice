'use server'

import { db } from '@/lib/db'
import { inventory, products, branches, stockAdjustments, stockTransfers } from '@/lib/db/schema'
import { eq, and, lte, desc, sql, count, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

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

  return { success: true, data: adjustment }
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
