import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { branches } from './branches'
import { users } from './users'
import { payees } from './payees'
import { accountPayables } from './account-payables'
import { categories } from './categories'

export const expenses = sqliteTable(
  'expenses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
    amount: real('amount').notNull(),
    description: text('description'),
    paymentMethod: text('payment_method', { enum: ['cash', 'card', 'check', 'transfer'] })
      .notNull()
      .default('cash'),
    reference: text('reference'),
    expenseDate: text('expense_date')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    // New fields for unpaid expense tracking
    paymentStatus: text('payment_status', { enum: ['paid', 'unpaid'] })
      .notNull()
      .default('paid'),
    payeeId: integer('payee_id').references(() => payees.id),
    payableId: integer('payable_id').references(() => accountPayables.id),
    dueDate: text('due_date'),
    paymentTerms: text('payment_terms'),
    isVoided: integer('is_voided', { mode: 'boolean' }).notNull().default(false),
    voidReason: text('void_reason'),
    isReversed: integer('is_reversed', { mode: 'boolean' }).notNull().default(false),
    reversalExpenseId: integer('reversal_expense_id'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    paymentStatusIdx: index('expenses_payment_status_idx').on(table.paymentStatus),
    payeeIdx: index('expenses_payee_idx').on(table.payeeId),
    payableIdx: index('expenses_payable_idx').on(table.payableId),
  })
)

// Relations
export const expensesRelations = relations(expenses, ({ one }) => ({
  branch: one(branches, {
    fields: [expenses.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  payee: one(payees, {
    fields: [expenses.payeeId],
    references: [payees.id],
  }),
  payable: one(accountPayables, {
    fields: [expenses.payableId],
    references: [accountPayables.id],
  }),
}))

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
