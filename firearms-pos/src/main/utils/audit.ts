import { getDatabase } from '../db'
import { auditLogs, type NewAuditLog } from '../db/schema'

type AuditAction = NewAuditLog['action']
type EntityType = NewAuditLog['entityType']

interface AuditLogParams {
  userId?: number | null
  branchId?: number | null
  action: AuditAction
  entityType: EntityType
  entityId?: number | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  description?: string
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const db = getDatabase()

  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      branchId: params.branchId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      description: params.description ?? null,
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break main operations
  }
}

export function sanitizeForAudit<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const sanitized = { ...obj }
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey']
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }
  return sanitized
}
