import { pgTable, serial, text, boolean, timestamp, integer, numeric, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { sales } from './sales'

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => serviceCategories.id),
  price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
  pricingType: text('pricing_type', { enum: ['flat', 'hourly'] })
    .notNull()
    .default('flat'),
  estimatedDuration: integer('estimated_duration').default(60),
  isTaxable: boolean('is_taxable').notNull().default(true),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const saleServices = pgTable(
  'sale_services',
  {
    id: serial('id').primaryKey(),
    saleId: integer('sale_id')
      .notNull()
      .references(() => sales.id),
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id),
    serviceName: text('service_name').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    hours: numeric('hours', { precision: 8, scale: 2 }),
    taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
    taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('ss_sale_idx').on(table.saleId),
    index('ss_service_idx').on(table.serviceId),
  ]
)
