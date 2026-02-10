'use server'

import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { auth } from '@/lib/auth/config'

type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'void'
  | 'refund'
  | 'adjustment'
  | 'transfer'
  | 'export'
  | 'view'

type EntityType =
  | 'user'
  | 'branch'
  | 'category'
  | 'product'
  | 'inventory'
  | 'customer'
  | 'supplier'
  | 'sale'
  | 'purchase'
  | 'return'
  | 'expense'
  | 'commission'
  | 'setting'
  | 'auth'

interface AuditLogInput {
  action: AuditAction
  entityType: EntityType
  entityId?: number
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  description?: string
}

/**
 * Create an audit log entry. Runs in a non-blocking try/catch
 * so it never disrupts the main action flow.
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    const session = await auth()
    const tenantId = (session as any)?.tenantId
    if (!tenantId) return

    const userId = session?.user?.id ? Number(session.user.id) : null
    const branchId = (session as any)?.branchId ?? null

    await db.insert(auditLogs).values({
      tenantId,
      userId,
      branchId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      oldValues: input.oldValues ?? null,
      newValues: input.newValues ?? null,
      description: input.description ?? null,
    })
  } catch (e) {
    console.error('Audit log creation failed:', e)
  }
}

/** Convenience: log a create action */
export async function logCreate(entityType: EntityType, entityId: number, newValues?: Record<string, any>) {
  await createAuditLog({ action: 'create', entityType, entityId, newValues })
}

/** Convenience: log an update action */
export async function logUpdate(entityType: EntityType, entityId: number, oldValues?: Record<string, any>, newValues?: Record<string, any>) {
  await createAuditLog({ action: 'update', entityType, entityId, oldValues, newValues })
}

/** Convenience: log a delete action */
export async function logDelete(entityType: EntityType, entityId: number, oldValues?: Record<string, any>) {
  await createAuditLog({ action: 'delete', entityType, entityId, oldValues })
}

/** Convenience: log a login event */
export async function logLogin(userId: number) {
  await createAuditLog({ action: 'login', entityType: 'auth', entityId: userId, description: 'User logged in' })
}

/** Convenience: log a logout event */
export async function logLogout(userId: number) {
  await createAuditLog({ action: 'logout', entityType: 'auth', entityId: userId, description: 'User logged out' })
}

/** Convenience: log a void/refund action */
export async function logRefund(entityId: number, description?: string) {
  await createAuditLog({ action: 'refund', entityType: 'return', entityId, description })
}

/** Convenience: log a stock adjustment */
export async function logAdjustment(entityId: number, description?: string) {
  await createAuditLog({ action: 'adjustment', entityType: 'inventory', entityId, description })
}
