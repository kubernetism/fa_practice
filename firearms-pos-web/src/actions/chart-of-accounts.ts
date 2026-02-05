'use server'

import { db } from '@/lib/db'
import { chartOfAccounts } from '@/lib/db/schema'
import { eq, and, desc, sql, count, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getAccounts(filters?: { type?: string; active?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(chartOfAccounts.tenantId, tenantId)]
  if (filters?.type && filters.type !== 'all') {
    conditions.push(eq(chartOfAccounts.accountType, filters.type as any))
  }
  if (filters?.active === 'active') {
    conditions.push(eq(chartOfAccounts.isActive, true))
  } else if (filters?.active === 'inactive') {
    conditions.push(eq(chartOfAccounts.isActive, false))
  }

  const data = await db
    .select()
    .from(chartOfAccounts)
    .where(and(...conditions))
    .orderBy(chartOfAccounts.accountCode)

  return { success: true, data }
}

export async function getAccountsSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalAccounts: count(),
      assetCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'asset')`,
      liabilityCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'liability')`,
      equityCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'equity')`,
      revenueCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'revenue')`,
      expenseCount: sql<number>`COUNT(*) FILTER (WHERE ${chartOfAccounts.accountType} = 'expense')`,
    })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.isActive, true)))

  return { success: true, data: result[0] }
}

export async function createAccount(data: {
  accountCode: string
  accountName: string
  accountType: string
  accountSubType?: string
  parentAccountId?: number
  description?: string
  normalBalance: string
}) {
  const tenantId = await getTenantId()

  const [account] = await db
    .insert(chartOfAccounts)
    .values({
      tenantId,
      accountCode: data.accountCode,
      accountName: data.accountName,
      accountType: data.accountType as any,
      accountSubType: data.accountSubType || null,
      parentAccountId: data.parentAccountId || null,
      description: data.description || null,
      normalBalance: data.normalBalance as any,
    })
    .returning()

  return { success: true, data: account }
}

export async function updateAccount(
  id: number,
  data: {
    accountName?: string
    accountSubType?: string
    description?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const [account] = await db
    .update(chartOfAccounts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))
    .returning()

  return { success: true, data: account }
}

export async function deleteAccount(id: number) {
  const tenantId = await getTenantId()

  const [account] = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  if (!account) return { success: false, message: 'Account not found' }
  if (account.isSystemAccount) return { success: false, message: 'Cannot delete system account' }

  await db
    .delete(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))

  return { success: true }
}
