import { pgTable, serial, text, boolean, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { branches } from './branches'

export const referralPersons = pgTable(
  'referral_persons',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    name: text('name').notNull(),
    contact: text('contact'),
    address: text('address'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    totalCommissionEarned: numeric('total_commission_earned', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    totalCommissionPaid: numeric('total_commission_paid', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('referral_persons_branch_idx').on(table.branchId),
    index('referral_persons_name_idx').on(table.name),
  ]
)
