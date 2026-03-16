import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDatabase, getDbPath } from './index'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { migrateToBusinessSettings } from './migrations/migrate_to_business_settings'
import { addPhoneToUsers } from './migrations/add_phone_to_users'

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

  // Manual migration for application_info setup_completed column
  try {
    await ensureApplicationInfoSetupCompleted()
  } catch (error) {
    console.error('Application info setup_completed migration error:', error)
    // Don't throw - log error but continue
  }

  // Manual migration for users phone column
  try {
    await addPhoneToUsers()
  } catch (error) {
    console.error('Users phone column migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure cash register tables exist
  try {
    await ensureCashRegisterTables()
  } catch (error) {
    console.error('Cash register tables migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure financial system tables exist
  try {
    await ensureFinancialSystemTables()
  } catch (error) {
    console.error('Financial system tables migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure inventory cost layers table exists
  try {
    await ensureInventoryCostLayersTable()
  } catch (error) {
    console.error('Inventory cost layers table migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure inventory counts tables exist (for cycle counts/reconciliation)
  try {
    await ensureInventoryCountsTables()
  } catch (error) {
    console.error('Inventory counts tables migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure sale_payments table exists (for mixed payment breakdown)
  try {
    await ensureSalePaymentsTable()
  } catch (error) {
    console.error('Sale payments table migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure services tables exist
  try {
    await ensureServicesTables()
  } catch (error) {
    console.error('Services tables migration error:', error)
    // Don't throw - log error but continue
  }

  // Fix commissions.user_id to be nullable (was incorrectly NOT NULL in initial migration)
  try {
    await fixCommissionsUserIdNullable()
  } catch (error) {
    console.error('Commissions user_id nullable migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure application_info.setup_checklist_status column exists
  try {
    await ensureSetupChecklistStatusColumn()
  } catch (error) {
    console.error('Setup checklist status column migration error:', error)
    // Don't throw - log error but continue
  }

  // Migrate expenses from hardcoded category enum to category_id FK
  try {
    await migrateExpensesToCategoryId()
  } catch (error) {
    console.error('Expenses category_id migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure default expense and service categories exist in categories table
  try {
    await ensureDefaultExpenseAndServiceCategories()
  } catch (error) {
    console.error('Default categories seeding error:', error)
    // Don't throw - log error but continue
  }

  // Ensure reversal_requests table exists
  try {
    await ensureReversalRequestsTable()
  } catch (error) {
    console.error('Reversal requests table migration error:', error)
    // Don't throw - log error but continue
  }

  // Ensure expenses void fields exist
  try {
    await ensureExpensesVoidFields()
  } catch (error) {
    console.error('Expenses void fields migration error:', error)
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

  // Check which columns exist
  const tableInfo = db.prepare(`PRAGMA table_info(expenses)`).all() as Array<{ name: string }>
  const existingColumns = new Set(tableInfo.map((col) => col.name))

  // Add missing columns one by one
  const columnsToAdd = [
    { name: 'payment_status', sql: `ALTER TABLE expenses ADD COLUMN payment_status TEXT DEFAULT 'paid' NOT NULL` },
    { name: 'supplier_id', sql: `ALTER TABLE expenses ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)` },
    { name: 'payable_id', sql: `ALTER TABLE expenses ADD COLUMN payable_id INTEGER REFERENCES account_payables(id)` },
    { name: 'due_date', sql: `ALTER TABLE expenses ADD COLUMN due_date TEXT` },
    { name: 'payment_terms', sql: `ALTER TABLE expenses ADD COLUMN payment_terms TEXT` },
  ]

  for (const column of columnsToAdd) {
    if (!existingColumns.has(column.name)) {
      console.log(`Adding expenses.${column.name} column...`)
      try {
        db.exec(column.sql)
        console.log(`expenses.${column.name} column added successfully`)
      } catch (error) {
        console.error(`Error adding expenses.${column.name} column:`, error)
      }
    } else {
      console.log(`expenses.${column.name} column exists: true`)
    }
  }

  // Create indexes if they don't exist
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS "expenses_payment_status_idx" ON "expenses" ("payment_status")`)
    db.exec(`CREATE INDEX IF NOT EXISTS "expenses_supplier_idx" ON "expenses" ("supplier_id")`)
    db.exec(`CREATE INDEX IF NOT EXISTS "expenses_payable_idx" ON "expenses" ("payable_id")`)
    console.log('expenses indexes created/verified successfully')
  } catch (error) {
    console.error('Error creating expenses indexes:', error)
  }

  console.log('expenses payment_status migration completed successfully!')
}

async function ensureApplicationInfoSetupCompleted(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if application_info table exists first
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='application_info'`
  ).get()

  if (!tableCheck) {
    console.log('application_info table does not exist, skipping setup_completed migration')
    return
  }

  // Check if setup_completed column exists
  const tableInfo = db.prepare(`PRAGMA table_info(application_info)`).all() as Array<{ name: string }>
  const hasSetupCompleted = tableInfo.some((col) => col.name === 'setup_completed')

  if (hasSetupCompleted) {
    console.log('application_info.setup_completed column exists: true')
    return
  }

  console.log('Starting migration for application_info.setup_completed column...')

  // Add setup_completed column with default false
  const migrationSQL = `
    ALTER TABLE application_info ADD COLUMN setup_completed INTEGER DEFAULT 0;
  `

  db.exec(migrationSQL)
  console.log('application_info.setup_completed column migration completed successfully!')
}

export async function seedInitialData(): Promise<void> {
  const db = getDatabase()

  // Check if we need to seed data - check categories instead of branches
  // since branches are now created by the setup wizard
  const { categories: categoriesTable } = await import('./schema')
  const existingCategories = await db.query.categories.findMany()
  if (existingCategories.length > 0) {
    console.log('Database already has data, skipping seed')
    return
  }

  console.log('Seeding initial data...')

  // Import schema
  const { settings, categories } = await import('./schema')

  // NOTE: Branch and admin user are now created by the setup wizard (setup-ipc.ts)
  // This prevents duplicate "Main Store" creation

  // Create default categories - insert Firearms first to get its ID
  const firearmsCategory = db
    .insert(categories)
    .values({ name: 'Firearms', description: 'All firearms' })
    .returning()
    .get()

  // Create other parent categories
  await db.insert(categories).values([
    { name: 'Ammunition', description: 'All ammunition types' },
    { name: 'Accessories', description: 'Firearm accessories' },
    { name: 'Safety Equipment', description: 'Safety and storage equipment' },
    { name: 'Cleaning Supplies', description: 'Cleaning and maintenance supplies' },
  ])

  // Create subcategories for Firearms using the actual ID
  await db.insert(categories).values([
    { name: 'Handguns', parentId: firearmsCategory.id, description: 'All handguns' },
    { name: 'Rifles', parentId: firearmsCategory.id, description: 'All rifles' },
    { name: 'Shotguns', parentId: firearmsCategory.id, description: 'All shotguns' },
  ])

  // Create default expense categories
  await db.insert(categories).values([
    { name: 'Rent', description: 'Rent for premises' },
    { name: 'Utilities', description: 'Electricity, water, gas expenses' },
    { name: 'Salaries', description: 'Employee salaries and wages' },
    { name: 'Supplies', description: 'Office and business supplies' },
    { name: 'Maintenance', description: 'Equipment and facility maintenance' },
    { name: 'Marketing', description: 'Marketing and advertising expenses' },
    { name: 'Other', description: 'Miscellaneous expenses' },
  ])

  // Create default service categories
  await db.insert(categories).values([
    { name: 'Repair', description: 'Weapon repair services' },
    { name: 'Service Maintenance', description: 'Regular maintenance and servicing' },
    { name: 'Customization', description: 'Custom painting, coating, and modifications' },
    { name: 'Testing', description: 'Testing and inspection services' },
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

async function ensureCashRegisterTables(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if cash_register_sessions table exists
  const sessionsTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='cash_register_sessions'`
  ).get()

  if (!sessionsTableCheck) {
    console.log('Creating cash_register_sessions table...')
    const sessionsMigration = `
      CREATE TABLE IF NOT EXISTS "cash_register_sessions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "branch_id" integer NOT NULL,
        "session_date" text NOT NULL,
        "opening_balance" real DEFAULT 0 NOT NULL,
        "closing_balance" real,
        "expected_balance" real,
        "actual_balance" real,
        "variance" real,
        "status" text DEFAULT 'open' NOT NULL,
        "opened_by" integer NOT NULL,
        "closed_by" integer,
        "reconciled_by" integer,
        "opened_at" text NOT NULL,
        "closed_at" text,
        "reconciled_at" text,
        "notes" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reconciled_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "cash_session_branch_date_unique" ON "cash_register_sessions" ("branch_id","session_date");
      CREATE INDEX IF NOT EXISTS "cash_session_branch_idx" ON "cash_register_sessions" ("branch_id");
      CREATE INDEX IF NOT EXISTS "cash_session_date_idx" ON "cash_register_sessions" ("session_date");
      CREATE INDEX IF NOT EXISTS "cash_session_status_idx" ON "cash_register_sessions" ("status");
    `
    db.exec(sessionsMigration)
    console.log('cash_register_sessions table created successfully!')
  } else {
    console.log('cash_register_sessions table exists: true')
  }

  // Check if cash_transactions table exists
  const transactionsTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='cash_transactions'`
  ).get()

  if (!transactionsTableCheck) {
    console.log('Creating cash_transactions table...')
    const transactionsMigration = `
      CREATE TABLE IF NOT EXISTS "cash_transactions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "session_id" integer NOT NULL,
        "branch_id" integer NOT NULL,
        "transaction_type" text NOT NULL,
        "amount" real NOT NULL,
        "reference_type" text,
        "reference_id" integer,
        "description" text,
        "recorded_by" integer NOT NULL,
        "transaction_date" text NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("session_id") REFERENCES "cash_register_sessions"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "cash_tx_session_idx" ON "cash_transactions" ("session_id");
      CREATE INDEX IF NOT EXISTS "cash_tx_branch_idx" ON "cash_transactions" ("branch_id");
      CREATE INDEX IF NOT EXISTS "cash_tx_type_idx" ON "cash_transactions" ("transaction_type");
      CREATE INDEX IF NOT EXISTS "cash_tx_date_idx" ON "cash_transactions" ("transaction_date");
    `
    db.exec(transactionsMigration)
    console.log('cash_transactions table created successfully!')
  } else {
    console.log('cash_transactions table exists: true')
  }
}

async function ensureFinancialSystemTables(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check and create account_payables table
  const payablesTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='account_payables'`
  ).get()

  if (!payablesTableCheck) {
    console.log('Creating account_payables table...')
    const payablesMigration = `
      CREATE TABLE IF NOT EXISTS "account_payables" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "supplier_id" integer NOT NULL,
        "purchase_id" integer,
        "branch_id" integer NOT NULL,
        "invoice_number" text NOT NULL,
        "total_amount" real NOT NULL,
        "paid_amount" real DEFAULT 0 NOT NULL,
        "remaining_amount" real NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "due_date" text,
        "payment_terms" text,
        "notes" text,
        "created_by" integer,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "payables_supplier_idx" ON "account_payables" ("supplier_id");
      CREATE INDEX IF NOT EXISTS "payables_status_idx" ON "account_payables" ("status");
      CREATE INDEX IF NOT EXISTS "payables_branch_idx" ON "account_payables" ("branch_id");
      CREATE INDEX IF NOT EXISTS "payables_due_date_idx" ON "account_payables" ("due_date");
    `
    db.exec(payablesMigration)
    console.log('account_payables table created successfully!')
  } else {
    console.log('account_payables table exists: true')
  }

  // Check and create payable_payments table
  const payablePaymentsTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='payable_payments'`
  ).get()

  if (!payablePaymentsTableCheck) {
    console.log('Creating payable_payments table...')
    const payablePaymentsMigration = `
      CREATE TABLE IF NOT EXISTS "payable_payments" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "payable_id" integer NOT NULL,
        "amount" real NOT NULL,
        "payment_method" text DEFAULT 'bank_transfer' NOT NULL,
        "reference_number" text,
        "notes" text,
        "paid_by" integer,
        "payment_date" text NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("payable_id") REFERENCES "account_payables"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("paid_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "payable_payments_payable_idx" ON "payable_payments" ("payable_id");
      CREATE INDEX IF NOT EXISTS "payable_payments_date_idx" ON "payable_payments" ("payment_date");
    `
    db.exec(payablePaymentsMigration)
    console.log('payable_payments table created successfully!')
  } else {
    console.log('payable_payments table exists: true')
  }

  // Check and create chart_of_accounts table
  const coaTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='chart_of_accounts'`
  ).get()

  if (!coaTableCheck) {
    console.log('Creating chart_of_accounts table...')
    const coaMigration = `
      CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "account_code" text NOT NULL,
        "account_name" text NOT NULL,
        "account_type" text NOT NULL,
        "account_sub_type" text,
        "parent_account_id" integer,
        "description" text,
        "is_active" integer DEFAULT 1 NOT NULL,
        "is_system_account" integer DEFAULT 0 NOT NULL,
        "normal_balance" text NOT NULL,
        "current_balance" real DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "chart_of_accounts_account_code_unique" ON "chart_of_accounts" ("account_code");
      CREATE INDEX IF NOT EXISTS "coa_type_idx" ON "chart_of_accounts" ("account_type");
      CREATE INDEX IF NOT EXISTS "coa_parent_idx" ON "chart_of_accounts" ("parent_account_id");
      CREATE INDEX IF NOT EXISTS "coa_active_idx" ON "chart_of_accounts" ("is_active");

      -- Insert default chart of accounts
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1000', 'Cash and Cash Equivalents', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1010', 'Cash in Hand', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1020', 'Cash in Bank', 'asset', 'bank', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1100', 'Accounts Receivable', 'asset', 'accounts_receivable', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1200', 'Inventory', 'asset', 'inventory', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1500', 'Fixed Assets', 'asset', 'fixed_asset', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1510', 'Accumulated Depreciation', 'asset', 'accumulated_depreciation', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('2000', 'Accounts Payable', 'liability', 'accounts_payable', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('2100', 'Sales Tax Payable', 'liability', 'other_liability', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('3000', 'Owner Capital', 'equity', 'owner_capital', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('3100', 'Retained Earnings', 'equity', 'retained_earnings', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('4000', 'Sales Revenue', 'revenue', 'sales_revenue', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('4900', 'Inventory Adjustment Income', 'revenue', 'other_revenue', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5000', 'Cost of Goods Sold', 'expense', 'cost_of_goods_sold', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5100', 'Salaries and Wages', 'expense', 'payroll_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5200', 'Rent Expense', 'expense', 'rent_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5300', 'Utilities Expense', 'expense', 'utilities_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5400', 'Inventory Shrinkage', 'expense', 'other_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5900', 'Other Expenses', 'expense', 'other_expense', 'debit', 0, datetime('now'), datetime('now'));
    `
    db.exec(coaMigration)
    console.log('chart_of_accounts table created successfully!')
  } else {
    console.log('chart_of_accounts table exists: true')
    // Add missing accounts for existing databases
    db.exec(`
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('4900', 'Inventory Adjustment Income', 'revenue', 'other_revenue', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5400', 'Inventory Shrinkage', 'expense', 'other_expense', 'debit', 1, datetime('now'), datetime('now'));
    `)
    console.log('Ensured inventory adjustment accounts exist (4900, 5400)')
  }

  // Check and create journal_entries table
  const jeTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entries'`
  ).get()

  if (!jeTableCheck) {
    console.log('Creating journal_entries table...')
    const jeMigration = `
      CREATE TABLE IF NOT EXISTS "journal_entries" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "entry_number" text NOT NULL,
        "entry_date" text NOT NULL,
        "description" text NOT NULL,
        "reference_type" text,
        "reference_id" integer,
        "branch_id" integer,
        "status" text DEFAULT 'draft' NOT NULL,
        "is_auto_generated" integer DEFAULT 0 NOT NULL,
        "created_by" integer NOT NULL,
        "posted_by" integer,
        "posted_at" text,
        "reversed_by" integer,
        "reversed_at" text,
        "reversal_entry_id" integer,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reversed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "journal_entries_entry_number_unique" ON "journal_entries" ("entry_number");
      CREATE INDEX IF NOT EXISTS "je_date_idx" ON "journal_entries" ("entry_date");
      CREATE INDEX IF NOT EXISTS "je_status_idx" ON "journal_entries" ("status");
      CREATE INDEX IF NOT EXISTS "je_ref_idx" ON "journal_entries" ("reference_type","reference_id");
    `
    db.exec(jeMigration)
    console.log('journal_entries table created successfully!')
  } else {
    console.log('journal_entries table exists: true')
  }

  // Check and create journal_entry_lines table
  const jelTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entry_lines'`
  ).get()

  if (!jelTableCheck) {
    console.log('Creating journal_entry_lines table...')
    const jelMigration = `
      CREATE TABLE IF NOT EXISTS "journal_entry_lines" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "journal_entry_id" integer NOT NULL,
        "account_id" integer NOT NULL,
        "debit_amount" real DEFAULT 0 NOT NULL,
        "credit_amount" real DEFAULT 0 NOT NULL,
        "description" text,
        "created_at" text NOT NULL,
        FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "jel_entry_idx" ON "journal_entry_lines" ("journal_entry_id");
      CREATE INDEX IF NOT EXISTS "jel_account_idx" ON "journal_entry_lines" ("account_id");
    `
    db.exec(jelMigration)
    console.log('journal_entry_lines table created successfully!')
  } else {
    console.log('journal_entry_lines table exists: true')
  }

  // Check and create account_balances table
  const abTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='account_balances'`
  ).get()

  if (!abTableCheck) {
    console.log('Creating account_balances table...')
    const abMigration = `
      CREATE TABLE IF NOT EXISTS "account_balances" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "account_id" integer NOT NULL,
        "branch_id" integer,
        "period_type" text NOT NULL,
        "period_date" text NOT NULL,
        "opening_balance" real DEFAULT 0 NOT NULL,
        "debit_total" real DEFAULT 0 NOT NULL,
        "credit_total" real DEFAULT 0 NOT NULL,
        "closing_balance" real DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "ab_account_period_idx" ON "account_balances" ("account_id","period_type","period_date");
      CREATE INDEX IF NOT EXISTS "ab_branch_idx" ON "account_balances" ("branch_id");
    `
    db.exec(abMigration)
    console.log('account_balances table created successfully!')
  } else {
    console.log('account_balances table exists: true')
  }
}

async function ensureInventoryCostLayersTable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if inventory_cost_layers table exists
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_cost_layers'`
  ).get()

  if (!tableCheck) {
    console.log('Creating inventory_cost_layers table...')
    const costLayersMigration = `
      CREATE TABLE IF NOT EXISTS "inventory_cost_layers" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "product_id" integer NOT NULL,
        "branch_id" integer NOT NULL,
        "purchase_item_id" integer,
        "quantity" integer NOT NULL,
        "original_quantity" integer NOT NULL,
        "unit_cost" real NOT NULL,
        "received_date" text NOT NULL,
        "is_fully_consumed" integer DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("purchase_item_id") REFERENCES "purchase_items"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "icl_product_branch_date_idx" ON "inventory_cost_layers" ("product_id", "branch_id", "received_date");
      CREATE INDEX IF NOT EXISTS "icl_active_layers_idx" ON "inventory_cost_layers" ("product_id", "branch_id", "is_fully_consumed");
      CREATE INDEX IF NOT EXISTS "icl_purchase_item_idx" ON "inventory_cost_layers" ("purchase_item_id");
    `
    db.exec(costLayersMigration)
    console.log('inventory_cost_layers table created successfully!')
  } else {
    console.log('inventory_cost_layers table exists: true')
  }
}

async function ensureInventoryCountsTables(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if inventory_counts table exists
  const countsTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_counts'`
  ).get()

  if (!countsTableCheck) {
    console.log('Creating inventory_counts table...')
    const countsMigration = `
      CREATE TABLE IF NOT EXISTS "inventory_counts" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "count_number" text NOT NULL UNIQUE,
        "branch_id" integer NOT NULL,
        "count_type" text NOT NULL,
        "status" text DEFAULT 'draft' NOT NULL,
        "scheduled_date" text,
        "started_at" text,
        "completed_at" text,
        "started_by" integer,
        "completed_by" integer,
        "created_by" integer NOT NULL,
        "notes" text,
        "total_items" integer DEFAULT 0,
        "items_counted" integer DEFAULT 0,
        "variance_count" integer DEFAULT 0,
        "variance_value" real DEFAULT 0,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("started_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "ic_branch_idx" ON "inventory_counts" ("branch_id");
      CREATE INDEX IF NOT EXISTS "ic_status_idx" ON "inventory_counts" ("status");
      CREATE INDEX IF NOT EXISTS "ic_date_idx" ON "inventory_counts" ("scheduled_date");
    `
    db.exec(countsMigration)
    console.log('inventory_counts table created successfully!')
  } else {
    console.log('inventory_counts table exists: true')
  }

  // Check if inventory_count_items table exists
  const itemsTableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_count_items'`
  ).get()

  if (!itemsTableCheck) {
    console.log('Creating inventory_count_items table...')
    const itemsMigration = `
      CREATE TABLE IF NOT EXISTS "inventory_count_items" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "count_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "expected_quantity" integer NOT NULL,
        "expected_cost" real DEFAULT 0 NOT NULL,
        "counted_quantity" integer,
        "variance_quantity" integer,
        "variance_value" real,
        "variance_percent" real,
        "counted_by" integer,
        "counted_at" text,
        "serial_number" text,
        "adjustment_created" integer DEFAULT 0 NOT NULL,
        "notes" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("count_id") REFERENCES "inventory_counts"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("counted_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "ici_count_idx" ON "inventory_count_items" ("count_id");
      CREATE INDEX IF NOT EXISTS "ici_product_idx" ON "inventory_count_items" ("product_id");
      CREATE INDEX IF NOT EXISTS "ici_variance_idx" ON "inventory_count_items" ("variance_quantity");
    `
    db.exec(itemsMigration)
    console.log('inventory_count_items table created successfully!')
  } else {
    console.log('inventory_count_items table exists: true')
  }
}

async function ensureSalePaymentsTable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check if sale_payments table exists
  const tableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='sale_payments'`
  ).get()

  if (!tableCheck) {
    console.log('Creating sale_payments table...')
    const migration = `
      CREATE TABLE IF NOT EXISTS "sale_payments" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "sale_id" integer NOT NULL,
        "payment_method" text NOT NULL,
        "amount" real NOT NULL,
        "reference_number" text,
        "notes" text,
        "created_at" text NOT NULL,
        FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON UPDATE no action ON DELETE cascade
      );

      CREATE INDEX IF NOT EXISTS "sp_sale_idx" ON "sale_payments" ("sale_id");
      CREATE INDEX IF NOT EXISTS "sp_method_idx" ON "sale_payments" ("payment_method");
    `
    rawDb.exec(migration)
    console.log('sale_payments table created successfully!')
  } else {
    console.log('sale_payments table exists: true')
  }
}

async function ensureServicesTables(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check and create service_categories table
  const categoriesTableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='service_categories'`
  ).get()

  if (!categoriesTableCheck) {
    console.log('Creating service_categories table...')
    rawDb.exec(
      'CREATE TABLE IF NOT EXISTS "service_categories" (' +
        '"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,' +
        '"name" text NOT NULL UNIQUE,' +
        '"description" text,' +
        '"is_active" integer DEFAULT 1 NOT NULL,' +
        '"created_at" text NOT NULL,' +
        '"updated_at" text NOT NULL' +
      ')'
    )
    console.log('service_categories table created successfully!')
  } else {
    console.log('service_categories table exists: true')
  }

  // Always seed default service categories (INSERT OR IGNORE handles duplicates)
  const seedCategories = rawDb.prepare(
    'INSERT OR IGNORE INTO "service_categories" ("name", "description", "is_active", "created_at", "updated_at") VALUES (?, ?, 1, datetime(\'now\'), datetime(\'now\'))'
  )
  const defaultServiceCategories = [
    ['Repair', 'Weapon repair services'],
    ['Maintenance', 'Regular maintenance and servicing'],
    ['Customization', 'Custom painting, coating, and modifications'],
    ['Testing', 'Testing and inspection services'],
    ['Other', 'Other services'],
  ]
  for (const [name, description] of defaultServiceCategories) {
    seedCategories.run(name, description)
  }

  // Check and create services table
  const servicesTableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='services'`
  ).get()

  if (!servicesTableCheck) {
    console.log('Creating services table...')
    const servicesMigration = `
      CREATE TABLE IF NOT EXISTS "services" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "code" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "description" text,
        "category_id" integer REFERENCES "service_categories"("id"),
        "price" real DEFAULT 0 NOT NULL,
        "pricing_type" text DEFAULT 'flat' NOT NULL,
        "estimated_duration" integer DEFAULT 60,
        "is_taxable" integer DEFAULT 1 NOT NULL,
        "tax_rate" real DEFAULT 0 NOT NULL,
        "is_active" integer DEFAULT 1 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services" ("category_id");
      CREATE INDEX IF NOT EXISTS "services_active_idx" ON "services" ("is_active");
    `
    rawDb.exec(servicesMigration)
    console.log('services table created successfully!')
  } else {
    console.log('services table exists: true')
  }

  // Check and create sale_services table
  const saleServicesTableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='sale_services'`
  ).get()

  if (!saleServicesTableCheck) {
    console.log('Creating sale_services table...')
    const saleServicesMigration = `
      CREATE TABLE IF NOT EXISTS "sale_services" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "sale_id" integer NOT NULL REFERENCES "sales"("id"),
        "service_id" integer NOT NULL REFERENCES "services"("id"),
        "service_name" text NOT NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "unit_price" real NOT NULL,
        "hours" real,
        "tax_rate" real DEFAULT 0 NOT NULL,
        "tax_amount" real DEFAULT 0 NOT NULL,
        "total_amount" real NOT NULL,
        "notes" text,
        "created_at" text NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "ss_sale_idx" ON "sale_services" ("sale_id");
      CREATE INDEX IF NOT EXISTS "ss_service_idx" ON "sale_services" ("service_id");
    `
    rawDb.exec(saleServicesMigration)
    console.log('sale_services table created successfully!')
  } else {
    console.log('sale_services table exists: true')
  }

  // Add Service Revenue account to chart of accounts if it doesn't exist
  try {
    rawDb.exec(`
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at")
      VALUES ('4100', 'Service Revenue', 'revenue', 'service_revenue', 'credit', 1, datetime('now'), datetime('now'));
    `)
    console.log('Service Revenue account (4100) ensured in chart of accounts')
  } catch (error) {
    console.error('Error adding Service Revenue account:', error)
  }
}

async function fixCommissionsUserIdNullable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check if commissions table exists
  const tableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='commissions'`
  ).get()

  if (!tableCheck) {
    console.log('commissions table does not exist, skipping user_id nullable fix')
    return
  }

  // Check if user_id is currently NOT NULL
  const tableInfo = rawDb.prepare('PRAGMA table_info(commissions)').all() as Array<{
    name: string
    notnull: number
  }>
  const userIdCol = tableInfo.find((col) => col.name === 'user_id')

  if (!userIdCol || userIdCol.notnull === 0) {
    console.log('commissions.user_id is already nullable or does not exist')
    return
  }

  console.log('Fixing commissions.user_id to be nullable (recreating table)...')

  // Check if a leftover commissions_new table exists from a previous failed attempt
  const leftoverCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='commissions_new'`
  ).get()
  if (leftoverCheck) {
    rawDb.prepare('DROP TABLE "commissions_new"').run()
    console.log('Dropped leftover commissions_new table from previous attempt')
  }

  // SQLite does not support ALTER COLUMN, so recreate the table with user_id nullable
  const migrationStatements = [
    `CREATE TABLE "commissions_new" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "sale_id" integer NOT NULL,
      "user_id" integer,
      "referral_person_id" integer,
      "branch_id" integer NOT NULL,
      "commission_type" text DEFAULT 'sale' NOT NULL,
      "base_amount" real NOT NULL,
      "rate" real NOT NULL,
      "commission_amount" real NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "paid_date" text,
      "notes" text,
      "created_at" text NOT NULL,
      "updated_at" text NOT NULL,
      FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("referral_person_id") REFERENCES "referral_persons"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
    )`,
    'INSERT INTO "commissions_new" SELECT * FROM "commissions"',
    'DROP TABLE "commissions"',
    'ALTER TABLE "commissions_new" RENAME TO "commissions"',
  ]

  const runMigration = rawDb.transaction(() => {
    for (const stmt of migrationStatements) {
      rawDb.prepare(stmt).run()
    }
  })

  runMigration()

  console.log('commissions.user_id nullable fix completed successfully!')
}

async function ensureSetupChecklistStatusColumn(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check if application_info table exists
  const tableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='application_info'`
  ).get()

  if (!tableCheck) {
    console.log('application_info table does not exist, skipping setup_checklist_status migration')
    return
  }

  // Check if setup_checklist_status column exists
  const tableInfo = rawDb.prepare('PRAGMA table_info(application_info)').all() as Array<{ name: string }>
  const hasColumn = tableInfo.some((col) => col.name === 'setup_checklist_status')

  if (hasColumn) {
    console.log('application_info.setup_checklist_status column exists: true')
    return
  }

  console.log('Adding application_info.setup_checklist_status column...')
  rawDb.exec('ALTER TABLE application_info ADD COLUMN setup_checklist_status TEXT')
  console.log('application_info.setup_checklist_status column added successfully')
}

async function migrateExpensesToCategoryId(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check if expenses table exists
  const tableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`
  ).get()

  if (!tableCheck) {
    console.log('expenses table does not exist, skipping category_id migration')
    return
  }

  // Check if category_id column already exists
  const tableInfo = rawDb.prepare('PRAGMA table_info(expenses)').all() as Array<{ name: string }>
  const hasCategoryId = tableInfo.some((col) => col.name === 'category_id')
  const hasCategory = tableInfo.some((col) => col.name === 'category')

  if (hasCategoryId) {
    console.log('expenses.category_id column exists: true')
    return
  }

  if (!hasCategory) {
    console.log('expenses.category column does not exist, skipping migration')
    return
  }

  console.log('Migrating expenses from category text to category_id FK...')

  // Ensure expense categories exist in the categories table
  const defaultExpenseCategories = [
    { name: 'Rent', description: 'Rent for premises' },
    { name: 'Utilities', description: 'Electricity, water, gas expenses' },
    { name: 'Salaries', description: 'Employee salaries and wages' },
    { name: 'Supplies', description: 'Office and business supplies' },
    { name: 'Maintenance', description: 'Equipment and facility maintenance' },
    { name: 'Marketing', description: 'Marketing and advertising expenses' },
    { name: 'Other', description: 'Miscellaneous expenses' },
  ]

  const now = new Date().toISOString()
  for (const cat of defaultExpenseCategories) {
    rawDb.prepare(
      `INSERT OR IGNORE INTO categories (name, description, is_active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)`
    ).run(cat.name, cat.description, now, now)
  }

  // Add category_id column
  rawDb.prepare(
    `ALTER TABLE expenses ADD COLUMN category_id INTEGER REFERENCES categories(id)`
  ).run()

  // Map old category text values to category IDs
  const categoryMapping: Record<string, string> = {
    rent: 'Rent',
    utilities: 'Utilities',
    salaries: 'Salaries',
    supplies: 'Supplies',
    maintenance: 'Maintenance',
    marketing: 'Marketing',
    other: 'Other',
  }

  for (const [oldValue, categoryName] of Object.entries(categoryMapping)) {
    const category = rawDb.prepare(
      `SELECT id FROM categories WHERE name = ?`
    ).get(categoryName) as { id: number } | undefined

    if (category) {
      rawDb.prepare(
        `UPDATE expenses SET category_id = ? WHERE category = ?`
      ).run(category.id, oldValue)
    }
  }

  // Set any remaining NULL category_id to "Other"
  const otherCategory = rawDb.prepare(
    `SELECT id FROM categories WHERE name = 'Other'`
  ).get() as { id: number } | undefined

  if (otherCategory) {
    rawDb.prepare(
      `UPDATE expenses SET category_id = ? WHERE category_id IS NULL`
    ).run(otherCategory.id)
  }

  console.log('expenses category_id migration completed successfully!')
}

async function ensureDefaultExpenseAndServiceCategories(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const rawDb = getRawDatabase()

  // Check if categories table exists
  const tableCheck = rawDb.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='categories'`
  ).get()

  if (!tableCheck) {
    console.log('categories table does not exist, skipping default categories seeding')
    return
  }

  const now = new Date().toISOString()

  // Expense categories
  const expenseCategories = [
    { name: 'Rent', description: 'Rent for premises' },
    { name: 'Utilities', description: 'Electricity, water, gas expenses' },
    { name: 'Salaries', description: 'Employee salaries and wages' },
    { name: 'Supplies', description: 'Office and business supplies' },
    { name: 'Maintenance', description: 'Equipment and facility maintenance' },
    { name: 'Marketing', description: 'Marketing and advertising expenses' },
    { name: 'Other', description: 'Miscellaneous expenses' },
  ]

  // Service categories
  const serviceCats = [
    { name: 'Repair', description: 'Weapon repair services' },
    { name: 'Service Maintenance', description: 'Regular maintenance and servicing' },
    { name: 'Customization', description: 'Custom painting, coating, and modifications' },
    { name: 'Testing', description: 'Testing and inspection services' },
  ]

  const allCategories = [...expenseCategories, ...serviceCats]

  for (const cat of allCategories) {
    rawDb.prepare(
      `INSERT OR IGNORE INTO categories (name, description, is_active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)`
    ).run(cat.name, cat.description, now, now)
  }

  console.log('Default expense and service categories ensured in categories table')
}

async function ensureReversalRequestsTable(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  // Check if table exists
  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='reversal_requests'`
  ).get()

  if (!tableCheck) {
    console.log('Starting migration for reversal_requests table...')

    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS "reversal_requests" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "request_number" text NOT NULL UNIQUE,
        "entity_type" text NOT NULL,
        "entity_id" integer NOT NULL,
        "reason" text NOT NULL,
        "priority" text DEFAULT 'medium' NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "requested_by" integer NOT NULL,
        "reviewed_by" integer,
        "reviewed_at" text,
        "rejection_reason" text,
        "reversal_details" text,
        "error_details" text,
        "branch_id" integer NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "rr_status_idx" ON "reversal_requests" ("status");
      CREATE INDEX IF NOT EXISTS "rr_entity_idx" ON "reversal_requests" ("entity_type", "entity_id");
      CREATE INDEX IF NOT EXISTS "rr_branch_idx" ON "reversal_requests" ("branch_id");
      CREATE INDEX IF NOT EXISTS "rr_priority_idx" ON "reversal_requests" ("priority");
    `

    db.exec(migrationSQL)
    console.log('reversal_requests table migration completed successfully!')
  } else {
    console.log('reversal_requests table exists: true')
  }
}

async function ensureExpensesVoidFields(): Promise<void> {
  const { getRawDatabase } = await import('./index')
  const db = getRawDatabase()

  const tableCheck = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`
  ).get()

  if (!tableCheck) {
    console.log('expenses table does not exist, skipping void fields migration')
    return
  }

  const tableInfo = db.prepare(`PRAGMA table_info(expenses)`).all() as Array<{ name: string }>
  const existingColumns = new Set(tableInfo.map((col) => col.name))

  const columnsToAdd = [
    { name: 'is_voided', sql: `ALTER TABLE expenses ADD COLUMN is_voided INTEGER DEFAULT 0 NOT NULL` },
    { name: 'void_reason', sql: `ALTER TABLE expenses ADD COLUMN void_reason TEXT` },
  ]

  for (const column of columnsToAdd) {
    if (!existingColumns.has(column.name)) {
      console.log(`Adding expenses.${column.name} column...`)
      try {
        db.exec(column.sql)
        console.log(`expenses.${column.name} column added successfully`)
      } catch (error) {
        console.error(`Error adding expenses.${column.name} column:`, error)
      }
    } else {
      console.log(`expenses.${column.name} column exists: true`)
    }
  }

  console.log('expenses void fields migration completed successfully!')
}
