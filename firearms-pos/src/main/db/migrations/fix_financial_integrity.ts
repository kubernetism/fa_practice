/**
 * One-time corrective migration: Financial Integrity Fix (2026-03-22)
 *
 * Fixes:
 * 1. Creates missing equity accounts (Owner's Capital 3000, Retained Earnings 3100)
 * 2. Reverses phantom revenue in Inventory Adjustment Income (4900)
 * 3. Re-posts initial stock as Owner's Capital
 * 4. Posts opening cash float as Owner's Capital
 *
 * This migration is idempotent — it checks for a marker journal entry before running.
 */

import { eq } from 'drizzle-orm'
import { getDatabase } from '../index'
import { branches, chartOfAccounts, journalEntries, users } from '../schema'
import { createJournalEntry, ACCOUNT_CODES } from '../../utils/gl-posting'

export async function fixFinancialIntegrity(): Promise<void> {
  const db = getDatabase()

  // Check if this migration has already run (look for audit_correction entries)
  const existing = await db.query.journalEntries.findFirst({
    where: eq(journalEntries.referenceType, 'audit_correction'),
  })

  if (existing) {
    console.log('Financial integrity fix already applied, skipping.')
    return
  }

  console.log('Running financial integrity fix...')

  // Dynamically resolve valid branch and user IDs (don't hardcode)
  const firstBranch = await db.query.branches.findFirst()
  const firstUser = await db.query.users.findFirst()

  if (!firstBranch || !firstUser) {
    console.error('Cannot run financial integrity fix: no branches or users found.')
    return
  }

  const branchId = firstBranch.id
  const userId = firstUser.id
  console.log(`Using branchId=${branchId}, userId=${userId}`)

  // Step 1: Ensure equity accounts exist
  const ownerCapital = await db.query.chartOfAccounts.findFirst({
    where: eq(chartOfAccounts.accountCode, '3000'),
  })

  if (!ownerCapital) {
    await db.insert(chartOfAccounts).values({
      accountCode: '3000',
      accountName: "Owner's Capital",
      accountType: 'equity',
      accountSubType: 'owner_capital',
      normalBalance: 'credit',
      description: "Owner's invested capital and initial funding",
      currentBalance: 0,
      isActive: true,
      isSystemAccount: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('Created Owner\'s Capital account (3000)')
  }

  const retainedEarnings = await db.query.chartOfAccounts.findFirst({
    where: eq(chartOfAccounts.accountCode, '3100'),
  })

  if (!retainedEarnings) {
    await db.insert(chartOfAccounts).values({
      accountCode: '3100',
      accountName: 'Retained Earnings',
      accountType: 'equity',
      accountSubType: 'retained_earnings',
      normalBalance: 'credit',
      description: 'Accumulated net income retained in the business',
      currentBalance: 0,
      isActive: true,
      isSystemAccount: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('Created Retained Earnings account (3100)')
  }

  // Step 2: Find the phantom revenue journal entries (stock adjustments crediting 4900)
  // These are JE#1-3 from the audit, all referencing stock_adjustment
  const invAdjAccount = await db.query.chartOfAccounts.findFirst({
    where: eq(chartOfAccounts.accountCode, '4900'),
  })

  if (!invAdjAccount || invAdjAccount.currentBalance === 0) {
    console.log('No phantom revenue to correct (4900 balance is 0). Skipping reversal.')
    return
  }

  const phantomAmount = invAdjAccount.currentBalance // Rs 535,000

  // Step 3: Reverse phantom revenue — DR Inv Adj Income (4900), CR Inventory (1200)
  // Then re-post as capital — DR Inventory (1200), CR Owner's Capital (3000)
  // We can do this in a single net entry: DR Inv Adj Income (4900), CR Owner's Capital (3000)
  // This reclassifies the credit from revenue to equity without touching inventory balance.

  await createJournalEntry({
    description: `AUDIT CORRECTION: Reclassify Rs ${phantomAmount} from Inventory Adjustment Income to Owner's Capital — initial stock was owner-funded, not surplus`,
    referenceType: 'audit_correction',
    referenceId: 0,
    branchId,
    userId,
    lines: [
      {
        accountCode: ACCOUNT_CODES.INVENTORY_ADJUSTMENT,
        debitAmount: phantomAmount,
        creditAmount: 0,
        description: `Reverse phantom revenue: initial stock was owner capital, not surplus income`,
      },
      {
        accountCode: ACCOUNT_CODES.OWNERS_CAPITAL,
        debitAmount: 0,
        creditAmount: phantomAmount,
        description: `Owner capital investment: initial inventory funding Rs ${phantomAmount}`,
      },
    ],
  })

  console.log(`Reclassified Rs ${phantomAmount} from Inv Adj Income to Owner's Capital`)

  // Step 4: Post opening cash float as capital
  // Cash register session #1 had opening balance Rs 15,000 with no journal entry
  // The current Cash in Hand is 55,000 (from the sale only). Float of 15,000 was never posted.
  await createJournalEntry({
    description: 'AUDIT CORRECTION: Cash register opening float — owner capital injection',
    referenceType: 'audit_correction',
    referenceId: 0,
    branchId,
    userId,
    lines: [
      {
        accountCode: ACCOUNT_CODES.CASH_IN_HAND,
        debitAmount: 15000,
        creditAmount: 0,
        description: 'Cash register opening float (session 2026-03-22)',
      },
      {
        accountCode: ACCOUNT_CODES.OWNERS_CAPITAL,
        debitAmount: 0,
        creditAmount: 15000,
        description: 'Capital contribution: cash register opening float',
      },
    ],
  })

  console.log('Posted opening cash float Rs 15,000 as Owner\'s Capital')

  // Step 5: Post marker entry to prevent re-running
  // (The above entries serve as markers themselves via the audit_correction reference type)

  console.log('Financial integrity fix completed successfully.')
  console.log('Expected state:')
  console.log('  Assets: Cash 70,000 + Inventory 510,000 = 580,000')
  console.log('  Equity: Owner\'s Capital 550,000 + Net Income 30,000 = 580,000')
  console.log('  Balance Sheet: BALANCED')
}
