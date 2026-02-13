import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'

/**
 * Services table - stores service offerings
 * Examples: Repairing, Part Changing, Painting, Overhauling, Testing, etc.
 */
export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  // Pricing
  price: real('price').notNull().default(0),
  pricingType: text('pricing_type', {
    enum: ['flat', 'hourly'],
  }).notNull().default('flat'),
  // Duration in minutes (for scheduling/estimation)
  estimatedDuration: integer('estimated_duration').default(60),
  // Tax settings
  isTaxable: integer('is_taxable', { mode: 'boolean' }).notNull().default(true),
  taxRate: real('tax_rate').notNull().default(0),
  // Status
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  // Timestamps
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
