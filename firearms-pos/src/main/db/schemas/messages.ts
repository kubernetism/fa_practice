import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const messages = sqliteTable(
  'messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    senderId: integer('sender_id')
      .notNull()
      .references(() => users.id),
    // If recipientId is null, it's a broadcast message to all users
    recipientId: integer('recipient_id').references(() => users.id),
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    senderIdx: index('messages_sender_idx').on(table.senderId),
    recipientIdx: index('messages_recipient_idx').on(table.recipientId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  })
)

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'messageSender',
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: 'messageRecipient',
  }),
}))

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
