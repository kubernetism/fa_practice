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
  SalesTab,
  NewSalesTab,
  SalesTabItem,
  NewSalesTabItem,
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
  BusinessSettings,
  InsertBusinessSettings,
  AccountReceivable,
  NewAccountReceivable,
  ReceivablePayment,
  NewReceivablePayment,
  Todo,
  NewTodo,
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

// Enhanced Report Types
export type ReportType =
  | 'sales'
  | 'inventory'
  | 'expenses'
  | 'purchases'
  | 'returns'
  | 'commissions'
  | 'profit-loss'
  | 'tax'
  | 'customer'
  | 'branch-performance'
  | 'cash-flow'
  | 'audit-trail'

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time' | 'custom'

export interface ReportFilters {
  reportType: ReportType
  timePeriod: TimePeriod
  startDate?: string
  endDate?: string
  branchId?: number | 'all'
  categoryId?: number
  productId?: number
  customerId?: number
  userId?: number
}

export interface ExpenseReportData {
  summary: {
    totalExpenses: number
    expenseCount: number
    avgExpense: number
  }
  expensesByCategory: Array<{
    category: string
    amount: number
    count: number
  }>
  expensesByBranch: Array<{
    branchId: number
    branchName: string
    amount: number
    count: number
  }>
  topExpenses: Array<{
    id: number
    category: string
    amount: number
    description: string
    date: string
    branchName: string
  }>
}

export interface PurchaseReportData {
  summary: {
    totalPurchases: number
    totalCost: number
    avgPurchaseValue: number
    pendingPayments: number
  }
  purchasesBySupplier: Array<{
    supplierId: number
    supplierName: string
    totalPurchases: number
    totalAmount: number
  }>
  purchasesByStatus: Array<{
    status: string
    count: number
    totalAmount: number
  }>
  recentPurchases: Array<{
    id: number
    purchaseOrderNumber: string
    supplierName: string
    totalAmount: number
    status: string
    createdAt: string
  }>
}

export interface ReturnReportData {
  summary: {
    totalReturns: number
    totalValue: number
    returnRate: number
  }
  returnsByReason: Array<{
    reason: string
    count: number
    value: number
  }>
  returnsByProduct: Array<{
    productId: number
    productName: string
    returnCount: number
    totalValue: number
  }>
}

export interface CommissionReportData {
  summary: {
    totalCommissions: number
    commissionCount: number
    avgCommission: number
  }
  commissionsBySalesperson: Array<{
    userId: number
    userName: string
    totalCommission: number
    salesCount: number
  }>
  recentCommissions: Array<{
    id: number
    userName: string
    saleInvoice: string
    amount: number
    date: string
  }>
}

export interface TaxReportData {
  summary: {
    totalTaxCollected: number
    taxableSales: number
    avgTaxPerSale: number
  }
  taxByBranch: Array<{
    branchId: number
    branchName: string
    taxCollected: number
  }>
  taxByPaymentMethod: Array<{
    paymentMethod: string
    taxCollected: number
    salesCount: number
  }>
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number
    activeCustomers: number
    newCustomers: number
    totalRevenue: number
  }
  topCustomers: Array<{
    customerId: number
    customerName: string
    email: string
    phone: string
    totalOrders: number
    totalSpent: number
    avgOrderValue: number
  }>
  customerRetention: {
    repeatCustomers: number
    oneTimeCustomers: number
    repeatRate: number
  }
}

export interface BranchPerformanceData {
  summary: {
    totalBranches: number
    totalRevenue: number
    totalProfit: number
  }
  branchMetrics: Array<{
    branchId: number
    branchName: string
    revenue: number
    expenses: number
    profit: number
    salesCount: number
    inventoryValue: number
  }>
  topPerformingBranch: {
    branchId: number
    branchName: string
    revenue: number
  }
}

export interface CashFlowData {
  summary: {
    cashIn: number
    cashOut: number
    netCashFlow: number
    openingBalance: number
    closingBalance: number
  }
  cashInBreakdown: {
    sales: number
    receivables: number
    other: number
  }
  cashOutBreakdown: {
    purchases: number
    expenses: number
    commissions: number
    refunds: number
  }
  cashByBranch: Array<{
    branchId: number
    branchName: string
    cashInHand: number
  }>
}

export interface AuditTrailData {
  salesSummary?: {
    totalSales: number
    totalRevenue: number
    avgOrderValue: number
    totalTax: number
  }
  salesByPaymentMethod?: Array<{
    paymentMethod: string
    count: number
    total: number
  }>
  topProducts?: Array<{
    productId: number
    productCode: string
    productName: string
    quantitySold: number
    revenue: number
  }>
  inventorySummary?: {
    totalProducts: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
  }
  purchasesSummary?: {
    totalPurchases: number
    totalCost: number
    avgPurchaseValue: number
  }
  expensesSummary?: {
    totalExpenses: number
    expenseCount: number
    avgExpense: number
  }
  expensesByCategory?: Array<{
    category: string
    amount: number
    count: number
  }>
  returnsSummary?: {
    totalReturns: number
    totalRefundAmount: number
    returnRate: number
  }
  financialSummary?: {
    grossRevenue: number
    refunds: number
    netRevenue: number
    cogs: number
    grossProfit: number
    expenses: number
    netProfit: number
    profitMargin: number
  }
  commissionsSummary?: {
    totalCommission: number
    commissionCount: number
    avgCommission: number
  }
  auditLogs?: Array<{
    id: number
    userName: string
    action: string
    tableName: string
    timestamp: string
  }>
}

// Sales Tabs types
export type SalesTabStatus = 'open' | 'on_hold' | 'closed'
export type PaymentMethod = 'cash' | 'card' | 'credit' | 'mixed' | 'mobile' | 'cod' | 'receivable'

export interface SalesTabWithItems extends SalesTab {
  items: SalesTabItem[]
  customer?: Customer
  branch?: Branch
  user?: {
    id: number
    username: string
    fullName: string
  }
}

export interface TabCheckoutData {
  paymentMethod: PaymentMethod
  discount?: number
  amountPaid?: number
  codName?: string
  codPhone?: string
  codAddress?: string
  codCity?: string
  notes?: string
}

export interface AvailableProduct {
  product: Product
  quantity: number
}

export interface TabFilters {
  branchId?: number
  status?: SalesTabStatus
  userId?: number
}

// Todo types
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TodoWithDetails extends Todo {
  creator?: {
    id: number
    username: string
    fullName: string
  }
  assignee?: {
    id: number
    username: string
    fullName: string
    role: string
  }
  branch?: Branch
}

export interface TodoCounts {
  total: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
}
