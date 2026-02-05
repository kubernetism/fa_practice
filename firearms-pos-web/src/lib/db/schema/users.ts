import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { branches } from './branches'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  username: text('username').notNull(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  role: text('role', { enum: ['admin', 'manager', 'cashier'] })
    .notNull()
    .default('cashier'),
  permissions: jsonb('permissions').default([]),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  branchId: integer('branch_id').references(() => branches.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
