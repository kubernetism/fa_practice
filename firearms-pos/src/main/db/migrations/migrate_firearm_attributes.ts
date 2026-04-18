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
        rawDb.exec('ALTER TABLE products ADD COLUMN firearm_model_id INTEGER REFERENCES firearm_models(id) ON DELETE SET NULL')
      }
      if (!columnExists(rawDb, 'products', 'caliber_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN caliber_id INTEGER REFERENCES firearm_calibers(id) ON DELETE SET NULL')
      }
      if (!columnExists(rawDb, 'products', 'shape_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN shape_id INTEGER REFERENCES firearm_shapes(id) ON DELETE SET NULL')
      }
      if (!columnExists(rawDb, 'products', 'design_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN design_id INTEGER REFERENCES firearm_designs(id) ON DELETE SET NULL')
      }
      if (!columnExists(rawDb, 'products', 'default_supplier_id')) {
        rawDb.exec('ALTER TABLE products ADD COLUMN default_supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL')
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
