# Transaction Reversal System Design

**Date:** 2026-03-04
**Status:** Approved

## Overview

A centralized reversal request and approval system that allows users to request reversal of any incorrect transaction, with admin approval required before execution. Corrections follow the "full void + re-entry" model — no partial corrections.

## Data Model

### New Table: `reversal_requests`

| Column | Type | Description |
|--------|------|-------------|
| id | integer PK | Auto-increment |
| requestNumber | text UNIQUE | REV-YYYY-NNNN format |
| entityType | enum | sale, purchase, expense, journal_entry, ar_payment, ap_payment, stock_adjustment, stock_transfer, commission, return, receivable, payable |
| entityId | integer | ID of the transaction to reverse |
| reason | text NOT NULL | User-provided reason for reversal |
| priority | enum | low, medium, high, urgent (default: medium) |
| status | enum | pending, approved, rejected, completed, failed |
| requestedBy | integer FK → users | User who requested the reversal |
| reviewedBy | integer FK → users | Admin who approved or rejected |
| reviewedAt | timestamp | When the request was reviewed |
| rejectionReason | text | Reason for rejection (if rejected) |
| reversalDetails | text (JSON) | Record of what was reversed (GL entries, inventory changes, amounts) |
| errorDetails | text | Error information if status=failed |
| branchId | integer FK → branches | Branch context |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Status Flow

```
pending → approved → completed
pending → approved → failed (retry possible)
pending → rejected
```

- No time limit on reversals — any transaction can be reversed at any time.
- A transaction can only have one active (pending/approved) reversal request.

## Reversal Logic Per Entity Type

### Sale Reversal (existing, to be integrated)
1. Restore inventory quantities for each sale item
2. Restore cost layers (FIFO/LIFO/Weighted Average tracking)
3. Mark sale as `isVoided = true` with `voidReason`
4. Cancel linked commissions
5. Cancel linked account receivables
6. Post reversing GL entry via `postVoidSaleToGL()`
7. Create audit log

### Purchase Reversal (new)
1. Reverse received inventory quantities
2. Remove or mark cost layers as consumed (reverse of receive)
3. Post reversing GL entry (reverse inventory increase, reverse AP/cash)
4. Cancel linked account payables
5. Set purchase status to 'cancelled'
6. Create audit log

### Expense Reversal (new)
1. Post reversing GL entry (reverse expense account debit, reverse cash/AP credit)
2. If linked to unpaid account payable, cancel the payable
3. Mark expense as voided (add `isVoided` and `voidReason` fields to expenses table)
4. Create audit log

### Journal Entry Reversal (new — schema already supports it)
1. Fetch original entry and all its lines
2. Create new journal entry with swapped debits/credits
3. Set new entry description to "Reversal of [original entryNumber]"
4. Update original entry: status='reversed', reversedBy, reversedAt
5. Link via reversalEntryId (both directions)
6. Post reversing entry to update account balances
7. Create audit log

### AR Payment Reversal (new)
1. Post reversing GL entry (reverse cash debit, reverse AR credit)
2. Restore receivable outstanding amount
3. Update receivable status back to 'pending' or 'partial' based on remaining balance
4. Create audit log

### AP Payment Reversal (new)
1. Post reversing GL entry (reverse AP debit, reverse cash credit)
2. Restore payable outstanding amount
3. Update payable status back to 'pending' or 'partial' based on remaining balance
4. Create audit log

### Stock Adjustment Reversal (new)
1. Create counter-adjustment (reverse the quantity change)
2. Post reversing GL entry if original had GL posting
3. Update product stock quantity
4. Create audit log

### Stock Transfer Reversal (new)
1. Move quantity back from destination branch to source branch
2. Post reversing GL entries for both branches
3. Create audit log

### Commission Reversal (new)
1. Post reversing GL entry
2. Mark commission as cancelled
3. Create audit log

### Return Reversal (new)
1. Re-deduct inventory (reverse the restock)
2. Reverse GL credit entries from the return
3. Restore original sale item status if applicable
4. Create audit log

## Validation Rules

Before creating a reversal request:
- Transaction must exist and not already be reversed/voided/cancelled
- No other pending or approved reversal request exists for the same transaction
- User must have permission to request reversals

Before executing an approved reversal:
- Re-validate transaction hasn't been modified since request was created
- Verify sufficient inventory exists (for purchase reversals)
- Verify account balances won't go negative inappropriately
- All operations wrapped in `withTransaction` for atomicity

## Workflow

### User Flow
1. User navigates to any transaction detail screen
2. Clicks "Request Reversal" button (visible only on reversible transactions)
3. Modal collects: reason (required), priority (default: medium)
4. Submit creates `reversal_request` with status=pending
5. "Reversal Pending" badge appears on the transaction
6. User receives notification when request is approved/rejected

### Admin Flow
1. "Reversal Requests" appears in sidebar with pending count badge
2. Dashboard lists all requests, filterable by: status, entityType, priority, branch, date range
3. Each request card shows:
   - Transaction summary (type, number, amounts, date)
   - Requestor name and reason
   - Priority indicator
   - Transaction detail link
4. Admin clicks "Approve" or "Reject"
5. On approve: system executes reversal atomically → status=completed (or failed)
6. On reject: admin provides rejection reason → status=rejected
7. Notification sent to requesting user

### Transaction Detail View
- Shows reversal status badge if a request exists (Pending/Approved/Rejected/Completed)
- Shows reversal history section if completed (what was reversed, when, by whom)

## Error Handling

- All reversals use `withTransaction` — no partial state possible
- If reversal execution fails, status=failed with error details stored in `errorDetails`
- Admin can retry failed reversals after resolving the underlying issue
- Pre-execution validation catches most issues before attempting reversal

## Audit Trail

Every reversal lifecycle event creates an audit log entry:

| Event | Audit Action | Details |
|-------|-------------|---------|
| Request created | reversal_request | entityType, entityId, reason, priority |
| Request approved | reversal_review | reviewedBy, approval |
| Request rejected | reversal_review | reviewedBy, rejectionReason |
| Reversal executed | reversal_executed | reversalDetails JSON (GL entries, inventory changes, amounts) |
| Reversal failed | reversal_failed | errorDetails |

The `reversalDetails` JSON captures:
- GL journal entries created (entry numbers, amounts)
- Inventory quantity changes (product, branch, qty delta)
- Account balance changes (account, before/after)
- Linked record status changes (AR/AP status updates)

## Schema Changes Summary

1. **New table:** `reversal_requests` (as defined above)
2. **Modify `expenses`:** Add `isVoided` (boolean, default false) and `voidReason` (text) columns
3. **Modify `audit_logs` action enum:** Add 'reversal_request', 'reversal_review', 'reversal_executed', 'reversal_failed'
4. **Modify `audit_logs` entityType enum:** Add 'reversal_request'

## IPC Handlers (Electron) / Server Actions (Web)

| Handler | Description |
|---------|-------------|
| `reversal:create` | Create a new reversal request |
| `reversal:list` | List reversal requests with filters |
| `reversal:get` | Get single reversal request with transaction details |
| `reversal:approve` | Approve and execute a reversal |
| `reversal:reject` | Reject a reversal request |
| `reversal:retry` | Retry a failed reversal |
| `reversal:stats` | Dashboard stats (pending count, by type, by priority) |

## UI Components

1. **ReversalRequestModal** — reason + priority form
2. **ReversalDashboard** — admin list/filter/action page
3. **ReversalRequestCard** — summary card in dashboard
4. **ReversalStatusBadge** — shown on transaction detail screens
5. **ReversalHistorySection** — shown on reversed transactions
