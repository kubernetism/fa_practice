import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte, gt } from 'drizzle-orm'
import { getDatabase } from '../db'
import { sales, saleItems, products, customers, users, returns, returnItems } from '../db/schema'

interface DiscountParams {
  branchId: number
  startDate?: string
  endDate?: string
}

interface DiscountRecord {
  id: number
  invoiceNumber: string
  saleDate: string
  customerName: string | null
  subtotal: number
  discountAmount: number
  discountPercent: number
  totalAmount: number
  paymentStatus: 'paid' | 'partial' | 'pending'
  userId: number
  userName?: string
  isFullyReturned?: boolean
  effectiveDiscount?: number
  returnRatio?: number
}

interface DiscountedItem {
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  discountAmount: number
  totalPrice: number
}

interface DiscountSummary {
  totalDiscounts: number
  totalDiscountAmount: number
  averageDiscountPercent: number
  salesWithDiscount: number
  totalSales: number
  discountRate: number
  topDiscountedProducts: { productName: string; discountAmount: number; count: number }[]
}

export function registerDiscountManagementHandlers(): void {
  const db = getDatabase()

  // Get discount summary and records
  ipcMain.handle('discount-management:get-summary', async (_, params: DiscountParams) => {
    try {
      const { branchId, startDate, endDate } = params

      const conditions = [eq(sales.branchId, branchId), eq(sales.isVoided, false)]

      if (startDate && endDate) {
        conditions.push(between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`))
      } else if (startDate) {
        conditions.push(gte(sales.saleDate, `${startDate}T00:00:00.000Z`))
      } else if (endDate) {
        conditions.push(lte(sales.saleDate, `${endDate}T23:59:59.999Z`))
      }

      const whereClause = and(...conditions)

      // Get overall summary (with return-adjusted discount)
      const summaryResult = await db
        .select({
          totalDiscountAmount: sql<number>`sum(${sales.discountAmount})`,
          adjustedDiscountAmount: sql<number>`COALESCE(SUM(
            ${sales.discountAmount} * (1.0 - MIN(1.0,
              COALESCE((
                SELECT SUM(ri.unit_price * ri.quantity)
                FROM return_items ri
                INNER JOIN returns r ON ri.return_id = r.id
                WHERE r.original_sale_id = ${sales.id}
              ), 0) / CASE WHEN ${sales.subtotal} > 0 THEN ${sales.subtotal} ELSE 1 END
            ))
          ), 0)`,
          salesWithDiscount: sql<number>`sum(case when ${sales.discountAmount} > 0 then 1 else 0 end)`,
          totalSales: sql<number>`count(*)`,
          totalSubtotal: sql<number>`sum(${sales.subtotal})`,
        })
        .from(sales)
        .where(whereClause)

      const salesWithDiscount = summaryResult[0]?.salesWithDiscount || 0
      const totalSales = summaryResult[0]?.totalSales || 0
      const totalDiscountAmount = summaryResult[0]?.adjustedDiscountAmount || 0
      const totalSubtotal = summaryResult[0]?.totalSubtotal || 0

      // Calculate average discount percent
      const averageDiscountPercent =
        salesWithDiscount > 0 && totalSubtotal > 0
          ? (totalDiscountAmount / totalSubtotal) * 100
          : 0

      // Get top discounted products
      const topProducts = await db
        .select({
          productName: products.name,
          discountAmount: sql<number>`sum(${saleItems.discountAmount})`,
          count: sql<number>`count(*)`,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(whereClause, gt(saleItems.discountAmount, 0)))
        .groupBy(products.id, products.name)
        .orderBy(desc(sql`sum(${saleItems.discountAmount})`))
        .limit(10)

      const summary: DiscountSummary = {
        totalDiscounts: salesWithDiscount,
        totalDiscountAmount,
        averageDiscountPercent,
        salesWithDiscount,
        totalSales,
        discountRate: totalSales > 0 ? (salesWithDiscount / totalSales) * 100 : 0,
        topDiscountedProducts: topProducts.map((p) => ({
          productName: p.productName,
          discountAmount: p.discountAmount || 0,
          count: p.count || 0,
        })),
      }

      // Get individual records with discounts
      const recordsData = await db
        .select({
          id: sales.id,
          invoiceNumber: sales.invoiceNumber,
          saleDate: sales.saleDate,
          subtotal: sales.subtotal,
          discountAmount: sales.discountAmount,
          totalAmount: sales.totalAmount,
          paymentStatus: sales.paymentStatus,
          customerId: sales.customerId,
          userId: sales.userId,
        })
        .from(sales)
        .where(and(whereClause, gt(sales.discountAmount, 0)))
        .orderBy(desc(sales.saleDate))
        .limit(500)

      // Enrich with customer and user names
      const records: DiscountRecord[] = await Promise.all(
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

          let userName: string | undefined
          if (record.userId) {
            const user = await db.query.users.findFirst({
              where: eq(users.id, record.userId),
            })
            userName = user?.username
          }

          const discountPercent =
            record.subtotal > 0 ? (record.discountAmount / record.subtotal) * 100 : 0

          // Check return status for this sale
          const returnResult = await db
            .select({
              returnedValue: sql<number>`COALESCE(SUM(${returnItems.unitPrice} * ${returnItems.quantity}), 0)`,
            })
            .from(returnItems)
            .innerJoin(returns, eq(returnItems.returnId, returns.id))
            .where(eq(returns.originalSaleId, record.id))

          const returnedValue = returnResult[0]?.returnedValue || 0
          const returnRatio = record.subtotal > 0
            ? Math.min(1, returnedValue / record.subtotal)
            : 0
          const isFullyReturned = returnRatio >= 0.999
          const effectiveDiscount = Math.round(record.discountAmount * (1 - returnRatio) * 100) / 100

          return {
            id: record.id,
            invoiceNumber: record.invoiceNumber,
            saleDate: record.saleDate,
            customerName,
            subtotal: record.subtotal,
            discountAmount: record.discountAmount,
            discountPercent,
            totalAmount: record.totalAmount,
            paymentStatus: record.paymentStatus as 'paid' | 'partial' | 'pending',
            userId: record.userId,
            userName,
            isFullyReturned,
            effectiveDiscount,
            returnRatio,
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
      console.error('Get discount summary error:', error)
      return { success: false, message: 'Failed to fetch discount data' }
    }
  })

  // Get detailed discount information for a specific sale
  ipcMain.handle('discount-management:get-details', async (_, saleId: number) => {
    try {
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, saleId),
      })

      if (!sale) {
        return { success: false, message: 'Sale not found' }
      }

      // Get customer name
      let customerName: string | null = null
      if (sale.customerId) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, sale.customerId),
        })
        customerName = customer
          ? `${customer.firstName} ${customer.lastName || ''}`.trim()
          : null
      }

      // Get user name
      let userName: string | undefined
      if (sale.userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, sale.userId),
        })
        userName = user?.username
      }

      // Get sale items with discounts
      const itemsData = await db
        .select({
          saleItem: saleItems,
          product: products,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, saleId))

      const items: DiscountedItem[] = itemsData.map((i) => ({
        productName: i.product.name,
        quantity: i.saleItem.quantity,
        unitPrice: i.saleItem.unitPrice,
        discountPercent: i.saleItem.discountPercent,
        discountAmount: i.saleItem.discountAmount,
        totalPrice: i.saleItem.totalPrice,
      }))

      const discountPercent =
        sale.subtotal > 0 ? (sale.discountAmount / sale.subtotal) * 100 : 0

      return {
        success: true,
        data: {
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          saleDate: sale.saleDate,
          customerName,
          subtotal: sale.subtotal,
          discountAmount: sale.discountAmount,
          discountPercent,
          totalAmount: sale.totalAmount,
          paymentStatus: sale.paymentStatus,
          userId: sale.userId,
          userName,
          items,
        },
      }
    } catch (error) {
      console.error('Get discount details error:', error)
      return { success: false, message: 'Failed to fetch discount details' }
    }
  })

  // Get discount analytics by user
  ipcMain.handle(
    'discount-management:get-by-user',
    async (_, params: { branchId: number; startDate?: string; endDate?: string }) => {
      try {
        const { branchId, startDate, endDate } = params

        const conditions = [eq(sales.branchId, branchId), eq(sales.isVoided, false), gt(sales.discountAmount, 0)]

        if (startDate && endDate) {
          conditions.push(between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`))
        }

        const result = await db
          .select({
            userId: sales.userId,
            userName: users.username,
            totalDiscountAmount: sql<number>`sum(${sales.discountAmount})`,
            discountCount: sql<number>`count(*)`,
            averageDiscount: sql<number>`avg(${sales.discountAmount})`,
          })
          .from(sales)
          .innerJoin(users, eq(sales.userId, users.id))
          .where(and(...conditions))
          .groupBy(sales.userId, users.username)
          .orderBy(desc(sql`sum(${sales.discountAmount})`))

        return {
          success: true,
          data: result,
        }
      } catch (error) {
        console.error('Get discounts by user error:', error)
        return { success: false, message: 'Failed to fetch user discount data' }
      }
    }
  )

  // Get high discount alerts (discounts above threshold)
  ipcMain.handle(
    'discount-management:get-alerts',
    async (_, params: { branchId: number; thresholdPercent: number; limit?: number }) => {
      try {
        const { branchId, thresholdPercent, limit = 50 } = params

        const alertsData = await db
          .select({
            id: sales.id,
            invoiceNumber: sales.invoiceNumber,
            saleDate: sales.saleDate,
            subtotal: sales.subtotal,
            discountAmount: sales.discountAmount,
            totalAmount: sales.totalAmount,
            userId: sales.userId,
            customerId: sales.customerId,
          })
          .from(sales)
          .where(
            and(
              eq(sales.branchId, branchId),
              eq(sales.isVoided, false),
              sql`(${sales.discountAmount} / ${sales.subtotal}) * 100 > ${thresholdPercent}`
            )
          )
          .orderBy(desc(sales.saleDate))
          .limit(limit)

        const alerts = await Promise.all(
          alertsData.map(async (record) => {
            let customerName: string | null = null
            if (record.customerId) {
              const customer = await db.query.customers.findFirst({
                where: eq(customers.id, record.customerId),
              })
              customerName = customer
                ? `${customer.firstName} ${customer.lastName || ''}`.trim()
                : null
            }

            let userName: string | undefined
            if (record.userId) {
              const user = await db.query.users.findFirst({
                where: eq(users.id, record.userId),
              })
              userName = user?.username
            }

            const discountPercent = (record.discountAmount / record.subtotal) * 100

            return {
              ...record,
              customerName,
              userName,
              discountPercent,
            }
          })
        )

        return {
          success: true,
          data: alerts,
        }
      } catch (error) {
        console.error('Get discount alerts error:', error)
        return { success: false, message: 'Failed to fetch discount alerts' }
      }
    }
  )
}
