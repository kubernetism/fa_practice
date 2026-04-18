import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, getTestDb, getTestSqlite } from './test-db'

type Handler = (event: unknown, ...args: unknown[]) => unknown
const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: Handler) => {
      handlers.set(channel, handler)
    },
    removeHandler: (channel: string) => {
      handlers.delete(channel)
    },
  },
}))

vi.mock('../db/index', () => ({
  getDatabase: () => getTestDb(),
  getRawDatabase: () => getTestSqlite(),
  getDbPath: () => ':memory:',
}))

vi.mock('../utils/audit', () => ({
  createAuditLog: vi.fn(async (params: Record<string, unknown>) => {
    const db = getTestSqlite()
    db.prepare(
      `INSERT INTO audit_logs (user_id, branch_id, action, entity_type, entity_id, new_values, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      params.userId ?? null,
      params.branchId ?? null,
      params.action,
      params.entityType,
      params.entityId ?? null,
      params.newValues ? JSON.stringify(params.newValues) : null,
      params.description ?? null,
    )
  }),
  sanitizeForAudit: (obj: Record<string, unknown>) => obj,
}))

vi.mock('../ipc/auth-ipc', () => ({
  getCurrentSession: () => ({ userId: 1, branchId: 1 }),
  registerAuthHandlers: () => {},
}))

import { registerProductHandlers } from '../ipc/products-ipc'

async function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const handler = handlers.get(channel)
  if (!handler) throw new Error(`No handler for ${channel}`)
  return (await handler({}, ...args)) as T
}

function createFirearmCategory(name: string, isFirearm: boolean): number {
  const sqlite = getTestSqlite()
  const res = sqlite
    .prepare('INSERT INTO categories (name, is_firearm) VALUES (?, ?) RETURNING id')
    .get(name, isFirearm ? 1 : 0) as { id: number }
  return res.id
}

function createLookup(table: string, name: string): number {
  const sqlite = getTestSqlite()
  const res = sqlite
    .prepare(`INSERT INTO ${table} (name) VALUES (?) RETURNING id`)
    .get(name) as { id: number }
  return res.id
}

describe('products IPC — firearm integration', () => {
  beforeEach(() => {
    handlers.clear()
    setupTestDatabase()
    const sqlite = getTestSqlite()
    try {
      sqlite.prepare('ALTER TABLE categories ADD COLUMN is_firearm INTEGER NOT NULL DEFAULT 0').run()
    } catch {
      /* already present */
    }
    for (const col of [
      'make TEXT',
      'made_year INTEGER',
      'made_country TEXT',
      'firearm_model_id INTEGER',
      'caliber_id INTEGER',
      'shape_id INTEGER',
      'design_id INTEGER',
      'default_supplier_id INTEGER',
    ]) {
      try {
        sqlite.prepare(`ALTER TABLE products ADD COLUMN ${col}`).run()
      } catch {
        /* already added */
      }
    }
    registerProductHandlers()
  })

  afterEach(() => {
    teardownTestDatabase()
  })

  it('rejects firearm-category product without required firearm fields', async () => {
    const catId = createFirearmCategory('Handguns', true)
    const res = await invoke<{ success: boolean; message?: string }>('products:create', {
      code: 'FIR001',
      name: 'Test Pistol',
      categoryId: catId,
      sellingPrice: 1000,
      costPrice: 800,
    })
    expect(res.success).toBe(false)
    expect(res.message).toMatch(/required/i)
  })

  it('accepts firearm-category product when all required fields present', async () => {
    const catId = createFirearmCategory('Handguns', true)
    const sqlite = getTestSqlite()
    sqlite.prepare('CREATE TABLE IF NOT EXISTS firearm_models (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)').run()
    sqlite.prepare('CREATE TABLE IF NOT EXISTS firearm_calibers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)').run()
    const modelId = createLookup('firearm_models', 'Glock 19')
    const calId = createLookup('firearm_calibers', '9mm')

    const res = await invoke<{ success: boolean; data: { id: number; make: string } }>(
      'products:create',
      {
        code: 'FIR002',
        name: 'Test Firearm',
        categoryId: catId,
        sellingPrice: 1000,
        costPrice: 800,
        make: 'imported',
        firearmModelId: modelId,
        caliberId: calId,
        madeYear: 2022,
        madeCountry: 'Austria',
      },
    )
    expect(res.success).toBe(true)
    expect(res.data.make).toBe('imported')
  })

  it('rejects invalid made_year', async () => {
    const catId = createFirearmCategory('Misc', false)
    const res = await invoke<{ success: boolean }>('products:create', {
      code: 'M1',
      name: 'Thing',
      categoryId: catId,
      sellingPrice: 10,
      costPrice: 5,
      madeYear: 1700,
    })
    expect(res.success).toBe(false)
  })

  it('writes a product_firearm audit entry when firearm fields change', async () => {
    const catId = createFirearmCategory('Misc', false)
    const created = await invoke<{ data: { id: number } }>('products:create', {
      code: 'A1',
      name: 'Item',
      categoryId: catId,
      sellingPrice: 1,
      costPrice: 0,
    })
    await invoke('products:update', created.data.id, { make: 'local', madeYear: 2020 })

    const sqlite = getTestSqlite()
    const logs = sqlite
      .prepare(
        "SELECT * FROM audit_logs WHERE entity_type IN ('product', 'product_firearm') AND entity_id = ? ORDER BY id DESC",
      )
      .all(created.data.id) as Array<{ entity_type: string; new_values: string | null }>
    expect(logs.length).toBeGreaterThan(0)
    const firearmLog = logs.find((l) => l.entity_type === 'product_firearm')
    expect(firearmLog).toBeDefined()
    expect(firearmLog!.new_values).toContain('make')
  })
})
