import type { ReportType } from '@shared/types'
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Banknote,
  FileText,
  Package,
  ShoppingCart,
  RotateCcw,
  Users,
  BadgePercent,
  Building2,
  History,
  Shield,
} from 'lucide-react'

export type EntityFilter =
  | 'branch'
  | 'customer'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'supplier'
  | 'category'
  | 'salesperson'
  | 'user'
  | 'actionType'
  | 'entityType'
  | 'reason'

export interface TableColumnConfig {
  key: string
  label: string
  sortable: boolean
  format?: 'currency' | 'number' | 'date' | 'datetime' | 'badge'
  align?: 'left' | 'right' | 'center'
}

export interface SummaryCardConfig {
  key: string
  label: string
  format: 'currency' | 'number' | 'percent'
  color?: string
}

export interface ReportFilterConfig {
  label: string
  description: string
  icon: React.ElementType
  category: 'financial' | 'operations' | 'analytics' | 'audit'
  hasDateFilter: boolean
  hasGroupBy: boolean
  entityFilters: EntityFilter[]
  summaryCards: SummaryCardConfig[]
  tableColumns: TableColumnConfig[]
  drillDownRoute?: string
}

export const REPORT_CATEGORIES = {
  financial: { label: 'Financial', icon: DollarSign },
  operations: { label: 'Operations', icon: Package },
  analytics: { label: 'Analytics', icon: Users },
  audit: { label: 'Audit', icon: Shield },
} as const

export const REPORT_FILTER_CONFIG: Record<ReportType, ReportFilterConfig> = {
  sales: {
    label: 'Sales Report',
    description: 'Revenue, transactions, and top products',
    icon: TrendingUp,
    category: 'financial',
    hasDateFilter: true,
    hasGroupBy: true,
    entityFilters: ['branch', 'customer', 'paymentMethod', 'paymentStatus'],
    summaryCards: [
      { key: 'totalSales', label: 'Total Sales', format: 'number' },
      { key: 'totalRevenue', label: 'Revenue', format: 'currency', color: 'green' },
      { key: 'avgOrderValue', label: 'Avg Order', format: 'currency', color: 'blue' },
      { key: 'totalTax', label: 'Tax Collected', format: 'currency' },
    ],
    tableColumns: [
      { key: 'invoiceNumber', label: 'Invoice', sortable: true },
      { key: 'customerName', label: 'Customer', sortable: true },
      { key: 'saleDate', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'paymentMethod', label: 'Payment', sortable: true, format: 'badge' },
      { key: 'paymentStatus', label: 'Status', sortable: true, format: 'badge' },
      { key: 'totalAmount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/sales',
  },
  'profit-loss': {
    label: 'Profit & Loss',
    description: 'Revenue, expenses, and profit calculations',
    icon: DollarSign,
    category: 'financial',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'revenue', label: 'Net Revenue', format: 'currency', color: 'green' },
      { key: 'costOfGoodsSold', label: 'Cost of Goods', format: 'currency', color: 'red' },
      { key: 'grossProfit', label: 'Gross Profit', format: 'currency', color: 'blue' },
      { key: 'netProfit', label: 'Net Profit', format: 'currency' },
    ],
    tableColumns: [
      { key: 'label', label: 'Item', sortable: false },
      { key: 'amount', label: 'Amount', sortable: false, format: 'currency', align: 'right' },
      { key: 'percentage', label: '% of Revenue', sortable: false, format: 'percent', align: 'right' },
    ],
    drillDownRoute: undefined,
  },
  expenses: {
    label: 'Expense Report',
    description: 'Expense tracking by category and supplier',
    icon: Receipt,
    category: 'financial',
    hasDateFilter: true,
    hasGroupBy: true,
    entityFilters: ['branch', 'category', 'supplier', 'paymentStatus'],
    summaryCards: [
      { key: 'totalExpenses', label: 'Total Expenses', format: 'currency', color: 'red' },
      { key: 'expenseCount', label: 'Transactions', format: 'number' },
      { key: 'avgExpense', label: 'Avg Expense', format: 'currency' },
    ],
    tableColumns: [
      { key: 'expenseDate', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'category', label: 'Category', sortable: true, format: 'badge' },
      { key: 'description', label: 'Description', sortable: false },
      { key: 'paymentMethod', label: 'Payment', sortable: true, format: 'badge' },
      { key: 'paymentStatus', label: 'Status', sortable: true, format: 'badge' },
      { key: 'amount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/expenses',
  },
  'cash-flow': {
    label: 'Cash Flow',
    description: 'Money in/out and cash position',
    icon: Banknote,
    category: 'financial',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'cashIn', label: 'Cash In', format: 'currency', color: 'green' },
      { key: 'cashOut', label: 'Cash Out', format: 'currency', color: 'red' },
      { key: 'netCashFlow', label: 'Net Cash Flow', format: 'currency' },
    ],
    tableColumns: [
      { key: 'type', label: 'Type', sortable: true, format: 'badge' },
      { key: 'source', label: 'Source', sortable: true },
      { key: 'description', label: 'Description', sortable: false },
      { key: 'amount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: undefined,
  },
  tax: {
    label: 'Tax Report',
    description: 'Tax collection and compliance',
    icon: FileText,
    category: 'financial',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'totalTaxCollected', label: 'Tax Collected', format: 'currency', color: 'green' },
      { key: 'taxableSales', label: 'Taxable Sales', format: 'number' },
      { key: 'avgTaxPerSale', label: 'Avg Tax/Sale', format: 'currency' },
    ],
    tableColumns: [
      { key: 'invoiceNumber', label: 'Invoice', sortable: true },
      { key: 'saleDate', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'totalAmount', label: 'Sale Amount', sortable: true, format: 'currency', align: 'right' },
      { key: 'taxAmount', label: 'Tax Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/sales',
  },
  inventory: {
    label: 'Inventory Report',
    description: 'Stock levels, valuations, and alerts',
    icon: Package,
    category: 'operations',
    hasDateFilter: false,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'totalProducts', label: 'Total Products', format: 'number' },
      { key: 'totalUnits', label: 'Total Units', format: 'number' },
      { key: 'lowStockItems', label: 'Low Stock', format: 'number', color: 'red' },
      { key: 'outOfStockItems', label: 'Out of Stock', format: 'number', color: 'red' },
    ],
    tableColumns: [
      { key: 'productCode', label: 'Code', sortable: true },
      { key: 'productName', label: 'Product', sortable: true },
      { key: 'branchName', label: 'Branch', sortable: true },
      { key: 'quantity', label: 'Qty', sortable: true, format: 'number', align: 'right' },
      { key: 'minQuantity', label: 'Min Qty', sortable: true, format: 'number', align: 'right' },
      { key: 'costValue', label: 'Cost Value', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/inventory',
  },
  purchases: {
    label: 'Purchase Report',
    description: 'Supplier purchases and payments',
    icon: ShoppingCart,
    category: 'operations',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch', 'supplier'],
    summaryCards: [
      { key: 'totalPurchases', label: 'Total Purchases', format: 'number' },
      { key: 'totalCost', label: 'Total Cost', format: 'currency', color: 'red' },
      { key: 'avgPurchaseValue', label: 'Avg Purchase', format: 'currency' },
    ],
    tableColumns: [
      { key: 'purchaseOrderNumber', label: 'PO Number', sortable: true },
      { key: 'supplierName', label: 'Supplier', sortable: true },
      { key: 'createdAt', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'status', label: 'Status', sortable: true, format: 'badge' },
      { key: 'totalAmount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/purchases',
  },
  returns: {
    label: 'Returns Report',
    description: 'Product returns and refund analysis',
    icon: RotateCcw,
    category: 'operations',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch', 'reason'],
    summaryCards: [
      { key: 'totalReturns', label: 'Total Returns', format: 'number' },
      { key: 'totalValue', label: 'Return Value', format: 'currency', color: 'red' },
      { key: 'returnRate', label: 'Return Rate', format: 'percent' },
    ],
    tableColumns: [
      { key: 'returnNumber', label: 'Return #', sortable: true },
      { key: 'invoiceNumber', label: 'Original Invoice', sortable: true },
      { key: 'returnDate', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'reason', label: 'Reason', sortable: true, format: 'badge' },
      { key: 'totalAmount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/returns',
  },
  customer: {
    label: 'Customer Report',
    description: 'Customer analytics and purchase history',
    icon: Users,
    category: 'analytics',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'totalCustomers', label: 'Active Customers', format: 'number' },
      { key: 'totalRevenue', label: 'Total Revenue', format: 'currency', color: 'green' },
    ],
    tableColumns: [
      { key: 'customerName', label: 'Customer', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'phone', label: 'Phone', sortable: false },
      { key: 'totalOrders', label: 'Orders', sortable: true, format: 'number', align: 'right' },
      { key: 'totalSpent', label: 'Total Spent', sortable: true, format: 'currency', align: 'right' },
      { key: 'avgOrderValue', label: 'Avg Order', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/customers',
  },
  commissions: {
    label: 'Commissions Report',
    description: 'Sales commissions by salesperson',
    icon: BadgePercent,
    category: 'analytics',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch', 'salesperson'],
    summaryCards: [
      { key: 'totalCommissions', label: 'Total Commissions', format: 'currency', color: 'green' },
      { key: 'commissionCount', label: 'Commission Count', format: 'number' },
      { key: 'avgCommission', label: 'Avg Commission', format: 'currency' },
    ],
    tableColumns: [
      { key: 'userName', label: 'Salesperson', sortable: true },
      { key: 'saleInvoice', label: 'Invoice', sortable: true },
      { key: 'date', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'amount', label: 'Commission', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/commissions',
  },
  'branch-performance': {
    label: 'Branch Performance',
    description: 'Multi-branch comparison metrics',
    icon: Building2,
    category: 'analytics',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: [],
    summaryCards: [
      { key: 'totalBranches', label: 'Total Branches', format: 'number' },
      { key: 'totalRevenue', label: 'Total Revenue', format: 'currency', color: 'green' },
      { key: 'totalProfit', label: 'Total Profit', format: 'currency' },
    ],
    tableColumns: [
      { key: 'branchName', label: 'Branch', sortable: true },
      { key: 'revenue', label: 'Revenue', sortable: true, format: 'currency', align: 'right' },
      { key: 'expenses', label: 'Expenses', sortable: true, format: 'currency', align: 'right' },
      { key: 'profit', label: 'Profit', sortable: true, format: 'currency', align: 'right' },
      { key: 'salesCount', label: 'Sales', sortable: true, format: 'number', align: 'right' },
      { key: 'inventoryValue', label: 'Inventory', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: '/branches',
  },
  'audit-trail': {
    label: 'Audit Trail',
    description: 'System activity and user action logs',
    icon: History,
    category: 'audit',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch', 'user', 'actionType', 'entityType'],
    summaryCards: [
      { key: 'totalActions', label: 'Total Actions', format: 'number' },
      { key: 'uniqueUsers', label: 'Active Users', format: 'number' },
    ],
    tableColumns: [
      { key: 'timestamp', label: 'Date/Time', sortable: true, format: 'datetime' },
      { key: 'userName', label: 'User', sortable: true },
      { key: 'action', label: 'Action', sortable: true, format: 'badge' },
      { key: 'entityType', label: 'Entity', sortable: true, format: 'badge' },
      { key: 'description', label: 'Description', sortable: false },
    ],
    drillDownRoute: undefined,
  },
  'comprehensive-audit': {
    label: 'Comprehensive Audit',
    description: 'Full business audit with financials, inventory, and voided transactions',
    icon: Shield,
    category: 'audit',
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ['branch'],
    summaryCards: [
      { key: 'totalRevenue', label: 'Revenue', format: 'currency', color: 'green' },
      { key: 'totalExpenses', label: 'Expenses', format: 'currency', color: 'red' },
      { key: 'netProfit', label: 'Net Profit', format: 'currency' },
      { key: 'totalValue', label: 'Inventory Value', format: 'currency', color: 'blue' },
    ],
    tableColumns: [
      { key: 'type', label: 'Type', sortable: true, format: 'badge' },
      { key: 'reference', label: 'Reference', sortable: true },
      { key: 'date', label: 'Date', sortable: true, format: 'datetime' },
      { key: 'description', label: 'Description', sortable: false },
      { key: 'amount', label: 'Amount', sortable: true, format: 'currency', align: 'right' },
    ],
    drillDownRoute: undefined,
  },
}

// Payment method options
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'credit', label: 'Credit' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'cod', label: 'COD' },
  { value: 'receivable', label: 'Receivable' },
]

// Payment status options
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'pending', label: 'Pending' },
  { value: 'unpaid', label: 'Unpaid' },
]

// Audit action type options
export const AUDIT_ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'view', label: 'View' },
  { value: 'void', label: 'Void' },
  { value: 'refund', label: 'Refund' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
]

// Audit entity type options
export const AUDIT_ENTITY_OPTIONS = [
  { value: 'sale', label: 'Sale' },
  { value: 'expense', label: 'Expense' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'customer', label: 'Customer' },
  { value: 'product', label: 'Product' },
  { value: 'branch', label: 'Branch' },
  { value: 'user', label: 'User' },
  { value: 'auth', label: 'Auth' },
  { value: 'return', label: 'Return' },
  { value: 'commission', label: 'Commission' },
]

// Group by options
export const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
]

// Helper to get reports grouped by category
export function getReportsByCategory() {
  const grouped: Record<string, Array<{ type: ReportType; config: ReportFilterConfig }>> = {}
  for (const [type, config] of Object.entries(REPORT_FILTER_CONFIG)) {
    if (!grouped[config.category]) grouped[config.category] = []
    grouped[config.category].push({ type: type as ReportType, config })
  }
  return grouped
}
