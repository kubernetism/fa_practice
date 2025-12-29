// Re-export types from schema
export type {
  User,
  NewUser,
  Branch,
  NewBranch,
  Category,
  NewCategory,
  Product,
  NewProduct,
  Inventory,
  NewInventory,
  Customer,
  NewCustomer,
  Supplier,
  NewSupplier,
  Sale,
  NewSale,
  SaleItem,
  NewSaleItem,
  Purchase,
  NewPurchase,
  PurchaseItem,
  NewPurchaseItem,
  Return,
  NewReturn,
  ReturnItem,
  NewReturnItem,
  Expense,
  NewExpense,
  Commission,
  NewCommission,
  AuditLog,
  NewAuditLog,
  Setting,
  NewSetting,
  StockAdjustment,
  NewStockAdjustment,
  StockTransfer,
  NewStockTransfer,
} from '../../main/db/schema'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  totalPages: number
}

// Session types
export interface SessionUser {
  userId: number
  username: string
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'cashier'
  permissions: string[]
  branchId: number | null
  branchName: string | null
}

// Cart types for POS
export interface CartItem {
  productId: number
  product: {
    id: number
    code: string
    name: string
    sellingPrice: number
    costPrice: number
    isSerialTracked: boolean
    taxRate: number
  }
  quantity: number
  unitPrice: number
  serialNumber?: string
  discountPercent: number
  total: number
}

// License types
export interface LicenseStatus {
  isValid: boolean
  isActivated: boolean
  expiresAt: string | null
  features: string[]
  message: string
}

// Report types
export interface SalesReportData {
  summary: {
    totalSales: number
    totalRevenue: number
    totalTax: number
    totalDiscount: number
    avgOrderValue: number
  }
  byPaymentMethod: Array<{
    paymentMethod: string
    count: number
    total: number
  }>
  topProducts: Array<{
    productId: number
    productName: string
    productCode: string
    quantitySold: number
    revenue: number
  }>
  dailySales: Array<{
    date: string
    count: number
    total: number
  }>
}

export interface InventoryReportData {
  stockSummary: Array<{
    branchId: number
    branchName: string
    totalProducts: number
    totalUnits: number
    lowStockItems: number
    outOfStockItems: number
  }>
  stockValue: Array<{
    branchId: number
    costValue: number
    retailValue: number
  }>
  lowStock: Array<{
    productId: number
    productName: string
    productCode: string
    branchId: number
    branchName: string
    quantity: number
    minQuantity: number
    reorderLevel: number
  }>
}

export interface ProfitLossData {
  revenue: number
  costOfGoodsSold: number
  grossProfit: number
  grossMargin: number
  expenses: number
  expensesByCategory: Array<{
    category: string
    total: number
  }>
  netProfit: number
  netMargin: number
}
