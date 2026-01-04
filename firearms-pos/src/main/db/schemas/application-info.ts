import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const applicationInfo = sqliteTable('application_info', {
  infoId: integer('info_id').primaryKey({ autoIncrement: true }),
  installationDate: text('installation_date').notNull(),
  firstRunDate: text('first_run_date').notNull(),
  trialStartDate: text('trial_start_date').notNull(),
  trialEndDate: text('trial_end_date').notNull(),
  isLicensed: integer('is_licensed', { mode: 'boolean' }).default(false),
  licenseStartDate: text('license_start_date'),
  licenseEndDate: text('license_end_date'),
  machineId: text('machine_id').notNull(),
  licenseKey: text('license_key'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export type ApplicationInfo = typeof applicationInfo.$inferSelect
export type NewApplicationInfo = typeof applicationInfo.$inferInsert
