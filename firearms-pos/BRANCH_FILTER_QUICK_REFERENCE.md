# Branch Filtering - Quick Reference Guide

## Copy-Paste Code Snippets

### 1. Add Import and Hook (Top of Component)

```typescript
import { useBranch } from '@/contexts/branch-context'

export function YourScreen() {
  const { currentBranch } = useBranch()
  // ... existing state ...
```

### 2. Update useEffect for Data Fetching

**Before:**
```typescript
useEffect(() => {
  fetchData()
}, [])
```

**After:**
```typescript
useEffect(() => {
  if (currentBranch) {
    fetchData()
  }
}, [currentBranch])
```

### 3. Add Branch Guard in Fetch Function

**Before:**
```typescript
const fetchData = async () => {
  try {
    const result = await window.api.entity.getAll({
      page: 1,
      limit: 20,
    })
    // ...
  }
}
```

**After:**
```typescript
const fetchData = async () => {
  if (!currentBranch) return

  try {
    const result = await window.api.entity.getAll({
      page: 1,
      limit: 1000,
      branchId: currentBranch.id, // Add this line
    })
    // ...
  }
}
```

### 4. Add Branch to Create Operations

**Before:**
```typescript
const handleCreate = async () => {
  const data = {
    field1: value1,
    field2: value2,
  }
  await window.api.entity.create(data)
}
```

**After:**
```typescript
const handleCreate = async () => {
  if (!currentBranch) {
    alert('No branch selected')
    return
  }

  const data = {
    branchId: currentBranch.id, // Add this line
    field1: value1,
    field2: value2,
  }
  await window.api.entity.create(data)
}
```

### 5. Update Page Title/Subtitle

**Before:**
```typescript
<div>
  <h1>Your Screen</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**After:**
```typescript
<div>
  <h1>Your Screen</h1>
  <p className="text-muted-foreground">
    Description • {currentBranch?.name || 'Select a branch'}
  </p>
</div>
```

### 6. IPC Handler Update (Backend)

**File:** `src/main/ipc/your-entity-ipc.ts`

**Before:**
```typescript
ipcMain.handle(
  'entity:get-all',
  async (_, params: PaginationParams) => {
    const data = await db.query.entities.findMany({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    })
    return { success: true, data }
  }
)
```

**After:**
```typescript
ipcMain.handle(
  'entity:get-all',
  async (
    _,
    params: PaginationParams & { branchId?: number }  // Add branchId
  ) => {
    const conditions = []

    // Add branch filtering
    if (params.branchId) {
      conditions.push(eq(entities.branchId, params.branchId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const data = await db.query.entities.findMany({
      where: whereClause,
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    })
    return { success: true, data }
  }
)
```

## Screen-Specific Patterns

### Pattern A: Simple Branch Filtering (Most Screens)
**Use for:** Returns, Expenses, Cash Register, etc.

```typescript
const { currentBranch } = useBranch()

useEffect(() => {
  if (currentBranch) fetchData()
}, [currentBranch])

const fetchData = async () => {
  if (!currentBranch) return
  const result = await window.api.entity.getAll({
    branchId: currentBranch.id
  })
}

const handleCreate = async (formData) => {
  if (!currentBranch) return
  await window.api.entity.create({
    branchId: currentBranch.id,
    ...formData
  })
}
```

### Pattern B: Branch Filter Dropdown (Sales, Reports)
**Use for:** Screens that need to view data across branches

```typescript
const { currentBranch, branches } = useBranch()
const [filterBranchId, setFilterBranchId] = useState<string>('all')

useEffect(() => {
  if (currentBranch) {
    setFilterBranchId(currentBranch.id.toString())
  }
}, [currentBranch])

const fetchData = async () => {
  const branchId = filterBranchId === 'all'
    ? undefined
    : parseInt(filterBranchId)

  const result = await window.api.entity.getAll({ branchId })
}

// In JSX:
<Select value={filterBranchId} onValueChange={setFilterBranchId}>
  <SelectTrigger>
    <Building2 className="mr-2 h-4 w-4" />
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Branches</SelectItem>
    {branches.map((branch) => (
      <SelectItem key={branch.id} value={branch.id.toString()}>
        {branch.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Pattern C: Products with Branch-Specific Inventory
**Use for:** Product catalog showing stock levels

```typescript
const { currentBranch } = useBranch()

const fetchProducts = async () => {
  if (!currentBranch) return

  // Fetch products and inventory in parallel
  const [productsResult, inventoryResult] = await Promise.all([
    window.api.products.getAll({ /* no branch filter */ }),
    window.api.inventory.getByBranch(currentBranch.id)
  ])

  // Create inventory map
  const inventoryMap = new Map()
  inventoryResult.data?.forEach(item => {
    inventoryMap.set(item.inventory.productId, item.inventory.quantity)
  })

  // Merge data
  const productsWithStock = productsResult.data.map(product => ({
    ...product,
    stock: inventoryMap.get(product.id) || 0
  }))

  setProducts(productsWithStock)
}
```

## Quick Checklist

When updating a screen for branch filtering:

- [ ] Added `import { useBranch } from '@/contexts/branch-context'`
- [ ] Added `const { currentBranch } = useBranch()`
- [ ] Updated `useEffect` to depend on `currentBranch`
- [ ] Added `if (!currentBranch) return` guard in fetch function
- [ ] Added `branchId: currentBranch.id` to API calls
- [ ] Added branch guard in create/update handlers
- [ ] Updated page subtitle to show branch name
- [ ] Verified IPC handler supports `branchId` parameter
- [ ] Tested branch switching
- [ ] Tested creating new records with correct branchId

## Common Pitfalls

### ❌ Don't Do This:
```typescript
// Missing guard - will crash if no branch selected
const fetchData = async () => {
  const result = await window.api.entity.getAll({
    branchId: currentBranch.id  // ❌ Error if currentBranch is null!
  })
}
```

### ✅ Do This:
```typescript
const fetchData = async () => {
  if (!currentBranch) return  // ✅ Guard clause

  const result = await window.api.entity.getAll({
    branchId: currentBranch.id
  })
}
```

### ❌ Don't Do This:
```typescript
// Won't refresh when branch changes
useEffect(() => {
  fetchData()
}, [])  // ❌ Missing currentBranch dependency
```

### ✅ Do This:
```typescript
useEffect(() => {
  if (currentBranch) {
    fetchData()
  }
}, [currentBranch])  // ✅ Refreshes when branch changes
```

## Files Modified

### Core Files
1. `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/contexts/branch-context.tsx` - ✅ Updated with localStorage
2. `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/components/layout/header.tsx` - ✅ Already has selector

### Example Implementations
3. `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/products/index.tsx` - ✅ Pattern C
4. `/home/safdaralishah/Documents/github/fa_practice/firearms-pos/src/renderer/screens/expenses/index.tsx` - ✅ Pattern A

## Need Help?

See the full implementation guide: `BRANCH_SELECTION_IMPLEMENTATION.md`

---

**Quick Start:** Copy Pattern A snippets above for most screens. Test with branch switching to verify it works correctly.
