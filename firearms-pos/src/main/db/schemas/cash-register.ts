import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { branches } from './branches'
import { users } from './users'

// Cash Register Sessions - tracks daily opening/closing cash balances
export const cashRegisterSessions = sqliteTable(
  'cash_register_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    sessionDate: text('session_date').notNull(), // YYYY-MM-DD format
    openingBalance: real('opening_balance').notNull().default(0),
    closingBalance: real('closing_balance'), // Set when session is closed
    expectedBalance: real('expected_balance'), // Calculated from transactions
    actualBalance: real('actual_balance'), // Counted cash
    variance: real('variance'), // Difference between expected and actual
    status: text('status', { enum: ['open', 'closed', 'reconciled'] })
      .notNull()
      .default('open'),
    openedBy: integer('opened_by')
      .notNull()
      .references(() => users.id),
    closedBy: integer('closed_by').references(() => users.id),
    reconciledBy: integer('reconciled_by').references(() => users.id),
    openedAt: text('opened_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    closedAt: text('closed_at'),
    reconciledAt: text('reconciled_at'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    branchDateUnique: unique('cash_session_branch_date_unique').on(table.branchId, table.sessionDate),
    branchIdx: index('cash_session_branch_idx').on(table.branchId),
    dateIdx: index('cash_session_date_idx').on(table.sessionDate),
    statusIdx: index('cash_session_status_idx').on(table.status),
  })
)

// Cash Transactions - tracks all cash movements
export const cashTransactions = sqliteTable(
  'cash_transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: integer('session_id')
      .notNull()
      .references(() => cashRegisterSessions.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    transactionType: text('transaction_type', {
      enum: [
        'sale', // Cash from sales
        'refund', // Cash refunds
        'expense', // Cash expenses
        'ar_collection', // Cash collected from receivables
        'ap_payment', // Cash paid for payables
        'deposit', // Cash deposited to bank
        'withdrawal', // Cash withdrawn from bank
        'adjustment', // Manual adjustments
        'petty_cash_in', // Petty cash added
        'petty_cash_out', // Petty cash removed
      ],
    }).notNull(),
    amount: real('amount').notNull(), // Positive for inflow, negative for outflow
    referenceType: text('reference_type'), // 'sale', 'expense', 'receivable', 'payable', etc.
    referenceId: integer('reference_id'), // ID of the related record
    description: text('description'),
    recordedBy: integer('recorded_by')
      .notNull()
      .references(() => users.id),
    transactionDate: text('transaction_date')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    sessionIdx: index('cash_tx_session_idx').on(table.sessionId),
    branchIdx: index('cash_tx_branch_idx').on(table.branchId),
    typeIdx: index('cash_tx_type_idx').on(table.transactionType),
    dateIdx: index('cash_tx_date_idx').on(table.transactionDate),
  })
)

// Relations
export const cashRegisterSessionsRelations = relations(cashRegisterSessions, ({ one, many }) => ({
  branch: one(branches, {
    fields: [cashRegisterSessions.branchId],
    references: [branches.id],
  }),
  openedByUser: one(users, {
    fields: [cashRegisterSessions.openedBy],
    references: [users.id],
    relationName: 'openedBy',
  }),
  closedByUser: one(users, {
    fields: [cashRegisterSessions.closedBy],
    references: [users.id],
    relationName: 'closedBy',
  }),
  reconciledByUser: one(users, {
    fields: [cashRegisterSessions.reconciledBy],
    references: [users.id],
    relationName: 'reconciledBy',
  }),
  transactions: many(cashTransactions),
}))

export const cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
  session: one(cashRegisterSessions, {
    fields: [cashTransactions.sessionId],
    references: [cashRegisterSessions.id],
  }),
  branch: one(branches, {
    fields: [cashTransactions.branchId],
    references: [branches.id],
  }),
  recordedByUser: one(users, {
    fields: [cashTransactions.recordedBy],
    references: [users.id],
  }),
}))

export type CashRegisterSession = typeof cashRegisterSessions.$inferSelect
export type NewCashRegisterSession = typeof cashRegisterSessions.$inferInsert
export type CashTransaction = typeof cashTransactions.$inferSelect
export type NewCashTransaction = typeof cashTransactions.$inferInsert
