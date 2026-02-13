import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte, count } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  products,
  inventory,
  customers,
  expenses,
  purchases,
  purchaseItems,
  branches,
  returns,
  returnItems,
  commissions,
  auditLogs,
  users,
  suppliers,
  categories,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { getDateRange, getPeriodLabel } from '../utils/date-helpers'
import { generateReportPDF } from '../utils/pdf-generator'
import type { TimePeriod, ReportType } from '../../shared/types'

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
            categoryId: expenses.categoryId,
            category: categories.name,
            total: sql<number>`sum(${expenses.amount})`,
          })
          .from(expenses)
          .innerJoin(categories, eq(expenses.categoryId, categories.id))
          .where(and(...expenseConditions))
          .groupBy(expenses.categoryId, categories.name)

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

  // Expense Report
  ipcMain.handle(
    'reports:expenses-report',
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

        const conditions = [between(expenses.expenseDate, startDate, endDate)]
        if (branchId) conditions.push(eq(expenses.branchId, branchId))

        // Summary
        const summary = await db
          .select({
            totalExpenses: sql<number>`sum(${expenses.amount})`,
            expenseCount: sql<number>`count(*)`,
            avgExpense: sql<number>`avg(${expenses.amount})`,
          })
          .from(expenses)
          .where(and(...conditions))

        // By category
        const expensesByCategory = await db
          .select({
            categoryId: expenses.categoryId,
            category: categories.name,
            amount: sql<number>`sum(${expenses.amount})`,
            count: sql<number>`count(*)`,
          })
          .from(expenses)
          .innerJoin(categories, eq(expenses.categoryId, categories.id))
          .where(and(...conditions))
          .groupBy(expenses.categoryId, categories.name)
          .orderBy(desc(sql`sum(${expenses.amount})`))

        // By branch
        const expensesByBranch = await db
          .select({
            branchId: expenses.branchId,
            branchName: branches.name,
            amount: sql<number>`sum(${expenses.amount})`,
            count: sql<number>`count(*)`,
          })
          .from(expenses)
          .innerJoin(branches, eq(expenses.branchId, branches.id))
          .where(and(...conditions))
          .groupBy(expenses.branchId, branches.name)

        // Top expenses
        const topExpenses = await db
          .select({
            id: expenses.id,
            categoryId: expenses.categoryId,
            category: categories.name,
            amount: expenses.amount,
            description: expenses.description,
            date: expenses.expenseDate,
            branchName: branches.name,
          })
          .from(expenses)
          .innerJoin(branches, eq(expenses.branchId, branches.id))
          .innerJoin(categories, eq(expenses.categoryId, categories.id))
          .where(and(...conditions))
          .orderBy(desc(expenses.amount))
          .limit(10)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'expense',
          description: `Generated expense report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            expensesByCategory,
            expensesByBranch,
            topExpenses,
          },
        }
      } catch (error) {
        console.error('Expense report error:', error)
        return { success: false, message: 'Failed to generate expense report' }
      }
    }
  )

  // Purchase Report
  ipcMain.handle(
    'reports:purchases-report',
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

        const conditions = [between(purchases.createdAt, startDate, endDate)]
        if (branchId) conditions.push(eq(purchases.branchId, branchId))

        // Summary
        const summary = await db
          .select({
            totalPurchases: sql<number>`count(*)`,
            totalCost: sql<number>`sum(${purchases.totalAmount})`,
            avgPurchaseValue: sql<number>`avg(${purchases.totalAmount})`,
            pendingPayments: sql<number>`sum(case when ${purchases.paymentStatus} = 'pending' then ${purchases.totalAmount} else 0 end)`,
          })
          .from(purchases)
          .where(and(...conditions))

        // By supplier
        const purchasesBySupplier = await db
          .select({
            supplierId: purchases.supplierId,
            supplierName: suppliers.name,
            totalPurchases: sql<number>`count(*)`,
            totalAmount: sql<number>`sum(${purchases.totalAmount})`,
          })
          .from(purchases)
          .innerJoin(suppliers, eq(purchases.supplierId, suppliers.id))
          .where(and(...conditions))
          .groupBy(purchases.supplierId, suppliers.name)
          .orderBy(desc(sql`sum(${purchases.totalAmount})`))

        // By status
        const purchasesByStatus = await db
          .select({
            status: purchases.status,
            count: sql<number>`count(*)`,
            totalAmount: sql<number>`sum(${purchases.totalAmount})`,
          })
          .from(purchases)
          .where(and(...conditions))
          .groupBy(purchases.status)

        // Recent purchases
        const recentPurchases = await db
          .select({
            id: purchases.id,
            purchaseOrderNumber: purchases.purchaseOrderNumber,
            supplierName: suppliers.name,
            totalAmount: purchases.totalAmount,
            status: purchases.status,
            createdAt: purchases.createdAt,
          })
          .from(purchases)
          .innerJoin(suppliers, eq(purchases.supplierId, suppliers.id))
          .where(and(...conditions))
          .orderBy(desc(purchases.createdAt))
          .limit(20)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'purchase',
          description: `Generated purchase report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            purchasesBySupplier,
            purchasesByStatus,
            recentPurchases,
          },
        }
      } catch (error) {
        console.error('Purchase report error:', error)
        return { success: false, message: 'Failed to generate purchase report' }
      }
    }
  )

  // Returns Report
  ipcMain.handle(
    'reports:returns-report',
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

        const conditions = [between(returns.returnDate, startDate, endDate)]
        if (branchId) conditions.push(eq(returns.branchId, branchId))

        // Total sales for return rate calculation
        const totalSalesResult = await db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(sales)
          .where(between(sales.saleDate, startDate, endDate))

        // Summary
        const summary = await db
          .select({
            totalReturns: sql<number>`count(*)`,
            totalValue: sql<number>`sum(${returns.totalAmount})`,
          })
          .from(returns)
          .where(and(...conditions))

        const totalSales = totalSalesResult[0]?.count || 0
        const returnRate = totalSales > 0 ? (summary[0]?.totalReturns / totalSales) * 100 : 0

        // By reason
        const returnsByReason = await db
          .select({
            reason: returns.reason,
            count: sql<number>`count(*)`,
            value: sql<number>`sum(${returns.totalAmount})`,
          })
          .from(returns)
          .where(and(...conditions))
          .groupBy(returns.reason)
          .orderBy(desc(sql`count(*)`))

        // By product
        const returnsByProduct = await db
          .select({
            productId: returnItems.productId,
            productName: products.name,
            returnCount: sql<number>`sum(${returnItems.quantity})`,
            totalValue: sql<number>`sum(${returnItems.totalPrice})`,
          })
          .from(returnItems)
          .innerJoin(returns, eq(returnItems.returnId, returns.id))
          .innerJoin(products, eq(returnItems.productId, products.id))
          .where(and(...conditions))
          .groupBy(returnItems.productId, products.name)
          .orderBy(desc(sql`sum(${returnItems.quantity})`))
          .limit(10)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'return',
          description: `Generated returns report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: {
              ...summary[0],
              returnRate,
            },
            returnsByReason,
            returnsByProduct,
          },
        }
      } catch (error) {
        console.error('Returns report error:', error)
        return { success: false, message: 'Failed to generate returns report' }
      }
    }
  )

  // Commissions Report
  ipcMain.handle(
    'reports:commissions-report',
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

        const conditions = [between(commissions.createdAt, startDate, endDate)]
        if (branchId) conditions.push(eq(commissions.branchId, branchId))

        // Summary
        const summary = await db
          .select({
            totalCommissions: sql<number>`sum(${commissions.commissionAmount})`,
            commissionCount: sql<number>`count(*)`,
            avgCommission: sql<number>`avg(${commissions.commissionAmount})`,
          })
          .from(commissions)
          .where(and(...conditions))

        // By salesperson
        const commissionsBySalesperson = await db
          .select({
            userId: commissions.userId,
            userName: users.fullName,
            totalCommission: sql<number>`sum(${commissions.commissionAmount})`,
            salesCount: sql<number>`count(*)`,
          })
          .from(commissions)
          .innerJoin(users, eq(commissions.userId, users.id))
          .where(and(...conditions))
          .groupBy(commissions.userId, users.fullName)
          .orderBy(desc(sql`sum(${commissions.commissionAmount})`))

        // Recent commissions
        const recentCommissions = await db
          .select({
            id: commissions.id,
            userName: users.fullName,
            saleInvoice: sales.invoiceNumber,
            amount: commissions.commissionAmount,
            date: commissions.createdAt,
          })
          .from(commissions)
          .innerJoin(users, eq(commissions.userId, users.id))
          .innerJoin(sales, eq(commissions.saleId, sales.id))
          .where(and(...conditions))
          .orderBy(desc(commissions.createdAt))
          .limit(20)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'commission',
          description: `Generated commission report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            commissionsBySalesperson,
            recentCommissions,
          },
        }
      } catch (error) {
        console.error('Commission report error:', error)
        return { success: false, message: 'Failed to generate commission report' }
      }
    }
  )

  // Tax Report
  ipcMain.handle(
    'reports:tax-report',
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

        const conditions = [
          between(sales.saleDate, startDate, endDate),
          eq(sales.isVoided, false),
        ]
        if (branchId) conditions.push(eq(sales.branchId, branchId))

        // Summary
        const summary = await db
          .select({
            totalTaxCollected: sql<number>`sum(${sales.taxAmount})`,
            taxableSales: sql<number>`count(*)`,
            avgTaxPerSale: sql<number>`avg(${sales.taxAmount})`,
          })
          .from(sales)
          .where(and(...conditions))

        // By branch
        const taxByBranch = await db
          .select({
            branchId: sales.branchId,
            branchName: branches.name,
            taxCollected: sql<number>`sum(${sales.taxAmount})`,
          })
          .from(sales)
          .innerJoin(branches, eq(sales.branchId, branches.id))
          .where(and(...conditions))
          .groupBy(sales.branchId, branches.name)

        // By payment method
        const taxByPaymentMethod = await db
          .select({
            paymentMethod: sales.paymentMethod,
            taxCollected: sql<number>`sum(${sales.taxAmount})`,
            salesCount: sql<number>`count(*)`,
          })
          .from(sales)
          .where(and(...conditions))
          .groupBy(sales.paymentMethod)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'sale',
          description: `Generated tax report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            taxByBranch,
            taxByPaymentMethod,
          },
        }
      } catch (error) {
        console.error('Tax report error:', error)
        return { success: false, message: 'Failed to generate tax report' }
      }
    }
  )

  // Branch Performance Report
  ipcMain.handle(
    'reports:branch-performance',
    async (
      _,
      params: {
        startDate: string
        endDate: string
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { startDate, endDate } = params

        // Get all branches
        const allBranches = await db.select().from(branches)

        // Calculate metrics for each branch
        const branchMetrics = await Promise.all(
          allBranches.map(async (branch) => {
            // Revenue
            const revenueResult = await db
              .select({
                revenue: sql<number>`sum(${sales.totalAmount})`,
                salesCount: sql<number>`count(*)`,
              })
              .from(sales)
              .where(
                and(
                  eq(sales.branchId, branch.id),
                  between(sales.saleDate, startDate, endDate),
                  eq(sales.isVoided, false)
                )
              )

            // Expenses
            const expenseResult = await db
              .select({
                expenses: sql<number>`sum(${expenses.amount})`,
              })
              .from(expenses)
              .where(
                and(
                  eq(expenses.branchId, branch.id),
                  between(expenses.expenseDate, startDate, endDate)
                )
              )

            // Inventory value
            const inventoryResult = await db
              .select({
                inventoryValue: sql<number>`sum(${inventory.quantity} * ${products.costPrice})`,
              })
              .from(inventory)
              .innerJoin(products, eq(inventory.productId, products.id))
              .where(eq(inventory.branchId, branch.id))

            const revenue = revenueResult[0]?.revenue || 0
            const expenseAmount = expenseResult[0]?.expenses || 0
            const profit = revenue - expenseAmount

            return {
              branchId: branch.id,
              branchName: branch.name,
              revenue,
              expenses: expenseAmount,
              profit,
              salesCount: revenueResult[0]?.salesCount || 0,
              inventoryValue: inventoryResult[0]?.inventoryValue || 0,
            }
          })
        )

        // Summary
        const totalRevenue = branchMetrics.reduce((sum, b) => sum + b.revenue, 0)
        const totalProfit = branchMetrics.reduce((sum, b) => sum + b.profit, 0)

        // Top performing branch
        const topBranch = branchMetrics.reduce((top, current) =>
          current.revenue > top.revenue ? current : top
        )

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'view',
          entityType: 'branch',
          description: `Generated branch performance report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: {
              totalBranches: allBranches.length,
              totalRevenue,
              totalProfit,
            },
            branchMetrics,
            topPerformingBranch: {
              branchId: topBranch.branchId,
              branchName: topBranch.branchName,
              revenue: topBranch.revenue,
            },
          },
        }
      } catch (error) {
        console.error('Branch performance report error:', error)
        return { success: false, message: 'Failed to generate branch performance report' }
      }
    }
  )

  // Cash Flow Report
  ipcMain.handle(
    'reports:cash-flow',
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

        const conditions = branchId ? [eq(sales.branchId, branchId)] : []
        const expenseConditions = branchId ? [eq(expenses.branchId, branchId)] : []

        // Cash in from sales
        const salesCash = await db
          .select({
            total: sql<number>`sum(${sales.totalAmount})`,
          })
          .from(sales)
          .where(
            and(
              between(sales.saleDate, startDate, endDate),
              eq(sales.isVoided, false),
              ...conditions
            )
          )

        // Cash out - Purchases
        const purchasesCash = await db
          .select({
            total: sql<number>`sum(${purchases.totalAmount})`,
          })
          .from(purchases)
          .where(
            and(
              between(purchases.createdAt, startDate, endDate),
              eq(purchases.paymentStatus, 'paid'),
              branchId ? eq(purchases.branchId, branchId) : undefined
            )
          )

        // Cash out - Expenses
        const expensesCash = await db
          .select({
            total: sql<number>`sum(${expenses.amount})`,
          })
          .from(expenses)
          .where(and(between(expenses.expenseDate, startDate, endDate), ...expenseConditions))

        // Cash out - Commissions
        const commissionsCash = await db
          .select({
            total: sql<number>`sum(${commissions.commissionAmount})`,
          })
          .from(commissions)
          .where(
            and(
              between(commissions.createdAt, startDate, endDate),
              eq(commissions.status, 'paid'),
              branchId ? eq(commissions.branchId, branchId) : undefined
            )
          )

        // Cash out - Refunds
        const refundsCash = await db
          .select({
            total: sql<number>`sum(${returns.refundAmount})`,
          })
          .from(returns)
          .where(
            and(
              between(returns.returnDate, startDate, endDate),
              branchId ? eq(returns.branchId, branchId) : undefined
            )
          )

        const cashIn = salesCash[0]?.total || 0
        const cashOutPurchases = purchasesCash[0]?.total || 0
        const cashOutExpenses = expensesCash[0]?.total || 0
        const cashOutCommissions = commissionsCash[0]?.total || 0
        const cashOutRefunds = refundsCash[0]?.total || 0
        const totalCashOut =
          cashOutPurchases + cashOutExpenses + cashOutCommissions + cashOutRefunds

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'sale',
          description: `Generated cash flow report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: {
              cashIn,
              cashOut: totalCashOut,
              netCashFlow: cashIn - totalCashOut,
              openingBalance: 0,
              closingBalance: cashIn - totalCashOut,
            },
            cashInBreakdown: {
              sales: cashIn,
              receivables: 0,
              other: 0,
            },
            cashOutBreakdown: {
              purchases: cashOutPurchases,
              expenses: cashOutExpenses,
              commissions: cashOutCommissions,
              refunds: cashOutRefunds,
            },
            cashByBranch: [],
          },
        }
      } catch (error) {
        console.error('Cash flow report error:', error)
        return { success: false, message: 'Failed to generate cash flow report' }
      }
    }
  )

  // Audit Trail Report
  ipcMain.handle(
    'reports:audit-trail',
    async (
      _,
      params: {
        branchId?: number
        startDate: string
        endDate: string
        userId?: number
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { branchId, startDate, endDate, userId } = params

        const conditions = [between(auditLogs.createdAt, startDate, endDate)]
        if (branchId) conditions.push(eq(auditLogs.branchId, branchId))
        if (userId) conditions.push(eq(auditLogs.userId, userId))

        // Summary
        const summary = await db
          .select({
            totalActions: sql<number>`count(*)`,
            uniqueUsers: sql<number>`count(distinct ${auditLogs.userId})`,
          })
          .from(auditLogs)
          .where(and(...conditions))

        // By user
        const actionsByUser = await db
          .select({
            userId: auditLogs.userId,
            userName: users.fullName,
            actionCount: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(and(...conditions))
          .groupBy(auditLogs.userId, users.fullName)
          .orderBy(desc(sql`count(*)`))

        // By type
        const actionsByType = await db
          .select({
            action: auditLogs.action,
            count: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .where(and(...conditions))
          .groupBy(auditLogs.action)
          .orderBy(desc(sql`count(*)`))

        // Recent actions
        const recentActions = await db
          .select({
            id: auditLogs.id,
            userName: users.fullName,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            description: auditLogs.description,
            timestamp: auditLogs.createdAt,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(and(...conditions))
          .orderBy(desc(auditLogs.createdAt))
          .limit(50)

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'auth',
          description: `Generated audit trail report: ${startDate} to ${endDate}`,
        })

        return {
          success: true,
          data: {
            summary: summary[0],
            actionsByUser,
            actionsByType,
            recentActions,
          },
        }
      } catch (error) {
        console.error('Audit trail report error:', error)
        return { success: false, message: 'Failed to generate audit trail report' }
      }
    }
  )

  // Comprehensive Audit Report (Admin Only)
  ipcMain.handle(
    'reports:comprehensive-audit',
    async (
      _,
      params: {
        branchId?: number
        timePeriod: TimePeriod
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        // Verify admin role
        if (session?.role !== 'admin') {
          return {
            success: false,
            message: 'Unauthorized: Admin access required'
          }
        }

        const { branchId, timePeriod, startDate, endDate } = params

        // Get date range
        const dateRange = getDateRange(timePeriod, startDate, endDate)

        const salesConditions = [
          between(sales.saleDate, dateRange.start, dateRange.end),
          eq(sales.isVoided, false),
        ]
        if (branchId) salesConditions.push(eq(sales.branchId, branchId))

        const expenseConditions = [
          between(expenses.expenseDate, dateRange.start, dateRange.end),
        ]
        if (branchId) expenseConditions.push(eq(expenses.branchId, branchId))

        const purchaseConditions = [
          between(purchases.createdAt, dateRange.start, dateRange.end),
        ]
        if (branchId) purchaseConditions.push(eq(purchases.branchId, branchId))

        const returnConditions = [
          between(returns.returnDate, dateRange.start, dateRange.end),
        ]
        if (branchId) returnConditions.push(eq(returns.branchId, branchId))

        // Sales Summary
        const salesSummary = await db
          .select({
            totalSales: sql<number>`count(*)`,
            totalRevenue: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
            avgOrderValue: sql<number>`coalesce(avg(${sales.totalAmount}), 0)`,
            totalTax: sql<number>`coalesce(sum(${sales.taxAmount}), 0)`,
          })
          .from(sales)
          .where(and(...salesConditions))

        // Sales by Payment Method
        const salesByPaymentMethod = await db
          .select({
            paymentMethod: sales.paymentMethod,
            count: sql<number>`count(*)`,
            total: sql<number>`sum(${sales.totalAmount})`,
          })
          .from(sales)
          .where(and(...salesConditions))
          .groupBy(sales.paymentMethod)

        // Top 10 Selling Products
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
          .where(and(...salesConditions))
          .groupBy(saleItems.productId, products.name, products.code)
          .orderBy(desc(sql`sum(${saleItems.quantity})`))
          .limit(10)

        // Inventory Summary
        let inventoryQuery = db
          .select({
            totalProducts: sql<number>`count(distinct ${inventory.productId})`,
            totalValue: sql<number>`coalesce(sum(${inventory.quantity} * ${products.costPrice}), 0)`,
            lowStockItems: sql<number>`sum(case when ${inventory.quantity} < ${inventory.minQuantity} then 1 else 0 end)`,
            outOfStockItems: sql<number>`sum(case when ${inventory.quantity} = 0 then 1 else 0 end)`,
          })
          .from(inventory)
          .innerJoin(products, eq(inventory.productId, products.id))

        if (branchId) {
          inventoryQuery = inventoryQuery.where(eq(inventory.branchId, branchId))
        }

        const inventorySummary = await inventoryQuery

        // Purchases Summary
        const purchasesSummary = await db
          .select({
            totalPurchases: sql<number>`count(*)`,
            totalCost: sql<number>`coalesce(sum(${purchases.totalAmount}), 0)`,
            avgPurchaseValue: sql<number>`coalesce(avg(${purchases.totalAmount}), 0)`,
          })
          .from(purchases)
          .where(and(...purchaseConditions))

        // Expenses Summary
        const expensesSummary = await db
          .select({
            totalExpenses: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
            expenseCount: sql<number>`count(*)`,
            avgExpense: sql<number>`coalesce(avg(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(and(...expenseConditions))

        // Expenses by Category
        const expensesByCategory = await db
          .select({
            categoryId: expenses.categoryId,
            category: categories.name,
            amount: sql<number>`sum(${expenses.amount})`,
            count: sql<number>`count(*)`,
          })
          .from(expenses)
          .innerJoin(categories, eq(expenses.categoryId, categories.id))
          .where(and(...expenseConditions))
          .groupBy(expenses.categoryId, categories.name)
          .orderBy(desc(sql`sum(${expenses.amount})`))

        // Returns Summary
        const returnsSummary = await db
          .select({
            totalReturns: sql<number>`count(*)`,
            totalRefundAmount: sql<number>`coalesce(sum(${returns.refundAmount}), 0)`,
          })
          .from(returns)
          .where(and(...returnConditions))

        const totalSales = salesSummary[0]?.totalSales || 0
        const returnRate = totalSales > 0
          ? ((returnsSummary[0]?.totalReturns || 0) / totalSales) * 100
          : 0

        // Commissions Summary
        const commissionsConditions = [
          between(commissions.createdAt, dateRange.start, dateRange.end),
        ]
        if (branchId) commissionsConditions.push(eq(commissions.branchId, branchId))

        const commissionsSummary = await db
          .select({
            totalCommission: sql<number>`coalesce(sum(${commissions.commissionAmount}), 0)`,
            commissionCount: sql<number>`count(*)`,
            avgCommission: sql<number>`coalesce(avg(${commissions.commissionAmount}), 0)`,
          })
          .from(commissions)
          .where(and(...commissionsConditions))

        // Financial Summary calculations
        const grossRevenue = salesSummary[0]?.totalRevenue || 0
        const refunds = returnsSummary[0]?.totalRefundAmount || 0
        const netRevenue = grossRevenue - refunds

        // Calculate COGS from sold items
        const cogsResult = await db
          .select({
            cogs: sql<number>`coalesce(sum(${saleItems.quantity} * ${products.costPrice}), 0)`,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(and(...salesConditions))

        const cogs = cogsResult[0]?.cogs || 0
        const grossProfit = netRevenue - cogs
        const totalExpenses = expensesSummary[0]?.totalExpenses || 0
        const netProfit = grossProfit - totalExpenses
        const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0

        // Audit Logs (last 50 records)
        const auditLogConditions = [
          between(auditLogs.createdAt, dateRange.start, dateRange.end),
        ]
        if (branchId) auditLogConditions.push(eq(auditLogs.branchId, branchId))

        const auditLogsData = await db
          .select({
            id: auditLogs.id,
            userName: users.fullName,
            action: auditLogs.action,
            tableName: auditLogs.entityType,
            timestamp: auditLogs.createdAt,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(and(...auditLogConditions))
          .orderBy(desc(auditLogs.createdAt))
          .limit(50)

        // Format userName for records without user
        const formattedAuditLogs = auditLogsData.map(log => ({
          id: log.id,
          userName: log.userName || 'System',
          action: log.action,
          tableName: log.tableName,
          timestamp: log.timestamp,
        }))

        await createAuditLog({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: 'view',
          entityType: 'audit',
          description: `Generated comprehensive audit report: ${getPeriodLabel(timePeriod, startDate, endDate)}`,
        })

        return {
          success: true,
          data: {
            salesSummary: salesSummary[0],
            salesByPaymentMethod,
            topProducts,
            inventorySummary: inventorySummary[0],
            purchasesSummary: purchasesSummary[0],
            expensesSummary: expensesSummary[0],
            expensesByCategory,
            returnsSummary: {
              ...returnsSummary[0],
              returnRate,
            },
            financialSummary: {
              grossRevenue,
              refunds,
              netRevenue,
              cogs,
              grossProfit,
              expenses: totalExpenses,
              netProfit,
              profitMargin,
            },
            commissionsSummary: commissionsSummary[0],
            auditLogs: formattedAuditLogs,
          },
        }
      } catch (error) {
        console.error('Comprehensive audit report error:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        return { success: false, message: 'Failed to generate comprehensive audit report' }
      }
    }
  )

  // PDF Export Handler
  ipcMain.handle(
    'reports:export-pdf',
    async (
      _,
      params: {
        reportType: ReportType
        data: any
        filters: {
          timePeriod: TimePeriod
          startDate?: string
          endDate?: string
          branchName?: string
        }
      }
    ) => {
      try {
        const session = getCurrentSession()
        const { reportType, data, filters } = params

        // Get business info from settings (optional)
        const businessInfo = {
          name: 'Firearms Retail POS',
          address: '',
          phone: '',
          email: '',
        }

        const filePath = await generateReportPDF({
          reportType,
          data,
          filters,
          businessInfo,
        })

        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'export',
          entityType: 'sale',
          description: `Exported ${reportType} report to PDF`,
        })

        return {
          success: true,
          filePath,
        }
      } catch (error) {
        console.error('PDF export error:', error)
        return { success: false, message: 'Failed to export PDF' }
      }
    }
  )
}
