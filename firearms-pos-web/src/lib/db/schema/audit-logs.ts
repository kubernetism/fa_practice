import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { users } from './users'
import { branches } from './branches'

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
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
    ],
  }).notNull(),
  entityId: integer('entity_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  description: text('description'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
