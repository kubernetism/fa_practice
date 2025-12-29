import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { branches } from './branches'

export const inventory = sqliteTable(
  'inventory',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    quantity: integer('quantity').notNull().default(0),
    minQuantity: integer('min_quantity').notNull().default(5),
    maxQuantity: integer('max_quantity').notNull().default(100),
    lastRestockDate: text('last_restock_date'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('inventory_product_branch_idx').on(table.productId, table.branchId)]
)

export type Inventory = typeof inventory.$inferSelect
export type NewInventory = typeof inventory.$inferInsert
