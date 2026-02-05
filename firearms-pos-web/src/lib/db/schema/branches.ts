import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  licenseNumber: text('license_number'),
  isActive: boolean('is_active').notNull().default(true),
  isMain: boolean('is_main').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
