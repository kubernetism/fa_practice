import { contextBridge, ipcRenderer } from 'electron'

// Type definitions for the API
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
const api = {
  // Auth
  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:get-current-user'),
    changePassword: (userId: number, currentPassword: string, newPassword: string) =>
      ipcRenderer.invoke('auth:change-password', userId, currentPassword, newPassword),
    checkPermission: (permission: string) =>
      ipcRenderer.invoke('auth:check-permission', permission),
  },

  // Products
  products: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('products:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('products:get-by-id', id),
    getByBarcode: (barcode: string) => ipcRenderer.invoke('products:get-by-barcode', barcode),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('products:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('products:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('products:delete', id),
    search: (query: string) => ipcRenderer.invoke('products:search', query),
  },

  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke('categories:get-all'),
    getTree: () => ipcRenderer.invoke('categories:get-tree'),
    getById: (id: number) => ipcRenderer.invoke('categories:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('categories:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('categories:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('categories:delete', id),
  },

  // Service Categories
  serviceCategories: {
    getAll: () => ipcRenderer.invoke('service-categories:get-all'),
    getActive: () => ipcRenderer.invoke('service-categories:get-active'),
    getById: (id: number) => ipcRenderer.invoke('service-categories:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('service-categories:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('service-categories:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('service-categories:delete', id),
  },

  // Services
  services: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('services:get-all', params),
    getActive: () => ipcRenderer.invoke('services:get-active'),
    getById: (id: number) => ipcRenderer.invoke('services:get-by-id', id),
    getByCode: (code: string) => ipcRenderer.invoke('services:get-by-code', code),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('services:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('services:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('services:delete', id),
    search: (query: string) => ipcRenderer.invoke('services:search', query),
  },

  // Inventory
  inventory: {
    getAll: () => ipcRenderer.invoke('inventory:get-all'),
    getByBranch: (branchId?: number) => ipcRenderer.invoke('inventory:get-by-branch', branchId),
    getLowStock: (branchId?: number) => ipcRenderer.invoke('inventory:get-low-stock', branchId),
    getProductStock: (productId: number, branchId: number) =>
      ipcRenderer.invoke('inventory:get-product-stock', productId, branchId),
    adjust: (data: Record<string, unknown>) => ipcRenderer.invoke('inventory:adjust', data),
    transfer: (data: Record<string, unknown>) => ipcRenderer.invoke('inventory:transfer', data),
    completeTransfer: (transferId: number) =>
      ipcRenderer.invoke('inventory:complete-transfer', transferId),
    getAdjustments: (productId?: number, branchId?: number) =>
      ipcRenderer.invoke('inventory:get-adjustments', productId, branchId),
    getTransfers: (branchId?: number) => ipcRenderer.invoke('inventory:get-transfers', branchId),
  },

  // Inventory Counts (Cycle Counts / Reconciliation)
  inventoryCounts: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('inventory-counts:create', data),
    start: (countId: number, userId: number) =>
      ipcRenderer.invoke('inventory-counts:start', countId, userId),
    recordCount: (data: Record<string, unknown>) =>
      ipcRenderer.invoke('inventory-counts:record-count', data),
    complete: (countId: number, userId: number) =>
      ipcRenderer.invoke('inventory-counts:complete', countId, userId),
    applyAdjustments: (countId: number, userId: number) =>
      ipcRenderer.invoke('inventory-counts:apply-adjustments', countId, userId),
    varianceReport: (countId: number) =>
      ipcRenderer.invoke('inventory-counts:variance-report', countId),
    list: (branchId?: number, status?: string) =>
      ipcRenderer.invoke('inventory-counts:list', branchId, status),
    get: (countId: number) => ipcRenderer.invoke('inventory-counts:get', countId),
    cancel: (countId: number, userId: number) =>
      ipcRenderer.invoke('inventory-counts:cancel', countId, userId),
    reconciliationSummary: (branchId: number) =>
      ipcRenderer.invoke('inventory-counts:reconciliation-summary', branchId),
  },

  // Customers
  customers: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('customers:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('customers:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('customers:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('customers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('customers:delete', id),
    checkLicense: (customerId: number) => ipcRenderer.invoke('customers:check-license', customerId),
    search: (query: string) => ipcRenderer.invoke('customers:search', query),
    getExpiringLicenses: (daysThreshold?: number) =>
      ipcRenderer.invoke('customers:get-expiring-licenses', daysThreshold),
  },

  // Suppliers
  suppliers: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('suppliers:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('suppliers:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('suppliers:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('suppliers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('suppliers:delete', id),
  },

  // Sales
  sales: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('sales:create', data),
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('sales:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('sales:get-by-id', id),
    void: (id: number, reason: string) => ipcRenderer.invoke('sales:void', id, reason),
    getDailySummary: (branchId: number, date?: string) =>
      ipcRenderer.invoke('sales:get-daily-summary', branchId, date),
    fixPaymentStatus: (invoiceNumber?: string) =>
      ipcRenderer.invoke('sales:fix-payment-status', invoiceNumber),
    fixOrphanedReceivables: () => ipcRenderer.invoke('sales:fix-orphaned-receivables'),
  },

  // Sales Tabs
  salesTabs: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('sales-tabs:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('sales-tabs:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('sales-tabs:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('sales-tabs:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('sales-tabs:delete', id),
    addItem: (tabId: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('sales-tabs:add-item', tabId, data),
    updateItem: (tabId: number, itemId: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('sales-tabs:update-item', tabId, itemId, data),
    removeItem: (tabId: number, itemId: number) =>
      ipcRenderer.invoke('sales-tabs:remove-item', tabId, itemId),
    getAvailableProducts: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('sales-tabs:get-available-products', params),
    checkout: (tabId: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('sales-tabs:checkout', tabId, data),
    clearItems: (tabId: number) => ipcRenderer.invoke('sales-tabs:clear-items', tabId),
  },

  // Purchases
  purchases: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('purchases:create', data),
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('purchases:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('purchases:get-by-id', id),
    receive: (purchaseId: number, receivedItems: { itemId: number; receivedQuantity: number }[]) =>
      ipcRenderer.invoke('purchases:receive', purchaseId, receivedItems),
    updateStatus: (id: number, status: string) =>
      ipcRenderer.invoke('purchases:update-status', id, status),
    payOff: (
      purchaseId: number,
      paymentData: { paymentMethod: string; referenceNumber?: string; notes?: string }
    ) => ipcRenderer.invoke('purchases:pay-off', purchaseId, paymentData),
  },

  // Returns
  returns: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('returns:create', data),
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('returns:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('returns:get-by-id', id),
    delete: (id: number) => ipcRenderer.invoke('returns:delete', id),
  },

  // Branches
  branches: {
    getAll: () => ipcRenderer.invoke('branches:get-all'),
    getActive: () => ipcRenderer.invoke('branches:get-active'),
    getById: (id: number) => ipcRenderer.invoke('branches:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('branches:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('branches:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('branches:delete', id),
  },

  // Users
  users: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('users:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('users:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('users:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('users:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('users:delete', id),
    updatePermissions: (id: number, permissions: string[]) =>
      ipcRenderer.invoke('users:update-permissions', id, permissions),
  },

  // Expenses
  expenses: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('expenses:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('expenses:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('expenses:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('expenses:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('expenses:delete', id),
    getByCategory: (branchId: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('expenses:get-by-category', branchId, startDate, endDate),
  },

  // Commissions
  commissions: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('commissions:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('commissions:get-by-id', id),
    getSummary: (referralPersonId?: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('commissions:get-summary', referralPersonId, startDate, endDate),
    approve: (ids: number[]) => ipcRenderer.invoke('commissions:approve', ids),
    markPaid: (ids: number[]) => ipcRenderer.invoke('commissions:mark-paid', ids),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('commissions:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('commissions:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('commissions:delete', id),
    getAvailableInvoices: (referralPersonId?: number) =>
      ipcRenderer.invoke('commissions:get-available-invoices', referralPersonId),
  },

  // Referral Persons
  referralPersons: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('referral-persons:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('referral-persons:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('referral-persons:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('referral-persons:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('referral-persons:delete', id),
    getForSelect: (branchId?: number) => ipcRenderer.invoke('referral-persons:get-for-select', branchId),
    updateCommission: (id: number, amount: number, isPaid: boolean) =>
      ipcRenderer.invoke('referral-persons:update-commission', id, amount, isPaid),
  },

  // Audit Logs
  audit: {
    getLogs: (params: Record<string, unknown>) => ipcRenderer.invoke('audit:get-logs', params),
    getStats: (params?: Record<string, unknown>) => ipcRenderer.invoke('audit:get-stats', params),
    getByEntity: (entityType: string, entityId: number) =>
      ipcRenderer.invoke('audit:get-by-entity', entityType, entityId),
    export: (params: Record<string, unknown>) => ipcRenderer.invoke('audit:export', params),
  },

  // Settings (Legacy)
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    getByKey: (key: string) => ipcRenderer.invoke('settings:get-by-key', key),
    getByCategory: (category: string) => ipcRenderer.invoke('settings:get-by-category', category),
    update: (key: string, value: unknown, category?: string, description?: string) =>
      ipcRenderer.invoke('settings:update', key, value, category, description),
    updateBulk: (updates: { key: string; value: unknown }[]) =>
      ipcRenderer.invoke('settings:update-bulk', updates),
  },

  // Business Settings (Multi-Business)
  businessSettings: {
    getGlobal: () => ipcRenderer.invoke('business-settings:get-global'),
    getByBranch: (branchId: number) => ipcRenderer.invoke('business-settings:get-by-branch', branchId),
    getAll: (userId: number) => ipcRenderer.invoke('business-settings:get-all', userId),
    create: (userId: number, settingsData: Record<string, unknown>) =>
      ipcRenderer.invoke('business-settings:create', { userId, settingsData }),
    update: (userId: number, settingId: number, settingsData: Record<string, unknown>) =>
      ipcRenderer.invoke('business-settings:update', { userId, settingId, settingsData }),
    delete: (userId: number, settingId: number) =>
      ipcRenderer.invoke('business-settings:delete', { userId, settingId }),
    clone: (userId: number, sourceBranchId: number | null, targetBranchId: number) =>
      ipcRenderer.invoke('business-settings:clone', { userId, sourceBranchId, targetBranchId }),
    export: (userId: number) => ipcRenderer.invoke('business-settings:export', userId),
    import: (userId: number, data: unknown) =>
      ipcRenderer.invoke('business-settings:import', { userId, data }),
  },

  // Reports
  reports: {
    sales: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:sales-report', params),
    inventory: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:inventory-report', params),
    'profit-loss': (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:profit-loss', params),
    customer: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:customer-report', params),
    expenses: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:expenses-report', params),
    purchases: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:purchases-report', params),
    returns: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:returns-report', params),
    commissions: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:commissions-report', params),
    tax: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:tax-report', params),
    'branch-performance': (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:branch-performance', params),
    'cash-flow': (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:cash-flow', params),
    'audit-trail': (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:audit-trail', params),
    comprehensiveAudit: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:comprehensive-audit', params),
    exportPDF: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:export-pdf', params),
    // Legacy methods for backward compatibility
    salesReport: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:sales-report', params),
    inventoryReport: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:inventory-report', params),
    profitLoss: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:profit-loss', params),
    customerReport: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('reports:customer-report', params),
  },

  // License
  license: {
    getMachineId: () => ipcRenderer.invoke('license:get-machine-id'),
    getStatus: () => ipcRenderer.invoke('license:get-status'),
    getApplicationInfo: () => ipcRenderer.invoke('license:get-application-info'),
    activate: (licenseKey: string) => ipcRenderer.invoke('license:activate', licenseKey),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
    validateKey: (licenseKey: string) => ipcRenderer.invoke('license:validate-key', licenseKey),
    generateLicenseRequest: () => ipcRenderer.invoke('license:generate-license-request'),
    getHistory: () => ipcRenderer.invoke('license:get-history'),
    checkLockStatus: () => ipcRenderer.invoke('license:check-lock-status'),
    unlockApplication: (licenseKey: string) =>
      ipcRenderer.invoke('license:unlock-application', licenseKey),
    onApplicationUnlocked: (callback: () => void) => {
      ipcRenderer.on('license:application-unlocked', callback)
      return () => ipcRenderer.removeListener('license:application-unlocked', callback)
    },
  },

  // Database Viewer
  database: {
    getTables: () => ipcRenderer.invoke('database:get-tables'),
    getTableInfo: (tableName: string) => ipcRenderer.invoke('database:get-table-info', tableName),
    getTableData: (params: { tableName: string; page?: number; limit?: number }) =>
      ipcRenderer.invoke('database:get-table-data', params),
    executeQuery: (params: { query: string; userId: number }) =>
      ipcRenderer.invoke('database:execute-query', params),
    getInfo: () => ipcRenderer.invoke('database:get-info'),
    hardReset: (confirmationText: string) => ipcRenderer.invoke('database:hard-reset', confirmationText),
    verifyAdmin: (username: string, password: string) =>
      ipcRenderer.invoke('database:verify-admin', username, password),
  },

  // Account Receivables
  receivables: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('receivables:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('receivables:get-by-id', id),
    getByCustomer: (customerId: number) => ipcRenderer.invoke('receivables:get-by-customer', customerId),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('receivables:create', data),
    recordPayment: (data: Record<string, unknown>) =>
      ipcRenderer.invoke('receivables:record-payment', data),
    cancel: (id: number, reason?: string) => ipcRenderer.invoke('receivables:cancel', id, reason),
    getSummary: (branchId?: number) => ipcRenderer.invoke('receivables:get-summary', branchId),
    getPayments: (receivableId: number) => ipcRenderer.invoke('receivables:get-payments', receivableId),
    getAgingReport: (branchId?: number) => ipcRenderer.invoke('receivables:get-aging-report', branchId),
    syncWithSales: () => ipcRenderer.invoke('receivables:sync-with-sales'),
  },

  // Account Payables
  payables: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('payables:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('payables:get-by-id', id),
    getBySupplier: (supplierId: number) => ipcRenderer.invoke('payables:get-by-supplier', supplierId),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('payables:create', data),
    recordPayment: (data: Record<string, unknown>) =>
      ipcRenderer.invoke('payables:record-payment', data),
    cancel: (id: number, reason?: string) => ipcRenderer.invoke('payables:cancel', id, reason),
    getSummary: (branchId?: number) => ipcRenderer.invoke('payables:get-summary', branchId),
    getPayments: (payableId: number) => ipcRenderer.invoke('payables:get-payments', payableId),
    getAgingReport: (branchId?: number) => ipcRenderer.invoke('payables:get-aging-report', branchId),
  },

  // Cash Register
  cashRegister: {
    getCurrentSession: (branchId: number) =>
      ipcRenderer.invoke('cash-register:get-current-session', branchId),
    openSession: (data: { branchId: number; openingBalance: number; notes?: string }) =>
      ipcRenderer.invoke('cash-register:open-session', data),
    closeSession: (data: { sessionId: number; actualBalance: number; notes?: string }) =>
      ipcRenderer.invoke('cash-register:close-session', data),
    recordTransaction: (data: Record<string, unknown>) =>
      ipcRenderer.invoke('cash-register:record-transaction', data),
    getHistory: (params: { branchId?: number; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
      ipcRenderer.invoke('cash-register:get-history', params),
    getTransactions: (sessionId: number) =>
      ipcRenderer.invoke('cash-register:get-transactions', sessionId),
    getCashFlowSummary: (params: { branchId?: number; days?: number }) =>
      ipcRenderer.invoke('cash-register:get-cash-flow-summary', params),
    adjust: (data: { sessionId: number; amount: number; reason: string }) =>
      ipcRenderer.invoke('cash-register:adjust', data),
  },

  // Chart of Accounts
  chartOfAccounts: {
    getAll: () => ipcRenderer.invoke('coa:get-all'),
    getByType: (accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') =>
      ipcRenderer.invoke('coa:get-by-type', accountType),
    getById: (id: number) => ipcRenderer.invoke('coa:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('coa:create', data),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke('coa:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('coa:delete', id),
    getBalanceSheet: (branchId?: number) => ipcRenderer.invoke('coa:get-balance-sheet', branchId),
    getIncomeStatement: (startDate: string, endDate: string, branchId?: number) =>
      ipcRenderer.invoke('coa:get-income-statement', startDate, endDate, branchId),
    getTrialBalance: (asOfDate?: string) => ipcRenderer.invoke('coa:get-trial-balance', asOfDate),
    getLedger: (accountId: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('coa:get-ledger', accountId, startDate, endDate),
  },

  // Journal Entries
  journal: {
    getAll: (filters?: Record<string, unknown>) => ipcRenderer.invoke('journal:get-all', filters),
    getById: (id: number) => ipcRenderer.invoke('journal:get-by-id', id),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('journal:create', data),
    post: (entryId: number, postedBy: number) => ipcRenderer.invoke('journal:post', entryId, postedBy),
    getSummary: (params: { branchId?: number; startDate?: string; endDate?: string }) =>
      ipcRenderer.invoke('journal:get-summary', params),
    export: (params: { branchId?: number; startDate: string; endDate: string; format?: string }) =>
      ipcRenderer.invoke('journal:export', params),
  },

  // Receipt Generation
  receipt: {
    generate: (saleId: number) => ipcRenderer.invoke('receipt:generate', saleId),
    getSettings: (branchId?: number) => ipcRenderer.invoke('receipt:get-settings', branchId),
    generatePaymentHistory: (receivableId: number) =>
      ipcRenderer.invoke('receipt:generate-payment-history', receivableId),
  },

  // Todos
  todos: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('todos:create', data),
    getAll: () => ipcRenderer.invoke('todos:get-all'),
    getById: (id: number) => ipcRenderer.invoke('todos:get-by-id', id),
    update: (data: Record<string, unknown>) => ipcRenderer.invoke('todos:update', data),
    delete: (id: number) => ipcRenderer.invoke('todos:delete', id),
    getCounts: () => ipcRenderer.invoke('todos:get-counts'),
    getAssignableUsers: (role?: string) => ipcRenderer.invoke('todos:get-assignable-users', role),
  },

  // Manual Migration
  migration: {
    createTodosTable: () => ipcRenderer.invoke('migration:create-todos-table'),
    checkTodosTable: () => ipcRenderer.invoke('migration:check-todos-table'),
  },

  // Messages
  messages: {
    send: (data: { content: string; recipientId?: number }) =>
      ipcRenderer.invoke('messages:send', data),
    getAll: () => ipcRenderer.invoke('messages:get-all'),
    markRead: (messageId: number) => ipcRenderer.invoke('messages:mark-read', messageId),
    markAllRead: () => ipcRenderer.invoke('messages:mark-all-read'),
    delete: (messageId: number) => ipcRenderer.invoke('messages:delete', messageId),
    getUnreadCount: () => ipcRenderer.invoke('messages:get-unread-count'),
    getUsers: () => ipcRenderer.invoke('messages:get-users'),
  },

  // Dashboard
  dashboard: {
    getStats: (params: { branchId: number; timePeriod: string }) =>
      ipcRenderer.invoke('dashboard:get-stats', params),
  },

  // Setup Wizard
  setup: {
    checkFirstRun: () => ipcRenderer.invoke('setup:check-first-run'),
    complete: (data: unknown) => ipcRenderer.invoke('setup:complete', data),
    generateBranchCode: (businessName: string) =>
      ipcRenderer.invoke('setup:generate-branch-code', businessName),
    getChecklistStatus: () => ipcRenderer.invoke('setup:get-checklist-status'),
    updateChecklistItem: (item: string, status: string) =>
      ipcRenderer.invoke('setup:update-checklist-item', item, status),
    dismissChecklist: () => ipcRenderer.invoke('setup:dismiss-checklist'),
    refreshChecklist: () => ipcRenderer.invoke('setup:refresh-checklist'),
  },

  // Backup & Restore
  backup: {
    create: (userId?: number) => ipcRenderer.invoke('backup:create', userId),
    restore: (backupPath: string, userId?: number) =>
      ipcRenderer.invoke('backup:restore', backupPath, userId),
    list: () => ipcRenderer.invoke('backup:list'),
    delete: (backupPath: string, userId?: number) =>
      ipcRenderer.invoke('backup:delete', backupPath, userId),
    getConfig: () => ipcRenderer.invoke('backup:get-config'),
    updateConfig: (config: Record<string, unknown>, userId?: number) =>
      ipcRenderer.invoke('backup:update-config', config, userId),
    export: (userId?: number) => ipcRenderer.invoke('backup:export', userId),
    import: (userId?: number) => ipcRenderer.invoke('backup:import', userId),
    cleanOld: (retentionDays?: number) => ipcRenderer.invoke('backup:clean-old', retentionDays),
    getDirectory: () => ipcRenderer.invoke('backup:get-directory'),
    // New selective import APIs
    getImportCategories: () => ipcRenderer.invoke('backup:get-import-categories'),
    preview: (backupPath?: string) => ipcRenderer.invoke('backup:preview', backupPath),
    importSelective: (params: { filePath: string; categories: string[]; mergeMode?: 'replace' | 'merge' }) =>
      ipcRenderer.invoke('backup:import-selective', params),
    importFull: (backupPath: string) => ipcRenderer.invoke('backup:import-full', backupPath),
  },

  // Tax Collections
  taxCollections: {
    getSummary: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('tax-collections:get-summary', params),
    getSaleDetails: (saleId: number) =>
      ipcRenderer.invoke('tax-collections:get-sale-details', saleId),
    getPeriodicReport: (params: { branchId: number; period: string; year: number }) =>
      ipcRenderer.invoke('tax-collections:get-periodic-report', params),
  },

  // Vouchers
  vouchers: {
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('vouchers:get-all', params),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('vouchers:create', data),
    generateCode: () => ipcRenderer.invoke('vouchers:generate-code'),
    validate: (code: string) => ipcRenderer.invoke('vouchers:validate', code),
    delete: (id: number) => ipcRenderer.invoke('vouchers:delete', id),
  },

  // Discount Management
  discountManagement: {
    getSummary: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('discount-management:get-summary', params),
    getDetails: (saleId: number) =>
      ipcRenderer.invoke('discount-management:get-details', saleId),
    getByUser: (params: Record<string, unknown>) =>
      ipcRenderer.invoke('discount-management:get-by-user', params),
    getAlerts: (params: { branchId: number; thresholdPercent: number; limit?: number }) =>
      ipcRenderer.invoke('discount-management:get-alerts', params),
  },
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api)

// Type declaration for the renderer process
declare global {
  interface Window {
    api: typeof api
  }
}
