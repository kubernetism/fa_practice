import { pgTable, serial, text, boolean, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { categories } from './categories'

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  brand: text('brand'),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull().default('0'),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull().default('0'),
  reorderLevel: integer('reorder_level').notNull().default(10),
  unit: text('unit').notNull().default('pcs'),
  isSerialTracked: boolean('is_serial_tracked').notNull().default(false),
  isTaxable: boolean('is_taxable').notNull().default(true),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  barcode: text('barcode'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
