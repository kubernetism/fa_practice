import { d as createLucideIcon, Z as useBranch, r as reactExports, j as jsxRuntimeExports, P as Package, aq as formatCurrency, a2 as DollarSign, as as cn, D as Truck, B as Button, ak as Plus, I as Input, X, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, L as Label, ae as FileText, au as formatDateTime, c as Eye, H as Banknote, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, ag as Separator, ad as ScrollArea, am as DialogFooter, ah as CreditCard, af as Clock, ac as Badge } from "./index-s8JdVLLx.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DQd2rjgS.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-Dpe2KkHg.js";
import { C as Calendar } from "./calendar-DnRohUQv.js";
import { R as RefreshCw } from "./refresh-cw-DImJ1IXQ.js";
import { S as Search } from "./search-D7jY4GnR.js";
import { F as Filter } from "./filter-BxKm8atx.js";
import { C as ChevronLeft } from "./chevron-left-CC1uaXGj.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const PackageCheck = createLucideIcon("PackageCheck", [
  ["path", { d: "m16 16 2 2 4-4", key: "gfu2re" }],
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }]
]);
const ORDER_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "ordered", label: "Ordered" },
  { value: "partial", label: "Partial" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" }
];
const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" }
];
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "pay_later", label: "Pay Later" }
];
const ITEMS_PER_PAGE = 10;
function PurchasesScreen() {
  const { currentBranch, branches } = useBranch();
  const [purchases, setPurchases] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [filterSupplierId, setFilterSupplierId] = reactExports.useState("all");
  const [filterBranchId, setFilterBranchId] = reactExports.useState("all");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = reactExports.useState("all");
  const [filterDateFrom, setFilterDateFrom] = reactExports.useState("");
  const [filterDateTo, setFilterDateTo] = reactExports.useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = reactExports.useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = reactExports.useState("");
  const [selectedBranchId, setSelectedBranchId] = reactExports.useState("");
  const [shippingCost, setShippingCost] = reactExports.useState("0");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [purchaseItems, setPurchaseItems] = reactExports.useState([]);
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [isPayOffDialogOpen, setIsPayOffDialogOpen] = reactExports.useState(false);
  const [payingOffPurchase, setPayingOffPurchase] = reactExports.useState(null);
  const [payOffMethod, setPayOffMethod] = reactExports.useState("cash");
  const [payOffReference, setPayOffReference] = reactExports.useState("");
  const [payOffNotes, setPayOffNotes] = reactExports.useState("");
  const [isPayingOff, setIsPayingOff] = reactExports.useState(false);
  const [selectedProductId, setSelectedProductId] = reactExports.useState("");
  const [itemQuantity, setItemQuantity] = reactExports.useState("1");
  const [itemUnitCost, setItemUnitCost] = reactExports.useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [viewingPurchase, setViewingPurchase] = reactExports.useState(null);
  const [viewingItems, setViewingItems] = reactExports.useState([]);
  const [viewingSupplier, setViewingSupplier] = reactExports.useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = reactExports.useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = reactExports.useState(false);
  const [receivingPurchase, setReceivingPurchase] = reactExports.useState(null);
  const [receivingItems, setReceivingItems] = reactExports.useState([]);
  const [receiveQuantities, setReceiveQuantities] = reactExports.useState({});
  const [isReceiving, setIsReceiving] = reactExports.useState(false);
  const [summary, setSummary] = reactExports.useState({
    totalPurchases: 0,
    totalSpent: 0,
    thisMonthCount: 0,
    thisMonthSpent: 0,
    pendingCount: 0,
    pendingAmount: 0
  });
  const fetchData = reactExports.useCallback(async () => {
    try {
      setIsLoading(true);
      const [purchasesResult, productsResult, suppliersResult] = await Promise.all([
        window.api.purchases.getAll({ limit: 1e3 }),
        window.api.products.getAll({ limit: 1e3, isActive: true }),
        window.api.suppliers.getAll({ limit: 1e3 })
      ]);
      if (purchasesResult.success && purchasesResult.data) {
        setPurchases(purchasesResult.data);
        calculateSummary(purchasesResult.data);
      }
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data);
      }
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data);
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
  const calculateSummary = (purchasesData) => {
    const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const nonCancelled = purchasesData.filter((p) => p.status !== "cancelled");
    const thisMonthPurchases = nonCancelled.filter((p) => p.createdAt?.startsWith(currentMonth));
    const pendingPurchases = nonCancelled.filter((p) => p.status !== "received");
    setSummary({
      totalPurchases: nonCancelled.length,
      totalSpent: nonCancelled.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      thisMonthCount: thisMonthPurchases.length,
      thisMonthSpent: thisMonthPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      pendingCount: pendingPurchases.length,
      pendingAmount: pendingPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    });
  };
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown";
  };
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || "Unknown";
  };
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.code})` : "Unknown";
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Draft" });
      case "ordered":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "info", children: "Ordered" });
      case "partial":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "warning", children: "Partial" });
      case "received":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Received" });
      case "cancelled":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Cancelled" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: status });
    }
  };
  const getPaymentStatusBadge = (status) => {
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
  const filteredPurchases = reactExports.useMemo(() => {
    return purchases.filter((purchase) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = purchase.purchaseOrderNumber.toLowerCase().includes(search) || getSupplierName(purchase.supplierId).toLowerCase().includes(search) || getBranchName(purchase.branchId).toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (filterSupplierId !== "all" && purchase.supplierId !== parseInt(filterSupplierId)) return false;
      if (filterBranchId !== "all" && purchase.branchId !== parseInt(filterBranchId)) return false;
      if (filterStatus !== "all" && purchase.status !== filterStatus) return false;
      if (filterPaymentStatus !== "all" && purchase.paymentStatus !== filterPaymentStatus) return false;
      if (filterDateFrom) {
        const purchaseDate = new Date(purchase.createdAt).toISOString().split("T")[0];
        if (purchaseDate < filterDateFrom) return false;
      }
      if (filterDateTo) {
        const purchaseDate = new Date(purchase.createdAt).toISOString().split("T")[0];
        if (purchaseDate > filterDateTo) return false;
      }
      return true;
    });
  }, [purchases, searchTerm, filterSupplierId, filterBranchId, filterStatus, filterPaymentStatus, filterDateFrom, filterDateTo, suppliers, branches]);
  const sortedPurchases = reactExports.useMemo(() => {
    return [...filteredPurchases].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredPurchases]);
  const totalPages = Math.ceil(sortedPurchases.length / ITEMS_PER_PAGE) || 1;
  const paginatedPurchases = sortedPurchases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const filteredTotalAmount = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const calculateTotal = () => {
    const itemsTotal = purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    return itemsTotal + (parseFloat(shippingCost) || 0);
  };
  const handleAddItem = () => {
    if (!selectedProductId || !itemQuantity || !itemUnitCost) {
      return;
    }
    const productId = parseInt(selectedProductId);
    const exists = purchaseItems.find((item) => item.productId === productId);
    if (exists) {
      alert("Product already added. Remove it first to change quantity.");
      return;
    }
    setPurchaseItems([...purchaseItems, {
      productId,
      quantity: parseInt(itemQuantity),
      unitCost: parseFloat(itemUnitCost)
    }]);
    setSelectedProductId("");
    setItemQuantity("1");
    setItemUnitCost("");
  };
  const handleRemoveItem = (productId) => {
    setPurchaseItems(purchaseItems.filter((item) => item.productId !== productId));
  };
  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      setItemUnitCost(product.costPrice.toString());
    }
  };
  const resetForm = () => {
    setSelectedSupplierId("");
    setSelectedBranchId(currentBranch?.id?.toString() || "");
    setShippingCost("0");
    setExpectedDeliveryDate("");
    setNotes("");
    setPurchaseItems([]);
    setSelectedProductId("");
    setItemQuantity("1");
    setItemUnitCost("");
    setPaymentMethod("cash");
  };
  const handleOpenCreateDialog = () => {
    resetForm();
    setSelectedBranchId(currentBranch?.id?.toString() || "");
    setIsCreateDialogOpen(true);
  };
  const handleCreatePurchase = async () => {
    if (!selectedSupplierId || !selectedBranchId) {
      alert("Please select supplier and branch");
      return;
    }
    if (purchaseItems.length === 0) {
      alert("Please add at least one item");
      return;
    }
    setIsSaving(true);
    try {
      const result = await window.api.purchases.create({
        supplierId: parseInt(selectedSupplierId),
        branchId: parseInt(selectedBranchId),
        items: purchaseItems,
        shippingCost: parseFloat(shippingCost) || 0,
        expectedDeliveryDate: expectedDeliveryDate || void 0,
        notes: notes || void 0,
        paymentMethod
      });
      if (result.success) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        alert(result.message || "Failed to create purchase");
      }
    } catch (error) {
      console.error("Create purchase error:", error);
      alert("An error occurred while creating purchase");
    } finally {
      setIsSaving(false);
    }
  };
  const handleViewPurchase = async (purchase) => {
    try {
      setIsLoadingDetails(true);
      setViewingPurchase(purchase);
      setIsViewDialogOpen(true);
      const result = await window.api.purchases.getById(purchase.id);
      if (result.success && result.data) {
        setViewingItems(result.data.items || []);
        setViewingSupplier(result.data.supplier || null);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };
  const handleOpenReceiveDialog = async (purchase) => {
    try {
      setIsLoadingDetails(true);
      const result = await window.api.purchases.getById(purchase.id);
      if (result.success && result.data) {
        setReceivingPurchase(purchase);
        setReceivingItems(result.data.items || []);
        const quantities = {};
        result.data.items?.forEach((item) => {
          const remaining = item.quantity - item.receivedQuantity;
          quantities[item.id] = remaining > 0 ? remaining.toString() : "0";
        });
        setReceiveQuantities(quantities);
        setIsReceiveDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };
  const handleReceiveItems = async () => {
    if (!receivingPurchase) return;
    const itemsToReceive = Object.entries(receiveQuantities).map(([itemId, qty]) => ({
      itemId: parseInt(itemId),
      receivedQuantity: parseInt(qty) || 0
    })).filter((item) => item.receivedQuantity > 0);
    if (itemsToReceive.length === 0) {
      alert("Please enter quantities to receive");
      return;
    }
    setIsReceiving(true);
    try {
      const result = await window.api.purchases.receive(receivingPurchase.id, itemsToReceive);
      if (result.success) {
        setIsReceiveDialogOpen(false);
        setReceivingPurchase(null);
        setReceivingItems([]);
        setReceiveQuantities({});
        fetchData();
      } else {
        alert(result.message || "Failed to receive items");
      }
    } catch (error) {
      console.error("Receive error:", error);
      alert("An error occurred while receiving items");
    } finally {
      setIsReceiving(false);
    }
  };
  const handleOpenPayOffDialog = (purchase) => {
    setPayingOffPurchase(purchase);
    setPayOffMethod("cash");
    setPayOffReference("");
    setPayOffNotes("");
    setIsPayOffDialogOpen(true);
  };
  const handlePayOffPurchase = async () => {
    if (!payingOffPurchase) return;
    setIsPayingOff(true);
    try {
      const result = await window.api.purchases.payOff(payingOffPurchase.id, {
        paymentMethod: payOffMethod,
        referenceNumber: payOffReference || void 0,
        notes: payOffNotes || void 0
      });
      if (result.success) {
        setIsPayOffDialogOpen(false);
        setPayingOffPurchase(null);
        fetchData();
      } else {
        alert(result.message || "Failed to pay off purchase");
      }
    } catch (error) {
      console.error("Pay off error:", error);
      alert("An error occurred while paying off purchase");
    } finally {
      setIsPayingOff(false);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setFilterSupplierId("all");
    setFilterBranchId("all");
    setFilterStatus("all");
    setFilterPaymentStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setCurrentPage(1);
  };
  const hasActiveFilters = searchTerm || filterSupplierId !== "all" || filterBranchId !== "all" || filterStatus !== "all" || filterPaymentStatus !== "all" || filterDateFrom || filterDateTo;
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5 text-muted-foreground" });
      case "cheque":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" });
      case "pay_later":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3.5 w-3.5 text-muted-foreground" });
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading purchases..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Purchase Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3 text-muted-foreground" }),
          summary.totalPurchases.toLocaleString(),
          " orders"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3 text-muted-foreground" }),
          formatCurrency(summary.totalSpent)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }),
          summary.thisMonthCount,
          " this month",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "·" }),
          formatCurrency(summary.thisMonthSpent)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
          summary.pendingCount > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
        ), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
          summary.pendingCount,
          " pending"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0", onClick: fetchData, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: handleOpenCreateDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
          "New Purchase"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search PO number, supplier, branch...",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 pl-8 pr-8 text-sm"
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterSupplierId, onValueChange: (value) => {
        setFilterSupplierId(value);
        setCurrentPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-40 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Supplier" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Suppliers" }),
          suppliers.map((supplier) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: supplier.id.toString(), children: supplier.name }, supplier.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterBranchId, onValueChange: (value) => {
        setFilterBranchId(value);
        setCurrentPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-36 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "mr-1.5 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Branch" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
          branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: (value) => {
        setFilterStatus(value);
        setCurrentPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
          ORDER_STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: status.value, children: status.label }, status.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPaymentStatus, onValueChange: (value) => {
        setFilterPaymentStatus(value);
        setCurrentPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Payment" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Payment" }),
          PAYMENT_STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: status.value, children: status.label }, status.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "shrink-0 text-xs text-muted-foreground", children: "From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: filterDateFrom,
            onChange: (e) => {
              setFilterDateFrom(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 w-36 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "shrink-0 text-xs text-muted-foreground", children: "To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: filterDateTo,
            onChange: (e) => {
              setFilterDateTo(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 w-36 text-sm"
          }
        )
      ] }),
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "h-8 px-2 text-xs", onClick: clearFilters, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
        "Clear"
      ] })
    ] }),
    paginatedPurchases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto mb-2 h-10 w-10 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No purchases found" }),
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", className: "mt-1 text-xs", onClick: clearFilters, children: "Clear filters to see all purchases" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "PO Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[88px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedPurchases.map((purchase) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: purchase.purchaseOrderNumber })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDateTime(purchase.createdAt) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: getSupplierName(purchase.supplierId) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: getBranchName(purchase.branchId) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: formatCurrency(purchase.totalAmount) }),
          purchase.shippingCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            "+",
            formatCurrency(purchase.shippingCost),
            " ship"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          getPaymentMethodIcon(purchase.paymentMethod),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs capitalize", children: purchase.paymentMethod?.replace("_", " ") || "N/A" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getStatusBadge(purchase.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getPaymentStatusBadge(purchase.paymentStatus) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100",
                onClick: () => handleViewPurchase(purchase),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View Details" })
          ] }),
          purchase.status !== "received" && purchase.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100",
                onClick: () => handleOpenReceiveDialog(purchase),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "h-3.5 w-3.5 text-success" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Receive Items" })
          ] }),
          purchase.paymentStatus === "pending" && purchase.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100",
                onClick: () => handleOpenPayOffDialog(purchase),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5 text-primary" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Pay Off" })
          ] })
        ] }) })
      ] }, purchase.id)) })
    ] }) }),
    sortedPurchases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Showing ",
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        "–",
        Math.min(currentPage * ITEMS_PER_PAGE, sortedPurchases.length),
        " of",
        " ",
        sortedPurchases.length,
        " purchases",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-3 font-medium text-foreground", children: [
          "Total: ",
          formatCurrency(filteredTotalAmount)
        ] })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((p) => p - 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[80px] text-center text-xs text-muted-foreground", children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: currentPage === totalPages,
            onClick: () => setCurrentPage((p) => p + 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }),
          "Create Purchase Order"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Add a new purchase order from a supplier" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedSupplierId, onValueChange: setSelectedSupplierId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((supplier) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: supplier.id.toString(), children: supplier.name }, supplier.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Branch *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranchId, onValueChange: setSelectedBranchId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shipping Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: shippingCost,
                onChange: (e) => setShippingCost(e.target.value),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: expectedDeliveryDate,
                onChange: (e) => setExpectedDeliveryDate(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              placeholder: "Optional notes..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentMethod, onValueChange: setPaymentMethod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select payment method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method.value, children: method.label }, method.value)) })
          ] }),
          paymentMethod === "pay_later" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This will create an account payable entry for tracking" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Add Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedProductId, onValueChange: handleProductSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-60", children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: product.id.toString(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-muted-foreground mr-2", children: product.code }),
                product.name
              ] }, product.id)) }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "1",
                value: itemQuantity,
                onChange: (e) => setItemQuantity(e.target.value),
                placeholder: "Qty"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: itemUnitCost,
                onChange: (e) => setItemUnitCost(e.target.value),
                placeholder: "Unit Cost"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddItem, disabled: !selectedProductId || !itemQuantity || !itemUnitCost, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
          ] }),
          purchaseItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Unit Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: purchaseItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getProductName(item.productId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.unitCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.quantity * item.unitCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => handleRemoveItem(item.productId),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" })
                }
              ) })
            ] }, item.productId)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-64 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Items Subtotal:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(parseFloat(shippingCost) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(calculateTotal()) })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsCreateDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreatePurchase, disabled: isSaving || purchaseItems.length === 0, children: isSaving ? "Creating..." : "Create Purchase" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }),
          "Purchase Order Details"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: viewingPurchase?.purchaseOrderNumber })
      ] }),
      viewingPurchase && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "PO Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewingPurchase.purchaseOrderNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDateTime(viewingPurchase.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier?.name || getSupplierName(viewingPurchase.supplierId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Branch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getBranchName(viewingPurchase.branchId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Order Status" }),
            getStatusBadge(viewingPurchase.status)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewingPurchase.paymentMethod?.replace("_", " ") || "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Payment Status" }),
            getPaymentStatusBadge(viewingPurchase.paymentStatus)
          ] }),
          viewingPurchase.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingPurchase.expectedDeliveryDate })
          ] }),
          viewingPurchase.receivedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Received Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDateTime(viewingPurchase.receivedDate) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-3", children: "Items" }),
          isLoadingDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : viewingItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-4", children: "No items found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Ordered" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Received" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Unit Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: viewingItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.product?.name || getProductName(item.productId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                item.receivedQuantity >= item.quantity ? "text-success" : "text-warning"
              ), children: item.receivedQuantity }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.unitCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.totalCost) })
            ] }, item.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingPurchase.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingPurchase.shippingCost) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(viewingPurchase.totalAmount) })
          ] })
        ] }),
        viewingPurchase.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: viewingPurchase.notes })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Close" }),
        viewingPurchase && viewingPurchase.paymentStatus === "pending" && viewingPurchase.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "secondary",
            onClick: () => {
              setIsViewDialogOpen(false);
              handleOpenPayOffDialog(viewingPurchase);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "mr-2 h-4 w-4" }),
              "Pay Off"
            ]
          }
        ),
        viewingPurchase && viewingPurchase.status !== "received" && viewingPurchase.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setIsViewDialogOpen(false);
          handleOpenReceiveDialog(viewingPurchase);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "mr-2 h-4 w-4" }),
          "Receive Items"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isReceiveDialogOpen, onOpenChange: setIsReceiveDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "h-5 w-5 text-success" }),
          "Receive Items"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Enter quantities received for ",
          receivingPurchase?.purchaseOrderNumber
        ] })
      ] }),
      receivingPurchase && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Ordered" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Already Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Receive Now" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: receivingItems.map((item) => {
            const remaining = item.quantity - item.receivedQuantity;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.product?.name || getProductName(item.productId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.receivedQuantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  max: remaining,
                  value: receiveQuantities[item.id] || "0",
                  onChange: (e) => setReceiveQuantities({
                    ...receiveQuantities,
                    [item.id]: e.target.value
                  }),
                  className: "w-20 mx-auto text-center",
                  disabled: remaining <= 0
                }
              ) })
            ] }, item.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted p-4 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Received items will be automatically added to inventory at the selected branch." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsReceiveDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleReceiveItems, disabled: isReceiving, children: isReceiving ? "Receiving..." : "Confirm Receipt" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isPayOffDialogOpen, onOpenChange: setIsPayOffDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5 text-primary" }),
          "Pay Off Purchase"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Record payment for ",
          payingOffPurchase?.purchaseOrderNumber
        ] })
      ] }),
      payingOffPurchase && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Amount to Pay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(payingOffPurchase.totalAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: payOffMethod, onValueChange: setPayOffMethod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select payment method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cheque", children: "Cheque" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: payOffReference,
              onChange: (e) => setPayOffReference(e.target.value),
              placeholder: payOffMethod === "cheque" ? "Cheque number" : "Transaction reference"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: payOffNotes,
              onChange: (e) => setPayOffNotes(e.target.value),
              placeholder: "Optional notes..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 dark:text-green-300", children: "This will mark the purchase as paid and update the associated payable record." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsPayOffDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handlePayOffPurchase, disabled: isPayingOff, children: isPayingOff ? "Processing..." : "Confirm Payment" })
      ] })
    ] }) })
  ] }) });
}
export {
  PurchasesScreen
};
