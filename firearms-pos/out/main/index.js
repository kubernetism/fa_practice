"use strict";
const electron = require("electron");
const node_path = require("node:path");
const betterSqlite3 = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const node_fs = require("node:fs");
const sqliteCore = require("drizzle-orm/sqlite-core");
const drizzleOrm = require("drizzle-orm");
const migrator = require("drizzle-orm/better-sqlite3/migrator");
const bcrypt = require("bcryptjs");
const dateFns = require("date-fns");
const path = require("path");
const fs = require("fs");
const node_crypto = require("node:crypto");
const node_os = require("node:os");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
const users = sqliteCore.sqliteTable("users", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  username: sqliteCore.text("username").notNull().unique(),
  password: sqliteCore.text("password").notNull(),
  email: sqliteCore.text("email").notNull().unique(),
  fullName: sqliteCore.text("full_name").notNull(),
  phone: sqliteCore.text("phone"),
  role: sqliteCore.text("role", { enum: ["admin", "manager", "cashier"] }).notNull().default("cashier"),
  permissions: sqliteCore.text("permissions", { mode: "json" }).$type().default([]),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLogin: sqliteCore.text("last_login"),
  branchId: sqliteCore.integer("branch_id"),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const branches = sqliteCore.sqliteTable("branches", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  name: sqliteCore.text("name").notNull(),
  code: sqliteCore.text("code").notNull().unique(),
  address: sqliteCore.text("address"),
  phone: sqliteCore.text("phone"),
  email: sqliteCore.text("email"),
  licenseNumber: sqliteCore.text("license_number"),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  isMain: sqliteCore.integer("is_main", { mode: "boolean" }).notNull().default(false),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const categories = sqliteCore.sqliteTable("categories", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  name: sqliteCore.text("name").notNull(),
  description: sqliteCore.text("description"),
  parentId: sqliteCore.integer("parent_id").references(() => categories.id),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const products = sqliteCore.sqliteTable("products", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  code: sqliteCore.text("code").notNull().unique(),
  name: sqliteCore.text("name").notNull(),
  description: sqliteCore.text("description"),
  categoryId: sqliteCore.integer("category_id").references(() => categories.id),
  brand: sqliteCore.text("brand"),
  costPrice: sqliteCore.real("cost_price").notNull().default(0),
  sellingPrice: sqliteCore.real("selling_price").notNull().default(0),
  reorderLevel: sqliteCore.integer("reorder_level").notNull().default(10),
  unit: sqliteCore.text("unit").notNull().default("pcs"),
  isSerialTracked: sqliteCore.integer("is_serial_tracked", { mode: "boolean" }).notNull().default(false),
  isTaxable: sqliteCore.integer("is_taxable", { mode: "boolean" }).notNull().default(true),
  taxRate: sqliteCore.real("tax_rate").notNull().default(0),
  barcode: sqliteCore.text("barcode"),
  imageUrl: sqliteCore.text("image_url"),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const inventory = sqliteCore.sqliteTable(
  "inventory",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    quantity: sqliteCore.integer("quantity").notNull().default(0),
    minQuantity: sqliteCore.integer("min_quantity").notNull().default(5),
    maxQuantity: sqliteCore.integer("max_quantity").notNull().default(100),
    lastRestockDate: sqliteCore.text("last_restock_date"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => [sqliteCore.uniqueIndex("inventory_product_branch_idx").on(table.productId, table.branchId)]
);
const customers = sqliteCore.sqliteTable("customers", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  firstName: sqliteCore.text("first_name").notNull(),
  lastName: sqliteCore.text("last_name").notNull(),
  email: sqliteCore.text("email"),
  phone: sqliteCore.text("phone"),
  address: sqliteCore.text("address"),
  city: sqliteCore.text("city"),
  state: sqliteCore.text("state"),
  zipCode: sqliteCore.text("zip_code"),
  governmentIdType: sqliteCore.text("government_id_type", {
    enum: ["drivers_license", "passport", "state_id", "military_id", "other"]
  }),
  governmentIdNumber: sqliteCore.text("government_id_number"),
  firearmLicenseNumber: sqliteCore.text("firearm_license_number"),
  licenseExpiryDate: sqliteCore.text("license_expiry_date"),
  dateOfBirth: sqliteCore.text("date_of_birth"),
  notes: sqliteCore.text("notes"),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const suppliers = sqliteCore.sqliteTable("suppliers", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  name: sqliteCore.text("name").notNull(),
  contactPerson: sqliteCore.text("contact_person"),
  email: sqliteCore.text("email"),
  phone: sqliteCore.text("phone"),
  address: sqliteCore.text("address"),
  city: sqliteCore.text("city"),
  state: sqliteCore.text("state"),
  zipCode: sqliteCore.text("zip_code"),
  taxId: sqliteCore.text("tax_id"),
  paymentTerms: sqliteCore.text("payment_terms"),
  notes: sqliteCore.text("notes"),
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const sales = sqliteCore.sqliteTable("sales", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: sqliteCore.text("invoice_number").notNull().unique(),
  customerId: sqliteCore.integer("customer_id").references(() => customers.id),
  branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
  subtotal: sqliteCore.real("subtotal").notNull().default(0),
  taxAmount: sqliteCore.real("tax_amount").notNull().default(0),
  discountAmount: sqliteCore.real("discount_amount").notNull().default(0),
  totalAmount: sqliteCore.real("total_amount").notNull().default(0),
  paymentMethod: sqliteCore.text("payment_method", {
    enum: ["cash", "card", "credit", "mixed", "mobile", "cod", "receivable"]
  }).notNull().default("cash"),
  paymentStatus: sqliteCore.text("payment_status", { enum: ["paid", "partial", "pending"] }).notNull().default("paid"),
  amountPaid: sqliteCore.real("amount_paid").notNull().default(0),
  changeGiven: sqliteCore.real("change_given").notNull().default(0),
  notes: sqliteCore.text("notes"),
  isVoided: sqliteCore.integer("is_voided", { mode: "boolean" }).notNull().default(false),
  voidReason: sqliteCore.text("void_reason"),
  saleDate: sqliteCore.text("sale_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const saleItems = sqliteCore.sqliteTable("sale_items", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  saleId: sqliteCore.integer("sale_id").notNull().references(() => sales.id),
  productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
  serialNumber: sqliteCore.text("serial_number"),
  quantity: sqliteCore.integer("quantity").notNull().default(1),
  unitPrice: sqliteCore.real("unit_price").notNull(),
  costPrice: sqliteCore.real("cost_price").notNull(),
  discountPercent: sqliteCore.real("discount_percent").notNull().default(0),
  discountAmount: sqliteCore.real("discount_amount").notNull().default(0),
  taxAmount: sqliteCore.real("tax_amount").notNull().default(0),
  totalPrice: sqliteCore.real("total_price").notNull(),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const salesTabs = sqliteCore.sqliteTable(
  "sales_tabs",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    tabNumber: sqliteCore.text("tab_number").notNull().unique(),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    customerId: sqliteCore.integer("customer_id").references(() => customers.id),
    userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
    status: sqliteCore.text("status", {
      enum: ["open", "on_hold", "closed"]
    }).notNull().default("open"),
    itemCount: sqliteCore.integer("item_count").notNull().default(0),
    subtotal: sqliteCore.real("subtotal").notNull().default(0),
    discount: sqliteCore.real("discount").notNull().default(0),
    tax: sqliteCore.real("tax").notNull().default(0),
    finalAmount: sqliteCore.real("final_amount").notNull().default(0),
    notes: sqliteCore.text("notes"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    closedAt: sqliteCore.text("closed_at"),
    closedBy: sqliteCore.integer("closed_by").references(() => users.id)
  },
  (table) => [
    sqliteCore.index("sales_tabs_branch_idx").on(table.branchId),
    sqliteCore.index("sales_tabs_status_idx").on(table.status),
    sqliteCore.index("sales_tabs_created_idx").on(table.createdAt)
  ]
);
const salesTabItems = sqliteCore.sqliteTable(
  "sales_tab_items",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    tabId: sqliteCore.integer("tab_id").notNull().references(() => salesTabs.id, { onDelete: "cascade" }),
    productId: sqliteCore.integer("product_id").notNull(),
    productName: sqliteCore.text("product_name").notNull(),
    productCode: sqliteCore.text("product_code"),
    quantity: sqliteCore.integer("quantity").notNull(),
    sellingPrice: sqliteCore.real("selling_price").notNull(),
    costPrice: sqliteCore.real("cost_price").notNull(),
    taxPercent: sqliteCore.real("tax_percent").notNull().default(0),
    subtotal: sqliteCore.real("subtotal").notNull(),
    serialNumber: sqliteCore.text("serial_number"),
    batchNumber: sqliteCore.text("batch_number"),
    addedAt: sqliteCore.text("added_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => [sqliteCore.index("sales_tab_items_tab_idx").on(table.tabId)]
);
const salesTabsRelations = drizzleOrm.relations(salesTabs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesTabs.customerId],
    references: [customers.id]
  }),
  branch: one(branches, {
    fields: [salesTabs.branchId],
    references: [branches.id]
  }),
  user: one(users, {
    fields: [salesTabs.userId],
    references: [users.id]
  }),
  closedByUser: one(users, {
    fields: [salesTabs.closedBy],
    references: [users.id]
  }),
  items: many(salesTabItems)
}));
const salesTabItemsRelations = drizzleOrm.relations(salesTabItems, ({ one }) => ({
  tab: one(salesTabs, {
    fields: [salesTabItems.tabId],
    references: [salesTabs.id]
  }),
  product: one(products, {
    fields: [salesTabItems.productId],
    references: [products.id]
  })
}));
const purchases = sqliteCore.sqliteTable("purchases", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  purchaseOrderNumber: sqliteCore.text("purchase_order_number").notNull().unique(),
  supplierId: sqliteCore.integer("supplier_id").notNull().references(() => suppliers.id),
  branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
  subtotal: sqliteCore.real("subtotal").notNull().default(0),
  taxAmount: sqliteCore.real("tax_amount").notNull().default(0),
  shippingCost: sqliteCore.real("shipping_cost").notNull().default(0),
  totalAmount: sqliteCore.real("total_amount").notNull().default(0),
  paymentMethod: sqliteCore.text("payment_method", { enum: ["cash", "cheque", "pay_later"] }).notNull().default("cash"),
  paymentStatus: sqliteCore.text("payment_status", { enum: ["paid", "partial", "pending"] }).notNull().default("pending"),
  status: sqliteCore.text("status", { enum: ["draft", "ordered", "partial", "received", "cancelled"] }).notNull().default("draft"),
  expectedDeliveryDate: sqliteCore.text("expected_delivery_date"),
  receivedDate: sqliteCore.text("received_date"),
  notes: sqliteCore.text("notes"),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const purchaseItems = sqliteCore.sqliteTable("purchase_items", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: sqliteCore.integer("purchase_id").notNull().references(() => purchases.id),
  productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
  quantity: sqliteCore.integer("quantity").notNull().default(1),
  unitCost: sqliteCore.real("unit_cost").notNull(),
  receivedQuantity: sqliteCore.integer("received_quantity").notNull().default(0),
  totalCost: sqliteCore.real("total_cost").notNull(),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const returns = sqliteCore.sqliteTable("returns", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  returnNumber: sqliteCore.text("return_number").notNull().unique(),
  originalSaleId: sqliteCore.integer("original_sale_id").notNull().references(() => sales.id),
  customerId: sqliteCore.integer("customer_id").references(() => customers.id),
  branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
  returnType: sqliteCore.text("return_type", { enum: ["refund", "exchange", "store_credit"] }).notNull().default("refund"),
  subtotal: sqliteCore.real("subtotal").notNull().default(0),
  taxAmount: sqliteCore.real("tax_amount").notNull().default(0),
  totalAmount: sqliteCore.real("total_amount").notNull().default(0),
  refundMethod: sqliteCore.text("refund_method", { enum: ["cash", "card", "store_credit"] }),
  refundAmount: sqliteCore.real("refund_amount").notNull().default(0),
  reason: sqliteCore.text("reason"),
  notes: sqliteCore.text("notes"),
  returnDate: sqliteCore.text("return_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const returnItems = sqliteCore.sqliteTable("return_items", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  returnId: sqliteCore.integer("return_id").notNull().references(() => returns.id),
  saleItemId: sqliteCore.integer("sale_item_id").notNull().references(() => saleItems.id),
  productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
  serialNumber: sqliteCore.text("serial_number"),
  quantity: sqliteCore.integer("quantity").notNull().default(1),
  unitPrice: sqliteCore.real("unit_price").notNull(),
  totalPrice: sqliteCore.real("total_price").notNull(),
  condition: sqliteCore.text("condition", { enum: ["new", "good", "fair", "damaged"] }).notNull().default("good"),
  restockable: sqliteCore.integer("restockable", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const accountPayables = sqliteCore.sqliteTable(
  "account_payables",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    supplierId: sqliteCore.integer("supplier_id").notNull().references(() => suppliers.id),
    purchaseId: sqliteCore.integer("purchase_id").references(() => purchases.id),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    invoiceNumber: sqliteCore.text("invoice_number").notNull(),
    totalAmount: sqliteCore.real("total_amount").notNull(),
    // Original amount owed
    paidAmount: sqliteCore.real("paid_amount").notNull().default(0),
    // Amount paid so far
    remainingAmount: sqliteCore.real("remaining_amount").notNull(),
    // Amount still owed
    status: sqliteCore.text("status", { enum: ["pending", "partial", "paid", "overdue", "cancelled"] }).notNull().default("pending"),
    dueDate: sqliteCore.text("due_date"),
    // Payment due date
    paymentTerms: sqliteCore.text("payment_terms"),
    // e.g., "Net 30", "Net 60"
    notes: sqliteCore.text("notes"),
    createdBy: sqliteCore.integer("created_by").references(() => users.id),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    supplierIdx: sqliteCore.index("payables_supplier_idx").on(table.supplierId),
    statusIdx: sqliteCore.index("payables_status_idx").on(table.status),
    branchIdx: sqliteCore.index("payables_branch_idx").on(table.branchId),
    dueDateIdx: sqliteCore.index("payables_due_date_idx").on(table.dueDate)
  })
);
const payablePayments = sqliteCore.sqliteTable(
  "payable_payments",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    payableId: sqliteCore.integer("payable_id").notNull().references(() => accountPayables.id, { onDelete: "cascade" }),
    amount: sqliteCore.real("amount").notNull(),
    paymentMethod: sqliteCore.text("payment_method", {
      enum: ["cash", "card", "bank_transfer", "cheque", "mobile"]
    }).notNull().default("bank_transfer"),
    referenceNumber: sqliteCore.text("reference_number"),
    // Cheque number, transaction ID, etc.
    notes: sqliteCore.text("notes"),
    paidBy: sqliteCore.integer("paid_by").references(() => users.id),
    paymentDate: sqliteCore.text("payment_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    payableIdx: sqliteCore.index("payable_payments_payable_idx").on(table.payableId),
    dateIdx: sqliteCore.index("payable_payments_date_idx").on(table.paymentDate)
  })
);
const accountPayablesRelations = drizzleOrm.relations(accountPayables, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [accountPayables.supplierId],
    references: [suppliers.id]
  }),
  purchase: one(purchases, {
    fields: [accountPayables.purchaseId],
    references: [purchases.id]
  }),
  branch: one(branches, {
    fields: [accountPayables.branchId],
    references: [branches.id]
  }),
  createdByUser: one(users, {
    fields: [accountPayables.createdBy],
    references: [users.id]
  }),
  payments: many(payablePayments)
}));
const payablePaymentsRelations = drizzleOrm.relations(payablePayments, ({ one }) => ({
  payable: one(accountPayables, {
    fields: [payablePayments.payableId],
    references: [accountPayables.id]
  }),
  paidByUser: one(users, {
    fields: [payablePayments.paidBy],
    references: [users.id]
  })
}));
const expenses = sqliteCore.sqliteTable(
  "expenses",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
    category: sqliteCore.text("category", {
      enum: ["rent", "utilities", "salaries", "supplies", "maintenance", "marketing", "other"]
    }).notNull().default("other"),
    amount: sqliteCore.real("amount").notNull(),
    description: sqliteCore.text("description"),
    paymentMethod: sqliteCore.text("payment_method", { enum: ["cash", "card", "check", "transfer"] }).notNull().default("cash"),
    reference: sqliteCore.text("reference"),
    expenseDate: sqliteCore.text("expense_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    // New fields for unpaid expense tracking
    paymentStatus: sqliteCore.text("payment_status", { enum: ["paid", "unpaid"] }).notNull().default("paid"),
    supplierId: sqliteCore.integer("supplier_id").references(() => suppliers.id),
    payableId: sqliteCore.integer("payable_id").references(() => accountPayables.id),
    dueDate: sqliteCore.text("due_date"),
    paymentTerms: sqliteCore.text("payment_terms"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    paymentStatusIdx: sqliteCore.index("expenses_payment_status_idx").on(table.paymentStatus),
    supplierIdx: sqliteCore.index("expenses_supplier_idx").on(table.supplierId),
    payableIdx: sqliteCore.index("expenses_payable_idx").on(table.payableId)
  })
);
const expensesRelations = drizzleOrm.relations(expenses, ({ one }) => ({
  branch: one(branches, {
    fields: [expenses.branchId],
    references: [branches.id]
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id]
  }),
  supplier: one(suppliers, {
    fields: [expenses.supplierId],
    references: [suppliers.id]
  }),
  payable: one(accountPayables, {
    fields: [expenses.payableId],
    references: [accountPayables.id]
  })
}));
const referralPersons = sqliteCore.sqliteTable(
  "referral_persons",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    name: sqliteCore.text("name").notNull(),
    contact: sqliteCore.text("contact"),
    address: sqliteCore.text("address"),
    notes: sqliteCore.text("notes"),
    isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
    totalCommissionEarned: sqliteCore.real("total_commission_earned").notNull().default(0),
    totalCommissionPaid: sqliteCore.real("total_commission_paid").notNull().default(0),
    commissionRate: sqliteCore.real("commission_rate"),
    // Default commission rate for this referral person
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    branchIdx: sqliteCore.index("referral_persons_branch_idx").on(table.branchId),
    nameIdx: sqliteCore.index("referral_persons_name_idx").on(table.name)
  })
);
const commissions = sqliteCore.sqliteTable("commissions", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  saleId: sqliteCore.integer("sale_id").notNull().references(() => sales.id),
  userId: sqliteCore.integer("user_id").references(() => users.id),
  // Employee commission (optional)
  referralPersonId: sqliteCore.integer("referral_person_id").references(() => referralPersons.id),
  // Referral commission (optional)
  branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
  commissionType: sqliteCore.text("commission_type", { enum: ["sale", "referral", "bonus"] }).notNull().default("sale"),
  baseAmount: sqliteCore.real("base_amount").notNull(),
  rate: sqliteCore.real("rate").notNull(),
  commissionAmount: sqliteCore.real("commission_amount").notNull(),
  status: sqliteCore.text("status", { enum: ["pending", "approved", "paid", "cancelled"] }).notNull().default("pending"),
  paidDate: sqliteCore.text("paid_date"),
  notes: sqliteCore.text("notes"),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const auditLogs = sqliteCore.sqliteTable("audit_logs", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  userId: sqliteCore.integer("user_id").references(() => users.id),
  branchId: sqliteCore.integer("branch_id").references(() => branches.id),
  action: sqliteCore.text("action", {
    enum: [
      "create",
      "update",
      "delete",
      "login",
      "logout",
      "void",
      "refund",
      "adjustment",
      "transfer",
      "export",
      "view"
    ]
  }).notNull(),
  entityType: sqliteCore.text("entity_type", {
    enum: [
      "user",
      "branch",
      "category",
      "product",
      "inventory",
      "customer",
      "supplier",
      "sale",
      "purchase",
      "return",
      "expense",
      "commission",
      "setting",
      "auth"
    ]
  }).notNull(),
  entityId: sqliteCore.integer("entity_id"),
  oldValues: sqliteCore.text("old_values", { mode: "json" }).$type(),
  newValues: sqliteCore.text("new_values", { mode: "json" }).$type(),
  description: sqliteCore.text("description"),
  ipAddress: sqliteCore.text("ip_address"),
  userAgent: sqliteCore.text("user_agent"),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const settings = sqliteCore.sqliteTable("settings", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  key: sqliteCore.text("key").notNull().unique(),
  value: sqliteCore.text("value", { mode: "json" }).$type(),
  category: sqliteCore.text("category", {
    enum: ["general", "company", "tax", "receipt", "inventory", "sales", "notification", "backup"]
  }).notNull().default("general"),
  description: sqliteCore.text("description"),
  updatedBy: sqliteCore.integer("updated_by").references(() => users.id),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const stockAdjustments = sqliteCore.sqliteTable("stock_adjustments", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
  branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
  adjustmentType: sqliteCore.text("adjustment_type", {
    enum: ["add", "remove", "damage", "theft", "correction", "expired"]
  }).notNull(),
  quantityBefore: sqliteCore.integer("quantity_before").notNull(),
  quantityChange: sqliteCore.integer("quantity_change").notNull(),
  quantityAfter: sqliteCore.integer("quantity_after").notNull(),
  serialNumber: sqliteCore.text("serial_number"),
  reason: sqliteCore.text("reason").notNull(),
  reference: sqliteCore.text("reference"),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const stockTransfers = sqliteCore.sqliteTable("stock_transfers", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  transferNumber: sqliteCore.text("transfer_number").notNull().unique(),
  productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
  fromBranchId: sqliteCore.integer("from_branch_id").notNull().references(() => branches.id),
  toBranchId: sqliteCore.integer("to_branch_id").notNull().references(() => branches.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
  quantity: sqliteCore.integer("quantity").notNull(),
  serialNumbers: sqliteCore.text("serial_numbers", { mode: "json" }).$type().default([]),
  status: sqliteCore.text("status", { enum: ["pending", "in_transit", "completed", "cancelled"] }).notNull().default("pending"),
  notes: sqliteCore.text("notes"),
  transferDate: sqliteCore.text("transfer_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  receivedDate: sqliteCore.text("received_date"),
  receivedBy: sqliteCore.integer("received_by").references(() => users.id),
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const businessSettings = sqliteCore.sqliteTable("business_settings", {
  // Primary Key
  settingId: sqliteCore.integer("setting_id").primaryKey({ autoIncrement: true }),
  // Branch Association (NULL = Global Settings)
  branchId: sqliteCore.integer("branch_id").references(() => branches.id),
  // Business Information
  businessName: sqliteCore.text("business_name").notNull(),
  businessRegistrationNo: sqliteCore.text("business_registration_no"),
  businessType: sqliteCore.text("business_type"),
  // Retail, Wholesale, Mixed
  businessAddress: sqliteCore.text("business_address"),
  businessCity: sqliteCore.text("business_city"),
  businessState: sqliteCore.text("business_state"),
  businessCountry: sqliteCore.text("business_country"),
  businessPostalCode: sqliteCore.text("business_postal_code"),
  businessPhone: sqliteCore.text("business_phone"),
  businessEmail: sqliteCore.text("business_email"),
  businessWebsite: sqliteCore.text("business_website"),
  businessLogo: sqliteCore.text("business_logo"),
  // Base64 or file path
  // Tax Configuration
  taxId: sqliteCore.text("tax_id"),
  taxRate: sqliteCore.real("tax_rate").default(0),
  taxName: sqliteCore.text("tax_name").default("GST"),
  isTaxInclusive: sqliteCore.integer("is_tax_inclusive", { mode: "boolean" }).default(false),
  secondaryTaxRate: sqliteCore.real("secondary_tax_rate").default(0),
  secondaryTaxName: sqliteCore.text("secondary_tax_name"),
  // Currency Settings
  currencySymbol: sqliteCore.text("currency_symbol").default("Rs."),
  currencyCode: sqliteCore.text("currency_code").default("PKR"),
  currencyPosition: sqliteCore.text("currency_position").default("prefix"),
  // prefix or suffix
  decimalPlaces: sqliteCore.integer("decimal_places").default(2),
  thousandSeparator: sqliteCore.text("thousand_separator").default(","),
  decimalSeparator: sqliteCore.text("decimal_separator").default("."),
  // Receipt/Invoice Settings
  receiptHeader: sqliteCore.text("receipt_header"),
  receiptFooter: sqliteCore.text("receipt_footer"),
  receiptLogo: sqliteCore.text("receipt_logo"),
  invoicePrefix: sqliteCore.text("invoice_prefix").default("INV"),
  invoiceNumberFormat: sqliteCore.text("invoice_number_format").default("sequential"),
  // sequential, date-based
  invoiceStartingNumber: sqliteCore.integer("invoice_starting_number").default(1),
  showTaxOnReceipt: sqliteCore.integer("show_tax_on_receipt", { mode: "boolean" }).default(true),
  showQRCodeOnReceipt: sqliteCore.integer("show_qr_code_on_receipt", { mode: "boolean" }).default(false),
  // Receipt Customization Settings
  receiptFormat: sqliteCore.text("receipt_format").default("pdf"),
  // pdf | thermal
  receiptPrimaryColor: sqliteCore.text("receipt_primary_color").default("#1e40af"),
  receiptSecondaryColor: sqliteCore.text("receipt_secondary_color").default("#64748b"),
  receiptFontSize: sqliteCore.text("receipt_font_size").default("medium"),
  // small | medium | large
  receiptCustomField1Label: sqliteCore.text("receipt_custom_field_1_label"),
  receiptCustomField1Value: sqliteCore.text("receipt_custom_field_1_value"),
  receiptCustomField2Label: sqliteCore.text("receipt_custom_field_2_label"),
  receiptCustomField2Value: sqliteCore.text("receipt_custom_field_2_value"),
  receiptCustomField3Label: sqliteCore.text("receipt_custom_field_3_label"),
  receiptCustomField3Value: sqliteCore.text("receipt_custom_field_3_value"),
  receiptTermsAndConditions: sqliteCore.text("receipt_terms_and_conditions"),
  receiptShowBusinessLogo: sqliteCore.integer("receipt_show_business_logo", { mode: "boolean" }).default(true),
  receiptAutoDownload: sqliteCore.integer("receipt_auto_download", { mode: "boolean" }).default(true),
  // Inventory Settings
  lowStockThreshold: sqliteCore.integer("low_stock_threshold").default(10),
  enableStockTracking: sqliteCore.integer("enable_stock_tracking", { mode: "boolean" }).default(true),
  allowNegativeStock: sqliteCore.integer("allow_negative_stock", { mode: "boolean" }).default(false),
  stockValuationMethod: sqliteCore.text("stock_valuation_method").default("FIFO"),
  // FIFO, LIFO, Average
  autoReorderEnabled: sqliteCore.integer("auto_reorder_enabled", { mode: "boolean" }).default(false),
  autoReorderQuantity: sqliteCore.integer("auto_reorder_quantity").default(50),
  // Payment Settings
  defaultPaymentMethod: sqliteCore.text("default_payment_method").default("Cash"),
  allowedPaymentMethods: sqliteCore.text("allowed_payment_methods").default("Cash,Card,Bank Transfer,COD"),
  enableCashDrawer: sqliteCore.integer("enable_cash_drawer", { mode: "boolean" }).default(true),
  openingCashBalance: sqliteCore.real("opening_cash_balance").default(0),
  // Sales Settings
  enableDiscounts: sqliteCore.integer("enable_discounts", { mode: "boolean" }).default(true),
  maxDiscountPercentage: sqliteCore.real("max_discount_percentage").default(50),
  requireCustomerForSale: sqliteCore.integer("require_customer_for_sale", { mode: "boolean" }).default(false),
  enableCustomerLoyalty: sqliteCore.integer("enable_customer_loyalty", { mode: "boolean" }).default(false),
  loyaltyPointsRatio: sqliteCore.real("loyalty_points_ratio").default(1),
  // Expense Settings
  expenseCategories: sqliteCore.text("expense_categories").default("Utilities,Rent,Salaries,Supplies,Maintenance,Other"),
  expenseApprovalRequired: sqliteCore.integer("expense_approval_required", { mode: "boolean" }).default(false),
  expenseApprovalLimit: sqliteCore.real("expense_approval_limit").default(1e4),
  // Return/Refund Settings
  enableReturns: sqliteCore.integer("enable_returns", { mode: "boolean" }).default(true),
  returnWindowDays: sqliteCore.integer("return_window_days").default(30),
  requireReceiptForReturn: sqliteCore.integer("require_receipt_for_return", { mode: "boolean" }).default(true),
  refundMethod: sqliteCore.text("refund_method").default("Original Payment Method"),
  // Notification Settings
  enableEmailNotifications: sqliteCore.integer("enable_email_notifications", { mode: "boolean" }).default(false),
  notificationEmail: sqliteCore.text("notification_email"),
  lowStockNotifications: sqliteCore.integer("low_stock_notifications", { mode: "boolean" }).default(true),
  dailySalesReport: sqliteCore.integer("daily_sales_report", { mode: "boolean" }).default(false),
  // Working Hours
  workingDaysStart: sqliteCore.text("working_days_start").default("Monday"),
  workingDaysEnd: sqliteCore.text("working_days_end").default("Saturday"),
  openingTime: sqliteCore.text("opening_time").default("09:00"),
  closingTime: sqliteCore.text("closing_time").default("18:00"),
  // Backup Settings
  autoBackupEnabled: sqliteCore.integer("auto_backup_enabled", { mode: "boolean" }).default(true),
  autoBackupFrequency: sqliteCore.text("auto_backup_frequency").default("daily"),
  backupRetentionDays: sqliteCore.integer("backup_retention_days").default(30),
  // System Preferences
  dateFormat: sqliteCore.text("date_format").default("DD/MM/YYYY"),
  timeFormat: sqliteCore.text("time_format").default("24-hour"),
  language: sqliteCore.text("language").default("en"),
  timezone: sqliteCore.text("timezone").default("UTC"),
  // Security Settings (Admin Only)
  sessionTimeoutMinutes: sqliteCore.integer("session_timeout_minutes").default(60),
  requirePasswordChange: sqliteCore.integer("require_password_change", { mode: "boolean" }).default(false),
  passwordChangeIntervalDays: sqliteCore.integer("password_change_interval_days").default(90),
  enableAuditLogs: sqliteCore.integer("enable_audit_logs", { mode: "boolean" }).default(true),
  // Status & Metadata
  isActive: sqliteCore.integer("is_active", { mode: "boolean" }).default(true),
  isDefault: sqliteCore.integer("is_default", { mode: "boolean" }).default(false),
  notes: sqliteCore.text("notes"),
  createdBy: sqliteCore.integer("created_by").references(() => users.id),
  createdAt: sqliteCore.text("created_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const businessSettingsRelations = drizzleOrm.relations(businessSettings, ({ one }) => ({
  branch: one(branches, {
    fields: [businessSettings.branchId],
    references: [branches.id]
  }),
  createdByUser: one(users, {
    fields: [businessSettings.createdBy],
    references: [users.id]
  })
}));
const accountReceivables = sqliteCore.sqliteTable(
  "account_receivables",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    customerId: sqliteCore.integer("customer_id").notNull().references(() => customers.id),
    saleId: sqliteCore.integer("sale_id").references(() => sales.id),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    invoiceNumber: sqliteCore.text("invoice_number").notNull(),
    totalAmount: sqliteCore.real("total_amount").notNull(),
    // Original amount owed
    paidAmount: sqliteCore.real("paid_amount").notNull().default(0),
    // Amount paid so far
    remainingAmount: sqliteCore.real("remaining_amount").notNull(),
    // Amount still owed
    status: sqliteCore.text("status", { enum: ["pending", "partial", "paid", "overdue", "cancelled"] }).notNull().default("pending"),
    dueDate: sqliteCore.text("due_date"),
    // Optional due date for payment
    notes: sqliteCore.text("notes"),
    createdBy: sqliteCore.integer("created_by").references(() => users.id),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    customerIdx: sqliteCore.index("receivables_customer_idx").on(table.customerId),
    statusIdx: sqliteCore.index("receivables_status_idx").on(table.status),
    branchIdx: sqliteCore.index("receivables_branch_idx").on(table.branchId),
    dueDateIdx: sqliteCore.index("receivables_due_date_idx").on(table.dueDate)
  })
);
const receivablePayments = sqliteCore.sqliteTable(
  "receivable_payments",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    receivableId: sqliteCore.integer("receivable_id").notNull().references(() => accountReceivables.id, { onDelete: "cascade" }),
    amount: sqliteCore.real("amount").notNull(),
    paymentMethod: sqliteCore.text("payment_method", {
      enum: ["cash", "card", "mobile", "bank_transfer", "cheque"]
    }).notNull().default("cash"),
    referenceNumber: sqliteCore.text("reference_number"),
    // Cheque number, transaction ID, etc.
    notes: sqliteCore.text("notes"),
    receivedBy: sqliteCore.integer("received_by").references(() => users.id),
    paymentDate: sqliteCore.text("payment_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    receivableIdx: sqliteCore.index("payments_receivable_idx").on(table.receivableId),
    dateIdx: sqliteCore.index("payments_date_idx").on(table.paymentDate)
  })
);
const accountReceivablesRelations = drizzleOrm.relations(accountReceivables, ({ one, many }) => ({
  customer: one(customers, {
    fields: [accountReceivables.customerId],
    references: [customers.id]
  }),
  sale: one(sales, {
    fields: [accountReceivables.saleId],
    references: [sales.id]
  }),
  branch: one(branches, {
    fields: [accountReceivables.branchId],
    references: [branches.id]
  }),
  createdByUser: one(users, {
    fields: [accountReceivables.createdBy],
    references: [users.id]
  }),
  payments: many(receivablePayments)
}));
const receivablePaymentsRelations = drizzleOrm.relations(receivablePayments, ({ one }) => ({
  receivable: one(accountReceivables, {
    fields: [receivablePayments.receivableId],
    references: [accountReceivables.id]
  }),
  receivedByUser: one(users, {
    fields: [receivablePayments.receivedBy],
    references: [users.id]
  })
}));
const cashRegisterSessions = sqliteCore.sqliteTable(
  "cash_register_sessions",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    sessionDate: sqliteCore.text("session_date").notNull(),
    // YYYY-MM-DD format
    openingBalance: sqliteCore.real("opening_balance").notNull().default(0),
    closingBalance: sqliteCore.real("closing_balance"),
    // Set when session is closed
    expectedBalance: sqliteCore.real("expected_balance"),
    // Calculated from transactions
    actualBalance: sqliteCore.real("actual_balance"),
    // Counted cash
    variance: sqliteCore.real("variance"),
    // Difference between expected and actual
    status: sqliteCore.text("status", { enum: ["open", "closed", "reconciled"] }).notNull().default("open"),
    openedBy: sqliteCore.integer("opened_by").notNull().references(() => users.id),
    closedBy: sqliteCore.integer("closed_by").references(() => users.id),
    reconciledBy: sqliteCore.integer("reconciled_by").references(() => users.id),
    openedAt: sqliteCore.text("opened_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    closedAt: sqliteCore.text("closed_at"),
    reconciledAt: sqliteCore.text("reconciled_at"),
    notes: sqliteCore.text("notes"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    branchDateUnique: sqliteCore.unique("cash_session_branch_date_unique").on(table.branchId, table.sessionDate),
    branchIdx: sqliteCore.index("cash_session_branch_idx").on(table.branchId),
    dateIdx: sqliteCore.index("cash_session_date_idx").on(table.sessionDate),
    statusIdx: sqliteCore.index("cash_session_status_idx").on(table.status)
  })
);
const cashTransactions = sqliteCore.sqliteTable(
  "cash_transactions",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    sessionId: sqliteCore.integer("session_id").notNull().references(() => cashRegisterSessions.id),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    transactionType: sqliteCore.text("transaction_type", {
      enum: [
        "sale",
        // Cash from sales
        "refund",
        // Cash refunds
        "expense",
        // Cash expenses
        "ar_collection",
        // Cash collected from receivables
        "ap_payment",
        // Cash paid for payables
        "deposit",
        // Cash deposited to bank
        "withdrawal",
        // Cash withdrawn from bank
        "adjustment",
        // Manual adjustments
        "petty_cash_in",
        // Petty cash added
        "petty_cash_out"
        // Petty cash removed
      ]
    }).notNull(),
    amount: sqliteCore.real("amount").notNull(),
    // Positive for inflow, negative for outflow
    referenceType: sqliteCore.text("reference_type"),
    // 'sale', 'expense', 'receivable', 'payable', etc.
    referenceId: sqliteCore.integer("reference_id"),
    // ID of the related record
    description: sqliteCore.text("description"),
    recordedBy: sqliteCore.integer("recorded_by").notNull().references(() => users.id),
    transactionDate: sqliteCore.text("transaction_date").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    sessionIdx: sqliteCore.index("cash_tx_session_idx").on(table.sessionId),
    branchIdx: sqliteCore.index("cash_tx_branch_idx").on(table.branchId),
    typeIdx: sqliteCore.index("cash_tx_type_idx").on(table.transactionType),
    dateIdx: sqliteCore.index("cash_tx_date_idx").on(table.transactionDate)
  })
);
const cashRegisterSessionsRelations = drizzleOrm.relations(cashRegisterSessions, ({ one, many }) => ({
  branch: one(branches, {
    fields: [cashRegisterSessions.branchId],
    references: [branches.id]
  }),
  openedByUser: one(users, {
    fields: [cashRegisterSessions.openedBy],
    references: [users.id],
    relationName: "openedBy"
  }),
  closedByUser: one(users, {
    fields: [cashRegisterSessions.closedBy],
    references: [users.id],
    relationName: "closedBy"
  }),
  reconciledByUser: one(users, {
    fields: [cashRegisterSessions.reconciledBy],
    references: [users.id],
    relationName: "reconciledBy"
  }),
  transactions: many(cashTransactions)
}));
const cashTransactionsRelations = drizzleOrm.relations(cashTransactions, ({ one }) => ({
  session: one(cashRegisterSessions, {
    fields: [cashTransactions.sessionId],
    references: [cashRegisterSessions.id]
  }),
  branch: one(branches, {
    fields: [cashTransactions.branchId],
    references: [branches.id]
  }),
  recordedByUser: one(users, {
    fields: [cashTransactions.recordedBy],
    references: [users.id]
  })
}));
const chartOfAccounts = sqliteCore.sqliteTable(
  "chart_of_accounts",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    accountCode: sqliteCore.text("account_code").notNull().unique(),
    // e.g., "1000", "1100", "2000"
    accountName: sqliteCore.text("account_name").notNull(),
    accountType: sqliteCore.text("account_type", {
      enum: ["asset", "liability", "equity", "revenue", "expense"]
    }).notNull(),
    accountSubType: sqliteCore.text("account_sub_type", {
      enum: [
        // Assets
        "cash",
        "bank",
        "accounts_receivable",
        "inventory",
        "prepaid_expense",
        "fixed_asset",
        "accumulated_depreciation",
        "other_asset",
        // Liabilities
        "accounts_payable",
        "accrued_expense",
        "short_term_loan",
        "long_term_loan",
        "other_liability",
        // Equity
        "owner_capital",
        "retained_earnings",
        "drawings",
        // Revenue
        "sales_revenue",
        "service_revenue",
        "other_revenue",
        // Expenses
        "cost_of_goods_sold",
        "operating_expense",
        "payroll_expense",
        "rent_expense",
        "utilities_expense",
        "depreciation_expense",
        "other_expense"
      ]
    }),
    parentAccountId: sqliteCore.integer("parent_account_id"),
    // For hierarchical accounts
    description: sqliteCore.text("description"),
    isActive: sqliteCore.integer("is_active", { mode: "boolean" }).notNull().default(true),
    isSystemAccount: sqliteCore.integer("is_system_account", { mode: "boolean" }).notNull().default(false),
    // Cannot be deleted
    normalBalance: sqliteCore.text("normal_balance", { enum: ["debit", "credit"] }).notNull(),
    currentBalance: sqliteCore.real("current_balance").notNull().default(0),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    typeIdx: sqliteCore.index("coa_type_idx").on(table.accountType),
    parentIdx: sqliteCore.index("coa_parent_idx").on(table.parentAccountId),
    activeIdx: sqliteCore.index("coa_active_idx").on(table.isActive)
  })
);
const journalEntries = sqliteCore.sqliteTable(
  "journal_entries",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    entryNumber: sqliteCore.text("entry_number").notNull().unique(),
    // JE-YYYY-NNNN
    entryDate: sqliteCore.text("entry_date").notNull(),
    description: sqliteCore.text("description").notNull(),
    referenceType: sqliteCore.text("reference_type"),
    // 'sale', 'purchase', 'expense', 'adjustment', etc.
    referenceId: sqliteCore.integer("reference_id"),
    branchId: sqliteCore.integer("branch_id").references(() => branches.id),
    status: sqliteCore.text("status", { enum: ["draft", "posted", "reversed"] }).notNull().default("draft"),
    isAutoGenerated: sqliteCore.integer("is_auto_generated", { mode: "boolean" }).notNull().default(false),
    createdBy: sqliteCore.integer("created_by").notNull().references(() => users.id),
    postedBy: sqliteCore.integer("posted_by").references(() => users.id),
    postedAt: sqliteCore.text("posted_at"),
    reversedBy: sqliteCore.integer("reversed_by").references(() => users.id),
    reversedAt: sqliteCore.text("reversed_at"),
    reversalEntryId: sqliteCore.integer("reversal_entry_id"),
    // Links to the reversing entry
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    dateIdx: sqliteCore.index("je_date_idx").on(table.entryDate),
    statusIdx: sqliteCore.index("je_status_idx").on(table.status),
    refIdx: sqliteCore.index("je_ref_idx").on(table.referenceType, table.referenceId)
  })
);
const journalEntryLines = sqliteCore.sqliteTable(
  "journal_entry_lines",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    journalEntryId: sqliteCore.integer("journal_entry_id").notNull().references(() => journalEntries.id, { onDelete: "cascade" }),
    accountId: sqliteCore.integer("account_id").notNull().references(() => chartOfAccounts.id),
    debitAmount: sqliteCore.real("debit_amount").notNull().default(0),
    creditAmount: sqliteCore.real("credit_amount").notNull().default(0),
    description: sqliteCore.text("description"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    entryIdx: sqliteCore.index("jel_entry_idx").on(table.journalEntryId),
    accountIdx: sqliteCore.index("jel_account_idx").on(table.accountId)
  })
);
const accountBalances = sqliteCore.sqliteTable(
  "account_balances",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    accountId: sqliteCore.integer("account_id").notNull().references(() => chartOfAccounts.id),
    branchId: sqliteCore.integer("branch_id").references(() => branches.id),
    // null for consolidated
    periodType: sqliteCore.text("period_type", { enum: ["daily", "monthly", "yearly"] }).notNull(),
    periodDate: sqliteCore.text("period_date").notNull(),
    // YYYY-MM-DD for daily, YYYY-MM for monthly, YYYY for yearly
    openingBalance: sqliteCore.real("opening_balance").notNull().default(0),
    debitTotal: sqliteCore.real("debit_total").notNull().default(0),
    creditTotal: sqliteCore.real("credit_total").notNull().default(0),
    closingBalance: sqliteCore.real("closing_balance").notNull().default(0),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    accountPeriodIdx: sqliteCore.index("ab_account_period_idx").on(table.accountId, table.periodType, table.periodDate),
    branchIdx: sqliteCore.index("ab_branch_idx").on(table.branchId)
  })
);
const chartOfAccountsRelations = drizzleOrm.relations(chartOfAccounts, ({ one, many }) => ({
  parentAccount: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
    relationName: "parentChild"
  }),
  childAccounts: many(chartOfAccounts, { relationName: "parentChild" }),
  journalLines: many(journalEntryLines),
  balances: many(accountBalances)
}));
const journalEntriesRelations = drizzleOrm.relations(journalEntries, ({ one, many }) => ({
  branch: one(branches, {
    fields: [journalEntries.branchId],
    references: [branches.id]
  }),
  createdByUser: one(users, {
    fields: [journalEntries.createdBy],
    references: [users.id],
    relationName: "createdBy"
  }),
  postedByUser: one(users, {
    fields: [journalEntries.postedBy],
    references: [users.id],
    relationName: "postedBy"
  }),
  lines: many(journalEntryLines)
}));
const journalEntryLinesRelations = drizzleOrm.relations(journalEntryLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalEntryLines.journalEntryId],
    references: [journalEntries.id]
  }),
  account: one(chartOfAccounts, {
    fields: [journalEntryLines.accountId],
    references: [chartOfAccounts.id]
  })
}));
const accountBalancesRelations = drizzleOrm.relations(accountBalances, ({ one }) => ({
  account: one(chartOfAccounts, {
    fields: [accountBalances.accountId],
    references: [chartOfAccounts.id]
  }),
  branch: one(branches, {
    fields: [accountBalances.branchId],
    references: [branches.id]
  })
}));
const todos = sqliteCore.sqliteTable(
  "todos",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    title: sqliteCore.text("title").notNull(),
    description: sqliteCore.text("description"),
    status: sqliteCore.text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).notNull().default("pending"),
    priority: sqliteCore.text("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
    dueDate: sqliteCore.text("due_date"),
    createdBy: sqliteCore.integer("created_by").notNull().references(() => users.id),
    assignedTo: sqliteCore.integer("assigned_to").notNull().references(() => users.id),
    assignedToRole: sqliteCore.text("assigned_to_role", { enum: ["admin", "manager", "cashier"] }).notNull(),
    branchId: sqliteCore.integer("branch_id").references(() => branches.id),
    completedAt: sqliteCore.text("completed_at"),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    assignedToIdx: sqliteCore.index("todos_assigned_to_idx").on(table.assignedTo),
    assignedToRoleIdx: sqliteCore.index("todos_assigned_to_role_idx").on(table.assignedToRole),
    statusIdx: sqliteCore.index("todos_status_idx").on(table.status),
    createdByIdx: sqliteCore.index("todos_created_by_idx").on(table.createdBy),
    branchIdx: sqliteCore.index("todos_branch_idx").on(table.branchId)
  })
);
const todosRelations = drizzleOrm.relations(todos, ({ one }) => ({
  creator: one(users, {
    fields: [todos.createdBy],
    references: [users.id],
    relationName: "todoCreator"
  }),
  assignee: one(users, {
    fields: [todos.assignedTo],
    references: [users.id],
    relationName: "todoAssignee"
  }),
  branch: one(branches, {
    fields: [todos.branchId],
    references: [branches.id]
  })
}));
const messages = sqliteCore.sqliteTable(
  "messages",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    content: sqliteCore.text("content").notNull(),
    senderId: sqliteCore.integer("sender_id").notNull().references(() => users.id),
    // If recipientId is null, it's a broadcast message to all users
    recipientId: sqliteCore.integer("recipient_id").references(() => users.id),
    isRead: sqliteCore.integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    senderIdx: sqliteCore.index("messages_sender_idx").on(table.senderId),
    recipientIdx: sqliteCore.index("messages_recipient_idx").on(table.recipientId),
    createdAtIdx: sqliteCore.index("messages_created_at_idx").on(table.createdAt)
  })
);
const messagesRelations = drizzleOrm.relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messageSender"
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "messageRecipient"
  })
}));
const inventoryCostLayers = sqliteCore.sqliteTable(
  "inventory_cost_layers",
  {
    id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
    productId: sqliteCore.integer("product_id").notNull().references(() => products.id),
    branchId: sqliteCore.integer("branch_id").notNull().references(() => branches.id),
    purchaseItemId: sqliteCore.integer("purchase_item_id").references(() => purchaseItems.id),
    // Links to purchase for traceability
    quantity: sqliteCore.integer("quantity").notNull(),
    // Remaining quantity in this layer
    originalQuantity: sqliteCore.integer("original_quantity").notNull(),
    // Original quantity when layer was created
    unitCost: sqliteCore.real("unit_cost").notNull(),
    // Cost per unit in this layer
    receivedDate: sqliteCore.text("received_date").notNull(),
    // Date layer was created (for FIFO ordering)
    isFullyConsumed: sqliteCore.integer("is_fully_consumed", { mode: "boolean" }).notNull().default(false),
    createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
    updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
  },
  (table) => ({
    // Index for FIFO queries - oldest first by received date
    productBranchDateIdx: sqliteCore.index("icl_product_branch_date_idx").on(
      table.productId,
      table.branchId,
      table.receivedDate
    ),
    // Index for finding active (not fully consumed) layers
    activeLayersIdx: sqliteCore.index("icl_active_layers_idx").on(
      table.productId,
      table.branchId,
      table.isFullyConsumed
    ),
    // Index for purchase traceability
    purchaseItemIdx: sqliteCore.index("icl_purchase_item_idx").on(table.purchaseItemId)
  })
);
const inventoryCostLayersRelations = drizzleOrm.relations(inventoryCostLayers, ({ one }) => ({
  product: one(products, {
    fields: [inventoryCostLayers.productId],
    references: [products.id]
  }),
  branch: one(branches, {
    fields: [inventoryCostLayers.branchId],
    references: [branches.id]
  }),
  purchaseItem: one(purchaseItems, {
    fields: [inventoryCostLayers.purchaseItemId],
    references: [purchaseItems.id]
  })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  accountBalances,
  accountBalancesRelations,
  accountPayables,
  accountPayablesRelations,
  accountReceivables,
  accountReceivablesRelations,
  auditLogs,
  branches,
  businessSettings,
  businessSettingsRelations,
  cashRegisterSessions,
  cashRegisterSessionsRelations,
  cashTransactions,
  cashTransactionsRelations,
  categories,
  chartOfAccounts,
  chartOfAccountsRelations,
  commissions,
  customers,
  expenses,
  expensesRelations,
  inventory,
  inventoryCostLayers,
  inventoryCostLayersRelations,
  journalEntries,
  journalEntriesRelations,
  journalEntryLines,
  journalEntryLinesRelations,
  messages,
  messagesRelations,
  payablePayments,
  payablePaymentsRelations,
  products,
  purchaseItems,
  purchases,
  receivablePayments,
  receivablePaymentsRelations,
  referralPersons,
  returnItems,
  returns,
  saleItems,
  sales,
  salesTabItems,
  salesTabItemsRelations,
  salesTabs,
  salesTabsRelations,
  settings,
  stockAdjustments,
  stockTransfers,
  suppliers,
  todos,
  todosRelations,
  users
}, Symbol.toStringTag, { value: "Module" }));
let db = null;
let sqlite = null;
function getDbPath() {
  const userDataPath = electron.app.getPath("userData");
  const dbDir = node_path.join(userDataPath, "data");
  if (!node_fs.existsSync(dbDir)) {
    node_fs.mkdirSync(dbDir, { recursive: true });
  }
  return node_path.join(dbDir, "firearms-pos.db");
}
function initDatabase() {
  if (db) return db;
  const dbPath = getDbPath();
  console.log("Initializing database at:", dbPath);
  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  db = betterSqlite3.drizzle(sqlite, { schema });
  return db;
}
function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
  }
}
function getRawDatabase() {
  if (!sqlite) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return sqlite;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  closeDatabase,
  getDatabase,
  getDbPath,
  getRawDatabase,
  initDatabase,
  schema
}, Symbol.toStringTag, { value: "Module" }));
async function migrateToBusinessSettings() {
  console.log("Starting migration to business_settings table...");
  const db2 = getDatabase();
  try {
    let tableExists = false;
    try {
      await db2.select({ count: drizzleOrm.sql`count(*)` }).from(businessSettings).limit(1);
      tableExists = true;
    } catch {
      tableExists = false;
    }
    let oldSettingsExist = false;
    try {
      const oldSettingsCount = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(settings).limit(1);
      oldSettingsExist = oldSettingsCount && (oldSettingsCount[0]?.count ?? 0) > 0;
    } catch {
      oldSettingsExist = false;
    }
    console.log(`business_settings table exists: ${tableExists}`);
    console.log(`Old settings table has data: ${oldSettingsExist}`);
    let globalSettingsExists = false;
    if (tableExists) {
      try {
        const globalSettings = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(businessSettings).where(drizzleOrm.isNull(businessSettings.branchId)).limit(1);
        globalSettingsExists = globalSettings && (globalSettings[0]?.count ?? 0) > 0;
        console.log(`Global settings already exist: ${globalSettingsExists}`);
      } catch (err) {
        console.error("Error checking global settings:", err);
        globalSettingsExists = false;
      }
    }
    if (!globalSettingsExists) {
      console.log("Creating default global settings...");
      await db2.insert(businessSettings).values({
        branchId: null,
        businessName: "Firearms Retail POS",
        businessAddress: "",
        businessCity: "",
        businessState: "",
        businessCountry: "Pakistan",
        businessPostalCode: "",
        businessPhone: "",
        businessEmail: "",
        businessWebsite: "",
        taxRate: 0,
        taxName: "GST",
        isTaxInclusive: false,
        secondaryTaxRate: 0,
        currencySymbol: "Rs.",
        currencyCode: "PKR",
        currencyPosition: "prefix",
        decimalPlaces: 2,
        thousandSeparator: ",",
        decimalSeparator: ".",
        invoicePrefix: "INV",
        invoiceNumberFormat: "sequential",
        invoiceStartingNumber: 1,
        showTaxOnReceipt: true,
        showQRCodeOnReceipt: false,
        lowStockThreshold: 10,
        enableStockTracking: true,
        allowNegativeStock: false,
        stockValuationMethod: "FIFO",
        autoReorderEnabled: false,
        autoReorderQuantity: 50,
        defaultPaymentMethod: "Cash",
        allowedPaymentMethods: "Cash,Card,Bank Transfer,COD",
        enableCashDrawer: true,
        openingCashBalance: 0,
        enableDiscounts: true,
        maxDiscountPercentage: 50,
        requireCustomerForSale: false,
        enableCustomerLoyalty: false,
        loyaltyPointsRatio: 1,
        expenseCategories: "Utilities,Rent,Salaries,Supplies,Maintenance,Other",
        expenseApprovalRequired: false,
        expenseApprovalLimit: 1e4,
        enableReturns: true,
        returnWindowDays: 30,
        requireReceiptForReturn: true,
        refundMethod: "Original Payment Method",
        enableEmailNotifications: false,
        lowStockNotifications: true,
        dailySalesReport: false,
        workingDaysStart: "Monday",
        workingDaysEnd: "Saturday",
        openingTime: "09:00",
        closingTime: "18:00",
        autoBackupEnabled: true,
        autoBackupFrequency: "daily",
        backupRetentionDays: 30,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24-hour",
        language: "en",
        timezone: "UTC",
        sessionTimeoutMinutes: 60,
        requirePasswordChange: false,
        passwordChangeIntervalDays: 90,
        enableAuditLogs: true,
        isActive: true,
        isDefault: true
      });
      console.log("Default global settings created successfully");
    }
    if (oldSettingsExist && (oldSettingsExist[0]?.count ?? 0) > 0) {
      console.log("Attempting to migrate old settings data...");
      try {
        const oldSettings = await db2.select().from(settings).all();
        const settingMap = {};
        oldSettings.forEach((setting) => {
          settingMap[setting.key] = setting.value;
        });
        const updateData = {};
        if (settingMap.company_name) updateData.businessName = settingMap.company_name;
        if (settingMap.company_address) updateData.businessAddress = settingMap.company_address;
        if (settingMap.company_phone) updateData.businessPhone = settingMap.company_phone;
        if (settingMap.company_email) updateData.businessEmail = settingMap.company_email;
        if (settingMap.tax_rate) updateData.taxRate = parseFloat(settingMap.tax_rate);
        if (settingMap.tax_name) updateData.taxName = settingMap.tax_name;
        if (settingMap.currency_symbol) updateData.currencySymbol = settingMap.currency_symbol;
        if (settingMap.currency_code) updateData.currencyCode = settingMap.currency_code;
        if (Object.keys(updateData).length > 0) {
          await db2.update(businessSettings).set({
            ...updateData,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.isNull(businessSettings.branchId));
          console.log("Old settings migrated successfully");
        }
      } catch (migrationError) {
        console.warn("Could not migrate old settings (may be in different format):", migrationError);
      }
    }
    console.log("Migration completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
async function addPhoneToUsers() {
  console.log("Starting migration to add phone field to users table...");
  const db2 = getDatabase();
  try {
    let columnExists = false;
    try {
      const result = await db2.all(drizzleOrm.sql`PRAGMA table_info(users)`);
      columnExists = result.some((col) => col.name === "phone");
    } catch (error) {
      console.error("Error checking for phone column:", error);
    }
    if (columnExists) {
      console.log("Phone column already exists, skipping migration");
      return { success: true, message: "Phone column already exists" };
    }
    console.log("Adding phone column to users table...");
    await db2.run(drizzleOrm.sql`ALTER TABLE users ADD COLUMN phone TEXT`);
    console.log("Phone column added successfully");
    return { success: true, message: "Phone column added successfully" };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, message: `Migration failed: ${error}` };
  }
}
async function runMigrations() {
  const db2 = getDatabase();
  const possiblePaths = [
    node_path.join(__dirname, "../../drizzle"),
    // Development: out/main -> drizzle
    node_path.join(__dirname, "../../../drizzle"),
    // Alternative dev path
    node_path.join(electron.app.getAppPath(), "drizzle"),
    // Production: app.asar/drizzle
    node_path.join(process.cwd(), "drizzle")
    // CWD fallback
  ];
  let migrationsPath = null;
  for (const path2 of possiblePaths) {
    if (node_fs.existsSync(path2) && node_fs.existsSync(node_path.join(path2, "meta/_journal.json"))) {
      migrationsPath = path2;
      console.log("Found migrations at:", path2);
      break;
    }
  }
  if (!migrationsPath) {
    console.log("No migrations folder found, creating tables directly...");
  } else {
    try {
      migrator.migrate(db2, { migrationsFolder: migrationsPath });
      console.log("Migrations completed successfully");
    } catch (error) {
      console.error("Migration error:", error);
      throw error;
    }
  }
  try {
    await migrateToBusinessSettings();
  } catch (error) {
    console.error("Business settings migration error:", error);
  }
  try {
    await ensureReferralPersonsTable();
  } catch (error) {
    console.error("Referral persons table migration error:", error);
  }
  try {
    await ensureMessagesTable();
  } catch (error) {
    console.error("Messages table migration error:", error);
  }
  try {
    await ensurePurchasesPaymentMethod();
  } catch (error) {
    console.error("Purchases payment_method migration error:", error);
  }
  try {
    await ensureExpensesPaymentStatus();
  } catch (error) {
    console.error("Expenses payment_status migration error:", error);
  }
  try {
    await ensureApplicationInfoSetupCompleted();
  } catch (error) {
    console.error("Application info setup_completed migration error:", error);
  }
  try {
    await addPhoneToUsers();
  } catch (error) {
    console.error("Users phone column migration error:", error);
  }
  try {
    await ensureCashRegisterTables();
  } catch (error) {
    console.error("Cash register tables migration error:", error);
  }
  try {
    await ensureFinancialSystemTables();
  } catch (error) {
    console.error("Financial system tables migration error:", error);
  }
  try {
    await ensureInventoryCostLayersTable();
  } catch (error) {
    console.error("Inventory cost layers table migration error:", error);
  }
}
async function ensureReferralPersonsTable() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='referral_persons'`
  ).get();
  if (tableCheck) {
    console.log("referral_persons table exists: true");
    return;
  }
  console.log("Starting migration for referral_persons table...");
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS "referral_persons" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "branch_id" integer NOT NULL,
      "name" text NOT NULL,
      "contact" text,
      "address" text,
      "notes" text,
      "is_active" integer DEFAULT true NOT NULL,
      "total_commission_earned" real DEFAULT 0 NOT NULL,
      "total_commission_paid" real DEFAULT 0 NOT NULL,
      "commission_rate" real,
      "created_at" text NOT NULL,
      "updated_at" text NOT NULL,
      FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
    );

    CREATE INDEX IF NOT EXISTS "referral_persons_branch_idx" ON "referral_persons" ("branch_id");
    CREATE INDEX IF NOT EXISTS "referral_persons_name_idx" ON "referral_persons" ("name");
  `;
  db2.exec(migrationSQL);
  console.log("referral_persons table migration completed successfully!");
}
async function ensureMessagesTable() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='messages'`
  ).get();
  if (tableCheck) {
    console.log("messages table exists: true");
    return;
  }
  console.log("Starting migration for messages table...");
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "content" text NOT NULL,
      "sender_id" integer NOT NULL,
      "recipient_id" integer,
      "is_read" integer DEFAULT 0 NOT NULL,
      "created_at" text NOT NULL,
      FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
    );

    CREATE INDEX IF NOT EXISTS "messages_sender_idx" ON "messages" ("sender_id");
    CREATE INDEX IF NOT EXISTS "messages_recipient_idx" ON "messages" ("recipient_id");
    CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" ("created_at");
  `;
  db2.exec(migrationSQL);
  console.log("messages table migration completed successfully!");
}
async function ensurePurchasesPaymentMethod() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableInfo = db2.prepare(`PRAGMA table_info(purchases)`).all();
  const hasPaymentMethod = tableInfo.some((col) => col.name === "payment_method");
  if (hasPaymentMethod) {
    console.log("purchases.payment_method column exists: true");
    return;
  }
  console.log("Starting migration for purchases.payment_method column...");
  const migrationSQL = `
    ALTER TABLE purchases ADD COLUMN payment_method TEXT DEFAULT 'cash' NOT NULL;
  `;
  db2.exec(migrationSQL);
  console.log("purchases.payment_method column migration completed successfully!");
}
async function ensureExpensesPaymentStatus() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`
  ).get();
  if (!tableCheck) {
    console.log("expenses table does not exist, skipping payment_status migration");
    return;
  }
  const tableInfo = db2.prepare(`PRAGMA table_info(expenses)`).all();
  const existingColumns = new Set(tableInfo.map((col) => col.name));
  const columnsToAdd = [
    { name: "payment_status", sql: `ALTER TABLE expenses ADD COLUMN payment_status TEXT DEFAULT 'paid' NOT NULL` },
    { name: "supplier_id", sql: `ALTER TABLE expenses ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)` },
    { name: "payable_id", sql: `ALTER TABLE expenses ADD COLUMN payable_id INTEGER REFERENCES account_payables(id)` },
    { name: "due_date", sql: `ALTER TABLE expenses ADD COLUMN due_date TEXT` },
    { name: "payment_terms", sql: `ALTER TABLE expenses ADD COLUMN payment_terms TEXT` }
  ];
  for (const column of columnsToAdd) {
    if (!existingColumns.has(column.name)) {
      console.log(`Adding expenses.${column.name} column...`);
      try {
        db2.exec(column.sql);
        console.log(`expenses.${column.name} column added successfully`);
      } catch (error) {
        console.error(`Error adding expenses.${column.name} column:`, error);
      }
    } else {
      console.log(`expenses.${column.name} column exists: true`);
    }
  }
  try {
    db2.exec(`CREATE INDEX IF NOT EXISTS "expenses_payment_status_idx" ON "expenses" ("payment_status")`);
    db2.exec(`CREATE INDEX IF NOT EXISTS "expenses_supplier_idx" ON "expenses" ("supplier_id")`);
    db2.exec(`CREATE INDEX IF NOT EXISTS "expenses_payable_idx" ON "expenses" ("payable_id")`);
    console.log("expenses indexes created/verified successfully");
  } catch (error) {
    console.error("Error creating expenses indexes:", error);
  }
  console.log("expenses payment_status migration completed successfully!");
}
async function ensureApplicationInfoSetupCompleted() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='application_info'`
  ).get();
  if (!tableCheck) {
    console.log("application_info table does not exist, skipping setup_completed migration");
    return;
  }
  const tableInfo = db2.prepare(`PRAGMA table_info(application_info)`).all();
  const hasSetupCompleted = tableInfo.some((col) => col.name === "setup_completed");
  if (hasSetupCompleted) {
    console.log("application_info.setup_completed column exists: true");
    return;
  }
  console.log("Starting migration for application_info.setup_completed column...");
  const migrationSQL = `
    ALTER TABLE application_info ADD COLUMN setup_completed INTEGER DEFAULT 0;
  `;
  db2.exec(migrationSQL);
  console.log("application_info.setup_completed column migration completed successfully!");
}
async function seedInitialData() {
  const db2 = getDatabase();
  const { categories: categoriesTable } = await Promise.resolve().then(() => schema);
  const existingCategories = await db2.query.categories.findMany();
  if (existingCategories.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }
  console.log("Seeding initial data...");
  const { settings: settings2, categories: categories2 } = await Promise.resolve().then(() => schema);
  const firearmsCategory = db2.insert(categories2).values({ name: "Firearms", description: "All firearms" }).returning().get();
  await db2.insert(categories2).values([
    { name: "Ammunition", description: "All ammunition types" },
    { name: "Accessories", description: "Firearm accessories" },
    { name: "Safety Equipment", description: "Safety and storage equipment" },
    { name: "Cleaning Supplies", description: "Cleaning and maintenance supplies" }
  ]);
  await db2.insert(categories2).values([
    { name: "Handguns", parentId: firearmsCategory.id, description: "All handguns" },
    { name: "Rifles", parentId: firearmsCategory.id, description: "All rifles" },
    { name: "Shotguns", parentId: firearmsCategory.id, description: "All shotguns" }
  ]);
  await db2.insert(settings2).values([
    {
      key: "company_name",
      value: JSON.stringify("Firearms POS"),
      category: "company",
      description: "Company name displayed on receipts"
    },
    {
      key: "company_address",
      value: JSON.stringify("123 Main Street, City, State 12345"),
      category: "company",
      description: "Company address"
    },
    {
      key: "company_phone",
      value: JSON.stringify("555-0100"),
      category: "company",
      description: "Company phone number"
    },
    {
      key: "default_tax_rate",
      value: JSON.stringify(8.5),
      category: "tax",
      description: "Default tax rate percentage"
    },
    {
      key: "currency",
      value: JSON.stringify("USD"),
      category: "general",
      description: "Currency code"
    },
    {
      key: "currency_symbol",
      value: JSON.stringify("$"),
      category: "general",
      description: "Currency symbol"
    },
    {
      key: "date_format",
      value: JSON.stringify("MM/dd/yyyy"),
      category: "general",
      description: "Date format"
    },
    {
      key: "low_stock_threshold",
      value: JSON.stringify(10),
      category: "inventory",
      description: "Default low stock alert threshold"
    },
    {
      key: "require_customer_for_firearms",
      value: JSON.stringify(true),
      category: "sales",
      description: "Require customer selection for firearm sales"
    },
    {
      key: "require_license_validation",
      value: JSON.stringify(true),
      category: "sales",
      description: "Require valid firearm license for firearm sales"
    }
  ]);
  console.log("Initial data seeded successfully");
}
async function ensureCashRegisterTables() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const sessionsTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='cash_register_sessions'`
  ).get();
  if (!sessionsTableCheck) {
    console.log("Creating cash_register_sessions table...");
    const sessionsMigration = `
      CREATE TABLE IF NOT EXISTS "cash_register_sessions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "branch_id" integer NOT NULL,
        "session_date" text NOT NULL,
        "opening_balance" real DEFAULT 0 NOT NULL,
        "closing_balance" real,
        "expected_balance" real,
        "actual_balance" real,
        "variance" real,
        "status" text DEFAULT 'open' NOT NULL,
        "opened_by" integer NOT NULL,
        "closed_by" integer,
        "reconciled_by" integer,
        "opened_at" text NOT NULL,
        "closed_at" text,
        "reconciled_at" text,
        "notes" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reconciled_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "cash_session_branch_date_unique" ON "cash_register_sessions" ("branch_id","session_date");
      CREATE INDEX IF NOT EXISTS "cash_session_branch_idx" ON "cash_register_sessions" ("branch_id");
      CREATE INDEX IF NOT EXISTS "cash_session_date_idx" ON "cash_register_sessions" ("session_date");
      CREATE INDEX IF NOT EXISTS "cash_session_status_idx" ON "cash_register_sessions" ("status");
    `;
    db2.exec(sessionsMigration);
    console.log("cash_register_sessions table created successfully!");
  } else {
    console.log("cash_register_sessions table exists: true");
  }
  const transactionsTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='cash_transactions'`
  ).get();
  if (!transactionsTableCheck) {
    console.log("Creating cash_transactions table...");
    const transactionsMigration = `
      CREATE TABLE IF NOT EXISTS "cash_transactions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "session_id" integer NOT NULL,
        "branch_id" integer NOT NULL,
        "transaction_type" text NOT NULL,
        "amount" real NOT NULL,
        "reference_type" text,
        "reference_id" integer,
        "description" text,
        "recorded_by" integer NOT NULL,
        "transaction_date" text NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("session_id") REFERENCES "cash_register_sessions"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "cash_tx_session_idx" ON "cash_transactions" ("session_id");
      CREATE INDEX IF NOT EXISTS "cash_tx_branch_idx" ON "cash_transactions" ("branch_id");
      CREATE INDEX IF NOT EXISTS "cash_tx_type_idx" ON "cash_transactions" ("transaction_type");
      CREATE INDEX IF NOT EXISTS "cash_tx_date_idx" ON "cash_transactions" ("transaction_date");
    `;
    db2.exec(transactionsMigration);
    console.log("cash_transactions table created successfully!");
  } else {
    console.log("cash_transactions table exists: true");
  }
}
async function ensureFinancialSystemTables() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const payablesTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='account_payables'`
  ).get();
  if (!payablesTableCheck) {
    console.log("Creating account_payables table...");
    const payablesMigration = `
      CREATE TABLE IF NOT EXISTS "account_payables" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "supplier_id" integer NOT NULL,
        "purchase_id" integer,
        "branch_id" integer NOT NULL,
        "invoice_number" text NOT NULL,
        "total_amount" real NOT NULL,
        "paid_amount" real DEFAULT 0 NOT NULL,
        "remaining_amount" real NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "due_date" text,
        "payment_terms" text,
        "notes" text,
        "created_by" integer,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "payables_supplier_idx" ON "account_payables" ("supplier_id");
      CREATE INDEX IF NOT EXISTS "payables_status_idx" ON "account_payables" ("status");
      CREATE INDEX IF NOT EXISTS "payables_branch_idx" ON "account_payables" ("branch_id");
      CREATE INDEX IF NOT EXISTS "payables_due_date_idx" ON "account_payables" ("due_date");
    `;
    db2.exec(payablesMigration);
    console.log("account_payables table created successfully!");
  } else {
    console.log("account_payables table exists: true");
  }
  const payablePaymentsTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='payable_payments'`
  ).get();
  if (!payablePaymentsTableCheck) {
    console.log("Creating payable_payments table...");
    const payablePaymentsMigration = `
      CREATE TABLE IF NOT EXISTS "payable_payments" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "payable_id" integer NOT NULL,
        "amount" real NOT NULL,
        "payment_method" text DEFAULT 'bank_transfer' NOT NULL,
        "reference_number" text,
        "notes" text,
        "paid_by" integer,
        "payment_date" text NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("payable_id") REFERENCES "account_payables"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("paid_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "payable_payments_payable_idx" ON "payable_payments" ("payable_id");
      CREATE INDEX IF NOT EXISTS "payable_payments_date_idx" ON "payable_payments" ("payment_date");
    `;
    db2.exec(payablePaymentsMigration);
    console.log("payable_payments table created successfully!");
  } else {
    console.log("payable_payments table exists: true");
  }
  const coaTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='chart_of_accounts'`
  ).get();
  if (!coaTableCheck) {
    console.log("Creating chart_of_accounts table...");
    const coaMigration = `
      CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "account_code" text NOT NULL,
        "account_name" text NOT NULL,
        "account_type" text NOT NULL,
        "account_sub_type" text,
        "parent_account_id" integer,
        "description" text,
        "is_active" integer DEFAULT 1 NOT NULL,
        "is_system_account" integer DEFAULT 0 NOT NULL,
        "normal_balance" text NOT NULL,
        "current_balance" real DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "chart_of_accounts_account_code_unique" ON "chart_of_accounts" ("account_code");
      CREATE INDEX IF NOT EXISTS "coa_type_idx" ON "chart_of_accounts" ("account_type");
      CREATE INDEX IF NOT EXISTS "coa_parent_idx" ON "chart_of_accounts" ("parent_account_id");
      CREATE INDEX IF NOT EXISTS "coa_active_idx" ON "chart_of_accounts" ("is_active");

      -- Insert default chart of accounts
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1000', 'Cash and Cash Equivalents', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1010', 'Cash in Hand', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1020', 'Cash in Bank', 'asset', 'bank', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1100', 'Accounts Receivable', 'asset', 'accounts_receivable', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('1200', 'Inventory', 'asset', 'inventory', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('2000', 'Accounts Payable', 'liability', 'accounts_payable', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('2100', 'Sales Tax Payable', 'liability', 'other_liability', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('3000', 'Owner Capital', 'equity', 'owner_capital', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('3100', 'Retained Earnings', 'equity', 'retained_earnings', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('4000', 'Sales Revenue', 'revenue', 'sales_revenue', 'credit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5000', 'Cost of Goods Sold', 'expense', 'cost_of_goods_sold', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5100', 'Salaries and Wages', 'expense', 'payroll_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5200', 'Rent Expense', 'expense', 'rent_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5300', 'Utilities Expense', 'expense', 'utilities_expense', 'debit', 1, datetime('now'), datetime('now'));
      INSERT OR IGNORE INTO "chart_of_accounts" ("account_code", "account_name", "account_type", "account_sub_type", "normal_balance", "is_system_account", "created_at", "updated_at") VALUES ('5900', 'Other Expenses', 'expense', 'other_expense', 'debit', 0, datetime('now'), datetime('now'));
    `;
    db2.exec(coaMigration);
    console.log("chart_of_accounts table created successfully!");
  } else {
    console.log("chart_of_accounts table exists: true");
  }
  const jeTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entries'`
  ).get();
  if (!jeTableCheck) {
    console.log("Creating journal_entries table...");
    const jeMigration = `
      CREATE TABLE IF NOT EXISTS "journal_entries" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "entry_number" text NOT NULL,
        "entry_date" text NOT NULL,
        "description" text NOT NULL,
        "reference_type" text,
        "reference_id" integer,
        "branch_id" integer,
        "status" text DEFAULT 'draft' NOT NULL,
        "is_auto_generated" integer DEFAULT 0 NOT NULL,
        "created_by" integer NOT NULL,
        "posted_by" integer,
        "posted_at" text,
        "reversed_by" integer,
        "reversed_at" text,
        "reversal_entry_id" integer,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reversed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "journal_entries_entry_number_unique" ON "journal_entries" ("entry_number");
      CREATE INDEX IF NOT EXISTS "je_date_idx" ON "journal_entries" ("entry_date");
      CREATE INDEX IF NOT EXISTS "je_status_idx" ON "journal_entries" ("status");
      CREATE INDEX IF NOT EXISTS "je_ref_idx" ON "journal_entries" ("reference_type","reference_id");
    `;
    db2.exec(jeMigration);
    console.log("journal_entries table created successfully!");
  } else {
    console.log("journal_entries table exists: true");
  }
  const jelTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entry_lines'`
  ).get();
  if (!jelTableCheck) {
    console.log("Creating journal_entry_lines table...");
    const jelMigration = `
      CREATE TABLE IF NOT EXISTS "journal_entry_lines" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "journal_entry_id" integer NOT NULL,
        "account_id" integer NOT NULL,
        "debit_amount" real DEFAULT 0 NOT NULL,
        "credit_amount" real DEFAULT 0 NOT NULL,
        "description" text,
        "created_at" text NOT NULL,
        FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "jel_entry_idx" ON "journal_entry_lines" ("journal_entry_id");
      CREATE INDEX IF NOT EXISTS "jel_account_idx" ON "journal_entry_lines" ("account_id");
    `;
    db2.exec(jelMigration);
    console.log("journal_entry_lines table created successfully!");
  } else {
    console.log("journal_entry_lines table exists: true");
  }
  const abTableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='account_balances'`
  ).get();
  if (!abTableCheck) {
    console.log("Creating account_balances table...");
    const abMigration = `
      CREATE TABLE IF NOT EXISTS "account_balances" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "account_id" integer NOT NULL,
        "branch_id" integer,
        "period_type" text NOT NULL,
        "period_date" text NOT NULL,
        "opening_balance" real DEFAULT 0 NOT NULL,
        "debit_total" real DEFAULT 0 NOT NULL,
        "credit_total" real DEFAULT 0 NOT NULL,
        "closing_balance" real DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "ab_account_period_idx" ON "account_balances" ("account_id","period_type","period_date");
      CREATE INDEX IF NOT EXISTS "ab_branch_idx" ON "account_balances" ("branch_id");
    `;
    db2.exec(abMigration);
    console.log("account_balances table created successfully!");
  } else {
    console.log("account_balances table exists: true");
  }
}
async function ensureInventoryCostLayersTable() {
  const { getRawDatabase: getRawDatabase2 } = await Promise.resolve().then(() => index);
  const db2 = getRawDatabase2();
  const tableCheck = db2.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_cost_layers'`
  ).get();
  if (!tableCheck) {
    console.log("Creating inventory_cost_layers table...");
    const costLayersMigration = `
      CREATE TABLE IF NOT EXISTS "inventory_cost_layers" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "product_id" integer NOT NULL,
        "branch_id" integer NOT NULL,
        "purchase_item_id" integer,
        "quantity" integer NOT NULL,
        "original_quantity" integer NOT NULL,
        "unit_cost" real NOT NULL,
        "received_date" text NOT NULL,
        "is_fully_consumed" integer DEFAULT 0 NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("purchase_item_id") REFERENCES "purchase_items"("id") ON UPDATE no action ON DELETE no action
      );

      CREATE INDEX IF NOT EXISTS "icl_product_branch_date_idx" ON "inventory_cost_layers" ("product_id", "branch_id", "received_date");
      CREATE INDEX IF NOT EXISTS "icl_active_layers_idx" ON "inventory_cost_layers" ("product_id", "branch_id", "is_fully_consumed");
      CREATE INDEX IF NOT EXISTS "icl_purchase_item_idx" ON "inventory_cost_layers" ("purchase_item_id");
    `;
    db2.exec(costLayersMigration);
    console.log("inventory_cost_layers table created successfully!");
  } else {
    console.log("inventory_cost_layers table exists: true");
  }
}
async function createAuditLog$1(params) {
  const db2 = getDatabase();
  try {
    await db2.insert(auditLogs).values({
      userId: params.userId ?? null,
      branchId: params.branchId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      description: params.description ?? null
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
function sanitizeForAudit(obj) {
  const sanitized = { ...obj };
  const sensitiveFields = ["password", "token", "secret", "apiKey"];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }
  return sanitized;
}
let currentSession = null;
function registerAuthHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("auth:login", async (_, username, password) => {
    try {
      const user = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.username, username)
      });
      if (!user) {
        return { success: false, message: "Invalid username or password" };
      }
      if (!user.isActive) {
        return { success: false, message: "Account is deactivated" };
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return { success: false, message: "Invalid username or password" };
      }
      let branchName = null;
      if (user.branchId) {
        const branch = await db2.query.branches.findFirst({
          where: drizzleOrm.eq(branches.id, user.branchId)
        });
        branchName = branch?.name ?? null;
      }
      await db2.update(users).set({ lastLogin: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(users.id, user.id));
      currentSession = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions ?? [],
        branchId: user.branchId,
        branchName
      };
      await createAuditLog$1({
        userId: user.id,
        branchId: user.branchId,
        action: "login",
        entityType: "auth",
        entityId: user.id,
        description: `User ${user.username} logged in`
      });
      return {
        success: true,
        user: currentSession
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login" };
    }
  });
  electron.ipcMain.handle("auth:logout", async () => {
    if (currentSession) {
      await createAuditLog$1({
        userId: currentSession.userId,
        branchId: currentSession.branchId,
        action: "logout",
        entityType: "auth",
        entityId: currentSession.userId,
        description: `User ${currentSession.username} logged out`
      });
    }
    currentSession = null;
    return { success: true };
  });
  electron.ipcMain.handle("auth:get-current-user", async () => {
    return currentSession;
  });
  electron.ipcMain.handle("auth:change-password", async (_, userId, currentPassword, newPassword) => {
    try {
      const user = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, userId)
      });
      if (!user) {
        return { success: false, message: "User not found" };
      }
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return { success: false, message: "Current password is incorrect" };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db2.update(users).set({
        password: hashedPassword,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(users.id, userId));
      await createAuditLog$1({
        userId: currentSession?.userId,
        branchId: currentSession?.branchId,
        action: "update",
        entityType: "user",
        entityId: userId,
        description: "Password changed"
      });
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "An error occurred while changing password" };
    }
  });
  electron.ipcMain.handle("auth:check-permission", async (_, permission) => {
    if (!currentSession) return false;
    if (currentSession.role === "admin") return true;
    if (currentSession.permissions.includes("*")) return true;
    return currentSession.permissions.includes(permission);
  });
}
function getCurrentSession() {
  return currentSession;
}
function registerProductHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "products:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", search, categoryId, isActive } = params;
        const conditions = [];
        if (search) {
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(products.name, `%${search}%`),
              drizzleOrm.like(products.code, `%${search}%`),
              drizzleOrm.like(products.barcode, `%${search}%`)
            )
          );
        }
        if (categoryId) {
          conditions.push(drizzleOrm.eq(products.categoryId, categoryId));
        }
        if (isActive !== void 0) {
          conditions.push(drizzleOrm.eq(products.isActive, isActive));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(products).where(whereClause);
        const total = countResult[0].count;
        const orderColumn = products[sortBy] ?? products.createdAt;
        const data = await db2.query.products.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(orderColumn) : drizzleOrm.asc(orderColumn),
          with: {
            // category: true, // Enable if you add relations
          }
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get products error:", error);
        return { success: false, message: "Failed to fetch products" };
      }
    }
  );
  electron.ipcMain.handle("products:get-by-id", async (_, id) => {
    try {
      const product = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.id, id)
      });
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      return { success: true, data: product };
    } catch (error) {
      console.error("Get product error:", error);
      return { success: false, message: "Failed to fetch product" };
    }
  });
  electron.ipcMain.handle("products:get-by-barcode", async (_, barcode) => {
    try {
      const product = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.barcode, barcode)
      });
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      return { success: true, data: product };
    } catch (error) {
      console.error("Get product by barcode error:", error);
      return { success: false, message: "Failed to fetch product" };
    }
  });
  electron.ipcMain.handle("products:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.code, data.code)
      });
      if (existing) {
        return { success: false, message: "Product code already exists" };
      }
      const result = await db2.insert(products).values(data).returning();
      const newProduct = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "product",
        entityId: newProduct.id,
        newValues: sanitizeForAudit(data),
        description: `Created product: ${data.name}`
      });
      return { success: true, data: newProduct };
    } catch (error) {
      console.error("Create product error:", error);
      return { success: false, message: "Failed to create product" };
    }
  });
  electron.ipcMain.handle("products:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.id, id)
      });
      if (!existing) {
        return { success: false, message: "Product not found" };
      }
      if (data.code && data.code !== existing.code) {
        const duplicate = await db2.query.products.findFirst({
          where: drizzleOrm.eq(products.code, data.code)
        });
        if (duplicate) {
          return { success: false, message: "Product code already exists" };
        }
      }
      const result = await db2.update(products).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(products.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "product",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated product: ${existing.name}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update product error:", error);
      return { success: false, message: "Failed to update product" };
    }
  });
  electron.ipcMain.handle("products:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.id, id)
      });
      if (!existing) {
        return { success: false, message: "Product not found" };
      }
      await db2.update(products).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(products.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "product",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated product: ${existing.name}`
      });
      return { success: true, message: "Product deactivated successfully" };
    } catch (error) {
      console.error("Delete product error:", error);
      return { success: false, message: "Failed to delete product" };
    }
  });
  electron.ipcMain.handle("products:search", async (_, query) => {
    try {
      const results = await db2.query.products.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(products.isActive, true),
          drizzleOrm.or(
            drizzleOrm.like(products.name, `%${query}%`),
            drizzleOrm.like(products.code, `%${query}%`),
            drizzleOrm.like(products.barcode, `%${query}%`)
          )
        ),
        limit: 20
      });
      return { success: true, data: results };
    } catch (error) {
      console.error("Search products error:", error);
      return { success: false, message: "Failed to search products" };
    }
  });
}
function registerCategoryHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("categories:get-all", async () => {
    try {
      const data = await db2.query.categories.findMany({
        orderBy: drizzleOrm.desc(categories.name)
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get categories error:", error);
      return { success: false, message: "Failed to fetch categories" };
    }
  });
  electron.ipcMain.handle("categories:get-tree", async () => {
    try {
      const allCategories = await db2.query.categories.findMany({
        where: drizzleOrm.eq(categories.isActive, true)
      });
      const buildTree = (parentId) => {
        return allCategories.filter((cat) => cat.parentId === parentId).map((cat) => ({
          ...cat,
          children: buildTree(cat.id)
        }));
      };
      const tree = buildTree(null);
      return { success: true, data: tree };
    } catch (error) {
      console.error("Get category tree error:", error);
      return { success: false, message: "Failed to fetch category tree" };
    }
  });
  electron.ipcMain.handle("categories:get-by-id", async (_, id) => {
    try {
      const category = await db2.query.categories.findFirst({
        where: drizzleOrm.eq(categories.id, id)
      });
      if (!category) {
        return { success: false, message: "Category not found" };
      }
      return { success: true, data: category };
    } catch (error) {
      console.error("Get category error:", error);
      return { success: false, message: "Failed to fetch category" };
    }
  });
  electron.ipcMain.handle("categories:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const result = await db2.insert(categories).values(data).returning();
      const newCategory = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "category",
        entityId: newCategory.id,
        newValues: sanitizeForAudit(data),
        description: `Created category: ${data.name}`
      });
      return { success: true, data: newCategory };
    } catch (error) {
      console.error("Create category error:", error);
      return { success: false, message: "Failed to create category" };
    }
  });
  electron.ipcMain.handle("categories:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.categories.findFirst({
        where: drizzleOrm.eq(categories.id, id)
      });
      if (!existing) {
        return { success: false, message: "Category not found" };
      }
      if (data.parentId === id) {
        return { success: false, message: "Category cannot be its own parent" };
      }
      const result = await db2.update(categories).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(categories.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "category",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated category: ${existing.name}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update category error:", error);
      return { success: false, message: "Failed to update category" };
    }
  });
  electron.ipcMain.handle("categories:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.categories.findFirst({
        where: drizzleOrm.eq(categories.id, id)
      });
      if (!existing) {
        return { success: false, message: "Category not found" };
      }
      const children = await db2.query.categories.findFirst({
        where: drizzleOrm.eq(categories.parentId, id)
      });
      if (children) {
        return { success: false, message: "Cannot delete category with subcategories" };
      }
      await db2.update(categories).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(categories.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "category",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated category: ${existing.name}`
      });
      return { success: true, message: "Category deactivated successfully" };
    } catch (error) {
      console.error("Delete category error:", error);
      return { success: false, message: "Failed to delete category" };
    }
  });
}
function generateInvoiceNumber() {
  const date = dateFns.format(/* @__PURE__ */ new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${date}-${random}`;
}
function generatePurchaseOrderNumber() {
  const date = dateFns.format(/* @__PURE__ */ new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PO-${date}-${random}`;
}
function generateReturnNumber() {
  const date = dateFns.format(/* @__PURE__ */ new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RET-${date}-${random}`;
}
function generateTransferNumber() {
  const date = dateFns.format(/* @__PURE__ */ new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRF-${date}-${random}`;
}
function isLicenseExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date(expiryDate) < /* @__PURE__ */ new Date();
}
function isLicenseExpiringSoon(expiryDate, daysThreshold = 30) {
  if (!expiryDate) return true;
  const expiry = new Date(expiryDate);
  const threshold = /* @__PURE__ */ new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return expiry <= threshold;
}
async function withTransaction(fn) {
  const rawDb = getRawDatabase();
  const db2 = getDatabase();
  rawDb.exec("BEGIN IMMEDIATE");
  try {
    const result = await fn({ rawDb, db: db2 });
    rawDb.exec("COMMIT");
    return result;
  } catch (error) {
    rawDb.exec("ROLLBACK");
    throw error;
  }
}
function registerInventoryHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("inventory:get-by-branch", async (_, branchId) => {
    try {
      let query = db2.select({
        inventory,
        product: products
      }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id));
      if (branchId) {
        query = query.where(drizzleOrm.eq(inventory.branchId, branchId));
      }
      const data = await query;
      return { success: true, data };
    } catch (error) {
      console.error("Get inventory error:", error);
      return { success: false, message: "Failed to fetch inventory" };
    }
  });
  electron.ipcMain.handle("inventory:get-all", async () => {
    try {
      const data = await db2.select({
        inventory,
        product: products,
        branch: branches
      }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id)).innerJoin(branches, drizzleOrm.eq(inventory.branchId, branches.id));
      return { success: true, data };
    } catch (error) {
      console.error("Get all inventory error:", error);
      return { success: false, message: "Failed to fetch inventory" };
    }
  });
  electron.ipcMain.handle("inventory:get-low-stock", async (_, branchId) => {
    try {
      const conditions = [drizzleOrm.lte(inventory.quantity, inventory.minQuantity)];
      if (branchId) {
        conditions.push(drizzleOrm.eq(inventory.branchId, branchId));
      }
      const data = await db2.select({
        inventory,
        product: products,
        branch: branches
      }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id)).innerJoin(branches, drizzleOrm.eq(inventory.branchId, branches.id)).where(drizzleOrm.and(...conditions));
      return { success: true, data };
    } catch (error) {
      console.error("Get low stock error:", error);
      return { success: false, message: "Failed to fetch low stock items" };
    }
  });
  electron.ipcMain.handle("inventory:get-product-stock", async (_, productId, branchId) => {
    try {
      const stock = await db2.query.inventory.findFirst({
        where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, productId), drizzleOrm.eq(inventory.branchId, branchId))
      });
      return { success: true, data: stock };
    } catch (error) {
      console.error("Get product stock error:", error);
      return { success: false, message: "Failed to fetch product stock" };
    }
  });
  electron.ipcMain.handle(
    "inventory:adjust",
    async (_, data) => {
      try {
        const session = getCurrentSession();
        let currentInventory = await db2.query.inventory.findFirst({
          where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, data.productId), drizzleOrm.eq(inventory.branchId, data.branchId))
        });
        const quantityBefore = currentInventory?.quantity ?? 0;
        const quantityAfter = data.adjustmentType === "add" ? quantityBefore + data.quantityChange : quantityBefore - data.quantityChange;
        if (quantityAfter < 0) {
          return { success: false, message: "Insufficient stock for this adjustment" };
        }
        if (currentInventory) {
          await db2.update(inventory).set({
            quantity: quantityAfter,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(inventory.id, currentInventory.id));
        } else {
          await db2.insert(inventory).values({
            productId: data.productId,
            branchId: data.branchId,
            quantity: quantityAfter
          });
        }
        await db2.insert(stockAdjustments).values({
          productId: data.productId,
          branchId: data.branchId,
          userId: session?.userId ?? 0,
          adjustmentType: data.adjustmentType,
          quantityBefore,
          quantityChange: data.quantityChange,
          quantityAfter,
          serialNumber: data.serialNumber,
          reason: data.reason,
          reference: data.reference
        });
        await createAuditLog$1({
          userId: session?.userId,
          branchId: data.branchId,
          action: "adjustment",
          entityType: "inventory",
          entityId: data.productId,
          newValues: {
            adjustmentType: data.adjustmentType,
            quantityBefore,
            quantityChange: data.quantityChange,
            quantityAfter,
            reason: data.reason
          },
          description: `Stock adjusted: ${data.adjustmentType} ${data.quantityChange} units`
        });
        return { success: true, message: "Stock adjusted successfully" };
      } catch (error) {
        console.error("Stock adjustment error:", error);
        return { success: false, message: "Failed to adjust stock" };
      }
    }
  );
  electron.ipcMain.handle(
    "inventory:transfer",
    async (_, data) => {
      try {
        const session = getCurrentSession();
        const sourceInventory = await db2.query.inventory.findFirst({
          where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, data.productId), drizzleOrm.eq(inventory.branchId, data.fromBranchId))
        });
        if (!sourceInventory || sourceInventory.quantity < data.quantity) {
          return { success: false, message: "Insufficient stock in source branch" };
        }
        const transferNumber = generateTransferNumber();
        const [transfer] = await db2.insert(stockTransfers).values({
          transferNumber,
          productId: data.productId,
          fromBranchId: data.fromBranchId,
          toBranchId: data.toBranchId,
          userId: session?.userId ?? 0,
          quantity: data.quantity,
          serialNumbers: data.serialNumbers ?? [],
          notes: data.notes,
          status: "pending"
        }).returning();
        await createAuditLog$1({
          userId: session?.userId,
          branchId: data.fromBranchId,
          action: "transfer",
          entityType: "inventory",
          entityId: transfer.id,
          newValues: {
            transferNumber,
            productId: data.productId,
            fromBranchId: data.fromBranchId,
            toBranchId: data.toBranchId,
            quantity: data.quantity
          },
          description: `Stock transfer initiated: ${transferNumber}`
        });
        return { success: true, data: transfer };
      } catch (error) {
        console.error("Stock transfer error:", error);
        return { success: false, message: "Failed to create transfer" };
      }
    }
  );
  electron.ipcMain.handle("inventory:complete-transfer", async (_, transferId) => {
    try {
      const session = getCurrentSession();
      const transfer = await db2.query.stockTransfers.findFirst({
        where: drizzleOrm.eq(stockTransfers.id, transferId)
      });
      if (!transfer) {
        return { success: false, message: "Transfer not found" };
      }
      if (transfer.status !== "pending" && transfer.status !== "in_transit") {
        return { success: false, message: "Transfer cannot be completed" };
      }
      await withTransaction(async ({ db: txDb }) => {
        await txDb.update(inventory).set({
          quantity: drizzleOrm.sql`${inventory.quantity} - ${transfer.quantity}`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, transfer.productId), drizzleOrm.eq(inventory.branchId, transfer.fromBranchId)));
        const destInventory = await txDb.query.inventory.findFirst({
          where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, transfer.productId), drizzleOrm.eq(inventory.branchId, transfer.toBranchId))
        });
        if (destInventory) {
          await txDb.update(inventory).set({
            quantity: drizzleOrm.sql`${inventory.quantity} + ${transfer.quantity}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(inventory.id, destInventory.id));
        } else {
          await txDb.insert(inventory).values({
            productId: transfer.productId,
            branchId: transfer.toBranchId,
            quantity: transfer.quantity
          });
        }
        await txDb.update(stockTransfers).set({
          status: "completed",
          receivedDate: (/* @__PURE__ */ new Date()).toISOString(),
          receivedBy: session?.userId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(stockTransfers.id, transferId));
      });
      await createAuditLog$1({
        userId: session?.userId,
        branchId: transfer.toBranchId,
        action: "transfer",
        entityType: "inventory",
        entityId: transferId,
        description: `Stock transfer completed: ${transfer.transferNumber}`
      });
      return { success: true, message: "Transfer completed successfully" };
    } catch (error) {
      console.error("Complete transfer error:", error);
      return { success: false, message: "Failed to complete transfer" };
    }
  });
  electron.ipcMain.handle("inventory:get-adjustments", async (_, productId, branchId) => {
    try {
      const conditions = [];
      if (productId) conditions.push(drizzleOrm.eq(stockAdjustments.productId, productId));
      if (branchId) conditions.push(drizzleOrm.eq(stockAdjustments.branchId, branchId));
      const data = await db2.query.stockAdjustments.findMany({
        where: conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0,
        orderBy: drizzleOrm.desc(stockAdjustments.createdAt),
        limit: 100
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get adjustments error:", error);
      return { success: false, message: "Failed to fetch adjustments" };
    }
  });
  electron.ipcMain.handle("inventory:get-transfers", async (_, branchId) => {
    try {
      const conditions = [];
      if (branchId) {
        conditions.push(
          drizzleOrm.sql`(${stockTransfers.fromBranchId} = ${branchId} OR ${stockTransfers.toBranchId} = ${branchId})`
        );
      }
      const data = await db2.query.stockTransfers.findMany({
        where: conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0,
        orderBy: drizzleOrm.desc(stockTransfers.createdAt),
        limit: 100
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get transfers error:", error);
      return { success: false, message: "Failed to fetch transfers" };
    }
  });
}
function registerCustomerHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "customers:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", search, isActive } = params;
        const conditions = [];
        if (search) {
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(customers.firstName, `%${search}%`),
              drizzleOrm.like(customers.lastName, `%${search}%`),
              drizzleOrm.like(customers.email, `%${search}%`),
              drizzleOrm.like(customers.phone, `%${search}%`),
              drizzleOrm.like(customers.firearmLicenseNumber, `%${search}%`)
            )
          );
        }
        if (isActive !== void 0) {
          conditions.push(drizzleOrm.eq(customers.isActive, isActive));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(customers).where(whereClause);
        const total = countResult[0].count;
        const orderColumn = customers[sortBy] ?? customers.createdAt;
        const data = await db2.query.customers.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(orderColumn) : drizzleOrm.asc(orderColumn)
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get customers error:", error);
        return { success: false, message: "Failed to fetch customers" };
      }
    }
  );
  electron.ipcMain.handle("customers:get-by-id", async (_, id) => {
    try {
      const customer = await db2.query.customers.findFirst({
        where: drizzleOrm.eq(customers.id, id)
      });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }
      return { success: true, data: customer };
    } catch (error) {
      console.error("Get customer error:", error);
      return { success: false, message: "Failed to fetch customer" };
    }
  });
  electron.ipcMain.handle("customers:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const result = await db2.insert(customers).values(data).returning();
      const newCustomer = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "customer",
        entityId: newCustomer.id,
        newValues: sanitizeForAudit(data),
        description: `Created customer: ${data.firstName} ${data.lastName}`
      });
      return { success: true, data: newCustomer };
    } catch (error) {
      console.error("Create customer error:", error);
      return { success: false, message: "Failed to create customer" };
    }
  });
  electron.ipcMain.handle("customers:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.customers.findFirst({
        where: drizzleOrm.eq(customers.id, id)
      });
      if (!existing) {
        return { success: false, message: "Customer not found" };
      }
      const result = await db2.update(customers).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(customers.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "customer",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated customer: ${existing.firstName} ${existing.lastName}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update customer error:", error);
      return { success: false, message: "Failed to update customer" };
    }
  });
  electron.ipcMain.handle("customers:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.customers.findFirst({
        where: drizzleOrm.eq(customers.id, id)
      });
      if (!existing) {
        return { success: false, message: "Customer not found" };
      }
      await db2.update(customers).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(customers.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "customer",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated customer: ${existing.firstName} ${existing.lastName}`
      });
      return { success: true, message: "Customer deactivated successfully" };
    } catch (error) {
      console.error("Delete customer error:", error);
      return { success: false, message: "Failed to delete customer" };
    }
  });
  electron.ipcMain.handle("customers:check-license", async (_, customerId) => {
    try {
      const customer = await db2.query.customers.findFirst({
        where: drizzleOrm.eq(customers.id, customerId)
      });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }
      const hasLicense = !!customer.firearmLicenseNumber;
      const expired = isLicenseExpired(customer.licenseExpiryDate);
      const expiringSoon = isLicenseExpiringSoon(customer.licenseExpiryDate, 30);
      return {
        success: true,
        data: {
          hasLicense,
          licenseNumber: customer.firearmLicenseNumber,
          expiryDate: customer.licenseExpiryDate,
          isExpired: expired,
          isExpiringSoon: expiringSoon,
          isValid: hasLicense && !expired
        }
      };
    } catch (error) {
      console.error("Check license error:", error);
      return { success: false, message: "Failed to check license" };
    }
  });
  electron.ipcMain.handle("customers:search", async (_, query) => {
    try {
      const results = await db2.query.customers.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(customers.isActive, true),
          drizzleOrm.or(
            drizzleOrm.like(customers.firstName, `%${query}%`),
            drizzleOrm.like(customers.lastName, `%${query}%`),
            drizzleOrm.like(customers.phone, `%${query}%`),
            drizzleOrm.like(customers.email, `%${query}%`)
          )
        ),
        limit: 20
      });
      return { success: true, data: results };
    } catch (error) {
      console.error("Search customers error:", error);
      return { success: false, message: "Failed to search customers" };
    }
  });
  electron.ipcMain.handle("customers:get-expiring-licenses", async (_, daysThreshold = 30) => {
    try {
      const thresholdDate = /* @__PURE__ */ new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
      const data = await db2.query.customers.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(customers.isActive, true),
          drizzleOrm.sql`${customers.licenseExpiryDate} IS NOT NULL AND ${customers.licenseExpiryDate} <= ${thresholdDate.toISOString()}`
        )
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get expiring licenses error:", error);
      return { success: false, message: "Failed to fetch expiring licenses" };
    }
  });
}
function registerSupplierHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "suppliers:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortBy = "name", sortOrder = "asc", search, isActive } = params;
        const conditions = [];
        if (search) {
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(suppliers.name, `%${search}%`),
              drizzleOrm.like(suppliers.contactPerson, `%${search}%`),
              drizzleOrm.like(suppliers.email, `%${search}%`)
            )
          );
        }
        if (isActive !== void 0) {
          conditions.push(drizzleOrm.eq(suppliers.isActive, isActive));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(suppliers).where(whereClause);
        const total = countResult[0].count;
        const orderColumn = suppliers[sortBy] ?? suppliers.name;
        const data = await db2.query.suppliers.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(orderColumn) : drizzleOrm.asc(orderColumn)
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get suppliers error:", error);
        return { success: false, message: "Failed to fetch suppliers" };
      }
    }
  );
  electron.ipcMain.handle("suppliers:get-by-id", async (_, id) => {
    try {
      const supplier = await db2.query.suppliers.findFirst({
        where: drizzleOrm.eq(suppliers.id, id)
      });
      if (!supplier) {
        return { success: false, message: "Supplier not found" };
      }
      return { success: true, data: supplier };
    } catch (error) {
      console.error("Get supplier error:", error);
      return { success: false, message: "Failed to fetch supplier" };
    }
  });
  electron.ipcMain.handle("suppliers:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const result = await db2.insert(suppliers).values(data).returning();
      const newSupplier = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "supplier",
        entityId: newSupplier.id,
        newValues: sanitizeForAudit(data),
        description: `Created supplier: ${data.name}`
      });
      return { success: true, data: newSupplier };
    } catch (error) {
      console.error("Create supplier error:", error);
      return { success: false, message: "Failed to create supplier" };
    }
  });
  electron.ipcMain.handle("suppliers:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.suppliers.findFirst({
        where: drizzleOrm.eq(suppliers.id, id)
      });
      if (!existing) {
        return { success: false, message: "Supplier not found" };
      }
      const result = await db2.update(suppliers).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(suppliers.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "supplier",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated supplier: ${existing.name}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update supplier error:", error);
      return { success: false, message: "Failed to update supplier" };
    }
  });
  electron.ipcMain.handle("suppliers:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.suppliers.findFirst({
        where: drizzleOrm.eq(suppliers.id, id)
      });
      if (!existing) {
        return { success: false, message: "Supplier not found" };
      }
      await db2.update(suppliers).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(suppliers.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "supplier",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated supplier: ${existing.name}`
      });
      return { success: true, message: "Supplier deactivated successfully" };
    } catch (error) {
      console.error("Delete supplier error:", error);
      return { success: false, message: "Failed to delete supplier" };
    }
  });
}
const ACCOUNT_CODES = {
  CASH_IN_HAND: "1010",
  CASH_IN_BANK: "1020",
  ACCOUNTS_RECEIVABLE: "1100",
  INVENTORY: "1200",
  ACCOUNTS_PAYABLE: "2000",
  SALES_TAX_PAYABLE: "2100",
  SALES_REVENUE: "4000",
  COGS: "5000"
};
function generateJournalEntryNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
  return `JE-${year}-${timestamp}${random}`;
}
async function getAccountId(accountCode) {
  const db2 = getDatabase();
  const account = await db2.query.chartOfAccounts.findFirst({
    where: drizzleOrm.eq(chartOfAccounts.accountCode, accountCode)
  });
  if (!account) {
    throw new Error(`Account with code ${accountCode} not found`);
  }
  return account.id;
}
async function createJournalEntry(params) {
  const db2 = getDatabase();
  const { description, referenceType, referenceId, branchId, userId, lines, isAutoGenerated = true, entryDate } = params;
  const totalDebits = lines.reduce((sum, l) => sum + l.debitAmount, 0);
  const totalCredits = lines.reduce((sum, l) => sum + l.creditAmount, 0);
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error(`Journal entry unbalanced: Debits (${totalDebits}) != Credits (${totalCredits})`);
  }
  const entryNumber = generateJournalEntryNumber();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const [entry] = await db2.insert(journalEntries).values({
    entryNumber,
    entryDate: entryDate || now.split("T")[0],
    description,
    referenceType,
    referenceId,
    branchId,
    status: isAutoGenerated ? "posted" : "draft",
    isAutoGenerated,
    createdBy: userId,
    postedBy: isAutoGenerated ? userId : null,
    postedAt: isAutoGenerated ? now : null
  }).returning();
  for (const line of lines) {
    if (line.debitAmount === 0 && line.creditAmount === 0) {
      continue;
    }
    const accountId = await getAccountId(line.accountCode);
    await db2.insert(journalEntryLines).values({
      journalEntryId: entry.id,
      accountId,
      debitAmount: line.debitAmount,
      creditAmount: line.creditAmount,
      description: line.description
    });
    if (isAutoGenerated) {
      const account = await db2.query.chartOfAccounts.findFirst({
        where: drizzleOrm.eq(chartOfAccounts.id, accountId)
      });
      if (account) {
        let balanceChange;
        if (account.normalBalance === "debit") {
          balanceChange = line.debitAmount - line.creditAmount;
        } else {
          balanceChange = line.creditAmount - line.debitAmount;
        }
        await db2.update(chartOfAccounts).set({
          currentBalance: account.currentBalance + balanceChange,
          updatedAt: now
        }).where(drizzleOrm.eq(chartOfAccounts.id, accountId));
      }
    }
  }
  return entry.id;
}
async function postSaleToGL(sale, saleItems2, userId) {
  const lines = [];
  const cashAccountCode = sale.paymentMethod === "card" || sale.paymentMethod === "mobile" ? ACCOUNT_CODES.CASH_IN_BANK : ACCOUNT_CODES.CASH_IN_HAND;
  sale.paymentStatus !== "paid";
  const receivableAmount = sale.totalAmount - sale.amountPaid;
  if (sale.amountPaid > 0) {
    lines.push({
      accountCode: cashAccountCode,
      debitAmount: sale.amountPaid,
      creditAmount: 0,
      description: `Cash received for sale ${sale.invoiceNumber}`
    });
  }
  if (receivableAmount > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
      debitAmount: receivableAmount,
      creditAmount: 0,
      description: `Receivable for sale ${sale.invoiceNumber}`
    });
  }
  const netRevenue = sale.subtotal - sale.discountAmount;
  if (netRevenue > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.SALES_REVENUE,
      debitAmount: 0,
      creditAmount: netRevenue,
      description: `Revenue from sale ${sale.invoiceNumber}`
    });
  }
  if (sale.taxAmount > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.SALES_TAX_PAYABLE,
      debitAmount: 0,
      creditAmount: sale.taxAmount,
      description: `Sales tax for sale ${sale.invoiceNumber}`
    });
  }
  const totalCOGS = saleItems2.reduce(
    (sum, item) => sum + item.costPrice * item.quantity,
    0
  );
  if (totalCOGS > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.COGS,
      debitAmount: totalCOGS,
      creditAmount: 0,
      description: `Cost of goods sold for ${sale.invoiceNumber}`
    });
    lines.push({
      accountCode: ACCOUNT_CODES.INVENTORY,
      debitAmount: 0,
      creditAmount: totalCOGS,
      description: `Inventory reduction for ${sale.invoiceNumber}`
    });
  }
  return createJournalEntry({
    description: `Sale: ${sale.invoiceNumber}`,
    referenceType: "sale",
    referenceId: sale.id,
    branchId: sale.branchId,
    userId,
    lines
  });
}
async function postPurchaseReceiveToGL(purchase, receivedItems, userId) {
  const lines = [];
  const totalValue = receivedItems.reduce(
    (sum, item) => sum + item.unitCost * item.receivedQuantity,
    0
  );
  if (totalValue <= 0) {
    throw new Error("Cannot post zero-value purchase to GL");
  }
  lines.push({
    accountCode: ACCOUNT_CODES.INVENTORY,
    debitAmount: totalValue,
    creditAmount: 0,
    description: `Inventory received for PO ${purchase.purchaseOrderNumber}`
  });
  if (purchase.paymentMethod === "pay_later" || purchase.paymentStatus === "pending") {
    lines.push({
      accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE,
      debitAmount: 0,
      creditAmount: totalValue,
      description: `Payable for PO ${purchase.purchaseOrderNumber}`
    });
  } else {
    const cashAccount = purchase.paymentMethod === "cheque" ? ACCOUNT_CODES.CASH_IN_BANK : ACCOUNT_CODES.CASH_IN_HAND;
    lines.push({
      accountCode: cashAccount,
      debitAmount: 0,
      creditAmount: totalValue,
      description: `Payment for PO ${purchase.purchaseOrderNumber}`
    });
  }
  return createJournalEntry({
    description: `Purchase Receive: ${purchase.purchaseOrderNumber}`,
    referenceType: "purchase",
    referenceId: purchase.id,
    branchId: purchase.branchId,
    userId
  });
}
async function postExpenseToGL(expense, userId) {
  return createJournalEntry({
    description: `Expense: ${expense.category}${expense.description ? ` - ${expense.description}` : ""}`,
    referenceType: "expense",
    referenceId: expense.id,
    branchId: expense.branchId,
    userId
  });
}
async function postReturnToGL(returnData, returnItems2, userId) {
  returnItems2.filter((item) => item.restockable).reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  return createJournalEntry({
    description: `Return: ${returnData.returnNumber}`,
    referenceType: "return",
    referenceId: returnData.id,
    branchId: returnData.branchId,
    userId
  });
}
async function postARPaymentToGL(payment, userId) {
  return createJournalEntry({
    description: `AR Payment: ${payment.invoiceNumber}`,
    referenceType: "receivable_payment",
    referenceId: payment.id,
    branchId: payment.branchId,
    userId
  });
}
async function postAPPaymentToGL(payment, userId) {
  return createJournalEntry({
    description: `AP Payment: ${payment.invoiceNumber}`,
    referenceType: "payable_payment",
    referenceId: payment.id,
    branchId: payment.branchId,
    userId
  });
}
async function postVoidSaleToGL(sale, saleItems2, userId) {
  const lines = [];
  const cashAccountCode = sale.paymentMethod === "card" || sale.paymentMethod === "mobile" ? ACCOUNT_CODES.CASH_IN_BANK : ACCOUNT_CODES.CASH_IN_HAND;
  if (sale.amountPaid > 0) {
    lines.push({
      accountCode: cashAccountCode,
      debitAmount: 0,
      creditAmount: sale.amountPaid,
      description: `Void - reverse cash for sale ${sale.invoiceNumber}`
    });
  }
  const receivableAmount = sale.totalAmount - sale.amountPaid;
  if (receivableAmount > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
      debitAmount: 0,
      creditAmount: receivableAmount,
      description: `Void - reverse receivable for sale ${sale.invoiceNumber}`
    });
  }
  const netRevenue = sale.subtotal - sale.discountAmount;
  if (netRevenue > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.SALES_REVENUE,
      debitAmount: netRevenue,
      creditAmount: 0,
      description: `Void - reverse revenue from sale ${sale.invoiceNumber}`
    });
  }
  if (sale.taxAmount > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.SALES_TAX_PAYABLE,
      debitAmount: sale.taxAmount,
      creditAmount: 0,
      description: `Void - reverse sales tax for sale ${sale.invoiceNumber}`
    });
  }
  const totalCOGS = saleItems2.reduce(
    (sum, item) => sum + item.costPrice * item.quantity,
    0
  );
  if (totalCOGS > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.COGS,
      debitAmount: 0,
      creditAmount: totalCOGS,
      description: `Void - reverse COGS for ${sale.invoiceNumber}`
    });
    lines.push({
      accountCode: ACCOUNT_CODES.INVENTORY,
      debitAmount: totalCOGS,
      creditAmount: 0,
      description: `Void - restore inventory for ${sale.invoiceNumber}`
    });
  }
  return createJournalEntry({
    description: `Void Sale: ${sale.invoiceNumber}`,
    referenceType: "sale_void",
    referenceId: sale.id,
    branchId: sale.branchId,
    userId
  });
}
async function consumeCostLayersFIFO(productId, branchId, quantity) {
  const db2 = getDatabase();
  const layers = await db2.query.inventoryCostLayers.findMany({
    where: drizzleOrm.and(
      drizzleOrm.eq(inventoryCostLayers.productId, productId),
      drizzleOrm.eq(inventoryCostLayers.branchId, branchId),
      drizzleOrm.eq(inventoryCostLayers.isFullyConsumed, false)
    ),
    orderBy: drizzleOrm.asc(inventoryCostLayers.receivedDate)
  });
  let remainingQty = quantity;
  let totalCost = 0;
  const layersConsumed = [];
  for (const layer of layers) {
    if (remainingQty <= 0) break;
    const consumeQty = Math.min(remainingQty, layer.quantity);
    const layerCost = consumeQty * layer.unitCost;
    totalCost += layerCost;
    remainingQty -= consumeQty;
    layersConsumed.push({
      layerId: layer.id,
      quantityConsumed: consumeQty,
      unitCost: layer.unitCost,
      cost: layerCost
    });
    const newQuantity = layer.quantity - consumeQty;
    const isFullyConsumed = newQuantity <= 0;
    await db2.update(inventoryCostLayers).set({
      quantity: newQuantity,
      isFullyConsumed,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(drizzleOrm.eq(inventoryCostLayers.id, layer.id));
  }
  if (remainingQty > 0) {
    const product = await db2.query.products.findFirst({
      where: drizzleOrm.eq(products.id, productId)
    });
    if (product) {
      const fallbackCost = remainingQty * product.costPrice;
      totalCost += fallbackCost;
      layersConsumed.push({
        layerId: -1,
        // Indicates fallback to product cost
        quantityConsumed: remainingQty,
        unitCost: product.costPrice,
        cost: fallbackCost
      });
      console.warn(
        `FIFO: Insufficient cost layers for product ${productId}. Used product.costPrice (${product.costPrice}) for ${remainingQty} units.`
      );
    }
  }
  return { totalCost, layersConsumed };
}
async function addCostLayer(data) {
  const db2 = getDatabase();
  const [layer] = await db2.insert(inventoryCostLayers).values({
    productId: data.productId,
    branchId: data.branchId,
    purchaseItemId: data.purchaseItemId,
    quantity: data.quantity,
    originalQuantity: data.quantity,
    unitCost: data.unitCost,
    receivedDate: data.receivedDate || (/* @__PURE__ */ new Date()).toISOString(),
    isFullyConsumed: false
  }).returning();
  return layer.id;
}
async function restoreCostLayers(data) {
  const db2 = getDatabase();
  const [layer] = await db2.insert(inventoryCostLayers).values({
    productId: data.productId,
    branchId: data.branchId,
    purchaseItemId: null,
    // Not linked to a purchase
    quantity: data.quantity,
    originalQuantity: data.quantity,
    unitCost: data.unitCost,
    receivedDate: (/* @__PURE__ */ new Date()).toISOString(),
    isFullyConsumed: false
  }).returning();
  return layer.id;
}
function registerSalesHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("sales:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!data.items || data.items.length === 0) {
        return { success: false, message: "No items in cart" };
      }
      for (const item of data.items) {
        const product = await db2.query.products.findFirst({
          where: drizzleOrm.eq(products.id, item.productId)
        });
        if (product?.isSerialTracked && !item.serialNumber) {
          return {
            success: false,
            message: `Serial number required for ${product.name}`
          };
        }
        const stock = await db2.query.inventory.findFirst({
          where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, data.branchId))
        });
        if (!stock || stock.quantity < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for ${product?.name}`
          };
        }
      }
      if (data.customerId) {
        const customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, data.customerId)
        });
        for (const item of data.items) {
          const product = await db2.query.products.findFirst({
            where: drizzleOrm.eq(products.id, item.productId)
          });
          if (product?.isSerialTracked) {
            if (!customer?.firearmLicenseNumber) {
              return {
                success: false,
                message: "Customer does not have a firearm license"
              };
            }
            if (isLicenseExpired(customer.licenseExpiryDate)) {
              return {
                success: false,
                message: "Customer firearm license has expired"
              };
            }
          }
        }
      }
      const result = await withTransaction(async ({ db: txDb }) => {
        let subtotal = 0;
        let taxAmount = 0;
        const saleItemsData = [];
        for (const item of data.items) {
          const fifoResult = await consumeCostLayersFIFO(
            item.productId,
            data.branchId,
            item.quantity
          );
          const actualCostPerUnit = item.quantity > 0 ? fifoResult.totalCost / item.quantity : item.costPrice;
          const itemSubtotal = item.unitPrice * item.quantity;
          const itemDiscount = itemSubtotal * ((item.discountPercent || 0) / 100);
          const itemTaxable = itemSubtotal - itemDiscount;
          const itemTax = itemTaxable * ((item.taxRate || 0) / 100);
          const itemTotal = itemTaxable + itemTax;
          subtotal += itemSubtotal;
          taxAmount += itemTax;
          saleItemsData.push({
            productId: item.productId,
            serialNumber: item.serialNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: actualCostPerUnit,
            // Use FIFO cost instead of frontend cost
            discountPercent: item.discountPercent || 0,
            discountAmount: itemDiscount,
            taxAmount: itemTax,
            totalPrice: itemTotal,
            fifoCost: fifoResult.totalCost
            // Track total FIFO cost for GL posting
          });
        }
        const discountAmount = data.discountAmount || 0;
        const codCharges = data.codCharges || 0;
        const totalAmount = subtotal + taxAmount - discountAmount + (data.paymentMethod === "cod" ? codCharges : 0);
        const changeGiven = data.amountPaid > totalAmount ? data.amountPaid - totalAmount : 0;
        const paymentStatus = data.paymentStatus || (data.amountPaid >= totalAmount ? "paid" : data.amountPaid > 0 ? "partial" : "pending");
        const invoiceNumber = generateInvoiceNumber();
        const outstandingAmount = totalAmount - data.amountPaid;
        const [sale] = await txDb.insert(sales).values({
          invoiceNumber,
          customerId: data.customerId,
          branchId: data.branchId,
          userId: session?.userId ?? 0,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus,
          amountPaid: data.amountPaid,
          changeGiven,
          notes: data.notes
        }).returning();
        const createdSaleItems = [];
        for (const item of saleItemsData) {
          const { fifoCost, ...itemData } = item;
          await txDb.insert(saleItems).values({
            ...itemData,
            saleId: sale.id
          });
          createdSaleItems.push({ costPrice: item.costPrice, quantity: item.quantity });
        }
        for (const item of data.items) {
          await txDb.update(inventory).set({
            quantity: drizzleOrm.sql`${inventory.quantity} - ${item.quantity}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, data.branchId)));
        }
        if (session?.userId) {
          const commissionRate = 2;
          const commissionAmount = subtotal * (commissionRate / 100);
          await txDb.insert(commissions).values({
            saleId: sale.id,
            userId: session.userId,
            branchId: data.branchId,
            commissionType: "sale",
            baseAmount: subtotal,
            rate: commissionRate,
            commissionAmount,
            status: "pending"
          });
        }
        if (outstandingAmount > 0 && data.customerId) {
          await txDb.insert(accountReceivables).values({
            customerId: data.customerId,
            saleId: sale.id,
            branchId: data.branchId,
            invoiceNumber,
            totalAmount: outstandingAmount,
            paidAmount: 0,
            remainingAmount: outstandingAmount,
            status: "pending",
            createdBy: session?.userId
          });
        }
        if (data.paymentMethod === "cod" && codCharges > 0) {
          await txDb.insert(expenses).values({
            branchId: data.branchId,
            userId: session?.userId ?? 0,
            category: "other",
            amount: codCharges,
            description: `COD Delivery Charges for Invoice: ${invoiceNumber}. Customer: ${data.codName || "N/A"}, Phone: ${data.codPhone || "N/A"}`,
            paymentMethod: "cash",
            reference: invoiceNumber,
            paymentStatus: "unpaid"
          });
        }
        await postSaleToGL(sale, createdSaleItems, session?.userId ?? 0);
        return { sale, invoiceNumber, subtotal, discountAmount, taxAmount, totalAmount, paymentStatus };
      });
      await createAuditLog$1({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "sale",
        entityId: result.sale.id,
        newValues: {
          invoiceNumber: result.invoiceNumber,
          subtotal: result.subtotal,
          discountAmount: result.discountAmount,
          taxAmount: result.taxAmount,
          totalAmount: result.totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus: result.paymentStatus,
          amountPaid: data.amountPaid,
          itemCount: data.items.length
        },
        description: `Created sale: ${result.invoiceNumber}${result.discountAmount > 0 ? ` (Discount: ${result.discountAmount})` : ""}`
      });
      return { success: true, data: result.sale };
    } catch (error) {
      console.error("Create sale error:", error);
      return { success: false, message: "Failed to create sale" };
    }
  });
  electron.ipcMain.handle(
    "sales:get-all",
    async (_, params) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = "saleDate",
          sortOrder = "desc",
          branchId,
          customerId,
          startDate,
          endDate,
          paymentStatus
        } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(sales.branchId, branchId));
        if (customerId) conditions.push(drizzleOrm.eq(sales.customerId, customerId));
        if (paymentStatus) conditions.push(drizzleOrm.eq(sales.paymentStatus, paymentStatus));
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(sales.saleDate, startDate, endDate));
        } else if (startDate) {
          conditions.push(drizzleOrm.gte(sales.saleDate, startDate));
        } else if (endDate) {
          conditions.push(drizzleOrm.lte(sales.saleDate, endDate));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(sales).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.query.sales.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(sales.saleDate) : sales.saleDate
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get sales error:", error);
        return { success: false, message: "Failed to fetch sales" };
      }
    }
  );
  electron.ipcMain.handle("sales:get-by-id", async (_, id) => {
    try {
      const sale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, id)
      });
      if (!sale) {
        return { success: false, message: "Sale not found" };
      }
      const items = await db2.select({
        saleItem: saleItems,
        product: products
      }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.eq(saleItems.saleId, id));
      let customer = null;
      if (sale.customerId) {
        customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, sale.customerId)
        });
      }
      return {
        success: true,
        data: {
          ...sale,
          items: items.map((i) => ({ ...i.saleItem, product: i.product })),
          customer
        }
      };
    } catch (error) {
      console.error("Get sale error:", error);
      return { success: false, message: "Failed to fetch sale" };
    }
  });
  electron.ipcMain.handle("sales:void", async (_, id, reason) => {
    try {
      const session = getCurrentSession();
      const sale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, id)
      });
      if (!sale) {
        return { success: false, message: "Sale not found" };
      }
      if (sale.isVoided) {
        return { success: false, message: "Sale is already voided" };
      }
      const items = await db2.query.saleItems.findMany({
        where: drizzleOrm.eq(saleItems.saleId, id)
      });
      await withTransaction(async ({ db: txDb }) => {
        for (const item of items) {
          await txDb.update(inventory).set({
            quantity: drizzleOrm.sql`${inventory.quantity} + ${item.quantity}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, sale.branchId)));
          await restoreCostLayers({
            productId: item.productId,
            branchId: sale.branchId,
            quantity: item.quantity,
            unitCost: item.costPrice,
            referenceType: "void",
            referenceId: sale.id
          });
        }
        await txDb.update(sales).set({
          isVoided: true,
          voidReason: reason,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(sales.id, id));
        await txDb.update(commissions).set({
          status: "cancelled",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(commissions.saleId, id));
        const linkedReceivable = await txDb.query.accountReceivables.findFirst({
          where: drizzleOrm.eq(accountReceivables.saleId, id)
        });
        if (linkedReceivable) {
          await txDb.update(accountReceivables).set({
            status: "cancelled",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(accountReceivables.id, linkedReceivable.id));
        }
        await postVoidSaleToGL(
          sale,
          items.map((item) => ({ costPrice: item.costPrice, quantity: item.quantity })),
          session?.userId ?? 0
        );
      });
      await createAuditLog$1({
        userId: session?.userId,
        branchId: sale.branchId,
        action: "void",
        entityType: "sale",
        entityId: id,
        oldValues: { isVoided: false },
        newValues: { isVoided: true, voidReason: reason },
        description: `Voided sale: ${sale.invoiceNumber}`
      });
      return { success: true, message: "Sale voided successfully" };
    } catch (error) {
      console.error("Void sale error:", error);
      return { success: false, message: "Failed to void sale" };
    }
  });
  electron.ipcMain.handle("sales:get-daily-summary", async (_, branchId, date) => {
    try {
      const targetDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const startOfDay = `${targetDate}T00:00:00.000Z`;
      const endOfDay = `${targetDate}T23:59:59.999Z`;
      const salesData = await db2.select({
        totalSales: drizzleOrm.sql`count(*)`,
        totalRevenue: drizzleOrm.sql`sum(${sales.totalAmount})`,
        totalTax: drizzleOrm.sql`sum(${sales.taxAmount})`,
        totalDiscount: drizzleOrm.sql`sum(${sales.discountAmount})`,
        cashSales: drizzleOrm.sql`sum(case when ${sales.paymentMethod} = 'cash' then ${sales.totalAmount} else 0 end)`,
        cardSales: drizzleOrm.sql`sum(case when ${sales.paymentMethod} = 'card' then ${sales.totalAmount} else 0 end)`
      }).from(sales).where(
        drizzleOrm.and(
          drizzleOrm.eq(sales.branchId, branchId),
          drizzleOrm.eq(sales.isVoided, false),
          drizzleOrm.between(sales.saleDate, startOfDay, endOfDay)
        )
      );
      return {
        success: true,
        data: {
          date: targetDate,
          ...salesData[0]
        }
      };
    } catch (error) {
      console.error("Get daily summary error:", error);
      return { success: false, message: "Failed to fetch daily summary" };
    }
  });
  electron.ipcMain.handle("sales:fix-payment-status", async (_, invoiceNumber) => {
    try {
      const conditions = [drizzleOrm.eq(sales.isVoided, false)];
      if (invoiceNumber) {
        conditions.push(drizzleOrm.eq(sales.invoiceNumber, invoiceNumber));
      }
      const salesToFix = await db2.query.sales.findMany({
        where: drizzleOrm.and(...conditions)
      });
      let fixedCount = 0;
      for (const sale of salesToFix) {
        const correctStatus = sale.amountPaid >= sale.totalAmount ? "paid" : sale.amountPaid > 0 ? "partial" : "pending";
        if (sale.paymentStatus !== correctStatus) {
          await db2.update(sales).set({
            paymentStatus: correctStatus,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(sales.id, sale.id));
          fixedCount++;
        }
      }
      return {
        success: true,
        message: `Fixed ${fixedCount} sale(s) with incorrect payment status`,
        data: { fixedCount }
      };
    } catch (error) {
      console.error("Fix payment status error:", error);
      return { success: false, message: "Failed to fix payment status" };
    }
  });
  electron.ipcMain.handle("sales:fix-orphaned-receivables", async () => {
    try {
      const session = getCurrentSession();
      const allSales = await db2.query.sales.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(sales.isVoided, false),
          drizzleOrm.sql`${sales.customerId} IS NOT NULL`,
          drizzleOrm.sql`(${sales.totalAmount} - ${sales.amountPaid}) > 0`
        )
      });
      let createdCount = 0;
      for (const sale of allSales) {
        const existingReceivable = await db2.query.accountReceivables.findFirst({
          where: drizzleOrm.eq(accountReceivables.saleId, sale.id)
        });
        if (!existingReceivable && sale.customerId) {
          const outstandingAmount = sale.totalAmount - sale.amountPaid;
          await db2.insert(accountReceivables).values({
            customerId: sale.customerId,
            saleId: sale.id,
            branchId: sale.branchId,
            invoiceNumber: sale.invoiceNumber,
            totalAmount: outstandingAmount,
            paidAmount: 0,
            remainingAmount: outstandingAmount,
            status: sale.amountPaid > 0 ? "partial" : "pending",
            createdBy: session?.userId
          });
          createdCount++;
        }
      }
      return {
        success: true,
        message: `Created ${createdCount} missing receivable(s)`,
        data: { createdCount }
      };
    } catch (error) {
      console.error("Fix orphaned receivables error:", error);
      return { success: false, message: "Failed to fix orphaned receivables" };
    }
  });
}
async function generateTabNumber(branchId) {
  const db2 = getDatabase();
  const result = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(salesTabs).where(drizzleOrm.eq(salesTabs.branchId, branchId));
  const count = result[0]?.count ?? 0;
  const nextNumber = count + 1;
  return `TAB-${String(nextNumber).padStart(3, "0")}`;
}
function registerSalesTabsHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "sales-tabs:get-all",
    async (_, params) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = "createdAt",
          sortOrder = "desc",
          branchId,
          status,
          userId
        } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(salesTabs.branchId, branchId));
        if (status) conditions.push(drizzleOrm.eq(salesTabs.status, status));
        if (userId) conditions.push(drizzleOrm.eq(salesTabs.userId, userId));
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(salesTabs).where(whereClause);
        const total = countResult[0]?.count ?? 0;
        const data = await db2.query.salesTabs.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(salesTabs.createdAt) : salesTabs.createdAt,
          with: {
            customer: true,
            branch: true,
            user: {
              columns: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get sales tabs error:", error);
        return { success: false, message: "Failed to fetch sales tabs" };
      }
    }
  );
  electron.ipcMain.handle("sales-tabs:get-by-id", async (_, id) => {
    try {
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, id),
        with: {
          customer: true,
          branch: true,
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      const items = await db2.select().from(salesTabItems).where(drizzleOrm.eq(salesTabItems.tabId, id)).orderBy(drizzleOrm.desc(salesTabItems.addedAt));
      return {
        success: true,
        data: {
          ...tab,
          items
        }
      };
    } catch (error) {
      console.error("Get tab error:", error);
      return { success: false, message: "Failed to fetch tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const branch = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, data.branchId)
      });
      if (!branch) {
        return { success: false, message: "Branch not found" };
      }
      if (data.customerId) {
        const customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, data.customerId)
        });
        if (!customer) {
          return { success: false, message: "Customer not found" };
        }
      }
      const tabNumber = await generateTabNumber(data.branchId);
      const [newTab] = await db2.insert(salesTabs).values({
        tabNumber,
        branchId: data.branchId,
        customerId: data.customerId,
        userId: session.userId,
        notes: data.notes
      }).returning();
      await createAuditLog$1({
        userId: session.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "sales_tab",
        entityId: newTab.id,
        newValues: {
          tabNumber
        },
        description: `Created sales tab: ${tabNumber}`
      });
      return { success: true, data: newTab };
    } catch (error) {
      console.error("Create tab error:", error);
      return { success: false, message: "Failed to create tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, id)
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot modify closed tab" };
      }
      if (data.customerId !== void 0 && data.customerId !== tab.customerId) {
        const customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, data.customerId)
        });
        if (!customer) {
          return { success: false, message: "Customer not found" };
        }
      }
      const updateData = {};
      if (data.customerId !== void 0) updateData.customerId = data.customerId;
      if (data.status !== void 0) updateData.status = data.status;
      if (data.notes !== void 0) updateData.notes = data.notes;
      updateData.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (data.status === "closed") {
        updateData.closedAt = (/* @__PURE__ */ new Date()).toISOString();
        updateData.closedBy = session?.userId;
      }
      await db2.update(salesTabs).set(updateData).where(drizzleOrm.eq(salesTabs.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: tab.branchId,
        action: "update",
        entityType: "sales_tab",
        entityId: id,
        oldValues: {
          status: tab.status,
          customerId: tab.customerId
        },
        newValues: {
          status: data.status,
          customerId: data.customerId
        },
        description: `Updated sales tab: ${tab.tabNumber}`
      });
      return { success: true, message: "Tab updated successfully" };
    } catch (error) {
      console.error("Update tab error:", error);
      return { success: false, message: "Failed to update tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, id)
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot delete closed tab" };
      }
      await db2.delete(salesTabs).where(drizzleOrm.eq(salesTabs.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: tab.branchId,
        action: "delete",
        entityType: "sales_tab",
        entityId: id,
        oldValues: {
          tabNumber: tab.tabNumber
        },
        description: `Deleted sales tab: ${tab.tabNumber}`
      });
      return { success: true, message: "Tab deleted successfully" };
    } catch (error) {
      console.error("Delete tab error:", error);
      return { success: false, message: "Failed to delete tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:add-item", async (_, tabId, data) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, tabId),
        with: {
          items: true
        }
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot add items to closed tab" };
      }
      const product = await db2.query.products.findFirst({
        where: drizzleOrm.eq(products.id, data.productId)
      });
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      if (!product.isActive) {
        return { success: false, message: "Product is not active" };
      }
      const stock = await db2.query.inventory.findFirst({
        where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, data.productId), drizzleOrm.eq(inventory.branchId, tab.branchId))
      });
      const availableQuantity = stock?.quantity ?? 0;
      const existingQuantity = tab.items.filter((item) => item.productId === data.productId && !item.serialNumber).reduce((sum, item) => sum + item.quantity, 0);
      if (product.isSerialTracked) {
        if (!data.serialNumber) {
          return { success: false, message: "Serial number required for this product" };
        }
        const existingSerial = tab.items.find(
          (item) => item.productId === data.productId && item.serialNumber === data.serialNumber
        );
        if (existingSerial) {
          return { success: false, message: "This serial number is already in the tab" };
        }
      } else {
        if (existingQuantity + data.quantity > availableQuantity) {
          return {
            success: false,
            message: `Insufficient stock. Available: ${availableQuantity}, In tab: ${existingQuantity}, Requested: ${data.quantity}`,
            availableQuantity: availableQuantity - existingQuantity
          };
        }
      }
      if (product.isSerialTracked && data.quantity !== 1) {
        return { success: false, message: "Quantity must be 1 for serial tracked items" };
      }
      const sellingPrice = data.sellingPrice ?? product.sellingPrice;
      const subtotal = sellingPrice * data.quantity;
      const taxAmount = subtotal * ((product.isTaxable ? product.taxRate : 0) / 100);
      const [newItem] = await db2.insert(salesTabItems).values({
        tabId,
        productId: data.productId,
        productName: product.name,
        productCode: product.code,
        quantity: data.quantity,
        sellingPrice,
        costPrice: product.costPrice,
        taxPercent: product.isTaxable ? product.taxRate : 0,
        subtotal: subtotal + taxAmount,
        serialNumber: data.serialNumber,
        batchNumber: data.batchNumber
      }).returning();
      await db2.update(salesTabs).set({
        itemCount: drizzleOrm.sql`${salesTabs.itemCount} + 1`,
        subtotal: drizzleOrm.sql`${salesTabs.subtotal} + ${subtotal}`,
        tax: drizzleOrm.sql`${salesTabs.tax} + ${taxAmount}`,
        finalAmount: drizzleOrm.sql`${salesTabs.finalAmount} + ${subtotal + taxAmount}`,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(salesTabs.id, tabId));
      return { success: true, data: newItem };
    } catch (error) {
      console.error("Add item error:", error);
      return { success: false, message: "Failed to add item to tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:update-item", async (_, tabId, itemId, data) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, tabId)
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot modify closed tab" };
      }
      const item = await db2.query.salesTabItems.findFirst({
        where: drizzleOrm.eq(salesTabItems.id, itemId)
      });
      if (!item) {
        return { success: false, message: "Item not found" };
      }
      if (item.tabId !== tabId) {
        return { success: false, message: "Item does not belong to this tab" };
      }
      if (item.serialNumber && data.quantity !== 1) {
        return { success: false, message: "Cannot change quantity of serial tracked items" };
      }
      if (data.quantity <= 0) {
        return { success: false, message: "Quantity must be greater than 0" };
      }
      const stock = await db2.query.inventory.findFirst({
        where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, tab.branchId))
      });
      const availableQuantity = stock?.quantity ?? 0;
      if (data.quantity > availableQuantity) {
        return {
          success: false,
          message: `Insufficient stock. Available: ${availableQuantity}`,
          availableQuantity
        };
      }
      const oldSubtotal = item.subtotal;
      const newSubtotal = item.sellingPrice * data.quantity;
      const newTaxAmount = newSubtotal * (item.taxPercent / 100);
      const newItemTotal = newSubtotal + newTaxAmount;
      const subtotalDiff = newSubtotal - oldSubtotal / (1 + item.taxPercent / 100);
      const taxDiff = newTaxAmount - (oldSubtotal - oldSubtotal / (1 + item.taxPercent / 100));
      const totalDiff = newItemTotal - oldSubtotal;
      await db2.update(salesTabItems).set({
        quantity: data.quantity,
        subtotal: newItemTotal
      }).where(drizzleOrm.eq(salesTabItems.id, itemId));
      await db2.update(salesTabs).set({
        subtotal: drizzleOrm.sql`${salesTabs.subtotal} + ${subtotalDiff}`,
        tax: drizzleOrm.sql`${salesTabs.tax} + ${taxDiff}`,
        finalAmount: drizzleOrm.sql`${salesTabs.finalAmount} + ${totalDiff}`,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(salesTabs.id, tabId));
      return { success: true, message: "Item updated successfully" };
    } catch (error) {
      console.error("Update item error:", error);
      return { success: false, message: "Failed to update item" };
    }
  });
  electron.ipcMain.handle("sales-tabs:remove-item", async (_, tabId, itemId) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, tabId)
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot modify closed tab" };
      }
      const item = await db2.query.salesTabItems.findFirst({
        where: drizzleOrm.eq(salesTabItems.id, itemId)
      });
      if (!item) {
        return { success: false, message: "Item not found" };
      }
      if (item.tabId !== tabId) {
        return { success: false, message: "Item does not belong to this tab" };
      }
      await db2.delete(salesTabItems).where(drizzleOrm.eq(salesTabItems.id, itemId));
      await db2.update(salesTabs).set({
        itemCount: drizzleOrm.sql`${salesTabs.itemCount} - 1`,
        subtotal: drizzleOrm.sql`${salesTabs.subtotal} - ${item.sellingPrice * item.quantity}`,
        tax: drizzleOrm.sql`${salesTabs.tax} - ${item.subtotal - item.sellingPrice * item.quantity}`,
        finalAmount: drizzleOrm.sql`${salesTabs.finalAmount} - ${item.subtotal}`,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(salesTabs.id, tabId));
      return { success: true, message: "Item removed successfully" };
    } catch (error) {
      console.error("Remove item error:", error);
      return { success: false, message: "Failed to remove item" };
    }
  });
  electron.ipcMain.handle(
    "sales-tabs:get-available-products",
    async (_, params) => {
      try {
        const { branchId, categoryId, searchQuery, limit = 100 } = params;
        let query = db2.select({
          product: products,
          quantity: inventory.quantity
        }).from(products).leftJoin(inventory, drizzleOrm.and(drizzleOrm.eq(inventory.productId, products.id), drizzleOrm.eq(inventory.branchId, branchId))).where(drizzleOrm.eq(products.isActive, true));
        if (categoryId) {
          query = query.where(drizzleOrm.eq(products.categoryId, categoryId));
        }
        if (searchQuery) {
          query = query.where(
            drizzleOrm.sql`(${products.name} LIKE ${`%${searchQuery}%`} OR ${products.code} LIKE ${`%${searchQuery}%`} OR ${products.barcode} LIKE ${`%${searchQuery}%`})`
          );
        }
        query = query.limit(limit).orderBy(products.name);
        const results = await query;
        const availableProducts = results.filter((r) => r.quantity > 0);
        return { success: true, data: availableProducts };
      } catch (error) {
        console.error("Get available products error:", error);
        return { success: false, message: "Failed to fetch available products" };
      }
    }
  );
  electron.ipcMain.handle("sales-tabs:checkout", async (_, tabId, checkoutData) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, tabId),
        with: {
          items: true,
          customer: true
        }
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Tab is already closed" };
      }
      if (tab.items.length === 0) {
        return { success: false, message: "Tab has no items" };
      }
      if (checkoutData.paymentMethod === "cod") {
        if (!checkoutData.codName || !checkoutData.codPhone || !checkoutData.codAddress || !checkoutData.codCity) {
          return { success: false, message: "COD details are required" };
        }
      }
      if (checkoutData.paymentMethod === "receivable" && !tab.customerId) {
        return { success: false, message: "Customer is required for Pay Later / Receivable payment method" };
      }
      const hasFirearms = tab.items.some((item) => {
        return tab.items.filter((i) => i.productId === item.productId && !item.serialNumber).length > 0;
      });
      for (const item of tab.items) {
        const product = await db2.query.products.findFirst({
          where: drizzleOrm.eq(products.id, item.productId)
        });
        if (product?.isSerialTracked) {
          if (!tab.customer) {
            return { success: false, message: "Customer is required for firearm purchases" };
          }
          if (!tab.customer.firearmLicenseNumber) {
            return { success: false, message: "Customer does not have a firearm license" };
          }
          if (isLicenseExpired(tab.customer.licenseExpiryDate)) {
            return { success: false, message: "Customer firearm license has expired" };
          }
        }
      }
      for (const item of tab.items) {
        if (item.serialNumber) {
          const product = await db2.query.products.findFirst({
            where: drizzleOrm.eq(products.id, item.productId)
          });
          if (!product || !product.isActive) {
            return { success: false, message: `Product ${item.productName} is not available` };
          }
        } else {
          const stock = await db2.query.inventory.findFirst({
            where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, tab.branchId))
          });
          if (!stock || stock.quantity < item.quantity) {
            return {
              success: false,
              message: `Insufficient stock for ${item.productName}`
            };
          }
        }
      }
      const subtotal = tab.subtotal;
      const taxAmount = tab.tax;
      const discountAmount = checkoutData.discount ?? 0;
      const codCharges = checkoutData.codCharges ?? 0;
      const totalAmount = subtotal + taxAmount - discountAmount + (checkoutData.paymentMethod === "cod" ? codCharges : 0);
      const amountPaid = checkoutData.amountPaid ?? 0;
      const changeGiven = amountPaid > totalAmount ? amountPaid - totalAmount : 0;
      let paymentStatus = "paid";
      if (checkoutData.paymentMethod === "receivable" || amountPaid === 0) {
        paymentStatus = "pending";
      } else if (amountPaid < totalAmount) {
        paymentStatus = "partial";
      }
      const invoiceNumber = generateInvoiceNumber();
      let saleNotes;
      if (checkoutData.notes) {
        saleNotes = `Tab: ${tab.tabNumber}. ${checkoutData.notes}`;
      } else {
        saleNotes = `Tab: ${tab.tabNumber}`;
      }
      if (checkoutData.paymentMethod === "cod") {
        saleNotes = `${saleNotes}

COD Details:
Name: ${checkoutData.codName}
Phone: ${checkoutData.codPhone}
Address: ${checkoutData.codAddress}, ${checkoutData.codCity}`;
        if (codCharges > 0) {
          saleNotes = `${saleNotes}
COD Charges: ${codCharges}`;
        }
      }
      const [sale] = await db2.insert(sales).values({
        invoiceNumber,
        customerId: tab.customerId,
        branchId: tab.branchId,
        userId: session.userId,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod: checkoutData.paymentMethod,
        paymentStatus,
        amountPaid,
        changeGiven,
        notes: saleNotes
      }).returning();
      for (const item of tab.items) {
        await db2.insert(saleItems).values({
          saleId: sale.id,
          productId: item.productId,
          serialNumber: item.serialNumber,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          costPrice: item.costPrice,
          discountPercent: 0,
          discountAmount: 0,
          taxAmount: item.subtotal - item.sellingPrice * item.quantity,
          totalPrice: item.subtotal
        });
        if (!item.serialNumber) {
          await db2.update(inventory).set({
            quantity: drizzleOrm.sql`${inventory.quantity} - ${item.quantity}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, tab.branchId)));
        }
      }
      const commissionRate = 2;
      const commissionAmount = subtotal * (commissionRate / 100);
      await db2.insert(commissions).values({
        saleId: sale.id,
        userId: session.userId,
        branchId: tab.branchId,
        commissionType: "sale",
        baseAmount: subtotal,
        rate: commissionRate,
        commissionAmount,
        status: "pending"
      });
      if (checkoutData.paymentMethod === "receivable" && tab.customerId) {
        await db2.insert(accountReceivables).values({
          customerId: tab.customerId,
          saleId: sale.id,
          branchId: tab.branchId,
          invoiceNumber,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          status: "pending",
          createdBy: session.userId
        });
      }
      if (checkoutData.paymentMethod === "cod" && codCharges > 0) {
        await db2.insert(expenses).values({
          branchId: tab.branchId,
          userId: session.userId,
          category: "other",
          amount: codCharges,
          description: `COD Delivery Charges for Invoice: ${invoiceNumber}. Customer: ${checkoutData.codName}, Phone: ${checkoutData.codPhone}`,
          paymentMethod: "cash",
          reference: invoiceNumber,
          paymentStatus: "unpaid"
          // Mark as unpaid - to be paid to courier later
        });
      }
      await db2.update(salesTabs).set({
        status: "closed",
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedBy: session.userId,
        discount: discountAmount,
        finalAmount: totalAmount,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(salesTabs.id, tabId));
      await createAuditLog$1({
        userId: session.userId,
        branchId: tab.branchId,
        action: "checkout",
        entityType: "sales_tab",
        entityId: tabId,
        oldValues: {
          status: tab.status
        },
        newValues: {
          status: "closed",
          saleId: sale.id,
          invoiceNumber
        },
        description: `Checked out sales tab ${tab.tabNumber} as sale ${invoiceNumber}`
      });
      return {
        success: true,
        data: {
          sale,
          invoiceNumber,
          totalAmount,
          changeReturned: changeGiven
        }
      };
    } catch (error) {
      console.error("Checkout tab error:", error);
      return { success: false, message: "Failed to checkout tab" };
    }
  });
  electron.ipcMain.handle("sales-tabs:clear-items", async (_, tabId) => {
    try {
      const session = getCurrentSession();
      const tab = await db2.query.salesTabs.findFirst({
        where: drizzleOrm.eq(salesTabs.id, tabId)
      });
      if (!tab) {
        return { success: false, message: "Tab not found" };
      }
      if (tab.status === "closed") {
        return { success: false, message: "Cannot modify closed tab" };
      }
      await db2.delete(salesTabItems).where(drizzleOrm.eq(salesTabItems.tabId, tabId));
      await db2.update(salesTabs).set({
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        finalAmount: 0,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(salesTabs.id, tabId));
      return { success: true, message: "Tab cleared successfully" };
    } catch (error) {
      console.error("Clear tab error:", error);
      return { success: false, message: "Failed to clear tab" };
    }
  });
}
function registerPurchaseHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("purchases:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!data.items || data.items.length === 0) {
        return { success: false, message: "No items in purchase order" };
      }
      let subtotal = 0;
      const purchaseItemsData = [];
      for (const item of data.items) {
        const totalCost = item.unitCost * item.quantity;
        subtotal += totalCost;
        purchaseItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          receivedQuantity: 0,
          totalCost
        });
      }
      const shippingCost = data.shippingCost || 0;
      const totalAmount = subtotal + shippingCost;
      const purchaseOrderNumber = generatePurchaseOrderNumber();
      const paymentMethod = data.paymentMethod || "cash";
      const paymentStatus = paymentMethod === "pay_later" ? "pending" : "paid";
      const [purchase] = await db2.insert(purchases).values({
        purchaseOrderNumber,
        supplierId: data.supplierId,
        branchId: data.branchId,
        userId: session?.userId ?? 0,
        subtotal,
        taxAmount: 0,
        shippingCost,
        totalAmount,
        paymentMethod,
        paymentStatus,
        status: "draft",
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes
      }).returning();
      for (const item of purchaseItemsData) {
        await db2.insert(purchaseItems).values({
          ...item,
          purchaseId: purchase.id
        });
      }
      if (paymentMethod === "pay_later") {
        await db2.insert(accountPayables).values({
          supplierId: data.supplierId,
          purchaseId: purchase.id,
          branchId: data.branchId,
          invoiceNumber: purchaseOrderNumber,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          status: "pending",
          notes: `Auto-generated from Purchase Order: ${purchaseOrderNumber}`,
          createdBy: session?.userId
        });
      }
      await createAuditLog$1({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "purchase",
        entityId: purchase.id,
        newValues: {
          purchaseOrderNumber,
          totalAmount,
          itemCount: data.items.length,
          paymentMethod,
          paymentStatus
        },
        description: `Created purchase order: ${purchaseOrderNumber} (Payment: ${paymentMethod})`
      });
      return { success: true, data: purchase };
    } catch (error) {
      console.error("Create purchase error:", error);
      return { success: false, message: "Failed to create purchase order" };
    }
  });
  electron.ipcMain.handle(
    "purchases:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortOrder = "desc", branchId, supplierId, status } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(purchases.branchId, branchId));
        if (supplierId) conditions.push(drizzleOrm.eq(purchases.supplierId, supplierId));
        if (status)
          conditions.push(drizzleOrm.eq(purchases.status, status));
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(purchases).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.query.purchases.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(purchases.createdAt) : purchases.createdAt
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get purchases error:", error);
        return { success: false, message: "Failed to fetch purchases" };
      }
    }
  );
  electron.ipcMain.handle("purchases:get-by-id", async (_, id) => {
    try {
      const purchase = await db2.query.purchases.findFirst({
        where: drizzleOrm.eq(purchases.id, id)
      });
      if (!purchase) {
        return { success: false, message: "Purchase order not found" };
      }
      const items = await db2.select({
        purchaseItem: purchaseItems,
        product: products
      }).from(purchaseItems).innerJoin(products, drizzleOrm.eq(purchaseItems.productId, products.id)).where(drizzleOrm.eq(purchaseItems.purchaseId, id));
      const supplier = await db2.query.suppliers.findFirst({
        where: drizzleOrm.eq(suppliers.id, purchase.supplierId)
      });
      return {
        success: true,
        data: {
          ...purchase,
          items: items.map((i) => ({ ...i.purchaseItem, product: i.product })),
          supplier
        }
      };
    } catch (error) {
      console.error("Get purchase error:", error);
      return { success: false, message: "Failed to fetch purchase order" };
    }
  });
  electron.ipcMain.handle(
    "purchases:receive",
    async (_, purchaseId, receivedItems) => {
      try {
        const session = getCurrentSession();
        const purchase = await db2.query.purchases.findFirst({
          where: drizzleOrm.eq(purchases.id, purchaseId)
        });
        if (!purchase) {
          return { success: false, message: "Purchase order not found" };
        }
        if (purchase.status === "received" || purchase.status === "cancelled") {
          return { success: false, message: "Cannot receive items for this purchase order" };
        }
        const result = await withTransaction(async ({ db: txDb }) => {
          const receivedItemDetails = [];
          for (const item of receivedItems) {
            const purchaseItem = await txDb.query.purchaseItems.findFirst({
              where: drizzleOrm.eq(purchaseItems.id, item.itemId)
            });
            if (!purchaseItem) continue;
            await txDb.update(purchaseItems).set({
              receivedQuantity: drizzleOrm.sql`${purchaseItems.receivedQuantity} + ${item.receivedQuantity}`
            }).where(drizzleOrm.eq(purchaseItems.id, item.itemId));
            const existingInventory = await txDb.query.inventory.findFirst({
              where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, purchaseItem.productId), drizzleOrm.eq(inventory.branchId, purchase.branchId))
            });
            if (existingInventory) {
              await txDb.update(inventory).set({
                quantity: drizzleOrm.sql`${inventory.quantity} + ${item.receivedQuantity}`,
                lastRestockDate: (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              }).where(drizzleOrm.eq(inventory.id, existingInventory.id));
            } else {
              await txDb.insert(inventory).values({
                productId: purchaseItem.productId,
                branchId: purchase.branchId,
                quantity: item.receivedQuantity,
                lastRestockDate: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
            await addCostLayer({
              productId: purchaseItem.productId,
              branchId: purchase.branchId,
              purchaseItemId: purchaseItem.id,
              quantity: item.receivedQuantity,
              unitCost: purchaseItem.unitCost,
              receivedDate: (/* @__PURE__ */ new Date()).toISOString()
            });
            receivedItemDetails.push({
              unitCost: purchaseItem.unitCost,
              receivedQuantity: item.receivedQuantity,
              purchaseItemId: purchaseItem.id
            });
          }
          const allItems = await txDb.query.purchaseItems.findMany({
            where: drizzleOrm.eq(purchaseItems.purchaseId, purchaseId)
          });
          const allReceived = allItems.every((item) => item.receivedQuantity >= item.quantity);
          const partiallyReceived = allItems.some((item) => item.receivedQuantity > 0);
          const newStatus = allReceived ? "received" : partiallyReceived ? "partial" : purchase.status;
          await txDb.update(purchases).set({
            status: newStatus,
            receivedDate: allReceived ? (/* @__PURE__ */ new Date()).toISOString() : null,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(purchases.id, purchaseId));
          if (receivedItemDetails.length > 0) {
            await postPurchaseReceiveToGL(purchase, receivedItemDetails, session?.userId ?? 0);
          }
          return { newStatus, receivedItemDetails };
        });
        await createAuditLog$1({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: "update",
          entityType: "purchase",
          entityId: purchaseId,
          newValues: {
            status: result.newStatus,
            receivedItems: receivedItems.length
          },
          description: `Received items for purchase: ${purchase.purchaseOrderNumber}`
        });
        return { success: true, message: "Items received successfully" };
      } catch (error) {
        console.error("Receive purchase error:", error);
        return { success: false, message: "Failed to receive items" };
      }
    }
  );
  electron.ipcMain.handle("purchases:update-status", async (_, id, status) => {
    try {
      const session = getCurrentSession();
      const purchase = await db2.query.purchases.findFirst({
        where: drizzleOrm.eq(purchases.id, id)
      });
      if (!purchase) {
        return { success: false, message: "Purchase order not found" };
      }
      await db2.update(purchases).set({
        status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(purchases.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: purchase.branchId,
        action: "update",
        entityType: "purchase",
        entityId: id,
        oldValues: { status: purchase.status },
        newValues: { status },
        description: `Updated purchase status: ${purchase.purchaseOrderNumber}`
      });
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Update purchase status error:", error);
      return { success: false, message: "Failed to update status" };
    }
  });
  electron.ipcMain.handle(
    "purchases:pay-off",
    async (_, purchaseId, paymentData) => {
      try {
        const session = getCurrentSession();
        const purchase = await db2.query.purchases.findFirst({
          where: drizzleOrm.eq(purchases.id, purchaseId)
        });
        if (!purchase) {
          return { success: false, message: "Purchase order not found" };
        }
        if (purchase.paymentStatus === "paid") {
          return { success: false, message: "Purchase is already paid" };
        }
        await db2.update(purchases).set({
          paymentStatus: "paid",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(purchases.id, purchaseId));
        const payable = await db2.query.accountPayables.findFirst({
          where: drizzleOrm.eq(accountPayables.purchaseId, purchaseId)
        });
        if (payable) {
          await db2.insert(payablePayments).values({
            payableId: payable.id,
            amount: payable.remainingAmount,
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            notes: paymentData.notes || `Payment for Purchase: ${purchase.purchaseOrderNumber}`,
            paidBy: session?.userId
          });
          await db2.update(accountPayables).set({
            paidAmount: payable.totalAmount,
            remainingAmount: 0,
            status: "paid",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(accountPayables.id, payable.id));
        }
        await createAuditLog$1({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: "update",
          entityType: "purchase",
          entityId: purchaseId,
          oldValues: { paymentStatus: purchase.paymentStatus },
          newValues: { paymentStatus: "paid", paymentMethod: paymentData.paymentMethod },
          description: `Paid off purchase order: ${purchase.purchaseOrderNumber}`
        });
        return { success: true, message: "Purchase paid off successfully" };
      } catch (error) {
        console.error("Pay off purchase error:", error);
        return { success: false, message: "Failed to pay off purchase" };
      }
    }
  );
}
function registerReturnHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("returns:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!data.items || data.items.length === 0) {
        return { success: false, message: "No items to return" };
      }
      const originalSale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, data.originalSaleId)
      });
      if (!originalSale) {
        return { success: false, message: "Original sale not found" };
      }
      if (originalSale.isVoided) {
        return { success: false, message: "Cannot return items from a voided sale" };
      }
      const result = await withTransaction(async ({ db: txDb }) => {
        let subtotal = 0;
        let taxAmount = 0;
        const returnItemsData = [];
        for (const item of data.items) {
          const totalPrice = item.unitPrice * item.quantity;
          subtotal += totalPrice;
          const originalItem = await txDb.query.saleItems.findFirst({
            where: drizzleOrm.eq(saleItems.id, item.saleItemId)
          });
          let itemCostPrice = 0;
          if (originalItem) {
            const itemTax = originalItem.taxAmount / originalItem.quantity * item.quantity;
            taxAmount += itemTax;
            itemCostPrice = originalItem.costPrice;
          }
          returnItemsData.push({
            saleItemId: item.saleItemId,
            productId: item.productId,
            serialNumber: item.serialNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            condition: item.condition,
            restockable: item.restockable,
            costPrice: itemCostPrice
          });
        }
        const totalAmount = subtotal + taxAmount;
        const returnNumber = generateReturnNumber();
        const [returnRecord] = await txDb.insert(returns).values({
          returnNumber,
          originalSaleId: data.originalSaleId,
          customerId: data.customerId,
          branchId: data.branchId,
          userId: session?.userId ?? 0,
          returnType: data.returnType,
          subtotal,
          taxAmount,
          totalAmount,
          refundMethod: data.refundMethod,
          refundAmount: data.returnType === "refund" ? totalAmount : 0,
          reason: data.reason,
          notes: data.notes
        }).returning();
        for (const item of returnItemsData) {
          const { costPrice, ...itemData } = item;
          await txDb.insert(returnItems).values({
            ...itemData,
            returnId: returnRecord.id
          });
        }
        for (const item of data.items) {
          if (item.restockable) {
            const existingInventory = await txDb.query.inventory.findFirst({
              where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, data.branchId))
            });
            if (existingInventory) {
              await txDb.update(inventory).set({
                quantity: drizzleOrm.sql`${inventory.quantity} + ${item.quantity}`,
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              }).where(drizzleOrm.eq(inventory.id, existingInventory.id));
            } else {
              await txDb.insert(inventory).values({
                productId: item.productId,
                branchId: data.branchId,
                quantity: item.quantity
              });
            }
            const returnItemData = returnItemsData.find((ri) => ri.productId === item.productId);
            if (returnItemData && returnItemData.costPrice > 0) {
              await restoreCostLayers({
                productId: item.productId,
                branchId: data.branchId,
                quantity: item.quantity,
                unitCost: returnItemData.costPrice,
                referenceType: "return",
                referenceId: returnRecord.id
              });
            }
          }
        }
        const returnItemsForGL = returnItemsData.map((item) => ({
          costPrice: item.costPrice,
          quantity: item.quantity,
          restockable: item.restockable
        }));
        await postReturnToGL(
          {
            id: returnRecord.id,
            returnNumber,
            branchId: data.branchId,
            subtotal,
            taxAmount,
            totalAmount,
            refundMethod: data.refundMethod
          },
          returnItemsForGL,
          session?.userId ?? 0
        );
        return { returnRecord, returnNumber, totalAmount };
      });
      await createAuditLog$1({
        userId: session?.userId,
        branchId: data.branchId,
        action: "refund",
        entityType: "return",
        entityId: result.returnRecord.id,
        newValues: {
          returnNumber: result.returnNumber,
          originalSaleId: data.originalSaleId,
          totalAmount: result.totalAmount,
          itemCount: data.items.length
        },
        description: `Created return: ${result.returnNumber}`
      });
      return { success: true, data: result.returnRecord };
    } catch (error) {
      console.error("Create return error:", error);
      return { success: false, message: "Failed to create return" };
    }
  });
  electron.ipcMain.handle(
    "returns:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortOrder = "desc", branchId, customerId, returnType } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(returns.branchId, branchId));
        if (customerId) conditions.push(drizzleOrm.eq(returns.customerId, customerId));
        if (returnType)
          conditions.push(drizzleOrm.eq(returns.returnType, returnType));
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(returns).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.query.returns.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(returns.returnDate) : returns.returnDate
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get returns error:", error);
        return { success: false, message: "Failed to fetch returns" };
      }
    }
  );
  electron.ipcMain.handle("returns:get-by-id", async (_, id) => {
    try {
      const returnRecord = await db2.query.returns.findFirst({
        where: drizzleOrm.eq(returns.id, id)
      });
      if (!returnRecord) {
        return { success: false, message: "Return not found" };
      }
      const items = await db2.select({
        returnItem: returnItems,
        product: products
      }).from(returnItems).innerJoin(products, drizzleOrm.eq(returnItems.productId, products.id)).where(drizzleOrm.eq(returnItems.returnId, id));
      const originalSale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, returnRecord.originalSaleId)
      });
      let customer = null;
      if (returnRecord.customerId) {
        customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, returnRecord.customerId)
        });
      }
      return {
        success: true,
        data: {
          ...returnRecord,
          items: items.map((i) => ({ ...i.returnItem, product: i.product })),
          originalSale,
          customer
        }
      };
    } catch (error) {
      console.error("Get return error:", error);
      return { success: false, message: "Failed to fetch return" };
    }
  });
  electron.ipcMain.handle("returns:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const returnRecord = await db2.query.returns.findFirst({
        where: drizzleOrm.eq(returns.id, id)
      });
      if (!returnRecord) {
        return { success: false, message: "Return not found" };
      }
      const items = await db2.query.returnItems.findMany({
        where: drizzleOrm.eq(returnItems.returnId, id)
      });
      for (const item of items) {
        const existingInventory = await db2.query.inventory.findFirst({
          where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, returnRecord.branchId))
        });
        if (existingInventory && item.restockable) {
          await db2.update(inventory).set({
            quantity: drizzleOrm.sql`${inventory.quantity} - ${item.quantity}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(inventory.id, existingInventory.id));
        }
      }
      await db2.delete(returnItems).where(drizzleOrm.eq(returnItems.returnId, id));
      await db2.delete(returns).where(drizzleOrm.eq(returns.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: returnRecord.branchId,
        action: "delete",
        entityType: "return",
        entityId: id,
        oldValues: {
          returnNumber: returnRecord.returnNumber,
          totalAmount: returnRecord.totalAmount
        },
        description: `Deleted return: ${returnRecord.returnNumber}`
      });
      return { success: true, message: "Return deleted successfully" };
    } catch (error) {
      console.error("Delete return error:", error);
      return { success: false, message: "Failed to delete return" };
    }
  });
}
function registerBranchHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("branches:get-all", async () => {
    try {
      const data = await db2.query.branches.findMany({
        orderBy: drizzleOrm.desc(branches.isMain)
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get branches error:", error);
      return { success: false, message: "Failed to fetch branches" };
    }
  });
  electron.ipcMain.handle("branches:get-active", async () => {
    try {
      const data = await db2.query.branches.findMany({
        where: drizzleOrm.eq(branches.isActive, true),
        orderBy: drizzleOrm.desc(branches.isMain)
      });
      return { success: true, data };
    } catch (error) {
      console.error("Get active branches error:", error);
      return { success: false, message: "Failed to fetch active branches" };
    }
  });
  electron.ipcMain.handle("branches:get-by-id", async (_, id) => {
    try {
      const branch = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, id)
      });
      if (!branch) {
        return { success: false, message: "Branch not found" };
      }
      return { success: true, data: branch };
    } catch (error) {
      console.error("Get branch error:", error);
      return { success: false, message: "Failed to fetch branch" };
    }
  });
  electron.ipcMain.handle("branches:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.code, data.code)
      });
      if (existing) {
        return { success: false, message: "Branch code already exists" };
      }
      const result = await db2.insert(branches).values(data).returning();
      const newBranch = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "branch",
        entityId: newBranch.id,
        newValues: sanitizeForAudit(data),
        description: `Created branch: ${data.name}`
      });
      return { success: true, data: newBranch };
    } catch (error) {
      console.error("Create branch error:", error);
      return { success: false, message: "Failed to create branch" };
    }
  });
  electron.ipcMain.handle("branches:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, id)
      });
      if (!existing) {
        return { success: false, message: "Branch not found" };
      }
      if (data.code && data.code !== existing.code) {
        const duplicate = await db2.query.branches.findFirst({
          where: drizzleOrm.eq(branches.code, data.code)
        });
        if (duplicate) {
          return { success: false, message: "Branch code already exists" };
        }
      }
      const result = await db2.update(branches).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(branches.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "branch",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated branch: ${existing.name}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update branch error:", error);
      return { success: false, message: "Failed to update branch" };
    }
  });
  electron.ipcMain.handle("branches:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, id)
      });
      if (!existing) {
        return { success: false, message: "Branch not found" };
      }
      if (existing.isMain) {
        return { success: false, message: "Cannot deactivate main branch" };
      }
      await db2.update(branches).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(branches.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "branch",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated branch: ${existing.name}`
      });
      return { success: true, message: "Branch deactivated successfully" };
    } catch (error) {
      console.error("Delete branch error:", error);
      return { success: false, message: "Failed to delete branch" };
    }
  });
}
function registerUserHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "users:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", search, role, isActive } = params;
        const conditions = [];
        if (search) {
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(users.username, `%${search}%`),
              drizzleOrm.like(users.fullName, `%${search}%`),
              drizzleOrm.like(users.email, `%${search}%`)
            )
          );
        }
        if (role) {
          conditions.push(drizzleOrm.eq(users.role, role));
        }
        if (isActive !== void 0) {
          conditions.push(drizzleOrm.eq(users.isActive, isActive));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(users).where(whereClause);
        const total = countResult[0].count;
        const orderColumn = users[sortBy] ?? users.createdAt;
        const data = await db2.query.users.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(orderColumn) : drizzleOrm.asc(orderColumn),
          columns: {
            password: false
            // Exclude password
          }
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get users error:", error);
        return { success: false, message: "Failed to fetch users" };
      }
    }
  );
  electron.ipcMain.handle("users:get-by-id", async (_, id) => {
    try {
      const user = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, id),
        columns: {
          password: false
        }
      });
      if (!user) {
        return { success: false, message: "User not found" };
      }
      return { success: true, data: user };
    } catch (error) {
      console.error("Get user error:", error);
      return { success: false, message: "Failed to fetch user" };
    }
  });
  electron.ipcMain.handle("users:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const existingUsername = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.username, data.username)
      });
      if (existingUsername) {
        return { success: false, message: "Username already exists" };
      }
      const existingEmail = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.email, data.email)
      });
      if (existingEmail) {
        return { success: false, message: "Email already exists" };
      }
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const result = await db2.insert(users).values({
        ...data,
        password: hashedPassword
      }).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
        branchId: users.branchId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
      const newUser = result[0];
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "create",
        entityType: "user",
        entityId: newUser.id,
        newValues: sanitizeForAudit({ ...data, password: "[REDACTED]" }),
        description: `Created user: ${data.username}`
      });
      return { success: true, data: newUser };
    } catch (error) {
      console.error("Create user error:", error);
      return { success: false, message: "Failed to create user" };
    }
  });
  electron.ipcMain.handle("users:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, id)
      });
      if (!existing) {
        return { success: false, message: "User not found" };
      }
      if (data.username && data.username !== existing.username) {
        const duplicate = await db2.query.users.findFirst({
          where: drizzleOrm.eq(users.username, data.username)
        });
        if (duplicate) {
          return { success: false, message: "Username already exists" };
        }
      }
      if (data.email && data.email !== existing.email) {
        const duplicate = await db2.query.users.findFirst({
          where: drizzleOrm.eq(users.email, data.email)
        });
        if (duplicate) {
          return { success: false, message: "Email already exists" };
        }
      }
      const updateData = { ...data };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }
      const result = await db2.update(users).set({ ...updateData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(users.id, id)).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
        branchId: users.branchId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "user",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit({ ...data, password: data.password ? "[CHANGED]" : void 0 }),
        description: `Updated user: ${existing.username}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, message: "Failed to update user" };
    }
  });
  electron.ipcMain.handle("users:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, id)
      });
      if (!existing) {
        return { success: false, message: "User not found" };
      }
      if (session?.userId === id) {
        return { success: false, message: "Cannot deactivate your own account" };
      }
      await db2.update(users).set({ isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(users.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "user",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deactivated user: ${existing.username}`
      });
      return { success: true, message: "User deactivated successfully" };
    } catch (error) {
      console.error("Delete user error:", error);
      return { success: false, message: "Failed to delete user" };
    }
  });
  electron.ipcMain.handle("users:update-permissions", async (_, id, permissions) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, id)
      });
      if (!existing) {
        return { success: false, message: "User not found" };
      }
      await db2.update(users).set({ permissions, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(users.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "user",
        entityId: id,
        oldValues: { permissions: existing.permissions },
        newValues: { permissions },
        description: `Updated permissions for user: ${existing.username}`
      });
      return { success: true, message: "Permissions updated successfully" };
    } catch (error) {
      console.error("Update permissions error:", error);
      return { success: false, message: "Failed to update permissions" };
    }
  });
}
function registerExpenseHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "expenses:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortOrder = "desc", branchId, category, startDate, endDate } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(expenses.branchId, branchId));
        if (category)
          conditions.push(
            drizzleOrm.eq(
              expenses.category,
              category
            )
          );
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(expenses.expenseDate, startDate, endDate));
        } else if (startDate) {
          conditions.push(drizzleOrm.gte(expenses.expenseDate, startDate));
        } else if (endDate) {
          conditions.push(drizzleOrm.lte(expenses.expenseDate, endDate));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(expenses).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.query.expenses.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(expenses.expenseDate) : expenses.expenseDate,
          with: {
            supplier: true,
            payable: true,
            branch: true,
            user: {
              columns: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        });
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get expenses error:", error);
        return { success: false, message: "Failed to fetch expenses" };
      }
    }
  );
  electron.ipcMain.handle("expenses:get-by-id", async (_, id) => {
    try {
      const expense = await db2.query.expenses.findFirst({
        where: drizzleOrm.eq(expenses.id, id),
        with: {
          supplier: true,
          payable: true,
          branch: true,
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      if (!expense) {
        return { success: false, message: "Expense not found" };
      }
      return { success: true, data: expense };
    } catch (error) {
      console.error("Get expense error:", error);
      return { success: false, message: "Failed to fetch expense" };
    }
  });
  electron.ipcMain.handle("expenses:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (data.paymentStatus === "unpaid" && !data.supplierId) {
        return {
          success: false,
          message: "Supplier is required for unpaid expenses"
        };
      }
      if (data.paymentStatus === "unpaid" && !data.dueDate) {
        return {
          success: false,
          message: "Due date is required for unpaid expenses"
        };
      }
      const result = await withTransaction(async ({ db: txDb }) => {
        let payableId = void 0;
        const expenseResult = await txDb.insert(expenses).values({
          ...data,
          userId: session?.userId ?? 0,
          payableId: void 0
          // Will be updated after payable creation
        }).returning();
        const newExpense = expenseResult[0];
        if (data.paymentStatus === "unpaid" && data.supplierId) {
          const invoiceNumber = `EXP-${newExpense.id}-${Date.now()}`;
          const payableResult = await txDb.insert(accountPayables).values({
            supplierId: data.supplierId,
            purchaseId: null,
            branchId: data.branchId,
            invoiceNumber,
            totalAmount: data.amount,
            paidAmount: 0,
            remainingAmount: data.amount,
            status: "pending",
            dueDate: data.dueDate,
            paymentTerms: data.paymentTerms,
            notes: `Auto-created from expense: ${data.category} - ${data.description || "No description"}`,
            createdBy: session?.userId
          }).returning();
          const newPayable = payableResult[0];
          payableId = newPayable.id;
          await txDb.update(expenses).set({ payableId: newPayable.id }).where(drizzleOrm.eq(expenses.id, newExpense.id));
        }
        await postExpenseToGL(
          {
            id: newExpense.id,
            branchId: data.branchId,
            category: data.category,
            amount: data.amount,
            paymentStatus: data.paymentStatus || "paid",
            paymentMethod: data.paymentMethod,
            description: data.description
          },
          session?.userId ?? 0
        );
        return { newExpense, payableId };
      });
      if (result.payableId && data.supplierId) {
        const invoiceNumber = `EXP-${result.newExpense.id}-${Date.now()}`;
        await createAuditLog$1({
          userId: session?.userId,
          branchId: data.branchId,
          action: "create",
          entityType: "account_payable",
          entityId: result.payableId,
          newValues: {
            supplierId: data.supplierId,
            invoiceNumber,
            totalAmount: data.amount,
            source: "expense",
            expenseId: result.newExpense.id
          },
          description: `Auto-created payable from expense #${result.newExpense.id}`
        });
      }
      await createAuditLog$1({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "expense",
        entityId: result.newExpense.id,
        newValues: sanitizeForAudit({
          ...data,
          payableId: result.payableId
        }),
        description: `Created ${data.paymentStatus || "paid"} expense: ${data.category} - $${data.amount}`
      });
      return {
        success: true,
        data: { ...result.newExpense, payableId: result.payableId },
        payableCreated: !!result.payableId
      };
    } catch (error) {
      console.error("Create expense error:", error);
      return { success: false, message: "Failed to create expense" };
    }
  });
  electron.ipcMain.handle("expenses:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.expenses.findFirst({
        where: drizzleOrm.eq(expenses.id, id),
        with: {
          payable: true
        }
      });
      if (!existing) {
        return { success: false, message: "Expense not found" };
      }
      if (data.paymentStatus === "unpaid" && !data.supplierId && !existing.supplierId) {
        return {
          success: false,
          message: "Supplier is required for unpaid expenses"
        };
      }
      if (existing.payableId && data.amount && data.amount !== existing.amount) {
        const payable = await db2.query.accountPayables.findFirst({
          where: drizzleOrm.eq(accountPayables.id, existing.payableId)
        });
        if (payable && payable.paidAmount > 0) {
          return {
            success: false,
            message: "Cannot change amount - payable has existing payments"
          };
        }
        if (payable) {
          await db2.update(accountPayables).set({
            totalAmount: data.amount,
            remainingAmount: data.amount,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(accountPayables.id, existing.payableId));
        }
      }
      if (existing.paymentStatus === "unpaid" && data.paymentStatus === "paid") {
        if (existing.payableId) {
          const payable = await db2.query.accountPayables.findFirst({
            where: drizzleOrm.eq(accountPayables.id, existing.payableId)
          });
          if (payable && payable.status !== "paid") {
            return {
              success: false,
              message: "Cannot mark expense as paid - linked payable is not fully paid"
            };
          }
        }
      }
      if (existing.paymentStatus === "paid" && data.paymentStatus === "unpaid") {
        const supplierIdToUse = data.supplierId || existing.supplierId;
        if (!supplierIdToUse) {
          return {
            success: false,
            message: "Supplier is required to change expense to unpaid"
          };
        }
        if (!data.dueDate && !existing.dueDate) {
          return {
            success: false,
            message: "Due date is required to change expense to unpaid"
          };
        }
        if (!existing.payableId) {
          const invoiceNumber = `EXP-${existing.id}-${Date.now()}`;
          const payableResult = await db2.insert(accountPayables).values({
            supplierId: supplierIdToUse,
            purchaseId: null,
            branchId: existing.branchId,
            invoiceNumber,
            totalAmount: data.amount || existing.amount,
            paidAmount: 0,
            remainingAmount: data.amount || existing.amount,
            status: "pending",
            dueDate: data.dueDate || existing.dueDate,
            paymentTerms: data.paymentTerms || existing.paymentTerms,
            notes: `Created from expense status change: ${existing.category}`,
            createdBy: session?.userId
          }).returning();
          data.payableId = payableResult[0].id;
          await createAuditLog$1({
            userId: session?.userId,
            branchId: existing.branchId,
            action: "create",
            entityType: "account_payable",
            entityId: payableResult[0].id,
            newValues: {
              supplierId: supplierIdToUse,
              invoiceNumber,
              totalAmount: data.amount || existing.amount,
              source: "expense_status_change",
              expenseId: existing.id
            },
            description: `Created payable from expense #${existing.id} status change`
          });
        }
      }
      const result = await db2.update(expenses).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(expenses.id, id)).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: existing.branchId,
        action: "update",
        entityType: "expense",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        newValues: sanitizeForAudit(data),
        description: `Updated expense: ${existing.category}`
      });
      return { success: true, data: result[0] };
    } catch (error) {
      console.error("Update expense error:", error);
      return { success: false, message: "Failed to update expense" };
    }
  });
  electron.ipcMain.handle("expenses:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.expenses.findFirst({
        where: drizzleOrm.eq(expenses.id, id),
        with: {
          payable: true
        }
      });
      if (!existing) {
        return { success: false, message: "Expense not found" };
      }
      if (existing.payableId) {
        const payable = await db2.query.accountPayables.findFirst({
          where: drizzleOrm.eq(accountPayables.id, existing.payableId)
        });
        if (payable && payable.paidAmount > 0) {
          return {
            success: false,
            message: "Cannot delete expense - linked payable has existing payments"
          };
        }
        if (payable && payable.status !== "cancelled") {
          await db2.update(accountPayables).set({
            status: "cancelled",
            notes: `${payable.notes || ""}
Cancelled: Expense deleted`.trim(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(accountPayables.id, existing.payableId));
          await createAuditLog$1({
            userId: session?.userId,
            branchId: existing.branchId,
            action: "update",
            entityType: "account_payable",
            entityId: existing.payableId,
            oldValues: { status: payable.status },
            newValues: { status: "cancelled" },
            description: `Cancelled payable #${existing.payableId} due to expense deletion`
          });
        }
      }
      await db2.delete(expenses).where(drizzleOrm.eq(expenses.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: existing.branchId,
        action: "delete",
        entityType: "expense",
        entityId: id,
        oldValues: sanitizeForAudit(existing),
        description: `Deleted expense: ${existing.category}`
      });
      return { success: true, message: "Expense deleted successfully" };
    } catch (error) {
      console.error("Delete expense error:", error);
      return { success: false, message: "Failed to delete expense" };
    }
  });
  electron.ipcMain.handle("expenses:get-by-category", async (_, branchId, startDate, endDate) => {
    try {
      const conditions = [drizzleOrm.eq(expenses.branchId, branchId)];
      if (startDate && endDate) {
        conditions.push(drizzleOrm.between(expenses.expenseDate, startDate, endDate));
      }
      const data = await db2.select({
        category: expenses.category,
        total: drizzleOrm.sql`sum(${expenses.amount})`,
        count: drizzleOrm.sql`count(*)`
      }).from(expenses).where(drizzleOrm.and(...conditions)).groupBy(expenses.category);
      return { success: true, data };
    } catch (error) {
      console.error("Get expenses by category error:", error);
      return { success: false, message: "Failed to fetch expenses by category" };
    }
  });
}
function registerCommissionHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "commissions:get-all",
    async (_, params) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortOrder = "desc",
          userId,
          referralPersonId,
          branchId,
          status,
          commissionType,
          startDate,
          endDate
        } = params;
        const conditions = [];
        if (userId) conditions.push(drizzleOrm.eq(commissions.userId, userId));
        if (referralPersonId) conditions.push(drizzleOrm.eq(commissions.referralPersonId, referralPersonId));
        if (branchId) conditions.push(drizzleOrm.eq(commissions.branchId, branchId));
        if (status)
          conditions.push(drizzleOrm.eq(commissions.status, status));
        if (commissionType) conditions.push(drizzleOrm.eq(commissions.commissionType, commissionType));
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(commissions.createdAt, startDate, endDate));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(commissions).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.select({
          commission: commissions,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username
          },
          referralPerson: {
            id: referralPersons.id,
            name: referralPersons.name,
            contact: referralPersons.contact
          },
          sale: {
            id: sales.id,
            invoiceNumber: sales.invoiceNumber,
            totalAmount: sales.totalAmount,
            saleDate: sales.saleDate
          }
        }).from(commissions).leftJoin(users, drizzleOrm.eq(commissions.userId, users.id)).leftJoin(referralPersons, drizzleOrm.eq(commissions.referralPersonId, referralPersons.id)).innerJoin(sales, drizzleOrm.eq(commissions.saleId, sales.id)).where(whereClause).limit(limit).offset((page - 1) * limit).orderBy(sortOrder === "desc" ? drizzleOrm.desc(commissions.createdAt) : commissions.createdAt);
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get commissions error:", error);
        return { success: false, message: "Failed to fetch commissions" };
      }
    }
  );
  electron.ipcMain.handle("commissions:get-by-id", async (_, id) => {
    try {
      const [commission] = await db2.select({
        commission: commissions,
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username
        },
        referralPerson: {
          id: referralPersons.id,
          name: referralPersons.name,
          contact: referralPersons.contact
        },
        sale: {
          id: sales.id,
          invoiceNumber: sales.invoiceNumber,
          totalAmount: sales.totalAmount,
          saleDate: sales.saleDate
        }
      }).from(commissions).leftJoin(users, drizzleOrm.eq(commissions.userId, users.id)).leftJoin(referralPersons, drizzleOrm.eq(commissions.referralPersonId, referralPersons.id)).innerJoin(sales, drizzleOrm.eq(commissions.saleId, sales.id)).where(drizzleOrm.eq(commissions.id, id)).limit(1);
      if (!commission) {
        return { success: false, message: "Commission not found" };
      }
      return { success: true, data: commission };
    } catch (error) {
      console.error("Get commission error:", error);
      return { success: false, message: "Failed to fetch commission" };
    }
  });
  electron.ipcMain.handle("commissions:get-available-invoices", async (_, referralPersonId) => {
    try {
      const session = getCurrentSession();
      const branchId = session?.branchId;
      let existingSaleIds = [];
      if (referralPersonId) {
        const existingCommissions = await db2.select({ saleId: commissions.saleId }).from(commissions).where(drizzleOrm.eq(commissions.referralPersonId, referralPersonId));
        existingSaleIds = existingCommissions.map((c) => c.saleId);
      }
      const conditions = [drizzleOrm.eq(sales.status, "completed")];
      if (branchId) conditions.push(drizzleOrm.eq(sales.branchId, branchId));
      if (existingSaleIds.length > 0) {
        conditions.push(drizzleOrm.sql`${sales.id} NOT IN (${drizzleOrm.sql.join(existingSaleIds.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`);
      }
      const data = await db2.select().from(sales).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(sales.saleDate)).limit(100);
      return { success: true, data };
    } catch (error) {
      console.error("Get available invoices error:", error);
      return { success: false, message: "Failed to fetch available invoices" };
    }
  });
  electron.ipcMain.handle(
    "commissions:create",
    async (_, data) => {
      try {
        const session = getCurrentSession();
        if (!data.userId && !data.referralPersonId) {
          return {
            success: false,
            message: "Either user or referral person must be specified"
          };
        }
        const commissionAmount = data.baseAmount * data.rate / 100;
        const [newCommission] = await db2.insert(commissions).values({
          saleId: data.saleId,
          userId: data.userId || null,
          referralPersonId: data.referralPersonId || null,
          branchId: session?.branchId || 1,
          commissionType: data.commissionType,
          baseAmount: data.baseAmount,
          rate: data.rate,
          commissionAmount,
          status: "pending",
          notes: data.notes
        }).returning();
        if (data.referralPersonId) {
          await db2.update(referralPersons).set({
            totalCommissionEarned: drizzleOrm.sql`${referralPersons.totalCommissionEarned} + ${commissionAmount}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(referralPersons.id, data.referralPersonId));
        }
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "create",
          entityType: "commission",
          entityId: newCommission.id,
          newValues: {
            saleId: data.saleId,
            referralPersonId: data.referralPersonId,
            commissionAmount
          },
          description: `Created ${data.commissionType} commission for sale #${data.saleId}`
        });
        return { success: true, data: newCommission };
      } catch (error) {
        console.error("Create commission error:", error);
        return { success: false, message: "Failed to create commission" };
      }
    }
  );
  electron.ipcMain.handle(
    "commissions:update",
    async (_, id, data) => {
      try {
        const session = getCurrentSession();
        const [existing] = await db2.select().from(commissions).where(drizzleOrm.eq(commissions.id, id)).limit(1);
        if (!existing) {
          return { success: false, message: "Commission not found" };
        }
        const updates = {
          ...data,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (data.baseAmount !== void 0 || data.rate !== void 0) {
          const baseAmount = data.baseAmount ?? existing.baseAmount;
          const rate = data.rate ?? existing.rate;
          updates.commissionAmount = baseAmount * rate / 100;
        }
        const [updated] = await db2.update(commissions).set(updates).where(drizzleOrm.eq(commissions.id, id)).returning();
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "update",
          entityType: "commission",
          entityId: id,
          newValues: data,
          oldValues: existing,
          description: `Updated commission #${id}`
        });
        return { success: true, data: updated };
      } catch (error) {
        console.error("Update commission error:", error);
        return { success: false, message: "Failed to update commission" };
      }
    }
  );
  electron.ipcMain.handle("commissions:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const [existing] = await db2.select().from(commissions).where(drizzleOrm.eq(commissions.id, id)).limit(1);
      if (!existing) {
        return { success: false, message: "Commission not found" };
      }
      if (existing.referralPersonId) {
        await db2.update(referralPersons).set({
          totalCommissionEarned: drizzleOrm.sql`MAX(0, ${referralPersons.totalCommissionEarned} - ${existing.commissionAmount})`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(referralPersons.id, existing.referralPersonId));
      }
      await db2.delete(commissions).where(drizzleOrm.eq(commissions.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "commission",
        entityId: id,
        oldValues: existing,
        description: `Deleted commission #${id}`
      });
      return { success: true, message: "Commission deleted successfully" };
    } catch (error) {
      console.error("Delete commission error:", error);
      return { success: false, message: "Failed to delete commission" };
    }
  });
  electron.ipcMain.handle("commissions:approve", async (_, ids) => {
    try {
      const session = getCurrentSession();
      await db2.update(commissions).set({
        status: "approved",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(
        drizzleOrm.and(
          drizzleOrm.eq(commissions.status, "pending"),
          drizzleOrm.sql`${commissions.id} IN (${drizzleOrm.sql.join(ids.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`
        )
      );
      for (const id of ids) {
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "update",
          entityType: "commission",
          entityId: id,
          newValues: { status: "approved" },
          description: `Approved commission #${id}`
        });
      }
      return { success: true, message: `${ids.length} commission(s) approved` };
    } catch (error) {
      console.error("Approve commissions error:", error);
      return { success: false, message: "Failed to approve commissions" };
    }
  });
  electron.ipcMain.handle("commissions:mark-paid", async (_, ids) => {
    try {
      const session = getCurrentSession();
      const commissionRecords = await db2.select().from(commissions).where(
        drizzleOrm.and(
          drizzleOrm.eq(commissions.status, "approved"),
          drizzleOrm.sql`${commissions.id} IN (${drizzleOrm.sql.join(ids.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`
        )
      );
      await db2.update(commissions).set({
        status: "paid",
        paidDate: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(
        drizzleOrm.and(
          drizzleOrm.eq(commissions.status, "approved"),
          drizzleOrm.sql`${commissions.id} IN (${drizzleOrm.sql.join(ids.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`
        )
      );
      for (const commission of commissionRecords) {
        if (commission.referralPersonId) {
          await db2.update(referralPersons).set({
            totalCommissionPaid: drizzleOrm.sql`${referralPersons.totalCommissionPaid} + ${commission.commissionAmount}`,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(referralPersons.id, commission.referralPersonId));
        }
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "update",
          entityType: "commission",
          entityId: commission.id,
          newValues: { status: "paid" },
          description: `Marked commission #${commission.id} as paid`
        });
      }
      return { success: true, message: `${ids.length} commission(s) marked as paid` };
    } catch (error) {
      console.error("Mark paid commissions error:", error);
      return { success: false, message: "Failed to mark commissions as paid" };
    }
  });
  electron.ipcMain.handle("commissions:get-summary", async (_, referralPersonId, startDate, endDate) => {
    try {
      const conditions = [];
      if (referralPersonId) conditions.push(drizzleOrm.eq(commissions.referralPersonId, referralPersonId));
      if (startDate && endDate) conditions.push(drizzleOrm.between(commissions.createdAt, startDate, endDate));
      const data = await db2.select({
        status: commissions.status,
        total: drizzleOrm.sql`sum(${commissions.commissionAmount})`,
        count: drizzleOrm.sql`count(*)`
      }).from(commissions).where(drizzleOrm.and(...conditions)).groupBy(commissions.status);
      return { success: true, data };
    } catch (error) {
      console.error("Get commission summary error:", error);
      return { success: false, message: "Failed to fetch commission summary" };
    }
  });
}
function registerAuditHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "audit:get-logs",
    async (_, params) => {
      try {
        const {
          page = 1,
          limit = 50,
          sortOrder = "desc",
          userId,
          branchId,
          action,
          entityType,
          searchQuery,
          startDate,
          endDate
        } = params;
        const conditions = [];
        if (userId) conditions.push(drizzleOrm.eq(auditLogs.userId, userId));
        if (branchId) conditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        if (action) conditions.push(drizzleOrm.eq(auditLogs.action, action));
        if (entityType) conditions.push(drizzleOrm.eq(auditLogs.entityType, entityType));
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(auditLogs.createdAt, startDate, endDate));
        } else if (startDate) {
          conditions.push(drizzleOrm.gte(auditLogs.createdAt, startDate));
        } else if (endDate) {
          conditions.push(drizzleOrm.lte(auditLogs.createdAt, endDate));
        }
        if (searchQuery) {
          const searchTerm = `%${searchQuery}%`;
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(users.fullName, searchTerm),
              drizzleOrm.like(users.username, searchTerm),
              drizzleOrm.like(auditLogs.action, searchTerm),
              drizzleOrm.like(auditLogs.entityType, searchTerm),
              drizzleOrm.like(auditLogs.description, searchTerm)
            )
          );
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.select({
          auditLog: auditLogs,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username,
            role: users.role
          }
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(whereClause).limit(limit).offset((page - 1) * limit).orderBy(sortOrder === "desc" ? drizzleOrm.desc(auditLogs.createdAt) : auditLogs.createdAt);
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get audit logs error:", error);
        return { success: false, message: "Failed to fetch audit logs" };
      }
    }
  );
  electron.ipcMain.handle(
    "audit:get-stats",
    async (_, params) => {
      try {
        const { branchId, startDate, endDate } = params || {};
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(auditLogs.createdAt, startDate, endDate));
        } else if (startDate) {
          conditions.push(drizzleOrm.gte(auditLogs.createdAt, startDate));
        } else if (endDate) {
          conditions.push(drizzleOrm.lte(auditLogs.createdAt, endDate));
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const totalResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(auditLogs).where(whereClause);
        const totalLogs = totalResult[0].count || 0;
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const todayResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(auditLogs).where(drizzleOrm.eq(auditLogs.createdAt, today));
        const todayLogs = todayResult[0].count || 0;
        const actionStats = await db2.select({
          action: auditLogs.action,
          count: drizzleOrm.sql`count(*)`
        }).from(auditLogs).where(whereClause).groupBy(auditLogs.action).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`));
        const categoryStats = await db2.select({
          entityType: auditLogs.entityType,
          count: drizzleOrm.sql`count(*)`
        }).from(auditLogs).where(whereClause).groupBy(auditLogs.entityType).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`));
        const activeUsers = await db2.select({
          userId: auditLogs.userId,
          fullName: users.fullName,
          username: users.username,
          count: drizzleOrm.sql`count(*)`
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(whereClause).groupBy(auditLogs.userId, users.fullName, users.username).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`)).limit(10);
        const criticalEvents = await db2.select({
          auditLog: auditLogs,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username
          }
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(
          drizzleOrm.and(
            whereClause,
            drizzleOrm.inArray(auditLogs.action, ["delete", "void", "refund"])
          )
        ).orderBy(drizzleOrm.desc(auditLogs.createdAt)).limit(20);
        const sevenDaysAgo = /* @__PURE__ */ new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyActivity = await db2.select({
          date: drizzleOrm.sql`date(${auditLogs.createdAt})`,
          count: drizzleOrm.sql`count(*)`
        }).from(auditLogs).where(drizzleOrm.gte(auditLogs.createdAt, sevenDaysAgo.toISOString())).groupBy(drizzleOrm.sql`date(${auditLogs.createdAt})`).orderBy(drizzleOrm.desc(drizzleOrm.sql`date(${auditLogs.createdAt})`));
        return {
          success: true,
          data: {
            totalLogs,
            todayLogs,
            actionStats,
            categoryStats,
            activeUsers,
            criticalEvents,
            dailyActivity
          }
        };
      } catch (error) {
        console.error("Get audit stats error:", error);
        return { success: false, message: "Failed to fetch audit statistics" };
      }
    }
  );
  electron.ipcMain.handle("audit:get-by-entity", async (_, entityType, entityId) => {
    try {
      const data = await db2.select({
        auditLog: auditLogs,
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          role: users.role
        }
      }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(
        drizzleOrm.and(
          drizzleOrm.eq(auditLogs.entityType, entityType),
          drizzleOrm.eq(auditLogs.entityId, entityId)
        )
      ).orderBy(drizzleOrm.desc(auditLogs.createdAt)).limit(100);
      return { success: true, data };
    } catch (error) {
      console.error("Get entity audit logs error:", error);
      return { success: false, message: "Failed to fetch entity audit logs" };
    }
  });
  electron.ipcMain.handle(
    "audit:export",
    async (_, params) => {
      try {
        const { startDate, endDate, branchId, action, entityType, searchQuery, format = "json" } = params;
        const conditions = [drizzleOrm.between(auditLogs.createdAt, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        if (action) conditions.push(drizzleOrm.eq(auditLogs.action, action));
        if (entityType) conditions.push(drizzleOrm.eq(auditLogs.entityType, entityType));
        if (searchQuery) {
          const searchTerm = `%${searchQuery}%`;
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(users.fullName, searchTerm),
              drizzleOrm.like(users.username, searchTerm),
              drizzleOrm.like(auditLogs.description, searchTerm)
            )
          );
        }
        const data = await db2.select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          branchId: auditLogs.branchId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          description: auditLogs.description,
          oldValues: auditLogs.oldValues,
          newValues: auditLogs.newValues,
          createdAt: auditLogs.createdAt,
          username: users.username,
          userFullName: users.fullName,
          userRole: users.role,
          branchName: branches.name
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).leftJoin(branches, drizzleOrm.eq(auditLogs.branchId, branches.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(auditLogs.createdAt));
        if (format === "csv") {
          const headers = [
            "ID",
            "Date",
            "User",
            "Role",
            "Action",
            "Entity Type",
            "Entity ID",
            "Branch",
            "Description"
          ];
          const rows = data.map((row) => [
            row.id,
            row.createdAt,
            row.userFullName || row.username || "System",
            row.userRole || "",
            row.action,
            row.entityType,
            row.entityId?.toString() || "",
            row.branchName || "",
            row.description?.replace(/,/g, ";") || ""
          ]);
          const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
          return { success: true, data: csvContent, format: "csv" };
        }
        return { success: true, data, format: "json" };
      } catch (error) {
        console.error("Export audit logs error:", error);
        return { success: false, message: "Failed to export audit logs" };
      }
    }
  );
}
function registerSettingsHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("settings:get-all", async () => {
    try {
      const data = await db2.query.settings.findMany();
      const settingsObject = {};
      for (const setting of data) {
        settingsObject[setting.key] = setting.value;
      }
      return { success: true, data: settingsObject, raw: data };
    } catch (error) {
      console.error("Get settings error:", error);
      return { success: false, message: "Failed to fetch settings" };
    }
  });
  electron.ipcMain.handle("settings:get-by-key", async (_, key) => {
    try {
      const setting = await db2.query.settings.findFirst({
        where: drizzleOrm.eq(settings.key, key)
      });
      if (!setting) {
        return { success: false, message: "Setting not found" };
      }
      return { success: true, data: setting.value };
    } catch (error) {
      console.error("Get setting error:", error);
      return { success: false, message: "Failed to fetch setting" };
    }
  });
  electron.ipcMain.handle("settings:get-by-category", async (_, category) => {
    try {
      const data = await db2.query.settings.findMany({
        where: drizzleOrm.eq(
          settings.category,
          category
        )
      });
      const settingsObject = {};
      for (const setting of data) {
        settingsObject[setting.key] = setting.value;
      }
      return { success: true, data: settingsObject, raw: data };
    } catch (error) {
      console.error("Get settings by category error:", error);
      return { success: false, message: "Failed to fetch settings" };
    }
  });
  electron.ipcMain.handle(
    "settings:update",
    async (_, key, value, category, description) => {
      try {
        const session = getCurrentSession();
        const existing = await db2.query.settings.findFirst({
          where: drizzleOrm.eq(settings.key, key)
        });
        if (existing) {
          await db2.update(settings).set({
            value: JSON.stringify(value),
            updatedBy: session?.userId,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(settings.key, key));
          await createAuditLog$1({
            userId: session?.userId,
            branchId: session?.branchId,
            action: "update",
            entityType: "setting",
            entityId: existing.id,
            oldValues: { key, value: existing.value },
            newValues: { key, value },
            description: `Updated setting: ${key}`
          });
        } else {
          const [newSetting] = await db2.insert(settings).values({
            key,
            value: JSON.stringify(value),
            category: category ?? "general",
            description,
            updatedBy: session?.userId
          }).returning();
          await createAuditLog$1({
            userId: session?.userId,
            branchId: session?.branchId,
            action: "create",
            entityType: "setting",
            entityId: newSetting.id,
            newValues: { key, value },
            description: `Created setting: ${key}`
          });
        }
        return { success: true, message: "Setting updated successfully" };
      } catch (error) {
        console.error("Update setting error:", error);
        return { success: false, message: "Failed to update setting" };
      }
    }
  );
  electron.ipcMain.handle("settings:update-bulk", async (_, updates) => {
    try {
      const session = getCurrentSession();
      for (const { key, value } of updates) {
        const existing = await db2.query.settings.findFirst({
          where: drizzleOrm.eq(settings.key, key)
        });
        if (existing) {
          await db2.update(settings).set({
            value: JSON.stringify(value),
            updatedBy: session?.userId,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(settings.key, key));
        }
      }
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "update",
        entityType: "setting",
        newValues: { updatedKeys: updates.map((u) => u.key) },
        description: `Bulk updated ${updates.length} settings`
      });
      return { success: true, message: "Settings updated successfully" };
    } catch (error) {
      console.error("Bulk update settings error:", error);
      return { success: false, message: "Failed to update settings" };
    }
  });
}
async function verifyAdmin(userId) {
  try {
    const db2 = getDatabase();
    const user = await db2.query.users.findFirst({
      where: drizzleOrm.eq(users.id, userId)
    });
    const isAdmin = user?.role?.toLowerCase() === "admin";
    console.log("[verifyAdmin] User:", userId, "Role:", user?.role, "IsAdmin:", isAdmin);
    return isAdmin;
  } catch (err) {
    console.error("[verifyAdmin] Error:", err);
    return false;
  }
}
function getSession() {
  const session = getCurrentSession();
  if (!session) return null;
  return {
    userId: session.userId,
    username: session.username,
    role: session.role,
    branchId: session.branchId
  };
}
function registerBusinessSettingsHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("business-settings:get-global", async () => {
    try {
      const result = await db2.query.businessSettings.findFirst({
        where: drizzleOrm.isNull(businessSettings.branchId),
        orderBy: [drizzleOrm.desc(businessSettings.settingId)]
      });
      console.log("[get-global] Result:", result ? `found - ${result.businessName}` : "not found");
      if (!result) {
        const defaultSettings = {
          branchId: null,
          businessName: "Firearms Retail POS",
          businessAddress: "",
          businessCity: "",
          businessState: "",
          businessCountry: "Pakistan",
          businessPostalCode: "",
          businessPhone: "",
          businessEmail: "",
          businessWebsite: "",
          taxRate: 0,
          taxName: "GST",
          isTaxInclusive: false,
          secondaryTaxRate: 0,
          currencySymbol: "Rs.",
          currencyCode: "PKR",
          currencyPosition: "prefix",
          decimalPlaces: 2,
          thousandSeparator: ",",
          decimalSeparator: ".",
          invoicePrefix: "INV",
          invoiceNumberFormat: "sequential",
          invoiceStartingNumber: 1,
          showTaxOnReceipt: true,
          showQRCodeOnReceipt: false,
          lowStockThreshold: 10,
          enableStockTracking: true,
          allowNegativeStock: false,
          stockValuationMethod: "FIFO",
          autoReorderEnabled: false,
          autoReorderQuantity: 50,
          defaultPaymentMethod: "Cash",
          allowedPaymentMethods: "Cash,Card,Bank Transfer,COD",
          enableCashDrawer: true,
          openingCashBalance: 0,
          enableDiscounts: true,
          maxDiscountPercentage: 50,
          requireCustomerForSale: false,
          enableCustomerLoyalty: false,
          loyaltyPointsRatio: 1,
          expenseCategories: "Utilities,Rent,Salaries,Supplies,Maintenance,Other",
          expenseApprovalRequired: false,
          expenseApprovalLimit: 1e4,
          enableReturns: true,
          returnWindowDays: 30,
          requireReceiptForReturn: true,
          refundMethod: "Original Payment Method",
          enableEmailNotifications: false,
          lowStockNotifications: true,
          dailySalesReport: false,
          workingDaysStart: "Monday",
          workingDaysEnd: "Saturday",
          openingTime: "09:00",
          closingTime: "18:00",
          autoBackupEnabled: true,
          autoBackupFrequency: "daily",
          backupRetentionDays: 30,
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24-hour",
          language: "en",
          timezone: "UTC",
          sessionTimeoutMinutes: 60,
          requirePasswordChange: false,
          passwordChangeIntervalDays: 90,
          enableAuditLogs: true,
          isActive: true,
          isDefault: true
        };
        const [inserted] = await db2.insert(businessSettings).values(defaultSettings).returning();
        console.log("[get-global] Created default settings:", inserted.businessName);
        return inserted;
      }
      return result;
    } catch (err) {
      console.error("Error fetching global settings:", err);
      throw err;
    }
  });
  electron.ipcMain.handle("business-settings:get-by-branch", async (_, branchId) => {
    try {
      const branchSettings = await db2.query.businessSettings.findFirst({
        where: drizzleOrm.eq(businessSettings.branchId, branchId)
      });
      if (branchSettings) {
        return branchSettings;
      }
      const globalSettings = await db2.query.businessSettings.findFirst({
        where: drizzleOrm.isNull(businessSettings.branchId),
        orderBy: [drizzleOrm.desc(businessSettings.settingId)]
      });
      return globalSettings;
    } catch (err) {
      console.error("Error fetching branch settings:", err);
      throw err;
    }
  });
  electron.ipcMain.handle("business-settings:get-all", async (_, userId) => {
    try {
      console.log("[get-all] Requested by user:", userId);
      const isAdmin = await verifyAdmin(userId);
      console.log("[get-all] Is admin:", isAdmin);
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      const allSettings = await db2.query.businessSettings.findMany({
        orderBy: [drizzleOrm.desc(businessSettings.settingId)]
      });
      console.log("[get-all] Settings count:", allSettings.length);
      const branchesData = await db2.query.branches.findMany({
        where: drizzleOrm.eq(branches.isActive, true)
      });
      const result = allSettings.map((setting) => ({
        ...setting,
        branch: setting.branchId ? branchesData.find((b) => b.id === setting.branchId) : null
      }));
      console.log("[get-all] Result:", result.length, "settings");
      return result;
    } catch (err) {
      console.error("Error fetching all settings:", err);
      throw err;
    }
  });
  electron.ipcMain.handle(
    "business-settings:create",
    async (_, { userId, settingsData }) => {
      try {
        const isAdmin = await verifyAdmin(userId);
        if (!isAdmin) {
          throw new Error("Unauthorized: Admin access required");
        }
        const session = getSession();
        const [result] = await db2.insert(businessSettings).values({
          ...settingsData,
          createdBy: userId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        await createAuditLog$1({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: "create",
          entityType: "business_settings",
          entityId: result.settingId,
          newValues: {
            businessName: settingsData.businessName,
            branchId: settingsData.branchId
          },
          description: `Created business settings for ${settingsData.branchId ? `Branch ID: ${settingsData.branchId}` : "Global"}`
        });
        return result;
      } catch (err) {
        console.error("Error creating business settings:", err);
        throw err;
      }
    }
  );
  electron.ipcMain.handle(
    "business-settings:update",
    async (_, { userId, settingId, settingsData }) => {
      try {
        const isAdmin = await verifyAdmin(userId);
        if (!isAdmin) {
          throw new Error("Unauthorized: Admin access required");
        }
        const session = getSession();
        const oldSetting = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.eq(businessSettings.settingId, settingId)
        });
        const [result] = await db2.update(businessSettings).set({
          ...settingsData,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(businessSettings.settingId, settingId)).returning();
        await createAuditLog$1({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: "update",
          entityType: "business_settings",
          entityId: settingId,
          oldValues: oldSetting ? { businessName: oldSetting.businessName } : null,
          newValues: { businessName: result.businessName },
          description: `Updated business settings for ${result.branchId ? `Branch ID: ${result.branchId}` : "Global"}`
        });
        return result;
      } catch (err) {
        console.error("Error updating business settings:", err);
        throw err;
      }
    }
  );
  electron.ipcMain.handle("business-settings:delete", async (_, { userId, settingId }) => {
    try {
      const isAdmin = await verifyAdmin(userId);
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      const session = getSession();
      const setting = await db2.query.businessSettings.findFirst({
        where: drizzleOrm.eq(businessSettings.settingId, settingId)
      });
      if (!setting?.branchId) {
        throw new Error("Cannot delete global settings");
      }
      const [result] = await db2.delete(businessSettings).where(drizzleOrm.eq(businessSettings.settingId, settingId)).returning();
      await createAuditLog$1({
        userId: session?.userId ?? userId,
        branchId: session?.branchId ?? null,
        action: "delete",
        entityType: "business_settings",
        entityId: settingId,
        oldValues: { businessName: setting?.businessName, branchId: setting?.branchId },
        description: `Deleted business settings for Branch ID: ${setting?.branchId}`
      });
      return result;
    } catch (err) {
      console.error("Error deleting business settings:", err);
      throw err;
    }
  });
  electron.ipcMain.handle(
    "business-settings:clone",
    async (_, { userId, sourceBranchId, targetBranchId }) => {
      try {
        const isAdmin = await verifyAdmin(userId);
        if (!isAdmin) {
          throw new Error("Unauthorized: Admin access required");
        }
        const session = getSession();
        const sourceSettings = await db2.query.businessSettings.findFirst({
          where: sourceBranchId ? drizzleOrm.eq(businessSettings.branchId, sourceBranchId) : drizzleOrm.isNull(businessSettings.branchId),
          orderBy: [drizzleOrm.desc(businessSettings.settingId)]
        });
        if (!sourceSettings) {
          throw new Error("Source settings not found");
        }
        const existingTarget = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.eq(businessSettings.branchId, targetBranchId)
        });
        if (existingTarget) {
          throw new Error("Target branch already has settings. Delete them first or update instead.");
        }
        const { settingId, branchId: sbId, createdBy, createdAt, updatedAt, ...clonedData } = sourceSettings;
        const [result] = await db2.insert(businessSettings).values({
          ...clonedData,
          branchId: targetBranchId,
          createdBy: userId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        await createAuditLog$1({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: "create",
          entityType: "business_settings",
          entityId: result.settingId,
          newValues: {
            businessName: result.businessName,
            sourceBranchId,
            targetBranchId
          },
          description: `Cloned settings from ${sourceBranchId ? `Branch ${sourceBranchId}` : "Global"} to Branch ${targetBranchId}`
        });
        return result;
      } catch (err) {
        console.error("Error cloning business settings:", err);
        throw err;
      }
    }
  );
  electron.ipcMain.handle("business-settings:export", async (_, userId) => {
    try {
      const isAdmin = await verifyAdmin(userId);
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      const allSettings = await db2.query.businessSettings.findMany({
        orderBy: [drizzleOrm.desc(businessSettings.settingId)]
      });
      return {
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        version: "1.0",
        settings: allSettings
      };
    } catch (err) {
      console.error("Error exporting settings:", err);
      throw err;
    }
  });
  electron.ipcMain.handle("business-settings:import", async (_, { userId, data }) => {
    try {
      const isAdmin = await verifyAdmin(userId);
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      const session = getSession();
      const importData = data;
      if (!importData.settings || !Array.isArray(importData.settings)) {
        throw new Error("Invalid import data format");
      }
      const results = [];
      for (const setting of importData.settings) {
        const { settingId, ...cleanData } = setting;
        const [result] = await db2.insert(businessSettings).values({
          ...cleanData,
          createdBy: userId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        results.push(result);
      }
      await createAuditLog$1({
        userId: session?.userId ?? userId,
        branchId: session?.branchId ?? null,
        action: "create",
        entityType: "business_settings",
        newValues: { importedCount: results.length },
        description: `Imported ${results.length} business settings`
      });
      return results;
    } catch (err) {
      console.error("Error importing settings:", err);
      throw err;
    }
  });
}
function getDateRange(period, customStart, customEnd) {
  const now = /* @__PURE__ */ new Date();
  switch (period) {
    case "daily":
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      };
    case "weekly":
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString()
      };
    case "monthly":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      };
    case "yearly":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      return {
        start: startOfYear.toISOString(),
        end: endOfYear.toISOString()
      };
    case "all-time":
      return {
        start: (/* @__PURE__ */ new Date("2000-01-01")).toISOString(),
        end: now.toISOString()
      };
    case "custom":
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires start and end dates");
      }
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return {
        start: start.toISOString(),
        end: end.toISOString()
      };
    default:
      throw new Error(`Unknown time period: ${period}`);
  }
}
function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatDateTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getPeriodLabel(period, startDate, endDate) {
  switch (period) {
    case "daily":
      return formatDate(/* @__PURE__ */ new Date());
    case "weekly":
      return "This Week";
    case "monthly":
      return (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "yearly":
      return (/* @__PURE__ */ new Date()).getFullYear().toString();
    case "all-time":
      return "All Time";
    case "custom":
      if (startDate && endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
      return "Custom Range";
    default:
      return "Unknown Period";
  }
}
async function generateReportPDF(options) {
  const { reportType, data, filters, businessInfo } = options;
  let htmlContent = "";
  switch (reportType) {
    case "sales":
      htmlContent = generateSalesReportHTML(data, filters, businessInfo);
      break;
    case "inventory":
      htmlContent = generateInventoryReportHTML(data, filters, businessInfo);
      break;
    case "profit-loss":
      htmlContent = generateProfitLossReportHTML(data, filters, businessInfo);
      break;
    case "expenses":
      htmlContent = generateExpenseReportHTML(data, filters, businessInfo);
      break;
    case "purchases":
      htmlContent = generatePurchaseReportHTML(data, filters, businessInfo);
      break;
    case "returns":
      htmlContent = generateReturnReportHTML(data, filters, businessInfo);
      break;
    case "commissions":
      htmlContent = generateCommissionReportHTML(data, filters, businessInfo);
      break;
    case "tax":
      htmlContent = generateTaxReportHTML(data, filters, businessInfo);
      break;
    case "customer":
      htmlContent = generateCustomerReportHTML(data, filters, businessInfo);
      break;
    case "branch-performance":
      htmlContent = generateBranchPerformanceHTML(data, filters, businessInfo);
      break;
    case "cash-flow":
      htmlContent = generateCashFlowHTML(data, filters, businessInfo);
      break;
    case "audit-trail":
      htmlContent = generateAuditTrailHTML(data, filters, businessInfo);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
  const pdfWindow = new electron.BrowserWindow({
    show: false,
    width: 800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      offscreen: true
    }
  });
  await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const pdfData = await pdfWindow.webContents.printToPDF({
    pageSize: "A4",
    printBackground: true,
    landscape: false,
    margins: {
      top: 0.4,
      bottom: 0.4,
      left: 0.4,
      right: 0.4
    }
  });
  const downloadsPath = electron.app.getPath("downloads");
  const fileName = `${reportType}_report_${Date.now()}.pdf`;
  const filePath = path__namespace.join(downloadsPath, fileName);
  fs__namespace.writeFileSync(filePath, pdfData);
  pdfWindow.close();
  return filePath;
}
function getReportTemplate(title, content, filters, businessInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
          size: A4;
          margin: 15mm;
        }

        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 30px 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
        }

        .business-name {
          font-size: 28px;
          font-weight: bold;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 12px;
        }

        .report-title {
          font-size: 14px;
          color: #555;
          margin: 8px 0;
        }

        .report-date {
          font-size: 13px;
          color: #666;
          margin-top: 5px;
        }

        /* Separator Lines */
        .line {
          border-top: 1px solid #ddd;
          margin: 15px 0;
        }

        .dashed-line {
          border-top: 1px dashed #ccc;
          margin: 15px 0;
        }

        .double-line {
          border-top: 2px solid #333;
          margin: 20px 0;
        }

        /* Info Row */
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 6px 0;
        }

        .info-row span:first-child {
          color: #e67e22;
          font-weight: 500;
        }

        .info-row span:last-child {
          color: #2980b9;
          font-weight: 600;
        }

        /* Table Header */
        .table-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 10px 0;
          border-bottom: 2px solid #333;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .col-qty { width: 60px; }
        .col-item { flex: 1; padding: 0 15px; }
        .col-total { width: 120px; text-align: right; }

        /* Table Row */
        .table-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row .col-qty { color: #e74c3c; font-weight: 500; }
        .table-row .col-item { color: #2980b9; }
        .table-row .col-total { font-weight: 600; color: #27ae60; }

        /* Summary Section */
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 6px 0;
        }

        .summary-row.subtotal {
          padding-top: 10px;
          border-top: 1px dashed #ccc;
        }

        .summary-row.total {
          font-size: 14px;
          font-weight: bold;
          padding: 10px 0;
          border-top: 1px solid #333;
        }

        .summary-row.grand-total {
          font-size: 18px;
          font-weight: bold;
          padding: 15px 0;
          margin-top: 10px;
          border-top: 2px solid #333;
          background: #f8f9fa;
          padding-left: 10px;
          padding-right: 10px;
        }

        /* Section */
        .section {
          margin: 20px 0;
        }

        .section-title {
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          padding: 10px 15px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          border-left: 4px solid #3498db;
          color: #2c3e50;
        }

        /* Footer */
        .footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #333;
        }

        .thank-you {
          font-size: 12px;
          font-style: italic;
          color: #7f8c8d;
          margin: 12px 0;
        }

        .footer-message {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 12px 0;
          color: #2c3e50;
        }

        .footer-date {
          font-size: 11px;
          color: #95a5a6;
          margin-top: 12px;
        }

        /* Utility */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .small { font-size: 11px; }
        .muted { color: #95a5a6; }

        /* Data List */
        .data-list {
          margin: 12px 0;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 12px;
        }

        .data-item:last-child {
          border-bottom: none;
        }

        .data-item .label { color: #e67e22; font-weight: 500; }
        .data-item .value { font-weight: 600; color: #2980b9; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${businessInfo?.name || "STORE"}</div>
        <div class="report-title">${title}</div>
        <div class="report-date">${getPeriodLabel(filters.timePeriod, filters.startDate, filters.endDate)}</div>
      </div>

      <div class="line"></div>

      <div class="info-row">
        <span>Branch:</span>
        <span>${filters.branchName || "All Branches"}</span>
      </div>
      <div class="info-row">
        <span>Generated:</span>
        <span>${formatDateTime(/* @__PURE__ */ new Date())}</span>
      </div>

      <div class="line"></div>

      ${content}

      <div class="double-line"></div>

      <div class="footer">
        <div class="thank-you">Thank you for your business!</div>
        <div class="footer-message">THANK YOU - COME AGAIN!</div>
        <div class="footer-date">${formatDateTime(/* @__PURE__ */ new Date())}</div>
      </div>
    </body>
    </html>
  `;
}
function generateSalesReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Sales Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Transactions:</span>
          <span class="value">${data.summary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Order:</span>
          <span class="value">Rs. ${(data.summary?.avgOrderValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Tax Collected:</span>
          <span class="value">Rs. ${(data.summary?.totalTax || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL REVENUE:</span>
        <span>Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Payment Method</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.byPaymentMethod?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Selling Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Revenue</span>
      </div>
      ${data.topProducts?.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantitySold}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.revenue.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>
  `;
  return getReportTemplate("Sales Report", content, filters, businessInfo);
}
function generateInventoryReportHTML(data, filters, businessInfo) {
  const totalValue = data.stockValue?.reduce((sum, item) => sum + item.costValue, 0) || 0;
  const content = `
    <div class="section">
      <div class="section-title">Inventory Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Low Stock Items:</span>
          <span class="value">${data.stockSummary?.[0]?.lowStockItems || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Out of Stock:</span>
          <span class="value">${data.stockSummary?.[0]?.outOfStockItems || 0}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>STOCK VALUE:</span>
        <span>Rs. ${totalValue.toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Stock by Branch</div>
      <div class="table-header">
        <span class="col-qty">Units</span>
        <span class="col-item">Branch</span>
        <span class="col-total">Low Stock</span>
      </div>
      ${data.stockSummary?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalUnits}</span>
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">${item.lowStockItems}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    ${data.lowStock && data.lowStock.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">** LOW STOCK ALERT **</div>
      <div class="table-header">
        <span class="col-qty">Qty</span>
        <span class="col-item">Product</span>
        <span class="col-total">Status</span>
      </div>
      ${data.lowStock.slice(0, 15).map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantity}/${item.minQuantity}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">${item.quantity === 0 ? "OUT!" : "LOW"}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Inventory Report", content, filters, businessInfo);
}
function generateProfitLossReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Financial Statement</div>

      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Revenue:</span>
          <span class="value">Rs. ${(data.revenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Cost of Goods Sold:</span>
          <span class="value">- Rs. ${(data.costOfGoodsSold || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <div class="summary-row subtotal">
        <span>Gross Profit:</span>
        <span>Rs. ${(data.grossProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label small">Gross Margin:</span>
        <span class="value">${(data.grossMargin || 0).toFixed(1)}%</span>
      </div>

      <div class="dashed-line"></div>

      <div class="data-item">
        <span class="label">Operating Expenses:</span>
        <span class="value">- Rs. ${(data.expenses || 0).toFixed(2)}</span>
      </div>

      <div class="line"></div>

      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.netProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label small">Net Margin:</span>
        <span class="value">${(data.netMargin || 0).toFixed(1)}%</span>
      </div>
    </div>

    ${data.expensesByCategory && data.expensesByCategory.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Expenses by Category</div>
      <div class="table-header">
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.expensesByCategory.map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.category}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Profit & Loss", content, filters, businessInfo);
}
function generateExpenseReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Expense Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Count:</span>
          <span class="value">${data.summary?.expenseCount || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Expense:</span>
          <span class="value">Rs. ${(data.summary?.avgExpense || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL EXPENSES:</span>
        <span>Rs. ${(data.summary?.totalExpenses || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Category</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.expensesByCategory?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.category}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    ${data.topExpenses && data.topExpenses.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Expenses</div>
      <div class="table-header">
        <span class="col-item">Description</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.topExpenses.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.category}${item.description ? " - " + item.description.substring(0, 15) : ""}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:35px;">${formatDate(item.date)}</div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Expense Report", content, filters, businessInfo);
}
function generatePurchaseReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Purchase Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Orders:</span>
          <span class="value">${data.summary?.totalPurchases || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Order:</span>
          <span class="value">Rs. ${(data.summary?.avgPurchaseValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Pending Payment:</span>
          <span class="value">Rs. ${(data.summary?.pendingPayments || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL COST:</span>
        <span>Rs. ${(data.summary?.totalCost || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Supplier</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Supplier</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.purchasesBySupplier?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalPurchases}</span>
          <span class="col-item">${item.supplierName}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Status</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Status</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.purchasesByStatus?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.status}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    ${data.recentPurchases && data.recentPurchases.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Orders</div>
      <div class="table-header">
        <span class="col-item">PO Number</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.recentPurchases.slice(0, 8).map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.purchaseOrderNumber}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:35px;">${item.supplierName} | ${formatDate(item.createdAt)}</div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Purchase Report", content, filters, businessInfo);
}
function generateReturnReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Returns Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Returns:</span>
          <span class="value">${data.summary?.totalReturns || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Return Rate:</span>
          <span class="value">${(data.summary?.returnRate || 0).toFixed(1)}%</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>REFUND VALUE:</span>
        <span>Rs. ${(data.summary?.totalValue || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Reason</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Reason</span>
        <span class="col-total">Value</span>
      </div>
      ${data.returnsByReason?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.reason}</span>
          <span class="col-total">Rs. ${item.value.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    ${data.returnsByProduct && data.returnsByProduct.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Most Returned Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Value</span>
      </div>
      ${data.returnsByProduct.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.returnCount}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.totalValue.toFixed(2)}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Returns Report", content, filters, businessInfo);
}
function generateCommissionReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Commission Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Count:</span>
          <span class="value">${data.summary?.commissionCount || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average:</span>
          <span class="value">Rs. ${(data.summary?.avgCommission || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL PAID:</span>
        <span>Rs. ${(data.summary?.totalCommissions || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Salesperson</div>
      <div class="table-header">
        <span class="col-qty">Sales</span>
        <span class="col-item">Name</span>
        <span class="col-total">Commission</span>
      </div>
      ${data.commissionsBySalesperson?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.salesCount}</span>
          <span class="col-item">${item.userName}</span>
          <span class="col-total">Rs. ${item.totalCommission.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    ${data.recentCommissions && data.recentCommissions.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Commissions</div>
      <div class="table-header">
        <span class="col-item">Salesperson</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.recentCommissions.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.userName}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:35px;">${formatDate(item.date)} | ${item.saleInvoice}</div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Commission Report", content, filters, businessInfo);
}
function generateTaxReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Tax Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Taxable Sales:</span>
          <span class="value">Rs. ${(data.summary?.taxableSales || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Avg Tax per Sale:</span>
          <span class="value">Rs. ${(data.summary?.avgTaxPerSale || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TAX COLLECTED:</span>
        <span>Rs. ${(data.summary?.totalTaxCollected || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Branch</div>
      <div class="table-header">
        <span class="col-item">Branch</span>
        <span class="col-total">Tax</span>
      </div>
      ${data.taxByBranch?.map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">Rs. ${item.taxCollected.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Payment Method</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Tax</span>
      </div>
      ${data.taxByPaymentMethod?.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.salesCount}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.taxCollected.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>
  `;
  return getReportTemplate("Tax Report", content, filters, businessInfo);
}
function generateCustomerReportHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Customer Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Customers:</span>
          <span class="value">${data.summary?.totalCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Active:</span>
          <span class="value">${data.summary?.activeCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">New This Period:</span>
          <span class="value">${data.summary?.newCustomers || 0}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL REVENUE:</span>
        <span>Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
      </div>
    </div>

    ${data.customerRetention ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Retention Stats</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Repeat Customers:</span>
          <span class="value">${data.customerRetention.repeatCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">One-time Buyers:</span>
          <span class="value">${data.customerRetention.oneTimeCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Retention Rate:</span>
          <span class="value">${(data.customerRetention.repeatRate || 0).toFixed(1)}%</span>
        </div>
      </div>
    </div>
    ` : ""}

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Customers</div>
      <div class="table-header">
        <span class="col-qty">Orders</span>
        <span class="col-item">Customer</span>
        <span class="col-total">Spent</span>
      </div>
      ${data.topCustomers?.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalOrders}</span>
          <span class="col-item">${item.customerName}</span>
          <span class="col-total">Rs. ${item.totalSpent.toFixed(2)}</span>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>
  `;
  return getReportTemplate("Customer Report", content, filters, businessInfo);
}
function generateBranchPerformanceHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Performance Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Branches:</span>
          <span class="value">${data.summary?.totalBranches || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Total Revenue:</span>
          <span class="value">Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
        </div>
        ${data.topPerformingBranch ? `
        <div class="data-item">
          <span class="label">Top Branch:</span>
          <span class="value">${data.topPerformingBranch.branchName}</span>
        </div>
        ` : ""}
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL PROFIT:</span>
        <span>Rs. ${(data.summary?.totalProfit || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Branch Rankings</div>
      ${data.branchMetrics?.sort((a, b) => b.revenue - a.revenue).map(
    (item, index2) => `
        <div style="margin-bottom:3mm;padding-bottom:2mm;border-bottom:1px dotted #ddd;">
          <div class="table-row" style="padding:0;">
            <span class="col-qty bold">#${index2 + 1}</span>
            <span class="col-item bold">${item.branchName}</span>
          </div>
          <div class="data-list" style="padding-left:35px;margin-top:1mm;">
            <div class="data-item">
              <span class="label">Sales:</span>
              <span class="value">${item.salesCount}</span>
            </div>
            <div class="data-item">
              <span class="label">Revenue:</span>
              <span class="value">Rs. ${item.revenue.toFixed(2)}</span>
            </div>
            <div class="data-item">
              <span class="label">Expenses:</span>
              <span class="value">Rs. ${item.expenses.toFixed(2)}</span>
            </div>
            <div class="data-item">
              <span class="label">Profit:</span>
              <span class="value bold">Rs. ${item.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `
  ).join("") || '<div class="text-center muted">No data available</div>'}
    </div>
  `;
  return getReportTemplate("Branch Performance", content, filters, businessInfo);
}
function generateCashFlowHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Cash Flow Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Opening Balance:</span>
          <span class="value">Rs. ${(data.summary?.openingBalance || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(+) Cash In:</span>
          <span class="value">Rs. ${(data.summary?.cashIn || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Cash Out:</span>
          <span class="value">Rs. ${(data.summary?.cashOut || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="summary-row grand-total">
        <span>CLOSING BALANCE:</span>
        <span>Rs. ${(data.summary?.closingBalance || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label">Net Cash Flow:</span>
        <span class="value">${(data.summary?.netCashFlow || 0) >= 0 ? "+" : ""}Rs. ${(data.summary?.netCashFlow || 0).toFixed(2)}</span>
      </div>
    </div>

    ${data.cashInBreakdown ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash Inflow</div>
      <div class="table-header">
        <span class="col-item">Source</span>
        <span class="col-total">Amount</span>
      </div>
      <div class="table-row">
        <span class="col-item">Sales Revenue</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.sales || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Receivables</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.receivables || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Other Income</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.other || 0).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total Cash In:</span>
        <span>Rs. ${(data.summary?.cashIn || 0).toFixed(2)}</span>
      </div>
    </div>
    ` : ""}

    ${data.cashOutBreakdown ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash Outflow</div>
      <div class="table-header">
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      <div class="table-row">
        <span class="col-item">Purchases</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.purchases || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Expenses</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.expenses || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Commissions</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.commissions || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Refunds</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.refunds || 0).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total Cash Out:</span>
        <span>Rs. ${(data.summary?.cashOut || 0).toFixed(2)}</span>
      </div>
    </div>
    ` : ""}

    ${data.cashByBranch && data.cashByBranch.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash by Branch</div>
      <div class="table-header">
        <span class="col-item">Branch</span>
        <span class="col-total">Cash in Hand</span>
      </div>
      ${data.cashByBranch.map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">Rs. ${item.cashInHand.toFixed(2)}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Cash Flow Report", content, filters, businessInfo);
}
function generateAuditTrailHTML(data, filters, businessInfo) {
  const content = `
    <div class="section">
      <div class="section-title">Business Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Sales:</span>
          <span class="value">${data.salesSummary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Revenue:</span>
          <span class="value">Rs. ${(data.salesSummary?.totalRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Expenses:</span>
          <span class="value">Rs. ${(data.expensesSummary?.totalExpenses || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Inventory Value:</span>
          <span class="value">Rs. ${(data.inventorySummary?.totalValue || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.financialSummary?.netProfit || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Sales Details</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Transactions:</span>
          <span class="value">${data.salesSummary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Avg Order Value:</span>
          <span class="value">Rs. ${(data.salesSummary?.avgOrderValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Tax Collected:</span>
          <span class="value">Rs. ${(data.salesSummary?.totalTax || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    ${data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Sales by Payment</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.salesByPaymentMethod.map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}

    ${data.topProducts && data.topProducts.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Revenue</span>
      </div>
      ${data.topProducts.slice(0, 5).map(
    (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantitySold}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.revenue.toFixed(2)}</span>
        </div>
      `
  ).join("")}
    </div>
    ` : ""}

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Inventory Status</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Products:</span>
          <span class="value">${data.inventorySummary?.totalProducts || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Low Stock Items:</span>
          <span class="value">${data.inventorySummary?.lowStockItems || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Out of Stock:</span>
          <span class="value">${data.inventorySummary?.outOfStockItems || 0}</span>
        </div>
      </div>
    </div>

    ${data.financialSummary ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">P&L Statement</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Gross Revenue:</span>
          <span class="value">Rs. ${(data.financialSummary.grossRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Refunds:</span>
          <span class="value">Rs. ${(data.financialSummary.refunds || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Net Revenue:</span>
          <span class="value">Rs. ${(data.financialSummary.netRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) COGS:</span>
          <span class="value">Rs. ${(data.financialSummary.cogs || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Gross Profit:</span>
          <span class="value">Rs. ${(data.financialSummary.grossProfit || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Expenses:</span>
          <span class="value">Rs. ${(data.financialSummary.expenses || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.financialSummary.netProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label">Profit Margin:</span>
        <span class="value">${(data.financialSummary.profitMargin || 0).toFixed(1)}%</span>
      </div>
    </div>
    ` : ""}

    ${data.auditLogs && data.auditLogs.length > 0 ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Activity</div>
      <div class="table-header">
        <span class="col-item">Action</span>
        <span class="col-total">User</span>
      </div>
      ${data.auditLogs.slice(0, 10).map(
    (item) => `
        <div class="table-row">
          <span class="col-item">${item.action} ${item.tableName}</span>
          <span class="col-total">${item.userName}</span>
        </div>
        <div class="small muted" style="padding-left:35px;">${formatDateTime(item.timestamp)}</div>
      `
  ).join("")}
    </div>
    ` : ""}
  `;
  return getReportTemplate("Audit Report", content, filters, businessInfo);
}
function registerReportHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "reports:sales-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate, groupBy = "day" } = params;
        const conditions = [
          drizzleOrm.between(sales.saleDate, startDate, endDate),
          drizzleOrm.eq(sales.isVoided, false)
        ];
        if (branchId) conditions.push(drizzleOrm.eq(sales.branchId, branchId));
        const summary = await db2.select({
          totalSales: drizzleOrm.sql`count(*)`,
          totalRevenue: drizzleOrm.sql`sum(${sales.totalAmount})`,
          totalTax: drizzleOrm.sql`sum(${sales.taxAmount})`,
          totalDiscount: drizzleOrm.sql`sum(${sales.discountAmount})`,
          avgOrderValue: drizzleOrm.sql`avg(${sales.totalAmount})`
        }).from(sales).where(drizzleOrm.and(...conditions));
        const byPaymentMethod = await db2.select({
          paymentMethod: sales.paymentMethod,
          count: drizzleOrm.sql`count(*)`,
          total: drizzleOrm.sql`sum(${sales.totalAmount})`
        }).from(sales).where(drizzleOrm.and(...conditions)).groupBy(sales.paymentMethod);
        const topProducts = await db2.select({
          productId: saleItems.productId,
          productName: products.name,
          productCode: products.code,
          quantitySold: drizzleOrm.sql`sum(${saleItems.quantity})`,
          revenue: drizzleOrm.sql`sum(${saleItems.totalPrice})`
        }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.and(...conditions)).groupBy(saleItems.productId, products.name, products.code).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${saleItems.quantity})`)).limit(10);
        let dateFormat;
        switch (groupBy) {
          case "week":
            dateFormat = "strftime('%Y-W%W', ${sales.saleDate})";
            break;
          case "month":
            dateFormat = "strftime('%Y-%m', ${sales.saleDate})";
            break;
          default:
            dateFormat = "date(${sales.saleDate})";
        }
        const dailySales = await db2.select({
          date: drizzleOrm.sql`date(${sales.saleDate})`,
          count: drizzleOrm.sql`count(*)`,
          total: drizzleOrm.sql`sum(${sales.totalAmount})`
        }).from(sales).where(drizzleOrm.and(...conditions)).groupBy(drizzleOrm.sql`date(${sales.saleDate})`).orderBy(drizzleOrm.sql`date(${sales.saleDate})`);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "sale",
          description: `Generated sales report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            byPaymentMethod,
            topProducts,
            dailySales
          }
        };
      } catch (error) {
        console.error("Sales report error:", error);
        return { success: false, message: "Failed to generate sales report" };
      }
    }
  );
  electron.ipcMain.handle("reports:inventory-report", async (_, params) => {
    try {
      const session = getCurrentSession();
      const { branchId } = params;
      const conditions = [];
      if (branchId) conditions.push(drizzleOrm.eq(inventory.branchId, branchId));
      const stockSummary = await db2.select({
        branchId: inventory.branchId,
        branchName: branches.name,
        totalProducts: drizzleOrm.sql`count(distinct ${inventory.productId})`,
        totalUnits: drizzleOrm.sql`sum(${inventory.quantity})`,
        lowStockItems: drizzleOrm.sql`sum(case when ${inventory.quantity} < ${inventory.minQuantity} then 1 else 0 end)`,
        outOfStockItems: drizzleOrm.sql`sum(case when ${inventory.quantity} = 0 then 1 else 0 end)`
      }).from(inventory).innerJoin(branches, drizzleOrm.eq(inventory.branchId, branches.id)).where(conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0).groupBy(inventory.branchId, branches.name);
      const stockValue = await db2.select({
        branchId: inventory.branchId,
        costValue: drizzleOrm.sql`sum(${inventory.quantity} * ${products.costPrice})`,
        retailValue: drizzleOrm.sql`sum(${inventory.quantity} * ${products.sellingPrice})`
      }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id)).where(conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0).groupBy(inventory.branchId);
      const lowStock = await db2.select({
        productId: inventory.productId,
        productName: products.name,
        productCode: products.code,
        branchId: inventory.branchId,
        branchName: branches.name,
        quantity: inventory.quantity,
        minQuantity: inventory.minQuantity,
        reorderLevel: products.reorderLevel
      }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id)).innerJoin(branches, drizzleOrm.eq(inventory.branchId, branches.id)).where(
        drizzleOrm.and(
          drizzleOrm.sql`${inventory.quantity} < ${inventory.minQuantity}`,
          conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0
        )
      ).orderBy(drizzleOrm.sql`${inventory.quantity} - ${inventory.minQuantity}`).limit(50);
      await createAuditLog$1({
        userId: session?.userId,
        branchId: branchId ?? session?.branchId,
        action: "view",
        entityType: "inventory",
        description: "Generated inventory report"
      });
      return {
        success: true,
        data: {
          stockSummary,
          stockValue,
          lowStock
        }
      };
    } catch (error) {
      console.error("Inventory report error:", error);
      return { success: false, message: "Failed to generate inventory report" };
    }
  });
  electron.ipcMain.handle(
    "reports:profit-loss",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const salesConditions = [
          drizzleOrm.between(sales.saleDate, startDate, endDate),
          drizzleOrm.eq(sales.isVoided, false)
        ];
        if (branchId) salesConditions.push(drizzleOrm.eq(sales.branchId, branchId));
        const revenue = await db2.select({
          totalRevenue: drizzleOrm.sql`sum(${sales.totalAmount})`,
          totalTax: drizzleOrm.sql`sum(${sales.taxAmount})`
        }).from(sales).where(drizzleOrm.and(...salesConditions));
        const cogs = await db2.select({
          totalCost: drizzleOrm.sql`sum(${saleItems.costPrice} * ${saleItems.quantity})`
        }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).where(drizzleOrm.and(...salesConditions));
        const expenseConditions = [drizzleOrm.between(expenses.expenseDate, startDate, endDate)];
        if (branchId) expenseConditions.push(drizzleOrm.eq(expenses.branchId, branchId));
        const expenseTotal = await db2.select({
          totalExpenses: drizzleOrm.sql`sum(${expenses.amount})`
        }).from(expenses).where(drizzleOrm.and(...expenseConditions));
        const expensesByCategory = await db2.select({
          category: expenses.category,
          total: drizzleOrm.sql`sum(${expenses.amount})`
        }).from(expenses).where(drizzleOrm.and(...expenseConditions)).groupBy(expenses.category);
        const totalRevenue = revenue[0]?.totalRevenue ?? 0;
        const totalCost = cogs[0]?.totalCost ?? 0;
        const totalExpenses = expenseTotal[0]?.totalExpenses ?? 0;
        const grossProfit = totalRevenue - totalCost;
        const netProfit = grossProfit - totalExpenses;
        const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue * 100 : 0;
        const netMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "sale",
          description: `Generated profit/loss report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            revenue: totalRevenue,
            costOfGoodsSold: totalCost,
            grossProfit,
            grossMargin,
            expenses: totalExpenses,
            expensesByCategory,
            netProfit,
            netMargin
          }
        };
      } catch (error) {
        console.error("Profit/loss report error:", error);
        return { success: false, message: "Failed to generate profit/loss report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:customer-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { startDate, endDate, limit = 20 } = params;
        const conditions = [drizzleOrm.eq(sales.isVoided, false)];
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(sales.saleDate, startDate, endDate));
        }
        const topCustomers = await db2.select({
          customerId: sales.customerId,
          customerName: drizzleOrm.sql`${customers.firstName} || ' ' || ${customers.lastName}`,
          email: customers.email,
          phone: customers.phone,
          totalOrders: drizzleOrm.sql`count(*)`,
          totalSpent: drizzleOrm.sql`sum(${sales.totalAmount})`,
          avgOrderValue: drizzleOrm.sql`avg(${sales.totalAmount})`
        }).from(sales).innerJoin(customers, drizzleOrm.eq(sales.customerId, customers.id)).where(drizzleOrm.and(...conditions)).groupBy(sales.customerId, customers.firstName, customers.lastName, customers.email, customers.phone).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${sales.totalAmount})`)).limit(limit);
        const customerSummary = await db2.select({
          totalCustomers: drizzleOrm.sql`count(distinct ${sales.customerId})`,
          totalRevenue: drizzleOrm.sql`sum(${sales.totalAmount})`
        }).from(sales).where(drizzleOrm.and(...conditions));
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "view",
          entityType: "customer",
          description: "Generated customer report"
        });
        return {
          success: true,
          data: {
            topCustomers,
            summary: customerSummary[0]
          }
        };
      } catch (error) {
        console.error("Customer report error:", error);
        return { success: false, message: "Failed to generate customer report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:expenses-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = [drizzleOrm.between(expenses.expenseDate, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(expenses.branchId, branchId));
        const summary = await db2.select({
          totalExpenses: drizzleOrm.sql`sum(${expenses.amount})`,
          expenseCount: drizzleOrm.sql`count(*)`,
          avgExpense: drizzleOrm.sql`avg(${expenses.amount})`
        }).from(expenses).where(drizzleOrm.and(...conditions));
        const expensesByCategory = await db2.select({
          category: expenses.category,
          amount: drizzleOrm.sql`sum(${expenses.amount})`,
          count: drizzleOrm.sql`count(*)`
        }).from(expenses).where(drizzleOrm.and(...conditions)).groupBy(expenses.category).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${expenses.amount})`));
        const expensesByBranch = await db2.select({
          branchId: expenses.branchId,
          branchName: branches.name,
          amount: drizzleOrm.sql`sum(${expenses.amount})`,
          count: drizzleOrm.sql`count(*)`
        }).from(expenses).innerJoin(branches, drizzleOrm.eq(expenses.branchId, branches.id)).where(drizzleOrm.and(...conditions)).groupBy(expenses.branchId, branches.name);
        const topExpenses = await db2.select({
          id: expenses.id,
          category: expenses.category,
          amount: expenses.amount,
          description: expenses.description,
          date: expenses.expenseDate,
          branchName: branches.name
        }).from(expenses).innerJoin(branches, drizzleOrm.eq(expenses.branchId, branches.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(expenses.amount)).limit(10);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "expense",
          description: `Generated expense report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            expensesByCategory,
            expensesByBranch,
            topExpenses
          }
        };
      } catch (error) {
        console.error("Expense report error:", error);
        return { success: false, message: "Failed to generate expense report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:purchases-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = [drizzleOrm.between(purchases.createdAt, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(purchases.branchId, branchId));
        const summary = await db2.select({
          totalPurchases: drizzleOrm.sql`count(*)`,
          totalCost: drizzleOrm.sql`sum(${purchases.totalAmount})`,
          avgPurchaseValue: drizzleOrm.sql`avg(${purchases.totalAmount})`,
          pendingPayments: drizzleOrm.sql`sum(case when ${purchases.paymentStatus} = 'pending' then ${purchases.totalAmount} else 0 end)`
        }).from(purchases).where(drizzleOrm.and(...conditions));
        const purchasesBySupplier = await db2.select({
          supplierId: purchases.supplierId,
          supplierName: suppliers.name,
          totalPurchases: drizzleOrm.sql`count(*)`,
          totalAmount: drizzleOrm.sql`sum(${purchases.totalAmount})`
        }).from(purchases).innerJoin(suppliers, drizzleOrm.eq(purchases.supplierId, suppliers.id)).where(drizzleOrm.and(...conditions)).groupBy(purchases.supplierId, suppliers.name).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${purchases.totalAmount})`));
        const purchasesByStatus = await db2.select({
          status: purchases.status,
          count: drizzleOrm.sql`count(*)`,
          totalAmount: drizzleOrm.sql`sum(${purchases.totalAmount})`
        }).from(purchases).where(drizzleOrm.and(...conditions)).groupBy(purchases.status);
        const recentPurchases = await db2.select({
          id: purchases.id,
          purchaseOrderNumber: purchases.purchaseOrderNumber,
          supplierName: suppliers.name,
          totalAmount: purchases.totalAmount,
          status: purchases.status,
          createdAt: purchases.createdAt
        }).from(purchases).innerJoin(suppliers, drizzleOrm.eq(purchases.supplierId, suppliers.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(purchases.createdAt)).limit(20);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "purchase",
          description: `Generated purchase report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            purchasesBySupplier,
            purchasesByStatus,
            recentPurchases
          }
        };
      } catch (error) {
        console.error("Purchase report error:", error);
        return { success: false, message: "Failed to generate purchase report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:returns-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = [drizzleOrm.between(returns.returnDate, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(returns.branchId, branchId));
        const totalSalesResult = await db2.select({
          count: drizzleOrm.sql`count(*)`
        }).from(sales).where(drizzleOrm.between(sales.saleDate, startDate, endDate));
        const summary = await db2.select({
          totalReturns: drizzleOrm.sql`count(*)`,
          totalValue: drizzleOrm.sql`sum(${returns.totalAmount})`
        }).from(returns).where(drizzleOrm.and(...conditions));
        const totalSales = totalSalesResult[0]?.count || 0;
        const returnRate = totalSales > 0 ? summary[0]?.totalReturns / totalSales * 100 : 0;
        const returnsByReason = await db2.select({
          reason: returns.reason,
          count: drizzleOrm.sql`count(*)`,
          value: drizzleOrm.sql`sum(${returns.totalAmount})`
        }).from(returns).where(drizzleOrm.and(...conditions)).groupBy(returns.reason).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`));
        const returnsByProduct = await db2.select({
          productId: returnItems.productId,
          productName: products.name,
          returnCount: drizzleOrm.sql`sum(${returnItems.quantity})`,
          totalValue: drizzleOrm.sql`sum(${returnItems.totalPrice})`
        }).from(returnItems).innerJoin(returns, drizzleOrm.eq(returnItems.returnId, returns.id)).innerJoin(products, drizzleOrm.eq(returnItems.productId, products.id)).where(drizzleOrm.and(...conditions)).groupBy(returnItems.productId, products.name).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${returnItems.quantity})`)).limit(10);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "return",
          description: `Generated returns report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: {
              ...summary[0],
              returnRate
            },
            returnsByReason,
            returnsByProduct
          }
        };
      } catch (error) {
        console.error("Returns report error:", error);
        return { success: false, message: "Failed to generate returns report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:commissions-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = [drizzleOrm.between(commissions.createdAt, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(commissions.branchId, branchId));
        const summary = await db2.select({
          totalCommissions: drizzleOrm.sql`sum(${commissions.commissionAmount})`,
          commissionCount: drizzleOrm.sql`count(*)`,
          avgCommission: drizzleOrm.sql`avg(${commissions.commissionAmount})`
        }).from(commissions).where(drizzleOrm.and(...conditions));
        const commissionsBySalesperson = await db2.select({
          userId: commissions.userId,
          userName: users.fullName,
          totalCommission: drizzleOrm.sql`sum(${commissions.commissionAmount})`,
          salesCount: drizzleOrm.sql`count(*)`
        }).from(commissions).innerJoin(users, drizzleOrm.eq(commissions.userId, users.id)).where(drizzleOrm.and(...conditions)).groupBy(commissions.userId, users.fullName).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${commissions.commissionAmount})`));
        const recentCommissions = await db2.select({
          id: commissions.id,
          userName: users.fullName,
          saleInvoice: sales.invoiceNumber,
          amount: commissions.commissionAmount,
          date: commissions.createdAt
        }).from(commissions).innerJoin(users, drizzleOrm.eq(commissions.userId, users.id)).innerJoin(sales, drizzleOrm.eq(commissions.saleId, sales.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(commissions.createdAt)).limit(20);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "commission",
          description: `Generated commission report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            commissionsBySalesperson,
            recentCommissions
          }
        };
      } catch (error) {
        console.error("Commission report error:", error);
        return { success: false, message: "Failed to generate commission report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:tax-report",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = [
          drizzleOrm.between(sales.saleDate, startDate, endDate),
          drizzleOrm.eq(sales.isVoided, false)
        ];
        if (branchId) conditions.push(drizzleOrm.eq(sales.branchId, branchId));
        const summary = await db2.select({
          totalTaxCollected: drizzleOrm.sql`sum(${sales.taxAmount})`,
          taxableSales: drizzleOrm.sql`count(*)`,
          avgTaxPerSale: drizzleOrm.sql`avg(${sales.taxAmount})`
        }).from(sales).where(drizzleOrm.and(...conditions));
        const taxByBranch = await db2.select({
          branchId: sales.branchId,
          branchName: branches.name,
          taxCollected: drizzleOrm.sql`sum(${sales.taxAmount})`
        }).from(sales).innerJoin(branches, drizzleOrm.eq(sales.branchId, branches.id)).where(drizzleOrm.and(...conditions)).groupBy(sales.branchId, branches.name);
        const taxByPaymentMethod = await db2.select({
          paymentMethod: sales.paymentMethod,
          taxCollected: drizzleOrm.sql`sum(${sales.taxAmount})`,
          salesCount: drizzleOrm.sql`count(*)`
        }).from(sales).where(drizzleOrm.and(...conditions)).groupBy(sales.paymentMethod);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "sale",
          description: `Generated tax report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            taxByBranch,
            taxByPaymentMethod
          }
        };
      } catch (error) {
        console.error("Tax report error:", error);
        return { success: false, message: "Failed to generate tax report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:branch-performance",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { startDate, endDate } = params;
        const allBranches = await db2.select().from(branches);
        const branchMetrics = await Promise.all(
          allBranches.map(async (branch) => {
            const revenueResult = await db2.select({
              revenue: drizzleOrm.sql`sum(${sales.totalAmount})`,
              salesCount: drizzleOrm.sql`count(*)`
            }).from(sales).where(
              drizzleOrm.and(
                drizzleOrm.eq(sales.branchId, branch.id),
                drizzleOrm.between(sales.saleDate, startDate, endDate),
                drizzleOrm.eq(sales.isVoided, false)
              )
            );
            const expenseResult = await db2.select({
              expenses: drizzleOrm.sql`sum(${expenses.amount})`
            }).from(expenses).where(
              drizzleOrm.and(
                drizzleOrm.eq(expenses.branchId, branch.id),
                drizzleOrm.between(expenses.expenseDate, startDate, endDate)
              )
            );
            const inventoryResult = await db2.select({
              inventoryValue: drizzleOrm.sql`sum(${inventory.quantity} * ${products.costPrice})`
            }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id)).where(drizzleOrm.eq(inventory.branchId, branch.id));
            const revenue = revenueResult[0]?.revenue || 0;
            const expenseAmount = expenseResult[0]?.expenses || 0;
            const profit = revenue - expenseAmount;
            return {
              branchId: branch.id,
              branchName: branch.name,
              revenue,
              expenses: expenseAmount,
              profit,
              salesCount: revenueResult[0]?.salesCount || 0,
              inventoryValue: inventoryResult[0]?.inventoryValue || 0
            };
          })
        );
        const totalRevenue = branchMetrics.reduce((sum, b) => sum + b.revenue, 0);
        const totalProfit = branchMetrics.reduce((sum, b) => sum + b.profit, 0);
        const topBranch = branchMetrics.reduce(
          (top, current) => current.revenue > top.revenue ? current : top
        );
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "view",
          entityType: "branch",
          description: `Generated branch performance report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: {
              totalBranches: allBranches.length,
              totalRevenue,
              totalProfit
            },
            branchMetrics,
            topPerformingBranch: {
              branchId: topBranch.branchId,
              branchName: topBranch.branchName,
              revenue: topBranch.revenue
            }
          }
        };
      } catch (error) {
        console.error("Branch performance report error:", error);
        return { success: false, message: "Failed to generate branch performance report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:cash-flow",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate } = params;
        const conditions = branchId ? [drizzleOrm.eq(sales.branchId, branchId)] : [];
        const expenseConditions = branchId ? [drizzleOrm.eq(expenses.branchId, branchId)] : [];
        const salesCash = await db2.select({
          total: drizzleOrm.sql`sum(${sales.totalAmount})`
        }).from(sales).where(
          drizzleOrm.and(
            drizzleOrm.between(sales.saleDate, startDate, endDate),
            drizzleOrm.eq(sales.isVoided, false),
            ...conditions
          )
        );
        const purchasesCash = await db2.select({
          total: drizzleOrm.sql`sum(${purchases.totalAmount})`
        }).from(purchases).where(
          drizzleOrm.and(
            drizzleOrm.between(purchases.createdAt, startDate, endDate),
            drizzleOrm.eq(purchases.paymentStatus, "paid"),
            branchId ? drizzleOrm.eq(purchases.branchId, branchId) : void 0
          )
        );
        const expensesCash = await db2.select({
          total: drizzleOrm.sql`sum(${expenses.amount})`
        }).from(expenses).where(drizzleOrm.and(drizzleOrm.between(expenses.expenseDate, startDate, endDate), ...expenseConditions));
        const commissionsCash = await db2.select({
          total: drizzleOrm.sql`sum(${commissions.commissionAmount})`
        }).from(commissions).where(
          drizzleOrm.and(
            drizzleOrm.between(commissions.createdAt, startDate, endDate),
            drizzleOrm.eq(commissions.status, "paid"),
            branchId ? drizzleOrm.eq(commissions.branchId, branchId) : void 0
          )
        );
        const refundsCash = await db2.select({
          total: drizzleOrm.sql`sum(${returns.refundAmount})`
        }).from(returns).where(
          drizzleOrm.and(
            drizzleOrm.between(returns.returnDate, startDate, endDate),
            branchId ? drizzleOrm.eq(returns.branchId, branchId) : void 0
          )
        );
        const cashIn = salesCash[0]?.total || 0;
        const cashOutPurchases = purchasesCash[0]?.total || 0;
        const cashOutExpenses = expensesCash[0]?.total || 0;
        const cashOutCommissions = commissionsCash[0]?.total || 0;
        const cashOutRefunds = refundsCash[0]?.total || 0;
        const totalCashOut = cashOutPurchases + cashOutExpenses + cashOutCommissions + cashOutRefunds;
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "sale",
          description: `Generated cash flow report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: {
              cashIn,
              cashOut: totalCashOut,
              netCashFlow: cashIn - totalCashOut,
              openingBalance: 0,
              closingBalance: cashIn - totalCashOut
            },
            cashInBreakdown: {
              sales: cashIn,
              receivables: 0,
              other: 0
            },
            cashOutBreakdown: {
              purchases: cashOutPurchases,
              expenses: cashOutExpenses,
              commissions: cashOutCommissions,
              refunds: cashOutRefunds
            },
            cashByBranch: []
          }
        };
      } catch (error) {
        console.error("Cash flow report error:", error);
        return { success: false, message: "Failed to generate cash flow report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:audit-trail",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { branchId, startDate, endDate, userId } = params;
        const conditions = [drizzleOrm.between(auditLogs.createdAt, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        if (userId) conditions.push(drizzleOrm.eq(auditLogs.userId, userId));
        const summary = await db2.select({
          totalActions: drizzleOrm.sql`count(*)`,
          uniqueUsers: drizzleOrm.sql`count(distinct ${auditLogs.userId})`
        }).from(auditLogs).where(drizzleOrm.and(...conditions));
        const actionsByUser = await db2.select({
          userId: auditLogs.userId,
          userName: users.fullName,
          actionCount: drizzleOrm.sql`count(*)`
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(drizzleOrm.and(...conditions)).groupBy(auditLogs.userId, users.fullName).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`));
        const actionsByType = await db2.select({
          action: auditLogs.action,
          count: drizzleOrm.sql`count(*)`
        }).from(auditLogs).where(drizzleOrm.and(...conditions)).groupBy(auditLogs.action).orderBy(drizzleOrm.desc(drizzleOrm.sql`count(*)`));
        const recentActions = await db2.select({
          id: auditLogs.id,
          userName: users.fullName,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          description: auditLogs.description,
          timestamp: auditLogs.createdAt
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(auditLogs.createdAt)).limit(50);
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "auth",
          description: `Generated audit trail report: ${startDate} to ${endDate}`
        });
        return {
          success: true,
          data: {
            summary: summary[0],
            actionsByUser,
            actionsByType,
            recentActions
          }
        };
      } catch (error) {
        console.error("Audit trail report error:", error);
        return { success: false, message: "Failed to generate audit trail report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:comprehensive-audit",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        if (session?.role !== "admin") {
          return {
            success: false,
            message: "Unauthorized: Admin access required"
          };
        }
        const { branchId, timePeriod, startDate, endDate } = params;
        const dateRange = getDateRange(timePeriod, startDate, endDate);
        const salesConditions = [
          drizzleOrm.between(sales.saleDate, dateRange.start, dateRange.end),
          drizzleOrm.eq(sales.isVoided, false)
        ];
        if (branchId) salesConditions.push(drizzleOrm.eq(sales.branchId, branchId));
        const expenseConditions = [
          drizzleOrm.between(expenses.expenseDate, dateRange.start, dateRange.end)
        ];
        if (branchId) expenseConditions.push(drizzleOrm.eq(expenses.branchId, branchId));
        const purchaseConditions = [
          drizzleOrm.between(purchases.createdAt, dateRange.start, dateRange.end)
        ];
        if (branchId) purchaseConditions.push(drizzleOrm.eq(purchases.branchId, branchId));
        const returnConditions = [
          drizzleOrm.between(returns.returnDate, dateRange.start, dateRange.end)
        ];
        if (branchId) returnConditions.push(drizzleOrm.eq(returns.branchId, branchId));
        const salesSummary = await db2.select({
          totalSales: drizzleOrm.sql`count(*)`,
          totalRevenue: drizzleOrm.sql`coalesce(sum(${sales.totalAmount}), 0)`,
          avgOrderValue: drizzleOrm.sql`coalesce(avg(${sales.totalAmount}), 0)`,
          totalTax: drizzleOrm.sql`coalesce(sum(${sales.taxAmount}), 0)`
        }).from(sales).where(drizzleOrm.and(...salesConditions));
        const salesByPaymentMethod = await db2.select({
          paymentMethod: sales.paymentMethod,
          count: drizzleOrm.sql`count(*)`,
          total: drizzleOrm.sql`sum(${sales.totalAmount})`
        }).from(sales).where(drizzleOrm.and(...salesConditions)).groupBy(sales.paymentMethod);
        const topProducts = await db2.select({
          productId: saleItems.productId,
          productName: products.name,
          productCode: products.code,
          quantitySold: drizzleOrm.sql`sum(${saleItems.quantity})`,
          revenue: drizzleOrm.sql`sum(${saleItems.totalPrice})`
        }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.and(...salesConditions)).groupBy(saleItems.productId, products.name, products.code).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${saleItems.quantity})`)).limit(10);
        let inventoryQuery = db2.select({
          totalProducts: drizzleOrm.sql`count(distinct ${inventory.productId})`,
          totalValue: drizzleOrm.sql`coalesce(sum(${inventory.quantity} * ${products.costPrice}), 0)`,
          lowStockItems: drizzleOrm.sql`sum(case when ${inventory.quantity} < ${inventory.minQuantity} then 1 else 0 end)`,
          outOfStockItems: drizzleOrm.sql`sum(case when ${inventory.quantity} = 0 then 1 else 0 end)`
        }).from(inventory).innerJoin(products, drizzleOrm.eq(inventory.productId, products.id));
        if (branchId) {
          inventoryQuery = inventoryQuery.where(drizzleOrm.eq(inventory.branchId, branchId));
        }
        const inventorySummary = await inventoryQuery;
        const purchasesSummary = await db2.select({
          totalPurchases: drizzleOrm.sql`count(*)`,
          totalCost: drizzleOrm.sql`coalesce(sum(${purchases.totalAmount}), 0)`,
          avgPurchaseValue: drizzleOrm.sql`coalesce(avg(${purchases.totalAmount}), 0)`
        }).from(purchases).where(drizzleOrm.and(...purchaseConditions));
        const expensesSummary = await db2.select({
          totalExpenses: drizzleOrm.sql`coalesce(sum(${expenses.amount}), 0)`,
          expenseCount: drizzleOrm.sql`count(*)`,
          avgExpense: drizzleOrm.sql`coalesce(avg(${expenses.amount}), 0)`
        }).from(expenses).where(drizzleOrm.and(...expenseConditions));
        const expensesByCategory = await db2.select({
          category: expenses.category,
          amount: drizzleOrm.sql`sum(${expenses.amount})`,
          count: drizzleOrm.sql`count(*)`
        }).from(expenses).where(drizzleOrm.and(...expenseConditions)).groupBy(expenses.category).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${expenses.amount})`));
        const returnsSummary = await db2.select({
          totalReturns: drizzleOrm.sql`count(*)`,
          totalRefundAmount: drizzleOrm.sql`coalesce(sum(${returns.refundAmount}), 0)`
        }).from(returns).where(drizzleOrm.and(...returnConditions));
        const totalSales = salesSummary[0]?.totalSales || 0;
        const returnRate = totalSales > 0 ? (returnsSummary[0]?.totalReturns || 0) / totalSales * 100 : 0;
        const commissionsConditions = [
          drizzleOrm.between(commissions.createdAt, dateRange.start, dateRange.end)
        ];
        if (branchId) commissionsConditions.push(drizzleOrm.eq(commissions.branchId, branchId));
        const commissionsSummary = await db2.select({
          totalCommission: drizzleOrm.sql`coalesce(sum(${commissions.commissionAmount}), 0)`,
          commissionCount: drizzleOrm.sql`count(*)`,
          avgCommission: drizzleOrm.sql`coalesce(avg(${commissions.commissionAmount}), 0)`
        }).from(commissions).where(drizzleOrm.and(...commissionsConditions));
        const grossRevenue = salesSummary[0]?.totalRevenue || 0;
        const refunds = returnsSummary[0]?.totalRefundAmount || 0;
        const netRevenue = grossRevenue - refunds;
        const cogsResult = await db2.select({
          cogs: drizzleOrm.sql`coalesce(sum(${saleItems.quantity} * ${products.costPrice}), 0)`
        }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.and(...salesConditions));
        const cogs = cogsResult[0]?.cogs || 0;
        const grossProfit = netRevenue - cogs;
        const totalExpenses = expensesSummary[0]?.totalExpenses || 0;
        const netProfit = grossProfit - totalExpenses;
        const profitMargin = netRevenue > 0 ? netProfit / netRevenue * 100 : 0;
        const auditLogConditions = [
          drizzleOrm.between(auditLogs.createdAt, dateRange.start, dateRange.end)
        ];
        if (branchId) auditLogConditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        const auditLogsData = await db2.select({
          id: auditLogs.id,
          userName: users.fullName,
          action: auditLogs.action,
          tableName: auditLogs.entityType,
          timestamp: auditLogs.createdAt
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(drizzleOrm.and(...auditLogConditions)).orderBy(drizzleOrm.desc(auditLogs.createdAt)).limit(50);
        const formattedAuditLogs = auditLogsData.map((log) => ({
          id: log.id,
          userName: log.userName || "System",
          action: log.action,
          tableName: log.tableName,
          timestamp: log.timestamp
        }));
        await createAuditLog$1({
          userId: session?.userId,
          branchId: branchId ?? session?.branchId,
          action: "view",
          entityType: "audit",
          description: `Generated comprehensive audit report: ${getPeriodLabel(timePeriod, startDate, endDate)}`
        });
        return {
          success: true,
          data: {
            salesSummary: salesSummary[0],
            salesByPaymentMethod,
            topProducts,
            inventorySummary: inventorySummary[0],
            purchasesSummary: purchasesSummary[0],
            expensesSummary: expensesSummary[0],
            expensesByCategory,
            returnsSummary: {
              ...returnsSummary[0],
              returnRate
            },
            financialSummary: {
              grossRevenue,
              refunds,
              netRevenue,
              cogs,
              grossProfit,
              expenses: totalExpenses,
              netProfit,
              profitMargin
            },
            commissionsSummary: commissionsSummary[0],
            auditLogs: formattedAuditLogs
          }
        };
      } catch (error) {
        console.error("Comprehensive audit report error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return { success: false, message: "Failed to generate comprehensive audit report" };
      }
    }
  );
  electron.ipcMain.handle(
    "reports:export-pdf",
    async (_, params) => {
      try {
        const session = getCurrentSession();
        const { reportType, data, filters } = params;
        const businessInfo = {
          name: "Firearms Retail POS",
          address: "",
          phone: "",
          email: ""
        };
        const filePath = await generateReportPDF({
          reportType,
          data,
          filters,
          businessInfo
        });
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "export",
          entityType: "sale",
          description: `Exported ${reportType} report to PDF`
        });
        return {
          success: true,
          filePath
        };
      } catch (error) {
        console.error("PDF export error:", error);
        return { success: false, message: "Failed to export PDF" };
      }
    }
  );
}
const LICENSE_SECRET = "FIREARMS_POS_LICENSE_2024";
function getMachineId() {
  const components = [];
  const nets = node_os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (!net.internal && net.mac !== "00:00:00:00:00:00") {
        components.push(net.mac);
      }
    }
  }
  const cpuInfo = node_os.cpus();
  if (cpuInfo.length > 0) {
    components.push(cpuInfo[0].model);
  }
  components.push(node_os.hostname());
  components.push(node_os.platform());
  const hash = node_crypto.createHash("sha256");
  hash.update(components.join("|"));
  return hash.digest("hex").toUpperCase();
}
function generateLicenseKey(machineId) {
  const hash = node_crypto.createHash("sha256");
  hash.update(`${machineId}|${LICENSE_SECRET}`);
  return hash.digest("hex").toUpperCase();
}
function getMachineIdForDisplay() {
  return getMachineId();
}
function validateLicenseKey(licenseKey, machineId) {
  const validKey = generateLicenseKey(machineId);
  return licenseKey.toUpperCase() === validKey.toUpperCase();
}
function getLicenseFilePath() {
  return node_path.join(electron.app.getPath("userData"), "license.json");
}
function getLicenseStatus() {
  const machineId = getMachineId();
  const licensePath = getLicenseFilePath();
  if (node_fs.existsSync(licensePath)) {
    try {
      const licenseData = JSON.parse(node_fs.readFileSync(licensePath, "utf-8"));
      if (licenseData.machineId !== machineId) {
        return {
          status: "NO_MACHINE_ID",
          isValid: false,
          isActivated: false,
          isTrial: false,
          machineId,
          expiresAt: null,
          daysRemaining: 0,
          message: "License is not valid for this machine.",
          installationDate: null,
          trialStartDate: null,
          trialEndDate: null,
          licenseStartDate: null
        };
      }
      if (licenseData.licenseEndDate && new Date(licenseData.licenseEndDate) < /* @__PURE__ */ new Date()) {
        return {
          status: "LICENSE_EXPIRED",
          isValid: false,
          isActivated: true,
          isTrial: false,
          machineId,
          expiresAt: licenseData.licenseEndDate,
          daysRemaining: 0,
          message: "License has expired. Please renew your license.",
          installationDate: null,
          trialStartDate: null,
          trialEndDate: null,
          licenseStartDate: licenseData.licenseStartDate
        };
      }
      const daysRemaining = licenseData.licenseEndDate ? Math.max(0, Math.ceil((new Date(licenseData.licenseEndDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))) : 0;
      return {
        status: "LICENSE_ACTIVE",
        isValid: true,
        isActivated: true,
        isTrial: false,
        machineId,
        expiresAt: licenseData.licenseEndDate,
        daysRemaining,
        message: "License is active and valid.",
        installationDate: null,
        trialStartDate: null,
        trialEndDate: null,
        licenseStartDate: licenseData.licenseStartDate
      };
    } catch {
    }
  }
  return {
    status: "TRIAL_ACTIVE",
    isValid: true,
    isActivated: false,
    isTrial: true,
    machineId,
    expiresAt: null,
    daysRemaining: 30,
    message: "Trial period active.",
    installationDate: null,
    trialStartDate: null,
    trialEndDate: null,
    licenseStartDate: null
  };
}
function activateLicense(licenseKey) {
  const machineId = getMachineId();
  const licensePath = getLicenseFilePath();
  const validKey = generateLicenseKey(machineId);
  if (licenseKey.toUpperCase() !== validKey.toUpperCase()) {
    return { success: false, message: "License key is not valid for this machine." };
  }
  const licenseData = {
    machineId,
    licenseKey: licenseKey.toUpperCase(),
    licenseStartDate: (/* @__PURE__ */ new Date()).toISOString(),
    licenseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
    // 1 year
    isPermanent: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    node_fs.writeFileSync(licensePath, JSON.stringify(licenseData, null, 2));
    return { success: true, message: "License activated successfully for 1 year." };
  } catch {
    return { success: false, message: "Failed to save license file." };
  }
}
function deactivateLicense() {
  const licensePath = getLicenseFilePath();
  if (!node_fs.existsSync(licensePath)) {
    return { success: false, message: "No license to deactivate." };
  }
  try {
    const { unlinkSync } = require("node:fs");
    unlinkSync(licensePath);
    return { success: true, message: "License deactivated successfully." };
  } catch {
    return { success: false, message: "Failed to deactivate license." };
  }
}
function getLicenseInfo() {
  const licensePath = getLicenseFilePath();
  if (!node_fs.existsSync(licensePath)) {
    return null;
  }
  try {
    return JSON.parse(node_fs.readFileSync(licensePath, "utf-8"));
  } catch {
    return null;
  }
}
const applicationInfo = sqliteCore.sqliteTable("application_info", {
  infoId: sqliteCore.integer("info_id").primaryKey({ autoIncrement: true }),
  installationDate: sqliteCore.text("installation_date").notNull(),
  firstRunDate: sqliteCore.text("first_run_date").notNull(),
  trialStartDate: sqliteCore.text("trial_start_date").notNull(),
  trialEndDate: sqliteCore.text("trial_end_date").notNull(),
  isLicensed: sqliteCore.integer("is_licensed", { mode: "boolean" }).default(false),
  licenseStartDate: sqliteCore.text("license_start_date"),
  licenseEndDate: sqliteCore.text("license_end_date"),
  machineId: sqliteCore.text("machine_id").notNull(),
  licenseKey: sqliteCore.text("license_key"),
  setupCompleted: sqliteCore.integer("setup_completed", { mode: "boolean" }).default(false),
  createdAt: sqliteCore.text("created_at").default(drizzleOrm.sql`CURRENT_TIMESTAMP`),
  updatedAt: sqliteCore.text("updated_at").default(drizzleOrm.sql`CURRENT_TIMESTAMP`)
});
function getApplicationInfoFromDb() {
  const db2 = getDatabase();
  return db2.select().from(applicationInfo).limit(1).get();
}
function initializeApplicationInfo() {
  const db2 = getDatabase();
  const existingInfo = getApplicationInfoFromDb();
  if (existingInfo) {
    return existingInfo;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
  const machineId = getMachineIdForDisplay();
  const newInfo = {
    installationDate: now,
    firstRunDate: now,
    trialStartDate: now,
    trialEndDate,
    isLicensed: false,
    machineId
  };
  const result = db2.insert(applicationInfo).values(newInfo).returning().get();
  return result;
}
function registerLicenseHandlers() {
  electron.ipcMain.handle("license:get-machine-id", async () => {
    try {
      const machineId = getMachineIdForDisplay();
      return { success: true, data: machineId };
    } catch (error) {
      console.error("Get machine ID error:", error);
      return { success: false, message: "Failed to get machine ID" };
    }
  });
  electron.ipcMain.handle("license:generate-license-request", async () => {
    try {
      const machineId = getMachineIdForDisplay();
      const expectedLicenseKey = generateLicenseKey(machineId);
      return {
        success: true,
        data: {
          machineId,
          expectedLicenseKey,
          instructions: "Run: node generate-license.js <machine_id>"
        }
      };
    } catch (error) {
      console.error("Generate license request error:", error);
      return { success: false, message: "Failed to generate license request" };
    }
  });
  electron.ipcMain.handle("license:get-application-info", async () => {
    try {
      const appInfo = initializeApplicationInfo();
      const machineId = getMachineIdForDisplay();
      const licenseInfo = getLicenseInfo();
      const now = /* @__PURE__ */ new Date();
      const trialEnd = new Date(appInfo.trialEndDate);
      const trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
      let status = "TRIAL_ACTIVE";
      let isValid = true;
      let isActivated = false;
      let isTrial = true;
      let daysRemaining = trialDaysRemaining;
      let expiresAt = appInfo.trialEndDate;
      let message = `Trial period: ${trialDaysRemaining} days remaining`;
      if (appInfo.isLicensed && licenseInfo) {
        isActivated = true;
        isTrial = false;
        expiresAt = licenseInfo.licenseEndDate;
        if (licenseInfo.licenseEndDate && new Date(licenseInfo.licenseEndDate) < now) {
          status = "LICENSE_EXPIRED";
          isValid = false;
          daysRemaining = 0;
          message = "License has expired. Please renew.";
        } else {
          status = "LICENSE_ACTIVE";
          daysRemaining = Math.max(0, Math.ceil((new Date(licenseInfo.licenseEndDate).getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
          message = `License active: ${daysRemaining} days remaining`;
        }
      } else if (trialEnd < now) {
        status = "TRIAL_EXPIRED";
        isValid = false;
        daysRemaining = 0;
        message = "Trial period has expired. Please activate license.";
      }
      const extendedStatus = {
        status,
        isValid,
        isActivated,
        isTrial,
        machineId,
        expiresAt,
        daysRemaining,
        message,
        installationDate: appInfo.installationDate,
        trialStartDate: appInfo.trialStartDate,
        trialEndDate: appInfo.trialEndDate,
        licenseStartDate: licenseInfo?.licenseStartDate || null,
        licenseEndDate: licenseInfo?.licenseEndDate || null
      };
      return { success: true, data: extendedStatus };
    } catch (error) {
      console.error("Get application info error:", error);
      return { success: false, message: "Failed to get application info" };
    }
  });
  electron.ipcMain.handle("license:get-status", async () => {
    try {
      const status = getLicenseStatus();
      return { success: true, data: status };
    } catch (error) {
      console.error("Get license status error:", error);
      return { success: false, message: "Failed to get license status" };
    }
  });
  electron.ipcMain.handle("license:activate", async (_, licenseKey) => {
    try {
      const session = getCurrentSession();
      if (!session || session.role?.toLowerCase() !== "admin") {
        return { success: false, message: "Only administrators can activate licenses." };
      }
      const result = activateLicense(licenseKey);
      if (result.success) {
        const db2 = getDatabase();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const licenseEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
        db2.update(applicationInfo).set({
          isLicensed: true,
          licenseStartDate: now,
          licenseEndDate,
          licenseKey: licenseKey.toUpperCase(),
          updatedAt: now
        }).where(drizzleOrm.eq(applicationInfo.infoId, 1)).run();
        await createAuditLog$1({
          userId: session.userId,
          branchId: session.branchId,
          action: "create",
          entityType: "license",
          description: `License activated. Key: ${licenseKey.substring(0, 8)}...`
        });
      }
      return result;
    } catch (error) {
      console.error("Activate license error:", error);
      return { success: false, message: "Failed to activate license" };
    }
  });
  electron.ipcMain.handle("license:deactivate", async () => {
    try {
      const session = getCurrentSession();
      if (!session || session.role?.toLowerCase() !== "admin") {
        return { success: false, message: "Only administrators can deactivate licenses." };
      }
      const result = deactivateLicense();
      if (result.success) {
        const db2 = getDatabase();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        db2.update(applicationInfo).set({
          isLicensed: false,
          licenseStartDate: null,
          licenseEndDate: null,
          licenseKey: null,
          updatedAt: now
        }).where(drizzleOrm.eq(applicationInfo.infoId, 1)).run();
        await createAuditLog$1({
          userId: session.userId,
          branchId: session.branchId,
          action: "delete",
          entityType: "license",
          description: "License deactivated"
        });
      }
      return result;
    } catch (error) {
      console.error("Deactivate license error:", error);
      return { success: false, message: "Failed to deactivate license" };
    }
  });
  electron.ipcMain.handle("license:validate-key", async (_, licenseKey) => {
    try {
      const machineId = getMachineIdForDisplay();
      const isValid = validateLicenseKey(licenseKey, machineId);
      const isValidFormat = /^[A-F0-9]{32}$/.test(licenseKey.toUpperCase()) || /^[A-F0-9]{64}$/.test(licenseKey.toUpperCase());
      return {
        success: true,
        data: {
          isValid,
          isValidFormat,
          message: isValid ? "License key is valid for this machine." : isValidFormat ? "License key format is valid but not for this machine." : "Invalid license key format."
        }
      };
    } catch (error) {
      console.error("Validate license key error:", error);
      return { success: false, message: "Failed to validate license key" };
    }
  });
  electron.ipcMain.handle("license:get-history", async () => {
    try {
      const licenseInfo = getLicenseInfo();
      if (!licenseInfo) {
        return { success: true, data: [] };
      }
      const history = [
        {
          id: 1,
          type: "FULL",
          status: licenseInfo.licenseEndDate && new Date(licenseInfo.licenseEndDate) > /* @__PURE__ */ new Date() ? "ACTIVE" : "EXPIRED",
          activatedBy: "Administrator",
          activatedAt: licenseInfo.licenseStartDate,
          expiresAt: licenseInfo.licenseEndDate
        }
      ];
      return { success: true, data: history };
    } catch (error) {
      console.error("Get license history error:", error);
      return { success: false, message: "Failed to get license history" };
    }
  });
}
function registerDatabaseViewerHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("database:get-tables", async () => {
    try {
      const tables = await db2.all(`
        SELECT name, sql
        FROM sqlite_master
        WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE 'drizzle_%'
        ORDER BY name
      `);
      return { success: true, tables };
    } catch (err) {
      console.error("Error fetching tables:", err);
      return { success: false, error: String(err), tables: [] };
    }
  });
  electron.ipcMain.handle("database:get-table-info", async (_, tableName) => {
    try {
      const info = await db2.all(`PRAGMA table_info("${tableName}")`);
      return { success: true, columns: info };
    } catch (err) {
      console.error("Error fetching table info:", err);
      return { success: false, error: String(err), columns: [] };
    }
  });
  electron.ipcMain.handle(
    "database:get-table-data",
    async (_, { tableName, page = 1, limit = 100 }) => {
      try {
        const countResult = await db2.get(
          `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        const totalCount = countResult?.count || 0;
        const offset = (page - 1) * limit;
        const data = await db2.all(`SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`);
        const columnsResult = await db2.all(`PRAGMA table_info("${tableName}")`);
        const columns = columnsResult.map((col) => col.name);
        const rows = data.map((row) => {
          const plainRow = {};
          for (const col of columns) {
            let value = row[col];
            if (value instanceof Date) {
              value = value.toISOString();
            }
            if (value && typeof value === "object" && !Array.isArray(value)) {
              const proto = Object.getPrototypeOf(value);
              if (proto && proto.constructor && proto.constructor.name === "Blob") {
                try {
                  value = Buffer.isBuffer(value) ? value.toString("base64") : String(value);
                } catch {
                  value = "[Binary Data]";
                }
              }
            }
            plainRow[col] = value;
          }
          return plainRow;
        });
        return {
          success: true,
          data: {
            columns,
            rows,
            count: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
          }
        };
      } catch (err) {
        console.error("Error fetching table data:", err);
        return { success: false, error: String(err), data: null };
      }
    }
  );
  electron.ipcMain.handle(
    "database:execute-query",
    async (_, { query, userId }) => {
      try {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery.startsWith("select") && !normalizedQuery.startsWith("pragma")) {
          return {
            success: false,
            error: "Only SELECT queries are allowed for security reasons",
            data: null
          };
        }
        if (normalizedQuery.includes("drop") || normalizedQuery.includes("delete") || normalizedQuery.includes("update") || normalizedQuery.includes("insert") || normalizedQuery.includes("alter") || normalizedQuery.includes("create")) {
          return {
            success: false,
            error: "Only SELECT and PRAGMA queries are allowed for viewing",
            data: null
          };
        }
        const result = await db2.all(query);
        let columns = [];
        if (result.length > 0) {
          columns = Object.keys(result[0]);
        }
        const rows = result.map((row) => {
          const plainRow = {};
          for (const col of columns) {
            let value = row[col];
            if (value instanceof Date) {
              value = value.toISOString();
            }
            plainRow[col] = value;
          }
          return plainRow;
        });
        return {
          success: true,
          data: {
            columns,
            rows,
            count: result.length
          }
        };
      } catch (err) {
        console.error("Error executing query:", err);
        return { success: false, error: String(err), data: null };
      }
    }
  );
  electron.ipcMain.handle("database:get-info", async () => {
    try {
      const dbPath = getDbPath();
      const tableRows = await db2.all(`
        SELECT m.name
        FROM sqlite_master m
        WHERE m.type='table'
        AND m.name NOT LIKE 'sqlite_%'
        AND m.name NOT LIKE 'drizzle_%'
      `);
      const tableCounts = await Promise.all(
        tableRows.map(async (table) => {
          const result = await db2.get(
            `SELECT COUNT(*) as count FROM "${table.name}"`
          );
          return { name: table.name, count: result?.count || 0 };
        })
      );
      return {
        success: true,
        info: {
          path: dbPath,
          tableCounts
        }
      };
    } catch (err) {
      console.error("Error fetching database info:", err);
      return { success: false, error: String(err), info: null };
    }
  });
}
function registerAccountReceivablesHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("receivables:get-all", async (_, params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortOrder = "desc",
        customerId,
        branchId,
        status,
        search,
        startDate,
        endDate
      } = params;
      const conditions = [];
      if (customerId) conditions.push(drizzleOrm.eq(accountReceivables.customerId, customerId));
      if (branchId) conditions.push(drizzleOrm.eq(accountReceivables.branchId, branchId));
      if (status) conditions.push(drizzleOrm.eq(accountReceivables.status, status));
      if (startDate) conditions.push(drizzleOrm.gte(accountReceivables.createdAt, startDate));
      if (endDate) conditions.push(drizzleOrm.lte(accountReceivables.createdAt, endDate));
      const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
      const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(accountReceivables).where(whereClause);
      const total = countResult[0]?.count ?? 0;
      const data = await db2.query.accountReceivables.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: sortOrder === "desc" ? drizzleOrm.desc(accountReceivables.createdAt) : accountReceivables.createdAt,
        with: {
          customer: true,
          sale: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          payments: {
            orderBy: drizzleOrm.desc(receivablePayments.paymentDate)
          }
        }
      });
      return {
        success: true,
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Get receivables error:", error);
      return { success: false, message: "Failed to fetch receivables" };
    }
  });
  electron.ipcMain.handle("receivables:get-by-id", async (_, id) => {
    try {
      const receivable = await db2.query.accountReceivables.findFirst({
        where: drizzleOrm.eq(accountReceivables.id, id),
        with: {
          customer: true,
          sale: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          payments: {
            orderBy: drizzleOrm.desc(receivablePayments.paymentDate),
            with: {
              receivedByUser: {
                columns: {
                  id: true,
                  username: true,
                  fullName: true
                }
              }
            }
          }
        }
      });
      if (!receivable) {
        return { success: false, message: "Receivable not found" };
      }
      return { success: true, data: receivable };
    } catch (error) {
      console.error("Get receivable error:", error);
      return { success: false, message: "Failed to fetch receivable" };
    }
  });
  electron.ipcMain.handle("receivables:get-by-customer", async (_, customerId) => {
    try {
      const data = await db2.query.accountReceivables.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(accountReceivables.customerId, customerId),
          drizzleOrm.or(
            drizzleOrm.eq(accountReceivables.status, "pending"),
            drizzleOrm.eq(accountReceivables.status, "partial"),
            drizzleOrm.eq(accountReceivables.status, "overdue")
          )
        ),
        orderBy: drizzleOrm.desc(accountReceivables.createdAt),
        with: {
          branch: true,
          payments: true
        }
      });
      const totalOwed = data.reduce((sum, r) => sum + r.remainingAmount, 0);
      const totalPaid = data.reduce((sum, r) => sum + r.paidAmount, 0);
      return {
        success: true,
        data,
        summary: {
          totalReceivables: data.length,
          totalOwed,
          totalPaid
        }
      };
    } catch (error) {
      console.error("Get customer receivables error:", error);
      return { success: false, message: "Failed to fetch customer receivables" };
    }
  });
  electron.ipcMain.handle("receivables:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const customer = await db2.query.customers.findFirst({
        where: drizzleOrm.eq(customers.id, data.customerId)
      });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }
      const branch = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, data.branchId)
      });
      if (!branch) {
        return { success: false, message: "Branch not found" };
      }
      const [newReceivable] = await db2.insert(accountReceivables).values({
        customerId: data.customerId,
        saleId: data.saleId,
        branchId: data.branchId,
        invoiceNumber: data.invoiceNumber,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        remainingAmount: data.totalAmount,
        status: "pending",
        dueDate: data.dueDate,
        notes: data.notes,
        createdBy: session.userId
      }).returning();
      await createAuditLog$1({
        userId: session.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "account_receivable",
        entityId: newReceivable.id,
        newValues: {
          customerId: data.customerId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount
        },
        description: `Created receivable ${data.invoiceNumber} for ${customer.firstName} ${customer.lastName}`
      });
      return { success: true, data: newReceivable };
    } catch (error) {
      console.error("Create receivable error:", error);
      return { success: false, message: "Failed to create receivable" };
    }
  });
  electron.ipcMain.handle("receivables:record-payment", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const receivable = await db2.query.accountReceivables.findFirst({
        where: drizzleOrm.eq(accountReceivables.id, data.receivableId),
        with: {
          customer: true
        }
      });
      if (!receivable) {
        return { success: false, message: "Receivable not found" };
      }
      if (receivable.status === "paid") {
        return { success: false, message: "This receivable is already fully paid" };
      }
      if (receivable.status === "cancelled") {
        return { success: false, message: "Cannot record payment for cancelled receivable" };
      }
      if (data.amount <= 0) {
        return { success: false, message: "Payment amount must be greater than 0" };
      }
      if (data.amount > receivable.remainingAmount) {
        return {
          success: false,
          message: `Payment amount cannot exceed remaining balance of ${receivable.remainingAmount}`
        };
      }
      const newPaidAmount = receivable.paidAmount + data.amount;
      const newRemainingAmount = receivable.totalAmount - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? "paid" : "partial";
      const result = await withTransaction(async ({ db: txDb }) => {
        const [payment] = await txDb.insert(receivablePayments).values({
          receivableId: data.receivableId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          receivedBy: session.userId
        }).returning();
        await txDb.update(accountReceivables).set({
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(accountReceivables.id, data.receivableId));
        if (receivable.saleId) {
          const sale = await txDb.query.sales.findFirst({
            where: drizzleOrm.eq(sales.id, receivable.saleId)
          });
          if (sale) {
            const newSaleAmountPaid = sale.amountPaid + data.amount;
            const saleOutstanding = sale.totalAmount - newSaleAmountPaid;
            const newSalePaymentStatus = saleOutstanding <= 0 ? "paid" : "partial";
            await txDb.update(sales).set({
              amountPaid: newSaleAmountPaid,
              paymentStatus: newSalePaymentStatus,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(drizzleOrm.eq(sales.id, receivable.saleId));
          }
        }
        await postARPaymentToGL(
          {
            id: payment.id,
            receivableId: data.receivableId,
            branchId: receivable.branchId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            invoiceNumber: receivable.invoiceNumber
          },
          session.userId
        );
        return payment;
      });
      await createAuditLog$1({
        userId: session.userId,
        branchId: receivable.branchId,
        action: "payment",
        entityType: "account_receivable",
        entityId: data.receivableId,
        oldValues: {
          paidAmount: receivable.paidAmount,
          remainingAmount: receivable.remainingAmount,
          status: receivable.status
        },
        newValues: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paymentAmount: data.amount,
          paymentMethod: data.paymentMethod
        },
        description: `Recorded payment of ${data.amount} for receivable ${receivable.invoiceNumber}`
      });
      return {
        success: true,
        data: result,
        receivable: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus
        }
      };
    } catch (error) {
      console.error("Record payment error:", error);
      return { success: false, message: "Failed to record payment" };
    }
  });
  electron.ipcMain.handle("receivables:cancel", async (_, id, reason) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const receivable = await db2.query.accountReceivables.findFirst({
        where: drizzleOrm.eq(accountReceivables.id, id)
      });
      if (!receivable) {
        return { success: false, message: "Receivable not found" };
      }
      if (receivable.status === "paid") {
        return { success: false, message: "Cannot cancel a fully paid receivable" };
      }
      if (receivable.paidAmount > 0) {
        return { success: false, message: "Cannot cancel receivable with existing payments" };
      }
      await db2.update(accountReceivables).set({
        status: "cancelled",
        notes: reason ? `${receivable.notes || ""}
Cancelled: ${reason}`.trim() : receivable.notes,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(accountReceivables.id, id));
      await createAuditLog$1({
        userId: session.userId,
        branchId: receivable.branchId,
        action: "cancel",
        entityType: "account_receivable",
        entityId: id,
        oldValues: { status: receivable.status },
        newValues: { status: "cancelled", reason },
        description: `Cancelled receivable ${receivable.invoiceNumber}`
      });
      return { success: true, message: "Receivable cancelled successfully" };
    } catch (error) {
      console.error("Cancel receivable error:", error);
      return { success: false, message: "Failed to cancel receivable" };
    }
  });
  electron.ipcMain.handle("receivables:get-summary", async (_, branchId) => {
    try {
      const conditions = [];
      if (branchId) conditions.push(drizzleOrm.eq(accountReceivables.branchId, branchId));
      const statusQuery = await db2.select({
        status: accountReceivables.status,
        count: drizzleOrm.sql`count(*)`,
        totalAmount: drizzleOrm.sql`sum(${accountReceivables.totalAmount})`,
        remainingAmount: drizzleOrm.sql`sum(${accountReceivables.remainingAmount})`
      }).from(accountReceivables).where(conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0).groupBy(accountReceivables.status);
      const outstandingQuery = await db2.select({
        totalReceivables: drizzleOrm.sql`count(*)`,
        totalAmount: drizzleOrm.sql`sum(${accountReceivables.totalAmount})`,
        totalRemaining: drizzleOrm.sql`sum(${accountReceivables.remainingAmount})`
      }).from(accountReceivables).where(
        drizzleOrm.and(
          ...conditions.length > 0 ? conditions : [],
          drizzleOrm.or(
            drizzleOrm.eq(accountReceivables.status, "pending"),
            drizzleOrm.eq(accountReceivables.status, "partial"),
            drizzleOrm.eq(accountReceivables.status, "overdue")
          )
        )
      );
      const collectedQuery = await db2.select({
        totalPaid: drizzleOrm.sql`sum(${accountReceivables.paidAmount})`
      }).from(accountReceivables).where(conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let todayCollectionResult;
      if (branchId) {
        todayCollectionResult = await db2.all(
          drizzleOrm.sql`SELECT COALESCE(SUM(rp.amount), 0) as todayCollected
              FROM receivable_payments rp
              INNER JOIN account_receivables ar ON rp.receivable_id = ar.id
              WHERE date(rp.payment_date) = date('now') AND ar.branch_id = ${branchId}`
        );
      } else {
        todayCollectionResult = await db2.all(
          drizzleOrm.sql`SELECT COALESCE(SUM(rp.amount), 0) as todayCollected
              FROM receivable_payments rp
              WHERE date(rp.payment_date) = date('now')`
        );
      }
      const todayCollected = todayCollectionResult[0]?.todayCollected ?? 0;
      const overdueQuery = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(accountReceivables).where(
        drizzleOrm.and(
          ...conditions.length > 0 ? conditions : [],
          drizzleOrm.lte(accountReceivables.dueDate, today),
          drizzleOrm.or(drizzleOrm.eq(accountReceivables.status, "pending"), drizzleOrm.eq(accountReceivables.status, "partial"))
        )
      );
      await db2.update(accountReceivables).set({ status: "overdue", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(
        drizzleOrm.and(
          drizzleOrm.lte(accountReceivables.dueDate, today),
          drizzleOrm.or(drizzleOrm.eq(accountReceivables.status, "pending"), drizzleOrm.eq(accountReceivables.status, "partial"))
        )
      );
      return {
        success: true,
        data: {
          byStatus: statusQuery,
          totals: {
            totalReceivables: outstandingQuery[0]?.totalReceivables ?? 0,
            totalAmount: outstandingQuery[0]?.totalAmount ?? 0,
            totalPaid: collectedQuery[0]?.totalPaid ?? 0,
            totalRemaining: outstandingQuery[0]?.totalRemaining ?? 0,
            todayCollected
          },
          overdueCount: overdueQuery[0]?.count ?? 0
        }
      };
    } catch (error) {
      console.error("Get summary error:", error);
      return { success: false, message: "Failed to fetch summary" };
    }
  });
  electron.ipcMain.handle("receivables:get-payments", async (_, receivableId) => {
    try {
      const payments = await db2.query.receivablePayments.findMany({
        where: drizzleOrm.eq(receivablePayments.receivableId, receivableId),
        orderBy: drizzleOrm.desc(receivablePayments.paymentDate),
        with: {
          receivedByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      return { success: true, data: payments };
    } catch (error) {
      console.error("Get payments error:", error);
      return { success: false, message: "Failed to fetch payments" };
    }
  });
  electron.ipcMain.handle("receivables:get-aging-report", async (_, branchId) => {
    try {
      const today = /* @__PURE__ */ new Date();
      const conditions = [
        drizzleOrm.or(
          drizzleOrm.eq(accountReceivables.status, "pending"),
          drizzleOrm.eq(accountReceivables.status, "partial"),
          drizzleOrm.eq(accountReceivables.status, "overdue")
        )
      ];
      if (branchId) conditions.push(drizzleOrm.eq(accountReceivables.branchId, branchId));
      const outstandingReceivables = await db2.query.accountReceivables.findMany({
        where: drizzleOrm.and(...conditions),
        with: {
          customer: true,
          branch: true
        },
        orderBy: drizzleOrm.desc(accountReceivables.dueDate)
      });
      const aging = {
        current: { amount: 0, count: 0 },
        days1to30: { amount: 0, count: 0 },
        days31to60: { amount: 0, count: 0 },
        days61to90: { amount: 0, count: 0 },
        days90plus: { amount: 0, count: 0 }
      };
      const overdueByCustomer = /* @__PURE__ */ new Map();
      for (const receivable of outstandingReceivables) {
        const dueDate = receivable.dueDate ? new Date(receivable.dueDate) : null;
        const amount = receivable.remainingAmount;
        if (!dueDate) {
          aging.current.amount += amount;
          aging.current.count++;
          continue;
        }
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysDiff <= 0) {
          aging.current.amount += amount;
          aging.current.count++;
        } else if (daysDiff <= 30) {
          aging.days1to30.amount += amount;
          aging.days1to30.count++;
        } else if (daysDiff <= 60) {
          aging.days31to60.amount += amount;
          aging.days31to60.count++;
        } else if (daysDiff <= 90) {
          aging.days61to90.amount += amount;
          aging.days61to90.count++;
        } else {
          aging.days90plus.amount += amount;
          aging.days90plus.count++;
        }
        if (daysDiff > 0 && receivable.customer) {
          const customerName = `${receivable.customer.firstName} ${receivable.customer.lastName}`;
          const existing = overdueByCustomer.get(receivable.customer.id);
          if (existing) {
            existing.amount += amount;
            if (daysDiff > existing.daysOverdue) {
              existing.daysOverdue = daysDiff;
              existing.oldestDueDate = receivable.dueDate;
            }
          } else {
            overdueByCustomer.set(receivable.customer.id, {
              customer: customerName,
              amount,
              oldestDueDate: receivable.dueDate,
              daysOverdue: daysDiff
            });
          }
        }
      }
      const totalOutstanding = aging.current.amount + aging.days1to30.amount + aging.days31to60.amount + aging.days61to90.amount + aging.days90plus.amount;
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const salesResult = await db2.select({
        totalSales: drizzleOrm.sql`sum(${accountReceivables.totalAmount})`
      }).from(accountReceivables).where(
        drizzleOrm.and(
          drizzleOrm.gte(accountReceivables.createdAt, oneYearAgo.toISOString()),
          ...branchId ? [drizzleOrm.eq(accountReceivables.branchId, branchId)] : []
        )
      );
      const totalSales = salesResult[0]?.totalSales || 0;
      const dso = totalSales > 0 ? Math.round(totalOutstanding / (totalSales / 365) * 10) / 10 : 0;
      const topOverdue = Array.from(overdueByCustomer.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
      return {
        success: true,
        data: {
          totalOutstanding,
          dso,
          aging,
          topOverdue
        }
      };
    } catch (error) {
      console.error("Get aging report error:", error);
      return { success: false, message: "Failed to fetch aging report" };
    }
  });
  electron.ipcMain.handle("receivables:sync-with-sales", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      if (session.role !== "admin") {
        return { success: false, message: "Admin access required" };
      }
      const db22 = getDatabase();
      const receivablesWithSales = await db22.query.accountReceivables.findMany({
        where: drizzleOrm.sql`${accountReceivables.saleId} IS NOT NULL`
      });
      let syncedCount = 0;
      for (const receivable of receivablesWithSales) {
        if (!receivable.saleId) continue;
        const sale = await db22.query.sales.findFirst({
          where: drizzleOrm.eq(sales.id, receivable.saleId)
        });
        if (!sale) continue;
        const originalCashPayment = sale.totalAmount - receivable.totalAmount;
        const expectedAmountPaid = originalCashPayment + receivable.paidAmount;
        const expectedStatus = expectedAmountPaid >= sale.totalAmount ? "paid" : expectedAmountPaid > 0 ? "partial" : "pending";
        if (sale.amountPaid !== expectedAmountPaid || sale.paymentStatus !== expectedStatus) {
          await db22.update(sales).set({
            amountPaid: expectedAmountPaid,
            paymentStatus: expectedStatus,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(sales.id, receivable.saleId));
          syncedCount++;
        }
      }
      await createAuditLog$1({
        userId: session.userId,
        branchId: null,
        action: "sync",
        entityType: "account_receivable",
        entityId: 0,
        description: `Synced ${syncedCount} sales records with receivables`
      });
      return {
        success: true,
        message: `Successfully synced ${syncedCount} records`,
        syncedCount
      };
    } catch (error) {
      console.error("Sync receivables with sales error:", error);
      return { success: false, message: "Failed to sync receivables with sales" };
    }
  });
}
function registerAccountPayablesHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("payables:get-all", async (_, params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortOrder = "desc",
        supplierId,
        branchId,
        status,
        startDate,
        endDate
      } = params;
      const conditions = [];
      if (supplierId) conditions.push(drizzleOrm.eq(accountPayables.supplierId, supplierId));
      if (branchId) conditions.push(drizzleOrm.eq(accountPayables.branchId, branchId));
      if (status) conditions.push(drizzleOrm.eq(accountPayables.status, status));
      if (startDate) conditions.push(drizzleOrm.gte(accountPayables.createdAt, startDate));
      if (endDate) conditions.push(drizzleOrm.lte(accountPayables.createdAt, endDate));
      const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
      const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(accountPayables).where(whereClause);
      const total = countResult[0]?.count ?? 0;
      const data = await db2.query.accountPayables.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: sortOrder === "desc" ? drizzleOrm.desc(accountPayables.createdAt) : accountPayables.createdAt,
        with: {
          supplier: true,
          purchase: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          payments: {
            orderBy: drizzleOrm.desc(payablePayments.paymentDate)
          }
        }
      });
      return {
        success: true,
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Get payables error:", error);
      return { success: false, message: "Failed to fetch payables" };
    }
  });
  electron.ipcMain.handle("payables:get-by-id", async (_, id) => {
    try {
      const payable = await db2.query.accountPayables.findFirst({
        where: drizzleOrm.eq(accountPayables.id, id),
        with: {
          supplier: true,
          purchase: true,
          branch: true,
          createdByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          payments: {
            orderBy: drizzleOrm.desc(payablePayments.paymentDate),
            with: {
              paidByUser: {
                columns: {
                  id: true,
                  username: true,
                  fullName: true
                }
              }
            }
          }
        }
      });
      if (!payable) {
        return { success: false, message: "Payable not found" };
      }
      return { success: true, data: payable };
    } catch (error) {
      console.error("Get payable error:", error);
      return { success: false, message: "Failed to fetch payable" };
    }
  });
  electron.ipcMain.handle("payables:get-by-supplier", async (_, supplierId) => {
    try {
      const data = await db2.query.accountPayables.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(accountPayables.supplierId, supplierId),
          drizzleOrm.or(
            drizzleOrm.eq(accountPayables.status, "pending"),
            drizzleOrm.eq(accountPayables.status, "partial"),
            drizzleOrm.eq(accountPayables.status, "overdue")
          )
        ),
        orderBy: drizzleOrm.desc(accountPayables.createdAt),
        with: {
          branch: true,
          payments: true
        }
      });
      const totalOwed = data.reduce((sum, p) => sum + p.remainingAmount, 0);
      const totalPaid = data.reduce((sum, p) => sum + p.paidAmount, 0);
      return {
        success: true,
        data,
        summary: {
          totalPayables: data.length,
          totalOwed,
          totalPaid
        }
      };
    } catch (error) {
      console.error("Get supplier payables error:", error);
      return { success: false, message: "Failed to fetch supplier payables" };
    }
  });
  electron.ipcMain.handle("payables:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const supplier = await db2.query.suppliers.findFirst({
        where: drizzleOrm.eq(suppliers.id, data.supplierId)
      });
      if (!supplier) {
        return { success: false, message: "Supplier not found" };
      }
      const branch = await db2.query.branches.findFirst({
        where: drizzleOrm.eq(branches.id, data.branchId)
      });
      if (!branch) {
        return { success: false, message: "Branch not found" };
      }
      const [newPayable] = await db2.insert(accountPayables).values({
        supplierId: data.supplierId,
        purchaseId: data.purchaseId,
        branchId: data.branchId,
        invoiceNumber: data.invoiceNumber,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        remainingAmount: data.totalAmount,
        status: "pending",
        dueDate: data.dueDate,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        createdBy: session.userId
      }).returning();
      await createAuditLog$1({
        userId: session.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "account_payable",
        entityId: newPayable.id,
        newValues: {
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount
        },
        description: `Created payable ${data.invoiceNumber} for ${supplier.name}`
      });
      return { success: true, data: newPayable };
    } catch (error) {
      console.error("Create payable error:", error);
      return { success: false, message: "Failed to create payable" };
    }
  });
  electron.ipcMain.handle("payables:record-payment", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const payable = await db2.query.accountPayables.findFirst({
        where: drizzleOrm.eq(accountPayables.id, data.payableId),
        with: {
          supplier: true
        }
      });
      if (!payable) {
        return { success: false, message: "Payable not found" };
      }
      if (payable.status === "paid") {
        return { success: false, message: "This payable is already fully paid" };
      }
      if (payable.status === "cancelled") {
        return { success: false, message: "Cannot record payment for cancelled payable" };
      }
      if (data.amount <= 0) {
        return { success: false, message: "Payment amount must be greater than 0" };
      }
      if (data.amount > payable.remainingAmount) {
        return {
          success: false,
          message: `Payment amount cannot exceed remaining balance of ${payable.remainingAmount}`
        };
      }
      const newPaidAmount = payable.paidAmount + data.amount;
      const newRemainingAmount = payable.totalAmount - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? "paid" : "partial";
      const result = await withTransaction(async ({ db: txDb }) => {
        const [payment] = await txDb.insert(payablePayments).values({
          payableId: data.payableId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          paidBy: session.userId
        }).returning();
        await txDb.update(accountPayables).set({
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(accountPayables.id, data.payableId));
        if (newStatus === "paid") {
          const linkedExpense = await txDb.query.expenses.findFirst({
            where: drizzleOrm.eq(expenses.payableId, payable.id)
          });
          if (linkedExpense && linkedExpense.paymentStatus === "unpaid") {
            await txDb.update(expenses).set({
              paymentStatus: "paid",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(drizzleOrm.eq(expenses.id, linkedExpense.id));
          }
        }
        await postAPPaymentToGL(
          {
            id: payment.id,
            payableId: data.payableId,
            branchId: payable.branchId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            invoiceNumber: payable.invoiceNumber
          },
          session.userId
        );
        return payment;
      });
      if (newStatus === "paid") {
        const linkedExpense = await db2.query.expenses.findFirst({
          where: drizzleOrm.eq(expenses.payableId, payable.id)
        });
        if (linkedExpense && linkedExpense.paymentStatus === "paid") {
          await createAuditLog$1({
            userId: session.userId,
            branchId: linkedExpense.branchId,
            action: "update",
            entityType: "expense",
            entityId: linkedExpense.id,
            oldValues: { paymentStatus: "unpaid" },
            newValues: { paymentStatus: "paid" },
            description: `Auto-updated expense status to paid (payable #${payable.id} fully paid)`
          });
        }
      }
      await createAuditLog$1({
        userId: session.userId,
        branchId: payable.branchId,
        action: "payment",
        entityType: "account_payable",
        entityId: data.payableId,
        oldValues: {
          paidAmount: payable.paidAmount,
          remainingAmount: payable.remainingAmount,
          status: payable.status
        },
        newValues: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paymentAmount: data.amount,
          paymentMethod: data.paymentMethod
        },
        description: `Recorded payment of ${data.amount} for payable ${payable.invoiceNumber}`
      });
      return {
        success: true,
        data: result,
        payable: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus
        }
      };
    } catch (error) {
      console.error("Record payment error:", error);
      return { success: false, message: "Failed to record payment" };
    }
  });
  electron.ipcMain.handle("payables:cancel", async (_, id, reason) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const payable = await db2.query.accountPayables.findFirst({
        where: drizzleOrm.eq(accountPayables.id, id)
      });
      if (!payable) {
        return { success: false, message: "Payable not found" };
      }
      if (payable.status === "paid") {
        return { success: false, message: "Cannot cancel a fully paid payable" };
      }
      if (payable.paidAmount > 0) {
        return { success: false, message: "Cannot cancel payable with existing payments" };
      }
      await db2.update(accountPayables).set({
        status: "cancelled",
        notes: reason ? `${payable.notes || ""}
Cancelled: ${reason}`.trim() : payable.notes,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(accountPayables.id, id));
      await createAuditLog$1({
        userId: session.userId,
        branchId: payable.branchId,
        action: "cancel",
        entityType: "account_payable",
        entityId: id,
        oldValues: { status: payable.status },
        newValues: { status: "cancelled", reason },
        description: `Cancelled payable ${payable.invoiceNumber}`
      });
      return { success: true, message: "Payable cancelled successfully" };
    } catch (error) {
      console.error("Cancel payable error:", error);
      return { success: false, message: "Failed to cancel payable" };
    }
  });
  electron.ipcMain.handle("payables:get-summary", async (_, branchId) => {
    try {
      const conditions = [];
      if (branchId) conditions.push(drizzleOrm.eq(accountPayables.branchId, branchId));
      const statusQuery = await db2.select({
        status: accountPayables.status,
        count: drizzleOrm.sql`count(*)`,
        totalAmount: drizzleOrm.sql`sum(${accountPayables.totalAmount})`,
        remainingAmount: drizzleOrm.sql`sum(${accountPayables.remainingAmount})`
      }).from(accountPayables).where(conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0).groupBy(accountPayables.status);
      const totalsQuery = await db2.select({
        totalPayables: drizzleOrm.sql`count(*)`,
        totalAmount: drizzleOrm.sql`sum(${accountPayables.totalAmount})`,
        totalPaid: drizzleOrm.sql`sum(${accountPayables.paidAmount})`,
        totalRemaining: drizzleOrm.sql`sum(${accountPayables.remainingAmount})`
      }).from(accountPayables).where(
        drizzleOrm.and(
          ...conditions.length > 0 ? conditions : [],
          drizzleOrm.or(
            drizzleOrm.eq(accountPayables.status, "pending"),
            drizzleOrm.eq(accountPayables.status, "partial"),
            drizzleOrm.eq(accountPayables.status, "overdue")
          )
        )
      );
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const overdueQuery = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(accountPayables).where(
        drizzleOrm.and(
          ...conditions.length > 0 ? conditions : [],
          drizzleOrm.lte(accountPayables.dueDate, today),
          drizzleOrm.or(drizzleOrm.eq(accountPayables.status, "pending"), drizzleOrm.eq(accountPayables.status, "partial"))
        )
      );
      await db2.update(accountPayables).set({ status: "overdue", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(
        drizzleOrm.and(
          drizzleOrm.lte(accountPayables.dueDate, today),
          drizzleOrm.or(drizzleOrm.eq(accountPayables.status, "pending"), drizzleOrm.eq(accountPayables.status, "partial"))
        )
      );
      return {
        success: true,
        data: {
          byStatus: statusQuery,
          totals: totalsQuery[0] ?? {
            totalPayables: 0,
            totalAmount: 0,
            totalPaid: 0,
            totalRemaining: 0
          },
          overdueCount: overdueQuery[0]?.count ?? 0
        }
      };
    } catch (error) {
      console.error("Get summary error:", error);
      return { success: false, message: "Failed to fetch summary" };
    }
  });
  electron.ipcMain.handle("payables:get-aging-report", async (_, branchId) => {
    try {
      const today = /* @__PURE__ */ new Date();
      const conditions = [
        drizzleOrm.or(
          drizzleOrm.eq(accountPayables.status, "pending"),
          drizzleOrm.eq(accountPayables.status, "partial"),
          drizzleOrm.eq(accountPayables.status, "overdue")
        )
      ];
      if (branchId) conditions.push(drizzleOrm.eq(accountPayables.branchId, branchId));
      const outstandingPayables = await db2.query.accountPayables.findMany({
        where: drizzleOrm.and(...conditions),
        with: {
          supplier: true,
          branch: true
        },
        orderBy: drizzleOrm.desc(accountPayables.dueDate)
      });
      const aging = {
        current: { amount: 0, count: 0 },
        days1to30: { amount: 0, count: 0 },
        days31to60: { amount: 0, count: 0 },
        days61to90: { amount: 0, count: 0 },
        days90plus: { amount: 0, count: 0 }
      };
      const upcomingPayments = [];
      const overdueBySupplier = /* @__PURE__ */ new Map();
      for (const payable of outstandingPayables) {
        const dueDate = payable.dueDate ? new Date(payable.dueDate) : null;
        const amount = payable.remainingAmount;
        if (!dueDate) {
          aging.current.amount += amount;
          aging.current.count++;
          continue;
        }
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysDiff <= 0) {
          aging.current.amount += amount;
          aging.current.count++;
          if (daysDiff >= -7) {
            upcomingPayments.push({
              supplier: payable.supplier?.name || "Unknown",
              amount,
              dueDate: payable.dueDate,
              daysUntilDue: Math.abs(daysDiff)
            });
          }
        } else if (daysDiff <= 30) {
          aging.days1to30.amount += amount;
          aging.days1to30.count++;
        } else if (daysDiff <= 60) {
          aging.days31to60.amount += amount;
          aging.days31to60.count++;
        } else if (daysDiff <= 90) {
          aging.days61to90.amount += amount;
          aging.days61to90.count++;
        } else {
          aging.days90plus.amount += amount;
          aging.days90plus.count++;
        }
        if (daysDiff > 0 && payable.supplier) {
          const existing = overdueBySupplier.get(payable.supplier.id);
          if (existing) {
            existing.amount += amount;
            if (daysDiff > existing.daysOverdue) {
              existing.daysOverdue = daysDiff;
              existing.oldestDueDate = payable.dueDate;
            }
          } else {
            overdueBySupplier.set(payable.supplier.id, {
              supplier: payable.supplier.name,
              amount,
              oldestDueDate: payable.dueDate,
              daysOverdue: daysDiff
            });
          }
        }
      }
      const totalOutstanding = aging.current.amount + aging.days1to30.amount + aging.days31to60.amount + aging.days61to90.amount + aging.days90plus.amount;
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const purchasesResult = await db2.select({
        totalPurchases: drizzleOrm.sql`sum(${accountPayables.totalAmount})`
      }).from(accountPayables).where(
        drizzleOrm.and(
          drizzleOrm.gte(accountPayables.createdAt, oneYearAgo.toISOString()),
          ...branchId ? [drizzleOrm.eq(accountPayables.branchId, branchId)] : []
        )
      );
      const totalPurchases = purchasesResult[0]?.totalPurchases || 0;
      const dpo = totalPurchases > 0 ? Math.round(totalOutstanding / (totalPurchases / 365) * 10) / 10 : 0;
      upcomingPayments.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      const topOverdue = Array.from(overdueBySupplier.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
      return {
        success: true,
        data: {
          totalOutstanding,
          dpo,
          aging,
          upcomingPayments: upcomingPayments.slice(0, 5),
          topOverdue
        }
      };
    } catch (error) {
      console.error("Get aging report error:", error);
      return { success: false, message: "Failed to fetch aging report" };
    }
  });
  electron.ipcMain.handle("payables:get-payments", async (_, payableId) => {
    try {
      const payments = await db2.query.payablePayments.findMany({
        where: drizzleOrm.eq(payablePayments.payableId, payableId),
        orderBy: drizzleOrm.desc(payablePayments.paymentDate),
        with: {
          paidByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      return { success: true, data: payments };
    } catch (error) {
      console.error("Get payments error:", error);
      return { success: false, message: "Failed to fetch payments" };
    }
  });
}
function registerReferralPersonHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle(
    "referral-persons:get-all",
    async (_, params) => {
      try {
        const { page = 1, limit = 20, sortOrder = "desc", branchId, isActive, searchTerm } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(referralPersons.branchId, branchId));
        if (isActive !== void 0)
          conditions.push(drizzleOrm.eq(referralPersons.isActive, isActive));
        if (searchTerm) {
          conditions.push(
            drizzleOrm.or(
              drizzleOrm.like(referralPersons.name, `%${searchTerm}%`),
              drizzleOrm.like(referralPersons.contact, `%${searchTerm}%`),
              drizzleOrm.like(referralPersons.address, `%${searchTerm}%`)
            )
          );
        }
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(referralPersons).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.select().from(referralPersons).where(whereClause).limit(limit).offset((page - 1) * limit).orderBy(
          sortOrder === "desc" ? drizzleOrm.desc(referralPersons.createdAt) : referralPersons.createdAt
        );
        const result = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
        return { success: true, ...result };
      } catch (error) {
        console.error("Get referral persons error:", error);
        return { success: false, message: "Failed to fetch referral persons" };
      }
    }
  );
  electron.ipcMain.handle("referral-persons:get-by-id", async (_, id) => {
    try {
      const [referralPerson] = await db2.select().from(referralPersons).where(drizzleOrm.eq(referralPersons.id, id)).limit(1);
      if (!referralPerson) {
        return { success: false, message: "Referral person not found" };
      }
      return { success: true, data: referralPerson };
    } catch (error) {
      console.error("Get referral person error:", error);
      return { success: false, message: "Failed to fetch referral person" };
    }
  });
  electron.ipcMain.handle("referral-persons:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      const [newReferralPerson] = await db2.insert(referralPersons).values({
        ...data,
        branchId: data.branchId || session?.branchId || 1,
        totalCommissionEarned: data.totalCommissionEarned || 0,
        totalCommissionPaid: data.totalCommissionPaid || 0
      }).returning();
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId || data.branchId,
        action: "create",
        entityType: "referral_person",
        entityId: newReferralPerson.id,
        newValues: { name: data.name, contact: data.contact },
        description: `Created referral person: ${data.name}`
      });
      return { success: true, data: newReferralPerson };
    } catch (error) {
      console.error("Create referral person error:", error);
      return { success: false, message: "Failed to create referral person" };
    }
  });
  electron.ipcMain.handle(
    "referral-persons:update",
    async (_, id, data) => {
      try {
        const session = getCurrentSession();
        const [existing] = await db2.select().from(referralPersons).where(drizzleOrm.eq(referralPersons.id, id)).limit(1);
        if (!existing) {
          return { success: false, message: "Referral person not found" };
        }
        const [updated] = await db2.update(referralPersons).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(referralPersons.id, id)).returning();
        await createAuditLog$1({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "update",
          entityType: "referral_person",
          entityId: id,
          newValues: data,
          oldValues: existing,
          description: `Updated referral person: ${existing.name}`
        });
        return { success: true, data: updated };
      } catch (error) {
        console.error("Update referral person error:", error);
        return { success: false, message: "Failed to update referral person" };
      }
    }
  );
  electron.ipcMain.handle("referral-persons:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      const [existing] = await db2.select().from(referralPersons).where(drizzleOrm.eq(referralPersons.id, id)).limit(1);
      if (!existing) {
        return { success: false, message: "Referral person not found" };
      }
      await db2.delete(referralPersons).where(drizzleOrm.eq(referralPersons.id, id));
      await createAuditLog$1({
        userId: session?.userId,
        branchId: session?.branchId,
        action: "delete",
        entityType: "referral_person",
        entityId: id,
        oldValues: existing,
        description: `Deleted referral person: ${existing.name}`
      });
      return { success: true, message: "Referral person deleted successfully" };
    } catch (error) {
      console.error("Delete referral person error:", error);
      return { success: false, message: "Failed to delete referral person" };
    }
  });
  electron.ipcMain.handle("referral-persons:get-for-select", async (_, branchId) => {
    try {
      const session = getCurrentSession();
      const targetBranchId = branchId || session?.branchId;
      const data = await db2.select().from(referralPersons).where(
        drizzleOrm.and(
          targetBranchId ? drizzleOrm.eq(referralPersons.branchId, targetBranchId) : void 0,
          drizzleOrm.eq(referralPersons.isActive, true)
        )
      ).orderBy(referralPersons.name);
      return { success: true, data };
    } catch (error) {
      console.error("Get referral persons for select error:", error);
      return { success: false, message: "Failed to fetch referral persons" };
    }
  });
  electron.ipcMain.handle("referral-persons:update-commission", async (_, id, amount, isPaid = false) => {
    try {
      const [existing] = await db2.select().from(referralPersons).where(drizzleOrm.eq(referralPersons.id, id)).limit(1);
      if (!existing) {
        return { success: false, message: "Referral person not found" };
      }
      const updates = {
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (isPaid) {
        updates.totalCommissionPaid = (existing.totalCommissionPaid || 0) + amount;
      } else {
        updates.totalCommissionEarned = (existing.totalCommissionEarned || 0) + amount;
      }
      const [updated] = await db2.update(referralPersons).set(updates).where(drizzleOrm.eq(referralPersons.id, id)).returning();
      return { success: true, data: updated };
    } catch (error) {
      console.error("Update commission error:", error);
      return { success: false, message: "Failed to update commission totals" };
    }
  });
}
function registerCashRegisterHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("cash-register:get-current-session", async (_, branchId) => {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const session = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.and(
          drizzleOrm.eq(cashRegisterSessions.branchId, branchId),
          drizzleOrm.eq(cashRegisterSessions.sessionDate, today),
          drizzleOrm.eq(cashRegisterSessions.status, "open")
        ),
        with: {
          branch: true,
          openedByUser: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          transactions: {
            orderBy: drizzleOrm.desc(cashTransactions.transactionDate),
            limit: 10
          }
        }
      });
      if (!session) {
        return { success: true, data: null, message: "No open session found" };
      }
      const transactionSums = await db2.select({
        totalIn: drizzleOrm.sql`sum(case when ${cashTransactions.amount} > 0 then ${cashTransactions.amount} else 0 end)`,
        totalOut: drizzleOrm.sql`sum(case when ${cashTransactions.amount} < 0 then abs(${cashTransactions.amount}) else 0 end)`
      }).from(cashTransactions).where(drizzleOrm.eq(cashTransactions.sessionId, session.id));
      const totalIn = transactionSums[0]?.totalIn || 0;
      const totalOut = transactionSums[0]?.totalOut || 0;
      const currentBalance = session.openingBalance + totalIn - totalOut;
      return {
        success: true,
        data: {
          ...session,
          currentBalance,
          totalIn,
          totalOut
        }
      };
    } catch (error) {
      console.error("Get current session error:", error);
      return { success: false, message: "Failed to fetch current session" };
    }
  });
  electron.ipcMain.handle("cash-register:open-session", async (_, data) => {
    try {
      const userSession = getCurrentSession();
      if (!userSession) {
        return { success: false, message: "Unauthorized" };
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const existingSession = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.and(
          drizzleOrm.eq(cashRegisterSessions.branchId, data.branchId),
          drizzleOrm.eq(cashRegisterSessions.sessionDate, today)
        )
      });
      if (existingSession) {
        if (existingSession.status === "open") {
          return { success: false, message: "A cash register session is already open for today" };
        }
        return { success: false, message: "Cash register session for today has already been closed" };
      }
      const previousSession = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.and(
          drizzleOrm.eq(cashRegisterSessions.branchId, data.branchId),
          drizzleOrm.eq(cashRegisterSessions.status, "closed")
        ),
        orderBy: drizzleOrm.desc(cashRegisterSessions.sessionDate)
      });
      const [newSession] = await db2.insert(cashRegisterSessions).values({
        branchId: data.branchId,
        sessionDate: today,
        openingBalance: data.openingBalance,
        status: "open",
        openedBy: userSession.userId,
        notes: data.notes
      }).returning();
      await createAuditLog$1({
        userId: userSession.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "cash_register_session",
        entityId: newSession.id,
        newValues: {
          openingBalance: data.openingBalance,
          sessionDate: today
        },
        description: `Opened cash register session with balance ${data.openingBalance}`
      });
      return {
        success: true,
        data: newSession,
        previousClosingBalance: previousSession?.closingBalance
      };
    } catch (error) {
      console.error("Open session error:", error);
      return { success: false, message: "Failed to open cash register session" };
    }
  });
  electron.ipcMain.handle("cash-register:close-session", async (_, data) => {
    try {
      const userSession = getCurrentSession();
      if (!userSession) {
        return { success: false, message: "Unauthorized" };
      }
      const session = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.eq(cashRegisterSessions.id, data.sessionId)
      });
      if (!session) {
        return { success: false, message: "Session not found" };
      }
      if (session.status !== "open") {
        return { success: false, message: "Session is already closed" };
      }
      const transactionSums = await db2.select({
        totalIn: drizzleOrm.sql`sum(case when ${cashTransactions.amount} > 0 then ${cashTransactions.amount} else 0 end)`,
        totalOut: drizzleOrm.sql`sum(case when ${cashTransactions.amount} < 0 then abs(${cashTransactions.amount}) else 0 end)`
      }).from(cashTransactions).where(drizzleOrm.eq(cashTransactions.sessionId, data.sessionId));
      const totalIn = transactionSums[0]?.totalIn || 0;
      const totalOut = transactionSums[0]?.totalOut || 0;
      const expectedBalance = session.openingBalance + totalIn - totalOut;
      const variance = data.actualBalance - expectedBalance;
      await db2.update(cashRegisterSessions).set({
        closingBalance: data.actualBalance,
        expectedBalance,
        actualBalance: data.actualBalance,
        variance,
        status: "closed",
        closedBy: userSession.userId,
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        notes: data.notes ? `${session.notes || ""}
${data.notes}`.trim() : session.notes,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(cashRegisterSessions.id, data.sessionId));
      await createAuditLog$1({
        userId: userSession.userId,
        branchId: session.branchId,
        action: "close",
        entityType: "cash_register_session",
        entityId: data.sessionId,
        oldValues: {
          status: "open",
          openingBalance: session.openingBalance
        },
        newValues: {
          status: "closed",
          closingBalance: data.actualBalance,
          expectedBalance,
          variance
        },
        description: `Closed cash register session. Expected: ${expectedBalance}, Actual: ${data.actualBalance}, Variance: ${variance}`
      });
      return {
        success: true,
        data: {
          closingBalance: data.actualBalance,
          expectedBalance,
          variance,
          variancePercent: expectedBalance > 0 ? variance / expectedBalance * 100 : 0
        }
      };
    } catch (error) {
      console.error("Close session error:", error);
      return { success: false, message: "Failed to close session" };
    }
  });
  electron.ipcMain.handle("cash-register:record-transaction", async (_, data) => {
    try {
      const userSession = getCurrentSession();
      if (!userSession) {
        return { success: false, message: "Unauthorized" };
      }
      const session = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.eq(cashRegisterSessions.id, data.sessionId)
      });
      if (!session) {
        return { success: false, message: "Cash register session not found" };
      }
      if (session.status !== "open") {
        return { success: false, message: "Cannot record transaction: session is closed" };
      }
      let adjustedAmount = data.amount;
      const outflowTypes = ["refund", "expense", "ap_payment", "deposit", "petty_cash_out"];
      if (outflowTypes.includes(data.transactionType)) {
        adjustedAmount = -Math.abs(data.amount);
      } else {
        adjustedAmount = Math.abs(data.amount);
      }
      const [transaction] = await db2.insert(cashTransactions).values({
        sessionId: data.sessionId,
        branchId: data.branchId,
        transactionType: data.transactionType,
        amount: adjustedAmount,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        description: data.description,
        recordedBy: userSession.userId
      }).returning();
      return { success: true, data: transaction };
    } catch (error) {
      console.error("Record transaction error:", error);
      return { success: false, message: "Failed to record transaction" };
    }
  });
  electron.ipcMain.handle(
    "cash-register:get-history",
    async (_, params) => {
      try {
        const { branchId, startDate, endDate, page = 1, limit = 20 } = params;
        const conditions = [];
        if (branchId) conditions.push(drizzleOrm.eq(cashRegisterSessions.branchId, branchId));
        if (startDate) conditions.push(drizzleOrm.gte(cashRegisterSessions.sessionDate, startDate));
        if (endDate) conditions.push(drizzleOrm.lte(cashRegisterSessions.sessionDate, endDate));
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(cashRegisterSessions).where(whereClause);
        const total = countResult[0]?.count ?? 0;
        const sessions = await db2.query.cashRegisterSessions.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: drizzleOrm.desc(cashRegisterSessions.sessionDate),
          with: {
            branch: true,
            openedByUser: {
              columns: { id: true, username: true, fullName: true }
            },
            closedByUser: {
              columns: { id: true, username: true, fullName: true }
            }
          }
        });
        return {
          success: true,
          data: sessions,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      } catch (error) {
        console.error("Get history error:", error);
        return { success: false, message: "Failed to fetch session history" };
      }
    }
  );
  electron.ipcMain.handle("cash-register:get-transactions", async (_, sessionId) => {
    try {
      const transactions = await db2.query.cashTransactions.findMany({
        where: drizzleOrm.eq(cashTransactions.sessionId, sessionId),
        orderBy: drizzleOrm.desc(cashTransactions.transactionDate),
        with: {
          recordedByUser: {
            columns: { id: true, username: true, fullName: true }
          }
        }
      });
      let totalIn = 0;
      let totalOut = 0;
      const byType = {};
      for (const tx of transactions) {
        if (tx.amount > 0) {
          totalIn += tx.amount;
        } else {
          totalOut += Math.abs(tx.amount);
        }
        byType[tx.transactionType] = (byType[tx.transactionType] || 0) + tx.amount;
      }
      return {
        success: true,
        data: transactions,
        summary: {
          totalIn,
          totalOut,
          netFlow: totalIn - totalOut,
          byType
        }
      };
    } catch (error) {
      console.error("Get transactions error:", error);
      return { success: false, message: "Failed to fetch transactions" };
    }
  });
  electron.ipcMain.handle(
    "cash-register:get-cash-flow-summary",
    async (_, params) => {
      try {
        const { branchId, days = 30 } = params;
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split("T")[0];
        const conditions = [drizzleOrm.gte(cashRegisterSessions.sessionDate, startDateStr)];
        if (branchId) conditions.push(drizzleOrm.eq(cashRegisterSessions.branchId, branchId));
        const dailyFlow = await db2.select({
          date: cashRegisterSessions.sessionDate,
          openingBalance: cashRegisterSessions.openingBalance,
          closingBalance: cashRegisterSessions.closingBalance,
          variance: cashRegisterSessions.variance
        }).from(cashRegisterSessions).where(drizzleOrm.and(...conditions, drizzleOrm.eq(cashRegisterSessions.status, "closed"))).orderBy(cashRegisterSessions.sessionDate);
        const txConditions = [drizzleOrm.gte(cashTransactions.transactionDate, startDate.toISOString())];
        if (branchId) txConditions.push(drizzleOrm.eq(cashTransactions.branchId, branchId));
        const transactionBreakdown = await db2.select({
          transactionType: cashTransactions.transactionType,
          totalAmount: drizzleOrm.sql`sum(${cashTransactions.amount})`,
          count: drizzleOrm.sql`count(*)`
        }).from(cashTransactions).where(drizzleOrm.and(...txConditions)).groupBy(cashTransactions.transactionType);
        const inflows = transactionBreakdown.filter((t) => (t.totalAmount || 0) > 0).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
        const outflows = Math.abs(
          transactionBreakdown.filter((t) => (t.totalAmount || 0) < 0).reduce((sum, t) => sum + (t.totalAmount || 0), 0)
        );
        const latestSession = await db2.query.cashRegisterSessions.findFirst({
          where: drizzleOrm.and(
            drizzleOrm.eq(cashRegisterSessions.status, "closed"),
            ...branchId ? [drizzleOrm.eq(cashRegisterSessions.branchId, branchId)] : []
          ),
          orderBy: drizzleOrm.desc(cashRegisterSessions.sessionDate)
        });
        return {
          success: true,
          data: {
            currentCashInHand: latestSession?.closingBalance || 0,
            periodSummary: {
              days,
              totalInflows: inflows,
              totalOutflows: outflows,
              netCashFlow: inflows - outflows
            },
            dailyFlow,
            transactionBreakdown
          }
        };
      } catch (error) {
        console.error("Get cash flow summary error:", error);
        return { success: false, message: "Failed to fetch cash flow summary" };
      }
    }
  );
  electron.ipcMain.handle(
    "cash-register:adjust",
    async (_, data) => {
      try {
        const userSession = getCurrentSession();
        if (!userSession) {
          return { success: false, message: "Unauthorized" };
        }
        if (userSession.role !== "admin") {
          return { success: false, message: "Only admins can make manual adjustments" };
        }
        const session = await db2.query.cashRegisterSessions.findFirst({
          where: drizzleOrm.eq(cashRegisterSessions.id, data.sessionId)
        });
        if (!session) {
          return { success: false, message: "Session not found" };
        }
        if (session.status !== "open") {
          return { success: false, message: "Cannot adjust: session is closed" };
        }
        const [transaction] = await db2.insert(cashTransactions).values({
          sessionId: data.sessionId,
          branchId: session.branchId,
          transactionType: "adjustment",
          amount: data.amount,
          description: `Manual adjustment: ${data.reason}`,
          recordedBy: userSession.userId
        }).returning();
        await createAuditLog$1({
          userId: userSession.userId,
          branchId: session.branchId,
          action: "adjustment",
          entityType: "cash_register",
          entityId: data.sessionId,
          newValues: {
            amount: data.amount,
            reason: data.reason
          },
          description: `Manual cash adjustment of ${data.amount}: ${data.reason}`
        });
        return { success: true, data: transaction };
      } catch (error) {
        console.error("Adjustment error:", error);
        return { success: false, message: "Failed to record adjustment" };
      }
    }
  );
}
function registerChartOfAccountsHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("coa:get-all", async () => {
    return db2.query.chartOfAccounts.findMany({
      orderBy: [chartOfAccounts.accountCode],
      with: {
        parentAccount: true,
        childAccounts: true
      }
    });
  });
  electron.ipcMain.handle(
    "coa:get-by-type",
    async (_, accountType) => {
      return db2.query.chartOfAccounts.findMany({
        where: drizzleOrm.eq(chartOfAccounts.accountType, accountType),
        orderBy: [chartOfAccounts.accountCode]
      });
    }
  );
  electron.ipcMain.handle("coa:get-by-id", async (_, id) => {
    return db2.query.chartOfAccounts.findFirst({
      where: drizzleOrm.eq(chartOfAccounts.id, id),
      with: {
        parentAccount: true,
        childAccounts: true
      }
    });
  });
  electron.ipcMain.handle(
    "coa:create",
    async (_, data) => {
      const [account] = await db2.insert(chartOfAccounts).values({
        ...data,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).returning();
      return account;
    }
  );
  electron.ipcMain.handle(
    "coa:update",
    async (_, id, data) => {
      const [account] = await db2.update(chartOfAccounts).set({
        ...data,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(chartOfAccounts.id, id)).returning();
      return account;
    }
  );
  electron.ipcMain.handle("coa:delete", async (_, id) => {
    const account = await db2.query.chartOfAccounts.findFirst({
      where: drizzleOrm.eq(chartOfAccounts.id, id)
    });
    if (account?.isSystemAccount) {
      throw new Error("Cannot delete system accounts");
    }
    const hasEntries = await db2.query.journalEntryLines.findFirst({
      where: drizzleOrm.eq(journalEntryLines.accountId, id)
    });
    if (hasEntries) {
      throw new Error("Cannot delete account with existing transactions");
    }
    await db2.delete(chartOfAccounts).where(drizzleOrm.eq(chartOfAccounts.id, id));
    return { success: true };
  });
  electron.ipcMain.handle("coa:get-balance-sheet", async (_, branchId) => {
    const accounts = await db2.query.chartOfAccounts.findMany({
      where: drizzleOrm.and(
        drizzleOrm.eq(chartOfAccounts.isActive, true),
        drizzleOrm.sql`${chartOfAccounts.accountType} IN ('asset', 'liability', 'equity')`
      ),
      orderBy: [chartOfAccounts.accountType, chartOfAccounts.accountCode]
    });
    const assets = accounts.filter((a) => a.accountType === "asset");
    const liabilities = accounts.filter((a) => a.accountType === "liability");
    const equity = accounts.filter((a) => a.accountType === "equity");
    const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.currentBalance, 0);
    return {
      assets: {
        accounts: assets,
        total: totalAssets
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities
      },
      equity: {
        accounts: equity,
        total: totalEquity
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
  });
  electron.ipcMain.handle(
    "coa:get-income-statement",
    async (_, startDate, endDate, branchId) => {
      const accounts = await db2.query.chartOfAccounts.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(chartOfAccounts.isActive, true),
          drizzleOrm.sql`${chartOfAccounts.accountType} IN ('revenue', 'expense')`
        ),
        orderBy: [chartOfAccounts.accountType, chartOfAccounts.accountCode]
      });
      const revenue = accounts.filter((a) => a.accountType === "revenue");
      const expenses2 = accounts.filter((a) => a.accountType === "expense");
      const totalRevenue = revenue.reduce((sum, a) => sum + a.currentBalance, 0);
      const totalExpenses = expenses2.reduce((sum, a) => sum + a.currentBalance, 0);
      const netIncome = totalRevenue - totalExpenses;
      return {
        revenue: {
          accounts: revenue,
          total: totalRevenue
        },
        expenses: {
          accounts: expenses2,
          total: totalExpenses
        },
        netIncome,
        startDate,
        endDate
      };
    }
  );
  electron.ipcMain.handle("coa:get-trial-balance", async (_, asOfDate) => {
    const accounts = await db2.query.chartOfAccounts.findMany({
      where: drizzleOrm.eq(chartOfAccounts.isActive, true),
      orderBy: [chartOfAccounts.accountCode]
    });
    let totalDebits = 0;
    let totalCredits = 0;
    const trialBalanceData = accounts.map((account) => {
      const debit = account.normalBalance === "debit" ? account.currentBalance : 0;
      const credit = account.normalBalance === "credit" ? account.currentBalance : 0;
      totalDebits += debit;
      totalCredits += credit;
      return {
        ...account,
        debit,
        credit
      };
    });
    return {
      accounts: trialBalanceData,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      asOfDate: asOfDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
  });
  electron.ipcMain.handle(
    "journal:create",
    async (_, data) => {
      const totalDebits = data.lines.reduce((sum, line) => sum + line.debitAmount, 0);
      const totalCredits = data.lines.reduce((sum, line) => sum + line.creditAmount, 0);
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error("Journal entry must be balanced (debits must equal credits)");
      }
      const year = (/* @__PURE__ */ new Date()).getFullYear();
      const countResult = await db2.select({ count: drizzleOrm.sql`COUNT(*)` }).from(journalEntries).where(drizzleOrm.sql`${journalEntries.entryNumber} LIKE ${"JE-" + year + "-%"}`);
      const count = countResult[0]?.count || 0;
      const entryNumber = `JE-${year}-${String(count + 1).padStart(4, "0")}`;
      const [entry] = await db2.insert(journalEntries).values({
        entryNumber,
        entryDate: data.entryDate,
        description: data.description,
        branchId: data.branchId,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        createdBy: data.createdBy,
        status: "draft",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).returning();
      for (const line of data.lines) {
        await db2.insert(journalEntryLines).values({
          journalEntryId: entry.id,
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return entry;
    }
  );
  electron.ipcMain.handle("journal:post", async (_, entryId, postedBy) => {
    const entry = await db2.query.journalEntries.findFirst({
      where: drizzleOrm.eq(journalEntries.id, entryId),
      with: {
        lines: {
          with: {
            account: true
          }
        }
      }
    });
    if (!entry) {
      throw new Error("Journal entry not found");
    }
    if (entry.status !== "draft") {
      throw new Error("Only draft entries can be posted");
    }
    for (const line of entry.lines) {
      const account = line.account;
      if (!account) continue;
      let newBalance = account.currentBalance;
      if (account.normalBalance === "debit") {
        newBalance += line.debitAmount - line.creditAmount;
      } else {
        newBalance += line.creditAmount - line.debitAmount;
      }
      await db2.update(chartOfAccounts).set({
        currentBalance: newBalance,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(chartOfAccounts.id, account.id));
    }
    const [updated] = await db2.update(journalEntries).set({
      status: "posted",
      postedBy,
      postedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(drizzleOrm.eq(journalEntries.id, entryId)).returning();
    return updated;
  });
  electron.ipcMain.handle(
    "journal:get-all",
    async (_, filters) => {
      return db2.query.journalEntries.findMany({
        orderBy: [drizzleOrm.desc(journalEntries.entryDate), drizzleOrm.desc(journalEntries.id)],
        with: {
          lines: {
            with: {
              account: true
            }
          },
          createdByUser: true,
          postedByUser: true
        },
        limit: 100
      });
    }
  );
  electron.ipcMain.handle("journal:get-by-id", async (_, id) => {
    return db2.query.journalEntries.findFirst({
      where: drizzleOrm.eq(journalEntries.id, id),
      with: {
        lines: {
          with: {
            account: true
          }
        },
        createdByUser: true,
        postedByUser: true
      }
    });
  });
  electron.ipcMain.handle(
    "coa:get-ledger",
    async (_, accountId, startDate, endDate) => {
      const account = await db2.query.chartOfAccounts.findFirst({
        where: drizzleOrm.eq(chartOfAccounts.id, accountId)
      });
      if (!account) {
        throw new Error("Account not found");
      }
      const lines = await db2.query.journalEntryLines.findMany({
        where: drizzleOrm.eq(journalEntryLines.accountId, accountId),
        with: {
          journalEntry: true
        },
        orderBy: [drizzleOrm.desc(journalEntryLines.createdAt)]
      });
      const postedLines = lines.filter((l) => l.journalEntry?.status === "posted");
      let runningBalance = 0;
      const ledgerEntries = postedLines.reverse().map((line) => {
        if (account.normalBalance === "debit") {
          runningBalance += line.debitAmount - line.creditAmount;
        } else {
          runningBalance += line.creditAmount - line.debitAmount;
        }
        return {
          ...line,
          runningBalance
        };
      });
      return {
        account,
        entries: ledgerEntries.reverse(),
        currentBalance: runningBalance
      };
    }
  );
}
const fontSizeMap = {
  small: { base: 11, header: 16, title: 24, caption: 9 },
  medium: { base: 12, header: 18, title: 28, caption: 10 },
  large: { base: 14, header: 20, title: 32, caption: 11 }
};
const designColors = {
  // Primary palette
  primary900: "#0c1929",
  primary700: "#1e3a5f",
  primary500: "#2563eb",
  accentGold: "#c9a962",
  accentEmerald: "#059669",
  accentRose: "#dc2626",
  // Neutral palette
  gray900: "#111827",
  gray600: "#4b5563",
  gray400: "#9ca3af",
  gray100: "#f3f4f6",
  gray50: "#f9fafb"
};
function formatCurrency(amount, settings2) {
  const symbol = settings2.currencySymbol || "Rs.";
  const position = settings2.currencyPosition || "prefix";
  const formatted = amount.toFixed(settings2.decimalPlaces || 2);
  return position === "prefix" ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}
function getPaymentMethodLabel(method) {
  const labels = {
    cash: "Cash",
    card: "Card",
    credit: "Credit",
    mixed: "Mixed",
    mobile: "Mobile Payment",
    cod: "Cash on Delivery",
    receivable: "Pay Later",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque"
  };
  return labels[method] || method;
}
function generatePDFReceiptHTML(data) {
  const { sale, items, customer, businessSettings: settings2 } = data;
  const fontSize = fontSizeMap[settings2.receiptFontSize] || fontSizeMap.medium;
  const colors = designColors;
  const showTax = settings2.showTaxOnReceipt !== false;
  const showLogo = settings2.receiptShowBusinessLogo !== false;
  let customFieldsHTML = "";
  if (settings2.receiptCustomField1Label && settings2.receiptCustomField1Value) {
    customFieldsHTML += `<div class="custom-field"><span class="cf-label">${settings2.receiptCustomField1Label}</span><span class="cf-value">${settings2.receiptCustomField1Value}</span></div>`;
  }
  if (settings2.receiptCustomField2Label && settings2.receiptCustomField2Value) {
    customFieldsHTML += `<div class="custom-field"><span class="cf-label">${settings2.receiptCustomField2Label}</span><span class="cf-value">${settings2.receiptCustomField2Value}</span></div>`;
  }
  if (settings2.receiptCustomField3Label && settings2.receiptCustomField3Value) {
    customFieldsHTML += `<div class="custom-field"><span class="cf-label">${settings2.receiptCustomField3Label}</span><span class="cf-value">${settings2.receiptCustomField3Value}</span></div>`;
  }
  const itemsHTML = items.map(
    (item, index2) => `
      <tr class="${index2 % 2 === 0 ? "row-even" : "row-odd"}">
        <td class="item-cell">
          <span class="item-name">${item.productName}</span>
          ${item.serialNumber ? `<span class="item-serial">S/N: ${item.serialNumber}</span>` : ""}
        </td>
        <td class="text-center qty-cell">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice, settings2)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(item.taxAmount, settings2)}</td>` : ""}
        <td class="text-right amount-cell">${formatCurrency(item.totalPrice, settings2)}</td>
      </tr>
    `
  ).join("");
  const saleDate = new Date(sale.saleDate);
  const formattedDate = saleDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const formattedTime = saleDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --primary-900: ${colors.primary900};
          --primary-700: ${colors.primary700};
          --primary-500: ${colors.primary500};
          --accent-gold: ${colors.accentGold};
          --accent-emerald: ${colors.accentEmerald};
          --accent-rose: ${colors.accentRose};
          --gray-900: ${colors.gray900};
          --gray-600: ${colors.gray600};
          --gray-400: ${colors.gray400};
          --gray-100: ${colors.gray100};
          --gray-50: ${colors.gray50};
        }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          font-size: ${fontSize.base}px;
          line-height: 1.6;
          color: var(--gray-900);
          padding: 40px;
          background: white;
        }

        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header Section */
        .header {
          text-align: center;
          padding-bottom: 25px;
          margin-bottom: 30px;
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
        }

        .business-logo {
          max-width: 100px;
          max-height: 70px;
          margin-bottom: 15px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .business-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.title}px;
          font-weight: 700;
          color: var(--primary-900);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .business-info {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
        }

        .receipt-header-text {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-top: 12px;
          font-style: italic;
        }

        /* Invoice Details */
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 20px 25px;
          background: var(--gray-50);
          border-radius: 12px;
          border: 1px solid var(--gray-100);
        }

        .invoice-left, .invoice-right {
          flex: 1;
        }

        .invoice-right {
          text-align: right;
        }

        .invoice-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .invoice-number {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: ${fontSize.header}px;
          font-weight: 700;
          color: var(--primary-900);
          background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .invoice-date {
          font-size: ${fontSize.base + 1}px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .invoice-time {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          margin-top: 2px;
        }

        /* Customer Card */
        .customer-info {
          margin-bottom: 25px;
          padding: 18px 20px;
          background: white;
          border-left: 4px solid var(--accent-gold);
          border-radius: 0 12px 12px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .customer-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .customer-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header}px;
          font-weight: 600;
          color: var(--primary-900);
          margin-bottom: 4px;
        }

        .customer-contact {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-top: 2px;
        }

        /* Items Table */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
        }

        thead {
          background: var(--primary-900);
        }

        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: ${fontSize.base}px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        th:first-child {
          border-radius: 8px 0 0 0;
        }

        th:last-child {
          border-radius: 0 8px 0 0;
        }

        td {
          padding: 14px 12px;
          font-size: ${fontSize.base}px;
          border-bottom: 1px solid var(--gray-100);
        }

        .row-even {
          background: var(--gray-50);
        }

        .row-odd {
          background: white;
        }

        .item-cell {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-weight: 500;
          color: var(--gray-900);
        }

        .item-serial {
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          margin-top: 2px;
        }

        .qty-cell {
          font-weight: 600;
        }

        .amount-cell {
          font-weight: 600;
          color: var(--gray-900);
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* Totals Section */
        .totals-section {
          margin-top: 30px;
          padding: 20px;
          background: var(--gray-50);
          border-radius: 12px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: ${fontSize.base}px;
          border-bottom: 1px solid var(--gray-100);
        }

        .totals-row:last-of-type {
          border-bottom: none;
        }

        .totals-row.grand-total {
          font-size: ${fontSize.header}px;
          font-weight: 700;
          color: var(--primary-900);
          border-top: 3px solid var(--accent-gold);
          border-bottom: none;
          margin-top: 15px;
          padding-top: 20px;
        }

        .discount-value {
          color: var(--accent-rose);
          font-weight: 500;
        }

        /* Payment Info */
        .payment-info {
          margin-top: 25px;
          padding: 20px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 12px;
          border: 1px solid var(--accent-emerald);
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .payment-method-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--primary-900);
          color: white;
          border-radius: 20px;
          font-size: ${fontSize.caption}px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-amount {
          font-weight: 700;
          font-size: ${fontSize.base + 1}px;
        }

        .remaining-amount {
          color: var(--accent-rose);
        }

        /* Custom Fields */
        .custom-fields {
          margin-top: 25px;
          padding: 18px 20px;
          background: #fffbeb;
          border-radius: 12px;
          border: 1px solid #fcd34d;
        }

        .custom-field {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: ${fontSize.base}px;
        }

        .cf-label {
          font-weight: 600;
          color: var(--gray-700);
        }

        .cf-value {
          color: var(--gray-600);
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid var(--gray-100);
          text-align: center;
        }

        .footer-text {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-bottom: 15px;
        }

        .terms {
          margin-top: 20px;
          padding: 18px;
          background: var(--gray-50);
          border-radius: 8px;
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-align: left;
          white-space: pre-wrap;
        }

        .terms-title {
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .thank-you {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header + 2}px;
          color: var(--primary-900);
          font-weight: 600;
          margin-top: 25px;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          ${showLogo && settings2.businessLogo ? `<img src="${settings2.businessLogo}" class="business-logo" alt="Logo" />` : ""}
          <div class="business-name">${settings2.businessName || "Business Name"}</div>
          <div class="business-info">
            ${settings2.businessAddress ? settings2.businessAddress : ""}
            ${settings2.businessCity ? ` • ${settings2.businessCity}` : ""}
            ${settings2.businessState ? `, ${settings2.businessState}` : ""}
          </div>
          <div class="business-info">
            ${settings2.businessPhone ? settings2.businessPhone : ""}
            ${settings2.businessPhone && settings2.businessEmail ? " • " : ""}
            ${settings2.businessEmail ? settings2.businessEmail : ""}
          </div>
          ${settings2.receiptHeader ? `<div class="receipt-header-text">${settings2.receiptHeader}</div>` : ""}
        </div>

        <div class="invoice-details">
          <div class="invoice-left">
            <div class="invoice-label">Invoice Number</div>
            <div class="invoice-number">${sale.invoiceNumber}</div>
          </div>
          <div class="invoice-right">
            <div class="invoice-label">Date</div>
            <div class="invoice-date">${formattedDate}</div>
            <div class="invoice-time">${formattedTime}</div>
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-label">Bill To</div>
          <div class="customer-name">${customer?.name || "Walk-in Customer"}</div>
          ${customer?.phone ? `<div class="customer-contact">${customer.phone}</div>` : ""}
          ${customer?.email ? `<div class="customer-contact">${customer.email}</div>` : ""}
          ${customer?.address ? `<div class="customer-contact">${customer.address}</div>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              ${showTax ? '<th class="text-right">Tax</th>' : ""}
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(sale.subtotal, settings2)}</span>
          </div>
          ${showTax ? `
          <div class="totals-row">
            <span>Tax</span>
            <span>${formatCurrency(sale.taxAmount, settings2)}</span>
          </div>
          ` : ""}
          ${sale.discountAmount > 0 ? `
          <div class="totals-row">
            <span>Discount</span>
            <span class="discount-value">-${formatCurrency(sale.discountAmount, settings2)}</span>
          </div>
          ` : ""}
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${formatCurrency(sale.totalAmount, settings2)}</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="payment-row">
            <span>Payment Method</span>
            <span class="payment-method-badge">${getPaymentMethodLabel(sale.paymentMethod)}</span>
          </div>
          <div class="payment-row">
            <span>Amount Paid</span>
            <span class="payment-amount">${formatCurrency(sale.amountPaid, settings2)}</span>
          </div>
          ${sale.amountPaid < sale.totalAmount ? `
          <div class="payment-row remaining-amount">
            <span>Balance Due</span>
            <span class="payment-amount">${formatCurrency(sale.totalAmount - sale.amountPaid, settings2)}</span>
          </div>
          ` : ""}
          ${sale.changeGiven > 0 ? `
          <div class="payment-row">
            <span>Change Given</span>
            <span class="payment-amount">${formatCurrency(sale.changeGiven, settings2)}</span>
          </div>
          ` : ""}
        </div>

        ${customFieldsHTML ? `<div class="custom-fields">${customFieldsHTML}</div>` : ""}

        <div class="footer">
          ${settings2.receiptFooter ? `<div class="footer-text">${settings2.receiptFooter}</div>` : ""}
          ${settings2.receiptTermsAndConditions ? `
          <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            ${settings2.receiptTermsAndConditions}
          </div>
          ` : ""}
          <div class="thank-you">Thank You for Your Business</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateThermalReceiptHTML(data) {
  const { sale, items, customer, businessSettings: settings2 } = data;
  const showTax = settings2.showTaxOnReceipt !== false;
  const saleDate = new Date(sale.saleDate);
  const shortDate = `${saleDate.getDate().toString().padStart(2, "0")}/${(saleDate.getMonth() + 1).toString().padStart(2, "0")}/${saleDate.getFullYear().toString().slice(-2)}`;
  const shortTime = saleDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const itemsHTML = items.map(
    (item) => {
      const priceStr = formatCurrency(item.totalPrice, settings2);
      return `
      <div class="item-row">
        <div class="item-name">${item.productName.length > 28 ? item.productName.substring(0, 25) + "..." : item.productName}</div>
        ${item.serialNumber ? `<div class="item-serial">SN: ${item.serialNumber}</div>` : ""}
        <div class="item-qty-price">${item.quantity} × ${formatCurrency(item.unitPrice, settings2)}</div>
        <div class="item-total">${priceStr}</div>
      </div>
    `;
    }
  ).join("");
  let customFieldsHTML = "";
  if (settings2.receiptCustomField1Label && settings2.receiptCustomField1Value) {
    customFieldsHTML += `<div class="cf-row">${settings2.receiptCustomField1Label}: ${settings2.receiptCustomField1Value}</div>`;
  }
  if (settings2.receiptCustomField2Label && settings2.receiptCustomField2Value) {
    customFieldsHTML += `<div class="cf-row">${settings2.receiptCustomField2Label}: ${settings2.receiptCustomField2Value}</div>`;
  }
  if (settings2.receiptCustomField3Label && settings2.receiptCustomField3Value) {
    customFieldsHTML += `<div class="cf-row">${settings2.receiptCustomField3Label}: ${settings2.receiptCustomField3Value}</div>`;
  }
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          width: 302px;
          padding: 8px 10px;
          background: white;
        }

        /* Header Box */
        .header-box {
          border: 2px solid #000;
          padding: 8px;
          margin-bottom: 8px;
          text-align: center;
        }

        .business-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .business-info {
          font-size: 9px;
          margin-top: 4px;
          color: #333;
        }

        .header-msg {
          font-size: 9px;
          font-style: italic;
          margin-top: 4px;
          color: #666;
        }

        /* Dividers */
        .div-double {
          border-top: 3px double #000;
          margin: 8px 0;
        }

        .div-single {
          border-top: 1px solid #000;
          margin: 6px 0;
        }

        .div-dashed {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        /* Invoice Section */
        .invoice-section {
          margin: 8px 0;
        }

        .inv-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 2px 0;
        }

        .inv-number {
          font-weight: 700;
          font-size: 11px;
        }

        /* Customer Section */
        .customer-section {
          background: #f0f0f0;
          padding: 6px 8px;
          margin: 8px 0;
        }

        .customer-name {
          font-weight: 700;
          font-size: 11px;
        }

        .customer-contact {
          font-size: 9px;
          color: #444;
        }

        /* Items Section */
        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 10px;
          padding: 4px 0;
          border-bottom: 1px solid #000;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .item-row {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dotted #ccc;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 600;
          font-size: 10px;
        }

        .item-serial {
          font-size: 8px;
          color: #666;
          font-style: italic;
        }

        .item-qty-price {
          font-size: 9px;
          color: #444;
          margin-top: 2px;
        }

        .item-total {
          font-weight: 700;
          font-size: 10px;
          text-align: right;
        }

        /* Totals Section */
        .totals-section {
          margin: 10px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .total-row span:first-child::after {
          content: '';
        }

        .total-label {
          flex: 1;
        }

        .total-dots {
          flex: 2;
          border-bottom: 1px dotted #999;
          margin: 0 4px 3px 4px;
        }

        .total-value {
          text-align: right;
          min-width: 70px;
        }

        .grand-total-box {
          border: 2px solid #000;
          padding: 8px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        /* Payment Section */
        .payment-section {
          background: #e8e8e8;
          padding: 8px;
          margin: 8px 0;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .payment-method {
          font-weight: 700;
          padding: 2px 8px;
          background: #000;
          color: #fff;
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        .payment-value {
          font-weight: 700;
        }

        .remaining-row {
          color: #000;
          font-weight: 700;
        }

        /* Custom Fields */
        .custom-section {
          background: #fffde7;
          padding: 6px 8px;
          margin: 8px 0;
          border: 1px solid #ffd600;
        }

        .cf-row {
          font-size: 9px;
          padding: 2px 0;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 8px;
        }

        .footer-msg {
          font-size: 9px;
          color: #666;
          margin-bottom: 6px;
        }

        .terms-section {
          background: #f5f5f5;
          padding: 6px;
          font-size: 8px;
          text-align: left;
          margin: 8px 0;
          white-space: pre-wrap;
          color: #555;
        }

        .thank-you-box {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px;
          margin-top: 10px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="business-name">${settings2.businessName || "BUSINESS"}</div>
        <div class="business-info">
          ${settings2.businessAddress || ""}${settings2.businessCity ? `, ${settings2.businessCity}` : ""}
        </div>
        ${settings2.businessPhone ? `<div class="business-info">TEL: ${settings2.businessPhone}</div>` : ""}
        ${settings2.receiptHeader ? `<div class="header-msg">${settings2.receiptHeader}</div>` : ""}
      </div>

      <div class="invoice-section">
        <div class="inv-row">
          <span>INV#</span>
          <span class="inv-number">${sale.invoiceNumber}</span>
        </div>
        <div class="inv-row">
          <span>DATE</span>
          <span>${shortDate} ${shortTime}</span>
        </div>
      </div>

      <div class="div-single"></div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || "WALK-IN CUSTOMER"}</div>
        ${customer?.phone ? `<div class="customer-contact">TEL: ${customer.phone}</div>` : ""}
      </div>

      <div class="div-double"></div>

      <div class="items-header">
        <span>ITEMS</span>
        <span>AMOUNT</span>
      </div>

      <div class="items-section">
        ${itemsHTML}
      </div>

      <div class="div-single"></div>

      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">SUBTOTAL</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.subtotal, settings2)}</span>
        </div>
        ${showTax ? `
        <div class="total-row">
          <span class="total-label">TAX</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.taxAmount, settings2)}</span>
        </div>
        ` : ""}
        ${sale.discountAmount > 0 ? `
        <div class="total-row">
          <span class="total-label">DISCOUNT</span>
          <span class="total-dots"></span>
          <span class="total-value">-${formatCurrency(sale.discountAmount, settings2)}</span>
        </div>
        ` : ""}
      </div>

      <div class="grand-total-box">
        <span>TOTAL</span>
        <span>${formatCurrency(sale.totalAmount, settings2)}</span>
      </div>

      <div class="payment-section">
        <div class="payment-row">
          <span>METHOD</span>
          <span class="payment-method">${getPaymentMethodLabel(sale.paymentMethod).toUpperCase()}</span>
        </div>
        <div class="payment-row">
          <span>PAID</span>
          <span class="payment-value">${formatCurrency(sale.amountPaid, settings2)}</span>
        </div>
        ${sale.amountPaid < sale.totalAmount ? `
        <div class="payment-row remaining-row">
          <span>★ BALANCE DUE</span>
          <span>${formatCurrency(sale.totalAmount - sale.amountPaid, settings2)}</span>
        </div>
        ` : ""}
        ${sale.changeGiven > 0 ? `
        <div class="payment-row">
          <span>CHANGE</span>
          <span class="payment-value">${formatCurrency(sale.changeGiven, settings2)}</span>
        </div>
        ` : ""}
      </div>

      ${customFieldsHTML ? `<div class="custom-section">${customFieldsHTML}</div>` : ""}

      <div class="footer">
        ${settings2.receiptFooter ? `<div class="footer-msg">${settings2.receiptFooter}</div>` : ""}
        ${settings2.receiptTermsAndConditions ? `<div class="terms-section">${settings2.receiptTermsAndConditions}</div>` : ""}
        <div class="thank-you-box">THANK YOU</div>
      </div>
    </body>
    </html>
  `;
}
function generatePDFPaymentHistoryReceiptHTML(data) {
  const { receivable, payments, sale, items, customer, businessSettings: settings2 } = data;
  const fontSize = fontSizeMap[settings2.receiptFontSize] || fontSizeMap.medium;
  const colors = designColors;
  const showTax = settings2.showTaxOnReceipt !== false;
  const showLogo = settings2.receiptShowBusinessLogo !== false;
  const statusConfig = {
    paid: { color: colors.accentEmerald, label: "PAID", bg: "#dcfce7" },
    partial: { color: "#f59e0b", label: "PARTIAL", bg: "#fef3c7" },
    overdue: { color: colors.accentRose, label: "OVERDUE", bg: "#fee2e2" },
    pending: { color: colors.gray600, label: "PENDING", bg: colors.gray100 }
  };
  const status = statusConfig[receivable.status] || statusConfig.pending;
  const saleDate = new Date(sale.saleDate);
  const formattedSaleDate = saleDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formattedReceiptDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const itemsHTML = items.map(
    (item, index2) => `
      <tr class="${index2 % 2 === 0 ? "row-even" : "row-odd"}">
        <td class="item-cell">
          <span class="item-name">${item.productName}</span>
          ${item.serialNumber ? `<span class="item-serial">S/N: ${item.serialNumber}</span>` : ""}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice, settings2)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(item.taxAmount, settings2)}</td>` : ""}
        <td class="text-right amount-cell">${formatCurrency(item.totalPrice, settings2)}</td>
      </tr>
    `
  ).join("");
  let runningBalance = 0;
  const paymentsWithBalanceHTML = payments.map((payment, index2) => {
    runningBalance += payment.amount;
    const remaining = Math.max(0, receivable.totalAmount - runningBalance);
    const paymentDate = new Date(payment.paymentDate);
    const formattedPaymentDate = paymentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `
        <tr class="${index2 % 2 === 0 ? "row-even" : "row-odd"}">
          <td>${formattedPaymentDate}</td>
          <td class="text-center"><span class="method-badge">${getPaymentMethodLabel(payment.paymentMethod)}</span></td>
          <td class="text-right amount-cell">${formatCurrency(payment.amount, settings2)}</td>
          <td class="text-right">${formatCurrency(runningBalance, settings2)}</td>
          <td class="text-right ${remaining > 0 ? "balance-due" : "balance-clear"}">${formatCurrency(remaining, settings2)}</td>
          <td class="text-center ref-cell">${payment.referenceNumber || "—"}</td>
        </tr>
      `;
  }).join("");
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --primary-900: ${colors.primary900};
          --primary-700: ${colors.primary700};
          --accent-gold: ${colors.accentGold};
          --accent-emerald: ${colors.accentEmerald};
          --accent-rose: ${colors.accentRose};
          --gray-900: ${colors.gray900};
          --gray-600: ${colors.gray600};
          --gray-400: ${colors.gray400};
          --gray-100: ${colors.gray100};
          --gray-50: ${colors.gray50};
        }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          font-size: ${fontSize.base}px;
          line-height: 1.6;
          color: var(--gray-900);
          padding: 40px;
          background: white;
        }

        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          text-align: center;
          padding-bottom: 25px;
          margin-bottom: 25px;
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
        }

        .business-logo {
          max-width: 100px;
          max-height: 70px;
          margin-bottom: 15px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .business-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.title}px;
          font-weight: 700;
          color: var(--primary-900);
          margin-bottom: 8px;
        }

        .business-info {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .receipt-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header + 2}px;
          font-weight: 600;
          color: var(--primary-900);
          margin-top: 20px;
          padding: 12px 30px;
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          border: 1px solid var(--gray-100);
          border-radius: 8px;
          display: inline-block;
          letter-spacing: 1px;
        }

        /* Invoice Details */
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin: 25px 0;
          padding: 20px 25px;
          background: var(--gray-50);
          border-radius: 12px;
          border: 1px solid var(--gray-100);
        }

        .invoice-left, .invoice-right { flex: 1; }
        .invoice-right { text-align: right; }

        .invoice-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .invoice-value {
          font-size: ${fontSize.base + 1}px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .status-badge {
          display: inline-block;
          padding: 6px 18px;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: ${fontSize.caption}px;
          background: ${status.bg};
          color: ${status.color};
          border: 1px solid ${status.color};
        }

        /* Customer Card */
        .customer-info {
          padding: 18px 20px;
          background: white;
          border-left: 4px solid var(--accent-gold);
          border-radius: 0 12px 12px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 25px;
        }

        .customer-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .customer-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header}px;
          font-weight: 600;
          color: var(--primary-900);
        }

        .customer-contact {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-top: 2px;
        }

        /* Balance Summary */
        .balance-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .balance-card {
          flex: 1;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .balance-card.total {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border: 1px solid #0ea5e9;
        }

        .balance-card.paid {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border: 1px solid var(--accent-emerald);
        }

        .balance-card.remaining {
          background: ${receivable.remainingAmount > 0 ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" : "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"};
          border: 1px solid ${receivable.remainingAmount > 0 ? "var(--accent-rose)" : "var(--accent-emerald)"};
        }

        .balance-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .balance-value {
          font-family: 'DM Sans', sans-serif;
          font-size: ${fontSize.header + 4}px;
          font-weight: 700;
        }

        .balance-card.total .balance-value { color: #0369a1; }
        .balance-card.paid .balance-value { color: var(--accent-emerald); }
        .balance-card.remaining .balance-value { color: ${receivable.remainingAmount > 0 ? "var(--accent-rose)" : "var(--accent-emerald)"}; }

        /* Section Title */
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header}px;
          font-weight: 600;
          color: var(--primary-900);
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--accent-gold);
          display: inline-block;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }

        thead { background: var(--primary-900); }

        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: ${fontSize.base}px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        th:first-child { border-radius: 8px 0 0 0; }
        th:last-child { border-radius: 0 8px 0 0; }

        td {
          padding: 12px;
          border-bottom: 1px solid var(--gray-100);
          font-size: ${fontSize.base}px;
        }

        .row-even { background: var(--gray-50); }
        .row-odd { background: white; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .item-cell { display: flex; flex-direction: column; }
        .item-name { font-weight: 500; color: var(--gray-900); }
        .item-serial {
          font-family: 'JetBrains Mono', monospace;
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          margin-top: 2px;
        }

        .amount-cell { font-weight: 600; color: var(--gray-900); }
        .method-badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--gray-100);
          border-radius: 12px;
          font-size: ${fontSize.caption}px;
          font-weight: 500;
        }

        .balance-due { color: var(--accent-rose); font-weight: 700; }
        .balance-clear { color: var(--accent-emerald); font-weight: 700; }
        .ref-cell { font-family: 'JetBrains Mono', monospace; font-size: ${fontSize.caption}px; color: var(--gray-400); }

        /* Totals */
        .totals-section {
          margin-top: 20px;
          padding: 20px;
          background: var(--gray-50);
          border-radius: 12px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: ${fontSize.base}px;
          border-bottom: 1px solid var(--gray-100);
        }

        .totals-row:last-of-type { border-bottom: none; }

        .totals-row.grand-total {
          font-size: ${fontSize.header}px;
          font-weight: 700;
          color: var(--primary-900);
          border-top: 3px solid var(--accent-gold);
          border-bottom: none;
          margin-top: 15px;
          padding-top: 20px;
        }

        /* Payment History Section */
        .payment-history-section {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid var(--accent-gold);
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }

        .payment-history-section .section-title {
          margin-top: 0;
          border-bottom-color: var(--primary-900);
        }

        .empty-payments {
          text-align: center;
          padding: 40px;
          color: var(--gray-400);
          font-style: italic;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid var(--gray-100);
          text-align: center;
        }

        .footer-note {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-bottom: 15px;
        }

        .footer-text {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-bottom: 15px;
        }

        .terms {
          margin-top: 20px;
          padding: 18px;
          background: var(--gray-50);
          border-radius: 8px;
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-align: left;
          white-space: pre-wrap;
        }

        .terms-title {
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .thank-you {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header + 2}px;
          color: var(--primary-900);
          font-weight: 600;
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          ${showLogo && settings2.businessLogo ? `<img src="${settings2.businessLogo}" class="business-logo" alt="Logo" />` : ""}
          <div class="business-name">${settings2.businessName || "Business Name"}</div>
          <div class="business-info">
            ${settings2.businessAddress ? settings2.businessAddress : ""}
            ${settings2.businessCity ? ` • ${settings2.businessCity}` : ""}
            ${settings2.businessState ? `, ${settings2.businessState}` : ""}
          </div>
          <div class="business-info">
            ${settings2.businessPhone ? settings2.businessPhone : ""}
            ${settings2.businessPhone && settings2.businessEmail ? " • " : ""}
            ${settings2.businessEmail ? settings2.businessEmail : ""}
          </div>
          <div class="receipt-title">Payment History Receipt</div>
        </div>

        <div class="invoice-details">
          <div class="invoice-left">
            <div class="invoice-label">Invoice Number</div>
            <div class="invoice-value">${receivable.invoiceNumber}</div>
            <div class="invoice-label" style="margin-top: 12px;">Original Sale Date</div>
            <div class="invoice-value">${formattedSaleDate}</div>
            ${receivable.dueDate ? `
            <div class="invoice-label" style="margin-top: 12px;">Due Date</div>
            <div class="invoice-value">${formatDate(new Date(receivable.dueDate))}</div>
            ` : ""}
          </div>
          <div class="invoice-right">
            <div class="invoice-label">Receipt Date</div>
            <div class="invoice-value">${formattedReceiptDate}</div>
            <div class="invoice-label" style="margin-top: 12px;">Status</div>
            <div style="margin-top: 6px;">
              <span class="status-badge">${status.label}</span>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-label">Bill To</div>
          <div class="customer-name">${customer?.name || "Walk-in Customer"}</div>
          ${customer?.phone ? `<div class="customer-contact">${customer.phone}</div>` : ""}
          ${customer?.email ? `<div class="customer-contact">${customer.email}</div>` : ""}
          ${customer?.address ? `<div class="customer-contact">${customer.address}</div>` : ""}
        </div>

        <div class="balance-summary">
          <div class="balance-card total">
            <div class="balance-label">Total Amount</div>
            <div class="balance-value">${formatCurrency(receivable.totalAmount, settings2)}</div>
          </div>
          <div class="balance-card paid">
            <div class="balance-label">Amount Paid</div>
            <div class="balance-value">${formatCurrency(receivable.paidAmount, settings2)}</div>
          </div>
          <div class="balance-card remaining">
            <div class="balance-label">${receivable.remainingAmount > 0 ? "Balance Due" : "Fully Paid"}</div>
            <div class="balance-value">${formatCurrency(receivable.remainingAmount, settings2)}</div>
          </div>
        </div>

        ${items.length > 0 ? `
        <div class="section-title">Items Purchased</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              ${showTax ? '<th class="text-right">Tax</th>' : ""}
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(sale.subtotal, settings2)}</span>
          </div>
          ${showTax ? `
          <div class="totals-row">
            <span>Tax</span>
            <span>${formatCurrency(sale.taxAmount, settings2)}</span>
          </div>
          ` : ""}
          ${sale.discountAmount > 0 ? `
          <div class="totals-row">
            <span>Discount</span>
            <span style="color: var(--accent-rose);">-${formatCurrency(sale.discountAmount, settings2)}</span>
          </div>
          ` : ""}
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${formatCurrency(sale.totalAmount, settings2)}</span>
          </div>
        </div>
        ` : ""}

        <div class="payment-history-section">
          <div class="section-title">Payment History</div>
          ${payments.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th class="text-center">Method</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Total Paid</th>
                <th class="text-right">Balance</th>
                <th class="text-center">Reference</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsWithBalanceHTML}
            </tbody>
          </table>
          ` : `
          <div class="empty-payments">No payments have been recorded yet.</div>
          `}
        </div>

        <div class="footer">
          <div class="footer-note">This receipt serves as proof of payment history for the referenced invoice.</div>
          ${settings2.receiptFooter ? `<div class="footer-text">${settings2.receiptFooter}</div>` : ""}
          ${settings2.receiptTermsAndConditions ? `
          <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            ${settings2.receiptTermsAndConditions}
          </div>
          ` : ""}
          <div class="thank-you">Thank You for Your Business</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateThermalPaymentHistoryReceiptHTML(data) {
  const { receivable, payments, sale, customer, businessSettings: settings2 } = data;
  const showTax = settings2.showTaxOnReceipt !== false;
  const statusConfig = {
    paid: { symbol: "✓", label: "PAID" },
    partial: { symbol: "◐", label: "PARTIAL" },
    overdue: { symbol: "!", label: "OVERDUE" },
    pending: { symbol: "○", label: "PENDING" }
  };
  const status = statusConfig[receivable.status] || statusConfig.pending;
  const saleDate = new Date(sale.saleDate);
  const shortSaleDate = `${saleDate.getDate().toString().padStart(2, "0")}/${(saleDate.getMonth() + 1).toString().padStart(2, "0")}/${saleDate.getFullYear().toString().slice(-2)}`;
  const now = /* @__PURE__ */ new Date();
  const shortNowDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear().toString().slice(-2)}`;
  let runningBalance = 0;
  const paymentsHTML = payments.map((payment) => {
    runningBalance += payment.amount;
    const remaining = Math.max(0, receivable.totalAmount - runningBalance);
    const pDate = new Date(payment.paymentDate);
    const shortPDate = `${pDate.getDate().toString().padStart(2, "0")}/${(pDate.getMonth() + 1).toString().padStart(2, "0")}`;
    return `
      <div class="payment-entry">
        <div class="payment-header">
          <span class="payment-date">${shortPDate}</span>
          <span class="payment-method">${getPaymentMethodLabel(payment.paymentMethod).toUpperCase()}</span>
        </div>
        <div class="payment-amounts">
          <span>Amount: ${formatCurrency(payment.amount, settings2)}</span>
          <span>Due: ${formatCurrency(remaining, settings2)}</span>
        </div>
        ${payment.referenceNumber ? `<div class="payment-ref">REF: ${payment.referenceNumber}</div>` : ""}
      </div>
    `;
  }).join("");
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          width: 302px;
          padding: 8px 10px;
          background: white;
        }

        /* Header */
        .header-box {
          border: 2px solid #000;
          padding: 8px;
          margin-bottom: 8px;
          text-align: center;
        }

        .business-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .business-info {
          font-size: 9px;
          margin-top: 4px;
          color: #333;
        }

        .receipt-title {
          font-size: 11px;
          font-weight: 700;
          margin-top: 6px;
          padding: 4px 10px;
          background: #000;
          color: #fff;
          display: inline-block;
          letter-spacing: 1px;
        }

        /* Dividers */
        .div-double { border-top: 3px double #000; margin: 8px 0; }
        .div-single { border-top: 1px solid #000; margin: 6px 0; }

        /* Invoice Section */
        .invoice-section { margin: 8px 0; }

        .inv-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 2px 0;
        }

        .inv-number { font-weight: 700; font-size: 11px; }

        /* Customer Section */
        .customer-section {
          background: #f0f0f0;
          padding: 6px 8px;
          margin: 8px 0;
        }

        .customer-name {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
        }

        .customer-contact { font-size: 9px; color: #444; }

        /* Status Box */
        .status-box {
          border: 2px solid #000;
          padding: 6px;
          margin: 8px 0;
          text-align: center;
        }

        .status-indicator {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* Balance Section */
        .balance-section {
          background: #e8e8e8;
          padding: 8px;
          margin: 8px 0;
        }

        .balance-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .balance-row.highlight {
          font-weight: 700;
          font-size: 12px;
          border-top: 1px solid #000;
          padding-top: 6px;
          margin-top: 4px;
        }

        .balance-value { font-weight: 700; }

        /* Payment History */
        .history-section {
          border: 1px solid #000;
          padding: 8px;
          margin: 8px 0;
        }

        .history-title {
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #000;
          letter-spacing: 1px;
        }

        .payment-entry {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dotted #999;
        }

        .payment-entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

        .payment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .payment-date { font-size: 9px; color: #666; }

        .payment-method {
          font-weight: 700;
          font-size: 9px;
          padding: 1px 4px;
          background: #000;
          color: #fff;
        }

        .payment-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
        }

        .payment-ref {
          font-size: 8px;
          color: #666;
          margin-top: 2px;
        }

        .empty-history {
          text-align: center;
          padding: 10px;
          font-style: italic;
          font-size: 9px;
          color: #666;
        }

        /* Totals */
        .totals-section { margin: 10px 0; }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .total-label { flex: 1; }
        .total-dots { flex: 2; border-bottom: 1px dotted #999; margin: 0 4px 3px 4px; }
        .total-value { text-align: right; min-width: 70px; }

        .grand-total-box {
          border: 2px solid #000;
          padding: 8px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 8px;
        }

        .footer-msg {
          font-size: 9px;
          color: #666;
          margin-bottom: 6px;
        }

        .thank-you-box {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px;
          margin-top: 10px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="business-name">${settings2.businessName || "BUSINESS"}</div>
        <div class="business-info">
          ${settings2.businessAddress || ""}${settings2.businessCity ? `, ${settings2.businessCity}` : ""}
        </div>
        ${settings2.businessPhone ? `<div class="business-info">TEL: ${settings2.businessPhone}</div>` : ""}
        <div class="receipt-title">PAYMENT HISTORY</div>
      </div>

      <div class="invoice-section">
        <div class="inv-row">
          <span>INV#</span>
          <span class="inv-number">${receivable.invoiceNumber}</span>
        </div>
        <div class="inv-row">
          <span>SALE DATE</span>
          <span>${shortSaleDate}</span>
        </div>
        <div class="inv-row">
          <span>RECEIPT</span>
          <span>${shortNowDate}</span>
        </div>
      </div>

      <div class="div-single"></div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || "WALK-IN CUSTOMER"}</div>
        ${customer?.phone ? `<div class="customer-contact">TEL: ${customer.phone}</div>` : ""}
      </div>

      <div class="status-box">
        <div class="status-indicator">${status.symbol} ${status.label}</div>
      </div>

      <div class="balance-section">
        <div class="balance-row">
          <span>TOTAL AMOUNT</span>
          <span class="balance-value">${formatCurrency(receivable.totalAmount, settings2)}</span>
        </div>
        <div class="balance-row">
          <span>TOTAL PAID</span>
          <span class="balance-value">${formatCurrency(receivable.paidAmount, settings2)}</span>
        </div>
        <div class="balance-row highlight">
          <span>${receivable.remainingAmount > 0 ? "★ BALANCE DUE" : "✓ FULLY PAID"}</span>
          <span class="balance-value">${formatCurrency(receivable.remainingAmount, settings2)}</span>
        </div>
      </div>

      <div class="history-section">
        <div class="history-title">PAYMENT RECORDS</div>
        ${payments.length > 0 ? paymentsHTML : '<div class="empty-history">No payments recorded</div>'}
      </div>

      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">SUBTOTAL</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.subtotal, settings2)}</span>
        </div>
        ${showTax ? `
        <div class="total-row">
          <span class="total-label">TAX</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.taxAmount, settings2)}</span>
        </div>
        ` : ""}
        ${sale.discountAmount > 0 ? `
        <div class="total-row">
          <span class="total-label">DISCOUNT</span>
          <span class="total-dots"></span>
          <span class="total-value">-${formatCurrency(sale.discountAmount, settings2)}</span>
        </div>
        ` : ""}
      </div>

      <div class="grand-total-box">
        <span>INVOICE TOTAL</span>
        <span>${formatCurrency(sale.totalAmount, settings2)}</span>
      </div>

      <div class="footer">
        ${settings2.receiptFooter ? `<div class="footer-msg">${settings2.receiptFooter}</div>` : ""}
        <div class="thank-you-box">THANK YOU</div>
      </div>
    </body>
    </html>
  `;
}
async function generatePaymentHistoryReceipt(data, options) {
  const { format, autoDownload } = options;
  const htmlContent = format === "thermal" ? generateThermalPaymentHistoryReceiptHTML(data) : generatePDFPaymentHistoryReceiptHTML(data);
  const pageSettings = format === "thermal" ? {
    pageSize: { width: 80 * 1e3, height: 210 * 1e3 },
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  } : {
    pageSize: "A4",
    margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
  };
  const pdfWindow = new electron.BrowserWindow({
    show: false,
    width: format === "thermal" ? 320 : 900,
    height: format === "thermal" ? 1800 : 1200,
    webPreferences: {
      nodeIntegration: false
    }
  });
  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    await new Promise((resolve) => setTimeout(resolve, format === "thermal" ? 1e3 : 500));
    const pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: pageSettings.pageSize,
      printBackground: true,
      landscape: false,
      margins: pageSettings.margins
    });
    let filePath;
    if (autoDownload) {
      const downloadsPath = electron.app.getPath("downloads");
      const fileName = `payment_history_${data.receivable.invoiceNumber}_${Date.now()}.pdf`;
      filePath = path__namespace.join(downloadsPath, fileName);
    } else {
      const tempPath = electron.app.getPath("temp");
      const fileName = `payment_history_${data.receivable.invoiceNumber}_${Date.now()}.pdf`;
      filePath = path__namespace.join(tempPath, fileName);
    }
    fs__namespace.writeFileSync(filePath, pdfData);
    return filePath;
  } finally {
    pdfWindow.close();
  }
}
async function generateReceipt(data, options) {
  const { format, autoDownload } = options;
  const htmlContent = format === "thermal" ? generateThermalReceiptHTML(data) : generatePDFReceiptHTML(data);
  const pageSettings = format === "thermal" ? {
    pageSize: { width: 80 * 1e3, height: 210 * 1e3 },
    // 80mm width, 210mm height
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  } : {
    pageSize: "A4",
    margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
  };
  const pdfWindow = new electron.BrowserWindow({
    show: false,
    width: format === "thermal" ? 320 : 800,
    height: format === "thermal" ? 1800 : 1200,
    webPreferences: {
      nodeIntegration: false
    }
  });
  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    await new Promise((resolve) => setTimeout(resolve, format === "thermal" ? 1e3 : 500));
    const pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: pageSettings.pageSize,
      printBackground: true,
      landscape: false,
      margins: pageSettings.margins
    });
    let filePath;
    if (autoDownload) {
      const downloadsPath = electron.app.getPath("downloads");
      const fileName = `receipt_${data.sale.invoiceNumber}_${Date.now()}.pdf`;
      filePath = path__namespace.join(downloadsPath, fileName);
    } else {
      const tempPath = electron.app.getPath("temp");
      const fileName = `receipt_${data.sale.invoiceNumber}_${Date.now()}.pdf`;
      filePath = path__namespace.join(tempPath, fileName);
    }
    fs__namespace.writeFileSync(filePath, pdfData);
    return filePath;
  } finally {
    pdfWindow.close();
  }
}
function registerReceiptHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("receipt:generate", async (_, saleId) => {
    try {
      const sale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, saleId)
      });
      if (!sale) {
        return { success: false, message: "Sale not found" };
      }
      const items = await db2.select({
        saleItem: saleItems,
        product: products
      }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.eq(saleItems.saleId, saleId));
      let customer = null;
      if (sale.customerId) {
        const customerData = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, sale.customerId)
        });
        if (customerData) {
          customer = {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            phone: customerData.phone || void 0,
            email: customerData.email || void 0,
            address: [customerData.address, customerData.city, customerData.state].filter(Boolean).join(", ") || void 0
          };
        }
      }
      let settings2 = null;
      if (sale.branchId) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.eq(businessSettings.branchId, sale.branchId)
        });
      }
      if (!settings2) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.isNull(businessSettings.branchId)
        });
      }
      if (!settings2) {
        return { success: false, message: "Business settings not configured" };
      }
      const receiptSale = {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        saleDate: sale.saleDate || (/* @__PURE__ */ new Date()).toISOString(),
        subtotal: sale.subtotal || 0,
        taxAmount: sale.taxAmount || 0,
        discountAmount: sale.discountAmount || 0,
        totalAmount: sale.totalAmount || 0,
        amountPaid: sale.amountPaid || 0,
        changeGiven: sale.changeGiven || 0,
        paymentMethod: sale.paymentMethod || "cash",
        paymentStatus: sale.paymentStatus || "paid",
        notes: sale.notes || void 0
      };
      const receiptItems = items.map((item) => ({
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.saleItem.quantity || 1,
        unitPrice: item.saleItem.unitPrice || 0,
        serialNumber: item.saleItem.serialNumber || void 0,
        discountAmount: item.saleItem.discountAmount || 0,
        taxAmount: item.saleItem.taxAmount || 0,
        totalPrice: item.saleItem.totalPrice || 0
      }));
      const receiptData = {
        sale: receiptSale,
        items: receiptItems,
        customer,
        businessSettings: settings2
      };
      const options = {
        format: settings2.receiptFormat || "pdf",
        autoDownload: settings2.receiptAutoDownload !== false
      };
      const filePath = await generateReceipt(receiptData, options);
      return {
        success: true,
        data: {
          filePath,
          format: options.format,
          invoiceNumber: sale.invoiceNumber
        }
      };
    } catch (error) {
      console.error("Receipt generation error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate receipt"
      };
    }
  });
  electron.ipcMain.handle("receipt:get-settings", async (_, branchId) => {
    try {
      let settings2 = null;
      if (branchId) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.eq(businessSettings.branchId, branchId)
        });
      }
      if (!settings2) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.isNull(businessSettings.branchId)
        });
      }
      if (!settings2) {
        return {
          success: true,
          data: {
            receiptFormat: "pdf",
            receiptPrimaryColor: "#1e40af",
            receiptSecondaryColor: "#64748b",
            receiptFontSize: "medium",
            receiptHeader: "",
            receiptFooter: "",
            showTaxOnReceipt: true,
            receiptShowBusinessLogo: true,
            receiptAutoDownload: true
          }
        };
      }
      return {
        success: true,
        data: {
          receiptFormat: settings2.receiptFormat || "pdf",
          receiptPrimaryColor: settings2.receiptPrimaryColor || "#1e40af",
          receiptSecondaryColor: settings2.receiptSecondaryColor || "#64748b",
          receiptFontSize: settings2.receiptFontSize || "medium",
          receiptHeader: settings2.receiptHeader || "",
          receiptFooter: settings2.receiptFooter || "",
          receiptLogo: settings2.receiptLogo || "",
          showTaxOnReceipt: settings2.showTaxOnReceipt !== false,
          receiptCustomField1Label: settings2.receiptCustomField1Label || "",
          receiptCustomField1Value: settings2.receiptCustomField1Value || "",
          receiptCustomField2Label: settings2.receiptCustomField2Label || "",
          receiptCustomField2Value: settings2.receiptCustomField2Value || "",
          receiptCustomField3Label: settings2.receiptCustomField3Label || "",
          receiptCustomField3Value: settings2.receiptCustomField3Value || "",
          receiptTermsAndConditions: settings2.receiptTermsAndConditions || "",
          receiptShowBusinessLogo: settings2.receiptShowBusinessLogo !== false,
          receiptAutoDownload: settings2.receiptAutoDownload !== false
        }
      };
    } catch (error) {
      console.error("Error fetching receipt settings:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch receipt settings"
      };
    }
  });
  electron.ipcMain.handle("receipt:generate-payment-history", async (_, receivableId) => {
    try {
      const receivable = await db2.query.accountReceivables.findFirst({
        where: drizzleOrm.eq(accountReceivables.id, receivableId)
      });
      if (!receivable) {
        return { success: false, message: "Receivable not found" };
      }
      let sale = null;
      if (receivable.saleId) {
        sale = await db2.query.sales.findFirst({
          where: drizzleOrm.eq(sales.id, receivable.saleId)
        });
      }
      if (!sale) {
        sale = {
          invoiceNumber: receivable.invoiceNumber,
          saleDate: receivable.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          subtotal: receivable.totalAmount || 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: receivable.totalAmount || 0
        };
      }
      let receiptItems = [];
      if (receivable.saleId) {
        const items = await db2.select({
          saleItem: saleItems,
          product: products
        }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.eq(saleItems.saleId, receivable.saleId));
        receiptItems = items.map((item) => ({
          productName: item.product.name,
          productCode: item.product.code,
          quantity: item.saleItem.quantity || 1,
          unitPrice: item.saleItem.unitPrice || 0,
          serialNumber: item.saleItem.serialNumber || void 0,
          discountAmount: item.saleItem.discountAmount || 0,
          taxAmount: item.saleItem.taxAmount || 0,
          totalPrice: item.saleItem.totalPrice || 0
        }));
      }
      const payments = await db2.select({
        payment: receivablePayments,
        user: users
      }).from(receivablePayments).leftJoin(users, drizzleOrm.eq(receivablePayments.receivedBy, users.id)).where(drizzleOrm.eq(receivablePayments.receivableId, receivableId)).orderBy(drizzleOrm.asc(receivablePayments.paymentDate));
      const formattedPayments = payments.map((p) => ({
        id: p.payment.id,
        amount: p.payment.amount || 0,
        paymentMethod: p.payment.paymentMethod || "cash",
        referenceNumber: p.payment.referenceNumber || void 0,
        notes: p.payment.notes || void 0,
        paymentDate: p.payment.paymentDate || (/* @__PURE__ */ new Date()).toISOString(),
        receivedBy: p.user?.fullName || void 0
      }));
      let customer = null;
      if (receivable.customerId) {
        const customerData = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, receivable.customerId)
        });
        if (customerData) {
          customer = {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            phone: customerData.phone || void 0,
            email: customerData.email || void 0,
            address: [customerData.address, customerData.city, customerData.state].filter(Boolean).join(", ") || void 0
          };
        }
      }
      let settings2 = null;
      if (receivable.branchId) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.eq(businessSettings.branchId, receivable.branchId)
        });
      }
      if (!settings2) {
        settings2 = await db2.query.businessSettings.findFirst({
          where: drizzleOrm.isNull(businessSettings.branchId)
        });
      }
      if (!settings2) {
        return { success: false, message: "Business settings not configured" };
      }
      const paymentHistoryData = {
        receivable: {
          id: receivable.id,
          invoiceNumber: receivable.invoiceNumber,
          totalAmount: receivable.totalAmount || 0,
          paidAmount: receivable.paidAmount || 0,
          remainingAmount: receivable.remainingAmount || 0,
          status: receivable.status || "pending",
          createdAt: receivable.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          dueDate: receivable.dueDate || void 0
        },
        payments: formattedPayments,
        sale: {
          invoiceNumber: sale.invoiceNumber || receivable.invoiceNumber,
          saleDate: sale.saleDate || receivable.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          subtotal: sale.subtotal || receivable.totalAmount || 0,
          taxAmount: sale.taxAmount || 0,
          discountAmount: sale.discountAmount || 0,
          totalAmount: sale.totalAmount || receivable.totalAmount || 0
        },
        items: receiptItems,
        customer,
        businessSettings: settings2
      };
      const options = {
        format: settings2.receiptFormat || "pdf",
        autoDownload: settings2.receiptAutoDownload !== false
      };
      const filePath = await generatePaymentHistoryReceipt(paymentHistoryData, options);
      return {
        success: true,
        data: {
          filePath,
          format: options.format,
          invoiceNumber: receivable.invoiceNumber
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";
      console.error("Payment history receipt generation error:", errorMessage);
      console.error("Stack trace:", errorStack);
      return {
        success: false,
        message: `Failed to generate receipt: ${errorMessage}`
      };
    }
  });
}
function registerTodosHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("todos:create", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const assignedUser = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.id, data.assignedTo)
      });
      if (!assignedUser) {
        return { success: false, message: "Assigned user not found" };
      }
      const [newTodo] = await db2.insert(todos).values({
        title: data.title,
        description: data.description,
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        createdBy: session.userId,
        assignedTo: data.assignedTo,
        assignedToRole: assignedUser.role,
        branchId: data.branchId || session.branchId,
        status: "pending"
      }).returning();
      await createAuditLog$1({
        userId: session.userId,
        branchId: session.branchId,
        action: "create",
        entityType: "todo",
        entityId: newTodo.id,
        newValues: {
          title: data.title,
          assignedTo: data.assignedTo
        },
        description: `Created todo: ${data.title}`
      });
      return { success: true, data: newTodo };
    } catch (error) {
      console.error("Create todo error:", error);
      return { success: false, message: "Failed to create todo" };
    }
  });
  electron.ipcMain.handle("todos:get-all", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const userTodos = await db2.query.todos.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(todos.assignedToRole, session.role),
          drizzleOrm.eq(todos.assignedTo, session.userId)
        ),
        orderBy: [drizzleOrm.desc(todos.createdAt)],
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          assignee: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          },
          branch: true
        }
      });
      return { success: true, data: userTodos };
    } catch (error) {
      console.error("Get todos error:", error);
      return { success: false, message: "Failed to fetch todos" };
    }
  });
  electron.ipcMain.handle("todos:get-by-id", async (_, id) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const todo = await db2.query.todos.findFirst({
        where: drizzleOrm.eq(todos.id, id),
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          },
          assignee: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          },
          branch: true
        }
      });
      if (!todo) {
        return { success: false, message: "Todo not found" };
      }
      if (todo.assignedTo !== session.userId) {
        return { success: false, message: "Access denied" };
      }
      return { success: true, data: todo };
    } catch (error) {
      console.error("Get todo error:", error);
      return { success: false, message: "Failed to fetch todo" };
    }
  });
  electron.ipcMain.handle("todos:update", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const existingTodo = await db2.query.todos.findFirst({
        where: drizzleOrm.eq(todos.id, data.id)
      });
      if (!existingTodo) {
        return { success: false, message: "Todo not found" };
      }
      if (existingTodo.assignedTo !== session.userId) {
        return { success: false, message: "Access denied" };
      }
      const updateData = {
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (data.title !== void 0) updateData.title = data.title;
      if (data.description !== void 0) updateData.description = data.description;
      if (data.status !== void 0) {
        updateData.status = data.status;
        if (data.status === "completed") {
          updateData.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
      }
      if (data.priority !== void 0) updateData.priority = data.priority;
      if (data.dueDate !== void 0) updateData.dueDate = data.dueDate;
      const [updatedTodo] = await db2.update(todos).set(updateData).where(drizzleOrm.eq(todos.id, data.id)).returning();
      await createAuditLog$1({
        userId: session.userId,
        branchId: session.branchId,
        action: "update",
        entityType: "todo",
        entityId: data.id,
        oldValues: {
          status: existingTodo.status,
          priority: existingTodo.priority
        },
        newValues: {
          status: data.status,
          priority: data.priority
        },
        description: `Updated todo: ${existingTodo.title}`
      });
      return { success: true, data: updatedTodo };
    } catch (error) {
      console.error("Update todo error:", error);
      return { success: false, message: "Failed to update todo" };
    }
  });
  electron.ipcMain.handle("todos:delete", async (_, id) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const existingTodo = await db2.query.todos.findFirst({
        where: drizzleOrm.eq(todos.id, id)
      });
      if (!existingTodo) {
        return { success: false, message: "Todo not found" };
      }
      if (existingTodo.createdBy !== session.userId && existingTodo.assignedTo !== session.userId) {
        return { success: false, message: "Access denied" };
      }
      await db2.delete(todos).where(drizzleOrm.eq(todos.id, id));
      await createAuditLog$1({
        userId: session.userId,
        branchId: session.branchId,
        action: "delete",
        entityType: "todo",
        entityId: id,
        oldValues: {
          title: existingTodo.title
        },
        description: `Deleted todo: ${existingTodo.title}`
      });
      return { success: true, message: "Todo deleted successfully" };
    } catch (error) {
      console.error("Delete todo error:", error);
      return { success: false, message: "Failed to delete todo" };
    }
  });
  electron.ipcMain.handle("todos:get-counts", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const userTodos = await db2.query.todos.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(todos.assignedToRole, session.role),
          drizzleOrm.eq(todos.assignedTo, session.userId)
        )
      });
      const counts = {
        total: userTodos.length,
        pending: userTodos.filter((t) => t.status === "pending").length,
        in_progress: userTodos.filter((t) => t.status === "in_progress").length,
        completed: userTodos.filter((t) => t.status === "completed").length,
        cancelled: userTodos.filter((t) => t.status === "cancelled").length
      };
      return { success: true, data: counts };
    } catch (error) {
      console.error("Get todo counts error:", error);
      return { success: false, message: "Failed to fetch todo counts" };
    }
  });
  electron.ipcMain.handle("todos:get-assignable-users", async (_, role) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const targetRole = role || session.role;
      const assignableUsers = await db2.query.users.findMany({
        where: drizzleOrm.eq(users.role, targetRole),
        columns: {
          id: true,
          username: true,
          fullName: true,
          role: true
        }
      });
      return { success: true, data: assignableUsers };
    } catch (error) {
      console.error("Get assignable users error:", error);
      return { success: false, message: "Failed to fetch assignable users" };
    }
  });
}
function registerManualMigrationHandlers() {
  electron.ipcMain.handle("migration:check-todos-table", async () => {
    try {
      const db2 = getRawDatabase();
      const tableCheck = db2.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='todos'`
      ).get();
      return {
        success: true,
        exists: !!tableCheck,
        message: tableCheck ? "Todos table exists" : "Todos table does NOT exist"
      };
    } catch (error) {
      return { success: false, message: `Check failed: ${error}` };
    }
  });
  electron.ipcMain.handle("migration:create-todos-table", async () => {
    try {
      const db2 = getRawDatabase();
      const tableCheck = db2.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='todos'`
      ).get();
      if (tableCheck) {
        return { success: true, message: "Todos table already exists" };
      }
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS "todos" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "status" text DEFAULT 'pending' NOT NULL,
          "priority" text DEFAULT 'medium' NOT NULL,
          "due_date" text,
          "created_by" integer NOT NULL,
          "assigned_to" integer NOT NULL,
          "assigned_to_role" text NOT NULL,
          "branch_id" integer,
          "completed_at" text,
          "created_at" text NOT NULL,
          "updated_at" text NOT NULL,
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
          FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
          FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
        );

        CREATE INDEX IF NOT EXISTS "todos_assigned_to_idx" ON "todos" ("assigned_to");
        CREATE INDEX IF NOT EXISTS "todos_assigned_to_role_idx" ON "todos" ("assigned_to_role");
        CREATE INDEX IF NOT EXISTS "todos_status_idx" ON "todos" ("status");
        CREATE INDEX IF NOT EXISTS "todos_created_by_idx" ON "todos" ("created_by");
        CREATE INDEX IF NOT EXISTS "todos_branch_idx" ON "todos" ("branch_id");
      `;
      db2.exec(migrationSQL);
      console.log("Todos table created successfully via manual migration");
      return { success: true, message: "Todos table created successfully" };
    } catch (error) {
      console.error("Manual migration error:", error);
      return { success: false, message: `Migration failed: ${error}` };
    }
  });
  electron.ipcMain.handle("migration:check-referral-persons-table", async () => {
    try {
      const db2 = getRawDatabase();
      const tableCheck = db2.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='referral_persons'`
      ).get();
      return {
        success: true,
        exists: !!tableCheck,
        message: tableCheck ? "Referral persons table exists" : "Referral persons table does NOT exist"
      };
    } catch (error) {
      return { success: false, message: `Check failed: ${error}` };
    }
  });
  electron.ipcMain.handle("migration:create-referral-persons-table", async () => {
    try {
      const db2 = getRawDatabase();
      const tableCheck = db2.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='referral_persons'`
      ).get();
      if (tableCheck) {
        return { success: true, message: "Referral persons table already exists" };
      }
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS "referral_persons" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "branch_id" integer NOT NULL,
          "name" text NOT NULL,
          "contact" text,
          "address" text,
          "notes" text,
          "is_active" integer DEFAULT true NOT NULL,
          "total_commission_earned" real DEFAULT 0 NOT NULL,
          "total_commission_paid" real DEFAULT 0 NOT NULL,
          "commission_rate" real,
          "created_at" text NOT NULL,
          "updated_at" text NOT NULL,
          FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
        );

        CREATE INDEX IF NOT EXISTS "referral_persons_branch_idx" ON "referral_persons" ("branch_id");
        CREATE INDEX IF NOT EXISTS "referral_persons_name_idx" ON "referral_persons" ("name");
      `;
      db2.exec(migrationSQL);
      console.log("Referral persons table created successfully via manual migration");
      return { success: true, message: "Referral persons table created successfully" };
    } catch (error) {
      console.error("Manual migration error:", error);
      return { success: false, message: `Migration failed: ${error}` };
    }
  });
}
function registerMessagesHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("messages:send", async (_, data) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const [newMessage] = await db2.insert(messages).values({
        content: data.content,
        senderId: session.userId,
        recipientId: data.recipientId || null,
        isRead: false
      }).returning();
      const messageWithSender = await db2.query.messages.findFirst({
        where: drizzleOrm.eq(messages.id, newMessage.id),
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          },
          recipient: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          }
        }
      });
      await createAuditLog$1({
        userId: session.userId,
        branchId: session.branchId,
        action: "create",
        entityType: "message",
        entityId: newMessage.id,
        newValues: {
          content: data.content.substring(0, 100),
          recipientId: data.recipientId
        },
        description: `Sent message${data.recipientId ? " to user" : " to all"}`
      });
      return { success: true, data: messageWithSender };
    } catch (error) {
      console.error("Send message error:", error);
      return { success: false, message: "Failed to send message" };
    }
  });
  electron.ipcMain.handle("messages:get-all", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const userMessages = await db2.query.messages.findMany({
        where: drizzleOrm.or(
          drizzleOrm.eq(messages.recipientId, session.userId),
          drizzleOrm.isNull(messages.recipientId),
          drizzleOrm.eq(messages.senderId, session.userId)
        ),
        orderBy: [drizzleOrm.desc(messages.createdAt)],
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          },
          recipient: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true
            }
          }
        }
      });
      return { success: true, data: userMessages };
    } catch (error) {
      console.error("Get messages error:", error);
      return { success: false, message: "Failed to fetch messages" };
    }
  });
  electron.ipcMain.handle("messages:mark-read", async (_, messageId) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const existingMessage = await db2.query.messages.findFirst({
        where: drizzleOrm.eq(messages.id, messageId)
      });
      if (!existingMessage) {
        return { success: false, message: "Message not found" };
      }
      if (existingMessage.recipientId !== null && existingMessage.recipientId !== session.userId) {
        return { success: false, message: "Access denied" };
      }
      await db2.update(messages).set({ isRead: true }).where(drizzleOrm.eq(messages.id, messageId));
      return { success: true, message: "Message marked as read" };
    } catch (error) {
      console.error("Mark message read error:", error);
      return { success: false, message: "Failed to mark message as read" };
    }
  });
  electron.ipcMain.handle("messages:mark-all-read", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      await db2.update(messages).set({ isRead: true }).where(
        drizzleOrm.and(
          drizzleOrm.eq(messages.isRead, false),
          drizzleOrm.or(
            drizzleOrm.eq(messages.recipientId, session.userId),
            drizzleOrm.isNull(messages.recipientId)
          )
        )
      );
      return { success: true, message: "All messages marked as read" };
    } catch (error) {
      console.error("Mark all messages read error:", error);
      return { success: false, message: "Failed to mark messages as read" };
    }
  });
  electron.ipcMain.handle("messages:delete", async (_, messageId) => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      if (session.role !== "admin") {
        return { success: false, message: "Only administrators can delete messages" };
      }
      const existingMessage = await db2.query.messages.findFirst({
        where: drizzleOrm.eq(messages.id, messageId)
      });
      if (!existingMessage) {
        return { success: false, message: "Message not found" };
      }
      await db2.delete(messages).where(drizzleOrm.eq(messages.id, messageId));
      await createAuditLog$1({
        userId: session.userId,
        branchId: session.branchId,
        action: "delete",
        entityType: "message",
        entityId: messageId,
        oldValues: {
          content: existingMessage.content.substring(0, 100)
        },
        description: "Deleted message"
      });
      return { success: true, message: "Message deleted successfully" };
    } catch (error) {
      console.error("Delete message error:", error);
      return { success: false, message: "Failed to delete message" };
    }
  });
  electron.ipcMain.handle("messages:get-unread-count", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const unreadMessages = await db2.query.messages.findMany({
        where: drizzleOrm.and(
          drizzleOrm.eq(messages.isRead, false),
          drizzleOrm.or(
            drizzleOrm.eq(messages.recipientId, session.userId),
            drizzleOrm.isNull(messages.recipientId)
          ),
          // Don't count messages sent by the user themselves
          drizzleOrm.not(drizzleOrm.eq(messages.senderId, session.userId))
        )
      });
      return { success: true, data: unreadMessages.length };
    } catch (error) {
      console.error("Get unread count error:", error);
      return { success: false, message: "Failed to get unread count" };
    }
  });
  electron.ipcMain.handle("messages:get-users", async () => {
    try {
      const session = getCurrentSession();
      if (!session) {
        return { success: false, message: "Unauthorized" };
      }
      const allUsers = await db2.query.users.findMany({
        columns: {
          id: true,
          username: true,
          fullName: true,
          role: true
        },
        where: drizzleOrm.eq(users.isActive, true)
      });
      const otherUsers = allUsers.filter((u) => u.id !== session.userId);
      return { success: true, data: otherUsers };
    } catch (error) {
      console.error("Get users error:", error);
      return { success: false, message: "Failed to fetch users" };
    }
  });
}
function registerDashboardHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("dashboard:get-stats", async (_, params) => {
    try {
      const { branchId, timePeriod } = params;
      const dateRange = getDateRange(timePeriod);
      const profitResult = await db2.select({
        revenue: drizzleOrm.sql`COALESCE(SUM(${saleItems.unitPrice} * ${saleItems.quantity}), 0)`,
        cost: drizzleOrm.sql`COALESCE(SUM(${saleItems.costPrice} * ${saleItems.quantity}), 0)`,
        tax: drizzleOrm.sql`COALESCE(SUM(${saleItems.taxAmount}), 0)`
      }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).where(
        drizzleOrm.and(
          drizzleOrm.eq(sales.branchId, branchId),
          drizzleOrm.between(sales.saleDate, dateRange.start, dateRange.end),
          drizzleOrm.eq(sales.isVoided, false)
        )
      );
      const commissionResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${commissions.commissionAmount}), 0)`
      }).from(commissions).innerJoin(sales, drizzleOrm.eq(commissions.saleId, sales.id)).where(
        drizzleOrm.and(
          drizzleOrm.eq(commissions.branchId, branchId),
          drizzleOrm.between(sales.saleDate, dateRange.start, dateRange.end),
          drizzleOrm.eq(sales.isVoided, false)
        )
      );
      const revenue = profitResult[0]?.revenue || 0;
      const cost = profitResult[0]?.cost || 0;
      const taxCollected = profitResult[0]?.tax || 0;
      const commissionTotal = commissionResult[0]?.total || 0;
      const totalProfit = revenue - cost - commissionTotal - taxCollected;
      const salesCountResult = await db2.select({
        count: drizzleOrm.sql`COUNT(*)`
      }).from(sales).where(
        drizzleOrm.and(
          drizzleOrm.eq(sales.branchId, branchId),
          drizzleOrm.between(sales.saleDate, dateRange.start, dateRange.end),
          drizzleOrm.eq(sales.isVoided, false)
        )
      );
      const productsResult = await db2.select({ count: drizzleOrm.sql`COUNT(*)` }).from(products).where(drizzleOrm.eq(products.isActive, true));
      const soldResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${saleItems.quantity}), 0)`
      }).from(saleItems).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).where(
        drizzleOrm.and(
          drizzleOrm.eq(sales.branchId, branchId),
          drizzleOrm.between(sales.saleDate, dateRange.start, dateRange.end),
          drizzleOrm.eq(sales.isVoided, false)
        )
      );
      const purchasesResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${purchases.totalAmount}), 0)`
      }).from(purchases).where(
        drizzleOrm.and(
          drizzleOrm.eq(purchases.branchId, branchId),
          drizzleOrm.between(purchases.createdAt, dateRange.start, dateRange.end)
        )
      );
      const expensesResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${expenses.amount}), 0)`
      }).from(expenses).where(
        drizzleOrm.and(
          drizzleOrm.eq(expenses.branchId, branchId),
          drizzleOrm.between(expenses.expenseDate, dateRange.start, dateRange.end)
        )
      );
      const returnsResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${returns.totalAmount}), 0)`
      }).from(returns).where(
        drizzleOrm.and(
          drizzleOrm.eq(returns.branchId, branchId),
          drizzleOrm.between(returns.returnDate, dateRange.start, dateRange.end)
        )
      );
      const receivablesPendingResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${accountReceivables.remainingAmount}), 0)`
      }).from(accountReceivables).where(
        drizzleOrm.and(
          drizzleOrm.eq(accountReceivables.branchId, branchId),
          drizzleOrm.or(
            drizzleOrm.eq(accountReceivables.status, "pending"),
            drizzleOrm.eq(accountReceivables.status, "partial"),
            drizzleOrm.eq(accountReceivables.status, "overdue")
          )
        )
      );
      const receivablesReceivedResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${receivablePayments.amount}), 0)`
      }).from(receivablePayments).innerJoin(
        accountReceivables,
        drizzleOrm.eq(receivablePayments.receivableId, accountReceivables.id)
      ).where(
        drizzleOrm.and(
          drizzleOrm.eq(accountReceivables.branchId, branchId),
          drizzleOrm.between(receivablePayments.paymentDate, dateRange.start, dateRange.end)
        )
      );
      const payablesPendingResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${accountPayables.remainingAmount}), 0)`
      }).from(accountPayables).where(
        drizzleOrm.and(
          drizzleOrm.eq(accountPayables.branchId, branchId),
          drizzleOrm.or(
            drizzleOrm.eq(accountPayables.status, "pending"),
            drizzleOrm.eq(accountPayables.status, "partial"),
            drizzleOrm.eq(accountPayables.status, "overdue")
          )
        )
      );
      const payablesPaidResult = await db2.select({
        total: drizzleOrm.sql`COALESCE(SUM(${payablePayments.amount}), 0)`
      }).from(payablePayments).innerJoin(accountPayables, drizzleOrm.eq(payablePayments.payableId, accountPayables.id)).where(
        drizzleOrm.and(
          drizzleOrm.eq(accountPayables.branchId, branchId),
          drizzleOrm.between(payablePayments.paymentDate, dateRange.start, dateRange.end)
        )
      );
      let cashInHand = 0;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const openSession = await db2.query.cashRegisterSessions.findFirst({
        where: drizzleOrm.and(
          drizzleOrm.eq(cashRegisterSessions.branchId, branchId),
          drizzleOrm.eq(cashRegisterSessions.sessionDate, today),
          drizzleOrm.eq(cashRegisterSessions.status, "open")
        )
      });
      if (openSession) {
        const txSums = await db2.select({
          totalIn: drizzleOrm.sql`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} > 0 THEN ${cashTransactions.amount} ELSE 0 END), 0)`,
          totalOut: drizzleOrm.sql`COALESCE(SUM(CASE WHEN ${cashTransactions.amount} < 0 THEN ABS(${cashTransactions.amount}) ELSE 0 END), 0)`
        }).from(cashTransactions).where(drizzleOrm.eq(cashTransactions.sessionId, openSession.id));
        const totalIn = txSums[0]?.totalIn || 0;
        const totalOut = txSums[0]?.totalOut || 0;
        cashInHand = openSession.openingBalance + totalIn - totalOut;
      } else {
        const lastClosed = await db2.query.cashRegisterSessions.findFirst({
          where: drizzleOrm.and(
            drizzleOrm.eq(cashRegisterSessions.branchId, branchId),
            drizzleOrm.eq(cashRegisterSessions.status, "closed")
          ),
          orderBy: drizzleOrm.desc(cashRegisterSessions.sessionDate)
        });
        cashInHand = lastClosed?.closingBalance || 0;
      }
      const lowStockResult = await db2.select({ count: drizzleOrm.sql`COUNT(*)` }).from(inventory).where(
        drizzleOrm.and(
          drizzleOrm.eq(inventory.branchId, branchId),
          drizzleOrm.lte(inventory.quantity, inventory.minQuantity)
        )
      );
      const stats = {
        totalProfit,
        totalRevenue: revenue,
        totalCost: cost,
        totalTaxCollected: taxCollected,
        totalCommission: commissionTotal,
        totalProducts: productsResult[0]?.count || 0,
        totalProductsSold: soldResult[0]?.total || 0,
        totalPurchases: purchasesResult[0]?.total || 0,
        totalExpense: expensesResult[0]?.total || 0,
        totalReturns: returnsResult[0]?.total || 0,
        receivablesPending: receivablesPendingResult[0]?.total || 0,
        receivablesReceived: receivablesReceivedResult[0]?.total || 0,
        payablesPending: payablesPendingResult[0]?.total || 0,
        payablesPaid: payablesPaidResult[0]?.total || 0,
        cashInHand,
        lowStockCount: lowStockResult[0]?.count || 0,
        totalSalesCount: salesCountResult[0]?.count || 0
      };
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return { success: false, message: "Failed to fetch dashboard stats" };
    }
  });
}
function registerSetupHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("setup:check-first-run", async () => {
    console.log("[Setup IPC] check-first-run called");
    try {
      console.log("[Setup IPC] Querying application_info table...");
      const appInfo = db2.select().from(applicationInfo).limit(1).get();
      console.log("[Setup IPC] Query result:", appInfo ? "record found" : "no record");
      if (!appInfo) {
        console.log("[Setup IPC] No app info, setup needed");
        return { success: true, data: { needsSetup: true } };
      }
      const result = {
        success: true,
        data: {
          needsSetup: !appInfo.setupCompleted,
          installationDate: appInfo.installationDate
        }
      };
      console.log("[Setup IPC] Returning:", result);
      return result;
    } catch (error) {
      console.error("[Setup IPC] Check first run error:", error);
      return { success: false, message: "Failed to check setup status" };
    }
  });
  electron.ipcMain.handle("setup:complete", async (_, data) => {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
      const machineId = getMachineIdForDisplay();
      let appInfo = db2.select().from(applicationInfo).limit(1).get();
      if (!appInfo) {
        appInfo = db2.insert(applicationInfo).values({
          installationDate: now,
          firstRunDate: now,
          trialStartDate: now,
          trialEndDate,
          isLicensed: false,
          machineId,
          setupCompleted: true
        }).returning().get();
      } else {
        db2.update(applicationInfo).set({
          setupCompleted: true,
          updatedAt: now
        }).run();
      }
      const branchData = {
        name: data.branch.name,
        code: data.branch.code.toUpperCase(),
        address: data.branch.address || data.business.businessAddress,
        phone: data.branch.phone || data.business.businessPhone,
        email: data.branch.email || data.business.businessEmail,
        licenseNumber: data.branch.licenseNumber,
        isActive: true,
        isMain: true
      };
      const newBranch = db2.insert(branches).values(branchData).returning().get();
      const existingAdmin = await db2.query.users.findFirst({
        where: (u, { eq }) => eq(u.username, "admin")
      });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 12);
        const newAdmin = db2.insert(users).values({
          username: "admin",
          password: hashedPassword,
          email: data.business.businessEmail || "admin@store.com",
          fullName: "System Administrator",
          role: "admin",
          permissions: ["*"],
          isActive: true,
          branchId: newBranch.id
        }).returning().get();
        console.log("[Setup] Admin user created for branch:", newBranch.id, "userId:", newAdmin.id);
      }
      const settingsData = {
        branchId: newBranch.id,
        // Business Info
        businessName: data.business.businessName,
        businessRegistrationNo: data.business.businessRegistrationNo,
        businessType: data.business.businessType,
        businessAddress: data.business.businessAddress,
        businessCity: data.business.businessCity,
        businessState: data.business.businessState,
        businessCountry: data.business.businessCountry,
        businessPostalCode: data.business.businessPostalCode,
        businessPhone: data.business.businessPhone,
        businessEmail: data.business.businessEmail,
        businessWebsite: data.business.businessWebsite,
        businessLogo: data.business.businessLogo,
        // Tax & Currency
        currencyCode: data.taxCurrency.currencyCode,
        currencySymbol: data.taxCurrency.currencySymbol,
        currencyPosition: data.taxCurrency.currencyPosition,
        decimalPlaces: data.taxCurrency.decimalPlaces,
        taxName: data.taxCurrency.taxName,
        taxRate: data.taxCurrency.taxRate,
        taxId: data.taxCurrency.taxId,
        // Operations
        workingDaysStart: data.operations.workingDaysStart,
        workingDaysEnd: data.operations.workingDaysEnd,
        openingTime: data.operations.openingTime,
        closingTime: data.operations.closingTime,
        defaultPaymentMethod: data.operations.defaultPaymentMethod,
        allowedPaymentMethods: data.operations.allowedPaymentMethods,
        lowStockThreshold: data.operations.lowStockThreshold,
        stockValuationMethod: data.operations.stockValuationMethod,
        // Status
        isActive: true,
        isDefault: true
      };
      const newSettings = db2.insert(businessSettings).values(settingsData).returning().get();
      const globalSettingsData = {
        ...settingsData,
        branchId: null,
        isDefault: true
      };
      db2.insert(businessSettings).values(globalSettingsData).run();
      console.log("[Setup] Completed successfully:", {
        branchId: newBranch.id,
        settingsId: newSettings.settingId
      });
      return {
        success: true,
        data: {
          branch: newBranch,
          settings: newSettings
        }
      };
    } catch (error) {
      console.error("Setup complete error:", error);
      return { success: false, message: "Failed to complete setup" };
    }
  });
  electron.ipcMain.handle("setup:generate-branch-code", async (_, businessName) => {
    try {
      const words = businessName.trim().split(/\s+/);
      let code = "";
      if (words.length === 1) {
        code = words[0].substring(0, 4).toUpperCase();
      } else {
        code = words.slice(0, 4).map((w) => w[0]).join("").toUpperCase();
      }
      code = code + "01";
      let finalCode = code;
      let counter = 1;
      while (true) {
        const existing = db2.query.branches.findFirst({
          where: (b, { eq }) => eq(b.code, finalCode)
        });
        if (!existing) break;
        counter++;
        finalCode = code.slice(0, -2) + String(counter).padStart(2, "0");
      }
      return { success: true, data: finalCode };
    } catch (error) {
      console.error("Generate branch code error:", error);
      return { success: false, message: "Failed to generate branch code" };
    }
  });
}
function registerDatabaseResetHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("database:hard-reset", async (_, confirmationText) => {
    try {
      if (confirmationText !== "RESET") {
        return {
          success: false,
          message: 'Confirmation text does not match. Please type "RESET" exactly.'
        };
      }
      const rawDb = getRawDatabase();
      console.log("Starting hard reset...");
      rawDb.pragma("foreign_keys = OFF");
      try {
        console.log("Deleting commissions...");
        rawDb.prepare("DELETE FROM commissions").run();
        console.log("Deleting audit logs...");
        rawDb.prepare("DELETE FROM audit_logs").run();
        console.log("Deleting messages...");
        rawDb.prepare("DELETE FROM messages").run();
        console.log("Deleting todos...");
        rawDb.prepare("DELETE FROM todos").run();
        console.log("Deleting account receivables...");
        rawDb.prepare("DELETE FROM account_receivables").run();
        console.log("Deleting payable payments...");
        rawDb.prepare("DELETE FROM payable_payments").run();
        console.log("Deleting account payables...");
        rawDb.prepare("DELETE FROM account_payables").run();
        console.log("Deleting cash transactions...");
        rawDb.prepare("DELETE FROM cash_transactions").run();
        console.log("Deleting cash register sessions...");
        rawDb.prepare("DELETE FROM cash_register_sessions").run();
        console.log("Deleting journal entry lines...");
        rawDb.prepare("DELETE FROM journal_entry_lines").run();
        console.log("Deleting journal entries...");
        rawDb.prepare("DELETE FROM journal_entries").run();
        console.log("Deleting account balances...");
        rawDb.prepare("DELETE FROM account_balances").run();
        console.log("Deleting stock adjustments...");
        rawDb.prepare("DELETE FROM stock_adjustments").run();
        console.log("Deleting stock transfers...");
        rawDb.prepare("DELETE FROM stock_transfers").run();
        console.log("Deleting returns...");
        rawDb.prepare("DELETE FROM returns").run();
        console.log("Deleting sales tabs...");
        rawDb.prepare("DELETE FROM sales_tabs").run();
        console.log("Deleting sales...");
        rawDb.prepare("DELETE FROM sales").run();
        console.log("Deleting purchases...");
        rawDb.prepare("DELETE FROM purchases").run();
        console.log("Deleting expenses...");
        rawDb.prepare("DELETE FROM expenses").run();
        console.log("Deleting inventory...");
        rawDb.prepare("DELETE FROM inventory").run();
        console.log("Deleting products...");
        rawDb.prepare("DELETE FROM products").run();
        console.log("Deleting categories...");
        rawDb.prepare("DELETE FROM categories").run();
        console.log("Deleting customers...");
        rawDb.prepare("DELETE FROM customers").run();
        console.log("Deleting suppliers...");
        rawDb.prepare("DELETE FROM suppliers").run();
        console.log("Deleting referral persons...");
        rawDb.prepare("DELETE FROM referral_persons").run();
        console.log("Deleting chart of accounts...");
        rawDb.prepare("DELETE FROM chart_of_accounts").run();
        console.log("Deleting all users...");
        rawDb.prepare("DELETE FROM users").run();
        console.log("Deleting business settings...");
        rawDb.prepare("DELETE FROM business_settings").run();
        console.log("Deleting general settings...");
        rawDb.prepare("DELETE FROM settings").run();
        console.log("Deleting branches...");
        rawDb.prepare("DELETE FROM branches").run();
        console.log("Resetting application info...");
        rawDb.prepare("UPDATE application_info SET setup_completed = 0").run();
        rawDb.pragma("foreign_keys = ON");
        console.log("Data deleted. Creating default admin user...");
        const hashedPassword = await bcrypt.hash("admin123", 12);
        await db2.insert(users).values({
          username: "admin",
          password: hashedPassword,
          email: "admin@example.com",
          fullName: "Administrator",
          role: "admin",
          permissions: ["*"],
          isActive: true,
          branchId: null
        });
        console.log("Default admin user created successfully");
        console.log("Hard reset completed successfully!");
        return {
          success: true,
          message: "Database has been reset successfully. Please restart the application."
        };
      } catch (error) {
        rawDb.pragma("foreign_keys = ON");
        throw error;
      }
    } catch (error) {
      console.error("Hard reset error:", error);
      return {
        success: false,
        message: `Failed to reset database: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  });
  electron.ipcMain.handle("database:verify-admin", async (_, username, password) => {
    try {
      const user = await db2.query.users.findFirst({
        where: drizzleOrm.eq(users.username, username)
      });
      if (!user) {
        return { success: false, message: "Invalid credentials" };
      }
      if (user.role !== "admin") {
        return { success: false, message: "Only administrators can perform this action" };
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return { success: false, message: "Invalid credentials" };
      }
      return { success: true };
    } catch (error) {
      console.error("Admin verification error:", error);
      return { success: false, message: "Failed to verify credentials" };
    }
  });
}
const IMPORT_CATEGORIES = [
  {
    id: "inventory",
    name: "Inventory",
    description: "Products, Categories, Inventory, Purchases, Returns, Stock Adjustments",
    tables: ["products", "categories", "inventory", "purchases", "purchase_items", "returns", "return_items", "stock_adjustments", "stock_transfers"]
  },
  {
    id: "management",
    name: "Management",
    description: "Customers, Suppliers, Expenses, Commissions, Referral Persons, Receivables, Payables",
    tables: ["customers", "suppliers", "expenses", "commissions", "referral_persons", "account_receivables", "account_payables"]
  },
  {
    id: "finance",
    name: "Finance",
    description: "Cash Register, Chart of Accounts",
    tables: ["cash_register_sessions", "cash_register_transactions", "chart_of_accounts", "journal_entries", "journal_entry_lines"]
  },
  {
    id: "sales",
    name: "Sales",
    description: "Sales History, Sale Items, POS Tabs",
    tables: ["sales", "sale_items", "sales_tabs", "sales_tab_items"]
  },
  {
    id: "system",
    name: "System",
    description: "Users, Branches, Settings (Warning: may affect login)",
    tables: ["users", "branches", "settings", "business_settings"]
  }
];
let backupConfig = {
  autoBackupEnabled: false,
  autoBackupOnClose: false,
  autoBackupFrequency: "daily",
  autoBackupTime: "23:00",
  autoBackupDay: 0,
  backupRetentionDays: 30,
  lastBackupTime: null
};
let backupScheduleTimer = null;
function getBackupDir() {
  const userDataPath = electron.app.getPath("userData");
  const backupDir = node_path.join(userDataPath, "backups");
  if (!node_fs.existsSync(backupDir)) {
    node_fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}
function getConfigFilePath() {
  const userDataPath = electron.app.getPath("userData");
  return node_path.join(userDataPath, "backup-config.json");
}
function loadBackupConfig() {
  const configPath = getConfigFilePath();
  try {
    if (node_fs.existsSync(configPath)) {
      const data = node_fs.readFileSync(configPath, "utf-8");
      return { ...backupConfig, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Failed to load backup config:", err);
  }
  return backupConfig;
}
function saveBackupConfig(config) {
  const configPath = getConfigFilePath();
  try {
    node_fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    backupConfig = config;
  } catch (err) {
    console.error("Failed to save backup config:", err);
  }
}
function generateBackupFileName() {
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `firearms-pos-backup-${timestamp}.db`;
}
async function createBackup(reason = "manual") {
  try {
    const dbPath = getDbPath();
    const backupDir = getBackupDir();
    const backupFileName = generateBackupFileName();
    const backupPath = node_path.join(backupDir, backupFileName);
    if (!node_fs.existsSync(dbPath)) {
      return { success: false, message: "Database file not found" };
    }
    try {
      const rawDb = getRawDatabase();
      rawDb.pragma("wal_checkpoint(TRUNCATE)");
    } catch (err) {
      console.warn("Could not checkpoint WAL:", err);
    }
    node_fs.copyFileSync(dbPath, backupPath);
    const walPath = dbPath + "-wal";
    const shmPath = dbPath + "-shm";
    if (node_fs.existsSync(walPath)) {
      node_fs.copyFileSync(walPath, backupPath + "-wal");
    }
    if (node_fs.existsSync(shmPath)) {
      node_fs.copyFileSync(shmPath, backupPath + "-shm");
    }
    backupConfig.lastBackupTime = (/* @__PURE__ */ new Date()).toISOString();
    saveBackupConfig(backupConfig);
    console.log(`Backup created successfully: ${backupPath} (reason: ${reason})`);
    return {
      success: true,
      message: `Backup created successfully: ${backupFileName}`,
      filePath: backupPath
    };
  } catch (err) {
    console.error("Backup creation failed:", err);
    return {
      success: false,
      message: `Failed to create backup: ${err instanceof Error ? err.message : "Unknown error"}`
    };
  }
}
async function restoreBackup(backupPath) {
  try {
    if (!node_fs.existsSync(backupPath)) {
      return { success: false, message: "Backup file not found" };
    }
    const dbPath = getDbPath();
    closeDatabase();
    const backupDir = getBackupDir();
    const safetyBackupName = `pre-restore-backup-${Date.now()}.db`;
    const safetyBackupPath = node_path.join(backupDir, safetyBackupName);
    if (node_fs.existsSync(dbPath)) {
      node_fs.copyFileSync(dbPath, safetyBackupPath);
      console.log("Safety backup created before restore:", safetyBackupPath);
    }
    const walPath = dbPath + "-wal";
    const shmPath = dbPath + "-shm";
    if (node_fs.existsSync(dbPath)) node_fs.unlinkSync(dbPath);
    if (node_fs.existsSync(walPath)) node_fs.unlinkSync(walPath);
    if (node_fs.existsSync(shmPath)) node_fs.unlinkSync(shmPath);
    node_fs.copyFileSync(backupPath, dbPath);
    if (node_fs.existsSync(backupPath + "-wal")) {
      node_fs.copyFileSync(backupPath + "-wal", walPath);
    }
    if (node_fs.existsSync(backupPath + "-shm")) {
      node_fs.copyFileSync(backupPath + "-shm", shmPath);
    }
    initDatabase();
    console.log("Database restored successfully from:", backupPath);
    return {
      success: true,
      message: "Database restored successfully. Please restart the application."
    };
  } catch (err) {
    console.error("Restore failed:", err);
    try {
      initDatabase();
    } catch (_initErr) {
    }
    return {
      success: false,
      message: `Failed to restore backup: ${err instanceof Error ? err.message : "Unknown error"}`
    };
  }
}
function listBackups() {
  const backupDir = getBackupDir();
  const backups = [];
  try {
    const files = node_fs.readdirSync(backupDir);
    for (const file of files) {
      if (file.endsWith(".db") && !file.endsWith("-wal") && !file.endsWith("-shm")) {
        const filePath = node_path.join(backupDir, file);
        const stats = node_fs.statSync(filePath);
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        });
      }
    }
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to list backups:", err);
  }
  return backups;
}
function deleteBackup(backupPath) {
  try {
    if (!node_fs.existsSync(backupPath)) {
      return { success: false, message: "Backup file not found" };
    }
    node_fs.unlinkSync(backupPath);
    if (node_fs.existsSync(backupPath + "-wal")) node_fs.unlinkSync(backupPath + "-wal");
    if (node_fs.existsSync(backupPath + "-shm")) node_fs.unlinkSync(backupPath + "-shm");
    return { success: true, message: "Backup deleted successfully" };
  } catch (err) {
    console.error("Failed to delete backup:", err);
    return {
      success: false,
      message: `Failed to delete backup: ${err instanceof Error ? err.message : "Unknown error"}`
    };
  }
}
function cleanOldBackups(retentionDays) {
  const backups = listBackups();
  const cutoffDate = /* @__PURE__ */ new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  let deletedCount = 0;
  for (const backup of backups) {
    const backupDate = new Date(backup.createdAt);
    if (backupDate < cutoffDate) {
      const result = deleteBackup(backup.path);
      if (result.success) {
        deletedCount++;
        console.log(`Deleted old backup: ${backup.name}`);
      }
    }
  }
  return deletedCount;
}
async function previewBackup(backupPath) {
  try {
    if (!node_fs.existsSync(backupPath)) {
      return { success: false, message: "Backup file not found" };
    }
    const stats = node_fs.statSync(backupPath);
    const backupDb = new Database(backupPath, { readonly: true });
    try {
      const tablesResult = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
      const backupTables = tablesResult.map((t) => t.name);
      const categories2 = [];
      for (const category of IMPORT_CATEGORIES) {
        const tables = [];
        let totalRecords = 0;
        for (const tableName of category.tables) {
          if (backupTables.includes(tableName)) {
            try {
              const countResult = backupDb.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get();
              const count = countResult?.count || 0;
              tables.push({ name: tableName, count });
              totalRecords += count;
            } catch (err) {
              tables.push({ name: tableName, count: 0 });
            }
          }
        }
        if (tables.length > 0) {
          categories2.push({
            id: category.id,
            name: category.name,
            description: category.description,
            tables,
            totalRecords
          });
        }
      }
      let backupDate = null;
      try {
        const dateResult = backupDb.prepare("SELECT MAX(created_at) as latest FROM sales UNION SELECT MAX(created_at) FROM purchases ORDER BY latest DESC LIMIT 1").get();
        backupDate = dateResult?.latest || null;
      } catch {
      }
      backupDb.close();
      return {
        success: true,
        data: {
          isValid: categories2.length > 0,
          categories: categories2,
          backupDate,
          backupSize: stats.size
        }
      };
    } catch (err) {
      backupDb.close();
      throw err;
    }
  } catch (err) {
    console.error("Preview backup failed:", err);
    return {
      success: false,
      message: `Failed to preview backup: ${err instanceof Error ? err.message : "Unknown error"}`
    };
  }
}
async function importSelective(backupPath, selectedCategories, mergeMode = "replace") {
  try {
    if (!node_fs.existsSync(backupPath)) {
      return { success: false, message: "Backup file not found" };
    }
    if (selectedCategories.length === 0) {
      return { success: false, message: "No categories selected for import" };
    }
    const tablesToImport = [];
    for (const categoryId of selectedCategories) {
      const category = IMPORT_CATEGORIES.find((c) => c.id === categoryId);
      if (category) {
        tablesToImport.push(...category.tables);
      }
    }
    if (tablesToImport.length === 0) {
      return { success: false, message: "No valid tables found for selected categories" };
    }
    const backupDb = new Database(backupPath, { readonly: true });
    const currentDb = getRawDatabase();
    const backupDir = getBackupDir();
    const safetyBackupName = `pre-import-backup-${Date.now()}.db`;
    const safetyBackupPath = node_path.join(backupDir, safetyBackupName);
    const dbPath = getDbPath();
    try {
      currentDb.pragma("wal_checkpoint(TRUNCATE)");
      node_fs.copyFileSync(dbPath, safetyBackupPath);
      console.log("Safety backup created before selective import:", safetyBackupPath);
    } catch (err) {
      console.warn("Could not create safety backup:", err);
    }
    const imported = [];
    const tablesResult = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const backupTables = tablesResult.map((t) => t.name);
    for (const categoryId of selectedCategories) {
      const category = IMPORT_CATEGORIES.find((c) => c.id === categoryId);
      if (!category) continue;
      const importedTables = [];
      let totalRecords = 0;
      for (const tableName of category.tables) {
        if (!backupTables.includes(tableName)) continue;
        try {
          const tableExistsResult = currentDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
          if (!tableExistsResult) {
            console.log(`Table ${tableName} does not exist in current database, skipping`);
            continue;
          }
          const columnsResult = currentDb.prepare(`PRAGMA table_info("${tableName}")`).all();
          const currentColumns = columnsResult.map((c) => c.name);
          const rows = backupDb.prepare(`SELECT * FROM "${tableName}"`).all();
          if (rows.length === 0) continue;
          const backupColumns = Object.keys(rows[0]);
          const validColumns = backupColumns.filter((c) => currentColumns.includes(c));
          if (validColumns.length === 0) continue;
          const transaction = currentDb.transaction(() => {
            if (mergeMode === "replace") {
              currentDb.pragma("foreign_keys = OFF");
              currentDb.prepare(`DELETE FROM "${tableName}"`).run();
            }
            const placeholders = validColumns.map(() => "?").join(", ");
            const columnNames = validColumns.map((c) => `"${c}"`).join(", ");
            const insertStmt = currentDb.prepare(`INSERT OR REPLACE INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`);
            for (const row of rows) {
              const values = validColumns.map((col) => row[col]);
              try {
                insertStmt.run(...values);
              } catch (insertErr) {
                console.warn(`Failed to insert row into ${tableName}:`, insertErr);
              }
            }
            if (mergeMode === "replace") {
              currentDb.pragma("foreign_keys = ON");
            }
          });
          transaction();
          importedTables.push(tableName);
          totalRecords += rows.length;
          console.log(`Imported ${rows.length} records into ${tableName}`);
        } catch (tableErr) {
          console.error(`Failed to import table ${tableName}:`, tableErr);
        }
      }
      if (importedTables.length > 0) {
        imported.push({
          category: category.name,
          tables: importedTables,
          records: totalRecords
        });
      }
    }
    backupDb.close();
    if (imported.length === 0) {
      return { success: false, message: "No data was imported. The selected categories may be empty or incompatible." };
    }
    const totalImported = imported.reduce((sum, cat) => sum + cat.records, 0);
    return {
      success: true,
      message: `Successfully imported ${totalImported} records from ${imported.length} category(ies)`,
      imported
    };
  } catch (err) {
    console.error("Selective import failed:", err);
    return {
      success: false,
      message: `Import failed: ${err instanceof Error ? err.message : "Unknown error"}`
    };
  }
}
function scheduleNextBackup() {
  if (backupScheduleTimer) {
    clearTimeout(backupScheduleTimer);
    backupScheduleTimer = null;
    console.log("Cleared existing backup schedule");
  }
  if (!backupConfig.autoBackupEnabled) {
    console.log("Auto backup is disabled, not scheduling");
    return;
  }
  try {
    const now = /* @__PURE__ */ new Date();
    let nextBackupTime;
    const timeParts = backupConfig.autoBackupTime.split(":");
    const hours = parseInt(timeParts[0]) || 23;
    const minutes = parseInt(timeParts[1]) || 0;
    switch (backupConfig.autoBackupFrequency) {
      case "daily": {
        nextBackupTime = new Date(now);
        nextBackupTime.setHours(hours, minutes, 0, 0);
        if (nextBackupTime <= now) {
          nextBackupTime.setDate(nextBackupTime.getDate() + 1);
        }
        break;
      }
      case "weekly": {
        nextBackupTime = new Date(now);
        nextBackupTime.setHours(hours, minutes, 0, 0);
        const targetDay = backupConfig.autoBackupDay || 0;
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
        if (daysUntilTarget === 0 && nextBackupTime <= now) {
          nextBackupTime.setDate(nextBackupTime.getDate() + 7);
        } else {
          nextBackupTime.setDate(nextBackupTime.getDate() + daysUntilTarget);
        }
        break;
      }
      case "monthly": {
        nextBackupTime = new Date(now);
        const targetDayOfMonth = Math.min(Math.max(backupConfig.autoBackupDay || 1, 1), 28);
        nextBackupTime.setDate(targetDayOfMonth);
        nextBackupTime.setHours(hours, minutes, 0, 0);
        if (nextBackupTime <= now) {
          nextBackupTime.setMonth(nextBackupTime.getMonth() + 1);
        }
        break;
      }
      default:
        console.log("Unknown backup frequency:", backupConfig.autoBackupFrequency);
        return;
    }
    const delay = nextBackupTime.getTime() - now.getTime();
    const MAX_TIMEOUT = 24 * 60 * 60 * 1e3;
    if (delay > MAX_TIMEOUT) {
      console.log(`Next backup scheduled for: ${nextBackupTime.toISOString()}`);
      console.log(`Delay too long (${Math.round(delay / 1e3 / 60 / 60)} hours), will recheck in 24 hours`);
      backupScheduleTimer = setTimeout(() => {
        scheduleNextBackup();
      }, MAX_TIMEOUT);
    } else {
      console.log(`Next backup scheduled for: ${nextBackupTime.toISOString()} (in ${Math.round(delay / 1e3 / 60)} minutes)`);
      backupScheduleTimer = setTimeout(async () => {
        console.log("Running scheduled backup...");
        try {
          const result = await createBackup("scheduled");
          if (result.success) {
            console.log("Scheduled backup completed successfully");
            cleanOldBackups(backupConfig.backupRetentionDays);
          } else {
            console.error("Scheduled backup failed:", result.message);
          }
        } catch (err) {
          console.error("Error during scheduled backup:", err);
        }
        scheduleNextBackup();
      }, delay);
    }
  } catch (err) {
    console.error("Error scheduling backup:", err);
  }
}
function registerBackupHandlers() {
  backupConfig = loadBackupConfig();
  scheduleNextBackup();
  electron.ipcMain.handle("backup:create", async (_) => {
    const result = await createBackup("manual");
    return result;
  });
  electron.ipcMain.handle("backup:restore", async (_, backupPath) => {
    const result = await restoreBackup(backupPath);
    return result;
  });
  electron.ipcMain.handle("backup:list", async () => {
    return { success: true, data: listBackups() };
  });
  electron.ipcMain.handle("backup:delete", async (_, backupPath) => {
    const result = deleteBackup(backupPath);
    return result;
  });
  electron.ipcMain.handle("backup:get-config", async () => {
    return { success: true, data: backupConfig };
  });
  electron.ipcMain.handle("backup:update-config", async (_, newConfig) => {
    console.log("backup:update-config called with:", newConfig);
    try {
      const previousConfig = { ...backupConfig };
      backupConfig = { ...backupConfig, ...newConfig };
      saveBackupConfig(backupConfig);
      console.log("Backup config saved:", backupConfig);
      if (previousConfig.autoBackupEnabled !== backupConfig.autoBackupEnabled || previousConfig.autoBackupFrequency !== backupConfig.autoBackupFrequency || previousConfig.autoBackupTime !== backupConfig.autoBackupTime || previousConfig.autoBackupDay !== backupConfig.autoBackupDay) {
        console.log("Auto backup settings changed, rescheduling...");
        scheduleNextBackup();
      }
      return { success: true, message: "Backup configuration updated", data: backupConfig };
    } catch (err) {
      console.error("Failed to update backup config:", err);
      return {
        success: false,
        message: `Failed to update config: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  });
  electron.ipcMain.handle("backup:export", async () => {
    console.log("backup:export called");
    try {
      const focusedWindow = electron.BrowserWindow.getFocusedWindow() || electron.BrowserWindow.getAllWindows()[0];
      if (!focusedWindow) {
        console.error("No browser window available for dialog");
        return { success: false, message: "No window available for dialog" };
      }
      const defaultFileName = generateBackupFileName();
      console.log("Opening save dialog with default filename:", defaultFileName);
      const result = await electron.dialog.showSaveDialog(focusedWindow, {
        title: "Export Database Backup",
        defaultPath: defaultFileName,
        filters: [
          { name: "SQLite Database", extensions: ["db"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      console.log("Save dialog result:", result);
      if (result.canceled || !result.filePath) {
        return { success: false, message: "Export cancelled" };
      }
      const dbPath = getDbPath();
      console.log("Database path:", dbPath);
      if (!node_fs.existsSync(dbPath)) {
        console.error("Database file not found at:", dbPath);
        return { success: false, message: "Database file not found" };
      }
      try {
        const rawDb = getRawDatabase();
        rawDb.pragma("wal_checkpoint(TRUNCATE)");
        console.log("WAL checkpoint completed");
      } catch (walErr) {
        console.warn("Could not checkpoint WAL:", walErr);
      }
      node_fs.copyFileSync(dbPath, result.filePath);
      console.log("Database copied to:", result.filePath);
      return { success: true, message: `Database exported successfully to: ${result.filePath}`, filePath: result.filePath };
    } catch (err) {
      console.error("Export backup failed:", err);
      return {
        success: false,
        message: `Export failed: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  });
  electron.ipcMain.handle("backup:import", async (_, userId) => {
    console.log("backup:import called");
    try {
      const focusedWindow = electron.BrowserWindow.getFocusedWindow() || electron.BrowserWindow.getAllWindows()[0];
      if (!focusedWindow) {
        console.error("No browser window available for dialog");
        return { success: false, message: "No window available for dialog" };
      }
      console.log("Opening open dialog for import");
      const result = await electron.dialog.showOpenDialog(focusedWindow, {
        title: "Import Database Backup",
        filters: [
          { name: "SQLite Database", extensions: ["db"] },
          { name: "All Files", extensions: ["*"] }
        ],
        properties: ["openFile"]
      });
      console.log("Open dialog result:", result);
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: "Import cancelled" };
      }
      const importPath = result.filePaths[0];
      console.log("Import path selected:", importPath);
      if (!node_fs.existsSync(importPath)) {
        console.error("Selected file does not exist:", importPath);
        return { success: false, message: "Selected file does not exist" };
      }
      console.log("Starting restore from:", importPath);
      const restoreResult = await restoreBackup(importPath);
      console.log("Restore result:", restoreResult);
      if (restoreResult.success && userId) {
        try {
          await createAuditLog({
            userId,
            action: "BACKUP_IMPORT",
            entityType: "system",
            entityId: 0,
            details: { filePath: importPath }
          });
        } catch (auditErr) {
          console.warn("Audit log failed after import:", auditErr);
        }
      }
      return restoreResult;
    } catch (err) {
      console.error("Import backup failed:", err);
      return {
        success: false,
        message: `Import failed: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  });
  electron.ipcMain.handle("backup:clean-old", async (_, retentionDays) => {
    const days = retentionDays ?? backupConfig.backupRetentionDays;
    const deletedCount = cleanOldBackups(days);
    return {
      success: true,
      message: `Cleaned ${deletedCount} old backup(s)`,
      deletedCount
    };
  });
  electron.ipcMain.handle("backup:get-directory", async () => {
    return { success: true, data: getBackupDir() };
  });
  electron.ipcMain.handle("backup:get-import-categories", async () => {
    return {
      success: true,
      data: IMPORT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description
      }))
    };
  });
  electron.ipcMain.handle("backup:preview", async (_, backupPath) => {
    try {
      let filePath = backupPath;
      if (!filePath) {
        const focusedWindow = electron.BrowserWindow.getFocusedWindow() || electron.BrowserWindow.getAllWindows()[0];
        if (!focusedWindow) {
          return { success: false, message: "No window available for dialog" };
        }
        const result = await electron.dialog.showOpenDialog(focusedWindow, {
          title: "Select Backup File to Import",
          filters: [
            { name: "SQLite Database", extensions: ["db"] },
            { name: "All Files", extensions: ["*"] }
          ],
          properties: ["openFile"]
        });
        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, message: "File selection cancelled" };
        }
        filePath = result.filePaths[0];
      }
      const previewResult = await previewBackup(filePath);
      if (previewResult.success && previewResult.data) {
        return {
          success: true,
          data: {
            ...previewResult.data,
            filePath
          }
        };
      }
      return previewResult;
    } catch (err) {
      console.error("Preview failed:", err);
      return {
        success: false,
        message: `Preview failed: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  });
  electron.ipcMain.handle("backup:import-selective", async (_, params) => {
    try {
      const { filePath, categories: categories2, mergeMode = "replace" } = params;
      if (!filePath) {
        return { success: false, message: "No backup file specified" };
      }
      if (!categories2 || categories2.length === 0) {
        return { success: false, message: "No categories selected" };
      }
      console.log(`Starting selective import from ${filePath}`);
      console.log(`Categories: ${categories2.join(", ")}`);
      console.log(`Mode: ${mergeMode}`);
      const result = await importSelective(filePath, categories2, mergeMode);
      return result;
    } catch (err) {
      console.error("Selective import failed:", err);
      return {
        success: false,
        message: `Import failed: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  });
  electron.ipcMain.handle("backup:import-full", async (_, backupPath) => {
    console.log("Full import requested for:", backupPath);
    const result = await restoreBackup(backupPath);
    return result;
  });
  console.log("Backup IPC handlers registered");
}
async function performCloseBackup() {
  if (backupConfig.autoBackupOnClose) {
    console.log("Performing backup on application close...");
    await createBackup("on-close");
  }
}
function stopBackupScheduler() {
  if (backupScheduleTimer) {
    clearTimeout(backupScheduleTimer);
    backupScheduleTimer = null;
  }
}
function registerTaxCollectionsHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("tax-collections:get-summary", async (_, params) => {
    try {
      const { branchId, startDate, endDate } = params;
      const conditions = [drizzleOrm.eq(sales.branchId, branchId), drizzleOrm.eq(sales.isVoided, false)];
      if (startDate && endDate) {
        conditions.push(drizzleOrm.between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`));
      } else if (startDate) {
        conditions.push(drizzleOrm.gte(sales.saleDate, `${startDate}T00:00:00.000Z`));
      } else if (endDate) {
        conditions.push(drizzleOrm.lte(sales.saleDate, `${endDate}T23:59:59.999Z`));
      }
      const whereClause = drizzleOrm.and(...conditions);
      const summaryResult = await db2.select({
        totalCollected: drizzleOrm.sql`sum(case when ${sales.paymentStatus} = 'paid' then ${sales.taxAmount} else 0 end)`,
        totalPending: drizzleOrm.sql`sum(case when ${sales.paymentStatus} != 'paid' then ${sales.taxAmount} else 0 end)`,
        paidSales: drizzleOrm.sql`sum(case when ${sales.paymentStatus} = 'paid' then 1 else 0 end)`,
        pendingSales: drizzleOrm.sql`sum(case when ${sales.paymentStatus} != 'paid' then 1 else 0 end)`,
        totalTax: drizzleOrm.sql`sum(${sales.taxAmount})`,
        totalSales: drizzleOrm.sql`count(*)`
      }).from(sales).where(whereClause);
      const summary = {
        totalCollected: summaryResult[0]?.totalCollected || 0,
        totalPending: summaryResult[0]?.totalPending || 0,
        paidSales: summaryResult[0]?.paidSales || 0,
        pendingSales: summaryResult[0]?.pendingSales || 0,
        averageTaxPerSale: summaryResult[0]?.totalSales > 0 ? (summaryResult[0]?.totalTax || 0) / summaryResult[0].totalSales : 0
      };
      const recordsData = await db2.select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        saleDate: sales.saleDate,
        subtotal: sales.subtotal,
        taxAmount: sales.taxAmount,
        totalAmount: sales.totalAmount,
        paymentStatus: sales.paymentStatus,
        customerId: sales.customerId
      }).from(sales).where(drizzleOrm.and(whereClause, drizzleOrm.sql`${sales.taxAmount} > 0`)).orderBy(drizzleOrm.desc(sales.saleDate)).limit(500);
      const records = await Promise.all(
        recordsData.map(async (record) => {
          let customerName = null;
          if (record.customerId) {
            const customer = await db2.query.customers.findFirst({
              where: drizzleOrm.eq(customers.id, record.customerId)
            });
            customerName = customer ? `${customer.firstName} ${customer.lastName || ""}`.trim() : null;
          }
          return {
            id: record.id,
            invoiceNumber: record.invoiceNumber,
            saleDate: record.saleDate,
            subtotal: record.subtotal,
            taxAmount: record.taxAmount,
            totalAmount: record.totalAmount,
            paymentStatus: record.paymentStatus,
            customerName
          };
        })
      );
      return {
        success: true,
        data: {
          summary,
          records
        }
      };
    } catch (error) {
      console.error("Get tax collections error:", error);
      return { success: false, message: "Failed to fetch tax collections" };
    }
  });
  electron.ipcMain.handle("tax-collections:get-sale-details", async (_, saleId) => {
    try {
      const sale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, saleId)
      });
      if (!sale) {
        return { success: false, message: "Sale not found" };
      }
      const items = await db2.select({
        saleItem: saleItems,
        product: products
      }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.eq(saleItems.saleId, saleId));
      const itemsWithTax = items.map((i) => ({
        productName: i.product.name,
        quantity: i.saleItem.quantity,
        unitPrice: i.saleItem.unitPrice,
        taxAmount: i.saleItem.taxAmount,
        totalPrice: i.saleItem.totalPrice
      }));
      return {
        success: true,
        data: {
          sale,
          items: itemsWithTax
        }
      };
    } catch (error) {
      console.error("Get tax sale details error:", error);
      return { success: false, message: "Failed to fetch sale details" };
    }
  });
  electron.ipcMain.handle(
    "tax-collections:get-periodic-report",
    async (_, params) => {
      try {
        const { branchId, period, year } = params;
        const startOfYear = `${year}-01-01T00:00:00.000Z`;
        const endOfYear = `${year}-12-31T23:59:59.999Z`;
        const conditions = [
          drizzleOrm.eq(sales.branchId, branchId),
          drizzleOrm.eq(sales.isVoided, false),
          drizzleOrm.between(sales.saleDate, startOfYear, endOfYear)
        ];
        let groupBy;
        if (period === "monthly") {
          groupBy = `strftime('%Y-%m', ${sales.saleDate.name})`;
        } else if (period === "quarterly") {
          groupBy = `strftime('%Y', ${sales.saleDate.name}) || '-Q' || ((cast(strftime('%m', ${sales.saleDate.name}) as integer) - 1) / 3 + 1)`;
        } else {
          groupBy = `strftime('%Y', ${sales.saleDate.name})`;
        }
        const report = await db2.select({
          period: drizzleOrm.sql`${groupBy}`,
          totalTax: drizzleOrm.sql`sum(${sales.taxAmount})`,
          totalSales: drizzleOrm.sql`count(*)`,
          paidTax: drizzleOrm.sql`sum(case when ${sales.paymentStatus} = 'paid' then ${sales.taxAmount} else 0 end)`,
          pendingTax: drizzleOrm.sql`sum(case when ${sales.paymentStatus} != 'paid' then ${sales.taxAmount} else 0 end)`
        }).from(sales).where(drizzleOrm.and(...conditions)).groupBy(drizzleOrm.sql`${groupBy}`).orderBy(drizzleOrm.sql`${groupBy}`);
        return {
          success: true,
          data: report
        };
      } catch (error) {
        console.error("Get periodic tax report error:", error);
        return { success: false, message: "Failed to fetch periodic report" };
      }
    }
  );
}
function registerDiscountManagementHandlers() {
  const db2 = getDatabase();
  electron.ipcMain.handle("discount-management:get-summary", async (_, params) => {
    try {
      const { branchId, startDate, endDate } = params;
      const conditions = [drizzleOrm.eq(sales.branchId, branchId), drizzleOrm.eq(sales.isVoided, false)];
      if (startDate && endDate) {
        conditions.push(drizzleOrm.between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`));
      } else if (startDate) {
        conditions.push(drizzleOrm.gte(sales.saleDate, `${startDate}T00:00:00.000Z`));
      } else if (endDate) {
        conditions.push(drizzleOrm.lte(sales.saleDate, `${endDate}T23:59:59.999Z`));
      }
      const whereClause = drizzleOrm.and(...conditions);
      const summaryResult = await db2.select({
        totalDiscountAmount: drizzleOrm.sql`sum(${sales.discountAmount})`,
        salesWithDiscount: drizzleOrm.sql`sum(case when ${sales.discountAmount} > 0 then 1 else 0 end)`,
        totalSales: drizzleOrm.sql`count(*)`,
        totalSubtotal: drizzleOrm.sql`sum(${sales.subtotal})`
      }).from(sales).where(whereClause);
      const salesWithDiscount = summaryResult[0]?.salesWithDiscount || 0;
      const totalSales = summaryResult[0]?.totalSales || 0;
      const totalDiscountAmount = summaryResult[0]?.totalDiscountAmount || 0;
      const totalSubtotal = summaryResult[0]?.totalSubtotal || 0;
      const averageDiscountPercent = salesWithDiscount > 0 && totalSubtotal > 0 ? totalDiscountAmount / totalSubtotal * 100 : 0;
      const topProducts = await db2.select({
        productName: products.name,
        discountAmount: drizzleOrm.sql`sum(${saleItems.discountAmount})`,
        count: drizzleOrm.sql`count(*)`
      }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).innerJoin(sales, drizzleOrm.eq(saleItems.saleId, sales.id)).where(drizzleOrm.and(whereClause, drizzleOrm.gt(saleItems.discountAmount, 0))).groupBy(products.id, products.name).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${saleItems.discountAmount})`)).limit(10);
      const summary = {
        totalDiscounts: salesWithDiscount,
        totalDiscountAmount,
        averageDiscountPercent,
        salesWithDiscount,
        totalSales,
        discountRate: totalSales > 0 ? salesWithDiscount / totalSales * 100 : 0,
        topDiscountedProducts: topProducts.map((p) => ({
          productName: p.productName,
          discountAmount: p.discountAmount || 0,
          count: p.count || 0
        }))
      };
      const recordsData = await db2.select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        saleDate: sales.saleDate,
        subtotal: sales.subtotal,
        discountAmount: sales.discountAmount,
        totalAmount: sales.totalAmount,
        paymentStatus: sales.paymentStatus,
        customerId: sales.customerId,
        userId: sales.userId
      }).from(sales).where(drizzleOrm.and(whereClause, drizzleOrm.gt(sales.discountAmount, 0))).orderBy(drizzleOrm.desc(sales.saleDate)).limit(500);
      const records = await Promise.all(
        recordsData.map(async (record) => {
          let customerName = null;
          if (record.customerId) {
            const customer = await db2.query.customers.findFirst({
              where: drizzleOrm.eq(customers.id, record.customerId)
            });
            customerName = customer ? `${customer.firstName} ${customer.lastName || ""}`.trim() : null;
          }
          let userName;
          if (record.userId) {
            const user = await db2.query.users.findFirst({
              where: drizzleOrm.eq(users.id, record.userId)
            });
            userName = user?.username;
          }
          const discountPercent = record.subtotal > 0 ? record.discountAmount / record.subtotal * 100 : 0;
          return {
            id: record.id,
            invoiceNumber: record.invoiceNumber,
            saleDate: record.saleDate,
            customerName,
            subtotal: record.subtotal,
            discountAmount: record.discountAmount,
            discountPercent,
            totalAmount: record.totalAmount,
            paymentStatus: record.paymentStatus,
            userId: record.userId,
            userName
          };
        })
      );
      return {
        success: true,
        data: {
          summary,
          records
        }
      };
    } catch (error) {
      console.error("Get discount summary error:", error);
      return { success: false, message: "Failed to fetch discount data" };
    }
  });
  electron.ipcMain.handle("discount-management:get-details", async (_, saleId) => {
    try {
      const sale = await db2.query.sales.findFirst({
        where: drizzleOrm.eq(sales.id, saleId)
      });
      if (!sale) {
        return { success: false, message: "Sale not found" };
      }
      let customerName = null;
      if (sale.customerId) {
        const customer = await db2.query.customers.findFirst({
          where: drizzleOrm.eq(customers.id, sale.customerId)
        });
        customerName = customer ? `${customer.firstName} ${customer.lastName || ""}`.trim() : null;
      }
      let userName;
      if (sale.userId) {
        const user = await db2.query.users.findFirst({
          where: drizzleOrm.eq(users.id, sale.userId)
        });
        userName = user?.username;
      }
      const itemsData = await db2.select({
        saleItem: saleItems,
        product: products
      }).from(saleItems).innerJoin(products, drizzleOrm.eq(saleItems.productId, products.id)).where(drizzleOrm.eq(saleItems.saleId, saleId));
      const items = itemsData.map((i) => ({
        productName: i.product.name,
        quantity: i.saleItem.quantity,
        unitPrice: i.saleItem.unitPrice,
        discountPercent: i.saleItem.discountPercent,
        discountAmount: i.saleItem.discountAmount,
        totalPrice: i.saleItem.totalPrice
      }));
      const discountPercent = sale.subtotal > 0 ? sale.discountAmount / sale.subtotal * 100 : 0;
      return {
        success: true,
        data: {
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          saleDate: sale.saleDate,
          customerName,
          subtotal: sale.subtotal,
          discountAmount: sale.discountAmount,
          discountPercent,
          totalAmount: sale.totalAmount,
          paymentStatus: sale.paymentStatus,
          userId: sale.userId,
          userName,
          items
        }
      };
    } catch (error) {
      console.error("Get discount details error:", error);
      return { success: false, message: "Failed to fetch discount details" };
    }
  });
  electron.ipcMain.handle(
    "discount-management:get-by-user",
    async (_, params) => {
      try {
        const { branchId, startDate, endDate } = params;
        const conditions = [drizzleOrm.eq(sales.branchId, branchId), drizzleOrm.eq(sales.isVoided, false), drizzleOrm.gt(sales.discountAmount, 0)];
        if (startDate && endDate) {
          conditions.push(drizzleOrm.between(sales.saleDate, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`));
        }
        const result = await db2.select({
          userId: sales.userId,
          userName: users.username,
          totalDiscountAmount: drizzleOrm.sql`sum(${sales.discountAmount})`,
          discountCount: drizzleOrm.sql`count(*)`,
          averageDiscount: drizzleOrm.sql`avg(${sales.discountAmount})`
        }).from(sales).innerJoin(users, drizzleOrm.eq(sales.userId, users.id)).where(drizzleOrm.and(...conditions)).groupBy(sales.userId, users.username).orderBy(drizzleOrm.desc(drizzleOrm.sql`sum(${sales.discountAmount})`));
        return {
          success: true,
          data: result
        };
      } catch (error) {
        console.error("Get discounts by user error:", error);
        return { success: false, message: "Failed to fetch user discount data" };
      }
    }
  );
  electron.ipcMain.handle(
    "discount-management:get-alerts",
    async (_, params) => {
      try {
        const { branchId, thresholdPercent, limit = 50 } = params;
        const alertsData = await db2.select({
          id: sales.id,
          invoiceNumber: sales.invoiceNumber,
          saleDate: sales.saleDate,
          subtotal: sales.subtotal,
          discountAmount: sales.discountAmount,
          totalAmount: sales.totalAmount,
          userId: sales.userId,
          customerId: sales.customerId
        }).from(sales).where(
          drizzleOrm.and(
            drizzleOrm.eq(sales.branchId, branchId),
            drizzleOrm.eq(sales.isVoided, false),
            drizzleOrm.sql`(${sales.discountAmount} / ${sales.subtotal}) * 100 > ${thresholdPercent}`
          )
        ).orderBy(drizzleOrm.desc(sales.saleDate)).limit(limit);
        const alerts = await Promise.all(
          alertsData.map(async (record) => {
            let customerName = null;
            if (record.customerId) {
              const customer = await db2.query.customers.findFirst({
                where: drizzleOrm.eq(customers.id, record.customerId)
              });
              customerName = customer ? `${customer.firstName} ${customer.lastName || ""}`.trim() : null;
            }
            let userName;
            if (record.userId) {
              const user = await db2.query.users.findFirst({
                where: drizzleOrm.eq(users.id, record.userId)
              });
              userName = user?.username;
            }
            const discountPercent = record.discountAmount / record.subtotal * 100;
            return {
              ...record,
              customerName,
              userName,
              discountPercent
            };
          })
        );
        return {
          success: true,
          data: alerts
        };
      } catch (error) {
        console.error("Get discount alerts error:", error);
        return { success: false, message: "Failed to fetch discount alerts" };
      }
    }
  );
}
function registerAllHandlers() {
  registerAuthHandlers();
  registerProductHandlers();
  registerCategoryHandlers();
  registerInventoryHandlers();
  registerCustomerHandlers();
  registerSupplierHandlers();
  registerSalesHandlers();
  registerSalesTabsHandlers();
  registerPurchaseHandlers();
  registerReturnHandlers();
  registerBranchHandlers();
  registerUserHandlers();
  registerExpenseHandlers();
  registerCommissionHandlers();
  registerAuditHandlers();
  registerSettingsHandlers();
  registerBusinessSettingsHandlers();
  registerReportHandlers();
  registerLicenseHandlers();
  registerDatabaseViewerHandlers();
  registerAccountReceivablesHandlers();
  registerAccountPayablesHandlers();
  registerReferralPersonHandlers();
  registerCashRegisterHandlers();
  registerChartOfAccountsHandlers();
  registerReceiptHandlers();
  registerTodosHandlers();
  registerManualMigrationHandlers();
  registerMessagesHandlers();
  registerDashboardHandlers();
  registerSetupHandlers();
  registerDatabaseResetHandlers();
  registerBackupHandlers();
  registerTaxCollectionsHandlers();
  registerDiscountManagementHandlers();
  console.log("All IPC handlers registered");
}
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  electron.dialog.showErrorBox("Application Error", `An unexpected error occurred:

${error.message}

${error.stack}`);
  electron.app.quit();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    require("electron").shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(node_path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.firearms.pos");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  try {
    initDatabase();
    console.log("Database initialized");
    await runMigrations();
    await seedInitialData();
    registerAllHandlers();
    console.log("IPC handlers registered");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    electron.dialog.showErrorBox(
      "Initialization Error",
      `Failed to initialize the application:

${errorMessage}

${errorStack}`
    );
    electron.app.quit();
    return;
  }
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", async () => {
  await performCloseBackup();
  stopBackupScheduler();
  closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", async () => {
  await performCloseBackup();
  stopBackupScheduler();
  closeDatabase();
});
