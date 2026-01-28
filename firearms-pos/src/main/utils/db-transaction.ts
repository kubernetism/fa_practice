import { getRawDatabase, getDatabase } from '../db/index'
import type Database from 'better-sqlite3-multiple-ciphers'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '../db/schema'

type DrizzleDb = BetterSQLite3Database<typeof schema>

interface TransactionContext {
  rawDb: Database.Database
  db: DrizzleDb
}

/**
 * Wraps database operations in an SQLite transaction with automatic rollback on error.
 *
 * This utility ensures data integrity by:
 * - Starting an IMMEDIATE transaction (prevents other writes during transaction)
 * - Automatically committing on success
 * - Automatically rolling back on any error
 *
 * Usage:
 * ```typescript
 * const result = await withTransaction(async ({ db, rawDb }) => {
 *   // All database operations here will be atomic
 *   const sale = await db.insert(sales).values({...}).returning()
 *   await db.insert(saleItems).values({...})
 *   return sale
 * })
 * ```
 *
 * @param fn - Async function containing database operations
 * @returns The result of the function
 * @throws Rethrows any error after rolling back
 */
export async function withTransaction<T>(
  fn: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  const rawDb = getRawDatabase()
  const db = getDatabase()

  // Use IMMEDIATE to acquire write lock immediately
  // This prevents other connections from writing during our transaction
  rawDb.exec('BEGIN IMMEDIATE')

  try {
    const result = await fn({ rawDb, db })
    rawDb.exec('COMMIT')
    return result
  } catch (error) {
    rawDb.exec('ROLLBACK')
    throw error
  }
}

/**
 * Synchronous version for when all operations are synchronous.
 * Prefer withTransaction for async operations.
 *
 * @param fn - Synchronous function containing database operations
 * @returns The result of the function
 * @throws Rethrows any error after rolling back
 */
export function withTransactionSync<T>(
  fn: (ctx: TransactionContext) => T
): T {
  const rawDb = getRawDatabase()
  const db = getDatabase()

  rawDb.exec('BEGIN IMMEDIATE')

  try {
    const result = fn({ rawDb, db })
    rawDb.exec('COMMIT')
    return result
  } catch (error) {
    rawDb.exec('ROLLBACK')
    throw error
  }
}

/**
 * Helper to check if we're currently in a transaction.
 * Useful for nested operations that might need to handle transactions differently.
 */
export function isInTransaction(): boolean {
  const rawDb = getRawDatabase()
  return rawDb.inTransaction
}
