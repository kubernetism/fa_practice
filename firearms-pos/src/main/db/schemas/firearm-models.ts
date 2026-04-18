import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmModels = sqliteTable('firearm_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type FirearmModel = typeof firearmModels.$inferSelect
export type NewFirearmModel = typeof firearmModels.$inferInsert
