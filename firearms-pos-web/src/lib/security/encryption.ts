import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT = 'firearms-pos-salt' // Fixed salt for key derivation consistency

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ''
  if (!secret) {
    throw new Error('ENCRYPTION_KEY or NEXTAUTH_SECRET environment variable is required')
  }
  return scryptSync(secret, SALT, 32)
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64 string containing IV + auth tag + ciphertext.
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext

  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Store as: iv (hex) + : + authTag (hex) + : + ciphertext (hex)
  return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an encrypted string produced by encrypt().
 * Returns the original plaintext.
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.startsWith('enc:')) return encryptedData

  const key = getKey()
  const parts = encryptedData.split(':')
  if (parts.length !== 4) return encryptedData

  const iv = Buffer.from(parts[1], 'hex')
  const authTag = Buffer.from(parts[2], 'hex')
  const ciphertext = parts[3]

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/** Check if a value is encrypted (starts with enc: prefix) */
export function isEncrypted(value: string): boolean {
  return !!value && value.startsWith('enc:')
}

/**
 * Encrypt sensitive customer fields (government IDs, license numbers).
 * Returns a new object with encrypted values for sensitive fields.
 */
export function encryptCustomerData<T extends Record<string, any>>(data: T): T {
  const sensitiveFields = [
    'governmentIdNumber',
    'firearmLicenseNumber',
  ]

  const result = { ...data }
  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === 'string' && !isEncrypted(result[field])) {
      ;(result as any)[field] = encrypt(result[field])
    }
  }
  return result
}

/**
 * Decrypt sensitive customer fields for display.
 * Returns a new object with decrypted values for sensitive fields.
 */
export function decryptCustomerData<T extends Record<string, any>>(data: T): T {
  const sensitiveFields = [
    'governmentIdNumber',
    'firearmLicenseNumber',
  ]

  const result = { ...data }
  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === 'string' && isEncrypted(result[field])) {
      ;(result as any)[field] = decrypt(result[field])
    }
  }
  return result
}
