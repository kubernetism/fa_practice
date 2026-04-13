# Purchase Order Edit (Admin-Only Reversal + Re-entry) Design

**Date:** 2026-04-14
**Status:** Awaiting user review
**Related:** extends `2026-03-04-transaction-reversal-design.md` (broader reversal system) with a purchase-specific, admin-gated, one-step flow.

## Overview

Administrators can correct a posted purchase order by reversing the original entry and immediately re-entering a corrected version. The original record is never mutated — a sibling "reversal" entry neutralises it, and a fresh draft is pre-filled for editing. All four audit dimensions — **who, when, what, where, why** — are captured in the existing `audit_logs` table.

Three safety blockers prevent reversals that would corrupt historical accounting:
1. **FIFO consumed** — any unit from this purchase already sold.
2. **Age** — purchase older than the configurable `purchaseReversalMaxDays` setting (default 90).
3. **Paid & reconciled** — linked payable fully paid and reconciled.

The feature is admin-role only. Non-admins see no UI affordance for it, and the IPC handler rejects non-admin callers as a second line of defence.

## Scope

### In scope
- Admin-only reversal of a single purchase order.
- Automatic cascade reversal of: inventory stock quantity, FIFO cost layers, linked `account_payables`, linked `payable_payments`, linked `expenses`.
- Audit log entry with full before/after snapshot and required reason.
- One-step UX: reverse then open pre-filled Create Purchase form for re-entry.
- Audit log side-panel showing who/when/what/where/why with a field diff.
- Business Settings toggle for the age cap.

### Out of scope
- Partial-quantity reversal (whole purchase only).
- Bulk reverse-multiple-purchases.
- Supplier notification.
- Undoing a reversal.

## Data Model Changes

### Migration 1 — `purchases` table

- Add enum value `'reversed'` to `purchases.status` (existing: `draft | ordered | partial | received | cancelled`).
- Add column `reversed_by_purchase_id INTEGER REFERENCES purchases(id)` — set on the original when it is reversed; null otherwise.
- Add column `reverses_purchase_id INTEGER REFERENCES purchases(id)` — set on the reversal sibling; null otherwise. Mutually exclusive with the above.
- Add column `reversal_reason TEXT` — populated on the reversal sibling; captures the admin's "why".

### Migration 2 — `account_payables` table

- Add enum value `'reversed'` to `account_payables.status`.
- No schema columns required; a linked payable is flipped to `reversed` with `remainingAmount = 0` and a negating `payable_payments` row is appended if any payments existed.

### Migration 3 — `expenses` table

- Add column `is_reversed BOOLEAN NOT NULL DEFAULT false`.
- Add column `reversal_expense_id INTEGER REFERENCES expenses(id)` — points to the counter-entry expense row.

### Migration 4 — `business_settings` table

- Add column `purchase_reversal_max_days INTEGER NOT NULL DEFAULT 90`.

### No changes needed to `audit_logs`

Existing columns already capture every required dimension:

| Dimension | Column |
|-----------|--------|
| Who | `user_id` (FK → users) |
| When | `created_at` |
| What | `action` + `old_values` JSON + `new_values` JSON + `entity_type` + `entity_id` |
| Where | `branch_id` (FK → branches) + `ip_address` + `user_agent` |
| Why | `description` |

The existing `action` enum already includes `'reversal_executed'`. The existing `entity_type` enum already includes `'purchase'`. No enum additions required.

## Cascade Flow

All work runs inside a single `BEGIN IMMEDIATE` SQLite transaction. Any failure rolls everything back atomically.

### Step 0 — Preflight

1. Verify caller session user's `role === 'admin'`. Reject with HTTP-equivalent 403 otherwise.
2. Load the original purchase + its `purchase_items` + any linked `account_payables` + any linked `expenses`.
3. Run all three blockers, collecting human-readable reasons:
   - **FIFO consumed**: for each `purchase_items` row, find `inventory_cost_layers` rows tagged with `purchaseId` and sum `originalQty - remainingQty`. If any has been consumed, block with "{product name}: {N} units already sold — use Stock Adjustment instead."
   - **Age**: if `(now - purchases.createdAt) > businessSettings.purchaseReversalMaxDays`, block with "Purchase is {N} days old; policy allows only {maxDays} days."
   - **Paid & reconciled**: if linked `account_payables.status === 'paid'` and any of its `payable_payments.isReconciled === true`, block with "Payable fully paid and reconciled. Unlink reconciliation before reversing."

   Note: the `isReconciled` column on `payable_payments` may not yet exist. If absent, treat `payable.status === 'paid'` alone as the block condition in v1 and add the reconciliation flag in Phase 2.

4. Return `{ allowed: false, blockers: string[] }` if any blocker fires. No writes yet.

### Step 1 — Snapshot (for `audit_logs.old_values`)

Build a JSON object:

```json
{
  "purchase": { ...full purchase row... },
  "items": [ ...all purchase_items rows... ],
  "payable": { ...account_payables row... } | null,
  "payablePayments": [ ... ] | [],
  "expense": { ...expenses row... } | null,
  "productStockSnapshot": { "<productId>": <current stockQuantity>, ... }
}
```

### Step 2 — Create reversal sibling

Insert a new `purchases` row:
- `purchaseOrderNumber`: `<original>-REV`
- `supplierId / branchId / userId`: copied from original (`userId` becomes the admin performing the reversal)
- `subtotal / taxAmount / shippingCost / totalAmount`: negated
- `paymentMethod`: copied
- `paymentStatus`: copied
- `status`: `'reversed'`
- `reversesPurchaseId`: `<original.id>`
- `reversalReason`: admin's input
- `notes`: `"Reversal of <original PO number>: <reason>"`

Insert `purchase_items` rows with **negative `quantity`** and negative `totalCost`; `unitCost` unchanged.

Update original `purchases` row: `status = 'reversed'`, `reversedByPurchaseId = <sibling.id>`.

### Step 3 — Inventory cascade

For each item:
- `products.stockQuantity -= quantity` for its product at its branch.
- Insert a new `inventory_cost_layers` row referencing the reversal sibling purchase with **negative `quantity`** and `remainingQty = 0`. This appends a neutralising layer without mutating the historical one.
- If the decrement would make `stockQuantity` negative, abort transaction (defensive; Step 0 blockers should have caught this).

### Step 4 — Payables cascade

If linked `account_payables` exists:
- Set `status = 'reversed'`, `remainingAmount = 0`, `updatedAt = now`.
- For each existing `payable_payments` row, append a matching negating row with `amount = -<original>`, `notes = "Reversal of purchase <PO>"`, `paymentDate = now`, `paidBy = <admin userId>`.
- Do **not** delete original payment rows — append-only.

### Step 5 — Expenses cascade

If linked `expenses` exists:
- Insert a counter-expense row: same `categoryId / branchId / supplierId`, `amount = -<original>`, `description = "Reversal of <PO>: <reason>"`, `paymentStatus = 'paid'`, `userId = <admin>`, `expenseDate = now`.
- Update original `expense.isReversed = true`, `reversalExpenseId = <new>`.

### Step 6 — Audit log

Insert one `audit_logs` row:
- `action`: `'reversal_executed'`
- `entityType`: `'purchase'`
- `entityId`: `<original purchase id>`
- `oldValues`: snapshot from Step 1
- `newValues`: post-state snapshot (mirrors Step 1 structure, reflects everything the cascade wrote)
- `description`: admin's reason text
- `userId / branchId / ipAddress / userAgent / createdAt`: captured automatically from IPC context

### Step 7 — Commit and return pre-fill

Handler returns:

```json
{
  "success": true,
  "reversalPurchaseId": <sibling.id>,
  "prefillDraft": {
    "supplierId": ...,
    "items": [ { "productId": ..., "quantity": ..., "unitCost": ... } ],
    "paymentMethod": ...,
    "shippingCost": ...,
    "taxAmount": ...,
    "notes": "Re-entry of reversed PO-<original number>"
  }
}
```

### Failure handling

Any thrown exception inside the transaction → full rollback → handler returns `{ success: false, error: "<message>" }` → UI shows destructive toast. No partial state possible.

## UI Design

### Purchases list (existing screen, `renderer/screens/purchases/index.tsx`)

- **New column indicator**: rows where `status === 'reversed'` show a red "Reversed" badge. Reversal sibling rows show a link icon referencing the original PO number.
- **New admin-only action button**: `Reverse & Re-enter` with `RotateCcw` icon, placed after existing View / Receive / Pay actions. Rendered only when `currentUser.role === 'admin'` AND `status !== 'cancelled' && status !== 'reversed'`.
- Clicking opens the **Reverse Confirmation Modal**.

### Reverse Confirmation Modal (new)

Contents:
- **Summary panel** (read-only): PO number, supplier name, date, total.
- **Preflight panel**: populated by a `purchases:check-reversible` IPC call on modal open.
  - Green check "Ready to reverse" when no blockers.
  - Red list of blockers with plain-English messages and suggested remediation.
- **Required reason textarea**: minimum 10 characters, placeholder "Why is this being reversed? This will be logged permanently."
- **Warning banner**: "This will reverse stock ({n} items), payable ({amount}), expense ({amount if any}). The reversal entry and this reason are permanent and cannot be undone."
- **Confirm button**: label "Reverse and open re-entry form". Disabled until reason is filled and preflight passed.

### Re-entry form

Reuses the existing Create Purchase dialog. On modal dismiss after successful reversal, the renderer opens Create Purchase pre-filled from `prefillDraft`, with a tinted blue banner at the top: *"Re-entry of reversed PO-{original number}. Saving this form creates a new purchase record."* No new component — just a preFillValue prop on the existing dialog.

### Audit log viewer (existing screen, `renderer/screens/audit-logs.tsx`)

- Clicking a row with `action === 'reversal_executed'` opens a side-panel "Reversal Detail" view showing:
  - **Who**: user name + role + avatar (from `userId` join)
  - **When**: formatted `createdAt`
  - **Where**: branch name + IP address + user-agent
  - **Why**: the `description` text, prominent and italicised
  - **What changed**: a field-by-field diff of `oldValues` vs `newValues`:
    - Purchase header diff (table of changed fields with before/after columns)
    - Items list diff (+/- markers for removed/added lines)
    - Payable before/after
    - Expense before/after
- From a reversed purchase's detail view on the Purchases screen, a "View Reversal History" button opens this same viewer filtered to the purchase's audit rows.

## Role Gating Mechanics

**Frontend gate**: `useAuth()` already exposes `currentUser.role`. The Reverse button renders only under `currentUser?.role === 'admin'`. Preflight IPC call is likewise only issued by the admin-gated modal.

**Backend gate**: the first executable line of `purchases:reverse-and-reenter` and `purchases:check-reversible` re-reads the session user and throws if `role !== 'admin'`. Never trust the frontend.

**Audit trail**: the `audit_logs.user_id` field itself becomes the permanent record of who executed the reversal. Any bypass attempt is traceable.

## IPC Handlers (new)

- `purchases:check-reversible(purchaseId: number): Promise<{ allowed: boolean; blockers: string[] }>` — admin-only. Runs Step 0 preflight only, no writes.
- `purchases:reverse-and-reenter(purchaseId: number, reason: string): Promise<{ success: boolean; reversalPurchaseId?: number; prefillDraft?: PrefillDraft; error?: string }>` — admin-only. Runs Steps 0–7 inside a transaction.

Both handlers live in `src/main/ipc/purchases-ipc.ts` alongside the existing `purchases:create` etc.

## Testing Strategy

### Unit tests (main process)

- Preflight blocker tests (one per rule) using fixture DB:
  - FIFO-consumed blocker fires when ≥1 unit sold.
  - Age blocker fires above the configured threshold; does not fire at exactly the threshold.
  - Paid-reconciled blocker fires on paid + reconciled payable.
- Role gate test: non-admin session throws before any DB work.
- Happy-path cascade test: each of Steps 2–6 verified post-commit.

### Integration tests (in-memory SQLite)

- End-to-end reversal with: no payable, no expense → stock restored only.
- End-to-end with linked payable + partial payments → payable flipped to `reversed`, negating payment rows appended, originals intact.
- End-to-end with linked expense → counter-expense inserted, original `is_reversed = true`.
- Serial-tracked items → serials returned to available state.
- Transaction-rollback test: force a failure in Step 4 and assert Steps 2–3 writes are rolled back (original unchanged, no sibling row, stock unchanged, no audit row).

### Manual smoke test checklist

- [ ] Create purchase as cashier, reverse as admin — button visible to admin only.
- [ ] Attempt reversal of purchase with sold items — blocker message clear.
- [ ] Successful reversal opens pre-filled Create Purchase dialog.
- [ ] Audit log viewer shows reversal row with who/when/what/where/why.
- [ ] Diff viewer renders before/after for header, items, payable, expense.
- [ ] Non-admin cannot see Reverse button.
- [ ] Non-admin API call (via devtools) rejected by IPC.

## Rollout Sequencing

One migration per step; each independently mergeable and leaves app in working state.

1. Schema migration (columns + enum values). Verify existing flows unaffected.
2. IPC handlers (`purchases:check-reversible`, `purchases:reverse-and-reenter`) with unit + integration tests. Not yet wired to UI — can be tested via main-process tests only.
3. Admin-gated button + confirm modal + re-entry pre-fill on Purchases screen.
4. Audit-log detail side-panel with field diff viewer.
5. Business Settings toggle for `purchaseReversalMaxDays`.

## Edge Cases

- **Serial-number tracked items**: serials returned to available on reversal. Any serial already sold is caught by the FIFO blocker at Step 0.
- **Multi-branch transfers from this purchase**: transfers reference product, not purchase. Reversal decrements the originating branch's stock. Step 3 defensive check aborts if stock went elsewhere; admin must recall transfer first. Phase 2: surface this as a preflight blocker.
- **Currency/rounding**: all negated amounts use identical `real` column precision — original + sibling sum to exactly zero.
- **Concurrent edits**: SQLite `BEGIN IMMEDIATE` prevents two admins from reversing the same purchase simultaneously.
- **Abandoned re-entry**: if admin reverses but closes the pre-filled form without saving, the reversal still stands. Sometimes reversal itself is the desired outcome.

## Footprint Estimate

- 1 schema migration file (~50 lines)
- ~200 lines added to `src/main/ipc/purchases-ipc.ts`
- ~150 lines in `src/renderer/screens/purchases/index.tsx` (modal + button + gating)
- ~100 lines in `src/renderer/screens/audit-logs.tsx` (detail side-panel + diff)
- ~400 lines of tests across unit + integration

Total ≈ 900 lines of focused, mergeable change.

## Open Questions Resolved in Brainstorming

- **Edit model** → Reversal + re-entry (not in-place edit).
- **UI placement** → Existing Purchases screen under Inventory sidebar group (not a new Inventory sub-tab).
- **Workflow shape** → One-step reverse + pre-filled re-entry.
- **Safety blockers** → All three (FIFO consumed, age > 90d, paid + reconciled).
- **Audit capture** → Existing `audit_logs` table, no schema extension.
