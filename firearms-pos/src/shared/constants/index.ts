// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const

// Permission constants
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',

  // Sales
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_VOID: 'sales:void',
  SALES_DISCOUNT: 'sales:discount',

  // Purchases
  PURCHASES_VIEW: 'purchases:view',
  PURCHASES_CREATE: 'purchases:create',
  PURCHASES_RECEIVE: 'purchases:receive',

  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',

  // Suppliers
  SUPPLIERS_VIEW: 'suppliers:view',
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_EDIT: 'suppliers:edit',
  SUPPLIERS_DELETE: 'suppliers:delete',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Audit
  AUDIT_VIEW: 'audit:view',

  // Branches
  BRANCHES_VIEW: 'branches:view',
  BRANCHES_CREATE: 'branches:create',
  BRANCHES_EDIT: 'branches:edit',

  // Commissions
  COMMISSIONS_VIEW: 'commissions:view',
  COMMISSIONS_APPROVE: 'commissions:approve',

  // Expenses
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_EDIT: 'expenses:edit',
  EXPENSES_DELETE: 'expenses:delete',
} as const

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  CREDIT: 'credit',
  MIXED: 'mixed',
} as const

// Payment status
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  PENDING: 'pending',
} as const

// Return types
export const RETURN_TYPES = {
  REFUND: 'refund',
  EXCHANGE: 'exchange',
  STORE_CREDIT: 'store_credit',
} as const

// Expense categories
export const EXPENSE_CATEGORIES = {
  RENT: 'rent',
  UTILITIES: 'utilities',
  SALARIES: 'salaries',
  SUPPLIES: 'supplies',
  MAINTENANCE: 'maintenance',
  MARKETING: 'marketing',
  OTHER: 'other',
} as const

// Stock adjustment types
export const ADJUSTMENT_TYPES = {
  ADD: 'add',
  REMOVE: 'remove',
  DAMAGE: 'damage',
  THEFT: 'theft',
  CORRECTION: 'correction',
  EXPIRED: 'expired',
} as const

// Commission status
export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const

// Government ID types
export const GOVERNMENT_ID_TYPES = {
  DRIVERS_LICENSE: 'drivers_license',
  PASSPORT: 'passport',
  STATE_ID: 'state_id',
  MILITARY_ID: 'military_id',
  OTHER: 'other',
} as const

// Purchase order status
export const PURCHASE_STATUS = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PARTIAL: 'partial',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

// Transfer status
export const TRANSFER_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Audit actions
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VOID: 'void',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  EXPORT: 'export',
  VIEW: 'view',
} as const

// Entity types for audit
export const ENTITY_TYPES = {
  USER: 'user',
  BRANCH: 'branch',
  CATEGORY: 'category',
  PRODUCT: 'product',
  INVENTORY: 'inventory',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  SALE: 'sale',
  PURCHASE: 'purchase',
  RETURN: 'return',
  EXPENSE: 'expense',
  COMMISSION: 'commission',
  SETTING: 'setting',
  AUTH: 'auth',
} as const
