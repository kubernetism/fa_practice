import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { products } from './products'
import { branches } from './branches'
import { users } from './users'
import { purchaseItems } from './purchases'

export const inventory = pgTable(
  'inventory',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    quantity: integer('quantity').notNull().default(0),
    minQuantity: integer('min_quantity').notNull().default(5),
    maxQuantity: integer('max_quantity').notNull().default(100),
    lastRestockDate: timestamp('last_restock_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('inventory_product_branch_idx').on(table.productId, table.branchId),
  ]
)

export const inventoryCostLayers = pgTable(
  'inventory_cost_layers',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    purchaseItemId: integer('purchase_item_id').references(() => purchaseItems.id),
    quantity: integer('quantity').notNull(),
    originalQuantity: integer('original_quantity').notNull(),
    unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
    receivedDate: timestamp('received_date').notNull(),
    isFullyConsumed: boolean('is_fully_consumed').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('icl_product_branch_date_idx').on(table.productId, table.branchId, table.receivedDate),
    index('icl_active_layers_idx').on(table.productId, table.branchId, table.isFullyConsumed),
    index('icl_purchase_item_idx').on(table.purchaseItemId),
  ]
)

export const stockAdjustments = pgTable('stock_adjustments', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const stockTransfers = pgTable('stock_transfers', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  transferNumber: text('transfer_number').notNull(),
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
  serialNumbers: text('serial_numbers').default('[]'),
  status: text('status', {
    enum: ['pending', 'in_transit', 'completed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  notes: text('notes'),
  transferDate: timestamp('transfer_date').notNull().defaultNow(),
  receivedDate: timestamp('received_date'),
  receivedBy: integer('received_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const inventoryCounts = pgTable(
  'inventory_counts',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    countNumber: text('count_number').notNull(),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    countType: text('count_type', {
      enum: ['full', 'cycle', 'spot', 'annual'],
    }).notNull(),
    status: text('status', {
      enum: ['draft', 'in_progress', 'completed', 'cancelled'],
    })
      .notNull()
      .default('draft'),
    scheduledDate: timestamp('scheduled_date'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    startedBy: integer('started_by').references(() => users.id),
    completedBy: integer('completed_by').references(() => users.id),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    notes: text('notes'),
    totalItems: integer('total_items').default(0),
    itemsCounted: integer('items_counted').default(0),
    varianceCount: integer('variance_count').default(0),
    varianceValue: numeric('variance_value', { precision: 12, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('ic_branch_idx').on(table.branchId),
    index('ic_status_idx').on(table.status),
    index('ic_date_idx').on(table.scheduledDate),
  ]
)

export const inventoryCountItems = pgTable(
  'inventory_count_items',
  {
    id: serial('id').primaryKey(),
    countId: integer('count_id')
      .notNull()
      .references(() => inventoryCounts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    expectedQuantity: integer('expected_quantity').notNull(),
    expectedCost: numeric('expected_cost', { precision: 12, scale: 2 }).notNull().default('0'),
    countedQuantity: integer('counted_quantity'),
    varianceQuantity: integer('variance_quantity'),
    varianceValue: numeric('variance_value', { precision: 12, scale: 2 }),
    variancePercent: numeric('variance_percent', { precision: 8, scale: 2 }),
    countedBy: integer('counted_by').references(() => users.id),
    countedAt: timestamp('counted_at'),
    serialNumber: text('serial_number'),
    adjustmentCreated: boolean('adjustment_created').notNull().default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('ici_count_idx').on(table.countId),
    index('ici_product_idx').on(table.productId),
    index('ici_variance_idx').on(table.varianceQuantity),
  ]
)
