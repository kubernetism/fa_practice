# Firearms POS Web Application — Design Document

**Date:** 2026-02-05
**Branch:** `web_application`
**Status:** Approved

---

## 1. Overview

Full web port of the existing Electron Firearms POS system as a multi-tenant SaaS application. PostgreSQL replaces SQLite. Subscription billing via KuickPay.

**Goals:**
- Feature parity with the Electron app (phased rollout)
- Multi-tenant: one hosted instance serves multiple businesses
- Real-time updates across all connected users
- Data import path for existing Electron customers

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth.js v5 (credentials provider, JWT sessions) |
| Real-time | Socket.io |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Payments | KuickPay |
| Deployment | TBD (Vercel / VPS / Docker) |

---

## 3. Project Structure

```
firearms-pos-web/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login, signup, forgot password
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/            # Protected app routes
│   │   │   ├── layout.tsx          # Sidebar + header (MainLayout)
│   │   │   ├── dashboard/
│   │   │   ├── pos/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── sales/
│   │   │   ├── customers/
│   │   │   ├── reports/
│   │   │   ├── users/
│   │   │   ├── branches/
│   │   │   ├── settings/
│   │   │   └── billing/
│   │   └── api/
│   │       ├── auth/[...nextauth]/ # NextAuth routes
│   │       └── webhooks/
│   │           └── kuickpay/       # Payment webhooks
│   ├── actions/                    # Server actions (replaces IPC handlers)
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── inventory.ts
│   │   ├── customers.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (copied from Electron app)
│   │   ├── layout/                 # Sidebar, header, guards
│   │   └── shared/                 # Reusable business components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle client + tenant scoping helper
│   │   │   ├── schema/             # All table schemas
│   │   │   └── migrations/
│   │   ├── auth/
│   │   │   └── config.ts           # NextAuth configuration
│   │   ├── realtime/
│   │   │   ├── server.ts           # Socket.io server setup
│   │   │   └── events.ts           # Event type definitions
│   │   ├── kuickpay/
│   │   │   └── client.ts           # KuickPay API integration
│   │   └── validators/             # Zod schemas
│   ├── hooks/
│   │   ├── use-socket.ts           # Real-time connection hook
│   │   ├── use-auth.ts
│   │   └── use-tenant.ts
│   └── stores/                     # Zustand stores
│       ├── cart-store.ts
│       ├── notification-store.ts
│       └── ...
├── drizzle/                        # Migration SQL files
├── scripts/
│   └── import-sqlite.ts            # SQLite → PostgreSQL import tool
├── public/
├── middleware.ts                    # Auth + subscription + setup guards
└── package.json
```

---

## 4. Multi-Tenancy

### Strategy: Shared database, tenant_id on every table

Every table includes a `tenant_id` column referencing the `tenants` table. All queries are scoped by tenant.

### New SaaS Tables

```sql
-- Tenants (one per business)
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
    -- trial | active | suspended | cancelled
  subscription_plan TEXT NOT NULL DEFAULT 'basic',
    -- basic | pro | enterprise
  trial_ends_at TIMESTAMP NOT NULL,
  subscription_ends_at TIMESTAMP,
  kuickpay_customer_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC(12,2) NOT NULL,
  price_yearly NUMERIC(12,2),
  max_branches INT NOT NULL,
  max_users INT NOT NULL,
  max_products INT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscription Invoices
CREATE TABLE subscription_invoices (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL REFERENCES tenants(id),
  plan_id INT NOT NULL REFERENCES subscription_plans(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | paid | failed | refunded
  kuickpay_reference TEXT,
  kuickpay_transaction_id TEXT,
  billing_period_start TIMESTAMP NOT NULL,
  billing_period_end TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Pricing

| Plan | Branches | Users | Monthly Price |
|------|----------|-------|---------------|
| Basic | 1 | 3 | Rs. 7,000 |
| Pro | 5 | 10 | Rs. 14,000 |
| Enterprise | Unlimited | Unlimited | Rs. 20,000 |

### Row-Level Security (PostgreSQL)

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant_id')::int);
```

Applied to all tenant-scoped tables as a safety net.

### Tenant Scoping Helper

```typescript
// lib/db/index.ts
import { auth } from '@/lib/auth/config'

export async function tenantDb() {
  const session = await auth()
  if (!session?.tenantId) throw new Error('No tenant context')

  // Set RLS context
  await db.execute(
    sql`SET LOCAL app.current_tenant_id = ${session.tenantId}`
  )

  return { db, tenantId: session.tenantId }
}
```

---

## 5. Schema Migration: SQLite → PostgreSQL

### Type Mappings

| SQLite | PostgreSQL |
|--------|-----------|
| `integer PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| `text` (enum-like) | `TEXT` with CHECK constraint |
| `real` (money) | `NUMERIC(12,2)` |
| `integer` (boolean 0/1) | `BOOLEAN` |
| `text` (dates) | `TIMESTAMP` or `DATE` |

### Changes to All Existing Tables

1. Add `tenant_id INT NOT NULL REFERENCES tenants(id)` column
2. Add index on `tenant_id` for every table
3. Composite unique constraints include `tenant_id` (e.g., product code unique per tenant)
4. Money fields (`real`) become `NUMERIC(12,2)`
5. Boolean fields become native `BOOLEAN`

---

## 6. Authentication & Authorization

### NextAuth.js v5 Configuration

- **Provider:** Credentials (email + password, bcrypt hashing)
- **Session strategy:** JWT
- **JWT payload:** `{ userId, tenantId, role, branchId, permissions }`

### Roles (unchanged from Electron)

| Role | Access |
|------|--------|
| `admin` | Full access, bypasses all permission checks |
| `manager` | Branch-level management |
| `cashier` | POS operations only |

### Permission System

Ported directly from Electron app:
- Array of permission strings per user
- Wildcard `*` support
- `checkPermission()` function reused in server actions and client components

### Auth Flows

**Signup:**
1. User fills business name, email, password
2. Creates `tenant` (status: trial, trial_ends_at: +14 days)
3. Creates `admin` user for that tenant
4. Redirects to setup wizard

**Login:**
1. Validate credentials against tenant-scoped users table
2. Check user `is_active` status
3. Check tenant `subscription_status` (trial/active allowed, suspended blocks)
4. Issue JWT session
5. Create audit log entry

**Invite User:**
1. Admin enters email and role
2. System sends invite email with signup link
3. Invited user sets password, auto-assigned to tenant

### Middleware (middleware.ts)

```
Request received
├── Unauthenticated + protected route? → /login
├── Subscription suspended/cancelled? → /billing
├── Tenant needs setup? → /setup
└── Authorized → Continue
```

---

## 7. Real-Time Architecture

### Technology: Socket.io

Runs alongside the Next.js server. Authenticated via the same JWT session.

### Room Structure

```
tenant:{tenantId}                       # Tenant-wide (settings, new users)
tenant:{tenantId}:branch:{branchId}     # Branch (sales, inventory, cash register)
tenant:{tenantId}:user:{userId}         # Personal (notifications, messages, todos)
```

### MVP Events

| Event | Trigger | Room | Payload |
|-------|---------|------|---------|
| `inventory:updated` | Sale, purchase, adjustment, return | Branch | `{ productId, newQuantity }` |
| `sale:created` | New sale completed | Branch | `{ saleId, invoiceNumber, total }` |
| `sale:voided` | Sale voided | Branch | `{ saleId }` |
| `dashboard:refresh` | Any financial transaction | Branch | `{ type }` |
| `notification:new` | Low stock, task, message | User | `{ title, message, type }` |
| `cash-register:updated` | Cash in/out, session open/close | Branch | `{ sessionId, action }` |

### Client-Side Hook

```typescript
// hooks/use-socket.ts
export function useSocket() {
  // Connects on mount, authenticates with JWT
  // Joins rooms based on session (tenantId, branchId, userId)
  // Returns: { on, off, emit, isConnected }
}

// Usage in component:
const { on } = useSocket()
useEffect(() => {
  return on('inventory:updated', (data) => {
    // Update local state or refetch
  })
}, [])
```

### Server-Side Emission

```typescript
// After any mutation in server actions:
import { emitToRoom } from '@/lib/realtime/server'

// In createSale action:
await emitToRoom(
  `tenant:${tenantId}:branch:${branchId}`,
  'sale:created',
  { saleId, invoiceNumber, total }
)
```

---

## 8. Data Layer: Server Actions

### Pattern

IPC handlers become server actions. Same logic, different transport.

**Before (Electron IPC):**
```typescript
ipcMain.handle('products:get-all', async (_, params) => {
  const db = getDatabase()
  const data = await db.select().from(products).where(...)
  return { success: true, data }
})
```

**After (Next.js Server Action):**
```typescript
'use server'

import { tenantDb } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function getProducts(params: GetProductsParams) {
  const { db, tenantId } = await tenantDb()

  const data = await db
    .select()
    .from(products)
    .where(and(
      eq(products.tenantId, tenantId),
      // ... other filters from params
    ))

  return { success: true, data }
}
```

### Validation

Zod schemas at every server action boundary:

```typescript
const createProductSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  sellingPrice: z.number().positive(),
  // ...
})

export async function createProduct(input: unknown) {
  const data = createProductSchema.parse(input)
  // ... create product
}
```

---

## 9. KuickPay Subscription Integration

### Flow

```
Signup → 14-day trial (full access)
  → Trial expiring (7 days) → Email reminder
  → Trial expiring (1 day) → Urgent reminder
  → Trial expired → Redirect to /billing
  → User selects plan → Redirect to KuickPay
  → Payment confirmed via webhook → Subscription active
  → Monthly renewal → Same flow
```

### Payment Flow

1. User clicks "Subscribe" or "Renew" on `/billing`
2. Server creates `subscription_invoice` (status: pending)
3. Server generates KuickPay payment request with:
   - Invoice ID, amount, description
   - Success callback URL: `/billing?status=success`
   - Webhook URL: `/api/webhooks/kuickpay`
4. User redirected to KuickPay payment page
5. User pays via bank transfer / JazzCash / EasyPaisa / card
6. KuickPay sends webhook to `/api/webhooks/kuickpay`
7. Webhook handler:
   - Verifies webhook signature
   - Updates `subscription_invoices` (status: paid, paid_at, transaction_id)
   - Updates `tenants` (subscription_status: active, subscription_ends_at: +30 days)
8. User sees active subscription on `/billing`

### Subscription Enforcement

Daily cron job checks:
- **7 days before expiry:** Send reminder email
- **1 day before expiry:** Send urgent reminder
- **Expired:** Set `subscription_status: 'suspended'`
- **30 days after suspension:** Set `subscription_status: 'cancelled'`, archive data

**Middleware enforces:**
- `trial` or `active` → Full access
- `suspended` → Only `/billing` accessible
- `cancelled` → Login blocked, contact support message

### Plan Limits

Enforced in server actions:

```typescript
export async function createBranch(data) {
  const tenant = await getTenant()
  const plan = await getPlan(tenant.subscriptionPlan)
  const currentBranches = await countBranches(tenant.id)

  if (currentBranches >= plan.maxBranches) {
    return { success: false, message: 'Branch limit reached. Upgrade your plan.' }
  }
  // ... create branch
}
```

---

## 10. SQLite → PostgreSQL Import Tool

### Export (Electron App Side)

New menu option in Electron app: **Settings → Export for Web Migration**

Generates a JSON file:
```json
{
  "version": "1.0",
  "exportDate": "2026-02-05T12:00:00Z",
  "appVersion": "1.x.x",
  "counts": {
    "products": 142,
    "customers": 89,
    "sales": 1204,
    "saleItems": 3891,
    "inventory": 142,
    "suppliers": 12,
    "categories": 8,
    "users": 5,
    "branches": 2
  },
  "data": {
    "branches": [...],
    "users": [...],
    "categories": [...],
    "products": [...],
    "customers": [...],
    "suppliers": [...],
    "inventory": [...],
    "sales": [...],
    "saleItems": [...],
    "purchases": [...],
    "purchaseItems": [...],
    "expenses": [...],
    "referralPersons": [...],
    "commissions": [...]
  }
}
```

**Excluded from export:** audit_logs, sessions, license data, settings (reconfigured on web).

### Import (Web App Side)

**Location:** Settings → Data Migration (admin only)

**Flow:**
1. Admin uploads `.json` file
2. Server validates structure and schema version
3. Preview screen shows record counts and any warnings
4. On confirm, import runs inside a PostgreSQL transaction:
   - Create records in dependency order (branches → users → categories → products → ...)
   - Remap all old IDs to new auto-generated IDs
   - Update all foreign key references with new IDs
   - Assign `tenant_id` to every record
5. On success: summary shown. On failure: full rollback, error displayed.

**Handles:**
- ID remapping (old SQLite IDs → new PostgreSQL serial IDs)
- Duplicate detection (skip products with same code in tenant)
- Date format normalization
- Progress indicator for large datasets
- Password hashes preserved (bcrypt, same algorithm)

---

## 11. MVP Phasing

### Phase 1 — Core POS (MVP)

| Module | Description |
|--------|-------------|
| Auth | Signup, login, password reset, user invite |
| Tenant Setup | Business info, first branch, admin account |
| Dashboard | KPIs, charts, real-time stats |
| Products | CRUD, categories, search, barcode |
| Inventory | Stock levels, adjustments, low stock alerts |
| POS / Checkout | Cart, payment processing, receipt (browser print) |
| Sales History | List, search, void, view details |
| Customers | CRUD, license tracking |
| Users & Branches | Manage staff, roles, permissions, branches |
| Basic Reports | Sales report, inventory report, daily summary |
| Settings | Business settings, receipt config |
| Billing | Subscription management, KuickPay integration |
| Real-time | Socket.io for inventory, sales, notifications |

### Phase 2 — Financial Management

| Module | Description |
|--------|-------------|
| Expenses | Expense tracking, categories |
| Account Payables | Supplier payments |
| Account Receivables | Credit sales, collections |
| Cash Register | Sessions, reconciliation |
| Commissions | Referral and employee commissions |
| Referral Persons | Referral tracking |
| Vouchers | Discount codes |

### Phase 3 — Accounting & Advanced

| Module | Description |
|--------|-------------|
| Chart of Accounts | Double-entry GL |
| Journal Entries | Manual entries, auto-posting |
| Purchases | Purchase orders, receiving |
| Services | Service management, sale integration |
| Advanced Reports | P&L, balance sheet, tax, audit |
| Data Import Tool | SQLite → PostgreSQL migration |
| Audit Logs | Full activity tracking |
| Todos & Messages | Internal communication |

---

## 12. Code Reuse Strategy

### Direct Copy (no changes)
- `components/ui/*` — All shadcn/ui components
- Zod validation schemas
- Utility functions (formatting, calculations)
- Tailwind config and CSS

### Minor Adaptation (replace IPC calls)
- Screen components — Replace `window.api.X()` with server action calls
- Layout components — Same structure, Next.js App Router conventions
- Business logic — Commission formulas, FIFO costing, report calculations

### Rewrite
- Database layer — SQLite → PostgreSQL (Drizzle ORM minimizes this)
- Auth — In-memory session → JWT-based NextAuth
- State management — React contexts → Zustand stores
- Real-time — New (didn't exist in Electron)
- Multi-tenancy — New (tenant scoping on all queries)
- Subscription billing — New (KuickPay integration)

---

## 13. Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | Shared DB + tenant_id + RLS | Simpler ops than DB-per-tenant, RLS prevents leaks |
| Auth | NextAuth.js v5 + JWT | Built-in Next.js integration, stateless sessions |
| Real-time | Socket.io | Full duplex, room support, mature library |
| Data layer | Server Actions | Type-safe, less boilerplate than REST, matches IPC pattern |
| State | Zustand | Simpler than Redux, better for real-time state merging |
| ORM | Drizzle | Already used in Electron app, PostgreSQL support built-in |
| Payments | KuickPay | Pakistan-focused, supports local payment methods |
| Styling | Tailwind + shadcn/ui | Direct reuse from Electron app |
