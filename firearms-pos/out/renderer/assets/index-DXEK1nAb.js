import { c as createLucideIcon, b as useBranch, r as reactExports, j as jsxRuntimeExports, R as Receipt, D as DollarSign, f as formatCurrency, i as Select, k as SelectTrigger, p as Building2, l as SelectValue, m as SelectContent, n as SelectItem, C as CreditCard, B as Button, o as cn, F as FileText, s as formatDateTime, q as ChevronRight, h as Banknote } from "./index-DQY4_xAv.js";
import { I as Input } from "./input-Yj7sP-j0.js";
import { L as Label } from "./label-C4WTSklC.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-54GJNHOd.js";
import { B as Badge } from "./badge-RnMwSlv9.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Cfz6R4A0.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-BOBgMWOm.js";
import { S as Separator } from "./separator-C-8W9YLx.js";
import { T as TrendingUp } from "./trending-up-JIGCNQ6g.js";
import { C as Calendar } from "./calendar-Bl6rbijA.js";
import { S as Search } from "./search-DCNx_w_N.js";
import { F as Filter } from "./filter-D1ZpSXNR.js";
import { X } from "./x-md1kSZXd.js";
import { C as Clock } from "./clock-CQNn0oKy.js";
import { E as Eye } from "./eye-BvxgPRsn.js";
import { P as Printer } from "./printer-DPq0FI-o.js";
import { C as ChevronLeft } from "./chevron-left-Og67h4I7.js";
import "./index-BgVtRTYu.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ban = createLucideIcon("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "credit", label: "Credit" },
  { value: "mixed", label: "Mixed" }
];
const ITEMS_PER_PAGE = 10;
function SalesHistoryScreen() {
  const { currentBranch, branches } = useBranch();
  const [sales, setSales] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [customers, setCustomers] = reactExports.useState([]);
  const [users, setUsers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [filterBranchId, setFilterBranchId] = reactExports.useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = reactExports.useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = reactExports.useState("all");
  const [filterDateFrom, setFilterDateFrom] = reactExports.useState("");
  const [filterDateTo, setFilterDateTo] = reactExports.useState("");
  const [showVoided, setShowVoided] = reactExports.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [viewingSale, setViewingSale] = reactExports.useState(null);
  const [viewingSaleItems, setViewingSaleItems] = reactExports.useState([]);
  const [viewingCustomer, setViewingCustomer] = reactExports.useState(null);
  const [isLoadingSaleDetails, setIsLoadingSaleDetails] = reactExports.useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = reactExports.useState(false);
  const [voidingSale, setVoidingSale] = reactExports.useState(null);
  const [voidReason, setVoidReason] = reactExports.useState("");
  const [isVoiding, setIsVoiding] = reactExports.useState(false);
  const [summary, setSummary] = reactExports.useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0
  });
  const fetchData = reactExports.useCallback(async () => {
    try {
      setIsLoading(true);
      const [salesResult, productsResult, customersResult, usersResult] = await Promise.all([
        window.api.sales.getAll({ limit: 1e3 }),
        window.api.products.getAll({ limit: 1e3 }),
        window.api.customers.getAll({ limit: 1e3 }),
        window.api.users.getAll({ limit: 1e3 })
      ]);
      if (salesResult.success && salesResult.data) {
        setSales(salesResult.data);
        calculateSummary(salesResult.data);
      }
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data);
      }
      if (customersResult.success && customersResult.data) {
        setCustomers(customersResult.data);
      }
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchData();
  }, [fetchData]);
  const calculateSummary = (salesData) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const nonVoidedSales = salesData.filter((s) => !s.isVoided);
    const todaySalesData = nonVoidedSales.filter((s) => s.saleDate?.startsWith(today));
    setSummary({
      totalSales: nonVoidedSales.length,
      totalRevenue: nonVoidedSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      todaySales: todaySalesData.length,
      todayRevenue: todaySalesData.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
    });
  };
  const getCustomerName = (customerId) => {
    if (!customerId) return "Walk-in Customer";
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return "Unknown";
    return `${customer.firstName} ${customer.lastName}`.trim();
  };
  const getCustomerPhone = (customerId) => {
    if (!customerId) return "N/A";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.phone || "N/A";
  };
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || "Unknown";
  };
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.fullName || user?.username || "Unknown";
  };
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.code})` : "Unknown";
  };
  const getPaymentMethodLabel = (method) => {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    return found?.label || method;
  };
  const getPaymentStatusBadge = (status, isVoided) => {
    if (isVoided) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Voided" });
    }
    switch (status) {
      case "paid":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Paid" });
      case "partial":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "warning", children: "Partial" });
      case "pending":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Pending" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: status });
    }
  };
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" });
      case "card":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" });
    }
  };
  const filteredSales = reactExports.useMemo(() => {
    return sales.filter((sale) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = sale.invoiceNumber.toLowerCase().includes(search) || getCustomerName(sale.customerId).toLowerCase().includes(search) || getCustomerPhone(sale.customerId).toLowerCase().includes(search) || getBranchName(sale.branchId).toLowerCase().includes(search) || getUserName(sale.userId).toLowerCase().includes(search) || (sale.paymentMethod || "").toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (filterBranchId !== "all" && sale.branchId !== parseInt(filterBranchId)) return false;
      if (filterPaymentMethod !== "all" && sale.paymentMethod !== filterPaymentMethod) return false;
      if (filterPaymentStatus !== "all" && sale.paymentStatus !== filterPaymentStatus) return false;
      if (!showVoided && sale.isVoided) return false;
      if (filterDateFrom) {
        const saleDate = new Date(sale.saleDate).toISOString().split("T")[0];
        if (saleDate < filterDateFrom) return false;
      }
      if (filterDateTo) {
        const saleDate = new Date(sale.saleDate).toISOString().split("T")[0];
        if (saleDate > filterDateTo) return false;
      }
      return true;
    });
  }, [sales, searchTerm, filterBranchId, filterPaymentMethod, filterPaymentStatus, filterDateFrom, filterDateTo, showVoided, customers, branches, users]);
  const sortedSales = reactExports.useMemo(() => {
    return [...filteredSales].sort(
      (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  }, [filteredSales]);
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE) || 1;
  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const filteredTotalRevenue = filteredSales.filter((s) => !s.isVoided).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const handleViewSale = async (sale) => {
    try {
      setIsLoadingSaleDetails(true);
      setViewingSale(sale);
      setIsViewDialogOpen(true);
      const result = await window.api.sales.getById(sale.id);
      if (result.success && result.data) {
        setViewingSaleItems(result.data.items || []);
        setViewingCustomer(result.data.customer || null);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setIsLoadingSaleDetails(false);
    }
  };
  const handleOpenVoidDialog = (sale) => {
    setVoidingSale(sale);
    setVoidReason("");
    setIsVoidDialogOpen(true);
  };
  const handleVoidSale = async () => {
    if (!voidingSale || !voidReason.trim()) {
      return;
    }
    try {
      setIsVoiding(true);
      const result = await window.api.sales.void(voidingSale.id, voidReason);
      if (result.success) {
        setIsVoidDialogOpen(false);
        setVoidingSale(null);
        setVoidReason("");
        fetchData();
      } else {
        alert(result.message || "Failed to void sale");
      }
    } catch (error) {
      console.error("Error voiding sale:", error);
      alert("An error occurred while voiding the sale");
    } finally {
      setIsVoiding(false);
    }
  };
  const handlePrintReceipt = (sale) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.invoiceNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; }
          .header p { margin: 5px 0; font-size: 12px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .info { font-size: 12px; margin: 5px 0; }
          .items { margin: 15px 0; }
          .item { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
          .totals { margin-top: 15px; }
          .totals .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
          .totals .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          @media print { body { width: 100%; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FIREARMS POS</h1>
          <p>${getBranchName(sale.branchId)}</p>
          <p>Invoice: ${sale.invoiceNumber}</p>
          <p>${formatDateTime(sale.saleDate)}</p>
        </div>
        <div class="divider"></div>
        <div class="info">
          <p>Customer: ${getCustomerName(sale.customerId)}</p>
          <p>Cashier: ${getUserName(sale.userId)}</p>
          <p>Payment: ${getPaymentMethodLabel(sale.paymentMethod)}</p>
        </div>
        <div class="divider"></div>
        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
          <div class="row"><span>Tax:</span><span>${formatCurrency(sale.taxAmount)}</span></div>
          <div class="row"><span>Discount:</span><span>-${formatCurrency(sale.discountAmount)}</span></div>
          <div class="divider"></div>
          <div class="row total"><span>TOTAL:</span><span>${formatCurrency(sale.totalAmount)}</span></div>
          <div class="row"><span>Paid:</span><span>${formatCurrency(sale.amountPaid)}</span></div>
          <div class="row"><span>Change:</span><span>${formatCurrency(sale.changeGiven)}</span></div>
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Printed: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setFilterBranchId("all");
    setFilterPaymentMethod("all");
    setFilterPaymentStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setShowVoided(false);
    setCurrentPage(1);
  };
  const hasActiveFilters = searchTerm || filterBranchId !== "all" || filterPaymentMethod !== "all" || filterPaymentStatus !== "all" || filterDateFrom || filterDateTo || showVoided;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading sales history..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Sales History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "View and manage all past sales transactions" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.totalSales.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All time transactions" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(summary.totalRevenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All time revenue" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.todaySales.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Transactions today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(summary.todayRevenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Revenue today" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search invoice, customer, branch, cashier...",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Filters:" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterBranchId, onValueChange: (value) => {
          setFilterBranchId(value);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Branch" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPaymentMethod, onValueChange: (value) => {
          setFilterPaymentMethod(value);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Payment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Methods" }),
            PAYMENT_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method.value, children: method.label }, method.value))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPaymentStatus, onValueChange: (value) => {
          setFilterPaymentStatus(value);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground", children: "From:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: filterDateFrom,
              onChange: (e) => {
                setFilterDateFrom(e.target.value);
                setCurrentPage(1);
              },
              className: "w-40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground", children: "To:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: filterDateTo,
              onChange: (e) => {
                setFilterDateTo(e.target.value);
                setCurrentPage(1);
              },
              className: "w-40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: showVoided ? "default" : "outline",
            size: "sm",
            onClick: () => {
              setShowVoided(!showVoided);
              setCurrentPage(1);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "mr-2 h-4 w-4" }),
              showVoided ? "Hiding Voided" : "Show Voided"
            ]
          }
        ),
        hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: clearFilters, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-2 h-4 w-4" }),
          "Clear"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: paginatedSales.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mx-auto mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No sales found" }),
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: clearFilters, children: "Clear filters to see all sales" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date/Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedSales.map((sale) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn(sale.isVoided && "opacity-50 bg-muted/50"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: sale.invoiceNumber })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: formatDateTime(sale.saleDate) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getCustomerName(sale.customerId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: getCustomerPhone(sale.customerId) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getBranchName(sale.branchId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          getPaymentMethodIcon(sale.paymentMethod),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getPaymentMethodLabel(sale.paymentMethod) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-medium", sale.isVoided && "line-through"), children: formatCurrency(sale.totalAmount) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getPaymentStatusBadge(sale.paymentStatus, sale.isVoided) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleViewSale(sale),
              title: "View Details",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handlePrintReceipt(sale),
              title: "Print Receipt",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" })
            }
          ),
          !sale.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleOpenVoidDialog(sale),
              title: "Void Sale",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] }) })
      ] }, sale.id)) })
    ] }) }) }),
    sortedSales.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        " to",
        " ",
        Math.min(currentPage * ITEMS_PER_PAGE, sortedSales.length),
        " of ",
        sortedSales.length,
        " sales",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-4 font-medium", children: [
          "Filtered Total: ",
          formatCurrency(filteredTotalRevenue)
        ] })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((p) => p - 1),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "mr-1 h-4 w-4" }),
              "Previous"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: currentPage === totalPages,
            onClick: () => setCurrentPage((p) => p + 1),
            children: [
              "Next",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-5 w-5" }),
          "Sale Details"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          viewingSale?.invoiceNumber
        ] })
      ] }),
      viewingSale && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewingSale.invoiceNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Date & Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDateTime(viewingSale.saleDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Branch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getBranchName(viewingSale.branchId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cashier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getUserName(viewingSale.userId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingSale.customerId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer?.phone || getCustomerPhone(viewingSale.customerId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getPaymentMethodIcon(viewingSale.paymentMethod),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: getPaymentMethodLabel(viewingSale.paymentMethod) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Status" }),
            getPaymentStatusBadge(viewingSale.paymentStatus, viewingSale.isVoided)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-3", children: "Items" }),
          isLoadingSaleDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : viewingSaleItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-4", children: "No items found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Unit Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Subtotal" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: viewingSaleItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.product?.name || getProductName(item.productId) }),
                item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "S/N: ",
                  item.serialNumber
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.unitPrice) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.totalPrice) })
            ] }, item.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingSale.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingSale.taxAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "-",
              formatCurrency(viewingSale.discountAmount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(viewingSale.isVoided && "line-through"), children: formatCurrency(viewingSale.totalAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Amount Paid:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingSale.amountPaid) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Change:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingSale.changeGiven) })
          ] })
        ] }),
        viewingSale.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-destructive/10 p-4 text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
              "This sale has been voided"
            ] }),
            viewingSale.voidReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
              "Reason: ",
              viewingSale.voidReason
            ] })
          ] })
        ] }),
        viewingSale.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: viewingSale.notes })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Close" }),
        viewingSale && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handlePrintReceipt(viewingSale), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "mr-2 h-4 w-4" }),
          "Print Receipt"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isVoidDialogOpen, onOpenChange: setIsVoidDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-5 w-5" }),
          "Void Sale"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Are you sure you want to void this sale? This action cannot be undone." })
      ] }),
      voidingSale && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: voidingSale.invoiceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            formatDateTime(voidingSale.saleDate),
            " - ",
            formatCurrency(voidingSale.totalAmount)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voidReason", children: "Reason for voiding *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "voidReason",
              value: voidReason,
              onChange: (e) => setVoidReason(e.target.value),
              placeholder: "Enter reason for voiding this sale"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsVoidDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: handleVoidSale,
            disabled: !voidReason.trim() || isVoiding,
            children: isVoiding ? "Voiding..." : "Void Sale"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  SalesHistoryScreen
};
