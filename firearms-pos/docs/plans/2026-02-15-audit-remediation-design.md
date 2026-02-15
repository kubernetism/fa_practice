# Audit Remediation: Transactions, Error Handling, Valuation Methods

**Date:** February 15, 2026
**Scope:** Resolve remaining open items from AUDIT_REPORT.md (Sections 4.3, 4.4, 8 Phase 1.3)

---

## Group 1: DB Transaction Wrapping

Wrap 3 remaining IPC handlers using the existing `withTransaction` utility from `src/main/utils/db-transaction.ts`.

### 1.1 returns-ipc.ts — delete handler (~line 305)

Wrap inventory reversal + return items deletion + return deletion in `withTransaction`. Audit log stays outside the transaction (existing pattern).

**Operations to wrap:**
- Fetch return items (read)
- Reverse inventory for restockable items (update product quantities)
- Delete return items
- Delete return record

### 1.2 expenses-ipc.ts — update handler (~line 249)

Wrap the entire status transition logic in `withTransaction`. Validations/reads stay outside.

**Operations to wrap:**
- Payable creation (unpaid status transitions)
- Payable amount updates
- Expense record update

### 1.3 chart-of-accounts-ipc.ts — journal:post handler (~line 301)

Wrap all account balance updates + entry status change in `withTransaction`. Add try/catch to match existing handler pattern (currently uses bare `throw`).

**Operations to wrap:**
- Loop of account balance updates (debit/credit application)
- Journal entry status update to 'posted'

---

## Group 2: Error Handling

### 2.1 Error Classification

Create `src/main/utils/error-handling.ts` with:

- `AppError` class extending `Error` with fields: `code`, `category`, `isRetryable`, `statusCode`
- Categories: `validation`, `database`, `business_logic`, `system`
- `classifyError(error)` function that inspects error types:
  - SQLite BUSY/LOCKED → `database` category, `isRetryable: true`
  - SQLite CONSTRAINT → `database` category, `isRetryable: false`
  - Validation errors → `validation` category
  - Unknown → `system` category

### 2.2 Retry Logic

- `withRetry(fn, options)` wrapper for retryable operations
- Max 3 attempts, exponential backoff (100ms, 200ms, 400ms)
- Only retries when `classifyError` returns `isRetryable: true` (SQLITE_BUSY, SQLITE_LOCKED)
- Non-retryable errors rethrow immediately

### 2.3 Rollback on Failure

Already handled by `withTransaction` (auto-rollback on exception). No additional rollback logic needed. The transaction wrapping from Group 1 completes this item.

### 2.4 Integration

Update catch blocks in IPC handlers to use `classifyError` for:
- Better console logging (include error category and code)
- More specific error messages returned to renderer

---

## Group 3: LIFO & Weighted Average Valuation

All changes in `src/main/utils/inventory-valuation.ts`. Setting `stockValuationMethod` already exists with FIFO/LIFO/Average options.

### 3.1 consumeCostLayersLIFO

Same algorithm as FIFO but queries cost layers ordered by `receivedDate DESC` (newest first). Same `CostLayerResult` return type, same fallback to `costPrice` when layers are insufficient.

### 3.2 consumeCostLayersWeightedAverage

1. Query all non-consumed layers for the product/branch
2. Calculate weighted average unit cost: `sum(qty * unitCost) / sum(qty)`
3. Consume layers in FIFO order (oldest first) but report the averaged cost
4. Same return type

### 3.3 consumeCostLayers dispatcher

Single entry point that reads the `stockValuationMethod` setting and delegates:
- `'FIFO'` → `consumeCostLayersFIFO`
- `'LIFO'` → `consumeCostLayersLIFO`
- `'Average'` → `consumeCostLayersWeightedAverage`

### 3.4 Caller updates

Replace direct calls to `consumeCostLayersFIFO` with `consumeCostLayers` in:
- `gl-posting.ts` (postSaleToGL, postReturnToGL, postVoidSaleToGL)
- Any other callers found during implementation

### 3.5 Scope

- Future sales only — switching the setting changes behavior for new transactions
- No revaluation of existing inventory or past journal entries
