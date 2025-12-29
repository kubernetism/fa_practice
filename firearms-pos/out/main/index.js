"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const node_path = require("node:path");
const betterSqlite3 = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const node_fs = require("node:fs");
const sqliteCore = require("drizzle-orm/sqlite-core");
const migrator = require("drizzle-orm/better-sqlite3/migrator");
const drizzleOrm = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const dateFns = require("date-fns");
const node_crypto = require("node:crypto");
const node_os = require("node:os");
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
    enum: ["cash", "card", "credit", "mixed"]
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
const expenses = sqliteCore.sqliteTable("expenses", {
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
  createdAt: sqliteCore.text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: sqliteCore.text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const commissions = sqliteCore.sqliteTable("commissions", {
  id: sqliteCore.integer("id").primaryKey({ autoIncrement: true }),
  saleId: sqliteCore.integer("sale_id").notNull().references(() => sales.id),
  userId: sqliteCore.integer("user_id").notNull().references(() => users.id),
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
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  auditLogs,
  branches,
  categories,
  commissions,
  customers,
  expenses,
  inventory,
  products,
  purchaseItems,
  purchases,
  returnItems,
  returns,
  saleItems,
  sales,
  settings,
  stockAdjustments,
  stockTransfers,
  suppliers,
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
  for (const path of possiblePaths) {
    if (node_fs.existsSync(path) && node_fs.existsSync(node_path.join(path, "meta/_journal.json"))) {
      migrationsPath = path;
      console.log("Found migrations at:", path);
      break;
    }
  }
  if (!migrationsPath) {
    console.log("No migrations folder found, creating tables directly...");
    return;
  }
  try {
    migrator.migrate(db2, { migrationsFolder: migrationsPath });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}
async function seedInitialData() {
  const db2 = getDatabase();
  const existingBranches = await db2.query.branches.findMany();
  if (existingBranches.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }
  console.log("Seeding initial data...");
  const { branches: branches2, users: users2, settings: settings2, categories: categories2 } = await Promise.resolve().then(() => schema);
  const bcryptModule = await import("bcryptjs");
  const bcrypt2 = bcryptModule.default || bcryptModule;
  await db2.insert(branches2).values({
    name: "Main Store",
    code: "MAIN",
    address: "123 Main Street",
    phone: "555-0100",
    email: "main@firearmstore.com",
    isMain: true,
    isActive: true
  });
  const hashedPassword = await bcrypt2.hash("admin123", 12);
  await db2.insert(users2).values({
    username: "admin",
    password: hashedPassword,
    email: "admin@firearmstore.com",
    fullName: "System Administrator",
    role: "admin",
    permissions: ["*"],
    isActive: true,
    branchId: 1
  });
  await db2.insert(categories2).values([
    { name: "Firearms", description: "All firearms" },
    { name: "Ammunition", description: "All ammunition types" },
    { name: "Accessories", description: "Firearm accessories" },
    { name: "Safety Equipment", description: "Safety and storage equipment" },
    { name: "Cleaning Supplies", description: "Cleaning and maintenance supplies" }
  ]);
  await db2.insert(categories2).values([
    { name: "Handguns", parentId: 1, description: "All handguns" },
    { name: "Rifles", parentId: 1, description: "All rifles" },
    { name: "Shotguns", parentId: 1, description: "All shotguns" }
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
async function createAuditLog(params) {
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
        role: user.role,
        permissions: user.permissions ?? [],
        branchId: user.branchId,
        branchName
      };
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      const conditions = [drizzleOrm.lt(inventory.quantity, inventory.minQuantity)];
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
        await createAuditLog({
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
        await createAuditLog({
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
      await db2.update(inventory).set({
        quantity: drizzleOrm.sql`${inventory.quantity} - ${transfer.quantity}`,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, transfer.productId), drizzleOrm.eq(inventory.branchId, transfer.fromBranchId)));
      const destInventory = await db2.query.inventory.findFirst({
        where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, transfer.productId), drizzleOrm.eq(inventory.branchId, transfer.toBranchId))
      });
      if (destInventory) {
        await db2.update(inventory).set({
          quantity: drizzleOrm.sql`${inventory.quantity} + ${transfer.quantity}`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(inventory.id, destInventory.id));
      } else {
        await db2.insert(inventory).values({
          productId: transfer.productId,
          branchId: transfer.toBranchId,
          quantity: transfer.quantity
        });
      }
      await db2.update(stockTransfers).set({
        status: "completed",
        receivedDate: (/* @__PURE__ */ new Date()).toISOString(),
        receivedBy: session?.userId,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(stockTransfers.id, transferId));
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      let subtotal = 0;
      let taxAmount = 0;
      const saleItemsData = [];
      for (const item of data.items) {
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
          costPrice: item.costPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: itemDiscount,
          taxAmount: itemTax,
          totalPrice: itemTotal
        });
      }
      const discountAmount = data.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      const changeGiven = data.amountPaid > totalAmount ? data.amountPaid - totalAmount : 0;
      const paymentStatus = data.amountPaid >= totalAmount ? "paid" : data.amountPaid > 0 ? "partial" : "pending";
      const invoiceNumber = generateInvoiceNumber();
      const [sale] = await db2.insert(sales).values({
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
      for (const item of saleItemsData) {
        await db2.insert(saleItems).values({
          ...item,
          saleId: sale.id
        });
      }
      for (const item of data.items) {
        await db2.update(inventory).set({
          quantity: drizzleOrm.sql`${inventory.quantity} - ${item.quantity}`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, data.branchId)));
      }
      if (session?.userId) {
        const commissionRate = 2;
        const commissionAmount = subtotal * (commissionRate / 100);
        await db2.insert(commissions).values({
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
      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "sale",
        entityId: sale.id,
        newValues: {
          invoiceNumber,
          totalAmount,
          itemCount: data.items.length
        },
        description: `Created sale: ${invoiceNumber}`
      });
      return { success: true, data: sale };
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
      for (const item of items) {
        await db2.update(inventory).set({
          quantity: drizzleOrm.sql`${inventory.quantity} + ${item.quantity}`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, sale.branchId)));
      }
      await db2.update(sales).set({
        isVoided: true,
        voidReason: reason,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(sales.id, id));
      await db2.update(commissions).set({
        status: "cancelled",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.eq(commissions.saleId, id));
      await createAuditLog({
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
      const [purchase] = await db2.insert(purchases).values({
        purchaseOrderNumber,
        supplierId: data.supplierId,
        branchId: data.branchId,
        userId: session?.userId ?? 0,
        subtotal,
        taxAmount: 0,
        shippingCost,
        totalAmount,
        paymentStatus: "pending",
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
      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "purchase",
        entityId: purchase.id,
        newValues: {
          purchaseOrderNumber,
          totalAmount,
          itemCount: data.items.length
        },
        description: `Created purchase order: ${purchaseOrderNumber}`
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
        for (const item of receivedItems) {
          const purchaseItem = await db2.query.purchaseItems.findFirst({
            where: drizzleOrm.eq(purchaseItems.id, item.itemId)
          });
          if (!purchaseItem) continue;
          await db2.update(purchaseItems).set({
            receivedQuantity: drizzleOrm.sql`${purchaseItems.receivedQuantity} + ${item.receivedQuantity}`
          }).where(drizzleOrm.eq(purchaseItems.id, item.itemId));
          const existingInventory = await db2.query.inventory.findFirst({
            where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, purchaseItem.productId), drizzleOrm.eq(inventory.branchId, purchase.branchId))
          });
          if (existingInventory) {
            await db2.update(inventory).set({
              quantity: drizzleOrm.sql`${inventory.quantity} + ${item.receivedQuantity}`,
              lastRestockDate: (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(drizzleOrm.eq(inventory.id, existingInventory.id));
          } else {
            await db2.insert(inventory).values({
              productId: purchaseItem.productId,
              branchId: purchase.branchId,
              quantity: item.receivedQuantity,
              lastRestockDate: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          await db2.update(products).set({
            costPrice: purchaseItem.unitCost,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(drizzleOrm.eq(products.id, purchaseItem.productId));
        }
        const allItems = await db2.query.purchaseItems.findMany({
          where: drizzleOrm.eq(purchaseItems.purchaseId, purchaseId)
        });
        const allReceived = allItems.every((item) => item.receivedQuantity >= item.quantity);
        const partiallyReceived = allItems.some((item) => item.receivedQuantity > 0);
        const newStatus = allReceived ? "received" : partiallyReceived ? "partial" : purchase.status;
        await db2.update(purchases).set({
          status: newStatus,
          receivedDate: allReceived ? (/* @__PURE__ */ new Date()).toISOString() : null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(drizzleOrm.eq(purchases.id, purchaseId));
        await createAuditLog({
          userId: session?.userId,
          branchId: purchase.branchId,
          action: "update",
          entityType: "purchase",
          entityId: purchaseId,
          newValues: {
            status: newStatus,
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
      await createAuditLog({
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
      let subtotal = 0;
      let taxAmount = 0;
      const returnItemsData = [];
      for (const item of data.items) {
        const totalPrice = item.unitPrice * item.quantity;
        subtotal += totalPrice;
        const originalItem = await db2.query.saleItems.findFirst({
          where: drizzleOrm.eq(saleItems.id, item.saleItemId)
        });
        if (originalItem) {
          const itemTax = originalItem.taxAmount / originalItem.quantity * item.quantity;
          taxAmount += itemTax;
        }
        returnItemsData.push({
          saleItemId: item.saleItemId,
          productId: item.productId,
          serialNumber: item.serialNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          condition: item.condition,
          restockable: item.restockable
        });
      }
      const totalAmount = subtotal + taxAmount;
      const returnNumber = generateReturnNumber();
      const [returnRecord] = await db2.insert(returns).values({
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
        await db2.insert(returnItems).values({
          ...item,
          returnId: returnRecord.id
        });
      }
      for (const item of data.items) {
        if (item.restockable) {
          const existingInventory = await db2.query.inventory.findFirst({
            where: drizzleOrm.and(drizzleOrm.eq(inventory.productId, item.productId), drizzleOrm.eq(inventory.branchId, data.branchId))
          });
          if (existingInventory) {
            await db2.update(inventory).set({
              quantity: drizzleOrm.sql`${inventory.quantity} + ${item.quantity}`,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(drizzleOrm.eq(inventory.id, existingInventory.id));
          } else {
            await db2.insert(inventory).values({
              productId: item.productId,
              branchId: data.branchId,
              quantity: item.quantity
            });
          }
        }
      }
      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: "refund",
        entityType: "return",
        entityId: returnRecord.id,
        newValues: {
          returnNumber,
          originalSaleId: data.originalSaleId,
          totalAmount,
          itemCount: data.items.length
        },
        description: `Created return: ${returnNumber}`
      });
      return { success: true, data: returnRecord };
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
      await createAuditLog({
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
          orderBy: sortOrder === "desc" ? drizzleOrm.desc(expenses.expenseDate) : expenses.expenseDate
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
        where: drizzleOrm.eq(expenses.id, id)
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
      const result = await db2.insert(expenses).values({
        ...data,
        userId: session?.userId ?? 0
      }).returning();
      const newExpense = result[0];
      await createAuditLog({
        userId: session?.userId,
        branchId: data.branchId,
        action: "create",
        entityType: "expense",
        entityId: newExpense.id,
        newValues: sanitizeForAudit(data),
        description: `Created expense: ${data.category} - $${data.amount}`
      });
      return { success: true, data: newExpense };
    } catch (error) {
      console.error("Create expense error:", error);
      return { success: false, message: "Failed to create expense" };
    }
  });
  electron.ipcMain.handle("expenses:update", async (_, id, data) => {
    try {
      const session = getCurrentSession();
      const existing = await db2.query.expenses.findFirst({
        where: drizzleOrm.eq(expenses.id, id)
      });
      if (!existing) {
        return { success: false, message: "Expense not found" };
      }
      const result = await db2.update(expenses).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(drizzleOrm.eq(expenses.id, id)).returning();
      await createAuditLog({
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
        where: drizzleOrm.eq(expenses.id, id)
      });
      if (!existing) {
        return { success: false, message: "Expense not found" };
      }
      await db2.delete(expenses).where(drizzleOrm.eq(expenses.id, id));
      await createAuditLog({
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
        const { page = 1, limit = 20, sortOrder = "desc", userId, branchId, status, startDate, endDate } = params;
        const conditions = [];
        if (userId) conditions.push(drizzleOrm.eq(commissions.userId, userId));
        if (branchId) conditions.push(drizzleOrm.eq(commissions.branchId, branchId));
        if (status)
          conditions.push(drizzleOrm.eq(commissions.status, status));
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
          sale: {
            id: sales.id,
            invoiceNumber: sales.invoiceNumber
          }
        }).from(commissions).innerJoin(users, drizzleOrm.eq(commissions.userId, users.id)).innerJoin(sales, drizzleOrm.eq(commissions.saleId, sales.id)).where(whereClause).limit(limit).offset((page - 1) * limit).orderBy(sortOrder === "desc" ? drizzleOrm.desc(commissions.createdAt) : commissions.createdAt);
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
  electron.ipcMain.handle("commissions:get-summary", async (_, userId, startDate, endDate) => {
    try {
      const conditions = [drizzleOrm.eq(commissions.userId, userId)];
      if (startDate && endDate) {
        conditions.push(drizzleOrm.between(commissions.createdAt, startDate, endDate));
      }
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
  electron.ipcMain.handle("commissions:approve", async (_, ids) => {
    try {
      const session = getCurrentSession();
      await db2.update(commissions).set({
        status: "approved",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.and(drizzleOrm.eq(commissions.status, "pending"), drizzleOrm.sql`${commissions.id} IN (${drizzleOrm.sql.join(ids.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`));
      for (const id of ids) {
        await createAuditLog({
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
      await db2.update(commissions).set({
        status: "paid",
        paidDate: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(drizzleOrm.and(drizzleOrm.eq(commissions.status, "approved"), drizzleOrm.sql`${commissions.id} IN (${drizzleOrm.sql.join(ids.map((id) => drizzleOrm.sql`${id}`), drizzleOrm.sql`, `)})`));
      for (const id of ids) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "update",
          entityType: "commission",
          entityId: id,
          newValues: { status: "paid" },
          description: `Marked commission #${id} as paid`
        });
      }
      return { success: true, message: `${ids.length} commission(s) marked as paid` };
    } catch (error) {
      console.error("Mark paid commissions error:", error);
      return { success: false, message: "Failed to mark commissions as paid" };
    }
  });
  electron.ipcMain.handle(
    "commissions:calculate",
    async (_, saleId, userId, branchId, baseAmount, rate) => {
      try {
        const session = getCurrentSession();
        const commissionAmount = baseAmount * (rate / 100);
        const [newCommission] = await db2.insert(commissions).values({
          saleId,
          userId,
          branchId,
          commissionType: "sale",
          baseAmount,
          rate,
          commissionAmount,
          status: "pending"
        }).returning();
        await createAuditLog({
          userId: session?.userId,
          branchId,
          action: "create",
          entityType: "commission",
          entityId: newCommission.id,
          newValues: { saleId, userId, commissionAmount },
          description: `Created commission for sale #${saleId}`
        });
        return { success: true, data: newCommission };
      } catch (error) {
        console.error("Calculate commission error:", error);
        return { success: false, message: "Failed to calculate commission" };
      }
    }
  );
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
        const whereClause = conditions.length > 0 ? drizzleOrm.and(...conditions) : void 0;
        const countResult = await db2.select({ count: drizzleOrm.sql`count(*)` }).from(auditLogs).where(whereClause);
        const total = countResult[0].count;
        const data = await db2.select({
          auditLog: auditLogs,
          user: {
            id: users.id,
            fullName: users.fullName,
            username: users.username
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
  electron.ipcMain.handle("audit:get-by-entity", async (_, entityType, entityId) => {
    try {
      const data = await db2.select({
        auditLog: auditLogs,
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username
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
        const { startDate, endDate, branchId, format = "json" } = params;
        const conditions = [drizzleOrm.between(auditLogs.createdAt, startDate, endDate)];
        if (branchId) conditions.push(drizzleOrm.eq(auditLogs.branchId, branchId));
        const data = await db2.select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          branchId: auditLogs.branchId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          description: auditLogs.description,
          createdAt: auditLogs.createdAt,
          username: users.username,
          userFullName: users.fullName
        }).from(auditLogs).leftJoin(users, drizzleOrm.eq(auditLogs.userId, users.id)).where(drizzleOrm.and(...conditions)).orderBy(drizzleOrm.desc(auditLogs.createdAt));
        if (format === "csv") {
          const headers = [
            "ID",
            "Date",
            "User",
            "Action",
            "Entity Type",
            "Entity ID",
            "Description",
            "Branch ID"
          ];
          const rows = data.map((row) => [
            row.id,
            row.createdAt,
            row.userFullName || row.username || "System",
            row.action,
            row.entityType,
            row.entityId ?? "",
            row.description ?? "",
            row.branchId ?? ""
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
          await createAuditLog({
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
          await createAuditLog({
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
      await createAuditLog({
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
        await createAuditLog({
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
      await createAuditLog({
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
        await createAuditLog({
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
        await createAuditLog({
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
}
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
  const hash = node_crypto.createHash("sha256");
  hash.update(components.join("|"));
  return hash.digest("hex").substring(0, 32);
}
function getLicenseFilePath() {
  return node_path.join(electron.app.getPath("userData"), "license.json");
}
function getLicenseStatus() {
  const licensePath = getLicenseFilePath();
  if (!node_fs.existsSync(licensePath)) {
    return {
      isValid: false,
      isActivated: false,
      expiresAt: null,
      features: [],
      message: "No license found. Please activate your license."
    };
  }
  try {
    const licenseData = JSON.parse(node_fs.readFileSync(licensePath, "utf-8"));
    if (licenseData.machineId !== getMachineId()) {
      return {
        isValid: false,
        isActivated: false,
        expiresAt: null,
        features: [],
        message: "License is not valid for this machine."
      };
    }
    if (licenseData.expiresAt && new Date(licenseData.expiresAt) < /* @__PURE__ */ new Date()) {
      return {
        isValid: false,
        isActivated: true,
        expiresAt: licenseData.expiresAt,
        features: licenseData.features,
        message: "License has expired. Please renew your license."
      };
    }
    return {
      isValid: true,
      isActivated: true,
      expiresAt: licenseData.expiresAt,
      features: licenseData.features,
      message: "License is valid."
    };
  } catch {
    return {
      isValid: false,
      isActivated: false,
      expiresAt: null,
      features: [],
      message: "Failed to read license file."
    };
  }
}
function activateLicense(licenseKey) {
  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(licenseKey)) {
    return { success: false, message: "Invalid license key format." };
  }
  const licenseData = {
    key: licenseKey,
    machineId: getMachineId(),
    activatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: null,
    // Perpetual license for demo
    features: ["pos", "inventory", "reports", "multi-branch"]
  };
  try {
    node_fs.writeFileSync(getLicenseFilePath(), JSON.stringify(licenseData, null, 2));
    return { success: true, message: "License activated successfully." };
  } catch {
    return { success: false, message: "Failed to save license." };
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
function registerLicenseHandlers() {
  electron.ipcMain.handle("license:get-machine-id", async () => {
    try {
      const machineId = getMachineId();
      return { success: true, data: machineId };
    } catch (error) {
      console.error("Get machine ID error:", error);
      return { success: false, message: "Failed to get machine ID" };
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
      const result = activateLicense(licenseKey);
      if (result.success) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "create",
          entityType: "setting",
          description: "License activated"
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
      const result = deactivateLicense();
      if (result.success) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: "delete",
          entityType: "setting",
          description: "License deactivated"
        });
      }
      return result;
    } catch (error) {
      console.error("Deactivate license error:", error);
      return { success: false, message: "Failed to deactivate license" };
    }
  });
}
function registerAllHandlers() {
  registerAuthHandlers();
  registerProductHandlers();
  registerCategoryHandlers();
  registerInventoryHandlers();
  registerCustomerHandlers();
  registerSupplierHandlers();
  registerSalesHandlers();
  registerPurchaseHandlers();
  registerReturnHandlers();
  registerBranchHandlers();
  registerUserHandlers();
  registerExpenseHandlers();
  registerCommissionHandlers();
  registerAuditHandlers();
  registerSettingsHandlers();
  registerReportHandlers();
  registerLicenseHandlers();
  console.log("All IPC handlers registered");
}
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
  }
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  closeDatabase();
});
