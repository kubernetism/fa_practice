import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { branches } from './branches'
import { users } from './users'
import { suppliers } from './suppliers'
import { accountPayables } from './account-payables'

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
    // New fields for unpaid expense tracking
    paymentStatus: text('payment_status', { enum: ['paid', 'unpaid'] })
      .notNull()
      .default('paid'),
    supplierId: integer('supplier_id').references(() => suppliers.id),
    payableId: integer('payable_id').references(() => accountPayables.id),
    dueDate: text('due_date'),
    paymentTerms: text('payment_terms'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    paymentStatusIdx: index('expenses_payment_status_idx').on(table.paymentStatus),
    supplierIdx: index('expenses_supplier_idx').on(table.supplierId),
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
  supplier: one(suppliers, {
    fields: [expenses.supplierId],
    references: [suppliers.id],
  }),
  payable: one(accountPayables, {
    fields: [expenses.payableId],
    references: [accountPayables.id],
  }),
}))

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
