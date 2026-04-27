/**
 * FPB File Format (Firearms POS Backup, version 1)
 *
 * 64-byte header followed by AES-256-GCM ciphertext payload.
 *
 * Header layout:
 *   Offset  Size  Field
 *   0       4     Magic "FPB1" (0x46 0x50 0x42 0x31)
 *   4       1     Version (0x01)
 *   5       1     KDF id (0x01 = argon2id)
 *   6       4     argon m_kib (uint32 LE)
 *   10      1     argon t (uint8)
 *   11      1     argon p (uint8)
 *   12      16    Salt
 *   28      12    IV (96 bits for AES-GCM)
 *   40      16    Auth tag (filled at end of stream)
 *   56      8     Plaintext size (uint64 LE, optional/diagnostic)
 *
 * Pure utility module: no I/O, no DB. Only Buffer manipulation.
 */

export const FPB_MAGIC = Buffer.from([0x46, 0x50, 0x42, 0x31]) // "FPB1"
export const FPB_VERSION = 0x01
export const FPB_HEADER_SIZE = 64

const KDF_ID_ARGON2ID = 0x01

const SALT_LENGTH = 16
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

// Header field offsets
const OFFSET_MAGIC = 0
const OFFSET_VERSION = 4
const OFFSET_KDF_ID = 5
const OFFSET_ARGON_M = 6
const OFFSET_ARGON_T = 10
const OFFSET_ARGON_P = 11
const OFFSET_SALT = 12
const OFFSET_IV = 28
const OFFSET_AUTH_TAG = 40
const OFFSET_PLAINTEXT_SIZE = 56

export class InvalidFpbError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidFpbError'
  }
}

export interface WriteHeaderParams {
  salt: Buffer
  iv: Buffer
  m: number
  t: number
  p: number
  plaintextSize: bigint
}

export interface ParsedFpbHeader {
  version: number
  kdfId: number
  m: number
  t: number
  p: number
  salt: Buffer
  iv: Buffer
  authTag: Buffer
  plaintextSize: bigint
}

/**
 * Write a 64-byte FPB header into the start of `buf`.
 * The auth tag region (offset 40..55) is zeroed; call writeAuthTag() after
 * encryption finishes to fill it.
 */
export function writeHeader(buf: Buffer, params: WriteHeaderParams): void {
  if (buf.length < FPB_HEADER_SIZE) {
    throw new InvalidFpbError(
      `Header buffer too small: ${buf.length} bytes, expected at least ${FPB_HEADER_SIZE}`,
    )
  }
  if (params.salt.length !== SALT_LENGTH) {
    throw new InvalidFpbError(`Salt must be ${SALT_LENGTH} bytes, got ${params.salt.length}`)
  }
  if (params.iv.length !== IV_LENGTH) {
    throw new InvalidFpbError(`IV must be ${IV_LENGTH} bytes, got ${params.iv.length}`)
  }

  // Magic
  FPB_MAGIC.copy(buf, OFFSET_MAGIC)
  // Version + KDF id
  buf.writeUInt8(FPB_VERSION, OFFSET_VERSION)
  buf.writeUInt8(KDF_ID_ARGON2ID, OFFSET_KDF_ID)
  // Argon2 parameters
  buf.writeUInt32LE(params.m, OFFSET_ARGON_M)
  buf.writeUInt8(params.t, OFFSET_ARGON_T)
  buf.writeUInt8(params.p, OFFSET_ARGON_P)
  // Salt + IV
  params.salt.copy(buf, OFFSET_SALT)
  params.iv.copy(buf, OFFSET_IV)
  // Auth tag region zeroed (filled later by writeAuthTag)
  buf.fill(0, OFFSET_AUTH_TAG, OFFSET_AUTH_TAG + AUTH_TAG_LENGTH)
  // Plaintext size (uint64 LE)
  buf.writeBigUInt64LE(params.plaintextSize, OFFSET_PLAINTEXT_SIZE)
}

/**
 * Write the AES-GCM auth tag into bytes 40..55 of an already-written header buffer.
 * Used by the encryption stream once it has finalized.
 */
export function writeAuthTag(buf: Buffer, authTag: Buffer): void {
  if (buf.length < FPB_HEADER_SIZE) {
    throw new InvalidFpbError(
      `Header buffer too small: ${buf.length} bytes, expected at least ${FPB_HEADER_SIZE}`,
    )
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new InvalidFpbError(`Auth tag must be ${AUTH_TAG_LENGTH} bytes, got ${authTag.length}`)
  }
  authTag.copy(buf, OFFSET_AUTH_TAG)
}

/**
 * Parse the 64-byte header at the start of `buf`.
 * Returns owned (copied) sub-buffers so the caller can mutate the source freely.
 * Throws InvalidFpbError on any structural problem.
 */
export function parseHeader(buf: Buffer): ParsedFpbHeader {
  if (buf.length < FPB_HEADER_SIZE) {
    throw new InvalidFpbError(
      `Header buffer too small: ${buf.length} bytes, expected at least ${FPB_HEADER_SIZE}`,
    )
  }

  const magic = buf.subarray(OFFSET_MAGIC, OFFSET_MAGIC + 4)
  if (!magic.equals(FPB_MAGIC)) {
    throw new InvalidFpbError(`Invalid magic: expected FPB1, got 0x${magic.toString('hex')}`)
  }

  const version = buf.readUInt8(OFFSET_VERSION)
  if (version !== FPB_VERSION) {
    throw new InvalidFpbError(`Unsupported FPB version: ${version} (expected ${FPB_VERSION})`)
  }

  const kdfId = buf.readUInt8(OFFSET_KDF_ID)
  if (kdfId !== KDF_ID_ARGON2ID) {
    throw new InvalidFpbError(`Unknown KDF id: ${kdfId}`)
  }

  const m = buf.readUInt32LE(OFFSET_ARGON_M)
  const t = buf.readUInt8(OFFSET_ARGON_T)
  const p = buf.readUInt8(OFFSET_ARGON_P)
  const salt = Buffer.from(buf.subarray(OFFSET_SALT, OFFSET_SALT + SALT_LENGTH))
  const iv = Buffer.from(buf.subarray(OFFSET_IV, OFFSET_IV + IV_LENGTH))
  const authTag = Buffer.from(buf.subarray(OFFSET_AUTH_TAG, OFFSET_AUTH_TAG + AUTH_TAG_LENGTH))
  const plaintextSize = buf.readBigUInt64LE(OFFSET_PLAINTEXT_SIZE)

  return { version, kdfId, m, t, p, salt, iv, authTag, plaintextSize }
}
