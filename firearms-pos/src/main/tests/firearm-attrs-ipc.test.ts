import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, getTestDb, getTestSqlite } from './test-db'

vi.mock('electron', () => ({
  ipcMain: {
    handle: () => {},
    removeHandler: () => {},
  },
}))

vi.mock('../db/index', () => ({
  getDatabase: () => getTestDb(),
  getRawDatabase: () => getTestSqlite(),
  getDbPath: () => ':memory:',
}))

vi.mock('../utils/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  sanitizeForAudit: (obj: Record<string, unknown>) => obj,
}))

vi.mock('./auth-ipc', () => ({
  getCurrentSession: () => ({ userId: 1, branchId: 1 }),
}))

import {
  createHandler,
  listHandler,
  updateHandler,
  deactivateHandler,
  type FirearmLookupKind,
} from '../ipc/firearm-attrs-ipc'

const kinds: FirearmLookupKind[] = ['models', 'calibers', 'shapes', 'designs']

describe('firearm-attrs IPC', () => {
  beforeEach(() => {
    setupTestDatabase()
  })

  afterEach(() => {
    teardownTestDatabase()
  })

  for (const kind of kinds) {
    it(`${kind}: list-create-update-deactivate roundtrip`, async () => {
      const created = await createHandler(kind, { name: `Test ${kind} A`, sortOrder: 999 })
      expect(created.success).toBe(true)
      const id = (created as { data: { id: number } }).data.id

      const listed = await listHandler(kind, { activeOnly: true })
      expect(listed.data.some((r) => r.id === id)).toBe(true)

      const updated = await updateHandler(kind, id, { name: `Test ${kind} B` })
      expect((updated as { data: { name: string } }).data.name).toBe(`Test ${kind} B`)

      const deactivated = await deactivateHandler(kind, id)
      expect(deactivated.success).toBe(true)

      const activeList = await listHandler(kind, { activeOnly: true })
      expect(activeList.data.some((r) => r.id === id)).toBe(false)
    })

    it(`${kind}: rejects duplicate name (case-insensitive)`, async () => {
      await createHandler(kind, { name: 'Dup Test' })
      const dup = await createHandler(kind, { name: 'dup test' })
      expect(dup.success).toBe(false)
    })

    it(`${kind}: rejects empty name`, async () => {
      const res = await createHandler(kind, { name: '   ' })
      expect(res.success).toBe(false)
    })
  }
})
