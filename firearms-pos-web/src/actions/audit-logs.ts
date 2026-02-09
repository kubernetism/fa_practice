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

export async function getAuditLogsByUser(userId: number) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      log: auditLogs,
      userName: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(and(eq(auditLogs.tenantId, tenantId), eq(auditLogs.userId, userId)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200)

  return { success: true, data }
}

export async function getAuditLogsByEntity(entityType: string, entityId?: number) {
  const tenantId = await getTenantId()

  const conditions = [
    eq(auditLogs.tenantId, tenantId),
    eq(auditLogs.entityType, entityType as any),
  ]
  if (entityId) {
    conditions.push(eq(auditLogs.entityId, entityId))
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

export async function getAuditLogsByDateRange(dateFrom: string, dateTo: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      log: auditLogs,
      userName: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(
      and(
        eq(auditLogs.tenantId, tenantId),
        between(auditLogs.createdAt, new Date(dateFrom), new Date(dateTo))
      )
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(500)

  return { success: true, data }
}

export async function exportAuditLogs(filters?: {
  dateFrom?: string
  dateTo?: string
  userId?: number
  entityType?: string
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(auditLogs.tenantId, tenantId)]
  if (filters?.dateFrom && filters?.dateTo) {
    conditions.push(
      between(auditLogs.createdAt, new Date(filters.dateFrom), new Date(filters.dateTo))
    )
  }
  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId))
  }
  if (filters?.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType as any))
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
    .limit(10000)

  return {
    success: true,
    data: data.map((d) => ({
      id: d.log.id,
      action: d.log.action,
      entityType: d.log.entityType,
      entityId: d.log.entityId,
      userName: d.userName,
      oldValues: d.log.oldValues,
      newValues: d.log.newValues,
      createdAt: d.log.createdAt,
    })),
  }
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
