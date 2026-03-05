import { ipcMain } from 'electron'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { getDatabase } from '../db'
import { reversalRequests } from '../db/schema'
import { withTransaction } from '../utils/db-transaction'
import { handleIpcError } from '../utils/error-handling'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { generateReversalNumber } from '../utils/gl-posting'
import { executeReversal } from '../utils/reversal-executors'

export function registerReversalHandlers(): void {
  const db = getDatabase()

  // ─── Create Reversal Request ──────────────────────────────────────────────

  ipcMain.handle(
    'reversal:create',
    async (
      _,
      data: {
        entityType: string
        entityId: number
        reason: string
        priority?: 'low' | 'medium' | 'high' | 'urgent'
        branchId: number
      }
    ) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Not authenticated' }

        // Check for existing active request on same entity
        const existing = await db.query.reversalRequests.findFirst({
          where: and(
            eq(reversalRequests.entityType, data.entityType),
            eq(reversalRequests.entityId, data.entityId),
            inArray(reversalRequests.status, ['pending', 'approved'])
          ),
        })

        if (existing) {
          return {
            success: false,
            message: `An active reversal request (${existing.requestNumber}) already exists for this ${data.entityType}`,
          }
        }

        const requestNumber = await generateReversalNumber()

        const [created] = await db
          .insert(reversalRequests)
          .values({
            requestNumber,
            entityType: data.entityType,
            entityId: data.entityId,
            reason: data.reason,
            priority: data.priority || 'medium',
            status: 'pending',
            requestedBy: session.userId,
            branchId: data.branchId,
          })
          .returning()

        await createAuditLog({
          userId: session.userId,
          branchId: data.branchId,
          action: 'reversal_request',
          entityType: 'reversal_request',
          entityId: created.id,
          newValues: {
            requestNumber,
            entityType: data.entityType,
            entityId: data.entityId,
            reason: data.reason,
            priority: data.priority || 'medium',
          },
          description: `Created reversal request ${requestNumber} for ${data.entityType} #${data.entityId}`,
        })

        return { success: true, data: created }
      } catch (error) {
        return handleIpcError('Create reversal request', error)
      }
    }
  )

  // ─── List Reversal Requests ───────────────────────────────────────────────

  ipcMain.handle(
    'reversal:list',
    async (
      _,
      params: {
        status?: string
        entityType?: string
        priority?: string
        branchId?: number
        page?: number
        limit?: number
      } = {}
    ) => {
      try {
        const { page = 1, limit = 20, status, entityType, priority, branchId } = params

        const conditions = []

        if (status) conditions.push(eq(reversalRequests.status, status))
        if (entityType) conditions.push(eq(reversalRequests.entityType, entityType))
        if (priority) conditions.push(eq(reversalRequests.priority, priority))
        if (branchId) conditions.push(eq(reversalRequests.branchId, branchId))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(reversalRequests)
          .where(whereClause)

        const total = countResult[0].count

        const data = await db.query.reversalRequests.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: desc(reversalRequests.createdAt),
          with: {
            requestedByUser: true,
            reviewedByUser: true,
            branch: true,
          },
        })

        return {
          success: true,
          data,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        }
      } catch (error) {
        return handleIpcError('List reversal requests', error)
      }
    }
  )

  // ─── Get Single Reversal Request ──────────────────────────────────────────

  ipcMain.handle('reversal:get', async (_, id: number) => {
    try {
      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
        with: {
          requestedByUser: true,
          reviewedByUser: true,
          branch: true,
        },
      })

      if (!request) {
        return { success: false, message: `Reversal request #${id} not found` }
      }

      return { success: true, data: request }
    } catch (error) {
      return handleIpcError('Get reversal request', error)
    }
  })

  // ─── Approve and Execute Reversal ─────────────────────────────────────────

  ipcMain.handle('reversal:approve', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
      })

      if (!request) {
        return { success: false, message: `Reversal request #${id} not found` }
      }
      if (request.status !== 'pending') {
        return {
          success: false,
          message: `Cannot approve: request is '${request.status}', not 'pending'`,
        }
      }

      const now = new Date().toISOString()

      // Mark as approved
      await db
        .update(reversalRequests)
        .set({
          status: 'approved',
          reviewedBy: session.userId,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(reversalRequests.id, id))

      // Execute the reversal inside a transaction
      try {
        const result = await withTransaction(async () => {
          return executeReversal(request.entityType, request.entityId, session.userId)
        })

        // Update to completed
        await db
          .update(reversalRequests)
          .set({
            status: 'completed',
            reversalDetails: result.reversalDetails,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: request.branchId,
          action: 'reversal_executed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: { status: 'completed', reversalDetails: result.reversalDetails },
          description: `Approved and executed reversal ${request.requestNumber} for ${request.entityType} #${request.entityId}`,
        })

        return { success: true, data: result.reversalDetails }
      } catch (execError) {
        const errorMessage = execError instanceof Error ? execError.message : String(execError)

        await db
          .update(reversalRequests)
          .set({
            status: 'failed',
            errorDetails: errorMessage,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: request.branchId,
          action: 'reversal_failed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: { status: 'failed', errorDetails: errorMessage },
          description: `Reversal ${request.requestNumber} failed: ${errorMessage}`,
        })

        return { success: false, message: `Reversal execution failed: ${errorMessage}` }
      }
    } catch (error) {
      return handleIpcError('Approve reversal request', error)
    }
  })

  // ─── Reject Reversal Request ──────────────────────────────────────────────

  ipcMain.handle(
    'reversal:reject',
    async (_, data: { id: number; rejectionReason: string }) => {
      try {
        const session = getCurrentSession()
        if (!session) return { success: false, message: 'Not authenticated' }

        const request = await db.query.reversalRequests.findFirst({
          where: eq(reversalRequests.id, data.id),
        })

        if (!request) {
          return { success: false, message: `Reversal request #${data.id} not found` }
        }
        if (request.status !== 'pending') {
          return {
            success: false,
            message: `Cannot reject: request is '${request.status}', not 'pending'`,
          }
        }

        const now = new Date().toISOString()

        await db
          .update(reversalRequests)
          .set({
            status: 'rejected',
            rejectionReason: data.rejectionReason,
            reviewedBy: session.userId,
            reviewedAt: now,
            updatedAt: now,
          })
          .where(eq(reversalRequests.id, data.id))

        await createAuditLog({
          userId: session.userId,
          branchId: request.branchId,
          action: 'reversal_review',
          entityType: 'reversal_request',
          entityId: data.id,
          newValues: { status: 'rejected', rejectionReason: data.rejectionReason },
          description: `Rejected reversal ${request.requestNumber}: ${data.rejectionReason}`,
        })

        return { success: true, message: 'Reversal request rejected' }
      } catch (error) {
        return handleIpcError('Reject reversal request', error)
      }
    }
  )

  // ─── Retry Failed Reversal ────────────────────────────────────────────────

  ipcMain.handle('reversal:retry', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
      })

      if (!request) {
        return { success: false, message: `Reversal request #${id} not found` }
      }
      if (request.status !== 'failed') {
        return {
          success: false,
          message: `Only failed requests can be retried (current: '${request.status}')`,
        }
      }

      // Reset to approved
      await db
        .update(reversalRequests)
        .set({
          status: 'approved',
          errorDetails: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reversalRequests.id, id))

      try {
        const result = await withTransaction(async () => {
          return executeReversal(request.entityType, request.entityId, session.userId)
        })

        await db
          .update(reversalRequests)
          .set({
            status: 'completed',
            reversalDetails: result.reversalDetails,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: request.branchId,
          action: 'reversal_executed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: { status: 'completed', reversalDetails: result.reversalDetails },
          description: `Retried and completed reversal ${request.requestNumber}`,
        })

        return { success: true, data: result.reversalDetails }
      } catch (execError) {
        const errorMessage = execError instanceof Error ? execError.message : String(execError)

        await db
          .update(reversalRequests)
          .set({
            status: 'failed',
            errorDetails: errorMessage,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        return { success: false, message: `Reversal retry failed: ${errorMessage}` }
      }
    } catch (error) {
      return handleIpcError('Retry reversal request', error)
    }
  })

  // ─── Dashboard Stats ──────────────────────────────────────────────────────

  ipcMain.handle('reversal:stats', async () => {
    try {
      const statusCounts = await db
        .select({ status: reversalRequests.status, count: sql<number>`count(*)` })
        .from(reversalRequests)
        .groupBy(reversalRequests.status)

      const pendingByType = await db
        .select({ entityType: reversalRequests.entityType, count: sql<number>`count(*)` })
        .from(reversalRequests)
        .where(eq(reversalRequests.status, 'pending'))
        .groupBy(reversalRequests.entityType)

      const pendingByPriority = await db
        .select({ priority: reversalRequests.priority, count: sql<number>`count(*)` })
        .from(reversalRequests)
        .where(eq(reversalRequests.status, 'pending'))
        .groupBy(reversalRequests.priority)

      return {
        success: true,
        data: {
          byStatus: Object.fromEntries(statusCounts.map((s) => [s.status, s.count])),
          pendingByType: Object.fromEntries(pendingByType.map((t) => [t.entityType, t.count])),
          pendingByPriority: Object.fromEntries(pendingByPriority.map((p) => [p.priority, p.count])),
        },
      }
    } catch (error) {
      return handleIpcError('Get reversal stats', error)
    }
  })

  // ─── Check Entity Reversal Status ─────────────────────────────────────────

  ipcMain.handle(
    'reversal:check',
    async (_, data: { entityType: string; entityId: number }) => {
      try {
        const request = await db.query.reversalRequests.findFirst({
          where: and(
            eq(reversalRequests.entityType, data.entityType),
            eq(reversalRequests.entityId, data.entityId)
          ),
          orderBy: desc(reversalRequests.createdAt),
        })

        return { success: true, data: request || null }
      } catch (error) {
        return handleIpcError('Check reversal status', error)
      }
    }
  )
}
