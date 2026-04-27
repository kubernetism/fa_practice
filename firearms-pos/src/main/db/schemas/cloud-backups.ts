import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

/**
 * cloud_backups — one row per backup attempt. Tracks whether a local backup
 * file has been uploaded to Google Drive, plus retry metadata for the
 * scheduler / on-close uploader. CHECK constraints are enforced at the SQL
 * layer (see migration); the Drizzle enum below is for type safety only.
 */
export const cloudBackups = sqliteTable(
  'cloud_backups',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    localPath: text('local_path').notNull(),
    localFilename: text('local_filename').notNull(),
    localSizeBytes: integer('local_size_bytes').notNull(),
    reason: text('reason', { enum: ['manual', 'scheduled', 'on_close'] }).notNull(),
    status: text('status', {
      enum: ['pending', 'uploading', 'uploaded', 'failed', 'skipped'],
    }).notNull(),
    attemptCount: integer('attempt_count').notNull().default(0),
    nextAttemptAt: text('next_attempt_at'),
    driveFileId: text('drive_file_id'),
    driveFilename: text('drive_filename'),
    uploadedSizeBytes: integer('uploaded_size_bytes'),
    lastError: text('last_error'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    // Callers must set updatedAt explicitly on UPDATE; SQLite has no ON UPDATE trigger.
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    userStatusIdx: index('cloud_backups_user_status_idx').on(table.userId, table.status),
    statusNextAttemptIdx: index('cloud_backups_status_next_attempt_idx').on(
      table.status,
      table.nextAttemptAt,
    ),
  }),
)

export const cloudBackupsRelations = relations(cloudBackups, ({ one }) => ({
  user: one(users, {
    fields: [cloudBackups.userId],
    references: [users.id],
  }),
}))

export type CloudBackup = typeof cloudBackups.$inferSelect
export type NewCloudBackup = typeof cloudBackups.$inferInsert
