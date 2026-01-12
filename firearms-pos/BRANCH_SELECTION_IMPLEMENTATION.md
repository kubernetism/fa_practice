# Branch Selection Feature - Implementation Guide

## Overview
This document provides a comprehensive guide for implementing branch selection throughout the Firearms POS application. The branch selector in the navbar allows users to switch between branches, and all data operations must respect the currently selected branch.

## ✅ Completed Implementation

### 1. Branch Context with localStorage Persistence
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/contexts/branch-context.tsx`

**Key Features:**
- ✅ Persists selected branch to localStorage (`selected-branch-id`)
- ✅ Priority order: localStorage → User's assigned branch → Main branch → First available
- ✅ Dispatches custom event `branch-changed` when branch changes
- ✅ Clears selection on logout

**Usage Pattern:**
```typescript
import { useBranch } from '@/contexts/branch-context'

const { currentBranch, branches, setCurrentBranch } = useBranch()
```

### 2. Header/Navbar Branch Selector
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/components/layout/header.tsx`

**Status:** ✅ Already implemented
- Shows dropdown when multiple branches available
- Shows branch name only when single branch
- Uses Building2 icon from lucide-react

### 3. Screens Already Using Branch Filtering

#### Dashboard
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/dashboard/index.tsx`

**Status:** ✅ Fully implemented
- Filters all stats by `currentBranch.id`
- Shows branch name in subtitle
- Refreshes data when branch changes

#### Sales History
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/sales/index.tsx`

**Status:** ✅ Fully implemented
- Has branch filter dropdown
- Filters sales by selected branch
- Shows branch name in table

#### Inventory
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/inventory/index.tsx`

**Status:** ✅ Fully implemented
- Filters inventory by `selectedBranchFilter` (defaults to 'all')
- Branch filter dropdown in UI
- Shows branch-specific stock levels

#### Purchases
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/purchases/index.tsx`

**Status:** ✅ Uses `currentBranch`
- Already imports and uses `useBranch()` hook
- Filters purchases by branch

### 4. Updated Screens

#### Products Screen
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/products/index.tsx`

**Changes Made:**
- ✅ Added `useBranch()` hook
- ✅ Shows stock levels for `currentBranch`
- ✅ Fetches inventory in parallel with products
- ✅ Displays branch name in subtitle
- ✅ Stock column with color coding (red for out of stock, yellow for low stock)

**Pattern:**
```typescript
const { currentBranch } = useBranch()

// Fetch products with inventory for current branch
const [productsResult, inventoryResult] = await Promise.all([
  window.api.products.getAll({ ... }),
  window.api.inventory.getByBranch(currentBranch.id)
])

// Create inventory map for O(1) lookup
const inventoryMap = new Map<number, number>()
inventoryResult.data.forEach((item) => {
  inventoryMap.set(item.inventory.productId, item.inventory.quantity)
})

// Merge data
const productsWithInventory = productsResult.data.map(product => ({
  ...product,
  stock: inventoryMap.get(product.id) || 0
}))
```

#### Expenses Screen
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/expenses/index.tsx`

**Changes Made:**
- ✅ Added `useBranch()` hook
- ✅ Filters expenses by `currentBranch.id` in `fetchExpenses()`
- ✅ Auto-assigns `branchId: currentBranch.id` to new expenses
- ✅ Displays branch name in subtitle
- ✅ Refreshes when branch changes

**Pattern:**
```typescript
const { currentBranch } = useBranch()

useEffect(() => {
  if (currentBranch) {
    fetchExpenses()
  }
}, [currentBranch])

const fetchExpenses = async () => {
  if (!currentBranch) return

  const response = await window.api.expenses.getAll({
    branchId: currentBranch.id,
    // ... other params
  })
}

// When creating expense
const expenseData = {
  branchId: currentBranch.id,
  // ... other fields
}
```

## 📋 Remaining Screens to Update

### Global Entities (Not Branch-Specific)
These entities are shared across all branches and should NOT be filtered:

#### Customers
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/customers/index.tsx`

**Required Changes:** NONE
- Customers are global entities
- Used across all branches
- No branch filtering needed

#### Suppliers
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/suppliers/index.tsx`

**Required Changes:** NONE
- Suppliers are global entities
- Used across all branches
- No branch filtering needed

#### Products (Product Catalog)
**File:** Products screen already updated above
- Product definitions are global
- Only inventory is branch-specific (already handled)

#### Users
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/users/index.tsx`

**Required Changes:** NONE
- Users are global but assigned to specific branches
- User management is global

#### Categories
**File:** Category management (if separate screen exists)

**Required Changes:** NONE
- Categories are global

### Branch-Specific Entities (Need Filtering)

#### Returns
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/returns/index.tsx`

**Required Changes:**
```typescript
// 1. Import useBranch
import { useBranch } from '@/contexts/branch-context'

// 2. Get current branch
const { currentBranch } = useBranch()

// 3. Filter by branch when fetching
const fetchReturns = async () => {
  if (!currentBranch) return

  const result = await window.api.returns.getAll({
    branchId: currentBranch.id,
    // ... other params
  })
}

// 4. Auto-assign branch when creating
const returnData = {
  branchId: currentBranch.id,
  // ... other fields
}

// 5. Refresh on branch change
useEffect(() => {
  if (currentBranch) {
    fetchReturns()
  }
}, [currentBranch])

// 6. Update subtitle
<p className="text-muted-foreground">
  Manage returns • {currentBranch?.name || 'Select a branch'}
</p>
```

#### Cash Register
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/cash-register/index.tsx`

**Required Changes:**
- Filter cash register sessions by `currentBranch.id`
- Auto-assign branch to new sessions
- Show branch name in UI

**Pattern:** Same as Returns above

#### Commissions
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/commissions/index.tsx`

**Required Changes:**
- Filter commissions by `currentBranch.id`
- Show branch-specific commission data
- May need to filter by user's branch for commission calculations

**Special Note:** Check business logic - commissions might be user-specific rather than branch-specific

#### Referral Persons
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/referral-persons/index.tsx`

**Required Changes:**
- Filter referrals by `currentBranch.id` if they're branch-specific
- Or keep global if referrals work across branches

**Note:** Determine business logic first - are referrals branch-specific or global?

#### Account Receivables
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/account-receivables/index.tsx`

**Required Changes:**
- Filter receivables by `currentBranch.id`
- Show branch-specific outstanding balances
- Auto-assign branch to payments

#### Account Payables
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/account-payables/index.tsx`

**Required Changes:**
- Filter payables by `currentBranch.id`
- Show branch-specific payment obligations
- Auto-assign branch to payments

#### Chart of Accounts
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/chart-of-accounts/index.tsx`

**Decision Needed:** Are accounts branch-specific or global?
- If global: No changes needed
- If branch-specific: Apply filtering pattern

#### POS Screen
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/pos/index.tsx`

**Status:** Likely already using currentBranch
**Verify:**
- Sales are created with correct branchId
- Inventory is checked for current branch only
- Cash register belongs to current branch

#### POS Tabs
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/pos-tabs/index.tsx`

**Required Changes:**
- Filter tabs by `currentBranch.id`
- Only show tabs for current branch
- Auto-assign branch to new tabs

#### Reports
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/reports/index.tsx`

**Required Changes:**
- Add branch filter to all reports
- Default to current branch
- Allow "All Branches" option for admin users
- Include branch name in report headers

#### Branches Management
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/branches/index.tsx`

**Required Changes:** NONE
- This is the branch management screen
- Shows all branches for CRUD operations
- No filtering needed

## 🔧 IPC Handler Verification

### Handlers Already Supporting branchId

#### ✅ Expenses IPC
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/main/ipc/expenses-ipc.ts`

Supports `branchId` parameter in `expenses:get-all`

#### ✅ Dashboard IPC
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/main/ipc/dashboard-ipc.ts`

Requires `branchId` in `dashboard:get-stats`

#### ✅ Inventory IPC
**File:** `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/main/ipc/inventory-ipc.ts`

Has `inventory:get-by-branch` handler

### Handlers to Verify

Check these IPC handlers support branchId filtering:
- `src/main/ipc/returns-ipc.ts`
- `src/main/ipc/cash-register-ipc.ts`
- `src/main/ipc/commissions-ipc.ts`
- `src/main/ipc/account-receivables-ipc.ts`
- `src/main/ipc/account-payables-ipc.ts`
- `src/main/ipc/sales-tabs-ipc.ts`
- `src/main/ipc/reports-ipc.ts`

**Pattern for IPC handlers:**
```typescript
ipcMain.handle(
  'entity:get-all',
  async (
    _,
    params: PaginationParams & {
      branchId?: number  // Add this
      // ... other filters
    }
  ) => {
    const conditions = []

    if (branchId) {
      conditions.push(eq(entities.branchId, branchId))
    }

    // ... rest of query
  }
)
```

## 📝 Standard Implementation Pattern

For any screen that needs branch filtering, follow this pattern:

### 1. Import and Setup
```typescript
import { useBranch } from '@/contexts/branch-context'

export function YourScreen() {
  const { currentBranch } = useBranch()
  // ... other state
```

### 2. Fetch Data on Branch Change
```typescript
useEffect(() => {
  if (currentBranch) {
    fetchData()
  }
}, [currentBranch])

const fetchData = async () => {
  if (!currentBranch) return

  const result = await window.api.yourEntity.getAll({
    branchId: currentBranch.id,
    // ... other params
  })
}
```

### 3. Auto-Assign Branch on Create
```typescript
const handleCreate = async () => {
  if (!currentBranch) {
    alert('No branch selected')
    return
  }

  const data = {
    branchId: currentBranch.id,
    // ... other fields
  }

  await window.api.yourEntity.create(data)
}
```

### 4. Show Branch in UI
```typescript
<div>
  <h1>Your Screen Title</h1>
  <p className="text-muted-foreground">
    Description • {currentBranch?.name || 'Select a branch'}
  </p>
</div>
```

### 5. Optional: Listen for Branch Change Events
```typescript
useEffect(() => {
  const handleBranchChange = (event: CustomEvent) => {
    console.log('Branch changed to:', event.detail.branchId)
    // Perform any additional actions
  }

  window.addEventListener('branch-changed', handleBranchChange as EventListener)

  return () => {
    window.removeEventListener('branch-changed', handleBranchChange as EventListener)
  }
}, [])
```

## 🎯 Testing Checklist

For each updated screen, verify:

- [ ] Data fetches only for current branch
- [ ] Data refreshes when branch is switched
- [ ] New records are created with correct branchId
- [ ] Branch name is displayed in UI
- [ ] No errors when switching branches mid-operation
- [ ] Loading states handled properly
- [ ] Empty states handled properly
- [ ] Permission checks still work correctly

## 🚨 Important Edge Cases

### 1. No Branch Selected
Always check if `currentBranch` exists before operations:
```typescript
if (!currentBranch) return // or show message
```

### 2. Single Branch Users
The header component already handles this:
- Shows dropdown if `branches.length > 1`
- Shows static text if `branches.length === 1`

### 3. Branch Switching During Operation
Consider disabling branch selector during critical operations:
```typescript
<Select disabled={isSaving} value={currentBranch?.id?.toString()}>
  {/* ... */}
</Select>
```

### 4. Logout
Branch context automatically clears localStorage on logout.

## 📊 Summary Statistics

**Total Screens Analyzed:** ~24

**Already Implemented:** 5
- Dashboard ✅
- Sales History ✅
- Inventory ✅
- Purchases ✅
- Header/Navbar ✅

**Updated in This Implementation:** 2
- Products ✅
- Expenses ✅

**Remaining to Update:** ~9
- Returns
- Cash Register
- Commissions
- Referral Persons
- Account Receivables
- Account Payables
- POS Tabs
- Reports
- (Verify POS screen)

**Global/No Changes Needed:** ~8
- Customers
- Suppliers
- Users
- Categories
- Branches Management
- License Settings
- Business Settings
- Audit Logs

## 🔗 Key Files Reference

### Core Implementation
- `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/contexts/branch-context.tsx`
- `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/components/layout/header.tsx`

### Updated Screens
- `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/products/index.tsx`
- `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/expenses/index.tsx`

### Example IPC Handler
- `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/main/ipc/expenses-ipc.ts`

---

**Next Steps:**
1. Review remaining screens and determine which need branch filtering
2. Update each screen following the standard pattern
3. Verify/update IPC handlers to support branchId parameter
4. Test thoroughly with branch switching
5. Document any business logic decisions (e.g., are referrals branch-specific?)
