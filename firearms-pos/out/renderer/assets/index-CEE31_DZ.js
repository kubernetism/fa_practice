import { h as createLucideIcon, a as useAuth, r as reactExports, j as jsxRuntimeExports, C as Card, e as CardContent, b3 as ArrowLeftRight, B as Button, b as CardHeader, c as CardTitle, O as Clock, d as CardDescription, L as Label, a7 as Select, a8 as SelectTrigger, a9 as SelectValue, aa as SelectContent, ab as SelectItem, ag as CircleX, z as RotateCcw, M as Badge, _ as Dialog, $ as DialogContent, a0 as DialogHeader, a1 as DialogTitle, a2 as DialogDescription, a3 as DialogFooter, ai as Textarea } from "./index-DxR6cCU2.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-C3AcTxE3.js";
import { T as TriangleAlert } from "./triangle-alert-xDHgCuQv.js";
import { R as RefreshCw } from "./refresh-cw-RpoxIo7D.js";
import { C as CircleCheck } from "./circle-check-CXCvS3is.js";
import { B as Ban } from "./ban-BHgk15JE.js";
import { F as Filter } from "./filter-Czak_jES.js";
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
const ENTITY_TYPE_LABELS = {
  sale: "Sale",
  purchase: "Purchase",
  expense: "Expense",
  journal_entry: "Journal Entry",
  ar_payment: "AR Payment",
  ap_payment: "AP Payment",
  stock_adjustment: "Stock Adjustment",
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
    urgent: { label: "Urgent", className: "bg-red-600 text-white border-transparent" },
    high: { label: "High", className: "bg-orange-500 text-white border-transparent" },
    medium: { label: "Medium", className: "bg-yellow-500 text-black border-transparent" },
    low: { label: "Low", className: "bg-zinc-500 text-white border-transparent" }
  };
  const cfg = map[priority] ?? { label: priority, className: "bg-zinc-500 text-white border-transparent" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cfg.className, children: cfg.label });
}
function getStatusBadge(status) {
  const map = {
    pending: { label: "Pending", className: "bg-yellow-500 text-black border-transparent" },
    approved: { label: "Approved", className: "bg-blue-500 text-white border-transparent" },
    completed: { label: "Completed", className: "bg-green-600 text-white border-transparent" },
    failed: { label: "Failed", className: "bg-red-600 text-white border-transparent" },
    rejected: { label: "Rejected", className: "bg-zinc-500 text-white border-transparent" }
  };
  const cfg = map[status] ?? { label: status, className: "bg-zinc-500 text-white border-transparent" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cfg.className, children: cfg.label });
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
        ". Please provide a reason so the requester understands."
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
          rows: 4
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
        "? This will re-attempt the reversal execution."
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
  const applyFilters = () => {
    fetchRequests(1);
    fetchStats();
  };
  const clearFilters = () => {
    setFilterStatus("all");
    setFilterEntityType("all");
    setFilterPriority("all");
  };
  reactExports.useEffect(() => {
    fetchRequests(1);
  }, [filterStatus, filterEntityType, filterPriority]);
  const handleRefresh = () => {
    fetchStats();
    fetchRequests(pagination.page);
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
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };
  const truncate = (str, maxLen) => str.length <= maxLen ? str : `${str.slice(0, maxLen)}…`;
  const getUserDisplay = (u) => {
    if (!u) return "-";
    return u.fullName || u.username;
  };
  const hasActiveFilters = filterStatus !== "all" || filterEntityType !== "all" || filterPriority !== "all";
  if (user?.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-semibold text-lg", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "Admin Only Access" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "You do not have permission to access the reversal dashboard. Only administrators can review and action reversal requests." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-8 h-8" }),
          "Reversal Requests"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Review and action transaction reversal requests" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleRefresh, disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-yellow-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-yellow-500" }),
          "Pending"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-yellow-500", children: getStatusCount(stats, "pending").toLocaleString() }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-green-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-500" }),
          "Completed"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-500", children: getStatusCount(stats, "completed").toLocaleString() }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-red-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileX, { className: "w-4 h-4 text-red-500" }),
          "Failed"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-500", children: getStatusCount(stats, "failed").toLocaleString() }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-zinc-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-4 h-4 text-zinc-400" }),
          "Rejected"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-zinc-400", children: getStatusCount(stats, "rejected").toLocaleString() }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5" }),
          "Filters"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Narrow the list by status, entity type, or priority" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-[160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Statuses" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
              STATUS_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-[180px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Entity Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterEntityType, onValueChange: setFilterEntityType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Types" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
              ENTITY_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: ENTITY_TYPE_LABELS[type] }, type))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-[160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterPriority, onValueChange: setFilterPriority, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Priorities" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Priorities" }),
              PRIORITY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-[1.625rem]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: applyFilters, disabled: isLoading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-4 h-4 mr-2" }),
            "Apply"
          ] }),
          hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: clearFilters, disabled: isLoading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 mr-2" }),
            "Clear"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground", children: pagination.total > 0 ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
          pagination.page * pagination.limit,
          pagination.total
        )} of ${pagination.total.toLocaleString()}` : "0 results" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-12 h-12 mb-4 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No reversal requests found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Try adjusting your filters" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-40", children: "Request #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entity Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "max-w-xs", children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Requested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-44", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right w-36", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: requests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs font-semibold", children: req.requestNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: ENTITY_TYPE_LABELS[req.entityType] ?? req.entityType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: req.reason, children: truncate(req.reason, 50) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getPriorityBadge(req.priority) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStatusBadge(req.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: getUserDisplay(req.requestedByUser) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-muted-foreground", children: formatDate(req.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            req.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: "h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white",
                  onClick: () => openDialog("approve", req),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3 h-3 mr-1" }),
                    "Approve"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "destructive",
                  className: "h-7 px-2 text-xs",
                  onClick: () => openDialog("reject", req),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "w-3 h-3 mr-1" }),
                    "Reject"
                  ]
                }
              )
            ] }),
            req.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: "h-7 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-black",
                onClick: () => openDialog("retry", req),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3 h-3 mr-1" }),
                  "Retry"
                ]
              }
            ),
            req.status !== "pending" && req.status !== "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground px-1", children: "—" })
          ] }) })
        ] }, req.id)) })
      ] }) })
    ] }),
    pagination.totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Page ",
        pagination.page,
        " of ",
        pagination.totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => fetchRequests(pagination.page - 1),
            disabled: pagination.page <= 1 || isLoading,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => fetchRequests(pagination.page + 1),
            disabled: pagination.page >= pagination.totalPages || isLoading,
            children: "Next"
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
  ] });
}
export {
  ReversalsScreen
};
