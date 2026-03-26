import { ipcMain } from 'electron'
import { eq, and, lte, sql, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  inventory,
  products,
  branches,
  stockAdjustments,
  stockTransfers,
  type NewInventory,
  type NewStockAdjustment,
  type NewStockTransfer,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateTransferNumber } from '../utils/helpers'
import { withTransaction } from '../utils/db-transaction'
import { postStockAdjustmentToGL } from '../utils/gl-posting'

export function registerInventoryHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('inventory:get-by-branch', async (_, branchId?: number) => {
    try {
      let query = db
        .select({
          inventory: inventory,
          product: products,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))

      if (branchId) {
        query = query.where(eq(inventory.branchId, branchId)) as typeof query
      }

      const data = await query

      return { success: true, data }
    } catch (error) {
      console.error('Get inventory error:', error)
      return { success: false, message: 'Failed to fetch inventory' }
    }
  })

  ipcMain.handle('inventory:get-all', async () => {
    try {
      const data = await db
        .select({
          inventory: inventory,
          product: products,
          branch: branches,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .innerJoin(branches, eq(inventory.branchId, branches.id))

      return { success: true, data }
    } catch (error) {
      console.error('Get all inventory error:', error)
      return { success: false, message: 'Failed to fetch inventory' }
    }
  })

  ipcMain.handle('inventory:get-low-stock', async (_, branchId?: number) => {
    try {
      const conditions = [lte(inventory.quantity, inventory.minQuantity)]
      if (branchId) {
        conditions.push(eq(inventory.branchId, branchId))
      }

      const data = await db
        .select({
          inventory: inventory,
          product: products,
          branch: branches,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .innerJoin(branches, eq(inventory.branchId, branches.id))
        .where(and(...conditions))

      return { success: true, data }
    } catch (error) {
      console.error('Get low stock error:', error)
      return { success: false, message: 'Failed to fetch low stock items' }
    }
  })

  ipcMain.handle('inventory:get-product-stock', async (_, productId: number, branchId: number) => {
    try {
      const stock = await db.query.inventory.findFirst({
        where: and(eq(inventory.productId, productId), eq(inventory.branchId, branchId)),
      })

      return { success: true, data: stock }
    } catch (error) {
      console.error('Get product stock error:', error)
      return { success: false, message: 'Failed to fetch product stock' }
    }
  })

  ipcMain.handle(
    'inventory:adjust',
    async (
      _,
      data: {
        productId: number
        branchId: number
        adjustmentType: NewStockAdjustment['adjustmentType']
        quantityChange: number
        reason: string
        serialNumber?: string
        reference?: string
        fundingSource?: 'owner_capital' | 'accounts_payable' | 'surplus'
      }
    ) => {
      try {
        const session = getCurrentSession()

        // Get current inventory
        const currentInventory = await db.query.inventory.findFirst({
          where: and(eq(inventory.productId, data.productId), eq(inventory.branchId, data.branchId)),
        })

        // Get product for cost price
        const product = await db.query.products.findFirst({
          where: eq(products.id, data.productId),
        })

        if (!product) {
          return { success: false, message: 'Product not found' }
        }

        const quantityBefore = currentInventory?.quantity ?? 0
        const quantityAfter =
          data.adjustmentType === 'add'
            ? quantityBefore + data.quantityChange
            : quantityBefore - data.quantityChange

        if (quantityAfter < 0) {
          return { success: false, message: 'Insufficient stock for this adjustment' }
        }

        // Execute inventory update, adjustment record, and GL posting in a transaction
        // so they all succeed or all roll back together
        const result = await withTransaction(async ({ db: txDb }) => {
          // Update or create inventory
          if (currentInventory) {
            await txDb
              .update(inventory)
              .set({
                quantity: quantityAfter,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(inventory.id, currentInventory.id))
          } else {
            await txDb.insert(inventory).values({
              productId: data.productId,
              branchId: data.branchId,
              quantity: quantityAfter,
            })
          }

          // Create adjustment record with returning to get ID
          const [adjustment] = await txDb.insert(stockAdjustments).values({
            productId: data.productId,
            branchId: data.branchId,
            userId: session?.userId ?? 0,
            adjustmentType: data.adjustmentType,
            quantityBefore,
            quantityChange: data.quantityChange,
            quantityAfter,
            serialNumber: data.serialNumber,
            reason: data.reason,
            reference: data.reference,
          }).returning()

          // Post to GL — if this fails the entire adjustment rolls back
          if (data.quantityChange > 0) {
            await postStockAdjustmentToGL(
              {
                id: adjustment.id,
                branchId: data.branchId,
                adjustmentType: data.adjustmentType,
                quantityChange: data.quantityChange,
                unitCost: product.costPrice,
                reason: data.reason,
                reference: data.reference,
                fundingSource: data.fundingSource,
                productName: product.name,
                quantityBefore: quantityBefore,
                quantityAfter: quantityAfter,
              },
              session?.userId ?? 0
            )
          }

          return adjustment
        })

        await createAuditLog({
          userId: session?.userId,
          branchId: data.branchId,
          action: 'adjustment',
          entityType: 'inventory',
          entityId: data.productId,
          newValues: {
            adjustmentType: data.adjustmentType,
            quantityBefore,
            quantityChange: data.quantityChange,
            quantityAfter,
            reason: data.reason,
          },
          description: `Stock adjusted: ${data.adjustmentType} ${data.quantityChange} units`,
        })

        return { success: true, message: 'Stock adjusted successfully' }
      } catch (error) {
        console.error('Stock adjustment error:', error)
        return { success: false, message: 'Failed to adjust stock' }
      }
    }
  )

  ipcMain.handle(
    'inventory:transfer',
    async (
      _,
      data: {
        productId: number
        fromBranchId: number
        toBranchId: number
        quantity: number
        serialNumbers?: string[]
        notes?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        // Check source inventory
        const sourceInventory = await db.query.inventory.findFirst({
          where: and(eq(inventory.productId, data.productId), eq(inventory.branchId, data.fromBranchId)),
        })

        if (!sourceInventory || sourceInventory.quantity < data.quantity) {
          return { success: false, message: 'Insufficient stock in source branch' }
        }

        // Create transfer record
        const transferNumber = generateTransferNumber()
        const [transfer] = await db
          .insert(stockTransfers)
          .values({
            transferNumber,
            productId: data.productId,
            fromBranchId: data.fromBranchId,
            toBranchId: data.toBranchId,
            userId: session?.userId ?? 0,
            quantity: data.quantity,
            serialNumbers: data.serialNumbers ?? [],
            notes: data.notes,
            status: 'pending',
          })
          .returning()

        await createAuditLog({
          userId: session?.userId,
          branchId: data.fromBranchId,
          action: 'transfer',
          entityType: 'inventory',
          entityId: transfer.id,
          newValues: {
            transferNumber,
            productId: data.productId,
            fromBranchId: data.fromBranchId,
            toBranchId: data.toBranchId,
            quantity: data.quantity,
          },
          description: `Stock transfer initiated: ${transferNumber}`,
        })

        return { success: true, data: transfer }
      } catch (error) {
        console.error('Stock transfer error:', error)
        return { success: false, message: 'Failed to create transfer' }
      }
    }
  )

  ipcMain.handle('inventory:complete-transfer', async (_, transferId: number) => {
    try {
      const session = getCurrentSession()

      const transfer = await db.query.stockTransfers.findFirst({
        where: eq(stockTransfers.id, transferId),
      })

      if (!transfer) {
        return { success: false, message: 'Transfer not found' }
      }

      if (transfer.status !== 'pending' && transfer.status !== 'in_transit') {
        return { success: false, message: 'Transfer cannot be completed' }
      }

      // Execute all transfer operations in a transaction
      await withTransaction(async ({ db: txDb }) => {
        // Deduct from source
        await txDb
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${transfer.quantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(and(eq(inventory.productId, transfer.productId), eq(inventory.branchId, transfer.fromBranchId)))

        // Add to destination
        const destInventory = await txDb.query.inventory.findFirst({
          where: and(eq(inventory.productId, transfer.productId), eq(inventory.branchId, transfer.toBranchId)),
        })

        if (destInventory) {
          await txDb
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} + ${transfer.quantity}`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(inventory.id, destInventory.id))
        } else {
          await txDb.insert(inventory).values({
            productId: transfer.productId,
            branchId: transfer.toBranchId,
            quantity: transfer.quantity,
          })
        }

        // Update transfer status
        await txDb
          .update(stockTransfers)
          .set({
            status: 'completed',
            receivedDate: new Date().toISOString(),
            receivedBy: session?.userId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(stockTransfers.id, transferId))
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: transfer.toBranchId,
        action: 'transfer',
        entityType: 'inventory',
        entityId: transferId,
        description: `Stock transfer completed: ${transfer.transferNumber}`,
      })

      return { success: true, message: 'Transfer completed successfully' }
    } catch (error) {
      console.error('Complete transfer error:', error)
      return { success: false, message: 'Failed to complete transfer' }
    }
  })

  ipcMain.handle('inventory:get-adjustments', async (_, productId?: number, branchId?: number) => {
    try {
      const conditions = []
      if (productId) conditions.push(eq(stockAdjustments.productId, productId))
      if (branchId) conditions.push(eq(stockAdjustments.branchId, branchId))

      const data = await db.query.stockAdjustments.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(stockAdjustments.createdAt),
        limit: 100,
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get adjustments error:', error)
      return { success: false, message: 'Failed to fetch adjustments' }
    }
  })

  ipcMain.handle('inventory:get-transfers', async (_, branchId?: number) => {
    try {
      const conditions = []
      if (branchId) {
        conditions.push(
          sql`(${stockTransfers.fromBranchId} = ${branchId} OR ${stockTransfers.toBranchId} = ${branchId})`
        )
      }

      const data = await db.query.stockTransfers.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(stockTransfers.createdAt),
        limit: 100,
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get transfers error:', error)
      return { success: false, message: 'Failed to fetch transfers' }
    }
  })
}
