# Purchases ↔ Account Payables Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the data-sync bug where a purchase can be marked `paid` while its payable stays `pending`, and add UI affordances (Paid/Remaining columns, partial-pay from Purchases, payment history, AP→PO back-link) so both tabs surface identical numbers.

**Architecture:** `account_payables` is the sub-ledger source of truth; `purchases.paymentStatus` is a derived mirror. All write paths go through a single shared helper inside one transaction — rollback is atomic. Orphan data is healed on-demand during pay-off and in bulk via a new admin reconcile IPC.

**Tech Stack:** Electron + TypeScript, better-sqlite3 + Drizzle ORM, Vitest for tests, React + Tailwind + shadcn/ui for the renderer.

**Spec:** `firearms-pos/docs/superpowers/specs/2026-04-19-purchases-payables-sync-design.md`

---

## File Structure

**New files:**
- `firearms-pos/src/main/utils/payable-payment.ts` — shared `recordPayableSubmission()` helper (extracted from `account-payables-ipc.ts`).
- `firearms-pos/src/main/tests/purchases-payables-sync.test.ts` — TDD coverage for the new behavior.

**Modified files:**
- `firearms-pos/src/main/tests/test-db.ts` — add missing tables (`account_payables`, `payable_payments`, `cash_register_sessions`, `cash_transactions`, `online_transactions`) so tests can actually run.
- `firearms-pos/src/main/ipc/account-payables-ipc.ts` — refactor `payables:record-payment` body to delegate to the new helper.
- `firearms-pos/src/main/ipc/purchases-ipc.ts` — fix `purchases:pay-off` atomicity + orphan heal; add `purchases:record-partial-payment`; add `purchases:reconcile-with-payables`; extend `purchases:get-all` with paid/remaining aggregates.
- `firearms-pos/src/preload/index.ts` — expose the new IPC channels.
- `firearms-pos/src/renderer/screens/purchases/index.tsx` — Paid/Remaining columns, payment history section in detail view, partial-pay mode in Pay-Off dialog.
- `firearms-pos/src/renderer/screens/account-payables/index.tsx` — Source (PO#) column with navigation + Reconcile admin button.

All commits run from the repo root (`/home/safdaralishah/Documents/github/fa_practice`). Tests run via `cd firearms-pos && npx vitest run <path>`.

---

## Task 1: Expand test DB with missing tables

**Files:**
- Modify: `firearms-pos/src/main/tests/test-db.ts`

`test-db.ts` currently has no `account_payables`, `payable_payments`, `cash_register_sessions`, `cash_transactions`, or `online_transactions` tables. The sync tests need them.

- [ ] **Step 1: Add table DDL**

Open `firearms-pos/src/main/tests/test-db.ts`. Inside the `statements` array in `createTables()`, immediately before the `CREATE INDEX` entries (after the `reversal_requests` table), append:

```ts
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
    `CREATE TABLE IF NOT EXISTS online_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL REFERENCES branches(id),
      transaction_date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_channel TEXT NOT NULL,
      direction TEXT NOT NULL,
      reference_number TEXT,
      customer_name TEXT,
      invoice_number TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      source_type TEXT,
      source_id INTEGER,
      payable_id INTEGER REFERENCES account_payables(id),
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
```

- [ ] **Step 2: Verify the test DB still builds**

Run from repo root:

```bash
cd firearms-pos && npx vitest run src/main/tests/firearm-validation.test.ts
```

Expected: existing test suite still passes (no regressions from the schema additions).

- [ ] **Step 3: Commit**

```bash
git add firearms-pos/src/main/tests/test-db.ts
git commit -m "test: add payables/cash/online tables to in-memory test DB"
```

---

## Task 2: Create shared `recordPayableSubmission()` helper

**Files:**
- Create: `firearms-pos/src/main/utils/payable-payment.ts`
- Test: `firearms-pos/src/main/tests/purchases-payables-sync.test.ts`

Extract the transactional payment-recording body currently embedded in `account-payables-ipc.ts:327–482` into a reusable helper so Purchases pay-off / partial-pay can call identical code.

- [ ] **Step 1: Write the failing test file**

Create `firearms-pos/src/main/tests/purchases-payables-sync.test.ts` with this header and the first test:

```ts
/**
 * Purchases ↔ Account Payables sync — atomicity, orphan heal, reconcile.
 * Spec: docs/superpowers/specs/2026-04-19-purchases-payables-sync-design.md
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { setupTestDatabase, teardownTestDatabase, getTestDb, getTestSqlite } from './test-db'

vi.mock('../db/index', () => ({
  getDatabase: () => getTestDb(),
  getRawDatabase: () => getTestSqlite(),
  getDbPath: () => ':memory:',
}))
vi.mock('../utils/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  sanitizeForAudit: (v: unknown) => v,
}))
vi.mock('../utils/gl-posting', () => ({
  postAPPaymentToGL: vi.fn().mockResolvedValue(undefined),
  postPurchaseReceiveToGL: vi.fn().mockResolvedValue(undefined),
  ACCOUNT_CODES: {},
}))
vi.mock('./auth-ipc', () => ({
  getCurrentSession: () => ({ userId: 1, role: 'admin', branchId: 1 }),
}))

import { accountPayables, payablePayments, purchases, branches, suppliers, users } from '../db/schema'
import { recordPayableSubmission } from '../utils/payable-payment'
import { withTransaction } from '../utils/db-transaction'

beforeAll(async () => { await setupTestDatabase() })
afterAll(async () => { await teardownTestDatabase() })

async function seedBasicFixtures() {
  const db = getTestDb()
  await db.insert(users).values({ id: 1, username: 'admin', password: 'x', email: 'a@a', fullName: 'A', role: 'admin' })
  await db.insert(branches).values({ id: 1, name: 'Main', code: 'MAIN' })
  await db.insert(suppliers).values({ id: 1, name: 'Sup', contactPerson: null, phone: null, email: null, address: null })
}

describe('recordPayableSubmission helper', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('records a partial payment: updates AP aggregates and returns newStatus=partial', async () => {
    const db = getTestDb()
    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, branchId: 1, invoiceNumber: 'INV-1',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    }).returning()

    const result = await withTransaction(async ({ db: txDb }) => {
      const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
      return recordPayableSubmission(
        txDb,
        fresh!,
        { payableId: payable.id, amount: 40, paymentMethod: 'bank_transfer' },
        { userId: 1, branchId: 1 },
        null
      )
    })

    expect(result.newPaidAmount).toBe(40)
    expect(result.newRemainingAmount).toBe(60)
    expect(result.newStatus).toBe('partial')

    const reread = await db.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
    expect(reread?.paidAmount).toBe(40)
    expect(reread?.remainingAmount).toBe(60)
    expect(reread?.status).toBe('partial')

    const payments = await db.query.payablePayments.findMany({ where: eq(payablePayments.payableId, payable.id) })
    expect(payments).toHaveLength(1)
    expect(payments[0].amount).toBe(40)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts
```

Expected: FAIL — `Cannot find module '../utils/payable-payment'`.

- [ ] **Step 3: Create the helper**

Create `firearms-pos/src/main/utils/payable-payment.ts` with:

```ts
import { eq } from 'drizzle-orm'
import {
  accountPayables,
  payablePayments,
  purchases,
  expenses,
  cashTransactions,
  onlineTransactions,
  type AccountPayable,
} from '../db/schema'
import { postAPPaymentToGL } from './gl-posting'
import { mapPaymentMethodToChannel } from '../ipc/online-transactions-ipc'

export interface RecordPaymentInput {
  payableId: number
  amount: number
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mobile'
  referenceNumber?: string
  notes?: string
}

export interface SessionContext {
  userId: number
  branchId?: number | null
}

export interface SubmissionResult {
  payment: { id: number; amount: number }
  payable: AccountPayable
  newPaidAmount: number
  newRemainingAmount: number
  newStatus: 'paid' | 'partial'
  purchaseSync: {
    purchaseId: number
    purchaseOrderNumber: string
    oldStatus: string
    newStatus: 'paid' | 'partial'
  } | null
  expenseSync: { expenseId: number; oldStatus: string } | null
}

/**
 * Shared write-path for payable payments. Called from:
 *   - payables:record-payment          (AP tab)
 *   - purchases:record-partial-payment (Purchases tab partial)
 *   - purchases:pay-off                (Purchases tab full)
 *
 * Caller is responsible for its own audit-log entries and cash-session preflight.
 */
// biome-ignore lint/suspicious/noExplicitAny: drizzle tx type is a union we intentionally accept
export async function recordPayableSubmission(
  txDb: any,
  payable: AccountPayable,
  data: RecordPaymentInput,
  session: SessionContext,
  openCashSessionId: number | null
): Promise<SubmissionResult> {
  if (data.amount <= 0) throw new Error('Payment amount must be greater than 0')
  if (payable.status === 'paid') throw new Error('This payable is already fully paid')
  if (payable.status === 'cancelled') throw new Error('Cannot record payment for cancelled payable')
  if (payable.status === 'reversed') throw new Error('Cannot record payment for reversed payable')
  if (data.amount > payable.remainingAmount) {
    throw new Error(`Payment amount cannot exceed remaining balance of ${payable.remainingAmount}`)
  }

  const newPaidAmount = payable.paidAmount + data.amount
  const newRemainingAmount = payable.totalAmount - newPaidAmount
  const newStatus: 'paid' | 'partial' = newRemainingAmount <= 0 ? 'paid' : 'partial'
  const now = new Date().toISOString()

  const [payment] = await txDb
    .insert(payablePayments)
    .values({
      payableId: data.payableId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      paidBy: session.userId,
    })
    .returning()

  await txDb
    .update(accountPayables)
    .set({
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status: newStatus,
      updatedAt: now,
    })
    .where(eq(accountPayables.id, data.payableId))

  let purchaseSync: SubmissionResult['purchaseSync'] = null
  if (payable.purchaseId) {
    const linkedPurchase = await txDb.query.purchases.findFirst({
      where: eq(purchases.id, payable.purchaseId),
    })
    if (linkedPurchase && linkedPurchase.paymentStatus !== newStatus) {
      await txDb
        .update(purchases)
        .set({ paymentStatus: newStatus, updatedAt: now })
        .where(eq(purchases.id, linkedPurchase.id))
      purchaseSync = {
        purchaseId: linkedPurchase.id,
        purchaseOrderNumber: linkedPurchase.purchaseOrderNumber,
        oldStatus: linkedPurchase.paymentStatus,
        newStatus,
      }
    }
  }

  let expenseSync: SubmissionResult['expenseSync'] = null
  if (newStatus === 'paid') {
    const linkedExpense = await txDb.query.expenses.findFirst({
      where: eq(expenses.payableId, payable.id),
    })
    if (linkedExpense && linkedExpense.paymentStatus === 'unpaid') {
      await txDb
        .update(expenses)
        .set({ paymentStatus: 'paid', updatedAt: now })
        .where(eq(expenses.id, linkedExpense.id))
      expenseSync = { expenseId: linkedExpense.id, oldStatus: linkedExpense.paymentStatus }
    }
  }

  await postAPPaymentToGL(
    {
      id: payment.id,
      payableId: data.payableId,
      branchId: payable.branchId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      invoiceNumber: payable.invoiceNumber,
    },
    session.userId
  )

  if (data.paymentMethod !== 'cash') {
    await txDb.insert(onlineTransactions).values({
      branchId: payable.branchId,
      transactionDate: new Date().toISOString().split('T')[0],
      amount: data.amount,
      paymentChannel: mapPaymentMethodToChannel(data.paymentMethod),
      direction: 'outflow',
      referenceNumber: data.referenceNumber,
      invoiceNumber: payable.invoiceNumber,
      status: 'pending',
      sourceType: 'payable_payment',
      sourceId: payment.id,
      payableId: data.payableId,
      createdBy: session.userId,
    })
  }

  if (data.paymentMethod === 'cash' && openCashSessionId !== null) {
    await txDb.insert(cashTransactions).values({
      sessionId: openCashSessionId,
      branchId: payable.branchId,
      transactionType: 'ap_payment',
      amount: -data.amount,
      referenceType: 'payable_payment',
      referenceId: payment.id,
      description: `AP payment: ${payable.invoiceNumber}`,
      recordedBy: session.userId,
    })
  }

  return {
    payment: { id: payment.id, amount: payment.amount },
    payable,
    newPaidAmount,
    newRemainingAmount,
    newStatus,
    purchaseSync,
    expenseSync,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "records a partial payment"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/main/utils/payable-payment.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "refactor: extract shared recordPayableSubmission helper"
```

---

## Task 3: Refactor `payables:record-payment` to use the helper

**Files:**
- Modify: `firearms-pos/src/main/ipc/account-payables-ipc.ts:327-482`

Keep the preflight + audit logging in the handler; delegate the tx body to the helper so AP partial + purchase sync stays exactly as today.

- [ ] **Step 1: Add regression test for AP tab full payment flow**

Append this test to `firearms-pos/src/main/tests/purchases-payables-sync.test.ts`:

```ts
describe('payables:record-payment via shared helper', () => {
  it('full payment marks AP paid and syncs linked purchase.paymentStatus', async () => {
    const db = getTestDb()
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()

    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-TEST-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'ordered',
    }).returning()

    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-TEST-1',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    }).returning()

    const result = await withTransaction(async ({ db: txDb }) => {
      const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
      return recordPayableSubmission(
        txDb, fresh!,
        { payableId: payable.id, amount: 100, paymentMethod: 'bank_transfer' },
        { userId: 1, branchId: 1 }, null
      )
    })

    expect(result.newStatus).toBe('paid')
    expect(result.purchaseSync?.newStatus).toBe('paid')

    const syncedPurchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(syncedPurchase?.paymentStatus).toBe('paid')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "full payment marks AP paid"
```

Expected: This test should actually PASS already because the helper is complete. If it passes, move on. If it fails, fix the helper.

- [ ] **Step 3: Refactor the IPC handler body**

In `firearms-pos/src/main/ipc/account-payables-ipc.ts`, locate the `payables:record-payment` handler (starts near line 277). Replace the transaction body (lines ~327–482, the `const txResult = await withTransaction(async ({ db: txDb }) => { ... })` block) with:

```ts
      const txResult = await withTransaction(async ({ db: txDb }) => {
        const payable = await txDb.query.accountPayables.findFirst({
          where: eq(accountPayables.id, data.payableId),
          with: { supplier: true },
        })
        if (!payable) throw new Error('Payable not found')

        return recordPayableSubmission(
          txDb,
          payable,
          data,
          { userId: session.userId, branchId: payable.branchId },
          openCashSessionId
        )
      })
```

Add the import at the top of the file (after the existing `postAPPaymentToGL` import):

```ts
import { recordPayableSubmission } from '../utils/payable-payment'
```

Remove the now-unused imports that only the deleted body referenced (leave `postAPPaymentToGL` if it is still referenced elsewhere in this file; check with grep first).

- [ ] **Step 4: Run the full sync test file**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/main/ipc/account-payables-ipc.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "refactor: payables:record-payment uses shared helper"
```

---

## Task 4: Fix `purchases:pay-off` atomicity + orphan heal

**Files:**
- Modify: `firearms-pos/src/main/ipc/purchases-ipc.ts:589-662`

Reorder the transaction: find-or-create the AP row first (with a heal notes trail), run the shared helper, then flip `purchases.paymentStatus`.

- [ ] **Step 1: Add the failing orphan-heal test**

Append to `firearms-pos/src/main/tests/purchases-payables-sync.test.ts`:

```ts
describe('purchases:pay-off orphan heal', () => {
  it('creates an AP row when none exists, records payment, flips purchase to paid', async () => {
    const db = getTestDb()
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()

    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-ORPHAN-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 250, taxAmount: 0, shippingCost: 0, totalAmount: 250,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()

    // Sanity: no AP row yet
    const preAP = await db.query.accountPayables.findMany({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(preAP).toHaveLength(0)

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const payOffHandler = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers.get('purchases:pay-off')
    expect(payOffHandler).toBeDefined()
    const result = await payOffHandler!({}, purchase.id, { paymentMethod: 'bank_transfer' })

    expect(result.success).toBe(true)
    const postAP = await db.query.accountPayables.findMany({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(postAP).toHaveLength(1)
    expect(postAP[0].status).toBe('paid')
    expect(postAP[0].totalAmount).toBe(250)
    expect(postAP[0].paidAmount).toBe(250)

    const postPurchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(postPurchase?.paymentStatus).toBe('paid')

    const payments = await db.query.payablePayments.findMany({ where: eq(payablePayments.payableId, postAP[0].id) })
    expect(payments).toHaveLength(1)
    expect(payments[0].amount).toBe(250)
  })
})
```

Then mock `electron` at the top of the test file (before the first `vi.mock` call) to give us a capture-the-handler `ipcMain`:

```ts
vi.mock('electron', () => {
  const handlers = new Map<string, Function>()
  return {
    ipcMain: {
      handle: (ch: string, fn: Function) => handlers.set(ch, fn),
      _invokeHandlers: handlers,
    },
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "creates an AP row when none exists"
```

Expected: FAIL — post-AP length is 0 (current code exits silently on missing payable).

- [ ] **Step 3: Rewrite the pay-off transaction body**

In `firearms-pos/src/main/ipc/purchases-ipc.ts`, locate the `purchases:pay-off` handler. Replace the `const paidAmount = await withTransaction(async ({ db: txDb }) => { ... })` block (roughly lines 589–662) with:

```ts
        const { paidAmount, healed } = await withTransaction(async ({ db: txDb }) => {
          let payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.purchaseId, purchaseId),
          })

          let healed = false
          if (!payable) {
            const [created] = await txDb
              .insert(accountPayables)
              .values({
                supplierId: purchase.supplierId,
                purchaseId: purchase.id,
                branchId: purchase.branchId,
                invoiceNumber: purchase.purchaseOrderNumber,
                totalAmount: purchase.totalAmount,
                paidAmount: 0,
                remainingAmount: purchase.totalAmount,
                status: 'pending',
                notes: `Auto-healed during pay-off (orphan payable) for ${purchase.purchaseOrderNumber}`,
                createdBy: session?.userId,
              })
              .returning()
            payable = created
            healed = true
          }

          if (payable.remainingAmount <= 0) {
            throw new Error('Payable has no outstanding amount')
          }

          const amount = payable.remainingAmount
          const submission = await recordPayableSubmission(
            txDb,
            payable,
            {
              payableId: payable.id,
              amount,
              paymentMethod: paymentData.paymentMethod,
              referenceNumber: paymentData.referenceNumber,
              notes: paymentData.notes || `Payment for Purchase: ${purchase.purchaseOrderNumber}`,
            },
            { userId: session?.userId ?? 0, branchId: purchase.branchId },
            openCashSessionId
          )

          // Flip the purchase LAST so any earlier failure rolls everything back.
          // The shared helper already syncs paymentStatus if it was 'pending'
          // or 'partial'; setting here is idempotent.
          await txDb
            .update(purchases)
            .set({ paymentStatus: 'paid', updatedAt: new Date().toISOString() })
            .where(eq(purchases.id, purchaseId))

          return { paidAmount: submission.payment.amount, healed }
        })
```

Add imports at the top of the file (next to the existing imports):

```ts
import { recordPayableSubmission } from '../utils/payable-payment'
```

Below the existing audit-log call at the end of the handler, add an orphan-heal audit entry:

```ts
        if (healed) {
          await createAuditLog({
            userId: session?.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'account_payable',
            entityId: 0,
            description: `Healed orphan payable for purchase ${purchase.purchaseOrderNumber} during pay-off (${paidAmount.toFixed(2)})`,
          })
        }
```

- [ ] **Step 4: Run the orphan-heal test**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "creates an AP row when none exists"
```

Expected: PASS.

- [ ] **Step 5: Re-run the whole test file to ensure no regressions**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add firearms-pos/src/main/ipc/purchases-ipc.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "fix(purchases): heal orphan payable during pay-off, flip status last"
```

---

## Task 5: Add `purchases:record-partial-payment` IPC

**Files:**
- Modify: `firearms-pos/src/main/ipc/purchases-ipc.ts` (add new handler)
- Modify: `firearms-pos/src/preload/index.ts:156-172` (expose it)

- [ ] **Step 1: Add the failing partial-pay test**

Append to `firearms-pos/src/main/tests/purchases-payables-sync.test.ts`:

```ts
describe('purchases:record-partial-payment', () => {
  it('records a partial, sets AP and purchase to partial, leaves remainder', async () => {
    const db = getTestDb()
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()

    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-PARTIAL-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 200, taxAmount: 0, shippingCost: 0, totalAmount: 200,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-PARTIAL-1',
      totalAmount: 200, paidAmount: 0, remainingAmount: 200, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const handler = handlers.get('purchases:record-partial-payment')
    expect(handler).toBeDefined()

    const result = await handler!({}, purchase.id, { amount: 75, paymentMethod: 'bank_transfer' })
    expect(result.success).toBe(true)

    const ap = await db.query.accountPayables.findFirst({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(ap?.status).toBe('partial')
    expect(ap?.paidAmount).toBe(75)
    expect(ap?.remainingAmount).toBe(125)

    const po = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(po?.paymentStatus).toBe('partial')
  })

  it('rejects when amount exceeds remaining', async () => {
    const { ipcMain } = await import('electron')
    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const handler = handlers.get('purchases:record-partial-payment')
    const result = await handler!({}, 1, { amount: 9_999_999, paymentMethod: 'bank_transfer' })
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/cannot exceed remaining/i)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "record-partial-payment"
```

Expected: FAIL — handler undefined.

- [ ] **Step 3: Add the handler**

In `firearms-pos/src/main/ipc/purchases-ipc.ts`, add this handler below the `purchases:pay-off` handler (before `purchases:check-reversible`):

```ts
  ipcMain.handle(
    'purchases:record-partial-payment',
    async (
      _,
      purchaseId: number,
      paymentData: {
        amount: number
        paymentMethod: 'cash' | 'cheque' | 'bank_transfer'
        referenceNumber?: string
        notes?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        if (!Number.isFinite(paymentData.amount) || paymentData.amount <= 0) {
          return { success: false, message: 'Payment amount must be greater than 0' }
        }
        if (!['cash', 'cheque', 'bank_transfer'].includes(paymentData.paymentMethod)) {
          return { success: false, message: 'Invalid payment method' }
        }

        const purchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchaseId) })
        if (!purchase) return { success: false, message: 'Purchase order not found' }
        if (purchase.paymentStatus === 'paid') {
          return { success: false, message: 'Purchase is already paid' }
        }

        let openCashSessionId: number | null = null
        if (paymentData.paymentMethod === 'cash') {
          const today = new Date().toISOString().split('T')[0]
          const openSession = await db.query.cashRegisterSessions.findFirst({
            where: and(
              eq(cashRegisterSessions.branchId, purchase.branchId),
              eq(cashRegisterSessions.sessionDate, today),
              eq(cashRegisterSessions.status, 'open')
            ),
          })
          if (!openSession) {
            return {
              success: false,
              message: 'No open cash register session for this branch. Open a session before paying in cash.',
            }
          }
          openCashSessionId = openSession.id
        }

        const result = await withTransaction(async ({ db: txDb }) => {
          let payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.purchaseId, purchaseId),
          })
          let healed = false
          if (!payable) {
            const [created] = await txDb
              .insert(accountPayables)
              .values({
                supplierId: purchase.supplierId,
                purchaseId: purchase.id,
                branchId: purchase.branchId,
                invoiceNumber: purchase.purchaseOrderNumber,
                totalAmount: purchase.totalAmount,
                paidAmount: 0,
                remainingAmount: purchase.totalAmount,
                status: 'pending',
                notes: `Auto-healed during partial payment (orphan payable) for ${purchase.purchaseOrderNumber}`,
                createdBy: session?.userId,
              })
              .returning()
            payable = created
            healed = true
          }

          const submission = await recordPayableSubmission(
            txDb,
            payable,
            {
              payableId: payable.id,
              amount: paymentData.amount,
              paymentMethod: paymentData.paymentMethod,
              referenceNumber: paymentData.referenceNumber,
              notes: paymentData.notes || `Partial payment for Purchase: ${purchase.purchaseOrderNumber}`,
            },
            { userId: session?.userId ?? 0, branchId: purchase.branchId },
            openCashSessionId
          )

          return { submission, healed }
        })

        if (result.healed) {
          await createAuditLog({
            userId: session?.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'account_payable',
            entityId: 0,
            description: `Healed orphan payable for purchase ${purchase.purchaseOrderNumber} during partial payment`,
          })
        }

        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: 'payment',
          entityType: 'purchase',
          entityId: purchaseId,
          newValues: {
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            newStatus: result.submission.newStatus,
          },
          description: `Recorded partial payment of ${paymentData.amount} on ${purchase.purchaseOrderNumber}`,
        })

        return { success: true, message: 'Partial payment recorded' }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to record partial payment'
        return { success: false, message }
      }
    }
  )
```

- [ ] **Step 4: Expose in preload**

In `firearms-pos/src/preload/index.ts` inside the `purchases` object (around line 156), add after the `payOff` entry:

```ts
    recordPartialPayment: (
      purchaseId: number,
      paymentData: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string }
    ) => ipcRenderer.invoke('purchases:record-partial-payment', purchaseId, paymentData),
```

- [ ] **Step 5: Run the partial-pay tests**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "record-partial-payment"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add firearms-pos/src/main/ipc/purchases-ipc.ts firearms-pos/src/preload/index.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "feat(purchases): add record-partial-payment IPC"
```

---

## Task 6: Add `purchases:reconcile-with-payables` admin IPC

**Files:**
- Modify: `firearms-pos/src/main/ipc/purchases-ipc.ts` (add handler)
- Modify: `firearms-pos/src/preload/index.ts` (expose)

- [ ] **Step 1: Add reconcile tests**

Append to `firearms-pos/src/main/tests/purchases-payables-sync.test.ts`:

```ts
describe('purchases:reconcile-with-payables', () => {
  it('creates missing AP rows for pay_later POs and flips paymentStatus to match AP', async () => {
    const db = getTestDb()
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()

    // Case A: pay_later PO missing AP
    const [poMissing] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-A', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'ordered',
    }).returning()

    // Case B: AP.status=partial but purchase.paymentStatus=pending
    const [poDrift] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-B', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 200, taxAmount: 0, shippingCost: 0, totalAmount: 200,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: poDrift.id, branchId: 1, invoiceNumber: 'PO-RECON-B',
      totalAmount: 200, paidAmount: 50, remainingAmount: 150, status: 'partial', createdBy: 1,
    })

    // Case C: purchase.paymentStatus=paid but AP still has remaining (flagged)
    const [poFlagged] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-C', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 300, taxAmount: 0, shippingCost: 0, totalAmount: 300,
      paymentMethod: 'pay_later', paymentStatus: 'paid', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: poFlagged.id, branchId: 1, invoiceNumber: 'PO-RECON-C',
      totalAmount: 300, paidAmount: 0, remainingAmount: 300, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:reconcile-with-payables')!({})

    expect(result.success).toBe(true)
    expect(result.created.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-A')
    expect(result.synced.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-B')
    expect(result.flagged.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-C')

    const createdAP = await db.query.accountPayables.findFirst({ where: eq(accountPayables.purchaseId, poMissing.id) })
    expect(createdAP).toBeDefined()
    expect(createdAP?.status).toBe('pending')

    const syncedPO = await db.query.purchases.findFirst({ where: eq(purchases.id, poDrift.id) })
    expect(syncedPO?.paymentStatus).toBe('partial')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "reconcile-with-payables"
```

Expected: FAIL — handler undefined.

- [ ] **Step 3: Add the handler**

In `firearms-pos/src/main/ipc/purchases-ipc.ts`, add below `purchases:record-partial-payment`:

```ts
  ipcMain.handle('purchases:reconcile-with-payables', async () => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Unauthorized' }
      if (session.role !== 'admin') return { success: false, message: 'Admin access required' }

      const created: Array<{ purchaseId: number; purchaseOrderNumber: string }> = []
      const synced: Array<{ purchaseId: number; purchaseOrderNumber: string; oldStatus: string; newStatus: string }> = []
      const flagged: Array<{ purchaseId: number; purchaseOrderNumber: string; remaining: number }> = []

      const allPurchases = await db.query.purchases.findMany()
      for (const purchase of allPurchases) {
        if (purchase.status === 'cancelled' || purchase.status === 'reversed') continue

        const payable = await db.query.accountPayables.findFirst({
          where: eq(accountPayables.purchaseId, purchase.id),
        })

        if (!payable) {
          if (purchase.paymentMethod === 'pay_later' && purchase.paymentStatus !== 'paid') {
            await db.insert(accountPayables).values({
              supplierId: purchase.supplierId,
              purchaseId: purchase.id,
              branchId: purchase.branchId,
              invoiceNumber: purchase.purchaseOrderNumber,
              totalAmount: purchase.totalAmount,
              paidAmount: 0,
              remainingAmount: purchase.totalAmount,
              status: 'pending',
              notes: `Auto-created by reconcile for ${purchase.purchaseOrderNumber}`,
              createdBy: session.userId,
            })
            created.push({ purchaseId: purchase.id, purchaseOrderNumber: purchase.purchaseOrderNumber })
            await createAuditLog({
              userId: session.userId,
              branchId: purchase.branchId,
              action: 'update',
              entityType: 'account_payable',
              entityId: 0,
              description: `Reconciled payable for purchase ${purchase.purchaseOrderNumber}: created missing AP row`,
            })
          }
          continue
        }

        const apStatus: 'pending' | 'partial' | 'paid' =
          payable.status === 'paid' || payable.status === 'partial' || payable.status === 'pending'
            ? payable.status
            : 'pending'

        if (purchase.paymentStatus === 'paid' && payable.remainingAmount > 0) {
          flagged.push({
            purchaseId: purchase.id,
            purchaseOrderNumber: purchase.purchaseOrderNumber,
            remaining: payable.remainingAmount,
          })
          await createAuditLog({
            userId: session.userId,
            branchId: purchase.branchId,
            action: 'flag',
            entityType: 'purchase',
            entityId: purchase.id,
            description: `Flagged purchase ${purchase.purchaseOrderNumber} for manual review: paid in Purchases but AP has remaining ${payable.remainingAmount.toFixed(2)}`,
          })
          continue
        }

        if (purchase.paymentStatus !== apStatus) {
          await db
            .update(purchases)
            .set({ paymentStatus: apStatus, updatedAt: new Date().toISOString() })
            .where(eq(purchases.id, purchase.id))
          synced.push({
            purchaseId: purchase.id,
            purchaseOrderNumber: purchase.purchaseOrderNumber,
            oldStatus: purchase.paymentStatus,
            newStatus: apStatus,
          })
          await createAuditLog({
            userId: session.userId,
            branchId: purchase.branchId,
            action: 'update',
            entityType: 'purchase',
            entityId: purchase.id,
            oldValues: { paymentStatus: purchase.paymentStatus },
            newValues: { paymentStatus: apStatus },
            description: `Reconciled purchase ${purchase.purchaseOrderNumber}: synced paymentStatus ${purchase.paymentStatus} → ${apStatus}`,
          })
        }
      }

      return { success: true, created, synced, flagged }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reconcile'
      return { success: false, message }
    }
  })
```

- [ ] **Step 4: Expose in preload**

In `firearms-pos/src/preload/index.ts`, inside `purchases`, add after `recordPartialPayment`:

```ts
    reconcileWithPayables: () => ipcRenderer.invoke('purchases:reconcile-with-payables'),
```

- [ ] **Step 5: Run reconcile test**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "reconcile-with-payables"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add firearms-pos/src/main/ipc/purchases-ipc.ts firearms-pos/src/preload/index.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "feat(purchases): admin reconcile-with-payables IPC"
```

---

## Task 7: Extend `purchases:get-all` with paid/remaining

**Files:**
- Modify: `firearms-pos/src/main/ipc/purchases-ipc.ts:186-226`

Left-join AP aggregates so the Purchases table can show them without a second round-trip.

- [ ] **Step 1: Add test for returned shape**

Append to the sync test file:

```ts
describe('purchases:get-all aggregates', () => {
  it('returns paidAmount and remainingAmount columns from linked AP', async () => {
    const db = getTestDb()
    const sqlite = getTestSqlite()
    for (const t of ['payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()

    const [p1] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-AGG-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 400, taxAmount: 0, shippingCost: 0, totalAmount: 400,
      paymentMethod: 'pay_later', paymentStatus: 'partial', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: p1.id, branchId: 1, invoiceNumber: 'PO-AGG-1',
      totalAmount: 400, paidAmount: 150, remainingAmount: 250, status: 'partial', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:get-all')!({}, { limit: 10 })

    expect(result.success).toBe(true)
    const row = result.data.find((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber === 'PO-AGG-1')
    expect(row.paidAmount).toBe(150)
    expect(row.remainingAmount).toBe(250)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "get-all aggregates"
```

Expected: FAIL — `paidAmount` undefined.

- [ ] **Step 3: Update the `purchases:get-all` handler**

In `firearms-pos/src/main/ipc/purchases-ipc.ts`, replace the `const data = await db.query.purchases.findMany(...)` block and the `const result: PaginatedResult<typeof data[0]> = { data, ... }` block with:

```ts
        const rawRows = await db.query.purchases.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(purchases.createdAt) : purchases.createdAt,
        })

        const purchaseIds = rawRows.map((r) => r.id)
        const apRows = purchaseIds.length
          ? await db.query.accountPayables.findMany({
              where: sql`${accountPayables.purchaseId} IN (${sql.join(purchaseIds.map((id) => sql`${id}`), sql`, `)})`,
            })
          : []
        const apByPurchase = new Map<number, typeof apRows[number]>()
        for (const ap of apRows) if (ap.purchaseId) apByPurchase.set(ap.purchaseId, ap)

        const data = rawRows.map((r) => {
          const ap = apByPurchase.get(r.id)
          const paidAmount = ap ? ap.paidAmount : r.paymentStatus === 'paid' ? r.totalAmount : 0
          const remainingAmount = ap ? ap.remainingAmount : r.totalAmount - paidAmount
          return { ...r, paidAmount, remainingAmount }
        })

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
```

- [ ] **Step 4: Run test**

```bash
cd firearms-pos && npx vitest run src/main/tests/purchases-payables-sync.test.ts -t "get-all aggregates"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/main/ipc/purchases-ipc.ts firearms-pos/src/main/tests/purchases-payables-sync.test.ts
git commit -m "feat(purchases): include paid/remaining aggregates in get-all"
```

---

## Task 8: Add Paid / Remaining columns to the Purchases table

**Files:**
- Modify: `firearms-pos/src/renderer/screens/purchases/index.tsx`

- [ ] **Step 1: Extend the row type**

Find the interface that defines the Purchase row shape for the table (around line 73 — the `Purchase` interface). Add:

```ts
  paidAmount: number
  remainingAmount: number
```

- [ ] **Step 2: Add table header cells**

Locate the `<TableHeader>` block (around line 895–908). Insert two new `<TableHead>` cells between the "Total" header and the "Payment" header:

```tsx
                  <TableHead className="w-[90px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Paid
                  </TableHead>
                  <TableHead className="w-[90px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Remaining
                  </TableHead>
```

- [ ] **Step 3: Add table body cells**

Locate the `<TableBody>` row rendering (around line 911–1025). Insert two new `<TableCell>`s between the Total cell (ends ~line 941) and the Payment cell (starts ~line 942):

```tsx
                    <TableCell className="py-1.5 text-right text-sm tabular-nums text-green-600">
                      {formatCurrency(purchase.paidAmount ?? 0)}
                    </TableCell>
                    <TableCell
                      className={`py-1.5 text-right text-sm tabular-nums font-medium ${
                        (purchase.remainingAmount ?? 0) > 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}
                    >
                      {formatCurrency(purchase.remainingAmount ?? 0)}
                    </TableCell>
```

- [ ] **Step 4: Run the renderer build (typecheck)**

```bash
cd firearms-pos && npx tsc -p tsconfig.web.json --noEmit
```

Expected: no errors referencing `paidAmount`/`remainingAmount`.

- [ ] **Step 5: Manual smoke test**

```bash
cd firearms-pos && npm run dev
```

Then in the running app: open Purchases tab → verify the new Paid / Remaining columns render, partial-paid POs show accurate numbers.

- [ ] **Step 6: Commit**

```bash
git add firearms-pos/src/renderer/screens/purchases/index.tsx
git commit -m "feat(ui): add Paid/Remaining columns to Purchases table"
```

---

## Task 9: Payment history section in Purchases detail view

**Files:**
- Modify: `firearms-pos/src/renderer/screens/purchases/index.tsx`

- [ ] **Step 1: Load payment history when opening the detail dialog**

Find `handleViewPurchase` (around line 479, where it does `window.api.purchases.getById`). Add a second call in parallel to load AP + payments. After the existing `getById` call, add:

```tsx
      let paymentHistory: Array<{
        id: number
        amount: number
        paymentMethod: string
        referenceNumber: string | null
        notes: string | null
        paymentDate: string
      }> = []
      try {
        const payablesRes = await window.api.payables.getAll({ limit: 1, purchaseId: purchase.id } as Record<string, unknown>)
        const linkedPayable = (payablesRes?.data ?? []).find(
          (p: { purchaseId: number | null }) => p.purchaseId === purchase.id
        )
        if (linkedPayable) {
          const paymentsRes = await window.api.payables.getPayments(linkedPayable.id)
          if (paymentsRes?.success) paymentHistory = paymentsRes.data ?? []
        }
      } catch {
        paymentHistory = []
      }
      setViewingPurchase({ ...(result.data as object), paymentHistory } as typeof viewingPurchase)
```

(Adjust the existing `setViewingPurchase(result.data)` call to the new merged object.)

- [ ] **Step 2: Extend the viewing state type**

Wherever `viewingPurchase` state is declared, add an optional `paymentHistory` field to the type. Search for `setViewingPurchase` / `viewingPurchase` in the file (around line 1348 where detail view renders) and update the type.

- [ ] **Step 3: Render the history section**

In the detail dialog (after the items section, around the `{viewingPurchase && viewingPurchase.paymentStatus === 'pending'` block at line 1445), insert:

```tsx
              {viewingPurchase?.paymentHistory && viewingPurchase.paymentHistory.length > 0 && (
                <div className="mt-4 rounded-md border bg-card">
                  <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment History
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPurchase.paymentHistory.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{formatDateTime(p.paymentDate)}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {formatCurrency(p.amount)}
                          </TableCell>
                          <TableCell className="text-xs capitalize">
                            {p.paymentMethod.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-xs">{p.referenceNumber ?? '—'}</TableCell>
                          <TableCell className="text-xs">{p.notes ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
```

- [ ] **Step 4: Smoke test**

Run `npm run dev`, open a PO that has an AP payment → verify the "Payment History" table renders with correct rows. Open a fresh pay_later PO with no payments → verify no history section appears.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/renderer/screens/purchases/index.tsx
git commit -m "feat(ui): payment history section in Purchases detail view"
```

---

## Task 10: Partial-payment mode in the Pay-Off dialog

**Files:**
- Modify: `firearms-pos/src/renderer/screens/purchases/index.tsx`

Search for the existing Pay-Off dialog (look for `This will mark the purchase as paid and update the associated payable record.` at line 1601 — that is the confirm dialog body).

- [ ] **Step 1: Add mode + amount state**

Near the existing `payOffDialog` / `payOffTarget` state declarations, add:

```tsx
  const [payMode, setPayMode] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState<string>('')
```

Reset them whenever the dialog opens — inside `handleOpenPayOffDialog` add:

```tsx
    setPayMode('full')
    setPartialAmount('')
```

- [ ] **Step 2: Render the mode toggle + conditional amount field**

In the Pay-Off dialog JSX, replace the confirm-only body (around the line reading `This will mark the purchase as paid...`) with:

```tsx
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={payMode === 'full' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMode('full')}
                    >
                      Pay in Full
                    </Button>
                    <Button
                      type="button"
                      variant={payMode === 'partial' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMode('partial')}
                    >
                      Partial Payment
                    </Button>
                  </div>

                  {payMode === 'partial' ? (
                    <div>
                      <Label htmlFor="partial-amount" className="text-xs">
                        Amount (max {formatCurrency(payOffTarget?.remainingAmount ?? payOffTarget?.totalAmount ?? 0)})
                      </Label>
                      <Input
                        id="partial-amount"
                        type="number"
                        min={0}
                        step="0.01"
                        max={payOffTarget?.remainingAmount ?? payOffTarget?.totalAmount}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This will mark the purchase as paid and update the associated payable record.
                    </p>
                  )}
                </div>
```

- [ ] **Step 3: Wire the submit handler**

Find the existing submit that calls `window.api.purchases.payOff(...)`. Replace with:

```tsx
      if (payMode === 'partial') {
        const amt = Number.parseFloat(partialAmount)
        const max = payOffTarget?.remainingAmount ?? payOffTarget?.totalAmount ?? 0
        if (!Number.isFinite(amt) || amt <= 0) {
          alert('Enter a valid amount greater than 0')
          return
        }
        if (amt > max) {
          alert(`Amount cannot exceed ${formatCurrency(max)}`)
          return
        }
        const result = await window.api.purchases.recordPartialPayment(payOffTarget!.id, {
          amount: amt,
          paymentMethod: payOffMethod,
          referenceNumber: payOffRef || undefined,
        })
        if (!result.success) {
          alert(result.message)
          return
        }
      } else {
        const result = await window.api.purchases.payOff(payOffTarget!.id, {
          paymentMethod: payOffMethod,
          referenceNumber: payOffRef || undefined,
        })
        if (!result.success) {
          alert(result.message)
          return
        }
      }
```

(Names like `payOffMethod` / `payOffRef` already exist in this file — preserve whatever the existing dialog uses.)

- [ ] **Step 4: Smoke test**

Run `npm run dev`. Open a pay_later PO with outstanding balance. In the Pay-Off dialog, switch to Partial, enter half the total, submit. Verify:
- Purchases table shows partial status with the correct Paid/Remaining amounts.
- AP tab row shows same values.
- Payment history in detail view shows the partial payment.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/renderer/screens/purchases/index.tsx
git commit -m "feat(ui): partial-payment mode in Purchases Pay-Off dialog"
```

---

## Task 11: Source (PO#) column in AP table + back-navigation

**Files:**
- Modify: `firearms-pos/src/renderer/screens/account-payables/index.tsx`
- Modify: `firearms-pos/src/renderer/screens/purchases/index.tsx` (read `?focus=` query param)

- [ ] **Step 1: Extend AP row fetch to include PO#**

Find the `payables:get-all` handler in `account-payables-ipc.ts` and confirm it already returns `purchaseId`. If it doesn't join `purchases` to return `purchaseOrderNumber`, do a client-side lookup: in the AP renderer (`account-payables/index.tsx` around line 173, inside `loadPayables`), after the existing fetch, fetch PO numbers for any rows with a `purchaseId`:

```tsx
      const withPoNumbers = await Promise.all(
        (result.data as Array<{ id: number; purchaseId: number | null }>).map(async (row) => {
          if (!row.purchaseId) return { ...row, purchaseOrderNumber: null }
          const poRes = await window.api.purchases.getById(row.purchaseId)
          return {
            ...row,
            purchaseOrderNumber: poRes?.success ? poRes.data.purchaseOrderNumber : null,
          }
        })
      )
      setPayables(withPoNumbers as typeof payables)
```

Also extend the local `Payable` row interface (around line 75 in the AP screen) to include `purchaseOrderNumber?: string | null`.

- [ ] **Step 2: Add the Source column**

In the `<TableHeader>` (line 373 area), insert a `<TableHead>` before the "Actions" column:

```tsx
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Source</TableHead>
```

In the `<TableBody>` row rendering (line 387 area), insert a matching `<TableCell>` before the Actions cell:

```tsx
                        <TableCell className="py-1.5 text-xs">
                          {payable.purchaseOrderNumber ? (
                            <Button
                              variant="link"
                              className="h-auto p-0 font-mono text-xs"
                              onClick={() => navigate(`/purchases?focus=${payable.purchaseId}`)}
                            >
                              {payable.purchaseOrderNumber}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
```

Import `useNavigate` (from `react-router-dom` — same router already used elsewhere) at the top of the file if not imported, and declare `const navigate = useNavigate()` in the component.

- [ ] **Step 3: Honor `?focus=` on Purchases page**

In `firearms-pos/src/renderer/screens/purchases/index.tsx`, at the top of the component, add:

```tsx
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('focus') ? Number(searchParams.get('focus')) : null
```

Import `useSearchParams` from `react-router-dom`. After the list loads, add:

```tsx
  useEffect(() => {
    if (!focusId) return
    const match = purchases.find((p) => p.id === focusId)
    if (match) handleViewPurchase(match)
  }, [focusId, purchases])
```

- [ ] **Step 4: Smoke test**

Run `npm run dev`. In the AP tab, click a PO# link in the Source column → Purchases screen opens with that PO's detail dialog visible.

- [ ] **Step 5: Commit**

```bash
git add firearms-pos/src/renderer/screens/account-payables/index.tsx firearms-pos/src/renderer/screens/purchases/index.tsx
git commit -m "feat(ui): AP table Source column + focus deep-link to Purchases"
```

---

## Task 12: Admin Reconcile button + run the one-time repair

**Files:**
- Modify: `firearms-pos/src/renderer/screens/account-payables/index.tsx`

- [ ] **Step 1: Add a Reconcile admin button**

Near the top-right action buttons of the AP screen (find the existing header/toolbar area with DPO or "Create Payable" button), add (admin-only):

```tsx
              {currentUser?.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await window.api.purchases.reconcileWithPayables()
                    if (!result.success) {
                      alert(result.message)
                      return
                    }
                    alert(
                      `Reconcile complete.\nCreated: ${result.created.length}\nSynced: ${result.synced.length}\nFlagged for review: ${result.flagged.length}`
                    )
                    await loadPayables()
                  }}
                >
                  Reconcile with Purchases
                </Button>
              )}
```

Use whatever existing admin/role check pattern the screen already has (search for `role === 'admin'` in this file).

- [ ] **Step 2: Smoke test against the real repro**

Run `npm run dev`, switch to AP tab, click "Reconcile with Purchases". Expected: PO-20260408-J7QH appears in the "Flagged for review" count. Open the PO's detail view and take the manual action (either record the real payment if it was paid out of the app, or use the existing reversal flow if the paid flag was set in error).

- [ ] **Step 3: Commit**

```bash
git add firearms-pos/src/renderer/screens/account-payables/index.tsx
git commit -m "feat(ui): admin Reconcile button in AP tab"
```

---

## Task 13: Final regression pass

- [ ] **Step 1: Run the full test suite**

```bash
cd firearms-pos && npm test
```

Expected: all vitest suites PASS. (The `npm test` script also runs `electron-rebuild` — that's OK; it targets better-sqlite3.)

- [ ] **Step 2: Run the renderer typecheck + lint**

```bash
cd firearms-pos && npx tsc -p tsconfig.web.json --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: End-to-end manual walkthrough**

Run `npm run dev` and exercise:

1. Create a new pay_later PO — AP row appears, Purchases table shows Paid=0 / Remaining=total.
2. Record partial (40%) from AP tab — Purchases table updates to partial with correct numbers.
3. Record remaining (60%) from Purchases Pay-Off dialog (Partial mode) — AP row goes to paid, Purchases goes to paid, payment history shows both entries.
4. Click the PO# link in AP Source column — Purchases detail opens for that PO.
5. As admin, hit Reconcile — the known-bad PO appears in Flagged.

- [ ] **Step 4: Final commit or PR**

If there are any trailing cleanup edits, stage them now. Otherwise this task has no commit.

---

## Spec Coverage Check

- Spec §Problem (orphan pay-off bug) → Task 4.
- Spec §Architecture (single source of truth, shared helper) → Tasks 2, 3, 4, 5.
- Spec §Components B1 → Task 4. B2 → Task 5. B3 → Task 2, 3. B4 → Task 6.
- Spec §Components F1 → Tasks 7, 8. F2 → Task 9. F3 → Task 10. F4 → Task 11.
- Spec §Data Flow → exercised end-to-end in Task 13.
- Spec §Error Handling (atomic rollback, cash session preflight, reject-on-over-remaining) → Tasks 2, 4, 5 (tests + handlers).
- Spec §Audit Trail (healed-orphan, reconcile descriptions) → Tasks 4, 5, 6.
- Spec §Testing — all listed test cases mapped to specific steps above.
- Spec §Migration / Backfill (Reconcile IPC is the backfill) → Tasks 6, 12.
- Spec §Out of Scope items (Sales↔AR, Expenses↔AP schema change, bulk pay, splitting) — intentionally not tasked; deferred to Phase 2 / Phase 3 specs.
