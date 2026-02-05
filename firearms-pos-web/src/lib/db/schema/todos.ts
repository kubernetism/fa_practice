import { pgTable, serial, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { users } from './users'
import { branches } from './branches'

export const todos = pgTable(
  'todos',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    })
      .notNull()
      .default('pending'),
    priority: text('priority', {
      enum: ['low', 'medium', 'high', 'urgent'],
    })
      .notNull()
      .default('medium'),
    dueDate: timestamp('due_date'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    assignedTo: integer('assigned_to')
      .notNull()
      .references(() => users.id),
    assignedToRole: text('assigned_to_role', {
      enum: ['admin', 'manager', 'cashier'],
    }).notNull(),
    branchId: integer('branch_id').references(() => branches.id),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('todos_assigned_to_idx').on(table.assignedTo),
    index('todos_status_idx').on(table.status),
    index('todos_created_by_idx').on(table.createdBy),
    index('todos_branch_idx').on(table.branchId),
  ]
)
