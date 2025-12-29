import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  brand: text('brand'),
  costPrice: real('cost_price').notNull().default(0),
  sellingPrice: real('selling_price').notNull().default(0),
  reorderLevel: integer('reorder_level').notNull().default(10),
  unit: text('unit').notNull().default('pcs'),
  isSerialTracked: integer('is_serial_tracked', { mode: 'boolean' }).notNull().default(false),
  isTaxable: integer('is_taxable', { mode: 'boolean' }).notNull().default(true),
  taxRate: real('tax_rate').notNull().default(0),
  barcode: text('barcode'),
  imageUrl: text('image_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
