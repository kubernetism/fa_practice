import { c as createLucideIcon, S as Shield, h as Building2, b8 as BadgePercent, D as Users, R as RotateCcw, H as ShoppingCart, P as Package, ae as FileText, O as Banknote, J as Receipt, a1 as DollarSign, d as useAuth, V as useBranch, u as useNavigate, r as reactExports, j as jsxRuntimeExports, N as Navigate, ad as Badge, L as Label, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, bb as SelectGroup, bc as SelectLabel, p as SelectItem, I as Input, B as Button, a as LoaderCircle, a3 as Card, a4 as CardContent, g as CircleAlert, aV as CardHeader, aW as CardTitle, C as ChevronRight } from "./index-B52pgjeh.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-cijvxAEp.js";
import { H as History } from "./history-CPSvetK1.js";
import { T as TrendingUp } from "./trending-up-FwewHr-m.js";
import { C as Calendar } from "./calendar-DB9RXZPy.js";
import { D as Download } from "./download-xhIli2Eq.js";
import { T as TrendingDown } from "./trending-down-Decpn3GI.js";
import { A as ArrowUp, a as ArrowDown } from "./arrow-up-BpmO2Iej.js";
import { A as ArrowUpDown } from "./arrow-up-down-BA9RXiwI.js";
import { C as ChevronLeft } from "./chevron-left-BLha8dAD.js";
import { T as TriangleAlert } from "./triangle-alert-Bp7w_-Fu.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const GitCompareArrows = createLucideIcon("GitCompareArrows", [
  ["circle", { cx: "5", cy: "6", r: "3", key: "1qnov2" }],
  ["path", { d: "M12 6h5a2 2 0 0 1 2 2v7", key: "1yj91y" }],
  ["path", { d: "m15 9-3-3 3-3", key: "1lwv8l" }],
  ["circle", { cx: "19", cy: "18", r: "3", key: "1qljk2" }],
  ["path", { d: "M12 18H7a2 2 0 0 1-2-2V9", key: "16sdep" }],
  ["path", { d: "m9 15 3 3-3 3", key: "1m3kbl" }]
]);
const REPORT_CATEGORIES = {
  financial: { label: "Financial", icon: DollarSign },
  operations: { label: "Operations", icon: Package },
  analytics: { label: "Analytics", icon: Users },
  audit: { label: "Audit", icon: Shield }
};
const REPORT_FILTER_CONFIG = {
  sales: {
    label: "Sales Report",
    description: "Revenue, transactions, and top products",
    icon: TrendingUp,
    category: "financial",
    hasDateFilter: true,
    hasGroupBy: true,
    entityFilters: ["branch", "customer", "paymentMethod", "paymentStatus"],
    summaryCards: [
      { key: "totalSales", label: "Total Sales", format: "number" },
      { key: "totalRevenue", label: "Revenue", format: "currency", color: "green" },
      { key: "avgOrderValue", label: "Avg Order", format: "currency", color: "blue" },
      { key: "totalTax", label: "Tax Collected", format: "currency" }
    ],
    tableColumns: [
      { key: "invoiceNumber", label: "Invoice", sortable: true },
      { key: "customerName", label: "Customer", sortable: true },
      { key: "saleDate", label: "Date", sortable: true, format: "datetime" },
      { key: "paymentMethod", label: "Payment", sortable: true, format: "badge" },
      { key: "paymentStatus", label: "Status", sortable: true, format: "badge" },
      { key: "totalAmount", label: "Amount", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/sales"
  },
  "profit-loss": {
    label: "Profit & Loss",
    description: "Revenue, expenses, and profit calculations",
    icon: DollarSign,
    category: "financial",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "revenue", label: "Net Revenue", format: "currency", color: "green" },
      { key: "costOfGoodsSold", label: "Cost of Goods", format: "currency", color: "red" },
      { key: "grossProfit", label: "Gross Profit", format: "currency", color: "blue" },
      { key: "netProfit", label: "Net Profit", format: "currency" }
    ],
    tableColumns: [
      { key: "label", label: "Item", sortable: false },
      { key: "amount", label: "Amount", sortable: false, format: "currency", align: "right" },
      { key: "percentage", label: "% of Revenue", sortable: false, format: "percent", align: "right" }
    ],
    drillDownRoute: void 0
  },
  expenses: {
    label: "Expense Report",
    description: "Expense tracking by category and payee",
    icon: Receipt,
    category: "financial",
    hasDateFilter: true,
    hasGroupBy: true,
    entityFilters: ["branch", "category", "payee", "payeeType", "paymentStatus"],
    summaryCards: [
      { key: "totalExpenses", label: "Total Expenses", format: "currency", color: "red" },
      { key: "totalPaid", label: "Paid", format: "currency", color: "green" },
      { key: "totalRemaining", label: "Remaining", format: "currency", color: "red" },
      { key: "expenseCount", label: "Transactions", format: "number" },
      { key: "avgExpense", label: "Avg Expense", format: "currency" }
    ],
    tableColumns: [
      { key: "expenseDate", label: "Date", sortable: true, format: "datetime" },
      { key: "category", label: "Category", sortable: true, format: "badge" },
      { key: "branchName", label: "Branch", sortable: true },
      { key: "description", label: "Description", sortable: false },
      { key: "payeeName", label: "Payee", sortable: true },
      { key: "payeeType", label: "Payee Type", sortable: true, format: "badge" },
      { key: "paymentMethod", label: "Payment", sortable: true, format: "badge" },
      { key: "paymentStatus", label: "Status", sortable: true, format: "badge" },
      { key: "amount", label: "Amount", sortable: true, format: "currency", align: "right" },
      { key: "paidAmount", label: "Paid", sortable: true, format: "currency", align: "right" },
      { key: "remainingAmount", label: "Remaining", sortable: true, format: "currency", align: "right" },
      { key: "dueDate", label: "Due", sortable: true, format: "date" }
    ],
    drillDownRoute: "/expenses"
  },
  "cash-flow": {
    label: "Cash Flow",
    description: "Money in/out and cash position",
    icon: Banknote,
    category: "financial",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "cashIn", label: "Cash In", format: "currency", color: "green" },
      { key: "cashOut", label: "Cash Out", format: "currency", color: "red" },
      { key: "netCashFlow", label: "Net Cash Flow", format: "currency" }
    ],
    tableColumns: [
      { key: "type", label: "Type", sortable: true, format: "badge" },
      { key: "source", label: "Source", sortable: true },
      { key: "description", label: "Description", sortable: false },
      { key: "amount", label: "Amount", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: void 0
  },
  tax: {
    label: "Tax Report",
    description: "Tax collection from taxable items only",
    icon: FileText,
    category: "financial",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "totalTaxCollected", label: "Tax Collected", format: "currency", color: "green" },
      { key: "taxableRevenue", label: "Taxable Revenue", format: "currency", color: "blue" },
      { key: "nonTaxableRevenue", label: "Non-Taxable Revenue", format: "currency" },
      { key: "taxableInvoices", label: "Taxable Invoices", format: "number" },
      { key: "effectiveTaxRate", label: "Effective Rate", format: "percent" }
    ],
    tableColumns: [
      { key: "invoiceNumber", label: "Invoice", sortable: true },
      { key: "saleDate", label: "Date", sortable: true, format: "datetime" },
      { key: "branchName", label: "Branch", sortable: true },
      { key: "paymentMethod", label: "Payment", sortable: true, format: "badge" },
      { key: "totalAmount", label: "Invoice Total", sortable: true, format: "currency", align: "right" },
      { key: "taxableRevenue", label: "Taxable Lines", sortable: true, format: "currency", align: "right" },
      { key: "taxAmount", label: "Tax Amount", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/sales"
  },
  inventory: {
    label: "Inventory Report",
    description: "Stock levels, valuations, and alerts",
    icon: Package,
    category: "operations",
    hasDateFilter: false,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "totalProducts", label: "Total Products", format: "number" },
      { key: "totalUnits", label: "Total Units", format: "number" },
      { key: "totalCostValue", label: "Cost Value", format: "currency", color: "blue" },
      { key: "totalRetailValue", label: "Retail Value", format: "currency", color: "green" },
      { key: "potentialMargin", label: "Potential Margin", format: "currency" },
      { key: "lowStockItems", label: "Low Stock", format: "number", color: "red" },
      { key: "outOfStockItems", label: "Out of Stock", format: "number", color: "red" }
    ],
    tableColumns: [
      { key: "productCode", label: "Code", sortable: true },
      { key: "productName", label: "Product", sortable: true },
      { key: "categoryName", label: "Category", sortable: true, format: "badge" },
      { key: "branchName", label: "Branch", sortable: true },
      { key: "quantity", label: "Qty", sortable: true, format: "number", align: "right" },
      { key: "minQuantity", label: "Min Qty", sortable: true, format: "number", align: "right" },
      { key: "costPrice", label: "Cost", sortable: true, format: "currency", align: "right" },
      { key: "sellingPrice", label: "Sell", sortable: true, format: "currency", align: "right" },
      { key: "costValue", label: "Cost Value", sortable: true, format: "currency", align: "right" },
      { key: "retailValue", label: "Retail Value", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/inventory"
  },
  purchases: {
    label: "Purchase Report",
    description: "Supplier purchases and payments",
    icon: ShoppingCart,
    category: "operations",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch", "supplier"],
    summaryCards: [
      { key: "totalPurchases", label: "Total Purchases", format: "number" },
      { key: "totalCost", label: "Total Cost", format: "currency", color: "red" },
      { key: "totalPaid", label: "Paid", format: "currency", color: "green" },
      { key: "totalRemaining", label: "Remaining", format: "currency", color: "red" },
      { key: "avgPurchaseValue", label: "Avg Purchase", format: "currency" }
    ],
    tableColumns: [
      { key: "purchaseOrderNumber", label: "PO Number", sortable: true },
      { key: "supplierName", label: "Supplier", sortable: true },
      { key: "createdAt", label: "Date", sortable: true, format: "datetime" },
      { key: "status", label: "Status", sortable: true, format: "badge" },
      { key: "paymentStatus", label: "Pay Status", sortable: true, format: "badge" },
      { key: "paymentMethod", label: "Method", sortable: true, format: "badge" },
      { key: "subtotal", label: "Subtotal", sortable: true, format: "currency", align: "right" },
      { key: "taxAmount", label: "Tax", sortable: true, format: "currency", align: "right" },
      { key: "shippingCost", label: "Shipping", sortable: true, format: "currency", align: "right" },
      { key: "totalAmount", label: "Total", sortable: true, format: "currency", align: "right" },
      { key: "paidAmount", label: "Paid", sortable: true, format: "currency", align: "right" },
      { key: "remainingAmount", label: "Remaining", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/purchases"
  },
  returns: {
    label: "Returns Report",
    description: "Product returns and refund analysis",
    icon: RotateCcw,
    category: "operations",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch", "reason"],
    summaryCards: [
      { key: "totalReturns", label: "Total Returns", format: "number" },
      { key: "totalValue", label: "Return Value", format: "currency", color: "red" },
      { key: "returnRate", label: "Return Rate", format: "percent" }
    ],
    tableColumns: [
      { key: "returnNumber", label: "Return #", sortable: true },
      { key: "invoiceNumber", label: "Original Invoice", sortable: true },
      { key: "returnDate", label: "Date", sortable: true, format: "datetime" },
      { key: "reason", label: "Reason", sortable: true, format: "badge" },
      { key: "totalAmount", label: "Amount", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/returns"
  },
  customer: {
    label: "Customer Report",
    description: "Customer analytics and purchase history",
    icon: Users,
    category: "analytics",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "totalCustomers", label: "Active Customers", format: "number" },
      { key: "totalRevenue", label: "Total Revenue", format: "currency", color: "green" }
    ],
    tableColumns: [
      { key: "customerName", label: "Customer", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "phone", label: "Phone", sortable: false },
      { key: "totalOrders", label: "Orders", sortable: true, format: "number", align: "right" },
      { key: "totalSpent", label: "Total Spent", sortable: true, format: "currency", align: "right" },
      { key: "avgOrderValue", label: "Avg Order", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/customers"
  },
  commissions: {
    label: "Commissions Report",
    description: "Sales commissions by salesperson",
    icon: BadgePercent,
    category: "analytics",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch", "salesperson"],
    summaryCards: [
      { key: "totalCommissions", label: "Total Commissions", format: "currency", color: "green" },
      { key: "commissionCount", label: "Commission Count", format: "number" },
      { key: "avgCommission", label: "Avg Commission", format: "currency" }
    ],
    tableColumns: [
      { key: "userName", label: "Salesperson", sortable: true },
      { key: "saleInvoice", label: "Invoice", sortable: true },
      { key: "date", label: "Date", sortable: true, format: "datetime" },
      { key: "amount", label: "Commission", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/commissions"
  },
  "branch-performance": {
    label: "Branch Performance",
    description: "Multi-branch comparison metrics",
    icon: Building2,
    category: "analytics",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: [],
    summaryCards: [
      { key: "totalBranches", label: "Total Branches", format: "number" },
      { key: "totalRevenue", label: "Gross Revenue", format: "currency", color: "green" },
      { key: "totalNetRevenue", label: "Net Revenue", format: "currency", color: "blue" },
      { key: "totalCogs", label: "COGS", format: "currency", color: "red" },
      { key: "totalGrossProfit", label: "Gross Profit", format: "currency" },
      { key: "totalExpenses", label: "Expenses", format: "currency", color: "red" },
      { key: "totalProfit", label: "Net Profit", format: "currency" }
    ],
    tableColumns: [
      { key: "branchName", label: "Branch", sortable: true },
      { key: "salesCount", label: "Sales", sortable: true, format: "number", align: "right" },
      { key: "revenue", label: "Gross Rev", sortable: true, format: "currency", align: "right" },
      { key: "taxCollected", label: "Tax", sortable: true, format: "currency", align: "right" },
      { key: "netRevenue", label: "Net Rev", sortable: true, format: "currency", align: "right" },
      { key: "cogs", label: "COGS", sortable: true, format: "currency", align: "right" },
      { key: "grossProfit", label: "Gross Profit", sortable: true, format: "currency", align: "right" },
      { key: "expenses", label: "Expenses", sortable: true, format: "currency", align: "right" },
      { key: "netProfit", label: "Net Profit", sortable: true, format: "currency", align: "right" },
      { key: "inventoryValue", label: "Inventory", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: "/branches"
  },
  "audit-trail": {
    label: "Audit Trail",
    description: "System activity and user action logs",
    icon: History,
    category: "audit",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch", "user", "actionType", "entityType"],
    summaryCards: [
      { key: "totalActions", label: "Total Actions", format: "number" },
      { key: "uniqueUsers", label: "Active Users", format: "number" }
    ],
    tableColumns: [
      { key: "timestamp", label: "Date/Time", sortable: true, format: "datetime" },
      { key: "userName", label: "User", sortable: true },
      { key: "action", label: "Action", sortable: true, format: "badge" },
      { key: "entityType", label: "Entity", sortable: true, format: "badge" },
      { key: "description", label: "Description", sortable: false }
    ],
    drillDownRoute: void 0
  },
  "comprehensive-audit": {
    label: "Comprehensive Audit",
    description: "Full business audit with financials, inventory, and voided transactions",
    icon: Shield,
    category: "audit",
    hasDateFilter: true,
    hasGroupBy: false,
    entityFilters: ["branch"],
    summaryCards: [
      { key: "totalRevenue", label: "Revenue", format: "currency", color: "green" },
      { key: "totalExpenses", label: "Expenses", format: "currency", color: "red" },
      { key: "netProfit", label: "Net Profit", format: "currency" },
      { key: "totalValue", label: "Inventory Value", format: "currency", color: "blue" }
    ],
    tableColumns: [
      { key: "type", label: "Type", sortable: true, format: "badge" },
      { key: "reference", label: "Reference", sortable: true },
      { key: "date", label: "Date", sortable: true, format: "datetime" },
      { key: "description", label: "Description", sortable: false },
      { key: "amount", label: "Amount", sortable: true, format: "currency", align: "right" }
    ],
    drillDownRoute: void 0
  }
};
const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "credit", label: "Credit" },
  { value: "mixed", label: "Mixed" },
  { value: "mobile", label: "Mobile" },
  { value: "cod", label: "COD" },
  { value: "receivable", label: "Receivable" }
];
const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
  { value: "unpaid", label: "Unpaid" }
];
const AUDIT_ACTION_OPTIONS = [
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "view", label: "View" },
  { value: "void", label: "Void" },
  { value: "refund", label: "Refund" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" }
];
const AUDIT_ENTITY_OPTIONS = [
  { value: "sale", label: "Sale" },
  { value: "expense", label: "Expense" },
  { value: "purchase", label: "Purchase" },
  { value: "inventory", label: "Inventory" },
  { value: "customer", label: "Customer" },
  { value: "product", label: "Product" },
  { value: "branch", label: "Branch" },
  { value: "user", label: "User" },
  { value: "auth", label: "Auth" },
  { value: "return", label: "Return" },
  { value: "commission", label: "Commission" }
];
const GROUP_BY_OPTIONS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" }
];
function getReportsByCategory() {
  const grouped = {};
  for (const [type, config] of Object.entries(REPORT_FILTER_CONFIG)) {
    if (!grouped[config.category]) grouped[config.category] = [];
    grouped[config.category].push({ type, config });
  }
  return grouped;
}
function formatCurrency(value) {
  return `Rs. ${(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatNumber(value) {
  return (value || 0).toLocaleString("en-US");
}
function formatPercent(value) {
  return `${(value || 0).toFixed(1)}%`;
}
function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatCellValue(value, format) {
  if (value === null || value === void 0) return "-";
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "number":
      return formatNumber(value);
    case "percent":
      return formatPercent(value);
    case "date":
      return formatDate(value);
    case "datetime":
      return formatDateTime(value);
    default:
      return String(value);
  }
}
function getComparisonChange(current, previous) {
  if (previous === 0) return { percent: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "same" };
  const percent = (current - previous) / Math.abs(previous) * 100;
  return { percent: Math.abs(percent), direction: percent > 0 ? "up" : percent < 0 ? "down" : "same" };
}
function ReportsScreen() {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  const navigate = useNavigate();
  const [branches, setBranches] = reactExports.useState([]);
  const [customers, setCustomers] = reactExports.useState([]);
  const [suppliersData, setSuppliersData] = reactExports.useState([]);
  const [payeesData, setPayeesData] = reactExports.useState([]);
  const [categoriesData, setCategoriesData] = reactExports.useState([]);
  const [usersData, setUsersData] = reactExports.useState([]);
  const [reportType, setReportType] = reactExports.useState("sales");
  const config = REPORT_FILTER_CONFIG[reportType];
  const [timePeriod, setTimePeriod] = reactExports.useState("monthly");
  const [startDate, setStartDate] = reactExports.useState(
    new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [selectedBranch, setSelectedBranch] = reactExports.useState(currentBranch?.id?.toString() || "all");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("all");
  const [paymentStatus, setPaymentStatus] = reactExports.useState("all");
  const [customerId, setCustomerId] = reactExports.useState("all");
  const [supplierId, setSupplierId] = reactExports.useState("all");
  const [payeeId, setPayeeId] = reactExports.useState("all");
  const [payeeTypeFilter, setPayeeTypeFilter] = reactExports.useState("all");
  const [categoryId, setCategoryId] = reactExports.useState("all");
  const [salespersonId, setSalespersonId] = reactExports.useState("all");
  const [actionType, setActionType] = reactExports.useState("all");
  const [entityType, setEntityType] = reactExports.useState("all");
  const [groupBy, setGroupBy] = reactExports.useState("day");
  const [reason, setReason] = reactExports.useState("all");
  const [comparisonMode, setComparisonMode] = reactExports.useState("none");
  const [comparisonBranchId, setComparisonBranchId] = reactExports.useState("all");
  const [reportData, setReportData] = reactExports.useState(null);
  const [comparisonData, setComparisonData] = reactExports.useState(null);
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [isDownloading, setIsDownloading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [pageSize] = reactExports.useState(25);
  const [sortColumn, setSortColumn] = reactExports.useState("");
  const [sortDirection, setSortDirection] = reactExports.useState("desc");
  if (!user || user.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  reactExports.useEffect(() => {
    fetchBranches();
    fetchReferenceData();
  }, []);
  reactExports.useEffect(() => {
    if (currentBranch && selectedBranch === "all") {
      setSelectedBranch(currentBranch.id.toString());
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    setReportData(null);
    setComparisonData(null);
    setCurrentPage(1);
    setSortColumn("");
    setPaymentMethod("all");
    setPaymentStatus("all");
    setCustomerId("all");
    setSupplierId("all");
    setPayeeId("all");
    setPayeeTypeFilter("all");
    setCategoryId("all");
    setSalespersonId("all");
    setActionType("all");
    setEntityType("all");
    setReason("all");
    setComparisonMode("none");
  }, [reportType]);
  reactExports.useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    switch (timePeriod) {
      case "daily":
        setStartDate(now.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
        break;
      case "weekly": {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        setStartDate(weekStart.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
        break;
      }
      case "monthly":
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]);
        break;
      case "yearly":
        setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]);
        setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0]);
        break;
      case "all-time":
        setStartDate("2000-01-01");
        setEndDate(now.toISOString().split("T")[0]);
        break;
    }
  }, [timePeriod]);
  const fetchBranches = async () => {
    try {
      const response = await window.api.branches.getAll();
      setBranches(response?.data || []);
    } catch {
      setBranches([]);
    }
  };
  const fetchReferenceData = async () => {
    try {
      const [custRes, suppRes, payeeRes, catRes, userRes] = await Promise.all([
        window.api.customers?.getAll?.() || { data: [] },
        window.api.suppliers?.getAll?.() || { data: [] },
        window.api.payees?.getAll?.({ isActive: true, limit: 1e3 }) || { data: [] },
        window.api.categories?.getAll?.() || { data: [] },
        window.api.users?.getAll?.() || { data: [] }
      ]);
      setCustomers(custRes?.data || []);
      setSuppliersData(suppRes?.data || []);
      setPayeesData(payeeRes?.data || []);
      setCategoriesData(catRes?.data || []);
      setUsersData(userRes?.data || []);
    } catch {
    }
  };
  const buildParams = reactExports.useCallback((overrides) => {
    const params = {
      startDate,
      endDate,
      page: currentPage,
      limit: pageSize,
      ...groupBy && config.hasGroupBy ? { groupBy } : {}
    };
    if (selectedBranch !== "all") params.branchId = parseInt(selectedBranch);
    if (paymentMethod !== "all") params.paymentMethod = paymentMethod;
    if (paymentStatus !== "all") params.paymentStatus = paymentStatus;
    if (customerId !== "all") params.customerId = parseInt(customerId);
    if (supplierId !== "all") params.supplierId = parseInt(supplierId);
    if (payeeId !== "all") params.payeeId = parseInt(payeeId);
    if (payeeTypeFilter !== "all") params.payeeType = payeeTypeFilter;
    if (categoryId !== "all") params.categoryId = parseInt(categoryId);
    if (salespersonId !== "all") params.salespersonId = parseInt(salespersonId);
    if (actionType !== "all") params.actionType = actionType;
    if (entityType !== "all") params.entityType = entityType;
    if (reason !== "all") params.reason = reason;
    if (overrides) Object.assign(params, overrides);
    return params;
  }, [startDate, endDate, currentPage, pageSize, groupBy, config.hasGroupBy, selectedBranch, paymentMethod, paymentStatus, customerId, supplierId, payeeId, payeeTypeFilter, categoryId, salespersonId, actionType, entityType, reason]);
  const getComparisonParams = reactExports.useCallback(() => {
    if (comparisonMode === "branch") {
      return buildParams({ branchId: comparisonBranchId !== "all" ? parseInt(comparisonBranchId) : void 0 });
    }
    if (comparisonMode === "period") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      return buildParams({
        startDate: prevStart.toISOString().split("T")[0],
        endDate: prevEnd.toISOString().split("T")[0]
      });
    }
    return null;
  }, [comparisonMode, comparisonBranchId, buildParams, startDate, endDate]);
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setReportData(null);
    setComparisonData(null);
    setCurrentPage(1);
    try {
      const params = buildParams({ page: 1 });
      let apiMethod = reportType;
      if (reportType === "comprehensive-audit") {
        apiMethod = "comprehensiveAudit";
        params.timePeriod = timePeriod;
      }
      const response = await window.api.reports[apiMethod](params);
      if (response?.success && response?.data) {
        setReportData(response.data);
      } else {
        setError(response?.message || "Failed to generate report");
      }
      if (comparisonMode !== "none") {
        const compParams = getComparisonParams();
        if (compParams) {
          const compResponse = await window.api.reports[apiMethod](compParams);
          if (compResponse?.success && compResponse?.data) {
            setComparisonData(compResponse.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    setIsGenerating(true);
    try {
      const params = buildParams({ page: newPage });
      let apiMethod = reportType;
      if (reportType === "comprehensive-audit") {
        apiMethod = "comprehensiveAudit";
        params.timePeriod = timePeriod;
      }
      const response = await window.api.reports[apiMethod](params);
      if (response?.success && response?.data) {
        setReportData((prev) => ({
          ...prev,
          details: response.data.details
        }));
      }
    } catch (err) {
      console.error("Failed to fetch page:", err);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setIsDownloading(true);
    setError(null);
    try {
      const branchName = selectedBranch === "all" ? "All Branches" : branches.find((b) => b.id.toString() === selectedBranch)?.name || "Unknown";
      let pdfData = reportData;
      if (reportType === "audit-trail" || reportType === "comprehensive-audit") {
        const auditParams = { timePeriod, startDate, endDate };
        if (selectedBranch !== "all") auditParams.branchId = parseInt(selectedBranch);
        const resp = await window.api.reports.comprehensiveAudit(auditParams);
        if (resp?.success && resp?.data) pdfData = resp.data;
      }
      const result = await window.api.reports.exportPDF({
        reportType,
        data: pdfData,
        filters: { timePeriod, startDate, endDate, branchName }
      });
      if (result?.success && result?.filePath) {
        alert(`Report downloaded!

Location: ${result.filePath}`);
      } else {
        setError(result?.message || "Failed to download PDF");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };
  const handleDrillDown = (row) => {
    if (!config.drillDownRoute) return;
    navigate(config.drillDownRoute);
  };
  const sortedDetails = reactExports.useMemo(() => {
    const details = reportData?.details?.rows || [];
    if (!sortColumn || details.length === 0) return details;
    return [...details].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === void 0) return 1;
      if (bVal === null || bVal === void 0) return -1;
      const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [reportData?.details?.rows, sortColumn, sortDirection]);
  const getSummaryValue = (data, key) => {
    if (!data) return 0;
    const summary = data.summary || data;
    if (summary[key] !== void 0) return Number(summary[key]) || 0;
    if (data.financialSummary?.[key] !== void 0) return Number(data.financialSummary[key]) || 0;
    if (data.salesSummary?.[key] !== void 0) return Number(data.salesSummary[key]) || 0;
    if (data.expensesSummary?.[key] !== void 0) return Number(data.expensesSummary[key]) || 0;
    if (data.inventorySummary?.[key] !== void 0) return Number(data.inventorySummary[key]) || 0;
    if (data[key] !== void 0) return Number(data[key]) || 0;
    return 0;
  };
  const reportsByCategory = reactExports.useMemo(() => getReportsByCategory(), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: "Reports & Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-0.5" }),
            "Admin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: config.description })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2.5 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Report Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reportType, onValueChange: (v) => setReportType(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[200px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(reportsByCategory).map(([cat, reports]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: REPORT_CATEGORIES[cat]?.label || cat }),
            reports.map(({ type, config: c }) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, className: "text-xs", children: c.label }, type))
          ] }, cat)) })
        ] })
      ] }),
      config.hasDateFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timePeriod, onValueChange: (v) => setTimePeriod(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: "Today" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "This Week" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "This Month" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yearly", children: "This Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all-time", children: "All Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: startDate,
              onChange: (e) => {
                setStartDate(e.target.value);
                setTimePeriod("custom");
              },
              className: "h-8 w-[130px] text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: endDate,
              onChange: (e) => {
                setEndDate(e.target.value);
                setTimePeriod("custom");
              },
              className: "h-8 w-[130px] text-xs"
            }
          )
        ] })
      ] }),
      config.hasGroupBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Group By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: groupBy, onValueChange: (v) => setGroupBy(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[90px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GROUP_BY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }),
        startDate,
        " to ",
        endDate
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2.5 flex-wrap", children: [
      config.entityFilters.includes("branch") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranch, onValueChange: setSelectedBranch, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[150px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Branches" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id.toString(), children: [
              b.code,
              " - ",
              b.name
            ] }, b.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("customer") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customerId, onValueChange: setCustomerId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[150px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Customers" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Customers" }),
            customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id.toString(), children: [
              c.firstName,
              " ",
              c.lastName
            ] }, c.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("supplier") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: supplierId, onValueChange: setSupplierId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[150px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Suppliers" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Suppliers" }),
            suppliersData.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.name }, s.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("payee") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Payee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: payeeId, onValueChange: setPayeeId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[180px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Payees" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Payees" }),
            payeesData.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id.toString(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize text-muted-foreground text-[10px] mr-1", children: p.payeeType }),
              p.name
            ] }, p.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("payeeType") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Payee Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: payeeTypeFilter, onValueChange: setPayeeTypeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Types" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vendor", children: "Vendor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "landlord", children: "Landlord" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "utility", children: "Utility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "government", children: "Government" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
          ] })
        ] })
      ] }),
      config.entityFilters.includes("category") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoryId, onValueChange: setCategoryId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[140px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
            categoriesData.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id.toString(), children: c.name }, c.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("paymentMethod") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentMethod, onValueChange: setPaymentMethod, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Methods" }),
            PAYMENT_METHOD_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("paymentStatus") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentStatus, onValueChange: setPaymentStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[100px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            PAYMENT_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("salesperson") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Salesperson" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: salespersonId, onValueChange: setSalespersonId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[140px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Salespersons" }),
            usersData.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id.toString(), children: u.fullName }, u.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("user") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "User" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: salespersonId, onValueChange: setSalespersonId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Users" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Users" }),
            usersData.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id.toString(), children: u.fullName }, u.id))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("actionType") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionType, onValueChange: setActionType, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[100px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Actions" }),
            AUDIT_ACTION_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("entityType") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Entity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: entityType, onValueChange: setEntityType, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Entities" }),
            AUDIT_ENTITY_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value))
          ] })
        ] })
      ] }),
      config.entityFilters.includes("reason") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reason, onValueChange: setReason, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Reasons" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "defective", children: "Defective" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "wrong_item", children: "Wrong Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not_needed", children: "Not Needed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2.5 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Compare" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: comparisonMode, onValueChange: (v) => setComparisonMode(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[140px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No Comparison" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "period", children: "vs Previous Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "branch", children: "vs Another Branch" })
          ] })
        ] })
      ] }),
      comparisonMode === "branch" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Compare Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: comparisonBranchId, onValueChange: setComparisonBranchId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[150px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Branch" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id.toString(), children: [
              b.code,
              " - ",
              b.name
            ] }, b.id))
          ] })
        ] })
      ] }),
      comparisonMode === "period" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitCompareArrows, { className: "w-3.5 h-3.5" }),
        "Comparing with previous ",
        timePeriod === "custom" ? "period" : timePeriod.replace("-", " ")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleGenerateReport, disabled: isGenerating, className: "h-8", children: [
          isGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" }),
          isGenerating ? "Generating..." : "Generate Report"
        ] }),
        reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleDownloadPDF, disabled: isDownloading, className: "h-8", children: [
          isDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
          "PDF"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-destructive shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
    ] }) }),
    reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid grid-cols-${Math.min(config.summaryCards.length, 4)} gap-3`, children: config.summaryCards.map((card) => {
        const value = getSummaryValue(reportData, card.key);
        const compValue = comparisonData ? getSummaryValue(comparisonData, card.key) : null;
        const change = compValue !== null ? getComparisonChange(value, compValue) : null;
        const colorClasses = {
          green: "text-green-600 dark:text-green-400",
          red: "text-red-600 dark:text-red-400",
          blue: "text-blue-600 dark:text-blue-400"
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: card.color ? `border-${card.color}-500/20` : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: card.label }),
            change && change.direction !== "same" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "outline",
                className: `text-[9px] px-1 py-0 ${change.direction === "up" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`,
                children: [
                  change.direction === "up" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-2.5 h-2.5 mr-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-2.5 h-2.5 mr-0.5" }),
                  change.percent.toFixed(1),
                  "%"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${card.color ? colorClasses[card.color] || "" : ""}`, children: card.format === "currency" ? formatCurrency(value) : card.format === "percent" ? formatPercent(value) : formatNumber(value) }),
          compValue !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            "vs ",
            card.format === "currency" ? formatCurrency(compValue) : card.format === "percent" ? formatPercent(compValue) : formatNumber(compValue)
          ] })
        ] }) }, card.key);
      }) }),
      reportType === "expenses" && reportData.expensesByPayee && reportData.expensesByPayee.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold tracking-wide uppercase", children: "Expenses by Payee Type" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3 pt-0", children: (() => {
            const types = reportData.expensesByPayeeType || [];
            const totalForTypes = types.reduce(
              (s, r) => s + (Number(r.amount) || 0),
              0
            );
            if (types.length === 0) {
              return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No data." });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: types.map((r) => {
              const amount = Number(r.amount) || 0;
              const pct = totalForTypes > 0 ? amount / totalForTypes * 100 : 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize font-medium", children: r.payeeType }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
                    formatCurrency(amount),
                    " · ",
                    pct.toFixed(1),
                    "% · ",
                    Number(r.count) || 0,
                    " txn"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full bg-primary/70",
                    style: { width: `${Math.min(pct, 100)}%` }
                  }
                ) })
              ] }, r.payeeType);
            }) });
          })() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold tracking-wide uppercase", children: "Top Payees" }),
            (() => {
              const total = reportData.expensesByPayee.reduce(
                (s, r) => s + (Number(r.amount) || 0),
                0
              );
              const top3 = reportData.expensesByPayee.slice(0, 3).reduce((s, r) => s + (Number(r.amount) || 0), 0);
              const pct = total > 0 ? top3 / total * 100 : 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "Top 3: ",
                pct.toFixed(1),
                "% of total"
              ] });
            })()
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3 pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            reportData.expensesByPayee.slice(0, 5).map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-b-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground w-4 tabular-nums", children: [
                      idx + 1,
                      "."
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize text-[10px] text-muted-foreground/70", children: r.payeeType }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: r.payeeName })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums shrink-0", children: formatCurrency(Number(r.amount) || 0) })
                ]
              },
              r.payeeId ?? idx
            )),
            reportData.expensesByPayee.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No payee data." })
          ] }) })
        ] })
      ] }),
      reportData.details && reportData.details.rows && reportData.details.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm", children: [
            config.label,
            " Details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
            reportData.details.total,
            " records"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "hover:bg-transparent", children: config.tableColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableHead,
              {
                className: `text-xs ${col.align === "right" ? "text-right" : ""} ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`,
                onClick: () => col.sortable && handleSort(col.key),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`, children: [
                  col.label,
                  col.sortable && (sortColumn === col.key ? sortDirection === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "w-3 h-3 opacity-30" }))
                ] })
              },
              col.key
            )) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedDetails.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableRow,
              {
                className: config.drillDownRoute ? "cursor-pointer hover:bg-muted/50" : "",
                onClick: () => config.drillDownRoute && handleDrillDown(),
                children: config.tableColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableCell,
                  {
                    className: `text-xs py-1.5 ${col.align === "right" ? "text-right" : ""} ${col.format === "currency" ? "font-semibold" : ""}`,
                    children: col.format === "badge" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 font-mono", children: String(row[col.key] || "-") }) : formatCellValue(row[col.key], col.format)
                  },
                  col.key
                ))
              },
              row.id || idx
            )) })
          ] }),
          reportData.details.totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
              "Page ",
              reportData.details.page,
              " of ",
              reportData.details.totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  disabled: reportData.details.page <= 1 || isGenerating,
                  onClick: () => handlePageChange(reportData.details.page - 1),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  disabled: reportData.details.page >= reportData.details.totalPages || isGenerating,
                  onClick: () => handlePageChange(reportData.details.page + 1),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] })
        ] })
      ] }),
      (reportType === "comprehensive-audit" || reportType === "audit-trail") && reportData.voidedTransactions && reportData.voidedTransactions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-amber-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-500" }),
            "Voided / Reversed Transactions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20", children: [
            reportData.voidedTransactions.length,
            " voided"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Void Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right", children: "Original Amount" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: reportData.voidedTransactions.map((vt, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 bg-red-500/10 text-red-600 border-red-500/20", children: vt.type }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5 line-through", children: vt.reference || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5", children: formatDateTime(vt.voidedDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5", children: vt.voidReason || "No reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5 text-right font-semibold text-red-600 dark:text-red-400", children: formatCurrency(vt.originalAmount) })
          ] }, idx)) })
        ] }) })
      ] })
    ] }),
    !reportData && !error && !isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(config.icon, { className: "w-12 h-12 mx-auto mb-3 text-muted-foreground/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: 'Select filters and click "Generate Report"' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: config.description })
    ] }) })
  ] });
}
export {
  ReportsScreen as default
};
