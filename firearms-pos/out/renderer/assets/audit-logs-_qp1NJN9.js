import { c as createLucideIcon, d as useAuth, Q as useBranch, r as reactExports, j as jsxRuntimeExports, $ as Card, a0 as CardContent, ac as FileText, B as Button, q as RefreshCw, ad as Clock, U as User, I as Input, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, au as CircleX, b as Eye, C as ChevronRight, a6 as Dialog, a7 as DialogContent, a8 as DialogHeader, a9 as DialogTitle, ab as Badge } from "./index-CDYRnHIS.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CGIdUra4.js";
import { S as ShieldAlert } from "./shield-alert-DwXvFE3G.js";
import { D as Download } from "./download-CSaVmNYc.js";
import { T as TriangleAlert } from "./triangle-alert-6TCUm8pm.js";
import { F as Filter } from "./filter-CZEz4JXO.js";
import { S as Search } from "./search-Dc65EaCk.js";
import { C as Calendar } from "./calendar-0lT48Cxi.js";
import { C as ChevronLeft } from "./chevron-left-DeCW3lTQ.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Activity = createLucideIcon("Activity", [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
]);
const ACTIONS = [
  { value: "create", label: "Create", color: "bg-green-100 text-green-800" },
  { value: "update", label: "Update", color: "bg-blue-100 text-blue-800" },
  { value: "delete", label: "Delete", color: "bg-red-100 text-red-800" },
  { value: "login", label: "Login", color: "bg-purple-100 text-purple-800" },
  { value: "logout", label: "Logout", color: "bg-gray-100 text-gray-800" },
  { value: "void", label: "Void", color: "bg-orange-100 text-orange-800" },
  { value: "refund", label: "Refund", color: "bg-yellow-100 text-yellow-800" },
  { value: "adjustment", label: "Adjustment", color: "bg-indigo-100 text-indigo-800" },
  { value: "transfer", label: "Transfer", color: "bg-cyan-100 text-cyan-800" },
  { value: "export", label: "Export", color: "bg-teal-100 text-teal-800" },
  { value: "view", label: "View", color: "bg-slate-100 text-slate-800" }
];
const ENTITY_TYPES = [
  "user",
  "branch",
  "category",
  "product",
  "inventory",
  "customer",
  "supplier",
  "sale",
  "purchase",
  "return",
  "expense",
  "commission",
  "setting",
  "auth"
];
const CRITICAL_ACTIONS = ["delete", "void", "refund"];
const ACTION_BADGE_STYLES = {
  create: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20",
  update: "bg-blue-500/15 text-blue-500 border border-blue-500/20",
  delete: "bg-red-500/15 text-red-500 border border-red-500/20",
  login: "bg-purple-500/15 text-purple-500 border border-purple-500/20",
  logout: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
  void: "bg-orange-500/15 text-orange-500 border border-orange-500/20",
  refund: "bg-amber-500/15 text-amber-500 border border-amber-500/20",
  adjustment: "bg-indigo-500/15 text-indigo-500 border border-indigo-500/20",
  transfer: "bg-cyan-500/15 text-cyan-500 border border-cyan-500/20",
  export: "bg-teal-500/15 text-teal-500 border border-teal-500/20",
  view: "bg-slate-500/15 text-slate-400 border border-slate-500/20"
};
function AuditLogsScreen() {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  const [logs, setLogs] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [branches, setBranches] = reactExports.useState([]);
  const [users, setUsers] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedUser, setSelectedUser] = reactExports.useState("all");
  const [selectedAction, setSelectedAction] = reactExports.useState("all");
  const [selectedEntityType, setSelectedEntityType] = reactExports.useState("all");
  const [startDate, setStartDate] = reactExports.useState("");
  const [endDate, setEndDate] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [limit] = reactExports.useState(50);
  const [total, setTotal] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isExporting, setIsExporting] = reactExports.useState(false);
  const [selectedLog, setSelectedLog] = reactExports.useState(null);
  const [isDetailOpen, setIsDetailOpen] = reactExports.useState(false);
  const fetchMetadata = reactExports.useCallback(async () => {
    try {
      const [branchesResult, usersResult] = await Promise.all([
        window.api.branches.getAll(),
        window.api.users.getAll({ page: 1, limit: 100 })
      ]);
      if (branchesResult.success && branchesResult.data) {
        setBranches(branchesResult.data);
      }
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.map((u) => ({ id: u.user.id, fullName: u.user.fullName, username: u.user.username })));
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  }, []);
  const fetchLogs = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        sortOrder: "desc"
      };
      if (searchQuery) params.searchQuery = searchQuery;
      if (currentBranch) {
        params.branchId = currentBranch.id;
      }
      if (selectedUser !== "all") params.userId = parseInt(selectedUser);
      if (selectedAction !== "all") params.action = selectedAction;
      if (selectedEntityType !== "all") params.entityType = selectedEntityType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const result = await window.api.audit.getLogs(params);
      if (result.success) {
        setLogs(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, currentBranch, selectedUser, selectedAction, selectedEntityType, startDate, endDate]);
  const fetchStats = reactExports.useCallback(async () => {
    try {
      const params = {};
      if (currentBranch) {
        params.branchId = currentBranch.id;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const result = await window.api.audit.getStats(params);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch audit stats:", error);
    }
  }, [currentBranch, startDate, endDate]);
  reactExports.useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);
  reactExports.useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);
  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
  };
  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs();
    fetchStats();
  };
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedUser("all");
    setSelectedAction("all");
    setSelectedEntityType("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchLogs();
    fetchStats();
  };
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const params = {
        startDate: startDate || "2000-01-01",
        endDate: endDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        format
      };
      if (currentBranch) {
        params.branchId = currentBranch.id;
      }
      if (selectedAction !== "all") params.action = selectedAction;
      if (selectedEntityType !== "all") params.entityType = selectedEntityType;
      if (searchQuery) params.searchQuery = searchQuery;
      const result = await window.api.audit.export(params);
      if (result.success) {
        if (format === "csv") {
          const blob = new Blob([result.data], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `audit-logs-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `audit-logs-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        alert(`${format.toUpperCase()} export completed successfully!`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };
  const getActionBadge = (action) => {
    const actionInfo = ACTIONS.find((a) => a.value === action);
    const styles = ACTION_BADGE_STYLES[action] ?? "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${styles} font-medium text-[11px] px-2 py-0.5 rounded-md`, children: actionInfo?.label || action });
  };
  const getEntityBadge = (entityType) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: "outline",
      className: "font-mono text-[11px] px-2 py-0.5 border-primary/20 text-primary/80 bg-primary/5",
      children: entityType
    }
  );
  const getUserDisplay = (log) => {
    if (!log.user) return "System";
    return log.user.fullName || log.user.username || "Unknown";
  };
  const totalPages = Math.ceil(total / limit);
  if (user?.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/30 bg-red-500/5 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-red-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-6 w-6 text-red-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground font-semibold text-base", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs font-mono uppercase tracking-wider", children: "Admin Only" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "You do not have permission to access the audit logs. Only administrators can view system activity logs." })
    ] }) }) });
  }
  const diffKeys = selectedLog?.auditLog.oldValues && selectedLog?.auditLog.newValues ? Object.keys(selectedLog.auditLog.newValues).filter((key) => {
    const oldVal = selectedLog.auditLog.oldValues[key];
    const newVal = selectedLog.auditLog.newValues[key];
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  }) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4 flex-1 overflow-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight tracking-tight", children: "Activity Logs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-none mt-0.5", children: [
              "Audit trail · all system operations",
              currentBranch && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-medium", children: [
                " — ",
                currentBranch.name
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground",
              onClick: handleRefresh,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
                "Refresh"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "h-8 px-3 text-xs gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5",
              onClick: () => handleExport("csv"),
              disabled: isExporting,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5 text-primary" }),
                "CSV"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "h-8 px-3 text-xs gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5",
              onClick: () => handleExport("json"),
              disabled: isExporting,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 text-primary" }),
                "JSON"
              ]
            }
          )
        ] })
      ] }),
      stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-primary/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium", children: "Total Logs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold leading-tight", children: stats.totalLogs.toLocaleString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-emerald-500/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-emerald-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-emerald-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium", children: "Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold leading-tight text-emerald-500", children: stats.todayLogs.toLocaleString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-blue-500/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-blue-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-blue-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium", children: "Active Users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold leading-tight", children: stats.activeUsers.length })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 rounded-lg border bg-card px-4 py-3 border-l-2 ${stats.criticalEvents.length > 0 ? "border-red-500/30 border-l-red-500/60" : "border-border border-l-zinc-500/30"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-1.5 rounded-md ${stats.criticalEvents.length > 0 ? "bg-red-500/10" : "bg-zinc-500/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: `w-4 h-4 ${stats.criticalEvents.length > 0 ? "text-red-500" : "text-zinc-500"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium", children: "Critical Events" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold leading-tight ${stats.criticalEvents.length > 0 ? "text-red-500" : ""}`, children: stats.criticalEvents.length })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-3.5 h-3.5 text-primary/70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Filters" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-48", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search user, action, description...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-8 h-8 text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedUser, onValueChange: setSelectedUser, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Users" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Users" }),
              users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id.toString(), children: u.fullName || u.username }, u.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedAction, onValueChange: setSelectedAction, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Actions" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Actions" }),
              ACTIONS.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: action.value, children: action.label }, action.value))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedEntityType, onValueChange: setSelectedEntityType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Entities" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Entities" }),
              ENTITY_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: type.charAt(0).toUpperCase() + type.slice(1) }, type))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: startDate,
                onChange: (e) => setStartDate(e.target.value),
                className: "h-8 w-34 text-xs",
                "aria-label": "Start date"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: endDate,
                onChange: (e) => setEndDate(e.target.value),
                className: "h-8 w-34 text-xs",
                "aria-label": "End date"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
              onClick: handleApplyFilters,
              children: "Apply"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-8 px-3 text-xs text-muted-foreground",
              onClick: handleResetFilters,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5 mr-1" }),
                "Reset"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-3.5 h-3.5 text-primary/70" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Audit Logs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: logs.length > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total.toLocaleString()}` : `0 of ${total.toLocaleString()}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-primary/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-muted-foreground", children: "Loading logs..." })
          ] }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-10 h-10 mb-3 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "No audit logs found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-60 mt-0.5", children: "Try adjusting your filters" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "Date & Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "User" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "Action" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "Entity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "hidden lg:table-cell text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right w-16 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2", children: "Details" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: logs.map((log, idx) => {
              const isCritical = CRITICAL_ACTIONS.includes(log.auditLog.action);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableRow,
                {
                  className: [
                    "border-b border-border/50 transition-colors",
                    isCritical ? "bg-red-500/5 border-l-2 border-l-red-500/40 hover:bg-red-500/8" : idx % 2 === 0 ? "bg-transparent hover:bg-muted/40" : "bg-muted/20 hover:bg-muted/40"
                  ].join(" "),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-muted-foreground", children: new Date(log.auditLog.createdAt).toLocaleString(void 0, {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-primary/70" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium leading-tight truncate max-w-28", children: getUserDisplay(log) }),
                        log.user?.role && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground capitalize leading-none mt-0.5", children: log.user.role })
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: getActionBadge(log.auditLog.action) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      getEntityBadge(log.auditLog.entityType),
                      log.auditLog.entityId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground font-mono", children: [
                        "#",
                        log.auditLog.entityId
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "hidden lg:table-cell py-2 max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-xs text-muted-foreground truncate block max-w-64",
                        title: log.auditLog.description ?? "",
                        children: log.auditLog.description || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-30", children: "—" })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        className: "h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary",
                        onClick: () => handleViewDetails(log),
                        "aria-label": "View log details",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" })
                      }
                    ) })
                  ]
                },
                log.auditLog.id
              );
            }) })
          ] }),
          logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Page ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: page }),
              " of",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: totalPages || 1 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "h-7 w-7 p-0 border-border",
                  onClick: () => setPage((p) => Math.max(1, p - 1)),
                  disabled: page === 1,
                  "aria-label": "Previous page",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-3.5 h-3.5" })
                }
              ),
              Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                return startPage + i;
              }).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: p === page ? "default" : "ghost",
                  size: "sm",
                  className: `h-7 w-7 p-0 text-xs ${p === page ? "bg-primary hover:bg-primary/90 text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
                  onClick: () => setPage(p),
                  children: p
                },
                p
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "h-7 w-7 p-0 border-border",
                  onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                  disabled: page >= totalPages,
                  "aria-label": "Next page",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3.5 h-3.5" })
                }
              )
            ] })
          ] })
        ] })
      ] }),
      stats && stats.activeUsers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-primary/70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Most Active Users" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 flex-wrap", children: stats.activeUsers.slice(0, 5).map((u, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border border-border/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary", children: idx + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium leading-tight", children: u.fullName || u.username || "Unknown" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground leading-none mt-0.5", children: [
                  u.count.toLocaleString(),
                  " actions"
                ] })
              ] })
            ]
          },
          u.userId
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDetailOpen, onOpenChange: setIsDetailOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-primary" }) }),
        "Log Details",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground font-normal ml-1", children: [
          "#",
          selectedLog?.auditLog.id
        ] })
      ] }) }),
      selectedLog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 sm:col-span-1 rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1", children: "Date & Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-tight", children: new Date(selectedLog.auditLog.createdAt).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5", children: "Action" }),
            getActionBadge(selectedLog.auditLog.action)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5", children: "Entity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              getEntityBadge(selectedLog.auditLog.entityType),
              selectedLog.auditLog.entityId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground font-mono", children: [
                "#",
                selectedLog.auditLog.entityId
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1", children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: getUserDisplay(selectedLog) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs capitalize", children: selectedLog.user?.role || "System" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1", children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono", children: selectedLog.user?.username || "—" })
          ] })
        ] }),
        selectedLog.auditLog.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/30 border border-border px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", children: selectedLog.auditLog.description })
        ] }),
        diffKeys.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-muted/40 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium", children: [
            "Changes (",
            diffKeys.length,
            " field",
            diffKeys.length !== 1 ? "s" : "",
            ")"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: diffKeys.map((key) => {
            const oldVal = selectedLog.auditLog.oldValues[key];
            const newVal = selectedLog.auditLog.newValues[key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-3 py-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-muted-foreground w-28 shrink-0 truncate pt-0.5", children: key }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-red-500 bg-red-500/8 px-1.5 py-0.5 rounded text-[11px] max-w-32 truncate", children: String(oldVal ?? "") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-[10px]", children: "→" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-500 bg-emerald-500/8 px-1.5 py-0.5 rounded text-[11px] max-w-32 truncate", children: String(newVal ?? "") })
              ] })
            ] }, key);
          }) })
        ] }),
        (selectedLog.auditLog.oldValues || selectedLog.auditLog.newValues) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          selectedLog.auditLog.oldValues && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1", children: "Old Values" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-3 bg-red-500/5 border border-red-500/15 rounded-md text-[11px] overflow-x-auto leading-relaxed max-h-48", children: JSON.stringify(selectedLog.auditLog.oldValues, null, 2) })
          ] }),
          selectedLog.auditLog.newValues && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1", children: "New Values" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-md text-[11px] overflow-x-auto leading-relaxed max-h-48", children: JSON.stringify(selectedLog.auditLog.newValues, null, 2) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AuditLogsScreen
};
