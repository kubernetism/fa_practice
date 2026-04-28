/**
 * Thin wrapper around the Google Drive v3 API for the online-backup feature.
 *
 * The wrapper exists for two reasons:
 *   1. Centralise the "Firearms POS Backups" folder lookup/creation so callers
 *      don't repeat the search-or-create dance on every upload.
 *   2. Make the Drive surface trivially mockable in tests by accepting an
 *      injectable `drive` instance — no real `googleapis` import is needed in
 *      unit tests.
 *
 * Errors propagate untouched. The upload queue layer above this wrapper owns
 * retry/backoff policy.
 */

import { createReadStream, createWriteStream, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { OAuth2Client } from 'google-auth-library'
import { type drive_v3, google } from 'googleapis'
import { GOOGLE_CLIENT_ID } from '../utils/oauth-config'

const BACKUP_FOLDER_NAME = 'Firearms POS Backups'

export interface DriveClientDeps {
  /** Inject a pre-built Drive instance for tests; production passes nothing. */
  drive?: drive_v3.Drive
}

export interface BackupListing {
  id: string
  name: string
  size: number
  createdTime: string
}

export class DriveClient {
  private drive: drive_v3.Drive
  private folderIdCache: string | null = null

  constructor(refreshToken: string, deps: DriveClientDeps = {}) {
    if (deps.drive) {
      this.drive = deps.drive
    } else {
      const auth = new OAuth2Client({ clientId: GOOGLE_CLIENT_ID })
      auth.setCredentials({ refresh_token: refreshToken })
      this.drive = google.drive({ version: 'v3', auth })
    }
  }

  /**
   * Resolve (or create) the dedicated backup folder and cache its id for the
   * lifetime of this client. Subsequent calls are a no-op.
   */
  async ensureBackupFolder(): Promise<string> {
    if (this.folderIdCache) return this.folderIdCache

    const listRes = await this.drive.files.list({
      q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    })

    const existing = listRes.data.files?.[0]
    if (existing?.id) {
      this.folderIdCache = existing.id
      return existing.id
    }

    const createRes = await this.drive.files.create({
      requestBody: {
        name: BACKUP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    })

    const id = createRes.data.id
    if (!id) {
      throw new Error('Drive folder creation returned no id')
    }
    this.folderIdCache = id
    return id
  }

  /**
   * Upload `localPath` into `parentId`, reporting per-chunk byte progress.
   * Returns the new file id and its server-reported size (falling back to the
   * local stat size if Drive omits it).
   */
  async uploadFile(
    localPath: string,
    remoteName: string,
    parentId: string,
    onProgress?: (bytes: number) => void,
  ): Promise<{ id: string; size: number }> {
    const size = statSync(localPath).size

    const res = await this.drive.files.create(
      {
        requestBody: { name: remoteName, parents: [parentId] },
        media: { body: createReadStream(localPath) },
        fields: 'id, size',
      },
      {
        // biome-ignore lint/suspicious/noExplicitAny: googleapis types onUploadProgress loosely
        onUploadProgress: (evt: any) => onProgress?.(evt.bytesRead),
      },
    )

    if (!res.data.id) {
      throw new Error('Drive upload returned no file id')
    }
    return {
      id: res.data.id,
      size: Number(res.data.size ?? size),
    }
  }

  /**
   * List up to 100 most-recent backups in `parentId`, newest first.
   */
  async listBackups(parentId: string): Promise<BackupListing[]> {
    const res = await this.drive.files.list({
      q: `'${parentId}' in parents and trashed=false`,
      fields: 'files(id, name, size, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    })

    const files = res.data.files ?? []
    return files.map((f) => ({
      id: f.id ?? '',
      name: f.name ?? '',
      size: Number(f.size ?? 0),
      createdTime: f.createdTime ?? '',
    }))
  }

  /**
   * Stream `fileId` to `destPath`. Throws on any pipeline error.
   */
  async downloadFile(fileId: string, destPath: string): Promise<void> {
    const res = await this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
    await pipeline(res.data as NodeJS.ReadableStream, createWriteStream(destPath))
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId })
  }
}
