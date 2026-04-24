import { V as useBranch, ai as useCurrentBranchSettings, r as reactExports, j as jsxRuntimeExports, J as Receipt, ag as Separator, aZ as formatCurrency, I as Input, X, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, p as SelectItem, aC as cn, b1 as formatDateTime, b as Eye, a as LoaderCircle, R as RotateCcw, C as ChevronRight, a8 as Dialog, a9 as DialogContent, aa as DialogHeader, ab as DialogTitle, ac as DialogDescription, B as Button, L as Label, am as DialogFooter, a1 as DollarSign, ah as CreditCard, O as Banknote, ad as Badge } from "./index-2rq_5YkW.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-XkqVqf4i.js";
import { R as ReversalRequestModal } from "./reversal-request-modal-DaVfN7U4.js";
import { R as ReversalStatusBadge } from "./reversal-status-badge-mqWe81lQ.js";
import { T as TrendingUp } from "./trending-up-CBeM15Ul.js";
import { S as Search } from "./search-BuJtneNW.js";
import { F as Filter } from "./filter-rQ27Rytz.js";
import { B as Ban } from "./ban-C0hUJ2Dg.js";
import { P as Printer } from "./printer-C-eo0649.js";
import { C as ChevronLeft } from "./chevron-left-CUuk1mkU.js";
import "./triangle-alert-BOj49HNE.js";
import "./circle-check-tgtUDDE3.js";
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "credit", label: "Credit" },
  { value: "mixed", label: "Mixed" }
];
const ITEMS_PER_PAGE = 10;
function SalesHistoryScreen() {
  const { currentBranch, branches } = useBranch();
  const { settings: branchSettings } = useCurrentBranchSettings();
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
  const [printingSaleIds, setPrintingSaleIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTargetSale, setReversalTargetSale] = reactExports.useState(null);
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
  const handlePrintReceipt = async (sale, _items) => {
    if (printingSaleIds.has(sale.id)) return;
    const customerName = getCustomerName(sale.customerId);
    const safeCustomerName = (customerName || "Walk-in").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
    const filename = `${sale.invoiceNumber} - ${safeCustomerName}.pdf`;
    setPrintingSaleIds((prev) => {
      const next = new Set(prev);
      next.add(sale.id);
      return next;
    });
    try {
      const result = await window.api.receipt.generate(sale.id, filename);
      if (!result.success) {
        alert(result.message || "Failed to save receipt PDF");
        return;
      }
      const filePath = result.data?.filePath;
      if (filePath) {
        try {
          await window.api.shell.openPath(filePath);
        } catch (err) {
          console.warn("Could not open generated PDF:", err);
        }
      }
    } catch (err) {
      console.error("Save receipt PDF failed:", err);
      alert("Failed to save receipt PDF");
    } finally {
      setPrintingSaleIds((prev) => {
        const next = new Set(prev);
        next.delete(sale.id);
        return next;
      });
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full -m-6 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-b border-border bg-card px-4 py-2 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold uppercase tracking-wider shrink-0", children: "Sales History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/50 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tabular-nums", children: summary.totalSales.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-3 mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tabular-nums", children: formatCurrency(summary.totalRevenue) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/50 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tabular-nums", children: summary.todaySales.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-3 mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tabular-nums", children: formatCurrency(summary.todayRevenue) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search invoice, customer, cashier...",
              value: searchTerm,
              onChange: (e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              },
              className: "h-8 pl-8 text-xs bg-background"
            }
          ),
          searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setSearchTerm("");
            setCurrentPage(1);
          }, className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterBranchId, onValueChange: (v) => {
          setFilterBranchId(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-32 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Branch" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id.toString(), children: b.name }, b.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPaymentMethod, onValueChange: (v) => {
          setFilterPaymentMethod(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-28 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Payment" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Methods" }),
            PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPaymentStatus, onValueChange: (v) => {
          setFilterPaymentStatus(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-24 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: filterDateFrom, onChange: (e) => {
            setFilterDateFrom(e.target.value);
            setCurrentPage(1);
          }, className: "h-7 w-32 text-xs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: filterDateTo, onChange: (e) => {
            setFilterDateTo(e.target.value);
            setCurrentPage(1);
          }, className: "h-7 w-32 text-xs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setShowVoided(!showVoided);
              setCurrentPage(1);
            },
            className: cn(
              "h-7 px-2 rounded text-[10px] font-medium border transition-colors",
              showVoided ? "bg-destructive/10 border-destructive/30 text-destructive" : "border-border text-muted-foreground hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "inline h-3 w-3 mr-1" }),
              "Voided"
            ]
          }
        ),
        hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: clearFilters, className: "h-7 px-2 rounded text-[10px] text-muted-foreground hover:text-foreground border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "inline h-3 w-3 mr-1" }),
          "Clear"
        ] }),
        hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[10px] text-muted-foreground", children: [
          "Filtered: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatCurrency(filteredTotalRevenue) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto", children: paginatedSales.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mx-auto mb-2 h-8 w-8 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No sales found" }),
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearFilters, className: "text-xs text-primary hover:underline mt-1", children: "Clear filters" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Date/Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Tax" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Discount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "py-2 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedSales.map((sale) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn("text-xs", sale.isVoided && "opacity-40 bg-muted/30"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] font-medium", children: sale.invoiceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "sale", entityId: sale.id })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: formatDateTime(sale.saleDate) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium", children: getCustomerName(sale.customerId) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: getBranchName(sale.branchId) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          getPaymentMethodIcon(sale.paymentMethod),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px]", children: getPaymentMethodLabel(sale.paymentMethod) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[11px] tabular-nums", sale.isVoided && "line-through"), children: formatCurrency(sale.taxAmount) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: sale.discountAmount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-[11px] tabular-nums text-green-600 dark:text-green-400", sale.isVoided && "line-through"), children: [
          "-",
          formatCurrency(sale.discountAmount)
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "-" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[11px] tabular-nums font-semibold", sale.isVoided && "line-through"), children: formatCurrency(sale.totalAmount) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[11px] tabular-nums", sale.isVoided && "line-through"), children: formatCurrency(sale.amountPaid) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: sale.totalAmount - sale.amountPaid > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[11px] tabular-nums font-medium text-destructive", sale.isVoided && "line-through"), children: formatCurrency(sale.totalAmount - sale.amountPaid) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "-" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getPaymentStatusBadge(sale.paymentStatus, sale.isVoided) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleViewSale(sale), title: "View", className: "p-1 rounded hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handlePrintReceipt(sale),
              disabled: printingSaleIds.has(sale.id),
              title: printingSaleIds.has(sale.id) ? "Saving PDF…" : "Print",
              className: "p-1 rounded hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-wait",
              children: printingSaleIds.has(sale.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 text-muted-foreground animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5 text-muted-foreground" })
            }
          ),
          !sale.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleOpenVoidDialog(sale), title: "Void", className: "p-1 rounded hover:bg-destructive/10 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5 text-destructive/60" }) }),
          !sale.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setReversalTargetSale(sale);
            setIsReversalModalOpen(true);
          }, title: "Reversal", className: "p-1 rounded hover:bg-amber-500/10 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500/70" }) })
        ] }) })
      ] }, sale.id)) })
    ] }) }),
    sortedSales.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex items-center justify-between px-4 py-1.5 border-t border-border bg-card text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        "-",
        Math.min(currentPage * ITEMS_PER_PAGE, sortedSales.length),
        " of ",
        sortedSales.length,
        !hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-3", children: [
          "Total: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatCurrency(filteredTotalRevenue) })
        ] })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((p) => p - 1),
            className: "h-6 px-2 rounded border border-border text-[10px] font-medium disabled:opacity-30 hover:bg-muted transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "inline h-3 w-3" }),
              " Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 text-[10px] tabular-nums", children: [
          currentPage,
          "/",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            disabled: currentPage === totalPages,
            onClick: () => setCurrentPage((p) => p + 1),
            className: "h-6 px-2 rounded border border-border text-[10px] font-medium disabled:opacity-30 hover:bg-muted transition-colors",
            children: [
              "Next ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "inline h-3 w-3" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-[520px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "sr-only", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Sale Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          viewingSale?.invoiceNumber
        ] })
      ] }),
      viewingSale && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-5 pb-4 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-widest uppercase", children: branchSettings?.businessName || "POS System" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400 tracking-wider uppercase mt-0.5", children: getBranchName(viewingSale.branchId) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-sm font-semibold tracking-wide", children: [
                  "#",
                  viewingSale.invoiceNumber
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "sale", entityId: viewingSale.id })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400 mt-1", children: formatDateTime(viewingSale.saleDate) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3", children: [
            viewingSale.isVoided ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-2.5 w-2.5" }),
              " Voided"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
              viewingSale.paymentStatus === "paid" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
              viewingSale.paymentStatus === "partial" && "bg-amber-500/20 text-amber-300 border-amber-500/30",
              viewingSale.paymentStatus === "pending" && "bg-slate-500/20 text-slate-300 border-slate-500/30"
            ), children: viewingSale.paymentStatus }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider", children: [
              getPaymentMethodIcon(viewingSale.paymentMethod),
              getPaymentMethodLabel(viewingSale.paymentMethod)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-px bg-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5 truncate", children: viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingSale.customerId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-mono", children: viewingCustomer?.phone || getCustomerPhone(viewingSale.customerId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60", children: "Cashier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5 truncate", children: getUserName(viewingSale.userId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: getBranchName(viewingSale.branchId) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-4 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60", children: "Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              viewingSaleItems.length,
              " item",
              viewingSaleItems.length !== 1 ? "s" : ""
            ] })
          ] }),
          isLoadingSaleDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : viewingSaleItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-6 text-xs", children: "No items found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_50px_80px_80px] gap-2 pb-1.5 border-b border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50", children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-center", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-right", children: "Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-right", children: "Amount" })
            ] }),
            viewingSaleItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "grid grid-cols-[1fr_50px_80px_80px] gap-2 py-2 items-center",
                  idx < viewingSaleItems.length - 1 && "border-b border-border/20"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate", children: item.product?.name || getProductName(item.productId) }),
                    item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-mono mt-0.5", children: [
                      "S/N: ",
                      item.serialNumber
                    ] }),
                    item.discountAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-red-400 mt-0.5", children: [
                      "-",
                      formatCurrency(item.discountAmount),
                      " disc."
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-center font-mono tabular-nums text-muted-foreground", children: item.quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-right font-mono tabular-nums text-muted-foreground", children: formatCurrency(item.unitPrice) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-right font-mono tabular-nums font-semibold", children: formatCurrency(item.totalPrice) })
                ]
              },
              item.id
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-lg p-4 space-y-1.5 border border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(viewingSale.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(viewingSale.taxAmount) })
          ] }),
          viewingSale.discountAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono tabular-nums text-red-400", children: [
              "-",
              formatCurrency(viewingSale.discountAmount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-2 !bg-border/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold uppercase tracking-wider", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-lg font-bold font-mono tabular-nums",
              viewingSale.isVoided && "line-through text-muted-foreground"
            ), children: formatCurrency(viewingSale.totalAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums font-medium text-emerald-500", children: formatCurrency(viewingSale.amountPaid) })
          ] }),
          viewingSale.changeGiven > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Change" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(viewingSale.changeGiven) })
          ] })
        ] }) }),
        viewingSale.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-6 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Sale Voided" })
          ] }),
          viewingSale.voidReason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-400/80 mt-1 ml-5", children: viewingSale.voidReason })
        ] }),
        viewingSale.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-6 mb-3 rounded-lg bg-muted/20 border border-border/30 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: viewingSale.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 px-6 py-3 border-t border-border/30 bg-muted/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-8 text-xs", onClick: () => setIsViewDialogOpen(false), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "h-8 text-xs gap-1.5",
              disabled: !!viewingSale && printingSaleIds.has(viewingSale.id),
              onClick: () => handlePrintReceipt(viewingSale),
              children: viewingSale && printingSaleIds.has(viewingSale.id) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                "Saving PDF…"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3 w-3" }),
                "Print Receipt"
              ] })
            }
          )
        ] })
      ] })
    ] }) }),
    reversalTargetSale && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTargetSale(null);
        },
        entityType: "sale",
        entityId: reversalTargetSale.id,
        entityLabel: `Sale #${reversalTargetSale.invoiceNumber}`,
        branchId: reversalTargetSale.branchId,
        onSuccess: fetchData
      }
    ),
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
