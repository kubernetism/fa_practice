import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }).$type<unknown>(),
  category: text('category', {
    enum: ['general', 'company', 'tax', 'receipt', 'inventory', 'sales', 'notification', 'backup'],
  })
    .notNull()
    .default('general'),
  description: text('description'),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert
