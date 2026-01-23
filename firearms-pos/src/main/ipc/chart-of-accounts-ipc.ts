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

  // Get Journal Entries with filtering
  ipcMain.handle(
    'journal:get-all',
    async (_, filters?: { startDate?: string; endDate?: string; status?: string; branchId?: number; referenceType?: string; page?: number; limit?: number }) => {
      try {
        const conditions = []

        // Date range filter
        if (filters?.startDate) {
          conditions.push(sql`${journalEntries.entryDate} >= ${filters.startDate}`)
        }
        if (filters?.endDate) {
          conditions.push(sql`${journalEntries.entryDate} <= ${filters.endDate}`)
        }

        // Status filter
        if (filters?.status) {
          conditions.push(eq(journalEntries.status, filters.status))
        }

        // Branch filter
        if (filters?.branchId) {
          conditions.push(eq(journalEntries.branchId, filters.branchId))
        }

        // Reference type filter
        if (filters?.referenceType) {
          conditions.push(eq(journalEntries.referenceType, filters.referenceType))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(journalEntries)
          .where(whereClause)

        const total = countResult[0]?.count || 0

        // Get paginated data
        const page = filters?.page || 1
        const limit = filters?.limit || 50
        const offset = (page - 1) * limit

        const entries = await db.query.journalEntries.findMany({
          where: whereClause,
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
          limit,
          offset,
        })

        // Calculate totals
        const totals = entries.reduce(
          (acc, entry) => {
            const entryDebits = entry.lines.reduce((sum, l) => sum + l.debitAmount, 0)
            const entryCredits = entry.lines.reduce((sum, l) => sum + l.creditAmount, 0)
            return {
              totalDebits: acc.totalDebits + entryDebits,
              totalCredits: acc.totalCredits + entryCredits,
            }
          },
          { totalDebits: 0, totalCredits: 0 }
        )

        return {
          success: true,
          data: entries,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          summary: {
            totalEntries: total,
            ...totals,
            postedCount: entries.filter((e) => e.status === 'posted').length,
            draftCount: entries.filter((e) => e.status === 'draft').length,
          },
        }
      } catch (error) {
        console.error('Get journal entries error:', error)
        return { success: false, message: 'Failed to fetch journal entries' }
      }
    }
  )

  // Get Journal Summary/Statistics
  ipcMain.handle(
    'journal:get-summary',
    async (_, params: { branchId?: number; startDate?: string; endDate?: string }) => {
      try {
        const conditions = []

        if (params?.startDate) {
          conditions.push(sql`${journalEntries.entryDate} >= ${params.startDate}`)
        }
        if (params?.endDate) {
          conditions.push(sql`${journalEntries.entryDate} <= ${params.endDate}`)
        }
        if (params?.branchId) {
          conditions.push(eq(journalEntries.branchId, params.branchId))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const entries = await db.query.journalEntries.findMany({
          where: whereClause,
          with: {
            lines: true,
          },
        })

        // Calculate summary statistics
        const totalEntries = entries.length
        const postedEntries = entries.filter((e) => e.status === 'posted').length
        const draftEntries = entries.filter((e) => e.status === 'draft').length
        const reversedEntries = entries.filter((e) => e.status === 'reversed').length

        let totalDebits = 0
        let totalCredits = 0

        entries.forEach((entry) => {
          entry.lines.forEach((line) => {
            totalDebits += line.debitAmount
            totalCredits += line.creditAmount
          })
        })

        // Group by reference type
        const byReferenceType = entries.reduce(
          (acc, entry) => {
            const type = entry.referenceType || 'manual'
            if (!acc[type]) {
              acc[type] = { count: 0, debits: 0, credits: 0 }
            }
            acc[type].count++
            entry.lines.forEach((line) => {
              acc[type].debits += line.debitAmount
              acc[type].credits += line.creditAmount
            })
            return acc
          },
          {} as Record<string, { count: number; debits: number; credits: number }>
        )

        return {
          success: true,
          data: {
            totalEntries,
            postedEntries,
            draftEntries,
            reversedEntries,
            totalDebits,
            totalCredits,
            byReferenceType,
            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
          },
        }
      } catch (error) {
        console.error('Get journal summary error:', error)
        return { success: false, message: 'Failed to fetch journal summary' }
      }
    }
  )

  // Export Journal Entries Report
  ipcMain.handle(
    'journal:export',
    async (_, params: { branchId?: number; startDate: string; endDate: string; format?: 'csv' | 'json' }) => {
      try {
        const conditions = [
          sql`${journalEntries.entryDate} >= ${params.startDate}`,
          sql`${journalEntries.entryDate} <= ${params.endDate}`,
        ]

        if (params.branchId) {
          conditions.push(eq(journalEntries.branchId, params.branchId))
        }

        const entries = await db.query.journalEntries.findMany({
          where: and(...conditions),
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
        })

        // Format data for export
        const exportData = entries.map((entry) => ({
          entryNumber: entry.entryNumber,
          entryDate: entry.entryDate,
          description: entry.description,
          status: entry.status,
          referenceType: entry.referenceType || 'Manual',
          referenceId: entry.referenceId,
          createdBy: entry.createdByUser?.fullName || 'Unknown',
          postedBy: entry.postedByUser?.fullName || '',
          postedAt: entry.postedAt || '',
          lines: entry.lines.map((line) => ({
            accountCode: line.account?.accountCode || '',
            accountName: line.account?.accountName || '',
            debit: line.debitAmount,
            credit: line.creditAmount,
            description: line.description || '',
          })),
          totalDebits: entry.lines.reduce((sum, l) => sum + l.debitAmount, 0),
          totalCredits: entry.lines.reduce((sum, l) => sum + l.creditAmount, 0),
        }))

        // Calculate grand totals
        const grandTotalDebits = exportData.reduce((sum, e) => sum + e.totalDebits, 0)
        const grandTotalCredits = exportData.reduce((sum, e) => sum + e.totalCredits, 0)

        return {
          success: true,
          data: {
            entries: exportData,
            summary: {
              totalEntries: exportData.length,
              grandTotalDebits,
              grandTotalCredits,
              startDate: params.startDate,
              endDate: params.endDate,
              generatedAt: new Date().toISOString(),
            },
          },
        }
      } catch (error) {
        console.error('Export journal entries error:', error)
        return { success: false, message: 'Failed to export journal entries' }
      }
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
