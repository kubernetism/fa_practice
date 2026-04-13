# Financial Integrity Fixes — Implementation Plan & Checklist

**Date:** 2026-03-22
**Branch:** `web_application`
**Store:** Hamid&Brothers (HBP0312)
**Audit Reference:** Financial Integrity Audit Report 2026-03-22

---

## Executive Summary

The audit identified **12 CRITICAL** and **6 MAJOR** issues stemming from 3 root causes:

1. **No equity accounts in `DEFAULT_ACCOUNTS`** — stock adjustments credit phantom revenue instead of owner's capital
2. **Cash register session opening creates no journal entry** — opening float has no accounting trail
3. **Cash transactions not recorded when no open session exists** — sale completed before register was opened

This plan addresses all issues in strict dependency order across 6 work packages.

---

## Pre-Fix Data Snapshot (for rollback verification)

```
chart_of_accounts:
  1010 Cash in Hand        = Rs 55,000   (asset, debit)
  1200 Inventory            = Rs 510,000  (asset, debit)
  4000 Sales Revenue        = Rs 55,000   (revenue, credit)
  4900 Inv Adjustment Income = Rs 535,000  (revenue, credit)
  5000 COGS                 = Rs 25,000   (expense, debit)

journal_entries: 4 entries (JE#1-4), all posted
cash_register_sessions: 1 session, opening Rs 15,000, status 'open'
cash_transactions: EMPTY
sales: 1 sale (INV-20260322-R1HB), Rs 55,000, cash, paid
```

---

## Work Package 1: Add Equity Accounts to Code & Defaults

**Goal:** Enable Owner's Capital and Retained Earnings in the GL system so the accounting equation can be satisfied.

### Files to Modify

| # | File | Change |
|---|------|--------|
| 1.1 | `src/main/utils/gl-posting.ts` | Add `OWNERS_CAPITAL: '3000'` and `RETAINED_EARNINGS: '3100'` to `ACCOUNT_CODES` |
| 1.2 | `src/main/utils/gl-posting.ts` | Add entries for `'3000'` and `'3100'` to `DEFAULT_ACCOUNTS` with `accountType: 'equity'`, `normalBalance: 'credit'` |

### Implementation Details

**`gl-posting.ts` — ACCOUNT_CODES (line ~18):**

Add after `COD_CHARGES_PAYABLE: '2150'`:
```typescript
OWNERS_CAPITAL: '3000',
RETAINED_EARNINGS: '3100',
```

**`gl-posting.ts` — DEFAULT_ACCOUNTS (line ~89):**

Add after the `'2150'` entry:
```typescript
'3000': {
  accountName: "Owner's Capital",
  accountType: 'equity',
  normalBalance: 'credit',
  description: "Owner's invested capital and initial funding",
},
'3100': {
  accountName: 'Retained Earnings',
  accountType: 'equity',
  normalBalance: 'credit',
  description: 'Accumulated net income retained in the business',
},
```

### Verification

- [ ] TypeScript compiles with zero errors
- [ ] `ACCOUNT_CODES.OWNERS_CAPITAL` resolves to `'3000'`
- [ ] `DEFAULT_ACCOUNTS['3000']` has `accountType: 'equity'`
- [ ] `DEFAULT_ACCOUNTS['3100']` has `accountType: 'equity'`
- [ ] Schema enum already includes `'equity'` (confirmed: `chart-of-accounts.ts:14`)
- [ ] Schema sub-types include `'owner_capital'` and `'retained_earnings'` (confirmed)

---

## Work Package 2: Fix Stock Adjustment GL Posting

**Goal:** `postStockAdjustmentToGL` should support multiple funding sources instead of always crediting Inventory Adjustment Income (revenue).

### Root Cause

`gl-posting.ts:934-948` — For `adjustmentType === 'add'`, the code unconditionally credits `ACCOUNT_CODES.INVENTORY_ADJUSTMENT` (4900, revenue). This is correct ONLY for genuine surplus discoveries during physical counts. For initial stock or owner-funded additions, it should credit Owner's Capital.

### Files to Modify

| # | File | Change |
|---|------|--------|
| 2.1 | `src/main/utils/gl-posting.ts` | Add `fundingSource` parameter to `postStockAdjustmentToGL` |
| 2.2 | `src/main/ipc/inventory-ipc.ts` | Pass `fundingSource` from adjustment data to GL posting function |
| 2.3 | `src/shared/types/index.ts` | Add `fundingSource` to stock adjustment type (if typed there) |
| 2.4 | `src/renderer/screens/inventory/*.tsx` | Add funding source selector to stock adjustment UI |

### Implementation Details

**`gl-posting.ts` — `postStockAdjustmentToGL` (line ~901):**

Update the function signature:
```typescript
export async function postStockAdjustmentToGL(
  adjustment: {
    id: number
    branchId: number
    adjustmentType: 'add' | 'remove'
    quantityChange: number
    unitCost: number
    reason: string
    reference?: string
    fundingSource?: 'owner_capital' | 'accounts_payable' | 'surplus'
  },
  userId: number
): Promise<number> {
```

Update the `'add'` branch (line ~934):
```typescript
} else {
  // Addition: DR Inventory, CR based on funding source
  lines.push({
    accountCode: ACCOUNT_CODES.INVENTORY,
    debitAmount: totalValue,
    creditAmount: 0,
    description: `Inventory increase: ${adjustment.reason}`,
  })

  // Determine credit account based on funding source
  let creditAccount: string
  let creditDescription: string

  switch (adjustment.fundingSource) {
    case 'owner_capital':
      creditAccount = ACCOUNT_CODES.OWNERS_CAPITAL
      creditDescription = `Owner capital investment: ${adjustment.reason}`
      break
    case 'accounts_payable':
      creditAccount = ACCOUNT_CODES.ACCOUNTS_PAYABLE
      creditDescription = `Supplier payable: ${adjustment.reason}`
      break
    case 'surplus':
    default:
      creditAccount = ACCOUNT_CODES.INVENTORY_ADJUSTMENT
      creditDescription = `Inventory adjustment income: ${adjustment.reason}`
      break
  }

  lines.push({
    accountCode: creditAccount,
    debitAmount: 0,
    creditAmount: totalValue,
    description: creditDescription,
  })
}
```

**`inventory-ipc.ts` — adjustment handler (line ~145):**

Update the `postStockAdjustmentToGL` call to pass `fundingSource`:
```typescript
await postStockAdjustmentToGL(
  {
    id: adjustment.id,
    branchId: data.branchId,
    adjustmentType: data.adjustmentType,
    quantityChange: data.quantityChange,
    unitCost: product.costPrice,
    reason: data.reason,
    reference: data.reference,
    fundingSource: data.fundingSource || 'surplus', // backward-compatible default
  },
  session?.userId ?? 0
)
```

**UI — Stock Adjustment Dialog:**

Add a `fundingSource` select field when `adjustmentType === 'add'`:
- **"Owner Capital"** — Owner paid for this inventory (credits 3000)
- **"Supplier Credit"** — Supplier-funded, creates payable (credits 2000)
- **"Surplus Found"** — Genuine surplus from physical count (credits 4900)

Default to `'owner_capital'` for initial stock entries.

### Verification

- [ ] TypeScript compiles with zero errors
- [ ] New stock adjustment with `fundingSource: 'owner_capital'` creates JE: DR Inventory / CR Owner's Capital
- [ ] New stock adjustment with `fundingSource: 'accounts_payable'` creates JE: DR Inventory / CR Accounts Payable
- [ ] New stock adjustment with `fundingSource: 'surplus'` (or undefined) creates JE: DR Inventory / CR Inv Adj Income (backward compatible)
- [ ] Owner's Capital account auto-created on first use via `getAccountId`
- [ ] All journal entries remain balanced (debits = credits)

---

## Work Package 3: Fix Cash Register Session GL Integration

**Goal:** Opening a cash register session must create a journal entry linking the float to Owner's Capital.

### Root Cause

`cash-register-ipc.ts:143-152` — Creates session record with `openingBalance` but posts no journal entry. The float amount exists only in the register module with no accounting trail.

### Files to Modify

| # | File | Change |
|---|------|--------|
| 3.1 | `src/main/ipc/cash-register-ipc.ts` | Import `createJournalEntry` and `ACCOUNT_CODES`; post JE when opening session with non-zero balance |

### Implementation Details

**`cash-register-ipc.ts` — Open session handler (after line ~152):**

Add after the `cashRegisterSessions.insert` block, before the audit log:
```typescript
// Post journal entry for opening float (capital → cash)
if (data.openingBalance > 0) {
  await createJournalEntry({
    description: `Cash register opening float for ${today}`,
    referenceType: 'cash_register_session',
    referenceId: newSession.id,
    branchId: data.branchId,
    userId: userSession.userId,
    lines: [
      {
        accountCode: ACCOUNT_CODES.CASH_IN_HAND,
        debitAmount: data.openingBalance,
        creditAmount: 0,
        description: `Opening cash float for session ${today}`,
      },
      {
        accountCode: ACCOUNT_CODES.OWNERS_CAPITAL,
        debitAmount: 0,
        creditAmount: data.openingBalance,
        description: `Capital contribution: opening cash float ${today}`,
      },
    ],
  })
}
```

### Important Consideration

This fix assumes the opening float is ALWAYS an owner capital injection. In practice:
- **First session ever**: Float is genuinely from capital → Credit Owner's Capital
- **Subsequent sessions**: Float is carried over from previous day's closing → Should NOT create a new capital JE (it's the same cash)

**Better logic:**
```typescript
// Only post JE for opening float if it's a new capital injection
// (not carried over from previous session)
const isCapitalInjection = !previousSession ||
  (previousSession.closingBalance !== null &&
   data.openingBalance > previousSession.closingBalance)

if (data.openingBalance > 0 && isCapitalInjection) {
  const extraCapital = previousSession?.closingBalance
    ? data.openingBalance - previousSession.closingBalance
    : data.openingBalance

  if (extraCapital > 0) {
    await createJournalEntry({
      description: `Cash register capital injection for ${today}`,
      referenceType: 'cash_register_session',
      referenceId: newSession.id,
      branchId: data.branchId,
      userId: userSession.userId,
      lines: [
        {
          accountCode: ACCOUNT_CODES.CASH_IN_HAND,
          debitAmount: extraCapital,
          creditAmount: 0,
          description: `Additional cash float for session ${today}`,
        },
        {
          accountCode: ACCOUNT_CODES.OWNERS_CAPITAL,
          debitAmount: 0,
          creditAmount: extraCapital,
          description: `Capital contribution: cash float injection ${today}`,
        },
      ],
    })
  }
}
```

### Verification

- [ ] First-ever session with Rs 15,000 opening creates JE: DR Cash in Hand 15,000 / CR Owner's Capital 15,000
- [ ] Subsequent session with same carry-over balance creates NO JE
- [ ] Session with higher opening than previous closing creates JE only for the difference
- [ ] Cash in Hand account balance increases by float amount
- [ ] Owner's Capital account balance increases by float amount
- [ ] Balance Sheet equation holds after session opening

---

## Work Package 4: Investigate & Fix Empty Cash Transactions

**Goal:** Ensure cash sales always create a `cash_transactions` record when a register session is open.

### Root Cause Analysis

From `sales-ipc.ts:413-457`, cash transactions are only inserted when:
1. `data.amountPaid > 0` (was true — Rs 55,000 paid)
2. An open session exists for today's date AND the same `branchId`
3. Payment method is `'cash'` or `'cod'`, OR `data.payments` array has a cash payment

**Most likely cause:** The sale (`2026-03-22T05:42:00`) may have been created BEFORE the cash register session was opened, OR there's a `branchId` mismatch between the sale and the session.

### Files to Investigate

| # | File | What to Check |
|---|------|---------------|
| 4.1 | Database | Compare `sales.created_at` vs `cash_register_sessions.opened_at` timestamps |
| 4.2 | Database | Compare `sales.branch_id` vs `cash_register_sessions.branch_id` |
| 4.3 | `src/main/ipc/sales-ipc.ts` | The session lookup query at line ~417 |

### SQL Verification Queries

```sql
-- Check timing: was session opened before or after the sale?
SELECT
  s.invoice_number, s.created_at as sale_time, s.branch_id as sale_branch,
  crs.id as session_id, crs.opened_at as session_opened, crs.branch_id as session_branch
FROM sales s
LEFT JOIN cash_register_sessions crs
  ON crs.session_date = substr(s.sale_date, 1, 10)
  AND crs.branch_id = s.branch_id
  AND crs.status = 'open';

-- Check for branch mismatch
SELECT s.branch_id as sale_branch, crs.branch_id as session_branch
FROM sales s, cash_register_sessions crs;
```

### Proposed Code Fix

Add a fallback in `sales-ipc.ts` that logs a warning when no open session is found for a cash sale, and optionally auto-creates the cash transaction record anyway (linked to the most recent session):

```typescript
if (openSession) {
  // existing logic...
} else if (data.paymentMethod === 'cash' || data.paymentMethod === 'cod') {
  console.warn(
    `Cash sale ${invoiceNumber} completed without an open register session. ` +
    `Cash transaction not recorded in register. Branch: ${data.branchId}`
  )
  // Optionally: find the most recent session and record anyway
  // This is a business decision — discuss with stakeholder
}
```

### Verification

- [ ] Confirmed root cause (timing vs. branch mismatch)
- [ ] Cash sale with open session correctly creates cash_transaction record
- [ ] Cash sale without open session logs a warning
- [ ] Register closing balance reflects all cash sales made during the session
- [ ] Variance between register and GL Cash in Hand is Rs 0

---

## Work Package 5: Corrective Data Entries (One-Time Fix)

**Goal:** Fix the existing data to establish correct accounting state.

**IMPORTANT:** These fixes must be done through the POS application UI (Finance → Journals → New Entry) to maintain audit trail integrity. If done via direct SQL, the audit logs won't capture the changes.

### Step 5.1: Create Equity Accounts

**Via:** Finance → Chart of Accounts → Add Account

| Account Code | Account Name | Type | Sub-Type | Normal Balance | Description |
|-------------|-------------|------|----------|----------------|-------------|
| 3000 | Owner's Capital | Equity | owner_capital | Credit | Owner's invested capital |
| 3100 | Retained Earnings | Equity | retained_earnings | Credit | Accumulated net income |

- [ ] Account 3000 created successfully
- [ ] Account 3100 created successfully
- [ ] Both appear in Balance Sheet under Equity section

### Step 5.2: Reverse Phantom Revenue (3 Reversing Journal Entries)

**Via:** Finance → Journals → New Entry (Manual)

**Entry 5.2.1 — Reverse JE#1 (AKM .223 stock, Rs 250,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 4900 Inv Adj Income | 250,000 | — |
| 2 | 1200 Inventory | — | 250,000 |
Description: "CORRECTION: Reverse phantom revenue for initial AKM .223 stock entry"

- [ ] Entry posted. Inv Adj Income reduced by 250,000
- [ ] Inventory reduced by 250,000

**Entry 5.2.2 — Reverse JE#2 (Bretta B+, Rs 85,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 4900 Inv Adj Income | 85,000 | — |
| 2 | 1200 Inventory | — | 85,000 |
Description: "CORRECTION: Reverse phantom revenue for initial Bretta B+ stock entry"

- [ ] Entry posted. Inv Adj Income reduced by 85,000
- [ ] Inventory reduced by 85,000

**Entry 5.2.3 — Reverse JE#3 (Bretta A+, Rs 200,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 4900 Inv Adj Income | 200,000 | — |
| 2 | 1200 Inventory | — | 200,000 |
Description: "CORRECTION: Reverse phantom revenue for initial Bretta A+ stock entry"

- [ ] Entry posted. Inv Adj Income reduced by 200,000
- [ ] Inventory reduced by 200,000

**Checkpoint after 5.2:** Inv Adj Income = 0, Inventory = -25,000 (will be corrected in 5.3)

### Step 5.3: Re-Post Stock as Owner's Capital (3 New Journal Entries)

**Via:** Finance → Journals → New Entry (Manual)

**Entry 5.3.1 — AKM .223 stock as capital (Rs 250,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 1200 Inventory | 250,000 | — |
| 2 | 3000 Owner's Capital | — | 250,000 |
Description: "CORRECTION: Initial AKM .223 inventory funded by owner capital"

- [ ] Entry posted. Inventory +250,000, Owner's Capital +250,000

**Entry 5.3.2 — Bretta B+ stock as capital (Rs 85,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 1200 Inventory | 85,000 | — |
| 2 | 3000 Owner's Capital | — | 85,000 |
Description: "CORRECTION: Initial Bretta B+ inventory funded by owner capital"

- [ ] Entry posted. Inventory +85,000, Owner's Capital +85,000

**Entry 5.3.3 — Bretta A+ stock as capital (Rs 200,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 1200 Inventory | 200,000 | — |
| 2 | 3000 Owner's Capital | — | 200,000 |
Description: "CORRECTION: Initial Bretta A+ inventory funded by owner capital"

- [ ] Entry posted. Inventory +200,000, Owner's Capital +200,000

**Checkpoint after 5.3:**
- Inventory = 510,000 (restored)
- Inv Adj Income = 0 (cleared)
- Owner's Capital = 535,000

### Step 5.4: Post Opening Cash Float as Capital

**Via:** Finance → Journals → New Entry (Manual)

**Entry 5.4.1 — Cash float (Rs 15,000):**
| Line | Account | Debit | Credit |
|------|---------|-------|--------|
| 1 | 1010 Cash in Hand | 15,000 | — |
| 2 | 3000 Owner's Capital | — | 15,000 |
Description: "CORRECTION: Cash register opening float — owner capital injection"

- [ ] Entry posted. Cash in Hand +15,000, Owner's Capital +15,000

**Checkpoint after 5.4:**
- Cash in Hand = 70,000 (55,000 + 15,000)
- Owner's Capital = 550,000 (535,000 + 15,000)

### Step 5.5: Final Verification

After all entries posted, verify the corrected state:

```
EXPECTED CORRECTED STATE:
─────────────────────────────────────────
BALANCE SHEET:
  Assets:
    1010 Cash in Hand      = Rs 70,000
    1200 Inventory          = Rs 510,000
    TOTAL ASSETS            = Rs 580,000

  Liabilities:
    TOTAL LIABILITIES       = Rs 0

  Equity:
    3000 Owner's Capital   = Rs 550,000
    3100 Retained Earnings  = Rs 0 (net income flows here at period end)
    Current Net Income      = Rs 30,000 (55,000 rev - 25,000 COGS)
    TOTAL EQUITY            = Rs 580,000

  BALANCED: 580,000 = 0 + 580,000 ✓

INCOME STATEMENT:
  4000 Sales Revenue        = Rs 55,000
  4900 Inv Adj Income       = Rs 0
  5000 COGS                 = Rs 25,000
  GROSS PROFIT              = Rs 30,000
  NET INCOME                = Rs 30,000

TRIAL BALANCE:
  Total Debits  = 70,000 + 510,000 + 25,000 = Rs 605,000
  Total Credits = 55,000 + 0 + 550,000       = Rs 605,000
  BALANCED ✓
```

- [ ] Balance Sheet: Assets (580,000) = Liabilities (0) + Equity (580,000)
- [ ] Income Statement: Revenue (55,000) - COGS (25,000) = Net Income (30,000)
- [ ] Trial Balance: Total Debits = Total Credits
- [ ] Inv Adj Income (4900) balance = 0
- [ ] Owner's Capital (3000) balance = 550,000
- [ ] Cash in Hand (1010) balance = 70,000
- [ ] Inventory (1200) balance = 510,000
- [ ] No phantom revenue remains in any revenue account

---

## Work Package 6: Cash Register-to-Sale Sync Investigation

**Goal:** Determine why `cash_transactions` is empty and fix the integration.

### Investigation Steps

```sql
-- Step 1: Check timestamps
SELECT
  'sale' as type, created_at FROM sales
UNION ALL
SELECT
  'session' as type, opened_at FROM cash_register_sessions
ORDER BY created_at;

-- Step 2: Check branch IDs
SELECT 'sale' as type, branch_id FROM sales
UNION ALL
SELECT 'session' as type, branch_id FROM cash_register_sessions;
```

- [ ] Confirmed: sale was processed [before/after] session was opened
- [ ] Confirmed: branch IDs [match/mismatch]
- [ ] Root cause identified: _______________

### Possible Fixes by Root Cause

**If timing issue (sale before session):**
- Add a pre-sale check: require an open cash register session for cash sales
- Or: queue the cash_transaction and insert it when the session opens
- Recommended: Block cash sales when no register session is open (show dialog prompting user to open register first)

**If branch mismatch:**
- Ensure the POS UI uses a consistent branchId for both register and sales
- Check if `data.branchId` in the sale handler matches the current branch context

**If race condition:**
- Wrap the session lookup + cash_transaction insert in the same database transaction (already in `withTransaction` block — verify the session query is inside it)

- [ ] Fix implemented
- [ ] Tested: new cash sale creates cash_transaction record
- [ ] Register closing balance matches GL Cash in Hand

---

## Implementation Order & Dependencies

```
WP1 ──→ WP2 (needs OWNERS_CAPITAL in ACCOUNT_CODES)
  │
  ├──→ WP3 (needs OWNERS_CAPITAL in ACCOUNT_CODES)
  │
  └──→ WP5 (needs equity accounts to exist for manual JEs)
           │
           └──→ Final Verification

WP4 ──→ Independent (investigation, can run in parallel with WP1-3)

WP6 ──→ Independent (investigation + fix)
```

**Recommended execution order:**
1. WP1 (5 min) — Add equity account codes and defaults
2. WP2 (15 min) — Fix stock adjustment GL posting with fundingSource
3. WP3 (10 min) — Fix cash register session GL integration
4. WP4 (10 min) — Investigate cash_transactions gap
5. WP5 (20 min) — Post corrective data entries via POS UI (or via code)
6. WP6 (15 min) — Fix cash register-to-sale sync
7. Final verification pass

**Total estimated scope:** 6 files modified, 2 accounts created, 7 corrective journal entries posted

---

## Rollback Plan

If any fix causes unexpected imbalances:

1. **Code changes:** Git revert to pre-fix commit
2. **Data entries:** Post reversing journal entries (swap debits/credits of each correction JE)
3. **Database:** Restore from backup at `~/.config/firearms-pos/backups/firearms-pos-backup-2026-03-21T08-27-47.db`

---

## Post-Fix Recommendations (Ongoing)

1. **Enforce Purchase Orders** — Never use stock adjustments for bulk inventory additions. Stock adjustments should be reserved for physical count corrections only.
2. **Register-Before-Sale** — Block cash sales when no register session is open.
3. **Periodic Reconciliation** — Run a monthly check: Cash in Hand (GL) = Cash Register closing balance.
4. **Period-End Close** — Transfer Net Income to Retained Earnings at month/year end via closing journal entry.
5. **Audit Trail Review** — Review the Journals screen monthly for any auto-generated entries crediting 4900 (Inv Adj Income) — they indicate stock was added outside the purchase order workflow.
