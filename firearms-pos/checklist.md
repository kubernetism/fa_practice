# Firearm Product Registration — Implementation Checklist

Spec: `docs/superpowers/specs/2026-04-17-firearm-product-registration-design.md`
Started: 2026-04-17

## Phase 1 — Schema & Seeds

- [ ] Add `firearm_models` schema file (`src/main/db/schemas/firearm-models.ts`)
- [ ] Add `firearm_calibers` schema file
- [ ] Add `firearm_shapes` schema file
- [ ] Add `firearm_designs` schema file
- [ ] Register all four in `src/main/db/schema.ts` barrel
- [ ] Extend `products.ts` schema with: `make`, `made_year`, `made_country`, `firearm_model_id`, `caliber_id`, `shape_id`, `design_id`, `default_supplier_id`
- [ ] Add `is_firearm` boolean to `categories.ts` schema
- [ ] Run `drizzle-kit generate` to produce migration
- [ ] Hand-edit migration to add `INSERT OR IGNORE` seed rows (100 models, ~30 calibers, ~10 shapes, ~15 designs)
- [ ] Add indexes on new FK columns in `products`
- [ ] Verify migration against fresh DB AND against `firearms-pos-backup-2026-01-13T05-03-15.db`

## Phase 2 — IPC + Preload

- [ ] Create `src/main/ipc/firearm-attrs.ts` with CRUD handlers for all four lookup tables (list, create, update, deactivate, reorder)
- [ ] Enforce case-insensitive unique `name` on create/update
- [ ] Extend `src/main/ipc/products.ts` handlers to accept + validate new fields
- [ ] Add `is_firearm`-driven required-field validation (Zod schema)
- [ ] Emit `PRODUCT_FIREARM_UPDATED` audit log event on change
- [ ] Expose `window.firearmAttrs.*` in `src/preload/index.ts` (+ types in `src/preload/index.d.ts`)

## Phase 3 — Firearm Attributes Settings Page

- [ ] Scaffold `src/renderer/screens/firearm-attributes/index.tsx` with 4 tabs
- [ ] Build reusable `<LookupTableEditor />` component (search, add, edit, deactivate, reorder)
- [ ] Wire IPC calls via `useFirearmLookups` hook
- [ ] Add route to `src/renderer/routes.tsx`
- [ ] Add sidebar entry in `src/renderer/components/layout/sidebar.tsx`

## Phase 4 — Product Form — Firearm Details Section

- [ ] Create `<FirearmDetailsSection />` component (collapsible)
- [ ] Build `<LookupCombobox />` (shadcn Popover + Command + "+ New" inline)
- [ ] Auto-expand + mark required when category `is_firearm = true`
- [ ] Wire Make radio, Made Year numeric validation, Made Country text
- [ ] Wire Supplier combobox bound to `suppliers` list
- [ ] Integrate into `src/renderer/screens/products/index.tsx` create/edit dialogs

## Phase 5 — Product List Enhancements

- [ ] Add Model / Caliber / Make columns (hidden by default)
- [ ] Add Make / Caliber / Supplier filter controls
- [ ] Add column-visibility toggle

## Phase 6 — POS Integration

- [ ] Extend product search to match on model/caliber/make/country
- [ ] Add metadata line (`Model · Caliber · Make`) to cart line item
- [ ] Add caliber chip to POS grid tile for firearm products

## Phase 7 — Reports

- [ ] Implement "Inventory by Caliber" report + drill-down
- [ ] Implement "Sales by Make (Local vs Imported)" report
- [ ] Implement "Sales by Model" report
- [ ] Implement "Stock by Supplier" report
- [ ] Add optional caliber/make/model columns to Inventory Valuation + Sales Summary
- [ ] Add Make / Caliber / Model / Supplier filter chips to Dynamic Reports redesign

## Phase 8 — Receipts, Invoices, Audit

- [ ] Update POS receipt template: model + caliber sub-line for firearm items
- [ ] Update purchase / goods-receipt PDF: model + caliber + supplier
- [ ] Verify audit log records before/after diff for firearm fields

## Phase 9 — Tests

- [ ] Unit: `made_year` range validator
- [ ] Unit: `make` enum validator
- [ ] Unit: `is_firearm` category-driven required-field enforcement
- [ ] Integration: firearm-attrs CRUD (IPC roundtrip)
- [ ] Integration: product create/update with firearm fields
- [ ] Snapshot: receipt rendering for firearm vs non-firearm line item
- [ ] Snapshot: each of the 4 new reports
- [ ] Smoke: migration against fresh DB + existing backup DB

## Sign-off

- [ ] All phases complete, tests green
- [ ] `pnpm build` + `pnpm test` pass
- [ ] Manual QA: create a firearm product → sell it at POS → print receipt → view it in each new report
- [ ] Commit and PR
