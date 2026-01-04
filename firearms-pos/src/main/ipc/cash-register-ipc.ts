import { ipcMain } from 'electron'
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  cashRegisterSessions,
  cashTransactions,
  branches,
  type NewCashRegisterSession,
  type NewCashTransaction,
} from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface OpenSessionData {
  branchId: number
  openingBalance: number
  notes?: string
}

interface CloseSessionData {
  sessionId: number
  actualBalance: number
  notes?: string
}

interface RecordTransactionData {
  sessionId: number
  branchId: number
  transactionType:
    | 'sale'
    | 'refund'
    | 'expense'
    | 'ar_collection'
    | 'ap_payment'
    | 'deposit'
    | 'withdrawal'
    | 'adjustment'
    | 'petty_cash_in'
    | 'petty_cash_out'
  amount: number
  referenceType?: string
  referenceId?: number
  description?: string
}

export function registerCashRegisterHandlers(): void {
  const db = getDatabase()

  // Get current open session for a branch
  ipcMain.handle('cash-register:get-current-session', async (_, branchId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const session = await db.query.cashRegisterSessions.findFirst({
        where: and(
          eq(cashRegisterSessions.branchId, branchId),
          eq(cashRegisterSessions.sessionDate, today),
          eq(cashRegisterSessions.status, 'open')
        ),
        with: {
          branch: true,
          openedByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          transactions: {
            orderBy: desc(cashTransactions.transactionDate),
            limit: 10,
          },
        },
      })

      if (!session) {
        return { success: true, data: null, message: 'No open session found' }
      }

      // Calculate current balance
      const transactionSums = await db
        .select({
          totalIn: sql<number>`sum(case when ${cashTransactions.amount} > 0 then ${cashTransactions.amount} else 0 end)`,
          totalOut: sql<number>`sum(case when ${cashTransactions.amount} < 0 then abs(${cashTransactions.amount}) else 0 end)`,
        })
        .from(cashTransactions)
        .where(eq(cashTransactions.sessionId, session.id))

      const totalIn = transactionSums[0]?.totalIn || 0
      const totalOut = transactionSums[0]?.totalOut || 0
      const currentBalance = session.openingBalance + totalIn - totalOut

      return {
        success: true,
        data: {
          ...session,
          currentBalance,
          totalIn,
          totalOut,
        },
      }
    } catch (error) {
      console.error('Get current session error:', error)
      return { success: false, message: 'Failed to fetch current session' }
    }
  })

  // Open a new cash register session
  ipcMain.handle('cash-register:open-session', async (_, data: OpenSessionData) => {
    try {
      const userSession = getCurrentSession()

      if (!userSession) {
        return { success: false, message: 'Unauthorized' }
      }

      const today = new Date().toISOString().split('T')[0]

      // Check if session already exists for today
      const existingSession = await db.query.cashRegisterSessions.findFirst({
        where: and(
          eq(cashRegisterSessions.branchId, data.branchId),
          eq(cashRegisterSessions.sessionDate, today)
        ),
      })

      if (existingSession) {
        if (existingSession.status === 'open') {
          return { success: false, message: 'A cash register session is already open for today' }
        }
        return { success: false, message: 'Cash register session for today has already been closed' }
      }

      // Get previous session's closing balance as suggested opening
      const previousSession = await db.query.cashRegisterSessions.findFirst({
        where: and(
          eq(cashRegisterSessions.branchId, data.branchId),
          eq(cashRegisterSessions.status, 'closed')
        ),
        orderBy: desc(cashRegisterSessions.sessionDate),
      })

      const [newSession] = await db
        .insert(cashRegisterSessions)
        .values({
          branchId: data.branchId,
          sessionDate: today,
          openingBalance: data.openingBalance,
          status: 'open',
          openedBy: userSession.userId,
          notes: data.notes,
        })
        .returning()

      await createAuditLog({
        userId: userSession.userId,
        branchId: data.branchId,
        action: 'create',
        entityType: 'cash_register_session',
        entityId: newSession.id,
        newValues: {
          openingBalance: data.openingBalance,
          sessionDate: today,
        },
        description: `Opened cash register session with balance ${data.openingBalance}`,
      })

      return {
        success: true,
        data: newSession,
        previousClosingBalance: previousSession?.closingBalance,
      }
    } catch (error) {
      console.error('Open session error:', error)
      return { success: false, message: 'Failed to open cash register session' }
    }
  })

  // Close cash register session
  ipcMain.handle('cash-register:close-session', async (_, data: CloseSessionData) => {
    try {
      const userSession = getCurrentSession()

      if (!userSession) {
        return { success: false, message: 'Unauthorized' }
      }

      const session = await db.query.cashRegisterSessions.findFirst({
        where: eq(cashRegisterSessions.id, data.sessionId),
      })

      if (!session) {
        return { success: false, message: 'Session not found' }
      }

      if (session.status !== 'open') {
        return { success: false, message: 'Session is already closed' }
      }

      // Calculate expected balance
      const transactionSums = await db
        .select({
          totalIn: sql<number>`sum(case when ${cashTransactions.amount} > 0 then ${cashTransactions.amount} else 0 end)`,
          totalOut: sql<number>`sum(case when ${cashTransactions.amount} < 0 then abs(${cashTransactions.amount}) else 0 end)`,
        })
        .from(cashTransactions)
        .where(eq(cashTransactions.sessionId, data.sessionId))

      const totalIn = transactionSums[0]?.totalIn || 0
      const totalOut = transactionSums[0]?.totalOut || 0
      const expectedBalance = session.openingBalance + totalIn - totalOut
      const variance = data.actualBalance - expectedBalance

      await db
        .update(cashRegisterSessions)
        .set({
          closingBalance: data.actualBalance,
          expectedBalance,
          actualBalance: data.actualBalance,
          variance,
          status: 'closed',
          closedBy: userSession.userId,
          closedAt: new Date().toISOString(),
          notes: data.notes ? `${session.notes || ''}\n${data.notes}`.trim() : session.notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(cashRegisterSessions.id, data.sessionId))

      await createAuditLog({
        userId: userSession.userId,
        branchId: session.branchId,
        action: 'close',
        entityType: 'cash_register_session',
        entityId: data.sessionId,
        oldValues: {
          status: 'open',
          openingBalance: session.openingBalance,
        },
        newValues: {
          status: 'closed',
          closingBalance: data.actualBalance,
          expectedBalance,
          variance,
        },
        description: `Closed cash register session. Expected: ${expectedBalance}, Actual: ${data.actualBalance}, Variance: ${variance}`,
      })

      return {
        success: true,
        data: {
          closingBalance: data.actualBalance,
          expectedBalance,
          variance,
          variancePercent: expectedBalance > 0 ? (variance / expectedBalance) * 100 : 0,
        },
      }
    } catch (error) {
      console.error('Close session error:', error)
      return { success: false, message: 'Failed to close session' }
    }
  })

  // Record a cash transaction
  ipcMain.handle('cash-register:record-transaction', async (_, data: RecordTransactionData) => {
    try {
      const userSession = getCurrentSession()

      if (!userSession) {
        return { success: false, message: 'Unauthorized' }
      }

      // Verify session is open
      const session = await db.query.cashRegisterSessions.findFirst({
        where: eq(cashRegisterSessions.id, data.sessionId),
      })

      if (!session) {
        return { success: false, message: 'Cash register session not found' }
      }

      if (session.status !== 'open') {
        return { success: false, message: 'Cannot record transaction: session is closed' }
      }

      // Determine if this is inflow or outflow and adjust amount sign
      let adjustedAmount = data.amount
      const outflowTypes = ['refund', 'expense', 'ap_payment', 'deposit', 'petty_cash_out']
      if (outflowTypes.includes(data.transactionType)) {
        adjustedAmount = -Math.abs(data.amount) // Ensure negative for outflows
      } else {
        adjustedAmount = Math.abs(data.amount) // Ensure positive for inflows
      }

      const [transaction] = await db
        .insert(cashTransactions)
        .values({
          sessionId: data.sessionId,
          branchId: data.branchId,
          transactionType: data.transactionType,
          amount: adjustedAmount,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          description: data.description,
          recordedBy: userSession.userId,
        })
        .returning()

      return { success: true, data: transaction }
    } catch (error) {
      console.error('Record transaction error:', error)
      return { success: false, message: 'Failed to record transaction' }
    }
  })

  // Get session history
  ipcMain.handle(
    'cash-register:get-history',
    async (
      _,
      params: {
        branchId?: number
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
      }
    ) => {
      try {
        const { branchId, startDate, endDate, page = 1, limit = 20 } = params

        const conditions = []
        if (branchId) conditions.push(eq(cashRegisterSessions.branchId, branchId))
        if (startDate) conditions.push(gte(cashRegisterSessions.sessionDate, startDate))
        if (endDate) conditions.push(lte(cashRegisterSessions.sessionDate, endDate))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(cashRegisterSessions)
          .where(whereClause)

        const total = countResult[0]?.count ?? 0

        const sessions = await db.query.cashRegisterSessions.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: desc(cashRegisterSessions.sessionDate),
          with: {
            branch: true,
            openedByUser: {
              columns: { id: true, username: true, fullName: true },
            },
            closedByUser: {
              columns: { id: true, username: true, fullName: true },
            },
          },
        })

        return {
          success: true,
          data: sessions,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      } catch (error) {
        console.error('Get history error:', error)
        return { success: false, message: 'Failed to fetch session history' }
      }
    }
  )

  // Get transactions for a session
  ipcMain.handle('cash-register:get-transactions', async (_, sessionId: number) => {
    try {
      const transactions = await db.query.cashTransactions.findMany({
        where: eq(cashTransactions.sessionId, sessionId),
        orderBy: desc(cashTransactions.transactionDate),
        with: {
          recordedByUser: {
            columns: { id: true, username: true, fullName: true },
          },
        },
      })

      // Calculate summary
      let totalIn = 0
      let totalOut = 0
      const byType: Record<string, number> = {}

      for (const tx of transactions) {
        if (tx.amount > 0) {
          totalIn += tx.amount
        } else {
          totalOut += Math.abs(tx.amount)
        }

        byType[tx.transactionType] = (byType[tx.transactionType] || 0) + tx.amount
      }

      return {
        success: true,
        data: transactions,
        summary: {
          totalIn,
          totalOut,
          netFlow: totalIn - totalOut,
          byType,
        },
      }
    } catch (error) {
      console.error('Get transactions error:', error)
      return { success: false, message: 'Failed to fetch transactions' }
    }
  })

  // Get cash flow summary for dashboard
  ipcMain.handle(
    'cash-register:get-cash-flow-summary',
    async (_, params: { branchId?: number; days?: number }) => {
      try {
        const { branchId, days = 30 } = params

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startDateStr = startDate.toISOString().split('T')[0]

        const conditions = [gte(cashRegisterSessions.sessionDate, startDateStr)]
        if (branchId) conditions.push(eq(cashRegisterSessions.branchId, branchId))

        // Get daily cash flow data
        const dailyFlow = await db
          .select({
            date: cashRegisterSessions.sessionDate,
            openingBalance: cashRegisterSessions.openingBalance,
            closingBalance: cashRegisterSessions.closingBalance,
            variance: cashRegisterSessions.variance,
          })
          .from(cashRegisterSessions)
          .where(and(...conditions, eq(cashRegisterSessions.status, 'closed')))
          .orderBy(cashRegisterSessions.sessionDate)

        // Get transaction breakdown
        const txConditions = [gte(cashTransactions.transactionDate, startDate.toISOString())]
        if (branchId) txConditions.push(eq(cashTransactions.branchId, branchId))

        const transactionBreakdown = await db
          .select({
            transactionType: cashTransactions.transactionType,
            totalAmount: sql<number>`sum(${cashTransactions.amount})`,
            count: sql<number>`count(*)`,
          })
          .from(cashTransactions)
          .where(and(...txConditions))
          .groupBy(cashTransactions.transactionType)

        // Calculate totals
        const inflows = transactionBreakdown
          .filter((t) => (t.totalAmount || 0) > 0)
          .reduce((sum, t) => sum + (t.totalAmount || 0), 0)

        const outflows = Math.abs(
          transactionBreakdown
            .filter((t) => (t.totalAmount || 0) < 0)
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0)
        )

        // Get current cash in hand (latest closed session's closing balance)
        const latestSession = await db.query.cashRegisterSessions.findFirst({
          where: and(
            eq(cashRegisterSessions.status, 'closed'),
            ...(branchId ? [eq(cashRegisterSessions.branchId, branchId)] : [])
          ),
          orderBy: desc(cashRegisterSessions.sessionDate),
        })

        return {
          success: true,
          data: {
            currentCashInHand: latestSession?.closingBalance || 0,
            periodSummary: {
              days,
              totalInflows: inflows,
              totalOutflows: outflows,
              netCashFlow: inflows - outflows,
            },
            dailyFlow,
            transactionBreakdown,
          },
        }
      } catch (error) {
        console.error('Get cash flow summary error:', error)
        return { success: false, message: 'Failed to fetch cash flow summary' }
      }
    }
  )

  // Manual adjustment
  ipcMain.handle(
    'cash-register:adjust',
    async (
      _,
      data: {
        sessionId: number
        amount: number
        reason: string
      }
    ) => {
      try {
        const userSession = getCurrentSession()

        if (!userSession) {
          return { success: false, message: 'Unauthorized' }
        }

        // Check if user is admin
        if (userSession.role !== 'admin') {
          return { success: false, message: 'Only admins can make manual adjustments' }
        }

        const session = await db.query.cashRegisterSessions.findFirst({
          where: eq(cashRegisterSessions.id, data.sessionId),
        })

        if (!session) {
          return { success: false, message: 'Session not found' }
        }

        if (session.status !== 'open') {
          return { success: false, message: 'Cannot adjust: session is closed' }
        }

        const [transaction] = await db
          .insert(cashTransactions)
          .values({
            sessionId: data.sessionId,
            branchId: session.branchId,
            transactionType: 'adjustment',
            amount: data.amount,
            description: `Manual adjustment: ${data.reason}`,
            recordedBy: userSession.userId,
          })
          .returning()

        await createAuditLog({
          userId: userSession.userId,
          branchId: session.branchId,
          action: 'adjustment',
          entityType: 'cash_register',
          entityId: data.sessionId,
          newValues: {
            amount: data.amount,
            reason: data.reason,
          },
          description: `Manual cash adjustment of ${data.amount}: ${data.reason}`,
        })

        return { success: true, data: transaction }
      } catch (error) {
        console.error('Adjustment error:', error)
        return { success: false, message: 'Failed to record adjustment' }
      }
    }
  )
}
