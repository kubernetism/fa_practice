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
  },

  // Returns
  returns: {
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('returns:create', data),
    getAll: (params: Record<string, unknown>) => ipcRenderer.invoke('returns:get-all', params),
    getById: (id: number) => ipcRenderer.invoke('returns:get-by-id', id),
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
    getSummary: (userId: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('commissions:get-summary', userId, startDate, endDate),
    approve: (ids: number[]) => ipcRenderer.invoke('commissions:approve', ids),
    markPaid: (ids: number[]) => ipcRenderer.invoke('commissions:mark-paid', ids),
    calculate: (
      saleId: number,
      userId: number,
      branchId: number,
      baseAmount: number,
      rate: number
    ) => ipcRenderer.invoke('commissions:calculate', saleId, userId, branchId, baseAmount, rate),
  },

  // Audit Logs
  audit: {
    getLogs: (params: Record<string, unknown>) => ipcRenderer.invoke('audit:get-logs', params),
    getByEntity: (entityType: string, entityId: number) =>
      ipcRenderer.invoke('audit:get-by-entity', entityType, entityId),
    export: (params: Record<string, unknown>) => ipcRenderer.invoke('audit:export', params),
  },

  // Settings
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    getByKey: (key: string) => ipcRenderer.invoke('settings:get-by-key', key),
    getByCategory: (category: string) => ipcRenderer.invoke('settings:get-by-category', category),
    update: (key: string, value: unknown, category?: string, description?: string) =>
      ipcRenderer.invoke('settings:update', key, value, category, description),
    updateBulk: (updates: { key: string; value: unknown }[]) =>
      ipcRenderer.invoke('settings:update-bulk', updates),
  },

  // Reports
  reports: {
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
    activate: (licenseKey: string) => ipcRenderer.invoke('license:activate', licenseKey),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
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
