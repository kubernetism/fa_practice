  ---                                            
  Gap Analysis: Electron POS vs Web App                                                                                                                   
                                                                                                                                                          
  STUB PAGES (need full UI build — exist in Electron, only placeholders in web)                                                                           
  ┌─────┬──────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐                                 
  │  #  │         Page         │                                   Electron Features                                    │                                 
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1   │ POS /pos             │ Main checkout interface, barcode scanning, multi-tab, mixed payments, receipt printing │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 2   │ Products /products   │ Full CRUD, serial tracking, barcode management, tax config                             │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 3   │ Inventory /inventory │ Stock levels, adjustments, transfers, low stock alerts                                 │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 4   │ Customers /customers │ CRUD, govt ID tracking, firearm license validation, license expiry                     │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 5   │ Sales /sales         │ Sale history, void/refund, payment details, item breakdown                             │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 6   │ Users /users         │ User CRUD, role assignment, granular JSON permissions                                  │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 7   │ Branches /branches   │ Multi-branch config, per-branch tax settings                                           │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 8   │ Settings /settings   │ 152-field business settings (receipt, tax, currency, inventory, payment config)        │
  ├─────┼──────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 9   │ Billing /billing     │ SaaS subscription management (new for web)                                             │
  └─────┴──────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘
  MISSING PAGES (exist in Electron, no page at all in web)
  ┌─────┬─────────────────────┬───────────────────────────────────────────────────────────────┐
  │  #  │       Feature       │                    Electron Functionality                     │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 1   │ Returns             │ Customer/stock returns with item-level tracking, reason codes │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 2   │ Suppliers           │ Supplier CRUD, contact info, payment terms                    │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 3   │ Stock Transfers     │ Inter-branch stock movement tracking                          │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 4   │ Stock Adjustments   │ Add/remove/damage/theft/correction/expired adjustments        │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 5   │ Inventory Counts    │ Physical/cycle/spot/annual count sessions with variance       │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 6   │ Tax Collections     │ Tax collection tracking and reporting                         │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 7   │ Discount Management │ Item-level and sale-level discount rules                      │
  ├─────┼─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 8   │ Database Viewer     │ Admin-only direct DB inspection                               │
  └─────┴─────────────────────┴───────────────────────────────────────────────────────────────┘
  MISSING SCHEMAS (exist in Electron DB, not in web schema)
  ┌───────────────────────┬──────────────────────────────────────────────────────┐
  │         Table         │                       Purpose                        │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ stock_adjustments     │ Inventory adjustments (6 types)                      │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ stock_transfers       │ Inter-branch transfers                               │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ inventory_counts      │ Physical count sessions                              │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ inventory_count_items │ Per-product count items                              │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ business_settings     │ 152-field business configuration                     │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ return_items          │ Items in returns (returns table exists but no items) │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ receivable_payments   │ Individual payment records against receivables       │
  ├───────────────────────┼──────────────────────────────────────────────────────┤
  │ payable_payments      │ Individual payment records against payables          │
  └───────────────────────┴──────────────────────────────────────────────────────┘
  MISSING SERVER ACTIONS
  ┌──────────────────────┬────────────────────────────────────────────────────┐
  │        Action        │                  Functions Needed                  │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ suppliers.ts         │ CRUD, listing with filters                         │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ returns.ts           │ Create return, process refund, list returns        │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ branches.ts          │ CRUD, branch settings                              │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ users.ts             │ CRUD, role/permission management                   │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ settings.ts          │ Business settings CRUD (152 fields)                │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ inventory-counts.ts  │ Create count session, record counts, variance calc │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ stock-adjustments.ts │ Record adjustments by type                         │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ stock-transfers.ts   │ Transfer between branches                          │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ dashboard.ts         │ KPI metrics, real-time stats                       │
  ├──────────────────────┼────────────────────────────────────────────────────┤
  │ tax-collections.ts   │ Tax reporting                                      │
  └──────────────────────┴────────────────────────────────────────────────────┘
  MISSING UTILITIES (Electron has, web doesn't)
  ┌───────────────────┬───────────────────────────────────────────────────────┐
  │      Utility      │                        Purpose                        │
  ├───────────────────┼───────────────────────────────────────────────────────┤
  │ Receipt Generator │ PDF receipt with custom fields, QR codes, logo        │
  ├───────────────────┼───────────────────────────────────────────────────────┤
  │ GL Posting Engine │ Auto-post journal entries on sales/purchases/expenses │
  ├───────────────────┼───────────────────────────────────────────────────────┤
  │ FIFO Valuation    │ Cost layer consumption for inventory costing          │
  ├───────────────────┼───────────────────────────────────────────────────────┤
  │ PDF Export        │ Report PDF generation                                 │
  ├───────────────────┼───────────────────────────────────────────────────────┤
  │ Barcode Scanner   │ Product lookup by barcode/code                        │
  └───────────────────┴───────────────────────────────────────────────────────┘
  ---
  Summary by Priority

  High Priority (Core POS flow):
  1. POS page (the main selling interface)
  2. Products page
  3. Customers page
  4. Sales page
  5. Inventory page
  6. Returns page + schema
  7. Suppliers page + action

  Medium Priority (Operations):
  8. Stock adjustments + schema
  9. Stock transfers + schema
  10. Inventory counts + schema
  11. Users page + action
  12. Branches page + action
  13. Settings page + action (business_settings schema)

  Lower Priority (Advanced):
  14. Tax collections
  15. Discount management
  16. Receipt/PDF generation
  17. GL auto-posting engine
  18. FIFO valuation
  19. Database viewer
  20. Billing/subscription management

  Total remaining: ~20 pages to build, ~10 actions to create, ~8 schema tables to add.

  Want me to start building these? I'd recommend starting with the high-priority stub pages (POS, Products, Customers, Sales, Inventory) since they're the
   core workflow.