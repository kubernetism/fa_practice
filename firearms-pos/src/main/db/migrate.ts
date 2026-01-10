import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDatabase, getDbPath } from './index'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { migrateToBusinessSettings } from './migrations/migrate_to_business_settings'

export async function runMigrations(): Promise<void> {
  const db = getDatabase()

  // Try different paths for migrations folder
  const possiblePaths = [
    join(__dirname, '../../drizzle'),           // Development: out/main -> drizzle
    join(__dirname, '../../../drizzle'),        // Alternative dev path
    join(app.getAppPath(), 'drizzle'),          // Production: app.asar/drizzle
    join(process.cwd(), 'drizzle'),             // CWD fallback
  ]

  let migrationsPath: string | null = null
  for (const path of possiblePaths) {
    if (existsSync(path) && existsSync(join(path, 'meta/_journal.json'))) {
      migrationsPath = path
      console.log('Found migrations at:', path)
      break
    }
  }

  if (!migrationsPath) {
    console.log('No migrations folder found, creating tables directly...')
  } else {
    try {
      migrate(db, { migrationsFolder: migrationsPath })
      console.log('Migrations completed successfully')
    } catch (error) {
      console.error('Migration error:', error)
      throw error
    }
  }

  // Run business settings migration to ensure default settings exist
  try {
    await migrateToBusinessSettings()
  } catch (error) {
    console.error('Business settings migration error:', error)
    // Don't throw - the IPC handler can create defaults if needed
  }

  // Manual migration for referral_persons table if missing
  try {
    await ensureReferralPersonsTable()
  } catch (error) {
    console.error('Referral persons table migration error:', error)
    // Don't throw - log error but continue
  }

  // Manual migration for messages table if missing
  try {
    await ensureMessagesTable()
  } catch (error) {
    console.error('Messages table migration error:', error)
    // Don't throw - log error but continue
  }

  // Manual migration for purchases payment_method column
  try {
    await ensurePurchasesPaymentMethod()
  } catch (error) {
    console.error('Purchases payment_method migration error:', error)
    // Don't throw - log error but continue
  }

  // Manual migration for expenses payment_status column
  try {
    await ensureExpensesPaymentStatus()
  } catch (error) {
    console.error('Expenses payment_status migration error:', error)
    // Don't throw - log error but continue
  }
}

async function ensureReferralPersonsTable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if table exists
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='referral_persons'`
  ).get()

  if (tableCheck) {
    console.log('referral_persons table exists: true')
    return
  }

  console.log('Starting migration for referral_persons table...')

  // Create the referral_persons table
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS "referral_persons" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "branch_id" integer NOT NULL,
      "name" text NOT NULL,
      "contact" text,
      "address" text,
      "notes" text,
      "is_active" integer DEFAULT true NOT NULL,
      "total_commission_earned" real DEFAULT 0 NOT NULL,
      "total_commission_paid" real DEFAULT 0 NOT NULL,
      "commission_rate" real,
      "created_at" text NOT NULL,
      "updated_at" text NOT NULL,
      FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
    );

    CREATE INDEX IF NOT EXISTS "referral_persons_branch_idx" ON "referral_persons" ("branch_id");
    CREATE INDEX IF NOT EXISTS "referral_persons_name_idx" ON "referral_persons" ("name");
  `

  db.exec(migrationSQL)
  console.log('referral_persons table migration completed successfully!')
}

async function ensureMessagesTable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if table exists
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='messages'`
  ).get()

  if (tableCheck) {
    console.log('messages table exists: true')
    return
  }

  console.log('Starting migration for messages table...')

  // Create the messages table
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "content" text NOT NULL,
      "sender_id" integer NOT NULL,
      "recipient_id" integer,
      "is_read" integer DEFAULT 0 NOT NULL,
      "created_at" text NOT NULL,
      FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
    );

    CREATE INDEX IF NOT EXISTS "messages_sender_idx" ON "messages" ("sender_id");
    CREATE INDEX IF NOT EXISTS "messages_recipient_idx" ON "messages" ("recipient_id");
    CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" ("created_at");
  `

  db.exec(migrationSQL)
  console.log('messages table migration completed successfully!')
}

async function ensurePurchasesPaymentMethod(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if payment_method column exists
  const tableInfo = db.prepare(`PRAGMA table_info(purchases)`).all() as Array<{ name: string }>
  const hasPaymentMethod = tableInfo.some((col) => col.name === 'payment_method')

  if (hasPaymentMethod) {
    console.log('purchases.payment_method column exists: true')
    return
  }

  console.log('Starting migration for purchases.payment_method column...')

  // Add payment_method column with default 'cash'
  const migrationSQL = `
    ALTER TABLE purchases ADD COLUMN payment_method TEXT DEFAULT 'cash' NOT NULL;
  `

  db.exec(migrationSQL)
  console.log('purchases.payment_method column migration completed successfully!')
}

async function ensureExpensesPaymentStatus(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if expenses table exists first
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`
  ).get()

  if (!tableCheck) {
    console.log('expenses table does not exist, skipping payment_status migration')
    return
  }

  // Check if payment_status column exists
  const tableInfo = db.prepare(`PRAGMA table_info(expenses)`).all() as Array<{ name: string }>
  const hasPaymentStatus = tableInfo.some((col) => col.name === 'payment_status')

  if (hasPaymentStatus) {
    console.log('expenses.payment_status column exists: true')
    return
  }

  console.log('Starting migration for expenses.payment_status column...')

  // Add payment_status column with default 'paid'
  const migrationSQL = `
    ALTER TABLE expenses ADD COLUMN payment_status TEXT DEFAULT 'paid' NOT NULL;
    CREATE INDEX IF NOT EXISTS "expenses_payment_status_idx" ON "expenses" ("payment_status");
  `

  db.exec(migrationSQL)
  console.log('expenses.payment_status column migration completed successfully!')
}

export async function seedInitialData(): Promise<void> {
  const db = getDatabase()

  // Check if we need to seed data
  const existingBranches = await db.query.branches.findMany()
  if (existingBranches.length > 0) {
    console.log('Database already has data, skipping seed')
    return
  }

  console.log('Seeding initial data...')

  // Import schema
  const { branches, users, settings, categories } = await import('./schema')
  const bcryptModule = await import('bcryptjs')
  const bcrypt = bcryptModule.default || bcryptModule

  // Create main branch
  await db.insert(branches).values({
    name: 'Main Store',
    code: 'MAIN',
    address: '123 Main Street',
    phone: '555-0100',
    email: 'main@firearmstore.com',
    isMain: true,
    isActive: true,
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await db.insert(users).values({
    username: 'admin',
    password: hashedPassword,
    email: 'admin@firearmstore.com',
    fullName: 'System Administrator',
    role: 'admin',
    permissions: ['*'],
    isActive: true,
    branchId: 1,
  })

  // Create default categories
  await db.insert(categories).values([
    { name: 'Firearms', description: 'All firearms' },
    { name: 'Ammunition', description: 'All ammunition types' },
    { name: 'Accessories', description: 'Firearm accessories' },
    { name: 'Safety Equipment', description: 'Safety and storage equipment' },
    { name: 'Cleaning Supplies', description: 'Cleaning and maintenance supplies' },
  ])

  // Create subcategories for Firearms
  await db.insert(categories).values([
    { name: 'Handguns', parentId: 1, description: 'All handguns' },
    { name: 'Rifles', parentId: 1, description: 'All rifles' },
    { name: 'Shotguns', parentId: 1, description: 'All shotguns' },
  ])

  // Create default settings
  await db.insert(settings).values([
    {
      key: 'company_name',
      value: JSON.stringify('Firearms POS'),
      category: 'company',
      description: 'Company name displayed on receipts',
    },
    {
      key: 'company_address',
      value: JSON.stringify('123 Main Street, City, State 12345'),
      category: 'company',
      description: 'Company address',
    },
    {
      key: 'company_phone',
      value: JSON.stringify('555-0100'),
      category: 'company',
      description: 'Company phone number',
    },
    {
      key: 'default_tax_rate',
      value: JSON.stringify(8.5),
      category: 'tax',
      description: 'Default tax rate percentage',
    },
    {
      key: 'currency',
      value: JSON.stringify('USD'),
      category: 'general',
      description: 'Currency code',
    },
    {
      key: 'currency_symbol',
      value: JSON.stringify('$'),
      category: 'general',
      description: 'Currency symbol',
    },
    {
      key: 'date_format',
      value: JSON.stringify('MM/dd/yyyy'),
      category: 'general',
      description: 'Date format',
    },
    {
      key: 'low_stock_threshold',
      value: JSON.stringify(10),
      category: 'inventory',
      description: 'Default low stock alert threshold',
    },
    {
      key: 'require_customer_for_firearms',
      value: JSON.stringify(true),
      category: 'sales',
      description: 'Require customer selection for firearm sales',
    },
    {
      key: 'require_license_validation',
      value: JSON.stringify(true),
      category: 'sales',
      description: 'Require valid firearm license for firearm sales',
    },
  ])

  console.log('Initial data seeded successfully')
}
