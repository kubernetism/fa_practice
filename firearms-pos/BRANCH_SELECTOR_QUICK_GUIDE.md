# Branch Selector - Developer Quick Reference

## How to Use Branch Filtering in Your Screens

### 1. Import the Hook
```typescript
import { useBranch } from '@/contexts/branch-context'
```

### 2. Get Current Branch
```typescript
export function YourScreen() {
  const { currentBranch } = useBranch()

  // currentBranch contains: { id, name, code, isMain, ... }
}
```

### 3. Filter Data by Branch
```typescript
const fetchData = useCallback(async () => {
  if (!currentBranch) return

  const result = await window.api.yourEntity.getAll({
    branchId: currentBranch.id,  // ← Add this filter
    page: 1,
    limit: 20,
  })

  if (result.success) {
    setData(result.data)
  }
}, [currentBranch])

useEffect(() => {
  fetchData()
}, [fetchData])
```

### 4. Auto-Refresh When Branch Changes
The `useEffect` with `currentBranch` in dependencies will automatically re-run when the user selects a different branch.

### 5. Create Records with Branch
```typescript
const handleCreate = async (formData) => {
  if (!currentBranch) {
    alert('No branch selected')
    return
  }

  await window.api.yourEntity.create({
    ...formData,
    branchId: currentBranch.id,  // ← Always include this
  })
}
```

### 6. Show Branch Name in UI
```typescript
<div>
  <h1>Your Screen Title</h1>
  <p className="text-muted-foreground">
    Description {currentBranch && `- ${currentBranch.name}`}
  </p>
</div>
```

---

## Complete Example

```typescript
import React, { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/contexts/branch-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function MyNewScreen() {
  const { currentBranch } = useBranch()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data filtered by current branch
  const fetchItems = useCallback(async () => {
    if (!currentBranch) return

    setIsLoading(true)
    try {
      const result = await window.api.myEntity.getAll({
        branchId: currentBranch.id,
      })

      if (result.success) {
        setItems(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch])

  // Auto-refresh when branch changes
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Create new item with branch
  const handleCreate = async (name: string) => {
    if (!currentBranch) {
      alert('No branch selected')
      return
    }

    const result = await window.api.myEntity.create({
      name,
      branchId: currentBranch.id,
    })

    if (result.success) {
      fetchItems() // Refresh list
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My New Screen</h1>
        <p className="text-muted-foreground">
          Description {currentBranch && `- ${currentBranch.name}`}
        </p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          {items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </Card>
      )}
    </div>
  )
}
```

---

## useBranch() API Reference

```typescript
interface BranchContextValue {
  // Current selected branch
  currentBranch: Branch | null

  // All available branches
  branches: Branch[]

  // Change selected branch
  setCurrentBranch: (branch: Branch) => void

  // Loading state
  isLoading: boolean

  // Refresh branches list
  refreshBranches: () => Promise<void>
}

interface Branch {
  id: number
  code: string
  name: string
  address?: string
  city?: string
  phone?: string
  isMain: boolean
  createdAt: string
  updatedAt: string
}
```

---

## When NOT to Filter by Branch

These entity types are typically **global** across all branches:

- **Customers** - Shared across all branches
- **Suppliers** - Shared across all branches
- **Users** - Global with branch assignments
- **Branches** - Obviously global
- **Chart of Accounts** - Typically global

---

## Testing Your Implementation

1. **Switch Branches:** Select different branches from the header dropdown
2. **Verify Data:** Ensure only branch-specific data appears
3. **Create Records:** Create new items and verify they have correct `branchId`
4. **Edge Cases:** Test with no branch selected, single branch, multiple branches

---

## Common Mistakes to Avoid

### ❌ Don't forget the import
```typescript
// Missing import causes "useBranch is not defined" error
const { currentBranch } = useBranch() // ❌ Error!
```

### ❌ Don't skip null check
```typescript
// Will crash if no branch selected
const fetchData = async () => {
  await window.api.items.getAll({
    branchId: currentBranch.id  // ❌ currentBranch might be null!
  })
}
```

### ✅ Always check for null
```typescript
const fetchData = async () => {
  if (!currentBranch) return  // ✅ Safe!

  await window.api.items.getAll({
    branchId: currentBranch.id
  })
}
```

### ❌ Don't forget useEffect dependency
```typescript
// Won't refresh when branch changes
useEffect(() => {
  fetchData()
}, []) // ❌ Missing currentBranch dependency!
```

### ✅ Include all dependencies
```typescript
useEffect(() => {
  fetchData()
}, [fetchData]) // ✅ Will refresh when branch changes!
```

---

## FAQ

**Q: What if my screen doesn't need branch filtering?**
A: Don't use `useBranch()`. Examples: Customers, Suppliers, Users, etc.

**Q: Should I show branch dropdown in my screen?**
A: No, the header already has one. Just use `currentBranch` value.

**Q: Can users change branch mid-operation?**
A: Yes! That's why your `useEffect` should refresh data when `currentBranch` changes.

**Q: What if no branch is selected?**
A: Your screen should show a message or disable operations. Check `if (!currentBranch)`.

**Q: How do I get the branch name?**
A: Use `currentBranch.name` (with null check: `currentBranch?.name`)

---

**Last Updated:** January 12, 2026
**See Also:** `BRANCH_SELECTOR_IMPLEMENTATION_STATUS.md` for full implementation details
