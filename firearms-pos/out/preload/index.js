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
  // Services
  services: {
    getAll: (params) => electron.ipcRenderer.invoke("services:get-all", params),
    getActive: () => electron.ipcRenderer.invoke("services:get-active"),
    getById: (id) => electron.ipcRenderer.invoke("services:get-by-id", id),
    getByCode: (code) => electron.ipcRenderer.invoke("services:get-by-code", code),
    create: (data) => electron.ipcRenderer.invoke("services:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("services:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("services:delete", id),
    search: (query) => electron.ipcRenderer.invoke("services:search", query)
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
  // Inventory Counts (Cycle Counts / Reconciliation)
  inventoryCounts: {
    create: (data) => electron.ipcRenderer.invoke("inventory-counts:create", data),
    start: (countId, userId) => electron.ipcRenderer.invoke("inventory-counts:start", countId, userId),
    recordCount: (data) => electron.ipcRenderer.invoke("inventory-counts:record-count", data),
    complete: (countId, userId) => electron.ipcRenderer.invoke("inventory-counts:complete", countId, userId),
    applyAdjustments: (countId, userId) => electron.ipcRenderer.invoke("inventory-counts:apply-adjustments", countId, userId),
    varianceReport: (countId) => electron.ipcRenderer.invoke("inventory-counts:variance-report", countId),
    list: (branchId, status) => electron.ipcRenderer.invoke("inventory-counts:list", branchId, status),
    get: (countId) => electron.ipcRenderer.invoke("inventory-counts:get", countId),
    cancel: (countId, userId) => electron.ipcRenderer.invoke("inventory-counts:cancel", countId, userId),
    reconciliationSummary: (branchId) => electron.ipcRenderer.invoke("inventory-counts:reconciliation-summary", branchId)
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
    getDailySummary: (branchId, date) => electron.ipcRenderer.invoke("sales:get-daily-summary", branchId, date),
    fixPaymentStatus: (invoiceNumber) => electron.ipcRenderer.invoke("sales:fix-payment-status", invoiceNumber),
    fixOrphanedReceivables: () => electron.ipcRenderer.invoke("sales:fix-orphaned-receivables")
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
    updateStatus: (id, status) => electron.ipcRenderer.invoke("purchases:update-status", id, status),
    payOff: (purchaseId, paymentData) => electron.ipcRenderer.invoke("purchases:pay-off", purchaseId, paymentData)
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
    getHistory: () => electron.ipcRenderer.invoke("license:get-history"),
    checkLockStatus: () => electron.ipcRenderer.invoke("license:check-lock-status"),
    unlockApplication: (licenseKey) => electron.ipcRenderer.invoke("license:unlock-application", licenseKey),
    onApplicationUnlocked: (callback) => {
      electron.ipcRenderer.on("license:application-unlocked", callback);
      return () => electron.ipcRenderer.removeListener("license:application-unlocked", callback);
    }
  },
  // Database Viewer
  database: {
    getTables: () => electron.ipcRenderer.invoke("database:get-tables"),
    getTableInfo: (tableName) => electron.ipcRenderer.invoke("database:get-table-info", tableName),
    getTableData: (params) => electron.ipcRenderer.invoke("database:get-table-data", params),
    executeQuery: (params) => electron.ipcRenderer.invoke("database:execute-query", params),
    getInfo: () => electron.ipcRenderer.invoke("database:get-info"),
    hardReset: (confirmationText) => electron.ipcRenderer.invoke("database:hard-reset", confirmationText),
    verifyAdmin: (username, password) => electron.ipcRenderer.invoke("database:verify-admin", username, password)
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
    getLedger: (accountId, startDate, endDate) => electron.ipcRenderer.invoke("coa:get-ledger", accountId, startDate, endDate),
    recalculateBalances: () => electron.ipcRenderer.invoke("coa:recalculate-balances"),
    adjustBalance: (accountId, targetBalance, reason, postedBy) => electron.ipcRenderer.invoke("coa:adjust-balance", accountId, targetBalance, reason, postedBy)
  },
  // Journal Entries
  journal: {
    getAll: (filters) => electron.ipcRenderer.invoke("journal:get-all", filters),
    getById: (id) => electron.ipcRenderer.invoke("journal:get-by-id", id),
    create: (data) => electron.ipcRenderer.invoke("journal:create", data),
    post: (entryId, postedBy) => electron.ipcRenderer.invoke("journal:post", entryId, postedBy),
    getSummary: (params) => electron.ipcRenderer.invoke("journal:get-summary", params),
    export: (params) => electron.ipcRenderer.invoke("journal:export", params)
  },
  // Receipt Generation
  receipt: {
    generate: (saleId) => electron.ipcRenderer.invoke("receipt:generate", saleId),
    getSettings: (branchId) => electron.ipcRenderer.invoke("receipt:get-settings", branchId),
    generatePaymentHistory: (receivableId) => electron.ipcRenderer.invoke("receipt:generate-payment-history", receivableId)
  },
  // Todos
  todos: {
    create: (data) => electron.ipcRenderer.invoke("todos:create", data),
    getAll: () => electron.ipcRenderer.invoke("todos:get-all"),
    getById: (id) => electron.ipcRenderer.invoke("todos:get-by-id", id),
    update: (data) => electron.ipcRenderer.invoke("todos:update", data),
    delete: (id) => electron.ipcRenderer.invoke("todos:delete", id),
    getCounts: () => electron.ipcRenderer.invoke("todos:get-counts"),
    getAssignableUsers: (role) => electron.ipcRenderer.invoke("todos:get-assignable-users", role)
  },
  // Manual Migration
  migration: {
    createTodosTable: () => electron.ipcRenderer.invoke("migration:create-todos-table"),
    checkTodosTable: () => electron.ipcRenderer.invoke("migration:check-todos-table"),
    createVouchersTable: () => electron.ipcRenderer.invoke("migration:create-vouchers-table"),
    checkVouchersTable: () => electron.ipcRenderer.invoke("migration:check-vouchers-table")
  },
  // Messages
  messages: {
    send: (data) => electron.ipcRenderer.invoke("messages:send", data),
    getAll: () => electron.ipcRenderer.invoke("messages:get-all"),
    markRead: (messageId) => electron.ipcRenderer.invoke("messages:mark-read", messageId),
    markAllRead: () => electron.ipcRenderer.invoke("messages:mark-all-read"),
    delete: (messageId) => electron.ipcRenderer.invoke("messages:delete", messageId),
    getUnreadCount: () => electron.ipcRenderer.invoke("messages:get-unread-count"),
    getUsers: () => electron.ipcRenderer.invoke("messages:get-users")
  },
  // Dashboard
  dashboard: {
    getStats: (params) => electron.ipcRenderer.invoke("dashboard:get-stats", params)
  },
  // Setup Wizard
  setup: {
    checkFirstRun: () => electron.ipcRenderer.invoke("setup:check-first-run"),
    complete: (data) => electron.ipcRenderer.invoke("setup:complete", data),
    generateBranchCode: (businessName) => electron.ipcRenderer.invoke("setup:generate-branch-code", businessName),
    getChecklistStatus: () => electron.ipcRenderer.invoke("setup:get-checklist-status"),
    updateChecklistItem: (item, status) => electron.ipcRenderer.invoke("setup:update-checklist-item", item, status),
    dismissChecklist: () => electron.ipcRenderer.invoke("setup:dismiss-checklist"),
    refreshChecklist: () => electron.ipcRenderer.invoke("setup:refresh-checklist")
  },
  // Backup & Restore
  backup: {
    create: (userId) => electron.ipcRenderer.invoke("backup:create", userId),
    restore: (backupPath, userId) => electron.ipcRenderer.invoke("backup:restore", backupPath, userId),
    list: () => electron.ipcRenderer.invoke("backup:list"),
    delete: (backupPath, userId) => electron.ipcRenderer.invoke("backup:delete", backupPath, userId),
    getConfig: () => electron.ipcRenderer.invoke("backup:get-config"),
    updateConfig: (config, userId) => electron.ipcRenderer.invoke("backup:update-config", config, userId),
    export: (userId) => electron.ipcRenderer.invoke("backup:export", userId),
    import: (userId) => electron.ipcRenderer.invoke("backup:import", userId),
    cleanOld: (retentionDays) => electron.ipcRenderer.invoke("backup:clean-old", retentionDays),
    getDirectory: () => electron.ipcRenderer.invoke("backup:get-directory"),
    // New selective import APIs
    getImportCategories: () => electron.ipcRenderer.invoke("backup:get-import-categories"),
    preview: (backupPath) => electron.ipcRenderer.invoke("backup:preview", backupPath),
    importSelective: (params) => electron.ipcRenderer.invoke("backup:import-selective", params),
    importFull: (backupPath) => electron.ipcRenderer.invoke("backup:import-full", backupPath)
  },
  // Tax Collections
  taxCollections: {
    getSummary: (params) => electron.ipcRenderer.invoke("tax-collections:get-summary", params),
    getSaleDetails: (saleId) => electron.ipcRenderer.invoke("tax-collections:get-sale-details", saleId),
    getPeriodicReport: (params) => electron.ipcRenderer.invoke("tax-collections:get-periodic-report", params)
  },
  // Vouchers
  vouchers: {
    getAll: (params) => electron.ipcRenderer.invoke("vouchers:get-all", params),
    create: (data) => electron.ipcRenderer.invoke("vouchers:create", data),
    generateCode: () => electron.ipcRenderer.invoke("vouchers:generate-code"),
    validate: (code) => electron.ipcRenderer.invoke("vouchers:validate", code),
    delete: (id) => electron.ipcRenderer.invoke("vouchers:delete", id)
  },
  // Discount Management
  discountManagement: {
    getSummary: (params) => electron.ipcRenderer.invoke("discount-management:get-summary", params),
    getDetails: (saleId) => electron.ipcRenderer.invoke("discount-management:get-details", saleId),
    getByUser: (params) => electron.ipcRenderer.invoke("discount-management:get-by-user", params),
    getAlerts: (params) => electron.ipcRenderer.invoke("discount-management:get-alerts", params)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
