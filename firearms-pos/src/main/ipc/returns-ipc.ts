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
  type NewReturn,
  type NewReturnItem,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateReturnNumber, type PaginationParams, type PaginatedResult } from '../utils/helpers'

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

      // Calculate totals
      let subtotal = 0
      let taxAmount = 0
      const returnItemsData: Omit<NewReturnItem, 'returnId'>[] = []

      for (const item of data.items) {
        const totalPrice = item.unitPrice * item.quantity
        subtotal += totalPrice

        // Get original sale item for tax calculation
        const originalItem = await db.query.saleItems.findFirst({
          where: eq(saleItems.id, item.saleItemId),
        })

        if (originalItem) {
          const itemTax = (originalItem.taxAmount / originalItem.quantity) * item.quantity
          taxAmount += itemTax
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
        })
      }

      const totalAmount = subtotal + taxAmount
      const returnNumber = generateReturnNumber()

      const [returnRecord] = await db
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

      // Create return items
      for (const item of returnItemsData) {
        await db.insert(returnItems).values({
          ...item,
          returnId: returnRecord.id,
        })
      }

      // Restock items if applicable
      for (const item of data.items) {
        if (item.restockable) {
          const existingInventory = await db.query.inventory.findFirst({
            where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, data.branchId)),
          })

          if (existingInventory) {
            await db
              .update(inventory)
              .set({
                quantity: sql`${inventory.quantity} + ${item.quantity}`,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(inventory.id, existingInventory.id))
          } else {
            await db.insert(inventory).values({
              productId: item.productId,
              branchId: data.branchId,
              quantity: item.quantity,
            })
          }
        }
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'refund',
        entityType: 'return',
        entityId: returnRecord.id,
        newValues: {
          returnNumber,
          originalSaleId: data.originalSaleId,
          totalAmount,
          itemCount: data.items.length,
        },
        description: `Created return: ${returnNumber}`,
      })

      return { success: true, data: returnRecord }
    } catch (error) {
      console.error('Create return error:', error)
      return { success: false, message: 'Failed to create return' }
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
        console.error('Get returns error:', error)
        return { success: false, message: 'Failed to fetch returns' }
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
      console.error('Get return error:', error)
      return { success: false, message: 'Failed to fetch return' }
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

      // Reverse inventory changes for restockable items
      for (const item of items) {
        const existingInventory = await db.query.inventory.findFirst({
          where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, returnRecord.branchId)),
        })

        if (existingInventory && item.restockable) {
          await db
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} - ${item.quantity}`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(inventory.id, existingInventory.id))
        }
      }

      // Delete return items first
      await db.delete(returnItems).where(eq(returnItems.returnId, id))

      // Delete the return record
      await db.delete(returns).where(eq(returns.id, id))

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
      console.error('Delete return error:', error)
      return { success: false, message: 'Failed to delete return' }
    }
  })
}
