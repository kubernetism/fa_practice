"use strict";
const electron = require("electron");
const api = {
  // Auth
  auth: {
    login: (username, password) => electron.ipcRenderer.invoke("auth:login", username, password),
    logout: () => electron.ipcRenderer.invoke("auth:logout"),
    getCurrentUser: () => electron.ipcRenderer.invoke("auth:get-current-user"),
    changePassword: (userId, currentPassword, newPassword) => electron.ipcRenderer.invoke("auth:change-password", userId, currentPassword, newPassword),
    checkPermission: (permission) => electron.ipcRenderer.invoke("auth:check-permission", permission)
  },
  // Products
  products: {
    getAll: (params) => electron.ipcRenderer.invoke("products:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("products:get-by-id", id),
    getByBarcode: (barcode) => electron.ipcRenderer.invoke("products:get-by-barcode", barcode),
    create: (data) => electron.ipcRenderer.invoke("products:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("products:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("products:delete", id),
    search: (query) => electron.ipcRenderer.invoke("products:search", query)
  },
  // Categories
  categories: {
    getAll: () => electron.ipcRenderer.invoke("categories:get-all"),
    getTree: () => electron.ipcRenderer.invoke("categories:get-tree"),
    getById: (id) => electron.ipcRenderer.invoke("categories:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("categories:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("categories:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("categories:delete", id)
  },
  // Inventory
  inventory: {
    getAll: () => electron.ipcRenderer.invoke("inventory:get-all"),
    getByBranch: (branchId) => electron.ipcRenderer.invoke("inventory:get-by-branch", branchId),
    getLowStock: (branchId) => electron.ipcRenderer.invoke("inventory:get-low-stock", branchId),
    getProductStock: (productId, branchId) => electron.ipcRenderer.invoke("inventory:get-product-stock", productId, branchId),
    adjust: (data) => electron.ipcRenderer.invoke("inventory:adjust", data),
    transfer: (data) => electron.ipcRenderer.invoke("inventory:transfer", data),
    completeTransfer: (transferId) => electron.ipcRenderer.invoke("inventory:complete-transfer", transferId),
    getAdjustments: (productId, branchId) => electron.ipcRenderer.invoke("inventory:get-adjustments", productId, branchId),
    getTransfers: (branchId) => electron.ipcRenderer.invoke("inventory:get-transfers", branchId)
  },
  // Customers
  customers: {
    getAll: (params) => electron.ipcRenderer.invoke("customers:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("customers:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("customers:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("customers:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("customers:delete", id),
    checkLicense: (customerId) => electron.ipcRenderer.invoke("customers:check-license", customerId),
    search: (query) => electron.ipcRenderer.invoke("customers:search", query),
    getExpiringLicenses: (daysThreshold) => electron.ipcRenderer.invoke("customers:get-expiring-licenses", daysThreshold)
  },
  // Suppliers
  suppliers: {
    getAll: (params) => electron.ipcRenderer.invoke("suppliers:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("suppliers:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("suppliers:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("suppliers:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("suppliers:delete", id)
  },
  // Sales
  sales: {
    create: (data) => electron.ipcRenderer.invoke("sales:create", data),
    getAll: (params) => electron.ipcRenderer.invoke("sales:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("sales:get-by-id", id),
    void: (id, reason) => electron.ipcRenderer.invoke("sales:void", id, reason),
    getDailySummary: (branchId, date) => electron.ipcRenderer.invoke("sales:get-daily-summary", branchId, date)
  },
  // Purchases
  purchases: {
    create: (data) => electron.ipcRenderer.invoke("purchases:create", data),
    getAll: (params) => electron.ipcRenderer.invoke("purchases:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("purchases:get-by-id", id),
    receive: (purchaseId, receivedItems) => electron.ipcRenderer.invoke("purchases:receive", purchaseId, receivedItems),
    updateStatus: (id, status) => electron.ipcRenderer.invoke("purchases:update-status", id, status)
  },
  // Returns
  returns: {
    create: (data) => electron.ipcRenderer.invoke("returns:create", data),
    getAll: (params) => electron.ipcRenderer.invoke("returns:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("returns:get-by-id", id)
  },
  // Branches
  branches: {
    getAll: () => electron.ipcRenderer.invoke("branches:get-all"),
    getActive: () => electron.ipcRenderer.invoke("branches:get-active"),
    getById: (id) => electron.ipcRenderer.invoke("branches:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("branches:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("branches:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("branches:delete", id)
  },
  // Users
  users: {
    getAll: (params) => electron.ipcRenderer.invoke("users:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("users:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("users:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("users:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("users:delete", id),
    updatePermissions: (id, permissions) => electron.ipcRenderer.invoke("users:update-permissions", id, permissions)
  },
  // Expenses
  expenses: {
    getAll: (params) => electron.ipcRenderer.invoke("expenses:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("expenses:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("expenses:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("expenses:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("expenses:delete", id),
    getByCategory: (branchId, startDate, endDate) => electron.ipcRenderer.invoke("expenses:get-by-category", branchId, startDate, endDate)
  },
  // Commissions
  commissions: {
    getAll: (params) => electron.ipcRenderer.invoke("commissions:get-all", params),
    getSummary: (userId, startDate, endDate) => electron.ipcRenderer.invoke("commissions:get-summary", userId, startDate, endDate),
    approve: (ids) => electron.ipcRenderer.invoke("commissions:approve", ids),
    markPaid: (ids) => electron.ipcRenderer.invoke("commissions:mark-paid", ids),
    calculate: (saleId, userId, branchId, baseAmount, rate) => electron.ipcRenderer.invoke("commissions:calculate", saleId, userId, branchId, baseAmount, rate)
  },
  // Audit Logs
  audit: {
    getLogs: (params) => electron.ipcRenderer.invoke("audit:get-logs", params),
    getByEntity: (entityType, entityId) => electron.ipcRenderer.invoke("audit:get-by-entity", entityType, entityId),
    export: (params) => electron.ipcRenderer.invoke("audit:export", params)
  },
  // Settings
  settings: {
    getAll: () => electron.ipcRenderer.invoke("settings:get-all"),
    getByKey: (key) => electron.ipcRenderer.invoke("settings:get-by-key", key),
    getByCategory: (category) => electron.ipcRenderer.invoke("settings:get-by-category", category),
    update: (key, value, category, description) => electron.ipcRenderer.invoke("settings:update", key, value, category, description),
    updateBulk: (updates) => electron.ipcRenderer.invoke("settings:update-bulk", updates)
  },
  // Reports
  reports: {
    salesReport: (params) => electron.ipcRenderer.invoke("reports:sales-report", params),
    inventoryReport: (params) => electron.ipcRenderer.invoke("reports:inventory-report", params),
    profitLoss: (params) => electron.ipcRenderer.invoke("reports:profit-loss", params),
    customerReport: (params) => electron.ipcRenderer.invoke("reports:customer-report", params)
  },
  // License
  license: {
    getMachineId: () => electron.ipcRenderer.invoke("license:get-machine-id"),
    getStatus: () => electron.ipcRenderer.invoke("license:get-status"),
    activate: (licenseKey) => electron.ipcRenderer.invoke("license:activate", licenseKey),
    deactivate: () => electron.ipcRenderer.invoke("license:deactivate")
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
