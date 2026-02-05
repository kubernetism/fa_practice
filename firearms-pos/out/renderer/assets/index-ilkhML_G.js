import { o as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, J as Plus, C as Card, b as CardHeader, c as CardTitle, e as CardContent, D as DollarSign, ac as formatCurrency, I as Input, M as Clock, ai as formatDateTime, ag as FileText, U as User, ak as truncate, g as Eye, Q as Trash2, aj as ChevronRight, Z as Dialog, _ as DialogContent, $ as DialogHeader, a0 as DialogTitle, a1 as DialogDescription, L as Label, a6 as Select, a7 as SelectTrigger, a8 as SelectValue, a9 as SelectContent, aa as SelectItem, X, ah as Textarea, a2 as DialogFooter, V as Separator, K as Badge, O as CircleAlert } from "./index-C398NcWn.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QGB5rINX.js";
import { R as RotateCcw } from "./rotate-ccw-B6aNkKPg.js";
import { C as Calendar } from "./calendar-BtfAT_Wn.js";
import { S as Search } from "./search-CmgvIclU.js";
import { C as ChevronLeft } from "./chevron-left-DifjAVgD.js";
const RETURN_TYPES = [
  { value: "refund", label: "Refund" },
  { value: "exchange", label: "Exchange" },
  { value: "store_credit", label: "Store Credit" }
];
const REFUND_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "store_credit", label: "Store Credit" }
];
const ITEM_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" }
];
const COMMON_REASONS = [
  "Defective product",
  "Customer request",
  "Wrong item delivered",
  "Quality issue",
  "Changed mind",
  "Does not match description"
];
const ITEMS_PER_PAGE = 10;
function ReturnsScreen() {
  const { currentBranch, branches } = useBranch();
  const [returns, setReturns] = reactExports.useState([]);
  const [sales, setSales] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [customers, setCustomers] = reactExports.useState([]);
  const [users, setUsers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = reactExports.useState(false);
  const [selectedSaleId, setSelectedSaleId] = reactExports.useState("");
  const [selectedSale, setSelectedSale] = reactExports.useState(null);
  const [saleItems, setSaleItems] = reactExports.useState([]);
  const [returnItems, setReturnItems] = reactExports.useState([]);
  const [returnType, setReturnType] = reactExports.useState("refund");
  const [refundMethod, setRefundMethod] = reactExports.useState("cash");
  const [reason, setReason] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [isLoadingSaleDetails, setIsLoadingSaleDetails] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [viewingReturn, setViewingReturn] = reactExports.useState(null);
  const [viewingItems, setViewingItems] = reactExports.useState([]);
  const [viewingCustomer, setViewingCustomer] = reactExports.useState(null);
  const [viewingSale, setViewingSale] = reactExports.useState(null);
  const [isLoadingReturnDetails, setIsLoadingReturnDetails] = reactExports.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const [deletingReturn, setDeletingReturn] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [summary, setSummary] = reactExports.useState({
    totalReturns: 0,
    totalRefunded: 0,
    todayReturns: 0,
    todayRefunded: 0
  });
  const fetchData = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const [returnsResult, salesResult, productsResult, customersResult, usersResult] = await Promise.all([
        window.api.returns.getAll({ limit: 1e3, branchId: currentBranch.id }),
        window.api.sales.getAll({ limit: 1e3, branchId: currentBranch.id }),
        window.api.products.getAll({ limit: 1e3 }),
        window.api.customers.getAll({ limit: 1e3 }),
        window.api.users.getAll({ limit: 1e3 })
      ]);
      if (returnsResult.success && returnsResult.data) {
        setReturns(returnsResult.data);
        calculateSummary(returnsResult.data);
      }
      if (salesResult.success && salesResult.data) {
        setSales(salesResult.data.filter((s) => !s.isVoided && s.branchId === currentBranch.id));
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
  }, [currentBranch]);
  reactExports.useEffect(() => {
    if (currentBranch) {
      fetchData();
    }
  }, [fetchData, currentBranch]);
  const calculateSummary = (returnsData) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayReturnsData = returnsData.filter((r) => r.returnDate?.startsWith(today));
    setSummary({
      totalReturns: returnsData.length,
      totalRefunded: returnsData.reduce((sum, r) => sum + (r.refundAmount || 0), 0),
      todayReturns: todayReturnsData.length,
      todayRefunded: todayReturnsData.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
    });
  };
  const getCustomerName = (customerId) => {
    if (!customerId) return "Walk-in Customer";
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return "Unknown";
    return `${customer.firstName} ${customer.lastName}`.trim();
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
  const getSaleInvoice = (saleId) => {
    const sale = sales.find((s) => s.id === saleId);
    return sale?.invoiceNumber || "Unknown";
  };
  const getReturnTypeBadge = (type) => {
    switch (type) {
      case "refund":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", children: "Refund" });
      case "exchange":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Exchange" });
      case "store_credit":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Store Credit" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: type });
    }
  };
  const getConditionBadge = (condition) => {
    switch (condition) {
      case "new":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "New" });
      case "good":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", children: "Good" });
      case "fair":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "warning", children: "Fair" });
      case "damaged":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Damaged" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: condition });
    }
  };
  const filteredReturns = reactExports.useMemo(() => {
    return returns.filter((ret) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = ret.returnNumber.toLowerCase().includes(search) || getSaleInvoice(ret.originalSaleId).toLowerCase().includes(search) || getCustomerName(ret.customerId).toLowerCase().includes(search) || getUserName(ret.userId).toLowerCase().includes(search) || (ret.reason || "").toLowerCase().includes(search);
      return matchesSearch;
    });
  }, [returns, searchTerm, sales, customers, users]);
  const sortedReturns = reactExports.useMemo(() => {
    return [...filteredReturns].sort(
      (a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
    );
  }, [filteredReturns]);
  const totalPages = Math.ceil(sortedReturns.length / ITEMS_PER_PAGE) || 1;
  const paginatedReturns = sortedReturns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const handleSelectSale = async (saleId) => {
    setSelectedSaleId(saleId);
    if (!saleId) {
      setSelectedSale(null);
      setSaleItems([]);
      setReturnItems([]);
      return;
    }
    try {
      setIsLoadingSaleDetails(true);
      const result = await window.api.sales.getById(parseInt(saleId));
      if (result.success && result.data) {
        setSelectedSale(result.data);
        setSaleItems(result.data.items || []);
        setReturnItems([]);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setIsLoadingSaleDetails(false);
    }
  };
  const addItemToReturn = (saleItem) => {
    if (returnItems.some((ri) => ri.saleItem.id === saleItem.id)) {
      return;
    }
    setReturnItems((prev) => [
      ...prev,
      {
        saleItem,
        returnQty: saleItem.quantity,
        refundAmount: saleItem.unitPrice * saleItem.quantity,
        condition: "good",
        restockable: true
      }
    ]);
  };
  const updateReturnItem = (saleItemId, field, value) => {
    setReturnItems(
      (prev) => prev.map((item) => {
        if (item.saleItem.id === saleItemId) {
          const updated = { ...item, [field]: value };
          if (field === "returnQty") {
            updated.refundAmount = item.saleItem.unitPrice * value;
          }
          return updated;
        }
        return item;
      })
    );
  };
  const removeReturnItem = (saleItemId) => {
    setReturnItems((prev) => prev.filter((item) => item.saleItem.id !== saleItemId));
  };
  const calculateTotalRefund = () => {
    return returnItems.reduce((sum, item) => sum + item.refundAmount, 0);
  };
  const resetProcessDialog = () => {
    setSelectedSaleId("");
    setSelectedSale(null);
    setSaleItems([]);
    setReturnItems([]);
    setReturnType("refund");
    setRefundMethod("cash");
    setReason("");
    setNotes("");
  };
  const handleSubmitReturn = async () => {
    if (!selectedSale || returnItems.length === 0) {
      return;
    }
    try {
      setIsSubmitting(true);
      const returnData = {
        originalSaleId: selectedSale.id,
        customerId: selectedSale.customerId,
        branchId: currentBranch?.id || selectedSale.branchId,
        returnType,
        refundMethod: returnType === "refund" ? refundMethod : void 0,
        reason: reason || void 0,
        notes: notes || void 0,
        items: returnItems.map((item) => ({
          saleItemId: item.saleItem.id,
          productId: item.saleItem.productId,
          quantity: item.returnQty,
          unitPrice: item.saleItem.unitPrice,
          serialNumber: item.saleItem.serialNumber,
          condition: item.condition,
          restockable: item.restockable
        }))
      };
      const result = await window.api.returns.create(returnData);
      if (result.success) {
        setIsProcessDialogOpen(false);
        resetProcessDialog();
        fetchData();
      } else {
        alert(result.message || "Failed to process return");
      }
    } catch (error) {
      console.error("Error processing return:", error);
      alert("An error occurred while processing the return");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleViewReturn = async (ret) => {
    try {
      setViewingReturn(ret);
      setIsViewDialogOpen(true);
      setIsLoadingReturnDetails(true);
      const result = await window.api.returns.getById(ret.id);
      if (result.success && result.data) {
        setViewingItems(result.data.items || []);
        setViewingCustomer(result.data.customer || null);
        setViewingSale(result.data.originalSale || null);
      }
    } catch (error) {
      console.error("Error fetching return details:", error);
    } finally {
      setIsLoadingReturnDetails(false);
    }
  };
  const handleOpenDeleteDialog = (ret) => {
    setDeletingReturn(ret);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteReturn = async () => {
    if (!deletingReturn) return;
    try {
      setIsDeleting(true);
      const result = await window.api.returns.delete(deletingReturn.id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        setDeletingReturn(null);
        fetchData();
      } else {
        alert(result.message || "Failed to delete return");
      }
    } catch (error) {
      console.error("Error deleting return:", error);
      alert("An error occurred while deleting the return");
    } finally {
      setIsDeleting(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading returns..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Returns" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Process and manage product returns from sales ",
          currentBranch && `- ${currentBranch.name}`
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsProcessDialogOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Process Return"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Returns" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.totalReturns.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All time returns" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Refunded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(summary.totalRefunded) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All time refunds" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Returns" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.todayReturns.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Returns today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Refunded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(summary.todayRefunded) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Refunded today" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search by return number, invoice, customer, or reason...",
          value: searchTerm,
          onChange: (e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          },
          className: "pl-9"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: paginatedReturns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mx-auto mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No returns found" }),
      searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: () => setSearchTerm(""), children: "Clear search to see all returns" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Return #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Refund Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Processed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedReturns.map((ret) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: formatDateTime(ret.returnDate) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: ret.returnNumber }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: getSaleInvoice(ret.originalSaleId) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getCustomerName(ret.customerId) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getReturnTypeBadge(ret.returnType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(ret.refundAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getUserName(ret.userId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: ret.reason ? truncate(ret.reason, 30) : "-" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleViewReturn(ret),
              title: "View Details",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleOpenDeleteDialog(ret),
              title: "Delete Return",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] }) })
      ] }, ret.id)) })
    ] }) }) }),
    sortedReturns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        " to",
        " ",
        Math.min(currentPage * ITEMS_PER_PAGE, sortedReturns.length),
        " of ",
        sortedReturns.length,
        " returns"
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isProcessDialogOpen, onOpenChange: (open) => {
      setIsProcessDialogOpen(open);
      if (!open) resetProcessDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-5 w-5" }),
          "Process Return"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Select a sale and the items to return" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "Step 1: Select Sale/Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedSaleId, onValueChange: handleSelectSale, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a sale to process return..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: sales.map((sale) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: sale.id.toString(), children: [
              sale.invoiceNumber,
              " - ",
              formatDateTime(sale.saleDate),
              " - ",
              formatCurrency(sale.totalAmount)
            ] }, sale.id)) })
          ] })
        ] }),
        selectedSale && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "Step 2: Select Items to Return" }),
          isLoadingSaleDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : saleItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-4", children: "No items found in this sale" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Qty Sold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Action" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: saleItems.map((item) => {
              const isAdded = returnItems.some((ri) => ri.saleItem.id === item.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.product?.name || getProductName(item.productId) }),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "S/N: ",
                    item.serialNumber
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.unitPrice) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: isAdded ? "secondary" : "default",
                    disabled: isAdded,
                    onClick: () => addItemToReturn(item),
                    children: isAdded ? "Added" : "Add to Return"
                  }
                ) })
              ] }, item.id);
            }) })
          ] })
        ] }),
        returnItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "Step 3: Configure Return Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Return Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Condition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Restock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Refund Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Remove" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              returnItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.saleItem.product?.name || getProductName(item.saleItem.productId) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 1,
                    max: item.saleItem.quantity,
                    value: item.returnQty,
                    onChange: (e) => updateReturnItem(item.saleItem.id, "returnQty", parseInt(e.target.value) || 1),
                    className: "w-20 text-center"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: item.condition,
                    onValueChange: (value) => updateReturnItem(item.saleItem.id, "condition", value),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ITEM_CONDITIONS.map((cond) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cond.value, children: cond.label }, cond.value)) })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: item.restockable,
                    onChange: (e) => updateReturnItem(item.saleItem.id, "restockable", e.target.checked),
                    className: "h-4 w-4"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 0,
                    step: 0.01,
                    value: item.refundAmount,
                    onChange: (e) => updateReturnItem(item.saleItem.id, "refundAmount", parseFloat(e.target.value) || 0),
                    className: "w-28 text-right"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    onClick: () => removeReturnItem(item.saleItem.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" })
                  }
                ) })
              ] }, item.saleItem.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "text-right font-semibold", children: "Total Refund:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-lg", children: formatCurrency(calculateTotalRefund()) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {})
              ] })
            ] })
          ] })
        ] }),
        returnItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-semibold", children: "Step 4: Return Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Return Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: returnType, onValueChange: (value) => setReturnType(value), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RETURN_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type.value, children: type.label }, type.value)) })
              ] })
            ] }),
            returnType === "refund" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Refund Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: refundMethod, onValueChange: (value) => setRefundMethod(value), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REFUND_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method.value, children: method.label }, method.value)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason for Return" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: COMMON_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: reason === r ? "default" : "outline",
                size: "sm",
                onClick: () => setReason(r),
                children: r
              },
              r
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: reason,
                onChange: (e) => setReason(e.target.value),
                placeholder: "Enter reason for return...",
                rows: 2
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Additional Notes (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "Any additional notes...",
                rows: 2
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setIsProcessDialogOpen(false);
          resetProcessDialog();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSubmitReturn,
            disabled: !selectedSale || returnItems.length === 0 || isSubmitting,
            children: isSubmitting ? "Processing..." : "Process Return"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-5 w-5" }),
          "Return Details"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Return #: ",
          viewingReturn?.returnNumber
        ] })
      ] }),
      viewingReturn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Return Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewingReturn.returnNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDateTime(viewingReturn.returnDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Original Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewingSale?.invoiceNumber || getSaleInvoice(viewingReturn.originalSaleId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingReturn.customerId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Processed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getUserName(viewingReturn.userId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Branch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getBranchName(viewingReturn.branchId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Return Type" }),
            getReturnTypeBadge(viewingReturn.returnType)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Refund Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewingReturn.refundMethod || "-" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-3", children: "Returned Items" }),
          isLoadingReturnDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : viewingItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-4", children: "No items found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Condition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Restocked" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: viewingItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.product?.name || getProductName(item.productId) }),
                item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "S/N: ",
                  item.serialNumber
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getConditionBadge(item.condition) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.restockable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "No" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.totalPrice) })
            ] }, item.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingReturn.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingReturn.taxAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Refund:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingReturn.refundAmount) })
          ] })
        ] }),
        viewingReturn.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: viewingReturn.reason })
          ] })
        ] }),
        viewingReturn.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: viewingReturn.notes })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5" }),
          "Delete Return"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Are you sure you want to delete this return? This will reverse the inventory changes." })
      ] }),
      deletingReturn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: deletingReturn.returnNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          formatDateTime(deletingReturn.returnDate),
          " - ",
          formatCurrency(deletingReturn.refundAmount)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsDeleteDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: handleDeleteReturn,
            disabled: isDeleting,
            children: isDeleting ? "Deleting..." : "Delete Return"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ReturnsScreen
};
