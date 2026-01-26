import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sales } from './sales'
import { services } from './services'

/**
 * Sale Services table - tracks services sold in a sale
 * Similar to sale_items but for services instead of products
 */
export const saleServices = sqliteTable('sale_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  serviceId: integer('service_id')
    .notNull()
    .references(() => services.id),
  serviceName: text('service_name').notNull(), // Denormalized for historical reference
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull(), // Price at time of sale
  // For hourly services
  hours: real('hours'), // Hours worked (if hourly pricing)
  // Tax
  taxRate: real('tax_rate').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  // Total = (unitPrice * quantity) or (unitPrice * hours) + taxAmount
  totalAmount: real('total_amount').notNull(),
  // Notes for this specific service (e.g., description of work done)
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type SaleService = typeof saleServices.$inferSelect
export type NewSaleService = typeof saleServices.$inferInsert
