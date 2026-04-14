import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { suppliers } from './suppliers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const purchases = sqliteTable('purchases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseOrderNumber: text('purchase_order_number').notNull().unique(),
  supplierId: integer('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  shippingCost: real('shipping_cost').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
  paymentMethod: text('payment_method', { enum: ['cash', 'cheque', 'pay_later'] })
    .notNull()
    .default('cash'),
  paymentStatus: text('payment_status', { enum: ['paid', 'partial', 'pending'] })
    .notNull()
    .default('pending'),
  status: text('status', { enum: ['draft', 'ordered', 'partial', 'received', 'cancelled', 'reversed'] })
    .notNull()
    .default('draft'),
  expectedDeliveryDate: text('expected_delivery_date'),
  receivedDate: text('received_date'),
  notes: text('notes'),
  reversedByPurchaseId: integer('reversed_by_purchase_id'),
  reversesPurchaseId: integer('reverses_purchase_id'),
  reversalReason: text('reversal_reason'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const purchaseItems = sqliteTable('purchase_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseId: integer('purchase_id')
    .notNull()
    .references(() => purchases.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  unitCost: real('unit_cost').notNull(),
  receivedQuantity: integer('received_quantity').notNull().default(0),
  totalCost: real('total_cost').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Purchase = typeof purchases.$inferSelect
export type NewPurchase = typeof purchases.$inferInsert
export type PurchaseItem = typeof purchaseItems.$inferSelect
export type NewPurchaseItem = typeof purchaseItems.$inferInsert
