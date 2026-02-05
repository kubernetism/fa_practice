'use server'

import { db } from '@/lib/db'
import { cashRegisterSessions, cashTransactions } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getCashSessions(filters?: { status?: string; branchId?: number }) {
  const tenantId = await getTenantId()

  const conditions = [eq(cashRegisterSessions.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(cashRegisterSessions.status, filters.status as any))
  }
  if (filters?.branchId) {
    conditions.push(eq(cashRegisterSessions.branchId, filters.branchId))
  }

  const data = await db
    .select()
    .from(cashRegisterSessions)
    .where(and(...conditions))
    .orderBy(desc(cashRegisterSessions.openedAt))

  return { success: true, data }
}

export async function getActiveSession(branchId: number) {
  const tenantId = await getTenantId()

  const [session] = await db
    .select()
    .from(cashRegisterSessions)
    .where(
      and(
        eq(cashRegisterSessions.tenantId, tenantId),
        eq(cashRegisterSessions.branchId, branchId),
        eq(cashRegisterSessions.status, 'open')
      )
    )

  return { success: true, data: session || null }
}

export async function openSession(data: { branchId: number; openingBalance: string }) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const today = new Date().toISOString().split('T')[0]

  const [newSession] = await db
    .insert(cashRegisterSessions)
    .values({
      tenantId,
      branchId: data.branchId,
      sessionDate: today,
      openingBalance: data.openingBalance,
      status: 'open',
      openedBy: userId,
    })
    .returning()

  return { success: true, data: newSession }
}

export async function closeSession(data: {
  sessionId: number
  actualBalance: string
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  // Calculate expected balance from transactions
  const txResult = await db
    .select({
      totalIn: sql<string>`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} > 0 THEN ${cashTransactions.amount} ELSE 0 END), 0)`,
      totalOut: sql<string>`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} < 0 THEN ABS(${cashTransactions.amount}) ELSE 0 END), 0)`,
    })
    .from(cashTransactions)
    .where(eq(cashTransactions.sessionId, data.sessionId))

  const [cashSession] = await db
    .select()
    .from(cashRegisterSessions)
    .where(
      and(eq(cashRegisterSessions.id, data.sessionId), eq(cashRegisterSessions.tenantId, tenantId))
    )

  if (!cashSession) return { success: false, message: 'Session not found' }

  const opening = Number(cashSession.openingBalance)
  const totalIn = Number(txResult[0]?.totalIn || 0)
  const totalOut = Number(txResult[0]?.totalOut || 0)
  const expectedBalance = opening + totalIn - totalOut
  const variance = Number(data.actualBalance) - expectedBalance

  await db
    .update(cashRegisterSessions)
    .set({
      closingBalance: String(expectedBalance),
      expectedBalance: String(expectedBalance),
      actualBalance: data.actualBalance,
      variance: String(variance),
      status: 'closed',
      closedBy: userId,
      closedAt: new Date(),
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(cashRegisterSessions.id, data.sessionId))

  return { success: true }
}

export async function getSessionTransactions(sessionId: number) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(cashTransactions)
    .where(
      and(eq(cashTransactions.sessionId, sessionId), eq(cashTransactions.tenantId, tenantId))
    )
    .orderBy(desc(cashTransactions.transactionDate))

  return { success: true, data }
}

export async function addCashTransaction(data: {
  sessionId: number
  branchId: number
  transactionType: string
  amount: string
  description?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [tx] = await db
    .insert(cashTransactions)
    .values({
      tenantId,
      sessionId: data.sessionId,
      branchId: data.branchId,
      transactionType: data.transactionType as any,
      amount: data.amount,
      description: data.description || null,
      recordedBy: userId,
    })
    .returning()

  return { success: true, data: tx }
}
