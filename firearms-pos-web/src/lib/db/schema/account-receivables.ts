import { pgTable, serial, text, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { customers } from './customers'
import { sales } from './sales'
import { branches } from './branches'
import { users } from './users'

export const accountReceivables = pgTable(
  'account_receivables',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    saleId: integer('sale_id').references(() => sales.id),
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
    notes: text('notes'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('receivables_customer_idx').on(table.customerId),
    index('receivables_status_idx').on(table.status),
    index('receivables_branch_idx').on(table.branchId),
    index('receivables_due_date_idx').on(table.dueDate),
  ]
)

export const receivablePayments = pgTable(
  'receivable_payments',
  {
    id: serial('id').primaryKey(),
    receivableId: integer('receivable_id')
      .notNull()
      .references(() => accountReceivables.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'card', 'mobile', 'bank_transfer', 'cheque'],
    })
      .notNull()
      .default('cash'),
    referenceNumber: text('reference_number'),
    notes: text('notes'),
    receivedBy: integer('received_by').references(() => users.id),
    paymentDate: timestamp('payment_date').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('payments_receivable_idx').on(table.receivableId),
    index('payments_date_idx').on(table.paymentDate),
  ]
)
