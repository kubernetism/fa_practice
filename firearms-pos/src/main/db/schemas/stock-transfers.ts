import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { branches } from './branches'
import { users } from './users'

export const stockTransfers = sqliteTable('stock_transfers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transferNumber: text('transfer_number').notNull().unique(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  fromBranchId: integer('from_branch_id')
    .notNull()
    .references(() => branches.id),
  toBranchId: integer('to_branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  quantity: integer('quantity').notNull(),
  serialNumbers: text('serial_numbers', { mode: 'json' }).$type<string[]>().default([]),
  status: text('status', { enum: ['pending', 'in_transit', 'completed', 'cancelled'] })
    .notNull()
    .default('pending'),
  notes: text('notes'),
  transferDate: text('transfer_date')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  receivedDate: text('received_date'),
  receivedBy: integer('received_by').references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type StockTransfer = typeof stockTransfers.$inferSelect
export type NewStockTransfer = typeof stockTransfers.$inferInsert
