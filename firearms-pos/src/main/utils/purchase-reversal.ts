import { and, eq, inArray, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  purchases,
  purchaseItems,
  inventoryCostLayers,
  accountPayables,
  payablePayments,
  businessSettings,
  products,
  expenses,
} from '../db/schema'
import { withTransaction } from './db-transaction'
import { createAuditLog } from './audit'
import { executePurchaseReversal } from './reversal-executors'

export interface ReversalSession {
  userId: number
  role: string
  branchId: number | null
}

export interface CheckReversibleResult {
  allowed: boolean
  blockers: string[]
}

export interface PrefillDraftItem {
  productId: number
  quantity: number
  unitCost: number
}

export interface PrefillDraft {
  supplierId: number
  branchId: number
  items: PrefillDraftItem[]
  shippingCost: number
  taxAmount: number
  paymentMethod: 'cash' | 'cheque' | 'pay_later'
  notes: string
}

export interface ReverseAndReenterResult {
  success: boolean
  error?: string
  prefillDraft?: PrefillDraft
  reversalDetails?: Record<string, unknown>
}

const DEFAULT_MAX_DAYS = 90
const MIN_REASON_LENGTH = 10

export async function checkReversible(
  purchaseId: number,
  session: ReversalSession,
): Promise<CheckReversibleResult> {
  if (session.role !== 'admin') {
    return { allowed: false, blockers: ['Only an admin can reverse a purchase order.'] }
  }

  const db = getDatabase()

  const purchase = await db.query.purchases.findFirst({
    where: eq(purchases.id, purchaseId),
  })
  if (!purchase) {
    return { allowed: false, blockers: [`Purchase #${purchaseId} not found.`] }
  }
  if (purchase.status === 'reversed' || purchase.status === 'cancelled') {
    return { allowed: false, blockers: [`Purchase is already ${purchase.status}.`] }
  }

  const blockers: string[] = []

  const items = await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId))
  const itemIds = items.map((i) => i.id)

  if (itemIds.length > 0) {
    const layers = await db
      .select()
      .from(inventoryCostLayers)
      .where(inArray(inventoryCostLayers.purchaseItemId, itemIds))

    const consumedByProduct = new Map<number, number>()
    for (const l of layers) {
      const consumed = (l.originalQuantity ?? 0) - (l.quantity ?? 0)
      if (consumed > 0) {
        consumedByProduct.set(l.productId, (consumedByProduct.get(l.productId) ?? 0) + consumed)
      }
    }

    for (const [productId, consumed] of consumedByProduct) {
      const prod = await db.query.products.findFirst({ where: eq(products.id, productId) })
      blockers.push(
        `${prod?.name ?? `Product #${productId}`}: ${consumed} units already sold — use Stock Adjustment instead.`,
      )
    }
  }

  const settingsRow = await db.query.businessSettings.findFirst()
  const maxDays = settingsRow?.purchaseReversalMaxDays ?? DEFAULT_MAX_DAYS
  const ageDays = Math.floor(
    (Date.now() - new Date(purchase.createdAt).getTime()) / 86_400_000,
  )
  if (ageDays > maxDays) {
    blockers.push(`Purchase is ${ageDays} days old; policy allows only ${maxDays} days.`)
  }

  const payable = await db.query.accountPayables.findFirst({
    where: eq(accountPayables.purchaseId, purchaseId),
  })
  if (payable && payable.status === 'paid') {
    blockers.push('Linked payable is fully paid. Reverse or unlink the payment before reversing the purchase.')
  }

  return { allowed: blockers.length === 0, blockers }
}

export async function reversePurchaseAndReenter(
  purchaseId: number,
  reason: string,
  session: ReversalSession,
): Promise<ReverseAndReenterResult> {
  const pre = await checkReversible(purchaseId, session)
  if (!pre.allowed) {
    return { success: false, error: pre.blockers.join(' ') }
  }
  const trimmed = (reason ?? '').trim()
  if (trimmed.length < MIN_REASON_LENGTH) {
    return { success: false, error: `Reason must be at least ${MIN_REASON_LENGTH} characters.` }
  }

  try {
    const result = await withTransaction(async ({ db }) => {
      const original = await db.query.purchases.findFirst({
        where: eq(purchases.id, purchaseId),
      })
      if (!original) throw new Error('Purchase disappeared between preflight and execution.')

      const items = await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId))
      const payable = await db.query.accountPayables.findFirst({
        where: eq(accountPayables.purchaseId, purchaseId),
      })
      const payments = payable
        ? await db.select().from(payablePayments).where(eq(payablePayments.payableId, payable.id))
        : []
      const linkedExpense = payable
        ? await db.query.expenses.findFirst({ where: eq(expenses.payableId, payable.id) })
        : null

      const oldValues = {
        purchase: original,
        items,
        payable: payable ?? null,
        payablePayments: payments,
        expense: linkedExpense ?? null,
      }

      const execResult = await executePurchaseReversal(purchaseId, session.userId)

      await db
        .update(purchases)
        .set({
          status: 'reversed',
          reversalReason: trimmed,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(purchases.id, purchaseId))

      if (payable) {
        await db
          .update(accountPayables)
          .set({ status: 'reversed', updatedAt: new Date().toISOString() })
          .where(eq(accountPayables.id, payable.id))
      }

      if (linkedExpense) {
        await db
          .update(expenses)
          .set({ isReversed: true, updatedAt: new Date().toISOString() })
          .where(eq(expenses.id, linkedExpense.id))
      }

      const newValues = {
        status: 'reversed',
        reason: trimmed,
        reversalDetails: execResult.reversalDetails,
      }

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'reversal_executed',
        entityType: 'purchase',
        entityId: original.id,
        oldValues,
        newValues,
        description: trimmed,
      })

      const prefillDraft: PrefillDraft = {
        supplierId: original.supplierId,
        branchId: original.branchId,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitCost: it.unitCost,
        })),
        shippingCost: original.shippingCost,
        taxAmount: original.taxAmount,
        paymentMethod: original.paymentMethod,
        notes: `Re-entry of reversed ${original.purchaseOrderNumber}`,
      }

      return { prefillDraft, reversalDetails: execResult.reversalDetails }
    })

    return { success: true, ...result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
