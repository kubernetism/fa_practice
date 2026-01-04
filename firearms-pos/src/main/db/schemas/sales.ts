import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { customers } from './customers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'credit', 'mixed', 'mobile', 'cod', 'receivable'],
  })
    .notNull()
    .default('cash'),
  paymentStatus: text('payment_status', { enum: ['paid', 'partial', 'pending'] })
    .notNull()
    .default('paid'),
  amountPaid: real('amount_paid').notNull().default(0),
  changeGiven: real('change_given').notNull().default(0),
  notes: text('notes'),
  isVoided: integer('is_voided', { mode: 'boolean' }).notNull().default(false),
  voidReason: text('void_reason'),
  saleDate: text('sale_date')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const saleItems = sqliteTable('sale_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  serialNumber: text('serial_number'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull(),
  costPrice: real('cost_price').notNull(),
  discountPercent: real('discount_percent').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  totalPrice: real('total_price').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Sale = typeof sales.$inferSelect
export type NewSale = typeof sales.$inferInsert
export type SaleItem = typeof saleItems.$inferSelect
export type NewSaleItem = typeof saleItems.$inferInsert
