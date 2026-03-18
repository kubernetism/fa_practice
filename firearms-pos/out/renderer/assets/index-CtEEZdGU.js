import { t as useBranch, a as useAuth, r as reactExports, j as jsxRuntimeExports, b2 as BookOpen, B as Button, ak as FileText, C as Card, b as CardHeader, c as CardTitle, e as CardContent, L as Label, I as Input, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, y as Tabs, z as TabsList, A as TabsTrigger, ap as TabsContent, ai as Badge, H as RotateCcw, ad as Dialog, ae as DialogContent, af as DialogHeader, ag as DialogTitle, ah as DialogDescription, aB as CircleX, al as Clock, aA as CircleCheckBig } from "./index-DbkjeiwZ.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CkM8jxla.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-B0zkQiJk.js";
import { D as Download } from "./download-DEHaZV44.js";
import { R as RefreshCw } from "./refresh-cw-CaVc7kGF.js";
import { F as Filter } from "./filter-B4Ogwnei.js";
import "./ban-Zb47Ir8n.js";
import "./triangle-alert-DllYIWRH.js";
import "./circle-check-C0qPMeBQ.js";
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
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
          "Posted"
        ] });
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 mr-1" }),
          "Draft"
        ] });
      case "reversed":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
          "Reversed"
        ] });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: status });
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
  const filteredEntries = entries.filter((entry) => {
    if (activeTab === "all") return true;
    if (activeTab === "posted") return entry.status === "posted";
    if (activeTab === "draft") return entry.status === "draft";
    if (activeTab === "auto") return entry.referenceType !== null;
    if (activeTab === "manual") return entry.referenceType === null;
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-6 w-6" }),
          "Journal Entries"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "View and manage all journal entries and GL transactions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleExportCSV, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleExport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 mr-2" }),
          "Export JSON"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          fetchEntries();
          fetchSummary();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
          "Refresh"
        ] })
      ] })
    ] }),
    summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Entries" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.totalEntries }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            summary.postedEntries,
            " posted, ",
            summary.draftEntries,
            " draft"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Debits" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(summary.totalDebits) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Credits" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(summary.totalCredits) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Balance Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${summary.isBalanced ? "text-green-600" : "text-red-600"}`, children: summary.isBalanced ? "Balanced" : "Unbalanced" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Diff: ",
            formatCurrency(Math.abs(summary.totalDebits - summary.totalCredits))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4" }),
        "Filters"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateRange.startDate,
              onChange: (e) => {
                setDateRange({ ...dateRange, startDate: e.target.value });
                setPage(1);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateRange.endDate,
              onChange: (e) => {
                setDateRange({ ...dateRange, endDate: e.target.value });
                setPage(1);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
            setStatusFilter(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Statuses" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "posted", children: "Posted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reversed", children: "Reversed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: referenceTypeFilter, onValueChange: (v) => {
            setReferenceTypeFilter(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Types" }) }),
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
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", children: [
          "All Entries (",
          total,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "posted", children: "Posted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "draft", children: "Draft" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "auto", children: "Auto-Generated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manual", children: "Manual" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: activeTab, className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading journal entries..." }) : filteredEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No journal entries found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entry #" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Debit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Credit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredEntries.map((entry) => {
            const totalDebit = entry.lines.reduce((sum, l) => sum + l.debitAmount, 0);
            const totalCredit = entry.lines.reduce((sum, l) => sum + l.creditAmount, 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: entry.entryNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "journal_entry", entityId: entry.id })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(entry.entryDate).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate", children: entry.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: getReferenceTypeLabel(entry.referenceType) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStatusBadge(entry.status) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatCurrency(totalDebit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatCurrency(totalCredit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => viewEntryDetail(entry), children: "View" }),
                entry.status !== "reversed" && entry.status !== "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => {
                      setReversalTargetEntry(entry);
                      setIsReversalModalOpen(true);
                    },
                    title: "Request Reversal",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 text-amber-500" })
                  }
                )
              ] }) })
            ] }, entry.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "Showing ",
            (page - 1) * limit + 1,
            " to ",
            Math.min(page * limit, total),
            " of ",
            total,
            " entries"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                disabled: page <= 1,
                onClick: () => setPage(page - 1),
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                disabled: page >= totalPages,
                onClick: () => setPage(page + 1),
                children: "Next"
              }
            )
          ] })
        ] })
      ] }) }) }) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Account Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Account Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Debit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Credit" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            selectedEntry.lines.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: line.account?.accountCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: line.account?.accountName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: line.description || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-" })
            ] }, line.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "font-bold bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-right", children: "Totals:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.debitAmount, 0)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.creditAmount, 0)) })
            ] })
          ] })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  JournalsScreen,
  JournalsScreen as default
};
