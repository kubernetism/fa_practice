# Firearm Product Registration — Implementation Checklist

Spec: `docs/superpowers/specs/2026-04-17-firearm-product-registration-design.md`
Started: 2026-04-17
Completed: 2026-04-18 (implementation + typecheck; tests written but not executed)

## Phase 1 — Schema & Seeds

- [x] Add `firearm_models` schema file (`src/main/db/schemas/firearm-models.ts`)
- [x] Add `firearm_calibers` schema file
- [x] Add `firearm_shapes` schema file
- [x] Add `firearm_designs` schema file
- [x] Register all four in `src/main/db/schema.ts` barrel
- [x] Extend `products.ts` schema with: `make`, `made_year`, `made_country`, `firearm_model_id`, `caliber_id`, `shape_id`, `design_id`, `default_supplier_id` (+ ON DELETE SET NULL)
- [x] Add `is_firearm` boolean to `categories.ts` schema
- [x] Hand-written migration `migrate_firearm_attributes.ts` (idempotent, transactional)
- [x] Seeded 100 models / 30 calibers / 10 shapes / 15 designs via `INSERT OR IGNORE`
- [x] Indexes on new FK columns in `products`

## Phase 2 — IPC + Preload

- [x] `src/main/ipc/firearm-attrs-ipc.ts` — CRUD for all four lookup tables (list/create/update/deactivate)
- [x] Case-insensitive unique `name` enforcement on create/update
- [x] `src/main/ipc/products-ipc.ts` accepts + validates new fields; removed stale `manufacturer/model/caliber/sku` refs
- [x] `is_firearm`-driven required-field validation (via `firearm-validation.ts`)
- [x] `product_firearm` audit log event emitted on firearm field change
- [x] `window.api.firearmAttrs.*` exposed in `src/preload/index.ts`

## Phase 3 — Firearm Attributes Settings Page

- [x] `src/renderer/screens/firearm-attributes/index.tsx` with 4 tabs
- [x] Reusable `<LookupTableEditor />` (search, add, edit, deactivate, sort bump)
- [x] `useFirearmLookups` hook
- [x] Route registered via `KEEP_ALIVE_PATHS` + `keep-alive-outlet.tsx`
- [x] Sidebar entry (`Crosshair` icon)

## Phase 4 — Product Form — Firearm Details Section

- [x] `<FirearmDetailsSection />` (collapsible)
- [x] `<LookupCombobox />` (shadcn Popover + Command + "+ Add new" inline dialog)
- [x] Auto-expand + asterisk when category `is_firearm = true`
- [x] Make radio, Made Year (1800–current+1), Made Country text
- [x] Supplier native-select bound to `suppliers` list
- [x] Integrated into `src/renderer/screens/products/index.tsx` create/edit dialog
- [x] `isFirearm` toggle on category form

## Phase 5 — Product List Enhancements

- [x] Model / Caliber / Make columns
- [x] Make + Caliber filter controls (inline selects in filter bar)

## Phase 6 — POS Integration

- [x] Product search extended to match on model/caliber/make/country (LEFT JOIN firearm lookups)
- [x] Metadata line (`Model · Caliber · Make`) under cart line item
- [x] Caliber chip on POS grid tile

## Phase 7 — Reports

- [x] Inventory by Caliber
- [x] Sales by Make (Local vs Imported)
- [x] Sales by Model (Top 25 with date range)
- [x] Stock by Supplier

## Phase 8 — Receipts, Invoices, Audit

- [x] Receipt template: model/caliber/make sub-line on firearm items
- [x] Audit log records `product_firearm` diff on firearm field change

## Phase 9 — Tests

- [x] `firearm-validation.test.ts` (7 cases: year range, make enum, required-fields)
- [x] `firearm-attrs-ipc.test.ts` (CRUD roundtrip + dup rejection + empty-name rejection for all 4 kinds)
- [x] `products-firearm.test.ts` (firearm-category required fields, accepts valid payload, audit event on diff)
- [x] `firearm-migration.test.ts` (column shape + seed counts + idempotency)

> **Note:** Tests were written but not executed this session. The vitest/vite peer-dep
> issue in the current node_modules prevents `pnpm vitest run` from launching. All code
> passes `pnpm tsc --noEmit`. Run the suite once the vite/vitest deps are refreshed.

## Sign-off

- [x] `pnpm tsc --noEmit` passes cleanly across main + renderer + preload
- [ ] `pnpm build` / `pnpm vitest run` (requires fixing vite/vitest peer-dep)
- [ ] Manual E2E QA per Task 17 Step 3 of the implementation plan
- [ ] Open PR
