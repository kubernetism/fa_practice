import { ipcMain } from 'electron'
import { eq, isNull, asc } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  products,
  customers,
  businessSettings,
  accountReceivables,
  receivablePayments,
  users,
  saleServices,
  services,
} from '../db/schema'
import {
  generateReceipt,
  generatePaymentHistoryReceipt,
  type ReceiptData,
  type ReceiptOptions,
  type ReceiptSaleData,
  type ReceiptItemData,
  type ReceiptServiceData,
  type ReceiptCustomerData,
  type PaymentHistoryData,
} from '../utils/receipt-generator'

export function registerReceiptHandlers(): void {
  const db = getDatabase()

  // Generate receipt for a sale
  ipcMain.handle('receipt:generate', async (_, saleId: number) => {
    try {
      // 1. Fetch the sale
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, saleId),
      })

      if (!sale) {
        return { success: false, message: 'Sale not found' }
      }

      // 2. Fetch sale items with product details
      const items = await db
        .select({
          saleItem: saleItems,
          product: products,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, saleId))

      // 2b. Fetch sale services with service details
      const saleServiceItems = await db
        .select({
          saleService: saleServices,
          service: services,
        })
        .from(saleServices)
        .innerJoin(services, eq(saleServices.serviceId, services.id))
        .where(eq(saleServices.saleId, saleId))

      // 3. Fetch customer if exists
      let customer: ReceiptCustomerData | null = null
      if (sale.customerId) {
        const customerData = await db.query.customers.findFirst({
          where: eq(customers.id, sale.customerId),
        })
        if (customerData) {
          customer = {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            phone: customerData.phone || undefined,
            email: customerData.email || undefined,
            address: [customerData.address, customerData.city, customerData.state]
              .filter(Boolean)
              .join(', ') || undefined,
          }
        }
      }

      // 4. Fetch business settings (branch-specific or global)
      let settings = null

      // Try branch-specific settings first
      if (sale.branchId) {
        settings = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.branchId, sale.branchId),
        })
      }

      // Fallback to global settings
      if (!settings) {
        settings = await db.query.businessSettings.findFirst({
          where: isNull(businessSettings.branchId),
        })
      }

      // If still no settings, create default
      if (!settings) {
        return { success: false, message: 'Business settings not configured' }
      }

      // 5. Build receipt data
      const receiptSale: ReceiptSaleData = {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        saleDate: sale.saleDate || new Date().toISOString(),
        subtotal: sale.subtotal || 0,
        taxAmount: sale.taxAmount || 0,
        discountAmount: sale.discountAmount || 0,
        totalAmount: sale.totalAmount || 0,
        amountPaid: sale.amountPaid || 0,
        changeGiven: sale.changeGiven || 0,
        paymentMethod: sale.paymentMethod || 'cash',
        paymentStatus: sale.paymentStatus || 'paid',
        notes: sale.notes || undefined,
      }

      const receiptItems: ReceiptItemData[] = items.map((item) => ({
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.saleItem.quantity || 1,
        unitPrice: item.saleItem.unitPrice || 0,
        serialNumber: item.saleItem.serialNumber || undefined,
        discountAmount: item.saleItem.discountAmount || 0,
        taxAmount: item.saleItem.taxAmount || 0,
        totalPrice: item.saleItem.totalPrice || 0,
      }))

      // Map services for the receipt
      const receiptServices: ReceiptServiceData[] = saleServiceItems.map((item) => ({
        serviceName: item.saleService.serviceName || item.service.name,
        serviceCode: item.service.code || undefined,
        quantity: item.saleService.quantity || 1,
        unitPrice: item.saleService.unitPrice || 0,
        hours: item.saleService.hours || undefined,
        taxAmount: item.saleService.taxAmount || 0,
        totalAmount: item.saleService.totalPrice || 0,
        notes: item.saleService.notes || undefined,
      }))

      const receiptData: ReceiptData = {
        sale: receiptSale,
        items: receiptItems,
        services: receiptServices,
        customer,
        businessSettings: settings,
      }

      // 6. Generate receipt
      const options: ReceiptOptions = {
        format: (settings.receiptFormat as 'pdf' | 'thermal') || 'pdf',
        autoDownload: settings.receiptAutoDownload !== false,
      }

      const filePath = await generateReceipt(receiptData, options)

      return {
        success: true,
        data: {
          filePath,
          format: options.format,
          invoiceNumber: sale.invoiceNumber,
        },
      }
    } catch (error) {
      console.error('Receipt generation error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate receipt',
      }
    }
  })

  // Get receipt data for preview rendering (returns structured data, not a file)
  ipcMain.handle('receipt:get-data', async (_, saleId: number) => {
    try {
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, saleId),
      })
      if (!sale) {
        return { success: false, message: 'Sale not found' }
      }

      const items = await db
        .select({ saleItem: saleItems, product: products })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, saleId))

      const saleServiceItems = await db
        .select({ saleService: saleServices, service: services })
        .from(saleServices)
        .innerJoin(services, eq(saleServices.serviceId, services.id))
        .where(eq(saleServices.saleId, saleId))

      let customer: ReceiptCustomerData | null = null
      if (sale.customerId) {
        const customerData = await db.query.customers.findFirst({
          where: eq(customers.id, sale.customerId),
        })
        if (customerData) {
          customer = {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            phone: customerData.phone || undefined,
            email: customerData.email || undefined,
            address: [customerData.address, customerData.city, customerData.state]
              .filter(Boolean)
              .join(', ') || undefined,
          }
        }
      }

      let settings = null
      if (sale.branchId) {
        settings = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.branchId, sale.branchId),
        })
      }
      if (!settings) {
        settings = await db.query.businessSettings.findFirst({
          where: isNull(businessSettings.branchId),
        })
      }
      if (!settings) {
        return { success: false, message: 'Business settings not configured' }
      }

      return {
        success: true,
        data: {
          sale: {
            id: sale.id,
            invoiceNumber: sale.invoiceNumber,
            saleDate: sale.saleDate || new Date().toISOString(),
            subtotal: sale.subtotal || 0,
            taxAmount: sale.taxAmount || 0,
            discountAmount: sale.discountAmount || 0,
            totalAmount: sale.totalAmount || 0,
            amountPaid: sale.amountPaid || 0,
            changeGiven: sale.changeGiven || 0,
            paymentMethod: sale.paymentMethod || 'cash',
            paymentStatus: sale.paymentStatus || 'paid',
            notes: sale.notes || undefined,
          },
          items: items.map((item) => ({
            productName: item.product.name,
            productCode: item.product.code,
            quantity: item.saleItem.quantity || 1,
            unitPrice: item.saleItem.unitPrice || 0,
            serialNumber: item.saleItem.serialNumber || undefined,
            discountAmount: item.saleItem.discountAmount || 0,
            taxAmount: item.saleItem.taxAmount || 0,
            totalPrice: item.saleItem.totalPrice || 0,
          })),
          services: saleServiceItems.map((item) => ({
            serviceName: item.saleService.serviceName || item.service.name,
            serviceCode: item.service.code || undefined,
            quantity: item.saleService.quantity || 1,
            unitPrice: item.saleService.unitPrice || 0,
            hours: item.saleService.hours || undefined,
            taxAmount: item.saleService.taxAmount || 0,
            totalAmount: item.saleService.totalPrice || 0,
            notes: item.saleService.notes || undefined,
          })),
          customer,
          businessSettings: {
            businessName: settings.businessName,
            businessLogo: settings.businessLogo,
            currencySymbol: settings.currencySymbol || 'Rs.',
            currencyPosition: settings.currencyPosition || 'prefix',
            decimalPlaces: settings.decimalPlaces || 2,
            taxRate: settings.taxRate || 0,
            showTaxOnReceipt: settings.showTaxOnReceipt !== false,
            receiptFooter: settings.receiptFooter || '',
            receiptTermsAndConditions: settings.receiptTermsAndConditions || '',
            receiptCustomField1Label: settings.receiptCustomField1Label || '',
            receiptCustomField1Value: settings.receiptCustomField1Value || '',
            receiptCustomField2Label: settings.receiptCustomField2Label || '',
            receiptCustomField2Value: settings.receiptCustomField2Value || '',
            receiptCustomField3Label: settings.receiptCustomField3Label || '',
            receiptCustomField3Value: settings.receiptCustomField3Value || '',
          },
        },
      }
    } catch (error) {
      console.error('Receipt data fetch error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch receipt data',
      }
    }
  })

  // Get receipt settings for a branch
  ipcMain.handle('receipt:get-settings', async (_, branchId?: number) => {
    try {
      let settings = null

      // Try branch-specific settings first
      if (branchId) {
        settings = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.branchId, branchId),
        })
      }

      // Fallback to global settings
      if (!settings) {
        settings = await db.query.businessSettings.findFirst({
          where: isNull(businessSettings.branchId),
        })
      }

      if (!settings) {
        return {
          success: true,
          data: {
            receiptFormat: 'pdf',
            receiptPrimaryColor: '#1e40af',
            receiptSecondaryColor: '#64748b',
            receiptFontSize: 'medium',
            receiptHeader: '',
            receiptFooter: '',
            showTaxOnReceipt: true,
            receiptShowBusinessLogo: true,
            receiptAutoDownload: true,
          },
        }
      }

      return {
        success: true,
        data: {
          receiptFormat: settings.receiptFormat || 'pdf',
          receiptPrimaryColor: settings.receiptPrimaryColor || '#1e40af',
          receiptSecondaryColor: settings.receiptSecondaryColor || '#64748b',
          receiptFontSize: settings.receiptFontSize || 'medium',
          receiptHeader: settings.receiptHeader || '',
          receiptFooter: settings.receiptFooter || '',
          receiptLogo: settings.receiptLogo || '',
          showTaxOnReceipt: settings.showTaxOnReceipt !== false,
          receiptCustomField1Label: settings.receiptCustomField1Label || '',
          receiptCustomField1Value: settings.receiptCustomField1Value || '',
          receiptCustomField2Label: settings.receiptCustomField2Label || '',
          receiptCustomField2Value: settings.receiptCustomField2Value || '',
          receiptCustomField3Label: settings.receiptCustomField3Label || '',
          receiptCustomField3Value: settings.receiptCustomField3Value || '',
          receiptTermsAndConditions: settings.receiptTermsAndConditions || '',
          receiptShowBusinessLogo: settings.receiptShowBusinessLogo !== false,
          receiptAutoDownload: settings.receiptAutoDownload !== false,
        },
      }
    } catch (error) {
      console.error('Error fetching receipt settings:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch receipt settings',
      }
    }
  })

  // Generate payment history receipt for a receivable
  ipcMain.handle('receipt:generate-payment-history', async (_, receivableId: number) => {
    try {
      // 1. Fetch the receivable
      const receivable = await db.query.accountReceivables.findFirst({
        where: eq(accountReceivables.id, receivableId),
      })

      if (!receivable) {
        return { success: false, message: 'Receivable not found' }
      }

      // 2. Fetch the original sale if linked
      let sale = null
      if (receivable.saleId) {
        sale = await db.query.sales.findFirst({
          where: eq(sales.id, receivable.saleId),
        })
      }

      // If no linked sale, create a placeholder sale object
      if (!sale) {
        sale = {
          invoiceNumber: receivable.invoiceNumber,
          saleDate: receivable.createdAt || new Date().toISOString(),
          subtotal: receivable.totalAmount || 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: receivable.totalAmount || 0,
        }
      }

      // 3. Fetch sale items and services if sale exists
      let receiptItems: ReceiptItemData[] = []
      let receiptServices: ReceiptServiceData[] = []
      if (receivable.saleId) {
        // Fetch products
        const items = await db
          .select({
            saleItem: saleItems,
            product: products,
          })
          .from(saleItems)
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(eq(saleItems.saleId, receivable.saleId))

        receiptItems = items.map((item) => ({
          productName: item.product.name,
          productCode: item.product.code,
          quantity: item.saleItem.quantity || 1,
          unitPrice: item.saleItem.unitPrice || 0,
          serialNumber: item.saleItem.serialNumber || undefined,
          discountAmount: item.saleItem.discountAmount || 0,
          taxAmount: item.saleItem.taxAmount || 0,
          totalPrice: item.saleItem.totalPrice || 0,
        }))

        // Fetch services
        const serviceItems = await db
          .select({
            saleService: saleServices,
            service: services,
          })
          .from(saleServices)
          .innerJoin(services, eq(saleServices.serviceId, services.id))
          .where(eq(saleServices.saleId, receivable.saleId))

        receiptServices = serviceItems.map((item) => ({
          serviceName: item.saleService.serviceName || item.service.name,
          serviceCode: item.service.code || undefined,
          quantity: item.saleService.quantity || 1,
          unitPrice: item.saleService.unitPrice || 0,
          hours: item.saleService.hours || undefined,
          taxAmount: item.saleService.taxAmount || 0,
          totalAmount: item.saleService.totalPrice || 0,
          notes: item.saleService.notes || undefined,
        }))
      }

      // 4. Fetch all payments for this receivable with user info
      const payments = await db
        .select({
          payment: receivablePayments,
          user: users,
        })
        .from(receivablePayments)
        .leftJoin(users, eq(receivablePayments.receivedBy, users.id))
        .where(eq(receivablePayments.receivableId, receivableId))
        .orderBy(asc(receivablePayments.paymentDate))

      const formattedPayments = payments.map((p) => ({
        id: p.payment.id,
        amount: p.payment.amount || 0,
        paymentMethod: p.payment.paymentMethod || 'cash',
        referenceNumber: p.payment.referenceNumber || undefined,
        notes: p.payment.notes || undefined,
        paymentDate: p.payment.paymentDate || new Date().toISOString(),
        receivedBy: p.user?.fullName || undefined,
      }))

      // 5. Fetch customer
      let customer: ReceiptCustomerData | null = null
      if (receivable.customerId) {
        const customerData = await db.query.customers.findFirst({
          where: eq(customers.id, receivable.customerId),
        })
        if (customerData) {
          customer = {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            phone: customerData.phone || undefined,
            email: customerData.email || undefined,
            address: [customerData.address, customerData.city, customerData.state]
              .filter(Boolean)
              .join(', ') || undefined,
          }
        }
      }

      // 6. Fetch business settings
      let settings = null
      if (receivable.branchId) {
        settings = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.branchId, receivable.branchId),
        })
      }
      if (!settings) {
        settings = await db.query.businessSettings.findFirst({
          where: isNull(businessSettings.branchId),
        })
      }
      if (!settings) {
        return { success: false, message: 'Business settings not configured' }
      }

      // 7. Build payment history data
      const paymentHistoryData: PaymentHistoryData = {
        receivable: {
          id: receivable.id,
          invoiceNumber: receivable.invoiceNumber,
          totalAmount: receivable.totalAmount || 0,
          paidAmount: receivable.paidAmount || 0,
          remainingAmount: receivable.remainingAmount || 0,
          status: receivable.status || 'pending',
          createdAt: receivable.createdAt || new Date().toISOString(),
          dueDate: receivable.dueDate || undefined,
        },
        payments: formattedPayments,
        sale: {
          invoiceNumber: sale.invoiceNumber || receivable.invoiceNumber,
          saleDate: sale.saleDate || receivable.createdAt || new Date().toISOString(),
          subtotal: sale.subtotal || receivable.totalAmount || 0,
          taxAmount: sale.taxAmount || 0,
          discountAmount: sale.discountAmount || 0,
          totalAmount: sale.totalAmount || receivable.totalAmount || 0,
        },
        items: receiptItems,
        services: receiptServices,
        customer,
        businessSettings: settings,
      }

      // 8. Generate receipt
      const options: ReceiptOptions = {
        format: (settings.receiptFormat as 'pdf' | 'thermal') || 'pdf',
        autoDownload: settings.receiptAutoDownload !== false,
      }

      const filePath = await generatePaymentHistoryReceipt(paymentHistoryData, options)

      return {
        success: true,
        data: {
          filePath,
          format: options.format,
          invoiceNumber: receivable.invoiceNumber,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : ''
      console.error('Payment history receipt generation error:', errorMessage)
      console.error('Stack trace:', errorStack)
      return {
        success: false,
        message: `Failed to generate receipt: ${errorMessage}`,
      }
    }
  })
}
