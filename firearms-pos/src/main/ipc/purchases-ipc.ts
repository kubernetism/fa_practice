import { ipcMain } from 'electron'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  purchases,
  purchaseItems,
  inventory,
  products,
  suppliers,
  accountPayables,
  cashRegisterSessions,
  cashTransactions,
  type NewPurchase,
  type NewPurchaseItem,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generatePurchaseOrderNumber, type PaginationParams, type PaginatedResult } from '../utils/helpers'
import { withTransaction } from '../utils/db-transaction'
import { postPurchaseReceiveToGL } from '../utils/gl-posting'
import { addCostLayer } from '../utils/inventory-valuation'
import { checkReversible, reversePurchaseAndReenter } from '../utils/purchase-reversal'
import { recordPayableSubmission } from '../utils/payable-payment'

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
  paymentMethod: 'cash' | 'cheque' | 'pay_later'
}

export function registerPurchaseHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('purchases:create', async (_, data: CreatePurchaseData) => {
    try {
      const session = getCurrentSession()

      // --- Input validation ---
      if (!data.items || data.items.length === 0) {
        return { success: false, message: 'No items in purchase order' }
      }
      if (!Number.isInteger(data.supplierId) || data.supplierId <= 0) {
        return { success: false, message: 'Invalid supplier' }
      }
      if (!Number.isInteger(data.branchId) || data.branchId <= 0) {
        return { success: false, message: 'Invalid branch' }
      }
      const paymentMethod = data.paymentMethod || 'cash'
      if (!['cash', 'cheque', 'pay_later'].includes(paymentMethod)) {
        return { success: false, message: 'Invalid payment method' }
      }
      const shippingCost = data.shippingCost ?? 0
      if (!Number.isFinite(shippingCost) || shippingCost < 0) {
        return { success: false, message: 'Shipping cost must be zero or positive' }
      }
      for (let idx = 0; idx < data.items.length; idx++) {
        const item = data.items[idx]
        if (!Number.isInteger(item.productId) || item.productId <= 0) {
          return { success: false, message: `Item ${idx + 1}: invalid product` }
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          return { success: false, message: `Item ${idx + 1}: quantity must be a positive integer` }
        }
        if (!Number.isFinite(item.unitCost) || item.unitCost <= 0) {
          return { success: false, message: `Item ${idx + 1}: unit cost must be greater than zero` }
        }
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

      const totalAmount = subtotal + shippingCost

      const purchaseOrderNumber = generatePurchaseOrderNumber()

      // Payment is deferred to receive for cash/cheque (no cash drawer or GL
      // impact until goods are in hand). Pay-later stays pending until the
      // user settles the payable.
      const paymentStatus = 'pending' as const

      const purchase = await withTransaction(async ({ db: txDb }) => {
        const [created] = await txDb
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
            paymentMethod,
            paymentStatus,
            status: 'draft',
            expectedDeliveryDate: data.expectedDeliveryDate,
            notes: data.notes,
          })
          .returning()

        for (const item of purchaseItemsData) {
          await txDb.insert(purchaseItems).values({
            ...item,
            purchaseId: created.id,
          })
        }

        // Pay-later creates the payable up front so it shows in AP ageing.
        // Cash/cheque POs don't touch the ledger or drawer until receive.
        if (paymentMethod === 'pay_later') {
          await txDb.insert(accountPayables).values({
            supplierId: data.supplierId,
            purchaseId: created.id,
            branchId: data.branchId,
            invoiceNumber: purchaseOrderNumber,
            totalAmount,
            paidAmount: 0,
            remainingAmount: totalAmount,
            status: 'pending',
            notes: `Auto-generated from Purchase Order: ${purchaseOrderNumber}`,
            createdBy: session?.userId,
          })
        }

        return created
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'purchase',
        entityId: purchase.id,
        newValues: {
          purchaseOrderNumber,
          supplierId: data.supplierId,
          branchId: data.branchId,
          subtotal,
          shippingCost,
          totalAmount,
          itemCount: data.items.length,
          items: purchaseItemsData.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            totalCost: i.totalCost,
          })),
          paymentMethod,
          paymentStatus,
        },
        description: `Created purchase order: ${purchaseOrderNumber} (Payment: ${paymentMethod}, total: ${totalAmount.toFixed(2)})`,
      })

      return { success: true, data: purchase }
    } catch (error) {
      console.error('Create purchase error:', error)
      const message = error instanceof Error ? error.message : 'Failed to create purchase order'
      return { success: false, message }
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

        if (!Array.isArray(receivedItems) || receivedItems.length === 0) {
          return { success: false, message: 'No items to receive' }
        }

        // For cash POs we need an open cash session before mutating anything.
        let openCashSessionId: number | null = null
        if (purchase.paymentMethod === 'cash') {
          const today = new Date().toISOString().split('T')[0]
          const openSession = await db.query.cashRegisterSessions.findFirst({
            where: and(
              eq(cashRegisterSessions.branchId, purchase.branchId),
              eq(cashRegisterSessions.sessionDate, today),
              eq(cashRegisterSessions.status, 'open')
            ),
          })
          if (!openSession) {
            return {
              success: false,
              message: 'No open cash register session for this branch. Open a session before receiving a cash purchase.',
            }
          }
          openCashSessionId = openSession.id
        }

        // Execute all receive operations in a transaction
        const result = await withTransaction(async ({ db: txDb }) => {
          const receivedItemDetails: Array<{ unitCost: number; receivedQuantity: number; purchaseItemId: number }> = []

          // Validate every requested receipt up front so we fail before mutating state.
          for (let idx = 0; idx < receivedItems.length; idx++) {
            const item = receivedItems[idx]
            if (!Number.isInteger(item.itemId) || item.itemId <= 0) {
              throw new Error(`Receive item ${idx + 1}: invalid itemId`)
            }
            if (!Number.isInteger(item.receivedQuantity) || item.receivedQuantity <= 0) {
              throw new Error(`Receive item ${idx + 1}: receivedQuantity must be a positive integer`)
            }
            const purchaseItem = await txDb.query.purchaseItems.findFirst({
              where: eq(purchaseItems.id, item.itemId),
            })
            if (!purchaseItem) {
              throw new Error(`Receive item ${idx + 1}: purchase line not found`)
            }
            if (purchaseItem.purchaseId !== purchaseId) {
              throw new Error(`Receive item ${idx + 1}: line does not belong to this purchase`)
            }
            const projected = purchaseItem.receivedQuantity + item.receivedQuantity
            if (projected > purchaseItem.quantity) {
              throw new Error(
                `Receive item ${idx + 1}: would exceed ordered quantity (ordered ${purchaseItem.quantity}, already received ${purchaseItem.receivedQuantity}, requested ${item.receivedQuantity})`
              )
            }
          }

          // Update received quantities and add to inventory
          for (const item of receivedItems) {
            const purchaseItem = await txDb.query.purchaseItems.findFirst({
              where: eq(purchaseItems.id, item.itemId),
            })

            if (!purchaseItem) continue

            // Update purchase item
            await txDb
              .update(purchaseItems)
              .set({
                receivedQuantity: sql`${purchaseItems.receivedQuantity} + ${item.receivedQuantity}`,
              })
              .where(eq(purchaseItems.id, item.itemId))

            // Add to inventory
            const existingInventory = await txDb.query.inventory.findFirst({
              where: and(eq(inventory.productId, purchaseItem.productId), eq(inventory.branchId, purchase.branchId)),
            })

            if (existingInventory) {
              await txDb
                .update(inventory)
                .set({
                  quantity: sql`${inventory.quantity} + ${item.receivedQuantity}`,
                  lastRestockDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(inventory.id, existingInventory.id))
            } else {
              await txDb.insert(inventory).values({
                productId: purchaseItem.productId,
                branchId: purchase.branchId,
                quantity: item.receivedQuantity,
                lastRestockDate: new Date().toISOString(),
              })
            }

            // Create cost layer for FIFO tracking (instead of overwriting product.costPrice)
            await addCostLayer({
              productId: purchaseItem.productId,
              branchId: purchase.branchId,
              purchaseItemId: purchaseItem.id,
              quantity: item.receivedQuantity,
              unitCost: purchaseItem.unitCost,
              receivedDate: new Date().toISOString(),
            })

            receivedItemDetails.push({
              unitCost: purchaseItem.unitCost,
              receivedQuantity: item.receivedQuantity,
              purchaseItemId: purchaseItem.id,
            })

            // NOTE: We intentionally DO NOT update products.costPrice here anymore
            // The FIFO cost layers handle cost tracking properly
          }

          // Check if all items are received
          const allItems = await txDb.query.purchaseItems.findMany({
            where: eq(purchaseItems.purchaseId, purchaseId),
          })

          const allReceived = allItems.every((item) => item.receivedQuantity >= item.quantity)
          const partiallyReceived = allItems.some((item) => item.receivedQuantity > 0)

          const newStatus = allReceived ? 'received' : partiallyReceived ? 'partial' : purchase.status

          // Cash/cheque POs settle on final receive; pay_later settles via pay-off.
          const newPaymentStatus =
            allReceived && (purchase.paymentMethod === 'cash' || purchase.paymentMethod === 'cheque')
              ? 'paid'
              : purchase.paymentStatus

          await txDb
            .update(purchases)
            .set({
              status: newStatus,
              paymentStatus: newPaymentStatus,
              receivedDate: allReceived ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(purchases.id, purchaseId))

          // Shipping is allocated in full on the final receive so the cumulative
          // GL/Cash outflow equals purchase.totalAmount exactly, no rounding drift.
          const shippingAllocation = allReceived ? purchase.shippingCost : 0

          // Post to General Ledger
          let journalEntryId: number | null = null
          if (receivedItemDetails.length > 0) {
            journalEntryId = await postPurchaseReceiveToGL(
              { ...purchase, paymentStatus: newPaymentStatus },
              receivedItemDetails,
              session?.userId ?? 0,
              shippingAllocation
            )
          }

          // Debit the physical cash drawer for cash POs so the register balance
          // tracks the GL cash account in real time.
          if (purchase.paymentMethod === 'cash' && openCashSessionId !== null) {
            const itemsValue = receivedItemDetails.reduce(
              (sum, i) => sum + i.unitCost * i.receivedQuantity,
              0
            )
            const cashOutflow = itemsValue + shippingAllocation
            if (cashOutflow > 0) {
              await txDb.insert(cashTransactions).values({
                sessionId: openCashSessionId,
                branchId: purchase.branchId,
                transactionType: 'ap_payment',
                amount: -cashOutflow,
                referenceType: 'purchase',
                referenceId: purchase.id,
                description: `Cash purchase receive: ${purchase.purchaseOrderNumber}`,
                recordedBy: session?.userId ?? 0,
              })
            }
          }

          return { newStatus, newPaymentStatus, receivedItemDetails, journalEntryId, shippingAllocation }
        })

        const itemsValue = result.receivedItemDetails.reduce(
          (sum, i) => sum + i.unitCost * i.receivedQuantity,
          0
        )

        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: 'update',
          entityType: 'purchase',
          entityId: purchaseId,
          oldValues: {
            status: purchase.status,
            paymentStatus: purchase.paymentStatus,
          },
          newValues: {
            status: result.newStatus,
            paymentStatus: result.newPaymentStatus,
            receivedLineCount: receivedItems.length,
            itemsValue,
            shippingAllocated: result.shippingAllocation,
            totalPosted: itemsValue + result.shippingAllocation,
            paymentMethod: purchase.paymentMethod,
            journalEntryId: result.journalEntryId,
          },
          description: `Received items for purchase: ${purchase.purchaseOrderNumber} (posted ${(itemsValue + result.shippingAllocation).toFixed(2)})`,
        })

        return { success: true, message: 'Items received successfully' }
      } catch (error) {
        console.error('Receive purchase error:', error)
        const message = error instanceof Error ? error.message : 'Failed to receive items'
        return { success: false, message }
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

  // Pay off a purchase (for Pay Later purchases)
  ipcMain.handle(
    'purchases:pay-off',
    async (
      _,
      purchaseId: number,
      paymentData: {
        paymentMethod: 'cash' | 'cheque' | 'bank_transfer'
        referenceNumber?: string
        notes?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.id, purchaseId),
        })

        if (!purchase) {
          return { success: false, message: 'Purchase order not found' }
        }

        if (purchase.paymentStatus === 'paid') {
          return { success: false, message: 'Purchase is already paid' }
        }

        if (!['cash', 'cheque', 'bank_transfer'].includes(paymentData.paymentMethod)) {
          return { success: false, message: 'Invalid payment method' }
        }

        // For cash pay-offs we require an open cash session up front so the
        // pay-off never silently skips the cash-drawer debit.
        let openCashSessionId: number | null = null
        if (paymentData.paymentMethod === 'cash') {
          const today = new Date().toISOString().split('T')[0]
          const openSession = await db.query.cashRegisterSessions.findFirst({
            where: and(
              eq(cashRegisterSessions.branchId, purchase.branchId),
              eq(cashRegisterSessions.sessionDate, today),
              eq(cashRegisterSessions.status, 'open')
            ),
          })
          if (!openSession) {
            return {
              success: false,
              message: 'No open cash register session for this branch. Open a session before paying in cash.',
            }
          }
          openCashSessionId = openSession.id
        }

        const { paidAmount, healed } = await withTransaction(async ({ db: txDb }) => {
          let payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.purchaseId, purchaseId),
          })

          let healed = false
          if (!payable) {
            const [created] = await txDb
              .insert(accountPayables)
              .values({
                supplierId: purchase.supplierId,
                purchaseId: purchase.id,
                branchId: purchase.branchId,
                invoiceNumber: purchase.purchaseOrderNumber,
                totalAmount: purchase.totalAmount,
                paidAmount: 0,
                remainingAmount: purchase.totalAmount,
                status: 'pending',
                notes: `Auto-healed during pay-off (orphan payable) for ${purchase.purchaseOrderNumber}`,
                createdBy: session?.userId,
              })
              .returning()
            payable = created
            healed = true
          }

          if (payable.remainingAmount <= 0) {
            throw new Error('Payable has no outstanding amount')
          }

          const amount = payable.remainingAmount
          const submission = await recordPayableSubmission(
            txDb,
            payable,
            {
              payableId: payable.id,
              amount,
              paymentMethod: paymentData.paymentMethod,
              referenceNumber: paymentData.referenceNumber,
              notes: paymentData.notes || `Payment for Purchase: ${purchase.purchaseOrderNumber}`,
            },
            { userId: session?.userId ?? 0, branchId: purchase.branchId },
            openCashSessionId
          )

          // Flip the purchase LAST so any earlier failure rolls everything back.
          await txDb
            .update(purchases)
            .set({ paymentStatus: 'paid', updatedAt: new Date().toISOString() })
            .where(eq(purchases.id, purchaseId))

          return { paidAmount: submission.payment.amount, healed }
        })

        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: 'update',
          entityType: 'purchase',
          entityId: purchaseId,
          oldValues: { paymentStatus: purchase.paymentStatus },
          newValues: {
            paymentStatus: 'paid',
            paymentMethod: paymentData.paymentMethod,
            paidAmount,
            referenceNumber: paymentData.referenceNumber,
          },
          description: `Paid off purchase order: ${purchase.purchaseOrderNumber} (${paidAmount.toFixed(2)} ${paymentData.paymentMethod})`,
        })

        if (healed) {
          await createAuditLog({
            userId: session?.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'account_payable',
            entityId: 0,
            description: `Healed orphan payable for purchase ${purchase.purchaseOrderNumber} during pay-off (${paidAmount.toFixed(2)})`,
          })
        }

        return { success: true, message: 'Purchase paid off successfully' }
      } catch (error) {
        console.error('Pay off purchase error:', error)
        const message = error instanceof Error ? error.message : 'Failed to pay off purchase'
        return { success: false, message }
      }
    }
  )

  ipcMain.handle(
    'purchases:record-partial-payment',
    async (
      _,
      purchaseId: number,
      paymentData: {
        amount: number
        paymentMethod: 'cash' | 'cheque' | 'bank_transfer'
        referenceNumber?: string
        notes?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        if (!Number.isFinite(paymentData.amount) || paymentData.amount <= 0) {
          return { success: false, message: 'Payment amount must be greater than 0' }
        }
        if (!['cash', 'cheque', 'bank_transfer'].includes(paymentData.paymentMethod)) {
          return { success: false, message: 'Invalid payment method' }
        }

        const purchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchaseId) })
        if (!purchase) return { success: false, message: 'Purchase order not found' }
        if (purchase.paymentStatus === 'paid') {
          return { success: false, message: 'Purchase is already paid' }
        }

        let openCashSessionId: number | null = null
        if (paymentData.paymentMethod === 'cash') {
          const today = new Date().toISOString().split('T')[0]
          const openSession = await db.query.cashRegisterSessions.findFirst({
            where: and(
              eq(cashRegisterSessions.branchId, purchase.branchId),
              eq(cashRegisterSessions.sessionDate, today),
              eq(cashRegisterSessions.status, 'open')
            ),
          })
          if (!openSession) {
            return {
              success: false,
              message: 'No open cash register session for this branch. Open a session before paying in cash.',
            }
          }
          openCashSessionId = openSession.id
        }

        const result = await withTransaction(async ({ db: txDb }) => {
          let payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.purchaseId, purchaseId),
          })
          let healed = false
          if (!payable) {
            const [created] = await txDb
              .insert(accountPayables)
              .values({
                supplierId: purchase.supplierId,
                purchaseId: purchase.id,
                branchId: purchase.branchId,
                invoiceNumber: purchase.purchaseOrderNumber,
                totalAmount: purchase.totalAmount,
                paidAmount: 0,
                remainingAmount: purchase.totalAmount,
                status: 'pending',
                notes: `Auto-healed during partial payment (orphan payable) for ${purchase.purchaseOrderNumber}`,
                createdBy: session?.userId,
              })
              .returning()
            payable = created
            healed = true
          }

          const submission = await recordPayableSubmission(
            txDb,
            payable,
            {
              payableId: payable.id,
              amount: paymentData.amount,
              paymentMethod: paymentData.paymentMethod,
              referenceNumber: paymentData.referenceNumber,
              notes: paymentData.notes || `Partial payment for Purchase: ${purchase.purchaseOrderNumber}`,
            },
            { userId: session?.userId ?? 0, branchId: purchase.branchId },
            openCashSessionId
          )

          return { submission, healed }
        })

        if (result.healed) {
          await createAuditLog({
            userId: session?.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'account_payable',
            entityId: 0,
            description: `Healed orphan payable for purchase ${purchase.purchaseOrderNumber} during partial payment`,
          })
        }

        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: 'payment',
          entityType: 'purchase',
          entityId: purchaseId,
          newValues: {
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            newStatus: result.submission.newStatus,
          },
          description: `Recorded partial payment of ${paymentData.amount} on ${purchase.purchaseOrderNumber}`,
        })

        return { success: true, message: 'Partial payment recorded' }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to record partial payment'
        return { success: false, message }
      }
    }
  )

  ipcMain.handle('purchases:reconcile-with-payables', async () => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }
      if (session.role !== 'admin') return { success: false, message: 'Admin access required' }

      const created: Array<{ purchaseId: number; purchaseOrderNumber: string }> = []
      const synced: Array<{ purchaseId: number; purchaseOrderNumber: string; oldStatus: string; newStatus: string }> = []
      const flagged: Array<{ purchaseId: number; purchaseOrderNumber: string; remaining: number }> = []

      const allPurchases = await db.query.purchases.findMany()
      for (const purchase of allPurchases) {
        if (purchase.status === 'cancelled' || purchase.status === 'reversed') continue

        const payable = await db.query.accountPayables.findFirst({
          where: eq(accountPayables.purchaseId, purchase.id),
        })

        if (!payable) {
          if (purchase.paymentMethod === 'pay_later' && purchase.paymentStatus !== 'paid') {
            await db.insert(accountPayables).values({
              supplierId: purchase.supplierId,
              purchaseId: purchase.id,
              branchId: purchase.branchId,
              invoiceNumber: purchase.purchaseOrderNumber,
              totalAmount: purchase.totalAmount,
              paidAmount: 0,
              remainingAmount: purchase.totalAmount,
              status: 'pending',
              notes: `Auto-created by reconcile for ${purchase.purchaseOrderNumber}`,
              createdBy: session.userId,
            })
            created.push({ purchaseId: purchase.id, purchaseOrderNumber: purchase.purchaseOrderNumber })
            await createAuditLog({
              userId: session.userId,
              branchId: purchase.branchId,
              action: 'update',
              entityType: 'account_payable',
              entityId: 0,
              description: `Reconciled payable for purchase ${purchase.purchaseOrderNumber}: created missing AP row`,
            })
          }
          continue
        }

        const apStatus: 'pending' | 'partial' | 'paid' =
          payable.status === 'paid' || payable.status === 'partial' || payable.status === 'pending'
            ? payable.status
            : 'pending'

        if (purchase.paymentStatus === 'paid' && payable.remainingAmount > 0) {
          flagged.push({
            purchaseId: purchase.id,
            purchaseOrderNumber: purchase.purchaseOrderNumber,
            remaining: payable.remainingAmount,
          })
          await createAuditLog({
            userId: session.userId,
            branchId: purchase.branchId,
            action: 'flag',
            entityType: 'purchase',
            entityId: purchase.id,
            description: `Flagged purchase ${purchase.purchaseOrderNumber} for manual review: paid in Purchases but AP has remaining ${payable.remainingAmount.toFixed(2)}`,
          })
          continue
        }

        if (purchase.paymentStatus !== apStatus) {
          await db
            .update(purchases)
            .set({ paymentStatus: apStatus, updatedAt: new Date().toISOString() })
            .where(eq(purchases.id, purchase.id))
          synced.push({
            purchaseId: purchase.id,
            purchaseOrderNumber: purchase.purchaseOrderNumber,
            oldStatus: purchase.paymentStatus,
            newStatus: apStatus,
          })
          await createAuditLog({
            userId: session.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'purchase',
            entityId: purchase.id,
            oldValues: { paymentStatus: purchase.paymentStatus },
            newValues: { paymentStatus: apStatus },
            description: `Reconciled purchase ${purchase.purchaseOrderNumber}: synced paymentStatus ${purchase.paymentStatus} → ${apStatus}`,
          })
        }
      }

      return { success: true, created, synced, flagged }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reconcile'
      return { success: false, message }
    }
  })

  ipcMain.handle('purchases:check-reversible', async (_, purchaseId: number) => {
    const session = getCurrentSession()
    if (!session) {
      return { allowed: false, blockers: ['Not authenticated.'] }
    }
    return checkReversible(purchaseId, {
      userId: session.userId,
      role: session.role,
      branchId: session.branchId,
    })
  })

  ipcMain.handle(
    'purchases:reverse-and-reenter',
    async (_, purchaseId: number, reason: string) => {
      const session = getCurrentSession()
      if (!session) {
        return { success: false, error: 'Not authenticated.' }
      }
      return reversePurchaseAndReenter(purchaseId, reason, {
        userId: session.userId,
        role: session.role,
        branchId: session.branchId,
      })
    }
  )
}
