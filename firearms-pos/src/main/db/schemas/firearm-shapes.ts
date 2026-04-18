import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmShapes = sqliteTable('firearm_shapes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type FirearmShape = typeof firearmShapes.$inferSelect
export type NewFirearmShape = typeof firearmShapes.$inferInsert
