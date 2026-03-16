import { ipcMain } from 'electron'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  returns,
  returnItems,
  sales,
  saleItems,
  inventory,
  products,
  customers,
  journalEntries,
  journalEntryLines,
  chartOfAccounts,
  type NewReturn,
  type NewReturnItem,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateReturnNumber, type PaginationParams, type PaginatedResult } from '../utils/helpers'
import { withTransaction } from '../utils/db-transaction'
import { postReturnToGL, createJournalEntry } from '../utils/gl-posting'
import { restoreCostLayers, consumeCostLayers } from '../utils/inventory-valuation'
import { handleIpcError } from '../utils/error-handling'

interface ReturnItemData {
  saleItemId: number
  productId: number
  quantity: number
  unitPrice: number
  serialNumber?: string
  condition: 'new' | 'good' | 'fair' | 'damaged'
  restockable: boolean
}

interface CreateReturnData {
  originalSaleId: number
  customerId?: number
  branchId: number
  returnType: 'refund' | 'exchange' | 'store_credit'
  items: ReturnItemData[]
  refundMethod?: 'cash' | 'card' | 'store_credit'
  reason?: string
  notes?: string
}

export function registerReturnHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('returns:create', async (_, data: CreateReturnData) => {
    try {
      const session = getCurrentSession()

      if (!data.items || data.items.length === 0) {
        return { success: false, message: 'No items to return' }
      }

      // Validate original sale
      const originalSale = await db.query.sales.findFirst({
        where: eq(sales.id, data.originalSaleId),
      })

      if (!originalSale) {
        return { success: false, message: 'Original sale not found' }
      }

      if (originalSale.isVoided) {
        return { success: false, message: 'Cannot return items from a voided sale' }
      }

      // Execute all operations in a transaction
      const result = await withTransaction(async ({ db: txDb }) => {
        // Calculate totals
        let subtotal = 0
        let taxAmount = 0
        const returnItemsData: Array<Omit<NewReturnItem, 'returnId'>> = []

        for (const item of data.items) {
          const totalPrice = item.unitPrice * item.quantity
          subtotal += totalPrice

          // Get original sale item for tax calculation and cost price
          const originalItem = await txDb.query.saleItems.findFirst({
            where: eq(saleItems.id, item.saleItemId),
          })

          let itemCostPrice = 0
          if (originalItem) {
            const itemTax = (originalItem.taxAmount / originalItem.quantity) * item.quantity
            taxAmount += itemTax
            itemCostPrice = originalItem.costPrice
          }

          returnItemsData.push({
            saleItemId: item.saleItemId,
            productId: item.productId,
            serialNumber: item.serialNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            condition: item.condition,
            restockable: item.restockable,
            costPrice: itemCostPrice,
          })
        }

        const totalAmount = subtotal + taxAmount
        const returnNumber = generateReturnNumber()

        const [returnRecord] = await txDb
          .insert(returns)
          .values({
            returnNumber,
            originalSaleId: data.originalSaleId,
            customerId: data.customerId,
            branchId: data.branchId,
            userId: session?.userId ?? 0,
            returnType: data.returnType,
            subtotal,
            taxAmount,
            totalAmount,
            refundMethod: data.refundMethod,
            refundAmount: data.returnType === 'refund' ? totalAmount : 0,
            reason: data.reason,
            notes: data.notes,
          })
          .returning()

        // Create return items (including costPrice for audit trail)
        for (const item of returnItemsData) {
          await txDb.insert(returnItems).values({
            ...item,
            returnId: returnRecord.id,
          })
        }

        // Restock items and restore cost layers if applicable
        for (const item of data.items) {
          if (item.restockable) {
            const existingInventory = await txDb.query.inventory.findFirst({
              where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, data.branchId)),
            })

            if (existingInventory) {
              await txDb
                .update(inventory)
                .set({
                  quantity: sql`${inventory.quantity} + ${item.quantity}`,
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(inventory.id, existingInventory.id))
            } else {
              await txDb.insert(inventory).values({
                productId: item.productId,
                branchId: data.branchId,
                quantity: item.quantity,
              })
            }

            // Restore cost layers for FIFO tracking
            const returnItemData = returnItemsData.find((ri) => ri.productId === item.productId)
            if (returnItemData && returnItemData.costPrice > 0) {
              await restoreCostLayers({
                productId: item.productId,
                branchId: data.branchId,
                quantity: item.quantity,
                unitCost: returnItemData.costPrice,
                referenceType: 'return',
                referenceId: returnRecord.id,
              })
            }
          }
        }

        // Post to General Ledger
        const returnItemsForGL = returnItemsData.map((item) => ({
          costPrice: item.costPrice,
          quantity: item.quantity,
          restockable: item.restockable,
        }))

        await postReturnToGL(
          {
            id: returnRecord.id,
            returnNumber,
            branchId: data.branchId,
            subtotal,
            taxAmount,
            totalAmount,
            refundMethod: data.refundMethod,
          },
          returnItemsForGL,
          session?.userId ?? 0
        )

        return { returnRecord, returnNumber, totalAmount }
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'refund',
        entityType: 'return',
        entityId: result.returnRecord.id,
        newValues: {
          returnNumber: result.returnNumber,
          originalSaleId: data.originalSaleId,
          totalAmount: result.totalAmount,
          itemCount: data.items.length,
        },
        description: `Created return: ${result.returnNumber}`,
      })

      return { success: true, data: result.returnRecord }
    } catch (error) {
      return handleIpcError('Create return', error)
    }
  })

  ipcMain.handle(
    'returns:get-all',
    async (_, params: PaginationParams & { branchId?: number; customerId?: number; returnType?: string }) => {
      try {
        const { page = 1, limit = 20, sortOrder = 'desc', branchId, customerId, returnType } = params

        const conditions = []

        if (branchId) conditions.push(eq(returns.branchId, branchId))
        if (customerId) conditions.push(eq(returns.customerId, customerId))
        if (returnType)
          conditions.push(eq(returns.returnType, returnType as 'refund' | 'exchange' | 'store_credit'))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(returns).where(whereClause)

        const total = countResult[0].count

        const data = await db.query.returns.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(returns.returnDate) : returns.returnDate,
        })

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        return handleIpcError('Get returns', error)
      }
    }
  )

  ipcMain.handle('returns:get-by-id', async (_, id: number) => {
    try {
      const returnRecord = await db.query.returns.findFirst({
        where: eq(returns.id, id),
      })

      if (!returnRecord) {
        return { success: false, message: 'Return not found' }
      }

      const items = await db
        .select({
          returnItem: returnItems,
          product: products,
        })
        .from(returnItems)
        .innerJoin(products, eq(returnItems.productId, products.id))
        .where(eq(returnItems.returnId, id))

      const originalSale = await db.query.sales.findFirst({
        where: eq(sales.id, returnRecord.originalSaleId),
      })

      let customer = null
      if (returnRecord.customerId) {
        customer = await db.query.customers.findFirst({
          where: eq(customers.id, returnRecord.customerId),
        })
      }

      return {
        success: true,
        data: {
          ...returnRecord,
          items: items.map((i) => ({ ...i.returnItem, product: i.product })),
          originalSale,
          customer,
        },
      }
    } catch (error) {
      return handleIpcError('Get return', error)
    }
  })

  ipcMain.handle('returns:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const returnRecord = await db.query.returns.findFirst({
        where: eq(returns.id, id),
      })

      if (!returnRecord) {
        return { success: false, message: 'Return not found' }
      }

      // Get return items to reverse inventory changes
      const items = await db.query.returnItems.findMany({
        where: eq(returnItems.returnId, id),
      })

      // Execute inventory reversal, GL reversal, and deletion in a transaction
      await withTransaction(async ({ db: txDb }) => {
        // Reverse inventory changes for restockable items and consume restored cost layers
        for (const item of items) {
          if (item.restockable) {
            const existingInventory = await txDb.query.inventory.findFirst({
              where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, returnRecord.branchId)),
            })

            if (existingInventory) {
              await txDb
                .update(inventory)
                .set({
                  quantity: sql`${inventory.quantity} - ${item.quantity}`,
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(inventory.id, existingInventory.id))
            }

            // Consume cost layers that were restored by this return
            await consumeCostLayers(item.productId, returnRecord.branchId, item.quantity)
          }
        }

        // Reverse GL entries for this return
        const jeEntry = await txDb.query.journalEntries.findFirst({
          where: and(
            eq(journalEntries.referenceType, 'return'),
            eq(journalEntries.referenceId, id),
            eq(journalEntries.status, 'posted')
          ),
        })

        if (jeEntry) {
          const lines = await txDb.query.journalEntryLines.findMany({
            where: eq(journalEntryLines.journalEntryId, jeEntry.id),
          })

          const reversingLines = []
          for (const line of lines) {
            const account = await txDb.query.chartOfAccounts.findFirst({
              where: eq(chartOfAccounts.id, line.accountId),
            })
            if (account) {
              reversingLines.push({
                accountCode: account.accountCode,
                debitAmount: line.creditAmount,
                creditAmount: line.debitAmount,
                description: `Reversal: ${line.description || ''}`,
              })
            }
          }

          const reversalEntryId = await createJournalEntry({
            description: `Reversal of return ${returnRecord.returnNumber} (deleted)`,
            referenceType: 'return',
            referenceId: id,
            branchId: returnRecord.branchId,
            userId: session?.userId ?? 0,
            lines: reversingLines,
          })

          await txDb
            .update(journalEntries)
            .set({
              status: 'reversed',
              reversedBy: session?.userId ?? 0,
              reversedAt: new Date().toISOString(),
              reversalEntryId,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(journalEntries.id, jeEntry.id))
        }

        // Delete return items first
        await txDb.delete(returnItems).where(eq(returnItems.returnId, id))

        // Delete the return record
        await txDb.delete(returns).where(eq(returns.id, id))
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: returnRecord.branchId,
        action: 'delete',
        entityType: 'return',
        entityId: id,
        oldValues: {
          returnNumber: returnRecord.returnNumber,
          totalAmount: returnRecord.totalAmount,
        },
        description: `Deleted return: ${returnRecord.returnNumber}`,
      })

      return { success: true, message: 'Return deleted successfully' }
    } catch (error) {
      return handleIpcError('Delete return', error)
    }
  })
}
