import { ipcMain } from 'electron'
import { eq, and, desc, sql, gte, lte, or } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  accountPayables,
  payablePayments,
  suppliers,
  purchases,
  branches,
  expenses,
  cashRegisterSessions,
  cashTransactions,
  onlineTransactions,
  type NewAccountPayable,
  type NewPayablePayment,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { withTransaction } from '../utils/db-transaction'
import { postAPPaymentToGL } from '../utils/gl-posting'
import { mapPaymentMethodToChannel } from './online-transactions-ipc'

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PayableFilters extends PaginationParams {
  supplierId?: number
  branchId?: number
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  search?: string
  startDate?: string
  endDate?: string
}

interface CreatePayableData {
  supplierId: number
  purchaseId?: number
  branchId: number
  invoiceNumber: string
  totalAmount: number
  dueDate?: string
  paymentTerms?: string
  notes?: string
}

interface RecordPaymentData {
  payableId: number
  amount: number
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mobile'
  referenceNumber?: string
  notes?: string
}

export function registerAccountPayablesHandlers(): void {
  const db = getDatabase()

  // Get all payables with pagination and filters
  ipcMain.handle('payables:get-all', async (_, params: PayableFilters = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortOrder = 'desc',
        supplierId,
        branchId,
        status,
        startDate,
        endDate,
      } = params

      const conditions = []

      if (supplierId) conditions.push(eq(accountPayables.supplierId, supplierId))
      if (branchId) conditions.push(eq(accountPayables.branchId, branchId))
      if (status) conditions.push(eq(accountPayables.status, status))
      if (startDate) conditions.push(gte(accountPayables.createdAt, startDate))
      if (endDate) conditions.push(lte(accountPayables.createdAt, endDate))

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(accountPayables)
        .where(whereClause)

      const total = countResult[0]?.count ?? 0

      // Get data with relations
      const data = await db.query.accountPayables.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: sortOrder === 'desc' ? desc(accountPayables.createdAt) : accountPayables.createdAt,
        with: {
          supplier: true,
          purchase: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          payments: {
            orderBy: desc(payablePayments.paymentDate),
          },
        },
      })

      return {
        success: true,
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error('Get payables error:', error)
      return { success: false, message: 'Failed to fetch payables' }
    }
  })

  // Get payable by ID
  ipcMain.handle('payables:get-by-id', async (_, id: number) => {
    try {
      const payable = await db.query.accountPayables.findFirst({
        where: eq(accountPayables.id, id),
        with: {
          supplier: true,
          purchase: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          payments: {
            orderBy: desc(payablePayments.paymentDate),
            with: {
              paidByUser: {
                columns: {
                  id: true,
                  username: true,
                  fullName: true,
                },
              },
            },
          },
        },
      })

      if (!payable) {
        return { success: false, message: 'Payable not found' }
      }

      return { success: true, data: payable }
    } catch (error) {
      console.error('Get payable error:', error)
      return { success: false, message: 'Failed to fetch payable' }
    }
  })

  // Get payables by supplier
  ipcMain.handle('payables:get-by-supplier', async (_, supplierId: number) => {
    try {
      const data = await db.query.accountPayables.findMany({
        where: and(
          eq(accountPayables.supplierId, supplierId),
          or(
            eq(accountPayables.status, 'pending'),
            eq(accountPayables.status, 'partial'),
            eq(accountPayables.status, 'overdue')
          )
        ),
        orderBy: desc(accountPayables.createdAt),
        with: {
          branch: true,
          payments: true,
        },
      })

      // Calculate totals
      const totalOwed = data.reduce((sum, p) => sum + p.remainingAmount, 0)
      const totalPaid = data.reduce((sum, p) => sum + p.paidAmount, 0)

      return {
        success: true,
        data,
        summary: {
          totalPayables: data.length,
          totalOwed,
          totalPaid,
        },
      }
    } catch (error) {
      console.error('Get supplier payables error:', error)
      return { success: false, message: 'Failed to fetch supplier payables' }
    }
  })

  // Create new payable
  ipcMain.handle('payables:create', async (_, data: CreatePayableData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Verify supplier exists
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, data.supplierId),
      })

      if (!supplier) {
        return { success: false, message: 'Supplier not found' }
      }

      // Verify branch exists
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, data.branchId),
      })

      if (!branch) {
        return { success: false, message: 'Branch not found' }
      }

      const [newPayable] = await db
        .insert(accountPayables)
        .values({
          supplierId: data.supplierId,
          purchaseId: data.purchaseId,
          branchId: data.branchId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount,
          paidAmount: 0,
          remainingAmount: data.totalAmount,
          status: 'pending',
          dueDate: data.dueDate,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          createdBy: session.userId,
        })
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'account_payable',
        entityId: newPayable.id,
        newValues: {
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount,
        },
        description: `Created payable ${data.invoiceNumber} for ${supplier.name}`,
      })

      return { success: true, data: newPayable }
    } catch (error) {
      console.error('Create payable error:', error)
      return { success: false, message: 'Failed to create payable' }
    }
  })

  // Record payment against payable
  ipcMain.handle('payables:record-payment', async (_, data: RecordPaymentData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      if (data.amount <= 0) {
        return { success: false, message: 'Payment amount must be greater than 0' }
      }

      // Pre-flight read for branch lookup + cash-session enforcement.
      // The authoritative read happens again inside the tx below to avoid
      // double-payment races between concurrent calls.
      const preflightPayable = await db.query.accountPayables.findFirst({
        where: eq(accountPayables.id, data.payableId),
      })

      if (!preflightPayable) {
        return { success: false, message: 'Payable not found' }
      }

      // Cash AP payments must hit the physical drawer. Reject up front if no
      // session is open, matching purchases:pay-off behaviour. Without this
      // guard the GL Cash account would credit while the register stays
      // untouched, breaking GL ↔ register reconciliation.
      let openCashSessionId: number | null = null
      if (data.paymentMethod === 'cash') {
        const today = new Date().toISOString().split('T')[0]
        const openSession = await db.query.cashRegisterSessions.findFirst({
          where: and(
            eq(cashRegisterSessions.branchId, preflightPayable.branchId),
            eq(cashRegisterSessions.sessionDate, today),
            eq(cashRegisterSessions.status, 'open')
          ),
        })
        if (!openSession) {
          return {
            success: false,
            message:
              'No open cash register session for this branch. Open a session before paying in cash.',
          }
        }
        openCashSessionId = openSession.id
      }

      // Execute all operations in a single transaction. The payable is
      // re-read inside the tx so two concurrent partial payments serialize
      // on BEGIN IMMEDIATE rather than racing on a stale paidAmount.
      const txResult = await withTransaction(async ({ db: txDb }) => {
        const payable = await txDb.query.accountPayables.findFirst({
          where: eq(accountPayables.id, data.payableId),
          with: { supplier: true },
        })

        if (!payable) {
          throw new Error('Payable not found')
        }
        if (payable.status === 'paid') {
          throw new Error('This payable is already fully paid')
        }
        if (payable.status === 'cancelled') {
          throw new Error('Cannot record payment for cancelled payable')
        }
        if (payable.status === 'reversed') {
          throw new Error('Cannot record payment for reversed payable')
        }
        if (data.amount > payable.remainingAmount) {
          throw new Error(
            `Payment amount cannot exceed remaining balance of ${payable.remainingAmount}`
          )
        }

        const newPaidAmount = payable.paidAmount + data.amount
        const newRemainingAmount = payable.totalAmount - newPaidAmount
        const newStatus: 'paid' | 'partial' = newRemainingAmount <= 0 ? 'paid' : 'partial'
        const now = new Date().toISOString()

        // Record the payment
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

        // Update payable aggregates
        await txDb
          .update(accountPayables)
          .set({
            paidAmount: newPaidAmount,
            remainingAmount: Math.max(0, newRemainingAmount),
            status: newStatus,
            updatedAt: now,
          })
          .where(eq(accountPayables.id, data.payableId))

        // Sync source purchase document so the Purchases tab reflects the
        // sub-ledger state. Without this, purchases.paymentStatus stays
        // 'pending' forever and the Purchases register diverges from AP.
        let purchaseSync: {
          purchaseId: number
          purchaseOrderNumber: string
          oldStatus: string
          newStatus: 'paid' | 'partial'
        } | null = null
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

        // Sync linked expense. Schema only supports 'paid' | 'unpaid', so
        // partial AP payments cannot be reflected on the expense — they
        // remain 'unpaid' until full settlement. Fix tracked separately.
        let expenseSync: { expenseId: number; oldStatus: string } | null = null
        if (newStatus === 'paid') {
          const linkedExpense = await txDb.query.expenses.findFirst({
            where: eq(expenses.payableId, payable.id),
          })
          if (linkedExpense && linkedExpense.paymentStatus === 'unpaid') {
            await txDb
              .update(expenses)
              .set({ paymentStatus: 'paid', updatedAt: now })
              .where(eq(expenses.id, linkedExpense.id))
            expenseSync = {
              expenseId: linkedExpense.id,
              oldStatus: linkedExpense.paymentStatus,
            }
          }
        }

        // GL: DR Accounts Payable, CR Cash. Same connection as the tx
        // (createJournalEntry uses the singleton db) so this is atomic.
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

        // Non-cash payments mirror to online_transactions for reconciliation
        if (data.paymentMethod !== 'cash') {
          await txDb.insert(onlineTransactions).values({
            branchId: payable.branchId,
            transactionDate: new Date().toISOString().split('T')[0],
            amount: data.amount,
            paymentChannel: mapPaymentMethodToChannel(data.paymentMethod),
            direction: 'outflow',
            referenceNumber: data.referenceNumber,
            customerName: payable.supplier?.name,
            invoiceNumber: payable.invoiceNumber,
            status: 'pending',
            sourceType: 'payable_payment',
            sourceId: payment.id,
            payableId: data.payableId,
            createdBy: session.userId,
          })
        }

        // Cash drawer outflow. Pre-flight already proved a session exists.
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
          payment,
          payable,
          newPaidAmount,
          newRemainingAmount,
          newStatus,
          purchaseSync,
          expenseSync,
        }
      })

      const { payment, payable, newPaidAmount, newRemainingAmount, newStatus, purchaseSync, expenseSync } =
        txResult

      // Audit: payable payment
      await createAuditLog({
        userId: session.userId,
        branchId: payable.branchId,
        action: 'payment',
        entityType: 'account_payable',
        entityId: data.payableId,
        oldValues: {
          paidAmount: payable.paidAmount,
          remainingAmount: payable.remainingAmount,
          status: payable.status,
        },
        newValues: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paymentAmount: data.amount,
          paymentMethod: data.paymentMethod,
        },
        description: `Recorded payment of ${data.amount} for payable ${payable.invoiceNumber}`,
      })

      // Audit: synced purchase status (if applicable)
      if (purchaseSync) {
        await createAuditLog({
          userId: session.userId,
          branchId: payable.branchId,
          action: 'update',
          entityType: 'purchase',
          entityId: purchaseSync.purchaseId,
          oldValues: { paymentStatus: purchaseSync.oldStatus },
          newValues: { paymentStatus: purchaseSync.newStatus },
          description: `Auto-synced purchase ${purchaseSync.purchaseOrderNumber} payment status to ${purchaseSync.newStatus} (payable #${payable.id} payment of ${data.amount})`,
        })
      }

      // Audit: synced expense status (full settlement only — schema limitation)
      if (expenseSync) {
        await createAuditLog({
          userId: session.userId,
          branchId: payable.branchId,
          action: 'update',
          entityType: 'expense',
          entityId: expenseSync.expenseId,
          oldValues: { paymentStatus: expenseSync.oldStatus },
          newValues: { paymentStatus: 'paid' },
          description: `Auto-updated expense status to paid (payable #${payable.id} fully paid)`,
        })
      }

      return {
        success: true,
        data: payment,
        payable: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
        },
      }
    } catch (error) {
      console.error('Record payment error:', error)
      const message = error instanceof Error ? error.message : 'Failed to record payment'
      return { success: false, message }
    }
  })

  // Cancel payable. If the payable was auto-generated from a pay-later
  // purchase, the purchase is cancelled in the same transaction so the
  // Purchases tab does not retain a dangling pay-later liability with no
  // corresponding live payable. Cancellation is blocked when goods have
  // already been received against the purchase (an inventory-impacting
  // cancellation requires the reversal flow, not a soft cancel).
  ipcMain.handle('payables:cancel', async (_, id: number, reason?: string) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const payable = await db.query.accountPayables.findFirst({
        where: eq(accountPayables.id, id),
      })

      if (!payable) {
        return { success: false, message: 'Payable not found' }
      }

      if (payable.status === 'paid') {
        return { success: false, message: 'Cannot cancel a fully paid payable' }
      }

      if (payable.status === 'cancelled' || payable.status === 'reversed') {
        return { success: false, message: `Payable is already ${payable.status}` }
      }

      if (payable.paidAmount > 0) {
        return { success: false, message: 'Cannot cancel payable with existing payments' }
      }

      // Pre-flight: if linked purchase has received any goods, block the
      // soft cancel and direct the user to the reversal flow which also
      // rolls inventory back.
      let linkedPurchase: typeof purchases.$inferSelect | null = null
      if (payable.purchaseId) {
        linkedPurchase =
          (await db.query.purchases.findFirst({
            where: eq(purchases.id, payable.purchaseId),
          })) ?? null
        if (
          linkedPurchase &&
          (linkedPurchase.status === 'partial' || linkedPurchase.status === 'received')
        ) {
          return {
            success: false,
            message:
              'Cannot cancel payable: goods have been received against the linked purchase. Use the purchase reversal flow instead.',
          }
        }
        if (linkedPurchase && linkedPurchase.status === 'reversed') {
          // Purchase already reversed; just mark the payable cancelled (no cascade).
          linkedPurchase = null
        }
      }

      const now = new Date().toISOString()
      const mergedNotes = reason
        ? `${payable.notes || ''}\nCancelled: ${reason}`.trim()
        : payable.notes

      const result = await withTransaction(async ({ db: txDb }) => {
        await txDb
          .update(accountPayables)
          .set({ status: 'cancelled', notes: mergedNotes, updatedAt: now })
          .where(eq(accountPayables.id, id))

        let cascadedPurchase: {
          purchaseId: number
          purchaseOrderNumber: string
          oldStatus: string
        } | null = null
        if (linkedPurchase && linkedPurchase.status !== 'cancelled') {
          await txDb
            .update(purchases)
            .set({ status: 'cancelled', updatedAt: now })
            .where(eq(purchases.id, linkedPurchase.id))
          cascadedPurchase = {
            purchaseId: linkedPurchase.id,
            purchaseOrderNumber: linkedPurchase.purchaseOrderNumber,
            oldStatus: linkedPurchase.status,
          }
        }

        return { cascadedPurchase }
      })

      await createAuditLog({
        userId: session.userId,
        branchId: payable.branchId,
        action: 'cancel',
        entityType: 'account_payable',
        entityId: id,
        oldValues: { status: payable.status },
        newValues: { status: 'cancelled', reason },
        description: `Cancelled payable ${payable.invoiceNumber}`,
      })

      if (result.cascadedPurchase) {
        await createAuditLog({
          userId: session.userId,
          branchId: payable.branchId,
          action: 'cancel',
          entityType: 'purchase',
          entityId: result.cascadedPurchase.purchaseId,
          oldValues: { status: result.cascadedPurchase.oldStatus },
          newValues: { status: 'cancelled', reason: `Cascaded from payable #${id} cancel` },
          description: `Cascaded cancel of purchase ${result.cascadedPurchase.purchaseOrderNumber} (payable #${id} cancelled)`,
        })
      }

      return { success: true, message: 'Payable cancelled successfully' }
    } catch (error) {
      console.error('Cancel payable error:', error)
      return { success: false, message: 'Failed to cancel payable' }
    }
  })

  // Get summary/dashboard stats
  ipcMain.handle('payables:get-summary', async (_, branchId?: number) => {
    try {
      const conditions = []
      if (branchId) conditions.push(eq(accountPayables.branchId, branchId))

      // Get totals by status
      const statusQuery = await db
        .select({
          status: accountPayables.status,
          count: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${accountPayables.totalAmount})`,
          remainingAmount: sql<number>`sum(${accountPayables.remainingAmount})`,
        })
        .from(accountPayables)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(accountPayables.status)

      // Get overall totals
      const totalsQuery = await db
        .select({
          totalPayables: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${accountPayables.totalAmount})`,
          totalPaid: sql<number>`sum(${accountPayables.paidAmount})`,
          totalRemaining: sql<number>`sum(${accountPayables.remainingAmount})`,
        })
        .from(accountPayables)
        .where(
          and(
            ...(conditions.length > 0 ? conditions : []),
            or(
              eq(accountPayables.status, 'pending'),
              eq(accountPayables.status, 'partial'),
              eq(accountPayables.status, 'overdue')
            )
          )
        )

      // Get overdue count (payables past due date)
      const today = new Date().toISOString().split('T')[0]
      const overdueQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(accountPayables)
        .where(
          and(
            ...(conditions.length > 0 ? conditions : []),
            lte(accountPayables.dueDate, today),
            or(eq(accountPayables.status, 'pending'), eq(accountPayables.status, 'partial'))
          )
        )

      // NOTE: Overdue state is derived on read (dueDate < today + status in
      // pending/partial). A read endpoint must not silently mutate rows —
      // that bypasses the audit trail. Use `payables:mark-overdue` to
      // persist the flip explicitly with attribution.

      return {
        success: true,
        data: {
          byStatus: statusQuery,
          totals: totalsQuery[0] ?? {
            totalPayables: 0,
            totalAmount: 0,
            totalPaid: 0,
            totalRemaining: 0,
          },
          overdueCount: overdueQuery[0]?.count ?? 0,
        },
      }
    } catch (error) {
      console.error('Get summary error:', error)
      return { success: false, message: 'Failed to fetch summary' }
    }
  })

  // Explicit, audited overdue reclassification. Flips pending/partial
  // payables whose dueDate has passed to 'overdue'. One audit row per
  // flipped payable so the Activity Log shows who triggered it.
  ipcMain.handle('payables:mark-overdue', async (_, branchId?: number) => {
    try {
      const session = getCurrentSession()
      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const today = new Date().toISOString().split('T')[0]
      const conditions = [
        lte(accountPayables.dueDate, today),
        or(eq(accountPayables.status, 'pending'), eq(accountPayables.status, 'partial')),
      ]
      if (branchId) conditions.push(eq(accountPayables.branchId, branchId))

      const flipped = await withTransaction(async ({ db: txDb }) => {
        const candidates = await txDb.query.accountPayables.findMany({
          where: and(...conditions),
        })

        if (candidates.length === 0) return []

        await txDb
          .update(accountPayables)
          .set({ status: 'overdue', updatedAt: new Date().toISOString() })
          .where(and(...conditions))

        return candidates
      })

      for (const p of flipped) {
        await createAuditLog({
          userId: session.userId,
          branchId: p.branchId,
          action: 'update',
          entityType: 'account_payable',
          entityId: p.id,
          oldValues: { status: p.status },
          newValues: { status: 'overdue', reason: 'dueDate passed' },
          description: `Reclassified payable ${p.invoiceNumber} as overdue (due ${p.dueDate})`,
        })
      }

      return { success: true, data: { flippedCount: flipped.length } }
    } catch (error) {
      console.error('Mark overdue error:', error)
      return { success: false, message: 'Failed to mark payables overdue' }
    }
  })

  // Get aging report for payables
  ipcMain.handle('payables:get-aging-report', async (_, branchId?: number) => {
    try {
      const today = new Date()
      const conditions = [
        or(
          eq(accountPayables.status, 'pending'),
          eq(accountPayables.status, 'partial'),
          eq(accountPayables.status, 'overdue')
        ),
      ]
      if (branchId) conditions.push(eq(accountPayables.branchId, branchId))

      // Get all outstanding payables with supplier info
      const outstandingPayables = await db.query.accountPayables.findMany({
        where: and(...conditions),
        with: {
          supplier: true,
          branch: true,
        },
        orderBy: desc(accountPayables.dueDate),
      })

      // Calculate aging buckets
      const aging = {
        current: { amount: 0, count: 0 },
        days1to30: { amount: 0, count: 0 },
        days31to60: { amount: 0, count: 0 },
        days61to90: { amount: 0, count: 0 },
        days90plus: { amount: 0, count: 0 },
      }

      const upcomingPayments: Array<{
        supplier: string
        amount: number
        dueDate: string
        daysUntilDue: number
      }> = []

      const overdueBySupplier: Map<
        number,
        { supplier: string; amount: number; oldestDueDate: string; daysOverdue: number }
      > = new Map()

      for (const payable of outstandingPayables) {
        const dueDate = payable.dueDate ? new Date(payable.dueDate) : null
        const amount = payable.remainingAmount

        if (!dueDate) {
          // No due date, consider as current
          aging.current.amount += amount
          aging.current.count++
          continue
        }

        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 0) {
          // Not yet due
          aging.current.amount += amount
          aging.current.count++

          // Add to upcoming payments if due within 7 days
          if (daysDiff >= -7) {
            upcomingPayments.push({
              supplier: payable.supplier?.name || 'Unknown',
              amount,
              dueDate: payable.dueDate!,
              daysUntilDue: Math.abs(daysDiff),
            })
          }
        } else if (daysDiff <= 30) {
          aging.days1to30.amount += amount
          aging.days1to30.count++
        } else if (daysDiff <= 60) {
          aging.days31to60.amount += amount
          aging.days31to60.count++
        } else if (daysDiff <= 90) {
          aging.days61to90.amount += amount
          aging.days61to90.count++
        } else {
          aging.days90plus.amount += amount
          aging.days90plus.count++
        }

        // Track overdue by supplier
        if (daysDiff > 0 && payable.supplier) {
          const existing = overdueBySupplier.get(payable.supplier.id)
          if (existing) {
            existing.amount += amount
            if (daysDiff > existing.daysOverdue) {
              existing.daysOverdue = daysDiff
              existing.oldestDueDate = payable.dueDate!
            }
          } else {
            overdueBySupplier.set(payable.supplier.id, {
              supplier: payable.supplier.name,
              amount,
              oldestDueDate: payable.dueDate!,
              daysOverdue: daysDiff,
            })
          }
        }
      }

      // Calculate DPO (Days Payable Outstanding)
      const totalOutstanding =
        aging.current.amount +
        aging.days1to30.amount +
        aging.days31to60.amount +
        aging.days61to90.amount +
        aging.days90plus.amount

      // Get total purchases for DPO calculation (last 365 days)
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const purchasesResult = await db
        .select({
          totalPurchases: sql<number>`sum(${accountPayables.totalAmount})`,
        })
        .from(accountPayables)
        .where(
          and(
            gte(accountPayables.createdAt, oneYearAgo.toISOString()),
            ...(branchId ? [eq(accountPayables.branchId, branchId)] : [])
          )
        )

      const totalPurchases = purchasesResult[0]?.totalPurchases || 0
      const dpo = totalPurchases > 0 ? Math.round((totalOutstanding / (totalPurchases / 365)) * 10) / 10 : 0

      // Sort upcoming payments by due date
      upcomingPayments.sort((a, b) => a.daysUntilDue - b.daysUntilDue)

      // Get top overdue suppliers
      const topOverdue = Array.from(overdueBySupplier.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      return {
        success: true,
        data: {
          totalOutstanding,
          dpo,
          aging,
          upcomingPayments: upcomingPayments.slice(0, 5),
          topOverdue,
        },
      }
    } catch (error) {
      console.error('Get aging report error:', error)
      return { success: false, message: 'Failed to fetch aging report' }
    }
  })

  // Get payment history for a payable
  ipcMain.handle('payables:get-payments', async (_, payableId: number) => {
    try {
      const payments = await db.query.payablePayments.findMany({
        where: eq(payablePayments.payableId, payableId),
        orderBy: desc(payablePayments.paymentDate),
        with: {
          paidByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      })

      return { success: true, data: payments }
    } catch (error) {
      console.error('Get payments error:', error)
      return { success: false, message: 'Failed to fetch payments' }
    }
  })
}
