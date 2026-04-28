/**
 * Streaming AES-256-GCM encryptor/decryptor for the FPB backup file format.
 *
 * Layout: [64-byte header][ciphertext]. The GCM auth tag is patched into the
 * header (offset 40..55) after the cipher finalizes, since it is only known
 * once all plaintext has been processed.
 */

import crypto from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { FPB_HEADER_SIZE, InvalidFpbError, parseHeader, writeHeader } from './fpb-format'
import { type KdfParams, deriveKey } from './passphrase-kdf'

const IV_LENGTH = 12
const AUTH_TAG_OFFSET = 40
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16

export interface EncryptOptions {
  plaintextPath: string
  outPath: string
  passphrase: string
  salt: Buffer
  kdfParams: KdfParams
}

export interface EncryptResult {
  plaintextSize: number
  ciphertextSize: number
}

export interface DecryptOptions {
  fpbPath: string
  outPath: string
  passphrase: string
}

export interface DecryptResult {
  plaintextSize: number
}

export async function encryptToFpb(opts: EncryptOptions): Promise<EncryptResult> {
  if (opts.salt.length !== SALT_LENGTH) {
    throw new InvalidFpbError(`Salt must be ${SALT_LENGTH} bytes, got ${opts.salt.length}`)
  }

  const stat = await fs.stat(opts.plaintextPath)
  const plaintextSize = stat.size

  const iv = crypto.randomBytes(IV_LENGTH)
  const key = await deriveKey(opts.passphrase, opts.salt, opts.kdfParams)

  const headerBuf = Buffer.alloc(FPB_HEADER_SIZE)
  writeHeader(headerBuf, {
    salt: opts.salt,
    iv,
    m: opts.kdfParams.mKib,
    t: opts.kdfParams.t,
    p: opts.kdfParams.p,
    plaintextSize: BigInt(plaintextSize),
  })

  // Write placeholder header, then stream ciphertext appended after it.
  await fs.writeFile(opts.outPath, headerBuf)

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const readStream = createReadStream(opts.plaintextPath)
  const writeStream = createWriteStream(opts.outPath, { flags: 'a' })

  await pipeline(readStream, cipher, writeStream)

  const authTag = cipher.getAuthTag()

  // Patch the auth tag into the header at offset 40.
  const handle = await fs.open(opts.outPath, 'r+')
  try {
    await handle.write(authTag, 0, AUTH_TAG_LENGTH, AUTH_TAG_OFFSET)
  } finally {
    await handle.close()
  }

  const finalStat = await fs.stat(opts.outPath)
  const ciphertextSize = finalStat.size - FPB_HEADER_SIZE

  return { plaintextSize, ciphertextSize }
}

export async function decryptFromFpb(opts: DecryptOptions): Promise<DecryptResult> {
  const handle = await fs.open(opts.fpbPath, 'r')
  let headerBuf: Buffer
  try {
    headerBuf = Buffer.alloc(FPB_HEADER_SIZE)
    const { bytesRead } = await handle.read(headerBuf, 0, FPB_HEADER_SIZE, 0)
    if (bytesRead !== FPB_HEADER_SIZE) {
      throw new InvalidFpbError(`FPB file too small: ${bytesRead} header bytes read`)
    }
  } finally {
    await handle.close()
  }

  const header = parseHeader(headerBuf)

  const key = await deriveKey(opts.passphrase, header.salt, {
    mKib: header.m,
    t: header.t,
    p: header.p,
  })

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, header.iv)
  decipher.setAuthTag(header.authTag)

  const readStream = createReadStream(opts.fpbPath, { start: FPB_HEADER_SIZE })
  const writeStream = createWriteStream(opts.outPath)

  try {
    await pipeline(readStream, decipher, writeStream)
  } catch (err) {
    // Clean up the partial output so callers don't read garbage.
    await fs.rm(opts.outPath, { force: true })
    throw new Error('Decryption failed: invalid passphrase or corrupted file', { cause: err })
  }

  const outStat = await fs.stat(opts.outPath)
  const expected = Number(header.plaintextSize)
  if (outStat.size !== expected) {
    await fs.rm(opts.outPath, { force: true })
    throw new Error(
      `Decryption size mismatch: header reports ${expected} bytes, wrote ${outStat.size}`,
    )
  }

  return { plaintextSize: outStat.size }
}
