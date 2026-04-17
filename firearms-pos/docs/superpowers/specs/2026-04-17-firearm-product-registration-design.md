# Firearm Product Registration — Design Spec

**Date:** 2026-04-17
**Target app:** `firearms-pos/` (Electron + SQLite + Drizzle ORM desktop POS)
**Status:** Approved for plan authoring

## 1. Problem & Goals

The current `products` table is generic (code, name, category, brand, prices, barcode, taxability) and lacks firearm-specific metadata needed by arms retailers. Staff cannot record **make (local vs imported)**, year/country of manufacture, **model**, **shape**, **design lineage**, **caliber/bore**, or the **default supplier** on a firearm product. This harms:

- Product search and cart clarity at POS
- Compliance audit trails (who sold which caliber/model, when)
- Inventory and sales reporting by firearm attribute
- Data-entry accuracy — free text invites inconsistency

**Goal:** Extend the product domain with firearm-specific, dropdown-driven attributes; seed 100 common models and 30 common calibers; propagate the fields into product list, POS, reports, receipts, and audit logs — without breaking non-firearm products (ammunition, accessories, services).

## 2. Non-Goals

- No changes to pricing, tax, inventory cost layers, or purchase/sale accounting logic.
- No multi-tenant/web-app changes (that is a separate project under `firearms-pos-web/`).
- No serial-number-level regulatory export (the existing `isSerialTracked` + `inventory` tables already cover that).
- No receipts/invoice layout redesign — only adding existing model/caliber lines.

## 3. High-Level Architecture

```
┌────────────────────────────────────────────────────┐
│  Renderer (React)                                  │
│   • screens/products/index.tsx   (product form)    │
│   • screens/firearm-attributes/  (NEW lookup CRUD) │
│   • screens/pos/index.tsx        (search + card)   │
│   • screens/reports/…            (new reports)     │
└──────────────┬─────────────────────────────────────┘
               │ IPC (contextBridge)
┌──────────────▼─────────────────────────────────────┐
│  Main (Electron)                                   │
│   • ipc/products.ts        (extended handlers)     │
│   • ipc/firearm-attrs.ts   (NEW CRUD handlers)     │
│   • db/schemas/*           (schema additions)      │
│   • db/migrations/*        (alter + seed)          │
└────────────────────────────────────────────────────┘
```

All new fields are **nullable** on `products`; compliance enforcement is category-scoped via a new `categories.is_firearm` flag.

## 4. Data Model

### 4.1 Alter `products`

Add these columns (all nullable):

| Column | Type | Notes |
|---|---|---|
| `make` | `text` | Enum in app: `'local' \| 'imported'`. DB accepts any text; Zod enforces on write. |
| `made_year` | `integer` | 1800 ≤ year ≤ current_year + 1 |
| `made_country` | `text` | Free text (e.g., "Austria", "Pakistan") |
| `firearm_model_id` | `integer` FK → `firearm_models.id` | `ON DELETE SET NULL` |
| `caliber_id` | `integer` FK → `firearm_calibers.id` | `ON DELETE SET NULL` |
| `shape_id` | `integer` FK → `firearm_shapes.id` | `ON DELETE SET NULL` |
| `design_id` | `integer` FK → `firearm_designs.id` | `ON DELETE SET NULL` |
| `default_supplier_id` | `integer` FK → `suppliers.id` | `ON DELETE SET NULL` |

Indexes: `idx_products_firearm_model`, `idx_products_caliber`, `idx_products_default_supplier`.

### 4.2 Alter `categories`

Add `is_firearm boolean NOT NULL DEFAULT false`. Categories with this flag require firearm fields on save.

### 4.3 New lookup tables

Same shape for all four:

```ts
{
  id: integer primary key autoincrement,
  name: text not null unique,
  is_active: integer (boolean) not null default true,
  sort_order: integer not null default 0,
  created_at: text not null (iso),
  updated_at: text not null (iso),
}
```

Tables:
- `firearm_models` — seeded with 100 rows
- `firearm_calibers` — seeded with ~30 rows
- `firearm_shapes` — seeded with ~10 rows
- `firearm_designs` — seeded with ~15 rows

All seed rows ship with `is_active = true` and `sort_order` matching list order so most-common items appear at the top of the combobox.

## 5. Seed Data

### 5.1 `firearm_models` (100)

**Pistols (~30):** Glock 17, Glock 19, Glock 26, Glock 43, Beretta 92FS, Beretta M9, SIG P226, SIG P320, SIG P365, CZ-75, CZ P-09, CZ Shadow 2, Walther PPQ, Walther P99, H&K USP, H&K VP9, S&W M&P 9, S&W Shield, Ruger SR9, Ruger LCP, Browning Hi-Power, 1911 Government, 1911 Commander, Desert Eagle .50, Makarov PM, Tokarev TT-33, FN Five-seveN, Springfield XD, Kahr CM9, Kimber Custom II.

**Revolvers (~8):** S&W Model 29, S&W Model 686, Colt Python, Ruger GP100, Ruger SP101, Taurus Judge, S&W Model 642, Ruger Redhawk.

**Bolt/Lever rifles (~10):** Remington 700, Winchester Model 70, Ruger American, Mauser K98, Lee-Enfield No.4, Mosin-Nagant M91/30, Marlin 336, Savage Axis, Tikka T3x, Weatherby Vanguard.

**Semi-auto rifles (~15):** Colt AR-15, S&W M&P15, Ruger AR-556, AK-47, AKM, AK-74, SKS, FN FAL, H&K G3, M14, M1A, Mini-14, SCAR-L, SCAR-H, Tavor X95.

**SMGs / PCCs (~5):** H&K MP5, UZI, CZ Scorpion Evo 3, Kel-Tec Sub-2000, B&T APC9.

**Shotguns (~12):** Remington 870, Mossberg 500, Mossberg 590, Benelli M2, Benelli M4, Beretta 1301, Winchester SXP, Browning A5, Stoeger Coach Gun, Stoeger M3000, Franchi Affinity, Weatherby SA-08.

**Sniper/DMR (~5):** Barrett M82, Accuracy International AWM, Remington M24, Remington M40, Dragunov SVD.

**Local/regional (~15):** Repeater 12-Bore, Pump Action .177, KK Rifle .22, Darra Pistol .30, Darra Rifle 7.62, Landi Kotal Revolver .38, Peshawar 12-Bore DBBL, Peshawar 12-Bore SBBL, Khyber 7.62 Carbine, Local AK Clone, Local Glock Clone, Local 1911 Clone, Local Mauser, Local .22 Bolt, Local .30 Bore Revolver.

### 5.2 `firearm_calibers` (~30)

9mm, .22 LR, .22 WMR, .25 ACP, .32 ACP, .380 ACP, .38 Special, .357 Magnum, .40 S&W, .44 Magnum, .45 ACP, .50 AE, .50 BMG, 5.56×45 NATO, 7.62×39, 7.62×51 NATO / .308 Win, 7.62×54R, .223 Rem, .270 Win, .300 Win Mag, .303 British, 6.5 Creedmoor, 12 Gauge, 16 Gauge, 20 Gauge, 28 Gauge, .410 Bore, 7mm Rem Mag, 8×57 Mauser, 9.3×62.

### 5.3 `firearm_shapes` (~10)

Pistol, Revolver, SMG, Carbine, Bolt-Action Rifle, Semi-Auto Rifle, Lever-Action Rifle, Pump Shotgun, Double-Barrel Shotgun, Break-Action.

### 5.4 `firearm_designs` (~15)

Glock-style, 1911-style, AR-15 pattern, AK pattern, Mauser pattern, Beretta-style, Browning Hi-Power pattern, SIG P-series, CZ-75 pattern, Remington 870 pattern, Mossberg 500 pattern, Mosin-Nagant pattern, Lee-Enfield pattern, Tokarev pattern, H&K roller-delayed.

## 6. UI Changes

### 6.1 Product form (`src/renderer/screens/products/index.tsx`)

Add a collapsible **"Firearm Details"** section:

- Collapsed by default when selected category has `is_firearm = false`
- Auto-expanded and fields marked required (red asterisk + Zod validation) when `is_firearm = true`
- Fields in a 2-column grid:
  - **Make** — radio group: Local / Imported
  - **Made Year** — numeric input (1800–currentYear+1)
  - **Made Country** — free text
  - **Model** — Combobox (search-filter), with "+ New" button
  - **Caliber / Bore** — Combobox, with "+ New"
  - **Shape** — Combobox, with "+ New"
  - **Design** — Combobox, with "+ New"
  - **Supplier** — Combobox bound to existing `suppliers` list

The "+ New" button opens a small inline dialog (name field only), writes to the corresponding lookup table via IPC, then selects the new row.

### 6.2 New "Firearm Attributes" settings page

- Location: `src/renderer/screens/firearm-attributes/index.tsx`
- Four tabs: Models / Calibers / Shapes / Designs
- Per tab: searchable table + Add / Edit / Deactivate (soft delete) / Reorder (drag or up/down buttons)
- Sidebar entry under the Inventory/Catalog group, adjacent to Categories
- Route registered in `src/renderer/routes.tsx`

### 6.3 Product list enhancements

- Three additional columns (toggleable via column-visibility menu, hidden by default): **Model**, **Caliber**, **Make** (Local/Imported badge)
- Filter bar additions: Make (All/Local/Imported), Caliber, Supplier

## 7. POS, Reports, Receipts

### 7.1 POS (`src/renderer/screens/pos/index.tsx`)

- Extend product search to match on `firearm_models.name`, `firearm_calibers.name`, `make`, `made_country` so queries like "9mm", "Glock", "imported" work.
- Cart line item: render subtle metadata line `Model · Caliber · Make` under the product name when any firearm field is present.
- POS grid tile: small caliber chip in the top-right corner of firearm tiles.

### 7.2 Reports

**New reports** (under the existing Reports screen):
1. **Inventory by Caliber** — stock qty and value grouped by caliber; drill-down to product list.
2. **Sales by Make (Local vs Imported)** — revenue split with margin %.
3. **Sales by Model** — top firearm models by units/revenue, date-range scoped.
4. **Stock by Supplier** — inventory value grouped by `default_supplier_id`.

**Enhanced**:
- **Inventory Valuation** and **Sales Summary** gain optional caliber/make/model columns (toggle).
- The active Dynamic Reports redesign (see `project_dynamic_reports_redesign.md`) receives four new filter chips: Make, Caliber, Model, Supplier.

### 7.3 Receipts / Invoices / Audit

- POS sales receipt: firearm line items render a second line with `Model · Caliber` under the product name. Non-firearm items unchanged.
- Purchase / goods-receipt PDF: same, plus supplier name.
- Audit log: new event type `PRODUCT_FIREARM_UPDATED` captured on any change to the new fields. The diff payload includes before/after values for each firearm field.

## 8. Validation Rules

- `made_year`: `null` OR integer in `[1800, currentYear + 1]`.
- `make`: `null` OR `'local' | 'imported'`.
- FK fields (`firearm_model_id`, `caliber_id`, `shape_id`, `design_id`, `default_supplier_id`): must reference existing, active row (or `null`).
- If `products.categoryId` references a category with `is_firearm = true`:
  - `firearm_model_id`, `caliber_id`, and `make` are **required** (Zod + UI enforcement).
  - Other firearm fields remain optional.
- Lookup-table `name` uniqueness is case-insensitive on write.

## 9. Component Boundaries

| Module | Responsibility | Depends on |
|---|---|---|
| `db/schemas/firearm-*.ts` | Table definitions (models/calibers/shapes/designs) | Drizzle core |
| `db/schemas/products.ts` | Extended columns + FK references | firearm-lookup schemas, suppliers, categories |
| `db/migrations/NNNN_firearm_attributes.sql` | ALTER TABLE + CREATE TABLE + seed INSERTs | None |
| `ipc/firearm-attrs.ts` (main) | CRUD handlers for the 4 lookup tables | Drizzle client |
| `ipc/products.ts` (main, edited) | Accept and validate new fields | Drizzle, Zod |
| `preload/index.ts` | Expose `firearmAttrs.*` API to renderer | None |
| `screens/firearm-attributes/*` | 4-tab CRUD UI | shadcn, IPC bridge |
| `screens/products/*` (edited) | Firearm Details form section | IPC bridge, lookup query hook |
| `hooks/useFirearmLookups.ts` (new) | Cached list queries for comboboxes | IPC bridge |

Each unit has a single responsibility; the lookup hook is the only shared piece between the product form and the POS search enhancement.

## 10. Implementation Phases

1. **Phase 1 — Schema & seeds**: new tables + ALTERs + seed migration + generate Drizzle client types.
2. **Phase 2 — IPC + preload**: lookup CRUD handlers, extend product create/update handlers with validation.
3. **Phase 3 — Firearm Attributes settings page**: 4-tab CRUD UI + sidebar entry + route.
4. **Phase 4 — Product form section**: collapsible Firearm Details with comboboxes and inline "+ New".
5. **Phase 5 — Product list columns + filters**.
6. **Phase 6 — POS search, cart metadata, tile chip**.
7. **Phase 7 — Reports (4 new + filter chips on Dynamic Reports)**.
8. **Phase 8 — Receipts / invoices / audit event**.
9. **Phase 9 — Tests**: unit tests on validation (made_year range, is_firearm enforcement), integration tests on IPC, snapshot tests on receipts, end-to-end test for product-create-with-firearm-fields.

A phase-by-phase checklist lives at `firearms-pos/checklist.md`.

## 11. Testing Strategy

- **Schema**: run migrations against a fresh DB and a copy of `firearms-pos-backup-2026-01-13T05-03-15.db` to confirm backward compatibility.
- **Validation**: Zod unit tests for `made_year`, `make` enum, `is_firearm` category enforcement.
- **IPC**: integration tests for lookup CRUD (create/update/deactivate/unique-name).
- **UI**: Playwright-style or Vitest-DOM tests for the product form firearm section (required-field states, "+ New" inline add).
- **Reports**: SQL-level snapshot tests per new report.
- **Receipts**: snapshot test that a firearm line item renders model + caliber, non-firearm renders unchanged.

## 12. Rollout & Risk

- **Backward compatibility**: All alters are additive with nullable columns. Existing inserts/selects keep working without code changes.
- **Data integrity**: `ON DELETE SET NULL` on FK references avoids cascade-delete of products when a lookup row is removed.
- **Admin UX risk**: deactivating a model still in use should warn with a count of affected products (implemented in the Deactivate flow).
- **Migration safety**: seed INSERTs use `INSERT OR IGNORE` so re-running the migration is idempotent.

## 13. Open Questions (resolved during brainstorming)

- Schema shape → columns on `products` (not a separate table).
- Bore field → combined "Caliber / Bore".
- Seed strategy → migration-seeded + admin-editable.
- Vendor link → `suppliers.id`.
- Make → two-value enum Local/Imported.
- Admin UX → dedicated settings page + inline "+ New".
- Scope → full-stack through reports in one plan, receipts included.
