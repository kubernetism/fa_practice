import { o as useBranch, F as useCurrentBranchSettings, r as reactExports, j as jsxRuntimeExports, B as Button, S as Settings, C as Card, e as CardContent, z as Percent, K as Badge, b as CardHeader, c as CardTitle, ad as CircleCheckBig, ac as formatCurrency, M as Clock, D as DollarSign, L as Label, I as Input, a6 as Select, a7 as SelectTrigger, a8 as SelectValue, a9 as SelectContent, aa as SelectItem, d as CardDescription, ai as formatDateTime, O as CircleAlert, Z as Dialog, _ as DialogContent, $ as DialogHeader, a0 as DialogTitle, a1 as DialogDescription, a2 as DialogFooter } from "./index-XJV43N9P.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DaTKnOMy.js";
import { R as RefreshCw } from "./refresh-cw-gxlLGUp_.js";
import { T as TrendingUp } from "./trending-up-C9U5PGFv.js";
import { S as Search } from "./search-DIFxaHhC.js";
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
  const filteredRecords = taxRecords.filter((record) => {
    const matchesSearch = record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || record.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading tax collections..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Tax Collections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Track collected and pending taxes • ",
          currentBranch?.name || "Select a branch"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: fetchTaxData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowSettingsDialog(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 mr-2" }),
          "Tax Settings"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-full bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-6 w-6 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Current Tax Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
            taxSettings.taxName,
            ": ",
            taxSettings.taxRate,
            "%",
            taxSettings.secondaryTaxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg ml-2", children: [
              "+ ",
              taxSettings.secondaryTaxName || "Secondary",
              ": ",
              taxSettings.secondaryTaxRate,
              "%"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: taxSettings.isTaxInclusive ? "default" : "secondary", children: taxSettings.isTaxInclusive ? "Tax Inclusive" : "Tax Exclusive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: taxSettings.showTaxOnReceipt ? "default" : "secondary", children: taxSettings.showTaxOnReceipt ? "Shown on Receipt" : "Hidden on Receipt" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(taxSummary?.totalCollected || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "From ",
            taxSummary?.paidSales || 0,
            " paid sales"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-yellow-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-yellow-600", children: formatCurrency(taxSummary?.totalPending || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "From ",
            taxSummary?.pendingSales || 0,
            " pending sales"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Tax Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-blue-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency((taxSummary?.totalCollected || 0) + (taxSummary?.totalPending || 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collected + Pending" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Avg Tax Per Sale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-purple-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(taxSummary?.averageTaxPerSale || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Per transaction" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "search", children: "Search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "search",
              placeholder: "Search by invoice or customer...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "pl-10"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[150px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "startDate",
            type: "date",
            value: dateRange.startDate,
            onChange: (e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[150px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "endDate", children: "End Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "endDate",
            type: "date",
            value: dateRange.endDate,
            onChange: (e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[150px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "status", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Tax Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Showing ",
          filteredRecords.length,
          " of ",
          taxRecords.length,
          " records"
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Tax Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "No tax records found for the selected period" }) }) : filteredRecords.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: record.invoiceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateTime(record.saleDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: record.customerName || "Walk-in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(record.subtotal) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium text-primary", children: formatCurrency(record.taxAmount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(record.totalAmount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: record.paymentStatus === "paid" ? "default" : record.paymentStatus === "partial" ? "secondary" : "destructive",
              children: [
                record.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
                record.paymentStatus === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 mr-1" }),
                record.paymentStatus === "partial" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }),
                record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)
              ]
            }
          ) })
        ] }, record.id)) })
      ] }) })
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
  ] });
}
export {
  TaxCollectionsScreen,
  TaxCollectionsScreen as default
};
