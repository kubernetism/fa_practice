# Implementation Plan: Online Backup to Google Drive

**Spec:** `docs/superpowers/specs/2026-04-26-online-backup-google-drive-design.md`
**Date:** 2026-04-26
**App:** `firearms-pos/` (Electron + better-sqlite3-multiple-ciphers + Vitest + drizzle)

## Conventions (project overrides to spec)

- Timestamps stored as TEXT (`datetime('now')`), **not** Unix-ms INTEGER. Drizzle column type `text({ mode: 'string' })`.
- Test fixture: `firearms-pos/src/main/tests/test-db.ts` provides `setupTestDatabase()` with seeded admin user (id=1, role='admin'). Tests run under system Node — see existing `setup.ts`; no rebuild logic needs to be touched here.
- Lint: Biome. Run `npm run lint` and `npm run typecheck` before each commit.
- TDD discipline: write failing test → run → implement → run → commit. One task per commit.

## Phases

| Phase | Tasks | Outcome |
|-------|-------|---------|
| **1 – Foundation** | 1–8 | Encryption format, Drive client, OAuth — all unit-tested, no UI yet |
| **2 – Automation** | 9–14 | Queue worker, IPC, settings UI, hook into existing local-backup pipeline |
| **3 – Restore & Polish** | 15–20 | List/delete/restore from cloud, setup wizard step, smoke checklist |

---

## Phase 1 – Foundation

### Task 1: Add dependencies

**Files:** `firearms-pos/package.json`

Add to `dependencies`:
- `googleapis@^144.0.0`
- `argon2@^0.41.1`

Run `npm install` in `firearms-pos/`. Confirm `argon2` native module builds (it bundles prebuilds for Electron).

**Test:** none (dep install). Verify with `npm run typecheck`.

**Commit:** `chore(deps): add googleapis and argon2 for cloud backup`

---

### Task 2: Schema – cloud_credentials and cloud_backups tables

**Files (new):**
- `firearms-pos/src/main/db/schema/cloud-credentials.ts`
- `firearms-pos/src/main/db/schema/cloud-backups.ts`
- `firearms-pos/src/main/db/migrations/NNNN_add_cloud_backup_tables.ts`

**`cloud_credentials`** (one row per admin user):
- `id` integer pk autoincrement
- `user_id` integer NOT NULL UNIQUE → users.id
- `google_email` text NOT NULL
- `refresh_token_encrypted` text NOT NULL (encrypted with machine key)
- `drive_folder_id` text (cached)
- `passphrase_verifier_salt` text NOT NULL (16 bytes hex)
- `passphrase_verifier_hash` text NOT NULL (argon2id digest of canonical "OK" plaintext for verification on unlock)
- `argon_m_kib` integer NOT NULL DEFAULT 65536
- `argon_t` integer NOT NULL DEFAULT 3
- `argon_p` integer NOT NULL DEFAULT 4
- `auto_upload_enabled` integer NOT NULL DEFAULT 0 (boolean 0/1)
- `connected_at` text NOT NULL DEFAULT (datetime('now'))
- `last_upload_at` text
- `last_error` text

**`cloud_backups`** (one row per backup attempt):
- `id` integer pk autoincrement
- `user_id` integer NOT NULL → users.id
- `local_path` text NOT NULL
- `local_filename` text NOT NULL
- `local_size_bytes` integer NOT NULL
- `reason` text NOT NULL CHECK in ('manual', 'scheduled', 'on_close')
- `status` text NOT NULL CHECK in ('pending', 'uploading', 'uploaded', 'failed', 'skipped')
- `attempt_count` integer NOT NULL DEFAULT 0
- `next_attempt_at` text
- `drive_file_id` text
- `drive_filename` text
- `uploaded_size_bytes` integer
- `last_error` text
- `created_at` text NOT NULL DEFAULT (datetime('now'))
- `updated_at` text NOT NULL DEFAULT (datetime('now'))

Indexes: `(user_id, status)`, `(status, next_attempt_at)`.

**Test (new):** `firearms-pos/src/main/db/__tests__/cloud-tables.test.ts`
- Run migration on in-memory db; assert tables exist via `PRAGMA table_info`.
- Insert sample row in each; assert read-back.
- Assert UNIQUE on `cloud_credentials.user_id`.
- Assert CHECK constraint rejects invalid `status` value.

**Commit:** `feat(backup): add cloud_credentials and cloud_backups schema`

---

### Task 3: FPB file format

**Files (new):**
- `firearms-pos/src/main/utils/fpb-format.ts`

64-byte header followed by ciphertext payload:

```
Offset  Size  Field
0       4     Magic "FPB1" (0x46 0x50 0x42 0x31)
4       1     Version (0x01)
5       1     KDF id (0x01 = argon2id)
6       4     argon m_kib (uint32 LE)
10      1     argon t (uint8)
11      1     argon p (uint8)
12      16    Salt
28      12    IV (96 bits for AES-GCM)
40      16    Auth tag (filled at end of stream)
56      8     Plaintext size (uint64 LE, optional/diagnostic)
```

Exports:
- `FPB_MAGIC`, `FPB_VERSION`, `FPB_HEADER_SIZE = 64`
- `writeHeader(buf, params)` → fills header buffer (auth tag zeroed initially)
- `parseHeader(buf)` → returns `{ version, kdfId, m, t, p, salt, iv, authTag, plaintextSize }` or throws `InvalidFpbError`

**Test (new):** `firearms-pos/src/main/utils/__tests__/fpb-format.test.ts`
- Round-trip a header through write/parse, assert all fields match.
- Reject buffer < 64 bytes.
- Reject wrong magic, wrong version.

**Commit:** `feat(backup): add FPB file format header utilities`

---

### Task 4: Passphrase KDF (argon2id)

**Files (new):**
- `firearms-pos/src/main/utils/passphrase-kdf.ts`

Exports:
- `deriveKey(passphrase: string, salt: Buffer, params: { m: number; t: number; p: number }): Promise<Buffer>` → returns 32-byte key via argon2id (raw mode, hashLength=32).
- `hashVerifier(passphrase: string, salt: Buffer, params): Promise<string>` → argon2id encoded digest of canonical `"FPB-VERIFIER-OK"` for fast unlock check.
- `verifyPassphrase(passphrase: string, salt: Buffer, params, expectedHash: string): Promise<boolean>` → compares against stored verifier.
- `randomSalt(): Buffer` → 16 random bytes.

**Test (new):** `firearms-pos/src/main/utils/__tests__/passphrase-kdf.test.ts`
- Same passphrase + salt + params → identical 32-byte key (deterministic).
- Different salt → different key.
- `verifyPassphrase` returns true for correct passphrase, false for wrong.
- Use `m=1024, t=1, p=1` in tests for speed (still argon2id).

**Commit:** `feat(backup): add passphrase-based key derivation`

---

### Task 5: Streaming AES-256-GCM encryptor

**Files (new):**
- `firearms-pos/src/main/utils/backup-encryptor.ts`

Exports:
- `encryptFile(srcPath: string, destPath: string, key: Buffer, params): Promise<{ size: number }>`
  1. Generate IV (12 bytes random).
  2. Reserve 64 bytes of `destPath` (write zeroed header placeholder).
  3. Stream `srcPath` through `crypto.createCipheriv('aes-256-gcm', key, iv)` and append ciphertext after header.
  4. After stream end, get `cipher.getAuthTag()`.
  5. Re-open `destPath` with random-access write; write final header (with real auth tag) into bytes 0–63.
- `decryptFile(srcPath: string, destPath: string, key: Buffer): Promise<void>`
  1. Read first 64 bytes; parse header.
  2. Stream remainder through `createDecipheriv` with iv; `setAuthTag(header.authTag)` BEFORE finalising; `final()` throws on tampering.

Note: header carries salt + argon params + IV + authTag, so decryption only needs the file + passphrase.

**Test (new):** `firearms-pos/src/main/utils/__tests__/backup-encryptor.test.ts`
- Round-trip a 1MB random plaintext through encrypt/decrypt → bytes match exactly.
- Tampering (flip a payload byte) → decrypt rejects.
- Wrong passphrase → decrypt rejects.
- Test uses fast argon params (`m=1024, t=1, p=1`) and tmp files via `os.tmpdir()`.

**Commit:** `feat(backup): add streaming AES-GCM file encryptor`

---

### Task 6: db-cipher export/import helpers

**Files (modified):** `firearms-pos/src/main/utils/db-cipher.ts`

Add two helpers (both use `sqlcipher_export` via `ATTACH DATABASE ... KEY ''` to convert between machine-key-encrypted and plaintext SQLite):

- `exportEncryptedDbToPlaintext(srcEncryptedPath: string, machineKey: Buffer, destPlaintextPath: string): Promise<void>`
- `encryptPlaintextToMachineKey(srcPlaintextPath: string, machineKey: Buffer, destEncryptedPath: string): Promise<void>`

Both use a transient connection that runs `PRAGMA key = "x'<hex>'"` + `ATTACH DATABASE ? AS plain KEY ''` + `SELECT sqlcipher_export('plain')` (or reverse direction).

**Test (new):** `firearms-pos/src/main/utils/__tests__/db-cipher-export.test.ts`
- Create encrypted db with one table+row; export to plaintext; open plaintext with plain better-sqlite3; assert row read.
- Re-encrypt to a new path with the same machine key; open with cipher; assert row still readable.

**Commit:** `feat(backup): add encrypted-to-plaintext db conversion helpers`

---

### Task 7: Google OAuth (PKCE + loopback)

**Files (new):**
- `firearms-pos/src/main/utils/oauth-config.ts` — exports `GOOGLE_CLIENT_ID` (env-overridable), `OAUTH_SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email']`, `LOOPBACK_PORT_MIN=49152`, `LOOPBACK_PORT_MAX=65535`.
- `firearms-pos/src/main/services/google-oauth.ts`

Exports:
- `startOAuthFlow(): Promise<{ refreshToken: string; accessToken: string; email: string }>`

Flow:
1. Generate PKCE verifier (43–128 chars URL-safe random) + S256 challenge.
2. Pick a free port in the loopback range; start a local HTTP server on `127.0.0.1:<port>` with one route `/callback`.
3. Open the Google authorize URL in the user's default browser (via Electron `shell.openExternal`). `redirect_uri = http://127.0.0.1:<port>/callback`, `code_challenge_method=S256`, `access_type=offline`, `prompt=consent`.
4. Wait for callback (timeout 5min). Validate `state`. Extract `code`.
5. POST to `https://oauth2.googleapis.com/token` with `code`, `code_verifier`, `client_id`, `grant_type=authorization_code`. Use `googleapis` `OAuth2Client.getToken()`.
6. With access token, GET `https://www.googleapis.com/oauth2/v2/userinfo` to read email.
7. Close server. Return `{ refreshToken, accessToken, email }`.

**Test (new):** `firearms-pos/src/main/services/__tests__/google-oauth.test.ts`
- Mock the loopback server (use `nock` or a fake `OAuth2Client`).
- Verify state mismatch → rejects.
- Verify successful path returns expected fields.
- Verify timeout path rejects after configurable short timeout (inject 100ms in test).

**Commit:** `feat(backup): add Google OAuth PKCE loopback flow`

---

### Task 8: Drive client wrapper

**Files (new):** `firearms-pos/src/main/services/drive-client.ts`

Exports class `DriveClient`:
- `constructor(refreshToken: string)` — builds `OAuth2Client` with stored refresh token, attaches to `google.drive({ version: 'v3', auth })`.
- `ensureBackupFolder(): Promise<string>` — finds folder named `Firearms POS Backups` (cached); creates if missing; returns id. Uses `q: name='Firearms POS Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false` filter.
- `uploadFile(localPath: string, remoteName: string, parentId: string, onProgress?: (bytes: number) => void): Promise<{ id: string; size: number }>` — resumable upload via `files.create` with `media: { body: createReadStream(localPath) }` and `supportsAllDrives: false`.
- `listBackups(parentId: string): Promise<Array<{ id: string; name: string; size: number; createdTime: string }>>` — `files.list` with parent filter, ordered by `createdTime desc`.
- `downloadFile(fileId: string, destPath: string): Promise<void>` — `files.get({ fileId, alt: 'media' }, { responseType: 'stream' })` → pipe.
- `deleteFile(fileId: string): Promise<void>`.

**Test (new):** `firearms-pos/src/main/services/__tests__/drive-client.test.ts`
- Mock `googleapis.drive` via dependency injection; assert correct API calls + folder cache reuse on second call.
- Assert error from API surfaces as thrown error.

**Commit:** `feat(backup): add Google Drive client wrapper`

---

## Phase 2 – Automation

### Task 9: Connectivity watcher

**Files (new):** `firearms-pos/src/main/services/connectivity.ts`

Exports `ConnectivityWatcher`:
- `start()` — starts polling `https://www.google.com/generate_204` every 30s with 5s timeout. Tracks online/offline state.
- `isOnline(): boolean`
- `onChange(listener)` — emits `'online'` / `'offline'` events.

Wire `app.net.isOnline` from Electron as a fast pre-check, then verify with HEAD probe.

**Test (new):** `firearms-pos/src/main/services/__tests__/connectivity.test.ts`
- Mock fetch; simulate 200 → online, error → offline; assert events fire on transitions only (debounce duplicates).

**Commit:** `feat(backup): add connectivity watcher`

---

### Task 10: Upload queue worker

**Files (new):** `firearms-pos/src/main/services/upload-queue.ts`

Singleton `UploadQueue`:
- `enqueue(userId, localPath, reason): Promise<number>` — inserts row in `cloud_backups` with `status='pending'`, returns id.
- `start()` — single concurrent worker loop. Picks oldest `'pending'` row whose `next_attempt_at <= now` AND user has unlocked passphrase cached AND connectivity is online.
- On startup, reset any leftover `'uploading'` rows back to `'pending'` (crash recovery).
- For each pending row:
  1. Mark `'uploading'`.
  2. Look up user's `cloud_credentials`. If `auto_upload_enabled = 0`, skip and mark `'skipped'` (manual-only path uploads via direct `uploadNow`).
  3. Read passphrase from in-memory cache `passphraseByUser: Map<userId, Buffer>`. If not cached → mark `'pending'` with `next_attempt_at = now + 10min`, log `last_error = 'locked'`.
  4. Decrypt local backup (machine-key encrypted SQLite) → tmp plaintext via `exportEncryptedDbToPlaintext`.
  5. Encrypt plaintext → tmp `.fpb` via `backup-encryptor.encryptFile` with the user's derived key.
  6. Upload `.fpb` to Drive via `DriveClient.uploadFile`.
  7. On success: mark `'uploaded'`, set `drive_file_id`, `drive_filename`, `uploaded_size_bytes`, `last_upload_at`. Delete tmp files. Run retention prune.
  8. On failure: increment `attempt_count`. If `attempt_count >= MAX_ATTEMPTS (10)` → `'failed'`. Else compute `next_attempt_at = now + BACKOFF_SECONDS[attempt_count - 1]` where `BACKOFF_SECONDS = [60, 300, 900, 3600, 10800, 21600, 43200, 86400, 86400, 86400]`. Store `last_error`.
- `retryFailed(userId)` — resets all `'failed'` rows for user back to `'pending'`, `attempt_count=0`, `next_attempt_at=now`.
- `pruneRetention(userId)` — reads `business_settings.backup_retention_days` (existing config); deletes Drive files older than retention OR keeps only the N most recent successful uploads (matching existing local-backup retention logic in `backup-ipc.ts`).

**Test (new):** `firearms-pos/src/main/services/__tests__/upload-queue.test.ts`
- Inject mock `DriveClient`, mock encryption helpers.
- Enqueue → worker tick → row becomes `'uploaded'`.
- Drive throws → row becomes `'pending'` with `attempt_count=1` and correct `next_attempt_at`.
- After 10 failures → `'failed'`.
- Crash-recovery: pre-seed `'uploading'` row → `start()` resets to `'pending'`.
- `pruneRetention` with retention=3 and 5 uploaded rows → 2 deletes called on Drive client.

**Commit:** `feat(backup): add upload queue worker with retry/backoff`

---

### Task 11: Cloud backup IPC handlers

**Files (new):** `firearms-pos/src/main/ipc/cloud-backup-ipc.ts`

Handlers (all gated by `requireAdmin(userId)` helper that throws if user role !== 'admin'):
- `cloud-backup:connect` — runs `startOAuthFlow()`, encrypts refresh token with machine key, writes `cloud_credentials` row (or updates if exists).
- `cloud-backup:disconnect` — deletes `cloud_credentials` row + clears passphrase cache for that user.
- `cloud-backup:get-status` — returns `{ connected, email, autoUploadEnabled, hasPassphrase, lastUploadAt, lastError, queueSummary }`.
- `cloud-backup:set-passphrase` — input: `{ passphrase }`. Generates salt, computes verifier; updates `cloud_credentials`. Caches derived key for session.
- `cloud-backup:unlock` — input: `{ passphrase }`. Verifies against stored verifier. On success caches derived key in `passphraseByUser` map. Returns `{ ok: boolean }`.
- `cloud-backup:set-auto-upload` — input: `{ enabled: boolean }`.
- `cloud-backup:upload-now` — enqueues current local backup file path immediately and triggers worker tick.
- `cloud-backup:retry-failed` — calls `UploadQueue.retryFailed`.
- `cloud-backup:queue-summary` — returns counts by status for current user.

Register in `firearms-pos/src/main/ipc/index.ts`.

**Test (new):** `firearms-pos/src/main/ipc/__tests__/cloud-backup-ipc.test.ts`
- Non-admin user calling any handler → throws.
- `set-passphrase` → row updated, verifier roundtrips via `verifyPassphrase`.
- `unlock` with wrong passphrase → `{ ok: false }`, no cache populated.
- `disconnect` → row gone, cache cleared.

**Commit:** `feat(backup): add cloud backup IPC handlers`

---

### Task 12: Hook into existing local backup pipeline

**Files (modified):** `firearms-pos/src/main/ipc/backup-ipc.ts`

Add helper at top of file:
```ts
async function tryEnqueueCloudUpload(localPath: string, reason: 'manual' | 'scheduled' | 'on_close', userId: number | null) {
  if (userId == null) return  // headless scheduled with no admin session
  try {
    const cred = db.prepare('SELECT user_id, auto_upload_enabled FROM cloud_credentials WHERE user_id = ?').get(userId) as any
    if (!cred) return
    if (reason !== 'manual' && !cred.auto_upload_enabled) return
    await uploadQueue.enqueue(userId, localPath, reason)
  } catch (err) {
    log.warn('[cloud-backup] enqueue failed', err)
  }
}

async function enqueueForAllAutoUploaders(localPath: string, reason: 'scheduled' | 'on_close') {
  const rows = db.prepare('SELECT user_id FROM cloud_credentials WHERE auto_upload_enabled = 1').all() as any[]
  for (const r of rows) await uploadQueue.enqueue(r.user_id, localPath, reason)
}
```

Call sites:
- After `createBackup` (manual) → `tryEnqueueCloudUpload(path, 'manual', currentUserId)`.
- After scheduled backup → `enqueueForAllAutoUploaders(path, 'scheduled')`.
- After `performCloseBackup` → `enqueueForAllAutoUploaders(path, 'on_close')`.

**Test (new):** `firearms-pos/src/main/ipc/__tests__/backup-cloud-hook.test.ts`
- After manual backup with admin who has auto_upload=0 + connected → enqueue runs (manual reason bypasses auto_upload).
- After scheduled backup with no connected admin → no enqueue.
- After scheduled backup with admin auto_upload=1 → enqueue row inserted.

**Commit:** `feat(backup): hook cloud upload into local backup pipeline`

---

### Task 13: Renderer Zustand store

**Files (new):** `firearms-pos/src/renderer/stores/cloud-backup-store.ts`

State:
- `connected, email, autoUploadEnabled, hasPassphrase, locked, lastUploadAt, lastError, queue: { pending, uploading, uploaded, failed }`

Actions: `loadStatus, connect, disconnect, setPassphrase, unlock, setAutoUpload, uploadNow, retryFailed`. Each calls the corresponding `cloud-backup:*` IPC and refreshes status.

**Test:** Zustand stores are typically not unit-tested directly; rely on IPC tests + manual smoke. Skip tests here.

**Commit:** `feat(backup): add cloud backup renderer store`

---

### Task 14: Settings UI – Cloud Backup card

**Files (new):**
- `firearms-pos/src/renderer/components/settings/CloudBackupCard.tsx`
- `firearms-pos/src/renderer/components/settings/PassphraseDialog.tsx`
- `firearms-pos/src/renderer/components/settings/UnlockDialog.tsx`

`CloudBackupCard` states:
1. **Not admin** — render disabled card with "Admin only" notice.
2. **Disconnected** — "Connect Google Account" button → calls `connect()`.
3. **Connected, no passphrase set** — show email, "Set passphrase" button.
4. **Connected, locked** — "Unlock" button.
5. **Connected, unlocked** — show: email, auto-upload toggle, "Upload now", "Retry failed", queue summary, last upload time, last error (if any), disconnect.

Mount inside existing Settings tab (`firearms-pos/src/renderer/components/settings/SettingsTab.tsx` or equivalent).

**Test:** No unit tests; manual smoke covered in Task 20.

**Commit:** `feat(backup): add cloud backup settings UI`

---

## Phase 3 – Restore & Polish

### Task 15: List/delete cloud backups IPC

**Files (modified):** `firearms-pos/src/main/ipc/cloud-backup-ipc.ts`

Add:
- `cloud-backup:list-cloud` — returns Drive listing merged with local `cloud_backups` rows. Each entry: `{ driveFileId, name, size, createdTime, localStatus }`.
- `cloud-backup:delete-cloud` — `{ driveFileId }` → calls `DriveClient.deleteFile`, marks local row deleted (or just removes from listing).

**Test:** Extend `cloud-backup-ipc.test.ts`.

**Commit:** `feat(backup): list and delete cloud backups`

---

### Task 16: Restore from cloud

**Files (new):** `firearms-pos/src/main/services/restore-from-cloud.ts`

Flow `restoreFromCloud({ driveFileId, passphrase, userId })`:
1. Download `.fpb` to tmp.
2. Parse header, derive key from passphrase, decrypt to tmp plaintext SQLite.
3. **Validation gate:** open tmp plaintext db; assert tables exist: `users, products, sales, purchases, business_settings`. Run `PRAGMA integrity_check` — must return `ok`. Reject if any check fails.
4. Take a "safety backup" of the current encrypted db to `<userData>/backups/pre-restore-<timestamp>.db`.
5. Close current DB connection (`closeDatabase()` exported from `db.ts`).
6. Re-encrypt tmp plaintext to encrypted form using current machine key (`encryptPlaintextToMachineKey`) → write to current db path (atomic rename via tmp + `fs.rename`).
7. Reinitialise DB connection (`reinitializeDatabase()`).
8. Delete tmp files.

**IPC:** `cloud-backup:restore` handler that wraps this with `requireAdmin`.

**Test (new):** `firearms-pos/src/main/services/__tests__/restore-from-cloud.test.ts`
- Mock Drive download.
- End-to-end: encrypt a known db → "upload" → "download" → restore → assert seeded rows present.
- Tampered `.fpb` → restore aborts before swap; current db untouched.
- Missing required table in payload → restore aborts.

**Commit:** `feat(backup): restore from cloud with validation and safety backup`

---

### Task 17: Restore-from-cloud dialog UI

**Files (new):** `firearms-pos/src/renderer/components/settings/RestoreFromCloudDialog.tsx`

Lists cloud backups (via `cloud-backup:list-cloud`), prompts for passphrase, confirms with "This will replace your current database. A safety backup will be created." Wires to `cloud-backup:restore`.

**Commit:** `feat(backup): add restore-from-cloud dialog`

---

### Task 18: Setup wizard step

**Files (modified):** `firearms-pos/src/renderer/components/setup/SetupWizard.tsx` (or current first-run flow)

Add optional step "Cloud Backup (optional)" — admin can connect now or skip. Skipping leaves the feature available later from Settings.

**Commit:** `feat(backup): add cloud backup step to setup wizard`

---

### Task 19: Wire connectivity + queue start in main process

**Files (modified):** `firearms-pos/src/main/index.ts`

In `app.whenReady()` after DB init:
1. Construct singleton `connectivity = new ConnectivityWatcher()`.
2. Construct singleton `uploadQueue = new UploadQueue({ db, connectivity, driveClientFactory })`.
3. `connectivity.start(); uploadQueue.start()`.
4. Register cloud-backup IPC handlers.

Ensure clean shutdown on `before-quit`: `uploadQueue.stop()`, `connectivity.stop()`.

**Commit:** `feat(backup): wire connectivity watcher and upload queue at app start`

---

### Task 20: Lint, typecheck, manual smoke checklist

Run `npm run lint && npm run typecheck` in `firearms-pos/`. Fix any issues.

**Manual smoke (document results in commit message body):**
- [ ] Admin connects Google account; sees email in card.
- [ ] Set passphrase; toggle auto-upload on.
- [ ] Trigger manual local backup → cloud_backups row → status `uploaded`.
- [ ] Disconnect WiFi; trigger manual backup → status `pending`. Reconnect → goes `uploaded`.
- [ ] Force a failure (revoke token) → row goes `failed` after backoffs (test by lowering MAX_ATTEMPTS to 2 via env var if needed).
- [ ] Restore from cloud on a fresh install with same passphrase → DB swapped, safety backup present.
- [ ] Non-admin user → settings card shows disabled state.
- [ ] App close with auto-upload on → queue row created for `on_close`; uploaded after next start.

**Commit:** `chore(backup): final lint/typecheck and smoke verification`

---

## Out of scope (per spec)

- Per-record sync / multi-device live sync.
- Backups for non-admin users.
- Multiple cloud providers (Dropbox/OneDrive).
- Server-side key management / passphrase recovery.
- Encrypted backup browser inside the app.

## Risks & mitigations

- **Lost passphrase = lost cloud backups.** Mitigation: Settings UI shows clear warning at passphrase set time; user must type it twice.
- **Drive API quota.** Mitigation: serial worker, exponential backoff, retention prune to limit upload volume.
- **Token revocation by user.** Mitigation: detected as 401; surface "reconnect" CTA in card; mark queue rows `failed`.
- **Argon2 native module on Electron.** Mitigation: `argon2` ships prebuilds; fallback to `electron-rebuild` post-install if needed.
