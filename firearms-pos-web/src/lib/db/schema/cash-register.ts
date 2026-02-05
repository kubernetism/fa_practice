import { pgTable, serial, text, timestamp, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { branches } from './branches'
import { users } from './users'

export const cashRegisterSessions = pgTable(
  'cash_register_sessions',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    sessionDate: text('session_date').notNull(),
    openingBalance: numeric('opening_balance', { precision: 12, scale: 2 }).notNull().default('0'),
    closingBalance: numeric('closing_balance', { precision: 12, scale: 2 }),
    expectedBalance: numeric('expected_balance', { precision: 12, scale: 2 }),
    actualBalance: numeric('actual_balance', { precision: 12, scale: 2 }),
    variance: numeric('variance', { precision: 12, scale: 2 }),
    status: text('status', {
      enum: ['open', 'closed', 'reconciled'],
    })
      .notNull()
      .default('open'),
    openedBy: integer('opened_by')
      .notNull()
      .references(() => users.id),
    closedBy: integer('closed_by').references(() => users.id),
    reconciledBy: integer('reconciled_by').references(() => users.id),
    openedAt: timestamp('opened_at').notNull().defaultNow(),
    closedAt: timestamp('closed_at'),
    reconciledAt: timestamp('reconciled_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('cash_session_branch_date_unique').on(table.branchId, table.sessionDate),
    index('cash_session_branch_idx').on(table.branchId),
    index('cash_session_date_idx').on(table.sessionDate),
    index('cash_session_status_idx').on(table.status),
  ]
)

export const cashTransactions = pgTable(
  'cash_transactions',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    sessionId: integer('session_id')
      .notNull()
      .references(() => cashRegisterSessions.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    transactionType: text('transaction_type', {
      enum: [
        'sale',
        'refund',
        'expense',
        'ar_collection',
        'ap_payment',
        'deposit',
        'withdrawal',
        'adjustment',
        'petty_cash_in',
        'petty_cash_out',
      ],
    }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    referenceType: text('reference_type'),
    referenceId: integer('reference_id'),
    description: text('description'),
    recordedBy: integer('recorded_by')
      .notNull()
      .references(() => users.id),
    transactionDate: timestamp('transaction_date').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('cash_tx_session_idx').on(table.sessionId),
    index('cash_tx_branch_idx').on(table.branchId),
    index('cash_tx_type_idx').on(table.transactionType),
    index('cash_tx_date_idx').on(table.transactionDate),
  ]
)
