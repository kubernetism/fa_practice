import { pgTable, serial, text, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
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
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
