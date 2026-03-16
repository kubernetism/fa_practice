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
  type NewAccountPayable,
  type NewPayablePayment,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { withTransaction } from '../utils/db-transaction'
import { postAPPaymentToGL } from '../utils/gl-posting'

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

      // Get the payable
      const payable = await db.query.accountPayables.findFirst({
        where: eq(accountPayables.id, data.payableId),
        with: {
          supplier: true,
        },
      })

      if (!payable) {
        return { success: false, message: 'Payable not found' }
      }

      if (payable.status === 'paid') {
        return { success: false, message: 'This payable is already fully paid' }
      }

      if (payable.status === 'cancelled') {
        return { success: false, message: 'Cannot record payment for cancelled payable' }
      }

      if (data.amount <= 0) {
        return { success: false, message: 'Payment amount must be greater than 0' }
      }

      if (data.amount > payable.remainingAmount) {
        return {
          success: false,
          message: `Payment amount cannot exceed remaining balance of ${payable.remainingAmount}`,
        }
      }

      // Calculate new values
      const newPaidAmount = payable.paidAmount + data.amount
      const newRemainingAmount = payable.totalAmount - newPaidAmount
      const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial'

      // Execute all operations in a transaction
      const result = await withTransaction(async ({ db: txDb }) => {
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

        // Update payable amounts
        await txDb
          .update(accountPayables)
          .set({
            paidAmount: newPaidAmount,
            remainingAmount: Math.max(0, newRemainingAmount),
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(accountPayables.id, data.payableId))

        // Bidirectional sync: Update expense status when payable is fully paid
        if (newStatus === 'paid') {
          const linkedExpense = await txDb.query.expenses.findFirst({
            where: eq(expenses.payableId, payable.id),
          })

          if (linkedExpense && linkedExpense.paymentStatus === 'unpaid') {
            await txDb
              .update(expenses)
              .set({
                paymentStatus: 'paid',
                updatedAt: new Date().toISOString(),
              })
              .where(eq(expenses.id, linkedExpense.id))
          }
        }

        // Post to General Ledger
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

        // Record cash register outflow for cash AP payments
        if (data.paymentMethod === 'cash') {
          const today = new Date().toISOString().split('T')[0]
          const openSession = await txDb.query.cashRegisterSessions.findFirst({
            where: and(
              eq(cashRegisterSessions.branchId, payable.branchId),
              eq(cashRegisterSessions.sessionDate, today),
              eq(cashRegisterSessions.status, 'open')
            ),
          })

          if (openSession) {
            await txDb.insert(cashTransactions).values({
              sessionId: openSession.id,
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

        return payment
      })

      // Audit log for expense sync (if applicable)
      if (newStatus === 'paid') {
        const linkedExpense = await db.query.expenses.findFirst({
          where: eq(expenses.payableId, payable.id),
        })

        if (linkedExpense && linkedExpense.paymentStatus === 'paid') {
          await createAuditLog({
            userId: session.userId,
            branchId: linkedExpense.branchId,
            action: 'update',
            entityType: 'expense',
            entityId: linkedExpense.id,
            oldValues: { paymentStatus: 'unpaid' },
            newValues: { paymentStatus: 'paid' },
            description: `Auto-updated expense status to paid (payable #${payable.id} fully paid)`,
          })
        }
      }

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

      return {
        success: true,
        data: result,
        payable: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
        },
      }
    } catch (error) {
      console.error('Record payment error:', error)
      return { success: false, message: 'Failed to record payment' }
    }
  })

  // Cancel payable
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

      if (payable.paidAmount > 0) {
        return { success: false, message: 'Cannot cancel payable with existing payments' }
      }

      await db
        .update(accountPayables)
        .set({
          status: 'cancelled',
          notes: reason ? `${payable.notes || ''}\nCancelled: ${reason}`.trim() : payable.notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(accountPayables.id, id))

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

      // Update overdue status for any payables past due date
      await db
        .update(accountPayables)
        .set({ status: 'overdue', updatedAt: new Date().toISOString() })
        .where(
          and(
            lte(accountPayables.dueDate, today),
            or(eq(accountPayables.status, 'pending'), eq(accountPayables.status, 'partial'))
          )
        )

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
