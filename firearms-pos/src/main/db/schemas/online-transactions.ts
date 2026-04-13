import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { sales } from './sales'
import { branches } from './branches'
import { users } from './users'
import { customers } from './customers'
import { accountReceivables } from './account-receivables'
import { accountPayables } from './account-payables'

/**
 * Online Transactions - tracks all non-cash transactions
 * (bank transfer, mobile payment, card, COD, cheque, etc.)
 * Auto-recorded from sales, receivable payments, and payable payments.
 * Also supports manual entry.
 */
export const onlineTransactions = sqliteTable(
  'online_transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    transactionDate: text('transaction_date').notNull(), // YYYY-MM-DD
    amount: real('amount').notNull(),
    paymentChannel: text('payment_channel', {
      enum: ['bank_transfer', 'mobile', 'card', 'cod', 'cheque', 'other'],
    }).notNull(),
    direction: text('direction', {
      enum: ['inflow', 'outflow'],
    })
      .notNull()
      .default('inflow'),
    referenceNumber: text('reference_number'), // Transaction ID, cheque #, etc.
    customerName: text('customer_name'), // Name of payer/payee
    customerId: integer('customer_id').references(() => customers.id),
    invoiceNumber: text('invoice_number'), // Linked invoice
    bankAccountName: text('bank_account_name'), // Bank/wallet/account name
    status: text('status', {
      enum: ['pending', 'confirmed', 'failed'],
    })
      .notNull()
      .default('pending'),
    notes: text('notes'),
    // Source tracking - what created this record
    sourceType: text('source_type', {
      enum: ['sale', 'receivable_payment', 'payable_payment', 'manual'],
    })
      .notNull()
      .default('manual'),
    sourceId: integer('source_id'), // ID of the source record
    saleId: integer('sale_id').references(() => sales.id),
    receivableId: integer('receivable_id').references(() => accountReceivables.id),
    payableId: integer('payable_id').references(() => accountPayables.id),
    // Metadata
    confirmedBy: integer('confirmed_by').references(() => users.id),
    confirmedAt: text('confirmed_at'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    branchIdx: index('online_txn_branch_idx').on(table.branchId),
    dateIdx: index('online_txn_date_idx').on(table.transactionDate),
    channelIdx: index('online_txn_channel_idx').on(table.paymentChannel),
    statusIdx: index('online_txn_status_idx').on(table.status),
    sourceIdx: index('online_txn_source_idx').on(table.sourceType, table.sourceId),
    saleIdx: index('online_txn_sale_idx').on(table.saleId),
  })
)

// Relations
export const onlineTransactionsRelations = relations(onlineTransactions, ({ one }) => ({
  branch: one(branches, {
    fields: [onlineTransactions.branchId],
    references: [branches.id],
  }),
  customer: one(customers, {
    fields: [onlineTransactions.customerId],
    references: [customers.id],
  }),
  sale: one(sales, {
    fields: [onlineTransactions.saleId],
    references: [sales.id],
  }),
  receivable: one(accountReceivables, {
    fields: [onlineTransactions.receivableId],
    references: [accountReceivables.id],
  }),
  payable: one(accountPayables, {
    fields: [onlineTransactions.payableId],
    references: [accountPayables.id],
  }),
  confirmedByUser: one(users, {
    fields: [onlineTransactions.confirmedBy],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [onlineTransactions.createdBy],
    references: [users.id],
  }),
}))

export type OnlineTransaction = typeof onlineTransactions.$inferSelect
export type NewOnlineTransaction = typeof onlineTransactions.$inferInsert
