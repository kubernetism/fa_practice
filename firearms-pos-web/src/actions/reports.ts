'use server'

import { db } from '@/lib/db'
import {
  sales,
  saleItems,
  expenses,
  purchases,
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
  products,
  inventory,
  inventoryCostLayers,
  returns,
  accountReceivables,
  accountPayables,
  commissions,
} from '@/lib/db/schema'
import { eq, and, sql, between, desc, count, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getProfitAndLoss(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const revenue = await db
    .select({
      total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  const expenseTotal = await db
    .select({
      total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        between(expenses.expenseDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  const purchaseTotal = await db
    .select({
      total: sql<string>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.tenantId, tenantId),
        eq(purchases.status, 'received'),
        between(purchases.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      revenue: revenue[0].total,
      expenses: expenseTotal[0].total,
      costOfGoods: purchaseTotal[0].total,
      netProfit: String(
        Number(revenue[0].total) - Number(expenseTotal[0].total) - Number(purchaseTotal[0].total)
      ),
    },
  }
}

export async function getBalanceSheet() {
  const tenantId = await getTenantId()

  const accounts = await db
    .select({
      accountType: chartOfAccounts.accountType,
      totalBalance: sql<string>`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)`,
    })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))
    .groupBy(chartOfAccounts.accountType)

  const result: Record<string, string> = {}
  for (const row of accounts) {
    result[row.accountType] = row.totalBalance
  }

  return {
    success: true,
    data: {
      assets: result.asset || '0',
      liabilities: result.liability || '0',
      equity: result.equity || '0',
      revenue: result.revenue || '0',
      expenses: result.expense || '0',
    },
  }
}

export async function getSalesReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalSales: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      totalDiscount: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      totalTax: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      saleCount: count(),
      avgSale: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return { success: true, data: result[0] }
}

export async function getTopProducts(limit: number = 10) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: products.id,
      name: products.name,
      code: products.code,
      sellingPrice: products.sellingPrice,
      costPrice: products.costPrice,
    })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
    .orderBy(desc(products.sellingPrice))
    .limit(limit)

  return { success: true, data }
}

export async function getTaxReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const salesTax = await db
    .select({
      totalTax: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      taxableAmount: sql<string>`COALESCE(SUM(${sales.subtotal}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      salesTax: salesTax[0].totalTax,
      taxableRevenue: salesTax[0].taxableAmount,
    },
  }
}

export async function getTrialBalance() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: chartOfAccounts.id,
      accountCode: chartOfAccounts.accountCode,
      accountName: chartOfAccounts.accountName,
      accountType: chartOfAccounts.accountType,
      normalBalance: chartOfAccounts.normalBalance,
      currentBalance: chartOfAccounts.currentBalance,
    })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))
    .orderBy(chartOfAccounts.accountCode)

  const totalDebits = data
    .filter((a) => Number(a.currentBalance) > 0 && a.normalBalance === 'debit')
    .reduce((s, a) => s + Number(a.currentBalance), 0)
    + data
    .filter((a) => Number(a.currentBalance) < 0 && a.normalBalance === 'credit')
    .reduce((s, a) => s + Math.abs(Number(a.currentBalance)), 0)

  const totalCredits = data
    .filter((a) => Number(a.currentBalance) > 0 && a.normalBalance === 'credit')
    .reduce((s, a) => s + Number(a.currentBalance), 0)
    + data
    .filter((a) => Number(a.currentBalance) < 0 && a.normalBalance === 'debit')
    .reduce((s, a) => s + Math.abs(Number(a.currentBalance)), 0)

  return {
    success: true,
    data: {
      accounts: data.map((a) => ({
        ...a,
        debit: a.normalBalance === 'debit' ? Math.abs(Number(a.currentBalance)) : (Number(a.currentBalance) < 0 ? Math.abs(Number(a.currentBalance)) : 0),
        credit: a.normalBalance === 'credit' ? Math.abs(Number(a.currentBalance)) : (Number(a.currentBalance) < 0 ? Math.abs(Number(a.currentBalance)) : 0),
      })),
      totalDebits: String(totalDebits),
      totalCredits: String(totalCredits),
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    },
  }
}

export async function getCashFlowStatement(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  // Cash from sales
  const [salesCash] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${sales.amountPaid}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  // Cash from expense payments
  const [expenseCash] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        eq(expenses.paymentStatus, 'paid'),
        between(expenses.expenseDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  // Cash from purchase payments
  const [purchaseCash] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.tenantId, tenantId),
        eq(purchases.paymentStatus, 'paid'),
        between(purchases.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )

  const cashIn = Number(salesCash.total)
  const cashOutExpenses = Number(expenseCash.total)
  const cashOutPurchases = Number(purchaseCash.total)

  return {
    success: true,
    data: {
      cashInFromSales: salesCash.total,
      cashOutForExpenses: expenseCash.total,
      cashOutForPurchases: purchaseCash.total,
      netCashFlow: String(cashIn - cashOutExpenses - cashOutPurchases),
    },
  }
}

export async function getInventoryValuationReport(branchId?: number) {
  const tenantId = await getTenantId()

  const conditions = [
    eq(inventoryCostLayers.tenantId, tenantId),
    eq(inventoryCostLayers.isFullyConsumed, false),
  ]
  if (branchId) {
    conditions.push(eq(inventoryCostLayers.branchId, branchId))
  }

  const data = await db
    .select({
      productId: inventoryCostLayers.productId,
      productName: products.name,
      productCode: products.code,
      totalQuantity: sql<number>`SUM(${inventoryCostLayers.quantity})`,
      totalValue: sql<string>`SUM(${inventoryCostLayers.quantity} * ${inventoryCostLayers.unitCost}::numeric)`,
      avgCost: sql<string>`CASE WHEN SUM(${inventoryCostLayers.quantity}) > 0 THEN SUM(${inventoryCostLayers.quantity} * ${inventoryCostLayers.unitCost}::numeric) / SUM(${inventoryCostLayers.quantity}) ELSE 0 END`,
    })
    .from(inventoryCostLayers)
    .innerJoin(products, eq(inventoryCostLayers.productId, products.id))
    .where(and(...conditions))
    .groupBy(inventoryCostLayers.productId, products.name, products.code)
    .orderBy(products.name)

  const grandTotal = data.reduce((s, r) => s + Number(r.totalValue), 0)

  return { success: true, data: { items: data, grandTotal: String(grandTotal) } }
}

export async function getDailySalesReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      date: sql<string>`${sales.saleDate}::date`,
      saleCount: count(),
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      totalTax: sql<string>`COALESCE(SUM(${sales.taxAmount}), 0)`,
      totalDiscount: sql<string>`COALESCE(SUM(${sales.discountAmount}), 0)`,
      avgSale: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(sql`${sales.saleDate}::date`)
    .orderBy(sql`${sales.saleDate}::date`)

  return { success: true, data }
}

export async function getInventoryReport(branchId?: number) {
  const tenantId = await getTenantId()

  const conditions: any[] = [eq(inventory.tenantId, tenantId)]
  if (branchId) conditions.push(eq(inventory.branchId, branchId))

  const data = await db
    .select({
      productId: inventory.productId,
      productName: products.name,
      productCode: products.code,
      quantity: inventory.quantity,
      minQuantity: inventory.minQuantity,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      stockValue: sql<string>`${inventory.quantity} * ${products.costPrice}::numeric`,
      isLowStock: sql<boolean>`${inventory.quantity} <= ${inventory.minQuantity}`,
      isOutOfStock: sql<boolean>`${inventory.quantity} = 0`,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(and(...conditions))
    .orderBy(products.name)

  const summary = {
    totalItems: data.length,
    totalQuantity: data.reduce((s, r) => s + r.quantity, 0),
    totalValue: String(data.reduce((s, r) => s + Number(r.stockValue), 0)),
    lowStockCount: data.filter((r) => r.isLowStock).length,
    outOfStockCount: data.filter((r) => r.isOutOfStock).length,
  }

  return { success: true, data: { items: data, summary } }
}

export async function getRevenueReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  // Revenue by payment method
  const byMethod = await db
    .select({
      paymentMethod: sales.paymentMethod,
      saleCount: count(),
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(sales.paymentMethod)

  // Total
  const [total] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      totalCost: sql<string>`COALESCE(SUM(${saleItems.costPrice}::numeric * ${saleItems.quantity}), 0)`,
    })
    .from(sales)
    .innerJoin(saleItems, eq(sales.id, saleItems.saleId))
    .where(
      and(
        eq(sales.tenantId, tenantId),
        eq(sales.isVoided, false),
        between(sales.saleDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      byPaymentMethod: byMethod,
      totalRevenue: total.totalRevenue,
      totalCost: total.totalCost,
      grossProfit: String(Number(total.totalRevenue) - Number(total.totalCost)),
    },
  }
}

export async function getExpensesReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const byCategory = await db
    .select({
      category: expenses.category,
      expenseCount: count(),
      totalAmount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        between(expenses.expenseDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .groupBy(expenses.category)
    .orderBy(sql`SUM(${expenses.amount}) DESC`)

  const [total] = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      totalCount: count(),
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        between(expenses.expenseDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return {
    success: true,
    data: {
      byCategory,
      totalExpenses: total.totalExpenses,
      totalCount: total.totalCount,
    },
  }
}

export async function getReceivablesReport() {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`,
      totalCollected: sql<string>`COALESCE(SUM(${accountReceivables.paidAmount}), 0)`,
      totalInvoiced: sql<string>`COALESCE(SUM(${accountReceivables.totalAmount}), 0)`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${accountReceivables.status} IN ('pending', 'partial'))`,
      overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${accountReceivables.status} = 'overdue')`,
      paidCount: sql<number>`COUNT(*) FILTER (WHERE ${accountReceivables.status} = 'paid')`,
      totalCount: count(),
    })
    .from(accountReceivables)
    .where(eq(accountReceivables.tenantId, tenantId))

  return { success: true, data: summary }
}

export async function getPayablesReport() {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalOutstanding: sql<string>`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`,
      totalPaid: sql<string>`COALESCE(SUM(${accountPayables.paidAmount}), 0)`,
      totalInvoiced: sql<string>`COALESCE(SUM(${accountPayables.totalAmount}), 0)`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${accountPayables.status} IN ('pending', 'partial'))`,
      overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${accountPayables.status} = 'overdue')`,
      paidCount: sql<number>`COUNT(*) FILTER (WHERE ${accountPayables.status} = 'paid')`,
      totalCount: count(),
    })
    .from(accountPayables)
    .where(eq(accountPayables.tenantId, tenantId))

  return { success: true, data: summary }
}

export async function getPurchaseReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalPurchases: sql<string>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
      totalCount: count(),
      receivedCount: sql<number>`COUNT(*) FILTER (WHERE ${purchases.status} = 'received')`,
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${purchases.status} IN ('draft', 'ordered'))`,
      paidAmount: sql<string>`COALESCE(SUM(CASE WHEN ${purchases.paymentStatus} = 'paid' THEN ${purchases.totalAmount} ELSE 0 END), 0)`,
      unpaidAmount: sql<string>`COALESCE(SUM(CASE WHEN ${purchases.paymentStatus} != 'paid' THEN ${purchases.totalAmount} ELSE 0 END), 0)`,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.tenantId, tenantId),
        between(purchases.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )

  return { success: true, data: summary }
}

export async function getReturnsSummaryReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalReturns: count(),
      totalRefunded: sql<string>`COALESCE(SUM(${returns.refundAmount}), 0)`,
      refundCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'refund')`,
      exchangeCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'exchange')`,
      storeCreditCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'store_credit')`,
    })
    .from(returns)
    .where(
      and(
        eq(returns.tenantId, tenantId),
        between(returns.returnDate, new Date(dateFrom), new Date(dateTo))
      )
    )

  return { success: true, data: summary }
}

export async function getCommissionReport(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const [summary] = await db
    .select({
      totalCommissions: sql<string>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
      totalCount: count(),
      pendingAmount: sql<string>`COALESCE(SUM(${commissions.commissionAmount}) FILTER (WHERE ${commissions.status} = 'pending'), 0)`,
      approvedAmount: sql<string>`COALESCE(SUM(${commissions.commissionAmount}) FILTER (WHERE ${commissions.status} = 'approved'), 0)`,
      paidAmount: sql<string>`COALESCE(SUM(${commissions.commissionAmount}) FILTER (WHERE ${commissions.status} = 'paid'), 0)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.tenantId, tenantId),
        between(commissions.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )

  return { success: true, data: summary }
}
