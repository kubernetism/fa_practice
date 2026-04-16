# Expense Payee Tracking & Report Analysis

**Date:** 2026-04-16
**Status:** Approved
**Scope:** Firearms POS Electron App — Expense Tab, Expense Reports

## Problem

Paid expenses have no record of "paid to whom." The supplier field only appears for unpaid expenses. This creates a gap in the audit trail and prevents meaningful vendor/payee analysis in expense reports.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payee required for paid expenses? | Yes, required for ALL expenses | Every rupee out the door must be attributed for clean audit trail |
| Payee data model | Separate `payees` table | Clean separation from `suppliers` (inventory vendors) |
| Supplier ↔ Payee relationship | Suppliers are a subtype of Payee (auto-mirrored) | One canonical record per real-world entity; vendors appear in both contexts |
| Existing data handling | Auto-migrate: create payees from suppliers, repoint expenses, drop `supplierId` | Single clean migration, no legacy schema cruft |
| Account Payables impact | Add `payeeId` alongside existing `supplierId` on A/P | Purchase-driven A/P stays supplier-native; expense-driven A/P uses payee |

## 1. Data Model

### New Table: `payees`

```
payees
  id              INTEGER PRIMARY KEY AUTOINCREMENT
  name            TEXT NOT NULL
  payeeType       TEXT NOT NULL  -- 'vendor' | 'landlord' | 'utility' | 'employee' | 'government' | 'other'
  linkedSupplierId INTEGER NULL  -- FK → suppliers.id, only set for payeeType='vendor'
  contactPhone    TEXT NULL
  contactEmail    TEXT NULL
  address         TEXT NULL
  notes           TEXT NULL
  isActive        INTEGER NOT NULL DEFAULT 1  -- boolean
  createdAt       TEXT NOT NULL
  updatedAt       TEXT NOT NULL

  INDEX(payeeType)
  INDEX(linkedSupplierId)
  INDEX(isActive)
```

### Schema Change: `expenses`

- ADD `payee_id INTEGER NOT NULL REFERENCES payees(id)` (after backfill)
- DROP `supplier_id`
- ADD `INDEX(payee_id)`

### Schema Change: `account_payables`

- ADD `payee_id INTEGER NULL REFERENCES payees(id)`
- Purchase-driven rows: `payeeId` stays NULL, use existing `supplierId`
- Expense-driven rows: `payeeId` set, `supplierId` stays NULL

### Supplier ↔ Payee Mirroring Rules

Enforced in the suppliers IPC layer:

- **Create supplier** → auto-create payee with `payeeType='vendor'`, `linkedSupplierId=newSupplier.id`
- **Update supplier** (name, contact) → cascade to mirrored payee
- **Deactivate supplier** → deactivate mirrored payee
- **Delete supplier** with linked payee referenced by expenses → block deletion

## 2. Migration Strategy

All steps run inside a single transaction for rollback safety.

**Step 1:** Create `payees` table (empty).

**Step 2:** Mirror all active suppliers into payees:
```sql
INSERT INTO payees (name, payee_type, linked_supplier_id, contact_phone, ...)
SELECT name, 'vendor', id, phone, ... FROM suppliers WHERE is_active = 1
```

**Step 3:** Backfill `expenses.payee_id`:
- Expenses with `supplier_id` → look up mirrored payee via `linkedSupplierId`, set `payee_id`
- Paid expenses with no `supplier_id` (legacy) → create a catch-all payee named **"Unattributed (Legacy)"** with `payeeType='other'`, assign all orphan rows to it

**Step 4:** Add `payee_id` to `account_payables`:
- Backfill: A/P rows linked to expenses that now have `payee_id` → copy it
- Purchase-driven A/P rows → leave `payee_id` NULL

**Step 5:** Drop `supplier_id` from `expenses`.

**Step 6:** Add supplier-creation hook — when a new supplier is created, auto-insert its mirrored payee record.

## 3. UI Changes

### 3a. Add Expense Dialog

Payee dropdown is **always visible and required** regardless of payment status. Remaining fields stay conditional:

```
Payment Status *    [Paid / Unpaid]
Payee *             [Select payee]       ← ALWAYS shown, required
Category *          [Select category]
Amount (Rs.) *      [0.00]
Expense Date *      [date picker]
────────────────────────────────────
IF PAID:
  Payment Method *  [Cash/Card/Check/Transfer]
  Reference         [Invoice #, Receipt #]
IF UNPAID:
  Due Date *        [date picker]
  Payment Terms     [Net 15/30/45/60/Due on Receipt]
────────────────────────────────────
Description         [text area]
                    [Cancel] [Create]
```

Payee dropdown entries grouped by type: `Vendor - K-Electric`, `Landlord - Ahmed Properties`, etc.

### 3b. Expense Table

- Column renamed: "Supplier" → **"Payee"**
- Shows payee name for **all** rows regardless of payment status
- Sub-line for unpaid rows still shows "Due: date"

### 3c. Payees Admin Screen

New sidebar entry. Simple CRUD screen:

- **Table columns:** Name | Type | Phone | Email | Status | Actions
- **Add/Edit dialog:** Name*, Type* (6-option dropdown), contact fields, notes, isActive toggle
- `vendor` type rows show a read-only "Linked Supplier" badge (not editable here — managed via Suppliers screen)
- Filter by payee type, search by name

## 4. Expense Reports Enhancement

### 4a. New Aggregation: Expenses by Payee

```sql
SELECT payee_id, payees.name, payees.payee_type,
       COUNT(*) as count, SUM(amount) as total,
       SUM(paid) as paid_amount, SUM(remaining) as remaining_amount
FROM expenses JOIN payees ON expenses.payee_id = payees.id
WHERE ...conditions...
GROUP BY payee_id, payees.name, payees.payee_type
ORDER BY total DESC
```

### 4b. New Aggregation: Expenses by Payee Type

```sql
SELECT payees.payee_type, COUNT(*) as count, SUM(amount) as total
FROM expenses JOIN payees ON expenses.payee_id = payees.id
WHERE ...conditions...
GROUP BY payees.payee_type
ORDER BY total DESC
```

### 4c. Report Filter Changes

- Replace "Supplier" filter → **"Payee"** dropdown (from payees table)
- Add **"Payee Type"** filter dropdown (vendor/landlord/utility/employee/government/other)

### 4d. Analysis Cards

| Card | Content |
|------|---------|
| Top 5 Payees | Horizontal bar chart — largest payees by total spend |
| Spend by Payee Type | Donut/pie chart — vendor vs utility vs rent vs govt vs other |
| Payee Concentration | Single stat — "Top 3 payees account for X% of total expenses" |
| Avg Expense per Payee | Table — payee name, count, total, average per transaction |

These sit below the existing category breakdown in the report view.

### 4e. Detail Rows

Join payee name + payee type instead of supplier name. Column header: "Payee" instead of "Supplier".

## 5. IPC & Backend Wiring

### 5a. Payees CRUD Handlers

| Channel | Purpose |
|---------|---------|
| `payees:getAll` | List with filters (type, isActive, search), pagination |
| `payees:getById` | Single payee with linked supplier info |
| `payees:create` | Validate + insert; block `type='vendor'` without linked supplier |
| `payees:update` | Update fields; block type change from/to `vendor` |
| `payees:delete` | Soft-delete (isActive=false); block if referenced by expenses |

### 5b. Supplier IPC Hook

- `suppliers:create` → after insert, also insert mirrored payee
- `suppliers:update` → after update, cascade name/contact to mirrored payee

### 5c. Expense IPC Changes

- `expenses:create` — accept `payeeId` (required) instead of `supplierId`. Validate payee exists and is active.
- `expenses:getAll` — join `payees` instead of `suppliers`. Return `payee: { id, name, payeeType }`.
- `expenses:update` — same payeeId handling.

### 5d. Preload API Surface

```ts
payees: {
  getAll: (params) => ipcRenderer.invoke('payees:getAll', params),
  getById: (id) => ipcRenderer.invoke('payees:getById', id),
  create: (data) => ipcRenderer.invoke('payees:create', data),
  update: (id, data) => ipcRenderer.invoke('payees:update', id, data),
  delete: (id) => ipcRenderer.invoke('payees:delete', id),
}
```

### 5e. GL Posting Impact

Expense GL posting uses payee name for journal narration/description. No chart-of-accounts changes — expense accounts stay the same.

### 5f. Audit Logging

All payee CRUD operations get audit log entries (same pattern as suppliers). Expense create/update logs include `payeeId` in the description.

## Files Affected

**New files:**
- `src/main/db/schemas/payees.ts` — schema + relations
- `src/main/ipc/payees-ipc.ts` — CRUD handlers
- `src/renderer/screens/payees/index.tsx` — admin screen

**Modified files:**
- `src/main/db/schema.ts` — export new payees schema
- `src/main/db/migrate.ts` — migration logic
- `src/main/db/schemas/expenses.ts` — `supplierId` → `payeeId`
- `src/main/db/schemas/account-payables.ts` — add `payeeId`
- `src/main/ipc/expenses-ipc.ts` — payee join, validation
- `src/main/ipc/reports-ipc.ts` — new aggregations, filter changes
- `src/main/ipc/setup-ipc.ts` — supplier creation hook
- `src/main/utils/gl-posting.ts` — payee name in narration
- `src/preload/index.ts` — payees API surface
- `src/shared/types/index.ts` — Payee types
- `src/renderer/screens/expenses/index.tsx` — form, table, payee dropdown
- `src/renderer/screens/reports/index.tsx` — new analysis cards, filter
- `src/renderer/screens/reports/report-filter-config.ts` — payee/type filters
- `src/renderer/routes.tsx` — payees route
- `src/renderer/components/layout/sidebar.tsx` — payees nav item
