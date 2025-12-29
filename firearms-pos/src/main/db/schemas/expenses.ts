import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { branches } from './branches'
import { users } from './users'

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  category: text('category', {
    enum: ['rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'marketing', 'other'],
  })
    .notNull()
    .default('other'),
  amount: real('amount').notNull(),
  description: text('description'),
  paymentMethod: text('payment_method', { enum: ['cash', 'card', 'check', 'transfer'] })
    .notNull()
    .default('cash'),
  reference: text('reference'),
  expenseDate: text('expense_date')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
