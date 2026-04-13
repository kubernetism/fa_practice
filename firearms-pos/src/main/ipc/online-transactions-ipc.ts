import { ipcMain } from 'electron'
import { eq, and, desc, asc, sql, gte, lte, like, or, inArray } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  onlineTransactions,
  customers,
  branches,
  users,
  type NewOnlineTransaction,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

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

  // ── Confirm transaction ──
  ipcMain.handle('online-transactions:confirm', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }

      const existing = await db.query.onlineTransactions.findFirst({
        where: eq(onlineTransactions.id, id),
      })
      if (!existing) return { success: false, message: 'Transaction not found' }

      if (existing.status === 'confirmed') {
        return { success: false, message: 'Transaction is already confirmed' }
      }

      const [updated] = await db
        .update(onlineTransactions)
        .set({
          status: 'confirmed',
          confirmedBy: session.userId,
          confirmedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(onlineTransactions.id, id))
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: existing.branchId,
        action: 'update',
        entityType: 'online_transaction',
        entityId: id,
        oldValues: { status: existing.status },
        newValues: { status: 'confirmed' },
        description: `Confirmed online transaction #${id}`,
      })

      return { success: true, data: updated }
    } catch (error) {
      console.error('Confirm online transaction error:', error)
      return { success: false, message: 'Failed to confirm transaction' }
    }
  })

  // ── Bulk confirm ──
  ipcMain.handle('online-transactions:bulk-confirm', async (_, ids: number[]) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }

      const now = new Date().toISOString()
      await db
        .update(onlineTransactions)
        .set({
          status: 'confirmed',
          confirmedBy: session.userId,
          confirmedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            inArray(onlineTransactions.id, ids),
            eq(onlineTransactions.status, 'pending')
          )
        )

      return { success: true, message: `${ids.length} transactions confirmed` }
    } catch (error) {
      console.error('Bulk confirm error:', error)
      return { success: false, message: 'Failed to confirm transactions' }
    }
  })

  // ── Mark as failed ──
  ipcMain.handle('online-transactions:mark-failed', async (_, id: number, reason?: string) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }

      const [updated] = await db
        .update(onlineTransactions)
        .set({
          status: 'failed',
          notes: reason
            ? sql`CASE WHEN ${onlineTransactions.notes} IS NOT NULL THEN ${onlineTransactions.notes} || ' | Failed: ' || ${reason} ELSE 'Failed: ' || ${reason} END`
            : onlineTransactions.notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(onlineTransactions.id, id))
        .returning()

      return { success: true, data: updated }
    } catch (error) {
      console.error('Mark failed error:', error)
      return { success: false, message: 'Failed to update transaction' }
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
