import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  salePayments,
  inventory,
  products,
  customers,
  commissions,
  accountReceivables,
  expenses,
  type NewSale,
  type NewSaleItem,
  type NewSalePayment,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateInvoiceNumber, isLicenseExpired, type PaginationParams, type PaginatedResult } from '../utils/helpers'
import { withTransaction } from '../utils/db-transaction'
import { postSaleToGL, postVoidSaleToGL } from '../utils/gl-posting'
import { consumeCostLayersFIFO, restoreCostLayers } from '../utils/inventory-valuation'

interface CartItem {
  productId: number
  quantity: number
  unitPrice: number
  costPrice: number
  serialNumber?: string
  discountPercent?: number
  taxRate?: number
}

interface PaymentBreakdownItem {
  method: 'cash' | 'card' | 'debit_card' | 'mobile' | 'cheque' | 'bank_transfer'
  amount: number
  referenceNumber?: string
}

interface CreateSaleData {
  customerId?: number
  branchId: number
  items: CartItem[]
  paymentMethod: 'cash' | 'card' | 'credit' | 'mixed' | 'mobile' | 'cod' | 'receivable'
  paymentStatus?: 'paid' | 'partial' | 'pending'
  amountPaid: number
  discountAmount?: number
  codCharges?: number
  codName?: string
  codPhone?: string
  codAddress?: string
  codCity?: string
  // Mobile payment fields
  mobileProvider?: 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay' | 'other'
  mobileReceiverPhone?: string
  mobileSenderPhone?: string
  mobileTransactionId?: string
  // Card payment fields
  cardHolderName?: string
  cardLastFourDigits?: string
  notes?: string
  payments?: PaymentBreakdownItem[] // For mixed/split payments
}

export function registerSalesHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('sales:create', async (_, data: CreateSaleData) => {
    try {
      const session = getCurrentSession()

      // Validate items
      if (!data.items || data.items.length === 0) {
        return { success: false, message: 'No items in cart' }
      }

      // Pre-validation (outside transaction for faster feedback)
      for (const item of data.items) {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        })

        if (product?.isSerialTracked && !item.serialNumber) {
          return {
            success: false,
            message: `Serial number required for ${product.name}`,
          }
        }

        // Check stock
        const stock = await db.query.inventory.findFirst({
          where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, data.branchId)),
        })

        if (!stock || stock.quantity < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for ${product?.name}`,
          }
        }
      }

      // If customer provided, validate license for firearms
      if (data.customerId) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, data.customerId),
        })

        for (const item of data.items) {
          const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
          })

          if (product?.isSerialTracked) {
            if (!customer?.firearmLicenseNumber) {
              return {
                success: false,
                message: 'Customer does not have a firearm license',
              }
            }
            if (isLicenseExpired(customer.licenseExpiryDate)) {
              return {
                success: false,
                message: 'Customer firearm license has expired',
              }
            }
          }
        }
      }

      // Execute all database operations in a transaction
      const result = await withTransaction(async ({ db: txDb }) => {
        // Calculate totals with FIFO cost pricing
        let subtotal = 0
        let taxAmount = 0
        const saleItemsData: Array<Omit<NewSaleItem, 'saleId'> & { fifoCost: number }> = []

        for (const item of data.items) {
          // Get actual FIFO cost for this item
          const fifoResult = await consumeCostLayersFIFO(
            item.productId,
            data.branchId,
            item.quantity
          )

          // Calculate cost per unit from FIFO
          const actualCostPerUnit = item.quantity > 0
            ? fifoResult.totalCost / item.quantity
            : item.costPrice

          const itemSubtotal = item.unitPrice * item.quantity
          const itemDiscount = itemSubtotal * ((item.discountPercent || 0) / 100)
          const itemTaxable = itemSubtotal - itemDiscount
          const itemTax = itemTaxable * ((item.taxRate || 0) / 100)
          const itemTotal = itemTaxable + itemTax

          subtotal += itemSubtotal
          taxAmount += itemTax

          saleItemsData.push({
            productId: item.productId,
            serialNumber: item.serialNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: actualCostPerUnit, // Use FIFO cost instead of frontend cost
            discountPercent: item.discountPercent || 0,
            discountAmount: itemDiscount,
            taxAmount: itemTax,
            totalPrice: itemTotal,
            fifoCost: fifoResult.totalCost, // Track total FIFO cost for GL posting
          })
        }

        const discountAmount = data.discountAmount || 0
        const codCharges = data.codCharges || 0
        const totalAmount = subtotal + taxAmount - discountAmount + (data.paymentMethod === 'cod' ? codCharges : 0)
        const changeGiven = data.amountPaid > totalAmount ? data.amountPaid - totalAmount : 0
        const paymentStatus = data.paymentStatus || (data.amountPaid >= totalAmount ? 'paid' : data.amountPaid > 0 ? 'partial' : 'pending')

        const invoiceNumber = generateInvoiceNumber()
        const outstandingAmount = totalAmount - data.amountPaid

        // 1. Create sale
        const [sale] = await txDb
          .insert(sales)
          .values({
            invoiceNumber,
            customerId: data.customerId,
            branchId: data.branchId,
            userId: session?.userId ?? 0,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            paymentMethod: data.paymentMethod,
            paymentStatus,
            amountPaid: data.amountPaid,
            changeGiven,
            notes: data.notes,
          })
          .returning()

        // 2. Create sale items (without fifoCost field, which is just for our tracking)
        const createdSaleItems: Array<{ costPrice: number; quantity: number }> = []
        for (const item of saleItemsData) {
          const { fifoCost, ...itemData } = item
          await txDb.insert(saleItems).values({
            ...itemData,
            saleId: sale.id,
          })
          createdSaleItems.push({ costPrice: item.costPrice, quantity: item.quantity })
        }

        // 3. Deduct inventory
        for (const item of data.items) {
          await txDb
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} - ${item.quantity}`,
              updatedAt: new Date().toISOString(),
            })
            .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, data.branchId)))
        }

        // 4. Create commission if applicable (2% of subtotal)
        if (session?.userId) {
          const commissionRate = 2
          const commissionAmount = subtotal * (commissionRate / 100)

          await txDb.insert(commissions).values({
            saleId: sale.id,
            userId: session.userId,
            branchId: data.branchId,
            commissionType: 'sale',
            baseAmount: subtotal,
            rate: commissionRate,
            commissionAmount,
            status: 'pending',
          })
        }

        // 5. Create account receivable if there's an outstanding balance
        if (outstandingAmount > 0 && data.customerId) {
          await txDb.insert(accountReceivables).values({
            customerId: data.customerId,
            saleId: sale.id,
            branchId: data.branchId,
            invoiceNumber,
            totalAmount: outstandingAmount,
            paidAmount: 0,
            remainingAmount: outstandingAmount,
            status: 'pending',
            createdBy: session?.userId,
          })
        }

        // 6. Create expense entry for COD charges
        if (data.paymentMethod === 'cod' && codCharges > 0) {
          await txDb.insert(expenses).values({
            branchId: data.branchId,
            userId: session?.userId ?? 0,
            category: 'other',
            amount: codCharges,
            description: `COD Delivery Charges for Invoice: ${invoiceNumber}. Customer: ${data.codName || 'N/A'}, Phone: ${data.codPhone || 'N/A'}`,
            paymentMethod: 'cash',
            reference: invoiceNumber,
            paymentStatus: 'unpaid',
          })
        }

        // 7. Create payment records for payment breakdown tracking
        const paymentRecords: PaymentBreakdownItem[] = []
        if (data.payments && data.payments.length > 0) {
          // Use provided payment breakdown (mixed payments)
          for (const payment of data.payments) {
            await txDb.insert(salePayments).values({
              saleId: sale.id,
              paymentMethod: payment.method,
              amount: payment.amount,
              referenceNumber: payment.referenceNumber,
            })
            paymentRecords.push(payment)
          }
        } else if (data.amountPaid > 0 && data.paymentMethod !== 'receivable') {
          // Single payment - create a record for consistency
          // Use net amount (excluding change given) for GL posting
          const netPaymentAmount = Math.min(data.amountPaid, totalAmount)
          const method = data.paymentMethod === 'card' ? 'card'
            : data.paymentMethod === 'mobile' ? 'mobile'
            : data.paymentMethod === 'cod' ? 'cash'
            : 'cash'

          // Build reference and notes for mobile/card payments
          let referenceNumber: string | undefined
          let paymentNotes: string | undefined

          if (data.paymentMethod === 'mobile' && data.mobileTransactionId) {
            referenceNumber = data.mobileTransactionId
            const providerLabels: Record<string, string> = {
              jazzcash: 'JazzCash',
              easypaisa: 'Easypaisa',
              nayapay: 'NayaPay',
              sadapay: 'SadaPay',
              other: 'Other',
            }
            paymentNotes = `Provider: ${providerLabels[data.mobileProvider || 'other']} | To: ${data.mobileReceiverPhone} | From: ${data.mobileSenderPhone}`
          } else if (data.paymentMethod === 'card' && data.cardLastFourDigits) {
            referenceNumber = `****${data.cardLastFourDigits}`
            paymentNotes = `Card Holder: ${data.cardHolderName || 'N/A'}`
          }

          await txDb.insert(salePayments).values({
            saleId: sale.id,
            paymentMethod: method,
            amount: netPaymentAmount,
            referenceNumber,
            notes: paymentNotes,
          })
          paymentRecords.push({ method, amount: netPaymentAmount, referenceNumber })
        }

        // 8. Post to General Ledger (automated GL posting with payment breakdown)
        await postSaleToGL(sale, createdSaleItems, session?.userId ?? 0, paymentRecords, data.paymentMethod === 'cod' ? codCharges : 0)

        return { sale, invoiceNumber, subtotal, discountAmount, taxAmount, totalAmount, paymentStatus }
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'sale',
        entityId: result.sale.id,
        newValues: {
          invoiceNumber: result.invoiceNumber,
          subtotal: result.subtotal,
          discountAmount: result.discountAmount,
          taxAmount: result.taxAmount,
          totalAmount: result.totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus: result.paymentStatus,
          amountPaid: data.amountPaid,
          itemCount: data.items.length,
        },
        description: `Created sale: ${result.invoiceNumber}${result.discountAmount > 0 ? ` (Discount: ${result.discountAmount})` : ''}`,
      })

      return { success: true, data: result.sale }
    } catch (error) {
      console.error('Create sale error:', error)
      // Provide more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create sale'
      return { success: false, message: errorMessage }
    }
  })

  ipcMain.handle(
    'sales:get-all',
    async (
      _,
      params: PaginationParams & {
        branchId?: number
        customerId?: number
        startDate?: string
        endDate?: string
        paymentStatus?: string
      }
    ) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = 'saleDate',
          sortOrder = 'desc',
          branchId,
          customerId,
          startDate,
          endDate,
          paymentStatus,
        } = params

        const conditions = []

        if (branchId) conditions.push(eq(sales.branchId, branchId))
        if (customerId) conditions.push(eq(sales.customerId, customerId))
        if (paymentStatus) conditions.push(eq(sales.paymentStatus, paymentStatus as 'paid' | 'partial' | 'pending'))
        if (startDate && endDate) {
          conditions.push(between(sales.saleDate, startDate, endDate))
        } else if (startDate) {
          conditions.push(gte(sales.saleDate, startDate))
        } else if (endDate) {
          conditions.push(lte(sales.saleDate, endDate))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(sales).where(whereClause)

        const total = countResult[0].count

        const data = await db.query.sales.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(sales.saleDate) : sales.saleDate,
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
        console.error('Get sales error:', error)
        return { success: false, message: 'Failed to fetch sales' }
      }
    }
  )

  ipcMain.handle('sales:get-by-id', async (_, id: number) => {
    try {
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, id),
      })

      if (!sale) {
        return { success: false, message: 'Sale not found' }
      }

      const items = await db
        .select({
          saleItem: saleItems,
          product: products,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, id))

      let customer = null
      if (sale.customerId) {
        customer = await db.query.customers.findFirst({
          where: eq(customers.id, sale.customerId),
        })
      }

      return {
        success: true,
        data: {
          ...sale,
          items: items.map((i) => ({ ...i.saleItem, product: i.product })),
          customer,
        },
      }
    } catch (error) {
      console.error('Get sale error:', error)
      return { success: false, message: 'Failed to fetch sale' }
    }
  })

  // Void sale (with atomic transaction for data integrity)
  ipcMain.handle('sales:void', async (_, id: number, reason: string) => {
    try {
      const session = getCurrentSession()

      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, id),
      })

      if (!sale) {
        return { success: false, message: 'Sale not found' }
      }

      if (sale.isVoided) {
        return { success: false, message: 'Sale is already voided' }
      }

      // Get sale items to restore inventory and cost layers
      const items = await db.query.saleItems.findMany({
        where: eq(saleItems.saleId, id),
      })

      // Execute all void operations in a transaction
      await withTransaction(async ({ db: txDb }) => {
        // 1. Restore inventory and cost layers
        for (const item of items) {
          // Restore inventory quantity
          await txDb
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} + ${item.quantity}`,
              updatedAt: new Date().toISOString(),
            })
            .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, sale.branchId)))

          // Restore cost layers for FIFO tracking
          await restoreCostLayers({
            productId: item.productId,
            branchId: sale.branchId,
            quantity: item.quantity,
            unitCost: item.costPrice,
            referenceType: 'void',
            referenceId: sale.id,
          })
        }

        // 2. Void sale
        await txDb
          .update(sales)
          .set({
            isVoided: true,
            voidReason: reason,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(sales.id, id))

        // 3. Cancel commission
        await txDb
          .update(commissions)
          .set({
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(commissions.saleId, id))

        // 4. Cancel any linked receivable
        const linkedReceivable = await txDb.query.accountReceivables.findFirst({
          where: eq(accountReceivables.saleId, id),
        })
        if (linkedReceivable) {
          await txDb
            .update(accountReceivables)
            .set({
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            })
            .where(eq(accountReceivables.id, linkedReceivable.id))
        }

        // 5. Create reversing journal entry in GL
        await postVoidSaleToGL(
          sale,
          items.map((item) => ({ costPrice: item.costPrice, quantity: item.quantity })),
          session?.userId ?? 0
        )
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: sale.branchId,
        action: 'void',
        entityType: 'sale',
        entityId: id,
        oldValues: { isVoided: false },
        newValues: { isVoided: true, voidReason: reason },
        description: `Voided sale: ${sale.invoiceNumber}`,
      })

      return { success: true, message: 'Sale voided successfully' }
    } catch (error) {
      console.error('Void sale error:', error)
      return { success: false, message: 'Failed to void sale' }
    }
  })

  ipcMain.handle('sales:get-daily-summary', async (_, branchId: number, date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      const startOfDay = `${targetDate}T00:00:00.000Z`
      const endOfDay = `${targetDate}T23:59:59.999Z`

      const salesData = await db
        .select({
          totalSales: sql<number>`count(*)`,
          totalRevenue: sql<number>`sum(${sales.totalAmount})`,
          totalTax: sql<number>`sum(${sales.taxAmount})`,
          totalDiscount: sql<number>`sum(${sales.discountAmount})`,
          cashSales: sql<number>`sum(case when ${sales.paymentMethod} = 'cash' then ${sales.totalAmount} else 0 end)`,
          cardSales: sql<number>`sum(case when ${sales.paymentMethod} = 'card' then ${sales.totalAmount} else 0 end)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.branchId, branchId),
            eq(sales.isVoided, false),
            between(sales.saleDate, startOfDay, endOfDay)
          )
        )

      return {
        success: true,
        data: {
          date: targetDate,
          ...salesData[0],
        },
      }
    } catch (error) {
      console.error('Get daily summary error:', error)
      return { success: false, message: 'Failed to fetch daily summary' }
    }
  })

  // Fix payment status for sales with inconsistent status
  ipcMain.handle('sales:fix-payment-status', async (_, invoiceNumber?: string) => {
    try {
      const conditions = [eq(sales.isVoided, false)]
      if (invoiceNumber) {
        conditions.push(eq(sales.invoiceNumber, invoiceNumber))
      }

      const salesToFix = await db.query.sales.findMany({
        where: and(...conditions),
      })

      let fixedCount = 0
      for (const sale of salesToFix) {
        const correctStatus =
          sale.amountPaid >= sale.totalAmount ? 'paid' : sale.amountPaid > 0 ? 'partial' : 'pending'

        if (sale.paymentStatus !== correctStatus) {
          await db
            .update(sales)
            .set({
              paymentStatus: correctStatus,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(sales.id, sale.id))
          fixedCount++
        }
      }

      return {
        success: true,
        message: `Fixed ${fixedCount} sale(s) with incorrect payment status`,
        data: { fixedCount },
      }
    } catch (error) {
      console.error('Fix payment status error:', error)
      return { success: false, message: 'Failed to fix payment status' }
    }
  })

  // Fix orphaned sales - create missing receivables for sales with outstanding balance
  ipcMain.handle('sales:fix-orphaned-receivables', async () => {
    try {
      const session = getCurrentSession()

      // Find sales with pending/partial payment, customer assigned, but no receivable
      const allSales = await db.query.sales.findMany({
        where: and(
          eq(sales.isVoided, false),
          sql`${sales.customerId} IS NOT NULL`,
          sql`(${sales.totalAmount} - ${sales.amountPaid}) > 0`
        ),
      })

      let createdCount = 0
      for (const sale of allSales) {
        // Check if receivable already exists
        const existingReceivable = await db.query.accountReceivables.findFirst({
          where: eq(accountReceivables.saleId, sale.id),
        })

        if (!existingReceivable && sale.customerId) {
          const outstandingAmount = sale.totalAmount - sale.amountPaid

          await db.insert(accountReceivables).values({
            customerId: sale.customerId,
            saleId: sale.id,
            branchId: sale.branchId,
            invoiceNumber: sale.invoiceNumber,
            totalAmount: outstandingAmount,
            paidAmount: 0,
            remainingAmount: outstandingAmount,
            status: sale.amountPaid > 0 ? 'partial' : 'pending',
            createdBy: session?.userId,
          })
          createdCount++
        }
      }

      return {
        success: true,
        message: `Created ${createdCount} missing receivable(s)`,
        data: { createdCount },
      }
    } catch (error) {
      console.error('Fix orphaned receivables error:', error)
      return { success: false, message: 'Failed to fix orphaned receivables' }
    }
  })
}
