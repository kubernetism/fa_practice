# Firearm Product Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the firearms-pos Electron app so staff can register firearms with make (local/imported), made year/country, model, shape, design, caliber/bore, and default supplier — populated from seeded dropdowns (100 models, 30 calibers, 10 shapes, 15 designs) that admins can edit. Fields propagate through the product list, POS search/cart, four new reports, receipts, and audit logs.

**Architecture:** Additive SQLite migration adds 8 nullable columns to `products` and 4 lookup tables. Each lookup gets dedicated Drizzle schema + IPC handlers + preload surface. A shared `<LookupCombobox>` renderer component powers both the product form (with inline "+ New") and the dedicated Firearm Attributes settings page (4-tab CRUD). POS extends its search index; Reports gains four new SQL-backed report views; audit log records firearm-field diffs.

**Tech Stack:** Electron 28, React 18, TypeScript, Drizzle ORM, better-sqlite3-multiple-ciphers, shadcn/ui (Radix + Tailwind), Vitest, React Router, Zustand.

**Spec:** `firearms-pos/docs/superpowers/specs/2026-04-17-firearm-product-registration-design.md`

**Checklist mirror:** `firearms-pos/checklist.md` — keep ticked in sync as tasks complete.

---

## File Structure

**Create:**
- `src/main/db/schemas/firearm-models.ts`
- `src/main/db/schemas/firearm-calibers.ts`
- `src/main/db/schemas/firearm-shapes.ts`
- `src/main/db/schemas/firearm-designs.ts`
- `src/main/db/migrations/migrate_firearm_attributes.ts`
- `src/main/ipc/firearm-attrs-ipc.ts`
- `src/main/ipc/firearm-reports-ipc.ts`
- `src/main/utils/firearm-validation.ts`
- `src/renderer/screens/firearm-attributes/index.tsx`
- `src/renderer/screens/firearm-attributes/lookup-table-editor.tsx`
- `src/renderer/screens/reports/inventory-by-caliber.tsx`
- `src/renderer/screens/reports/sales-by-make.tsx`
- `src/renderer/screens/reports/sales-by-model.tsx`
- `src/renderer/screens/reports/stock-by-supplier.tsx`
- `src/renderer/components/firearm/firearm-details-section.tsx`
- `src/renderer/components/firearm/lookup-combobox.tsx`
- `src/renderer/hooks/use-firearm-lookups.ts`
- `src/main/tests/firearm-migration.test.ts`
- `src/main/tests/firearm-attrs-ipc.test.ts`
- `src/main/tests/firearm-validation.test.ts`
- `src/main/tests/products-firearm.test.ts`

**Modify:**
- `src/main/db/schemas/products.ts` — add 8 firearm columns + indexes
- `src/main/db/schemas/categories.ts` — add `isFirearm` column
- `src/main/db/schema.ts` — export 4 new schemas
- `src/main/db/migrate.ts` — register migration
- `src/main/ipc/index.ts` — register firearm-attrs + firearm-reports handlers
- `src/main/ipc/products-ipc.ts` — replace broken sanitize + firearm validation + search widening + audit diff
- `src/preload/index.ts` — expose `firearmAttrs` + `firearmReports` API
- `src/preload/index.d.ts` — type the new API
- `src/renderer/screens/products/index.tsx` — integrate `<FirearmDetailsSection>`, add columns/filters
- `src/renderer/screens/categories-management/index.tsx` — add `isFirearm` checkbox
- `src/renderer/screens/pos/index.tsx` — metadata sub-line, tile chip
- `src/renderer/components/receipt-preview.tsx` — firearm sub-line on receipt
- `src/renderer/components/layout/sidebar.tsx` — Firearm Attributes entry
- `src/renderer/routes.tsx` — routes for Firearm Attributes + 4 reports

**Do not modify:** Pricing, tax, inventory cost layers, purchases accounting, or auth flows.

---

## Phase 1 — Schema & Seeds

### Task 1: Lookup table schemas (4 files)

**Files:**
- Create: `src/main/db/schemas/firearm-models.ts`
- Create: `src/main/db/schemas/firearm-calibers.ts`
- Create: `src/main/db/schemas/firearm-shapes.ts`
- Create: `src/main/db/schemas/firearm-designs.ts`

- [ ] **Step 1: Write `firearm-models.ts`**

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmModels = sqliteTable('firearm_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type FirearmModel = typeof firearmModels.$inferSelect
export type NewFirearmModel = typeof firearmModels.$inferInsert
```

- [ ] **Step 2: Write `firearm-calibers.ts`** (same shape, table `firearm_calibers`, exports `firearmCalibers`, `FirearmCaliber`, `NewFirearmCaliber`)

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmCalibers = sqliteTable('firearm_calibers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type FirearmCaliber = typeof firearmCalibers.$inferSelect
export type NewFirearmCaliber = typeof firearmCalibers.$inferInsert
```

- [ ] **Step 3: Write `firearm-shapes.ts`** (same pattern, exports `firearmShapes`, `FirearmShape`, `NewFirearmShape`)

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmShapes = sqliteTable('firearm_shapes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type FirearmShape = typeof firearmShapes.$inferSelect
export type NewFirearmShape = typeof firearmShapes.$inferInsert
```

- [ ] **Step 4: Write `firearm-designs.ts`** (same pattern, exports `firearmDesigns`, `FirearmDesign`, `NewFirearmDesign`)

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const firearmDesigns = sqliteTable('firearm_designs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type FirearmDesign = typeof firearmDesigns.$inferSelect
export type NewFirearmDesign = typeof firearmDesigns.$inferInsert
```

- [ ] **Step 5: Commit**

```bash
git add src/main/db/schemas/firearm-models.ts src/main/db/schemas/firearm-calibers.ts src/main/db/schemas/firearm-shapes.ts src/main/db/schemas/firearm-designs.ts
git commit -m "feat(db): add firearm lookup schemas (models/calibers/shapes/designs)"
```

---

### Task 2: Extend products and categories schemas

**Files:**
- Modify: `src/main/db/schemas/products.ts`
- Modify: `src/main/db/schemas/categories.ts`
- Modify: `src/main/db/schema.ts`

- [ ] **Step 1: Extend `products.ts`** — replace full file contents:

```ts
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'
import { firearmModels } from './firearm-models'
import { firearmCalibers } from './firearm-calibers'
import { firearmShapes } from './firearm-shapes'
import { firearmDesigns } from './firearm-designs'
import { suppliers } from './suppliers'

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: integer('category_id').references(() => categories.id),
    brand: text('brand'),
    costPrice: real('cost_price').notNull().default(0),
    sellingPrice: real('selling_price').notNull().default(0),
    reorderLevel: integer('reorder_level').notNull().default(10),
    unit: text('unit').notNull().default('pcs'),
    isSerialTracked: integer('is_serial_tracked', { mode: 'boolean' }).notNull().default(false),
    isTaxable: integer('is_taxable', { mode: 'boolean' }).notNull().default(true),
    taxRate: real('tax_rate').notNull().default(0),
    barcode: text('barcode'),
    imageUrl: text('image_url'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    // Firearm-specific fields (all nullable)
    make: text('make'), // 'local' | 'imported'
    madeYear: integer('made_year'),
    madeCountry: text('made_country'),
    firearmModelId: integer('firearm_model_id').references(() => firearmModels.id),
    caliberId: integer('caliber_id').references(() => firearmCalibers.id),
    shapeId: integer('shape_id').references(() => firearmShapes.id),
    designId: integer('design_id').references(() => firearmDesigns.id),
    defaultSupplierId: integer('default_supplier_id').references(() => suppliers.id),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    idxFirearmModel: index('idx_products_firearm_model').on(table.firearmModelId),
    idxCaliber: index('idx_products_caliber').on(table.caliberId),
    idxDefaultSupplier: index('idx_products_default_supplier').on(table.defaultSupplierId),
  }),
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
```

- [ ] **Step 2: Extend `categories.ts`** — add `isFirearm` column. Replace file contents:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  parentId: integer('parent_id').references((): ReturnType<typeof integer> => categories.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isFirearm: integer('is_firearm', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
```

- [ ] **Step 3: Register new schemas in `src/main/db/schema.ts`** — add at end of export list:

```ts
export * from './schemas/firearm-models'
export * from './schemas/firearm-calibers'
export * from './schemas/firearm-shapes'
export * from './schemas/firearm-designs'
```

- [ ] **Step 4: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: no errors in modified/added files.

- [ ] **Step 5: Commit**

```bash
git add src/main/db/schemas/products.ts src/main/db/schemas/categories.ts src/main/db/schema.ts
git commit -m "feat(db): extend products + categories with firearm fields"
```

---

### Task 3: Migration with seed data

**Files:**
- Create: `src/main/db/migrations/migrate_firearm_attributes.ts`
- Create: `src/main/tests/firearm-migration.test.ts`
- Modify: `src/main/db/migrate.ts`

- [ ] **Step 1: Write the failing test**

Create `src/main/tests/firearm-migration.test.ts`:

```ts
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
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run src/main/tests/firearm-migration.test.ts`
Expected: FAIL — "Cannot find module".

- [ ] **Step 3: Create the migration file** `src/main/db/migrations/migrate_firearm_attributes.ts`:

```ts
import type Database from 'better-sqlite3-multiple-ciphers'

const MODELS = [
  // Pistols (~30)
  'Glock 17','Glock 19','Glock 26','Glock 43','Beretta 92FS','Beretta M9','SIG P226','SIG P320','SIG P365',
  'CZ-75','CZ P-09','CZ Shadow 2','Walther PPQ','Walther P99','H&K USP','H&K VP9','S&W M&P 9','S&W Shield',
  'Ruger SR9','Ruger LCP','Browning Hi-Power','1911 Government','1911 Commander','Desert Eagle .50',
  'Makarov PM','Tokarev TT-33','FN Five-seveN','Springfield XD','Kahr CM9','Kimber Custom II',
  // Revolvers (~8)
  'S&W Model 29','S&W Model 686','Colt Python','Ruger GP100','Ruger SP101','Taurus Judge','S&W Model 642','Ruger Redhawk',
  // Bolt/Lever rifles (~10)
  'Remington 700','Winchester Model 70','Ruger American','Mauser K98','Lee-Enfield No.4','Mosin-Nagant M91/30',
  'Marlin 336','Savage Axis','Tikka T3x','Weatherby Vanguard',
  // Semi-auto rifles (~15)
  'Colt AR-15','S&W M&P15','Ruger AR-556','AK-47','AKM','AK-74','SKS','FN FAL','H&K G3','M14','M1A','Mini-14',
  'SCAR-L','SCAR-H','Tavor X95',
  // SMGs/PCCs (~5)
  'H&K MP5','UZI','CZ Scorpion Evo 3','Kel-Tec Sub-2000','B&T APC9',
  // Shotguns (~12)
  'Remington 870','Mossberg 500','Mossberg 590','Benelli M2','Benelli M4','Beretta 1301','Winchester SXP',
  'Browning A5','Stoeger Coach Gun','Stoeger M3000','Franchi Affinity','Weatherby SA-08',
  // Sniper/DMR (~5)
  'Barrett M82','Accuracy International AWM','Remington M24','Remington M40','Dragunov SVD',
  // Local/regional (~15)
  'Repeater 12-Bore','Pump Action .177','KK Rifle .22','Darra Pistol .30','Darra Rifle 7.62',
  'Landi Kotal Revolver .38','Peshawar 12-Bore DBBL','Peshawar 12-Bore SBBL','Khyber 7.62 Carbine',
  'Local AK Clone','Local Glock Clone','Local 1911 Clone','Local Mauser','Local .22 Bolt','Local .30 Bore Revolver',
]

const CALIBERS = [
  '9mm','.22 LR','.22 WMR','.25 ACP','.32 ACP','.380 ACP','.38 Special','.357 Magnum','.40 S&W',
  '.44 Magnum','.45 ACP','.50 AE','.50 BMG','5.56x45 NATO','7.62x39','7.62x51 NATO / .308 Win',
  '7.62x54R','.223 Rem','.270 Win','.300 Win Mag','.303 British','6.5 Creedmoor','12 Gauge','16 Gauge',
  '20 Gauge','28 Gauge','.410 Bore','7mm Rem Mag','8x57 Mauser','9.3x62',
]

const SHAPES = [
  'Pistol','Revolver','SMG','Carbine','Bolt-Action Rifle','Semi-Auto Rifle',
  'Lever-Action Rifle','Pump Shotgun','Double-Barrel Shotgun','Break-Action',
]

const DESIGNS = [
  'Glock-style','1911-style','AR-15 pattern','AK pattern','Mauser pattern','Beretta-style',
  'Browning Hi-Power pattern','SIG P-series','CZ-75 pattern','Remington 870 pattern',
  'Mossberg 500 pattern','Mosin-Nagant pattern','Lee-Enfield pattern','Tokarev pattern','H&K roller-delayed',
]

function tableExists(rawDb: Database.Database, name: string): boolean {
  const row = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name)
  return !!row
}

function columnExists(rawDb: Database.Database, table: string, column: string): boolean {
  const cols = rawDb.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return cols.some((c) => c.name === column)
}

function createLookupTable(rawDb: Database.Database, table: string): void {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

function seedLookup(rawDb: Database.Database, table: string, values: string[]): void {
  const stmt = rawDb.prepare(`INSERT OR IGNORE INTO ${table} (name, is_active, sort_order) VALUES (?, 1, ?)`)
  const txn = rawDb.transaction((rows: string[]) => {
    rows.forEach((name, i) => stmt.run(name, i))
  })
  txn(values)
}

export function migrateFirearmAttributes(rawDb: Database.Database): void {
  console.log('Running firearm attributes migration...')
  rawDb.exec('BEGIN TRANSACTION')
  try {
    createLookupTable(rawDb, 'firearm_models')
    createLookupTable(rawDb, 'firearm_calibers')
    createLookupTable(rawDb, 'firearm_shapes')
    createLookupTable(rawDb, 'firearm_designs')

    seedLookup(rawDb, 'firearm_models', MODELS)
    seedLookup(rawDb, 'firearm_calibers', CALIBERS)
    seedLookup(rawDb, 'firearm_shapes', SHAPES)
    seedLookup(rawDb, 'firearm_designs', DESIGNS)

    if (tableExists(rawDb, 'products')) {
      if (!columnExists(rawDb, 'products', 'make')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN make TEXT')
      }
      if (!columnExists(rawDb, 'products', 'made_year')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN made_year INTEGER')
      }
      if (!columnExists(rawDb, 'products', 'made_country')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN made_country TEXT')
      }
      if (!columnExists(rawDb, 'products', 'firearm_model_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN firearm_model_id INTEGER REFERENCES firearm_models(id)')
      }
      if (!columnExists(rawDb, 'products', 'caliber_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN caliber_id INTEGER REFERENCES firearm_calibers(id)')
      }
      if (!columnExists(rawDb, 'products', 'shape_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN shape_id INTEGER REFERENCES firearm_shapes(id)')
      }
      if (!columnExists(rawDb, 'products', 'design_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN design_id INTEGER REFERENCES firearm_designs(id)')
      }
      if (!columnExists(rawDb, 'products', 'default_supplier_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN default_supplier_id INTEGER REFERENCES suppliers(id)')
      }

      rawDb.exec('CREATE INDEX IF NOT EXISTS idx_products_firearm_model ON products(firearm_model_id)')
      rawDb.exec('CREATE INDEX IF NOT EXISTS idx_products_caliber ON products(caliber_id)')
      rawDb.exec('CREATE INDEX IF NOT EXISTS idx_products_default_supplier ON products(default_supplier_id)')
    }

    if (tableExists(rawDb, 'categories') && !columnExists(rawDb, 'categories', 'is_firearm')) {
      rawDb.exec('ALTER TABLE categories ADD COLUMN is_firearm INTEGER NOT NULL DEFAULT 0')
    }

    rawDb.exec('COMMIT')
    console.log('Firearm attributes migration completed successfully')
  } catch (error) {
    rawDb.exec('ROLLBACK')
    console.error('Firearm attributes migration failed, rolled back:', error)
    throw error
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm vitest run src/main/tests/firearm-migration.test.ts`
Expected: both tests PASS.

- [ ] **Step 5: Register migration in `src/main/db/migrate.ts`**

Add import near the other migration imports (around line 10):

```ts
import { migrateFirearmAttributes } from './migrations/migrate_firearm_attributes'
```

Ensure `getRawDatabase` is imported:

```ts
import { getDatabase, getDbPath, getRawDatabase } from './index'
```

Inside `runMigrations()`, after the `migrateToPayees()` block, append:

```ts
  // Firearm attributes migration (adds firearm-specific columns + lookup tables)
  try {
    migrateFirearmAttributes(getRawDatabase())
  } catch (error) {
    console.error('Firearm attributes migration error:', error)
    throw error
  }
```

- [ ] **Step 6: Commit**

```bash
git add src/main/db/migrations/migrate_firearm_attributes.ts src/main/db/migrate.ts src/main/tests/firearm-migration.test.ts
git commit -m "feat(db): migrate firearm attributes - add columns + seed 100 models, 30 calibers"
```

---

## Phase 2 — Validation Utility

### Task 4: Firearm validation module

**Files:**
- Create: `src/main/utils/firearm-validation.ts`
- Create: `src/main/tests/firearm-validation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/main/tests/firearm-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateFirearmFields, MAKE_VALUES } from '../utils/firearm-validation'

describe('validateFirearmFields', () => {
  const thisYear = new Date().getFullYear()

  it('accepts all-null firearm fields when category is not firearm', () => {
    const res = validateFirearmFields({ make: null, madeYear: null }, { isFirearm: false })
    expect(res.valid).toBe(true)
    expect(res.errors).toEqual([])
  })

  it('requires make, firearmModelId, caliberId when category is firearm', () => {
    const res = validateFirearmFields(
      { make: null, firearmModelId: null, caliberId: null },
      { isFirearm: true },
    )
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Make is required for firearm products')
    expect(res.errors).toContain('Model is required for firearm products')
    expect(res.errors).toContain('Caliber is required for firearm products')
  })

  it('rejects invalid make value', () => {
    const res = validateFirearmFields({ make: 'foreign' }, { isFirearm: false })
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.toLowerCase().includes('make'))).toBe(true)
  })

  it('accepts make=local and make=imported', () => {
    MAKE_VALUES.forEach((make) => {
      const res = validateFirearmFields({ make }, { isFirearm: false })
      expect(res.valid).toBe(true)
    })
  })

  it('rejects made_year < 1800', () => {
    const res = validateFirearmFields({ madeYear: 1799 }, { isFirearm: false })
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('year'))).toBe(true)
  })

  it(`rejects made_year > ${thisYear + 1}`, () => {
    const res = validateFirearmFields({ madeYear: thisYear + 2 }, { isFirearm: false })
    expect(res.valid).toBe(false)
  })

  it('accepts made_year within range', () => {
    const res = validateFirearmFields({ madeYear: 2020 }, { isFirearm: false })
    expect(res.valid).toBe(true)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run src/main/tests/firearm-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/main/utils/firearm-validation.ts`**

```ts
export const MAKE_VALUES = ['local', 'imported'] as const
export type Make = typeof MAKE_VALUES[number]

export interface FirearmFieldsInput {
  make?: string | null
  madeYear?: number | null
  madeCountry?: string | null
  firearmModelId?: number | null
  caliberId?: number | null
  shapeId?: number | null
  designId?: number | null
  defaultSupplierId?: number | null
}

export interface FirearmValidationResult {
  valid: boolean
  errors: string[]
}

export function validateFirearmFields(
  input: FirearmFieldsInput,
  category: { isFirearm: boolean },
): FirearmValidationResult {
  const errors: string[] = []
  const thisYear = new Date().getFullYear()

  if (input.make !== undefined && input.make !== null && !MAKE_VALUES.includes(input.make as Make)) {
    errors.push(`Make must be one of: ${MAKE_VALUES.join(', ')}`)
  }

  if (input.madeYear !== undefined && input.madeYear !== null) {
    if (!Number.isInteger(input.madeYear) || input.madeYear < 1800 || input.madeYear > thisYear + 1) {
      errors.push(`Made year must be an integer between 1800 and ${thisYear + 1}`)
    }
  }

  if (category.isFirearm) {
    if (!input.make) errors.push('Make is required for firearm products')
    if (!input.firearmModelId) errors.push('Model is required for firearm products')
    if (!input.caliberId) errors.push('Caliber is required for firearm products')
  }

  return { valid: errors.length === 0, errors }
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm vitest run src/main/tests/firearm-validation.test.ts`
Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/utils/firearm-validation.ts src/main/tests/firearm-validation.test.ts
git commit -m "feat(validation): add firearm field validation (make enum, year range, is_firearm required-fields)"
```

---

## Phase 3 — IPC: Lookup CRUD

### Task 5: Firearm attributes IPC handlers

**Files:**
- Create: `src/main/ipc/firearm-attrs-ipc.ts`
- Create: `src/main/tests/firearm-attrs-ipc.test.ts`
- Modify: `src/main/ipc/index.ts`

- [ ] **Step 1: Write failing integration test**

Create `src/main/tests/firearm-attrs-ipc.test.ts`. Follow the project's existing test harness (see `audit-section9.test.ts` for pattern — it uses `setup.ts` and `test-db.ts`). Intent:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerFirearmAttrsHandlers } from '../ipc/firearm-attrs-ipc'
import { createTestDatabase } from './test-db'

// Helper: in setup.ts we patch ipcMain.handle to store handlers in a map,
// and ipcMain._invokeFor(channel, ...args) dispatches to the stored handler.
// If this helper does not yet exist, extend setup.ts accordingly.
async function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  return await (ipcMain as unknown as { _invokeFor: (ch: string, ...a: unknown[]) => Promise<T> })._invokeFor(channel, ...args)
}

describe('firearm-attrs IPC', () => {
  beforeEach(() => {
    createTestDatabase()
    registerFirearmAttrsHandlers()
  })

  const kinds = ['models', 'calibers', 'shapes', 'designs'] as const

  for (const kind of kinds) {
    it(`${kind}: list-create-update-deactivate roundtrip`, async () => {
      const created = await invoke<{ success: boolean; data: { id: number; name: string } }>(
        `firearm-attrs:${kind}:create`, { name: `Test ${kind} A`, sortOrder: 999 },
      )
      expect(created.success).toBe(true)
      const id = created.data.id

      const listed = await invoke<{ success: boolean; data: Array<{ id: number; name: string }> }>(
        `firearm-attrs:${kind}:list`, { activeOnly: true },
      )
      expect(listed.data.some((r) => r.id === id)).toBe(true)

      const updated = await invoke<{ success: boolean; data: { name: string } }>(
        `firearm-attrs:${kind}:update`, id, { name: `Test ${kind} B` },
      )
      expect(updated.data.name).toBe(`Test ${kind} B`)

      const deactivated = await invoke<{ success: boolean }>(`firearm-attrs:${kind}:deactivate`, id)
      expect(deactivated.success).toBe(true)

      const activeList = await invoke<{ data: Array<{ id: number }> }>(
        `firearm-attrs:${kind}:list`, { activeOnly: true },
      )
      expect(activeList.data.some((r) => r.id === id)).toBe(false)
    })

    it(`${kind}: rejects duplicate name (case-insensitive)`, async () => {
      await invoke(`firearm-attrs:${kind}:create`, { name: 'Dup Test' })
      const dup = await invoke<{ success: boolean }>(`firearm-attrs:${kind}:create`, { name: 'dup test' })
      expect(dup.success).toBe(false)
    })
  }
})
```

*Note:* If `createTestDatabase` and the `_invokeFor` harness don't yet support the firearm tables and the new IPC channels, extend `src/main/tests/test-db.ts` so it runs `migrateFirearmAttributes()` on the in-memory DB before each test. Extend `setup.ts` to patch `ipcMain.handle` into a map keyed by channel, and add `_invokeFor`. These harness extensions are part of this task.

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run src/main/tests/firearm-attrs-ipc.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/main/ipc/firearm-attrs-ipc.ts`**

```ts
import { ipcMain } from 'electron'
import { eq, asc, and, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  firearmModels, firearmCalibers, firearmShapes, firearmDesigns,
  type NewFirearmModel, type NewFirearmCaliber, type NewFirearmShape, type NewFirearmDesign,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export type FirearmLookupKind = 'models' | 'calibers' | 'shapes' | 'designs'
type LookupInsert = NewFirearmModel | NewFirearmCaliber | NewFirearmShape | NewFirearmDesign

function tableFor(kind: FirearmLookupKind) {
  switch (kind) {
    case 'models': return firearmModels
    case 'calibers': return firearmCalibers
    case 'shapes': return firearmShapes
    case 'designs': return firearmDesigns
  }
}

function entityTypeFor(kind: FirearmLookupKind): string {
  return `firearm_${kind.slice(0, -1)}`
}

async function createHandler(kind: FirearmLookupKind, data: Partial<LookupInsert>) {
  const db = getDatabase()
  const table = tableFor(kind)
  const session = getCurrentSession()
  const name = (data.name ?? '').trim()
  if (!name) return { success: false, message: 'Name is required' }

  const existing = await db
    .select()
    .from(table)
    .where(sql`lower(${table.name}) = lower(${name})`)
    .limit(1)
  if (existing.length > 0) {
    return { success: false, message: `${kind.slice(0, -1)} "${name}" already exists` }
  }

  const inserted = await db
    .insert(table)
    .values({ name, sortOrder: data.sortOrder ?? 0, isActive: true })
    .returning()
  const row = inserted[0]

  await createAuditLog({
    userId: session?.userId,
    branchId: session?.branchId,
    action: 'create',
    entityType: entityTypeFor(kind),
    entityId: row.id,
    newValues: sanitizeForAudit(row as unknown as Record<string, unknown>),
    description: `Created ${kind.slice(0, -1)}: ${name}`,
  })

  return { success: true, data: row }
}

async function listHandler(kind: FirearmLookupKind, opts: { activeOnly?: boolean } = {}) {
  const db = getDatabase()
  const table = tableFor(kind)
  const rows = await db
    .select()
    .from(table)
    .where(opts.activeOnly ? eq(table.isActive, true) : undefined)
    .orderBy(asc(table.sortOrder), asc(table.name))
  return { success: true, data: rows }
}

async function updateHandler(kind: FirearmLookupKind, id: number, data: Partial<LookupInsert>) {
  const db = getDatabase()
  const table = tableFor(kind)
  const session = getCurrentSession()
  const existing = await db.select().from(table).where(eq(table.id, id)).limit(1)
  if (existing.length === 0) return { success: false, message: `${kind.slice(0, -1)} not found` }

  const next: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) {
    const name = data.name.trim()
    const dup = await db
      .select()
      .from(table)
      .where(and(sql`lower(${table.name}) = lower(${name})`, sql`${table.id} != ${id}`))
      .limit(1)
    if (dup.length > 0) return { success: false, message: `Name "${name}" already in use` }
    next.name = name
  }
  if (data.sortOrder !== undefined) next.sortOrder = data.sortOrder
  if ('isActive' in data) next.isActive = (data as { isActive: boolean }).isActive

  const updated = await db.update(table).set(next).where(eq(table.id, id)).returning()

  await createAuditLog({
    userId: session?.userId,
    branchId: session?.branchId,
    action: 'update',
    entityType: entityTypeFor(kind),
    entityId: id,
    oldValues: sanitizeForAudit(existing[0] as unknown as Record<string, unknown>),
    newValues: sanitizeForAudit(next),
    description: `Updated ${kind.slice(0, -1)} id=${id}`,
  })

  return { success: true, data: updated[0] }
}

async function deactivateHandler(kind: FirearmLookupKind, id: number) {
  return updateHandler(kind, id, { isActive: false } as Partial<LookupInsert>)
}

export function registerFirearmAttrsHandlers(): void {
  const kinds: FirearmLookupKind[] = ['models', 'calibers', 'shapes', 'designs']
  for (const kind of kinds) {
    ipcMain.handle(`firearm-attrs:${kind}:list`, async (_e, opts?: { activeOnly?: boolean }) => {
      try { return await listHandler(kind, opts ?? {}) } catch (err) {
        console.error(`firearm-attrs:${kind}:list error`, err); return { success: false, message: 'Failed to list records' }
      }
    })
    ipcMain.handle(`firearm-attrs:${kind}:create`, async (_e, data: Partial<LookupInsert>) => {
      try { return await createHandler(kind, data) } catch (err) {
        console.error(`firearm-attrs:${kind}:create error`, err); return { success: false, message: 'Failed to create record' }
      }
    })
    ipcMain.handle(`firearm-attrs:${kind}:update`, async (_e, id: number, data: Partial<LookupInsert>) => {
      try { return await updateHandler(kind, id, data) } catch (err) {
        console.error(`firearm-attrs:${kind}:update error`, err); return { success: false, message: 'Failed to update record' }
      }
    })
    ipcMain.handle(`firearm-attrs:${kind}:deactivate`, async (_e, id: number) => {
      try { return await deactivateHandler(kind, id) } catch (err) {
        console.error(`firearm-attrs:${kind}:deactivate error`, err); return { success: false, message: 'Failed to deactivate record' }
      }
    })
  }
}
```

- [ ] **Step 4: Register handlers** in `src/main/ipc/index.ts`:

```ts
import { registerFirearmAttrsHandlers } from './firearm-attrs-ipc'
// ... in the registration block:
registerFirearmAttrsHandlers()
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm vitest run src/main/tests/firearm-attrs-ipc.test.ts`
Expected: all 8 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/ipc/firearm-attrs-ipc.ts src/main/ipc/index.ts src/main/tests/firearm-attrs-ipc.test.ts src/main/tests/test-db.ts src/main/tests/setup.ts
git commit -m "feat(ipc): firearm-attrs CRUD handlers for models/calibers/shapes/designs"
```

---

## Phase 4 — Products IPC: Firearm Awareness

### Task 6: Products IPC — accept firearm fields, validate, audit diff

**Files:**
- Modify: `src/main/ipc/products-ipc.ts`
- Create: `src/main/tests/products-firearm.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/main/tests/products-firearm.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { createTestDatabase } from './test-db'
import { registerProductHandlers } from '../ipc/products-ipc'
import { registerFirearmAttrsHandlers } from '../ipc/firearm-attrs-ipc'
import { registerCategoryHandlers } from '../ipc/categories-ipc'
import { getRawDatabase } from '../db'

async function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  return await (ipcMain as unknown as { _invokeFor: (ch: string, ...a: unknown[]) => Promise<T> })._invokeFor(channel, ...args)
}

describe('products IPC — firearm integration', () => {
  beforeEach(() => {
    createTestDatabase()
    registerCategoryHandlers()
    registerFirearmAttrsHandlers()
    registerProductHandlers()
  })

  it('rejects firearm-category product without required firearm fields', async () => {
    const cat = await invoke<{ data: { id: number } }>('categories:create', { name: 'Handguns', isFirearm: true })
    const res = await invoke<{ success: boolean; message?: string }>('products:create', {
      code: 'FIR001', name: 'Test Pistol', categoryId: cat.data.id,
      sellingPrice: 1000, costPrice: 800,
    })
    expect(res.success).toBe(false)
    expect(res.message).toMatch(/required/i)
  })

  it('accepts firearm-category product when all required fields present', async () => {
    const cat = await invoke<{ data: { id: number } }>('categories:create', { name: 'Handguns', isFirearm: true })
    const model = await invoke<{ data: { id: number } }>('firearm-attrs:models:create', { name: 'Test Glock' })
    const cal = await invoke<{ data: { id: number } }>('firearm-attrs:calibers:create', { name: 'Test 9mm' })

    const res = await invoke<{ success: boolean; data: { id: number; make: string } }>('products:create', {
      code: 'FIR002', name: 'Test Firearm', categoryId: cat.data.id,
      sellingPrice: 1000, costPrice: 800,
      make: 'imported', firearmModelId: model.data.id, caliberId: cal.data.id,
      madeYear: 2022, madeCountry: 'Austria',
    })
    expect(res.success).toBe(true)
    expect(res.data.make).toBe('imported')
  })

  it('rejects invalid made_year', async () => {
    const cat = await invoke<{ data: { id: number } }>('categories:create', { name: 'Misc', isFirearm: false })
    const res = await invoke<{ success: boolean }>('products:create', {
      code: 'M1', name: 'Thing', categoryId: cat.data.id, sellingPrice: 10, costPrice: 5, madeYear: 1700,
    })
    expect(res.success).toBe(false)
  })

  it('writes an audit log entry with firearm field diff on update', async () => {
    const cat = await invoke<{ data: { id: number } }>('categories:create', { name: 'Misc', isFirearm: false })
    const created = await invoke<{ data: { id: number } }>('products:create', {
      code: 'A1', name: 'Item', categoryId: cat.data.id, sellingPrice: 1, costPrice: 0,
    })
    await invoke('products:update', created.data.id, { make: 'local', madeYear: 2020 })

    const db = getRawDatabase()
    const logs = db
      .prepare("SELECT * FROM audit_logs WHERE entity_type IN ('product', 'product_firearm') AND entity_id = ? ORDER BY id DESC")
      .all(created.data.id) as Array<{ entity_type: string; new_values: string | null }>
    expect(logs.length).toBeGreaterThan(0)
    const firearmLog = logs.find((l) => l.entity_type === 'product_firearm')
    expect(firearmLog).toBeDefined()
    expect(firearmLog!.new_values).toContain('make')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm vitest run src/main/tests/products-firearm.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update `src/main/ipc/products-ipc.ts`**

(a) At the top, add import:

```ts
import { validateFirearmFields } from '../utils/firearm-validation'
```

(b) Replace the broken `sanitizeProductInput` function (currently references nonexistent `manufacturer/model/caliber/sku`) with:

```ts
function sanitizeProductInput(data: Partial<NewProduct>): Partial<NewProduct> {
  const sanitized = { ...data }
  if (sanitized.name) sanitized.name = sanitizeForStorage(sanitized.name)
  if (sanitized.code) sanitized.code = sanitizeAlphanumeric(sanitized.code)
  if (sanitized.barcode) sanitized.barcode = sanitizeAlphanumeric(sanitized.barcode)
  if (sanitized.description) sanitized.description = sanitizeForStorage(sanitized.description)
  if (sanitized.brand) sanitized.brand = sanitizeForStorage(sanitized.brand)
  if (sanitized.madeCountry) sanitized.madeCountry = sanitizeForStorage(sanitized.madeCountry)
  if (sanitized.make) sanitized.make = String(sanitized.make).toLowerCase().trim()
  return sanitized
}
```

(c) Delete stale references to `minStockLevel/maxStockLevel/sku` from `validateProductInput` — those columns don't exist on `products` (only `reorderLevel` does). Remove any blocks referencing them.

(d) In the `products:create` handler, after input sanitization and before the insert, add:

```ts
const cat = data.categoryId
  ? await db.query.categories.findFirst({ where: eq(categories.id, data.categoryId) })
  : null
const firearmValidation = validateFirearmFields(data, { isFirearm: !!cat?.isFirearm })
if (!firearmValidation.valid) {
  return { success: false, message: firearmValidation.errors.join('; ') }
}
```

(e) In the `products:update` handler, merge `data` onto the existing row first so partial updates still honour is_firearm:

```ts
const existing = await db.query.products.findFirst({ where: eq(products.id, id) })
if (!existing) return { success: false, message: 'Product not found' }
const merged = { ...existing, ...data }
const cat = merged.categoryId
  ? await db.query.categories.findFirst({ where: eq(categories.id, merged.categoryId) })
  : null
const firearmValidation = validateFirearmFields(merged, { isFirearm: !!cat?.isFirearm })
if (!firearmValidation.valid) {
  return { success: false, message: firearmValidation.errors.join('; ') }
}
```

(f) After the update succeeds (before `return { success: true, ... }`), detect firearm-field changes and emit a dedicated audit entry:

```ts
const firearmKeys = ['make', 'madeYear', 'madeCountry', 'firearmModelId', 'caliberId', 'shapeId', 'designId', 'defaultSupplierId'] as const
const firearmDiff: Record<string, { from: unknown; to: unknown }> = {}
for (const k of firearmKeys) {
  if (k in data && (data as Record<string, unknown>)[k] !== (existing as unknown as Record<string, unknown>)[k]) {
    firearmDiff[k] = { from: (existing as unknown as Record<string, unknown>)[k], to: (data as Record<string, unknown>)[k] }
  }
}
if (Object.keys(firearmDiff).length > 0) {
  await createAuditLog({
    userId: session?.userId,
    branchId: session?.branchId,
    action: 'update',
    entityType: 'product_firearm',
    entityId: id,
    newValues: firearmDiff,
    description: `Firearm fields changed for product ${existing.name}`,
  })
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm vitest run src/main/tests/products-firearm.test.ts`
Expected: all 4 tests PASS.

- [ ] **Step 5: Run full test suite for regressions**

Run: `pnpm vitest run`
Expected: all tests green.

- [ ] **Step 6: Commit**

```bash
git add src/main/ipc/products-ipc.ts src/main/tests/products-firearm.test.ts
git commit -m "feat(products): validate firearm fields, emit product_firearm audit event, remove stale sku/manufacturer refs"
```

---

## Phase 5 — Preload Surface

### Task 7: Expose `firearmAttrs` API

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`

- [ ] **Step 1: Add to `src/preload/index.ts`** (find the object passed to `contextBridge.exposeInMainWorld('electronAPI', {...})` and append):

```ts
  firearmAttrs: {
    list: (kind: 'models' | 'calibers' | 'shapes' | 'designs', opts?: { activeOnly?: boolean }) =>
      ipcRenderer.invoke(`firearm-attrs:${kind}:list`, opts),
    create: (kind: 'models' | 'calibers' | 'shapes' | 'designs', data: { name: string; sortOrder?: number }) =>
      ipcRenderer.invoke(`firearm-attrs:${kind}:create`, data),
    update: (kind: 'models' | 'calibers' | 'shapes' | 'designs', id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }) =>
      ipcRenderer.invoke(`firearm-attrs:${kind}:update`, id, data),
    deactivate: (kind: 'models' | 'calibers' | 'shapes' | 'designs', id: number) =>
      ipcRenderer.invoke(`firearm-attrs:${kind}:deactivate`, id),
  },
```

- [ ] **Step 2: Add matching types to `src/preload/index.d.ts`**

```ts
export interface FirearmLookupRow {
  id: number
  name: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type FirearmLookupKind = 'models' | 'calibers' | 'shapes' | 'designs'
```

Inside the ElectronAPI interface / window augmentation block, add:

```ts
  firearmAttrs: {
    list(kind: FirearmLookupKind, opts?: { activeOnly?: boolean }): Promise<{ success: boolean; data: FirearmLookupRow[] }>
    create(kind: FirearmLookupKind, data: { name: string; sortOrder?: number }): Promise<{ success: boolean; data?: FirearmLookupRow; message?: string }>
    update(kind: FirearmLookupKind, id: number, data: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<{ success: boolean; data?: FirearmLookupRow; message?: string }>
    deactivate(kind: FirearmLookupKind, id: number): Promise<{ success: boolean; message?: string }>
  }
```

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/preload/index.ts src/preload/index.d.ts
git commit -m "feat(preload): expose firearmAttrs API to renderer"
```

---

## Phase 6 — Renderer: Shared Hook + Combobox

### Task 8: `useFirearmLookups` hook

**Files:**
- Create: `src/renderer/hooks/use-firearm-lookups.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useCallback, useEffect, useState } from 'react'
import type { FirearmLookupKind, FirearmLookupRow } from '../../preload/index.d'

interface UseFirearmLookups {
  rows: FirearmLookupRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (name: string) => Promise<FirearmLookupRow | null>
}

export function useFirearmLookups(kind: FirearmLookupKind, activeOnly = true): UseFirearmLookups {
  const [rows, setRows] = useState<FirearmLookupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError(null)
    const res = await window.electronAPI.firearmAttrs.list(kind, { activeOnly })
    if (res.success) setRows(res.data)
    else setError(res.message ?? 'Failed to load')
    setLoading(false)
  }, [kind, activeOnly])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (name: string): Promise<FirearmLookupRow | null> => {
    const res = await window.electronAPI.firearmAttrs.create(kind, { name })
    if (res.success && res.data) { await refresh(); return res.data }
    setError(res.message ?? 'Failed to create')
    return null
  }, [kind, refresh])

  return { rows, loading, error, refresh, create }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/hooks/use-firearm-lookups.ts
git commit -m "feat(hooks): useFirearmLookups - fetch + create lookup rows"
```

---

### Task 9: `<LookupCombobox>` component

**Files:**
- Create: `src/renderer/components/firearm/lookup-combobox.tsx`

- [ ] **Step 1: Confirm shadcn primitives exist**

```bash
ls src/renderer/components/ui/ | grep -E "popover|command|dialog|button|input|label"
```

Expected: all six present. If `command` is missing, run `npx shadcn@latest add command` before proceeding.

- [ ] **Step 2: Write the component**

```tsx
import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useFirearmLookups } from '@/hooks/use-firearm-lookups'
import type { FirearmLookupKind } from '../../../preload/index.d'

interface Props {
  kind: FirearmLookupKind
  value: number | null
  onChange: (id: number | null) => void
  placeholder?: string
  allowAddNew?: boolean
  className?: string
  required?: boolean
}

export function LookupCombobox({ kind, value, onChange, placeholder, allowAddNew = true, className, required }: Props) {
  const { rows, loading, create } = useFirearmLookups(kind, true)
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState<string | null>(null)

  const selected = rows.find((r) => r.id === value)
  const label = selected?.name ?? placeholder ?? `Select ${kind.slice(0, -1)}…`

  const handleAddNew = async (): Promise<void> => {
    setCreating(true); setCreateErr(null)
    const created = await create(newName.trim())
    if (created) { onChange(created.id); setAddOpen(false); setNewName('') }
    else setCreateErr('Failed — name may already exist')
    setCreating(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between font-normal', className, !selected && 'text-muted-foreground')}
            aria-required={required}
          >
            {label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={`Search ${kind}…`} />
            <CommandList>
              <CommandEmpty>{loading ? 'Loading…' : 'No results.'}</CommandEmpty>
              <CommandGroup>
                {rows.map((r) => (
                  <CommandItem key={r.id} value={r.name} onSelect={() => { onChange(r.id); setOpen(false) }}>
                    <Check className={cn('mr-2 h-4 w-4', value === r.id ? 'opacity-100' : 'opacity-0')} />
                    {r.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowAddNew && (
                <CommandGroup>
                  <CommandItem value="__add_new__" onSelect={() => { setOpen(false); setAddOpen(true) }} className="text-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add new…
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add new {kind.slice(0, -1)}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-lookup-name">Name</Label>
            <Input id="new-lookup-name" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} />
            {createErr && <p className="text-sm text-destructive">{createErr}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!newName.trim() || creating} onClick={handleAddNew}>
              {creating ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/firearm/lookup-combobox.tsx
git commit -m "feat(ui): LookupCombobox - searchable dropdown with inline add-new"
```

---

## Phase 7 — Firearm Attributes Settings Page

### Task 10: 4-tab attribute-management screen

**Files:**
- Create: `src/renderer/screens/firearm-attributes/lookup-table-editor.tsx`
- Create: `src/renderer/screens/firearm-attributes/index.tsx`
- Modify: `src/renderer/routes.tsx`
- Modify: `src/renderer/components/layout/sidebar.tsx`

- [ ] **Step 1: Write `lookup-table-editor.tsx`**

```tsx
import { useState } from 'react'
import { Pencil, Plus, Ban, Undo2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useFirearmLookups } from '@/hooks/use-firearm-lookups'
import type { FirearmLookupKind, FirearmLookupRow } from '../../../preload/index.d'

interface Props { kind: FirearmLookupKind }

export function LookupTableEditor({ kind }: Props) {
  const { rows, loading, refresh } = useFirearmLookups(kind, false)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<FirearmLookupRow | null>(null)
  const [formName, setFormName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))

  const openAdd = (): void => { setEditing(null); setFormName(''); setErr(null); setDialogOpen(true) }
  const openEdit = (row: FirearmLookupRow): void => { setEditing(row); setFormName(row.name); setErr(null); setDialogOpen(true) }

  const save = async (): Promise<void> => {
    setSaving(true); setErr(null)
    const name = formName.trim()
    if (!name) { setErr('Name required'); setSaving(false); return }
    const res = editing
      ? await window.electronAPI.firearmAttrs.update(kind, editing.id, { name })
      : await window.electronAPI.firearmAttrs.create(kind, { name })
    setSaving(false)
    if (!res.success) { setErr(res.message ?? 'Save failed'); return }
    setDialogOpen(false)
    await refresh()
  }

  const toggleActive = async (row: FirearmLookupRow): Promise<void> => {
    const res = row.isActive
      ? await window.electronAPI.firearmAttrs.deactivate(kind, row.id)
      : await window.electronAPI.firearmAttrs.update(kind, row.id, { isActive: true })
    if (res.success) await refresh()
  }

  const changeSort = async (row: FirearmLookupRow, delta: number): Promise<void> => {
    const res = await window.electronAPI.firearmAttrs.update(kind, row.id, { sortOrder: row.sortOrder + delta })
    if (res.success) await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder={`Search ${kind}…`} value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Sort</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-48 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>}
          {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={4}>No records.</TableCell></TableRow>}
          {filtered.map((r) => (
            <TableRow key={r.id} className={!r.isActive ? 'opacity-50' : ''}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => changeSort(r, -1)}><ArrowUp className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => changeSort(r, +1)}><ArrowDown className="h-3 w-3" /></Button>
                </div>
              </TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell><Badge variant={r.isActive ? 'default' : 'outline'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(r)}>
                  {r.isActive ? <><Ban className="h-3 w-3 mr-1" />Deactivate</> : <><Undo2 className="h-3 w-3 mr-1" />Reactivate</>}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} {kind.slice(0, -1)}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoFocus value={formName} onChange={(e) => setFormName(e.target.value)} />
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={saving || !formName.trim()} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Write `index.tsx`** (tab container)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LookupTableEditor } from './lookup-table-editor'

export default function FirearmAttributesScreen() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Firearm Attributes</h1>
      <p className="text-sm text-muted-foreground">Manage the dropdown lists used when registering firearm products.</p>
      <Card>
        <CardHeader><CardTitle>Lookups</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="models">
            <TabsList>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="calibers">Calibers</TabsTrigger>
              <TabsTrigger value="shapes">Shapes</TabsTrigger>
              <TabsTrigger value="designs">Designs</TabsTrigger>
            </TabsList>
            <TabsContent value="models"><LookupTableEditor kind="models" /></TabsContent>
            <TabsContent value="calibers"><LookupTableEditor kind="calibers" /></TabsContent>
            <TabsContent value="shapes"><LookupTableEditor kind="shapes" /></TabsContent>
            <TabsContent value="designs"><LookupTableEditor kind="designs" /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Register route in `src/renderer/routes.tsx`** (follow existing lazy-load pattern):

```tsx
const FirearmAttributes = lazy(() => import('./screens/firearm-attributes'))
// Inside the Routes block:
<Route path="/firearm-attributes" element={<FirearmAttributes />} />
```

- [ ] **Step 4: Add sidebar entry in `src/renderer/components/layout/sidebar.tsx`** — locate the Inventory/Catalog group (has Products, Categories, Suppliers) and add next to Categories:

```tsx
{ label: 'Firearm Attributes', href: '/firearm-attributes', icon: Crosshair },
```

Import `Crosshair` from `lucide-react`.

- [ ] **Step 5: Manual smoke**

Run: `pnpm dev`
- Navigate to Firearm Attributes in the sidebar
- Confirm all 4 tabs show seeded rows (100 models / 30 calibers / 10 shapes / 15 designs)
- Add a test model, rename it, deactivate then reactivate, bump sort up and down
- Close dev server with Ctrl-C

- [ ] **Step 6: Commit**

```bash
git add src/renderer/screens/firearm-attributes/ src/renderer/routes.tsx src/renderer/components/layout/sidebar.tsx
git commit -m "feat(ui): firearm attributes settings page with 4-tab CRUD"
```

---

## Phase 8 — Product Form Integration

### Task 11: `<FirearmDetailsSection>` component

**Files:**
- Create: `src/renderer/components/firearm/firearm-details-section.tsx`

- [ ] **Step 1: Write component**

```tsx
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LookupCombobox } from './lookup-combobox'

export interface FirearmFieldsValue {
  make: 'local' | 'imported' | null
  madeYear: number | null
  madeCountry: string | null
  firearmModelId: number | null
  caliberId: number | null
  shapeId: number | null
  designId: number | null
  defaultSupplierId: number | null
}

interface Props {
  value: FirearmFieldsValue
  onChange: (v: FirearmFieldsValue) => void
  isFirearmCategory: boolean
  suppliers: Array<{ id: number; name: string }>
}

const THIS_YEAR = new Date().getFullYear()

export function FirearmDetailsSection({ value, onChange, isFirearmCategory, suppliers }: Props) {
  const [expanded, setExpanded] = useState(isFirearmCategory)
  useEffect(() => { if (isFirearmCategory) setExpanded(true) }, [isFirearmCategory])

  const set = <K extends keyof FirearmFieldsValue>(k: K, v: FirearmFieldsValue[K]): void => {
    onChange({ ...value, [k]: v })
  }

  const req = (label: string): string => isFirearmCategory ? `${label} *` : label

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded((e) => !e)}>
        <CardTitle className="flex items-center justify-between text-base">
          Firearm Details {isFirearmCategory && <span className="text-xs text-destructive">(required)</span>}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{req('Make')}</Label>
            <RadioGroup className="flex gap-4 mt-2" value={value.make ?? ''} onValueChange={(v) => set('make', (v as 'local' | 'imported') || null)}>
              <div className="flex items-center gap-2"><RadioGroupItem id="make-local" value="local" /><Label htmlFor="make-local">Local</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem id="make-imported" value="imported" /><Label htmlFor="make-imported">Imported</Label></div>
            </RadioGroup>
          </div>
          <div>
            <Label>Made Year</Label>
            <Input type="number" min={1800} max={THIS_YEAR + 1}
              value={value.madeYear ?? ''}
              onChange={(e) => set('madeYear', e.target.value ? Number(e.target.value) : null)}
              placeholder={`1800–${THIS_YEAR + 1}`} />
          </div>
          <div>
            <Label>Made Country</Label>
            <Input value={value.madeCountry ?? ''} onChange={(e) => set('madeCountry', e.target.value || null)} placeholder="Austria, Pakistan, USA…" />
          </div>
          <div>
            <Label>{req('Model')}</Label>
            <LookupCombobox kind="models" value={value.firearmModelId} onChange={(id) => set('firearmModelId', id)} required={isFirearmCategory} />
          </div>
          <div>
            <Label>{req('Caliber / Bore')}</Label>
            <LookupCombobox kind="calibers" value={value.caliberId} onChange={(id) => set('caliberId', id)} required={isFirearmCategory} />
          </div>
          <div>
            <Label>Shape</Label>
            <LookupCombobox kind="shapes" value={value.shapeId} onChange={(id) => set('shapeId', id)} />
          </div>
          <div>
            <Label>Design</Label>
            <LookupCombobox kind="designs" value={value.designId} onChange={(id) => set('designId', id)} />
          </div>
          <div>
            <Label>Default Supplier</Label>
            <select className="w-full rounded-md border px-3 py-2 bg-background"
              value={value.defaultSupplierId ?? ''}
              onChange={(e) => set('defaultSupplierId', e.target.value ? Number(e.target.value) : null)}>
              <option value="">— none —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/firearm/firearm-details-section.tsx
git commit -m "feat(ui): FirearmDetailsSection - collapsible firearm fields for product form"
```

---

### Task 12: Integrate into product form

**Files:**
- Modify: `src/renderer/screens/products/index.tsx`
- Modify: `src/renderer/screens/categories-management/index.tsx`

- [ ] **Step 1: Add `isFirearm` checkbox to the category add/edit dialog**

Open `src/renderer/screens/categories-management/index.tsx`. In the existing add/edit form, add a checkbox alongside `isActive`:

```tsx
<div className="flex items-center gap-2">
  <input
    id="is-firearm"
    type="checkbox"
    checked={formData.isFirearm ?? false}
    onChange={(e) => setFormData({ ...formData, isFirearm: e.target.checked })}
  />
  <Label htmlFor="is-firearm">Firearm category (requires firearm fields on products)</Label>
</div>
```

Ensure the submit payload includes `isFirearm`.

- [ ] **Step 2: Import the new firearm component into products screen**

In `src/renderer/screens/products/index.tsx`, add near other imports:

```tsx
import { FirearmDetailsSection, type FirearmFieldsValue } from '@/components/firearm/firearm-details-section'
```

- [ ] **Step 3: Add firearm state to the form** (near other form state hooks):

```tsx
const [firearmFields, setFirearmFields] = useState<FirearmFieldsValue>({
  make: null, madeYear: null, madeCountry: null,
  firearmModelId: null, caliberId: null, shapeId: null, designId: null,
  defaultSupplierId: null,
})
const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])
const [isFirearmCategory, setIsFirearmCategory] = useState(false)
```

- [ ] **Step 4: Load suppliers once and re-load category.isFirearm when category changes**

```tsx
useEffect(() => {
  window.electronAPI.suppliers.getAll({}).then((r: { success: boolean; data?: Array<{ id: number; name: string; isActive: boolean }> }) => {
    if (r.success && r.data) setSuppliers(r.data.filter((s) => s.isActive))
  })
}, [])

useEffect(() => {
  if (!formData.categoryId) { setIsFirearmCategory(false); return }
  window.electronAPI.categories.getById(formData.categoryId).then((r: { success: boolean; data?: { isFirearm: boolean } }) => {
    setIsFirearmCategory(!!r.success && !!r.data?.isFirearm)
  })
}, [formData.categoryId])
```

*(Adapt `formData.categoryId` to match whatever variable name the existing form uses.)*

- [ ] **Step 5: Render the section** inside the dialog body, after pricing fields and before Save:

```tsx
<FirearmDetailsSection
  value={firearmFields}
  onChange={setFirearmFields}
  isFirearmCategory={isFirearmCategory}
  suppliers={suppliers}
/>
```

- [ ] **Step 6: Merge into submit payload**

```tsx
const payload = { ...existingFields, ...firearmFields }
const res = editingProduct
  ? await window.electronAPI.products.update(editingProduct.id, payload)
  : await window.electronAPI.products.create(payload)
```

- [ ] **Step 7: Pre-fill on edit, reset on close**

When opening for edit:

```tsx
setFirearmFields({
  make: (product.make as 'local' | 'imported' | null) ?? null,
  madeYear: product.madeYear ?? null,
  madeCountry: product.madeCountry ?? null,
  firearmModelId: product.firearmModelId ?? null,
  caliberId: product.caliberId ?? null,
  shapeId: product.shapeId ?? null,
  designId: product.designId ?? null,
  defaultSupplierId: product.defaultSupplierId ?? null,
})
```

When opening for add / closing, reset to all-null (same shape).

- [ ] **Step 8: Manual smoke**

Run: `pnpm dev`
- In Categories, create "Handguns" with `isFirearm` checked.
- In Products → Add, select "Handguns" category. Confirm Firearm Details auto-expands and Make/Model/Caliber show `*`.
- Save without filling required fields → confirm an error message appears.
- Fill required fields and save. Re-open the product for edit; confirm values round-trip.

- [ ] **Step 9: Commit**

```bash
git add src/renderer/screens/products/index.tsx src/renderer/screens/categories-management/index.tsx
git commit -m "feat(products): firearm details section on product form + isFirearm toggle on category form"
```

---

### Task 13: Product list columns + filters

**Files:**
- Modify: `src/renderer/screens/products/index.tsx`

- [ ] **Step 1: Add lookup maps for resolving IDs to names**

```tsx
const [modelsMap, setModelsMap] = useState<Map<number, string>>(new Map())
const [calibersMap, setCalibersMap] = useState<Map<number, string>>(new Map())

useEffect(() => {
  window.electronAPI.firearmAttrs.list('models', { activeOnly: false }).then((r) => {
    if (r.success) setModelsMap(new Map(r.data.map((x) => [x.id, x.name])))
  })
  window.electronAPI.firearmAttrs.list('calibers', { activeOnly: false }).then((r) => {
    if (r.success) setCalibersMap(new Map(r.data.map((x) => [x.id, x.name])))
  })
}, [])
```

- [ ] **Step 2: Add column toggle state**

```tsx
const [showModelCol, setShowModelCol] = useState(false)
const [showCaliberCol, setShowCaliberCol] = useState(false)
const [showMakeCol, setShowMakeCol] = useState(false)
```

Add a simple column-visibility menu near the existing filters with three checkboxes bound to the above state.

- [ ] **Step 3: Add filter state + selects**

```tsx
const [makeFilter, setMakeFilter] = useState('')
const [caliberFilter, setCaliberFilter] = useState('')
const [supplierFilter, setSupplierFilter] = useState('')
```

In the filter bar:

```tsx
<select value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)}>
  <option value="">All makes</option>
  <option value="local">Local</option>
  <option value="imported">Imported</option>
</select>
<select value={caliberFilter} onChange={(e) => setCaliberFilter(e.target.value)}>
  <option value="">All calibers</option>
  {[...calibersMap.entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
</select>
<select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
  <option value="">All suppliers</option>
  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
```

- [ ] **Step 4: Apply filters and new columns**

```tsx
const visibleProducts = products.filter((p) => {
  if (makeFilter && p.make !== makeFilter) return false
  if (caliberFilter && String(p.caliberId) !== caliberFilter) return false
  if (supplierFilter && String(p.defaultSupplierId) !== supplierFilter) return false
  return true
})
```

In the header row:

```tsx
<TableHead className={showModelCol ? '' : 'hidden'}>Model</TableHead>
<TableHead className={showCaliberCol ? '' : 'hidden'}>Caliber</TableHead>
<TableHead className={showMakeCol ? '' : 'hidden'}>Make</TableHead>
```

In each row:

```tsx
<TableCell className={showModelCol ? '' : 'hidden'}>{product.firearmModelId ? modelsMap.get(product.firearmModelId) : '—'}</TableCell>
<TableCell className={showCaliberCol ? '' : 'hidden'}>{product.caliberId ? calibersMap.get(product.caliberId) : '—'}</TableCell>
<TableCell className={showMakeCol ? '' : 'hidden'}>{product.make ? <Badge variant={product.make === 'imported' ? 'default' : 'secondary'}>{product.make}</Badge> : '—'}</TableCell>
```

- [ ] **Step 5: Manual smoke**

Run `pnpm dev` — toggle each column, exercise each filter, confirm narrowing works.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/screens/products/index.tsx
git commit -m "feat(products): model/caliber/make columns + make/caliber/supplier filters"
```

---

## Phase 9 — POS Integration

### Task 14: POS search + cart metadata + tile chip

**Files:**
- Modify: `src/main/ipc/products-ipc.ts` (widen search handler)
- Modify: `src/renderer/screens/pos/index.tsx`

- [ ] **Step 1: Widen the search handler**

In `products-ipc.ts`, add imports if missing:

```ts
import { firearmModels, firearmCalibers } from '../db/schema'
import { or, like } from 'drizzle-orm'
```

Replace the `products:search` handler body with:

```ts
ipcMain.handle('products:search', async (_e, query: string) => {
  try {
    const q = `%${query.toLowerCase()}%`
    const rows = await db
      .select({
        p: products,
        modelName: firearmModels.name,
        caliberName: firearmCalibers.name,
      })
      .from(products)
      .leftJoin(firearmModels, eq(products.firearmModelId, firearmModels.id))
      .leftJoin(firearmCalibers, eq(products.caliberId, firearmCalibers.id))
      .where(
        or(
          like(sql`lower(${products.name})`, q),
          like(sql`lower(${products.code})`, q),
          like(sql`lower(${products.barcode})`, q),
          like(sql`lower(${firearmModels.name})`, q),
          like(sql`lower(${firearmCalibers.name})`, q),
          like(sql`lower(${products.make})`, q),
          like(sql`lower(${products.madeCountry})`, q),
        ),
      )
      .limit(50)
    return {
      success: true,
      data: rows.map((r) => ({ ...r.p, _modelName: r.modelName, _caliberName: r.caliberName })),
    }
  } catch (err) {
    console.error('products:search error', err)
    return { success: false, message: 'Search failed' }
  }
})
```

- [ ] **Step 2: POS cart line — metadata sub-line**

In the POS cart rendering block, beneath each cart item name:

```tsx
{(item._modelName || item._caliberName || item.make) && (
  <div className="text-xs text-muted-foreground">
    {[item._modelName, item._caliberName, item.make].filter(Boolean).join(' · ')}
  </div>
)}
```

- [ ] **Step 3: POS product tile — caliber chip**

In the product tile grid:

```tsx
{item._caliberName && (
  <span className="absolute top-1 right-1 text-[10px] rounded-full bg-primary/10 px-1.5 py-0.5 font-mono">
    {item._caliberName}
  </span>
)}
```

- [ ] **Step 4: Manual smoke**

Run `pnpm dev`:
- Search "9mm" → all 9mm-caliber products appear
- Search "Glock" → matches by model
- Search "imported" → matches by make
- Add a firearm to cart → sub-line shows `Model · Caliber · Make`
- Grid tile shows caliber chip for firearms only

- [ ] **Step 5: Commit**

```bash
git add src/main/ipc/products-ipc.ts src/renderer/screens/pos/index.tsx
git commit -m "feat(pos): extend search over model/caliber/make; firearm metadata in cart + tile chip"
```

---

## Phase 10 — Reports

### Task 15: Four new firearm reports

**Files:**
- Create: `src/main/ipc/firearm-reports-ipc.ts`
- Create: `src/renderer/screens/reports/inventory-by-caliber.tsx`
- Create: `src/renderer/screens/reports/sales-by-make.tsx`
- Create: `src/renderer/screens/reports/sales-by-model.tsx`
- Create: `src/renderer/screens/reports/stock-by-supplier.tsx`
- Modify: `src/main/ipc/index.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`
- Modify: `src/renderer/routes.tsx`

- [ ] **Step 1: Check sales table names** — before writing the reports IPC, confirm the actual sale-item table name:

```bash
grep -l "export const sale" src/main/db/schemas/
```

If the table name differs from `sale_items` used below, adapt the SQL accordingly.

- [ ] **Step 2: Write `src/main/ipc/firearm-reports-ipc.ts`**

```ts
import { ipcMain } from 'electron'
import { sql } from 'drizzle-orm'
import { getDatabase } from '../db'

export function registerFirearmReportsHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('reports:inventory-by-caliber', async () => {
    try {
      const rows = await db.all(sql`
        SELECT fc.name as caliber, COUNT(p.id) as product_count,
               COALESCE(SUM(i.quantity), 0) as qty_on_hand,
               COALESCE(SUM(i.quantity * p.cost_price), 0) as total_cost_value
        FROM firearm_calibers fc
        LEFT JOIN products p ON p.caliber_id = fc.id AND p.is_active = 1
        LEFT JOIN inventory i ON i.product_id = p.id
        GROUP BY fc.id
        HAVING product_count > 0
        ORDER BY total_cost_value DESC
      `)
      return { success: true, data: rows }
    } catch (err) { console.error('reports:inventory-by-caliber', err); return { success: false, message: 'Report failed' } }
  })

  ipcMain.handle('reports:sales-by-make', async (_e, range: { start: string; end: string }) => {
    try {
      const rows = await db.all(sql`
        SELECT COALESCE(p.make, 'unspecified') as make,
               COUNT(DISTINCT s.id) as sale_count,
               SUM(si.quantity) as units_sold,
               SUM(si.quantity * si.unit_price) as revenue,
               SUM(si.quantity * (si.unit_price - p.cost_price)) as margin
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.id
        JOIN products p ON p.id = si.product_id
        WHERE s.created_at BETWEEN ${range.start} AND ${range.end}
        GROUP BY p.make
      `)
      return { success: true, data: rows }
    } catch (err) { console.error('reports:sales-by-make', err); return { success: false, message: 'Report failed' } }
  })

  ipcMain.handle('reports:sales-by-model', async (_e, range: { start: string; end: string; limit?: number }) => {
    try {
      const limit = range.limit ?? 25
      const rows = await db.all(sql`
        SELECT fm.name as model,
               SUM(si.quantity) as units_sold,
               SUM(si.quantity * si.unit_price) as revenue
        FROM firearm_models fm
        JOIN products p ON p.firearm_model_id = fm.id
        JOIN sale_items si ON si.product_id = p.id
        JOIN sales s ON s.id = si.sale_id
        WHERE s.created_at BETWEEN ${range.start} AND ${range.end}
        GROUP BY fm.id
        ORDER BY revenue DESC
        LIMIT ${limit}
      `)
      return { success: true, data: rows }
    } catch (err) { console.error('reports:sales-by-model', err); return { success: false, message: 'Report failed' } }
  })

  ipcMain.handle('reports:stock-by-supplier', async () => {
    try {
      const rows = await db.all(sql`
        SELECT sup.name as supplier,
               COUNT(DISTINCT p.id) as products,
               COALESCE(SUM(i.quantity), 0) as qty_on_hand,
               COALESCE(SUM(i.quantity * p.cost_price), 0) as total_cost_value
        FROM suppliers sup
        LEFT JOIN products p ON p.default_supplier_id = sup.id AND p.is_active = 1
        LEFT JOIN inventory i ON i.product_id = p.id
        GROUP BY sup.id
        HAVING products > 0
        ORDER BY total_cost_value DESC
      `)
      return { success: true, data: rows }
    } catch (err) { console.error('reports:stock-by-supplier', err); return { success: false, message: 'Report failed' } }
  })
}
```

- [ ] **Step 3: Register handlers** in `src/main/ipc/index.ts`:

```ts
import { registerFirearmReportsHandlers } from './firearm-reports-ipc'
// ...
registerFirearmReportsHandlers()
```

- [ ] **Step 4: Expose in preload**

`src/preload/index.ts`:

```ts
  firearmReports: {
    inventoryByCaliber: () => ipcRenderer.invoke('reports:inventory-by-caliber'),
    salesByMake: (range: { start: string; end: string }) => ipcRenderer.invoke('reports:sales-by-make', range),
    salesByModel: (range: { start: string; end: string; limit?: number }) => ipcRenderer.invoke('reports:sales-by-model', range),
    stockBySupplier: () => ipcRenderer.invoke('reports:stock-by-supplier'),
  },
```

`src/preload/index.d.ts` (inside ElectronAPI):

```ts
  firearmReports: {
    inventoryByCaliber(): Promise<{ success: boolean; data: Array<{ caliber: string; product_count: number; qty_on_hand: number; total_cost_value: number }> }>
    salesByMake(range: { start: string; end: string }): Promise<{ success: boolean; data: Array<{ make: string; sale_count: number; units_sold: number; revenue: number; margin: number }> }>
    salesByModel(range: { start: string; end: string; limit?: number }): Promise<{ success: boolean; data: Array<{ model: string; units_sold: number; revenue: number }> }>
    stockBySupplier(): Promise<{ success: boolean; data: Array<{ supplier: string; products: number; qty_on_hand: number; total_cost_value: number }> }>
  }
```

- [ ] **Step 5: Write `inventory-by-caliber.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Row { caliber: string; product_count: number; qty_on_hand: number; total_cost_value: number }

export default function InventoryByCaliberReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.electronAPI.firearmReports.inventoryByCaliber().then((r: { success: boolean; data?: Row[] }) => {
      if (r.success && r.data) setRows(r.data)
      setLoading(false)
    })
  }, [])

  return (
    <Card>
      <CardHeader><CardTitle>Inventory by Caliber</CardTitle></CardHeader>
      <CardContent>
        {loading ? 'Loading…' : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caliber</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Qty On Hand</TableHead>
                <TableHead className="text-right">Cost Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.caliber}>
                  <TableCell>{r.caliber}</TableCell>
                  <TableCell className="text-right">{r.product_count}</TableCell>
                  <TableCell className="text-right">{r.qty_on_hand}</TableCell>
                  <TableCell className="text-right">{r.total_cost_value.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: Write `sales-by-make.tsx`** — with date-range picker defaulting to last 30 days

```tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Row { make: string; sale_count: number; units_sold: number; revenue: number; margin: number }

function defaultRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - 30 * 24 * 3600 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function SalesByMakeReport() {
  const [range, setRange] = useState(defaultRange())
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    window.electronAPI.firearmReports.salesByMake(range).then((r: { success: boolean; data?: Row[] }) => {
      if (r.success && r.data) setRows(r.data)
    })
  }, [range])

  return (
    <Card>
      <CardHeader><CardTitle>Sales by Make (Local vs Imported)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div><Label>Start</Label><Input type="date" value={range.start.slice(0, 10)} onChange={(e) => setRange({ ...range, start: new Date(e.target.value).toISOString() })} /></div>
          <div><Label>End</Label><Input type="date" value={range.end.slice(0, 10)} onChange={(e) => setRange({ ...range, end: new Date(e.target.value).toISOString() })} /></div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Make</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.make}>
                <TableCell>{r.make}</TableCell>
                <TableCell className="text-right">{r.sale_count}</TableCell>
                <TableCell className="text-right">{r.units_sold}</TableCell>
                <TableCell className="text-right">{r.revenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.margin.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Write `sales-by-model.tsx`** — mirror `sales-by-make.tsx`, swap the `Row` type to `{ model, units_sold, revenue }`, change handler to `salesByModel`, header from "Make" to "Model".

- [ ] **Step 8: Write `stock-by-supplier.tsx`** — mirror `inventory-by-caliber.tsx`, swap rows to `{ supplier, products, qty_on_hand, total_cost_value }`, handler to `stockBySupplier`.

- [ ] **Step 9: Register routes** in `src/renderer/routes.tsx`:

```tsx
const InventoryByCaliber = lazy(() => import('./screens/reports/inventory-by-caliber'))
const SalesByMake = lazy(() => import('./screens/reports/sales-by-make'))
const SalesByModel = lazy(() => import('./screens/reports/sales-by-model'))
const StockBySupplier = lazy(() => import('./screens/reports/stock-by-supplier'))
// Routes:
<Route path="/reports/inventory-by-caliber" element={<InventoryByCaliber />} />
<Route path="/reports/sales-by-make" element={<SalesByMake />} />
<Route path="/reports/sales-by-model" element={<SalesByModel />} />
<Route path="/reports/stock-by-supplier" element={<StockBySupplier />} />
```

Link to these from the existing Reports landing screen (follow the pattern used by other report entries).

- [ ] **Step 10: Manual smoke**

Run `pnpm dev`:
- Create a firearm product, make a sale that includes it
- Open each of the 4 reports and confirm the product/sale appears

- [ ] **Step 11: Commit**

```bash
git add src/main/ipc/firearm-reports-ipc.ts src/main/ipc/index.ts src/preload/ src/renderer/screens/reports/ src/renderer/routes.tsx
git commit -m "feat(reports): Inventory-by-Caliber, Sales-by-Make, Sales-by-Model, Stock-by-Supplier"
```

---

## Phase 11 — Receipts

### Task 16: Receipt firearm sub-line

**Files:**
- Modify: `src/renderer/components/receipt-preview.tsx`

- [ ] **Step 1: Ensure sale item data includes `_modelName` / `_caliberName`**

The POS passes cart items into the receipt preview. Since Task 14 Step 1 added `_modelName`/`_caliberName` to `products:search` output, the cart already has these fields. Verify by reading the cart→receipt prop flow in `pos/index.tsx` and adjusting if the receipt component receives a transformed object that drops the underscore-prefixed props.

If the receipt receives items from `sales:get-by-id` (post-sale printing), widen that handler the same way:

```ts
// In the sales:get-by-id handler, when assembling line items:
// leftJoin firearm_models + firearm_calibers, expose _modelName/_caliberName on each item
```

- [ ] **Step 2: Render sub-line in `receipt-preview.tsx`**

For each line item in the receipt template, add below the item name:

```tsx
{(item._modelName || item._caliberName) && (
  <div className="text-[10px] leading-tight text-muted-foreground">
    {[item._modelName, item._caliberName].filter(Boolean).join(' · ')}
  </div>
)}
```

- [ ] **Step 3: Manual smoke**

Print preview a sale including a firearm — confirm the sub-line appears on the rendered receipt (both on-screen and in the PDF export if applicable).

- [ ] **Step 4: Commit**

```bash
git add src/renderer/components/receipt-preview.tsx src/main/ipc/
git commit -m "feat(receipts): model/caliber sub-line on firearm receipt items"
```

---

## Phase 12 — Final Sign-off

### Task 17: Full regression + PR

- [ ] **Step 1: All tests**

Run: `pnpm vitest run`
Expected: green across the entire suite (existing + new).

- [ ] **Step 2: Typecheck + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: both succeed with zero errors.

- [ ] **Step 3: End-to-end manual QA**

1. Delete local DB (`~/.config/firearms-pos/data/firearms-pos.db`) → launch → confirm migration seeds run (100 models etc.).
2. Create category "Handguns" with `isFirearm` checked.
3. Products → Add: select "Handguns", fill Make=imported, Year=2022, Country=Austria, Model=Glock 19, Caliber=9mm. Save.
4. POS: search "9mm" → product appears. Add to cart → sub-line shows `Glock 19 · 9mm · imported`. Tile shows caliber chip.
5. Complete the sale. Print receipt → sub-line visible.
6. Open each of the 4 new reports → product/sale appears on each.
7. Edit the product → change make to local → save → confirm a `product_firearm` audit log entry exists (inspect via the database viewer screen).
8. Firearm Attributes page → deactivate caliber "9mm" → confirm it no longer appears in the product-form combobox.

- [ ] **Step 4: Tick all items in `firearms-pos/checklist.md`** so it reflects the completed work.

- [ ] **Step 5: Commit checklist + open PR**

```bash
git add firearms-pos/checklist.md
git commit -m "chore: tick completed firearm-registration checklist items"
```

```bash
gh pr create --title "feat: firearm product registration (make/year/model/caliber/shape/design/supplier)" --body "$(cat <<'EOF'
## Summary
- Extends `products` with 8 firearm fields (make, year, country, model, caliber, shape, design, supplier)
- 4 lookup tables seeded with 100 models / 30 calibers / 10 shapes / 15 designs
- Firearm Attributes settings page (4-tab CRUD)
- Product form: collapsible Firearm Details section with dropdowns + inline Add New
- Product list: toggleable Model/Caliber/Make columns + Make/Caliber/Supplier filters
- POS: search matches model/caliber/make; cart sub-line; tile caliber chip
- 4 new reports: Inventory by Caliber, Sales by Make, Sales by Model, Stock by Supplier
- Receipts: firearm sub-line on line items
- Dedicated `product_firearm` audit event on firearm field change

Spec: `firearms-pos/docs/superpowers/specs/2026-04-17-firearm-product-registration-design.md`

## Test plan
- [ ] `pnpm vitest run` green
- [ ] `pnpm build` succeeds
- [ ] Manual QA per Task 17 Step 3
EOF
)"
```

---

## Self-Review

**Spec coverage:** All 13 spec sections map to tasks. Problem/Goals → Tasks 1-17. Data model + alters → Tasks 1-3. Seeds → Task 3. Validation → Tasks 4, 6. Lookup CRUD → Task 5. Product-form section → Tasks 11-12. List columns/filters → Task 13. POS → Task 14. Reports → Task 15. Receipts → Task 16. Audit → Tasks 6 (firearm_diff sub-event). Rollout → Task 17.

**Placeholders:** Every code step contains complete runnable code. Tasks 5 and 16 note two harness/data-flow verification steps (extend `test-db.ts` if missing; confirm cart→receipt prop flow), both with explicit instructions — they are investigative, not placeholders.

**Type consistency:** `FirearmFieldsValue` defined once in Task 11 and reused in Tasks 12/13. `FirearmLookupKind` defined in preload (Task 7) and reused in hook (Task 8), combobox (Task 9), editor (Task 10), section (Task 11). Lookup column names (`name`, `isActive`, `sortOrder`) consistent across schema, migration, IPC, hook, UI. Audit `entityType` = `product_firearm` consistent between emitter (Task 6) and test assertion.

**Sub-skill to use for execution:** `superpowers:subagent-driven-development` (recommended) — each task is bounded, produces a commit, and is independently verifiable.
