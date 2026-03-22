/**
 * Corrective migration v2: Financial Integrity Recommendations (2026-03-22)
 *
 * Fixes:
 * 1. Creates missing Accounts Payable liability account (2000)
 * 2. Backfills missing cash transaction for sale INV-20260322-R1HB (Rs 55,000)
 *    that was missed because the sale preceded the register session opening.
 *
 * Idempotent — checks for existing records before inserting.
 */

import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../index'
import { chartOfAccounts, cashTransactions, cashRegisterSessions, sales } from '../schema'

export async function fixFinancialIntegrityV2(): Promise<void> {
  const db = getDatabase()

  console.log('Running financial integrity fix v2...')

  // Step 1: Ensure Accounts Payable (2000) exists
  const accountsPayable = await db.query.chartOfAccounts.findFirst({
    where: eq(chartOfAccounts.accountCode, '2000'),
  })

  if (!accountsPayable) {
    await db.insert(chartOfAccounts).values({
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'liability',
      normalBalance: 'credit',
      description: 'Amounts owed to suppliers',
      currentBalance: 0,
      isActive: true,
      isSystemAccount: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('Created Accounts Payable account (2000)')
  } else {
    console.log('Accounts Payable (2000) already exists, skipping.')
  }

  // Step 2: Backfill missing cash transaction for sale INV-20260322-R1HB
  // The sale (Rs 55,000) was processed at 05:42 but register opened at 05:45,
  // so the cash transaction was never recorded. The GL entry (JE#4) already exists.
  const missedSale = await db.query.sales.findFirst({
    where: eq(sales.invoiceNumber, 'INV-20260322-R1HB'),
  })

  if (missedSale) {
    // Check if a cash transaction already exists for this sale
    const existingTx = await db.query.cashTransactions.findFirst({
      where: and(
        eq(cashTransactions.referenceType, 'sale'),
        eq(cashTransactions.referenceId, missedSale.id)
      ),
    })

    if (!existingTx) {
      // Find the open session for this branch and date
      const session = await db.query.cashRegisterSessions.findFirst({
        where: and(
          eq(cashRegisterSessions.branchId, missedSale.branchId),
          eq(cashRegisterSessions.sessionDate, '2026-03-22')
        ),
      })

      if (session) {
        await db.insert(cashTransactions).values({
          sessionId: session.id,
          branchId: missedSale.branchId,
          transactionType: 'sale',
          amount: missedSale.totalAmount,
          referenceType: 'sale',
          referenceId: missedSale.id,
          description: `Backfill: Cash sale ${missedSale.invoiceNumber} (missed due to sale preceding register opening)`,
          recordedBy: missedSale.userId,
        })
        console.log(`Backfilled cash transaction Rs ${missedSale.totalAmount} for ${missedSale.invoiceNumber}`)
      } else {
        console.warn('No register session found for backfill — skipping cash transaction.')
      }
    } else {
      console.log(`Cash transaction for ${missedSale.invoiceNumber} already exists, skipping.`)
    }
  } else {
    console.log('Sale INV-20260322-R1HB not found — skipping backfill.')
  }

  console.log('Financial integrity fix v2 completed.')
}
