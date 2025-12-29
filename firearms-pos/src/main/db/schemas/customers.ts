import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  governmentIdType: text('government_id_type', {
    enum: ['drivers_license', 'passport', 'state_id', 'military_id', 'other'],
  }),
  governmentIdNumber: text('government_id_number'),
  firearmLicenseNumber: text('firearm_license_number'),
  licenseExpiryDate: text('license_expiry_date'),
  dateOfBirth: text('date_of_birth'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
