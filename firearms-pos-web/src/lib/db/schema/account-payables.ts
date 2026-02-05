import { pgTable, serial, text, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { suppliers } from './suppliers'
import { purchases } from './purchases'
import { branches } from './branches'
import { users } from './users'

export const accountPayables = pgTable(
  'account_payables',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    supplierId: integer('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    purchaseId: integer('purchase_id').references(() => purchases.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    invoiceNumber: text('invoice_number').notNull(),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    remainingAmount: numeric('remaining_amount', { precision: 12, scale: 2 }).notNull(),
    status: text('status', {
      enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    })
      .notNull()
      .default('pending'),
    dueDate: timestamp('due_date'),
    paymentTerms: text('payment_terms'),
    notes: text('notes'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('payables_supplier_idx').on(table.supplierId),
    index('payables_status_idx').on(table.status),
    index('payables_branch_idx').on(table.branchId),
    index('payables_due_date_idx').on(table.dueDate),
  ]
)

export const payablePayments = pgTable(
  'payable_payments',
  {
    id: serial('id').primaryKey(),
    payableId: integer('payable_id')
      .notNull()
      .references(() => accountPayables.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'card', 'bank_transfer', 'cheque', 'mobile'],
    })
      .notNull()
      .default('bank_transfer'),
    referenceNumber: text('reference_number'),
    notes: text('notes'),
    paidBy: integer('paid_by').references(() => users.id),
    paymentDate: timestamp('payment_date').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('payable_payments_payable_idx').on(table.payableId),
    index('payable_payments_date_idx').on(table.paymentDate),
  ]
)
