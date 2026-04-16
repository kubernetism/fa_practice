import { getDatabase } from '../index'

export async function migrateToPayees(): Promise<void> {
  const db = getDatabase()
  const rawDb = db.$client

  // Check if payees table already exists
  const tableExists = rawDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payees'")
    .get()

  if (tableExists) {
    console.log('Payees table already exists, skipping migration')
    return
  }

  console.log('Running payees migration...')

  rawDb.exec('BEGIN TRANSACTION')

  try {
    // Step 1: Create payees table
    rawDb.exec(`
      CREATE TABLE payees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        payee_type TEXT NOT NULL DEFAULT 'other',
        linked_supplier_id INTEGER REFERENCES suppliers(id),
        contact_phone TEXT,
        contact_email TEXT,
        address TEXT,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    rawDb.exec('CREATE INDEX payees_payee_type_idx ON payees(payee_type)')
    rawDb.exec('CREATE INDEX payees_linked_supplier_idx ON payees(linked_supplier_id)')
    rawDb.exec('CREATE INDEX payees_is_active_idx ON payees(is_active)')

    // Step 2: Mirror all suppliers into payees as vendor type
    rawDb.exec(`
      INSERT INTO payees (name, payee_type, linked_supplier_id, contact_phone, contact_email, address, notes, is_active, created_at, updated_at)
      SELECT name, 'vendor', id, phone, email, address, notes, is_active, created_at, updated_at
      FROM suppliers
    `)
    const mirroredCount = rawDb.prepare('SELECT changes() as count').get() as { count: number }
    console.log('Mirrored ' + mirroredCount.count + ' suppliers as vendor payees')

    // Step 3: Add payee_id column to expenses
    rawDb.exec('ALTER TABLE expenses ADD COLUMN payee_id INTEGER REFERENCES payees(id)')

    // Step 4: Backfill expenses that have supplier_id
    rawDb.exec(`
      UPDATE expenses
      SET payee_id = (
        SELECT p.id FROM payees p WHERE p.linked_supplier_id = expenses.supplier_id
      )
      WHERE supplier_id IS NOT NULL
    `)
    const backfilledCount = rawDb.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE supplier_id IS NOT NULL AND payee_id IS NOT NULL'
    ).get() as { count: number }
    console.log('Backfilled ' + backfilledCount.count + ' expenses with payee_id from supplier link')

    // Step 5: Handle orphan paid expenses (no supplier_id)
    const orphanCount = rawDb.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE payee_id IS NULL'
    ).get() as { count: number }

    if (orphanCount.count > 0) {
      // Create catch-all "Unattributed (Legacy)" payee
      rawDb.exec(`
        INSERT INTO payees (name, payee_type, is_active, created_at, updated_at)
        VALUES ('Unattributed (Legacy)', 'other', 1, datetime('now'), datetime('now'))
      `)
      const legacyPayeeId = rawDb.prepare('SELECT last_insert_rowid() as id').get() as { id: number }

      const stmt = rawDb.prepare('UPDATE expenses SET payee_id = ? WHERE payee_id IS NULL')
      stmt.run(legacyPayeeId.id)
      console.log('Assigned ' + orphanCount.count + ' orphan expenses to "Unattributed (Legacy)" payee (id=' + legacyPayeeId.id + ')')
    }

    // Step 6: Create index on expenses.payee_id
    rawDb.exec('CREATE INDEX expenses_payee_idx ON expenses(payee_id)')

    // Step 7: Add payee_id to account_payables
    rawDb.exec('ALTER TABLE account_payables ADD COLUMN payee_id INTEGER REFERENCES payees(id)')
    rawDb.exec('CREATE INDEX payables_payee_idx ON account_payables(payee_id)')

    // Backfill A/P rows linked to expenses that now have payee_id
    rawDb.exec(`
      UPDATE account_payables
      SET payee_id = (
        SELECT e.payee_id FROM expenses e WHERE e.payable_id = account_payables.id
      )
      WHERE EXISTS (
        SELECT 1 FROM expenses e WHERE e.payable_id = account_payables.id AND e.payee_id IS NOT NULL
      )
    `)

    // Note: We do NOT drop supplier_id from expenses yet.
    // The column stays as a legacy reference. The Drizzle schema uses payeeId,
    // and the old supplier_id column is simply ignored by Drizzle queries.
    // A future cleanup migration can drop it once confirmed safe.

    rawDb.exec('COMMIT')
    console.log('Payees migration completed successfully')
  } catch (error) {
    rawDb.exec('ROLLBACK')
    console.error('Payees migration failed, rolled back:', error)
    throw error
  }
}
