import { ipcMain } from 'electron'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  salesTabs,
  salesTabItems,
  inventory,
  products,
  customers,
  branches,
  users,
  sales,
  saleItems,
  commissions,
  accountReceivables,
  expenses,
  type NewSalesTab,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateInvoiceNumber, isLicenseExpired, type PaginationParams, type PaginatedResult } from '../utils/helpers'

interface CreateTabData {
  branchId: number
  customerId?: number
  notes?: string
}

interface UpdateTabData {
  customerId?: number
  status?: 'open' | 'on_hold' | 'closed'
  notes?: string
}

interface AddItemData {
  productId: number
  quantity: number
  sellingPrice?: number
  serialNumber?: string
  batchNumber?: string
}

interface UpdateItemData {
  quantity: number
}

interface CheckoutData {
  paymentMethod: 'cash' | 'card' | 'debit_card' | 'credit' | 'mixed' | 'mobile' | 'cod' | 'receivable'
  discount?: number
  amountPaid?: number
  codName?: string
  codPhone?: string
  codAddress?: string
  codCity?: string
  codCharges?: number
  notes?: string
}

// Generate a unique tab number for a branch
async function generateTabNumber(branchId: number): Promise<string> {
  const db = getDatabase()

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(salesTabs)
    .where(eq(salesTabs.branchId, branchId))

  const count = result[0]?.count ?? 0
  const nextNumber = count + 1

  return `TAB-${String(nextNumber).padStart(3, '0')}`
}

export function registerSalesTabsHandlers(): void {
  const db = getDatabase()

  // Get all tabs with pagination and filters
  ipcMain.handle(
    'sales-tabs:get-all',
    async (
      _,
      params: PaginationParams & {
        branchId?: number
        status?: 'open' | 'on_hold' | 'closed'
        userId?: number
      }
    ) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          branchId,
          status,
          userId,
        } = params

        const conditions = []

        if (branchId) conditions.push(eq(salesTabs.branchId, branchId))
        if (status) conditions.push(eq(salesTabs.status, status))
        if (userId) conditions.push(eq(salesTabs.userId, userId))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(salesTabs)
          .where(whereClause)

        const total = countResult[0]?.count ?? 0

        const data = await db.query.salesTabs.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(salesTabs.createdAt) : salesTabs.createdAt,
          with: {
            customer: true,
            branch: true,
            user: {
              columns: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
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
        console.error('Get sales tabs error:', error)
        return { success: false, message: 'Failed to fetch sales tabs' }
      }
    }
  )

  // Get tab by ID with items
  ipcMain.handle('sales-tabs:get-by-id', async (_, id: number) => {
    try {
      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, id),
        with: {
          customer: true,
          branch: true,
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      const items = await db
        .select()
        .from(salesTabItems)
        .where(eq(salesTabItems.tabId, id))
        .orderBy(desc(salesTabItems.addedAt))

      return {
        success: true,
        data: {
          ...tab,
          items,
        },
      }
    } catch (error) {
      console.error('Get tab error:', error)
      return { success: false, message: 'Failed to fetch tab' }
    }
  })

  // Create new tab
  ipcMain.handle('sales-tabs:create', async (_, data: CreateTabData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Verify branch exists
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, data.branchId),
      })

      if (!branch) {
        return { success: false, message: 'Branch not found' }
      }

      // Verify customer exists if provided
      if (data.customerId) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, data.customerId),
        })
        if (!customer) {
          return { success: false, message: 'Customer not found' }
        }
      }

      const tabNumber = await generateTabNumber(data.branchId)

      const [newTab] = await db
        .insert(salesTabs)
        .values({
          tabNumber,
          branchId: data.branchId,
          customerId: data.customerId,
          userId: session.userId,
          notes: data.notes,
        })
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'sales_tab',
        entityId: newTab.id,
        newValues: {
          tabNumber,
        },
        description: `Created sales tab: ${tabNumber}`,
      })

      return { success: true, data: newTab }
    } catch (error) {
      console.error('Create tab error:', error)
      return { success: false, message: 'Failed to create tab' }
    }
  })

  // Update tab
  ipcMain.handle('sales-tabs:update', async (_, id: number, data: UpdateTabData) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, id),
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      // Can't modify closed tabs
      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot modify closed tab' }
      }

      // Verify customer exists if provided
      if (data.customerId !== undefined && data.customerId !== tab.customerId) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, data.customerId),
        })
        if (!customer) {
          return { success: false, message: 'Customer not found' }
        }
      }

      const updateData: Partial<NewSalesTab> = {}
      if (data.customerId !== undefined) updateData.customerId = data.customerId
      if (data.status !== undefined) updateData.status = data.status
      if (data.notes !== undefined) updateData.notes = data.notes
      updateData.updatedAt = new Date().toISOString()

      // If closing tab, record who closed it
      if (data.status === 'closed') {
        updateData.closedAt = new Date().toISOString()
        updateData.closedBy = session?.userId
      }

      await db.update(salesTabs).set(updateData).where(eq(salesTabs.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: tab.branchId,
        action: 'update',
        entityType: 'sales_tab',
        entityId: id,
        oldValues: {
          status: tab.status,
          customerId: tab.customerId,
        },
        newValues: {
          status: data.status,
          customerId: data.customerId,
        },
        description: `Updated sales tab: ${tab.tabNumber}`,
      })

      return { success: true, message: 'Tab updated successfully' }
    } catch (error) {
      console.error('Update tab error:', error)
      return { success: false, message: 'Failed to update tab' }
    }
  })

  // Delete tab
  ipcMain.handle('sales-tabs:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, id),
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      // Can't delete closed tabs (they're already converted to sales)
      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot delete closed tab' }
      }

      await db.delete(salesTabs).where(eq(salesTabs.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: tab.branchId,
        action: 'delete',
        entityType: 'sales_tab',
        entityId: id,
        oldValues: {
          tabNumber: tab.tabNumber,
        },
        description: `Deleted sales tab: ${tab.tabNumber}`,
      })

      return { success: true, message: 'Tab deleted successfully' }
    } catch (error) {
      console.error('Delete tab error:', error)
      return { success: false, message: 'Failed to delete tab' }
    }
  })

  // Add item to tab
  ipcMain.handle('sales-tabs:add-item', async (_, tabId: number, data: AddItemData) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, tabId),
        with: {
          items: true,
        },
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot add items to closed tab' }
      }

      // Get product info
      const product = await db.query.products.findFirst({
        where: eq(products.id, data.productId),
      })

      if (!product) {
        return { success: false, message: 'Product not found' }
      }

      if (!product.isActive) {
        return { success: false, message: 'Product is not active' }
      }

      // Check inventory availability
      const stock = await db.query.inventory.findFirst({
        where: and(eq(inventory.productId, data.productId), eq(inventory.branchId, tab.branchId)),
      })

      const availableQuantity = stock?.quantity ?? 0

      // Calculate how many of this product are already in the tab
      const existingQuantity = tab.items
        .filter((item) => item.productId === data.productId && !item.serialNumber)
        .reduce((sum, item) => sum + item.quantity, 0)

      // For serial tracked items, check if serial is already in use
      if (product.isSerialTracked) {
        if (!data.serialNumber) {
          return { success: false, message: 'Serial number required for this product' }
        }
        const existingSerial = tab.items.find(
          (item) => item.productId === data.productId && item.serialNumber === data.serialNumber
        )
        if (existingSerial) {
          return { success: false, message: 'This serial number is already in the tab' }
        }
      } else {
        // For non-serial items, check if we have enough stock
        if (existingQuantity + data.quantity > availableQuantity) {
          return {
            success: false,
            message: `Insufficient stock. Available: ${availableQuantity}, In tab: ${existingQuantity}, Requested: ${data.quantity}`,
            availableQuantity: availableQuantity - existingQuantity,
          }
        }
      }

      // For serial tracked items, quantity must be 1
      if (product.isSerialTracked && data.quantity !== 1) {
        return { success: false, message: 'Quantity must be 1 for serial tracked items' }
      }

      const sellingPrice = data.sellingPrice ?? product.sellingPrice
      const subtotal = sellingPrice * data.quantity
      const taxAmount = subtotal * ((product.isTaxable ? product.taxRate : 0) / 100)

      const [newItem] = await db
        .insert(salesTabItems)
        .values({
          tabId,
          productId: data.productId,
          productName: product.name,
          productCode: product.code,
          quantity: data.quantity,
          sellingPrice,
          costPrice: product.costPrice,
          taxPercent: product.isTaxable ? product.taxRate : 0,
          subtotal: subtotal + taxAmount,
          serialNumber: data.serialNumber,
          batchNumber: data.batchNumber,
        })
        .returning()

      // Update tab totals
      await db
        .update(salesTabs)
        .set({
          itemCount: sql`${salesTabs.itemCount} + 1`,
          subtotal: sql`${salesTabs.subtotal} + ${subtotal}`,
          tax: sql`${salesTabs.tax} + ${taxAmount}`,
          finalAmount: sql`${salesTabs.finalAmount} + ${subtotal + taxAmount}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(salesTabs.id, tabId))

      return { success: true, data: newItem }
    } catch (error) {
      console.error('Add item error:', error)
      return { success: false, message: 'Failed to add item to tab' }
    }
  })

  // Update item quantity
  ipcMain.handle('sales-tabs:update-item', async (_, tabId: number, itemId: number, data: UpdateItemData) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, tabId),
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot modify closed tab' }
      }

      const item = await db.query.salesTabItems.findFirst({
        where: eq(salesTabItems.id, itemId),
      })

      if (!item) {
        return { success: false, message: 'Item not found' }
      }

      if (item.tabId !== tabId) {
        return { success: false, message: 'Item does not belong to this tab' }
      }

      // For serial tracked items, quantity cannot be changed
      if (item.serialNumber && data.quantity !== 1) {
        return { success: false, message: 'Cannot change quantity of serial tracked items' }
      }

      if (data.quantity <= 0) {
        return { success: false, message: 'Quantity must be greater than 0' }
      }

      // Check inventory availability
      const stock = await db.query.inventory.findFirst({
        where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, tab.branchId)),
      })

      const availableQuantity = stock?.quantity ?? 0

      if (data.quantity > availableQuantity) {
        return {
          success: false,
          message: `Insufficient stock. Available: ${availableQuantity}`,
          availableQuantity,
        }
      }

      const oldSubtotal = item.subtotal
      const newSubtotal = item.sellingPrice * data.quantity
      const newTaxAmount = newSubtotal * (item.taxPercent / 100)
      const newItemTotal = newSubtotal + newTaxAmount
      const subtotalDiff = newSubtotal - (oldSubtotal / (1 + item.taxPercent / 100))
      const taxDiff = newTaxAmount - (oldSubtotal - oldSubtotal / (1 + item.taxPercent / 100))
      const totalDiff = newItemTotal - oldSubtotal

      await db
        .update(salesTabItems)
        .set({
          quantity: data.quantity,
          subtotal: newItemTotal,
        })
        .where(eq(salesTabItems.id, itemId))

      // Update tab totals
      await db
        .update(salesTabs)
        .set({
          subtotal: sql`${salesTabs.subtotal} + ${subtotalDiff}`,
          tax: sql`${salesTabs.tax} + ${taxDiff}`,
          finalAmount: sql`${salesTabs.finalAmount} + ${totalDiff}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(salesTabs.id, tabId))

      return { success: true, message: 'Item updated successfully' }
    } catch (error) {
      console.error('Update item error:', error)
      return { success: false, message: 'Failed to update item' }
    }
  })

  // Remove item from tab
  ipcMain.handle('sales-tabs:remove-item', async (_, tabId: number, itemId: number) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, tabId),
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot modify closed tab' }
      }

      const item = await db.query.salesTabItems.findFirst({
        where: eq(salesTabItems.id, itemId),
      })

      if (!item) {
        return { success: false, message: 'Item not found' }
      }

      if (item.tabId !== tabId) {
        return { success: false, message: 'Item does not belong to this tab' }
      }

      await db.delete(salesTabItems).where(eq(salesTabItems.id, itemId))

      // Update tab totals
      await db
        .update(salesTabs)
        .set({
          itemCount: sql`${salesTabs.itemCount} - 1`,
          subtotal: sql`${salesTabs.subtotal} - ${item.sellingPrice * item.quantity}`,
          tax: sql`${salesTabs.tax} - ${item.subtotal - item.sellingPrice * item.quantity}`,
          finalAmount: sql`${salesTabs.finalAmount} - ${item.subtotal}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(salesTabs.id, tabId))

      return { success: true, message: 'Item removed successfully' }
    } catch (error) {
      console.error('Remove item error:', error)
      return { success: false, message: 'Failed to remove item' }
    }
  })

  // Get available products for a branch (with stock info)
  ipcMain.handle(
    'sales-tabs:get-available-products',
    async (
      _,
      params: {
        branchId: number
        categoryId?: number
        searchQuery?: string
        limit?: number
      }
    ) => {
      try {
        const { branchId, categoryId, searchQuery, limit = 100 } = params

        let query = db
          .select({
            product: products,
            quantity: inventory.quantity,
          })
          .from(products)
          .leftJoin(inventory, and(eq(inventory.productId, products.id), eq(inventory.branchId, branchId)))
          .where(eq(products.isActive, true))

        if (categoryId) {
          query = query.where(eq(products.categoryId, categoryId))
        }

        if (searchQuery) {
          query = query.where(
            sql`(${products.name} LIKE ${`%${searchQuery}%`} OR ${products.code} LIKE ${`%${searchQuery}%`} OR ${products.barcode} LIKE ${`%${searchQuery}%`})`
          )
        }

        query = query.limit(limit).orderBy(products.name)

        const results = await query

        // Filter to only show products with available stock
        const availableProducts = results.filter((r) => r.quantity > 0)

        return { success: true, data: availableProducts }
      } catch (error) {
        console.error('Get available products error:', error)
        return { success: false, message: 'Failed to fetch available products' }
      }
    }
  )

  // Checkout tab (convert to sale)
  ipcMain.handle('sales-tabs:checkout', async (_, tabId: number, checkoutData: CheckoutData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, tabId),
        with: {
          items: true,
          customer: true,
        },
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      if (tab.status === 'closed') {
        return { success: false, message: 'Tab is already closed' }
      }

      if (tab.items.length === 0) {
        return { success: false, message: 'Tab has no items' }
      }

      // Validate COD details if COD payment method
      if (checkoutData.paymentMethod === 'cod') {
        if (!checkoutData.codName || !checkoutData.codPhone || !checkoutData.codAddress || !checkoutData.codCity) {
          return { success: false, message: 'COD details are required' }
        }
      }

      // Validate customer is required for receivable payment method
      if (checkoutData.paymentMethod === 'receivable' && !tab.customerId) {
        return { success: false, message: 'Customer is required for Pay Later / Receivable payment method' }
      }

      // Validate customer for receivable or firearms
      const hasFirearms = tab.items.some((item) => {
        return tab.items.filter((i) => i.productId === item.productId && !item.serialNumber).length > 0
      })

      // Check for firearms and validate customer
      for (const item of tab.items) {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        })

        if (product?.isSerialTracked) {
          if (!tab.customer) {
            return { success: false, message: 'Customer is required for firearm purchases' }
          }
          if (!tab.customer.firearmLicenseNumber) {
            return { success: false, message: 'Customer does not have a firearm license' }
          }
          if (isLicenseExpired(tab.customer.licenseExpiryDate)) {
            return { success: false, message: 'Customer firearm license has expired' }
          }
        }
      }

      // Validate inventory one more time
      for (const item of tab.items) {
        if (item.serialNumber) {
          // Serial tracked items - check if product exists and is active
          const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
          })
          if (!product || !product.isActive) {
            return { success: false, message: `Product ${item.productName} is not available` }
          }
        } else {
          // Non-serial items - check stock
          const stock = await db.query.inventory.findFirst({
            where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, tab.branchId)),
          })
          if (!stock || stock.quantity < item.quantity) {
            return {
              success: false,
              message: `Insufficient stock for ${item.productName}`,
            }
          }
        }
      }

      // Calculate totals
      const subtotal = tab.subtotal
      const taxAmount = tab.tax
      const discountAmount = checkoutData.discount ?? 0
      const codCharges = checkoutData.codCharges ?? 0
      // Add COD charges to total for COD payment method
      const totalAmount = subtotal + taxAmount - discountAmount + (checkoutData.paymentMethod === 'cod' ? codCharges : 0)
      const amountPaid = checkoutData.amountPaid ?? 0
      const changeGiven = amountPaid > totalAmount ? amountPaid - totalAmount : 0

      // Determine payment status
      let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid'
      if (checkoutData.paymentMethod === 'receivable' || amountPaid === 0) {
        paymentStatus = 'pending'
      } else if (amountPaid < totalAmount) {
        paymentStatus = 'partial'
      }

      // Generate invoice number
      const invoiceNumber = generateInvoiceNumber()

      // Create sale notes
      let saleNotes: string
      if (checkoutData.notes) {
        saleNotes = `Tab: ${tab.tabNumber}. ${checkoutData.notes}`
      } else {
        saleNotes = `Tab: ${tab.tabNumber}`
      }

      if (checkoutData.paymentMethod === 'cod') {
        saleNotes = `${saleNotes}\n\nCOD Details:\nName: ${checkoutData.codName}\nPhone: ${checkoutData.codPhone}\nAddress: ${checkoutData.codAddress}, ${checkoutData.codCity}`
        if (codCharges > 0) {
          saleNotes = `${saleNotes}\nCOD Charges: ${codCharges}`
        }
      }

      const [sale] = await db
        .insert(sales)
        .values({
          invoiceNumber,
          customerId: tab.customerId,
          branchId: tab.branchId,
          userId: session.userId,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentMethod: checkoutData.paymentMethod,
          paymentStatus,
          amountPaid,
          changeGiven,
          notes: saleNotes,
        })
        .returning()

      // Create sale items and deduct inventory
      for (const item of tab.items) {
        await db.insert(saleItems).values({
          saleId: sale.id,
          productId: item.productId,
          serialNumber: item.serialNumber,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          costPrice: item.costPrice,
          discountPercent: 0,
          discountAmount: 0,
          taxAmount: item.subtotal - item.sellingPrice * item.quantity,
          totalPrice: item.subtotal,
        })

        // Deduct inventory for non-serial items
        if (!item.serialNumber) {
          await db
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} - ${item.quantity}`,
              updatedAt: new Date().toISOString(),
            })
            .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, tab.branchId)))
        }
      }

      // Create commission
      const commissionRate = 2 // 2%
      const commissionAmount = subtotal * (commissionRate / 100)

      await db.insert(commissions).values({
        saleId: sale.id,
        userId: session.userId,
        branchId: tab.branchId,
        commissionType: 'sale',
        baseAmount: subtotal,
        rate: commissionRate,
        commissionAmount,
        status: 'pending',
      })

      // Create account receivable entry if payment method is receivable
      if (checkoutData.paymentMethod === 'receivable' && tab.customerId) {
        await db.insert(accountReceivables).values({
          customerId: tab.customerId,
          saleId: sale.id,
          branchId: tab.branchId,
          invoiceNumber,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          status: 'pending',
          createdBy: session.userId,
        })
      }

      // Create expense entry for COD charges (to be paid to courier)
      if (checkoutData.paymentMethod === 'cod' && codCharges > 0) {
        await db.insert(expenses).values({
          branchId: tab.branchId,
          userId: session.userId,
          category: 'other',
          amount: codCharges,
          description: `COD Delivery Charges for Invoice: ${invoiceNumber}. Customer: ${checkoutData.codName}, Phone: ${checkoutData.codPhone}`,
          paymentMethod: 'cash',
          reference: invoiceNumber,
          paymentStatus: 'unpaid', // Mark as unpaid - to be paid to courier later
        })
      }

      // Update tab status to closed
      await db
        .update(salesTabs)
        .set({
          status: 'closed',
          closedAt: new Date().toISOString(),
          closedBy: session.userId,
          discount: discountAmount,
          finalAmount: totalAmount,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(salesTabs.id, tabId))

      await createAuditLog({
        userId: session.userId,
        branchId: tab.branchId,
        action: 'checkout',
        entityType: 'sales_tab',
        entityId: tabId,
        oldValues: {
          status: tab.status,
        },
        newValues: {
          status: 'closed',
          saleId: sale.id,
          invoiceNumber,
        },
        description: `Checked out sales tab ${tab.tabNumber} as sale ${invoiceNumber}`,
      })

      return {
        success: true,
        data: {
          sale,
          invoiceNumber,
          totalAmount,
          changeReturned: changeGiven,
        },
      }
    } catch (error) {
      console.error('Checkout tab error:', error)
      return { success: false, message: 'Failed to checkout tab' }
    }
  })

  // Clear all items from a tab
  ipcMain.handle('sales-tabs:clear-items', async (_, tabId: number) => {
    try {
      const session = getCurrentSession()

      const tab = await db.query.salesTabs.findFirst({
        where: eq(salesTabs.id, tabId),
      })

      if (!tab) {
        return { success: false, message: 'Tab not found' }
      }

      if (tab.status === 'closed') {
        return { success: false, message: 'Cannot modify closed tab' }
      }

      await db.delete(salesTabItems).where(eq(salesTabItems.tabId, tabId))

      // Reset tab totals
      await db
        .update(salesTabs)
        .set({
          itemCount: 0,
          subtotal: 0,
          tax: 0,
          finalAmount: 0,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(salesTabs.id, tabId))

      return { success: true, message: 'Tab cleared successfully' }
    } catch (error) {
      console.error('Clear tab error:', error)
      return { success: false, message: 'Failed to clear tab' }
    }
  })
}
