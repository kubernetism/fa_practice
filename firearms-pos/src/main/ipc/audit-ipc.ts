import { ipcMain } from 'electron'
import { eq, and, desc, sql, between, gte, lte, like, or, inArray } from 'drizzle-orm'
import { getDatabase } from '../db'
import { auditLogs, users, branches, type NewAuditLog } from '../db/schema'
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
        searchQuery?: string
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
          searchQuery,
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

        // Search query across multiple fields
        if (searchQuery) {
          const searchTerm = `%${searchQuery}%`
          conditions.push(
            or(
              like(users.fullName, searchTerm),
              like(users.username, searchTerm),
              like(auditLogs.action, searchTerm),
              like(auditLogs.entityType, searchTerm),
              like(auditLogs.description, searchTerm)
            )
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(whereClause)

        const total = countResult[0].count

        const data = await db
          .select({
            auditLog: auditLogs,
            user: {
              id: users.id,
              fullName: users.fullName,
              username: users.username,
              role: users.role,
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

  // Get audit statistics
  ipcMain.handle(
    'audit:get-stats',
    async (
      _,
      params?: {
        branchId?: number
        startDate?: string
        endDate?: string
      }
    ) => {
      try {
        const { branchId, startDate, endDate } = params || {}

        const conditions = []
        if (branchId) conditions.push(eq(auditLogs.branchId, branchId))
        if (startDate && endDate) {
          conditions.push(between(auditLogs.createdAt, startDate, endDate))
        } else if (startDate) {
          conditions.push(gte(auditLogs.createdAt, startDate))
        } else if (endDate) {
          conditions.push(lte(auditLogs.createdAt, endDate))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Total logs count
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(whereClause)
        const totalLogs = totalResult[0].count || 0

        // Today's logs count
        const today = new Date().toISOString().split('T')[0]
        const todayResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(eq(auditLogs.createdAt, today))
        const todayLogs = todayResult[0].count || 0

        // Actions breakdown
        const actionStats = await db
          .select({
            action: auditLogs.action,
            count: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .where(whereClause)
          .groupBy(auditLogs.action)
          .orderBy(desc(sql`count(*)`))

        // Category breakdown
        const categoryStats = await db
          .select({
            entityType: auditLogs.entityType,
            count: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .where(whereClause)
          .groupBy(auditLogs.entityType)
          .orderBy(desc(sql`count(*)`))

        // Most active users
        const activeUsers = await db
          .select({
            userId: auditLogs.userId,
            fullName: users.fullName,
            username: users.username,
            count: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(whereClause)
          .groupBy(auditLogs.userId, users.fullName, users.username)
          .orderBy(desc(sql`count(*)`))
          .limit(10)

        // Critical events (delete, void, refund actions)
        const criticalEvents = await db
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
              whereClause,
              inArray(auditLogs.action, ['delete', 'void', 'refund'] as const[])
            )
          )
          .orderBy(desc(auditLogs.createdAt))
          .limit(20)

        // Recent logs (last 7 days summary)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const dailyActivity = await db
          .select({
            date: sql<string>`date(${auditLogs.createdAt})`,
            count: sql<number>`count(*)`,
          })
          .from(auditLogs)
          .where(gte(auditLogs.createdAt, sevenDaysAgo.toISOString()))
          .groupBy(sql`date(${auditLogs.createdAt})`)
          .orderBy(desc(sql`date(${auditLogs.createdAt})`))

        return {
          success: true,
          data: {
            totalLogs,
            todayLogs,
            actionStats,
            categoryStats,
            activeUsers,
            criticalEvents,
            dailyActivity,
          },
        }
      } catch (error) {
        console.error('Get audit stats error:', error)
        return { success: false, message: 'Failed to fetch audit statistics' }
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
            role: users.role,
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
        action?: string
        entityType?: string
        searchQuery?: string
        format?: 'json' | 'csv'
      }
    ) => {
      try {
        const { startDate, endDate, branchId, action, entityType, searchQuery, format = 'json' } = params

        const conditions = [between(auditLogs.createdAt, startDate, endDate)]
        if (branchId) conditions.push(eq(auditLogs.branchId, branchId))
        if (action) conditions.push(eq(auditLogs.action, action as NewAuditLog['action']))
        if (entityType) conditions.push(eq(auditLogs.entityType, entityType as NewAuditLog['entityType']))
        if (searchQuery) {
          const searchTerm = `%${searchQuery}%`
          conditions.push(
            or(
              like(users.fullName, searchTerm),
              like(users.username, searchTerm),
              like(auditLogs.description, searchTerm)
            )
          )
        }

        const data = await db
          .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            branchId: auditLogs.branchId,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            description: auditLogs.description,
            oldValues: auditLogs.oldValues,
            newValues: auditLogs.newValues,
            createdAt: auditLogs.createdAt,
            username: users.username,
            userFullName: users.fullName,
            userRole: users.role,
            branchName: branches.name,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .leftJoin(branches, eq(auditLogs.branchId, branches.id))
          .where(and(...conditions))
          .orderBy(desc(auditLogs.createdAt))

        if (format === 'csv') {
          const headers = [
            'ID',
            'Date',
            'User',
            'Role',
            'Action',
            'Entity Type',
            'Entity ID',
            'Branch',
            'Description',
          ]
          const rows = data.map((row) => [
            row.id,
            row.createdAt,
            row.userFullName || row.username || 'System',
            row.userRole || '',
            row.action,
            row.entityType,
            row.entityId?.toString() || '',
            row.branchName || '',
            row.description?.replace(/,/g, ';') || '',
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
