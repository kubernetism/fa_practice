import Database from 'better-sqlite3'
/**
 * Tests for cloud_credentials and cloud_backups schema migration.
 *
 * Validates:
 *  - Migration creates both tables with the expected columns
 *  - Sample inserts round-trip correctly
 *  - UNIQUE(user_id) constraint on cloud_credentials
 *  - CHECK constraint on cloud_backups.status rejects invalid values
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addCloudBackupTables } from '../migrations/0001_add_cloud_backup_tables'

interface ColumnInfo {
  name: string
  type: string
  notnull: number
  dflt_value: string | null
  pk: number
}

let sqlite: Database.Database

function createMinimalUsersTable(db: Database.Database) {
  // The cloud tables reference users.id, so we need at least a users table.
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.prepare(
    `INSERT INTO users (id, username, password, email, full_name, role)
     VALUES (1, 'admin', 'hashed', 'admin@test.com', 'Test Admin', 'admin')`,
  ).run()
  db.prepare(
    `INSERT INTO users (id, username, password, email, full_name, role)
     VALUES (2, 'admin2', 'hashed', 'admin2@test.com', 'Test Admin 2', 'admin')`,
  ).run()
}

beforeEach(() => {
  sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  createMinimalUsersTable(sqlite)
  addCloudBackupTables(sqlite)
})

afterEach(() => {
  sqlite.close()
})

describe('cloud backup migration', () => {
  it('creates cloud_credentials with the expected columns', () => {
    const cols = sqlite.prepare('PRAGMA table_info(cloud_credentials)').all() as ColumnInfo[]
    const names = cols.map((c) => c.name).sort()

    expect(names).toEqual(
      [
        'id',
        'user_id',
        'google_email',
        'refresh_token_encrypted',
        'drive_folder_id',
        'passphrase_verifier_salt',
        'passphrase_verifier_hash',
        'argon_m_kib',
        'argon_t',
        'argon_p',
        'auto_upload_enabled',
        'connected_at',
        'last_upload_at',
        'last_error',
      ].sort(),
    )
  })

  it('creates cloud_backups with the expected columns', () => {
    const cols = sqlite.prepare('PRAGMA table_info(cloud_backups)').all() as ColumnInfo[]
    const names = cols.map((c) => c.name).sort()

    expect(names).toEqual(
      [
        'id',
        'user_id',
        'local_path',
        'local_filename',
        'local_size_bytes',
        'reason',
        'status',
        'attempt_count',
        'next_attempt_at',
        'drive_file_id',
        'drive_filename',
        'uploaded_size_bytes',
        'last_error',
        'created_at',
        'updated_at',
      ].sort(),
    )
  })

  it('inserts and reads back a cloud_credentials row', () => {
    sqlite
      .prepare(
        `INSERT INTO cloud_credentials
          (user_id, google_email, refresh_token_encrypted,
           passphrase_verifier_salt, passphrase_verifier_hash)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(1, 'user@example.com', 'encrypted-token', 'a'.repeat(32), 'argon2id-hash')

    const row = sqlite.prepare('SELECT * FROM cloud_credentials WHERE user_id = 1').get() as Record<
      string,
      unknown
    >

    expect(row.google_email).toBe('user@example.com')
    expect(row.refresh_token_encrypted).toBe('encrypted-token')
    expect(row.argon_m_kib).toBe(65536)
    expect(row.argon_t).toBe(3)
    expect(row.argon_p).toBe(4)
    expect(row.auto_upload_enabled).toBe(0)
    expect(row.connected_at).toBeTruthy()
  })

  it('inserts and reads back a cloud_backups row', () => {
    sqlite
      .prepare(
        `INSERT INTO cloud_backups
          (user_id, local_path, local_filename, local_size_bytes, reason, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(1, '/tmp/backup.db', 'backup.db', 1024, 'manual', 'pending')

    const row = sqlite.prepare('SELECT * FROM cloud_backups WHERE user_id = 1').get() as Record<
      string,
      unknown
    >

    expect(row.local_filename).toBe('backup.db')
    expect(row.local_size_bytes).toBe(1024)
    expect(row.reason).toBe('manual')
    expect(row.status).toBe('pending')
    expect(row.attempt_count).toBe(0)
    expect(row.created_at).toBeTruthy()
    expect(row.updated_at).toBeTruthy()
  })

  it('enforces UNIQUE constraint on cloud_credentials.user_id', () => {
    const stmt = sqlite.prepare(
      `INSERT INTO cloud_credentials
        (user_id, google_email, refresh_token_encrypted,
         passphrase_verifier_salt, passphrase_verifier_hash)
       VALUES (?, ?, ?, ?, ?)`,
    )
    stmt.run(1, 'first@example.com', 'tok1', 's1', 'h1')
    expect(() => stmt.run(1, 'second@example.com', 'tok2', 's2', 'h2')).toThrow(/UNIQUE/i)
  })

  it('rejects invalid status via CHECK constraint on cloud_backups', () => {
    const stmt = sqlite.prepare(
      `INSERT INTO cloud_backups
        (user_id, local_path, local_filename, local_size_bytes, reason, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    expect(() => stmt.run(1, '/tmp/x.db', 'x.db', 100, 'manual', 'not_a_real_status')).toThrow(
      /CHECK/i,
    )
  })

  it('rejects invalid reason via CHECK constraint on cloud_backups', () => {
    const stmt = sqlite.prepare(
      `INSERT INTO cloud_backups
        (user_id, local_path, local_filename, local_size_bytes, reason, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    expect(() => stmt.run(1, '/tmp/x.db', 'x.db', 100, 'bogus_reason', 'pending')).toThrow(/CHECK/i)
  })

  it('creates the (user_id, status) and (status, next_attempt_at) indexes', () => {
    const indexes = sqlite.prepare('PRAGMA index_list(cloud_backups)').all() as Array<{
      name: string
    }>
    const names = indexes.map((i) => i.name)
    expect(names).toContain('cloud_backups_user_status_idx')
    expect(names).toContain('cloud_backups_status_next_attempt_idx')
  })

  it('allows two different users to each have one credential row', () => {
    const stmt = sqlite.prepare(
      `INSERT INTO cloud_credentials
        (user_id, google_email, refresh_token_encrypted,
         passphrase_verifier_salt, passphrase_verifier_hash)
       VALUES (?, ?, ?, ?, ?)`,
    )
    stmt.run(1, 'a@example.com', 't1', 's1', 'h1')
    stmt.run(2, 'b@example.com', 't2', 's2', 'h2')

    const count = (
      sqlite.prepare('SELECT COUNT(*) AS n FROM cloud_credentials').get() as { n: number }
    ).n
    expect(count).toBe(2)
  })
})
