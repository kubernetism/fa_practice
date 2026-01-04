import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { customers } from './customers'
import { branches } from './branches'
import { users } from './users'
import { products } from './products'

export const salesTabs = sqliteTable(
  'sales_tabs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tabNumber: text('tab_number').notNull().unique(),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    customerId: integer('customer_id').references(() => customers.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    status: text('status', {
      enum: ['open', 'on_hold', 'closed'],
    })
      .notNull()
      .default('open'),
    itemCount: integer('item_count').notNull().default(0),
    subtotal: real('subtotal').notNull().default(0),
    discount: real('discount').notNull().default(0),
    tax: real('tax').notNull().default(0),
    finalAmount: real('final_amount').notNull().default(0),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    closedAt: text('closed_at'),
    closedBy: integer('closed_by').references(() => users.id),
  },
  (table) => [
    index('sales_tabs_branch_idx').on(table.branchId),
    index('sales_tabs_status_idx').on(table.status),
    index('sales_tabs_created_idx').on(table.createdAt),
  ]
)

export const salesTabItems = sqliteTable(
  'sales_tab_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tabId: integer('tab_id')
      .notNull()
      .references(() => salesTabs.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull(),
    productName: text('product_name').notNull(),
    productCode: text('product_code'),
    quantity: integer('quantity').notNull(),
    sellingPrice: real('selling_price').notNull(),
    costPrice: real('cost_price').notNull(),
    taxPercent: real('tax_percent').notNull().default(0),
    subtotal: real('subtotal').notNull(),
    serialNumber: text('serial_number'),
    batchNumber: text('batch_number'),
    addedAt: text('added_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('sales_tab_items_tab_idx').on(table.tabId)]
)

export type SalesTab = typeof salesTabs.$inferSelect
export type NewSalesTab = typeof salesTabs.$inferInsert
export type SalesTabItem = typeof salesTabItems.$inferSelect
export type NewSalesTabItem = typeof salesTabItems.$inferInsert

// Relations
export const salesTabsRelations = relations(salesTabs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesTabs.customerId],
    references: [customers.id],
  }),
  branch: one(branches, {
    fields: [salesTabs.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [salesTabs.userId],
    references: [users.id],
  }),
  closedByUser: one(users, {
    fields: [salesTabs.closedBy],
    references: [users.id],
  }),
  items: many(salesTabItems),
}))

export const salesTabItemsRelations = relations(salesTabItems, ({ one }) => ({
  tab: one(salesTabs, {
    fields: [salesTabItems.tabId],
    references: [salesTabs.id],
  }),
  product: one(products, {
    fields: [salesTabItems.productId],
    references: [products.id],
  }),
}))
