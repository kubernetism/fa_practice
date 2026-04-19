/**
 * Test database setup — creates a fresh in-memory SQLite database with all schemas.
 * Used by all Section 9 audit test scenarios.
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

let testSqlite: Database.Database | null = null
let testDb: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Create all tables using raw SQL (matching the Drizzle schema definitions).
 */
function createTables(sqlite: Database.Database) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'cashier',
      permissions TEXT DEFAULT '[]',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      branch_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      address TEXT,
      phone TEXT,
      email TEXT,
      license_number TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_main INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      is_firearm INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS products (
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
      make TEXT,
      made_year INTEGER,
      made_country TEXT,
      firearm_model_id INTEGER,
      caliber_id INTEGER,
      shape_id INTEGER,
      design_id INTEGER,
      default_supplier_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity INTEGER NOT NULL DEFAULT 5,
      max_quantity INTEGER NOT NULL DEFAULT 100,
      last_restock_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_branch_idx ON inventory(product_id, branch_id)`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      tax_id TEXT,
      payment_terms TEXT,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      government_id_type TEXT,
      government_id_number TEXT,
      firearm_license_number TEXT,
      license_expiry_date TEXT,
      date_of_birth TEXT,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER REFERENCES customers(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      payment_status TEXT NOT NULL DEFAULT 'paid',
      amount_paid REAL NOT NULL DEFAULT 0,
      change_given REAL NOT NULL DEFAULT 0,
      notes TEXT,
      is_voided INTEGER NOT NULL DEFAULT 0,
      void_reason TEXT,
      sale_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      serial_number TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      discount_percent REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_number TEXT NOT NULL UNIQUE,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      shipping_cost REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'draft',
      expected_delivery_date TEXT,
      received_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_cost REAL NOT NULL,
      received_quantity INTEGER NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS chart_of_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code TEXT NOT NULL UNIQUE,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_sub_type TEXT,
      parent_account_id INTEGER,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_system_account INTEGER NOT NULL DEFAULT 0,
      normal_balance TEXT NOT NULL,
      current_balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS coa_type_idx ON chart_of_accounts(account_type)`,
    `CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_number TEXT NOT NULL UNIQUE,
      entry_date TEXT NOT NULL,
      description TEXT NOT NULL,
      reference_type TEXT,
      reference_id INTEGER,
      branch_id INTEGER REFERENCES branches(id),
      status TEXT NOT NULL DEFAULT 'draft',
      is_auto_generated INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER NOT NULL REFERENCES users(id),
      posted_by INTEGER REFERENCES users(id),
      posted_at TEXT,
      reversed_by INTEGER REFERENCES users(id),
      reversed_at TEXT,
      reversal_entry_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS je_date_idx ON journal_entries(entry_date)`,
    `CREATE INDEX IF NOT EXISTS je_status_idx ON journal_entries(status)`,
    `CREATE INDEX IF NOT EXISTS je_ref_idx ON journal_entries(reference_type, reference_id)`,
    `CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES chart_of_accounts(id),
      debit_amount REAL NOT NULL DEFAULT 0,
      credit_amount REAL NOT NULL DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS jel_entry_idx ON journal_entry_lines(journal_entry_id)`,
    `CREATE INDEX IF NOT EXISTS jel_account_idx ON journal_entry_lines(account_id)`,
    `CREATE TABLE IF NOT EXISTS account_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES chart_of_accounts(id),
      branch_id INTEGER REFERENCES branches(id),
      period_type TEXT NOT NULL,
      period_date TEXT NOT NULL,
      opening_balance REAL NOT NULL DEFAULT 0,
      debit_total REAL NOT NULL DEFAULT 0,
      credit_total REAL NOT NULL DEFAULT 0,
      closing_balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_cost_layers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      purchase_item_id INTEGER REFERENCES purchase_items(id),
      quantity INTEGER NOT NULL,
      original_quantity INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      received_date TEXT NOT NULL,
      is_fully_consumed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS icl_product_branch_date_idx ON inventory_cost_layers(product_id, branch_id, received_date)`,
    `CREATE INDEX IF NOT EXISTS icl_active_layers_idx ON inventory_cost_layers(product_id, branch_id, is_fully_consumed)`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      branch_id INTEGER REFERENCES branches(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      description TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS business_settings (
      setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(id),
      business_name TEXT NOT NULL,
      business_registration_no TEXT,
      business_type TEXT,
      business_address TEXT,
      business_city TEXT,
      business_state TEXT,
      business_country TEXT,
      business_postal_code TEXT,
      business_phone TEXT,
      business_email TEXT,
      business_website TEXT,
      business_logo TEXT,
      tax_id TEXT,
      tax_rate REAL DEFAULT 0,
      tax_name TEXT DEFAULT 'GST',
      is_tax_inclusive INTEGER DEFAULT 0,
      secondary_tax_rate REAL DEFAULT 0,
      secondary_tax_name TEXT,
      currency_symbol TEXT DEFAULT 'Rs.',
      currency_code TEXT DEFAULT 'PKR',
      currency_position TEXT DEFAULT 'prefix',
      decimal_places INTEGER DEFAULT 2,
      thousand_separator TEXT DEFAULT ',',
      decimal_separator TEXT DEFAULT '.',
      receipt_header TEXT,
      receipt_footer TEXT,
      receipt_logo TEXT,
      invoice_prefix TEXT DEFAULT 'INV',
      invoice_number_format TEXT DEFAULT 'sequential',
      invoice_starting_number INTEGER DEFAULT 1,
      show_tax_on_receipt INTEGER DEFAULT 1,
      show_qr_code_on_receipt INTEGER DEFAULT 0,
      receipt_format TEXT DEFAULT 'pdf',
      receipt_primary_color TEXT DEFAULT '#1e40af',
      receipt_secondary_color TEXT DEFAULT '#64748b',
      receipt_font_size TEXT DEFAULT 'medium',
      receipt_custom_field_1_label TEXT,
      receipt_custom_field_1_value TEXT,
      receipt_custom_field_2_label TEXT,
      receipt_custom_field_2_value TEXT,
      receipt_custom_field_3_label TEXT,
      receipt_custom_field_3_value TEXT,
      receipt_terms_and_conditions TEXT,
      receipt_show_business_logo INTEGER DEFAULT 1,
      receipt_auto_download INTEGER DEFAULT 1,
      low_stock_threshold INTEGER DEFAULT 10,
      enable_stock_tracking INTEGER DEFAULT 1,
      allow_negative_stock INTEGER DEFAULT 0,
      stock_valuation_method TEXT DEFAULT 'FIFO',
      auto_reorder_enabled INTEGER DEFAULT 0,
      auto_reorder_quantity INTEGER DEFAULT 50,
      default_payment_method TEXT DEFAULT 'Cash',
      allowed_payment_methods TEXT DEFAULT 'Cash,Card,Bank Transfer,COD',
      enable_cash_drawer INTEGER DEFAULT 1,
      opening_cash_balance REAL DEFAULT 0,
      enable_discounts INTEGER DEFAULT 1,
      max_discount_percentage REAL DEFAULT 50,
      require_customer_for_sale INTEGER DEFAULT 0,
      enable_customer_loyalty INTEGER DEFAULT 0,
      loyalty_points_ratio REAL DEFAULT 1,
      expense_approval_required INTEGER DEFAULT 0,
      expense_approval_limit REAL DEFAULT 10000,
      enable_returns INTEGER DEFAULT 1,
      return_window_days INTEGER DEFAULT 30,
      require_receipt_for_return INTEGER DEFAULT 1,
      refund_method TEXT DEFAULT 'Original Payment Method',
      enable_email_notifications INTEGER DEFAULT 0,
      notification_email TEXT,
      low_stock_notifications INTEGER DEFAULT 1,
      daily_sales_report INTEGER DEFAULT 0,
      working_days_start TEXT DEFAULT 'Monday',
      working_days_end TEXT DEFAULT 'Saturday',
      opening_time TEXT DEFAULT '09:00',
      closing_time TEXT DEFAULT '18:00',
      auto_backup_enabled INTEGER DEFAULT 1,
      auto_backup_frequency TEXT DEFAULT 'daily',
      backup_retention_days INTEGER DEFAULT 30,
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      time_format TEXT DEFAULT '24-hour',
      language TEXT DEFAULT 'en',
      timezone TEXT DEFAULT 'UTC',
      session_timeout_minutes INTEGER DEFAULT 60,
      require_password_change INTEGER DEFAULT 0,
      password_change_interval_days INTEGER DEFAULT 90,
      enable_audit_logs INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS firearm_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS firearm_calibers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS firearm_shapes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS firearm_designs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS reversal_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_number TEXT NOT NULL UNIQUE,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      requested_by INTEGER NOT NULL REFERENCES users(id),
      reviewed_by INTEGER REFERENCES users(id),
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      review_notes TEXT,
      journal_entry_id INTEGER REFERENCES journal_entries(id),
      reversal_journal_entry_id INTEGER REFERENCES journal_entries(id),
      requested_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS account_payables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER REFERENCES suppliers(id),
      payee_id INTEGER,
      purchase_id INTEGER REFERENCES purchases(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      invoice_number TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      due_date TEXT,
      payment_terms TEXT,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS payables_purchase_idx ON account_payables(purchase_id)`,
    `CREATE INDEX IF NOT EXISTS payables_status_idx ON account_payables(status)`,
    `CREATE TABLE IF NOT EXISTS payable_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payable_id INTEGER NOT NULL REFERENCES account_payables(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
      reference_number TEXT,
      notes TEXT,
      paid_by INTEGER REFERENCES users(id),
      payment_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS cash_register_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      session_date TEXT NOT NULL,
      opened_by INTEGER REFERENCES users(id),
      closed_by INTEGER REFERENCES users(id),
      opening_balance REAL NOT NULL DEFAULT 0,
      closing_balance REAL,
      status TEXT NOT NULL DEFAULT 'open',
      opened_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS cash_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES cash_register_sessions(id),
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      transaction_type TEXT NOT NULL,
      amount REAL NOT NULL,
      reference_type TEXT,
      reference_id INTEGER,
      description TEXT,
      recorded_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      user_id INTEGER REFERENCES users(id),
      category_id INTEGER REFERENCES categories(id),
      amount REAL NOT NULL,
      description TEXT,
      title TEXT,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      reference TEXT,
      expense_date TEXT NOT NULL DEFAULT (datetime('now')),
      payment_status TEXT NOT NULL DEFAULT 'paid',
      payee_id INTEGER,
      payable_id INTEGER REFERENCES account_payables(id),
      due_date TEXT,
      payment_terms TEXT,
      is_voided INTEGER NOT NULL DEFAULT 0,
      void_reason TEXT,
      is_reversed INTEGER NOT NULL DEFAULT 0,
      reversal_expense_id INTEGER,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS online_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      transaction_date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_channel TEXT NOT NULL,
      direction TEXT NOT NULL,
      reference_number TEXT,
      customer_name TEXT,
      customer_id INTEGER,
      invoice_number TEXT,
      bank_account_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      source_type TEXT,
      source_id INTEGER,
      sale_id INTEGER,
      receivable_id INTEGER,
      payable_id INTEGER REFERENCES account_payables(id),
      confirmed_by INTEGER REFERENCES users(id),
      confirmed_at TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ]

  for (const sql of statements) {
    sqlite.prepare(sql).run()
  }
}

/**
 * Seed essential data: a branch, a user, and global business settings.
 */
function seedBaseData(sqlite: Database.Database) {
  sqlite.prepare(
    `INSERT INTO branches (id, name, code, is_main) VALUES (1, 'Main Branch', 'MAIN', 1)`
  ).run()
  sqlite.prepare(
    `INSERT INTO users (id, username, password, email, full_name, role, branch_id) VALUES (1, 'admin', 'hashed', 'admin@test.com', 'Test Admin', 'admin', 1)`
  ).run()
  sqlite.prepare(
    `INSERT INTO categories (id, name) VALUES (1, 'Firearms')`
  ).run()
  sqlite.prepare(
    `INSERT INTO business_settings (setting_id, branch_id, business_name, stock_valuation_method) VALUES (1, NULL, 'Test Firearms Store', 'FIFO')`
  ).run()
}

export function setupTestDatabase() {
  testSqlite = new Database(':memory:')
  testSqlite.pragma('journal_mode = WAL')
  testSqlite.pragma('foreign_keys = ON')

  testDb = drizzle(testSqlite, { schema })

  createTables(testSqlite)
  seedBaseData(testSqlite)

  return { sqlite: testSqlite, db: testDb }
}

export function teardownTestDatabase() {
  if (testSqlite) {
    testSqlite.close()
    testSqlite = null
    testDb = null
  }
}

export function getTestDb() {
  if (!testDb) throw new Error('Test database not initialized')
  return testDb
}

export function getTestSqlite() {
  if (!testSqlite) throw new Error('Test SQLite not initialized')
  return testSqlite
}
