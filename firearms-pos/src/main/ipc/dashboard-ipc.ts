import { ipcMain } from 'electron'
import { eq, and, sql, between, or, lte, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  products,
  inventory,
  purchases,
  expenses,
  returns,
  accountReceivables,
  receivablePayments,
  accountPayables,
  payablePayments,
  cashRegisterSessions,
  cashTransactions,
  commissions,
} from '../db/schema'
import { getDateRange, type TimePeriod } from '../utils/date-helpers'

interface DashboardParams {
  branchId: number
  timePeriod: TimePeriod
}

interface DashboardStats {
  totalProfit: number
  totalProducts: number
  totalProductsSold: number
  totalPurchases: number
  totalExpense: number
  totalReturns: number
  receivablesPending: number
  receivablesReceived: number
  payablesPending: number
  payablesPaid: number
  cashInHand: number
  lowStockCount: number
}

export function registerDashboardHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('dashboard:get-stats', async (_, params: DashboardParams) => {
    try {
      const { branchId, timePeriod } = params
      const dateRange = getDateRange(timePeriod)

      // 1. Total Profit calculation
      // Revenue = sum(unitPrice * quantity)
      // Cost = sum(costPrice * quantity)
      // Tax = sum(taxAmount)
      const profitResult = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(${saleItems.unitPrice} * ${saleItems.quantity}), 0)`,
          cost: sql<number>`COALESCE(SUM(${saleItems.costPrice} * ${saleItems.quantity}), 0)`,
          tax: sql<number>`COALESCE(SUM(${saleItems.taxAmount}), 0)`,
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(
          and(
            eq(sales.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      // Get commission total for the period
      const commissionResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
        })
        .from(commissions)
        .innerJoin(sales, eq(commissions.saleId, sales.id))
        .where(
          and(
            eq(commissions.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      const revenue = profitResult[0]?.revenue || 0
      const cost = profitResult[0]?.cost || 0
      const tax = profitResult[0]?.tax || 0
      const commissionTotal = commissionResult[0]?.total || 0
      const totalProfit = revenue - cost - commissionTotal - tax

      // 2. Total Products (active)
      const productsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(eq(products.isActive, true))

      // 3. Total Products Sold (quantity sum)
      const soldResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)`,
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(
          and(
            eq(sales.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      // 4. Total Purchases (amount sum)
      const purchasesResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.branchId, branchId),
            between(purchases.createdAt, dateRange.start, dateRange.end)
          )
        )

      // 5. Total Expense
      const expensesResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.branchId, branchId),
            between(expenses.expenseDate, dateRange.start, dateRange.end)
          )
        )

      // 6. Total Returns
      const returnsResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${returns.totalAmount}), 0)`,
        })
        .from(returns)
        .where(
          and(
            eq(returns.branchId, branchId),
            between(returns.returnDate, dateRange.start, dateRange.end)
          )
        )

      // 7. Receivables Pending (status = pending/partial/overdue)
      const receivablesPendingResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`,
        })
        .from(accountReceivables)
        .where(
          and(
            eq(accountReceivables.branchId, branchId),
            or(
              eq(accountReceivables.status, 'pending'),
              eq(accountReceivables.status, 'partial'),
              eq(accountReceivables.status, 'overdue')
            )
          )
        )

      // 8. Receivables Received (payments in period)
      const receivablesReceivedResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${receivablePayments.amount}), 0)`,
        })
        .from(receivablePayments)
        .innerJoin(
          accountReceivables,
          eq(receivablePayments.receivableId, accountReceivables.id)
        )
        .where(
          and(
            eq(accountReceivables.branchId, branchId),
            between(receivablePayments.paymentDate, dateRange.start, dateRange.end)
          )
        )

      // 9. Payables Pending
      const payablesPendingResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`,
        })
        .from(accountPayables)
        .where(
          and(
            eq(accountPayables.branchId, branchId),
            or(
              eq(accountPayables.status, 'pending'),
              eq(accountPayables.status, 'partial'),
              eq(accountPayables.status, 'overdue')
            )
          )
        )

      // 10. Payables Paid (payments in period)
      const payablesPaidResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${payablePayments.amount}), 0)`,
        })
        .from(payablePayments)
        .innerJoin(accountPayables, eq(payablePayments.payableId, accountPayables.id))
        .where(
          and(
            eq(accountPayables.branchId, branchId),
            between(payablePayments.paymentDate, dateRange.start, dateRange.end)
          )
        )

      // 11. Cash In Hand (from current open session or last closed session)
      let cashInHand = 0
      const today = new Date().toISOString().split('T')[0]

      // Try to get open session first
      const openSession = await db.query.cashRegisterSessions.findFirst({
        where: and(
          eq(cashRegisterSessions.branchId, branchId),
          eq(cashRegisterSessions.sessionDate, today),
          eq(cashRegisterSessions.status, 'open')
        ),
      })

      if (openSession) {
        // Calculate current balance from transactions
        const txSums = await db
          .select({
            totalIn: sql<number>`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} > 0 THEN ${cashTransactions.amount} ELSE 0 END), 0)`,
            totalOut: sql<number>`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} < 0 THEN ABS(${cashTransactions.amount}) ELSE 0 END), 0)`,
          })
          .from(cashTransactions)
          .where(eq(cashTransactions.sessionId, openSession.id))

        const totalIn = txSums[0]?.totalIn || 0
        const totalOut = txSums[0]?.totalOut || 0
        cashInHand = openSession.openingBalance + totalIn - totalOut
      } else {
        // Get last closed session's closing balance
        const lastClosed = await db.query.cashRegisterSessions.findFirst({
          where: and(
            eq(cashRegisterSessions.branchId, branchId),
            eq(cashRegisterSessions.status, 'closed')
          ),
          orderBy: desc(cashRegisterSessions.sessionDate),
        })
        cashInHand = lastClosed?.closingBalance || 0
      }

      // 12. Low Stock Count
      const lowStockResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(inventory)
        .where(
          and(
            eq(inventory.branchId, branchId),
            lte(inventory.quantity, inventory.minQuantity)
          )
        )

      const stats: DashboardStats = {
        totalProfit,
        totalProducts: productsResult[0]?.count || 0,
        totalProductsSold: soldResult[0]?.total || 0,
        totalPurchases: purchasesResult[0]?.total || 0,
        totalExpense: expensesResult[0]?.total || 0,
        totalReturns: returnsResult[0]?.total || 0,
        receivablesPending: receivablesPendingResult[0]?.total || 0,
        receivablesReceived: receivablesReceivedResult[0]?.total || 0,
        payablesPending: payablesPendingResult[0]?.total || 0,
        payablesPaid: payablesPaidResult[0]?.total || 0,
        cashInHand,
        lowStockCount: lowStockResult[0]?.count || 0,
      }

      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return { success: false, message: 'Failed to fetch dashboard stats' }
    }
  })
}
