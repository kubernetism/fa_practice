import { ipcMain } from 'electron'
import { eq, and, sql, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
  accountBalances,
} from '../db/schema'

export function registerChartOfAccountsHandlers() {
  const db = getDatabase()

  // Get all accounts
  ipcMain.handle('coa:get-all', async () => {
    return db.query.chartOfAccounts.findMany({
      orderBy: [chartOfAccounts.accountCode],
      with: {
        parentAccount: true,
        childAccounts: true,
      },
    })
  })

  // Get accounts by type
  ipcMain.handle(
    'coa:get-by-type',
    async (_, accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') => {
      return db.query.chartOfAccounts.findMany({
        where: eq(chartOfAccounts.accountType, accountType),
        orderBy: [chartOfAccounts.accountCode],
      })
    }
  )

  // Get account by ID
  ipcMain.handle('coa:get-by-id', async (_, id: number) => {
    return db.query.chartOfAccounts.findFirst({
      where: eq(chartOfAccounts.id, id),
      with: {
        parentAccount: true,
        childAccounts: true,
      },
    })
  })

  // Create account
  ipcMain.handle(
    'coa:create',
    async (
      _,
      data: {
        accountCode: string
        accountName: string
        accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
        accountSubType?: string
        parentAccountId?: number
        description?: string
        normalBalance: 'debit' | 'credit'
      }
    ) => {
      const [account] = await db
        .insert(chartOfAccounts)
        .values({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning()

      return account
    }
  )

  // Update account
  ipcMain.handle(
    'coa:update',
    async (
      _,
      id: number,
      data: {
        accountName?: string
        accountSubType?: string
        parentAccountId?: number
        description?: string
        isActive?: boolean
      }
    ) => {
      const [account] = await db
        .update(chartOfAccounts)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(chartOfAccounts.id, id))
        .returning()

      return account
    }
  )

  // Delete account (soft delete - set inactive)
  ipcMain.handle('coa:delete', async (_, id: number) => {
    // Check if it's a system account
    const account = await db.query.chartOfAccounts.findFirst({
      where: eq(chartOfAccounts.id, id),
    })

    if (account?.isSystemAccount) {
      throw new Error('Cannot delete system accounts')
    }

    // Check if account has any journal entries
    const hasEntries = await db.query.journalEntryLines.findFirst({
      where: eq(journalEntryLines.accountId, id),
    })

    if (hasEntries) {
      throw new Error('Cannot delete account with existing transactions')
    }

    await db.delete(chartOfAccounts).where(eq(chartOfAccounts.id, id))
    return { success: true }
  })

  // Get Balance Sheet
  ipcMain.handle('coa:get-balance-sheet', async (_, branchId?: number) => {
    const accounts = await db.query.chartOfAccounts.findMany({
      where: and(
        eq(chartOfAccounts.isActive, true),
        sql`${chartOfAccounts.accountType} IN ('asset', 'liability', 'equity')`
      ),
      orderBy: [chartOfAccounts.accountType, chartOfAccounts.accountCode],
    })

    // Group by type
    const assets = accounts.filter((a) => a.accountType === 'asset')
    const liabilities = accounts.filter((a) => a.accountType === 'liability')
    const equity = accounts.filter((a) => a.accountType === 'equity')

    const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0)
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.currentBalance, 0)
    const totalEquity = equity.reduce((sum, a) => sum + a.currentBalance, 0)

    return {
      assets: {
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        accounts: equity,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    }
  })

  // Get Income Statement (P&L)
  ipcMain.handle(
    'coa:get-income-statement',
    async (_, startDate: string, endDate: string, branchId?: number) => {
      const accounts = await db.query.chartOfAccounts.findMany({
        where: and(
          eq(chartOfAccounts.isActive, true),
          sql`${chartOfAccounts.accountType} IN ('revenue', 'expense')`
        ),
        orderBy: [chartOfAccounts.accountType, chartOfAccounts.accountCode],
      })

      const revenue = accounts.filter((a) => a.accountType === 'revenue')
      const expenses = accounts.filter((a) => a.accountType === 'expense')

      const totalRevenue = revenue.reduce((sum, a) => sum + a.currentBalance, 0)
      const totalExpenses = expenses.reduce((sum, a) => sum + a.currentBalance, 0)
      const netIncome = totalRevenue - totalExpenses

      return {
        revenue: {
          accounts: revenue,
          total: totalRevenue,
        },
        expenses: {
          accounts: expenses,
          total: totalExpenses,
        },
        netIncome,
        startDate,
        endDate,
      }
    }
  )

  // Get Trial Balance
  ipcMain.handle('coa:get-trial-balance', async (_, asOfDate?: string) => {
    const accounts = await db.query.chartOfAccounts.findMany({
      where: eq(chartOfAccounts.isActive, true),
      orderBy: [chartOfAccounts.accountCode],
    })

    let totalDebits = 0
    let totalCredits = 0

    const trialBalanceData = accounts.map((account) => {
      const debit = account.normalBalance === 'debit' ? account.currentBalance : 0
      const credit = account.normalBalance === 'credit' ? account.currentBalance : 0
      totalDebits += debit
      totalCredits += credit

      return {
        ...account,
        debit,
        credit,
      }
    })

    return {
      accounts: trialBalanceData,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    }
  })

  // Create Journal Entry
  ipcMain.handle(
    'journal:create',
    async (
      _,
      data: {
        description: string
        entryDate: string
        branchId?: number
        referenceType?: string
        referenceId?: number
        createdBy: number
        lines: Array<{
          accountId: number
          debitAmount: number
          creditAmount: number
          description?: string
        }>
      }
    ) => {
      // Validate debits = credits
      const totalDebits = data.lines.reduce((sum, line) => sum + line.debitAmount, 0)
      const totalCredits = data.lines.reduce((sum, line) => sum + line.creditAmount, 0)

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Journal entry must be balanced (debits must equal credits)')
      }

      // Generate entry number
      const year = new Date().getFullYear()
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(journalEntries)
        .where(sql`${journalEntries.entryNumber} LIKE ${'JE-' + year + '-%'}`)

      const count = countResult[0]?.count || 0
      const entryNumber = `JE-${year}-${String(count + 1).padStart(4, '0')}`

      // Create entry and lines in transaction
      const [entry] = await db
        .insert(journalEntries)
        .values({
          entryNumber,
          entryDate: data.entryDate,
          description: data.description,
          branchId: data.branchId,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          createdBy: data.createdBy,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning()

      // Insert lines
      for (const line of data.lines) {
        await db.insert(journalEntryLines).values({
          journalEntryId: entry.id,
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description,
          createdAt: new Date().toISOString(),
        })
      }

      return entry
    }
  )

  // Post Journal Entry
  ipcMain.handle('journal:post', async (_, entryId: number, postedBy: number) => {
    const entry = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, entryId),
      with: {
        lines: {
          with: {
            account: true,
          },
        },
      },
    })

    if (!entry) {
      throw new Error('Journal entry not found')
    }

    if (entry.status !== 'draft') {
      throw new Error('Only draft entries can be posted')
    }

    // Update account balances
    for (const line of entry.lines) {
      const account = line.account
      if (!account) continue

      let newBalance = account.currentBalance
      if (account.normalBalance === 'debit') {
        newBalance += line.debitAmount - line.creditAmount
      } else {
        newBalance += line.creditAmount - line.debitAmount
      }

      await db
        .update(chartOfAccounts)
        .set({
          currentBalance: newBalance,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(chartOfAccounts.id, account.id))
    }

    // Update entry status
    const [updated] = await db
      .update(journalEntries)
      .set({
        status: 'posted',
        postedBy,
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(journalEntries.id, entryId))
      .returning()

    return updated
  })

  // Get Journal Entries
  ipcMain.handle(
    'journal:get-all',
    async (_, filters?: { startDate?: string; endDate?: string; status?: string; branchId?: number }) => {
      return db.query.journalEntries.findMany({
        orderBy: [desc(journalEntries.entryDate), desc(journalEntries.id)],
        with: {
          lines: {
            with: {
              account: true,
            },
          },
          createdByUser: true,
          postedByUser: true,
        },
        limit: 100,
      })
    }
  )

  // Get Journal Entry by ID
  ipcMain.handle('journal:get-by-id', async (_, id: number) => {
    return db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, id),
      with: {
        lines: {
          with: {
            account: true,
          },
        },
        createdByUser: true,
        postedByUser: true,
      },
    })
  })

  // Get Account Ledger
  ipcMain.handle(
    'coa:get-ledger',
    async (_, accountId: number, startDate?: string, endDate?: string) => {
      const account = await db.query.chartOfAccounts.findFirst({
        where: eq(chartOfAccounts.id, accountId),
      })

      if (!account) {
        throw new Error('Account not found')
      }

      const lines = await db.query.journalEntryLines.findMany({
        where: eq(journalEntryLines.accountId, accountId),
        with: {
          journalEntry: true,
        },
        orderBy: [desc(journalEntryLines.createdAt)],
      })

      // Filter only posted entries and calculate running balance
      const postedLines = lines.filter((l) => l.journalEntry?.status === 'posted')

      let runningBalance = 0
      const ledgerEntries = postedLines.reverse().map((line) => {
        if (account.normalBalance === 'debit') {
          runningBalance += line.debitAmount - line.creditAmount
        } else {
          runningBalance += line.creditAmount - line.debitAmount
        }

        return {
          ...line,
          runningBalance,
        }
      })

      return {
        account,
        entries: ledgerEntries.reverse(),
        currentBalance: runningBalance,
      }
    }
  )
}
