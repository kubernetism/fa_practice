import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { decryptFromFpb, encryptToFpb } from '../fpb-encryptor'
import { FPB_HEADER_SIZE } from '../fpb-format'

const KDF_PARAMS = { mKib: 1024, t: 2, p: 1 }
const PASSPHRASE = 'correct horse battery staple'

let workDir: string

beforeEach(async () => {
  workDir = await fs.mkdtemp(path.join(tmpdir(), 'fpb-enc-'))
})

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true })
})

function paths() {
  return {
    plain: path.join(workDir, 'plain.bin'),
    fpb: path.join(workDir, 'out.fpb'),
    decrypted: path.join(workDir, 'decrypted.bin'),
  }
}

describe('fpb-encryptor round-trip', () => {
  it('encrypts and decrypts a small file', async () => {
    const { plain, fpb, decrypted } = paths()
    const content = Buffer.from('hello world', 'utf8')
    await fs.writeFile(plain, content)

    const salt = crypto.randomBytes(16)
    const enc = await encryptToFpb({
      plaintextPath: plain,
      outPath: fpb,
      passphrase: PASSPHRASE,
      salt,
      kdfParams: KDF_PARAMS,
    })
    expect(enc.plaintextSize).toBe(content.length)
    expect(enc.ciphertextSize).toBe(content.length)

    const dec = await decryptFromFpb({
      fpbPath: fpb,
      outPath: decrypted,
      passphrase: PASSPHRASE,
    })
    expect(dec.plaintextSize).toBe(content.length)

    const got = await fs.readFile(decrypted)
    expect(got.equals(content)).toBe(true)
  })

  it('encrypts and decrypts a 1 MB random file byte-for-byte', async () => {
    const { plain, fpb, decrypted } = paths()
    const content = crypto.randomBytes(1024 * 1024)
    await fs.writeFile(plain, content)

    const salt = crypto.randomBytes(16)
    await encryptToFpb({
      plaintextPath: plain,
      outPath: fpb,
      passphrase: PASSPHRASE,
      salt,
      kdfParams: KDF_PARAMS,
    })
    await decryptFromFpb({ fpbPath: fpb, outPath: decrypted, passphrase: PASSPHRASE })

    const got = await fs.readFile(decrypted)
    expect(got.length).toBe(content.length)
    expect(got.equals(content)).toBe(true)
  })

  it('round-trips an empty plaintext file', async () => {
    const { plain, fpb, decrypted } = paths()
    await fs.writeFile(plain, Buffer.alloc(0))

    const salt = crypto.randomBytes(16)
    const enc = await encryptToFpb({
      plaintextPath: plain,
      outPath: fpb,
      passphrase: PASSPHRASE,
      salt,
      kdfParams: KDF_PARAMS,
    })
    expect(enc.plaintextSize).toBe(0)
    expect(enc.ciphertextSize).toBe(0)

    const dec = await decryptFromFpb({
      fpbPath: fpb,
      outPath: decrypted,
      passphrase: PASSPHRASE,
    })
    expect(dec.plaintextSize).toBe(0)

    const got = await fs.readFile(decrypted)
    expect(got.length).toBe(0)
  })

  it('output FPB consists of 64-byte header followed by ciphertext of plaintext length', async () => {
    const { plain, fpb } = paths()
    const content = crypto.randomBytes(4096)
    await fs.writeFile(plain, content)

    const salt = crypto.randomBytes(16)
    await encryptToFpb({
      plaintextPath: plain,
      outPath: fpb,
      passphrase: PASSPHRASE,
      salt,
      kdfParams: KDF_PARAMS,
    })

    const stat = await fs.stat(fpb)
    expect(stat.size).toBe(FPB_HEADER_SIZE + content.length)
  })
})

describe('fpb-encryptor failure modes', () => {
  async function makeEncrypted(): Promise<{ plain: string; fpb: string; decrypted: string }> {
    const p = paths()
    const content = Buffer.from('the quick brown fox jumps over the lazy dog', 'utf8')
    await fs.writeFile(p.plain, content)
    const salt = crypto.randomBytes(16)
    await encryptToFpb({
      plaintextPath: p.plain,
      outPath: p.fpb,
      passphrase: PASSPHRASE,
      salt,
      kdfParams: KDF_PARAMS,
    })
    return p
  }

  it('rejects a wrong passphrase', async () => {
    const { fpb, decrypted } = await makeEncrypted()
    await expect(
      decryptFromFpb({ fpbPath: fpb, outPath: decrypted, passphrase: 'wrong-passphrase' }),
    ).rejects.toThrow(/Decryption failed/)
  })

  it('rejects tampered ciphertext (byte flip after the header)', async () => {
    const { fpb, decrypted } = await makeEncrypted()
    const handle = await fs.open(fpb, 'r+')
    try {
      const buf = Buffer.alloc(1)
      await handle.read(buf, 0, 1, FPB_HEADER_SIZE + 5)
      buf[0] = (buf[0] ?? 0) ^ 0xff
      await handle.write(buf, 0, 1, FPB_HEADER_SIZE + 5)
    } finally {
      await handle.close()
    }

    await expect(
      decryptFromFpb({ fpbPath: fpb, outPath: decrypted, passphrase: PASSPHRASE }),
    ).rejects.toThrow(/Decryption failed/)
  })

  it('rejects a tampered header (kdfId byte changed)', async () => {
    const { fpb, decrypted } = await makeEncrypted()
    const handle = await fs.open(fpb, 'r+')
    try {
      // Offset 5 is KDF id; flip it to an unknown value to trigger parseHeader.
      await handle.write(Buffer.from([0x99]), 0, 1, 5)
    } finally {
      await handle.close()
    }

    await expect(
      decryptFromFpb({ fpbPath: fpb, outPath: decrypted, passphrase: PASSPHRASE }),
    ).rejects.toThrow()
  })
})
