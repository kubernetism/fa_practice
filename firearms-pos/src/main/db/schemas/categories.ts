import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  parentId: integer('parent_id').references((): ReturnType<typeof integer> => categories.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isFirearm: integer('is_firearm', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
