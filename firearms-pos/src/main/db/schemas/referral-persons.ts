import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { branches } from './branches'

export const referralPersons = sqliteTable(
  'referral_persons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    name: text('name').notNull(),
    contact: text('contact'),
    address: text('address'),
    notes: text('notes'),
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(true),
    totalCommissionEarned: real('total_commission_earned').notNull().default(0),
    totalCommissionPaid: real('total_commission_paid').notNull().default(0),
    commissionRate: real('commission_rate'), // Default commission rate for this referral person
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    branchIdx: index('referral_persons_branch_idx').on(table.branchId),
    nameIdx: index('referral_persons_name_idx').on(table.name),
  })
)

export type ReferralPerson = typeof referralPersons.$inferSelect
export type NewReferralPerson = typeof referralPersons.$inferInsert
