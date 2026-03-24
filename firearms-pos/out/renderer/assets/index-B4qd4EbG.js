import { Q as useBranch, ag as useCurrentBranchSettings, r as reactExports, ao as formatCurrency, j as jsxRuntimeExports, q as RefreshCw, B as Button, a4 as Percent, Y as Tabs, Z as TabsList, _ as TabsTrigger, ah as TabsContent, av as formatDateTime, I as Input, X, ab as Badge, b as Eye, C as ChevronRight, a6 as Dialog, a7 as DialogContent, a8 as DialogHeader, a9 as DialogTitle, aa as DialogDescription } from "./index-CDYRnHIS.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CGIdUra4.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-Bw1Fy0hR.js";
import { D as Download } from "./download-CSaVmNYc.js";
import { S as Search } from "./search-Dc65EaCk.js";
import { C as ChevronLeft } from "./chevron-left-DeCW3lTQ.js";
const ITEMS_PER_PAGE = 15;
function DiscountManagementScreen() {
  const { currentBranch } = useBranch();
  const { settings } = useCurrentBranchSettings();
  const [discountSummary, setDiscountSummary] = reactExports.useState(null);
  const [discountRecords, setDiscountRecords] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [dateRange, setDateRange] = reactExports.useState({
    startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0],
    endDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const [minDiscountFilter, setMinDiscountFilter] = reactExports.useState("");
  const [selectedRecord, setSelectedRecord] = reactExports.useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const fetchDiscountData = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.discountManagement.getSummary({
        branchId: currentBranch.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      if (response?.success) {
        setDiscountSummary(response.data.summary);
        setDiscountRecords(response.data.records);
      }
    } catch (error) {
      console.error("Failed to fetch discount data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch, dateRange]);
  reactExports.useEffect(() => {
    fetchDiscountData();
  }, [fetchDiscountData]);
  const handleViewDetails = async (record) => {
    try {
      const response = await window.api.discountManagement.getDetails(record.id);
      if (response?.success) {
        setSelectedRecord(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error("Failed to fetch discount details:", error);
    }
  };
  const filteredRecords = reactExports.useMemo(() => {
    return discountRecords.filter((record) => {
      const matchesSearch = record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesMinDiscount = !minDiscountFilter || record.discountAmount >= parseFloat(minDiscountFilter);
      return matchesSearch && matchesMinDiscount;
    });
  }, [discountRecords, searchTerm, minDiscountFilter]);
  const paginationInfo = reactExports.useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    return { totalPages, safeCurrentPage, paginatedRecords };
  }, [filteredRecords, currentPage]);
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minDiscountFilter]);
  const maxDiscountAllowed = settings?.maxDiscountPercentage ?? 50;
  const stats = reactExports.useMemo(() => ({
    totalAmount: formatCurrency(discountSummary?.totalDiscountAmount || 0),
    salesWithDiscount: discountSummary?.salesWithDiscount || 0,
    avgPercent: (discountSummary?.averageDiscountPercent || 0).toFixed(1),
    discountRate: (discountSummary?.discountRate || 0).toFixed(1)
  }), [discountSummary]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-5 w-5 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Discount Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-red-500", children: stats.totalAmount }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-blue-500", children: [
          stats.salesWithDiscount,
          " Sales"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-orange-500", children: [
          "Avg ",
          stats.avgPercent,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-purple-500", children: [
          "Rate ",
          stats.discountRate,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8", onClick: fetchDiscountData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Export"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border p-2.5 border-primary/20 bg-primary/5 flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: settings?.enableDiscounts ? "Discounts Enabled" : "Discounts Disabled" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Max Allowed: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
          maxDiscountAllowed,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Sales with Discount: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          discountSummary?.discountRate.toFixed(1) || 0,
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", className: "h-6 px-2 text-xs", children: "Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "records", className: "h-6 px-2 text-xs", children: "Discount Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "products", className: "h-6 px-2 text-xs", children: "Top Products" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold tracking-wider uppercase", children: "Recent Discounts" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y max-h-[320px] overflow-y-auto", children: [
            discountRecords.slice(0, 10).map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors",
                onClick: () => handleViewDetails(record),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: record.invoiceNumber }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                      record.customerName || "Walk-in",
                      " · ",
                      formatDateTime(record.saleDate)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-red-500", children: [
                      "-",
                      formatCurrency(record.discountAmount)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                      record.discountPercent.toFixed(1),
                      "% off"
                    ] })
                  ] })
                ]
              },
              record.id
            )),
            discountRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-6 text-sm", children: "No discounts found for the selected period" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold tracking-wider uppercase", children: "Most Discounted Products" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y max-h-[320px] overflow-y-auto", children: [
            discountSummary?.topDiscountedProducts?.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between px-3 py-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold", children: index + 1 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: product.productName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                        product.count,
                        " times discounted"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-red-500", children: [
                    "-",
                    formatCurrency(product.discountAmount)
                  ] })
                ]
              },
              index
            )),
            (!discountSummary?.topDiscountedProducts || discountSummary.topDiscountedProducts.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-6 text-sm", children: "No product discount data available" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "records", className: "mt-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search by invoice or customer...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "h-8 pl-8 pr-8 text-sm"
              }
            ),
            searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setSearchTerm(""),
                className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateRange.startDate,
              onChange: (e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value })),
              className: "h-8 w-[140px] text-sm"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateRange.endDate,
              onChange: (e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value })),
              className: "h-8 w-[140px] text-sm"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "Min discount",
              value: minDiscountFilter,
              onChange: (e) => setMinDiscountFilter(e.target.value),
              className: "h-8 w-[120px] text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Final" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase w-[40px]" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginationInfo.paginatedRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "text-center py-6 text-sm text-muted-foreground", children: "No discount records found" }) }) : paginationInfo.paginatedRecords.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-sm font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: record.isFullyReturned ? "line-through opacity-50" : "", children: record.invoiceNumber }),
              record.isFullyReturned && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1.5 text-[9px] px-1 py-0 text-orange-500 border-orange-500/30", children: "Returned" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: formatDateTime(record.saleDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: record.customerName || "Walk-in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-right", children: formatCurrency(record.subtotal) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-sm text-right font-medium text-red-500", children: [
              "-",
              formatCurrency(record.discountAmount)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: record.discountPercent > maxDiscountAllowed ? "destructive" : "secondary",
                className: "text-[10px] px-1.5 py-0",
                children: [
                  record.discountPercent.toFixed(1),
                  "%"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-right font-medium", children: formatCurrency(record.totalAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: record.paymentStatus === "paid" ? "default" : record.paymentStatus === "partial" ? "secondary" : "destructive",
                className: "text-[10px] px-1.5 py-0",
                children: record.paymentStatus
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                  onClick: () => handleViewDetails(record),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View Details" })
            ] }) })
          ] }, record.id)) })
        ] }) }),
        filteredRecords.length > ITEMS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            filteredRecords.length,
            " record",
            filteredRecords.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: paginationInfo.safeCurrentPage <= 1,
                onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", children: [
              paginationInfo.safeCurrentPage,
              " / ",
              paginationInfo.totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: paginationInfo.safeCurrentPage >= paginationInfo.totalPages,
                onClick: () => setCurrentPage((p) => Math.min(paginationInfo.totalPages, p + 1)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "products", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase w-[60px]", children: "Rank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Times Discounted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Total Discount Given" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          discountSummary?.topDiscountedProducts?.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold", children: index + 1 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm font-medium", children: product.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-right", children: product.count }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-sm text-right font-medium text-red-500", children: [
              "-",
              formatCurrency(product.discountAmount)
            ] })
          ] }, index)),
          (!discountSummary?.topDiscountedProducts || discountSummary.topDiscountedProducts.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "text-center py-6 text-sm text-muted-foreground", children: "No product discount data available" }) })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDetailsDialog, onOpenChange: setShowDetailsDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Discount Details - ",
          selectedRecord?.invoiceNumber
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          selectedRecord?.customerName || "Walk-in",
          " · ",
          selectedRecord && formatDateTime(selectedRecord.saleDate)
        ] })
      ] }),
      selectedRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: formatCurrency(selectedRecord.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-red-500", children: [
              "-",
              formatCurrency(selectedRecord.discountAmount),
              " (",
              selectedRecord.discountPercent.toFixed(1),
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Final Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: formatCurrency(selectedRecord.totalAmount) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-2", children: "Discounted Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Discount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: selectedRecord.items?.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(item.unitPrice) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-red-500", children: item.discountAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "-",
                formatCurrency(item.discountAmount),
                " (",
                item.discountPercent,
                "%)"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(item.totalPrice) })
            ] }, index)) })
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  DiscountManagementScreen,
  DiscountManagementScreen as default
};
