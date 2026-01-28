# Setup Wizard Redesign - Two-Phase Onboarding

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the first-launch setup wizard into a fast Phase 1 (4-step wizard: Welcome, Business Info, Branch+Tax, Admin Account) and a Phase 2 dashboard checklist card that guides users through 13 remaining setup items.

**Architecture:** Phase 1 modifies the existing setup wizard by merging Branch+Tax into one step, replacing Operations with Admin Account creation, and removing the hardcoded "admin123" password. Phase 2 adds a `SetupChecklist` card component to the existing dashboard that tracks 13 setup items via a new `setupChecklistStatus` JSON field on the `application_info` table. Each checklist item links to the relevant existing screen or opens a simple modal.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 4, Drizzle ORM, SQLite (better-sqlite3-multiple-ciphers), Electron IPC, Radix UI primitives, Lucide icons.

---

## Phase 1: Revised Setup Wizard

### Task 1: Update Setup Context - Add Admin Account State, Remove Operations

**Files:**
- Modify: `src/renderer/contexts/setup-context.tsx`

**Step 1: Update interfaces and defaults**

Replace `OperationsInfo` interface and default with `AdminAccountInfo`:

```typescript
// Remove OperationsInfo interface (lines 45-54)
// Add AdminAccountInfo interface:
export interface AdminAccountInfo {
  fullName: string
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}
```

Default:
```typescript
const defaultAdminAccountInfo: AdminAccountInfo = {
  fullName: '',
  username: 'admin',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}
```

**Step 2: Update SetupContextType interface**

Replace all `operationsInfo` references with `adminAccountInfo` and `updateAdminAccountInfo`. Change step count from 5 to 4 in `nextStep` and `prevStep`.

**Step 3: Update completeSetup to send adminAccount data**

The `completeSetup` function (line 211) should send:
```typescript
const setupData = {
  business: businessInfo,
  branch: branchInfo,
  taxCurrency: taxCurrencyInfo,
  adminAccount: adminAccountInfo,
}
```

**Step 4: Update canProceed validation in the context or wizard**

Step 4 (admin account) should validate:
- `fullName` is not empty
- `username` is not empty
- `password` is at least 6 chars
- `password === confirmPassword`

**Step 5: Commit**

```
feat: update setup context with admin account step, remove operations
```

---

### Task 2: Create Admin Account Step Component

**Files:**
- Create: `src/renderer/screens/setup-wizard/steps/admin-account-step.tsx`

**Step 1: Build the admin account form**

The component uses `useSetup()` to get `adminAccountInfo` and `updateAdminAccountInfo`. Form fields:

- Full Name (required) - Input
- Username (required) - Input, defaulting to "admin"
- Email - Input type="email"
- Phone - Input
- Password (required, min 6 chars) - Input type="password"
- Confirm Password (required, must match) - Input type="password"
- Show inline validation error if passwords don't match

Use the same visual pattern as existing steps (header with icon, grid layout). Use `UserPlus` icon from lucide-react.

**Step 2: Commit**

```
feat: add admin account step component for setup wizard
```

---

### Task 3: Create Branch + Tax/Currency Combined Step

**Files:**
- Create: `src/renderer/screens/setup-wizard/steps/branch-tax-step.tsx`

**Step 1: Build the combined step**

This merges the content from `branch-setup-step.tsx` and `tax-currency-step.tsx` into one step with two sections separated by a border:

**Section 1 - Branch Setup:**
- Branch Name (required), Branch Code (with regenerate button)
- Copy from Business button
- Branch Address
- Phone, Email
- Firearms License Number (FFL)

**Section 2 - Tax & Currency (below a `<div className="pt-6 border-t">`):**
- Currency selector, Symbol, Position, Decimal Places
- Currency Preview
- Tax Name, Tax Rate, Tax ID

Reuse existing state hooks: `branchInfo`, `updateBranchInfo`, `taxCurrencyInfo`, `updateTaxCurrencyInfo`, `businessInfo`, `generateBranchCode` from `useSetup()`.

**Step 2: Commit**

```
feat: add combined branch + tax/currency step for setup wizard
```

---

### Task 4: Update Setup Wizard Main Component

**Files:**
- Modify: `src/renderer/screens/setup-wizard/index.tsx`

**Step 1: Update STEPS array and imports**

```typescript
import { WelcomeStep } from './steps/welcome-step'
import { BusinessInfoStep } from './steps/business-info-step'
import { BranchTaxStep } from './steps/branch-tax-step'
import { AdminAccountStep } from './steps/admin-account-step'

const STEPS = [
  { number: 1, title: 'Welcome', description: 'Getting Started' },
  { number: 2, title: 'Business', description: 'Business Information' },
  { number: 3, title: 'Branch & Tax', description: 'Branch & Financial Setup' },
  { number: 4, title: 'Admin Account', description: 'Create Admin User' },
]
```

**Step 2: Update renderStep switch**

```typescript
const renderStep = () => {
  switch (currentStep) {
    case 1: return <WelcomeStep />
    case 2: return <BusinessInfoStep />
    case 3: return <BranchTaxStep />
    case 4: return <AdminAccountStep />
    default: return <WelcomeStep />
  }
}
```

**Step 3: Update step navigation bounds**

Change all references from `5` to `4` (the total step count):
- `canProceed` switch cases
- `handleNext` condition: `currentStep < 4`
- Navigation buttons: `currentStep < 4`

**Step 4: Commit**

```
feat: update setup wizard to 4-step flow
```

---

### Task 5: Update Setup IPC Handler - Accept Admin Account Data

**Files:**
- Modify: `src/main/ipc/setup-ipc.ts`

**Step 1: Update SetupData interface**

Replace the `operations` property with `adminAccount`:

```typescript
export interface SetupData {
  business: { /* same as before */ }
  branch: { /* same as before */ }
  taxCurrency: { /* same as before */ }
  adminAccount: {
    fullName: string
    username: string
    email: string
    phone: string
    password: string
  }
}
```

**Step 2: Update the `setup:complete` handler**

In the admin user creation section (lines 137-158), replace the hardcoded values:

```typescript
// 3. Create admin user for the branch
const existingAdmin = await db.query.users.findFirst({
  where: (u, { eq }) => eq(u.username, data.adminAccount.username),
})

if (!existingAdmin) {
  const hashedPassword = await bcrypt.hash(data.adminAccount.password, 12)
  db.insert(users)
    .values({
      username: data.adminAccount.username,
      password: hashedPassword,
      email: data.adminAccount.email || data.business.businessEmail || '',
      fullName: data.adminAccount.fullName,
      phone: data.adminAccount.phone || '',
      role: 'admin',
      permissions: ['*'],
      isActive: true,
      branchId: newBranch.id,
    })
    .returning()
    .get()
}
```

**Step 3: Remove operations data from business_settings creation**

The operations fields (workingDaysStart, workingDaysEnd, openingTime, closingTime, defaultPaymentMethod, allowedPaymentMethods, lowStockThreshold, stockValuationMethod) should use sensible defaults in the business_settings insert since they are now configured in Phase 2:

```typescript
const settingsData: InsertBusinessSettings = {
  branchId: newBranch.id,
  // Business Info (from wizard)
  businessName: data.business.businessName,
  // ... rest of business fields ...
  // Tax & Currency (from wizard)
  currencyCode: data.taxCurrency.currencyCode,
  // ... rest of tax fields ...
  // Operations (defaults - configured in Phase 2)
  workingDaysStart: 'Monday',
  workingDaysEnd: 'Saturday',
  openingTime: '09:00',
  closingTime: '18:00',
  defaultPaymentMethod: 'Cash',
  allowedPaymentMethods: 'Cash,Card,Bank Transfer',
  lowStockThreshold: 10,
  stockValuationMethod: 'FIFO',
  // Status
  isActive: true,
  isDefault: true,
}
```

**Step 4: Initialize setupChecklistStatus in application_info**

After creating/updating `applicationInfo`, also store a JSON object tracking checklist state. We'll add a new column `setupChecklistStatus` of type `text` to `application_info`. The initial value:

```typescript
const initialChecklist = JSON.stringify({
  registerStaff: 'pending',
  addProducts: 'pending',
  configureOperations: 'pending',
  addSuppliers: 'pending',
  addServices: 'pending',
  addAssets: 'pending',
  addPurchases: 'pending',
  addExpenses: 'pending',
  addReceivables: 'pending',
  addPayables: 'pending',
  registerCustomers: 'pending',
  setCashInHand: 'pending',
  reviewBalanceSheet: 'pending',
  dismissed: false,
})
```

**Step 5: Commit**

```
feat: update setup IPC to accept admin account, initialize checklist
```

---

### Task 6: Update Preload API for Setup Changes

**Files:**
- Modify: `src/preload/index.ts`

**Step 1: Add new IPC channels for checklist**

In the `setup` section (lines 493-499), add:

```typescript
setup: {
  checkFirstRun: () => ipcRenderer.invoke('setup:check-first-run'),
  complete: (data) => ipcRenderer.invoke('setup:complete', data),
  generateBranchCode: (businessName: string) =>
    ipcRenderer.invoke('setup:generate-branch-code', businessName),
  getChecklistStatus: () => ipcRenderer.invoke('setup:get-checklist-status'),
  updateChecklistItem: (item: string, status: string) =>
    ipcRenderer.invoke('setup:update-checklist-item', item, status),
  dismissChecklist: () => ipcRenderer.invoke('setup:dismiss-checklist'),
},
```

**Step 2: Commit**

```
feat: add checklist IPC channels to preload API
```

---

### Task 7: Add Checklist IPC Handlers

**Files:**
- Modify: `src/main/ipc/setup-ipc.ts`

**Step 1: Add migration for setupChecklistStatus column**

In `src/main/db/migrate.ts`, add a migration block that adds `setup_checklist_status TEXT` column to `application_info` if it doesn't exist. Follow the existing pattern (check column existence with pragma, then ALTER TABLE).

**Step 2: Add three IPC handlers in `registerSetupHandlers()`**

```typescript
// Get checklist status
ipcMain.handle('setup:get-checklist-status', async () => {
  try {
    const appInfo = db.select().from(applicationInfo).limit(1).get()
    if (!appInfo) return { success: false, message: 'No app info found' }

    const status = appInfo.setupChecklistStatus
      ? JSON.parse(appInfo.setupChecklistStatus)
      : null
    return { success: true, data: status }
  } catch (error) {
    return { success: false, message: 'Failed to get checklist status' }
  }
})

// Update a single checklist item
ipcMain.handle('setup:update-checklist-item', async (_, item: string, status: string) => {
  try {
    const appInfo = db.select().from(applicationInfo).limit(1).get()
    if (!appInfo || !appInfo.setupChecklistStatus) {
      return { success: false, message: 'No checklist found' }
    }
    const checklist = JSON.parse(appInfo.setupChecklistStatus)
    checklist[item] = status
    db.update(applicationInfo)
      .set({ setupChecklistStatus: JSON.stringify(checklist), updatedAt: new Date().toISOString() })
      .run()
    return { success: true, data: checklist }
  } catch (error) {
    return { success: false, message: 'Failed to update checklist' }
  }
})

// Dismiss the entire checklist
ipcMain.handle('setup:dismiss-checklist', async () => {
  try {
    const appInfo = db.select().from(applicationInfo).limit(1).get()
    if (!appInfo || !appInfo.setupChecklistStatus) {
      return { success: false, message: 'No checklist found' }
    }
    const checklist = JSON.parse(appInfo.setupChecklistStatus)
    checklist.dismissed = true
    db.update(applicationInfo)
      .set({ setupChecklistStatus: JSON.stringify(checklist), updatedAt: new Date().toISOString() })
      .run()
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to dismiss checklist' }
  }
})
```

**Step 3: Commit**

```
feat: add checklist IPC handlers and DB migration
```

---

## Phase 2: Dashboard Setup Checklist Card

### Task 8: Create SetupChecklist Dashboard Component

**Files:**
- Create: `src/renderer/components/setup-checklist.tsx`

**Step 1: Build the checklist component**

This is a self-contained card component that:
1. On mount, calls `window.api.setup.getChecklistStatus()` to fetch the checklist state
2. If `data` is null or `data.dismissed === true`, renders nothing
3. Otherwise renders a card with:

**Visual structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  Complete Your Setup                           [Dismiss X]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2/13 completed             │
│                                                             │
│  ✓  Register Staff                          [Go to Users]   │
│  ○  Add Products                         [Go to Products]   │
│  ○  Configure Operations                [Go to Settings]    │
│  ○  Add Suppliers                       [Go to Suppliers]   │
│  ○  Add Services                        [Go to Services]    │
│  ○  Add Assets                    [Go to Chart of Accounts] │
│  ○  Add Opening Purchases              [Go to Purchases]    │
│  ○  Add Expenses                        [Go to Expenses]    │
│  ○  Add Receivables                   [Go to Receivables]   │
│  ○  Add Payables                       [Go to Payables]     │
│  ○  Register Customers                 [Go to Customers]    │
│  ○  Set Cash in Hand                   [Open Cash Setup]    │
│  ○  Review Opening Balance Sheet  [Go to Chart of Accounts] │
│                                                             │
│              [I'm Done Setting Up]                          │
└─────────────────────────────────────────────────────────────┘
```

**Checklist item definitions array:**
```typescript
const CHECKLIST_ITEMS = [
  {
    key: 'registerStaff',
    title: 'Register Staff',
    description: 'Add manager and cashier accounts',
    route: '/users',
    icon: Users,
  },
  {
    key: 'addProducts',
    title: 'Add Products',
    description: 'Register your initial product catalog',
    route: '/products',
    icon: Package,
  },
  {
    key: 'configureOperations',
    title: 'Configure Operations',
    description: 'Set working hours, payment methods, inventory settings',
    route: '/settings',
    icon: Settings,
  },
  {
    key: 'addSuppliers',
    title: 'Add Suppliers',
    description: 'Register your vendors and suppliers',
    route: '/suppliers',
    icon: Truck,
  },
  {
    key: 'addServices',
    title: 'Add Services',
    description: 'Register services you offer (repairs, transfers, etc.)',
    route: '/services',
    icon: Wrench,
  },
  {
    key: 'addAssets',
    title: 'Add Assets',
    description: 'Record business assets (equipment, vehicles, property)',
    route: '/chart-of-accounts',
    icon: Building,
  },
  {
    key: 'addPurchases',
    title: 'Add Opening Purchases',
    description: 'Record existing purchase orders or received goods',
    route: '/purchases',
    icon: ShoppingCart,
  },
  {
    key: 'addExpenses',
    title: 'Add Expenses',
    description: 'Record existing or recurring expenses',
    route: '/expenses',
    icon: Receipt,
  },
  {
    key: 'addReceivables',
    title: 'Add Receivables',
    description: 'Record outstanding balances owed to you',
    route: '/receivables',
    icon: ArrowDownToLine,
  },
  {
    key: 'addPayables',
    title: 'Add Payables',
    description: 'Record outstanding balances you owe',
    route: '/payables',
    icon: ArrowUpFromLine,
  },
  {
    key: 'registerCustomers',
    title: 'Register Customers',
    description: 'Add existing customer records',
    route: '/customers',
    icon: UserCheck,
  },
  {
    key: 'setCashInHand',
    title: 'Set Cash in Hand',
    description: 'Record your opening cash balance',
    route: '/journals',
    icon: Banknote,
  },
  {
    key: 'reviewBalanceSheet',
    title: 'Review Opening Balance Sheet',
    description: 'Verify all opening balances are correct',
    route: '/chart-of-accounts',
    icon: FileSpreadsheet,
  },
]
```

**Behavior:**
- Each item row shows: status icon (CheckCircle2 green if completed, Circle gray if pending), title, description, and a small action button ("Go" or "Open")
- Clicking the action button navigates to the route using `useNavigate()`
- Each item also has a "Skip" text button that calls `window.api.setup.updateChecklistItem(key, 'skipped')`
- Progress bar shows `(completed + skipped) / total`
- "I'm Done Setting Up" button calls `window.api.setup.dismissChecklist()` and hides the card
- The dismiss X button in the header also dismisses

**Step 2: Commit**

```
feat: create setup checklist dashboard component
```

---

### Task 9: Integrate Checklist Card into Dashboard

**Files:**
- Modify: `src/renderer/screens/dashboard/index.tsx`

**Step 1: Import and render SetupChecklist at the top of the dashboard**

Add the import:
```typescript
import { SetupChecklist } from '@/components/setup-checklist'
```

Render it as the first child inside the main dashboard container, before the financial overview cards:

```tsx
{/* Setup Checklist - shown until dismissed */}
<SetupChecklist />

{/* Existing dashboard content below */}
```

**Step 2: Commit**

```
feat: integrate setup checklist into dashboard
```

---

### Task 10: Auto-Detect Completed Checklist Items

**Files:**
- Modify: `src/main/ipc/setup-ipc.ts`

**Step 1: Add a `setup:refresh-checklist` handler**

This handler checks the database for actual data and auto-marks items as completed. This runs when the dashboard loads to keep the checklist in sync.

```typescript
ipcMain.handle('setup:refresh-checklist', async () => {
  try {
    const appInfo = db.select().from(applicationInfo).limit(1).get()
    if (!appInfo?.setupChecklistStatus) return { success: false }

    const checklist = JSON.parse(appInfo.setupChecklistStatus)
    if (checklist.dismissed) return { success: true, data: checklist }

    // Auto-detect completed items by checking DB tables
    const userCount = db.select({ count: sql`count(*)` }).from(users).get()
    if (userCount && Number(userCount.count) > 1) checklist.registerStaff = 'completed'

    const productCount = db.select({ count: sql`count(*)` }).from(products).get()
    if (productCount && Number(productCount.count) > 0) checklist.addProducts = 'completed'

    const supplierCount = db.select({ count: sql`count(*)` }).from(suppliers).get()
    if (supplierCount && Number(supplierCount.count) > 0) checklist.addSuppliers = 'completed'

    const serviceCount = db.select({ count: sql`count(*)` }).from(services).get()
    if (serviceCount && Number(serviceCount.count) > 0) checklist.addServices = 'completed'

    const purchaseCount = db.select({ count: sql`count(*)` }).from(purchases).get()
    if (purchaseCount && Number(purchaseCount.count) > 0) checklist.addPurchases = 'completed'

    const expenseCount = db.select({ count: sql`count(*)` }).from(expenses).get()
    if (expenseCount && Number(expenseCount.count) > 0) checklist.addExpenses = 'completed'

    const receivableCount = db.select({ count: sql`count(*)` }).from(accountReceivables).get()
    if (receivableCount && Number(receivableCount.count) > 0) checklist.addReceivables = 'completed'

    const payableCount = db.select({ count: sql`count(*)` }).from(accountPayables).get()
    if (payableCount && Number(payableCount.count) > 0) checklist.addPayables = 'completed'

    const customerCount = db.select({ count: sql`count(*)` }).from(customers).get()
    if (customerCount && Number(customerCount.count) > 0) checklist.registerCustomers = 'completed'

    // Save updated checklist
    db.update(applicationInfo)
      .set({ setupChecklistStatus: JSON.stringify(checklist), updatedAt: new Date().toISOString() })
      .run()

    return { success: true, data: checklist }
  } catch (error) {
    return { success: false, message: 'Failed to refresh checklist' }
  }
})
```

**Step 2: Add to preload**

```typescript
setup: {
  // ... existing
  refreshChecklist: () => ipcRenderer.invoke('setup:refresh-checklist'),
}
```

**Step 3: Update SetupChecklist component to call `refreshChecklist` on mount instead of `getChecklistStatus`**

```typescript
useEffect(() => {
  const loadChecklist = async () => {
    const result = await window.api.setup.refreshChecklist()
    if (result.success && result.data && !result.data.dismissed) {
      setChecklist(result.data)
    }
  }
  loadChecklist()
}, [])
```

**Step 4: Commit**

```
feat: auto-detect completed checklist items from database
```

---

### Task 11: Clean Up Old Step Files

**Files:**
- Delete: `src/renderer/screens/setup-wizard/steps/operations-step.tsx`
- Keep (but no longer imported by wizard): `src/renderer/screens/setup-wizard/steps/branch-setup-step.tsx`
- Keep (but no longer imported by wizard): `src/renderer/screens/setup-wizard/steps/tax-currency-step.tsx`

The old `branch-setup-step.tsx` and `tax-currency-step.tsx` files can remain in the repo since they aren't imported anymore and cause no harm. The `operations-step.tsx` should be deleted since its functionality moves to Phase 2.

**Step 1: Delete operations-step.tsx**

**Step 2: Remove unused imports from setup-wizard/index.tsx if any remain**

**Step 3: Commit**

```
chore: remove unused operations step component
```

---

### Task 12: Add TypeScript Types for Window API

**Files:**
- Modify: `src/preload/index.ts` (or wherever the Window API types are declared)

**Step 1: Update the setup section in the Window API type declaration**

Ensure the TypeScript types for `window.api.setup` include the new methods:
- `getChecklistStatus(): Promise<{ success: boolean; data: ChecklistStatus | null }>`
- `updateChecklistItem(item: string, status: string): Promise<{ success: boolean; data: ChecklistStatus }>`
- `dismissChecklist(): Promise<{ success: boolean }>`
- `refreshChecklist(): Promise<{ success: boolean; data: ChecklistStatus | null }>`

**Step 2: Commit**

```
feat: add TypeScript types for setup checklist API
```

---

## Task Dependency Order

```
Task 1 (Context)
  ├── Task 2 (Admin Step UI) ── depends on Task 1
  ├── Task 3 (Branch+Tax UI) ── independent
  └── Task 4 (Wizard Main) ── depends on Tasks 1, 2, 3

Task 5 (Setup IPC) ── independent of frontend tasks
Task 6 (Preload) ── depends on Task 5
Task 7 (Checklist IPC + Migration) ── depends on Task 5

Task 8 (Checklist UI) ── depends on Tasks 6, 7
Task 9 (Dashboard Integration) ── depends on Task 8
Task 10 (Auto-detect) ── depends on Tasks 7, 8

Task 11 (Cleanup) ── depends on Task 4
Task 12 (Types) ── depends on Task 6
```

**Parallel opportunities:**
- Tasks 2 + 3 can run in parallel
- Tasks 5 + 1 can run in parallel (backend vs frontend)
- Task 11 + 12 can run in parallel
