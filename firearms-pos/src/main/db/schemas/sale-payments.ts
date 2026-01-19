import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sales } from './sales'

/**
 * Sale Payments table - tracks individual payments for a sale
 * Supports mixed payments (e.g., $50 cash + $100 card)
 */
export const salePayments = sqliteTable('sale_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'debit_card', 'mobile', 'cheque', 'bank_transfer'],
  }).notNull(),
  amount: real('amount').notNull(),
  referenceNumber: text('reference_number'), // For card/cheque/transfer reference
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type SalePayment = typeof salePayments.$inferSelect
export type NewSalePayment = typeof salePayments.$inferInsert
