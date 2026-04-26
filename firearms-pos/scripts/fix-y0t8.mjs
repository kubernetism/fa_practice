#!/usr/bin/env node
// Books fix for INV-20260426-Y0T8 (sale id 51 / AR id 19)
//
// Background: The sale's two AR mobile-payment rows were inserted with the
// legacy posted-only path (status='posted' default) before the held-payment
// build. On confirm, the new code's pending_approval check skipped finalize
// but still posted the 1030->1020 drain JE for each. Result: two phantom
// drain JEs (105, 106) with no offsetting finalize, AR untouched, books
// imbalanced by 240k on 1030 and 1020.
//
// Fix:
//   1. Insert reversal JE for JE 106 (duplicate drain): DR 1030 / CR 1020
//      mark JE 106 status='reversed' with reversal_entry_id pointer.
//   2. Insert finalize JE for payment 19: DR 1030 / CR 1100
//      reference_type='receivable_payment', reference_id=19
//   3. Update CoA balances per JE deltas.
//   4. Update business rows: AR 19 -> paid; sale 51 -> paid;
//      payment 20 -> cancelled; online_tx 12 -> failed.

import Database from 'better-sqlite3'
import { existsSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DB_PATH = join(homedir(), '.config', 'firearms-pos', 'data', 'firearms-pos.db')

if (!existsSync(DB_PATH)) {
  console.error(`DB not found at ${DB_PATH}`)
  process.exit(1)
}

// Backup
const backupPath = `${DB_PATH}.pre-y0t8-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.bak`
copyFileSync(DB_PATH, backupPath)
console.log(`Backup written: ${backupPath}`)

const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

const now = new Date().toISOString()
const today = now.slice(0, 10)

// Look up account ids by code
const acct = (code) =>
  db.prepare('SELECT id FROM chart_of_accounts WHERE account_code = ?').get(code)?.id
const A_1020 = acct('1020')
const A_1030 = acct('1030')
const A_1100 = acct('1100')
if (!A_1020 || !A_1030 || !A_1100) {
  console.error('Missing account(s):', { A_1020, A_1030, A_1100 })
  process.exit(1)
}

// Look up the original drain JE 106 to copy created_by/branch_id
const je106 = db.prepare('SELECT * FROM journal_entries WHERE id = 106').get()
if (!je106) {
  console.error('JE 106 not found — aborting')
  process.exit(1)
}
const userId = je106.created_by
const branchId = je106.branch_id

// Verify pre-state matches expectations
const ar = db.prepare('SELECT * FROM account_receivables WHERE id = 19').get()
const sale = db.prepare('SELECT * FROM sales WHERE id = 51').get()
const pay20 = db.prepare('SELECT * FROM receivable_payments WHERE id = 20').get()
const otx12 = db.prepare('SELECT * FROM online_transactions WHERE id = 12').get()
if (!ar || !sale || !pay20 || !otx12) {
  console.error('Expected rows missing — aborting', { ar: !!ar, sale: !!sale, pay20: !!pay20, otx12: !!otx12 })
  process.exit(1)
}
if (ar.paid_amount !== 0 || ar.remaining_amount !== 120000) {
  console.error('AR 19 unexpected state — aborting', ar)
  process.exit(1)
}
console.log('Pre-state verified.')

const insertJE = db.prepare(`
  INSERT INTO journal_entries (
    entry_number, entry_date, description, reference_type, reference_id,
    branch_id, status, is_auto_generated, created_by, posted_by, posted_at,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, 'posted', 1, ?, ?, ?, ?, ?)
`)
const insertJEL = db.prepare(`
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, debit_amount, credit_amount, description, created_at
  ) VALUES (?, ?, ?, ?, ?, ?)
`)
const updateCoA = db.prepare(
  'UPDATE chart_of_accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?'
)

// Apply a JE line's effect to chart_of_accounts.current_balance.
// Convention used in gl-posting.ts: debit-normal accounts increase on debit;
// credit-normal accounts increase on credit.
function applyBalance(accountId, debit, credit) {
  const acc = db.prepare('SELECT normal_balance FROM chart_of_accounts WHERE id = ?').get(accountId)
  const delta = acc.normal_balance === 'debit' ? debit - credit : credit - debit
  updateCoA.run(delta, now, accountId)
}

const txn = db.transaction(() => {
  // ---- Step 1: reversal JE for JE 106 ----
  const revNumber = `JE-REV-Y0T8-${Date.now()}`
  const revInfo = insertJE.run(
    revNumber,
    today,
    'Reversal of JE 106 (duplicate drain for INV-20260426-Y0T8 / AR payment 20)',
    'reversal',
    106,
    branchId,
    userId,
    userId,
    now,
    now,
    now
  )
  const revJeId = revInfo.lastInsertRowid

  // Reversal mirrors original JE 106 (which was DR 1020 / CR 1030)
  insertJEL.run(revJeId, A_1030, 120000, 0, 'Reverse duplicate drain', now)
  insertJEL.run(revJeId, A_1020, 0, 120000, 'Reverse duplicate drain', now)
  applyBalance(A_1030, 120000, 0)
  applyBalance(A_1020, 0, 120000)

  // Mark JE 106 as reversed
  db.prepare(`
    UPDATE journal_entries
    SET status = 'reversed', reversed_by = ?, reversed_at = ?, reversal_entry_id = ?, updated_at = ?
    WHERE id = 106
  `).run(userId, now, revJeId, now)

  // ---- Step 2: missing finalize JE for payment 19 ----
  const finNumber = `JE-FIN-Y0T8-${Date.now()}`
  const finInfo = insertJE.run(
    finNumber,
    today,
    'AR Payment finalize (recovery): INV-20260426-Y0T8 / payment 19',
    'receivable_payment',
    19,
    branchId,
    userId,
    userId,
    now,
    now,
    now
  )
  const finJeId = finInfo.lastInsertRowid

  // Finalize: DR 1030 / CR 1100 (clears AR, parks in pending which JE 105 then drains)
  insertJEL.run(finJeId, A_1030, 120000, 0, 'AR payment received via mobile (held -> finalize)', now)
  insertJEL.run(finJeId, A_1100, 0, 120000, 'Clear AR for INV-20260426-Y0T8', now)
  applyBalance(A_1030, 120000, 0)
  applyBalance(A_1100, 0, 120000)

  // ---- Step 3: business rows ----
  db.prepare(`
    UPDATE account_receivables
    SET paid_amount = 120000, remaining_amount = 0, status = 'paid', updated_at = ?
    WHERE id = 19
  `).run(now)

  db.prepare(`
    UPDATE sales SET amount_paid = 120000, payment_status = 'paid', updated_at = ? WHERE id = 51
  `).run(now)

  db.prepare(`UPDATE receivable_payments SET status = 'cancelled' WHERE id = 20`).run()

  db.prepare(`
    UPDATE online_transactions SET status = 'failed', updated_at = ? WHERE id = 12
  `).run(now)
})

txn()

// ---- Report post-state ----
console.log('\n=== Post-state ===')
const post = (sql, ...args) => console.log(db.prepare(sql).all(...args))
post(`SELECT id, account_code, current_balance FROM chart_of_accounts WHERE account_code IN ('1020','1030','1100')`)
post(`SELECT id, paid_amount, remaining_amount, status FROM account_receivables WHERE id = 19`)
post(`SELECT id, amount_paid, payment_status FROM sales WHERE id = 51`)
post(`SELECT id, status FROM receivable_payments WHERE id IN (19, 20)`)
post(`SELECT id, status FROM online_transactions WHERE id IN (11, 12)`)
post(`SELECT id, entry_number, status, reversal_entry_id FROM journal_entries WHERE id = 106`)
post(`SELECT id, entry_number, reference_type, reference_id, status FROM journal_entries WHERE entry_number LIKE 'JE-REV-Y0T8-%' OR entry_number LIKE 'JE-FIN-Y0T8-%'`)

db.close()
console.log('\nDone.')
