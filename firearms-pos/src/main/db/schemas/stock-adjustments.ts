import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { branches } from './branches'
import { users } from './users'

export const stockAdjustments = sqliteTable('stock_adjustments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  adjustmentType: text('adjustment_type', {
    enum: ['add', 'remove', 'damage', 'theft', 'correction', 'expired'],
  }).notNull(),
  quantityBefore: integer('quantity_before').notNull(),
  quantityChange: integer('quantity_change').notNull(),
  quantityAfter: integer('quantity_after').notNull(),
  serialNumber: text('serial_number'),
  reason: text('reason').notNull(),
  reference: text('reference'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
