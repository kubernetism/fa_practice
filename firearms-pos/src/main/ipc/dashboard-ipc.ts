import { ipcMain } from 'electron'
import { eq, and, sql, between, or, lte, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales,
  saleItems,
  saleServices,
  products,
  inventory,
  purchases,
  expenses,
  returns,
  returnItems,
  accountReceivables,
  receivablePayments,
  accountPayables,
  payablePayments,
  cashRegisterSessions,
  cashTransactions,
  commissions,
} from '../db/schema'
import { getDateRange, type TimePeriod } from '../utils/date-helpers'

type ChartFilter = 'revenue_profit' | 'products' | 'services' | 'expenses' | 'purchases' | 'returns'

interface DashboardParams {
  branchId: number
  timePeriod: TimePeriod
  customStart?: string
  customEnd?: string
}

interface TrendParams {
  branchId: number
  timePeriod: TimePeriod
  chartFilter: ChartFilter
  customStart?: string
  customEnd?: string
}

interface DashboardStats {
  totalProfit: number
  totalRevenue: number
  grossRevenue: number
  totalCost: number
  totalTaxCollected: number
  totalCommission: number
  totalProducts: number
  totalProductsSold: number
  totalPurchases: number
  totalExpense: number
  totalReturns: number
  returnDeductions: number
  receivablesPending: number
  receivablesReceived: number
  payablesPending: number
  payablesPaid: number
  cashInHand: number
  lowStockCount: number
  totalDiscount: number
  totalSalesCount: number
}

export function registerDashboardHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('dashboard:get-stats', async (_, params: DashboardParams) => {
    try {
      const { branchId, timePeriod, customStart, customEnd } = params
      const dateRange = getDateRange(timePeriod, customStart, customEnd)

      // 1. Total Profit calculation
      // Revenue = sum(unitPrice * quantity)  for products
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

      // Service revenue (services have no cost, so full amount is profit)
      const serviceResult = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(${saleServices.totalAmount}), 0)`,
          tax: sql<number>`COALESCE(SUM(${saleServices.taxAmount}), 0)`,
        })
        .from(saleServices)
        .innerJoin(sales, eq(saleServices.saleId, sales.id))
        .where(
          and(
            eq(sales.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      // Get PAID commission total for the period (only paid commissions affect profit)
      const commissionResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
        })
        .from(commissions)
        .innerJoin(sales, eq(commissions.saleId, sales.id))
        .where(
          and(
            eq(commissions.branchId, branchId),
            eq(commissions.status, 'paid'),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      // Get total sale-level discounts for the period
      const discountResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${sales.discountAmount}), 0)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      const productRevenue = profitResult[0]?.revenue || 0
      const productCost = profitResult[0]?.cost || 0
      const productTax = profitResult[0]?.tax || 0
      const svcRevenue = serviceResult[0]?.revenue || 0
      const svcTax = serviceResult[0]?.tax || 0
      const grossRevenue = productRevenue + svcRevenue
      const grossCost = productCost // services have no COGS
      const grossTax = productTax + svcTax
      const commissionTotal = commissionResult[0]?.total || 0
      const totalDiscount = discountResult[0]?.total || 0

      // Calculate return deductions for the period
      const returnDeductions = await db
        .select({
          returnRevenue: sql<number>`COALESCE(SUM(${returnItems.unitPrice} * ${returnItems.quantity}), 0)`,
          returnCost: sql<number>`COALESCE(SUM(CASE WHEN ${returnItems.restockable} = 1 THEN ${returnItems.costPrice} * ${returnItems.quantity} ELSE 0 END), 0)`,
          returnTax: sql<number>`COALESCE(SUM(${returns.taxAmount}), 0)`,
        })
        .from(returnItems)
        .innerJoin(returns, eq(returnItems.returnId, returns.id))
        .where(
          and(
            eq(returns.branchId, branchId),
            between(returns.returnDate, dateRange.start, dateRange.end)
          )
        )

      const returnRevenue = returnDeductions[0]?.returnRevenue || 0
      const returnCost = returnDeductions[0]?.returnCost || 0
      const returnTax = returnDeductions[0]?.returnTax || 0

      const revenue = grossRevenue - returnRevenue - totalDiscount
      const cost = grossCost - returnCost
      const taxCollected = grossTax - returnTax
      const totalProfit = revenue - cost - commissionTotal - taxCollected

      // Get total sales count
      const salesCountResult = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.branchId, branchId),
            between(sales.saleDate, dateRange.start, dateRange.end),
            eq(sales.isVoided, false)
          )
        )

      // 2. Total Products (active)
      const productsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(eq(products.isActive, true))

      // 3. Total Products Sold (quantity sum minus returned quantities)
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

      const returnedQtyResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${returnItems.quantity}), 0)`,
        })
        .from(returnItems)
        .innerJoin(returns, eq(returnItems.returnId, returns.id))
        .where(
          and(
            eq(returns.branchId, branchId),
            between(returns.returnDate, dateRange.start, dateRange.end)
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
        totalRevenue: revenue,
        grossRevenue,
        totalCost: cost,
        totalTaxCollected: taxCollected,
        totalCommission: commissionTotal,
        totalDiscount,
        returnDeductions: returnRevenue,
        totalProducts: productsResult[0]?.count || 0,
        totalProductsSold: (soldResult[0]?.total || 0) - (returnedQtyResult[0]?.total || 0),
        totalPurchases: purchasesResult[0]?.total || 0,
        totalExpense: expensesResult[0]?.total || 0,
        totalReturns: returnsResult[0]?.total || 0,
        receivablesPending: receivablesPendingResult[0]?.total || 0,
        receivablesReceived: receivablesReceivedResult[0]?.total || 0,
        payablesPending: payablesPendingResult[0]?.total || 0,
        payablesPaid: payablesPaidResult[0]?.total || 0,
        cashInHand,
        lowStockCount: lowStockResult[0]?.count || 0,
        totalSalesCount: salesCountResult[0]?.count || 0,
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

  ipcMain.handle('dashboard:get-trend-data', async (_, params: TrendParams) => {
    try {
      const { branchId, timePeriod, chartFilter, customStart, customEnd } = params
      const dateRange = getDateRange(timePeriod, customStart, customEnd)

      // Helper to build time-group expressions based on a date column
      function timeExprs(dateCol: ReturnType<typeof sql>) {
        if (timePeriod === 'daily') {
          return {
            groupExpr: sql`strftime('%H', ${dateCol})`,
            labelExpr: sql<string>`strftime('%H:00', ${dateCol})`,
          }
        } else if (timePeriod === 'weekly') {
          return {
            groupExpr: sql`strftime('%Y-%m-%d', ${dateCol})`,
            labelExpr: sql<string>`strftime('%a', ${dateCol})`,
          }
        } else if (timePeriod === 'monthly') {
          return {
            groupExpr: sql`strftime('%Y-%m-%d', ${dateCol})`,
            labelExpr: sql<string>`strftime('%d', ${dateCol})`,
          }
        } else {
          return {
            groupExpr: sql`strftime('%Y-%m', ${dateCol})`,
            labelExpr: sql<string>`strftime('%b', ${dateCol})`,
          }
        }
      }

      // ── Revenue & Profit ──
      if (chartFilter === 'revenue_profit') {
        const { groupExpr, labelExpr } = timeExprs(sql`${sales.saleDate}`)

        // Product revenue by time group
        const productRows = await db
          .select({
            label: labelExpr,
            revenue: sql<number>`COALESCE(SUM(${saleItems.unitPrice} * ${saleItems.quantity}), 0)`,
            cost: sql<number>`COALESCE(SUM(${saleItems.costPrice} * ${saleItems.quantity}), 0)`,
            tax: sql<number>`COALESCE(SUM(${saleItems.taxAmount}), 0)`,
            count: sql<number>`COUNT(DISTINCT ${sales.id})`,
            groupKey: groupExpr,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .where(and(eq(sales.branchId, branchId), between(sales.saleDate, dateRange.start, dateRange.end), eq(sales.isVoided, false)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        // Service revenue by time group
        const serviceRows = await db
          .select({
            label: labelExpr,
            revenue: sql<number>`COALESCE(SUM(${saleServices.totalAmount}), 0)`,
            tax: sql<number>`COALESCE(SUM(${saleServices.taxAmount}), 0)`,
            groupKey: groupExpr,
          })
          .from(saleServices)
          .innerJoin(sales, eq(saleServices.saleId, sales.id))
          .where(and(eq(sales.branchId, branchId), between(sales.saleDate, dateRange.start, dateRange.end), eq(sales.isVoided, false)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        // Merge product + service data by label
        const merged = new Map<string, { label: string; revenue: number; cost: number; tax: number; count: number }>()
        for (const r of productRows) {
          merged.set(r.label, {
            label: r.label,
            revenue: Number(r.revenue),
            cost: Number(r.cost),
            tax: Number(r.tax),
            count: Number(r.count),
          })
        }
        for (const r of serviceRows) {
          const existing = merged.get(r.label)
          if (existing) {
            existing.revenue += Number(r.revenue)
            existing.tax += Number(r.tax)
          } else {
            merged.set(r.label, {
              label: r.label,
              revenue: Number(r.revenue),
              cost: 0,
              tax: Number(r.tax),
              count: 0,
            })
          }
        }

        const points = Array.from(merged.values())
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((r) => ({
            label: r.label,
            revenue: r.revenue,
            profit: r.revenue - r.cost - r.tax,
          }))

        const totalSales = Array.from(merged.values()).reduce((s, r) => s + r.count, 0)

        return {
          success: true,
          data: {
            series: ['revenue', 'profit'],
            seriesLabels: { revenue: 'Revenue', profit: 'Profit' },
            seriesColors: { revenue: '#3b82f6', profit: '#22c55e' },
            points,
            badge: `${totalSales} sales`,
          },
        }
      }

      // ── Products (top 5 by revenue) ──
      if (chartFilter === 'products') {
        const { groupExpr, labelExpr } = timeExprs(sql`${sales.saleDate}`)
        // First find top 5 products by revenue in this period
        const topProducts = await db
          .select({
            productId: saleItems.productId,
            name: products.name,
            totalRev: sql<number>`SUM(${saleItems.unitPrice} * ${saleItems.quantity})`,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(and(eq(sales.branchId, branchId), between(sales.saleDate, dateRange.start, dateRange.end), eq(sales.isVoided, false)))
          .groupBy(saleItems.productId)
          .orderBy(sql`SUM(${saleItems.unitPrice} * ${saleItems.quantity}) DESC`)
          .limit(5)

        if (topProducts.length === 0) {
          return { success: true, data: { series: [], seriesLabels: {}, seriesColors: {}, points: [], badge: '0 products' } }
        }

        const productColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
        const series: string[] = []
        const seriesLabels: Record<string, string> = {}
        const seriesColors: Record<string, string> = {}
        topProducts.forEach((p, i) => {
          const key = `p${p.productId}`
          series.push(key)
          seriesLabels[key] = p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name
          seriesColors[key] = productColors[i]
        })

        // Get time-grouped data for each top product
        const productIds = topProducts.map((p) => p.productId)
        const rows = await db
          .select({
            label: labelExpr,
            productId: saleItems.productId,
            revenue: sql<number>`COALESCE(SUM(${saleItems.unitPrice} * ${saleItems.quantity}), 0)`,
            groupKey: groupExpr,
          })
          .from(saleItems)
          .innerJoin(sales, eq(saleItems.saleId, sales.id))
          .where(
            and(
              eq(sales.branchId, branchId),
              between(sales.saleDate, dateRange.start, dateRange.end),
              eq(sales.isVoided, false),
              sql`${saleItems.productId} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`, `)})`
            )
          )
          .groupBy(groupExpr, saleItems.productId)
          .orderBy(groupExpr)

        // Pivot: group by label, spread product revenues
        const pointsMap = new Map<string, Record<string, any>>()
        for (const row of rows) {
          if (!pointsMap.has(row.label)) {
            const point: Record<string, any> = { label: row.label }
            series.forEach((s) => (point[s] = 0))
            pointsMap.set(row.label, point)
          }
          const point = pointsMap.get(row.label)!
          point[`p${row.productId}`] = Number(row.revenue)
        }

        return {
          success: true,
          data: {
            series,
            seriesLabels,
            seriesColors,
            points: Array.from(pointsMap.values()),
            badge: `Top ${topProducts.length} products`,
          },
        }
      }

      // ── Services ──
      if (chartFilter === 'services') {
        const { groupExpr, labelExpr } = timeExprs(sql`${sales.saleDate}`)
        const rows = await db
          .select({
            label: labelExpr,
            revenue: sql<number>`COALESCE(SUM(${saleServices.totalAmount}), 0)`,
            count: sql<number>`COUNT(*)`,
            groupKey: groupExpr,
          })
          .from(saleServices)
          .innerJoin(sales, eq(saleServices.saleId, sales.id))
          .where(and(eq(sales.branchId, branchId), between(sales.saleDate, dateRange.start, dateRange.end), eq(sales.isVoided, false)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        return {
          success: true,
          data: {
            series: ['serviceRevenue'],
            seriesLabels: { serviceRevenue: 'Service Revenue' },
            seriesColors: { serviceRevenue: '#8b5cf6' },
            points: rows.map((r) => ({ label: r.label, serviceRevenue: Number(r.revenue) })),
            badge: `${rows.reduce((s, r) => s + Number(r.count), 0)} services`,
          },
        }
      }

      // ── Expenses ──
      if (chartFilter === 'expenses') {
        const { groupExpr, labelExpr } = timeExprs(sql`${expenses.expenseDate}`)
        const rows = await db
          .select({
            label: labelExpr,
            amount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            count: sql<number>`COUNT(*)`,
            groupKey: groupExpr,
          })
          .from(expenses)
          .where(and(eq(expenses.branchId, branchId), between(expenses.expenseDate, dateRange.start, dateRange.end)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        return {
          success: true,
          data: {
            series: ['expenseAmount'],
            seriesLabels: { expenseAmount: 'Expenses' },
            seriesColors: { expenseAmount: '#ef4444' },
            points: rows.map((r) => ({ label: r.label, expenseAmount: Number(r.amount) })),
            badge: `${rows.reduce((s, r) => s + Number(r.count), 0)} entries`,
          },
        }
      }

      // ── Purchases ──
      if (chartFilter === 'purchases') {
        const { groupExpr, labelExpr } = timeExprs(sql`${purchases.createdAt}`)
        const rows = await db
          .select({
            label: labelExpr,
            amount: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
            count: sql<number>`COUNT(*)`,
            groupKey: groupExpr,
          })
          .from(purchases)
          .where(and(eq(purchases.branchId, branchId), between(purchases.createdAt, dateRange.start, dateRange.end)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        return {
          success: true,
          data: {
            series: ['purchaseAmount'],
            seriesLabels: { purchaseAmount: 'Purchases' },
            seriesColors: { purchaseAmount: '#f59e0b' },
            points: rows.map((r) => ({ label: r.label, purchaseAmount: Number(r.amount) })),
            badge: `${rows.reduce((s, r) => s + Number(r.count), 0)} orders`,
          },
        }
      }

      // ── Returns ──
      if (chartFilter === 'returns') {
        const { groupExpr, labelExpr } = timeExprs(sql`${returns.returnDate}`)
        const rows = await db
          .select({
            label: labelExpr,
            amount: sql<number>`COALESCE(SUM(${returns.totalAmount}), 0)`,
            count: sql<number>`COUNT(*)`,
            groupKey: groupExpr,
          })
          .from(returns)
          .where(and(eq(returns.branchId, branchId), between(returns.returnDate, dateRange.start, dateRange.end)))
          .groupBy(groupExpr)
          .orderBy(groupExpr)

        return {
          success: true,
          data: {
            series: ['returnAmount'],
            seriesLabels: { returnAmount: 'Returns' },
            seriesColors: { returnAmount: '#f97316' },
            points: rows.map((r) => ({ label: r.label, returnAmount: Number(r.amount) })),
            badge: `${rows.reduce((s, r) => s + Number(r.count), 0)} returns`,
          },
        }
      }

      return { success: false, message: 'Unknown chart filter' }
    } catch (error) {
      console.error('Dashboard trend data error:', error)
      return { success: false, message: 'Failed to fetch trend data' }
    }
  })

  // Fund Flow — complete cash movement breakdown
  ipcMain.handle('dashboard:get-fund-flow', async (_, params: DashboardParams) => {
    try {
      const { branchId, timePeriod, customStart, customEnd } = params
      const dateRange = getDateRange(timePeriod, customStart, customEnd)

      // Get cash register session(s) for the period
      const sessions = await db
        .select({
          openingBalance: cashRegisterSessions.openingBalance,
          closingBalance: cashRegisterSessions.closingBalance,
          status: cashRegisterSessions.status,
        })
        .from(cashRegisterSessions)
        .where(
          and(
            eq(cashRegisterSessions.branchId, branchId),
            between(cashRegisterSessions.sessionDate, dateRange.start.split('T')[0], dateRange.end.split('T')[0])
          )
        )

      // Opening cash = first session's opening balance in the period
      const openingCash = sessions.length > 0 ? sessions[0].openingBalance : 0

      // Get cash transactions grouped by type for the period
      const txByType = await db
        .select({
          transactionType: cashTransactions.transactionType,
          total: sql<number>`COALESCE(SUM(ABS(${cashTransactions.amount})), 0)`,
        })
        .from(cashTransactions)
        .innerJoin(
          cashRegisterSessions,
          eq(cashTransactions.sessionId, cashRegisterSessions.id)
        )
        .where(
          and(
            eq(cashRegisterSessions.branchId, branchId),
            between(cashTransactions.transactionDate, dateRange.start, dateRange.end)
          )
        )
        .groupBy(cashTransactions.transactionType)

      const txMap: Record<string, number> = {}
      for (const row of txByType) {
        txMap[row.transactionType] = Number(row.total) || 0
      }

      // Cash inflows
      const cashFromSales = txMap['sale'] || 0
      const arCollections = txMap['ar_collection'] || 0
      const deposits = txMap['deposit'] || 0
      const pettyCashIn = txMap['petty_cash_in'] || 0
      const cashIn = txMap['cash_in'] || 0
      const totalCashIn = cashFromSales + arCollections + deposits + pettyCashIn + cashIn

      // Cash outflows
      const apPayments = txMap['ap_payment'] || 0
      const expensesPaid = txMap['expense'] || 0
      const refunds = txMap['refund'] || 0
      const withdrawals = txMap['withdrawal'] || 0
      const pettyCashOut = txMap['petty_cash_out'] || 0
      const totalCashOut = apPayments + expensesPaid + refunds + withdrawals + pettyCashOut

      // Closing cash = last session's closing or computed
      const lastSession = sessions[sessions.length - 1]
      const closingCash = lastSession?.status === 'closed'
        ? (lastSession.closingBalance ?? openingCash + totalCashIn - totalCashOut)
        : openingCash + totalCashIn - totalCashOut

      return {
        success: true,
        data: {
          openingCash,
          cashFromSales,
          arCollections,
          deposits,
          pettyCashIn,
          cashIn,
          totalCashIn,
          apPayments,
          expensesPaid,
          refunds,
          withdrawals,
          pettyCashOut,
          totalCashOut,
          netCashFlow: totalCashIn - totalCashOut,
          closingCash,
        },
      }
    } catch (error) {
      console.error('Dashboard fund flow error:', error)
      return { success: false, message: 'Failed to fetch fund flow data' }
    }
  })
}
