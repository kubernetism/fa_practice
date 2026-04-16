import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { suppliers } from './suppliers'

export const payees = sqliteTable(
  'payees',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    payeeType: text('payee_type', {
      enum: ['vendor', 'landlord', 'utility', 'employee', 'government', 'other'],
    }).notNull(),
    linkedSupplierId: integer('linked_supplier_id').references(() => suppliers.id),
    contactPhone: text('contact_phone'),
    contactEmail: text('contact_email'),
    address: text('address'),
    notes: text('notes'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    payeeTypeIdx: index('payees_payee_type_idx').on(table.payeeType),
    linkedSupplierIdx: index('payees_linked_supplier_idx').on(table.linkedSupplierId),
    isActiveIdx: index('payees_is_active_idx').on(table.isActive),
  })
)

export const payeesRelations = relations(payees, ({ one }) => ({
  linkedSupplier: one(suppliers, {
    fields: [payees.linkedSupplierId],
    references: [suppliers.id],
  }),
}))

export type Payee = typeof payees.$inferSelect
export type NewPayee = typeof payees.$inferInsert
