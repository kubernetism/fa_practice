import { K as useBranch, ae as useCurrentBranchSettings, r as reactExports, j as jsxRuntimeExports, e as LoaderCircle, am as formatCurrency, B as Button, A as Settings, a2 as Percent, a9 as Badge, I as Input, X, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, at as formatDateTime, aq as CircleCheckBig, ab as Clock, d as CircleAlert, C as ChevronRight, a4 as Dialog, a5 as DialogContent, a6 as DialogHeader, a7 as DialogTitle, a8 as DialogDescription, L as Label, ai as DialogFooter } from "./index-CL8d32zf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-m7X2WjZM.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-DI2L3h3I.js";
import { S as Search } from "./search-jVe_1Vq5.js";
import { R as RefreshCw } from "./refresh-cw-Bir9JcXs.js";
import { C as ChevronLeft } from "./chevron-left-Bz89RkGd.js";
const ITEMS_PER_PAGE = 15;
function TaxCollectionsScreen() {
  const { currentBranch } = useBranch();
  const { settings, refreshSettings } = useCurrentBranchSettings();
  const [taxSummary, setTaxSummary] = reactExports.useState(null);
  const [taxRecords, setTaxRecords] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [dateRange, setDateRange] = reactExports.useState({
    startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0],
    endDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [showSettingsDialog, setShowSettingsDialog] = reactExports.useState(false);
  const [taxSettings, setTaxSettings] = reactExports.useState({
    taxRate: 0,
    taxName: "GST",
    secondaryTaxRate: 0,
    secondaryTaxName: null,
    isTaxInclusive: false,
    showTaxOnReceipt: true
  });
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const fetchTaxData = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.taxCollections.getSummary({
        branchId: currentBranch.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      if (response?.success) {
        setTaxSummary(response.data.summary);
        setTaxRecords(response.data.records);
      }
    } catch (error) {
      console.error("Failed to fetch tax data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch, dateRange]);
  reactExports.useEffect(() => {
    if (settings) {
      setTaxSettings({
        taxRate: settings.taxRate ?? 0,
        taxName: settings.taxName ?? "GST",
        secondaryTaxRate: settings.secondaryTaxRate ?? 0,
        secondaryTaxName: settings.secondaryTaxName ?? null,
        isTaxInclusive: settings.isTaxInclusive ?? false,
        showTaxOnReceipt: settings.showTaxOnReceipt ?? true
      });
    }
  }, [settings]);
  reactExports.useEffect(() => {
    fetchTaxData();
  }, [fetchTaxData]);
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const userResponse = await window.api.auth.getCurrentUser();
      if (!userResponse?.success) {
        alert("Failed to get current user");
        return;
      }
      const globalSettings = await window.api.businessSettings.getGlobal();
      if (!globalSettings?.success || !globalSettings.data) {
        alert("Failed to get settings");
        return;
      }
      const response = await window.api.businessSettings.update(
        userResponse.data.id,
        globalSettings.data.settingId,
        {
          taxRate: taxSettings.taxRate,
          taxName: taxSettings.taxName,
          secondaryTaxRate: taxSettings.secondaryTaxRate,
          secondaryTaxName: taxSettings.secondaryTaxName,
          isTaxInclusive: taxSettings.isTaxInclusive,
          showTaxOnReceipt: taxSettings.showTaxOnReceipt
        }
      );
      if (response?.success) {
        await refreshSettings();
        setShowSettingsDialog(false);
        alert("Tax settings updated successfully!");
      } else {
        alert(response?.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  const filteredRecords = reactExports.useMemo(() => {
    return taxRecords.filter((record) => {
      const matchesSearch = record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || record.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [taxRecords, searchTerm, statusFilter]);
  const { totalPages, safePage, pageStart, pageRecords } = reactExports.useMemo(() => {
    const totalPages2 = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
    const safePage2 = Math.min(currentPage, totalPages2);
    const pageStart2 = (safePage2 - 1) * ITEMS_PER_PAGE;
    const pageRecords2 = filteredRecords.slice(pageStart2, pageStart2 + ITEMS_PER_PAGE);
    return { totalPages: totalPages2, safePage: safePage2, pageStart: pageStart2, pageRecords: pageRecords2 };
  }, [filteredRecords, currentPage]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading tax collections..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold leading-tight", children: "Tax Collections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: currentBranch?.name || "Select a branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-green-500" }),
            "Collected: ",
            formatCurrency(taxSummary?.totalCollected || 0)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-yellow-500" }),
            "Pending: ",
            formatCurrency(taxSummary?.totalPending || 0)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            "Total: ",
            formatCurrency((taxSummary?.totalCollected || 0) + (taxSummary?.totalPending || 0))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            "Avg/Sale: ",
            formatCurrency(taxSummary?.averageTaxPerSale || 0)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowSettingsDialog(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-3.5 w-3.5 mr-1.5" }),
        "Tax Settings"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-primary/20 bg-primary/5 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-primary shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
          taxSettings.taxName,
          ": ",
          taxSettings.taxRate,
          "%",
          taxSettings.secondaryTaxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-2", children: [
            "+ ",
            taxSettings.secondaryTaxName || "Secondary",
            ": ",
            taxSettings.secondaryTaxRate,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: taxSettings.isTaxInclusive ? "default" : "secondary",
            className: "text-[10px] px-1.5 py-0",
            children: taxSettings.isTaxInclusive ? "Inclusive" : "Exclusive"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: taxSettings.showTaxOnReceipt ? "default" : "secondary",
            className: "text-[10px] px-1.5 py-0",
            children: taxSettings.showTaxOnReceipt ? "On Receipt" : "Hidden"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by invoice or customer...",
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
            type: "button",
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
            "aria-label": "Clear search",
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: statusFilter,
          onValueChange: (value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-8 w-8 shrink-0",
            onClick: fetchTaxData,
            "aria-label": "Refresh tax data",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right", children: "Subtotal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right", children: "Tax Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: pageRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "h-24 text-center text-sm text-muted-foreground", children: "No tax records found for the selected period" }) }) : pageRecords.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs font-medium", children: record.invoiceNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: formatDateTime(record.saleDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs", children: record.customerName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "Walk-in" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-right tabular-nums", children: formatCurrency(record.subtotal) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-right tabular-nums font-medium text-primary", children: formatCurrency(record.taxAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-right tabular-nums", children: formatCurrency(record.totalAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: record.paymentStatus === "paid" ? "default" : record.paymentStatus === "partial" ? "secondary" : "destructive",
            className: "text-[10px] px-1.5 py-0",
            children: [
              record.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-2.5 w-2.5 mr-0.5" }),
              record.paymentStatus === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5 mr-0.5" }),
              record.paymentStatus === "partial" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-2.5 w-2.5 mr-0.5" }),
              record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)
            ]
          }
        ) })
      ] }, record.id)) })
    ] }) }),
    filteredRecords.length > ITEMS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        pageStart + 1,
        "–",
        Math.min(pageStart + ITEMS_PER_PAGE, filteredRecords.length),
        " of",
        " ",
        filteredRecords.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: safePage <= 1,
            onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
            "aria-label": "Previous page",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1 tabular-nums", children: [
          safePage,
          " / ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: safePage >= totalPages,
            onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
            "aria-label": "Next page",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showSettingsDialog, onOpenChange: setShowSettingsDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tax Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Configure tax rates. Changes will sync with Settings." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxName", children: "Primary Tax Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "taxName",
                value: taxSettings.taxName,
                onChange: (e) => setTaxSettings((prev) => ({ ...prev, taxName: e.target.value })),
                placeholder: "e.g., GST, VAT"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", children: "Tax Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "taxRate",
                type: "number",
                step: "0.01",
                min: "0",
                max: "100",
                value: taxSettings.taxRate,
                onChange: (e) => setTaxSettings((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "secondaryTaxName", children: "Secondary Tax Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "secondaryTaxName",
                value: taxSettings.secondaryTaxName || "",
                onChange: (e) => setTaxSettings((prev) => ({ ...prev, secondaryTaxName: e.target.value || null })),
                placeholder: "Optional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "secondaryTaxRate", children: "Secondary Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "secondaryTaxRate",
                type: "number",
                step: "0.01",
                min: "0",
                max: "100",
                value: taxSettings.secondaryTaxRate,
                onChange: (e) => setTaxSettings((prev) => ({
                  ...prev,
                  secondaryTaxRate: parseFloat(e.target.value) || 0
                }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isTaxInclusive", children: "Tax Inclusive Pricing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "isTaxInclusive",
              type: "checkbox",
              checked: taxSettings.isTaxInclusive,
              onChange: (e) => setTaxSettings((prev) => ({ ...prev, isTaxInclusive: e.target.checked })),
              className: "h-4 w-4"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "showTaxOnReceipt", children: "Show Tax on Receipt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "showTaxOnReceipt",
              type: "checkbox",
              checked: taxSettings.showTaxOnReceipt,
              onChange: (e) => setTaxSettings((prev) => ({ ...prev, showTaxOnReceipt: e.target.checked })),
              className: "h-4 w-4"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowSettingsDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSaveSettings, disabled: isSaving, children: isSaving ? "Saving..." : "Save Changes" })
      ] })
    ] }) })
  ] }) });
}
export {
  TaxCollectionsScreen,
  TaxCollectionsScreen as default
};
