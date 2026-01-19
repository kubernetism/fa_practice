import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { products } from './products'
import { branches } from './branches'
import { users } from './users'

/**
 * Inventory Count Sessions - represents a cycle count or physical inventory count event
 */
export const inventoryCounts = sqliteTable(
  'inventory_counts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    countNumber: text('count_number').notNull().unique(),
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
    scheduledDate: text('scheduled_date'),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    startedBy: integer('started_by').references(() => users.id),
    completedBy: integer('completed_by').references(() => users.id),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    notes: text('notes'),
    // Summary fields (calculated on completion)
    totalItems: integer('total_items').default(0),
    itemsCounted: integer('items_counted').default(0),
    varianceCount: integer('variance_count').default(0),
    varianceValue: real('variance_value').default(0),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    branchIdx: index('ic_branch_idx').on(table.branchId),
    statusIdx: index('ic_status_idx').on(table.status),
    dateIdx: index('ic_date_idx').on(table.scheduledDate),
  })
)

/**
 * Inventory Count Items - individual product counts within a count session
 */
export const inventoryCountItems = sqliteTable(
  'inventory_count_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    countId: integer('count_id')
      .notNull()
      .references(() => inventoryCounts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    // Expected quantity from system at time of count
    expectedQuantity: integer('expected_quantity').notNull(),
    expectedCost: real('expected_cost').notNull().default(0),
    // Actual counted quantity
    countedQuantity: integer('counted_quantity'),
    // Variance (counted - expected)
    varianceQuantity: integer('variance_quantity'),
    varianceValue: real('variance_value'),
    variancePercent: real('variance_percent'),
    // Count details
    countedBy: integer('counted_by').references(() => users.id),
    countedAt: text('counted_at'),
    // For serialized items
    serialNumber: text('serial_number'),
    // Adjustment created flag
    adjustmentCreated: integer('adjustment_created', { mode: 'boolean' })
      .notNull()
      .default(false),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    countIdx: index('ici_count_idx').on(table.countId),
    productIdx: index('ici_product_idx').on(table.productId),
    varianceIdx: index('ici_variance_idx').on(table.varianceQuantity),
  })
)

// Relations
export const inventoryCountsRelations = relations(inventoryCounts, ({ one, many }) => ({
  branch: one(branches, {
    fields: [inventoryCounts.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [inventoryCounts.createdBy],
    references: [users.id],
  }),
  startedByUser: one(users, {
    fields: [inventoryCounts.startedBy],
    references: [users.id],
  }),
  completedByUser: one(users, {
    fields: [inventoryCounts.completedBy],
    references: [users.id],
  }),
  items: many(inventoryCountItems),
}))

export const inventoryCountItemsRelations = relations(inventoryCountItems, ({ one }) => ({
  count: one(inventoryCounts, {
    fields: [inventoryCountItems.countId],
    references: [inventoryCounts.id],
  }),
  product: one(products, {
    fields: [inventoryCountItems.productId],
    references: [products.id],
  }),
  countedByUser: one(users, {
    fields: [inventoryCountItems.countedBy],
    references: [users.id],
  }),
}))

export type InventoryCount = typeof inventoryCounts.$inferSelect
export type NewInventoryCount = typeof inventoryCounts.$inferInsert
export type InventoryCountItem = typeof inventoryCountItems.$inferSelect
export type NewInventoryCountItem = typeof inventoryCountItems.$inferInsert
