'use server'

import { db } from '@/lib/db'
import { journalEntries, journalEntryLines, chartOfAccounts } from '@/lib/db/schema'
import { eq, and, desc, sql, count, between } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getJournalEntries(filters?: { status?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(journalEntries.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(journalEntries.status, filters.status as any))
  }

  const data = await db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate))

  return { success: true, data }
}

export async function getJournalEntrySummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalEntries: count(),
      draftCount: sql<number>`COUNT(*) FILTER (WHERE ${journalEntries.status} = 'draft')`,
      postedCount: sql<number>`COUNT(*) FILTER (WHERE ${journalEntries.status} = 'posted')`,
      reversedCount: sql<number>`COUNT(*) FILTER (WHERE ${journalEntries.status} = 'reversed')`,
    })
    .from(journalEntries)
    .where(eq(journalEntries.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getEntryLines(entryId: number) {
  const tenantId = await getTenantId()

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)))

  if (!entry) return { success: false, message: 'Entry not found' }

  const lines = await db
    .select({
      line: journalEntryLines,
      accountName: chartOfAccounts.accountName,
      accountCode: chartOfAccounts.accountCode,
    })
    .from(journalEntryLines)
    .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
    .where(eq(journalEntryLines.journalEntryId, entryId))

  return { success: true, data: { entry, lines } }
}

export async function createJournalEntry(data: {
  entryDate: string
  description: string
  branchId?: number
  lines: { accountId: number; debitAmount: string; creditAmount: string; description?: string }[]
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const totalDebits = data.lines.reduce((s, l) => s + Number(l.debitAmount), 0)
  const totalCredits = data.lines.reduce((s, l) => s + Number(l.creditAmount), 0)
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return { success: false, message: 'Debits must equal credits' }
  }

  const entryNumber = `JE-${Date.now()}`

  const [entry] = await db
    .insert(journalEntries)
    .values({
      tenantId,
      entryNumber,
      entryDate: new Date(data.entryDate),
      description: data.description,
      branchId: data.branchId || null,
      status: 'draft',
      createdBy: userId,
    })
    .returning()

  for (const line of data.lines) {
    await db.insert(journalEntryLines).values({
      journalEntryId: entry.id,
      accountId: line.accountId,
      debitAmount: line.debitAmount,
      creditAmount: line.creditAmount,
      description: line.description || null,
    })
  }

  return { success: true, data: entry }
}

export async function postJournalEntry(id: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [entry] = await db
    .update(journalEntries)
    .set({
      status: 'posted',
      postedBy: userId,
      postedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(journalEntries.id, id),
        eq(journalEntries.tenantId, tenantId),
        eq(journalEntries.status, 'draft')
      )
    )
    .returning()

  if (!entry) return { success: false, message: 'Entry not found or already posted' }

  return { success: true, data: entry }
}

export async function reverseJournalEntry(id: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [entry] = await db
    .update(journalEntries)
    .set({
      status: 'reversed',
      reversedBy: userId,
      reversedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(journalEntries.id, id),
        eq(journalEntries.tenantId, tenantId),
        eq(journalEntries.status, 'posted')
      )
    )
    .returning()

  if (!entry) return { success: false, message: 'Entry not found or not posted' }

  return { success: true, data: entry }
}

export async function getJournalEntryById(id: number) {
  const tenantId = await getTenantId()

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, tenantId)))

  if (!entry) return { success: false, message: 'Entry not found' }

  const lines = await db
    .select({
      line: journalEntryLines,
      accountName: chartOfAccounts.accountName,
      accountCode: chartOfAccounts.accountCode,
    })
    .from(journalEntryLines)
    .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
    .where(eq(journalEntryLines.journalEntryId, id))

  return { success: true, data: { entry, lines } }
}

export async function updateJournalEntry(
  id: number,
  data: {
    entryDate?: string
    description?: string
    branchId?: number
    lines?: { accountId: number; debitAmount: string; creditAmount: string; description?: string }[]
  }
) {
  const tenantId = await getTenantId()

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, tenantId)))

  if (!entry) return { success: false, message: 'Entry not found' }
  if (entry.status !== 'draft') return { success: false, message: 'Can only edit draft entries' }

  const updateData: any = { updatedAt: new Date() }
  if (data.entryDate) updateData.entryDate = new Date(data.entryDate)
  if (data.description) updateData.description = data.description
  if (data.branchId !== undefined) updateData.branchId = data.branchId || null

  const [updated] = await db
    .update(journalEntries)
    .set(updateData)
    .where(eq(journalEntries.id, id))
    .returning()

  // Replace lines if provided
  if (data.lines) {
    const totalDebits = data.lines.reduce((s, l) => s + Number(l.debitAmount), 0)
    const totalCredits = data.lines.reduce((s, l) => s + Number(l.creditAmount), 0)
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return { success: false, message: 'Debits must equal credits' }
    }

    await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id))

    for (const line of data.lines) {
      await db.insert(journalEntryLines).values({
        journalEntryId: id,
        accountId: line.accountId,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        description: line.description || null,
      })
    }
  }

  return { success: true, data: updated }
}

export async function getJournalEntriesByDateRange(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.tenantId, tenantId),
        between(journalEntries.entryDate, new Date(dateFrom), new Date(dateTo))
      )
    )
    .orderBy(desc(journalEntries.entryDate))

  return { success: true, data }
}

export async function getGLTransactions(accountId: number, dateFrom?: string, dateTo?: string) {
  const tenantId = await getTenantId()

  const conditions: any[] = [
    eq(journalEntryLines.accountId, accountId),
    eq(journalEntries.tenantId, tenantId),
    eq(journalEntries.status, 'posted'),
  ]
  if (dateFrom && dateTo) {
    conditions.push(between(journalEntries.entryDate, new Date(dateFrom), new Date(dateTo)))
  }

  const data = await db
    .select({
      entryId: journalEntries.id,
      entryNumber: journalEntries.entryNumber,
      entryDate: journalEntries.entryDate,
      entryDescription: journalEntries.description,
      referenceType: journalEntries.referenceType,
      referenceId: journalEntries.referenceId,
      debitAmount: journalEntryLines.debitAmount,
      creditAmount: journalEntryLines.creditAmount,
      lineDescription: journalEntryLines.description,
    })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate))

  return { success: true, data }
}
