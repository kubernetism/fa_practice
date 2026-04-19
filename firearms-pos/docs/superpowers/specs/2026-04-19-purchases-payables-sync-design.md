# Purchases ↔ Account Payables Sync — Design

**Date:** 2026-04-19
**Status:** Draft — awaiting review
**Scope:** Phase 1 of 3 (Purchases ↔ AP). Phase 2 = Sales ↔ AR. Phase 3 = Expenses ↔ AP (schema change).

## Problem

The Purchases tab and the Account Payables tab can fall out of sync. Confirmed repro: **PO-20260408-J7QH is marked `paid` in Purchases but its linked payable is still `pending`**, with no `payable_payments` row, no GL posting, and no cash-drawer entry.

Root cause (purchases-ipc.ts `purchases:pay-off`, lines 596–606):

```ts
await txDb.update(purchases).set({ paymentStatus: 'paid', ... })  // flips first
if (!payable) { return 0 }                                         // silent exit if no AP
```

The purchase is unconditionally flipped to `paid` *before* the AP row is located. If the linked AP row is missing (orphan from legacy data, partial migration, or any earlier bug), the handler returns silently: the purchase is paid but no payment was recorded, no AP was updated, no GL was posted, and the cash drawer was never touched.

Secondary problems the UI makes visible:

- The Purchases table shows only a `pending | partial | paid` badge — never the actual paid/remaining amounts. A partial payment made in the AP tab is invisible in Purchases.
- The Purchases Pay-Off dialog supports only full settlement; users must switch to the AP tab for partial payments.
- The Purchases detail view has no payment-history section.
- The AP table has no back-link to the source PO.

## Goals

1. `account_payables` is the single source of truth for outstanding purchase balances; `purchases.paymentStatus` is always a derived mirror.
2. Every write path updates both tables atomically in one transaction; rollback is all-or-nothing.
3. Orphaned data (purchase paid / AP pending, or the reverse) is detectable and repairable.
4. Both tabs surface the same numbers so "synced" is self-evident to users.

## Non-Goals

- Sales ↔ Account Receivables (Phase 2).
- Expenses ↔ Account Payables (Phase 3 — requires `expenses.paymentStatus` schema change to add `partial`).
- Changing GL posting semantics or the chart of accounts.
- Multi-currency, interest, late-fees.

## Architecture

`account_payables` is the authoritative sub-ledger. `purchases.paymentStatus` is derived from the linked AP row's `status`. Rule:

```
purchases.paymentStatus := AP.status when AP exists
                        := 'pending'  when AP does not exist and paymentMethod='pay_later'
                        := 'paid'     for cash/cheque POs after receive+pay-off
```

No writer is allowed to set `purchases.paymentStatus` without updating (or creating) the linked AP row in the same transaction.

## Components

### Backend

**B1. Fix `purchases:pay-off` atomicity** (`src/main/ipc/purchases-ipc.ts`)

Reorder the transaction body so that AP mutation precedes the purchase flip, and add an orphan-heal path:

```
withTransaction:
  payable = SELECT * FROM account_payables WHERE purchase_id = :id
  IF payable IS NULL:
    payable = INSERT INTO account_payables (
      supplier_id, purchase_id, branch_id,
      invoice_number = purchase.purchase_order_number,
      total_amount    = purchase.total_amount,
      paid_amount     = 0,
      remaining_amount = purchase.total_amount,
      status = 'pending',
      notes = 'Auto-healed from pay-off (orphan payable)',
      created_by = session.user_id
    )
    auditLog('update', 'account_payable', payable.id, description='Healed orphan payable for purchase {PO#}')

  IF payable.remaining_amount <= 0:
    throw 'Payable has no outstanding amount'

  amount = payable.remaining_amount
  INSERT INTO payable_payments (...)
  UPDATE account_payables SET paid_amount=total_amount, remaining_amount=0, status='paid'
  postAPPaymentToGL(...)
  IF cash: INSERT cash_transactions (ap_payment, -amount)
  UPDATE purchases SET payment_status='paid'         // moved to END
```

Any failure in the block rolls the whole transaction back (purchase stays `pending`).

**B2. New IPC `purchases:record-partial-payment`** (`src/main/ipc/purchases-ipc.ts`)

```
signature: (purchaseId, { amount, paymentMethod, referenceNumber?, notes? })
```

- Validates amount > 0.
- Runs the same find-or-create-AP logic as B1.
- Delegates to the exact same write sequence used by `payables:record-payment` (extract that sequence from `account-payables-ipc.ts` into a shared helper `recordPayableSubmission(tx, payable, data, session)` so both IPCs call identical code).
- AP partial-payment handler already syncs `purchases.paymentStatus` to `partial` (account-payables-ipc.ts:380–405) — unchanged.

**B3. Shared helper `recordPayableSubmission`** (`src/main/utils/payable-payment.ts`, new file)

Extracts the payment-recording body currently embedded in `account-payables-ipc.ts:327–482` so it can be called from both:

- `payables:record-payment` (AP tab)
- `purchases:record-partial-payment` (Purchases tab)
- `purchases:pay-off` (Purchases tab full settlement)

Input: `(txDb, payable, data, session, openCashSessionId | null)`. Output: `{ payment, newPaidAmount, newRemainingAmount, newStatus, purchaseSync, expenseSync }`.

Audit logging stays in the callers (they know which entity initiated the action).

**B4. New IPC `purchases:reconcile-with-payables`** (admin only)

Mirror of existing `receivables:sync-with-sales` (`account-receivables-ipc.ts:797–866`). For each purchase with a linked AP or that should have one:

- If purchase has `payment_method='pay_later'` and no AP row → create AP with `total=purchase.total_amount`, remaining=total, status=pending.
- If purchase.paymentStatus ≠ AP.status → flip purchase.paymentStatus to match AP (AP is authoritative).
- If purchase.paymentStatus='paid' but AP.remaining>0 → **do not auto-reverse the payment**; return as a "needs manual attention" row. (We can't fabricate a real payment — user must decide whether to record one or reverse the paid flag.)

Returns `{ created: [...], synced: [...], flagged: [...] }`. Each bucket produces audit log entries.

### Frontend (use the `frontend-design` skill when implementing)

**F1. Purchases table columns** (`src/renderer/screens/purchases/index.tsx`)

Add two columns between "Total" and "Payment":

- **Paid** — `text-green-600 tabular-nums`, `formatCurrency(purchase.paidAmount)`.
- **Remaining** — `text-red-600 tabular-nums font-medium`, `formatCurrency(purchase.remainingAmount)`.

Source data: extend `purchases:get-all` to left-join `account_payables` and return `paidAmount` / `remainingAmount` on each row. POs with no AP row get `paidAmount = purchase.paymentStatus === 'paid' ? totalAmount : 0`, `remainingAmount = totalAmount - paidAmount`.

**F2. Purchases detail — Payment History**

Add a new section below the items table listing `payable_payments` rows for the linked AP:

| Date | Amount | Method | Reference | Paid By | Notes |

Uses the existing `payables:get-payments-by-payable-id` IPC (add if missing). Empty state: "No payments recorded yet."

**F3. Pay-Off dialog — partial mode**

Current dialog has one flow: "Pay in full with {method}". Add a mode toggle:

- **Pay in Full** (existing behavior, no change).
- **Record Partial Payment** — amount field with `max={remainingAmount}`, validates `amount > 0 && amount <= remainingAmount`.

On submit, partial-mode calls `purchases:record-partial-payment`; full-mode calls `purchases:pay-off`.

**F4. AP table — Source column**

Add a "Source" column showing the linked PO# (when `payable.purchaseId` is set). Clicking navigates to `/purchases?focus={purchaseId}` which opens the Purchases screen and scrolls/highlights the row.

## Data Flow

```
Pay full from Purchases (F3 "Pay in Full")
  → purchases:pay-off
  → find-or-create AP (B1)
  → shared helper: insert payment, update AP, post GL, cash drawer
  → update purchases.paymentStatus = 'paid'
  → audit: payable_payment + (if healed) healed-orphan

Pay partial from Purchases (F3 "Record Partial Payment")
  → purchases:record-partial-payment
  → find-or-create AP
  → shared helper: insert payment, update AP (status=partial), post GL, cash drawer
  → helper's purchaseSync updates purchases.paymentStatus = 'partial'
  → audit: payable_payment + purchase sync

Pay (full or partial) from AP tab
  → payables:record-payment (existing, now calling shared helper)
  → existing purchaseSync updates purchases.paymentStatus
  → no change to existing audit

Admin hits Reconcile
  → purchases:reconcile-with-payables
  → creates missing AP rows for pay_later POs
  → flips purchases.paymentStatus to match AP (AP authoritative)
  → returns flagged rows (paid-purchase-but-unpaid-AP) for manual review
```

## Error Handling

- All DB writes inside `withTransaction`. Any failure rolls back purchase + AP + payment + GL + cash drawer together.
- Cash payments still require an open cash-register session for the branch (existing pre-flight in both IPCs).
- `purchases:record-partial-payment` rejects with a clear error if amount > remainingAmount or amount ≤ 0.
- Reconcile IPC never deletes data; it only creates missing rows or flips flags with audit trail.
- `purchaseId` stays nullable on `account_payables` — expense-driven payables still work unchanged.

## Audit Trail

New descriptions:

- `Healed orphan payable for purchase {PO#}` — when B1 auto-creates AP during pay-off.
- `Reconciled payable for purchase {PO#}: created missing AP row` — Reconcile create.
- `Reconciled purchase {PO#}: synced paymentStatus {old} → {new}` — Reconcile flip.
- `Flagged purchase {PO#} for manual review: paid in Purchases but AP has remaining {amount}` — Reconcile flag.

## Testing

**Unit / IPC-level (vitest + test-db)**

1. `purchases:pay-off` with no linked AP row → AP row created with correct supplier/branch/invoice/total, marked paid, payable_payments inserted, GL entry posted, audit log contains "Healed orphan payable".
2. `purchases:pay-off` with existing pending AP → AP updated to paid, purchase flipped, no duplicate AP rows created.
3. `purchases:pay-off` failure in GL posting → everything rolls back (purchase still pending, AP unchanged, no orphan rows).
4. `purchases:record-partial-payment` amount=50 on 100 PO → AP.paid=50, AP.remaining=50, AP.status='partial', purchase.paymentStatus='partial'.
5. `purchases:record-partial-payment` amount > remaining → rejected with error, no writes.
6. `payables:record-payment` (AP tab) still syncs purchase.paymentStatus (regression test — already covered).
7. `purchases:reconcile-with-payables` with seeded orphan purchase (paid, no AP) → returns that row in `flagged`.
8. `purchases:reconcile-with-payables` with seeded pay_later PO missing AP → returns that row in `created` and AP now exists.

**Manual E2E**

1. Create pay_later PO → verify AP row appears in AP tab.
2. Pay 40% from AP tab → verify Purchases table shows Paid=40%, Remaining=60%, status=partial.
3. Pay remaining from Purchases Pay-Off "Partial Payment" mode with amount=60% → verify AP row status=paid, Purchases shows Paid=100%.
4. Run Reconcile on the PO-20260408-J7QH case → verify it appears in `flagged` with the correct message.

## Migration / Backfill

No schema changes in Phase 1. Backfill happens via the Reconcile IPC (admin-initiated). Plan to run it once after deploying to heal existing orphans.

## Out of Scope (tracked for Phase 2/3)

- Sales ↔ Receivables: same column/history/partial-payment pattern on the Sales side.
- Expenses ↔ Payables: requires adding `partial` to `expenses.paymentStatus` enum and a data migration, then applying the shared helper's expenseSync path for partial payments too.
- Bulk-pay multiple payables in one transaction.
- Payable splitting (one PO → multiple payables with different due dates).
