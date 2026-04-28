import { describe, expect, it } from 'vitest'
import {
  type KdfParams,
  deriveKey,
  hashVerifier,
  randomSalt,
  verifyPassphrase,
} from '../passphrase-kdf'

const FAST_PARAMS: KdfParams = { mKib: 1024, t: 2, p: 1 }

describe('deriveKey', () => {
  it('returns a 32-byte Buffer', async () => {
    const salt = randomSalt()
    const key = await deriveKey('hunter2', salt, FAST_PARAMS)
    expect(Buffer.isBuffer(key)).toBe(true)
    expect(key.length).toBe(32)
  })

  it('is deterministic for same passphrase, salt, and params', async () => {
    const salt = randomSalt()
    const a = await deriveKey('hunter2', salt, FAST_PARAMS)
    const b = await deriveKey('hunter2', salt, FAST_PARAMS)
    expect(a.equals(b)).toBe(true)
  })

  it('produces different keys for different salts', async () => {
    const a = await deriveKey('hunter2', randomSalt(), FAST_PARAMS)
    const b = await deriveKey('hunter2', randomSalt(), FAST_PARAMS)
    expect(a.equals(b)).toBe(false)
  })

  it('produces different keys for different passphrases', async () => {
    const salt = randomSalt()
    const a = await deriveKey('hunter2', salt, FAST_PARAMS)
    const b = await deriveKey('hunter3', salt, FAST_PARAMS)
    expect(a.equals(b)).toBe(false)
  })
})

describe('randomSalt', () => {
  it('returns 16 bytes and is non-deterministic', () => {
    const a = randomSalt()
    const b = randomSalt()
    expect(a.length).toBe(16)
    expect(b.length).toBe(16)
    expect(a.equals(b)).toBe(false)
  })
})

describe('hashVerifier', () => {
  it('returns an encoded argon2id digest string', async () => {
    const hash = await hashVerifier('hunter2', randomSalt(), FAST_PARAMS)
    expect(typeof hash).toBe('string')
    expect(hash.startsWith('$argon2id$')).toBe(true)
  })
})

describe('verifyPassphrase', () => {
  it('returns true for a matching passphrase', async () => {
    const hash = await hashVerifier('hunter2', randomSalt(), FAST_PARAMS)
    expect(await verifyPassphrase('hunter2', hash)).toBe(true)
  })

  it('returns false for a wrong passphrase', async () => {
    const hash = await hashVerifier('hunter2', randomSalt(), FAST_PARAMS)
    expect(await verifyPassphrase('hunter3', hash)).toBe(false)
  })

  it('returns false (does not throw) for a malformed hash', async () => {
    expect(await verifyPassphrase('hunter2', 'not-a-real-argon2-hash')).toBe(false)
  })
})
