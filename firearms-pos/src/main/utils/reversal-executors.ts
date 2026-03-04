import { eq, and, sql } from 'drizzle-orm'
import { getDatabase } from '../db/index'
import {
  sales,
  saleItems,
  inventory,
  commissions,
  accountReceivables,
  purchases,
  purchaseItems,
  expenses,
  journalEntries,
  journalEntryLines,
  chartOfAccounts,
  accountPayables,
  receivablePayments,
  payablePayments,
  inventoryCostLayers,
} from '../db/schema'
import { createJournalEntry, postVoidSaleToGL } from './gl-posting'
import { restoreCostLayers } from './inventory-valuation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface JournalLine {
  accountCode: string
  debitAmount: number
  creditAmount: number
  description?: string
}

interface ReversalResult {
  reversalDetails: Record<string, unknown>
}

interface GLReversalResult {
  reversed: boolean
  originalEntryId?: number
  reversalEntryId?: number
}

// ─── Shared GL Reversal Helper ───────────────────────────────────────────────

/**
 * Find the original posted journal entry for a given reference and create
 * a reversing entry with swapped debits/credits.
 */
async function reverseGLEntry(
  referenceType: string,
  referenceId: number,
  description: string,
  branchId: number,
  userId: number
): Promise<GLReversalResult> {
  const db = getDatabase()

  // Find original journal entry
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(
      eq(journalEntries.referenceType, referenceType),
      eq(journalEntries.referenceId, referenceId),
      eq(journalEntries.status, 'posted')
    ),
  })

  if (!jeEntry) return { reversed: false }

  // Get original lines
  const lines = await db.query.journalEntryLines.findMany({
    where: eq(journalEntryLines.journalEntryId, jeEntry.id),
  })

  // Look up account codes for each accountId and swap debits/credits
  const reversingLines: JournalLine[] = []
  for (const line of lines) {
    const account = await db.query.chartOfAccounts.findFirst({
      where: eq(chartOfAccounts.id, line.accountId),
    })
    if (!account) {
      throw new Error(`Account #${line.accountId} not found when reversing GL entry`)
    }

    reversingLines.push({
      accountCode: account.accountCode,
      debitAmount: line.creditAmount, // swap
      creditAmount: line.debitAmount, // swap
      description: `Reversal: ${line.description || ''}`,
    })
  }

  // Create reversing journal entry
  const reversalEntryId = await createJournalEntry({
    description,
    referenceType,
    referenceId,
    branchId,
    userId,
    lines: reversingLines,
  })

  // Mark original as reversed
  const now = new Date().toISOString()
  await db
    .update(journalEntries)
    .set({
      status: 'reversed',
      reversedBy: userId,
      reversedAt: now,
      reversalEntryId,
      updatedAt: now,
    })
    .where(eq(journalEntries.id, jeEntry.id))

  return { reversed: true, originalEntryId: jeEntry.id, reversalEntryId }
}

// ─── Sale Reversal ───────────────────────────────────────────────────────────

/**
 * Reverse a sale: restore inventory, restore cost layers, void the sale,
 * cancel commissions, cancel receivables, and post reversing GL entry.
 */
export async function executeSaleReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch sale
  const sale = await db.query.sales.findFirst({
    where: eq(sales.id, entityId),
  })
  if (!sale) throw new Error(`Sale #${entityId} not found`)
  if (sale.isVoided) throw new Error(`Sale #${entityId} is already voided`)

  // Fetch sale items
  const items = await db.query.saleItems.findMany({
    where: eq(saleItems.saleId, entityId),
  })

  // 1. Restore inventory quantities and cost layers
  for (const item of items) {
    await db
      .update(inventory)
      .set({
        quantity: sql`${inventory.quantity} + ${item.quantity}`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(eq(inventory.productId, item.productId), eq(inventory.branchId, sale.branchId))
      )

    await restoreCostLayers({
      productId: item.productId,
      branchId: sale.branchId,
      quantity: item.quantity,
      unitCost: item.costPrice,
      referenceType: 'void',
      referenceId: sale.id,
    })
  }

  // 2. Mark sale as voided
  await db
    .update(sales)
    .set({
      isVoided: true,
      voidReason: 'Reversed via reversal system',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(sales.id, entityId))

  // 3. Cancel linked commissions
  const cancelledCommissions = await db
    .update(commissions)
    .set({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(commissions.saleId, entityId))
    .returning()

  // 4. Cancel linked receivables
  const linkedReceivable = await db.query.accountReceivables.findFirst({
    where: eq(accountReceivables.saleId, entityId),
  })
  if (linkedReceivable) {
    await db
      .update(accountReceivables)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accountReceivables.id, linkedReceivable.id))
  }

  // 5. Post reversing GL entry via dedicated void sale GL function
  const reversalJEId = await postVoidSaleToGL(
    sale,
    items.map((item) => ({ costPrice: item.costPrice, quantity: item.quantity })),
    userId
  )

  return {
    reversalDetails: {
      saleId: entityId,
      invoiceNumber: sale.invoiceNumber,
      itemsRestored: items.length,
      commissionssCancelled: cancelledCommissions.length,
      receivableCancelled: linkedReceivable?.id ?? null,
      reversalJournalEntryId: reversalJEId,
    },
  }
}

// ─── Expense Reversal ────────────────────────────────────────────────────────

/**
 * Reverse an expense: cancel linked AP if present, void the expense,
 * and reverse the GL entry.
 */
export async function executeExpenseReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch expense
  const expense = await db.query.expenses.findFirst({
    where: eq(expenses.id, entityId),
  })
  if (!expense) throw new Error(`Expense #${entityId} not found`)
  if (expense.isVoided) throw new Error(`Expense #${entityId} is already voided`)

  // 1. Cancel linked AP if expense has a payableId
  let cancelledPayableId: number | null = null
  if (expense.payableId) {
    await db
      .update(accountPayables)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accountPayables.id, expense.payableId))
    cancelledPayableId = expense.payableId
  }

  // 2. Mark expense as voided
  await db
    .update(expenses)
    .set({
      isVoided: true,
      voidReason: 'Reversed via reversal system',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(expenses.id, entityId))

  // 3. Reverse GL entry
  const glResult = await reverseGLEntry(
    'expense',
    entityId,
    `Reversal of expense #${entityId}`,
    expense.branchId,
    userId
  )

  return {
    reversalDetails: {
      expenseId: entityId,
      amount: expense.amount,
      cancelledPayableId,
      glReversed: glResult.reversed,
      originalJournalEntryId: glResult.originalEntryId ?? null,
      reversalJournalEntryId: glResult.reversalEntryId ?? null,
    },
  }
}

// ─── Journal Entry Reversal ──────────────────────────────────────────────────

/**
 * Reverse a manual journal entry: validate status, fetch lines,
 * look up account codes, create reversing entry, mark original as reversed.
 */
export async function executeJournalEntryReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch the journal entry
  const jeEntry = await db.query.journalEntries.findFirst({
    where: eq(journalEntries.id, entityId),
  })
  if (!jeEntry) throw new Error(`Journal entry #${entityId} not found`)

  // Validate status
  if (jeEntry.status === 'draft') {
    throw new Error(`Journal entry #${entityId} is a draft and cannot be reversed — delete it instead`)
  }
  if (jeEntry.status === 'reversed') {
    throw new Error(`Journal entry #${entityId} is already reversed`)
  }

  // Fetch original lines
  const lines = await db.query.journalEntryLines.findMany({
    where: eq(journalEntryLines.journalEntryId, entityId),
  })

  // Look up account codes and build reversing lines
  const reversingLines: JournalLine[] = []
  for (const line of lines) {
    const account = await db.query.chartOfAccounts.findFirst({
      where: eq(chartOfAccounts.id, line.accountId),
    })
    if (!account) {
      throw new Error(`Account #${line.accountId} not found when reversing journal entry`)
    }

    reversingLines.push({
      accountCode: account.accountCode,
      debitAmount: line.creditAmount, // swap
      creditAmount: line.debitAmount, // swap
      description: `Reversal: ${line.description || ''}`,
    })
  }

  // Create reversing journal entry
  const reversalEntryId = await createJournalEntry({
    description: `Reversal of ${jeEntry.entryNumber}: ${jeEntry.description}`,
    referenceType: jeEntry.referenceType || 'journal_entry',
    referenceId: jeEntry.referenceId || entityId,
    branchId: jeEntry.branchId || 1,
    userId,
    lines: reversingLines,
  })

  // Mark original as reversed
  const now = new Date().toISOString()
  await db
    .update(journalEntries)
    .set({
      status: 'reversed',
      reversedBy: userId,
      reversedAt: now,
      reversalEntryId,
      updatedAt: now,
    })
    .where(eq(journalEntries.id, entityId))

  return {
    reversalDetails: {
      journalEntryId: entityId,
      entryNumber: jeEntry.entryNumber,
      originalDescription: jeEntry.description,
      linesReversed: lines.length,
      reversalEntryId,
    },
  }
}

// ─── Purchase Reversal ───────────────────────────────────────────────────────

/**
 * Reverse a purchase: if received, deduct inventory and mark cost layers as consumed;
 * cancel linked AP; mark purchase as cancelled; reverse GL entry.
 */
export async function executePurchaseReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch purchase
  const purchase = await db.query.purchases.findFirst({
    where: eq(purchases.id, entityId),
  })
  if (!purchase) throw new Error(`Purchase #${entityId} not found`)
  if (purchase.status === 'cancelled') {
    throw new Error(`Purchase #${entityId} is already cancelled`)
  }

  // Fetch purchase items
  const items = await db.query.purchaseItems.findMany({
    where: eq(purchaseItems.purchaseId, entityId),
  })

  let inventoryDeducted = false

  // 1. If purchase was received, deduct inventory and mark cost layers as consumed
  if (purchase.status === 'received' || purchase.status === 'partial') {
    for (const item of items) {
      if (item.receivedQuantity > 0) {
        // Deduct inventory
        await db
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${item.receivedQuantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(inventory.productId, item.productId),
              eq(inventory.branchId, purchase.branchId)
            )
          )

        // Mark cost layers linked to this purchase item as fully consumed
        await db
          .update(inventoryCostLayers)
          .set({
            quantity: 0,
            isFullyConsumed: true,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(inventoryCostLayers.purchaseItemId, item.id))
      }
    }
    inventoryDeducted = true
  }

  // 2. Cancel linked AP
  let cancelledPayableId: number | null = null
  const linkedPayable = await db.query.accountPayables.findFirst({
    where: eq(accountPayables.purchaseId, entityId),
  })
  if (linkedPayable && linkedPayable.status !== 'cancelled') {
    await db
      .update(accountPayables)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accountPayables.id, linkedPayable.id))
    cancelledPayableId = linkedPayable.id
  }

  // 3. Mark purchase as cancelled
  await db
    .update(purchases)
    .set({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(purchases.id, entityId))

  // 4. Reverse GL entry
  const glResult = await reverseGLEntry(
    'purchase',
    entityId,
    `Reversal of purchase ${purchase.purchaseOrderNumber}`,
    purchase.branchId,
    userId
  )

  return {
    reversalDetails: {
      purchaseId: entityId,
      purchaseOrderNumber: purchase.purchaseOrderNumber,
      inventoryDeducted,
      itemsAffected: items.length,
      cancelledPayableId,
      glReversed: glResult.reversed,
      originalJournalEntryId: glResult.originalEntryId ?? null,
      reversalJournalEntryId: glResult.reversalEntryId ?? null,
    },
  }
}

// ─── AR Payment Reversal ─────────────────────────────────────────────────────

/**
 * Reverse an AR (receivable) payment: restore the receivable's paidAmount,
 * update its status, and reverse the GL entry.
 */
export async function executeARPaymentReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch the payment
  const payment = await db.query.receivablePayments.findFirst({
    where: eq(receivablePayments.id, entityId),
  })
  if (!payment) throw new Error(`Receivable payment #${entityId} not found`)

  // Fetch the associated receivable
  const receivable = await db.query.accountReceivables.findFirst({
    where: eq(accountReceivables.id, payment.receivableId),
  })
  if (!receivable) throw new Error(`Account receivable #${payment.receivableId} not found`)

  // 1. Restore receivable paidAmount and remainingAmount
  const newPaidAmount = receivable.paidAmount - payment.amount
  const newRemainingAmount = receivable.totalAmount - newPaidAmount

  // 2. Determine new status
  let newStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  if (newPaidAmount <= 0) {
    newStatus = 'pending'
  } else if (newPaidAmount < receivable.totalAmount) {
    newStatus = 'partial'
  } else {
    newStatus = 'paid'
  }

  await db
    .update(accountReceivables)
    .set({
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accountReceivables.id, payment.receivableId))

  // 3. Reverse GL entry
  const glResult = await reverseGLEntry(
    'receivable_payment',
    entityId,
    `Reversal of AR payment #${entityId} for invoice ${receivable.invoiceNumber}`,
    receivable.branchId,
    userId
  )

  return {
    reversalDetails: {
      paymentId: entityId,
      receivableId: payment.receivableId,
      invoiceNumber: receivable.invoiceNumber,
      amountReversed: payment.amount,
      newPaidAmount,
      newRemainingAmount,
      newReceivableStatus: newStatus,
      glReversed: glResult.reversed,
      originalJournalEntryId: glResult.originalEntryId ?? null,
      reversalJournalEntryId: glResult.reversalEntryId ?? null,
    },
  }
}

// ─── AP Payment Reversal ─────────────────────────────────────────────────────

/**
 * Reverse an AP (payable) payment: restore the payable's paidAmount,
 * update its status, and reverse the GL entry.
 */
export async function executeAPPaymentReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch the payment
  const payment = await db.query.payablePayments.findFirst({
    where: eq(payablePayments.id, entityId),
  })
  if (!payment) throw new Error(`Payable payment #${entityId} not found`)

  // Fetch the associated payable
  const payable = await db.query.accountPayables.findFirst({
    where: eq(accountPayables.id, payment.payableId),
  })
  if (!payable) throw new Error(`Account payable #${payment.payableId} not found`)

  // 1. Restore payable paidAmount and remainingAmount
  const newPaidAmount = payable.paidAmount - payment.amount
  const newRemainingAmount = payable.totalAmount - newPaidAmount

  // 2. Determine new status
  let newStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  if (newPaidAmount <= 0) {
    newStatus = 'pending'
  } else if (newPaidAmount < payable.totalAmount) {
    newStatus = 'partial'
  } else {
    newStatus = 'paid'
  }

  await db
    .update(accountPayables)
    .set({
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accountPayables.id, payment.payableId))

  // 3. Reverse GL entry
  const glResult = await reverseGLEntry(
    'payable_payment',
    entityId,
    `Reversal of AP payment #${entityId} for invoice ${payable.invoiceNumber}`,
    payable.branchId,
    userId
  )

  return {
    reversalDetails: {
      paymentId: entityId,
      payableId: payment.payableId,
      invoiceNumber: payable.invoiceNumber,
      amountReversed: payment.amount,
      newPaidAmount,
      newRemainingAmount,
      newPayableStatus: newStatus,
      glReversed: glResult.reversed,
      originalJournalEntryId: glResult.originalEntryId ?? null,
      reversalJournalEntryId: glResult.reversalEntryId ?? null,
    },
  }
}

// ─── Commission Reversal ─────────────────────────────────────────────────────

/**
 * Reverse a commission: mark as cancelled and reverse the GL entry if one exists.
 */
export async function executeCommissionReversal(
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  const db = getDatabase()

  // Fetch commission
  const commission = await db.query.commissions.findFirst({
    where: eq(commissions.id, entityId),
  })
  if (!commission) throw new Error(`Commission #${entityId} not found`)
  if (commission.status === 'cancelled') {
    throw new Error(`Commission #${entityId} is already cancelled`)
  }

  // 1. Mark commission as cancelled
  await db
    .update(commissions)
    .set({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(commissions.id, entityId))

  // 2. Reverse GL entry if one exists
  const glResult = await reverseGLEntry(
    'commission',
    entityId,
    `Reversal of commission #${entityId}`,
    commission.branchId,
    userId
  )

  return {
    reversalDetails: {
      commissionId: entityId,
      saleId: commission.saleId,
      commissionAmount: commission.commissionAmount,
      previousStatus: commission.status,
      glReversed: glResult.reversed,
      originalJournalEntryId: glResult.originalEntryId ?? null,
      reversalJournalEntryId: glResult.reversalEntryId ?? null,
    },
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

/**
 * Dispatch a reversal to the correct executor based on entity type.
 * Throws for entity types that are not yet implemented.
 */
export async function executeReversal(
  entityType: string,
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  switch (entityType) {
    case 'sale':
      return executeSaleReversal(entityId, userId)
    case 'expense':
      return executeExpenseReversal(entityId, userId)
    case 'journal_entry':
      return executeJournalEntryReversal(entityId, userId)
    case 'purchase':
      return executePurchaseReversal(entityId, userId)
    case 'receivable_payment':
      return executeARPaymentReversal(entityId, userId)
    case 'payable_payment':
      return executeAPPaymentReversal(entityId, userId)
    case 'commission':
      return executeCommissionReversal(entityId, userId)
    case 'stock_adjustment':
    case 'stock_transfer':
    case 'return':
      throw new Error(`Reversal for entity type '${entityType}' is not yet implemented`)
    default:
      throw new Error(`Unknown entity type for reversal: '${entityType}'`)
  }
}
