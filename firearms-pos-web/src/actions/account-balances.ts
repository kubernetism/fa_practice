'use server'

import { db } from '@/lib/db'
import {
  accountBalances,
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
} from '@/lib/db/schema'
import { eq, and, sql, desc, between, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

/**
 * Calculate period balances for all active accounts.
 * periodType: 'daily' | 'monthly' | 'yearly'
 * periodDate: 'YYYY-MM-DD' for daily, 'YYYY-MM' for monthly, 'YYYY' for yearly
 */
export async function calculatePeriodBalances(
  periodType: 'daily' | 'monthly' | 'yearly',
  periodDate: string,
  branchId?: number
) {
  const tenantId = await getTenantId()

  // Determine date range for this period
  let dateFrom: Date
  let dateTo: Date

  if (periodType === 'daily') {
    dateFrom = new Date(periodDate)
    dateTo = new Date(periodDate)
    dateTo.setDate(dateTo.getDate() + 1)
  } else if (periodType === 'monthly') {
    dateFrom = new Date(`${periodDate}-01`)
    dateTo = new Date(dateFrom)
    dateTo.setMonth(dateTo.getMonth() + 1)
  } else {
    dateFrom = new Date(`${periodDate}-01-01`)
    dateTo = new Date(`${Number(periodDate) + 1}-01-01`)
  }

  // Get all active accounts
  const accounts = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))

  let calculatedCount = 0

  for (const account of accounts) {
    // Get previous period closing balance as opening balance
    const [prevBalance] = await db
      .select({ closingBalance: accountBalances.closingBalance })
      .from(accountBalances)
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.accountId, account.id),
          eq(accountBalances.periodType, periodType),
          sql`${accountBalances.periodDate} < ${periodDate}`
        )
      )
      .orderBy(desc(accountBalances.periodDate))
      .limit(1)

    const openingBalance = prevBalance ? Number(prevBalance.closingBalance) : 0

    // Calculate debits and credits for this period
    const conditions: any[] = [
      eq(journalEntryLines.accountId, account.id),
      eq(journalEntries.status, 'posted'),
      eq(journalEntries.tenantId, tenantId),
      between(journalEntries.entryDate, dateFrom, dateTo),
    ]
    if (branchId) {
      conditions.push(eq(journalEntries.branchId, branchId))
    }

    const [totals] = await db
      .select({
        debitTotal: sql<string>`COALESCE(SUM(${journalEntryLines.debitAmount}::numeric), 0)`,
        creditTotal: sql<string>`COALESCE(SUM(${journalEntryLines.creditAmount}::numeric), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(and(...conditions))

    const debitTotal = Number(totals.debitTotal)
    const creditTotal = Number(totals.creditTotal)
    const closingBalance = openingBalance + debitTotal - creditTotal

    // Upsert the balance record
    const existing = await db
      .select()
      .from(accountBalances)
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.accountId, account.id),
          eq(accountBalances.periodType, periodType),
          eq(accountBalances.periodDate, periodDate),
          branchId ? eq(accountBalances.branchId, branchId) : sql`${accountBalances.branchId} IS NULL`
        )
      )

    if (existing.length > 0) {
      await db
        .update(accountBalances)
        .set({
          openingBalance: String(openingBalance),
          debitTotal: String(debitTotal),
          creditTotal: String(creditTotal),
          closingBalance: String(closingBalance),
          updatedAt: new Date(),
        })
        .where(eq(accountBalances.id, existing[0].id))
    } else {
      await db.insert(accountBalances).values({
        tenantId,
        accountId: account.id,
        branchId: branchId || null,
        periodType,
        periodDate,
        openingBalance: String(openingBalance),
        debitTotal: String(debitTotal),
        creditTotal: String(creditTotal),
        closingBalance: String(closingBalance),
      })
    }

    calculatedCount++
  }

  return { success: true, data: { calculatedCount } }
}

/**
 * Get period balances for all accounts (or specific account).
 */
export async function getBalancesByPeriod(
  periodType: 'daily' | 'monthly' | 'yearly',
  periodDate: string,
  accountId?: number,
  branchId?: number
) {
  const tenantId = await getTenantId()

  const conditions: any[] = [
    eq(accountBalances.tenantId, tenantId),
    eq(accountBalances.periodType, periodType),
    eq(accountBalances.periodDate, periodDate),
  ]
  if (accountId) {
    conditions.push(eq(accountBalances.accountId, accountId))
  }
  if (branchId) {
    conditions.push(eq(accountBalances.branchId, branchId))
  }

  const data = await db
    .select({
      balance: accountBalances,
      accountName: chartOfAccounts.accountName,
      accountCode: chartOfAccounts.accountCode,
      accountType: chartOfAccounts.accountType,
    })
    .from(accountBalances)
    .innerJoin(chartOfAccounts, eq(accountBalances.accountId, chartOfAccounts.id))
    .where(and(...conditions))
    .orderBy(chartOfAccounts.accountCode)

  return { success: true, data }
}

/**
 * Get historical balances for a specific account across periods.
 */
export async function getAccountBalanceHistory(
  accountId: number,
  periodType: 'daily' | 'monthly' | 'yearly',
  limit: number = 12
) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(accountBalances)
    .where(
      and(
        eq(accountBalances.tenantId, tenantId),
        eq(accountBalances.accountId, accountId),
        eq(accountBalances.periodType, periodType)
      )
    )
    .orderBy(desc(accountBalances.periodDate))
    .limit(limit)

  return { success: true, data }
}
