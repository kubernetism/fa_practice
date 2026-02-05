import { pgTable, serial, text, boolean, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { sales } from './sales'
import { users } from './users'

export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  code: text('code').notNull(),
  description: text('description'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at'),
  isUsed: boolean('is_used').notNull().default(false),
  usedAt: timestamp('used_at'),
  usedInSaleId: integer('used_in_sale_id').references(() => sales.id),
  createdBy: integer('created_by').references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
