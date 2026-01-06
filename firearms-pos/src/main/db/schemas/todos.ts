import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { branches } from './branches'

export const todos = sqliteTable(
  'todos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['pending', 'in_progress', 'completed', 'cancelled'] })
      .notNull()
      .default('pending'),
    priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] })
      .notNull()
      .default('medium'),
    dueDate: text('due_date'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    assignedTo: integer('assigned_to')
      .notNull()
      .references(() => users.id),
    assignedToRole: text('assigned_to_role', { enum: ['admin', 'manager', 'cashier'] })
      .notNull(),
    branchId: integer('branch_id').references(() => branches.id),
    completedAt: text('completed_at'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    assignedToIdx: index('todos_assigned_to_idx').on(table.assignedTo),
    assignedToRoleIdx: index('todos_assigned_to_role_idx').on(table.assignedToRole),
    statusIdx: index('todos_status_idx').on(table.status),
    createdByIdx: index('todos_created_by_idx').on(table.createdBy),
    branchIdx: index('todos_branch_idx').on(table.branchId),
  })
)

export const todosRelations = relations(todos, ({ one }) => ({
  creator: one(users, {
    fields: [todos.createdBy],
    references: [users.id],
    relationName: 'todoCreator',
  }),
  assignee: one(users, {
    fields: [todos.assignedTo],
    references: [users.id],
    relationName: 'todoAssignee',
  }),
  branch: one(branches, {
    fields: [todos.branchId],
    references: [branches.id],
  }),
}))

export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
