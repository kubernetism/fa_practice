import { ipcMain } from 'electron'
import { eq, and, desc, isNull, ne, sql, inArray } from 'drizzle-orm'
import { getDatabase } from '../db/index'
import {
  inventoryCounts,
  inventoryCountItems,
  inventory,
  products,
  stockAdjustments,
  type NewInventoryCount,
  type NewInventoryCountItem,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { postStockAdjustmentToGL } from '../utils/gl-posting'

/**
 * Generate a unique count number in format IC-YYYY-NNNN
 */
function generateCountNumber(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `IC-${year}-${timestamp}${random}`
}

export function registerInventoryCountsHandlers(): void {
  // Create a new inventory count session
  ipcMain.handle(
    'inventory-counts:create',
    async (
      _,
      data: {
        branchId: number
        countType: 'full' | 'cycle' | 'spot' | 'annual'
        scheduledDate?: string
        notes?: string
        userId: number
        productIds?: number[] // For cycle/spot counts - specific products to count
      }
    ) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        // Create the count session
        const [count] = await db
          .insert(inventoryCounts)
          .values({
            countNumber: generateCountNumber(),
            branchId: data.branchId,
            countType: data.countType,
            status: 'draft',
            scheduledDate: data.scheduledDate || now.split('T')[0],
            createdBy: data.userId,
            notes: data.notes,
            createdAt: now,
            updatedAt: now,
          })
          .returning()

        // Get products to include in the count
        let productsToCount
        if (data.productIds && data.productIds.length > 0) {
          // Specific products for cycle/spot count
          productsToCount = await db.query.products.findMany({
            where: and(
              eq(products.isActive, true),
              inArray(products.id, data.productIds)
            ),
          })
        } else {
          // All active products for full/annual count
          productsToCount = await db.query.products.findMany({
            where: eq(products.isActive, true),
          })
        }

        // Create count items for each product
        let totalItems = 0
        for (const product of productsToCount) {
          // Get current inventory level
          const inv = await db.query.inventory.findFirst({
            where: and(
              eq(inventory.productId, product.id),
              eq(inventory.branchId, data.branchId)
            ),
          })

          const expectedQuantity = inv?.quantity || 0
          const expectedCost = product.costPrice || 0

          await db.insert(inventoryCountItems).values({
            countId: count.id,
            productId: product.id,
            expectedQuantity,
            expectedCost,
            createdAt: now,
            updatedAt: now,
          })
          totalItems++
        }

        // Update total items count
        await db
          .update(inventoryCounts)
          .set({ totalItems, updatedAt: now })
          .where(eq(inventoryCounts.id, count.id))

        await createAuditLog({
          userId: data.userId,
          branchId: data.branchId,
          action: 'CREATE',
          entityType: 'inventory_count',
          entityId: count.id,
          newValues: {
            countNumber: count.countNumber,
            countType: data.countType,
            totalItems,
          },
          description: `Inventory count ${count.countNumber} created with ${totalItems} items`,
        })

        return {
          success: true,
          message: `Inventory count created with ${totalItems} items`,
          data: { ...count, totalItems },
        }
      } catch (error) {
        console.error('Create inventory count error:', error)
        return {
          success: false,
          message: `Failed to create inventory count: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    }
  )

  // Start a count session
  ipcMain.handle(
    'inventory-counts:start',
    async (_, countId: number, userId: number) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        const count = await db.query.inventoryCounts.findFirst({
          where: eq(inventoryCounts.id, countId),
        })

        if (!count) {
          return { success: false, message: 'Count session not found' }
        }

        if (count.status !== 'draft') {
          return { success: false, message: 'Count session has already been started' }
        }

        await db
          .update(inventoryCounts)
          .set({
            status: 'in_progress',
            startedAt: now,
            startedBy: userId,
            updatedAt: now,
          })
          .where(eq(inventoryCounts.id, countId))

        return { success: true, message: 'Count session started' }
      } catch (error) {
        console.error('Start count error:', error)
        return { success: false, message: 'Failed to start count session' }
      }
    }
  )

  // Record a count for an item
  ipcMain.handle(
    'inventory-counts:record-count',
    async (
      _,
      data: {
        countItemId: number
        countedQuantity: number
        userId: number
        notes?: string
      }
    ) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        const item = await db.query.inventoryCountItems.findFirst({
          where: eq(inventoryCountItems.id, data.countItemId),
          with: { count: true },
        })

        if (!item) {
          return { success: false, message: 'Count item not found' }
        }

        if (item.count.status !== 'in_progress') {
          return { success: false, message: 'Count session is not in progress' }
        }

        // Calculate variance
        const varianceQuantity = data.countedQuantity - item.expectedQuantity
        const varianceValue = varianceQuantity * item.expectedCost
        const variancePercent =
          item.expectedQuantity > 0
            ? (varianceQuantity / item.expectedQuantity) * 100
            : data.countedQuantity > 0
              ? 100
              : 0

        await db
          .update(inventoryCountItems)
          .set({
            countedQuantity: data.countedQuantity,
            varianceQuantity,
            varianceValue,
            variancePercent,
            countedBy: data.userId,
            countedAt: now,
            notes: data.notes,
            updatedAt: now,
          })
          .where(eq(inventoryCountItems.id, data.countItemId))

        // Update items counted in session
        const countedCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(inventoryCountItems)
          .where(
            and(
              eq(inventoryCountItems.countId, item.countId),
              sql`${inventoryCountItems.countedQuantity} IS NOT NULL`
            )
          )

        await db
          .update(inventoryCounts)
          .set({
            itemsCounted: countedCount[0]?.count || 0,
            updatedAt: now,
          })
          .where(eq(inventoryCounts.id, item.countId))

        return {
          success: true,
          message: 'Count recorded',
          data: { varianceQuantity, varianceValue, variancePercent },
        }
      } catch (error) {
        console.error('Record count error:', error)
        return { success: false, message: 'Failed to record count' }
      }
    }
  )

  // Complete a count session and calculate final variance
  ipcMain.handle(
    'inventory-counts:complete',
    async (_, countId: number, userId: number) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        const count = await db.query.inventoryCounts.findFirst({
          where: eq(inventoryCounts.id, countId),
          with: { items: true },
        })

        if (!count) {
          return { success: false, message: 'Count session not found' }
        }

        if (count.status !== 'in_progress') {
          return { success: false, message: 'Count session is not in progress' }
        }

        // Check if all items have been counted
        const uncountedItems = count.items.filter((i) => i.countedQuantity === null)
        if (uncountedItems.length > 0) {
          return {
            success: false,
            message: `${uncountedItems.length} items have not been counted yet`,
          }
        }

        // Calculate summary
        const varianceItems = count.items.filter((i) => i.varianceQuantity !== 0)
        const totalVarianceValue = count.items.reduce(
          (sum, i) => sum + (i.varianceValue || 0),
          0
        )

        await db
          .update(inventoryCounts)
          .set({
            status: 'completed',
            completedAt: now,
            completedBy: userId,
            varianceCount: varianceItems.length,
            varianceValue: totalVarianceValue,
            updatedAt: now,
          })
          .where(eq(inventoryCounts.id, countId))

        await createAuditLog({
          userId,
          branchId: count.branchId,
          action: 'UPDATE',
          entityType: 'inventory_count',
          entityId: countId,
          newValues: {
            status: 'completed',
            varianceCount: varianceItems.length,
            varianceValue: totalVarianceValue,
          },
          description: `Inventory count ${count.countNumber} completed with ${varianceItems.length} variances totaling $${totalVarianceValue.toFixed(2)}`,
        })

        return {
          success: true,
          message: 'Count session completed',
          data: {
            varianceCount: varianceItems.length,
            varianceValue: totalVarianceValue,
          },
        }
      } catch (error) {
        console.error('Complete count error:', error)
        return { success: false, message: 'Failed to complete count session' }
      }
    }
  )

  // Apply adjustments from count variances
  ipcMain.handle(
    'inventory-counts:apply-adjustments',
    async (_, countId: number, userId: number) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        const count = await db.query.inventoryCounts.findFirst({
          where: eq(inventoryCounts.id, countId),
          with: { items: true },
        })

        if (!count) {
          return { success: false, message: 'Count session not found' }
        }

        if (count.status !== 'completed') {
          return { success: false, message: 'Count session must be completed first' }
        }

        // Get items with variance that haven't been adjusted yet
        const itemsToAdjust = count.items.filter(
          (i) => i.varianceQuantity !== 0 && !i.adjustmentCreated
        )

        if (itemsToAdjust.length === 0) {
          return { success: false, message: 'No variance items to adjust' }
        }

        let adjustedCount = 0

        for (const item of itemsToAdjust) {
          // Get current inventory
          const inv = await db.query.inventory.findFirst({
            where: and(
              eq(inventory.productId, item.productId),
              eq(inventory.branchId, count.branchId)
            ),
          })

          if (!inv) continue

          const varianceQty = item.varianceQuantity || 0
          const newQuantity = inv.quantity + varianceQty

          // Update inventory
          await db
            .update(inventory)
            .set({
              quantity: newQuantity,
              updatedAt: now,
            })
            .where(eq(inventory.id, inv.id))

          // Create stock adjustment record
          const [adjustment] = await db.insert(stockAdjustments).values({
            productId: item.productId,
            branchId: count.branchId,
            userId,
            adjustmentType: 'correction',
            quantityBefore: inv.quantity,
            quantityChange: varianceQty,
            quantityAfter: newQuantity,
            reason: `Cycle count adjustment - Count #${count.countNumber}`,
            reference: count.countNumber,
            createdAt: now,
          }).returning()

          // Get product for cost price and name
          const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
          })

          // Post to GL so cycle count variances are reflected in accounting
          if (product && adjustment) {
            await postStockAdjustmentToGL(
              {
                id: adjustment.id,
                branchId: count.branchId,
                adjustmentType: 'correction',
                quantityChange: varianceQty,
                unitCost: product.costPrice,
                reason: `Cycle count adjustment - Count #${count.countNumber}`,
                reference: count.countNumber,
                productName: product.name,
                quantityBefore: inv.quantity,
                quantityAfter: newQuantity,
              },
              userId
            )
          }

          // Mark item as adjusted
          await db
            .update(inventoryCountItems)
            .set({ adjustmentCreated: true, updatedAt: now })
            .where(eq(inventoryCountItems.id, item.id))

          adjustedCount++
        }

        await createAuditLog({
          userId,
          branchId: count.branchId,
          action: 'UPDATE',
          entityType: 'inventory_count',
          entityId: countId,
          newValues: { adjustmentsApplied: adjustedCount },
          description: `Applied ${adjustedCount} inventory adjustments from count ${count.countNumber}`,
        })

        return {
          success: true,
          message: `Applied ${adjustedCount} inventory adjustments`,
          data: { adjustedCount },
        }
      } catch (error) {
        console.error('Apply adjustments error:', error)
        return { success: false, message: 'Failed to apply adjustments' }
      }
    }
  )

  // Get variance report for a count
  ipcMain.handle('inventory-counts:variance-report', async (_, countId: number) => {
    try {
      const db = getDatabase()

      const count = await db.query.inventoryCounts.findFirst({
        where: eq(inventoryCounts.id, countId),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          branch: true,
          createdByUser: true,
          completedByUser: true,
        },
      })

      if (!count) {
        return { success: false, message: 'Count session not found' }
      }

      // Calculate summary statistics
      const totalExpectedValue = count.items.reduce(
        (sum, i) => sum + i.expectedQuantity * i.expectedCost,
        0
      )
      const totalCountedValue = count.items.reduce(
        (sum, i) => sum + (i.countedQuantity || 0) * i.expectedCost,
        0
      )
      const totalVarianceValue = count.items.reduce(
        (sum, i) => sum + (i.varianceValue || 0),
        0
      )

      const itemsWithVariance = count.items.filter((i) => i.varianceQuantity !== 0)
      const positiveVariances = itemsWithVariance.filter((i) => (i.varianceQuantity || 0) > 0)
      const negativeVariances = itemsWithVariance.filter((i) => (i.varianceQuantity || 0) < 0)

      const summary = {
        countNumber: count.countNumber,
        countType: count.countType,
        status: count.status,
        branchName: count.branch?.name,
        scheduledDate: count.scheduledDate,
        completedAt: count.completedAt,
        completedBy: count.completedByUser?.username,
        totalItems: count.totalItems,
        itemsCounted: count.itemsCounted,
        totalExpectedValue,
        totalCountedValue,
        totalVarianceValue,
        variancePercent:
          totalExpectedValue > 0
            ? (totalVarianceValue / totalExpectedValue) * 100
            : 0,
        itemsWithVariance: itemsWithVariance.length,
        positiveVarianceCount: positiveVariances.length,
        positiveVarianceValue: positiveVariances.reduce(
          (sum, i) => sum + (i.varianceValue || 0),
          0
        ),
        negativeVarianceCount: negativeVariances.length,
        negativeVarianceValue: negativeVariances.reduce(
          (sum, i) => sum + (i.varianceValue || 0),
          0
        ),
      }

      // Format items for report
      const items = count.items.map((i) => ({
        productId: i.productId,
        productName: i.product?.name,
        sku: i.product?.sku,
        expectedQuantity: i.expectedQuantity,
        countedQuantity: i.countedQuantity,
        varianceQuantity: i.varianceQuantity,
        varianceValue: i.varianceValue,
        variancePercent: i.variancePercent,
        expectedCost: i.expectedCost,
        adjustmentCreated: i.adjustmentCreated,
        notes: i.notes,
      }))

      return {
        success: true,
        data: { summary, items },
      }
    } catch (error) {
      console.error('Variance report error:', error)
      return { success: false, message: 'Failed to generate variance report' }
    }
  })

  // List all inventory counts
  ipcMain.handle(
    'inventory-counts:list',
    async (_, branchId?: number, status?: string) => {
      try {
        const db = getDatabase()

        const conditions = []
        if (branchId) conditions.push(eq(inventoryCounts.branchId, branchId))
        if (status) conditions.push(eq(inventoryCounts.status, status as any))

        const counts = await db.query.inventoryCounts.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          with: {
            branch: true,
            createdByUser: true,
          },
          orderBy: desc(inventoryCounts.createdAt),
        })

        return { success: true, data: counts }
      } catch (error) {
        console.error('List counts error:', error)
        return { success: false, message: 'Failed to list counts' }
      }
    }
  )

  // Get a single count with items
  ipcMain.handle('inventory-counts:get', async (_, countId: number) => {
    try {
      const db = getDatabase()

      const count = await db.query.inventoryCounts.findFirst({
        where: eq(inventoryCounts.id, countId),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          branch: true,
          createdByUser: true,
          startedByUser: true,
          completedByUser: true,
        },
      })

      if (!count) {
        return { success: false, message: 'Count not found' }
      }

      return { success: true, data: count }
    } catch (error) {
      console.error('Get count error:', error)
      return { success: false, message: 'Failed to get count' }
    }
  })

  // Cancel a count session
  ipcMain.handle(
    'inventory-counts:cancel',
    async (_, countId: number, userId: number) => {
      try {
        const db = getDatabase()
        const now = new Date().toISOString()

        const count = await db.query.inventoryCounts.findFirst({
          where: eq(inventoryCounts.id, countId),
        })

        if (!count) {
          return { success: false, message: 'Count not found' }
        }

        if (count.status === 'completed') {
          return { success: false, message: 'Cannot cancel a completed count' }
        }

        await db
          .update(inventoryCounts)
          .set({ status: 'cancelled', updatedAt: now })
          .where(eq(inventoryCounts.id, countId))

        await createAuditLog({
          userId,
          branchId: count.branchId,
          action: 'UPDATE',
          entityType: 'inventory_count',
          entityId: countId,
          newValues: { status: 'cancelled' },
          description: `Inventory count ${count.countNumber} cancelled`,
        })

        return { success: true, message: 'Count cancelled' }
      } catch (error) {
        console.error('Cancel count error:', error)
        return { success: false, message: 'Failed to cancel count' }
      }
    }
  )

  // Get inventory reconciliation summary (comparing book vs physical)
  ipcMain.handle('inventory-counts:reconciliation-summary', async (_, branchId: number) => {
    try {
      const db = getDatabase()

      // Get all completed counts for the branch
      const recentCounts = await db.query.inventoryCounts.findMany({
        where: and(
          eq(inventoryCounts.branchId, branchId),
          eq(inventoryCounts.status, 'completed')
        ),
        orderBy: desc(inventoryCounts.completedAt),
        limit: 10,
        with: {
          items: true,
        },
      })

      // Calculate reconciliation metrics
      const summary = {
        totalCountsSinceInception: recentCounts.length,
        lastCountDate: recentCounts[0]?.completedAt || null,
        totalVarianceValue: recentCounts.reduce(
          (sum, c) => sum + (c.varianceValue || 0),
          0
        ),
        averageVariancePerCount:
          recentCounts.length > 0
            ? recentCounts.reduce((sum, c) => sum + (c.varianceValue || 0), 0) /
              recentCounts.length
            : 0,
        countsWithVariance: recentCounts.filter((c) => (c.varianceCount || 0) > 0).length,
        recentCounts: recentCounts.map((c) => ({
          id: c.id,
          countNumber: c.countNumber,
          countType: c.countType,
          completedAt: c.completedAt,
          totalItems: c.totalItems,
          varianceCount: c.varianceCount,
          varianceValue: c.varianceValue,
        })),
      }

      return { success: true, data: summary }
    } catch (error) {
      console.error('Reconciliation summary error:', error)
      return { success: false, message: 'Failed to get reconciliation summary' }
    }
  })

  console.log('Inventory counts IPC handlers registered')
}
