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
  // Sales Tabs
  salesTabs: {
    getAll: (params) => electron.ipcRenderer.invoke("sales-tabs:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("sales-tabs:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("sales-tabs:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("sales-tabs:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("sales-tabs:delete", id),
    addItem: (tabId, data) => electron.ipcRenderer.invoke("sales-tabs:add-item", tabId, data),
    updateItem: (tabId, itemId, data) => electron.ipcRenderer.invoke("sales-tabs:update-item", tabId, itemId, data),
    removeItem: (tabId, itemId) => electron.ipcRenderer.invoke("sales-tabs:remove-item", tabId, itemId),
    getAvailableProducts: (params) => electron.ipcRenderer.invoke("sales-tabs:get-available-products", params),
    checkout: (tabId, data) => electron.ipcRenderer.invoke("sales-tabs:checkout", tabId, data),
    clearItems: (tabId) => electron.ipcRenderer.invoke("sales-tabs:clear-items", tabId)
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
    getById: (id) => electron.ipcRenderer.invoke("returns:get-by-id", id),
    delete: (id) => electron.ipcRenderer.invoke("returns:delete", id)
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
    getById: (id) => electron.ipcRenderer.invoke("commissions:get-by-id", id),
    getSummary: (referralPersonId, startDate, endDate) => electron.ipcRenderer.invoke("commissions:get-summary", referralPersonId, startDate, endDate),
    approve: (ids) => electron.ipcRenderer.invoke("commissions:approve", ids),
    markPaid: (ids) => electron.ipcRenderer.invoke("commissions:mark-paid", ids),
    create: (data) => electron.ipcRenderer.invoke("commissions:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("commissions:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("commissions:delete", id),
    getAvailableInvoices: (referralPersonId) => electron.ipcRenderer.invoke("commissions:get-available-invoices", referralPersonId)
  },
  // Referral Persons
  referralPersons: {
    getAll: (params) => electron.ipcRenderer.invoke("referral-persons:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("referral-persons:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("referral-persons:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("referral-persons:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("referral-persons:delete", id),
    getForSelect: (branchId) => electron.ipcRenderer.invoke("referral-persons:get-for-select", branchId),
    updateCommission: (id, amount, isPaid) => electron.ipcRenderer.invoke("referral-persons:update-commission", id, amount, isPaid)
  },
  // Audit Logs
  audit: {
    getLogs: (params) => electron.ipcRenderer.invoke("audit:get-logs", params),
    getStats: (params) => electron.ipcRenderer.invoke("audit:get-stats", params),
    getByEntity: (entityType, entityId) => electron.ipcRenderer.invoke("audit:get-by-entity", entityType, entityId),
    export: (params) => electron.ipcRenderer.invoke("audit:export", params)
  },
  // Settings (Legacy)
  settings: {
    getAll: () => electron.ipcRenderer.invoke("settings:get-all"),
    getByKey: (key) => electron.ipcRenderer.invoke("settings:get-by-key", key),
    getByCategory: (category) => electron.ipcRenderer.invoke("settings:get-by-category", category),
    update: (key, value, category, description) => electron.ipcRenderer.invoke("settings:update", key, value, category, description),
    updateBulk: (updates) => electron.ipcRenderer.invoke("settings:update-bulk", updates)
  },
  // Business Settings (Multi-Business)
  businessSettings: {
    getGlobal: () => electron.ipcRenderer.invoke("business-settings:get-global"),
    getByBranch: (branchId) => electron.ipcRenderer.invoke("business-settings:get-by-branch", branchId),
    getAll: (userId) => electron.ipcRenderer.invoke("business-settings:get-all", userId),
    create: (userId, settingsData) => electron.ipcRenderer.invoke("business-settings:create", { userId, settingsData }),
    update: (userId, settingId, settingsData) => electron.ipcRenderer.invoke("business-settings:update", { userId, settingId, settingsData }),
    delete: (userId, settingId) => electron.ipcRenderer.invoke("business-settings:delete", { userId, settingId }),
    clone: (userId, sourceBranchId, targetBranchId) => electron.ipcRenderer.invoke("business-settings:clone", { userId, sourceBranchId, targetBranchId }),
    export: (userId) => electron.ipcRenderer.invoke("business-settings:export", userId),
    import: (userId, data) => electron.ipcRenderer.invoke("business-settings:import", { userId, data })
  },
  // Reports
  reports: {
    sales: (params) => electron.ipcRenderer.invoke("reports:sales-report", params),
    inventory: (params) => electron.ipcRenderer.invoke("reports:inventory-report", params),
    "profit-loss": (params) => electron.ipcRenderer.invoke("reports:profit-loss", params),
    customer: (params) => electron.ipcRenderer.invoke("reports:customer-report", params),
    expenses: (params) => electron.ipcRenderer.invoke("reports:expenses-report", params),
    purchases: (params) => electron.ipcRenderer.invoke("reports:purchases-report", params),
    returns: (params) => electron.ipcRenderer.invoke("reports:returns-report", params),
    commissions: (params) => electron.ipcRenderer.invoke("reports:commissions-report", params),
    tax: (params) => electron.ipcRenderer.invoke("reports:tax-report", params),
    "branch-performance": (params) => electron.ipcRenderer.invoke("reports:branch-performance", params),
    "cash-flow": (params) => electron.ipcRenderer.invoke("reports:cash-flow", params),
    "audit-trail": (params) => electron.ipcRenderer.invoke("reports:audit-trail", params),
    comprehensiveAudit: (params) => electron.ipcRenderer.invoke("reports:comprehensive-audit", params),
    exportPDF: (params) => electron.ipcRenderer.invoke("reports:export-pdf", params),
    // Legacy methods for backward compatibility
    salesReport: (params) => electron.ipcRenderer.invoke("reports:sales-report", params),
    inventoryReport: (params) => electron.ipcRenderer.invoke("reports:inventory-report", params),
    profitLoss: (params) => electron.ipcRenderer.invoke("reports:profit-loss", params),
    customerReport: (params) => electron.ipcRenderer.invoke("reports:customer-report", params)
  },
  // License
  license: {
    getMachineId: () => electron.ipcRenderer.invoke("license:get-machine-id"),
    getStatus: () => electron.ipcRenderer.invoke("license:get-status"),
    getApplicationInfo: () => electron.ipcRenderer.invoke("license:get-application-info"),
    activate: (licenseKey) => electron.ipcRenderer.invoke("license:activate", licenseKey),
    deactivate: () => electron.ipcRenderer.invoke("license:deactivate"),
    validateKey: (licenseKey) => electron.ipcRenderer.invoke("license:validate-key", licenseKey),
    generateLicenseRequest: () => electron.ipcRenderer.invoke("license:generate-license-request"),
    getHistory: () => electron.ipcRenderer.invoke("license:get-history")
  },
  // Database Viewer
  database: {
    getTables: () => electron.ipcRenderer.invoke("database:get-tables"),
    getTableInfo: (tableName) => electron.ipcRenderer.invoke("database:get-table-info", tableName),
    getTableData: (params) => electron.ipcRenderer.invoke("database:get-table-data", params),
    executeQuery: (params) => electron.ipcRenderer.invoke("database:execute-query", params),
    getInfo: () => electron.ipcRenderer.invoke("database:get-info")
  },
  // Account Receivables
  receivables: {
    getAll: (params) => electron.ipcRenderer.invoke("receivables:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("receivables:get-by-id", id),
    getByCustomer: (customerId) => electron.ipcRenderer.invoke("receivables:get-by-customer", customerId),
    create: (data) => electron.ipcRenderer.invoke("receivables:create", data),
    recordPayment: (data) => electron.ipcRenderer.invoke("receivables:record-payment", data),
    cancel: (id, reason) => electron.ipcRenderer.invoke("receivables:cancel", id, reason),
    getSummary: (branchId) => electron.ipcRenderer.invoke("receivables:get-summary", branchId),
    getPayments: (receivableId) => electron.ipcRenderer.invoke("receivables:get-payments", receivableId),
    getAgingReport: (branchId) => electron.ipcRenderer.invoke("receivables:get-aging-report", branchId),
    syncWithSales: () => electron.ipcRenderer.invoke("receivables:sync-with-sales")
  },
  // Account Payables
  payables: {
    getAll: (params) => electron.ipcRenderer.invoke("payables:get-all", params),
    getById: (id) => electron.ipcRenderer.invoke("payables:get-by-id", id),
    getBySupplier: (supplierId) => electron.ipcRenderer.invoke("payables:get-by-supplier", supplierId),
    create: (data) => electron.ipcRenderer.invoke("payables:create", data),
    recordPayment: (data) => electron.ipcRenderer.invoke("payables:record-payment", data),
    cancel: (id, reason) => electron.ipcRenderer.invoke("payables:cancel", id, reason),
    getSummary: (branchId) => electron.ipcRenderer.invoke("payables:get-summary", branchId),
    getPayments: (payableId) => electron.ipcRenderer.invoke("payables:get-payments", payableId),
    getAgingReport: (branchId) => electron.ipcRenderer.invoke("payables:get-aging-report", branchId)
  },
  // Cash Register
  cashRegister: {
    getCurrentSession: (branchId) => electron.ipcRenderer.invoke("cash-register:get-current-session", branchId),
    openSession: (data) => electron.ipcRenderer.invoke("cash-register:open-session", data),
    closeSession: (data) => electron.ipcRenderer.invoke("cash-register:close-session", data),
    recordTransaction: (data) => electron.ipcRenderer.invoke("cash-register:record-transaction", data),
    getHistory: (params) => electron.ipcRenderer.invoke("cash-register:get-history", params),
    getTransactions: (sessionId) => electron.ipcRenderer.invoke("cash-register:get-transactions", sessionId),
    getCashFlowSummary: (params) => electron.ipcRenderer.invoke("cash-register:get-cash-flow-summary", params),
    adjust: (data) => electron.ipcRenderer.invoke("cash-register:adjust", data)
  },
  // Chart of Accounts
  chartOfAccounts: {
    getAll: () => electron.ipcRenderer.invoke("coa:get-all"),
    getByType: (accountType) => electron.ipcRenderer.invoke("coa:get-by-type", accountType),
    getById: (id) => electron.ipcRenderer.invoke("coa:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("coa:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("coa:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("coa:delete", id),
    getBalanceSheet: (branchId) => electron.ipcRenderer.invoke("coa:get-balance-sheet", branchId),
    getIncomeStatement: (startDate, endDate, branchId) => electron.ipcRenderer.invoke("coa:get-income-statement", startDate, endDate, branchId),
    getTrialBalance: (asOfDate) => electron.ipcRenderer.invoke("coa:get-trial-balance", asOfDate),
    getLedger: (accountId, startDate, endDate) => electron.ipcRenderer.invoke("coa:get-ledger", accountId, startDate, endDate)
  },
  // Journal Entries
  journal: {
    getAll: (filters) => electron.ipcRenderer.invoke("journal:get-all", filters),
    getById: (id) => electron.ipcRenderer.invoke("journal:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("journal:create", data),
    post: (entryId, postedBy) => electron.ipcRenderer.invoke("journal:post", entryId, postedBy)
  },
  // Receipt Generation
  receipt: {
    generate: (saleId) => electron.ipcRenderer.invoke("receipt:generate", saleId),
    getSettings: (branchId) => electron.ipcRenderer.invoke("receipt:get-settings", branchId),
    generatePaymentHistory: (receivableId) => electron.ipcRenderer.invoke("receipt:generate-payment-history", receivableId)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
