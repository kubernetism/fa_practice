import { pgTable, serial, text, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { sales } from './sales'
import { users } from './users'
import { branches } from './branches'
import { referralPersons } from './referral-persons'

export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  userId: integer('user_id').references(() => users.id),
  referralPersonId: integer('referral_person_id').references(() => referralPersons.id),
  branchId: integer('branch_id')
    .notNull()
    .references(() => branches.id),
  commissionType: text('commission_type', {
    enum: ['sale', 'referral', 'bonus'],
  })
    .notNull()
    .default('sale'),
  baseAmount: numeric('base_amount', { precision: 12, scale: 2 }).notNull(),
  rate: numeric('rate', { precision: 5, scale: 2 }).notNull(),
  commissionAmount: numeric('commission_amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status', {
    enum: ['pending', 'approved', 'paid', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  paidDate: timestamp('paid_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
