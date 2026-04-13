import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { branches } from './branches'

export const reversalRequests = sqliteTable(
  'reversal_requests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    requestNumber: text('request_number').notNull().unique(), // REV-YYYY-NNNN
    entityType: text('entity_type', {
      enum: [
        'sale',
        'purchase',
        'expense',
        'journal_entry',
        'ar_payment',
        'ap_payment',
        'stock_adjustment',
        'stock_transfer',
        'commission',
        'return',
        'receivable',
        'payable',
      ],
    }).notNull(),
    entityId: integer('entity_id').notNull(),
    reason: text('reason').notNull(),
    priority: text('priority', {
      enum: ['low', 'medium', 'high', 'urgent'],
    })
      .notNull()
      .default('medium'),
    status: text('status', {
      enum: ['pending', 'approved', 'rejected', 'completed', 'failed'],
    })
      .notNull()
      .default('pending'),
    requestedBy: integer('requested_by')
      .notNull()
      .references(() => users.id),
    reviewedBy: integer('reviewed_by').references(() => users.id),
    reviewedAt: text('reviewed_at'),
    rejectionReason: text('rejection_reason'),
    reversalDetails: text('reversal_details', { mode: 'json' }).$type<Record<string, unknown>>(),
    errorDetails: text('error_details'),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    statusIdx: index('rr_status_idx').on(table.status),
    entityIdx: index('rr_entity_idx').on(table.entityType, table.entityId),
    branchIdx: index('rr_branch_idx').on(table.branchId),
    priorityIdx: index('rr_priority_idx').on(table.priority),
  })
)

export const reversalRequestsRelations = relations(reversalRequests, ({ one }) => ({
  requestedByUser: one(users, {
    fields: [reversalRequests.requestedBy],
    references: [users.id],
    relationName: 'requestedBy',
  }),
  reviewedByUser: one(users, {
    fields: [reversalRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewedBy',
  }),
  branch: one(branches, {
    fields: [reversalRequests.branchId],
    references: [branches.id],
  }),
}))

export type ReversalRequest = typeof reversalRequests.$inferSelect
export type NewReversalRequest = typeof reversalRequests.$inferInsert
