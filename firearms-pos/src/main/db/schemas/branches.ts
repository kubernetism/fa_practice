import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const branches = sqliteTable('branches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  licenseNumber: text('license_number'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isMain: integer('is_main', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Branch = typeof branches.$inferSelect
export type NewBranch = typeof branches.$inferInsert
