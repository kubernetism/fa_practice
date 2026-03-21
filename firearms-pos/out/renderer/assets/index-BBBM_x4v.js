import { Z as useBranch, a as useAuth, r as reactExports, j as jsxRuntimeExports, B as Button, ae as FileText, L as Label, I as Input, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, $ as Tabs, a0 as TabsList, a1 as TabsTrigger, aj as TabsContent, ac as Badge, c as Eye, R as RotateCcw, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, at as CircleX, af as Clock, ar as CircleCheckBig } from "./index-DpTu8Ooe.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Dw8-jg6a.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-CJ1NiQAn.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-DtfsMPZl.js";
import { D as Download } from "./download-Cb4zuFAK.js";
import { R as RefreshCw } from "./refresh-cw-GmRfphcv.js";
import { C as ChevronLeft } from "./chevron-left-DG8kgKCV.js";
import "./ban-CmACeOwi.js";
import "./triangle-alert-DHvRqNZL.js";
import "./circle-check-BxJnPeRQ.js";
function JournalsScreen() {
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = reactExports.useState("all");
  const [entries, setEntries] = reactExports.useState([]);
  const [summary, setSummary] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [selectedEntry, setSelectedEntry] = reactExports.useState(null);
  const [showDetail, setShowDetail] = reactExports.useState(false);
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTargetEntry, setReversalTargetEntry] = reactExports.useState(null);
  const [dateRange, setDateRange] = reactExports.useState({
    startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0],
    endDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [referenceTypeFilter, setReferenceTypeFilter] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [total, setTotal] = reactExports.useState(0);
  const limit = 20;
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page,
        limit
      };
      if (currentBranch?.id) {
        filters.branchId = currentBranch.id;
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (referenceTypeFilter !== "all") {
        filters.referenceType = referenceTypeFilter;
      }
      const response = await window.api.journal.getAll(filters);
      if (response?.success) {
        setEntries(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSummary = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      if (currentBranch?.id) {
        params.branchId = currentBranch.id;
      }
      const response = await window.api.journal.getSummary(params);
      if (response?.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch journal summary:", error);
    }
  };
  reactExports.useEffect(() => {
    fetchEntries();
    fetchSummary();
  }, [dateRange, statusFilter, referenceTypeFilter, page, currentBranch?.id]);
  const handleExport = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: currentBranch?.id
      };
      const response = await window.api.journal.export(params);
      if (response?.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `journal-entries-${dateRange.startDate}-to-${dateRange.endDate}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export journal entries:", error);
    }
  };
  const handleExportCSV = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: currentBranch?.id
      };
      const response = await window.api.journal.export(params);
      if (response?.success) {
        const entries2 = response.data.entries;
        let csv = "Entry Number,Date,Description,Status,Reference Type,Ref ID,Account Code,Account Name,Debit,Credit,Line Description\n";
        entries2.forEach((entry) => {
          entry.lines.forEach((line) => {
            csv += `"${entry.entryNumber}","${entry.entryDate}","${entry.description}","${entry.status}","${entry.referenceType}","${entry.referenceId || ""}","${line.accountCode}","${line.accountName}",${line.debit},${line.credit},"${line.description || ""}"
`;
          });
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `journal-entries-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export journal entries:", error);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2
    }).format(amount);
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "posted":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-[10px] px-1.5 py-0 bg-green-500/10 text-green-500 border-green-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
          "Posted"
        ] });
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 mr-1" }),
          "Draft"
        ] });
      case "reversed":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-[10px] px-1.5 py-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
          "Reversed"
        ] });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0", children: status });
    }
  };
  const getReferenceTypeLabel = (type) => {
    if (!type) return "Manual";
    const labels = {
      sale: "Sale",
      sale_void: "Sale Void",
      purchase: "Purchase",
      expense: "Expense",
      return: "Return",
      receivable_payment: "AR Payment",
      payable_payment: "AP Payment",
      stock_adjustment: "Stock Adjustment",
      manual: "Manual"
    };
    return labels[type] || type;
  };
  const viewEntryDetail = (entry) => {
    setSelectedEntry(entry);
    setShowDetail(true);
  };
  const filteredEntries = reactExports.useMemo(() => entries.filter((entry) => {
    if (activeTab === "all") return true;
    if (activeTab === "posted") return entry.status === "posted";
    if (activeTab === "draft") return entry.status === "draft";
    if (activeTab === "auto") return entry.referenceType !== null;
    if (activeTab === "manual") return entry.referenceType === null;
    return true;
  }), [entries, activeTab]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Journal Entries" }),
        summary && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            summary.totalEntries,
            " entries"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-blue-500/10 text-blue-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Dr ",
            formatCurrency(summary.totalDebits)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Cr ",
            formatCurrency(summary.totalCredits)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-medium ${summary.isBalanced ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`, children: summary.isBalanced ? "Balanced" : "Unbalanced" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-xs", onClick: handleExportCSV, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
          "CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-xs", onClick: handleExport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" }),
          "JSON"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8 text-xs", onClick: () => {
          fetchEntries();
          fetchSummary();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Refresh"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Start Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            className: "h-8 text-xs w-[140px]",
            value: dateRange.startDate,
            onChange: (e) => {
              setDateRange({ ...dateRange, startDate: e.target.value });
              setPage(1);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "End Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            className: "h-8 text-xs w-[140px]",
            value: dateRange.endDate,
            onChange: (e) => {
              setDateRange({ ...dateRange, endDate: e.target.value });
              setPage(1);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
          setStatusFilter(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Statuses" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "posted", children: "Posted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reversed", children: "Reversed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Reference Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: referenceTypeFilter, onValueChange: (v) => {
          setReferenceTypeFilter(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Types" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sale", children: "Sales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sale_void", children: "Sale Voids" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "purchase", children: "Purchases" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expenses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "return", children: "Returns" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "receivable_payment", children: "AR Payments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "payable_payment", children: "AP Payments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stock_adjustment", children: "Stock Adjustments" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", className: "h-6 px-2 text-xs", children: [
          "All (",
          total,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "posted", className: "h-6 px-2 text-xs", children: "Posted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "draft", className: "h-6 px-2 text-xs", children: "Draft" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "auto", className: "h-6 px-2 text-xs", children: "Auto-Generated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manual", className: "h-6 px-2 text-xs", children: "Manual" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: activeTab, className: "mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "Loading journal entries..." }) : filteredEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "No journal entries found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Entry #" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Debit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Credit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase w-[80px]", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredEntries.map((entry) => {
            const totalDebit = entry.lines.reduce((sum, l) => sum + l.debitAmount, 0);
            const totalCredit = entry.lines.reduce((sum, l) => sum + l.creditAmount, 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: entry.entryNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "journal_entry", entityId: entry.id })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs", children: new Date(entry.entryDate).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs max-w-[200px] truncate", children: entry.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0", children: getReferenceTypeLabel(entry.referenceType) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getStatusBadge(entry.status) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-mono text-xs text-blue-500", children: formatCurrency(totalDebit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-mono text-xs text-green-500", children: formatCurrency(totalCredit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => viewEntryDetail(entry), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View Details" })
                ] }),
                entry.status !== "reversed" && entry.status !== "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-7 w-7",
                      onClick: () => {
                        setReversalTargetEntry(entry);
                        setIsReversalModalOpen(true);
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Request Reversal" })
                ] })
              ] }) })
            ] }, entry.id);
          }) })
        ] }) }),
        !isLoading && filteredEntries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            (page - 1) * limit + 1,
            "-",
            Math.min(page * limit, total),
            " of ",
            total
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              page,
              " / ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: page <= 1,
                onClick: () => setPage(page - 1),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: page >= totalPages,
                onClick: () => setPage(page + 1),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    reversalTargetEntry && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTargetEntry(null);
        },
        entityType: "journal_entry",
        entityId: reversalTargetEntry.id,
        entityLabel: `Journal Entry #${reversalTargetEntry.entryNumber}`,
        branchId: reversalTargetEntry.branchId ?? currentBranch?.id ?? 0,
        onSuccess: () => {
          fetchEntries();
          fetchSummary();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDetail, onOpenChange: setShowDetail, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          "Journal Entry: ",
          selectedEntry?.entryNumber,
          selectedEntry && /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "journal_entry", entityId: selectedEntry.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: selectedEntry?.description })
      ] }),
      selectedEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Date:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: new Date(selectedEntry.entryDate).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Status:" }),
            " ",
            getStatusBadge(selectedEntry.status)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Reference:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              getReferenceTypeLabel(selectedEntry.referenceType),
              selectedEntry.referenceId && ` #${selectedEntry.referenceId}`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Created By:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: selectedEntry.createdByUser?.fullName || "Unknown" })
          ] }),
          selectedEntry.postedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Posted:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              new Date(selectedEntry.postedAt).toLocaleString(),
              " by ",
              selectedEntry.postedByUser?.fullName
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Debit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Credit" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            selectedEntry.lines.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: line.account?.accountCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: line.account?.accountName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: line.description || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-" })
            ] }, line.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "font-bold bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-right text-xs", children: "Totals:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.debitAmount, 0)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.creditAmount, 0)) })
            ] })
          ] })
        ] }) })
      ] })
    ] }) })
  ] }) });
}
export {
  JournalsScreen,
  JournalsScreen as default
};
