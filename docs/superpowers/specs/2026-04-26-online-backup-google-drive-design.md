# Online Backup to Google Drive — Design Spec

**Date:** 2026-04-26
**Target app:** `firearms-pos/` (Electron desktop)
**Status:** Draft — pending user approval

## 1. Goal

Add online backup to the existing local backup system. When a local backup is created (manual, scheduled, or on-close), the app encrypts a copy with an admin-set passphrase and uploads it to that admin's own Google Drive. Backups can be listed and restored from Drive on the same machine or on a fresh install.

## 2. Decisions locked in

| Decision | Choice |
|---|---|
| Destination | Google Drive via OAuth (per-admin's own Drive) |
| Who can connect | Admin users only |
| Trigger | Configurable per-admin toggle. When on, every successful local backup also uploads. Plus a manual "Upload now" button. |
| Encryption | Decrypt machine-locked SQLite → re-encrypt with admin-set passphrase (AES-256-GCM, key derived via argon2id). Cross-machine restore works. |
| Online retention | Mirrors existing `backupRetentionDays` setting (per-user backups pruned in Drive on the same schedule as local) |
| Offline / failure | Persistent retry queue in SQLite. Backup file is queued and retried automatically when connectivity + valid token return. Exponential backoff, max 10 attempts. |
| Restore | Lists Drive backups, downloads, decrypts with passphrase, re-encrypts with the new machine's key, atomic swap of DB. Available both in Settings and as an optional step in the setup wizard. |
| OAuth flow | Loopback redirect with PKCE (Google's modern desktop pattern). Scope: `drive.file` only (no broader Drive access). |
| SDK | `googleapis` official Node.js client. |

## 3. Architecture

### Main-process additions

```
firearms-pos/src/main/
├── ipc/
│   ├── backup-ipc.ts            (extended — calls into cloud-backup hooks)
│   └── cloud-backup-ipc.ts      (NEW — OAuth + cloud list/restore IPC handlers)
├── cloud/                       (NEW)
│   ├── google-oauth.ts          OAuth2 client, loopback redirect, token storage
│   ├── drive-client.ts          Drive API wrapper (upload, list, delete, download)
│   ├── backup-encryptor.ts      Decrypt machine-locked DB → AES-256-GCM file
│   ├── upload-queue.ts          Persistent retry queue worker
│   └── connectivity.ts          Online/offline detection + token-validity check
└── db/schemas/
    ├── cloud_credentials.ts     (NEW)
    └── cloud_backups.ts         (NEW)
```

### Renderer additions

```
firearms-pos/src/renderer/
├── screens/business-settings.tsx                (extended — new "Cloud Backup" card, admin-only)
├── components/cloud-backup/
│   ├── connect-google-button.tsx
│   ├── passphrase-dialog.tsx
│   ├── cloud-backups-list.tsx
│   └── restore-from-cloud-dialog.tsx
└── stores/cloud-backup-store.ts                 Zustand: connection status, queue size, last error
```

### Module boundaries

- `google-oauth.ts` — OAuth + token refresh only. Knows nothing about backups.
- `drive-client.ts` — Drive REST via `googleapis` only. Knows nothing about encryption.
- `backup-encryptor.ts` — File in / file out. Knows nothing about Drive.
- `upload-queue.ts` — The only file that orchestrates the full flow.

### Hook into existing code

After `createBackup()` in `backup-ipc.ts` succeeds, call `enqueueCloudBackup(localPath, reason)`. The local backup path is unchanged. Cloud upload is purely additive.

## 4. OAuth flow (desktop loopback + PKCE)

1. Admin clicks **"Connect Google Drive"**.
2. Main process picks a free local port (range 49152–65535), starts a one-shot HTTP server.
3. Main process generates PKCE pair (`code_verifier`, `code_challenge`).
4. Main process opens default browser via `shell.openExternal(authUrl)`:
   ```
   https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=<DESKTOP_CLIENT_ID>
     &redirect_uri=http://127.0.0.1:<port>/callback
     &response_type=code
     &scope=https://www.googleapis.com/auth/drive.file
     &code_challenge=<challenge>&code_challenge_method=S256
     &access_type=offline&prompt=consent
   ```
5. User completes sign-in in their real browser (no embedded WebView — Google blocks).
6. Google redirects to `127.0.0.1:<port>/callback?code=...`. Local server returns a static "You can close this tab" page and shuts down.
7. Main process exchanges `code + code_verifier` → `access_token` + `refresh_token`.
8. Tokens persisted in `cloud_credentials`. UI shows "Connected as `<email>`".

**Scope:** `drive.file` only. Grants access only to files this app creates. Avoids Google's restricted-scope verification (which `drive` requires).

**OAuth client setup (one-time, by developer):** Google Cloud project → Drive API enabled → OAuth client of type "Desktop app" → `client_id` shipped in the bundle (PKCE is the actual security; no client secret).

**Token refresh:** Handled by `googleapis` automatically. Main process traps the `tokens` event and persists updated tokens back to `cloud_credentials`.

**Disconnect:** Settings → "Disconnect" → calls Google's revoke endpoint, deletes `cloud_credentials` row.

## 5. Schema additions

### `cloud_credentials`

One row per POS user that has connected a Google account. Tokens are encrypted at rest by the existing machine-key DB encryption.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER NOT NULL UNIQUE | FK → `users.id`. One Google account per POS user. |
| `provider` | TEXT NOT NULL | Hardcoded `'google_drive'`; future-proofs other providers. |
| `google_email` | TEXT NOT NULL | Display only. |
| `access_token` | TEXT | Short-lived; nullable. |
| `refresh_token` | TEXT NOT NULL | Long-lived. |
| `access_token_expires_at` | INTEGER | Unix ms. |
| `scope` | TEXT NOT NULL | Recorded for future scope-drift detection. |
| `passphrase_hash` | TEXT NOT NULL | argon2id of passphrase (verification only — actual key derived per-file from header salt). |
| `passphrase_salt` | BLOB NOT NULL | 16 bytes. |
| `auto_upload_enabled` | INTEGER NOT NULL DEFAULT 1 | |
| `last_successful_upload_at` | INTEGER | Unix ms, nullable. |
| `last_error` | TEXT | Cleared on success. |
| `created_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | |

**Admin-only enforcement:** at the IPC handler. Check current user role before opening OAuth flow. Not enforced as a DB constraint — roles can change and we don't want orphan rows blocking that.

### `cloud_backups`

One row per backup we've tried to upload. Local source of truth for the queue and the cloud listing UI.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER NOT NULL | Whose Drive. FK → `users.id`. |
| `local_file_path` | TEXT NOT NULL | The `.db` file in `userData/backups/`. |
| `local_file_size` | INTEGER NOT NULL | |
| `local_file_sha256` | TEXT NOT NULL | Computed once. |
| `cloud_file_id` | TEXT | Drive file ID once uploaded; null while pending. |
| `cloud_file_name` | TEXT NOT NULL | `firearms-pos-backup-<iso>.fpb`. |
| `cloud_file_size` | INTEGER | Encrypted size; null until upload completes. |
| `status` | TEXT NOT NULL | `'pending'` / `'uploading'` / `'uploaded'` / `'failed'` / `'deleted_locally'`. |
| `attempt_count` | INTEGER NOT NULL DEFAULT 0 | |
| `last_attempt_at` | INTEGER | Unix ms. |
| `last_error` | TEXT | |
| `next_retry_at` | INTEGER | Unix ms. |
| `reason` | TEXT NOT NULL | `'manual'` / `'scheduled'` / `'on-close'`. |
| `created_at` | INTEGER NOT NULL | |
| `uploaded_at` | INTEGER | Unix ms; null until `status='uploaded'`. |

**Indexes:** `(status, next_retry_at)` for the queue scan; `(user_id, status)` for the per-user UI listing.

**Migration:** new file at `src/main/db/migrations/add_cloud_backup_tables.ts`. Idempotent; checks if tables exist before creating. Follows the pattern of `migrate_to_business_settings.ts`.

## 6. Settings UI

A new **"Cloud Backup"** card in `business-settings.tsx`, below the existing Backup card, **only rendered if the current user is admin**.

States:

- **Not connected** — "Connect Google Drive" button.
- **Connected, no passphrase set** — "Set Passphrase" button + warning that passphrase cannot be recovered.
- **Ready** — auto-upload toggle, "Last upload", "Pending in queue", buttons: "Upload now", "View cloud backups", "Restore".
- **Error** — token expired / Drive full / etc., with "Reconnect" or actionable next step.

**Passphrase dialog (first-time set):**
- Enter twice
- Minimum 12 characters
- Strength meter
- Required checkbox: "I understand that if I lose this passphrase, my cloud backups cannot be recovered."

**Passphrase change:** prompts for old passphrase. Re-encrypts pending-queue items with the new passphrase. Already-uploaded `.fpb` files in Drive remain encrypted with their previous passphrase; the cloud backups list shows a marker so users know which files need which passphrase.

**View cloud backups dialog:** date, size, source, status, passphrase-era marker, actions (Download / Restore / Delete from Drive).

## 7. Upload pipeline

### Trigger entry points

`enqueueCloudBackup(localFilePath, reason)` is called at the end of:
1. `backup:create` IPC handler (manual)
2. `scheduleNextBackup()` after a scheduled backup
3. `performCloseBackup()` after on-close backup

Each call site checks: *is there a logged-in admin user with connected Drive and `auto_upload_enabled=1`?* If not, skip silently. Local backup already succeeded.

### `enqueueCloudBackup` (synchronous, fast)

1. Compute SHA-256 of local file.
2. Insert row in `cloud_backups` with `status='pending'`, `next_retry_at=now`.
3. Signal upload queue.

### Encryption — `backup-encryptor.ts`

```
input:  /userData/backups/firearms-pos-backup-<ts>.db    (machine-key encrypted)
output: /userData/backups/.staging/<sha256>.fpb          (passphrase encrypted)
```

Steps:

1. **Decrypt to plaintext temp** — use `db-cipher`'s `sqlcipher_export` pattern. Temp file lives only for step 4; deleted in `finally`.
2. **Derive key** — `argon2id(passphrase, salt=cloud_credentials.passphrase_salt, m=64MB, t=3, p=4)` → 32 bytes. Same passphrase + salt → same key (required for restore).
3. **Build `.fpb` header:**
   ```
   Magic:         "FPB1"          4 bytes
   Version:       0x00000001      4 bytes
   Salt:          <16 bytes>      16 bytes  (duplicated from creds for self-contained restore)
   IV:            <12 bytes>      12 bytes  (random per file)
   Argon params:  m, t, p         12 bytes  (so old files restore even if defaults change)
   Auth tag:      <16 bytes>      16 bytes  (filled after encryption pass)
   Ciphertext:    streaming       N bytes   (AES-256-GCM, 1 MB chunks)
   ```
4. **Stream-encrypt** — `crypto.createCipheriv('aes-256-gcm', key, iv)` via `pipeline()`. Compute SHA-256 of plaintext during the same pass for restore-time integrity check.
5. **Wipe plaintext temp** — overwrite with zeros, then `unlink`. Required because regulated firearms data; SQLite's `secure_delete` PRAGMA only protects within the encrypted DB.
6. **Return** `.fpb` path, encrypted size, plaintext SHA-256.

### Upload — `drive-client.upload(fpbPath, fileName)`

- Look up or create `Firearms POS Backups` folder in user's Drive root. Cache folder ID per session.
- `googleapis` resumable upload (auto-chunks files >5 MB, survives connection drops).
- Drive metadata:
  - `name = cloud_file_name`
  - `parents = [folderId]`
  - `appProperties = { fpbVersion: '1', sourceMachine: <hashed machine id>, reason }` (searchable)
- Returns Drive file ID + cloud size.

### After upload success

- Update row: `status='uploaded'`, `cloud_file_id`, `cloud_file_size`, `uploaded_at`.
- Delete `.fpb` from `.staging/`.
- Run cloud retention prune: scan `cloud_backups WHERE user_id=X AND status='uploaded'` ordered by `uploaded_at DESC`. Delete from Drive **and** from local DB anything older than `backupRetentionDays`.

### Pipeline error matrix

| Error | Action |
|---|---|
| Decrypt fails (corrupt local DB) | `failed`, no retry; log loud error. |
| Disk full during staging | `failed`, retry in 1h. |
| Network timeout during upload | Resumable upload retries internally; if exhausted → exponential backoff. |
| 401 Unauthorized | Try one token refresh; if refresh fails, mark `failed`, set `cloud_credentials.last_error`, surface "Reconnect" UI. |
| 403 Quota / Drive full | `failed`, surface "Drive full" toast. No retry until user clears space. |
| 5xx | Standard exponential backoff. |
| App quits mid-upload | On startup, reset `'uploading'` → `'pending'`. Re-encrypt and re-upload from scratch. (Resumable session ID persistence is not worth the complexity.) |

## 8. Retry queue

### Single in-process worker

Started in `registerBackupHandlers()`. One worker (parallelism causes Drive throttling).

Loop:

1. `SELECT * FROM cloud_backups WHERE status IN ('pending','failed') AND next_retry_at <= now() AND attempt_count < MAX_ATTEMPTS ORDER BY created_at ASC LIMIT 1`.
2. If none → sleep until soonest `next_retry_at` OR a wakeup signal, whichever first.
3. If found:
   a. Pre-flight: connectivity OK? Token valid or refreshable? If not → re-sleep, do not increment `attempt_count`.
   b. `status='uploading'`, `last_attempt_at=now`.
   c. Run encrypt + upload pipeline.
   d. On success: mark `'uploaded'`, clear `last_error`, run retention prune.
   e. On failure: `status='failed'`, `attempt_count++`, compute `next_retry_at` via backoff, record `last_error`.
4. Goto 1.

**Constants:**
- `MAX_ATTEMPTS = 10`. After exhaustion, row stays `'failed'` permanently with manual "Retry" button in UI.
- **Backoff:** 1m, 5m, 15m, 1h, 3h, 6h, 12h, 24h, 24h, 24h.

### Connectivity detector — `connectivity.ts`

- Subscribe to Chromium `online`/`offline` events on the main `BrowserWindow`.
- On state change → emit wakeup signal.
- Token-validity check is lazy: at upload time, attempt a Drive `about.get` (cheap, scoped to `drive.file`); 401 → try refresh; refresh fails → credential is dead.

### Wakeup signals

`EventEmitter` triggers:

1. New row enqueued via `enqueueCloudBackup`.
2. Connectivity restored.
3. User clicks "Upload now" → wake worker AND set `next_retry_at = now` for that user's `pending`/`failed` rows.
4. User reconnects after token-revoke state → same as 3 for that user's rows.

### What survives an app quit

Everything is in SQLite. On startup:
- Reset `'uploading'` → `'pending'` (worker died mid-upload).
- Worker resumes its loop.

### Public surface of `upload-queue.ts`

```ts
start()                       // called from registerBackupHandlers()
stop()                        // called on app quit
enqueue(localPath, reason)    // called from backup-ipc.ts after every successful local backup
wakeUp(reason)                // called from connectivity / "Upload now" / reconnect
```

UI reads status directly from `cloud_backups` via separate IPC handlers — the queue does not expose a public status API.

### Local retention interaction

When existing `cleanOldBackups()` deletes a local `.db` file:
- Matching `cloud_backups` rows still `pending`/`failed` → mark `'deleted_locally'` and stop retrying.
- Rows already `'uploaded'` → leave alone. Cloud copy is independent.

## 9. Restore from cloud

Two entry points, one underlying flow.

### Entry A — same machine

Settings → Cloud Backup → "Restore" button. User already logged in.

### Entry B — fresh install / new machine

Setup wizard adds a new optional step: "Restore from Google Drive backup" → OAuth flow → list backups → pick → enter passphrase → restore. After restore, app reboots into the restored state.

### Flow

1. **List cloud backups**
   - Reconcile local `cloud_backups` table with Drive folder contents. Drive is authoritative.
   - Show: filename, date, size, source, passphrase-era marker.
2. **User selects** → "Restore".
3. **Confirmation dialog** — "This will REPLACE your current database. A safety backup will be created first."
4. **Passphrase prompt**
   - If `cloud_credentials` row exists locally, verify against stored hash for fast typo feedback (note: hash match doesn't guarantee the file decrypts — different file may have been encrypted with a different passphrase).
   - Up to 5 attempts then 30s lockout.
5. **Streaming download** of `.fpb` from Drive to `userData/backups/.staging/<id>.fpb`. Progress reported to UI from `Content-Length`.
6. **Verify magic** "FPB1" and version on download complete; abort if invalid.
7. **Stream decrypt** (mirrors §7 in reverse)
   - Read header: salt, IV, argon params, auth tag.
   - Derive key: `argon2id(passphrase, header.salt, header.params)`. **Use header values, not `cloud_credentials`** — file is self-contained, restore works on fresh install and across passphrase changes.
   - Stream-decrypt with AES-256-GCM.
   - GCM auth tag verifies on stream end. Failure = wrong passphrase OR corrupt file (GCM can't distinguish). Surface "Wrong passphrase or corrupted file." Bump attempt counter.
8. **Validate restored DB**
   - Open with `better-sqlite3` readonly (no key — file is plaintext at this point).
   - `PRAGMA integrity_check`.
   - Verify expected tables exist (sample 5: `users`, `products`, `sales`, etc.).
   - Failure → abort, "Backup file is corrupted or not a Firearms POS database", wipe staging, leave current DB untouched.
9. **Safety backup of current DB** — copy current encrypted DB to `userData/backups/pre-cloud-restore-<ts>.db` (mirrors existing `restoreBackup()` pattern).
10. **Atomic swap**
    - `closeDatabase()`.
    - Delete current `dbPath`, `dbPath-wal`, `dbPath-shm`.
    - Run `db-cipher`'s "encrypt plaintext with machine key" on the restored plaintext file (uses the **new** machine's key — this is what makes cross-machine restore work).
    - Move machine-key-encrypted file to `dbPath`.
    - `reinitializeDatabase()`.
    - On any failure in this block → restore from safety backup, surface error.
11. **Reload renderer windows** (existing pattern in `restoreBackup()`). Setup-wizard path additionally redirects to login.
12. **Wipe staging** — overwrite + unlink both `.fpb` and `.db` plaintext files.

### Edge cases

- **Forgotten passphrase** — explicit "There is no recovery. You can still use any local backup." with a deep link to import-from-local-file.
- **Older-passphrase file** — works automatically because the header carries its own salt/params. We do not need to keep historical passphrase hashes.
- **Drive folder missing** — surface "No cloud backups found" with reconnect/retry.
- **Backup encrypted by a different OAuth client** — `drive.file` scope limits visibility to files created by *this* `client_id`. Same `client_id` ships with every install, so this is a non-issue in practice.

## 10. Security considerations

- **Tokens at rest** — stored in SQLite, which is itself machine-key encrypted. No plaintext tokens on disk.
- **Plaintext temp files** — written to `userData/backups/.staging/`, overwritten with zeros and `unlink`'d in `finally` blocks. Staging dir is wiped on app startup as defense in depth.
- **Passphrase memory handling** — held in main-process memory only for the duration of an encrypt or decrypt operation, then zeroed. Never written to logs.
- **`drive.file` scope** — minimum trust. App cannot read user's other Drive files.
- **PKCE** — desktop client_id ships in bundle (acceptable for desktop apps); PKCE is the actual security against code-interception attacks.
- **Argon2id parameters** — `m=64MB, t=3, p=4` from header; allows tuning up later without breaking old files.
- **AES-256-GCM** — authenticated encryption; tag verification on decrypt protects against tampering. Random 12-byte IV per file (never reused with the same key).
- **Source machine ID** — stored in `appProperties.sourceMachine` as a salted hash, so a Drive file leak doesn't reveal which physical machine produced it.

## 11. Testing strategy

- **Unit tests**
  - `backup-encryptor.ts` — round-trip: encrypt → decrypt → bytes match. Wrong passphrase fails. Tampered ciphertext fails GCM check. Tampered header fails magic check.
  - `upload-queue.ts` — backoff math; pre-flight gating; status transitions; recovery from `'uploading'` on startup.
  - `connectivity.ts` — mocks Chromium online/offline events.
- **Integration tests** (test DB, mocked `googleapis`)
  - Full enqueue → encrypt → upload → row update path.
  - Token-refresh-on-401 path.
  - Failure after `MAX_ATTEMPTS`.
  - Cloud retention prune deletes correct rows + correct Drive files.
- **Manual smoke tests**
  - End-to-end OAuth on Linux + Windows + macOS (loopback ports).
  - Upload of a >100 MB DB (resumable upload).
  - Disconnect mid-upload → reconnect → resumes.
  - Cross-machine restore: backup on machine A, restore on machine B.
  - Setup-wizard restore flow.
  - Forgotten passphrase UX.

## 12. Out of scope (not in this spec)

- Other cloud providers (Dropbox, OneDrive, S3). Schema is provider-aware; future work.
- Per-file passphrase (one passphrase per backup). Single-user-passphrase model is the design.
- Differential / incremental backups. Each upload is the full DB.
- Selective restore from cloud. Cloud restore is full-DB; selective is local-only via existing `importSelective`.
- Backup file compression. Gzipping the plaintext before encryption is a future optimization; defer until size becomes a measured problem.
- Web-app cloud backup (`firearms-pos-web/`). Out of scope — Neon already provides DB-level durability.

## 13. Migration / rollout

- Schema changes are additive (two new tables); no migration of existing rows.
- Existing local-backup behavior is unchanged for users who never connect a Google account.
- Feature is invisible to non-admin users.
- New `googleapis` and `argon2` dependencies added.
