import { eq } from 'drizzle-orm'
import {
  accountPayables,
  payablePayments,
  purchases,
  expenses,
  cashTransactions,
  onlineTransactions,
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
    })
    .returning()

  await txDb
    .update(accountPayables)
    .set({
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status: newStatus,
      updatedAt: now,
    })
    .where(eq(accountPayables.id, data.payableId))

  let purchaseSync: SubmissionResult['purchaseSync'] = null
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

  let expenseSync: SubmissionResult['expenseSync'] = null
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

  if (data.paymentMethod !== 'cash') {
    await txDb.insert(onlineTransactions).values({
      branchId: payable.branchId,
      transactionDate: new Date().toISOString().split('T')[0],
      amount: data.amount,
      paymentChannel: mapPaymentMethodToChannel(data.paymentMethod),
      direction: 'outflow',
      referenceNumber: data.referenceNumber,
      invoiceNumber: payable.invoiceNumber,
      status: 'pending',
      sourceType: 'payable_payment',
      sourceId: payment.id,
      payableId: data.payableId,
      createdBy: session.userId,
    })
  }

  if (data.paymentMethod === 'cash' && openCashSessionId !== null) {
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

  return {
    payment: { id: payment.id, amount: payment.amount },
    payable,
    newPaidAmount,
    newRemainingAmount,
    newStatus,
    purchaseSync,
    expenseSync,
  }
}
