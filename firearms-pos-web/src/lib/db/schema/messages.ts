import { pgTable, serial, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { users } from './users'

export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id')
      .notNull()
      .references(() => tenants.id),
    content: text('content').notNull(),
    senderId: integer('sender_id')
      .notNull()
      .references(() => users.id),
    recipientId: integer('recipient_id').references(() => users.id),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('messages_sender_idx').on(table.senderId),
    index('messages_recipient_idx').on(table.recipientId),
    index('messages_created_at_idx').on(table.createdAt),
  ]
)
