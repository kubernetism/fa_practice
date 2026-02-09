'use server'

import { db } from '@/lib/db'
import {
  inventoryCounts,
  inventoryCountItems,
  inventory,
  products,
  branches,
  stockAdjustments,
} from '@/lib/db/schema'
import { eq, and, desc, sql, count, ne } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getInventoryCounts(params?: {
  status?: string
  branchId?: number
  countType?: string
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(inventoryCounts.tenantId, tenantId)]
  if (params?.status && params.status !== 'all') {
    conditions.push(eq(inventoryCounts.status, params.status as any))
  }
  if (params?.branchId) {
    conditions.push(eq(inventoryCounts.branchId, params.branchId))
  }
  if (params?.countType && params.countType !== 'all') {
    conditions.push(eq(inventoryCounts.countType, params.countType as any))
  }

  const data = await db
    .select({
      count: inventoryCounts,
      branchName: branches.name,
    })
    .from(inventoryCounts)
    .leftJoin(branches, eq(inventoryCounts.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(desc(inventoryCounts.createdAt))

  return { success: true, data }
}

export async function createInventoryCount(data: {
  branchId: number
  countType: string
  scheduledDate?: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const countNumber = `IC-${Date.now()}`

  const [countRecord] = await db
    .insert(inventoryCounts)
    .values({
      tenantId,
      countNumber,
      branchId: data.branchId,
      countType: data.countType as any,
      status: 'draft',
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      createdBy: userId,
      notes: data.notes || null,
    })
    .returning()

  return { success: true, data: countRecord }
}

export async function getInventoryCountById(id: number) {
  const tenantId = await getTenantId()

  const [countRecord] = await db
    .select({
      count: inventoryCounts,
      branchName: branches.name,
    })
    .from(inventoryCounts)
    .leftJoin(branches, eq(inventoryCounts.branchId, branches.id))
    .where(and(eq(inventoryCounts.id, id), eq(inventoryCounts.tenantId, tenantId)))

  if (!countRecord) return { success: false, message: 'Count not found' }

  const items = await db
    .select({
      item: inventoryCountItems,
      productName: products.name,
      productCode: products.code,
    })
    .from(inventoryCountItems)
    .leftJoin(products, eq(inventoryCountItems.productId, products.id))
    .where(eq(inventoryCountItems.countId, id))

  return { success: true, data: { ...countRecord, items } }
}

export async function startCount(id: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [countRecord] = await db
    .update(inventoryCounts)
    .set({
      status: 'in_progress',
      startedAt: new Date(),
      startedBy: userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(inventoryCounts.id, id),
        eq(inventoryCounts.tenantId, tenantId),
        eq(inventoryCounts.status, 'draft')
      )
    )
    .returning()

  if (!countRecord) return { success: false, message: 'Count not found or not in draft status' }

  return { success: true, data: countRecord }
}

export async function addCountItem(
  countId: number,
  item: {
    productId: number
    expectedQuantity: number
    expectedCost: number
    serialNumber?: string
  }
) {
  const tenantId = await getTenantId()

  // Verify count exists and is in progress
  const [countRecord] = await db
    .select()
    .from(inventoryCounts)
    .where(
      and(
        eq(inventoryCounts.id, countId),
        eq(inventoryCounts.tenantId, tenantId),
        eq(inventoryCounts.status, 'in_progress')
      )
    )

  if (!countRecord) return { success: false, message: 'Count not found or not in progress' }

  const [countItem] = await db
    .insert(inventoryCountItems)
    .values({
      countId,
      productId: item.productId,
      expectedQuantity: item.expectedQuantity,
      expectedCost: String(item.expectedCost),
      serialNumber: item.serialNumber || null,
    })
    .returning()

  // Update total items
  await db
    .update(inventoryCounts)
    .set({
      totalItems: sql`${inventoryCounts.totalItems} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(inventoryCounts.id, countId))

  return { success: true, data: countItem }
}

export async function updateCountItem(
  itemId: number,
  data: { countedQuantity: number; notes?: string }
) {
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [existing] = await db
    .select()
    .from(inventoryCountItems)
    .where(eq(inventoryCountItems.id, itemId))

  if (!existing) return { success: false, message: 'Count item not found' }

  const variance = data.countedQuantity - existing.expectedQuantity
  const varianceValue = variance * Number(existing.expectedCost)
  const variancePercent =
    existing.expectedQuantity > 0 ? (variance / existing.expectedQuantity) * 100 : 0

  const [item] = await db
    .update(inventoryCountItems)
    .set({
      countedQuantity: data.countedQuantity,
      varianceQuantity: variance,
      varianceValue: String(varianceValue),
      variancePercent: String(variancePercent),
      countedBy: userId,
      countedAt: new Date(),
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(inventoryCountItems.id, itemId))
    .returning()

  // Update items counted on the parent count
  const [countedStats] = await db
    .select({
      counted: sql<number>`COUNT(*) FILTER (WHERE ${inventoryCountItems.countedQuantity} IS NOT NULL)`,
      varianceCount: sql<number>`COUNT(*) FILTER (WHERE ${inventoryCountItems.varianceQuantity} IS NOT NULL AND ${inventoryCountItems.varianceQuantity} != 0)`,
      totalVarianceValue: sql<string>`COALESCE(SUM(ABS(${inventoryCountItems.varianceValue}::numeric)), 0)`,
    })
    .from(inventoryCountItems)
    .where(eq(inventoryCountItems.countId, existing.countId))

  await db
    .update(inventoryCounts)
    .set({
      itemsCounted: countedStats.counted,
      varianceCount: countedStats.varianceCount,
      varianceValue: countedStats.totalVarianceValue,
      updatedAt: new Date(),
    })
    .where(eq(inventoryCounts.id, existing.countId))

  return { success: true, data: item }
}

export async function removeCountItem(itemId: number) {
  const [existing] = await db
    .select()
    .from(inventoryCountItems)
    .where(eq(inventoryCountItems.id, itemId))

  if (!existing) return { success: false, message: 'Count item not found' }

  await db.delete(inventoryCountItems).where(eq(inventoryCountItems.id, itemId))

  await db
    .update(inventoryCounts)
    .set({
      totalItems: sql`GREATEST(${inventoryCounts.totalItems} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(inventoryCounts.id, existing.countId))

  return { success: true }
}

export async function finalizeCount(countId: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [countRecord] = await db
    .select()
    .from(inventoryCounts)
    .where(
      and(
        eq(inventoryCounts.id, countId),
        eq(inventoryCounts.tenantId, tenantId),
        eq(inventoryCounts.status, 'in_progress')
      )
    )

  if (!countRecord) return { success: false, message: 'Count not found or not in progress' }

  // Get items with variances that need adjustments
  const itemsWithVariance = await db
    .select()
    .from(inventoryCountItems)
    .where(
      and(
        eq(inventoryCountItems.countId, countId),
        ne(inventoryCountItems.varianceQuantity, 0),
        eq(inventoryCountItems.adjustmentCreated, false)
      )
    )

  // Create stock adjustments for variances
  for (const item of itemsWithVariance) {
    if (item.countedQuantity === null || item.varianceQuantity === null) continue

    const isAdd = item.varianceQuantity > 0
    const absChange = Math.abs(item.varianceQuantity)

    // Update inventory
    const [inv] = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.tenantId, tenantId),
          eq(inventory.productId, item.productId),
          eq(inventory.branchId, countRecord.branchId)
        )
      )

    const quantityBefore = inv?.quantity ?? 0

    if (inv) {
      await db
        .update(inventory)
        .set({ quantity: item.countedQuantity, updatedAt: new Date() })
        .where(eq(inventory.id, inv.id))
    } else {
      await db.insert(inventory).values({
        tenantId,
        productId: item.productId,
        branchId: countRecord.branchId,
        quantity: item.countedQuantity,
      })
    }

    // Create adjustment record
    await db.insert(stockAdjustments).values({
      tenantId,
      productId: item.productId,
      branchId: countRecord.branchId,
      userId,
      adjustmentType: 'correction',
      quantityBefore,
      quantityChange: absChange,
      quantityAfter: item.countedQuantity,
      reason: `Inventory count #${countRecord.countNumber} variance correction`,
      reference: countRecord.countNumber,
    })

    // Mark adjustment as created
    await db
      .update(inventoryCountItems)
      .set({ adjustmentCreated: true, updatedAt: new Date() })
      .where(eq(inventoryCountItems.id, item.id))
  }

  // Complete the count
  const [completed] = await db
    .update(inventoryCounts)
    .set({
      status: 'completed',
      completedAt: new Date(),
      completedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(inventoryCounts.id, countId))
    .returning()

  return { success: true, data: completed }
}

export async function getVarianceReport(countId: number) {
  const tenantId = await getTenantId()

  const [countRecord] = await db
    .select()
    .from(inventoryCounts)
    .where(and(eq(inventoryCounts.id, countId), eq(inventoryCounts.tenantId, tenantId)))

  if (!countRecord) return { success: false, message: 'Count not found' }

  const items = await db
    .select({
      item: inventoryCountItems,
      productName: products.name,
      productCode: products.code,
    })
    .from(inventoryCountItems)
    .leftJoin(products, eq(inventoryCountItems.productId, products.id))
    .where(eq(inventoryCountItems.countId, countId))

  const summary = {
    totalItems: items.length,
    countedItems: items.filter((i) => i.item.countedQuantity !== null).length,
    itemsWithVariance: items.filter(
      (i) => i.item.varianceQuantity !== null && i.item.varianceQuantity !== 0
    ).length,
    totalVarianceValue: items.reduce(
      (sum, i) => sum + Math.abs(Number(i.item.varianceValue ?? 0)),
      0
    ),
    positiveVariance: items.filter((i) => (i.item.varianceQuantity ?? 0) > 0).length,
    negativeVariance: items.filter((i) => (i.item.varianceQuantity ?? 0) < 0).length,
  }

  return { success: true, data: { count: countRecord, items, summary } }
}
