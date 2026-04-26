import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte, ne } from 'drizzle-orm'
import { getDatabase } from '../db'
import { sales, saleItems, products, customers } from '../db/schema'

interface TaxCollectionsParams {
  branchId: number
  startDate?: string
  endDate?: string
}

interface TaxRecord {
  id: number
  invoiceNumber: string
  saleDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentStatus: 'paid' | 'partial' | 'pending'
  customerName: string | null
}

interface TaxSummary {
  totalCollected: number
  totalPending: number
  paidSales: number
  pendingSales: number
  averageTaxPerSale: number
}

export function registerTaxCollectionsHandlers(): void {
  const db = getDatabase()

  // Get tax summary and records
  ipcMain.handle('tax-collections:get-summary', async (_, params: TaxCollectionsParams) => {
    try {
      const { branchId, startDate, endDate } = params

      const conditions = [eq(sales.branchId, branchId), eq(sales.isVoided, false), ne(sales.paymentStatus, 'pending_approval')]

      if (startDate && endDate) {
        conditions.push(between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`))
      } else if (startDate) {
        conditions.push(gte(sales.saleDate, `${startDate}T00:00:00.000Z`))
      } else if (endDate) {
        conditions.push(lte(sales.saleDate, `${endDate}T23:59:59.999Z`))
      }

      const whereClause = and(...conditions)

      // Get summary statistics
      const summaryResult = await db
        .select({
          totalCollected: sql<number>`sum(case when ${sales.paymentStatus} = 'paid' then ${sales.taxAmount} else 0 end)`,
          totalPending: sql<number>`sum(case when ${sales.paymentStatus} != 'paid' then ${sales.taxAmount} else 0 end)`,
          paidSales: sql<number>`sum(case when ${sales.paymentStatus} = 'paid' then 1 else 0 end)`,
          pendingSales: sql<number>`sum(case when ${sales.paymentStatus} != 'paid' then 1 else 0 end)`,
          totalTax: sql<number>`sum(${sales.taxAmount})`,
          totalSales: sql<number>`count(*)`,
        })
        .from(sales)
        .where(whereClause)

      const summary: TaxSummary = {
        totalCollected: summaryResult[0]?.totalCollected || 0,
        totalPending: summaryResult[0]?.totalPending || 0,
        paidSales: summaryResult[0]?.paidSales || 0,
        pendingSales: summaryResult[0]?.pendingSales || 0,
        averageTaxPerSale:
          summaryResult[0]?.totalSales > 0
            ? (summaryResult[0]?.totalTax || 0) / summaryResult[0].totalSales
            : 0,
      }

      // Get individual records with tax > 0
      const recordsData = await db
        .select({
          id: sales.id,
          invoiceNumber: sales.invoiceNumber,
          saleDate: sales.saleDate,
          subtotal: sales.subtotal,
          taxAmount: sales.taxAmount,
          totalAmount: sales.totalAmount,
          paymentStatus: sales.paymentStatus,
          customerId: sales.customerId,
        })
        .from(sales)
        .where(and(whereClause, sql`${sales.taxAmount} > 0`))
        .orderBy(desc(sales.saleDate))
        .limit(500)

      // Get customer names
      const records: TaxRecord[] = await Promise.all(
        recordsData.map(async (record) => {
          let customerName: string | null = null
          if (record.customerId) {
            const customer = await db.query.customers.findFirst({
              where: eq(customers.id, record.customerId),
            })
            customerName = customer
              ? `${customer.firstName} ${customer.lastName || ''}`.trim()
              : null
          }
          return {
            id: record.id,
            invoiceNumber: record.invoiceNumber,
            saleDate: record.saleDate,
            subtotal: record.subtotal,
            taxAmount: record.taxAmount,
            totalAmount: record.totalAmount,
            paymentStatus: record.paymentStatus as 'paid' | 'partial' | 'pending',
            customerName,
          }
        })
      )

      return {
        success: true,
        data: {
          summary,
          records,
        },
      }
    } catch (error) {
      console.error('Get tax collections error:', error)
      return { success: false, message: 'Failed to fetch tax collections' }
    }
  })

  // Get detailed tax breakdown for a specific sale
  ipcMain.handle('tax-collections:get-sale-details', async (_, saleId: number) => {
    try {
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, saleId),
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
        .where(eq(saleItems.saleId, saleId))

      const itemsWithTax = items.map((i) => ({
        productName: i.product.name,
        quantity: i.saleItem.quantity,
        unitPrice: i.saleItem.unitPrice,
        taxAmount: i.saleItem.taxAmount,
        totalPrice: i.saleItem.totalPrice,
      }))

      return {
        success: true,
        data: {
          sale,
          items: itemsWithTax,
        },
      }
    } catch (error) {
      console.error('Get tax sale details error:', error)
      return { success: false, message: 'Failed to fetch sale details' }
    }
  })

  // Get tax report by period (monthly/quarterly/yearly)
  ipcMain.handle(
    'tax-collections:get-periodic-report',
    async (_, params: { branchId: number; period: 'monthly' | 'quarterly' | 'yearly'; year: number }) => {
      try {
        const { branchId, period, year } = params

        const startOfYear = `${year}-01-01T00:00:00.000Z`
        const endOfYear = `${year}-12-31T23:59:59.999Z`

        const conditions = [
          eq(sales.branchId, branchId),
          eq(sales.isVoided, false), ne(sales.paymentStatus, 'pending_approval'),
          between(sales.saleDate, startOfYear, endOfYear),
        ]

        let groupBy: string
        if (period === 'monthly') {
          groupBy = `strftime('%Y-%m', ${sales.saleDate.name})`
        } else if (period === 'quarterly') {
          groupBy = `strftime('%Y', ${sales.saleDate.name}) || '-Q' || ((cast(strftime('%m', ${sales.saleDate.name}) as integer) - 1) / 3 + 1)`
        } else {
          groupBy = `strftime('%Y', ${sales.saleDate.name})`
        }

        const report = await db
          .select({
            period: sql<string>`${groupBy}`,
            totalTax: sql<number>`sum(${sales.taxAmount})`,
            totalSales: sql<number>`count(*)`,
            paidTax: sql<number>`sum(case when ${sales.paymentStatus} = 'paid' then ${sales.taxAmount} else 0 end)`,
            pendingTax: sql<number>`sum(case when ${sales.paymentStatus} != 'paid' then ${sales.taxAmount} else 0 end)`,
          })
          .from(sales)
          .where(and(...conditions))
          .groupBy(sql`${groupBy}`)
          .orderBy(sql`${groupBy}`)

        return {
          success: true,
          data: report,
        }
      } catch (error) {
        console.error('Get periodic tax report error:', error)
        return { success: false, message: 'Failed to fetch periodic report' }
      }
    }
  )
}
