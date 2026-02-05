import { pgTable, serial, text, boolean, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { sales, saleItems } from './sales'
import { customers } from './customers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const returns = pgTable('returns', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  returnNumber: text('return_number').notNull(),
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
  returnType: text('return_type', {
    enum: ['refund', 'exchange', 'store_credit'],
  })
    .notNull()
    .default('refund'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  refundMethod: text('refund_method', {
    enum: ['cash', 'card', 'store_credit'],
  }),
  refundAmount: numeric('refund_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  reason: text('reason'),
  notes: text('notes'),
  returnDate: timestamp('return_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const returnItems = pgTable('return_items', {
  id: serial('id').primaryKey(),
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
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  condition: text('condition', {
    enum: ['new', 'good', 'fair', 'damaged'],
  })
    .notNull()
    .default('good'),
  restockable: boolean('restockable').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
