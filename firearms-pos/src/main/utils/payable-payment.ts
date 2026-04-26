import { eq } from 'drizzle-orm'
import {
  accountPayables,
  payablePayments,
  purchases,
  expenses,
  cashTransactions,
  onlineTransactions,
  suppliers,
  type AccountPayable,
} from '../db/schema'
import { postAPPaymentToGL } from './gl-posting'
import { mapPaymentMethodToChannel } from '../ipc/online-transactions-ipc'

export interface RecordPaymentInput {
  payableId: number
  amount: number
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mobile'
  referenceNumber?: string
  notes?: string
}

export interface SessionContext {
  userId: number
  branchId?: number | null
}

export interface SubmissionResult {
  payment: { id: number; amount: number }
  payable: AccountPayable
  newPaidAmount: number
  newRemainingAmount: number
  newStatus: 'paid' | 'partial'
  purchaseSync: {
    purchaseId: number
    purchaseOrderNumber: string
    oldStatus: string
    newStatus: 'paid' | 'partial'
  } | null
  expenseSync: { expenseId: number; oldStatus: string } | null
}

/**
 * Shared write-path for payable payments. Called from:
 *   - payables:record-payment          (AP tab)
 *   - purchases:record-partial-payment (Purchases tab partial)
 *   - purchases:pay-off                (Purchases tab full)
 *
 * Caller is responsible for its own audit-log entries and cash-session preflight.
 */
// biome-ignore lint/suspicious/noExplicitAny: drizzle tx type is a union we intentionally accept
export async function recordPayableSubmission(
  txDb: any,
  payable: AccountPayable,
  data: RecordPaymentInput,
  session: SessionContext,
  openCashSessionId: number | null
): Promise<SubmissionResult> {
  if (data.amount <= 0) throw new Error('Payment amount must be greater than 0')
  if (payable.status === 'paid') throw new Error('This payable is already fully paid')
  if (payable.status === 'cancelled') throw new Error('Cannot record payment for cancelled payable')
  if (payable.status === 'reversed') throw new Error('Cannot record payment for reversed payable')
  if (data.amount > payable.remainingAmount) {
    throw new Error(`Payment amount cannot exceed remaining balance of ${payable.remainingAmount}`)
  }

  // Held-payment gate: non-cash AP payments do NOT touch GL, AP balance, or
  // synced records until the matching online_transactions row is approved.
  // Cash payments still post immediately (drawer is the source of truth).
  const isHeld = data.paymentMethod !== 'cash'

  const newPaidAmount = payable.paidAmount + data.amount
  const newRemainingAmount = payable.totalAmount - newPaidAmount
  const newStatus: 'paid' | 'partial' = newRemainingAmount <= 0 ? 'paid' : 'partial'
  const now = new Date().toISOString()

  const [payment] = await txDb
    .insert(payablePayments)
    .values({
      payableId: data.payableId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      paidBy: session.userId,
      status: isHeld ? 'pending_approval' : 'posted',
    })
    .returning()

  let purchaseSync: SubmissionResult['purchaseSync'] = null
  let expenseSync: SubmissionResult['expenseSync'] = null

  if (!isHeld) {
    // Cash path: update AP balance + sync purchases/expenses + post GL now.
    await txDb
      .update(accountPayables)
      .set({
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(accountPayables.id, data.payableId))

    if (payable.purchaseId) {
      const linkedPurchase = await txDb.query.purchases.findFirst({
        where: eq(purchases.id, payable.purchaseId),
      })
      if (linkedPurchase && linkedPurchase.paymentStatus !== newStatus) {
        await txDb
          .update(purchases)
          .set({ paymentStatus: newStatus, updatedAt: now })
          .where(eq(purchases.id, linkedPurchase.id))
        purchaseSync = {
          purchaseId: linkedPurchase.id,
          purchaseOrderNumber: linkedPurchase.purchaseOrderNumber,
          oldStatus: linkedPurchase.paymentStatus,
          newStatus,
        }
      }
    }

    if (newStatus === 'paid') {
      const linkedExpense = await txDb.query.expenses.findFirst({
        where: eq(expenses.payableId, payable.id),
      })
      if (linkedExpense && linkedExpense.paymentStatus === 'unpaid') {
        await txDb
          .update(expenses)
          .set({ paymentStatus: 'paid', updatedAt: now })
          .where(eq(expenses.id, linkedExpense.id))
        expenseSync = { expenseId: linkedExpense.id, oldStatus: linkedExpense.paymentStatus }
      }
    }

    await postAPPaymentToGL(
      {
        id: payment.id,
        payableId: data.payableId,
        branchId: payable.branchId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        invoiceNumber: payable.invoiceNumber,
      },
      session.userId
    )

    if (openCashSessionId !== null) {
      await txDb.insert(cashTransactions).values({
        sessionId: openCashSessionId,
        branchId: payable.branchId,
        transactionType: 'ap_payment',
        amount: -data.amount,
        referenceType: 'payable_payment',
        referenceId: payment.id,
        description: `AP payment: ${payable.invoiceNumber}`,
        recordedBy: session.userId,
      })
    }
  }

  // Always create online_transactions row for non-cash methods so the
  // approver can see and act on it. For held payments this is the gate; the
  // AP balance/GL only update on confirm.
  let supplierName: string | null = null
  if (payable.supplierId) {
    const supplier = await txDb.query.suppliers.findFirst({
      where: eq(suppliers.id, payable.supplierId),
    })
    supplierName = supplier?.name ?? null
  }

  if (isHeld) {
    await txDb.insert(onlineTransactions).values({
      branchId: payable.branchId,
      transactionDate: new Date().toISOString().split('T')[0],
      amount: data.amount,
      paymentChannel: mapPaymentMethodToChannel(data.paymentMethod),
      direction: 'outflow',
      referenceNumber: data.referenceNumber,
      customerName: supplierName,
      invoiceNumber: payable.invoiceNumber,
      status: 'pending',
      sourceType: 'payable_payment',
      sourceId: payment.id,
      payableId: data.payableId,
      createdBy: session.userId,
    })
  }

  return {
    payment: { id: payment.id, amount: payment.amount },
    payable,
    // Report what the AP would look like after approval — caller may use
    // these for messaging. Held payments DO NOT actually update the AP yet.
    newPaidAmount: isHeld ? payable.paidAmount : newPaidAmount,
    newRemainingAmount: isHeld ? payable.remainingAmount : newRemainingAmount,
    newStatus: isHeld ? (payable.status as 'paid' | 'partial') : newStatus,
    purchaseSync,
    expenseSync,
  }
}
