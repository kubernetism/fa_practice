import { _ as createLucideIcon, a as useAuth, d as useBranch, j as jsxRuntimeExports, r as reactExports, a3 as FileText, B as Button, x as Clock, U as User, I as Input, L as Label, O as Select, Q as SelectTrigger, V as SelectValue, Y as SelectContent, Z as SelectItem, c as Eye, y as Dialog, z as DialogContent, A as DialogHeader, F as DialogTitle, q as Badge } from "./index-05nZh3Po.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle, c as CardDescription } from "./card-Ceim0feD.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BenRUF_D.js";
import { T as TriangleAlert } from "./triangle-alert-C18C_E5P.js";
import { R as RefreshCw } from "./refresh-cw-CyQX24yY.js";
import { D as Download } from "./download-Cevr8gZ3.js";
import { F as Filter } from "./filter-HdGN7IwZ.js";
import { S as Search } from "./search-7Ey0lto6.js";
import { C as CircleX } from "./circle-x-BXVB-lDn.js";
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
function AuditLogsScreen() {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  if (user?.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-semibold text-lg", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "Admin Only Access" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "You do not have permission to access the audit logs. Only administrators can view system activity logs." })
    ] }) }) });
  }
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: actionInfo?.color || "bg-gray-100", children: actionInfo?.label || action });
  };
  const getEntityBadge = (entityType) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: entityType });
  };
  const getUserDisplay = (log) => {
    if (!log.user) return "System";
    return log.user.fullName || log.user.username || "Unknown";
  };
  const totalPages = Math.ceil(total / limit);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8" }),
          "Activity Logs"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Comprehensive audit trail of all system operations",
          currentBranch && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-medium", children: [
            " - ",
            currentBranch.name
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          fetchLogs();
          fetchStats();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => handleExport("csv"), disabled: isExporting, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => handleExport("json"), disabled: isExporting, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-2" }),
          "Export JSON"
        ] })
      ] })
    ] }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4" }),
          "Total Logs"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: stats.totalLogs.toLocaleString() }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
          "Today's Activity"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.todayLogs.toLocaleString() }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
          "Active Users"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: stats.activeUsers.length }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: stats.criticalEvents.length > 0 ? "border-red-200" : "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          "Critical Events"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${stats.criticalEvents.length > 0 ? "text-red-600" : ""}`, children: stats.criticalEvents.length }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5" }),
          "Filters"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Filter audit logs by various criteria" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search logs by user, action, entity, or description...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-10"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedUser, onValueChange: setSelectedUser, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Users" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Users" }),
                users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id.toString(), children: u.fullName || u.username }, u.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedAction, onValueChange: setSelectedAction, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Actions" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Actions" }),
                ACTIONS.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: action.value, children: action.label }, action.value))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Entity Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedEntityType, onValueChange: setSelectedEntityType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Entities" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Entities" }),
                ENTITY_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: type.charAt(0).toUpperCase() + type.slice(1) }, type))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: startDate,
                onChange: (e) => setStartDate(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: endDate,
                onChange: (e) => setEndDate(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleApplyFilters, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-4 h-4 mr-2" }),
            "Apply Filters"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleResetFilters, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 mr-2" }),
            "Reset"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Audit Logs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
          "Showing ",
          logs.length > 0 ? (page - 1) * limit + 1 : 0,
          " - ",
          Math.min(page * limit, total),
          " of ",
          total.toLocaleString()
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 mb-4 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No audit logs found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Try adjusting your filters" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-48", children: "Date & Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "hidden lg:table-cell", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right w-24", children: "View" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: CRITICAL_ACTIONS.includes(log.auditLog.action) ? "bg-red-50/50" : "",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: new Date(log.auditLog.createdAt).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: getUserDisplay(log) }),
                  log.user?.role && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground capitalize", children: log.user.role })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getActionBadge(log.auditLog.action) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                getEntityBadge(log.auditLog.entityType),
                log.auditLog.entityId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "#",
                  log.auditLog.entityId
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "hidden lg:table-cell max-w-xs truncate", children: log.auditLog.description || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => handleViewDetails(log),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                }
              ) })
            ]
          },
          log.auditLog.id
        )) })
      ] }) })
    ] }),
    logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Page ",
        page,
        " of ",
        totalPages || 1
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: page === 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
            disabled: page >= totalPages,
            children: "Next"
          }
        )
      ] })
    ] }),
    stats && stats.activeUsers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5" }),
        "Most Active Users"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: stats.activeUsers.slice(0, 5).map((u, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm", children: idx + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: u.fullName || u.username || "Unknown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            u.count,
            " actions"
          ] })
        ] })
      ] }, u.userId)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDetailOpen, onOpenChange: setIsDetailOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Audit Log Details - #",
        selectedLog?.auditLog.id
      ] }) }),
      selectedLog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Date & Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: new Date(selectedLog.auditLog.createdAt).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: getActionBadge(selectedLog.auditLog.action) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getUserDisplay(selectedLog) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: selectedLog.user?.role || "System" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Entity Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: getEntityBadge(selectedLog.auditLog.entityType) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Entity ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: selectedLog.auditLog.entityId || "N/A" })
          ] })
        ] }),
        selectedLog.auditLog.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: selectedLog.auditLog.description })
        ] }),
        selectedLog.auditLog.oldValues && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Old Values" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto", children: JSON.stringify(selectedLog.auditLog.oldValues, null, 2) })
        ] }),
        selectedLog.auditLog.newValues && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "New Values" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto", children: JSON.stringify(selectedLog.auditLog.newValues, null, 2) })
        ] }),
        selectedLog.auditLog.oldValues && selectedLog.auditLog.newValues && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs", children: "Changes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: Object.keys(selectedLog.auditLog.newValues).map((key) => {
            const oldVal = selectedLog.auditLog.oldValues?.[key];
            const newVal = selectedLog.auditLog.newValues?.[key];
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-muted-foreground w-32 truncate", children: [
                  key,
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-red-500", children: String(oldVal ?? "") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "→" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: String(newVal ?? "") })
              ] }, key);
            }
            return null;
          }) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AuditLogsScreen
};
