import { c as createLucideIcon, d as useAuth, r as reactExports, j as jsxRuntimeExports, a2 as Card, a3 as CardContent, Y as TooltipProvider, ba as ArrowLeftRight, B as Button, q as RefreshCw, ae as Clock, ac as Badge, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, aw as CircleX, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, U as User, R as RotateCcw, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, al as DialogFooter, L as Label, p as Textarea } from "./index-D_bEN21S.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DcpDDy4l.js";
import { T as TriangleAlert } from "./triangle-alert-CV2AN1O3.js";
import { C as CircleCheck } from "./circle-check-DjEhIWd8.js";
import { B as Ban } from "./ban-CroP4yT9.js";
import { C as Calendar } from "./calendar-eeau3qGW.js";
import { C as ChevronLeft } from "./chevron-left-CsQHKIuE.js";
import { I as Info } from "./info-ZUVcl6Zj.js";
import { S as ShieldAlert } from "./shield-alert-Rc0LwtAN.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FileX = createLucideIcon("FileX", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m14.5 12.5-5 5", key: "b62r18" }],
  ["path", { d: "m9.5 12.5 5 5", key: "1rk7el" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ThumbsDown = createLucideIcon("ThumbsDown", [
  ["path", { d: "M17 14V2", key: "8ymqnk" }],
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ThumbsUp = createLucideIcon("ThumbsUp", [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zap = createLucideIcon("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]);
const ENTITY_TYPE_LABELS = {
  sale: "Sale",
  purchase: "Purchase",
  expense: "Expense",
  journal_entry: "Journal Entry",
  ar_payment: "AR Payment",
  ap_payment: "AP Payment",
  stock_adjustment: "Stock Adj.",
  stock_transfer: "Stock Transfer",
  commission: "Commission",
  return: "Return",
  receivable: "Receivable",
  payable: "Payable"
};
const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS);
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "rejected", label: "Rejected" }
];
const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];
function getPriorityBadge(priority) {
  const map = {
    urgent: { label: "Urgent", className: "bg-red-600/15 text-red-600 dark:text-red-400 border-red-600/20", icon: Zap },
    high: { label: "High", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: ShieldAlert },
    medium: { label: "Medium", className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20", icon: Info },
    low: { label: "Low", className: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20", icon: Info }
  };
  const cfg = map[priority] ?? { label: priority, className: "bg-zinc-500/15 text-zinc-500 border-zinc-500/20", icon: Info };
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
    cfg.label
  ] });
}
function getStatusBadge(status) {
  const map = {
    pending: { label: "Pending", className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20", icon: Clock },
    approved: { label: "Approved", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: ThumbsUp },
    completed: { label: "Completed", className: "bg-green-600/15 text-green-600 dark:text-green-400 border-green-600/20", icon: CircleCheck },
    failed: { label: "Failed", className: "bg-red-600/15 text-red-600 dark:text-red-400 border-red-600/20", icon: FileX },
    rejected: { label: "Rejected", className: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20", icon: Ban }
  };
  const cfg = map[status] ?? { label: status, className: "bg-zinc-500/15 text-zinc-500 border-zinc-500/20", icon: Info };
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
    cfg.label
  ] });
}
function ApproveDialog({ open, isSubmitting, onConfirm, onCancel, requestNumber }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-5 h-5 text-green-500" }),
        "Approve Reversal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Approve reversal request ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: requestNumber }),
        "? This will queue it for execution."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "bg-green-600 hover:bg-green-700 text-white",
          onClick: onConfirm,
          disabled: isSubmitting,
          children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-2" }),
            "Approve"
          ]
        }
      )
    ] })
  ] }) });
}
function RejectDialog({
  open,
  isSubmitting,
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel,
  requestNumber
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "w-5 h-5 text-red-500" }),
        "Reject Reversal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Reject reversal request ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: requestNumber }),
        ". Please provide a reason."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rejection-reason", children: "Rejection Reason *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "rejection-reason",
          value: rejectionReason,
          onChange: (e) => onReasonChange(e.target.value),
          placeholder: "Enter the reason for rejection...",
          rows: 3
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "destructive",
          onClick: onConfirm,
          disabled: isSubmitting || rejectionReason.trim().length === 0,
          children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-4 h-4 mr-2" }),
            "Reject"
          ]
        }
      )
    ] })
  ] }) });
}
function RetryDialog({ open, isSubmitting, onConfirm, onCancel, requestNumber }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5 text-amber-500" }),
        "Retry Reversal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Retry the failed reversal request",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: requestNumber }),
        "?"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "bg-amber-500 hover:bg-amber-600 text-black",
          onClick: onConfirm,
          disabled: isSubmitting,
          children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
            "Retry"
          ]
        }
      )
    ] })
  ] }) });
}
function getStatusCount(stats, status) {
  if (!stats) return 0;
  return stats.byStatus[status] ?? 0;
}
function getTotalCount(stats) {
  if (!stats) return 0;
  return Object.values(stats.byStatus).reduce((a, b) => a + b, 0);
}
function ReversalsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [pagination, setPagination] = reactExports.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [filterEntityType, setFilterEntityType] = reactExports.useState("all");
  const [filterPriority, setFilterPriority] = reactExports.useState("all");
  const [activeDialog, setActiveDialog] = reactExports.useState(null);
  const [selectedRequest, setSelectedRequest] = reactExports.useState(null);
  const [rejectionReason, setRejectionReason] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [expandedRow, setExpandedRow] = reactExports.useState(null);
  const fetchStats = reactExports.useCallback(async () => {
    try {
      const result = await window.api.reversals.stats();
      if (result?.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch reversal stats:", error);
    }
  }, []);
  const fetchRequests = reactExports.useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterEntityType !== "all") params.entityType = filterEntityType;
      if (filterPriority !== "all") params.priority = filterPriority;
      const result = await window.api.reversals.list(params);
      if (result?.success) {
        setRequests(result.data ?? []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reversal requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterEntityType, filterPriority, pagination.limit]);
  reactExports.useEffect(() => {
    fetchStats();
    fetchRequests(1);
  }, []);
  reactExports.useEffect(() => {
    fetchRequests(1);
  }, [filterStatus, filterEntityType, filterPriority]);
  const handleRefresh = () => {
    fetchStats();
    fetchRequests(pagination.page);
  };
  const clearFilters = () => {
    setFilterStatus("all");
    setFilterEntityType("all");
    setFilterPriority("all");
  };
  const openDialog = (kind, req) => {
    setSelectedRequest(req);
    setRejectionReason("");
    setActiveDialog(kind);
  };
  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedRequest(null);
    setRejectionReason("");
  };
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const result = await window.api.reversals.approve(selectedRequest.id);
      if (result?.success) {
        closeDialog();
        handleRefresh();
      } else {
        alert(result?.message ?? "Failed to approve reversal request.");
      }
    } catch (error) {
      console.error("Approve failed:", error);
      alert("Failed to approve reversal request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReject = async () => {
    if (!selectedRequest || rejectionReason.trim().length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await window.api.reversals.reject({
        id: selectedRequest.id,
        rejectionReason: rejectionReason.trim()
      });
      if (result?.success) {
        closeDialog();
        handleRefresh();
      } else {
        alert(result?.message ?? "Failed to reject reversal request.");
      }
    } catch (error) {
      console.error("Reject failed:", error);
      alert("Failed to reject reversal request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRetry = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const result = await window.api.reversals.retry(selectedRequest.id);
      if (result?.success) {
        closeDialog();
        handleRefresh();
      } else {
        alert(result?.message ?? "Failed to retry reversal request.");
      }
    } catch (error) {
      console.error("Retry failed:", error);
      alert("Failed to retry reversal request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return iso;
    }
  };
  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };
  const truncate = (str, maxLen) => str.length <= maxLen ? str : `${str.slice(0, maxLen)}…`;
  const getUserDisplay = (u) => {
    if (!u) return "-";
    return u.fullName || u.username;
  };
  const hasActiveFilters = filterStatus !== "all" || filterEntityType !== "all" || filterPriority !== "all";
  if (user?.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/30 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6 text-destructive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Admin privileges required" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Only administrators can review and action reversal requests." })
    ] }) }) });
  }
  const pendingCount = getStatusCount(stats, "pending");
  const completedCount = getStatusCount(stats, "completed");
  const failedCount = getStatusCount(stats, "failed");
  const rejectedCount = getStatusCount(stats, "rejected");
  const approvedCount = getStatusCount(stats, "approved");
  const totalCount = getTotalCount(stats);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: "Reversal Requests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Review and action transaction reversals" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-3.5 h-3.5 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold mt-1", children: totalCount.toLocaleString() })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-yellow-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 text-yellow-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1", children: pendingCount.toLocaleString() })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3.5 h-3.5 text-blue-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-blue-600 dark:text-blue-400 mt-1", children: approvedCount.toLocaleString() })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-600 dark:text-green-400 mt-1", children: completedCount.toLocaleString() })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileX, { className: "w-3.5 h-3.5 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-red-600 dark:text-red-400 mt-1", children: failedCount.toLocaleString() })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-zinc-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-3.5 h-3.5 text-zinc-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-zinc-500 dark:text-zinc-400 mt-1", children: rejectedCount.toLocaleString() })
      ] }) })
    ] }),
    stats && pendingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Pending by Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: Object.entries(stats.pendingByType).filter(([, count]) => count > 0).sort(([, a], [, b]) => b - a).map(([type, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0 font-mono", children: [
          ENTITY_TYPE_LABELS[type] || type,
          ": ",
          count
        ] }, type)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Pending by Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: Object.entries(stats.pendingByPriority).filter(([, count]) => count > 0).map(([priority, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          getPriorityBadge(priority),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [
            "(",
            count,
            ")"
          ] })
        ] }, priority)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Status:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
            STATUS_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Type:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterEntityType, onValueChange: setFilterEntityType, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[140px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
            ENTITY_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: ENTITY_TYPE_LABELS[type] }, type))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Priority:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPriority, onValueChange: setFilterPriority, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
            PRIORITY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value))
          ] })
        ] })
      ] }),
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "h-8 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5 mr-1" }),
        "Clear"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto text-xs text-muted-foreground", children: pagination.total > 0 ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total.toLocaleString()}` : "0 results" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-10 h-10 mb-3 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "No reversal requests found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Try adjusting your filters" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-32 text-xs", children: "Request #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-40", children: "Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-28", children: "Requested By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-28", children: "Reviewed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-32", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right w-32", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: requests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: "cursor-pointer",
            onClick: () => setExpandedRow(expandedRow === req.id ? null : req.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px] font-semibold py-2", children: req.requestNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0 font-normal", children: ENTITY_TYPE_LABELS[req.entityType] ?? req.entityType }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px] text-muted-foreground py-2", children: req.entityReference ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `ID: ${req.entityId}`, children: req.entityReference }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "#",
                req.entityId
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground py-2 max-w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-default", children: truncate(req.reason, 40) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: req.reason }) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: getPriorityBadge(req.priority) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: getStatusBadge(req.status) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-muted-foreground" }),
                getUserDisplay(req.requestedByUser)
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-2", children: req.reviewedByUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-muted-foreground" }),
                getUserDisplay(req.reviewedByUser)
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(req.createdAt) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/60 ml-4", children: formatTime(req.createdAt) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right py-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                req.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        className: "h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10",
                        onClick: () => openDialog("approve", req),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3.5 h-3.5" })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Approve" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        className: "h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10",
                        onClick: () => openDialog("reject", req),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "w-3.5 h-3.5" })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Reject" })
                  ] })
                ] }),
                req.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      className: "h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10",
                      onClick: () => openDialog("retry", req),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Retry" })
                ] }),
                req.status !== "pending" && req.status !== "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/40 px-1", children: "—" })
              ] }) })
            ]
          },
          req.id
        ),
        expandedRow === req.id && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 10, className: "py-2 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Full Reason:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5", children: req.reason })
          ] }),
          req.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Rejection Reason:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-red-600 dark:text-red-400", children: req.rejectionReason })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium", children: "Last Updated:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5", children: [
              formatDate(req.updatedAt),
              " at ",
              formatTime(req.updatedAt)
            ] })
          ] })
        ] }) }) }, `${req.id}-detail`)
      ] })) })
    ] }) }) }) }),
    pagination.totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Page ",
        pagination.page,
        " of ",
        pagination.totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-7 w-7 p-0",
            onClick: () => fetchRequests(pagination.page - 1),
            disabled: pagination.page <= 1 || isLoading,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-7 w-7 p-0",
            onClick: () => fetchRequests(pagination.page + 1),
            disabled: pagination.page >= pagination.totalPages || isLoading,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ApproveDialog,
      {
        open: activeDialog === "approve",
        isSubmitting,
        requestNumber: selectedRequest?.requestNumber ?? "",
        onConfirm: handleApprove,
        onCancel: closeDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RejectDialog,
      {
        open: activeDialog === "reject",
        isSubmitting,
        requestNumber: selectedRequest?.requestNumber ?? "",
        rejectionReason,
        onReasonChange: setRejectionReason,
        onConfirm: handleReject,
        onCancel: closeDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RetryDialog,
      {
        open: activeDialog === "retry",
        isSubmitting,
        requestNumber: selectedRequest?.requestNumber ?? "",
        onConfirm: handleRetry,
        onCancel: closeDialog
      }
    )
  ] }) });
}
export {
  ReversalsScreen
};
