import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { suppliers } from './suppliers'
import { purchases } from './purchases'
import { branches } from './branches'
import { users } from './users'
import { payees } from './payees'

// Account Payables - tracks unpaid amounts to suppliers
export const accountPayables = sqliteTable(
  'account_payables',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    supplierId: integer('supplier_id').references(() => suppliers.id),
    payeeId: integer('payee_id').references(() => payees.id),
    purchaseId: integer('purchase_id').references(() => purchases.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    invoiceNumber: text('invoice_number').notNull(),
    totalAmount: real('total_amount').notNull(), // Original amount owed
    paidAmount: real('paid_amount').notNull().default(0), // Amount paid so far
    remainingAmount: real('remaining_amount').notNull(), // Amount still owed
    status: text('status', { enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled', 'reversed'] })
      .notNull()
      .default('pending'),
    dueDate: text('due_date'), // Payment due date
    paymentTerms: text('payment_terms'), // e.g., "Net 30", "Net 60"
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
    supplierIdx: index('payables_supplier_idx').on(table.supplierId),
    payeeIdx: index('payables_payee_idx').on(table.payeeId),
    statusIdx: index('payables_status_idx').on(table.status),
    branchIdx: index('payables_branch_idx').on(table.branchId),
    dueDateIdx: index('payables_due_date_idx').on(table.dueDate),
  })
)

// Payments made against payables
export const payablePayments = sqliteTable(
  'payable_payments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    payableId: integer('payable_id')
      .notNull()
      .references(() => accountPayables.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'card', 'bank_transfer', 'cheque', 'mobile'],
    })
      .notNull()
      .default('bank_transfer'),
    referenceNumber: text('reference_number'), // Cheque number, transaction ID, etc.
    notes: text('notes'),
    paidBy: integer('paid_by').references(() => users.id),
    paymentDate: text('payment_date')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    payableIdx: index('payable_payments_payable_idx').on(table.payableId),
    dateIdx: index('payable_payments_date_idx').on(table.paymentDate),
  })
)

// Relations
export const accountPayablesRelations = relations(accountPayables, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [accountPayables.supplierId],
    references: [suppliers.id],
  }),
  payee: one(payees, {
    fields: [accountPayables.payeeId],
    references: [payees.id],
  }),
  purchase: one(purchases, {
    fields: [accountPayables.purchaseId],
    references: [purchases.id],
  }),
  branch: one(branches, {
    fields: [accountPayables.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [accountPayables.createdBy],
    references: [users.id],
  }),
  payments: many(payablePayments),
}))

export const payablePaymentsRelations = relations(payablePayments, ({ one }) => ({
  payable: one(accountPayables, {
    fields: [payablePayments.payableId],
    references: [accountPayables.id],
  }),
  paidByUser: one(users, {
    fields: [payablePayments.paidBy],
    references: [users.id],
  }),
}))

export type AccountPayable = typeof accountPayables.$inferSelect
export type NewAccountPayable = typeof accountPayables.$inferInsert
export type PayablePayment = typeof payablePayments.$inferSelect
export type NewPayablePayment = typeof payablePayments.$inferInsert
