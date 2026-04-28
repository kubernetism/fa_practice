/**
 * Upload queue worker for online (Google Drive) backups.
 *
 * Persists pending backup jobs in the `cloud_backups` table and processes them
 * one at a time on a periodic tick. Owns the retry/backoff policy for the
 * online-backup feature; the lower-level DriveClient and FPB encryptor are
 * deliberately ignorant of scheduling concerns.
 *
 * Key design points:
 *  - All file/crypto work is dependency-injected so unit tests can run without
 *    real argon2/AES/Drive calls.
 *  - The passphrase is held in a caller-owned `Map<userId, passphrase>` so
 *    locking the app simply clears the map; the queue then transitions to a
 *    soft "locked" wait without burning retry attempts.
 *  - On startup, any rows stuck in `uploading` (e.g. process killed mid-run)
 *    are reset back to `pending` so they get another shot.
 */

import { existsSync, statSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { randomBytes } from 'node:crypto'
import type Database from 'better-sqlite3-multiple-ciphers'
import {
  encryptToFpb as encryptToFpbDefault,
  type EncryptOptions,
  type EncryptResult,
} from '../utils/fpb-encryptor'
import { exportEncryptedDbToPlaintext as exportEncryptedDbToPlaintextDefault } from '../utils/db-cipher'
import type { DriveClient } from './drive-client'

export type BackupReason = 'manual' | 'scheduled' | 'on_close'
export type BackupStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'skipped'

export interface QueueSummary {
  pending: number
  uploading: number
  uploaded: number
  failed: number
  skipped: number
}

export interface UploadQueueDeps {
  db: Database.Database
  connectivity: { isOnline: () => boolean }
  /** Returns null when the user has no cloud_credentials row / is not connected. */
  getDriveClient: (userId: number) => Promise<DriveClient | null>
  /** userId -> passphrase. Caller clears this map to "lock" backups. */
  passphraseCache: Map<number, string>
  /** Returns the machine key used to decrypt local backup files. */
  getMachineKey: () => Buffer
  /** Optional override for tests; defaults to the real db-cipher export. */
  exportPlaintext?: (src: string, key: Buffer, dest: string) => void
  /** Optional override for tests; defaults to the real argon2/AES encryptor. */
  encryptFpb?: (opts: EncryptOptions) => Promise<EncryptResult>
  tickIntervalMs?: number
  maxAttempts?: number
  /** Per-attempt delay in seconds; index = attemptCount-1 after increment. */
  backoffSeconds?: number[]
  now?: () => number
}

const DEFAULT_BACKOFF_SECONDS = [60, 300, 900, 3600, 10800, 21600, 43200, 86400, 86400, 86400]
const DEFAULT_TICK_MS = 30_000
const DEFAULT_MAX_ATTEMPTS = 10
const RETENTION_KEEP_LATEST = 10

interface CloudBackupRow {
  id: number
  user_id: number
  local_path: string
  local_filename: string
  local_size_bytes: number
  reason: BackupReason
  status: BackupStatus
  attempt_count: number
  next_attempt_at: string | null
  drive_file_id: string | null
  drive_filename: string | null
  uploaded_size_bytes: number | null
  last_error: string | null
  created_at: string
  updated_at: string
}

interface CloudCredentialRow {
  user_id: number
  refresh_token_encrypted: string
  drive_folder_id: string | null
  passphrase_verifier_salt: string
  argon_m_kib: number
  argon_t: number
  argon_p: number
  auto_upload_enabled: number
  last_upload_at: string | null
  last_error: string | null
}

export class UploadQueue {
  private readonly db: Database.Database
  private readonly connectivity: { isOnline: () => boolean }
  private readonly getDriveClient: (userId: number) => Promise<DriveClient | null>
  private readonly passphraseCache: Map<number, string>
  private readonly getMachineKey: () => Buffer
  private readonly exportPlaintext: (src: string, key: Buffer, dest: string) => void
  private readonly encryptFpb: (opts: EncryptOptions) => Promise<EncryptResult>
  private readonly tickIntervalMs: number
  private readonly maxAttempts: number
  private readonly backoffSeconds: number[]
  private readonly now: () => number

  private timer: NodeJS.Timeout | null = null
  private running = false
  private ticking = false

  constructor(deps: UploadQueueDeps) {
    this.db = deps.db
    this.connectivity = deps.connectivity
    this.getDriveClient = deps.getDriveClient
    this.passphraseCache = deps.passphraseCache
    this.getMachineKey = deps.getMachineKey
    this.exportPlaintext = deps.exportPlaintext ?? exportEncryptedDbToPlaintextDefault
    this.encryptFpb = deps.encryptFpb ?? encryptToFpbDefault
    this.tickIntervalMs = deps.tickIntervalMs ?? DEFAULT_TICK_MS
    this.maxAttempts = deps.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
    this.backoffSeconds = deps.backoffSeconds ?? DEFAULT_BACKOFF_SECONDS
    this.now = deps.now ?? Date.now
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  enqueue(userId: number, localPath: string, reason: BackupReason): number {
    const size = statSync(localPath).size
    const filename = basename(localPath)
    const ts = new Date(this.now()).toISOString()

    const result = this.db
      .prepare(
        `INSERT INTO cloud_backups
           (user_id, local_path, local_filename, local_size_bytes,
            reason, status, attempt_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      )
      .run(userId, localPath, filename, size, reason, ts, ts)

    return Number(result.lastInsertRowid)
  }

  start(): void {
    if (this.running) return
    this.running = true

    // Reset any rows that were mid-upload when the previous process died.
    const ts = new Date(this.now()).toISOString()
    this.db
      .prepare(
        `UPDATE cloud_backups SET status='pending', updated_at=? WHERE status='uploading'`,
      )
      .run(ts)

    this.timer = setInterval(() => {
      void this.tick()
    }, this.tickIntervalMs)
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  async tick(): Promise<void> {
    if (this.ticking) return
    if (!this.connectivity.isOnline()) return

    this.ticking = true
    try {
      const nowIso = new Date(this.now()).toISOString()
      const row = this.db
        .prepare(
          `SELECT * FROM cloud_backups
             WHERE status='pending'
               AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
             ORDER BY id ASC
             LIMIT 1`,
        )
        .get(nowIso) as CloudBackupRow | undefined

      if (!row) return

      // Claim the row.
      this.db
        .prepare(`UPDATE cloud_backups SET status='uploading', updated_at=? WHERE id=?`)
        .run(nowIso, row.id)

      try {
        await this.processRow(row)
      } catch (err) {
        this.recordFailure(row, err)
      }
    } finally {
      this.ticking = false
    }
  }

  retryFailed(userId: number): void {
    const ts = new Date(this.now()).toISOString()
    this.db
      .prepare(
        `UPDATE cloud_backups
           SET status='pending', attempt_count=0, next_attempt_at=NULL, updated_at=?
         WHERE user_id=? AND status='failed'`,
      )
      .run(ts, userId)
  }

  async pruneRetention(userId: number): Promise<void> {
    const driveClient = await this.getDriveClient(userId)
    if (!driveClient) return

    const cred = this.getCredential(userId)
    const folderId = cred?.drive_folder_id ?? (await driveClient.ensureBackupFolder())

    const listing = await driveClient.listBackups(folderId)
    // listBackups already sorts by createdTime desc; defensively re-sort.
    const sorted = [...listing].sort((a, b) => (a.createdTime < b.createdTime ? 1 : -1))

    const stale = sorted.slice(RETENTION_KEEP_LATEST)
    for (const entry of stale) {
      try {
        await driveClient.deleteFile(entry.id)
      } catch {
        // best-effort prune; one failure shouldn't block the others
      }
    }
    // TODO: read keep-N from business_settings.backup_retention_days
  }

  queueSummary(userId: number): QueueSummary {
    const rows = this.db
      .prepare(
        `SELECT status, COUNT(*) AS n FROM cloud_backups WHERE user_id=? GROUP BY status`,
      )
      .all(userId) as Array<{ status: BackupStatus; n: number }>

    const summary: QueueSummary = {
      pending: 0,
      uploading: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0,
    }
    for (const r of rows) {
      summary[r.status] = r.n
    }
    return summary
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private getCredential(userId: number): CloudCredentialRow | undefined {
    return this.db
      .prepare(`SELECT * FROM cloud_credentials WHERE user_id=?`)
      .get(userId) as CloudCredentialRow | undefined
  }

  private async processRow(row: CloudBackupRow): Promise<void> {
    const cred = this.getCredential(row.user_id)
    if (!cred) {
      this.markFailedHard(row, 'not connected')
      return
    }

    if (!cred.auto_upload_enabled && row.reason !== 'manual') {
      const ts = new Date(this.now()).toISOString()
      this.db
        .prepare(`UPDATE cloud_backups SET status='skipped', updated_at=? WHERE id=?`)
        .run(ts, row.id)
      return
    }

    const passphrase = this.passphraseCache.get(row.user_id)
    if (!passphrase) {
      // Soft-fail: app is locked. Don't burn an attempt; just push the next
      // check ~10 minutes out so we don't busy-loop.
      const next = new Date(this.now() + 600_000).toISOString()
      const ts = new Date(this.now()).toISOString()
      this.db
        .prepare(
          `UPDATE cloud_backups
             SET status='pending', next_attempt_at=?, last_error='locked', updated_at=?
           WHERE id=?`,
        )
        .run(next, ts, row.id)
      return
    }

    const driveClient = await this.getDriveClient(row.user_id)
    if (!driveClient) {
      throw new Error('drive client unavailable')
    }

    const folderId = cred.drive_folder_id ?? (await driveClient.ensureBackupFolder())

    const rand = randomBytes(8).toString('hex')
    const tmpPlainPath = join(tmpdir(), `firearms-pos-tmp-plain-${rand}.db`)
    const tmpFpbPath = join(tmpdir(), `firearms-pos-tmp-${rand}.fpb`)

    try {
      this.exportPlaintext(row.local_path, this.getMachineKey(), tmpPlainPath)

      const salt = Buffer.from(cred.passphrase_verifier_salt, 'hex')
      await this.encryptFpb({
        plaintextPath: tmpPlainPath,
        outPath: tmpFpbPath,
        passphrase,
        salt,
        kdfParams: { mKib: cred.argon_m_kib, t: cred.argon_t, p: cred.argon_p },
      })

      const stamp = new Date(this.now()).toISOString().replace(/[:.]/g, '-')
      const remoteName = `firearms-pos-${row.user_id}-${row.id}-${stamp}.fpb`

      const upload = await driveClient.uploadFile(tmpFpbPath, remoteName, folderId)

      const ts = new Date(this.now()).toISOString()
      this.db
        .prepare(
          `UPDATE cloud_backups
             SET status='uploaded',
                 drive_file_id=?, drive_filename=?, uploaded_size_bytes=?,
                 last_error=NULL, updated_at=?
           WHERE id=?`,
        )
        .run(upload.id, remoteName, upload.size, ts, row.id)

      this.db
        .prepare(`UPDATE cloud_credentials SET last_upload_at=?, last_error=NULL WHERE user_id=?`)
        .run(ts, row.user_id)

      // Best-effort retention prune; don't let a delete failure roll back the upload.
      try {
        await this.pruneRetention(row.user_id)
      } catch {
        // swallow
      }
    } finally {
      cleanupTmp(tmpPlainPath)
      cleanupTmp(tmpFpbPath)
    }
  }

  private markFailedHard(row: CloudBackupRow, reason: string): void {
    const ts = new Date(this.now()).toISOString()
    this.db
      .prepare(`UPDATE cloud_backups SET status='failed', last_error=?, updated_at=? WHERE id=?`)
      .run(reason, ts, row.id)
  }

  private recordFailure(row: CloudBackupRow, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err)
    const newAttempt = row.attempt_count + 1
    const ts = new Date(this.now()).toISOString()

    if (newAttempt >= this.maxAttempts) {
      this.db
        .prepare(
          `UPDATE cloud_backups
             SET status='failed', attempt_count=?, last_error=?, updated_at=?
           WHERE id=?`,
        )
        .run(newAttempt, message, ts, row.id)

      this.db
        .prepare(`UPDATE cloud_credentials SET last_error=? WHERE user_id=?`)
        .run(message, row.user_id)
      return
    }

    const idx = Math.min(newAttempt - 1, this.backoffSeconds.length - 1)
    const delaySec = this.backoffSeconds[idx]
    const next = new Date(this.now() + delaySec * 1000).toISOString()
    this.db
      .prepare(
        `UPDATE cloud_backups
           SET status='pending', attempt_count=?, next_attempt_at=?,
               last_error=?, updated_at=?
         WHERE id=?`,
      )
      .run(newAttempt, next, message, ts, row.id)
  }
}

function cleanupTmp(path: string): void {
  try {
    if (existsSync(path)) unlinkSync(path)
  } catch {
    // best-effort
  }
}
