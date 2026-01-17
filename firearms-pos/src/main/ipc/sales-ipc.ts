import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  inventory,
  products,
  customers,
  commissions,
  accountReceivables,
  expenses,
  type NewSale,
  type NewSaleItem,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateInvoiceNumber, isLicenseExpired, type PaginationParams, type PaginatedResult } from '../utils/helpers'

interface CartItem {
  productId: number
  quantity: number
  unitPrice: number
  costPrice: number
  serialNumber?: string
  discountPercent?: number
  taxRate?: number
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
  notes?: string
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

      // Check for firearms and validate customer license
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

        // Check if any item is a firearm
        for (const item of data.items) {
          const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
          })

          if (product?.isSerialTracked) {
            // This is likely a firearm
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

      // Calculate totals
      let subtotal = 0
      let taxAmount = 0
      const saleItemsData: Omit<NewSaleItem, 'saleId'>[] = []

      for (const item of data.items) {
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
          costPrice: item.costPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: itemDiscount,
          taxAmount: itemTax,
          totalPrice: itemTotal,
        })
      }

      const discountAmount = data.discountAmount || 0
      const codCharges = data.codCharges || 0
      // Add COD charges to total for COD payment method
      const totalAmount = subtotal + taxAmount - discountAmount + (data.paymentMethod === 'cod' ? codCharges : 0)
      const changeGiven = data.amountPaid > totalAmount ? data.amountPaid - totalAmount : 0
      // Use provided paymentStatus for receivable/cod, otherwise calculate based on amount
      const paymentStatus = data.paymentStatus || (data.amountPaid >= totalAmount ? 'paid' : data.amountPaid > 0 ? 'partial' : 'pending')

      // Generate invoice number
      const invoiceNumber = generateInvoiceNumber()
      const outstandingAmount = totalAmount - data.amountPaid

      // 1. Create sale
      const [sale] = await db
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

      // 2. Create sale items
      for (const item of saleItemsData) {
        await db.insert(saleItems).values({
          ...item,
          saleId: sale.id,
        })
      }

      // 3. Deduct inventory
      for (const item of data.items) {
        await db
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${item.quantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, data.branchId)))
      }

      // 4. Create commission if applicable (example: 2% of subtotal)
      if (session?.userId) {
        const commissionRate = 2 // 2%
        const commissionAmount = subtotal * (commissionRate / 100)

        await db.insert(commissions).values({
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

      // 5. Create account receivable if there's an outstanding balance and customer exists
      if (outstandingAmount > 0 && data.customerId) {
        await db.insert(accountReceivables).values({
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

      // 6. Create expense entry for COD charges (to be paid to courier)
      if (data.paymentMethod === 'cod' && codCharges > 0) {
        await db.insert(expenses).values({
          branchId: data.branchId,
          userId: session?.userId ?? 0,
          category: 'other',
          amount: codCharges,
          description: `COD Delivery Charges for Invoice: ${invoiceNumber}. Customer: ${data.codName || 'N/A'}, Phone: ${data.codPhone || 'N/A'}`,
          paymentMethod: 'cash',
          reference: invoiceNumber,
          paymentStatus: 'unpaid', // Mark as unpaid - to be paid to courier later
        })
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'sale',
        entityId: sale.id,
        newValues: {
          invoiceNumber,
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus,
          amountPaid: data.amountPaid,
          itemCount: data.items.length,
        },
        description: `Created sale: ${invoiceNumber}${discountAmount > 0 ? ` (Discount: ${discountAmount})` : ''}`,
      })

      return { success: true, data: sale }
    } catch (error) {
      console.error('Create sale error:', error)
      return { success: false, message: 'Failed to create sale' }
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

      // Get sale items to restore inventory
      const items = await db.query.saleItems.findMany({
        where: eq(saleItems.saleId, id),
      })

      // 1. Restore inventory
      for (const item of items) {
        await db
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} + ${item.quantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, sale.branchId)))
      }

      // 2. Void sale
      await db
        .update(sales)
        .set({
          isVoided: true,
          voidReason: reason,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(sales.id, id))

      // 3. Cancel commission
      await db
        .update(commissions)
        .set({
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(commissions.saleId, id))

      // 4. Cancel any linked receivable
      const linkedReceivable = await db.query.accountReceivables.findFirst({
        where: eq(accountReceivables.saleId, id),
      })
      if (linkedReceivable) {
        await db
          .update(accountReceivables)
          .set({
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(accountReceivables.id, linkedReceivable.id))
      }

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
