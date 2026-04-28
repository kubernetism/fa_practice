import { existsSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3-multiple-ciphers'
import { afterEach, describe, expect, it } from 'vitest'
import {
  encryptPlaintextToMachineKey,
  exportEncryptedDbToPlaintext,
} from '../db-cipher'

const KEY = Buffer.alloc(32, 0xab)
const WRONG_KEY = Buffer.alloc(32, 0x00)

const cleanupPaths: string[] = []

function tmpPath(suffix: string): string {
  const p = join(tmpdir(), `db-cipher-export-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}-${suffix}`)
  cleanupPaths.push(p)
  return p
}

function safeUnlink(p: string): void {
  if (existsSync(p)) {
    try {
      unlinkSync(p)
    } catch {
      /* ignore */
    }
  }
}

afterEach(() => {
  while (cleanupPaths.length > 0) {
    const p = cleanupPaths.pop()
    if (!p) continue
    safeUnlink(p)
    safeUnlink(`${p}-wal`)
    safeUnlink(`${p}-shm`)
    safeUnlink(`${p}-journal`)
  }
})

function createEncryptedDb(path: string, key: Buffer): void {
  const db = new Database(path)
  db.pragma(`key='${key.toString('hex')}'`)
  db.pragma('journal_mode=DELETE')
  db.exec('CREATE TABLE t (id INTEGER, val TEXT)')
  db.prepare('INSERT INTO t (id, val) VALUES (?, ?)').run(1, 'hello')
  db.close()
}

describe('exportEncryptedDbToPlaintext', () => {
  it('decrypts an encrypted db into a readable plaintext copy', () => {
    const srcPath = tmpPath('src.db')
    const plainPath = tmpPath('plain.db')

    createEncryptedDb(srcPath, KEY)
    exportEncryptedDbToPlaintext(srcPath, KEY, plainPath)

    const db = new Database(plainPath)
    const row = db.prepare('SELECT id, val FROM t').get() as { id: number; val: string }
    db.close()

    expect(row).toEqual({ id: 1, val: 'hello' })
  })
})

describe('encryptPlaintextToMachineKey', () => {
  it('round-trips: encrypted -> plaintext -> encrypted, readable with key', () => {
    const srcPath = tmpPath('src.db')
    const plainPath = tmpPath('plain.db')
    const encPath = tmpPath('enc.db')

    createEncryptedDb(srcPath, KEY)
    exportEncryptedDbToPlaintext(srcPath, KEY, plainPath)
    encryptPlaintextToMachineKey(plainPath, KEY, encPath)

    const db = new Database(encPath)
    db.pragma(`key='${KEY.toString('hex')}'`)
    const row = db.prepare('SELECT id, val FROM t').get() as { id: number; val: string }
    db.close()

    expect(row).toEqual({ id: 1, val: 'hello' })
  })

  it('throws when reading with the wrong key', () => {
    const srcPath = tmpPath('src.db')
    const plainPath = tmpPath('plain.db')
    const encPath = tmpPath('enc.db')

    createEncryptedDb(srcPath, KEY)
    exportEncryptedDbToPlaintext(srcPath, KEY, plainPath)
    encryptPlaintextToMachineKey(plainPath, KEY, encPath)

    expect(() => {
      const db = new Database(encPath)
      db.pragma(`key='${WRONG_KEY.toString('hex')}'`)
      db.prepare('SELECT id, val FROM t').get()
      db.close()
    }).toThrow()
  })
})
