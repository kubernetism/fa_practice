import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3-multiple-ciphers'
import { migrateFirearmAttributes } from '../db/migrations/migrate_firearm_attributes'

function setupBaseDb(): Database.Database {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT, email TEXT, address TEXT, notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id),
      brand TEXT,
      cost_price REAL NOT NULL DEFAULT 0,
      selling_price REAL NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      unit TEXT NOT NULL DEFAULT 'pcs',
      is_serial_tracked INTEGER NOT NULL DEFAULT 0,
      is_taxable INTEGER NOT NULL DEFAULT 1,
      tax_rate REAL NOT NULL DEFAULT 0,
      barcode TEXT,
      image_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  return sqlite
}

describe('migrateFirearmAttributes', () => {
  it('adds firearm columns to products and seeds lookup tables', () => {
    const sqlite = setupBaseDb()
    migrateFirearmAttributes(sqlite)

    const productCols = sqlite.prepare('PRAGMA table_info(products)').all() as Array<{ name: string }>
    const colNames = productCols.map((c) => c.name)
    expect(colNames).toContain('make')
    expect(colNames).toContain('made_year')
    expect(colNames).toContain('made_country')
    expect(colNames).toContain('firearm_model_id')
    expect(colNames).toContain('caliber_id')
    expect(colNames).toContain('shape_id')
    expect(colNames).toContain('design_id')
    expect(colNames).toContain('default_supplier_id')

    const catCols = sqlite.prepare('PRAGMA table_info(categories)').all() as Array<{ name: string }>
    expect(catCols.map((c) => c.name)).toContain('is_firearm')

    const modelCount = sqlite.prepare('SELECT COUNT(*) as c FROM firearm_models').get() as { c: number }
    expect(modelCount.c).toBe(100)

    const caliberCount = sqlite.prepare('SELECT COUNT(*) as c FROM firearm_calibers').get() as { c: number }
    expect(caliberCount.c).toBeGreaterThanOrEqual(30)

    const shapeCount = sqlite.prepare('SELECT COUNT(*) as c FROM firearm_shapes').get() as { c: number }
    expect(shapeCount.c).toBeGreaterThanOrEqual(10)

    const designCount = sqlite.prepare('SELECT COUNT(*) as c FROM firearm_designs').get() as { c: number }
    expect(designCount.c).toBeGreaterThanOrEqual(15)

    sqlite.close()
  })

  it('is idempotent — running twice does not duplicate seeds or error', () => {
    const sqlite = setupBaseDb()
    migrateFirearmAttributes(sqlite)
    migrateFirearmAttributes(sqlite)

    const modelCount = sqlite.prepare('SELECT COUNT(*) as c FROM firearm_models').get() as { c: number }
    expect(modelCount.c).toBe(100)
    sqlite.close()
  })
})
