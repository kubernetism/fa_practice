import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  products,
  inventory,
  customers,
  expenses,
  purchases,
  branches,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export function registerReportHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'reports:sales-report',
    async (
      _,
      params: {
        branchId?: number
        startDate: string
        endDate: string
        groupBy?: 'day' | 'week' | 'month'
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { branchId, startDate, endDate, groupBy = 'day' } = params

        const conditions = [
          between(sales.saleDate, startDate, endDate),
          eq(sales.isVoided, false),
        ]
        if (branchId) conditions.push(eq(sales.branchId, branchId))

        // Summary
        const summary = await db
          .select({
            totalSales: sql<number>`count(*)`,
            totalRevenue: sql<number>`sum(${sales.totalAmount})`,
            totalTax: sql<number>`sum(${sales.taxAmount})`,
            totalDiscount: sql<number>`sum(${sales.discountAmount})`,
            avgOrderValue: sql<number>`avg(${sales.totalAmount})`,
          })
          .from(sales)
          .where(and(...conditions))

        // Sales by payment method
        const byPaymentMethod = await db
          .select({
            paymentMethod: sales.paymentMethod,
            count: sql<number>`count(*)`,
            total: sql<number>`sum(${sales.totalAmount})`,
          })
          .from(sales)
          .where(and(...conditions))
          .groupBy(sales.paymentMethod)

        // Top selling products
        const topProducts = await db
          .select({
            productId: saleItems.productId,
            productName: products.name,
            productCode: products.code,
            quantitySold: sql<number>`sum(${saleItems.quantity})`,
            revenue: sql<number>`sum(${saleItems.totalPrice})`,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(and(...conditions))
          .groupBy(saleItems.productId, products.name, products.code)
          .orderBy(desc(sql`sum(${saleItems.quantity})`))
          .limit(10)

        // Daily/Weekly/Monthly breakdown
        let dateFormat: string
        switch (groupBy) {
          case 'week':
            dateFormat = "strftime('%Y-W%W', ${sales.saleDate})"
            break
          case 'month':
            dateFormat = "strftime('%Y-%m', ${sales.saleDate})"
            break
          default:
            dateFormat = "date(${sales.saleDate})"
        }

        const dailySales = await db
          .select({
            date: sql<string>`date(${sales.saleDate})`,
            count: sql<number>`count(*)`,
            total: sql<number>`sum(${sales.totalAmount})`,
          })
          .from(sales)
          .where(and(...conditions))
          .groupBy(sql`date(${sales.saleDate})`)
          .orderBy(sql`date(${sales.saleDate})`)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'sale',
          description: `Generated sales report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            byPaymentMethod,
            topProducts,
            dailySales,
          },
        }
      } catch (error) {
        console.error('Sales report error:', error)
        return { success: false, message: 'Failed to generate sales report' }
      }
    }
  )

  ipcMain.handle('reports:inventory-report', async (_, params: { branchId?: number }) => {
    try {
      const session = getCurrentSession()
      const { branchId } = params

      const conditions = []
      if (branchId) conditions.push(eq(inventory.branchId, branchId))

      // Stock summary
      const stockSummary = await db
        .select({
          branchId: inventory.branchId,
          branchName: branches.name,
          totalProducts: sql<number>`count(distinct ${inventory.productId})`,
          totalUnits: sql<number>`sum(${inventory.quantity})`,
          lowStockItems: sql<number>`sum(case when ${inventory.quantity} < ${inventory.minQuantity} then 1 else 0 end)`,
          outOfStockItems: sql<number>`sum(case when ${inventory.quantity} = 0 then 1 else 0 end)`,
        })
        .from(inventory)
        .innerJoin(branches, eq(inventory.branchId, branches.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(inventory.branchId, branches.name)

      // Stock value
      const stockValue = await db
        .select({
          branchId: inventory.branchId,
          costValue: sql<number>`sum(${inventory.quantity} * ${products.costPrice})`,
          retailValue: sql<number>`sum(${inventory.quantity} * ${products.sellingPrice})`,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(inventory.branchId)

      // Low stock items
      const lowStock = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          productCode: products.code,
          branchId: inventory.branchId,
          branchName: branches.name,
          quantity: inventory.quantity,
          minQuantity: inventory.minQuantity,
          reorderLevel: products.reorderLevel,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .innerJoin(branches, eq(inventory.branchId, branches.id))
        .where(
          and(
            sql`${inventory.quantity} < ${inventory.minQuantity}`,
            conditions.length > 0 ? and(...conditions) : undefined
          )
        )
        .orderBy(sql`${inventory.quantity} - ${inventory.minQuantity}`)
        .limit(50)

      await createAuditLog({
        userId: session?.userId,
        branchId: branchId ?? session?.branchId,
        action: 'view',
        entityType: 'inventory',
        description: 'Generated inventory report',
      })

      return {
        success: true,
        data: {
          stockSummary,
          stockValue,
          lowStock,
        },
      }
    } catch (error) {
      console.error('Inventory report error:', error)
      return { success: false, message: 'Failed to generate inventory report' }
    }
  })

  ipcMain.handle(
    'reports:profit-loss',
    async (
      _,
      params: {
        branchId?: number
        startDate: string
        endDate: string
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { branchId, startDate, endDate } = params

        // Revenue from sales
        const salesConditions = [
          between(sales.saleDate, startDate, endDate),
          eq(sales.isVoided, false),
        ]
        if (branchId) salesConditions.push(eq(sales.branchId, branchId))

        const revenue = await db
          .select({
            totalRevenue: sql<number>`sum(${sales.totalAmount})`,
            totalTax: sql<number>`sum(${sales.taxAmount})`,
          })
          .from(sales)
          .where(and(...salesConditions))

        // Cost of goods sold
        const cogs = await db
          .select({
            totalCost: sql<number>`sum(${saleItems.costPrice} * ${saleItems.quantity})`,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .where(and(...salesConditions))

        // Expenses
        const expenseConditions = [between(expenses.expenseDate, startDate, endDate)]
        if (branchId) expenseConditions.push(eq(expenses.branchId, branchId))

        const expenseTotal = await db
          .select({
            totalExpenses: sql<number>`sum(${expenses.amount})`,
          })
          .from(expenses)
          .where(and(...expenseConditions))

        const expensesByCategory = await db
          .select({
            category: expenses.category,
            total: sql<number>`sum(${expenses.amount})`,
          })
          .from(expenses)
          .where(and(...expenseConditions))
          .groupBy(expenses.category)

        const totalRevenue = revenue[0]?.totalRevenue ?? 0
        const totalCost = cogs[0]?.totalCost ?? 0
        const totalExpenses = expenseTotal[0]?.totalExpenses ?? 0
        const grossProfit = totalRevenue - totalCost
        const netProfit = grossProfit - totalExpenses
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
        const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'sale',
          description: `Generated profit/loss report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            revenue: totalRevenue,
            costOfGoodsSold: totalCost,
            grossProfit,
            grossMargin,
            expenses: totalExpenses,
            expensesByCategory,
            netProfit,
            netMargin,
          },
        }
      } catch (error) {
        console.error('Profit/loss report error:', error)
        return { success: false, message: 'Failed to generate profit/loss report' }
      }
    }
  )

  ipcMain.handle(
    'reports:customer-report',
    async (
      _,
      params: {
        startDate?: string
        endDate?: string
        limit?: number
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { startDate, endDate, limit = 20 } = params

        const conditions = [eq(sales.isVoided, false)]
        if (startDate && endDate) {
          conditions.push(between(sales.saleDate, startDate, endDate))
        }

        // Top customers
        const topCustomers = await db
          .select({
            customerId: sales.customerId,
            customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
            email: customers.email,
            phone: customers.phone,
            totalOrders: sql<number>`count(*)`,
            totalSpent: sql<number>`sum(${sales.totalAmount})`,
            avgOrderValue: sql<number>`avg(${sales.totalAmount})`,
          })
          .from(sales)
          .innerJoin(customers, eq(sales.customerId, customers.id))
          .where(and(...conditions))
          .groupBy(sales.customerId, customers.firstName, customers.lastName, customers.email, customers.phone)
          .orderBy(desc(sql`sum(${sales.totalAmount})`))
          .limit(limit)

        // Customer summary
        const customerSummary = await db
          .select({
            totalCustomers: sql<number>`count(distinct ${sales.customerId})`,
            totalRevenue: sql<number>`sum(${sales.totalAmount})`,
          })
          .from(sales)
          .where(and(...conditions))

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'view',
          entityType: 'customer',
          description: 'Generated customer report',
        })

        return {
          success: true,
          data: {
            topCustomers,
            summary: customerSummary[0],
          },
        }
      } catch (error) {
        console.error('Customer report error:', error)
        return { success: false, message: 'Failed to generate customer report' }
      }
    }
  )
}
