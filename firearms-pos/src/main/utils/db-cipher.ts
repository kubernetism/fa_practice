import Database from 'better-sqlite3-multiple-ciphers'
import { createHash, pbkdf2Sync } from 'node:crypto'
import { existsSync, unlinkSync, renameSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { getMachineId } from './license'

const CIPHER_SALT = 'FIREARMS_POS_CIPHER_2024'
const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 32

function getLockStatusFilePath(): string {
  return join(app.getPath('userData'), 'lock-status.json')
}

/**
 * Derive an encryption key from the machine ID using PBKDF2.
 * This ties the encrypted DB to the specific machine.
 */
function deriveEncryptionKey(): string {
  const machineId = getMachineId()
  const salt = createHash('sha256').update(CIPHER_SALT).digest()
  const key = pbkdf2Sync(machineId, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')
  return key.toString('hex')
}

/**
 * Check if the database is currently encrypted by reading the lock status file.
 */
export function isDbEncrypted(): boolean {
  const statusPath = getLockStatusFilePath()
  if (!existsSync(statusPath)) {
    return false
  }
  try {
    const data = JSON.parse(readFileSync(statusPath, 'utf-8'))
    return data.isEncrypted === true
  } catch {
    return false
  }
}

/**
 * Set the encryption status flag in the lock status file.
 */
function setEncryptionStatus(isEncrypted: boolean): void {
  const statusPath = getLockStatusFilePath()
  writeFileSync(
    statusPath,
    JSON.stringify({
      isEncrypted,
      updatedAt: new Date().toISOString(),
    }),
  )
}

/**
 * Encrypt the database file using SQLCipher.
 * 1. Opens the plain DB
 * 2. Exports it to an encrypted copy using sqlcipher_export
 * 3. Replaces the original with the encrypted version
 */
export function encryptDatabase(dbPath: string): { success: boolean; message: string } {
  if (isDbEncrypted()) {
    return { success: true, message: 'Database is already encrypted.' }
  }

  if (!existsSync(dbPath)) {
    return { success: false, message: 'Database file not found.' }
  }

  const encryptedPath = `${dbPath}.encrypted`
  const key = deriveEncryptionKey()

  try {
    // Open the plain database
    const plainDb = new Database(dbPath)

    // Attach the encrypted database and export data to it
    plainDb.pragma(`rekey='${key}'`)
    plainDb.close()

    // Mark as encrypted
    setEncryptionStatus(true)

    // Clean up WAL and SHM files (they're not needed after re-keying)
    const walPath = `${dbPath}-wal`
    const shmPath = `${dbPath}-shm`
    if (existsSync(walPath)) {
      try { unlinkSync(walPath) } catch { /* ignore */ }
    }
    if (existsSync(shmPath)) {
      try { unlinkSync(shmPath) } catch { /* ignore */ }
    }

    console.log('Database encrypted successfully')
    return { success: true, message: 'Database encrypted successfully.' }
  } catch (error) {
    console.error('Failed to encrypt database:', error)
    // Clean up on failure
    if (existsSync(encryptedPath)) {
      try { unlinkSync(encryptedPath) } catch { /* ignore */ }
    }
    return {
      success: false,
      message: `Failed to encrypt database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Decrypt the database file.
 * 1. Opens the encrypted DB with the key
 * 2. Removes the encryption by re-keying with empty string
 */
export function decryptDatabase(dbPath: string): { success: boolean; message: string } {
  if (!isDbEncrypted()) {
    return { success: true, message: 'Database is not encrypted.' }
  }

  if (!existsSync(dbPath)) {
    return { success: false, message: 'Database file not found.' }
  }

  const key = deriveEncryptionKey()

  try {
    // Open the encrypted database with the key
    const encDb = new Database(dbPath)
    encDb.pragma(`key='${key}'`)

    // Verify we can read the database
    const result = encDb.pragma('integrity_check')
    if (!Array.isArray(result) || result.length === 0) {
      encDb.close()
      return { success: false, message: 'Failed to verify encrypted database.' }
    }

    const checkResult = result[0] as { integrity_check?: string }
    if (checkResult.integrity_check !== 'ok') {
      encDb.close()
      return { success: false, message: 'Encrypted database integrity check failed.' }
    }

    // Remove encryption by re-keying with empty string
    encDb.pragma("rekey=''")
    encDb.close()

    // Mark as decrypted
    setEncryptionStatus(false)

    // Clean up WAL and SHM files
    const walPath = `${dbPath}-wal`
    const shmPath = `${dbPath}-shm`
    if (existsSync(walPath)) {
      try { unlinkSync(walPath) } catch { /* ignore */ }
    }
    if (existsSync(shmPath)) {
      try { unlinkSync(shmPath) } catch { /* ignore */ }
    }

    console.log('Database decrypted successfully')
    return { success: true, message: 'Database decrypted successfully.' }
  } catch (error) {
    console.error('Failed to decrypt database:', error)
    return {
      success: false,
      message: `Failed to decrypt database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
