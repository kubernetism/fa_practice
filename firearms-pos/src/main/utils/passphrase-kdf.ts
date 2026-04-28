/**
 * Passphrase key-derivation utility using argon2id.
 *
 * Used by the online backup feature to derive AES-256-GCM keys from user
 * passphrases and to store/verify a passphrase hash without retaining the key.
 */

import crypto from 'node:crypto'
import argon2 from 'argon2'

export interface KdfParams {
  mKib: number
  t: number
  p: number
}

const KEY_LENGTH = 32
const SALT_LENGTH = 16

/**
 * Derive a 32-byte raw key from a passphrase via argon2id, suitable for AES-256-GCM.
 */
export async function deriveKey(
  passphrase: string,
  salt: Buffer,
  params: KdfParams,
): Promise<Buffer> {
  return argon2.hash(passphrase, {
    type: argon2.argon2id,
    raw: true,
    hashLength: KEY_LENGTH,
    salt,
    memoryCost: params.mKib,
    timeCost: params.t,
    parallelism: params.p,
  })
}

/**
 * Produce an encoded argon2id digest string for verifying the passphrase later.
 * The encoded form already includes the salt and parameters.
 */
export async function hashVerifier(
  passphrase: string,
  salt: Buffer,
  params: KdfParams,
): Promise<string> {
  return argon2.hash(passphrase, {
    type: argon2.argon2id,
    salt,
    memoryCost: params.mKib,
    timeCost: params.t,
    parallelism: params.p,
  })
}

/**
 * Verify a passphrase against a stored argon2id encoded hash.
 * Returns false on any error (malformed hash, mismatch, etc.).
 */
export async function verifyPassphrase(passphrase: string, expectedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(expectedHash, passphrase)
  } catch {
    return false
  }
}

/**
 * Generate a 16-byte random salt.
 */
export function randomSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH)
}
