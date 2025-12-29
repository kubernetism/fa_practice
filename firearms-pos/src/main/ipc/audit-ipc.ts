import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import { auditLogs, users, type NewAuditLog } from '../db/schema'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerAuditHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'audit:get-logs',
    async (
      _,
      params: PaginationParams & {
        userId?: number
        branchId?: number
        action?: string
        entityType?: string
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const {
          page = 1,
          limit = 50,
          sortOrder = 'desc',
          userId,
          branchId,
          action,
          entityType,
          startDate,
          endDate,
        } = params

        const conditions = []

        if (userId) conditions.push(eq(auditLogs.userId, userId))
        if (branchId) conditions.push(eq(auditLogs.branchId, branchId))
        if (action) conditions.push(eq(auditLogs.action, action as NewAuditLog['action']))
        if (entityType) conditions.push(eq(auditLogs.entityType, entityType as NewAuditLog['entityType']))
        if (startDate && endDate) {
          conditions.push(between(auditLogs.createdAt, startDate, endDate))
        } else if (startDate) {
          conditions.push(gte(auditLogs.createdAt, startDate))
        } else if (endDate) {
          conditions.push(lte(auditLogs.createdAt, endDate))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(whereClause)

        const total = countResult[0].count

        const data = await db
          .select({
            auditLog: auditLogs,
            user: {
              id: users.id,
              fullName: users.fullName,
              username: users.username,
            },
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(whereClause)
          .limit(limit)
          .offset((page - 1) * limit)
          .orderBy(sortOrder === 'desc' ? desc(auditLogs.createdAt) : auditLogs.createdAt)

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get audit logs error:', error)
        return { success: false, message: 'Failed to fetch audit logs' }
      }
    }
  )

  ipcMain.handle('audit:get-by-entity', async (_, entityType: string, entityId: number) => {
    try {
      const data = await db
        .select({
          auditLog: auditLogs,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username,
          },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(
          and(
            eq(auditLogs.entityType, entityType as NewAuditLog['entityType']),
            eq(auditLogs.entityId, entityId)
          )
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(100)

      return { success: true, data }
    } catch (error) {
      console.error('Get entity audit logs error:', error)
      return { success: false, message: 'Failed to fetch entity audit logs' }
    }
  })

  ipcMain.handle(
    'audit:export',
    async (
      _,
      params: {
        startDate: string
        endDate: string
        branchId?: number
        format?: 'json' | 'csv'
      }
    ) => {
      try {
        const { startDate, endDate, branchId, format = 'json' } = params

        const conditions = [between(auditLogs.createdAt, startDate, endDate)]
        if (branchId) conditions.push(eq(auditLogs.branchId, branchId))

        const data = await db
          .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            branchId: auditLogs.branchId,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            description: auditLogs.description,
            createdAt: auditLogs.createdAt,
            username: users.username,
            userFullName: users.fullName,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(and(...conditions))
          .orderBy(desc(auditLogs.createdAt))

        if (format === 'csv') {
          const headers = [
            'ID',
            'Date',
            'User',
            'Action',
            'Entity Type',
            'Entity ID',
            'Description',
            'Branch ID',
          ]
          const rows = data.map((row) => [
            row.id,
            row.createdAt,
            row.userFullName || row.username || 'System',
            row.action,
            row.entityType,
            row.entityId ?? '',
            row.description ?? '',
            row.branchId ?? '',
          ])

          const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

          return { success: true, data: csvContent, format: 'csv' }
        }

        return { success: true, data, format: 'json' }
      } catch (error) {
        console.error('Export audit logs error:', error)
        return { success: false, message: 'Failed to export audit logs' }
      }
    }
  )
}
