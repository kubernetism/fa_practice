import { ipcMain } from 'electron'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  purchases,
  purchaseItems,
  inventory,
  products,
  suppliers,
  type NewPurchase,
  type NewPurchaseItem,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generatePurchaseOrderNumber, type PaginationParams, type PaginatedResult } from '../utils/helpers'

interface PurchaseItemData {
  productId: number
  quantity: number
  unitCost: number
}

interface CreatePurchaseData {
  supplierId: number
  branchId: number
  items: PurchaseItemData[]
  shippingCost?: number
  expectedDeliveryDate?: string
  notes?: string
}

export function registerPurchaseHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('purchases:create', async (_, data: CreatePurchaseData) => {
    try {
      const session = getCurrentSession()

      if (!data.items || data.items.length === 0) {
        return { success: false, message: 'No items in purchase order' }
      }

      // Calculate totals
      let subtotal = 0
      const purchaseItemsData: Omit<NewPurchaseItem, 'purchaseId'>[] = []

      for (const item of data.items) {
        const totalCost = item.unitCost * item.quantity
        subtotal += totalCost

        purchaseItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          receivedQuantity: 0,
          totalCost,
        })
      }

      const shippingCost = data.shippingCost || 0
      const totalAmount = subtotal + shippingCost

      const purchaseOrderNumber = generatePurchaseOrderNumber()

      const [purchase] = await db
        .insert(purchases)
        .values({
          purchaseOrderNumber,
          supplierId: data.supplierId,
          branchId: data.branchId,
          userId: session?.userId ?? 0,
          subtotal,
          taxAmount: 0,
          shippingCost,
          totalAmount,
          paymentStatus: 'pending',
          status: 'draft',
          expectedDeliveryDate: data.expectedDeliveryDate,
          notes: data.notes,
        })
        .returning()

      for (const item of purchaseItemsData) {
        await db.insert(purchaseItems).values({
          ...item,
          purchaseId: purchase.id,
        })
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'purchase',
        entityId: purchase.id,
        newValues: {
          purchaseOrderNumber,
          totalAmount,
          itemCount: data.items.length,
        },
        description: `Created purchase order: ${purchaseOrderNumber}`,
      })

      return { success: true, data: purchase }
    } catch (error) {
      console.error('Create purchase error:', error)
      return { success: false, message: 'Failed to create purchase order' }
    }
  })

  ipcMain.handle(
    'purchases:get-all',
    async (_, params: PaginationParams & { branchId?: number; supplierId?: number; status?: string }) => {
      try {
        const { page = 1, limit = 20, sortOrder = 'desc', branchId, supplierId, status } = params

        const conditions = []

        if (branchId) conditions.push(eq(purchases.branchId, branchId))
        if (supplierId) conditions.push(eq(purchases.supplierId, supplierId))
        if (status)
          conditions.push(eq(purchases.status, status as 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled'))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(purchases).where(whereClause)

        const total = countResult[0].count

        const data = await db.query.purchases.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(purchases.createdAt) : purchases.createdAt,
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
        console.error('Get purchases error:', error)
        return { success: false, message: 'Failed to fetch purchases' }
      }
    }
  )

  ipcMain.handle('purchases:get-by-id', async (_, id: number) => {
    try {
      const purchase = await db.query.purchases.findFirst({
        where: eq(purchases.id, id),
      })

      if (!purchase) {
        return { success: false, message: 'Purchase order not found' }
      }

      const items = await db
        .select({
          purchaseItem: purchaseItems,
          product: products,
        })
        .from(purchaseItems)
        .innerJoin(products, eq(purchaseItems.productId, products.id))
        .where(eq(purchaseItems.purchaseId, id))

      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, purchase.supplierId),
      })

      return {
        success: true,
        data: {
          ...purchase,
          items: items.map((i) => ({ ...i.purchaseItem, product: i.product })),
          supplier,
        },
      }
    } catch (error) {
      console.error('Get purchase error:', error)
      return { success: false, message: 'Failed to fetch purchase order' }
    }
  })

  ipcMain.handle(
    'purchases:receive',
    async (_, purchaseId: number, receivedItems: { itemId: number; receivedQuantity: number }[]) => {
      try {
        const session = getCurrentSession()

        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.id, purchaseId),
        })

        if (!purchase) {
          return { success: false, message: 'Purchase order not found' }
        }

        if (purchase.status === 'received' || purchase.status === 'cancelled') {
          return { success: false, message: 'Cannot receive items for this purchase order' }
        }

        // Update received quantities and add to inventory
        for (const item of receivedItems) {
          const purchaseItem = await db.query.purchaseItems.findFirst({
            where: eq(purchaseItems.id, item.itemId),
          })

          if (!purchaseItem) continue

          // Update purchase item
          await db
            .update(purchaseItems)
            .set({
              receivedQuantity: sql`${purchaseItems.receivedQuantity} + ${item.receivedQuantity}`,
            })
            .where(eq(purchaseItems.id, item.itemId))

          // Add to inventory
          const existingInventory = await db.query.inventory.findFirst({
            where: and(eq(inventory.productId, purchaseItem.productId), eq(inventory.branchId, purchase.branchId)),
          })

          if (existingInventory) {
            await db
              .update(inventory)
              .set({
                quantity: sql`${inventory.quantity} + ${item.receivedQuantity}`,
                lastRestockDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .where(eq(inventory.id, existingInventory.id))
          } else {
            await db.insert(inventory).values({
              productId: purchaseItem.productId,
              branchId: purchase.branchId,
              quantity: item.receivedQuantity,
              lastRestockDate: new Date().toISOString(),
            })
          }

          // Update product cost price if needed
          await db
            .update(products)
            .set({
              costPrice: purchaseItem.unitCost,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, purchaseItem.productId))
        }

        // Check if all items are received
        const allItems = await db.query.purchaseItems.findMany({
          where: eq(purchaseItems.purchaseId, purchaseId),
        })

        const allReceived = allItems.every((item) => item.receivedQuantity >= item.quantity)
        const partiallyReceived = allItems.some((item) => item.receivedQuantity > 0)

        const newStatus = allReceived ? 'received' : partiallyReceived ? 'partial' : purchase.status

        await db
          .update(purchases)
          .set({
            status: newStatus,
            receivedDate: allReceived ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(purchases.id, purchaseId))

        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: 'update',
          entityType: 'purchase',
          entityId: purchaseId,
          newValues: {
            status: newStatus,
            receivedItems: receivedItems.length,
          },
          description: `Received items for purchase: ${purchase.purchaseOrderNumber}`,
        })

        return { success: true, message: 'Items received successfully' }
      } catch (error) {
        console.error('Receive purchase error:', error)
        return { success: false, message: 'Failed to receive items' }
      }
    }
  )

  ipcMain.handle('purchases:update-status', async (_, id: number, status: string) => {
    try {
      const session = getCurrentSession()

      const purchase = await db.query.purchases.findFirst({
        where: eq(purchases.id, id),
      })

      if (!purchase) {
        return { success: false, message: 'Purchase order not found' }
      }

      await db
        .update(purchases)
        .set({
          status: status as 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(purchases.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: purchase.branchId,
        action: 'update',
        entityType: 'purchase',
        entityId: id,
        oldValues: { status: purchase.status },
        newValues: { status },
        description: `Updated purchase status: ${purchase.purchaseOrderNumber}`,
      })

      return { success: true, message: 'Status updated successfully' }
    } catch (error) {
      console.error('Update purchase status error:', error)
      return { success: false, message: 'Failed to update status' }
    }
  })
}
