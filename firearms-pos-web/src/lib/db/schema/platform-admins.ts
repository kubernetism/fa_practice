import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core'

// Platform Admins — completely separate from tenant users
export const platformAdmins = pgTable('platform_admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
