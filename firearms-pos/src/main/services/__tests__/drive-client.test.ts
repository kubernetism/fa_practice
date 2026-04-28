// Unit tests for DriveClient. We deliberately avoid importing `googleapis` —
// each test constructs the client with a hand-rolled mock Drive that records
// calls and returns canned data. This keeps the suite hermetic and fast.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DriveClient } from '../drive-client'

interface MockCall {
  method: string
  // biome-ignore lint/suspicious/noExplicitAny: test-only recording shape
  params: any
  // biome-ignore lint/suspicious/noExplicitAny: test-only recording shape
  opts?: any
}

interface MockDrive {
  calls: MockCall[]
  files: {
    list: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    get: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
}

function mockDrive(
  overrides: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
    list?: (params: any) => any
    // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
    create?: (params: any, opts?: any) => any
    // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
    get?: (params: any, opts?: any) => any
    // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
    delete?: (params: any) => any
  } = {},
): MockDrive {
  const calls: MockCall[] = []
  return {
    calls,
    files: {
      // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
      list: vi.fn(async (params: any) => {
        calls.push({ method: 'list', params })
        return overrides.list ? overrides.list(params) : { data: { files: [] } }
      }),
      // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
      create: vi.fn(async (params: any, opts?: any) => {
        calls.push({ method: 'create', params, opts })
        return overrides.create ? overrides.create(params, opts) : { data: { id: 'NEW' } }
      }),
      // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
      get: vi.fn(async (params: any, opts?: any) => {
        calls.push({ method: 'get', params, opts })
        return overrides.get ? overrides.get(params, opts) : { data: undefined }
      }),
      // biome-ignore lint/suspicious/noExplicitAny: test mock fixtures
      delete: vi.fn(async (params: any) => {
        calls.push({ method: 'delete', params })
        return overrides.delete ? overrides.delete(params) : { data: undefined }
      }),
    },
  }
}

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'drive-client-test-'))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('DriveClient.ensureBackupFolder', () => {
  it('creates a new folder when none exists and returns its id', async () => {
    const drive = mockDrive({
      list: () => ({ data: { files: [] } }),
      create: () => ({ data: { id: 'NEW_FOLDER' } }),
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    const id = await client.ensureBackupFolder()
    expect(id).toBe('NEW_FOLDER')

    const listCall = drive.calls.find((c) => c.method === 'list')
    expect(listCall).toBeDefined()
    expect(listCall?.params.q).toContain("name='Firearms POS Backups'")
    expect(listCall?.params.q).toContain("mimeType='application/vnd.google-apps.folder'")

    const createCall = drive.calls.find((c) => c.method === 'create')
    expect(createCall?.params.requestBody.name).toBe('Firearms POS Backups')
    expect(createCall?.params.requestBody.mimeType).toBe('application/vnd.google-apps.folder')
  })

  it('caches the folder id on the second call (no second list/create)', async () => {
    const drive = mockDrive({
      list: () => ({ data: { files: [] } }),
      create: () => ({ data: { id: 'NEW_FOLDER' } }),
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    await client.ensureBackupFolder()
    const id2 = await client.ensureBackupFolder()

    expect(id2).toBe('NEW_FOLDER')
    expect(drive.files.list).toHaveBeenCalledTimes(1)
    expect(drive.files.create).toHaveBeenCalledTimes(1)
  })

  it('returns existing folder id without creating a new one', async () => {
    const drive = mockDrive({
      list: () => ({ data: { files: [{ id: 'EXISTING' }] } }),
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    const id = await client.ensureBackupFolder()
    expect(id).toBe('EXISTING')
    expect(drive.files.create).not.toHaveBeenCalled()
  })

  it('propagates list errors', async () => {
    const boom = new Error('drive list 500')
    const drive = mockDrive({
      list: () => {
        throw boom
      },
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    await expect(client.ensureBackupFolder()).rejects.toBe(boom)
  })
})

describe('DriveClient.uploadFile', () => {
  it('uploads a real tmp file and returns id + parsed size', async () => {
    const filePath = join(tmpDir, 'payload.bin')
    writeFileSync(filePath, 'hello drive')

    const drive = mockDrive({
      // biome-ignore lint/suspicious/noExplicitAny: test mock fixture
      create: async (params: any) => {
        // Drain the read-stream body so the file handle opens (and closes)
        // before afterEach removes the tmp directory.
        const body = params?.media?.body as NodeJS.ReadableStream | undefined
        if (body) {
          await new Promise<void>((resolve, reject) => {
            body.on('data', () => {})
            body.on('end', () => resolve())
            body.on('error', reject)
          })
        }
        return { data: { id: 'F1', size: '123' } }
      },
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    const result = await client.uploadFile(filePath, 'remote.bin', 'PARENT')
    expect(result).toEqual({ id: 'F1', size: 123 })

    const createCall = drive.calls.find((c) => c.method === 'create')
    expect(createCall?.params.requestBody.parents).toEqual(['PARENT'])
    expect(createCall?.params.requestBody.name).toBe('remote.bin')
  })
})

describe('DriveClient.listBackups', () => {
  it('maps Drive listings to BackupListing[]', async () => {
    const drive = mockDrive({
      list: () => ({
        data: {
          files: [
            { id: 'a', name: 'a.fpb', size: '10', createdTime: '2026-01-01T00:00:00Z' },
            { id: 'b', name: 'b.fpb', size: '20', createdTime: '2026-01-02T00:00:00Z' },
            { id: 'c', name: 'c.fpb', createdTime: '2026-01-03T00:00:00Z' },
          ],
        },
      }),
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    const list = await client.listBackups('PARENT')
    expect(list).toEqual([
      { id: 'a', name: 'a.fpb', size: 10, createdTime: '2026-01-01T00:00:00Z' },
      { id: 'b', name: 'b.fpb', size: 20, createdTime: '2026-01-02T00:00:00Z' },
      { id: 'c', name: 'c.fpb', size: 0, createdTime: '2026-01-03T00:00:00Z' },
    ])
  })
})

describe('DriveClient.deleteFile', () => {
  it('forwards fileId to the Drive client', async () => {
    const drive = mockDrive()
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    await client.deleteFile('X')

    expect(drive.files.delete).toHaveBeenCalledTimes(1)
    expect(drive.files.delete).toHaveBeenCalledWith({ fileId: 'X' })
  })
})

describe('DriveClient.downloadFile', () => {
  it('streams the response body into the destination file', async () => {
    const drive = mockDrive({
      get: () => ({ data: Readable.from('payload') }),
    })
    // biome-ignore lint/suspicious/noExplicitAny: pass mock as drive_v3.Drive
    const client = new DriveClient('refresh', { drive: drive as any })

    const dest = join(tmpDir, 'out.bin')
    await client.downloadFile('FILEID', dest)

    expect(readFileSync(dest, 'utf8')).toBe('payload')
    const getCall = drive.calls.find((c) => c.method === 'get')
    expect(getCall?.params).toEqual({ fileId: 'FILEID', alt: 'media' })
    expect(getCall?.opts).toEqual({ responseType: 'stream' })
  })
})
