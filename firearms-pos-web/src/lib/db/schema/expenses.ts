import { pgTable, serial, text, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { branches } from './branches'
import { users } from './users'
import { suppliers } from './suppliers'

export const expenses = pgTable(
  'expenses',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
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
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    description: text('description'),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'card', 'check', 'transfer'],
    })
      .notNull()
      .default('cash'),
    reference: text('reference'),
    expenseDate: timestamp('expense_date').notNull().defaultNow(),
    paymentStatus: text('payment_status', {
      enum: ['paid', 'unpaid'],
    })
      .notNull()
      .default('paid'),
    supplierId: integer('supplier_id').references(() => suppliers.id),
    payableId: integer('payable_id'),
    dueDate: timestamp('due_date'),
    paymentTerms: text('payment_terms'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('expenses_payment_status_idx').on(table.paymentStatus),
    index('expenses_supplier_idx').on(table.supplierId),
    index('expenses_payable_idx').on(table.payableId),
  ]
)
