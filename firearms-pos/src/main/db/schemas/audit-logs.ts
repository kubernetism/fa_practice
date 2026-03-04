import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { branches } from './branches'

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  branchId: integer('branch_id').references(() => branches.id),
  action: text('action', {
    enum: [
      'create',
      'update',
      'delete',
      'login',
      'logout',
      'void',
      'refund',
      'adjustment',
      'transfer',
      'export',
      'view',
      'reversal_request',
      'reversal_review',
      'reversal_executed',
      'reversal_failed',
    ],
  }).notNull(),
  entityType: text('entity_type', {
    enum: [
      'user',
      'branch',
      'category',
      'product',
      'inventory',
      'customer',
      'supplier',
      'sale',
      'purchase',
      'return',
      'expense',
      'commission',
      'setting',
      'auth',
      'reversal_request',
    ],
  }).notNull(),
  entityId: integer('entity_id'),
  oldValues: text('old_values', { mode: 'json' }).$type<Record<string, unknown>>(),
  newValues: text('new_values', { mode: 'json' }).$type<Record<string, unknown>>(),
  description: text('description'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
