'use server'

import { db } from '@/lib/db'
import { chartOfAccounts, journalEntryLines, journalEntries } from '@/lib/db/schema'
import { eq, and, desc, sql, count, isNull, between } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getAccounts(filters?: { type?: string; active?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(chartOfAccounts.tenantId, tenantId)]
  if (filters?.type && filters.type !== 'all') {
    conditions.push(eq(chartOfAccounts.accountType, filters.type as any))
  }
  if (filters?.active === 'active') {
    conditions.push(eq(chartOfAccounts.isActive, true))
  } else if (filters?.active === 'inactive') {
    conditions.push(eq(chartOfAccounts.isActive, false))
  }

  const data = await db
    .select()
    .from(chartOfAccounts)
    .where(and(...conditions))
    .orderBy(chartOfAccounts.accountCode)

  return { success: true, data }
}

export async function getAccountsSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalAccounts: count(),
      assetCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'asset')`,
      liabilityCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'liability')`,
      equityCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'equity')`,
      revenueCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'revenue')`,
      expenseCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'expense')`,
    })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))

  return { success: true, data: result[0] }
}

export async function createAccount(data: {
  accountCode: string
  accountName: string
  accountType: string
  accountSubType?: string
  parentAccountId?: number
  description?: string
  normalBalance: string
}) {
  const tenantId = await getTenantId()

  const [account] = await db
    .insert(chartOfAccounts)
    .values({
      tenantId,
      accountCode: data.accountCode,
      accountName: data.accountName,
      accountType: data.accountType as any,
      accountSubType: data.accountSubType || null,
      parentAccountId: data.parentAccountId || null,
      description: data.description || null,
      normalBalance: data.normalBalance as any,
    })
    .returning()

  return { success: true, data: account }
}

export async function updateAccount(
  id: number,
  data: {
    accountName?: string
    accountSubType?: string
    description?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const [account] = await db
    .update(chartOfAccounts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))
    .returning()

  return { success: true, data: account }
}

export async function deleteAccount(id: number) {
  const tenantId = await getTenantId()

  const [account] = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  if (!account) return { success: false, message: 'Account not found' }
  if (account.isSystemAccount) return { success: false, message: 'Cannot delete system account' }

  await db
    .delete(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  return { success: true }
}

export async function getAccountById(id: number) {
  const tenantId = await getTenantId()

  const [account] = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  if (!account) return { success: false, message: 'Account not found' }

  return { success: true, data: account }
}

export async function getAccountBalance(id: number, dateFrom?: string, dateTo?: string) {
  const tenantId = await getTenantId()

  const [account] = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  if (!account) return { success: false, message: 'Account not found' }

  // Get transactions from journal entry lines
  const conditions: any[] = [eq(journalEntryLines.accountId, id), eq(journalEntries.status, 'posted')]
  if (dateFrom && dateTo) {
    conditions.push(between(journalEntries.entryDate, new Date(dateFrom), new Date(dateTo)))
  }

  const [result] = await db
    .select({
      totalDebits: sql<string>`COALESCE(SUM(${journalEntryLines.debitAmount}::numeric), 0)`,
      totalCredits: sql<string>`COALESCE(SUM(${journalEntryLines.creditAmount}::numeric), 0)`,
      transactionCount: count(),
    })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .where(and(...conditions))

  return {
    success: true,
    data: {
      account,
      totalDebits: result.totalDebits,
      totalCredits: result.totalCredits,
      netBalance: String(Number(result.totalDebits) - Number(result.totalCredits)),
      transactionCount: result.transactionCount,
    },
  }
}

export async function getBalanceSheetFromCOA() {
  const tenantId = await getTenantId()

  const accounts = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))
    .orderBy(chartOfAccounts.accountCode)

  const assets = accounts.filter((a) => a.accountType === 'asset')
  const liabilities = accounts.filter((a) => a.accountType === 'liability')
  const equity = accounts.filter((a) => a.accountType === 'equity')

  const totalAssets = assets.reduce((s, a) => s + Number(a.currentBalance), 0)
  const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(Number(a.currentBalance)), 0)
  const totalEquity = equity.reduce((s, a) => s + Math.abs(Number(a.currentBalance)), 0)

  return {
    success: true,
    data: {
      assets: assets.map((a) => ({ ...a, balance: a.currentBalance })),
      liabilities: liabilities.map((a) => ({ ...a, balance: a.currentBalance })),
      equity: equity.map((a) => ({ ...a, balance: a.currentBalance })),
      totalAssets: String(totalAssets),
      totalLiabilities: String(totalLiabilities),
      totalEquity: String(totalEquity),
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    },
  }
}

export async function getTrialBalanceFromCOA() {
  const tenantId = await getTenantId()

  const accounts = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))
    .orderBy(chartOfAccounts.accountCode)

  let totalDebits = 0
  let totalCredits = 0

  const rows = accounts.map((a) => {
    const balance = Number(a.currentBalance)
    const isDebitBalance = (a.normalBalance === 'debit' && balance >= 0) || (a.normalBalance === 'credit' && balance < 0)
    const debit = isDebitBalance ? Math.abs(balance) : 0
    const credit = isDebitBalance ? 0 : Math.abs(balance)

    totalDebits += debit
    totalCredits += credit

    return {
      id: a.id,
      accountCode: a.accountCode,
      accountName: a.accountName,
      accountType: a.accountType,
      debit: String(debit),
      credit: String(credit),
    }
  })

  return {
    success: true,
    data: {
      accounts: rows,
      totalDebits: String(totalDebits),
      totalCredits: String(totalCredits),
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    },
  }
}
