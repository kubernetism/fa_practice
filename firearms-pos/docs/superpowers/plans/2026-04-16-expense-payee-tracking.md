# Expense Payee Tracking & Report Analysis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `payees` table so every expense (paid or unpaid) records who was paid, mirror suppliers as vendor-type payees, and add payee-based analytics to the Expense Report.

**Architecture:** New `payees` table with `payeeType` enum. Suppliers auto-mirror as `vendor` payees. Expenses switch from `supplierId` to `payeeId` (required). Expense reports gain "by payee" and "by payee type" aggregations plus analysis cards. A new Payees admin screen provides CRUD.

**Tech Stack:** Drizzle ORM (SQLite), Electron IPC, React, shadcn/ui, Lucide icons

---

## File Structure

**New files:**
- `src/main/db/schemas/payees.ts` — Drizzle schema + relations for `payees` table
- `src/main/ipc/payees-ipc.ts` — CRUD IPC handlers for payees
- `src/main/db/migrations/migrate_to_payees.ts` — Migration: create table, mirror suppliers, backfill expenses
- `src/renderer/screens/payees/index.tsx` — Payees admin screen (CRUD table + dialog)

**Modified files:**
- `src/main/db/schema.ts` — Add `export * from './schemas/payees'`
- `src/main/db/schemas/expenses.ts` — Replace `supplierId` with `payeeId`
- `src/main/db/schemas/account-payables.ts` — Add nullable `payeeId` column
- `src/main/db/migrate.ts` — Call `migrateToPayees()`
- `src/main/ipc/index.ts` — Register payees handlers
- `src/main/ipc/suppliers-ipc.ts` — Hook supplier create/update to mirror payees
- `src/main/ipc/expenses-ipc.ts` — Switch from supplier to payee joins/validation
- `src/main/ipc/reports-ipc.ts` — Add payee aggregations to expense report
- `src/main/utils/gl-posting.ts` — Use payee name in journal narration
- `src/preload/index.ts` — Expose payees API surface
- `src/renderer/routes.tsx` — Add `payees` to KEEP_ALIVE_PATHS
- `src/renderer/components/layout/sidebar.tsx` — Add Payees nav item
- `src/renderer/components/layout/keep-alive-outlet.tsx` — Add lazy route for payees
- `src/renderer/screens/expenses/index.tsx` — Payee dropdown for all statuses, table column rename
- `src/renderer/screens/reports/report-filter-config.ts` — Add payee/payeeType entity filters, rename columns
- `src/renderer/screens/reports/index.tsx` — Render payee analysis cards

---

### Task 1: Create `payees` Schema

**Files:**
- Create: `src/main/db/schemas/payees.ts`
- Modify: `src/main/db/schema.ts:37`

- [ ] **Step 1: Create the payees schema file**

Create `src/main/db/schemas/payees.ts`:

```ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { suppliers } from './suppliers'

export const payees = sqliteTable(
  'payees',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    payeeType: text('payee_type', {
      enum: ['vendor', 'landlord', 'utility', 'employee', 'government', 'other'],
    }).notNull(),
    linkedSupplierId: integer('linked_supplier_id').references(() => suppliers.id),
    contactPhone: text('contact_phone'),
    contactEmail: text('contact_email'),
    address: text('address'),
    notes: text('notes'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    payeeTypeIdx: index('payees_payee_type_idx').on(table.payeeType),
    linkedSupplierIdx: index('payees_linked_supplier_idx').on(table.linkedSupplierId),
    isActiveIdx: index('payees_is_active_idx').on(table.isActive),
  })
)

export const payeesRelations = relations(payees, ({ one }) => ({
  linkedSupplier: one(suppliers, {
    fields: [payees.linkedSupplierId],
    references: [suppliers.id],
  }),
}))

export type Payee = typeof payees.$inferSelect
export type NewPayee = typeof payees.$inferInsert
```

- [ ] **Step 2: Export from schema barrel**

In `src/main/db/schema.ts`, add at the end (after line 37):

```ts
export * from './schemas/payees'
```

- [ ] **Step 3: Commit**

```bash
git add src/main/db/schemas/payees.ts src/main/db/schema.ts
git commit -m "feat: add payees schema with supplier linking"
```

---

### Task 2: Update `expenses` Schema — Replace `supplierId` with `payeeId`

**Files:**
- Modify: `src/main/db/schemas/expenses.ts`

- [ ] **Step 1: Update the expenses schema**

In `src/main/db/schemas/expenses.ts`:

1. Add import for `payees`:
```ts
import { payees } from './payees'
```

2. Replace the `supplierId` column definition (line 35):
```ts
// Old:
supplierId: integer('supplier_id').references(() => suppliers.id),
// New:
payeeId: integer('payee_id').references(() => payees.id),
```

3. Remove the `suppliers` import (line 5):
```ts
// Remove: import { suppliers } from './suppliers'
```

4. Update the index (line 53):
```ts
// Old:
supplierIdx: index('expenses_supplier_idx').on(table.supplierId),
// New:
payeeIdx: index('expenses_payee_idx').on(table.payeeId),
```

5. Update the relation (lines 71-74):
```ts
// Old:
supplier: one(suppliers, {
  fields: [expenses.supplierId],
  references: [suppliers.id],
}),
// New:
payee: one(payees, {
  fields: [expenses.payeeId],
  references: [payees.id],
}),
```

- [ ] **Step 2: Commit**

```bash
git add src/main/db/schemas/expenses.ts
git commit -m "feat: replace supplierId with payeeId in expenses schema"
```

---

### Task 3: Update `account_payables` Schema — Add `payeeId`

**Files:**
- Modify: `src/main/db/schemas/account-payables.ts`

- [ ] **Step 1: Add payeeId column and relation**

In `src/main/db/schemas/account-payables.ts`:

1. Add import:
```ts
import { payees } from './payees'
```

2. Change the `supplierId` column from `notNull()` to nullable (line 13-14), since expense-driven A/P rows won't have a supplier:
```ts
supplierId: integer('supplier_id').references(() => suppliers.id),
```

3. Add `payeeId` column after `supplierId`:
```ts
payeeId: integer('payee_id').references(() => payees.id),
```

4. Add index for payeeId in the index block:
```ts
payeeIdx: index('payables_payee_idx').on(table.payeeId),
```

5. Add payee relation in `accountPayablesRelations`:
```ts
payee: one(payees, {
  fields: [accountPayables.payeeId],
  references: [payees.id],
}),
```

- [ ] **Step 2: Commit**

```bash
git add src/main/db/schemas/account-payables.ts
git commit -m "feat: add payeeId to account_payables for expense-driven payables"
```

---

### Task 4: Migration — Create Payees Table, Mirror Suppliers, Backfill Expenses

**Files:**
- Create: `src/main/db/migrations/migrate_to_payees.ts`
- Modify: `src/main/db/migrate.ts`

- [ ] **Step 1: Create the migration file**

Create `src/main/db/migrations/migrate_to_payees.ts`:

```ts
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
```

- [ ] **Step 2: Register migration in migrate.ts**

In `src/main/db/migrate.ts`, add import at top:

```ts
import { migrateToPayees } from './migrations/migrate_to_payees'
```

Add migration call at the end of `runMigrations()` (after the last try/catch block, before the function closes):

```ts
  // Ensure payees table exists and suppliers are mirrored
  try {
    await migrateToPayees()
  } catch (error) {
    console.error('Payees migration error:', error)
    // Don't throw - log error but continue
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/main/db/migrations/migrate_to_payees.ts src/main/db/migrate.ts
git commit -m "feat: migration to create payees table, mirror suppliers, backfill expenses"
```

---

### Task 5: Payees IPC Handlers (CRUD)

**Files:**
- Create: `src/main/ipc/payees-ipc.ts`
- Modify: `src/main/ipc/index.ts`
- Modify: `src/preload/index.ts`

- [ ] **Step 1: Create payees IPC handlers**

Create `src/main/ipc/payees-ipc.ts`:

```ts
import { ipcMain } from 'electron'
import { eq, and, desc, sql, like } from 'drizzle-orm'
import { getDatabase } from '../db'
import { payees, type NewPayee } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { handleIpcError } from '../utils/error-handling'

export function registerPayeeHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'payees:getAll',
    async (
      _,
      params: {
        payeeType?: string
        isActive?: boolean
        search?: string
        limit?: number
        page?: number
      }
    ) => {
      try {
        const { payeeType, isActive, search, limit = 1000, page = 1 } = params || {}

        const conditions = []
        if (payeeType) conditions.push(eq(payees.payeeType, payeeType as any))
        if (isActive !== undefined) conditions.push(eq(payees.isActive, isActive))
        if (search) conditions.push(like(payees.name, '%' + search + '%'))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(payees)
          .where(whereClause)
        const total = countResult[0].count

        const data = await db.query.payees.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: desc(payees.name),
          with: {
            linkedSupplier: true,
          },
        })

        return { success: true, data, total, page, limit, totalPages: Math.ceil(total / limit) }
      } catch (error) {
        return handleIpcError('Get payees', error)
      }
    }
  )

  ipcMain.handle('payees:getById', async (_, id: number) => {
    try {
      const payee = await db.query.payees.findFirst({
        where: eq(payees.id, id),
        with: { linkedSupplier: true },
      })
      if (!payee) return { success: false, message: 'Payee not found' }
      return { success: true, data: payee }
    } catch (error) {
      return handleIpcError('Get payee', error)
    }
  })

  ipcMain.handle('payees:create', async (_, data: NewPayee) => {
    try {
      const session = getCurrentSession()

      if (!data.name?.trim()) {
        return { success: false, message: 'Payee name is required' }
      }
      if (!data.payeeType) {
        return { success: false, message: 'Payee type is required' }
      }
      // Block manual creation of vendor type without linked supplier
      if (data.payeeType === 'vendor' && !data.linkedSupplierId) {
        return {
          success: false,
          message: 'Vendor payees are auto-created from the Suppliers screen',
        }
      }

      const result = await db.insert(payees).values(data).returning()
      const newPayee = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'payee',
        entityId: newPayee.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: 'Created payee: ' + data.name + ' (' + data.payeeType + ')',
      })

      return { success: true, data: newPayee }
    } catch (error) {
      return handleIpcError('Create payee', error)
    }
  })

  ipcMain.handle('payees:update', async (_, id: number, data: Partial<NewPayee>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.payees.findFirst({ where: eq(payees.id, id) })
      if (!existing) return { success: false, message: 'Payee not found' }

      // Block type change from/to vendor
      if (data.payeeType && data.payeeType !== existing.payeeType) {
        if (existing.payeeType === 'vendor' || data.payeeType === 'vendor') {
          return {
            success: false,
            message: 'Cannot change payee type from/to vendor. Manage vendors via the Suppliers screen.',
          }
        }
      }

      const result = await db
        .update(payees)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(payees.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'payee',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: 'Updated payee: ' + existing.name,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      return handleIpcError('Update payee', error)
    }
  })

  ipcMain.handle('payees:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.payees.findFirst({ where: eq(payees.id, id) })
      if (!existing) return { success: false, message: 'Payee not found' }

      // Check if referenced by expenses
      const { expenses: expensesTable } = await import('../db/schema')
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(expensesTable)
        .where(eq(expensesTable.payeeId, id))
      if (usageCount[0].count > 0) {
        return {
          success: false,
          message: 'Cannot delete payee -- referenced by ' + usageCount[0].count + ' expense(s). Deactivate instead.',
        }
      }

      // Soft-delete: set isActive = false
      await db
        .update(payees)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(payees.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'payee',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: 'Deactivated payee: ' + existing.name,
      })

      return { success: true, message: 'Payee deactivated successfully' }
    } catch (error) {
      return handleIpcError('Delete payee', error)
    }
  })
}
```

- [ ] **Step 2: Register handlers in `src/main/ipc/index.ts`**

Add import (after line 43):
```ts
import { registerPayeeHandlers } from './payees-ipc'
```

Add call in `registerAllHandlers()` (after `registerOnlineTransactionHandlers()` on line 90):
```ts
  registerPayeeHandlers()
```

- [ ] **Step 3: Expose payees API in `src/preload/index.ts`**

Add after the `suppliers` block (after line 130):

```ts
  // Payees
  payees: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('payees:getAll', params),
    getById: (id: number) => ipcRenderer.invoke('payees:getById', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('payees:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('payees:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('payees:delete', id),
  },
```

- [ ] **Step 4: Commit**

```bash
git add src/main/ipc/payees-ipc.ts src/main/ipc/index.ts src/preload/index.ts
git commit -m "feat: add payees CRUD IPC handlers and preload API"
```

---

### Task 6: Hook Supplier Create/Update to Mirror Payees

**Files:**
- Modify: `src/main/ipc/suppliers-ipc.ts:144-225`

- [ ] **Step 1: Add supplier to payee mirroring in `suppliers:create`**

In `src/main/ipc/suppliers-ipc.ts`, add import at top:
```ts
import { payees } from '../db/schema'
```

After the supplier insert and audit log (after line 174, before the `return` on line 177), add:

```ts
      // Mirror supplier as vendor payee
      try {
        await db.insert(payees).values({
          name: sanitizedData.name,
          payeeType: 'vendor',
          linkedSupplierId: newSupplier.id,
          contactPhone: sanitizedData.phone || undefined,
          contactEmail: sanitizedData.email || undefined,
          address: sanitizedData.address || undefined,
          notes: sanitizedData.notes || undefined,
          isActive: sanitizedData.isActive !== false,
        })
      } catch (mirrorError) {
        console.error('Failed to mirror supplier as payee:', mirrorError)
        // Non-fatal: supplier was created, payee mirroring can be retried
      }
```

- [ ] **Step 2: Add supplier to payee cascade in `suppliers:update`**

After the supplier update audit log block in the `suppliers:update` handler, add:

```ts
      // Cascade name/contact changes to mirrored payee
      try {
        const mirroredPayee = await db.query.payees.findFirst({
          where: eq(payees.linkedSupplierId, id),
        })
        if (mirroredPayee) {
          const payeeUpdates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
          if (sanitizedData.name) payeeUpdates.name = sanitizedData.name
          if (sanitizedData.phone !== undefined) payeeUpdates.contactPhone = sanitizedData.phone
          if (sanitizedData.email !== undefined) payeeUpdates.contactEmail = sanitizedData.email
          if (sanitizedData.address !== undefined) payeeUpdates.address = sanitizedData.address
          if (sanitizedData.isActive !== undefined) payeeUpdates.isActive = sanitizedData.isActive
          await db.update(payees).set(payeeUpdates).where(eq(payees.id, mirroredPayee.id))
        }
      } catch (mirrorError) {
        console.error('Failed to cascade supplier update to payee:', mirrorError)
      }
```

- [ ] **Step 3: Commit**

```bash
git add src/main/ipc/suppliers-ipc.ts
git commit -m "feat: mirror supplier create/update to payees table"
```

---

### Task 7: Update Expenses IPC — Switch from Supplier to Payee

**Files:**
- Modify: `src/main/ipc/expenses-ipc.ts`

- [ ] **Step 1: Update imports**

In `src/main/ipc/expenses-ipc.ts`, add `payees` to the schema import (line 4):

```ts
import { expenses, type NewExpense, accountPayables, cashRegisterSessions, cashTransactions, payees } from '../db/schema'
```

- [ ] **Step 2: Update `expenses:get-all` handler**

In the `db.query.expenses.findMany` `with` block (lines 52-56), replace `supplier: true` with:

```ts
          payee: true,
```

- [ ] **Step 3: Update `expenses:get-by-id` handler**

In the `db.query.expenses.findFirst` `with` block (lines 86-88), replace `supplier: true` with:

```ts
          payee: true,
```

- [ ] **Step 4: Update `expenses:create` handler**

1. Replace the supplier validation (lines 116-121):
```ts
      // Validation: All expenses require a payee
      if (!data.payeeId) {
        return {
          success: false,
          message: 'Payee is required for all expenses',
        }
      }
```

2. In the unpaid expense A/P creation block (lines 155-185), replace with:

```ts
        // Auto-create payable for unpaid expenses
        if (data.paymentStatus === 'unpaid' && data.payeeId) {
          const invoiceNumber = 'EXP-' + newExpense.id + '-' + Date.now()

          // Resolve supplierId from payee if vendor type
          const payee = await txDb.query.payees.findFirst({
            where: eq(payees.id, data.payeeId),
          })
          const supplierIdForPayable = payee?.linkedSupplierId ?? null

          const payableResult = await txDb
            .insert(accountPayables)
            .values({
              supplierId: supplierIdForPayable,
              payeeId: data.payeeId,
              purchaseId: null,
              branchId: data.branchId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount,
              paidAmount: 0,
              remainingAmount: data.amount,
              status: 'pending',
              dueDate: data.dueDate,
              paymentTerms: data.paymentTerms,
              notes: 'Auto-created from expense: ' + categoryName + ' - ' + (data.description || 'No description'),
              createdBy: session?.userId,
            })
            .returning()

          const newPayable = payableResult[0]
          payableId = newPayable.id

          await txDb
            .update(expenses)
            .set({ payableId: newPayable.id })
            .where(eq(expenses.id, newExpense.id))
        }
```

3. Update the audit log for payable creation (lines 230-247) — replace `data.supplierId` references with `data.payeeId`:

```ts
      if (result.payableId && data.payeeId) {
        const invoiceNumber = 'EXP-' + result.newExpense.id + '-' + Date.now()
        await createAuditLog({
          userId: session?.userId,
          branchId: data.branchId,
          action: 'create',
          entityType: 'account_payable',
          entityId: result.payableId,
          newValues: {
            payeeId: data.payeeId,
            invoiceNumber: invoiceNumber,
            totalAmount: data.amount,
            source: 'expense',
            expenseId: result.newExpense.id,
          },
          description: 'Auto-created payable from expense #' + result.newExpense.id,
        })
      }
```

- [ ] **Step 5: Update `expenses:update` handler**

Replace references to `data.supplierId` / `existing.supplierId` with `data.payeeId` / `existing.payeeId` throughout the handler (lines 272-443):

1. Line 288: `!data.supplierId && !existing.supplierId` becomes `!data.payeeId && !existing.payeeId`
2. Line 289 message: `'Supplier is required for unpaid expenses'` becomes `'Payee is required for unpaid expenses'`
3. Line 336: `data.supplierId || existing.supplierId` becomes `data.payeeId || existing.payeeId`
4. Line 337: variable rename `supplierIdToUse` becomes `payeeIdToUse`
5. Line 339 message: update to reference payee
6. Line 373: `if (shouldCreatePayable && supplierIdToUse)` becomes `if (shouldCreatePayable && payeeIdToUse)`
7. Lines 378-379: In the accountPayables insert values, resolve supplierId from payee:

```ts
        if (shouldCreatePayable && payeeIdToUse) {
          const invoiceNumber = 'EXP-' + existing.id + '-' + Date.now()

          // Resolve supplierId from payee if vendor type
          const payee = await txDb.query.payees.findFirst({
            where: eq(payees.id, payeeIdToUse),
          })
          const supplierIdForPayable = payee?.linkedSupplierId ?? null

          const payableResult = await txDb
            .insert(accountPayables)
            .values({
              supplierId: supplierIdForPayable,
              payeeId: payeeIdToUse,
              purchaseId: null,
              branchId: existing.branchId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount || existing.amount,
              paidAmount: 0,
              remainingAmount: data.amount || existing.amount,
              status: 'pending',
              dueDate: data.dueDate || existing.dueDate,
              paymentTerms: data.paymentTerms || existing.paymentTerms,
              notes: 'Created from expense status change: expense #' + existing.id,
              createdBy: session?.userId,
            })
            .returning()

          createdPayableId = payableResult[0].id
          data.payableId = createdPayableId
        }
```

8. Update the payable audit log (lines 409-426): replace `supplierIdToUse` with `payeeIdToUse`.

- [ ] **Step 6: Commit**

```bash
git add src/main/ipc/expenses-ipc.ts
git commit -m "feat: switch expenses IPC from supplier to payee"
```

---

### Task 8: Update GL Posting — Payee Name in Journal Narration

**Files:**
- Modify: `src/main/utils/gl-posting.ts:588-652`

- [ ] **Step 1: Add optional payeeName to the expense GL posting function**

Update the `postExpenseToGL` function signature to accept an optional `payeeName`:

```ts
export async function postExpenseToGL(
  expense: {
    id: number
    branchId: number
    categoryName: string
    amount: number
    paymentStatus: string
    paymentMethod?: string
    description?: string
    payeeName?: string
  },
  userId: number
): Promise<number> {
```

Update the journal line descriptions to include payee name where present:

Line 621 (debit description):
```ts
    description: expense.description || ('Expense: ' + expense.categoryName + (expense.payeeName ? ' - ' + expense.payeeName : '')),
```

Line 630 (credit AP description):
```ts
      description: 'Payable for expense ' + expense.categoryName + (expense.payeeName ? ' - ' + expense.payeeName : ''),
```

Line 640 (credit cash description):
```ts
      description: 'Payment for expense ' + expense.categoryName + (expense.payeeName ? ' - ' + expense.payeeName : ''),
```

Line 645 (journal entry description):
```ts
    description: 'Expense: ' + expense.categoryName + (expense.payeeName ? ' - ' + expense.payeeName : '') + (expense.description ? ' - ' + expense.description : ''),
```

- [ ] **Step 2: Update the caller in expenses-ipc.ts**

In `src/main/ipc/expenses-ipc.ts`, in the `expenses:create` handler, look up the payee name and pass it to GL posting. Before the `postExpenseToGL` call, add:

```ts
        // Look up payee name for GL narration
        const payeeRecord = await txDb.query.payees.findFirst({
          where: eq(payees.id, data.payeeId!),
        })
```

Then update the `postExpenseToGL` call to include `payeeName`:

```ts
        await postExpenseToGL(
          {
            id: newExpense.id,
            branchId: data.branchId,
            categoryName,
            amount: data.amount,
            paymentStatus: data.paymentStatus || 'paid',
            paymentMethod: data.paymentMethod,
            description: data.description,
            payeeName: payeeRecord?.name,
          },
          session?.userId ?? 0
        )
```

- [ ] **Step 3: Commit**

```bash
git add src/main/utils/gl-posting.ts src/main/ipc/expenses-ipc.ts
git commit -m "feat: include payee name in GL journal narrations"
```

---

### Task 9: Update Expense Reports — Add Payee Aggregations

**Files:**
- Modify: `src/main/ipc/reports-ipc.ts:599-784`

- [ ] **Step 1: Add payee imports**

In `src/main/ipc/reports-ipc.ts`, ensure `payees` is imported from the schema. Find the existing schema import and add `payees`:

```ts
import { ..., payees } from '../db/schema'
```

- [ ] **Step 2: Update the params type**

Replace the params type (lines 603-613):

```ts
      params: {
        branchId?: number
        startDate: string
        endDate: string
        categoryId?: number
        payeeId?: number
        payeeType?: string
        paymentStatus?: string
        page?: number
        limit?: number
      }
```

- [ ] **Step 3: Update filter handling**

Replace the `supplierId` filter line (line 626):
```ts
        if (params.payeeId) conditions.push(eq(expenses.payeeId, params.payeeId))
```

Add payeeType filter (requires joining payees table for filtering). Add after the payeeId filter:
```ts
        // payeeType filter is applied via the payees join in the queries below
```

- [ ] **Step 4: Add "Expenses by Payee" aggregation**

After the `expensesByPaymentStatus` query block (around line 702), add:

```ts
        // By payee
        const expensesByPayee = await db
          .select({
            payeeId: expenses.payeeId,
            payeeName: payees.name,
            payeeType: payees.payeeType,
            amount: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
            paidAmount: sql<number>`coalesce(sum(${expensePaidExpr}), 0)`,
            remainingAmount: sql<number>`coalesce(sum(${expenseRemainingExpr}), 0)`,
            count: sql<number>`count(*)`,
          })
          .from(expenses)
          .innerJoin(payees, eq(expenses.payeeId, payees.id))
          .leftJoin(accountPayables, eq(expenses.payableId, accountPayables.id))
          .where(and(...conditions))
          .groupBy(expenses.payeeId, payees.name, payees.payeeType)
          .orderBy(desc(sql`sum(${expenses.amount})`))

        // By payee type
        const expensesByPayeeType = await db
          .select({
            payeeType: payees.payeeType,
            amount: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
            count: sql<number>`count(*)`,
          })
          .from(expenses)
          .innerJoin(payees, eq(expenses.payeeId, payees.id))
          .where(and(...conditions))
          .groupBy(payees.payeeType)
          .orderBy(desc(sql`sum(${expenses.amount})`))
```

- [ ] **Step 5: Update the detail rows query**

Replace the `supplierName` field in the detail rows select (line 743) with:

```ts
            payeeName: sql<string>`${payees.name}`,
            payeeType: sql<string>`${payees.payeeType}`,
```

Replace the suppliers left join (line 748) with:

```ts
          .leftJoin(payees, eq(expenses.payeeId, payees.id))
```

Remove the old `.leftJoin(suppliers, ...)` line.

- [ ] **Step 6: Update the return data**

Add `expensesByPayee` and `expensesByPayeeType` to the returned data object (around line 766):

```ts
          data: {
            summary: summary[0],
            expensesByCategory,
            expensesByBranch,
            expensesByPaymentStatus,
            expensesByPayee,
            expensesByPayeeType,
            topExpenses,
            details: {
              rows: detailRows,
              total: totalRows,
              page,
              totalPages: Math.ceil(totalRows / pageSize),
            },
          },
```

- [ ] **Step 7: Commit**

```bash
git add src/main/ipc/reports-ipc.ts
git commit -m "feat: add payee and payee-type aggregations to expense report"
```

---

### Task 10: Payees Admin Screen (UI)

**Files:**
- Create: `src/renderer/screens/payees/index.tsx`
- Modify: `src/renderer/routes.tsx`
- Modify: `src/renderer/components/layout/sidebar.tsx`
- Modify: `src/renderer/components/layout/keep-alive-outlet.tsx`

- [ ] **Step 1: Create the Payees admin screen**

Create `src/renderer/screens/payees/index.tsx` — a CRUD table with add/edit dialog. Follow the same pattern as the Expenses screen. Key elements:

- Table columns: Name, Type (badge), Phone, Email, Status (active/inactive badge), Actions (edit/delete)
- Filter by payee type dropdown, search by name
- Add/Edit dialog: Name*, Type* (dropdown: landlord, utility, employee, government, other -- NOT vendor), Phone, Email, Address, Notes, isActive toggle
- Vendor rows show "Linked Supplier: {name}" read-only badge, edit/delete disabled for vendors
- Delete triggers soft-delete (deactivation)

Key constants for the screen:
```tsx
const PAYEE_TYPES = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'utility', label: 'Utility' },
  { value: 'employee', label: 'Employee' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
]

const ALL_PAYEE_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  ...PAYEE_TYPES,
]
```

Export as default for lazy loading.

- [ ] **Step 2: Add route**

In `src/renderer/routes.tsx`, add `"payees"` to the `KEEP_ALIVE_PATHS` array (after `"suppliers"` on line 33):

```ts
  "payees",
```

- [ ] **Step 3: Add sidebar nav item**

In `src/renderer/components/layout/sidebar.tsx`, add after the Suppliers item (line 96). Import `Contact` from lucide-react:

```ts
      { title: 'Payees', href: '/payees', icon: Contact, allowedRoles: ['admin', 'manager'] },
```

- [ ] **Step 4: Add keep-alive lazy route**

In `src/renderer/components/layout/keep-alive-outlet.tsx`, add after the `/suppliers` entry:

```ts
  '/payees': lazy(() => import('@/screens/payees')),
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/screens/payees/index.tsx src/renderer/routes.tsx src/renderer/components/layout/sidebar.tsx src/renderer/components/layout/keep-alive-outlet.tsx
git commit -m "feat: add Payees admin screen with CRUD table"
```

---

### Task 11: Update Expenses Screen — Payee Dropdown for All Statuses

**Files:**
- Modify: `src/renderer/screens/expenses/index.tsx`

- [ ] **Step 1: Replace supplier state with payee state**

1. Replace the `suppliers` state and fetch (lines 156, 191-196):

```ts
const [payeesList, setPayeesList] = useState<Array<{ id: number; name: string; payeeType: string }>>([])
```

```ts
  const fetchPayees = useCallback(async () => {
    try {
      const response = await window.api.payees.getAll({ isActive: true, limit: 1000 })
      if (response?.success && response?.data) setPayeesList(response.data)
    } catch (error) {
      console.error('Failed to fetch payees:', error)
    }
  }, [])
```

2. Update `useEffect` to call `fetchPayees` instead of `fetchSuppliers` (line 214).

3. Update the `formData` interface — rename `supplierId` to `payeeId` (line 120):
```ts
  payeeId: string
```

4. Update `initialFormData` — rename `supplierId` to `payeeId` (line 135):
```ts
  payeeId: '',
```

- [ ] **Step 2: Update the search filter**

Replace `exp.supplier?.name` (line 231) with:
```ts
        exp.payee?.name.toLowerCase().includes(term) ||
```

- [ ] **Step 3: Update form validation**

Replace the unpaid-only supplier validation (lines 277-281) with validation for ALL statuses:

```ts
    if (!formData.payeeId) {
      alert('Please select a payee')
      return
    }
```

- [ ] **Step 4: Update form submit logic**

Replace lines 308-315 (the conditional supplier/paymentMethod assignment):

```ts
      // Payee is always set
      expenseData.payeeId = parseInt(formData.payeeId)

      if (formData.paymentStatus === 'paid') {
        expenseData.paymentMethod = formData.paymentMethod
        expenseData.reference = formData.reference || undefined
      } else {
        expenseData.dueDate = formData.dueDate
        expenseData.paymentTerms = formData.paymentTerms || undefined
      }
```

- [ ] **Step 5: Update the table — rename Supplier column to Payee**

Replace the "Supplier" table header (lines 470-472):
```tsx
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Payee
                </TableHead>
```

Replace the Supplier cell rendering (lines 565-579) — show payee for ALL rows:
```tsx
                    {/* Payee */}
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {expense.payee ? (
                        <span>
                          {expense.payee.name}
                          {expense.paymentStatus === 'unpaid' && expense.dueDate && (
                            <span className="block text-[10px] text-muted-foreground/60">
                              Due: {formatDate(expense.dueDate)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">--</span>
                      )}
                    </TableCell>
```

- [ ] **Step 6: Update the Expense interface**

Replace `supplierId` and `supplier` in the Expense interface (lines 94, 101-104):
```ts
  payeeId: number | null
```
```ts
  payee?: {
    id: number
    name: string
    payeeType: string
  }
```

- [ ] **Step 7: Update the form dialog — show Payee for all statuses**

Replace the conditional supplier section (lines 803-823). Remove the `{formData.paymentStatus === 'unpaid' && (` wrapper. Place the payee dropdown unconditionally right after Payment Status:

```tsx
                {/* Payee (always required) */}
                <div className="space-y-2">
                  <Label htmlFor="payee">Payee *</Label>
                  <Select
                    value={formData.payeeId}
                    onValueChange={(value) => setFormData({ ...formData, payeeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payee" />
                    </SelectTrigger>
                    <SelectContent>
                      {payeesList.map((payee) => (
                        <SelectItem key={payee.id} value={payee.id.toString()}>
                          <span className="capitalize text-muted-foreground text-[10px] mr-1">
                            {payee.payeeType}
                          </span>
                          {payee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
```

- [ ] **Step 8: Commit**

```bash
git add src/renderer/screens/expenses/index.tsx
git commit -m "feat: show payee dropdown for all expense statuses, rename supplier to payee"
```

---

### Task 12: Update Report Filter Config & Report UI — Payee Filters & Analysis Cards

**Files:**
- Modify: `src/renderer/screens/reports/report-filter-config.ts`
- Modify: `src/renderer/screens/reports/index.tsx`

- [ ] **Step 1: Update filter config types and expense report config**

In `src/renderer/screens/reports/report-filter-config.ts`:

1. Add `'payee'` and `'payeeType'` to the `EntityFilter` type (line 18):
```ts
export type EntityFilter =
  | 'branch'
  | 'customer'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'supplier'
  | 'payee'
  | 'payeeType'
  | 'category'
  | 'salesperson'
  | 'user'
  | 'actionType'
  | 'entityType'
  | 'reason'
```

2. Update the expenses report config (lines 112-141):
   - Change `entityFilters` to replace `'supplier'` with `'payee', 'payeeType'`:
   ```ts
   entityFilters: ['branch', 'category', 'payee', 'payeeType', 'paymentStatus'],
   ```
   - Change `description` to: `'Expense tracking by category and payee'`
   - Rename the `supplierName` table column to `payeeName`:
   ```ts
   { key: 'payeeName', label: 'Payee', sortable: true },
   ```

- [ ] **Step 2: Update report UI to handle payee/payeeType filters**

In `src/renderer/screens/reports/index.tsx`, find where entity filters are rendered (where `supplier` filter creates a dropdown). Add handling for `payee` and `payeeType` filters:

- `payee` filter: dropdown fetched from `window.api.payees.getAll({ isActive: true })`
- `payeeType` filter: static dropdown with options: Vendor, Landlord, Utility, Employee, Government, Other

When the expense report data is returned, render the new analysis sections after the existing category breakdown:

1. **Expenses by Payee Type** — render as a summary table or simple bar list
2. **Top 5 Payees** — render the top 5 from `expensesByPayee` as a ranked list with amounts
3. **Payee Concentration** — calculate "Top 3 payees account for X% of total" from `expensesByPayee`

These use the same card/table components already used by the existing report sections.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/screens/reports/report-filter-config.ts src/renderer/screens/reports/index.tsx
git commit -m "feat: add payee filters and analysis cards to expense report"
```

---

### Task 13: Build, Test, and Verify

**Files:** None (verification only)

- [ ] **Step 1: Build the project**

```bash
cd firearms-pos && npm run build
```

Fix any TypeScript compilation errors.

- [ ] **Step 2: Run the app**

```bash
npm run dev
```

- [ ] **Step 3: Verify migration**

- Open the app, check console for "Payees migration completed successfully"
- Open Database Viewer, verify `payees` table exists with mirrored supplier rows
- Verify existing expenses have `payee_id` populated

- [ ] **Step 4: Test Payees admin screen**

- Navigate to Payees in sidebar
- Verify vendor-type payees show linked supplier badge
- Create a new payee (landlord type), verify it appears in the list
- Edit a non-vendor payee, verify changes persist
- Try deleting a vendor payee, verify it is blocked
- Try creating a vendor payee manually, verify it is blocked

- [ ] **Step 5: Test Expense creation**

- Create a PAID expense, verify payee dropdown is shown and required
- Create an UNPAID expense, verify payee dropdown + due date are shown
- Verify GL journal entry includes payee name in narration

- [ ] **Step 6: Test Expense table**

- Verify Payee column shows names for ALL rows (paid and unpaid)
- Search by payee name, verify results filter correctly

- [ ] **Step 7: Test Supplier mirroring**

- Create a new supplier, verify a corresponding vendor payee appears in Payees screen
- Update supplier name, verify mirrored payee name updates

- [ ] **Step 8: Test Expense Report**

- Generate expense report, verify payee name shows in detail rows
- Filter by payee, verify filtering works
- Filter by payee type, verify filtering works
- Verify "Expenses by Payee" aggregation table appears
- Verify "Expenses by Payee Type" aggregation appears
- Verify "Top 5 Payees" analysis card appears

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "fix: address build and test issues from payee tracking feature"
```
