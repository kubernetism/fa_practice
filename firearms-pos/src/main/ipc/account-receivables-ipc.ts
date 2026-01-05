import { ipcMain } from 'electron'
import { eq, and, desc, sql, gte, lte, like, or } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  accountReceivables,
  receivablePayments,
  customers,
  sales,
  branches,
  users,
  type NewAccountReceivable,
  type NewReceivablePayment,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ReceivableFilters extends PaginationParams {
  customerId?: number
  branchId?: number
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  search?: string
  startDate?: string
  endDate?: string
}

interface CreateReceivableData {
  customerId: number
  saleId?: number
  branchId: number
  invoiceNumber: string
  totalAmount: number
  dueDate?: string
  notes?: string
}

interface RecordPaymentData {
  receivableId: number
  amount: number
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'cheque'
  referenceNumber?: string
  notes?: string
}

export function registerAccountReceivablesHandlers(): void {
  const db = getDatabase()

  // Get all receivables with pagination and filters
  ipcMain.handle('receivables:get-all', async (_, params: ReceivableFilters = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortOrder = 'desc',
        customerId,
        branchId,
        status,
        search,
        startDate,
        endDate,
      } = params

      const conditions = []

      if (customerId) conditions.push(eq(accountReceivables.customerId, customerId))
      if (branchId) conditions.push(eq(accountReceivables.branchId, branchId))
      if (status) conditions.push(eq(accountReceivables.status, status))
      if (startDate) conditions.push(gte(accountReceivables.createdAt, startDate))
      if (endDate) conditions.push(lte(accountReceivables.createdAt, endDate))

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(accountReceivables)
        .where(whereClause)

      const total = countResult[0]?.count ?? 0

      // Get data with relations
      const data = await db.query.accountReceivables.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: sortOrder === 'desc' ? desc(accountReceivables.createdAt) : accountReceivables.createdAt,
        with: {
          customer: true,
          sale: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          payments: {
            orderBy: desc(receivablePayments.paymentDate),
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
      console.error('Get receivables error:', error)
      return { success: false, message: 'Failed to fetch receivables' }
    }
  })

  // Get receivable by ID
  ipcMain.handle('receivables:get-by-id', async (_, id: number) => {
    try {
      const receivable = await db.query.accountReceivables.findFirst({
        where: eq(accountReceivables.id, id),
        with: {
          customer: true,
          sale: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          payments: {
            orderBy: desc(receivablePayments.paymentDate),
            with: {
              receivedByUser: {
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

      if (!receivable) {
        return { success: false, message: 'Receivable not found' }
      }

      return { success: true, data: receivable }
    } catch (error) {
      console.error('Get receivable error:', error)
      return { success: false, message: 'Failed to fetch receivable' }
    }
  })

  // Get receivables by customer
  ipcMain.handle('receivables:get-by-customer', async (_, customerId: number) => {
    try {
      const data = await db.query.accountReceivables.findMany({
        where: and(
          eq(accountReceivables.customerId, customerId),
          or(
            eq(accountReceivables.status, 'pending'),
            eq(accountReceivables.status, 'partial'),
            eq(accountReceivables.status, 'overdue')
          )
        ),
        orderBy: desc(accountReceivables.createdAt),
        with: {
          branch: true,
          payments: true,
        },
      })

      // Calculate totals
      const totalOwed = data.reduce((sum, r) => sum + r.remainingAmount, 0)
      const totalPaid = data.reduce((sum, r) => sum + r.paidAmount, 0)

      return {
        success: true,
        data,
        summary: {
          totalReceivables: data.length,
          totalOwed,
          totalPaid,
        },
      }
    } catch (error) {
      console.error('Get customer receivables error:', error)
      return { success: false, message: 'Failed to fetch customer receivables' }
    }
  })

  // Create new receivable
  ipcMain.handle('receivables:create', async (_, data: CreateReceivableData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Verify customer exists
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, data.customerId),
      })

      if (!customer) {
        return { success: false, message: 'Customer not found' }
      }

      // Verify branch exists
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, data.branchId),
      })

      if (!branch) {
        return { success: false, message: 'Branch not found' }
      }

      const [newReceivable] = await db
        .insert(accountReceivables)
        .values({
          customerId: data.customerId,
          saleId: data.saleId,
          branchId: data.branchId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount,
          paidAmount: 0,
          remainingAmount: data.totalAmount,
          status: 'pending',
          dueDate: data.dueDate,
          notes: data.notes,
          createdBy: session.userId,
        })
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'account_receivable',
        entityId: newReceivable.id,
        newValues: {
          customerId: data.customerId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount,
        },
        description: `Created receivable ${data.invoiceNumber} for ${customer.firstName} ${customer.lastName}`,
      })

      return { success: true, data: newReceivable }
    } catch (error) {
      console.error('Create receivable error:', error)
      return { success: false, message: 'Failed to create receivable' }
    }
  })

  // Record payment against receivable
  ipcMain.handle('receivables:record-payment', async (_, data: RecordPaymentData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Get the receivable
      const receivable = await db.query.accountReceivables.findFirst({
        where: eq(accountReceivables.id, data.receivableId),
        with: {
          customer: true,
        },
      })

      if (!receivable) {
        return { success: false, message: 'Receivable not found' }
      }

      if (receivable.status === 'paid') {
        return { success: false, message: 'This receivable is already fully paid' }
      }

      if (receivable.status === 'cancelled') {
        return { success: false, message: 'Cannot record payment for cancelled receivable' }
      }

      if (data.amount <= 0) {
        return { success: false, message: 'Payment amount must be greater than 0' }
      }

      if (data.amount > receivable.remainingAmount) {
        return {
          success: false,
          message: `Payment amount cannot exceed remaining balance of ${receivable.remainingAmount}`,
        }
      }

      // Record the payment
      const [payment] = await db
        .insert(receivablePayments)
        .values({
          receivableId: data.receivableId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          receivedBy: session.userId,
        })
        .returning()

      // Update receivable amounts
      const newPaidAmount = receivable.paidAmount + data.amount
      const newRemainingAmount = receivable.totalAmount - newPaidAmount
      const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial'

      await db
        .update(accountReceivables)
        .set({
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(accountReceivables.id, data.receivableId))

      // Sync with sales table if this receivable is linked to a sale
      if (receivable.saleId) {
        const sale = await db.query.sales.findFirst({
          where: eq(sales.id, receivable.saleId),
        })

        if (sale) {
          const newSaleAmountPaid = sale.amountPaid + data.amount
          const saleOutstanding = sale.totalAmount - newSaleAmountPaid
          const newSalePaymentStatus = saleOutstanding <= 0 ? 'paid' : 'partial'

          await db
            .update(sales)
            .set({
              amountPaid: newSaleAmountPaid,
              paymentStatus: newSalePaymentStatus,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(sales.id, receivable.saleId))
        }
      }

      await createAuditLog({
        userId: session.userId,
        branchId: receivable.branchId,
        action: 'payment',
        entityType: 'account_receivable',
        entityId: data.receivableId,
        oldValues: {
          paidAmount: receivable.paidAmount,
          remainingAmount: receivable.remainingAmount,
          status: receivable.status,
        },
        newValues: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paymentAmount: data.amount,
          paymentMethod: data.paymentMethod,
        },
        description: `Recorded payment of ${data.amount} for receivable ${receivable.invoiceNumber}`,
      })

      return {
        success: true,
        data: payment,
        receivable: {
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

  // Cancel receivable
  ipcMain.handle('receivables:cancel', async (_, id: number, reason?: string) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const receivable = await db.query.accountReceivables.findFirst({
        where: eq(accountReceivables.id, id),
      })

      if (!receivable) {
        return { success: false, message: 'Receivable not found' }
      }

      if (receivable.status === 'paid') {
        return { success: false, message: 'Cannot cancel a fully paid receivable' }
      }

      if (receivable.paidAmount > 0) {
        return { success: false, message: 'Cannot cancel receivable with existing payments' }
      }

      await db
        .update(accountReceivables)
        .set({
          status: 'cancelled',
          notes: reason ? `${receivable.notes || ''}\nCancelled: ${reason}`.trim() : receivable.notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(accountReceivables.id, id))

      await createAuditLog({
        userId: session.userId,
        branchId: receivable.branchId,
        action: 'cancel',
        entityType: 'account_receivable',
        entityId: id,
        oldValues: { status: receivable.status },
        newValues: { status: 'cancelled', reason },
        description: `Cancelled receivable ${receivable.invoiceNumber}`,
      })

      return { success: true, message: 'Receivable cancelled successfully' }
    } catch (error) {
      console.error('Cancel receivable error:', error)
      return { success: false, message: 'Failed to cancel receivable' }
    }
  })

  // Get summary/dashboard stats
  ipcMain.handle('receivables:get-summary', async (_, branchId?: number) => {
    try {
      const conditions = []
      if (branchId) conditions.push(eq(accountReceivables.branchId, branchId))

      // Get totals by status
      const statusQuery = await db
        .select({
          status: accountReceivables.status,
          count: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${accountReceivables.totalAmount})`,
          remainingAmount: sql<number>`sum(${accountReceivables.remainingAmount})`,
        })
        .from(accountReceivables)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(accountReceivables.status)

      // Get overall totals (outstanding only - pending, partial, overdue)
      const outstandingQuery = await db
        .select({
          totalReceivables: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${accountReceivables.totalAmount})`,
          totalRemaining: sql<number>`sum(${accountReceivables.remainingAmount})`,
        })
        .from(accountReceivables)
        .where(
          and(
            ...(conditions.length > 0 ? conditions : []),
            or(
              eq(accountReceivables.status, 'pending'),
              eq(accountReceivables.status, 'partial'),
              eq(accountReceivables.status, 'overdue')
            )
          )
        )

      // Get total collected from ALL receivables (including paid ones)
      const collectedQuery = await db
        .select({
          totalPaid: sql<number>`sum(${accountReceivables.paidAmount})`,
        })
        .from(accountReceivables)
        .where(conditions.length > 0 ? and(...conditions) : undefined)

      // Get today's collections from receivable payments using raw SQL
      const today = new Date().toISOString().split('T')[0]
      let todayCollectionResult: { todayCollected: number }[]

      if (branchId) {
        todayCollectionResult = await db.all<{ todayCollected: number }>(
          sql`SELECT COALESCE(SUM(rp.amount), 0) as todayCollected
              FROM receivable_payments rp
              INNER JOIN account_receivables ar ON rp.receivable_id = ar.id
              WHERE date(rp.payment_date) = date('now') AND ar.branch_id = ${branchId}`
        )
      } else {
        todayCollectionResult = await db.all<{ todayCollected: number }>(
          sql`SELECT COALESCE(SUM(rp.amount), 0) as todayCollected
              FROM receivable_payments rp
              WHERE date(rp.payment_date) = date('now')`
        )
      }
      const todayCollected = todayCollectionResult[0]?.todayCollected ?? 0

      // Get overdue count (receivables past due date)
      const overdueQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(accountReceivables)
        .where(
          and(
            ...(conditions.length > 0 ? conditions : []),
            lte(accountReceivables.dueDate, today),
            or(eq(accountReceivables.status, 'pending'), eq(accountReceivables.status, 'partial'))
          )
        )

      // Update overdue status for any receivables past due date
      await db
        .update(accountReceivables)
        .set({ status: 'overdue', updatedAt: new Date().toISOString() })
        .where(
          and(
            lte(accountReceivables.dueDate, today),
            or(eq(accountReceivables.status, 'pending'), eq(accountReceivables.status, 'partial'))
          )
        )

      return {
        success: true,
        data: {
          byStatus: statusQuery,
          totals: {
            totalReceivables: outstandingQuery[0]?.totalReceivables ?? 0,
            totalAmount: outstandingQuery[0]?.totalAmount ?? 0,
            totalPaid: collectedQuery[0]?.totalPaid ?? 0,
            totalRemaining: outstandingQuery[0]?.totalRemaining ?? 0,
            todayCollected: todayCollected,
          },
          overdueCount: overdueQuery[0]?.count ?? 0,
        },
      }
    } catch (error) {
      console.error('Get summary error:', error)
      return { success: false, message: 'Failed to fetch summary' }
    }
  })

  // Get payment history for a receivable
  ipcMain.handle('receivables:get-payments', async (_, receivableId: number) => {
    try {
      const payments = await db.query.receivablePayments.findMany({
        where: eq(receivablePayments.receivableId, receivableId),
        orderBy: desc(receivablePayments.paymentDate),
        with: {
          receivedByUser: {
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

  // Get aging report for receivables
  ipcMain.handle('receivables:get-aging-report', async (_, branchId?: number) => {
    try {
      const today = new Date()
      const conditions = [
        or(
          eq(accountReceivables.status, 'pending'),
          eq(accountReceivables.status, 'partial'),
          eq(accountReceivables.status, 'overdue')
        ),
      ]
      if (branchId) conditions.push(eq(accountReceivables.branchId, branchId))

      // Get all outstanding receivables with customer info
      const outstandingReceivables = await db.query.accountReceivables.findMany({
        where: and(...conditions),
        with: {
          customer: true,
          branch: true,
        },
        orderBy: desc(accountReceivables.dueDate),
      })

      // Calculate aging buckets
      const aging = {
        current: { amount: 0, count: 0 },
        days1to30: { amount: 0, count: 0 },
        days31to60: { amount: 0, count: 0 },
        days61to90: { amount: 0, count: 0 },
        days90plus: { amount: 0, count: 0 },
      }

      const overdueByCustomer: Map<
        number,
        { customer: string; amount: number; oldestDueDate: string; daysOverdue: number }
      > = new Map()

      for (const receivable of outstandingReceivables) {
        const dueDate = receivable.dueDate ? new Date(receivable.dueDate) : null
        const amount = receivable.remainingAmount

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

        // Track overdue by customer
        if (daysDiff > 0 && receivable.customer) {
          const customerName = `${receivable.customer.firstName} ${receivable.customer.lastName}`
          const existing = overdueByCustomer.get(receivable.customer.id)
          if (existing) {
            existing.amount += amount
            if (daysDiff > existing.daysOverdue) {
              existing.daysOverdue = daysDiff
              existing.oldestDueDate = receivable.dueDate!
            }
          } else {
            overdueByCustomer.set(receivable.customer.id, {
              customer: customerName,
              amount,
              oldestDueDate: receivable.dueDate!,
              daysOverdue: daysDiff,
            })
          }
        }
      }

      // Calculate DSO (Days Sales Outstanding)
      const totalOutstanding =
        aging.current.amount +
        aging.days1to30.amount +
        aging.days31to60.amount +
        aging.days61to90.amount +
        aging.days90plus.amount

      // Get total credit sales for DSO calculation (last 365 days)
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const salesResult = await db
        .select({
          totalSales: sql<number>`sum(${accountReceivables.totalAmount})`,
        })
        .from(accountReceivables)
        .where(
          and(
            gte(accountReceivables.createdAt, oneYearAgo.toISOString()),
            ...(branchId ? [eq(accountReceivables.branchId, branchId)] : [])
          )
        )

      const totalSales = salesResult[0]?.totalSales || 0
      const dso = totalSales > 0 ? Math.round((totalOutstanding / (totalSales / 365)) * 10) / 10 : 0

      // Get top overdue customers
      const topOverdue = Array.from(overdueByCustomer.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      return {
        success: true,
        data: {
          totalOutstanding,
          dso,
          aging,
          topOverdue,
        },
      }
    } catch (error) {
      console.error('Get aging report error:', error)
      return { success: false, message: 'Failed to fetch aging report' }
    }
  })

  // Sync receivables with sales table (admin utility)
  ipcMain.handle('receivables:sync-with-sales', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      if (session.role !== 'admin') {
        return { success: false, message: 'Admin access required' }
      }

      const db = getDatabase()

      // Get all receivables with linked sales that might be out of sync
      const receivablesWithSales = await db.query.accountReceivables.findMany({
        where: sql`${accountReceivables.saleId} IS NOT NULL`,
      })

      let syncedCount = 0

      for (const receivable of receivablesWithSales) {
        if (!receivable.saleId) continue

        const sale = await db.query.sales.findFirst({
          where: eq(sales.id, receivable.saleId),
        })

        if (!sale) continue

        // Calculate what the sale's amount_paid should be
        // Original cash payment + receivable payments
        const originalCashPayment = sale.totalAmount - receivable.totalAmount
        const expectedAmountPaid = originalCashPayment + receivable.paidAmount
        const expectedStatus = expectedAmountPaid >= sale.totalAmount ? 'paid' :
                               expectedAmountPaid > 0 ? 'partial' : 'pending'

        // Only update if different
        if (sale.amountPaid !== expectedAmountPaid || sale.paymentStatus !== expectedStatus) {
          await db
            .update(sales)
            .set({
              amountPaid: expectedAmountPaid,
              paymentStatus: expectedStatus,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(sales.id, receivable.saleId))

          syncedCount++
        }
      }

      await createAuditLog({
        userId: session.userId,
        branchId: null,
        action: 'sync',
        entityType: 'account_receivable',
        entityId: 0,
        description: `Synced ${syncedCount} sales records with receivables`,
      })

      return {
        success: true,
        message: `Successfully synced ${syncedCount} records`,
        syncedCount,
      }
    } catch (error) {
      console.error('Sync receivables with sales error:', error)
      return { success: false, message: 'Failed to sync receivables with sales' }
    }
  })
}
