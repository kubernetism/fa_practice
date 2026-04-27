import { describe, expect, it } from 'vitest'
import {
  FPB_HEADER_SIZE,
  FPB_MAGIC,
  FPB_VERSION,
  InvalidFpbError,
  parseHeader,
  writeAuthTag,
  writeHeader,
} from '../fpb-format'

function makeSalt(): Buffer {
  return Buffer.from('0123456789abcdef', 'utf8') // 16 bytes
}

function makeIv(): Buffer {
  return Buffer.from('abcdefghijkl', 'utf8') // 12 bytes
}

function makeAuthTag(): Buffer {
  return Buffer.from('ZZZZZZZZZZZZZZZZ', 'utf8') // 16 bytes
}

describe('fpb-format constants', () => {
  it('FPB_HEADER_SIZE equals 64', () => {
    expect(FPB_HEADER_SIZE).toBe(64)
  })

  it('FPB_MAGIC is "FPB1"', () => {
    expect(FPB_MAGIC.toString('utf8')).toBe('FPB1')
    expect(FPB_MAGIC.length).toBe(4)
    expect(FPB_MAGIC[0]).toBe(0x46)
    expect(FPB_MAGIC[1]).toBe(0x50)
    expect(FPB_MAGIC[2]).toBe(0x42)
    expect(FPB_MAGIC[3]).toBe(0x31)
  })

  it('FPB_VERSION is 0x01', () => {
    expect(FPB_VERSION).toBe(0x01)
  })
})

describe('writeHeader / parseHeader round-trip', () => {
  it('round-trips all fields correctly', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    const salt = makeSalt()
    const iv = makeIv()
    const params = {
      salt,
      iv,
      m: 65536,
      t: 3,
      p: 4,
      plaintextSize: 1234567890n,
    }

    writeHeader(buf, params)
    const parsed = parseHeader(buf)

    expect(parsed.version).toBe(FPB_VERSION)
    expect(parsed.kdfId).toBe(0x01)
    expect(parsed.m).toBe(65536)
    expect(parsed.t).toBe(3)
    expect(parsed.p).toBe(4)
    expect(parsed.salt.equals(salt)).toBe(true)
    expect(parsed.iv.equals(iv)).toBe(true)
    expect(parsed.authTag.equals(Buffer.alloc(16))).toBe(true)
    expect(parsed.plaintextSize).toBe(1234567890n)
  })

  it('writeAuthTag fills bytes 40..55 and parseHeader returns it', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1024,
      t: 1,
      p: 1,
      plaintextSize: 0n,
    })

    const tag = makeAuthTag()
    writeAuthTag(buf, tag)

    const parsed = parseHeader(buf)
    expect(parsed.authTag.equals(tag)).toBe(true)
    // Other fields still intact
    expect(parsed.m).toBe(1024)
  })

  it('handles large plaintextSize values (uint64)', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    const big = (1n << 40n) + 7n // larger than 32 bits
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1,
      t: 1,
      p: 1,
      plaintextSize: big,
    })
    expect(parseHeader(buf).plaintextSize).toBe(big)
  })

  it('writes magic at offset 0', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1,
      t: 1,
      p: 1,
      plaintextSize: 0n,
    })
    expect(buf.subarray(0, 4).equals(FPB_MAGIC)).toBe(true)
  })
})

describe('writeHeader input validation', () => {
  it('throws InvalidFpbError if salt is not 16 bytes', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    expect(() =>
      writeHeader(buf, {
        salt: Buffer.alloc(15),
        iv: makeIv(),
        m: 1,
        t: 1,
        p: 1,
        plaintextSize: 0n,
      }),
    ).toThrow(InvalidFpbError)
  })

  it('throws InvalidFpbError if iv is not 12 bytes', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    expect(() =>
      writeHeader(buf, {
        salt: makeSalt(),
        iv: Buffer.alloc(16),
        m: 1,
        t: 1,
        p: 1,
        plaintextSize: 0n,
      }),
    ).toThrow(InvalidFpbError)
  })

  it('throws InvalidFpbError if header buffer is shorter than 64 bytes', () => {
    expect(() =>
      writeHeader(Buffer.alloc(63), {
        salt: makeSalt(),
        iv: makeIv(),
        m: 1,
        t: 1,
        p: 1,
        plaintextSize: 0n,
      }),
    ).toThrow(InvalidFpbError)
  })
})

describe('writeAuthTag input validation', () => {
  it('throws InvalidFpbError if authTag is not 16 bytes', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    expect(() => writeAuthTag(buf, Buffer.alloc(15))).toThrow(InvalidFpbError)
  })

  it('throws InvalidFpbError if header buffer is shorter than 64 bytes', () => {
    expect(() => writeAuthTag(Buffer.alloc(40), makeAuthTag())).toThrow(InvalidFpbError)
  })
})

describe('parseHeader rejects malformed buffers', () => {
  it('rejects buffer shorter than 64 bytes', () => {
    expect(() => parseHeader(Buffer.alloc(63))).toThrow(InvalidFpbError)
  })

  it('rejects wrong magic', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1,
      t: 1,
      p: 1,
      plaintextSize: 0n,
    })
    buf[0] = 0x00 // corrupt magic
    expect(() => parseHeader(buf)).toThrow(InvalidFpbError)
  })

  it('rejects wrong version', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1,
      t: 1,
      p: 1,
      plaintextSize: 0n,
    })
    buf[4] = 0x99 // unsupported version
    expect(() => parseHeader(buf)).toThrow(InvalidFpbError)
  })

  it('rejects unknown KDF id', () => {
    const buf = Buffer.alloc(FPB_HEADER_SIZE)
    writeHeader(buf, {
      salt: makeSalt(),
      iv: makeIv(),
      m: 1,
      t: 1,
      p: 1,
      plaintextSize: 0n,
    })
    buf[5] = 0x99 // unknown KDF
    expect(() => parseHeader(buf)).toThrow(InvalidFpbError)
  })
})
