import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const userSecurityQuestions = sqliteTable('user_security_questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  question: text('question').notNull(),
  answerHash: text('answer_hash').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type UserSecurityQuestion = typeof userSecurityQuestions.$inferSelect
export type NewUserSecurityQuestion = typeof userSecurityQuestions.$inferInsert
