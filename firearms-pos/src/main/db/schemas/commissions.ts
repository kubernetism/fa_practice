import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sales } from './sales'
import { users } from './users'
import { branches } from './branches'

export const commissions = sqliteTable('commissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  commissionType: text('commission_type', { enum: ['sale', 'referral', 'bonus'] })
    .notNull()
    .default('sale'),
  baseAmount: real('base_amount').notNull(),
  rate: real('rate').notNull(),
  commissionAmount: real('commission_amount').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'paid', 'cancelled'] })
    .notNull()
    .default('pending'),
  paidDate: text('paid_date'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Commission = typeof commissions.$inferSelect
export type NewCommission = typeof commissions.$inferInsert
