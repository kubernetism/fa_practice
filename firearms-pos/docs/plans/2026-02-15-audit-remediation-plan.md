# Audit Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve remaining audit items: DB transaction wrapping (3 handlers), error handling utility, and LIFO/Weighted Average inventory valuation methods.

**Architecture:** Add `withTransaction` wrapping to 3 IPC handlers following the existing pattern. Create a new `error-handling.ts` utility with error classification and retry logic. Extend `inventory-valuation.ts` with LIFO and Weighted Average methods behind a dispatcher that reads the `stockValuationMethod` setting.

**Tech Stack:** TypeScript, Electron IPC, better-sqlite3, Drizzle ORM

---

### Task 1: Wrap returns:delete in withTransaction

**Files:**
- Modify: `src/main/ipc/returns-ipc.ts:305-363`

**Step 1: Wrap the DB operations in withTransaction**

The handler already imports `withTransaction` (line 18). Wrap the inventory reversal + deletion inside the transaction. Keep validation reads and audit log outside.

```typescript
// In returns-ipc.ts, replace lines 317-343 with:

  ipcMain.handle('returns:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const returnRecord = await db.query.returns.findFirst({
        where: eq(returns.id, id),
      })

      if (!returnRecord) {
        return { success: false, message: 'Return not found' }
      }

      // Get return items to reverse inventory changes
      const items = await db.query.returnItems.findMany({
        where: eq(returnItems.returnId, id),
      })

      // Wrap all mutations in a transaction
      await withTransaction(async ({ db: txDb }) => {
        // Reverse inventory changes for restockable items
        for (const item of items) {
          const existingInventory = await txDb.query.inventory.findFirst({
            where: and(eq(inventory.productId, item.productId), eq(inventory.branchId, returnRecord.branchId)),
          })

          if (existingInventory && item.restockable) {
            await txDb
              .update(inventory)
              .set({
                quantity: sql`${inventory.quantity} - ${item.quantity}`,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(inventory.id, existingInventory.id))
          }
        }

        // Delete return items first
        await txDb.delete(returnItems).where(eq(returnItems.returnId, id))

        // Delete the return record
        await txDb.delete(returns).where(eq(returns.id, id))
      })

      await createAuditLog({
        userId: session?.userId,
        branchId: returnRecord.branchId,
        action: 'delete',
        entityType: 'return',
        entityId: id,
        oldValues: {
          returnNumber: returnRecord.returnNumber,
          totalAmount: returnRecord.totalAmount,
        },
        description: `Deleted return: ${returnRecord.returnNumber}`,
      })

      return { success: true, message: 'Return deleted successfully' }
    } catch (error) {
      console.error('Delete return error:', error)
      return { success: false, message: 'Failed to delete return' }
    }
  })
```

**Step 2: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/main/ipc/returns-ipc.ts
git commit -m "fix: wrap returns:delete in withTransaction for atomicity"
```

---

### Task 2: Wrap expenses:update in withTransaction

**Files:**
- Modify: `src/main/ipc/expenses-ipc.ts:249-396`

**Step 1: Wrap the mutation operations in withTransaction**

The handler already imports `withTransaction` (line 8). Move all DB mutations (payable update/creation, expense update) inside the transaction. Keep initial reads and validations outside. Keep audit logs outside.

```typescript
// In expenses-ipc.ts, replace the handler body from line 272 onward:

  ipcMain.handle('expenses:update', async (_, id: number, data: Partial<NewExpense>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
        with: {
          payable: true,
        },
      })

      if (!existing) {
        return { success: false, message: 'Expense not found' }
      }

      // Validation: Can't change to unpaid if no supplier provided
      if (data.paymentStatus === 'unpaid' && !data.supplierId && !existing.supplierId) {
        return {
          success: false,
          message: 'Supplier is required for unpaid expenses',
        }
      }

      // Validation: Can't change amount if payable exists and has payments
      if (existing.payableId && data.amount && data.amount !== existing.amount) {
        const payable = await db.query.accountPayables.findFirst({
          where: eq(accountPayables.id, existing.payableId),
        })

        if (payable && payable.paidAmount > 0) {
          return {
            success: false,
            message: 'Cannot change amount - payable has existing payments',
          }
        }
      }

      // Handle status change: from unpaid to paid - validate first
      if (existing.paymentStatus === 'unpaid' && data.paymentStatus === 'paid') {
        if (existing.payableId) {
          const payable = await db.query.accountPayables.findFirst({
            where: eq(accountPayables.id, existing.payableId),
          })

          if (payable && payable.status !== 'paid') {
            return {
              success: false,
              message: 'Cannot mark expense as paid - linked payable is not fully paid',
            }
          }
        }
      }

      // Handle status change: from paid to unpaid - validate first
      if (existing.paymentStatus === 'paid' && data.paymentStatus === 'unpaid') {
        const supplierIdToUse = data.supplierId || existing.supplierId
        if (!supplierIdToUse) {
          return {
            success: false,
            message: 'Supplier is required to change expense to unpaid',
          }
        }

        if (!data.dueDate && !existing.dueDate) {
          return {
            success: false,
            message: 'Due date is required to change expense to unpaid',
          }
        }
      }

      // All mutations inside transaction
      const result = await withTransaction(async ({ db: txDb }) => {
        // Update payable amount if needed (amount changed, no payments)
        if (existing.payableId && data.amount && data.amount !== existing.amount) {
          const payable = await txDb.query.accountPayables.findFirst({
            where: eq(accountPayables.id, existing.payableId),
          })

          if (payable) {
            await txDb
              .update(accountPayables)
              .set({
                totalAmount: data.amount,
                remainingAmount: data.amount,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(accountPayables.id, existing.payableId))
          }
        }

        // Create payable if changing from paid to unpaid and no existing payable
        if (existing.paymentStatus === 'paid' && data.paymentStatus === 'unpaid' && !existing.payableId) {
          const supplierIdToUse = data.supplierId || existing.supplierId
          const invoiceNumber = `EXP-${existing.id}-${Date.now()}`

          const payableResult = await txDb
            .insert(accountPayables)
            .values({
              supplierId: supplierIdToUse!,
              purchaseId: null,
              branchId: existing.branchId,
              invoiceNumber: invoiceNumber,
              totalAmount: data.amount || existing.amount,
              paidAmount: 0,
              remainingAmount: data.amount || existing.amount,
              status: 'pending',
              dueDate: data.dueDate || existing.dueDate,
              paymentTerms: data.paymentTerms || existing.paymentTerms,
              notes: `Created from expense status change: expense #${existing.id}`,
              createdBy: session?.userId,
            })
            .returning()

          data.payableId = payableResult[0].id
        }

        // Update the expense
        const updateResult = await txDb
          .update(expenses)
          .set({ ...data, updatedAt: new Date().toISOString() })
          .where(eq(expenses.id, id))
          .returning()

        return updateResult
      })

      // Audit logs outside transaction (existing pattern)
      if (existing.paymentStatus === 'paid' && data.paymentStatus === 'unpaid' && data.payableId && !existing.payableId) {
        await createAuditLog({
          userId: session?.userId,
          branchId: existing.branchId,
          action: 'create',
          entityType: 'account_payable',
          entityId: data.payableId,
          newValues: {
            supplierId: data.supplierId || existing.supplierId,
            totalAmount: data.amount || existing.amount,
            source: 'expense_status_change',
            expenseId: existing.id,
          },
          description: `Created payable from expense #${existing.id} status change`,
        })
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: existing.branchId,
        action: 'update',
        entityType: 'expense',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated expense #${id}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update expense error:', error)
      return { success: false, message: 'Failed to update expense' }
    }
  })
```

**Step 2: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/main/ipc/expenses-ipc.ts
git commit -m "fix: wrap expenses:update in withTransaction for atomicity"
```

---

### Task 3: Wrap journal:post in withTransaction

**Files:**
- Modify: `src/main/ipc/chart-of-accounts-ipc.ts:1-9` (add import)
- Modify: `src/main/ipc/chart-of-accounts-ipc.ts:301-356` (wrap handler)

**Step 1: Add withTransaction import**

Add to the imports at the top of the file:

```typescript
import { withTransaction } from '../utils/db-transaction'
```

**Step 2: Wrap the handler in try/catch and withTransaction**

Replace the `journal:post` handler (lines 301-356):

```typescript
  // Post Journal Entry
  ipcMain.handle('journal:post', async (_, entryId: number, postedBy: number) => {
    try {
      const entry = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, entryId),
        with: {
          lines: {
            with: {
              account: true,
            },
          },
        },
      })

      if (!entry) {
        return { success: false, message: 'Journal entry not found' }
      }

      if (entry.status !== 'draft') {
        return { success: false, message: 'Only draft entries can be posted' }
      }

      const updated = await withTransaction(async ({ db: txDb }) => {
        // Update account balances
        for (const line of entry.lines) {
          const account = line.account
          if (!account) continue

          let newBalance = account.currentBalance
          if (account.normalBalance === 'debit') {
            newBalance += line.debitAmount - line.creditAmount
          } else {
            newBalance += line.creditAmount - line.debitAmount
          }

          await txDb
            .update(chartOfAccounts)
            .set({
              currentBalance: newBalance,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(chartOfAccounts.id, account.id))
        }

        // Update entry status
        const [result] = await txDb
          .update(journalEntries)
          .set({
            status: 'posted',
            postedBy,
            postedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(journalEntries.id, entryId))
          .returning()

        return result
      })

      return { success: true, data: updated }
    } catch (error) {
      console.error('Post journal entry error:', error)
      return { success: false, message: 'Failed to post journal entry' }
    }
  })
```

**Step 3: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/main/ipc/chart-of-accounts-ipc.ts
git commit -m "fix: wrap journal:post in withTransaction for atomicity"
```

---

### Task 4: Create error handling utility

**Files:**
- Create: `src/main/utils/error-handling.ts`

**Step 1: Create the error handling module**

```typescript
/**
 * Error handling utilities for the Firearms POS application.
 *
 * Provides error classification, retry logic for transient errors,
 * and structured error responses for IPC handlers.
 */

// -- Error Categories --

export type ErrorCategory = 'validation' | 'database' | 'business_logic' | 'system'

// -- AppError Class --

export class AppError extends Error {
  readonly code: string
  readonly category: ErrorCategory
  readonly isRetryable: boolean

  constructor(
    message: string,
    options: {
      code?: string
      category?: ErrorCategory
      isRetryable?: boolean
      cause?: unknown
    } = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options.code || 'UNKNOWN_ERROR'
    this.category = options.category || 'system'
    this.isRetryable = options.isRetryable || false
    if (options.cause) {
      this.cause = options.cause
    }
  }
}

// -- Error Classification --

interface ClassifiedError {
  message: string
  code: string
  category: ErrorCategory
  isRetryable: boolean
  originalError: unknown
}

/**
 * Classify an error by inspecting its type and message.
 * SQLite errors are detected by their error codes embedded in messages.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      category: error.category,
      isRetryable: error.isRetryable,
      originalError: error,
    }
  }

  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = (error as Record<string, unknown>)?.code as string | undefined

  // SQLite BUSY — another connection has a write lock
  if (errorCode === 'SQLITE_BUSY' || errorMessage.includes('SQLITE_BUSY') || errorMessage.includes('database is locked')) {
    return {
      message: 'Database is busy. Please try again.',
      code: 'SQLITE_BUSY',
      category: 'database',
      isRetryable: true,
      originalError: error,
    }
  }

  // SQLite LOCKED — table-level lock conflict
  if (errorCode === 'SQLITE_LOCKED' || errorMessage.includes('SQLITE_LOCKED')) {
    return {
      message: 'Database table is locked. Please try again.',
      code: 'SQLITE_LOCKED',
      category: 'database',
      isRetryable: true,
      originalError: error,
    }
  }

  // SQLite CONSTRAINT — unique/FK/check violation
  if (errorCode === 'SQLITE_CONSTRAINT' || errorMessage.includes('SQLITE_CONSTRAINT') || errorMessage.includes('UNIQUE constraint') || errorMessage.includes('FOREIGN KEY constraint')) {
    let userMessage = 'A data constraint was violated.'
    if (errorMessage.includes('UNIQUE constraint')) {
      userMessage = 'A record with this value already exists.'
    } else if (errorMessage.includes('FOREIGN KEY constraint')) {
      userMessage = 'Referenced record does not exist or cannot be removed.'
    }
    return {
      message: userMessage,
      code: 'SQLITE_CONSTRAINT',
      category: 'database',
      isRetryable: false,
      originalError: error,
    }
  }

  // SQLite READONLY
  if (errorCode === 'SQLITE_READONLY' || errorMessage.includes('SQLITE_READONLY')) {
    return {
      message: 'Database is read-only.',
      code: 'SQLITE_READONLY',
      category: 'database',
      isRetryable: false,
      originalError: error,
    }
  }

  // Generic system error
  return {
    message: 'An unexpected error occurred.',
    code: errorCode || 'UNKNOWN_ERROR',
    category: 'system',
    isRetryable: false,
    originalError: error,
  }
}

// -- Retry Logic --

interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
}

/**
 * Retry a function if it fails with a retryable error.
 * Uses exponential backoff: 100ms, 200ms, 400ms by default.
 * Non-retryable errors are rethrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 100 } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const classified = classifyError(error)

      if (!classified.isRetryable || attempt === maxAttempts) {
        throw error
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      console.warn(
        `Retryable error (${classified.code}), attempt ${attempt}/${maxAttempts}. ` +
        `Retrying in ${delay}ms...`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// -- Handler Error Helper --

/**
 * Formats an error for IPC handler responses.
 * Use in catch blocks: `return handleIpcError('Create sale', error)`
 */
export function handleIpcError(
  operation: string,
  error: unknown
): { success: false; message: string } {
  const classified = classifyError(error)
  console.error(`${operation} error [${classified.category}/${classified.code}]:`, error)
  return { success: false, message: classified.message }
}
```

**Step 2: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/main/utils/error-handling.ts
git commit -m "feat: add error handling utility with classification and retry logic"
```

---

### Task 5: Integrate error handling into IPC handlers

**Files:**
- Modify: `src/main/ipc/returns-ipc.ts` (update catch blocks)
- Modify: `src/main/ipc/expenses-ipc.ts` (update catch blocks)
- Modify: `src/main/ipc/chart-of-accounts-ipc.ts` (update catch block)
- Modify: `src/main/ipc/sales-ipc.ts` (update catch blocks)

**Step 1: Add import to each file**

Add to each IPC file's imports:

```typescript
import { handleIpcError } from '../utils/error-handling'
```

**Step 2: Replace catch blocks**

In each handler's catch block, replace the pattern:

```typescript
} catch (error) {
  console.error('Some operation error:', error)
  return { success: false, message: 'Failed to do something' }
}
```

With:

```typescript
} catch (error) {
  return handleIpcError('Some operation', error)
}
```

Apply to all handlers in:
- `returns-ipc.ts`: returns:create, returns:delete, returns:get-all, returns:get, returns:approve, returns:reject
- `expenses-ipc.ts`: expenses:create, expenses:update, expenses:delete, expenses:get-all, expenses:get
- `chart-of-accounts-ipc.ts`: journal:post (the new try/catch added in Task 3)
- `sales-ipc.ts`: sales:create, sales:void, sales:get-all, sales:get

**Step 3: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/main/ipc/returns-ipc.ts src/main/ipc/expenses-ipc.ts src/main/ipc/chart-of-accounts-ipc.ts src/main/ipc/sales-ipc.ts
git commit -m "refactor: integrate error classification into IPC handler catch blocks"
```

---

### Task 6: Add LIFO cost consumption method

**Files:**
- Modify: `src/main/utils/inventory-valuation.ts`

**Step 1: Add the desc import**

The file already imports `asc` from drizzle-orm (line 1). Add `desc`:

```typescript
import { eq, and, asc, desc, sql } from 'drizzle-orm'
```

**Step 2: Add consumeCostLayersLIFO function**

Add after the `consumeCostLayersFIFO` function (after line 106):

```typescript
/**
 * Consume inventory cost layers using LIFO (Last-In, First-Out) method.
 *
 * Same as FIFO but consumes the newest (most recently received) layers first.
 * Ordered by receivedDate DESC instead of ASC.
 *
 * @param productId - The product to consume from
 * @param branchId - The branch location
 * @param quantity - The quantity to consume
 * @returns The total COGS and details of consumed layers
 */
export async function consumeCostLayersLIFO(
  productId: number,
  branchId: number,
  quantity: number
): Promise<CostLayerResult> {
  const db = getDatabase()

  // Get active cost layers ordered by received date (LIFO - newest first)
  const layers = await db.query.inventoryCostLayers.findMany({
    where: and(
      eq(inventoryCostLayers.productId, productId),
      eq(inventoryCostLayers.branchId, branchId),
      eq(inventoryCostLayers.isFullyConsumed, false)
    ),
    orderBy: desc(inventoryCostLayers.receivedDate),
  })

  let remainingQty = quantity
  let totalCost = 0
  const layersConsumed: CostLayerResult['layersConsumed'] = []

  for (const layer of layers) {
    if (remainingQty <= 0) break

    const consumeQty = Math.min(remainingQty, layer.quantity)
    const layerCost = consumeQty * layer.unitCost

    totalCost += layerCost
    remainingQty -= consumeQty

    layersConsumed.push({
      layerId: layer.id,
      quantityConsumed: consumeQty,
      unitCost: layer.unitCost,
      cost: layerCost,
    })

    const newQuantity = layer.quantity - consumeQty
    const isFullyConsumed = newQuantity <= 0

    await db
      .update(inventoryCostLayers)
      .set({
        quantity: newQuantity,
        isFullyConsumed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventoryCostLayers.id, layer.id))
  }

  // Fallback to product cost price for remainder
  if (remainingQty > 0) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    if (product) {
      const fallbackCost = remainingQty * product.costPrice
      totalCost += fallbackCost

      layersConsumed.push({
        layerId: -1,
        quantityConsumed: remainingQty,
        unitCost: product.costPrice,
        cost: fallbackCost,
      })

      console.warn(
        `LIFO: Insufficient cost layers for product ${productId}. ` +
        `Used product.costPrice (${product.costPrice}) for ${remainingQty} units.`
      )
    }
  }

  return { totalCost, layersConsumed }
}
```

**Step 3: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/main/utils/inventory-valuation.ts
git commit -m "feat: add LIFO cost consumption method"
```

---

### Task 7: Add Weighted Average cost consumption method

**Files:**
- Modify: `src/main/utils/inventory-valuation.ts`

**Step 1: Add consumeCostLayersWeightedAverage function**

Add after the `consumeCostLayersLIFO` function:

```typescript
/**
 * Consume inventory cost layers using Weighted Average method.
 *
 * Calculates the weighted average unit cost across all active layers,
 * then consumes layers in FIFO order but reports the averaged cost.
 *
 * @param productId - The product to consume from
 * @param branchId - The branch location
 * @param quantity - The quantity to consume
 * @returns The total COGS and details of consumed layers
 */
export async function consumeCostLayersWeightedAverage(
  productId: number,
  branchId: number,
  quantity: number
): Promise<CostLayerResult> {
  const db = getDatabase()

  // Get all active cost layers
  const layers = await db.query.inventoryCostLayers.findMany({
    where: and(
      eq(inventoryCostLayers.productId, productId),
      eq(inventoryCostLayers.branchId, branchId),
      eq(inventoryCostLayers.isFullyConsumed, false)
    ),
    orderBy: asc(inventoryCostLayers.receivedDate),
  })

  // Calculate weighted average cost
  let totalValue = 0
  let totalQuantity = 0
  for (const layer of layers) {
    totalValue += layer.quantity * layer.unitCost
    totalQuantity += layer.quantity
  }

  let avgCost: number
  if (totalQuantity > 0) {
    avgCost = totalValue / totalQuantity
  } else {
    // Fall back to product cost price
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })
    avgCost = product?.costPrice || 0
  }

  // Consume layers in FIFO order but report averaged cost
  let remainingQty = quantity
  let totalCost = 0
  const layersConsumed: CostLayerResult['layersConsumed'] = []

  for (const layer of layers) {
    if (remainingQty <= 0) break

    const consumeQty = Math.min(remainingQty, layer.quantity)
    const layerCost = consumeQty * avgCost

    totalCost += layerCost
    remainingQty -= consumeQty

    layersConsumed.push({
      layerId: layer.id,
      quantityConsumed: consumeQty,
      unitCost: avgCost,
      cost: layerCost,
    })

    const newQuantity = layer.quantity - consumeQty
    const isFullyConsumed = newQuantity <= 0

    await db
      .update(inventoryCostLayers)
      .set({
        quantity: newQuantity,
        isFullyConsumed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventoryCostLayers.id, layer.id))
  }

  // Fallback for insufficient layers
  if (remainingQty > 0) {
    const fallbackCost = remainingQty * avgCost
    totalCost += fallbackCost

    layersConsumed.push({
      layerId: -1,
      quantityConsumed: remainingQty,
      unitCost: avgCost,
      cost: fallbackCost,
    })

    console.warn(
      `WeightedAverage: Insufficient cost layers for product ${productId}. ` +
      `Used weighted average cost (${avgCost.toFixed(2)}) for ${remainingQty} units.`
    )
  }

  return { totalCost, layersConsumed }
}
```

**Step 2: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/main/utils/inventory-valuation.ts
git commit -m "feat: add Weighted Average cost consumption method"
```

---

### Task 8: Add consumeCostLayers dispatcher and wire up callers

**Files:**
- Modify: `src/main/utils/inventory-valuation.ts` (add dispatcher)
- Modify: `src/main/ipc/sales-ipc.ts` (use dispatcher instead of direct FIFO call)

**Step 1: Add the dispatcher function to inventory-valuation.ts**

Add the `businessSettings` import and the dispatcher at the end of the file (before `consumeMultipleCostLayersFIFO`):

```typescript
import { businessSettings } from '../db/schema'
import { isNull } from 'drizzle-orm'
```

Add the dispatcher function:

```typescript
/**
 * Consume cost layers using the configured valuation method.
 * Reads the stockValuationMethod from business settings and delegates
 * to the appropriate consumption function.
 *
 * @param productId - The product to consume from
 * @param branchId - The branch location
 * @param quantity - The quantity to consume
 * @returns The total COGS and details of consumed layers
 */
export async function consumeCostLayers(
  productId: number,
  branchId: number,
  quantity: number
): Promise<CostLayerResult> {
  const db = getDatabase()

  // Read the valuation method from global settings
  const settings = await db.query.businessSettings.findFirst({
    where: isNull(businessSettings.branchId),
  })

  const method = settings?.stockValuationMethod || 'FIFO'

  switch (method) {
    case 'LIFO':
      return consumeCostLayersLIFO(productId, branchId, quantity)
    case 'Average':
      return consumeCostLayersWeightedAverage(productId, branchId, quantity)
    case 'FIFO':
    default:
      return consumeCostLayersFIFO(productId, branchId, quantity)
  }
}
```

**Step 2: Update sales-ipc.ts to use the dispatcher**

In `src/main/ipc/sales-ipc.ts`:

Change import (line 27):
```typescript
// Before:
import { consumeCostLayersFIFO, restoreCostLayers } from '../utils/inventory-valuation'
// After:
import { consumeCostLayers, restoreCostLayers } from '../utils/inventory-valuation'
```

Change the call site (line 188):
```typescript
// Before:
const fifoResult = await consumeCostLayersFIFO(
// After:
const fifoResult = await consumeCostLayers(
```

**Step 3: Update consumeMultipleCostLayersFIFO to also use the dispatcher**

Rename it to `consumeMultipleCostLayers` and update it to use the dispatcher:

```typescript
/**
 * Consume cost layers for multiple items at once using the configured method.
 *
 * @param items - Array of items to consume
 * @returns Array of cost results for each item
 */
export async function consumeMultipleCostLayers(
  items: Array<{ productId: number; branchId: number; quantity: number }>
): Promise<Array<{ productId: number; result: CostLayerResult }>> {
  const results: Array<{ productId: number; result: CostLayerResult }> = []

  for (const item of items) {
    const result = await consumeCostLayers(
      item.productId,
      item.branchId,
      item.quantity
    )
    results.push({ productId: item.productId, result })
  }

  return results
}
```

Keep the old `consumeMultipleCostLayersFIFO` function as well if anything calls it — check first with grep. If nothing else calls it, remove it.

**Step 4: Verify the app builds**

Run: `cd /home/safdaralishah/Documents/github/fa_practice/firearms-pos && npx tsc --noEmit`
Expected: No type errors

**Step 5: Commit**

```bash
git add src/main/utils/inventory-valuation.ts src/main/ipc/sales-ipc.ts
git commit -m "feat: add valuation method dispatcher, wire up to sales handler"
```

---

### Task 9: Update AUDIT_REPORT.md

**Files:**
- Modify: `md/AUDIT_REPORT.md`

**Step 1: Mark completed items**

Update the following items from `[ ]` to `[x]`:

- Section 4.3: Mark `returns-ipc.ts: delete`, `expenses-ipc.ts: update`, `chart-of-accounts-ipc.ts: post journal entry` as FIXED
- Section 4.4: Mark error classification, retry logic, rollback on failure as FIXED
- Section 4.4 status: Change from "BASIC" to "OPERATIONAL"
- Section 8 Phase 1.2: Mark `chart-of-accounts-ipc.ts` as FIXED
- Section 8 Phase 1.3: Mark LIFO and weighted average as FIXED

**Step 2: Commit**

```bash
git add md/AUDIT_REPORT.md
git commit -m "docs: update audit report — mark transaction, error handling, valuation items as fixed"
```
