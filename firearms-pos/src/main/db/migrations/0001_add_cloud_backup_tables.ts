/**
 * Migration: add cloud_credentials and cloud_backups tables.
 *
 * These tables back the encrypted Google Drive backup feature. The Drizzle
 * schema definitions live in ../schemas/cloud-credentials.ts and
 * ../schemas/cloud-backups.ts; this migration applies the equivalent CREATE
 * TABLE / CREATE INDEX statements idempotently against an existing database.
 *
 * CHECK constraints on cloud_backups.reason and cloud_backups.status are
 * enforced at the SQL layer — Drizzle's text() enum only constrains the type
 * system, not the database.
 */
import type Database from 'better-sqlite3-multiple-ciphers'

function tableExists(rawDb: Database.Database, name: string): boolean {
  const row = rawDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name)
  return !!row
}

const CREATE_CLOUD_CREDENTIALS = `
  CREATE TABLE cloud_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    drive_folder_id TEXT,
    passphrase_verifier_salt TEXT NOT NULL,
    passphrase_verifier_hash TEXT NOT NULL,
    argon_m_kib INTEGER NOT NULL DEFAULT 65536,
    argon_t INTEGER NOT NULL DEFAULT 3,
    argon_p INTEGER NOT NULL DEFAULT 4,
    auto_upload_enabled INTEGER NOT NULL DEFAULT 0,
    connected_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_upload_at TEXT,
    last_error TEXT
  )
`

const CREATE_CLOUD_BACKUPS = `
  CREATE TABLE cloud_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    local_path TEXT NOT NULL,
    local_filename TEXT NOT NULL,
    local_size_bytes INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('manual', 'scheduled', 'on_close')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'uploading', 'uploaded', 'failed', 'skipped')),
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT,
    drive_file_id TEXT,
    drive_filename TEXT,
    uploaded_size_bytes INTEGER,
    last_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

const CREATE_USER_STATUS_IDX =
  'CREATE INDEX IF NOT EXISTS cloud_backups_user_status_idx ON cloud_backups(user_id, status)'

const CREATE_STATUS_NEXT_ATTEMPT_IDX =
  'CREATE INDEX IF NOT EXISTS cloud_backups_status_next_attempt_idx ON cloud_backups(status, next_attempt_at)'

export function addCloudBackupTables(rawDb: Database.Database): void {
  console.log('Running cloud backup tables migration...')

  rawDb.exec('BEGIN TRANSACTION')
  try {
    if (!tableExists(rawDb, 'cloud_credentials')) {
      rawDb.exec(CREATE_CLOUD_CREDENTIALS)
    }

    if (!tableExists(rawDb, 'cloud_backups')) {
      rawDb.exec(CREATE_CLOUD_BACKUPS)
      rawDb.exec(CREATE_USER_STATUS_IDX)
      rawDb.exec(CREATE_STATUS_NEXT_ATTEMPT_IDX)
    }

    rawDb.exec('COMMIT')
    console.log('Cloud backup tables migration completed successfully')
  } catch (error) {
    rawDb.exec('ROLLBACK')
    console.error('Cloud backup tables migration failed, rolled back:', error)
    throw error
  }
}
