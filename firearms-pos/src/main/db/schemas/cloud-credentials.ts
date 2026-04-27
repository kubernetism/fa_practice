import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

/**
 * cloud_credentials — one row per admin user that has linked a Google account
 * for encrypted backup uploads. The refresh token is stored encrypted at rest;
 * the passphrase verifier (salt + argon2id digest) lets us validate the user's
 * unlock passphrase without ever storing it.
 */
export const cloudCredentials = sqliteTable('cloud_credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  googleEmail: text('google_email').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted').notNull(),
  driveFolderId: text('drive_folder_id'),
  // 16-byte salt for argon2id, stored as hex (32 chars).
  passphraseVerifierSalt: text('passphrase_verifier_salt').notNull(),
  // argon2id digest of the canonical "OK" plaintext, used to verify the
  // unlock passphrase without persisting it.
  passphraseVerifierHash: text('passphrase_verifier_hash').notNull(),
  // argon2id parameters (memory in KiB, time/iterations, parallelism).
  argonMKib: integer('argon_m_kib').notNull().default(65536),
  argonT: integer('argon_t').notNull().default(3),
  argonP: integer('argon_p').notNull().default(4),
  autoUploadEnabled: integer('auto_upload_enabled', { mode: 'boolean' }).notNull().default(false),
  connectedAt: text('connected_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  lastUploadAt: text('last_upload_at'),
  lastError: text('last_error'),
})

export const cloudCredentialsRelations = relations(cloudCredentials, ({ one }) => ({
  user: one(users, {
    fields: [cloudCredentials.userId],
    references: [users.id],
  }),
}))

export type CloudCredential = typeof cloudCredentials.$inferSelect
export type NewCloudCredential = typeof cloudCredentials.$inferInsert
