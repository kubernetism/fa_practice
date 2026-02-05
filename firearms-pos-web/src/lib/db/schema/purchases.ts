import { pgTable, serial, text, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { suppliers } from './suppliers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  purchaseOrderNumber: text('purchase_order_number').notNull(),
  supplierId: integer('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'cheque', 'pay_later'],
  })
    .notNull()
    .default('cash'),
  paymentStatus: text('payment_status', {
    enum: ['paid', 'partial', 'pending'],
  })
    .notNull()
    .default('pending'),
  status: text('status', {
    enum: ['draft', 'ordered', 'partial', 'received', 'cancelled'],
  })
    .notNull()
    .default('draft'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  receivedDate: timestamp('received_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const purchaseItems = pgTable('purchase_items', {
  id: serial('id').primaryKey(),
  purchaseId: integer('purchase_id')
    .notNull()
    .references(() => purchases.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
  receivedQuantity: integer('received_quantity').notNull().default(0),
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
