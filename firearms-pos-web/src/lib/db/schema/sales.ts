import { pgTable, serial, text, boolean, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { customers } from './customers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  invoiceNumber: text('invoice_number').notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'credit', 'mixed', 'mobile', 'cod', 'receivable'],
  })
    .notNull()
    .default('cash'),
  paymentStatus: text('payment_status', {
    enum: ['paid', 'partial', 'pending'],
  })
    .notNull()
    .default('paid'),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).notNull().default('0'),
  changeGiven: numeric('change_given', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  isVoided: boolean('is_voided').notNull().default(false),
  voidReason: text('void_reason'),
  saleDate: timestamp('sale_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const saleItems = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  serialNumber: text('serial_number'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull(),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull().default('0'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const salePayments = pgTable('sale_payments', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'debit_card', 'mobile', 'cheque', 'bank_transfer'],
  }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  referenceNumber: text('reference_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const salesTabs = pgTable(
  'sales_tabs',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    tabNumber: text('tab_number').notNull(),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    customerId: integer('customer_id').references(() => customers.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    status: text('status', { enum: ['open', 'on_hold', 'closed'] })
      .notNull()
      .default('open'),
    itemCount: integer('item_count').notNull().default(0),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
    discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
    tax: numeric('tax', { precision: 12, scale: 2 }).notNull().default('0'),
    finalAmount: numeric('final_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    closedAt: timestamp('closed_at'),
    closedBy: integer('closed_by').references(() => users.id),
  },
  (table) => [
    index('sales_tabs_branch_idx').on(table.branchId),
    index('sales_tabs_status_idx').on(table.status),
  ]
)

export const salesTabItems = pgTable(
  'sales_tab_items',
  {
    id: serial('id').primaryKey(),
    tabId: integer('tab_id')
      .notNull()
      .references(() => salesTabs.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull(),
    productName: text('product_name').notNull(),
    productCode: text('product_code'),
    quantity: integer('quantity').notNull(),
    sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull(),
    costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull(),
    taxPercent: numeric('tax_percent', { precision: 5, scale: 2 }).notNull().default('0'),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
    serialNumber: text('serial_number'),
    batchNumber: text('batch_number'),
    addedAt: timestamp('added_at').notNull().defaultNow(),
  },
  (table) => [index('sales_tab_items_tab_idx').on(table.tabId)]
)
