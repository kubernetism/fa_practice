import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/**
 * Service Categories table - categorizes services
 * Examples: Repair, Maintenance, Customization, Testing, etc.
 */
export const serviceCategories = sqliteTable('service_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type ServiceCategory = typeof serviceCategories.$inferSelect
export type NewServiceCategory = typeof serviceCategories.$inferInsert
