import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync, chmodSync, statSync } from 'node:fs'
import { join } from 'node:path'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null
let sqlite: Database.Database | null = null

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

export function initDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db

  const dbPath = getDbPath()
  console.log('Initializing database at:', dbPath)

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
