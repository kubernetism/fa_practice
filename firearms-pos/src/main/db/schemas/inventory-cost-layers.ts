import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { products } from './products'
import { branches } from './branches'
import { purchaseItems } from './purchases'

// Inventory Cost Layers - for FIFO/LIFO cost tracking
export const inventoryCostLayers = sqliteTable(
  'inventory_cost_layers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    purchaseItemId: integer('purchase_item_id').references(() => purchaseItems.id), // Links to purchase for traceability
    quantity: integer('quantity').notNull(), // Remaining quantity in this layer
    originalQuantity: integer('original_quantity').notNull(), // Original quantity when layer was created
    unitCost: real('unit_cost').notNull(), // Cost per unit in this layer
    receivedDate: text('received_date').notNull(), // Date layer was created (for FIFO ordering)
    isFullyConsumed: integer('is_fully_consumed', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    // Index for FIFO queries - oldest first by received date
    productBranchDateIdx: index('icl_product_branch_date_idx').on(
      table.productId,
      table.branchId,
      table.receivedDate
    ),
    // Index for finding active (not fully consumed) layers
    activeLayersIdx: index('icl_active_layers_idx').on(
      table.productId,
      table.branchId,
      table.isFullyConsumed
    ),
    // Index for purchase traceability
    purchaseItemIdx: index('icl_purchase_item_idx').on(table.purchaseItemId),
  })
)

// Relations
export const inventoryCostLayersRelations = relations(inventoryCostLayers, ({ one }) => ({
  product: one(products, {
    fields: [inventoryCostLayers.productId],
    references: [products.id],
  }),
  branch: one(branches, {
    fields: [inventoryCostLayers.branchId],
    references: [branches.id],
  }),
  purchaseItem: one(purchaseItems, {
    fields: [inventoryCostLayers.purchaseItemId],
    references: [purchaseItems.id],
  }),
}))

export type InventoryCostLayer = typeof inventoryCostLayers.$inferSelect
export type NewInventoryCostLayer = typeof inventoryCostLayers.$inferInsert
