import { ipcMain } from 'electron'
import { eq, ne, and, desc, asc, sql, gte, lte, like, or, inArray } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  onlineTransactions,
  customers,
  branches,
  users,
  accountPayables,
  payablePayments,
  accountReceivables,
  receivablePayments,
  journalEntries,
  sales,
  saleItems,
  salePayments,
  inventory,
  products,
  purchases,
  expenses,
  type NewOnlineTransaction,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { withTransaction } from '../utils/db-transaction'
import {
  ACCOUNT_CODES,
  createJournalEntry,
  postSaleToGL,
  postAPPaymentToGL,
  postARPaymentToGL,
} from '../utils/gl-posting'
import { consumeCostLayers } from '../utils/inventory-valuation'

// Roles that may approve / reject pending online transactions
const APPROVER_ROLES = new Set(['admin', 'manager'])

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface OnlineTransactionFilters extends PaginationParams {
  branchId?: number
  paymentChannel?: string
  status?: string
  startDate?: string
  endDate?: string
  search?: string
  direction?: string
}

interface OnlineTransactionDashboardParams {
  branchId: number
  timePeriod: string
  customStart?: string
  customEnd?: string
}

/**
 * Helper: map a sale/receivable/payable payment method to online transaction channel
 */
export function mapPaymentMethodToChannel(
  method: string
): 'bank_transfer' | 'mobile' | 'card' | 'cod' | 'cheque' | 'other' {
  switch (method) {
    case 'bank_transfer':
      return 'bank_transfer'
    case 'mobile':
      return 'mobile'
    case 'card':
    case 'debit_card':
      return 'card'
    case 'cod':
      return 'cod'
    case 'cheque':
      return 'cheque'
    default:
      return 'other'
  }
}

/**
 * Create an online transaction record.
 * Called internally from sales/receivables/payables or manually.
 */
export async function createOnlineTransactionRecord(
  db: ReturnType<typeof getDatabase>,
  data: NewOnlineTransaction
) {
  const [record] = await db.insert(onlineTransactions).values(data).returning()
  return record
}

export function registerOnlineTransactionHandlers(): void {
  const db = getDatabase()

  // ── Get all with filters and pagination ──
  ipcMain.handle(
    'online-transactions:get-all',
    async (_, filters: OnlineTransactionFilters) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Unauthorized' }

        const page = filters.page || 1
        const limit = filters.limit || 50
        const offset = (page - 1) * limit

        const conditions: ReturnType<typeof eq>[] = []

        if (filters.branchId) {
          conditions.push(eq(onlineTransactions.branchId, filters.branchId))
        }
        if (filters.paymentChannel && filters.paymentChannel !== 'all') {
          conditions.push(eq(onlineTransactions.paymentChannel, filters.paymentChannel as any))
        }
        if (filters.status && filters.status !== 'all') {
          conditions.push(eq(onlineTransactions.status, filters.status as any))
        }
        if (filters.direction && filters.direction !== 'all') {
          conditions.push(eq(onlineTransactions.direction, filters.direction as any))
        }
        if (filters.startDate) {
          conditions.push(gte(onlineTransactions.transactionDate, filters.startDate))
        }
        if (filters.endDate) {
          conditions.push(lte(onlineTransactions.transactionDate, filters.endDate))
        }
        if (filters.search) {
          const term = `%${filters.search}%`
          conditions.push(
            or(
              like(onlineTransactions.referenceNumber, term),
              like(onlineTransactions.customerName, term),
              like(onlineTransactions.invoiceNumber, term),
              like(onlineTransactions.bankAccountName, term),
              like(onlineTransactions.notes, term)
            )!
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [data, countResult] = await Promise.all([
          db
            .select({
              id: onlineTransactions.id,
              branchId: onlineTransactions.branchId,
              transactionDate: onlineTransactions.transactionDate,
              amount: onlineTransactions.amount,
              paymentChannel: onlineTransactions.paymentChannel,
              direction: onlineTransactions.direction,
              referenceNumber: onlineTransactions.referenceNumber,
              customerName: onlineTransactions.customerName,
              customerId: onlineTransactions.customerId,
              invoiceNumber: onlineTransactions.invoiceNumber,
              bankAccountName: onlineTransactions.bankAccountName,
              status: onlineTransactions.status,
              notes: onlineTransactions.notes,
              sourceType: onlineTransactions.sourceType,
              sourceId: onlineTransactions.sourceId,
              saleId: onlineTransactions.saleId,
              receivableId: onlineTransactions.receivableId,
              payableId: onlineTransactions.payableId,
              confirmedAt: onlineTransactions.confirmedAt,
              createdAt: onlineTransactions.createdAt,
              createdByName: users.fullName,
            })
            .from(onlineTransactions)
            .leftJoin(users, eq(onlineTransactions.createdBy, users.id))
            .where(whereClause)
            .orderBy(desc(onlineTransactions.transactionDate), desc(onlineTransactions.id))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(onlineTransactions)
            .where(whereClause),
        ])

        const total = countResult[0]?.count || 0

        return {
          success: true,
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      } catch (error) {
        console.error('Get online transactions error:', error)
        return { success: false, message: 'Failed to fetch online transactions' }
      }
    }
  )

  // ── Create (manual entry) ──
  ipcMain.handle(
    'online-transactions:create',
    async (_, data: Record<string, unknown>) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Unauthorized' }

        const [record] = await db
          .insert(onlineTransactions)
          .values({
            branchId: data.branchId as number,
            transactionDate: (data.transactionDate as string) || new Date().toISOString().split('T')[0],
            amount: data.amount as number,
            paymentChannel: data.paymentChannel as any,
            direction: (data.direction as any) || 'inflow',
            referenceNumber: data.referenceNumber as string | undefined,
            customerName: data.customerName as string | undefined,
            customerId: data.customerId as number | undefined,
            invoiceNumber: data.invoiceNumber as string | undefined,
            bankAccountName: data.bankAccountName as string | undefined,
            status: (data.status as any) || 'pending',
            notes: data.notes as string | undefined,
            sourceType: 'manual',
            createdBy: session.userId,
          })
          .returning()

        await createAuditLog({
          userId: session.userId,
          branchId: data.branchId as number,
          action: 'create',
          entityType: 'online_transaction',
          entityId: record.id,
          newValues: {
            amount: record.amount,
            paymentChannel: record.paymentChannel,
            direction: record.direction,
          },
          description: `Created manual online transaction: ${record.paymentChannel} ${record.amount}`,
        })

        return { success: true, data: record }
      } catch (error) {
        console.error('Create online transaction error:', error)
        return { success: false, message: 'Failed to create online transaction' }
      }
    }
  )

  // ── Update ──
  ipcMain.handle(
    'online-transactions:update',
    async (_, id: number, data: Record<string, unknown>) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Unauthorized' }

        const existing = await db.query.onlineTransactions.findFirst({
          where: eq(onlineTransactions.id, id),
        })
        if (!existing) return { success: false, message: 'Transaction not found' }

        // Only allow editing manual or pending transactions
        if (existing.sourceType !== 'manual' && existing.status === 'confirmed') {
          return { success: false, message: 'Cannot edit confirmed auto-recorded transactions' }
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        const editableFields = [
          'transactionDate', 'amount', 'paymentChannel', 'direction',
          'referenceNumber', 'customerName', 'customerId', 'invoiceNumber',
          'bankAccountName', 'status', 'notes',
        ]
        for (const field of editableFields) {
          if (data[field] !== undefined) {
            updateData[field] = data[field]
          }
        }

        const [updated] = await db
          .update(onlineTransactions)
          .set(updateData as any)
          .where(eq(onlineTransactions.id, id))
          .returning()

        await createAuditLog({
          userId: session.userId,
          branchId: existing.branchId,
          action: 'update',
          entityType: 'online_transaction',
          entityId: id,
          oldValues: existing,
          newValues: updateData,
          description: `Updated online transaction #${id}`,
        })

        return { success: true, data: updated }
      } catch (error) {
        console.error('Update online transaction error:', error)
        return { success: false, message: 'Failed to update online transaction' }
      }
    }
  )

  // ── One-shot backfill: migrate legacy pending rows into the clearing model ──
  // Before the clearing-account approval gate existed, pending rows had their
  // GL postings credit/debit Cash in Bank (1020) directly. To make confirm/
  // reject work uniformly, post correcting JEs that move the cash side from
  // 1020 → 1030 for every still-pending row. Idempotent: skips rows already
  // backfilled (looks for a marker JE per row).
  ipcMain.handle('online-transactions:backfill-clearing', async () => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }
      if (session.role !== 'admin') {
        return { success: false, message: 'Admin only — destructive migration' }
      }

      const pending = await db.query.onlineTransactions.findMany({
        where: eq(onlineTransactions.status, 'pending'),
      })

      const results: Array<{ id: number; ok: boolean; message?: string }> = []

      for (const row of pending) {
        try {
          // Skip if already backfilled
          const marker = await db.query.journalEntries.findFirst({
            where: and(
              eq(journalEntries.referenceType, 'online_transaction_backfill'),
              eq(journalEntries.referenceId, row.id)
            ),
          })
          if (marker) {
            results.push({ id: row.id, ok: false, message: 'Already backfilled' })
            continue
          }

          // Inflow legacy:   DR 1020 / CR <revenue/AR>  →  correct to DR 1030 / CR 1020
          //                  (i.e., move the inflow from bank into clearing)
          // Outflow legacy:  DR <AP> / CR 1020         →  correct to DR 1020 / CR 1030
          //                  (i.e., put bank back, credit clearing instead)
          const lines =
            row.direction === 'outflow'
              ? [
                  {
                    accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                    debitAmount: row.amount,
                    creditAmount: 0,
                    description: `Backfill: undo legacy bank credit for online tx #${row.id}`,
                  },
                  {
                    accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                    debitAmount: 0,
                    creditAmount: row.amount,
                    description: `Backfill: post outflow obligation to clearing for online tx #${row.id}`,
                  },
                ]
              : [
                  {
                    accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                    debitAmount: row.amount,
                    creditAmount: 0,
                    description: `Backfill: move legacy inflow into clearing for online tx #${row.id}`,
                  },
                  {
                    accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                    debitAmount: 0,
                    creditAmount: row.amount,
                    description: `Backfill: undo legacy bank debit for online tx #${row.id}`,
                  },
                ]

          await createJournalEntry({
            description: `Clearing backfill for online tx #${row.id} (${row.paymentChannel}, ${row.direction})`,
            referenceType: 'online_transaction_backfill',
            referenceId: row.id,
            branchId: row.branchId,
            userId: session.userId,
            lines,
          })
          results.push({ id: row.id, ok: true })
        } catch (e) {
          results.push({ id: row.id, ok: false, message: (e as Error).message })
        }
      }

      const okCount = results.filter((r) => r.ok).length
      return {
        success: true,
        data: {
          totalPending: pending.length,
          backfilled: okCount,
          results,
        },
      }
    } catch (error) {
      console.error('Backfill clearing error:', error)
      return { success: false, message: (error as Error).message || 'Backfill failed' }
    }
  })

  // ── Delete ──
  ipcMain.handle('online-transactions:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }

      const existing = await db.query.onlineTransactions.findFirst({
        where: eq(onlineTransactions.id, id),
      })
      if (!existing) return { success: false, message: 'Transaction not found' }

      if (existing.status === 'confirmed') {
        return { success: false, message: 'Cannot delete confirmed transactions' }
      }

      await db.delete(onlineTransactions).where(eq(onlineTransactions.id, id))

      await createAuditLog({
        userId: session.userId,
        branchId: existing.branchId,
        action: 'delete',
        entityType: 'online_transaction',
        entityId: id,
        oldValues: existing,
        description: `Deleted online transaction #${id}`,
      })

      return { success: true }
    } catch (error) {
      console.error('Delete online transaction error:', error)
      return { success: false, message: 'Failed to delete online transaction' }
    }
  })

  // ── Finalize a held sale on approval ──
  // Held sales (mobile / card) skip inventory deduction and GL posting at
  // create-time. On approval we run the deferred work: validate stock, consume
  // FIFO cost layers, deduct inventory, post the sale GL (cash side → 1030
  // clearing as usual), insert the salePayment row, and flip paymentStatus
  // from 'pending_approval' to 'paid'. The drain JE (1030 → 1020) follows in
  // the calling confirm handler.
  async function finalizeHeldSale(
    txDb: any,
    sale: typeof sales.$inferSelect,
    onlineTx: typeof onlineTransactions.$inferSelect,
    userId: number
  ): Promise<void> {
    // Idempotency: if a non-reversed sale JE already exists, this sale was
    // already posted (legacy path or prior finalize). Skip to avoid double-
    // posting books / double-deducting inventory.
    const existingJE = await txDb.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.referenceType, 'sale'),
        eq(journalEntries.referenceId, sale.id),
        ne(journalEntries.status, 'reversed')
      ),
    })
    if (existingJE) {
      console.log(
        `[finalizeHeldSale] sale #${sale.id} already has JE ${existingJE.id}; skipping finalize.`
      )
      // Defensive: if the sale row is still flagged pending_approval but books
      // are already posted, normalize the row so it stops blocking dashboards.
      if (sale.paymentStatus === 'pending_approval') {
        await txDb
          .update(sales)
          .set({ paymentStatus: 'paid', updatedAt: new Date().toISOString() })
          .where(eq(sales.id, sale.id))
      }
      return
    }

    // Re-validate stock (other sales may have depleted it)
    const items = await txDb.query.saleItems.findMany({
      where: eq(saleItems.saleId, sale.id),
    })
    for (const item of items) {
      const product = await txDb.query.products.findFirst({
        where: eq(products.id, item.productId),
      })
      // Skip stock check for service-only or non-tracked items
      const stock = await txDb.query.inventory.findFirst({
        where: and(
          eq(inventory.productId, item.productId),
          eq(inventory.branchId, sale.branchId)
        ),
      })
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product?.name || `product #${item.productId}`} — cannot approve sale ${sale.invoiceNumber}. Reject this transaction instead.`
        )
      }
    }

    // Consume FIFO cost layers and update saleItems with actual cost
    const finalizedItems: Array<{ costPrice: number; quantity: number }> = []
    for (const item of items) {
      const fifoResult = await consumeCostLayers(
        item.productId,
        sale.branchId,
        item.quantity
      )
      const actualCostPerUnit =
        item.quantity > 0 ? fifoResult.totalCost / item.quantity : item.costPrice

      // Update the saleItem if FIFO produced a different cost
      if (Math.abs(actualCostPerUnit - item.costPrice) > 0.01) {
        await txDb
          .update(saleItems)
          .set({ costPrice: actualCostPerUnit })
          .where(eq(saleItems.id, item.id))
      }

      finalizedItems.push({ costPrice: actualCostPerUnit, quantity: item.quantity })
    }

    // Deduct inventory
    for (const item of items) {
      await txDb
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} - ${item.quantity}`,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(inventory.productId, item.productId),
            eq(inventory.branchId, sale.branchId)
          )
        )
    }

    // Insert salePayment record
    await txDb.insert(salePayments).values({
      saleId: sale.id,
      paymentMethod: sale.paymentMethod === 'card' ? 'card' : 'mobile',
      amount: sale.totalAmount,
      referenceNumber: onlineTx.referenceNumber,
      notes: onlineTx.notes,
    })

    // Mark the sale paid FIRST so postSaleToGL sees amountPaid=totalAmount
    // and computes receivableAmount=0. Otherwise it would post a phantom AR
    // debit on top of the 1030 debit and the JE would not balance.
    const now = new Date().toISOString()
    await txDb
      .update(sales)
      .set({
        paymentStatus: 'paid',
        amountPaid: sale.totalAmount,
        updatedAt: now,
      })
      .where(eq(sales.id, sale.id))

    // Post the sale GL — cash side will route to 1030 (clearing); the confirm
    // handler then drains 1030 → 1020.
    const finalizedSale = { ...sale, amountPaid: sale.totalAmount, paymentStatus: 'paid' as const }
    await postSaleToGL(finalizedSale, finalizedItems, userId, [
      {
        method: sale.paymentMethod === 'card' ? 'card' : 'mobile',
        amount: sale.totalAmount,
        referenceNumber: onlineTx.referenceNumber || undefined,
      },
    ])
  }

  // ── Finalize a held AP payment on approval ──
  // Mirror of sale finalization. The pending payment row exists but did not
  // touch AP balance, purchase/expense sync, or GL. Approval applies all of
  // those, then the calling confirm handler posts the drain JE (1030 → 1020).
  async function finalizeHeldPayablePayment(
    txDb: any,
    payment: typeof payablePayments.$inferSelect,
    userId: number
  ): Promise<void> {
    // Idempotency: skip if a non-reversed JE already exists for this payment.
    const existingJE = await txDb.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.referenceType, 'payable_payment'),
        eq(journalEntries.referenceId, payment.id),
        ne(journalEntries.status, 'reversed')
      ),
    })
    if (existingJE) {
      console.log(
        `[finalizeHeldPayablePayment] payment #${payment.id} already has JE ${existingJE.id}; skipping finalize.`
      )
      if (payment.status !== 'posted') {
        await txDb
          .update(payablePayments)
          .set({ status: 'posted' })
          .where(eq(payablePayments.id, payment.id))
      }
      return
    }

    const payable = await txDb.query.accountPayables.findFirst({
      where: eq(accountPayables.id, payment.payableId),
    })
    if (!payable) throw new Error(`Payable #${payment.payableId} not found`)

    const newPaidAmount = payable.paidAmount + payment.amount
    const newRemainingAmount = payable.totalAmount - newPaidAmount
    const newStatus: 'paid' | 'partial' = newRemainingAmount <= 0 ? 'paid' : 'partial'
    const now = new Date().toISOString()

    await txDb
      .update(accountPayables)
      .set({
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(accountPayables.id, payable.id))

    if (payable.purchaseId) {
      const linkedPurchase = await txDb.query.purchases.findFirst({
        where: eq(purchases.id, payable.purchaseId),
      })
      if (linkedPurchase && linkedPurchase.paymentStatus !== newStatus) {
        await txDb
          .update(purchases)
          .set({ paymentStatus: newStatus, updatedAt: now })
          .where(eq(purchases.id, linkedPurchase.id))
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
      }
    }

    // Post the AP payment GL — cash side will route to 1030; the confirm
    // handler then drains 1030 → 1020.
    await postAPPaymentToGL(
      {
        id: payment.id,
        payableId: payment.payableId,
        branchId: payable.branchId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: payable.invoiceNumber,
      },
      userId
    )

    await txDb
      .update(payablePayments)
      .set({ status: 'posted' })
      .where(eq(payablePayments.id, payment.id))
  }

  // ── Finalize a held AR collection on approval ──
  async function finalizeHeldReceivablePayment(
    txDb: any,
    payment: typeof receivablePayments.$inferSelect,
    userId: number
  ): Promise<void> {
    // Idempotency: skip if a non-reversed JE already exists for this payment.
    // Prevents the stale-build scenario where a payment row was inserted with
    // legacy default status='posted' (no held-gate) but no finalize JE was
    // ever posted, causing confirm to drain 1030 with no offsetting credit.
    const existingJE = await txDb.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.referenceType, 'receivable_payment'),
        eq(journalEntries.referenceId, payment.id),
        ne(journalEntries.status, 'reversed')
      ),
    })
    if (existingJE) {
      console.log(
        `[finalizeHeldReceivablePayment] payment #${payment.id} already has JE ${existingJE.id}; skipping finalize.`
      )
      if (payment.status !== 'posted') {
        await txDb
          .update(receivablePayments)
          .set({ status: 'posted' })
          .where(eq(receivablePayments.id, payment.id))
      }
      return
    }

    const receivable = await txDb.query.accountReceivables.findFirst({
      where: eq(accountReceivables.id, payment.receivableId),
    })
    if (!receivable) throw new Error(`Receivable #${payment.receivableId} not found`)

    const newPaidAmount = receivable.paidAmount + payment.amount
    const newRemainingAmount = receivable.totalAmount - newPaidAmount
    const newStatus: 'paid' | 'partial' = newRemainingAmount <= 0 ? 'paid' : 'partial'
    const now = new Date().toISOString()

    await txDb
      .update(accountReceivables)
      .set({
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(accountReceivables.id, receivable.id))

    await postARPaymentToGL(
      {
        id: payment.id,
        receivableId: payment.receivableId,
        branchId: receivable.branchId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: receivable.invoiceNumber,
      },
      userId
    )

    await txDb
      .update(receivablePayments)
      .set({ status: 'posted' })
      .where(eq(receivablePayments.id, payment.id))
  }

  // ── Confirm transaction (posts the transfer journal) ──
  // Inflow  (sale / receivable_payment) → DR Cash in Bank / CR Pending Online
  // Outflow (payable_payment)           → DR Pending Online / CR Cash in Bank
  ipcMain.handle('online-transactions:confirm', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }
      if (!APPROVER_ROLES.has(session.role)) {
        return { success: false, message: 'Only admin or manager can approve online transactions' }
      }

      const existing = await db.query.onlineTransactions.findFirst({
        where: eq(onlineTransactions.id, id),
      })
      if (!existing) return { success: false, message: 'Transaction not found' }
      if (existing.status === 'confirmed') {
        return { success: false, message: 'Transaction is already confirmed' }
      }
      if (existing.status === 'failed') {
        return { success: false, message: 'Transaction was rejected; cannot confirm' }
      }

      const result = await withTransaction(async ({ db: txDb }) => {
        // Finalize on every confirm — finalize functions are idempotent (they
        // skip when a non-reversed JE already exists for the entity). This
        // protects against stale-build situations where a held entity was
        // inserted with legacy 'posted'/'pending' status instead of
        // 'pending_approval'; without finalize the drain JE below would credit
        // 1030 with no offsetting debit and strand the books.
        if (existing.sourceType === 'sale' && existing.saleId) {
          const sale = await txDb.query.sales.findFirst({
            where: eq(sales.id, existing.saleId),
          })
          if (sale) {
            await finalizeHeldSale(txDb, sale, existing, session.userId)
          }
        }

        if (existing.sourceType === 'payable_payment' && existing.sourceId) {
          const payment = await txDb.query.payablePayments.findFirst({
            where: eq(payablePayments.id, existing.sourceId),
          })
          if (payment) {
            await finalizeHeldPayablePayment(txDb, payment, session.userId)
          }
        }

        if (existing.sourceType === 'receivable_payment' && existing.sourceId) {
          const payment = await txDb.query.receivablePayments.findFirst({
            where: eq(receivablePayments.id, existing.sourceId),
          })
          if (payment) {
            await finalizeHeldReceivablePayment(txDb, payment, session.userId)
          }
        }

        const lines =
          existing.direction === 'outflow'
            ? [
                {
                  accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                  debitAmount: existing.amount,
                  creditAmount: 0,
                  description: `Drain clearing for confirmed ${existing.paymentChannel} #${id}`,
                },
                {
                  accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                  debitAmount: 0,
                  creditAmount: existing.amount,
                  description: `Bank outflow confirmed: ${existing.invoiceNumber || `tx#${id}`}`,
                },
              ]
            : [
                {
                  accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                  debitAmount: existing.amount,
                  creditAmount: 0,
                  description: `Bank inflow confirmed: ${existing.invoiceNumber || `tx#${id}`}`,
                },
                {
                  accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                  debitAmount: 0,
                  creditAmount: existing.amount,
                  description: `Drain clearing for confirmed ${existing.paymentChannel} #${id}`,
                },
              ]

        const journalEntryId = await createJournalEntry({
          description: `Confirm online tx #${id} (${existing.paymentChannel}, ${existing.direction})`,
          referenceType: 'online_transaction_confirm',
          referenceId: id,
          branchId: existing.branchId,
          userId: session.userId,
          lines,
        })

        const now = new Date().toISOString()
        const [updated] = await txDb
          .update(onlineTransactions)
          .set({
            status: 'confirmed',
            confirmedBy: session.userId,
            confirmedAt: now,
            updatedAt: now,
          })
          .where(eq(onlineTransactions.id, id))
          .returning()

        return { updated, journalEntryId }
      })

      await createAuditLog({
        userId: session.userId,
        branchId: existing.branchId,
        action: 'update',
        entityType: 'online_transaction',
        entityId: id,
        oldValues: { status: existing.status },
        newValues: { status: 'confirmed', journalEntryId: result.journalEntryId },
        description: `Confirmed online transaction #${id} (JE ${result.journalEntryId})`,
      })

      return { success: true, data: result.updated }
    } catch (error) {
      console.error('Confirm online transaction error:', error)
      return { success: false, message: (error as Error).message || 'Failed to confirm transaction' }
    }
  })

  // ── Bulk confirm ──
  // Re-runs the single-confirm path for each id so each transaction gets
  // its own balanced JE. Returns per-id success/failure.
  ipcMain.handle('online-transactions:bulk-confirm', async (_, ids: number[]) => {
    const session = getCurrentSession()
    if (!session) return { success: false, message: 'Unauthorized' }
    if (!APPROVER_ROLES.has(session.role)) {
      return { success: false, message: 'Only admin or manager can approve online transactions' }
    }

    const results: Array<{ id: number; ok: boolean; message?: string }> = []
    for (const id of ids) {
      try {
        // Reuse the single-confirm IPC by directly invoking the same logic
        // would require refactor; for now, replicate concisely.
        const existing = await db.query.onlineTransactions.findFirst({
          where: eq(onlineTransactions.id, id),
        })
        if (!existing || existing.status !== 'pending') {
          results.push({ id, ok: false, message: 'Not pending' })
          continue
        }
        await withTransaction(async ({ db: txDb }) => {
          // Finalize on every confirm — see single-confirm handler. Functions
          // are idempotent and self-skip when books already posted.
          if (existing.sourceType === 'sale' && existing.saleId) {
            const sale = await txDb.query.sales.findFirst({
              where: eq(sales.id, existing.saleId),
            })
            if (sale) {
              await finalizeHeldSale(txDb, sale, existing, session.userId)
            }
          }
          if (existing.sourceType === 'payable_payment' && existing.sourceId) {
            const payment = await txDb.query.payablePayments.findFirst({
              where: eq(payablePayments.id, existing.sourceId),
            })
            if (payment) {
              await finalizeHeldPayablePayment(txDb, payment, session.userId)
            }
          }
          if (existing.sourceType === 'receivable_payment' && existing.sourceId) {
            const payment = await txDb.query.receivablePayments.findFirst({
              where: eq(receivablePayments.id, existing.sourceId),
            })
            if (payment) {
              await finalizeHeldReceivablePayment(txDb, payment, session.userId)
            }
          }

          const lines =
            existing.direction === 'outflow'
              ? [
                  {
                    accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                    debitAmount: existing.amount,
                    creditAmount: 0,
                  },
                  {
                    accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                    debitAmount: 0,
                    creditAmount: existing.amount,
                  },
                ]
              : [
                  {
                    accountCode: ACCOUNT_CODES.CASH_IN_BANK,
                    debitAmount: existing.amount,
                    creditAmount: 0,
                  },
                  {
                    accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                    debitAmount: 0,
                    creditAmount: existing.amount,
                  },
                ]
          await createJournalEntry({
            description: `Bulk confirm online tx #${id}`,
            referenceType: 'online_transaction_confirm',
            referenceId: id,
            branchId: existing.branchId,
            userId: session.userId,
            lines,
          })
          const now = new Date().toISOString()
          await txDb
            .update(onlineTransactions)
            .set({
              status: 'confirmed',
              confirmedBy: session.userId,
              confirmedAt: now,
              updatedAt: now,
            })
            .where(eq(onlineTransactions.id, id))
        })
        results.push({ id, ok: true })
      } catch (e) {
        results.push({ id, ok: false, message: (e as Error).message })
      }
    }

    const okCount = results.filter((r) => r.ok).length
    return {
      success: okCount > 0,
      message: `${okCount}/${ids.length} confirmed`,
      data: results,
    }
  })

  // ── Reject (mark as failed) ──
  // Reverses the clearing posting and restores the source record so the
  // operator can retry payment via a different channel.
  // V1: full support for AP payments; AR/sale paths flagged as TODO.
  ipcMain.handle('online-transactions:mark-failed', async (_, id: number, reason?: string) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }
      if (!APPROVER_ROLES.has(session.role)) {
        return { success: false, message: 'Only admin or manager can reject online transactions' }
      }

      const existing = await db.query.onlineTransactions.findFirst({
        where: eq(onlineTransactions.id, id),
      })
      if (!existing) return { success: false, message: 'Transaction not found' }
      if (existing.status === 'failed') {
        return { success: false, message: 'Transaction is already rejected' }
      }
      if (existing.status === 'confirmed') {
        return {
          success: false,
          message:
            'Transaction was already confirmed. Use a refund / void flow instead of rejecting.',
        }
      }

      const result = await withTransaction(async ({ db: txDb }) => {
        const now = new Date().toISOString()

        // Reverse the clearing posting per source type. Each branch returns
        // the JE id of the reversal entry so we can stamp the original.
        let reversalJournalEntryId: number | null = null
        let sourceRestored: Record<string, unknown> = {}

        if (existing.sourceType === 'payable_payment') {
          const payment = await txDb.query.payablePayments.findFirst({
            where: eq(payablePayments.id, existing.sourceId!),
          })
          if (!payment) throw new Error(`payable_payment #${existing.sourceId} not found`)
          const payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.id, payment.payableId),
          })
          if (!payable) throw new Error(`account_payable #${payment.payableId} not found`)

          if (payment.status === 'pending_approval') {
            // Held: nothing was posted. Mark payment cancelled, no AP touch.
            await txDb
              .update(payablePayments)
              .set({ status: 'cancelled' })
              .where(eq(payablePayments.id, payment.id))

            sourceRestored = {
              payableId: payable.id,
              invoiceNumber: payable.invoiceNumber,
              held: true,
              paymentRowCancelled: payment.id,
              note: 'Held payment cancelled — AP balance and GL untouched.',
            }
          } else {
            // Legacy posted path: reverse the GL and restore AP fields.
            reversalJournalEntryId = await createJournalEntry({
              description: `Reject AP payment ${payable.invoiceNumber} (online tx #${id})`,
              referenceType: 'payable_payment_reversal',
              referenceId: payment.id,
              branchId: existing.branchId,
              userId: session.userId,
              lines: [
                {
                  accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                  debitAmount: existing.amount,
                  creditAmount: 0,
                  description: `Drain clearing for rejected payment of ${payable.invoiceNumber}`,
                },
                {
                  accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE,
                  debitAmount: 0,
                  creditAmount: existing.amount,
                  description: `Restore AP for rejected payment of ${payable.invoiceNumber}`,
                },
              ],
            })

            const originalJE = await txDb.query.journalEntries.findFirst({
              where: and(
                eq(journalEntries.referenceType, 'payable_payment'),
                eq(journalEntries.referenceId, payment.id),
                eq(journalEntries.status, 'posted')
              ),
            })
            if (originalJE) {
              await txDb
                .update(journalEntries)
                .set({
                  status: 'reversed',
                  reversedBy: session.userId,
                  reversedAt: now,
                  reversalEntryId: reversalJournalEntryId,
                  updatedAt: now,
                })
                .where(eq(journalEntries.id, originalJE.id))
            }

            const restoredPaid = Math.max(0, payable.paidAmount - payment.amount)
            const restoredRemaining = payable.totalAmount - restoredPaid
            const newStatus: 'paid' | 'partial' | 'pending' =
              restoredPaid <= 0 ? 'pending' : restoredRemaining <= 0 ? 'paid' : 'partial'
            await txDb
              .update(accountPayables)
              .set({
                paidAmount: restoredPaid,
                remainingAmount: restoredRemaining,
                status: newStatus,
                updatedAt: now,
              })
              .where(eq(accountPayables.id, payable.id))

            await txDb.delete(payablePayments).where(eq(payablePayments.id, payment.id))

            sourceRestored = {
              payableId: payable.id,
              invoiceNumber: payable.invoiceNumber,
              paidAmount: restoredPaid,
              remainingAmount: restoredRemaining,
              status: newStatus,
              paymentRowDeleted: payment.id,
              legacy: true,
            }
          }
        } else if (existing.sourceType === 'sale') {
          const sale = await txDb.query.sales.findFirst({
            where: eq(sales.id, existing.sourceId!),
          })
          if (!sale) throw new Error(`sale #${existing.sourceId} not found`)

          if (sale.paymentStatus === 'pending_approval') {
            // Held sale: no GL was posted, no inventory was deducted, no AR
            // was opened. Cancellation is a pure status flip — books are
            // untouched.
            await txDb
              .update(sales)
              .set({
                paymentStatus: 'cancelled',
                isVoided: true,
                voidReason: reason || `Online tx #${id} rejected`,
                updatedAt: now,
              })
              .where(eq(sales.id, sale.id))

            sourceRestored = {
              saleId: sale.id,
              invoiceNumber: sale.invoiceNumber,
              held: true,
              voided: true,
              note: 'Held sale cancelled — no books impact (nothing was posted at create-time).',
            }
          } else {
            // Legacy non-held sale path: customer kept the goods; convert
            // the rejected portion to AR. Kept for rows created before the
            // held-sale gate landed.
            reversalJournalEntryId = await createJournalEntry({
              description: `Reject ${existing.paymentChannel} for sale ${sale.invoiceNumber} (online tx #${id})`,
              referenceType: 'online_transaction_reject',
              referenceId: id,
              branchId: existing.branchId,
              userId: session.userId,
              lines: [
                {
                  accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
                  debitAmount: existing.amount,
                  creditAmount: 0,
                  description: `Receivable opened due to rejected ${existing.paymentChannel} for ${sale.invoiceNumber}`,
                },
                {
                  accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                  debitAmount: 0,
                  creditAmount: existing.amount,
                  description: `Drain clearing for rejected ${existing.paymentChannel} on ${sale.invoiceNumber}`,
                },
              ],
            })

            const originalJE = await txDb.query.journalEntries.findFirst({
              where: and(
                eq(journalEntries.referenceType, 'sale'),
                eq(journalEntries.referenceId, sale.id),
                eq(journalEntries.status, 'posted')
              ),
            })
            if (originalJE) {
              await txDb
                .update(journalEntries)
                .set({
                  status: 'reversed',
                  reversedBy: session.userId,
                  reversedAt: now,
                  reversalEntryId: reversalJournalEntryId,
                  updatedAt: now,
                })
                .where(eq(journalEntries.id, originalJE.id))
            }

            const newAmountPaid = Math.max(0, sale.amountPaid - existing.amount)
            const newPaymentStatus: 'paid' | 'partial' | 'pending' =
              newAmountPaid <= 0 ? 'pending' : newAmountPaid >= sale.totalAmount ? 'paid' : 'partial'
            await txDb
              .update(sales)
              .set({
                amountPaid: newAmountPaid,
                paymentStatus: newPaymentStatus,
                updatedAt: now,
              })
              .where(eq(sales.id, sale.id))

            const customerId = existing.customerId ?? sale.customerId ?? null
            let arOpened: number | null = null
            if (customerId) {
              await txDb.insert(accountReceivables).values({
                customerId,
                saleId: sale.id,
                branchId: existing.branchId,
                invoiceNumber: sale.invoiceNumber,
                totalAmount: existing.amount,
                paidAmount: 0,
                remainingAmount: existing.amount,
                status: 'pending',
                notes: `Auto-created from rejected online tx #${id} (${existing.paymentChannel})${reason ? ` — ${reason}` : ''}`,
                createdBy: session.userId,
              })
              arOpened = existing.amount
            }

            sourceRestored = {
              saleId: sale.id,
              invoiceNumber: sale.invoiceNumber,
              saleAmountPaid: newAmountPaid,
              salePaymentStatus: newPaymentStatus,
              arOpened,
              customerId,
              walkIn: !customerId,
              legacy: true,
            }
          }
        } else if (existing.sourceType === 'receivable_payment') {
          const payment = await txDb.query.receivablePayments.findFirst({
            where: eq(receivablePayments.id, existing.sourceId!),
          })
          if (!payment) throw new Error(`receivable_payment #${existing.sourceId} not found`)
          const receivable = await txDb.query.accountReceivables.findFirst({
            where: eq(accountReceivables.id, payment.receivableId),
          })
          if (!receivable) throw new Error(`account_receivable #${payment.receivableId} not found`)

          if (payment.status === 'pending_approval') {
            // Held: nothing posted. Cancel payment row, leave AR untouched.
            await txDb
              .update(receivablePayments)
              .set({ status: 'cancelled' })
              .where(eq(receivablePayments.id, payment.id))

            sourceRestored = {
              receivableId: receivable.id,
              invoiceNumber: receivable.invoiceNumber,
              held: true,
              paymentRowCancelled: payment.id,
              note: 'Held collection cancelled — AR balance and GL untouched.',
            }
          } else {
            // Legacy posted path: reverse GL and restore AR.
            reversalJournalEntryId = await createJournalEntry({
              description: `Reject AR collection ${receivable.invoiceNumber} (online tx #${id})`,
              referenceType: 'receivable_payment_reversal',
              referenceId: payment.id,
              branchId: existing.branchId,
              userId: session.userId,
              lines: [
                {
                  accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
                  debitAmount: existing.amount,
                  creditAmount: 0,
                  description: `Restore AR for rejected payment of ${receivable.invoiceNumber}`,
                },
                {
                  accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                  debitAmount: 0,
                  creditAmount: existing.amount,
                  description: `Drain clearing for rejected payment of ${receivable.invoiceNumber}`,
                },
              ],
            })

            const originalJE = await txDb.query.journalEntries.findFirst({
              where: and(
                eq(journalEntries.referenceType, 'receivable_payment'),
                eq(journalEntries.referenceId, payment.id),
                eq(journalEntries.status, 'posted')
              ),
            })
            if (originalJE) {
              await txDb
                .update(journalEntries)
                .set({
                  status: 'reversed',
                  reversedBy: session.userId,
                  reversedAt: now,
                  reversalEntryId: reversalJournalEntryId,
                  updatedAt: now,
                })
                .where(eq(journalEntries.id, originalJE.id))
            }

            const restoredPaid = Math.max(0, receivable.paidAmount - payment.amount)
            const restoredRemaining = receivable.totalAmount - restoredPaid
            const newStatus: 'paid' | 'partial' | 'pending' =
              restoredPaid <= 0 ? 'pending' : restoredRemaining <= 0 ? 'paid' : 'partial'
            await txDb
              .update(accountReceivables)
              .set({
                paidAmount: restoredPaid,
                remainingAmount: restoredRemaining,
                status: newStatus,
                updatedAt: now,
              })
              .where(eq(accountReceivables.id, receivable.id))

            await txDb.delete(receivablePayments).where(eq(receivablePayments.id, payment.id))

            sourceRestored = {
              receivableId: receivable.id,
              invoiceNumber: receivable.invoiceNumber,
              paidAmount: restoredPaid,
              remainingAmount: restoredRemaining,
              status: newStatus,
              paymentRowDeleted: payment.id,
              legacy: true,
            }
          }
        } else if (existing.sourceType === 'return_refund') {
          // Refund channel attempt failed. The customer is still owed the money;
          // we just couldn't push it through this channel. Drain clearing into
          // Accounts Payable as a generic refund obligation — operator settles
          // it later by paying through any channel and posting DR AP / CR Cash
          // (or via a fresh refund flow).
          reversalJournalEntryId = await createJournalEntry({
            description: `Reject ${existing.paymentChannel} refund for ${existing.invoiceNumber || `return#${existing.sourceId}`} (online tx #${id})`,
            referenceType: 'return_refund_reversal',
            referenceId: existing.sourceId ?? id,
            branchId: existing.branchId,
            userId: session.userId,
            lines: [
              {
                accountCode: ACCOUNT_CODES.PENDING_ONLINE_PAYMENTS,
                debitAmount: existing.amount,
                creditAmount: 0,
                description: `Drain clearing for rejected refund of ${existing.invoiceNumber || `return#${existing.sourceId}`}`,
              },
              {
                accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE,
                debitAmount: 0,
                creditAmount: existing.amount,
                description: `Refund obligation moved to AP — manual settlement required`,
              },
            ],
          })

          sourceRestored = {
            returnId: existing.sourceId,
            obligationMovedTo: 'accounts_payable',
            note: 'Settle by paying customer and posting DR AP / CR Cash, or issue a new refund.',
          }
        } else {
          // Manual / unknown — no source record to restore. Simply allow rejection
          // with a balanced reversal that touches only the clearing if a posting
          // exists. For manual entries with no GL impact we just flip the status.
        }

        // Mark the online_transactions row failed and append a reason
        const noteSuffix = reason ? `Rejected: ${reason}` : 'Rejected'
        const [updated] = await txDb
          .update(onlineTransactions)
          .set({
            status: 'failed',
            notes: existing.notes ? `${existing.notes} | ${noteSuffix}` : noteSuffix,
            updatedAt: now,
          })
          .where(eq(onlineTransactions.id, id))
          .returning()

        return { updated, reversalJournalEntryId, sourceRestored }
      })

      await createAuditLog({
        userId: session.userId,
        branchId: existing.branchId,
        action: 'update',
        entityType: 'online_transaction',
        entityId: id,
        oldValues: { status: existing.status },
        newValues: {
          status: 'failed',
          reversalJournalEntryId: result.reversalJournalEntryId,
          sourceRestored: result.sourceRestored,
        },
        description: `Rejected online transaction #${id}${reason ? ` — ${reason}` : ''}`,
      })

      return {
        success: true,
        data: {
          ...result.updated,
          reversalJournalEntryId: result.reversalJournalEntryId,
          sourceRestored: result.sourceRestored,
        },
      }
    } catch (error) {
      console.error('Mark failed error:', error)
      return { success: false, message: (error as Error).message || 'Failed to reject transaction' }
    }
  })

  // ── Dashboard stats ──
  ipcMain.handle(
    'online-transactions:dashboard',
    async (_, params: OnlineTransactionDashboardParams) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Unauthorized' }

        const today = new Date().toISOString().split('T')[0]

        // Get date range based on period
        let startDate = today
        let endDate = today
        if (params.timePeriod === 'custom' && params.customStart && params.customEnd) {
          startDate = params.customStart
          endDate = params.customEnd
        } else if (params.timePeriod === 'week') {
          const d = new Date()
          d.setDate(d.getDate() - 7)
          startDate = d.toISOString().split('T')[0]
        } else if (params.timePeriod === 'month') {
          const d = new Date()
          d.setDate(1)
          startDate = d.toISOString().split('T')[0]
        } else if (params.timePeriod === 'year') {
          startDate = `${new Date().getFullYear()}-01-01`
        }

        const branchCondition = eq(onlineTransactions.branchId, params.branchId)
        const dateRange = and(
          gte(onlineTransactions.transactionDate, startDate),
          lte(onlineTransactions.transactionDate, endDate)
        )

        // Today's totals per channel
        const todayCondition = and(
          branchCondition,
          eq(onlineTransactions.transactionDate, today)
        )

        // Period totals per channel
        const periodCondition = and(branchCondition, dateRange)

        const [todayByChannel, periodByChannel, statusSummary, recentPending] =
          await Promise.all([
            // Today's totals per channel
            db
              .select({
                paymentChannel: onlineTransactions.paymentChannel,
                direction: onlineTransactions.direction,
                total: sql<number>`COALESCE(SUM(${onlineTransactions.amount}), 0)`,
                count: sql<number>`count(*)`,
                confirmed: sql<number>`SUM(CASE WHEN ${onlineTransactions.status} = 'confirmed' THEN ${onlineTransactions.amount} ELSE 0 END)`,
                pending: sql<number>`SUM(CASE WHEN ${onlineTransactions.status} = 'pending' THEN ${onlineTransactions.amount} ELSE 0 END)`,
              })
              .from(onlineTransactions)
              .where(todayCondition)
              .groupBy(onlineTransactions.paymentChannel, onlineTransactions.direction),

            // Period totals per channel
            db
              .select({
                paymentChannel: onlineTransactions.paymentChannel,
                direction: onlineTransactions.direction,
                total: sql<number>`COALESCE(SUM(${onlineTransactions.amount}), 0)`,
                count: sql<number>`count(*)`,
                confirmed: sql<number>`SUM(CASE WHEN ${onlineTransactions.status} = 'confirmed' THEN ${onlineTransactions.amount} ELSE 0 END)`,
                pending: sql<number>`SUM(CASE WHEN ${onlineTransactions.status} = 'pending' THEN ${onlineTransactions.amount} ELSE 0 END)`,
              })
              .from(onlineTransactions)
              .where(periodCondition)
              .groupBy(onlineTransactions.paymentChannel, onlineTransactions.direction),

            // Overall status summary for the period
            db
              .select({
                status: onlineTransactions.status,
                total: sql<number>`COALESCE(SUM(${onlineTransactions.amount}), 0)`,
                count: sql<number>`count(*)`,
              })
              .from(onlineTransactions)
              .where(periodCondition)
              .groupBy(onlineTransactions.status),

            // Recent pending transactions
            db
              .select({
                id: onlineTransactions.id,
                transactionDate: onlineTransactions.transactionDate,
                amount: onlineTransactions.amount,
                paymentChannel: onlineTransactions.paymentChannel,
                customerName: onlineTransactions.customerName,
                invoiceNumber: onlineTransactions.invoiceNumber,
                referenceNumber: onlineTransactions.referenceNumber,
                direction: onlineTransactions.direction,
              })
              .from(onlineTransactions)
              .where(
                and(
                  branchCondition,
                  eq(onlineTransactions.status, 'pending')
                )
              )
              .orderBy(desc(onlineTransactions.transactionDate))
              .limit(10),
          ])

        return {
          success: true,
          data: {
            todayByChannel,
            periodByChannel,
            statusSummary,
            recentPending,
            dateRange: { startDate, endDate },
          },
        }
      } catch (error) {
        console.error('Online transactions dashboard error:', error)
        return { success: false, message: 'Failed to fetch dashboard data' }
      }
    }
  )
}
