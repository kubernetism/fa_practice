'use server'

import { db } from '@/lib/db'
import { auditLogs, users } from '@/lib/db/schema'
import { eq, and, desc, sql, count, between } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getAuditLogs(filters?: {
  action?: string
  entityType?: string
  userId?: number
  dateFrom?: string
  dateTo?: string
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(auditLogs.tenantId, tenantId)]
  if (filters?.action && filters.action !== 'all') {
    conditions.push(eq(auditLogs.action, filters.action as any))
  }
  if (filters?.entityType && filters.entityType !== 'all') {
    conditions.push(eq(auditLogs.entityType, filters.entityType as any))
  }
  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId))
  }
  if (filters?.dateFrom && filters?.dateTo) {
    conditions.push(
      between(auditLogs.createdAt, new Date(filters.dateFrom), new Date(filters.dateTo))
    )
  }

  const data = await db
    .select({
      log: auditLogs,
      userName: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200)

  return { success: true, data }
}

export async function getAuditLogSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalLogs: count(),
      todayCount: sql<number>`COUNT(*) FILTER (WHERE ${auditLogs.createdAt}::date = CURRENT_DATE)`,
      createCount: sql<number>`COUNT(*) FILTER (WHERE ${auditLogs.action} = 'create')`,
      deleteCount: sql<number>`COUNT(*) FILTER (WHERE ${auditLogs.action} = 'delete')`,
    })
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, tenantId))

  return { success: true, data: result[0] }
}
