import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { customers } from './customers'
import { sales } from './sales'
import { branches } from './branches'
import { users } from './users'

// Account Receivables - tracks unpaid amounts from customers
export const accountReceivables = sqliteTable(
  'account_receivables',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    saleId: integer('sale_id').references(() => sales.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    invoiceNumber: text('invoice_number').notNull(),
    totalAmount: real('total_amount').notNull(), // Original amount owed
    paidAmount: real('paid_amount').notNull().default(0), // Amount paid so far
    remainingAmount: real('remaining_amount').notNull(), // Amount still owed
    status: text('status', { enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'] })
      .notNull()
      .default('pending'),
    dueDate: text('due_date'), // Optional due date for payment
    notes: text('notes'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    customerIdx: index('receivables_customer_idx').on(table.customerId),
    statusIdx: index('receivables_status_idx').on(table.status),
    branchIdx: index('receivables_branch_idx').on(table.branchId),
    dueDateIdx: index('receivables_due_date_idx').on(table.dueDate),
  })
)

// Payments made against receivables
export const receivablePayments = sqliteTable(
  'receivable_payments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    receivableId: integer('receivable_id')
      .notNull()
      .references(() => accountReceivables.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'card', 'mobile', 'bank_transfer', 'cheque'],
    })
      .notNull()
      .default('cash'),
    referenceNumber: text('reference_number'), // Cheque number, transaction ID, etc.
    notes: text('notes'),
    receivedBy: integer('received_by').references(() => users.id),
    paymentDate: text('payment_date')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    receivableIdx: index('payments_receivable_idx').on(table.receivableId),
    dateIdx: index('payments_date_idx').on(table.paymentDate),
  })
)

// Relations
export const accountReceivablesRelations = relations(accountReceivables, ({ one, many }) => ({
  customer: one(customers, {
    fields: [accountReceivables.customerId],
    references: [customers.id],
  }),
  sale: one(sales, {
    fields: [accountReceivables.saleId],
    references: [sales.id],
  }),
  branch: one(branches, {
    fields: [accountReceivables.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [accountReceivables.createdBy],
    references: [users.id],
  }),
  payments: many(receivablePayments),
}))

export const receivablePaymentsRelations = relations(receivablePayments, ({ one }) => ({
  receivable: one(accountReceivables, {
    fields: [receivablePayments.receivableId],
    references: [accountReceivables.id],
  }),
  receivedByUser: one(users, {
    fields: [receivablePayments.receivedBy],
    references: [users.id],
  }),
}))

export type AccountReceivable = typeof accountReceivables.$inferSelect
export type NewAccountReceivable = typeof accountReceivables.$inferInsert
export type ReceivablePayment = typeof receivablePayments.$inferSelect
export type NewReceivablePayment = typeof receivablePayments.$inferInsert
