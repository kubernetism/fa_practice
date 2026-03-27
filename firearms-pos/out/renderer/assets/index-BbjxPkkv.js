import { c as createLucideIcon, Q as useBranch, V as useCurrency, d as useAuth, r as reactExports, j as jsxRuntimeExports, Y as TooltipProvider, B as Button, q as RefreshCw, aj as Plus, a2 as Card, a3 as CardContent, ay as Landmark, av as cn, ae as Clock, Z as Tabs, _ as TabsList, ag as CreditCard, F as Truck, ad as FileText, $ as TabsTrigger, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, I as Input, v as Check, ac as Badge, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, X, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, p as Textarea, al as DialogFooter } from "./index-D_bEN21S.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DcpDDy4l.js";
import { C as CircleCheck } from "./circle-check-DjEhIWd8.js";
import { S as Smartphone } from "./smartphone-CWdQjiaX.js";
import { S as Search } from "./search-ByeEpRVi.js";
import { C as ChevronLeft } from "./chevron-left-CsQHKIuE.js";
import { T as TriangleAlert } from "./triangle-alert-CV2AN1O3.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowDownLeft = createLucideIcon("ArrowDownLeft", [
  ["path", { d: "M17 7 7 17", key: "15tmo1" }],
  ["path", { d: "M17 17H7V7", key: "1org7z" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowUpRight = createLucideIcon("ArrowUpRight", [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ellipsis = createLucideIcon("Ellipsis", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
]);
const CHANNELS = [
  { value: "all", label: "All Channels", icon: Ellipsis },
  { value: "bank_transfer", label: "Bank", icon: Landmark },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "cod", label: "COD", icon: Truck },
  { value: "cheque", label: "Cheque", icon: FileText },
  { value: "other", label: "Other", icon: Ellipsis }
];
const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" }
];
function channelLabel(ch) {
  return CHANNELS.find((c) => c.value === ch)?.label || ch;
}
function channelIcon(ch) {
  const found = CHANNELS.find((c) => c.value === ch);
  return found?.icon || Ellipsis;
}
function statusBadge(status) {
  switch (status) {
    case "confirmed":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
        "Confirmed"
      ] });
    case "pending":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "bg-amber-500/15 text-amber-400 border-amber-500/30 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 mr-1" }),
        "Pending"
      ] });
    case "failed":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "bg-red-500/15 text-red-400 border-red-500/30 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3 mr-1" }),
        "Failed"
      ] });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[11px]", children: status });
  }
}
function directionBadge(dir) {
  if (dir === "inflow") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-400 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-3 w-3" }),
      "In"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-red-400 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
    "Out"
  ] });
}
function sourceLabel(sourceType) {
  switch (sourceType) {
    case "sale":
      return "Sale";
    case "receivable_payment":
      return "AR Payment";
    case "payable_payment":
      return "AP Payment";
    case "manual":
      return "Manual";
    default:
      return sourceType;
  }
}
function OnlineTransactionsScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const branchId = currentBranch?.id || 1;
  const [transactions, setTransactions] = reactExports.useState([]);
  const [dashboard, setDashboard] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [activeChannel, setActiveChannel] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [timePeriod, setTimePeriod] = reactExports.useState("today");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [total, setTotal] = reactExports.useState(0);
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [editingTransaction, setEditingTransaction] = reactExports.useState(null);
  const [selectedIds, setSelectedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [form, setForm] = reactExports.useState({
    transactionDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    amount: "",
    paymentChannel: "bank_transfer",
    direction: "inflow",
    referenceNumber: "",
    customerName: "",
    invoiceNumber: "",
    bankAccountName: "",
    status: "pending",
    notes: ""
  });
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const fetchDashboard = reactExports.useCallback(async () => {
    try {
      const result = await window.api.onlineTransactions.getDashboard({
        branchId,
        timePeriod
      });
      if (result.success && result.data) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    }
  }, [branchId, timePeriod]);
  const fetchTransactions = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let startDate = today;
      let endDate = today;
      if (timePeriod === "week") {
        const d = /* @__PURE__ */ new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
      } else if (timePeriod === "month") {
        const d = /* @__PURE__ */ new Date();
        d.setDate(1);
        startDate = d.toISOString().split("T")[0];
      } else if (timePeriod === "year") {
        startDate = `${(/* @__PURE__ */ new Date()).getFullYear()}-01-01`;
      }
      const result = await window.api.onlineTransactions.getAll({
        branchId,
        paymentChannel: activeChannel,
        status: statusFilter,
        startDate,
        endDate,
        search: searchQuery,
        page,
        limit: 25
      });
      if (result.success) {
        setTransactions(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, activeChannel, statusFilter, timePeriod, searchQuery, page]);
  reactExports.useEffect(() => {
    fetchDashboard();
    fetchTransactions();
  }, [fetchDashboard, fetchTransactions]);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
      fetchTransactions();
    }, 3e4);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchTransactions]);
  const dashboardAggregates = reactExports.useMemo(() => {
    if (!dashboard) return { totalInflow: 0, totalOutflow: 0, pendingCount: 0, pendingAmount: 0, confirmedAmount: 0 };
    let totalInflow = 0;
    let totalOutflow = 0;
    for (const ch of dashboard.periodByChannel) {
      if (ch.direction === "inflow") totalInflow += ch.total;
      else totalOutflow += ch.total;
    }
    let pendingCount = 0;
    let pendingAmount = 0;
    let confirmedAmount = 0;
    for (const s of dashboard.statusSummary) {
      if (s.status === "pending") {
        pendingCount = s.count;
        pendingAmount = s.total;
      }
      if (s.status === "confirmed") confirmedAmount = s.total;
    }
    return { totalInflow, totalOutflow, pendingCount, pendingAmount, confirmedAmount };
  }, [dashboard]);
  const channelCards = reactExports.useMemo(() => {
    if (!dashboard) return [];
    const map = {};
    for (const ch of dashboard.todayByChannel) {
      if (!map[ch.paymentChannel]) map[ch.paymentChannel] = { inflow: 0, outflow: 0, pending: 0, confirmed: 0, count: 0 };
      const entry = map[ch.paymentChannel];
      if (ch.direction === "inflow") entry.inflow += ch.total;
      else entry.outflow += ch.total;
      entry.pending += ch.pending;
      entry.confirmed += ch.confirmed;
      entry.count += ch.count;
    }
    return Object.entries(map).map(([channel, data]) => ({ channel, ...data }));
  }, [dashboard]);
  const handleConfirm = async (id) => {
    const result = await window.api.onlineTransactions.confirm(id);
    if (result.success) {
      fetchDashboard();
      fetchTransactions();
    }
  };
  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return;
    const result = await window.api.onlineTransactions.bulkConfirm(Array.from(selectedIds));
    if (result.success) {
      setSelectedIds(/* @__PURE__ */ new Set());
      fetchDashboard();
      fetchTransactions();
    }
  };
  const handleMarkFailed = async (id) => {
    const result = await window.api.onlineTransactions.markFailed(id);
    if (result.success) {
      fetchDashboard();
      fetchTransactions();
    }
  };
  const resetForm = () => {
    setForm({
      transactionDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      amount: "",
      paymentChannel: "bank_transfer",
      direction: "inflow",
      referenceNumber: "",
      customerName: "",
      invoiceNumber: "",
      bankAccountName: "",
      status: "pending",
      notes: ""
    });
  };
  const openCreate = () => {
    resetForm();
    setEditingTransaction(null);
    setShowCreateDialog(true);
  };
  const openEdit = (txn) => {
    setEditingTransaction(txn);
    setForm({
      transactionDate: txn.transactionDate,
      amount: String(txn.amount),
      paymentChannel: txn.paymentChannel,
      direction: txn.direction,
      referenceNumber: txn.referenceNumber || "",
      customerName: txn.customerName || "",
      invoiceNumber: txn.invoiceNumber || "",
      bankAccountName: txn.bankAccountName || "",
      status: txn.status,
      notes: txn.notes || ""
    });
    setShowCreateDialog(true);
  };
  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setIsSaving(true);
    try {
      const payload = {
        branchId,
        transactionDate: form.transactionDate,
        amount: Number(form.amount),
        paymentChannel: form.paymentChannel,
        direction: form.direction,
        referenceNumber: form.referenceNumber || void 0,
        customerName: form.customerName || void 0,
        invoiceNumber: form.invoiceNumber || void 0,
        bankAccountName: form.bankAccountName || void 0,
        status: form.status,
        notes: form.notes || void 0
      };
      let result;
      if (editingTransaction) {
        result = await window.api.onlineTransactions.update(editingTransaction.id, payload);
      } else {
        result = await window.api.onlineTransactions.create(payload);
      }
      if (result.success) {
        setShowCreateDialog(false);
        resetForm();
        fetchDashboard();
        fetchTransactions();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    const pendingIds = transactions.filter((t) => t.status === "pending").map((t) => t.id);
    if (pendingIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedIds(new Set(pendingIds));
    }
  };
  const pendingInView = transactions.filter((t) => t.status === "pending");
  const allPendingSelected = pendingInView.length > 0 && pendingInView.every((t) => selectedIds.has(t.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Online Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Track all non-cash transactions across payment channels" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          fetchDashboard();
          fetchTransactions();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openCreate, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Add Transaction"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: "Inflow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-3.5 w-3.5 text-emerald-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-400 mt-1", children: formatCurrency(dashboardAggregates.totalInflow) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: "Outflow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 text-red-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-red-400 mt-1", children: formatCurrency(dashboardAggregates.totalOutflow) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: "Net" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "h-3.5 w-3.5 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn(
          "text-lg font-bold mt-1",
          dashboardAggregates.totalInflow - dashboardAggregates.totalOutflow >= 0 ? "text-emerald-400" : "text-red-400"
        ), children: formatCurrency(dashboardAggregates.totalInflow - dashboardAggregates.totalOutflow) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Balance" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-amber-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 text-amber-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-amber-400 mt-1", children: formatCurrency(dashboardAggregates.pendingAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
          dashboardAggregates.pendingCount,
          " transactions"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: "Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-400 mt-1", children: formatCurrency(dashboardAggregates.confirmedAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label })
      ] }) })
    ] }),
    channelCards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: channelCards.map((ch) => {
      const Icon = channelIcon(ch.channel);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveChannel(ch.channel),
          className: cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors min-w-[140px]",
            activeChannel === ch.channel ? "border-primary bg-primary/10" : "border-border/50 hover:border-border"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: channelLabel(ch.channel) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                ch.count,
                " txns · ",
                formatCurrency(ch.inflow)
              ] })
            ] })
          ]
        },
        ch.channel
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: activeChannel, onValueChange: (v) => {
        setActiveChannel(v);
        setPage(1);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "h-8", children: CHANNELS.map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: ch.value, className: "text-xs px-2.5 h-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ch.icon, { className: "h-3 w-3 mr-1" }),
        ch.label
      ] }, ch.value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timePeriod, onValueChange: (v) => {
        setTimePeriod(v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px] h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PERIOD_OPTIONS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, className: "text-xs", children: p.label }, p.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[120px] h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", className: "text-xs", children: "All Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", className: "text-xs", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confirmed", className: "text-xs", children: "Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "failed", className: "text-xs", children: "Failed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search...",
            value: searchQuery,
            onChange: (e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            },
            className: "pl-8 h-8 w-[180px] text-xs"
          }
        )
      ] })
    ] }),
    selectedIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", children: [
        selectedIds.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "default", className: "h-6 text-xs", onClick: handleBulkConfirm, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 mr-1" }),
        "Confirm All"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs", onClick: () => setSelectedIds(/* @__PURE__ */ new Set()), children: "Clear" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: allPendingSelected,
            onChange: toggleSelectAll,
            className: "h-3.5 w-3.5 rounded border-border"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Channel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Direction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Customer / Payee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 12, className: "h-24 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Loading..." })
      ] }) }) }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 12, className: "h-24 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No transactions found" }) }) }) : transactions.map((txn) => {
        const Icon = channelIcon(txn.paymentChannel);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn(
          selectedIds.has(txn.id) && "bg-primary/5"
        ), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: txn.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: selectedIds.has(txn.id),
              onChange: () => toggleSelect(txn.id),
              className: "h-3.5 w-3.5 rounded border-border"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: new Date(txn.transactionDate).toLocaleDateString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: channelLabel(txn.paymentChannel) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: directionBadge(txn.direction) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: cn(
            "text-xs font-medium text-right tabular-nums",
            txn.direction === "inflow" ? "text-emerald-400" : "text-red-400"
          ), children: [
            txn.direction === "outflow" ? "-" : "+",
            formatCurrency(txn.amount)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[100px] truncate", children: txn.referenceNumber || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs max-w-[120px] truncate", children: txn.customerName || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: txn.invoiceNumber || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[100px] truncate", children: txn.bankAccountName || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-normal", children: sourceLabel(txn.sourceType) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: statusBadge(txn.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            txn.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6",
                    onClick: () => handleConfirm(txn.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-emerald-400" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "text-xs", children: "Confirm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6",
                    onClick: () => handleMarkFailed(txn.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 text-red-400" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "text-xs", children: "Mark Failed" })
              ] })
            ] }),
            txn.sourceType === "manual" && txn.status !== "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-6 w-6",
                  onClick: () => openEdit(txn),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-3 w-3" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "text-xs", children: "Edit" })
            ] })
          ] }) })
        ] }, txn.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        total,
        " transaction",
        total !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs",
            disabled: page <= 1,
            onClick: () => setPage((p) => p - 1),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3 w-3 mr-1" }),
              "Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Page ",
          page,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs",
            disabled: page >= totalPages,
            onClick: () => setPage((p) => p + 1),
            children: [
              "Next",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 ml-1" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingTransaction ? "Edit Transaction" : "New Online Transaction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingTransaction ? "Update transaction details" : "Manually record a non-cash transaction" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.transactionDate,
                onChange: (e) => setForm({ ...form, transactionDate: e.target.value }),
                className: "h-8 text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0.00",
                value: form.amount,
                onChange: (e) => setForm({ ...form, amount: e.target.value }),
                className: "h-8 text-xs",
                min: "0",
                step: "0.01"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Payment Channel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.paymentChannel,
                onValueChange: (v) => setForm({ ...form, paymentChannel: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CHANNELS.filter((c) => c.value !== "all").map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ch.value, className: "text-xs", children: ch.label }, ch.value)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.direction,
                onValueChange: (v) => setForm({ ...form, direction: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inflow", className: "text-xs", children: "Inflow (Received)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "outflow", className: "text-xs", children: "Outflow (Paid)" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reference / Transaction ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., TXN-12345",
                value: form.referenceNumber,
                onChange: (e) => setForm({ ...form, referenceNumber: e.target.value }),
                className: "h-8 text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., INV-001",
                value: form.invoiceNumber,
                onChange: (e) => setForm({ ...form, invoiceNumber: e.target.value }),
                className: "h-8 text-xs"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Customer / Payee Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Name",
                value: form.customerName,
                onChange: (e) => setForm({ ...form, customerName: e.target.value }),
                className: "h-8 text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Bank / Account Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., HBL Main Account",
                value: form.bankAccountName,
                onChange: (e) => setForm({ ...form, bankAccountName: e.target.value }),
                className: "h-8 text-xs"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Additional details...",
              value: form.notes,
              onChange: (e) => setForm({ ...form, notes: e.target.value }),
              className: "text-xs min-h-[60px]",
              rows: 2
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowCreateDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleSave, disabled: isSaving || !form.amount, children: isSaving ? "Saving..." : editingTransaction ? "Update" : "Create" })
      ] })
    ] }) })
  ] }) });
}
export {
  OnlineTransactionsScreen,
  OnlineTransactionsScreen as default
};
