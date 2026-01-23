/**
 * Field-Level Encryption Utilities
 * Provides AES-256-GCM encryption for sensitive financial data
 *
 * Section 5.3 Security of Financial Data - Audit Report Fix
 *
 * Encrypts sensitive fields like:
 * - Government ID numbers
 * - Firearm license numbers
 * - Tax IDs
 * - Bank account details
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, chmodSync, mkdirSync } from 'fs'
import { join } from 'path'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32
const KEY_LENGTH = 32 // 256 bits
const ENCRYPTED_PREFIX = 'ENC:' // Prefix to identify encrypted values

// Key derivation iterations (higher = more secure but slower)
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1

let encryptionKey: Buffer | null = null
let isInitialized = false

// ============================================================================
// KEY MANAGEMENT
// ============================================================================

/**
 * Get the path to the encryption key file
 */
function getKeyFilePath(): string {
  const userDataPath = app.getPath('userData')
  const secureDir = join(userDataPath, '.secure')

  if (!existsSync(secureDir)) {
    mkdirSync(secureDir, { recursive: true, mode: 0o700 })
  }

  return join(secureDir, '.enc_key')
}

/**
 * Generate a machine-specific seed for key derivation
 * Combines multiple system identifiers for uniqueness
 */
function getMachineSeed(): string {
  const os = require('os')
  const components: string[] = []

  // Add machine identifiers
  try {
    components.push(os.hostname())
    components.push(os.platform())
    components.push(os.arch())

    // Add network interface info (MAC addresses)
    const nets = os.networkInterfaces()
    for (const name of Object.keys(nets)) {
      const netInterfaces = nets[name]
      if (!netInterfaces) continue
      for (const net of netInterfaces) {
        if (net.mac && net.mac !== '00:00:00:00:00:00') {
          components.push(net.mac)
        }
      }
    }

    // Add CPU info
    const cpus = os.cpus()
    if (cpus.length > 0) {
      components.push(cpus[0].model)
    }
  } catch {
    // Fallback if system info unavailable
    components.push('firearms-pos-default-seed')
  }

  // Hash the combined components
  const hash = createHash('sha256')
  hash.update(components.join('|'))
  return hash.digest('hex')
}

/**
 * Initialize or load the encryption key
 * The key is derived from a machine-specific seed and stored salt
 */
export function initializeEncryption(): void {
  if (isInitialized) return

  const keyFilePath = getKeyFilePath()
  let salt: Buffer

  if (existsSync(keyFilePath)) {
    // Load existing salt
    try {
      const keyData = readFileSync(keyFilePath)
      salt = keyData.subarray(0, SALT_LENGTH)
    } catch {
      // If we can't read, generate new
      salt = randomBytes(SALT_LENGTH)
      saveKeyFile(salt)
    }
  } else {
    // Generate new salt
    salt = randomBytes(SALT_LENGTH)
    saveKeyFile(salt)
  }

  // Derive key from machine seed and salt
  const machineSeed = getMachineSeed()
  encryptionKey = scryptSync(machineSeed, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })

  isInitialized = true
}

/**
 * Save the salt to the key file with restrictive permissions
 */
function saveKeyFile(salt: Buffer): void {
  const keyFilePath = getKeyFilePath()

  try {
    writeFileSync(keyFilePath, salt, { mode: 0o600 })
    // Double-check permissions on Unix-like systems
    try {
      chmodSync(keyFilePath, 0o600)
    } catch {
      // Ignore chmod errors on Windows
    }
  } catch (error) {
    console.error('Failed to save encryption key file:', error)
    throw new Error('Failed to initialize encryption')
  }
}

/**
 * Get the encryption key, initializing if necessary
 */
function getKey(): Buffer {
  if (!encryptionKey) {
    initializeEncryption()
  }
  if (!encryptionKey) {
    throw new Error('Encryption not initialized')
  }
  return encryptionKey
}

// ============================================================================
// ENCRYPTION/DECRYPTION
// ============================================================================

/**
 * Encrypt a string value using AES-256-GCM
 * Returns prefixed encrypted string: ENC:iv:authTag:ciphertext (all base64)
 */
export function encryptField(plaintext: string | null | undefined): string {
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return ''
  }

  // Don't re-encrypt already encrypted values
  if (String(plaintext).startsWith(ENCRYPTED_PREFIX)) {
    return plaintext
  }

  const key = getKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  let encrypted = cipher.update(String(plaintext), 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Format: ENC:iv:authTag:ciphertext
  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt an encrypted string value
 * Returns the original plaintext
 */
export function decryptField(encryptedValue: string | null | undefined): string {
  if (encryptedValue === null || encryptedValue === undefined || encryptedValue === '') {
    return ''
  }

  const value = String(encryptedValue)

  // Return as-is if not encrypted (for backwards compatibility with existing data)
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    return value
  }

  try {
    const key = getKey()

    // Parse the encrypted format
    const parts = value.substring(ENCRYPTED_PREFIX.length).split(':')
    if (parts.length !== 3) {
      console.warn('Invalid encrypted value format')
      return value // Return as-is to avoid data loss
    }

    const [ivBase64, authTagBase64, ciphertext] = parts
    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    })
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    // Return the original value to avoid data loss
    // This can happen if the machine changes or key is corrupted
    return value
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false
  return String(value).startsWith(ENCRYPTED_PREFIX)
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Encrypt specific fields in an object
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToEncrypt) {
    const value = result[field]
    if (typeof value === 'string') {
      result[field] = encryptField(value) as T[keyof T]
    }
  }

  return result
}

/**
 * Decrypt specific fields in an object
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToDecrypt) {
    const value = result[field]
    if (typeof value === 'string') {
      result[field] = decryptField(value) as T[keyof T]
    }
  }

  return result
}

/**
 * Encrypt sensitive fields in a customer record
 */
export function encryptCustomerData<T extends Record<string, unknown>>(customer: T): T {
  return encryptFields(customer, [
    'governmentIdNumber' as keyof T,
    'firearmLicenseNumber' as keyof T,
    'dateOfBirth' as keyof T,
  ])
}

/**
 * Decrypt sensitive fields in a customer record
 */
export function decryptCustomerData<T extends Record<string, unknown>>(customer: T): T {
  return decryptFields(customer, [
    'governmentIdNumber' as keyof T,
    'firearmLicenseNumber' as keyof T,
    'dateOfBirth' as keyof T,
  ])
}

/**
 * Encrypt sensitive fields in a supplier record
 */
export function encryptSupplierData<T extends Record<string, unknown>>(supplier: T): T {
  return encryptFields(supplier, ['taxId' as keyof T])
}

/**
 * Decrypt sensitive fields in a supplier record
 */
export function decryptSupplierData<T extends Record<string, unknown>>(supplier: T): T {
  return decryptFields(supplier, ['taxId' as keyof T])
}

/**
 * Encrypt sensitive fields in business settings
 */
export function encryptBusinessSettings<T extends Record<string, unknown>>(settings: T): T {
  return encryptFields(settings, [
    'taxId' as keyof T,
    'businessRegistrationNo' as keyof T,
  ])
}

/**
 * Decrypt sensitive fields in business settings
 */
export function decryptBusinessSettings<T extends Record<string, unknown>>(settings: T): T {
  return decryptFields(settings, [
    'taxId' as keyof T,
    'businessRegistrationNo' as keyof T,
  ])
}

// ============================================================================
// MIGRATION HELPER
// ============================================================================

/**
 * Migrate existing unencrypted data to encrypted format
 * Call this once during app upgrade to encrypt existing records
 */
export async function migrateToEncrypted<T extends Record<string, unknown>>(
  records: T[],
  fieldsToEncrypt: (keyof T)[],
  updateCallback: (record: T) => Promise<void>
): Promise<{ migrated: number; failed: number }> {
  let migrated = 0
  let failed = 0

  for (const record of records) {
    try {
      let needsUpdate = false

      // Check if any field needs encryption
      for (const field of fieldsToEncrypt) {
        const value = record[field]
        if (typeof value === 'string' && value && !isEncrypted(value)) {
          needsUpdate = true
          break
        }
      }

      if (needsUpdate) {
        const encrypted = encryptFields(record, fieldsToEncrypt)
        await updateCallback(encrypted)
        migrated++
      }
    } catch (error) {
      console.error('Failed to migrate record:', error)
      failed++
    }
  }

  return { migrated, failed }
}

// ============================================================================
// SECURE STRING COMPARISON
// ============================================================================

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
