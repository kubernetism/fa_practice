import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sales, saleItems } from './sales'
import { customers } from './customers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const returns = sqliteTable('returns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnNumber: text('return_number').notNull().unique(),
  originalSaleId: integer('original_sale_id')
    .notNull()
    .references(() => sales.id),
  customerId: integer('customer_id').references(() => customers.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  returnType: text('return_type', { enum: ['refund', 'exchange', 'store_credit'] })
    .notNull()
    .default('refund'),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
  refundMethod: text('refund_method', { enum: ['cash', 'card', 'store_credit'] }),
  refundAmount: real('refund_amount').notNull().default(0),
  reason: text('reason'),
  notes: text('notes'),
  returnDate: text('return_date')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const returnItems = sqliteTable('return_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnId: integer('return_id')
    .notNull()
    .references(() => returns.id),
  saleItemId: integer('sale_item_id')
    .notNull()
    .references(() => saleItems.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  serialNumber: text('serial_number'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  condition: text('condition', { enum: ['new', 'good', 'fair', 'damaged'] })
    .notNull()
    .default('good'),
  restockable: integer('restockable', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Return = typeof returns.$inferSelect
export type NewReturn = typeof returns.$inferInsert
export type ReturnItem = typeof returnItems.$inferSelect
export type NewReturnItem = typeof returnItems.$inferInsert
