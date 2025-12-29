import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDatabase, getDbPath } from './index'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'

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
    // For development without migrations, we can use push or skip
    return
  }

  try {
    migrate(db, { migrationsFolder: migrationsPath })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
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
