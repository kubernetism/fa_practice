import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { sales } from './sales'

export const vouchers = sqliteTable('vouchers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountAmount: real('discount_amount').notNull(),
  expiresAt: text('expires_at'),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  usedAt: text('used_at'),
  usedInSaleId: integer('used_in_sale_id').references(() => sales.id),
  createdBy: integer('created_by').references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Voucher = typeof vouchers.$inferSelect
export type NewVoucher = typeof vouchers.$inferInsert
