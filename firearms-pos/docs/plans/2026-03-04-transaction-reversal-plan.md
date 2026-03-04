# Transaction Reversal System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a centralized reversal request/approval system where users request reversals and admins approve them, triggering atomic reversal of all affected records (inventory, GL, AR/AP, commissions).

**Architecture:** New `reversal_requests` table with status workflow (pending → approved → completed/failed/rejected). Each entity type has a dedicated reversal executor function. All reversals are atomic via `withTransaction`. Existing sale void logic is refactored into this system.

**Tech Stack:** Drizzle ORM (SQLite), Electron IPC, React + shadcn/ui, existing `withTransaction` and `gl-posting` utilities.

**Design Doc:** `docs/plans/2026-03-04-transaction-reversal-design.md`

---

### Task 1: Create reversal_requests schema

**Files:**
- Create: `src/main/db/schemas/reversal-requests.ts`
- Modify: `src/main/db/schema.ts` (add export)

**Step 1: Create the schema file**

Create `src/main/db/schemas/reversal-requests.ts`:

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { branches } from './branches'

export const reversalRequests = sqliteTable(
  'reversal_requests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    requestNumber: text('request_number').notNull().unique(), // REV-YYYY-NNNN
    entityType: text('entity_type', {
      enum: [
        'sale',
        'purchase',
        'expense',
        'journal_entry',
        'ar_payment',
        'ap_payment',
        'stock_adjustment',
        'stock_transfer',
        'commission',
        'return',
        'receivable',
        'payable',
      ],
    }).notNull(),
    entityId: integer('entity_id').notNull(),
    reason: text('reason').notNull(),
    priority: text('priority', {
      enum: ['low', 'medium', 'high', 'urgent'],
    })
      .notNull()
      .default('medium'),
    status: text('status', {
      enum: ['pending', 'approved', 'rejected', 'completed', 'failed'],
    })
      .notNull()
      .default('pending'),
    requestedBy: integer('requested_by')
      .notNull()
      .references(() => users.id),
    reviewedBy: integer('reviewed_by').references(() => users.id),
    reviewedAt: text('reviewed_at'),
    rejectionReason: text('rejection_reason'),
    reversalDetails: text('reversal_details', { mode: 'json' }).$type<Record<string, unknown>>(),
    errorDetails: text('error_details'),
    branchId: integer('branch_id')
      .notNull()
      .references(() => branches.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    statusIdx: index('rr_status_idx').on(table.status),
    entityIdx: index('rr_entity_idx').on(table.entityType, table.entityId),
    branchIdx: index('rr_branch_idx').on(table.branchId),
    priorityIdx: index('rr_priority_idx').on(table.priority),
  })
)

export const reversalRequestsRelations = relations(reversalRequests, ({ one }) => ({
  requestedByUser: one(users, {
    fields: [reversalRequests.requestedBy],
    references: [users.id],
    relationName: 'requestedBy',
  }),
  reviewedByUser: one(users, {
    fields: [reversalRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewedBy',
  }),
  branch: one(branches, {
    fields: [reversalRequests.branchId],
    references: [branches.id],
  }),
}))

export type ReversalRequest = typeof reversalRequests.$inferSelect
export type NewReversalRequest = typeof reversalRequests.$inferInsert
```

**Step 2: Add export to schema index**

In `src/main/db/schema.ts`, add at the end:

```typescript
export * from './schemas/reversal-requests'
```

**Step 3: Commit**

```bash
git add src/main/db/schemas/reversal-requests.ts src/main/db/schema.ts
git commit -m "feat: add reversal_requests schema table"
```

---

### Task 2: Modify expenses schema and audit_logs enum

**Files:**
- Modify: `src/main/db/schemas/expenses.ts` (add isVoided, voidReason)
- Modify: `src/main/db/schemas/audit-logs.ts` (expand enums)

**Step 1: Add void fields to expenses schema**

In `src/main/db/schemas/expenses.ts`, add these fields after the `paymentTerms` field (before `createdAt`):

```typescript
    isVoided: integer('is_voided', { mode: 'boolean' }).notNull().default(false),
    voidReason: text('void_reason'),
```

**Step 2: Expand audit_logs action enum**

In `src/main/db/schemas/audit-logs.ts`, add to the `action` enum array:

```typescript
      'reversal_request',
      'reversal_review',
      'reversal_executed',
      'reversal_failed',
```

**Step 3: Expand audit_logs entityType enum**

In `src/main/db/schemas/audit-logs.ts`, add to the `entityType` enum array:

```typescript
      'reversal_request',
```

**Step 4: Commit**

```bash
git add src/main/db/schemas/expenses.ts src/main/db/schemas/audit-logs.ts
git commit -m "feat: add void fields to expenses, expand audit log enums for reversals"
```

---

### Task 3: Create migration for new table and schema changes

**Files:**
- Modify: `src/main/db/migrations.ts` (or wherever migrations are run)

**Step 1: Find migration approach**

Check how existing migrations work in the project. Look at `src/main/db/migrations.ts` or `src/main/index.ts` for the `runMigrations()` function. The project uses Drizzle's push or manual SQL migrations.

**Step 2: Add migration SQL**

Add a migration that:
1. Creates the `reversal_requests` table with all columns and indexes
2. Adds `is_voided` (INTEGER DEFAULT 0) and `void_reason` (TEXT) columns to `expenses` table
3. Uses `ALTER TABLE` for backward compatibility

```sql
-- Create reversal_requests table
CREATE TABLE IF NOT EXISTS reversal_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_number TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by INTEGER NOT NULL REFERENCES users(id),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  rejection_reason TEXT,
  reversal_details TEXT,
  error_details TEXT,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS rr_status_idx ON reversal_requests(status);
CREATE INDEX IF NOT EXISTS rr_entity_idx ON reversal_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS rr_branch_idx ON reversal_requests(branch_id);
CREATE INDEX IF NOT EXISTS rr_priority_idx ON reversal_requests(priority);

-- Add void fields to expenses
ALTER TABLE expenses ADD COLUMN is_voided INTEGER NOT NULL DEFAULT 0;
ALTER TABLE expenses ADD COLUMN void_reason TEXT;
```

**Step 3: Commit**

```bash
git add src/main/db/migrations.ts
git commit -m "feat: add migration for reversal_requests table and expenses void fields"
```

---

### Task 4: Create reversal number generator utility

**Files:**
- Modify: `src/main/utils/gl-posting.ts` (add `generateReversalNumber` next to existing `generateJournalEntryNumber`)

**Step 1: Add reversal number generator**

In `src/main/utils/gl-posting.ts`, locate the `generateJournalEntryNumber()` function and add a similar function after it:

```typescript
export async function generateReversalNumber(): Promise<string> {
  const db = getDatabase()
  const year = new Date().getFullYear()
  const prefix = `REV-${year}-`

  const lastEntry = await db.query.reversalRequests.findFirst({
    where: like(reversalRequests.requestNumber, `${prefix}%`),
    orderBy: [desc(reversalRequests.id)],
  })

  let nextNum = 1
  if (lastEntry?.requestNumber) {
    const lastNum = parseInt(lastEntry.requestNumber.replace(prefix, ''), 10)
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`
}
```

Add necessary imports at the top: `reversalRequests` from schema, `like` from drizzle-orm.

**Step 2: Commit**

```bash
git add src/main/utils/gl-posting.ts
git commit -m "feat: add reversal number generator utility"
```

---

### Task 5: Create reversal executor functions

**Files:**
- Create: `src/main/utils/reversal-executors.ts`

This file contains the type-specific reversal logic for each entity type. Each function takes the entity ID and returns a `reversalDetails` object describing what was reversed.

**Step 1: Create the reversal executors file**

Create `src/main/utils/reversal-executors.ts` with the following structure. Each executor function:
- Accepts `entityId: number` and `userId: number`
- Runs inside the caller's `withTransaction` context
- Returns `{ reversalDetails: Record<string, unknown> }`
- Throws on validation failure

```typescript
import { eq, and, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  sales, saleItems, inventory, commissions,
  accountReceivables, purchases, purchaseItems,
  expenses, journalEntries, journalEntryLines,
  chartOfAccounts, accountPayables,
  receivablePayments, payablePayments,
  stockAdjustments, stockTransfers,
  returns, returnItems, inventoryCostLayers,
} from '../db/schema'
import {
  postVoidSaleToGL, postExpenseToGL,
  createJournalEntry,
} from './gl-posting'
import { restoreCostLayers } from './inventory-valuation'

// Type for reversal result
interface ReversalResult {
  reversalDetails: Record<string, unknown>
}

// ---- SALE REVERSAL ----
// Extracted from existing sales:void handler in sales-ipc.ts
export async function executeSaleReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const sale = await db.query.sales.findFirst({ where: eq(sales.id, entityId) })
  if (!sale) throw new Error('Sale not found')
  if (sale.isVoided) throw new Error('Sale is already voided')

  const items = await db.query.saleItems.findMany({ where: eq(saleItems.saleId, entityId) })

  // 1. Restore inventory and cost layers
  for (const item of items) {
    await db
      .update(inventory)
      .set({
        quantity: sql`${inventory.quantity} + ${item.quantity}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, sale.branchId)))

    await restoreCostLayers({
      productId: item.productId,
      branchId: sale.branchId,
      quantity: item.quantity,
      unitCost: item.costPrice,
      referenceType: 'void',
      referenceId: sale.id,
    })
  }

  // 2. Void sale
  await db
    .update(sales)
    .set({ isVoided: true, voidReason: 'Reversed via reversal request', updatedAt: new Date().toISOString() })
    .where(eq(sales.id, entityId))

  // 3. Cancel commissions
  await db
    .update(commissions)
    .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
    .where(eq(commissions.saleId, entityId))

  // 4. Cancel receivables
  await db
    .update(accountReceivables)
    .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
    .where(eq(accountReceivables.saleId, entityId))

  // 5. Post reversing GL entry
  await postVoidSaleToGL(
    sale,
    items.map((item) => ({ costPrice: item.costPrice, quantity: item.quantity })),
    userId
  )

  return {
    reversalDetails: {
      type: 'sale',
      invoiceNumber: sale.invoiceNumber,
      totalAmount: sale.totalAmount,
      itemsRestored: items.length,
      inventoryRestored: items.map((i) => ({ productId: i.productId, qty: i.quantity })),
    },
  }
}

// ---- EXPENSE REVERSAL ----
export async function executeExpenseReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const expense = await db.query.expenses.findFirst({ where: eq(expenses.id, entityId) })
  if (!expense) throw new Error('Expense not found')
  if (expense.isVoided) throw new Error('Expense is already voided')

  // 1. Cancel linked payable if exists
  if (expense.payableId) {
    await db
      .update(accountPayables)
      .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
      .where(eq(accountPayables.id, expense.payableId))
  }

  // 2. Mark expense as voided
  await db
    .update(expenses)
    .set({ isVoided: true, voidReason: 'Reversed via reversal request', updatedAt: new Date().toISOString() })
    .where(eq(expenses.id, entityId))

  // 3. Find and reverse the GL journal entry for this expense
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.referenceType, 'expense'), eq(journalEntries.referenceId, entityId)),
  })

  if (jeEntry && jeEntry.status === 'posted') {
    // Create reversing journal entry
    const lines = await db.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, jeEntry.id),
    })

    const reversingLines = lines.map((line) => ({
      accountId: line.accountId,
      debitAmount: line.creditAmount, // swap
      creditAmount: line.debitAmount, // swap
      description: `Reversal: ${line.description || ''}`,
    }))

    await createJournalEntry({
      description: `Reversal of expense #${entityId}`,
      referenceType: 'expense',
      referenceId: entityId,
      branchId: expense.branchId,
      userId,
      lines: reversingLines,
    })

    // Mark original as reversed
    await db
      .update(journalEntries)
      .set({ status: 'reversed', reversedBy: userId, reversedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(journalEntries.id, jeEntry.id))
  }

  return {
    reversalDetails: {
      type: 'expense',
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      payableCancelled: !!expense.payableId,
      glReversed: !!jeEntry,
    },
  }
}

// ---- JOURNAL ENTRY REVERSAL ----
export async function executeJournalEntryReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const entry = await db.query.journalEntries.findFirst({
    where: eq(journalEntries.id, entityId),
    with: { lines: true },
  })

  if (!entry) throw new Error('Journal entry not found')
  if (entry.status === 'reversed') throw new Error('Journal entry is already reversed')
  if (entry.status === 'draft') throw new Error('Cannot reverse a draft journal entry')

  // Create reversing lines (swap debits/credits)
  const reversingLines = entry.lines.map((line) => ({
    accountId: line.accountId,
    debitAmount: line.creditAmount,
    creditAmount: line.debitAmount,
    description: `Reversal: ${line.description || ''}`,
  }))

  // Create reversing journal entry
  const reversalEntry = await createJournalEntry({
    description: `Reversal of ${entry.entryNumber}`,
    referenceType: entry.referenceType || 'reversal',
    referenceId: entry.referenceId || entityId,
    branchId: entry.branchId!,
    userId,
    lines: reversingLines,
  })

  // Mark original as reversed and link
  await db
    .update(journalEntries)
    .set({
      status: 'reversed',
      reversedBy: userId,
      reversedAt: new Date().toISOString(),
      reversalEntryId: reversalEntry.id,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(journalEntries.id, entityId))

  return {
    reversalDetails: {
      type: 'journal_entry',
      originalEntryNumber: entry.entryNumber,
      reversalEntryNumber: reversalEntry.entryNumber,
      linesReversed: entry.lines.length,
    },
  }
}

// ---- PURCHASE REVERSAL ----
export async function executePurchaseReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const purchase = await db.query.purchases.findFirst({ where: eq(purchases.id, entityId) })
  if (!purchase) throw new Error('Purchase not found')
  if (purchase.status === 'cancelled') throw new Error('Purchase is already cancelled')

  const items = await db.query.purchaseItems.findMany({ where: eq(purchaseItems.purchaseId, entityId) })

  // Only reverse inventory if purchase was received
  if (purchase.status === 'received' || purchase.status === 'partial') {
    for (const item of items) {
      if (item.receivedQuantity && item.receivedQuantity > 0) {
        // Deduct inventory
        await db
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${item.receivedQuantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(and(eq(inventory.productId, item.productId), eq(inventory.branchId, purchase.branchId)))

        // Mark cost layers as fully consumed
        await db
          .update(inventoryCostLayers)
          .set({ isFullyConsumed: true, quantity: 0, updatedAt: new Date().toISOString() })
          .where(and(
            eq(inventoryCostLayers.productId, item.productId),
            eq(inventoryCostLayers.purchaseItemId, item.id),
          ))
      }
    }
  }

  // Cancel linked payable
  await db
    .update(accountPayables)
    .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
    .where(and(eq(accountPayables.purchaseId, entityId)))

  // Mark purchase cancelled
  await db
    .update(purchases)
    .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
    .where(eq(purchases.id, entityId))

  // Reverse GL
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.referenceType, 'purchase'), eq(journalEntries.referenceId, entityId)),
  })

  if (jeEntry && jeEntry.status === 'posted') {
    const lines = await db.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, jeEntry.id),
    })

    await createJournalEntry({
      description: `Reversal of purchase #${purchase.purchaseOrderNumber}`,
      referenceType: 'purchase',
      referenceId: entityId,
      branchId: purchase.branchId,
      userId,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debitAmount: l.creditAmount,
        creditAmount: l.debitAmount,
        description: `Reversal: ${l.description || ''}`,
      })),
    })

    await db
      .update(journalEntries)
      .set({ status: 'reversed', reversedBy: userId, reversedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(journalEntries.id, jeEntry.id))
  }

  return {
    reversalDetails: {
      type: 'purchase',
      purchaseOrderNumber: purchase.purchaseOrderNumber,
      totalAmount: purchase.totalAmount,
      inventoryReversed: purchase.status === 'received' || purchase.status === 'partial',
      itemsAffected: items.length,
    },
  }
}

// ---- AR PAYMENT REVERSAL ----
export async function executeARPaymentReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const payment = await db.query.receivablePayments.findFirst({
    where: eq(receivablePayments.id, entityId),
  })
  if (!payment) throw new Error('AR payment not found')

  // Restore receivable amount
  const receivable = await db.query.accountReceivables.findFirst({
    where: eq(accountReceivables.id, payment.receivableId),
  })
  if (!receivable) throw new Error('Linked receivable not found')

  const newPaidAmount = (receivable.paidAmount || 0) - payment.amount
  const newStatus = newPaidAmount <= 0 ? 'pending' : 'partial'

  await db
    .update(accountReceivables)
    .set({
      paidAmount: Math.max(0, newPaidAmount),
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accountReceivables.id, payment.receivableId))

  // Reverse GL
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.referenceType, 'ar_payment'), eq(journalEntries.referenceId, entityId)),
  })

  if (jeEntry && jeEntry.status === 'posted') {
    const lines = await db.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, jeEntry.id),
    })

    await createJournalEntry({
      description: `Reversal of AR payment #${entityId}`,
      referenceType: 'ar_payment',
      referenceId: entityId,
      branchId: receivable.branchId,
      userId,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debitAmount: l.creditAmount,
        creditAmount: l.debitAmount,
        description: `Reversal: ${l.description || ''}`,
      })),
    })

    await db
      .update(journalEntries)
      .set({ status: 'reversed', reversedBy: userId, reversedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(journalEntries.id, jeEntry.id))
  }

  return {
    reversalDetails: {
      type: 'ar_payment',
      paymentAmount: payment.amount,
      receivableId: payment.receivableId,
      newStatus,
    },
  }
}

// ---- AP PAYMENT REVERSAL ----
export async function executeAPPaymentReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const payment = await db.query.payablePayments.findFirst({
    where: eq(payablePayments.id, entityId),
  })
  if (!payment) throw new Error('AP payment not found')

  const payable = await db.query.accountPayables.findFirst({
    where: eq(accountPayables.id, payment.payableId),
  })
  if (!payable) throw new Error('Linked payable not found')

  const newPaidAmount = (payable.paidAmount || 0) - payment.amount
  const newStatus = newPaidAmount <= 0 ? 'pending' : 'partial'

  await db
    .update(accountPayables)
    .set({
      paidAmount: Math.max(0, newPaidAmount),
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accountPayables.id, payment.payableId))

  // Reverse GL
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.referenceType, 'ap_payment'), eq(journalEntries.referenceId, entityId)),
  })

  if (jeEntry && jeEntry.status === 'posted') {
    const lines = await db.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, jeEntry.id),
    })

    await createJournalEntry({
      description: `Reversal of AP payment #${entityId}`,
      referenceType: 'ap_payment',
      referenceId: entityId,
      branchId: payable.branchId,
      userId,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debitAmount: l.creditAmount,
        creditAmount: l.debitAmount,
        description: `Reversal: ${l.description || ''}`,
      })),
    })

    await db
      .update(journalEntries)
      .set({ status: 'reversed', reversedBy: userId, reversedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(journalEntries.id, jeEntry.id))
  }

  return {
    reversalDetails: {
      type: 'ap_payment',
      paymentAmount: payment.amount,
      payableId: payment.payableId,
      newStatus,
    },
  }
}

// ---- COMMISSION REVERSAL ----
export async function executeCommissionReversal(entityId: number, userId: number): Promise<ReversalResult> {
  const db = getDatabase()

  const commission = await db.query.commissions.findFirst({
    where: eq(commissions.id, entityId),
  })
  if (!commission) throw new Error('Commission not found')
  if (commission.status === 'cancelled') throw new Error('Commission is already cancelled')

  await db
    .update(commissions)
    .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
    .where(eq(commissions.id, entityId))

  // Reverse GL if posted
  const jeEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.referenceType, 'commission'), eq(journalEntries.referenceId, entityId)),
  })

  if (jeEntry && jeEntry.status === 'posted') {
    const lines = await db.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, jeEntry.id),
    })

    await createJournalEntry({
      description: `Reversal of commission #${entityId}`,
      referenceType: 'commission',
      referenceId: entityId,
      branchId: commission.branchId,
      userId,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debitAmount: l.creditAmount,
        creditAmount: l.debitAmount,
        description: `Reversal: ${l.description || ''}`,
      })),
    })

    await db
      .update(journalEntries)
      .set({ status: 'reversed', reversedBy: userId, reversedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(journalEntries.id, jeEntry.id))
  }

  return {
    reversalDetails: {
      type: 'commission',
      commissionAmount: commission.amount,
      saleId: commission.saleId,
      glReversed: !!jeEntry,
    },
  }
}

// ---- DISPATCHER ----
// Maps entity type to its executor function
export async function executeReversal(
  entityType: string,
  entityId: number,
  userId: number
): Promise<ReversalResult> {
  switch (entityType) {
    case 'sale':
      return executeSaleReversal(entityId, userId)
    case 'expense':
      return executeExpenseReversal(entityId, userId)
    case 'journal_entry':
      return executeJournalEntryReversal(entityId, userId)
    case 'purchase':
      return executePurchaseReversal(entityId, userId)
    case 'ar_payment':
      return executeARPaymentReversal(entityId, userId)
    case 'ap_payment':
      return executeAPPaymentReversal(entityId, userId)
    case 'commission':
      return executeCommissionReversal(entityId, userId)
    default:
      throw new Error(`Reversal not yet implemented for entity type: ${entityType}`)
  }
}
```

**Note:** Stock adjustment, stock transfer, and return reversals are marked as `not yet implemented` in the dispatcher. They can be added incrementally as needed. The core types (sale, expense, journal entry, purchase, AR/AP payment, commission) are implemented first.

**Step 2: Commit**

```bash
git add src/main/utils/reversal-executors.ts
git commit -m "feat: add reversal executor functions for all core entity types"
```

---

### Task 6: Create reversal IPC handlers

**Files:**
- Create: `src/main/ipc/reversal-ipc.ts`
- Modify: `src/main/ipc/index.ts` (register handlers)

**Step 1: Create reversal IPC handler file**

Create `src/main/ipc/reversal-ipc.ts`:

```typescript
import { ipcMain } from 'electron'
import { eq, and, desc, like, sql, inArray } from 'drizzle-orm'
import { getDatabase } from '../db'
import { reversalRequests } from '../db/schema'
import { withTransaction } from '../utils/db-transaction'
import { handleIpcError } from '../utils/error-handling'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from '../utils/session'
import { generateReversalNumber } from '../utils/gl-posting'
import { executeReversal } from '../utils/reversal-executors'

interface CreateReversalData {
  entityType: string
  entityId: number
  reason: string
  priority?: string
}

interface ListReversalFilters {
  status?: string
  entityType?: string
  priority?: string
  branchId?: number
  page?: number
  limit?: number
}

export function registerReversalHandlers(): void {
  const db = getDatabase()

  // Create a new reversal request
  ipcMain.handle('reversal:create', async (_, data: CreateReversalData) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      // Check for existing active request on same entity
      const existing = await db.query.reversalRequests.findFirst({
        where: and(
          eq(reversalRequests.entityType, data.entityType),
          eq(reversalRequests.entityId, data.entityId),
          inArray(reversalRequests.status, ['pending', 'approved'])
        ),
      })

      if (existing) {
        return { success: false, message: 'An active reversal request already exists for this transaction' }
      }

      const requestNumber = await generateReversalNumber()

      const [request] = await db
        .insert(reversalRequests)
        .values({
          requestNumber,
          entityType: data.entityType,
          entityId: data.entityId,
          reason: data.reason,
          priority: data.priority || 'medium',
          status: 'pending',
          requestedBy: session.userId!,
          branchId: session.branchId!,
        })
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'reversal_request',
        entityType: 'reversal_request',
        entityId: request.id,
        newValues: { entityType: data.entityType, entityId: data.entityId, reason: data.reason, priority: data.priority },
        description: `Reversal requested for ${data.entityType} #${data.entityId}: ${data.reason}`,
      })

      return { success: true, data: request }
    } catch (error) {
      return handleIpcError('Create reversal request', error)
    }
  })

  // List reversal requests with filters
  ipcMain.handle('reversal:list', async (_, filters: ListReversalFilters = {}) => {
    try {
      const conditions = []

      if (filters.status) conditions.push(eq(reversalRequests.status, filters.status))
      if (filters.entityType) conditions.push(eq(reversalRequests.entityType, filters.entityType))
      if (filters.priority) conditions.push(eq(reversalRequests.priority, filters.priority))
      if (filters.branchId) conditions.push(eq(reversalRequests.branchId, filters.branchId))

      const where = conditions.length > 0 ? and(...conditions) : undefined
      const limit = filters.limit || 50
      const offset = ((filters.page || 1) - 1) * limit

      const results = await db.query.reversalRequests.findMany({
        where,
        orderBy: [desc(reversalRequests.createdAt)],
        limit,
        offset,
        with: {
          requestedByUser: true,
          reviewedByUser: true,
          branch: true,
        },
      })

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reversalRequests)
        .where(where)

      return {
        success: true,
        data: results,
        total: countResult[0]?.count || 0,
        page: filters.page || 1,
        limit,
      }
    } catch (error) {
      return handleIpcError('List reversal requests', error)
    }
  })

  // Get single reversal request with details
  ipcMain.handle('reversal:get', async (_, id: number) => {
    try {
      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
        with: {
          requestedByUser: true,
          reviewedByUser: true,
          branch: true,
        },
      })

      if (!request) return { success: false, message: 'Reversal request not found' }

      return { success: true, data: request }
    } catch (error) {
      return handleIpcError('Get reversal request', error)
    }
  })

  // Approve and execute a reversal
  ipcMain.handle('reversal:approve', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
      })

      if (!request) return { success: false, message: 'Reversal request not found' }
      if (request.status !== 'pending') return { success: false, message: `Cannot approve request with status: ${request.status}` }

      // Mark as approved
      await db
        .update(reversalRequests)
        .set({
          status: 'approved',
          reviewedBy: session.userId!,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reversalRequests.id, id))

      // Execute the reversal in a transaction
      try {
        const result = await withTransaction(async () => {
          return executeReversal(request.entityType, request.entityId, session.userId!)
        })

        // Mark as completed
        await db
          .update(reversalRequests)
          .set({
            status: 'completed',
            reversalDetails: result.reversalDetails,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: session.branchId,
          action: 'reversal_executed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: result.reversalDetails,
          description: `Reversal executed for ${request.entityType} #${request.entityId}`,
        })

        return { success: true, message: 'Reversal approved and executed successfully', data: result.reversalDetails }
      } catch (execError) {
        // Mark as failed
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'

        await db
          .update(reversalRequests)
          .set({
            status: 'failed',
            errorDetails: errorMessage,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: session.branchId,
          action: 'reversal_failed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: { error: errorMessage },
          description: `Reversal failed for ${request.entityType} #${request.entityId}: ${errorMessage}`,
        })

        return { success: false, message: `Reversal execution failed: ${errorMessage}` }
      }
    } catch (error) {
      return handleIpcError('Approve reversal', error)
    }
  })

  // Reject a reversal request
  ipcMain.handle('reversal:reject', async (_, id: number, rejectionReason: string) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
      })

      if (!request) return { success: false, message: 'Reversal request not found' }
      if (request.status !== 'pending') return { success: false, message: `Cannot reject request with status: ${request.status}` }

      await db
        .update(reversalRequests)
        .set({
          status: 'rejected',
          reviewedBy: session.userId!,
          reviewedAt: new Date().toISOString(),
          rejectionReason,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reversalRequests.id, id))

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'reversal_review',
        entityType: 'reversal_request',
        entityId: id,
        newValues: { status: 'rejected', rejectionReason },
        description: `Reversal rejected for ${request.entityType} #${request.entityId}: ${rejectionReason}`,
      })

      return { success: true, message: 'Reversal request rejected' }
    } catch (error) {
      return handleIpcError('Reject reversal', error)
    }
  })

  // Retry a failed reversal
  ipcMain.handle('reversal:retry', async (_, id: number) => {
    try {
      const session = getCurrentSession()
      if (!session) return { success: false, message: 'Not authenticated' }

      const request = await db.query.reversalRequests.findFirst({
        where: eq(reversalRequests.id, id),
      })

      if (!request) return { success: false, message: 'Reversal request not found' }
      if (request.status !== 'failed') return { success: false, message: 'Only failed reversals can be retried' }

      // Reset to approved and re-execute
      await db
        .update(reversalRequests)
        .set({ status: 'approved', errorDetails: null, updatedAt: new Date().toISOString() })
        .where(eq(reversalRequests.id, id))

      try {
        const result = await withTransaction(async () => {
          return executeReversal(request.entityType, request.entityId, session.userId!)
        })

        await db
          .update(reversalRequests)
          .set({ status: 'completed', reversalDetails: result.reversalDetails, updatedAt: new Date().toISOString() })
          .where(eq(reversalRequests.id, id))

        await createAuditLog({
          userId: session.userId,
          branchId: session.branchId,
          action: 'reversal_executed',
          entityType: 'reversal_request',
          entityId: id,
          newValues: result.reversalDetails,
          description: `Reversal retry succeeded for ${request.entityType} #${request.entityId}`,
        })

        return { success: true, message: 'Reversal retry succeeded', data: result.reversalDetails }
      } catch (execError) {
        const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'

        await db
          .update(reversalRequests)
          .set({ status: 'failed', errorDetails: errorMessage, updatedAt: new Date().toISOString() })
          .where(eq(reversalRequests.id, id))

        return { success: false, message: `Reversal retry failed: ${errorMessage}` }
      }
    } catch (error) {
      return handleIpcError('Retry reversal', error)
    }
  })

  // Dashboard stats
  ipcMain.handle('reversal:stats', async () => {
    try {
      const stats = await db
        .select({
          status: reversalRequests.status,
          count: sql<number>`count(*)`,
        })
        .from(reversalRequests)
        .groupBy(reversalRequests.status)

      const byType = await db
        .select({
          entityType: reversalRequests.entityType,
          count: sql<number>`count(*)`,
        })
        .from(reversalRequests)
        .where(eq(reversalRequests.status, 'pending'))
        .groupBy(reversalRequests.entityType)

      const byPriority = await db
        .select({
          priority: reversalRequests.priority,
          count: sql<number>`count(*)`,
        })
        .from(reversalRequests)
        .where(eq(reversalRequests.status, 'pending'))
        .groupBy(reversalRequests.priority)

      return {
        success: true,
        data: {
          byStatus: Object.fromEntries(stats.map((s) => [s.status, s.count])),
          pendingByType: Object.fromEntries(byType.map((t) => [t.entityType, t.count])),
          pendingByPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p.count])),
        },
      }
    } catch (error) {
      return handleIpcError('Reversal stats', error)
    }
  })

  // Check if entity has active reversal request
  ipcMain.handle('reversal:check', async (_, entityType: string, entityId: number) => {
    try {
      const request = await db.query.reversalRequests.findFirst({
        where: and(
          eq(reversalRequests.entityType, entityType),
          eq(reversalRequests.entityId, entityId),
        ),
        orderBy: [desc(reversalRequests.createdAt)],
      })

      return { success: true, data: request || null }
    } catch (error) {
      return handleIpcError('Check reversal status', error)
    }
  })
}
```

**Step 2: Register in IPC index**

In `src/main/ipc/index.ts`:

1. Add import at top:
```typescript
import { registerReversalHandlers } from './reversal-ipc'
```

2. Add to `registerAllHandlers()` function before the console.log line:
```typescript
  registerReversalHandlers()
```

**Step 3: Commit**

```bash
git add src/main/ipc/reversal-ipc.ts src/main/ipc/index.ts
git commit -m "feat: add reversal IPC handlers (create, list, approve, reject, retry, stats)"
```

---

### Task 7: Create Reversal Dashboard UI screen

**Files:**
- Create: `src/renderer/screens/reversals/index.tsx`

**Step 1: Create the reversal dashboard screen**

Create `src/renderer/screens/reversals/index.tsx` — a full admin dashboard that:

1. Shows stats cards at top (pending, approved, completed, failed, rejected counts)
2. Filter bar: status dropdown, entity type dropdown, priority dropdown
3. Table listing all reversal requests with columns:
   - Request Number, Entity Type, Entity ID, Reason, Priority, Status, Requested By, Date, Actions
4. Actions column: Approve/Reject buttons for pending, Retry for failed
5. Approve click → confirmation dialog → calls `reversal:approve`
6. Reject click → dialog with rejection reason textarea → calls `reversal:reject`

Follow the existing pattern from screens like `src/renderer/screens/audit-logs.tsx` for table layout and shadcn/ui components (Table, Button, Dialog, Select, Badge, Input).

Use IPC calls: `window.api.invoke('reversal:list', filters)`, `window.api.invoke('reversal:approve', id)`, etc.

Priority badges: urgent=red, high=orange, medium=yellow, low=gray
Status badges: pending=yellow, approved=blue, completed=green, failed=red, rejected=gray

**Step 2: Commit**

```bash
git add src/renderer/screens/reversals/index.tsx
git commit -m "feat: add reversal dashboard UI screen"
```

---

### Task 8: Add route and sidebar navigation

**Files:**
- Modify: `src/renderer/routes.tsx` (add reversal route)
- Modify: `src/renderer/components/layout/sidebar.tsx` (add nav item with badge)

**Step 1: Add route**

In `src/renderer/routes.tsx`:

1. Add lazy import:
```typescript
const ReversalsScreen = lazy(() =>
  import("@/screens/reversals").then((m) => ({ default: m.ReversalsScreen })),
)
```

2. Add route inside the MainLayout routes (before the catch-all):
```typescript
<Route
  path="reversals"
  element={
    <LazyRoute>
      <ReversalsScreen />
    </LazyRoute>
  }
/>
```

**Step 2: Add sidebar nav item**

In `src/renderer/components/layout/sidebar.tsx`, add a "Reversal Requests" item in the admin/management section of the sidebar. Include a badge showing pending count (fetched via `reversal:stats` on mount).

Use an appropriate icon (e.g., `RotateCcw` from lucide-react).

**Step 3: Commit**

```bash
git add src/renderer/routes.tsx src/renderer/components/layout/sidebar.tsx
git commit -m "feat: add reversal dashboard route and sidebar navigation"
```

---

### Task 9: Add "Request Reversal" button to transaction screens

**Files:**
- Create: `src/renderer/components/reversal-request-modal.tsx`
- Modify: `src/renderer/screens/sales/index.tsx` (or sales detail) — add Request Reversal button
- Modify: Other transaction screens as needed (expenses, journals, etc.)

**Step 1: Create ReversalRequestModal component**

Create `src/renderer/components/reversal-request-modal.tsx`:

A dialog component that accepts `entityType` and `entityId` props. Contains:
- Reason textarea (required)
- Priority select (low, medium, high, urgent) — default medium
- Submit button that calls `reversal:create`
- Shows success/error toast on completion

```typescript
interface ReversalRequestModalProps {
  open: boolean
  onClose: () => void
  entityType: string
  entityId: number
  entityLabel?: string // e.g., "Sale #INV-2026-001"
  onSuccess?: () => void
}
```

**Step 2: Add to sales screen**

In the sales list/detail screen, add a "Request Reversal" button (visible when sale is not already voided). On click, open the ReversalRequestModal with `entityType="sale"`.

**Step 3: Add to other screens**

Repeat for expenses, journals, and other transaction detail views. Each screen gets a "Request Reversal" button that opens the modal with the appropriate `entityType`.

**Step 4: Commit**

```bash
git add src/renderer/components/reversal-request-modal.tsx src/renderer/screens/
git commit -m "feat: add reversal request modal and integrate with transaction screens"
```

---

### Task 10: Add ReversalStatusBadge to transaction detail views

**Files:**
- Create: `src/renderer/components/reversal-status-badge.tsx`
- Modify: Transaction screens to show badge when reversal exists

**Step 1: Create ReversalStatusBadge**

A component that takes `entityType` and `entityId`, calls `reversal:check` on mount, and displays:
- Nothing if no reversal request exists
- "Reversal Pending" yellow badge if status=pending
- "Reversal Approved" blue badge if status=approved
- "Reversed" green badge if status=completed
- "Reversal Failed" red badge if status=failed
- "Reversal Rejected" gray badge if status=rejected

**Step 2: Add to transaction screens**

Add `<ReversalStatusBadge entityType="sale" entityId={sale.id} />` to the sales detail/row, and similarly for other transaction screens.

**Step 3: Commit**

```bash
git add src/renderer/components/reversal-status-badge.tsx src/renderer/screens/
git commit -m "feat: add reversal status badge to transaction views"
```

---

### Task 11: Build and verify

**Step 1: Run TypeScript check**

```bash
cd firearms-pos && npx tsc --noEmit
```

Expected: No type errors

**Step 2: Run the app**

```bash
npm run dev
```

Verify:
- App starts without errors
- Reversal Requests appears in sidebar
- Reversal dashboard loads
- Can create a test sale, then request reversal from sales screen
- Reversal appears in dashboard as pending
- Can approve/reject from dashboard
- Approved reversal executes (sale shows as voided, GL entry created)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete transaction reversal system with admin approval workflow"
```

---

## Summary of Files

| Action | File |
|--------|------|
| Create | `src/main/db/schemas/reversal-requests.ts` |
| Modify | `src/main/db/schema.ts` |
| Modify | `src/main/db/schemas/expenses.ts` |
| Modify | `src/main/db/schemas/audit-logs.ts` |
| Modify | `src/main/db/migrations.ts` |
| Modify | `src/main/utils/gl-posting.ts` |
| Create | `src/main/utils/reversal-executors.ts` |
| Create | `src/main/ipc/reversal-ipc.ts` |
| Modify | `src/main/ipc/index.ts` |
| Create | `src/renderer/screens/reversals/index.tsx` |
| Modify | `src/renderer/routes.tsx` |
| Modify | `src/renderer/components/layout/sidebar.tsx` |
| Create | `src/renderer/components/reversal-request-modal.tsx` |
| Create | `src/renderer/components/reversal-status-badge.tsx` |
| Modify | Transaction screen files (sales, expenses, journals, etc.) |
