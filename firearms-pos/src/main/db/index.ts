import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3-multiple-ciphers'
import { app } from 'electron'
import { existsSync, mkdirSync, chmodSync, statSync } from 'node:fs'
import { join } from 'node:path'
import * as schema from './schema'
import { isDbEncrypted } from '../utils/db-cipher'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null
let sqlite: Database.Database | null = null
let dbIsLocked = false

export function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')

  if (!existsSync(dbDir)) {
    // Create data directory with restrictive permissions (owner read/write/execute only)
    mkdirSync(dbDir, { recursive: true, mode: 0o700 })
  }

  return join(dbDir, 'firearms-pos.db')
}

/**
 * Set restrictive file permissions on database files
 * Section 5.3 Security - Database file protection
 */
function protectDatabaseFiles(dbPath: string): void {
  const filesToProtect = [
    dbPath, // Main database
    `${dbPath}-wal`, // WAL file
    `${dbPath}-shm`, // Shared memory file
  ]

  for (const filePath of filesToProtect) {
    if (existsSync(filePath)) {
      try {
        // Set file permissions to owner read/write only (600)
        chmodSync(filePath, 0o600)
      } catch (error) {
        // chmod may fail on Windows - that's okay
        console.debug('Could not set file permissions (expected on Windows):', filePath)
      }
    }
  }
}

/**
 * Verify database integrity
 * Returns true if database passes integrity check
 */
function verifyDatabaseIntegrity(database: Database.Database): boolean {
  try {
    const result = database.pragma('integrity_check')
    if (Array.isArray(result) && result.length > 0) {
      const checkResult = result[0] as { integrity_check?: string }
      return checkResult.integrity_check === 'ok'
    }
    return false
  } catch (error) {
    console.error('Database integrity check failed:', error)
    return false
  }
}

export function isDatabaseLocked(): boolean {
  return dbIsLocked
}

export function setDatabaseLocked(locked: boolean): void {
  dbIsLocked = locked
}

export function initDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db

  const dbPath = getDbPath()
  console.log('Initializing database at:', dbPath)

  // Check if the database is encrypted (locked)
  if (isDbEncrypted()) {
    console.log('Database is encrypted - application is locked')
    dbIsLocked = true
    // We cannot initialize the DB while it's encrypted.
    // Return a placeholder - the app must show the lock screen.
    // We still need to create a minimal DB object so the app doesn't crash
    // on handlers that check for DB existence before the lock guard catches them.
    throw new Error('DATABASE_ENCRYPTED')
  }

  sqlite = new Database(dbPath)

  // =========================================================================
  // SECURITY PRAGMAS - Section 5.3 Database Protection
  // =========================================================================

  // Enable WAL mode for better concurrent access and crash recovery
  sqlite.pragma('journal_mode = WAL')

  // Enable foreign key constraints
  sqlite.pragma('foreign_keys = ON')

  // Enable secure delete - overwrites deleted data with zeros
  sqlite.pragma('secure_delete = ON')

  // Set page size for better performance and security
  sqlite.pragma('page_size = 4096')

  // Enable auto-vacuum for automatic space reclamation
  sqlite.pragma('auto_vacuum = INCREMENTAL')

  // Verify database integrity on startup (for non-new databases)
  if (existsSync(dbPath)) {
    const integrityOk = verifyDatabaseIntegrity(sqlite)
    if (!integrityOk) {
      console.warn('Database integrity check failed - database may be corrupted')
    }
  }

  // Protect database files with restrictive permissions
  protectDatabaseFiles(dbPath)

  db = drizzle(sqlite, { schema })

  return db
}

/**
 * Re-initialize the database after decryption.
 * Called when the user unlocks the application with a valid license key.
 */
export function reinitializeDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  // Close existing connection if any
  closeDatabase()

  // Reset lock state
  dbIsLocked = false

  const dbPath = getDbPath()
  console.log('Re-initializing database at:', dbPath)

  sqlite = new Database(dbPath)

  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.pragma('secure_delete = ON')
  sqlite.pragma('page_size = 4096')
  sqlite.pragma('auto_vacuum = INCREMENTAL')

  if (existsSync(dbPath)) {
    const integrityOk = verifyDatabaseIntegrity(sqlite)
    if (!integrityOk) {
      console.warn('Database integrity check failed - database may be corrupted')
    }
  }

  protectDatabaseFiles(dbPath)
  db = drizzle(sqlite, { schema })

  return db
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}

export function getRawDatabase(): Database.Database {
  if (!sqlite) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return sqlite
}

export { schema }
