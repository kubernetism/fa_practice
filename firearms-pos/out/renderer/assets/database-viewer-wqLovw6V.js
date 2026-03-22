import { d as createLucideIcon, a as useAuth, r as reactExports, j as jsxRuntimeExports, S as Shield, b as Lock, aC as Database, B as Button, e as CircleAlert, ar as CircleCheckBig, I as Input, ac as Badge, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, C as ChevronRight, $ as Tabs, a0 as TabsList, a1 as TabsTrigger, aj as TabsContent, p as Textarea, y as React } from "./index-s8JdVLLx.js";
import { T as Table$1, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DQd2rjgS.js";
import { R as RefreshCw } from "./refresh-cw-DImJ1IXQ.js";
import { S as Search } from "./search-D7jY4GnR.js";
import { C as ChevronLeft } from "./chevron-left-CC1uaXGj.js";
import { P as Play } from "./play-CZkr88vn.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bug = createLucideIcon("Bug", [
  ["path", { d: "m8 2 1.88 1.88", key: "fmnt4t" }],
  ["path", { d: "M14.12 3.88 16 2", key: "qol33r" }],
  ["path", { d: "M9 7.13v-1a3.003 3.003 0 1 1 6 0v1", key: "d7y7pr" }],
  [
    "path",
    {
      d: "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6",
      key: "xs1cw7"
    }
  ],
  ["path", { d: "M12 20v-9", key: "1qisl0" }],
  ["path", { d: "M6.53 9C4.6 8.8 3 7.1 3 5", key: "32zzws" }],
  ["path", { d: "M6 13H2", key: "82j7cp" }],
  ["path", { d: "M3 21c0-2.1 1.7-3.9 3.8-4", key: "4p0ekp" }],
  ["path", { d: "M20.97 5c0 2.1-1.6 3.8-3.5 4", key: "18gb23" }],
  ["path", { d: "M22 13h-4", key: "1jl80f" }],
  ["path", { d: "M17.2 17c2.1.1 3.8 1.9 3.8 4", key: "k3fwyw" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Server = createLucideIcon("Server", [
  ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }],
  ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }],
  ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }],
  ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Table = createLucideIcon("Table", [
  ["path", { d: "M12 3v18", key: "108xh3" }],
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }]
]);
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-red-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-16 h-16 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Something went wrong" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: this.state.error?.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            className: "mt-4",
            onClick: () => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            },
            children: "Refresh Page"
          }
        )
      ] });
    }
    return this.props.children;
  }
}
const PRESET_QUERIES = [
  { label: "users", query: "SELECT * FROM users" },
  { label: "branches", query: "SELECT * FROM branches" },
  { label: "products ×50", query: "SELECT * FROM products LIMIT 50" },
  { label: "customers ×50", query: "SELECT * FROM customers LIMIT 50" },
  { label: "recent sales", query: "SELECT * FROM sales ORDER BY created_at DESC LIMIT 50" },
  { label: "table schemas", query: "SELECT name, sql FROM sqlite_master WHERE type='table'" }
];
function DatabaseViewerScreen() {
  const { user } = useAuth();
  const [tables, setTables] = reactExports.useState([]);
  const [selectedTable, setSelectedTable] = reactExports.useState(null);
  const [tableColumns, setTableColumns] = reactExports.useState([]);
  const [tableData, setTableData] = reactExports.useState(null);
  const [dbInfo, setDbInfo] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [query, setQuery] = reactExports.useState("");
  const [queryResult, setQueryResult] = reactExports.useState(null);
  const [queryError, setQueryError] = reactExports.useState(null);
  const [isExecutingQuery, setIsExecutingQuery] = reactExports.useState(false);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [pageSize, setPageSize] = reactExports.useState(100);
  const [tableSearch, setTableSearch] = reactExports.useState("");
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const loadTables = reactExports.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.api.database.getTables();
      if (result.success) {
        setTables(result.tables || []);
      } else {
        setError(result.error || "Failed to load tables");
      }
    } catch (err) {
      setError("Failed to connect to database");
      console.error("Error loading tables:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const loadDbInfo = reactExports.useCallback(async () => {
    try {
      const result = await window.api.database.getInfo();
      if (result.success) {
        setDbInfo(result.info);
      }
    } catch (err) {
      console.error("Error loading database info:", err);
    }
  }, []);
  const loadTableInfo = reactExports.useCallback(async (tableName) => {
    try {
      const result = await window.api.database.getTableInfo(tableName);
      if (result.success) {
        setTableColumns(result.columns || []);
      }
    } catch (err) {
      console.error("Error loading table info:", err);
    }
  }, []);
  const loadTableData = reactExports.useCallback(
    async (tableName, page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await window.api.database.getTableData({
          tableName,
          page,
          limit: pageSize
        });
        if (result.success) {
          setTableData(result.data);
          setCurrentPage(page);
        } else {
          setError(result.error || "Failed to load table data");
        }
      } catch (err) {
        setError("Failed to load table data");
        console.error("Error loading table data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );
  const handleTableSelect = async (tableName) => {
    try {
      setSelectedTable(tableName);
      setCurrentPage(1);
      setError(null);
      setTableData(null);
      await loadTableInfo(tableName);
      await loadTableData(tableName, 1);
    } catch (err) {
      console.error("Error selecting table:", err);
      setError("Failed to load table data");
    }
  };
  const handlePageChange = (newPage) => {
    if (selectedTable && newPage > 0 && tableData && newPage <= (tableData.totalPages || 1)) {
      loadTableData(selectedTable, newPage);
    }
  };
  const executeQuery = async () => {
    if (!query.trim()) {
      setQueryError("Please enter a query");
      return;
    }
    if (!user) {
      setQueryError("User not authenticated");
      return;
    }
    setIsExecutingQuery(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const result = await window.api.database.executeQuery({
        query: query.trim(),
        userId: user.userId
      });
      if (result.success) {
        setQueryResult(result.data);
        if (result.data?.count === 0) {
          setQueryError("Query returned no results");
        } else {
          setSuccess("Query executed successfully");
          setTimeout(() => setSuccess(null), 3e3);
        }
      } else {
        setQueryError(result.error || "Query execution failed");
      }
    } catch (err) {
      setQueryError("Failed to execute query");
      console.error("Error executing query:", err);
    } finally {
      setIsExecutingQuery(false);
    }
  };
  reactExports.useEffect(() => {
    loadTables();
    loadDbInfo();
  }, [loadTables, loadDbInfo]);
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh] border-t-2 border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md px-6 py-10 rounded-xl border border-red-500/20 bg-red-950/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-10 h-10 text-red-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-red-400 mb-2 tracking-wide uppercase", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "Database access is restricted to administrators only. Contact your system administrator if you require visibility into database contents." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-center gap-2 text-primary/60 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Clearance level insufficient" })
      ] })
    ] }) });
  }
  const filteredTables = tables.filter(
    (t) => t.name.toLowerCase().includes(tableSearch.toLowerCase())
  );
  const selectedTableCount = dbInfo?.tableCounts.find((t) => t.name === selectedTable)?.count ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full border-t-2 border-primary/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b border-border/50 bg-background/80 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-4 h-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold tracking-widest uppercase text-foreground leading-none", children: "Database Viewer" }),
          dbInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-mono truncate max-w-[400px]", children: [
            dbInfo.path,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-primary/70", children: [
              "· ",
              tables.length,
              " tables"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: loadTables,
          disabled: isLoading,
          className: "h-7 px-3 text-xs border-primary/20 hover:border-primary/50 hover:text-primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3 h-3 mr-1.5 ${isLoading ? "animate-spin" : ""}` }),
            "Refresh"
          ]
        }
      )
    ] }),
    (error || success) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-3 shrink-0", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 shrink-0" }),
        error
      ] }),
      success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5 shrink-0" }),
        success
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden gap-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-56 shrink-0 flex flex-col border-r border-border/50 bg-background/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Filter tables…",
              value: tableSearch,
              onChange: (e) => setTableSearch(e.target.value),
              className: "pl-7 h-7 text-xs bg-muted/30 border-border/40 focus:border-primary/50 focus:ring-0"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto py-1", children: isLoading && !tables.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin text-muted-foreground" }) }) : filteredTables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground py-6", children: "No tables found" }) : filteredTables.map((table) => {
          const rowCount = dbInfo?.tableCounts.find((t) => t.name === table.name)?.count;
          const isSelected = selectedTable === table.name;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleTableSelect(table.name),
              className: `
                      w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors
                      border-l-2 text-xs group
                      ${isSelected ? "bg-primary/10 border-l-primary text-primary" : "border-l-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:border-l-primary/30"}
                    `,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: `w-3 h-3 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/60"}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono", children: table.name })
                ] }),
                rowCount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] shrink-0 ml-1 tabular-nums ${isSelected ? "text-primary/70" : "text-muted-foreground/50"}`, children: rowCount.toLocaleString() })
              ]
            },
            table.name
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-t border-border/40 text-[10px] text-muted-foreground/50 tabular-nums", children: [
          filteredTables.length,
          " / ",
          tables.length,
          " tables"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
          selectedTable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/60 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold font-mono text-primary", children: selectedTable }),
              selectedTableCount !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: "text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/70 font-mono",
                  children: [
                    selectedTableCount.toLocaleString(),
                    " rows"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Rows/page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: pageSize.toString(),
                  onValueChange: (v) => {
                    setPageSize(Number(v));
                    setCurrentPage(1);
                    if (selectedTable) loadTableData(selectedTable, 1);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-6 w-16 text-[10px] border-border/40 focus:ring-0 focus:border-primary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "25", children: "25" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "50", children: "50" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "100", children: "100" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "500", children: "500" })
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          selectedTable && tableColumns.length > 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 px-4 py-2 border-b border-border/30 bg-muted/10 shrink-0", children: tableColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: col.pk ? "default" : "outline",
              className: `text-[10px] h-5 px-1.5 font-mono ${col.pk ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30" : "border-border/40 text-muted-foreground/70"}`,
              children: [
                col.name,
                col.type && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 opacity-50", children: [
                  ":",
                  col.type.toLowerCase()
                ] }),
                col.pk ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-primary", children: "PK" }) : null
              ]
            },
            col.name
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto", children: !selectedTable ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-12 h-12 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Select a table from the sidebar" })
          ] }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5 animate-spin text-primary/50" }) }) : !tableData || tableData.rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-10 h-10 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "This table is empty" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table$1, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { className: "sticky top-0 bg-muted/80 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "border-b border-primary/10 hover:bg-transparent", children: Array.isArray(tableData.columns) && tableData.columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableHead,
              {
                className: "whitespace-nowrap text-[10px] font-mono text-primary/70 uppercase tracking-wider h-8 py-0 px-3",
                children: col
              },
              col
            )) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.isArray(tableData.rows) && tableData.rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableRow,
              {
                className: "border-b border-border/20 hover:bg-primary/5 transition-colors",
                children: Array.isArray(tableData.columns) && tableData.columns.map((col) => {
                  const cellValue = row && typeof row === "object" ? row[col] : null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TableCell,
                    {
                      className: "whitespace-nowrap max-w-[280px] truncate text-xs py-1.5 px-3 font-mono",
                      children: cellValue === null || cellValue === void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 italic text-[10px]", children: "NULL" }) : typeof cellValue === "object" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60 text-[10px]", children: [
                        JSON.stringify(cellValue).substring(0, 50),
                        "…"
                      ] }) : String(cellValue)
                    },
                    col
                  );
                })
              },
              idx
            )) })
          ] }) }) }),
          tableData && tableData.totalPages && tableData.totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-t border-border/40 bg-background/60 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground tabular-nums", children: [
              "Page",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: tableData.page }),
              " ",
              "of",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: tableData.totalPages }),
              " ",
              "·",
              " ",
              tableData.count.toLocaleString(),
              " rows total"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handlePageChange(currentPage - 1),
                  disabled: currentPage === 1,
                  className: "h-6 w-6 p-0 border-border/40 hover:border-primary/40",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-3 h-3" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handlePageChange(currentPage + 1),
                  disabled: currentPage === tableData.totalPages,
                  className: "h-6 w-6 p-0 border-border/40 hover:border-primary/40",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3" })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-t-2 border-primary/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 border-b border-border/40 bg-primary/5 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "w-3.5 h-3.5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tracking-widest uppercase text-primary", children: "SQL Query Runner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/60 ml-1", children: "— SELECT only" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "query", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-7 bg-muted/40 border border-border/30 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "query", className: "text-[10px] h-5 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary", children: "Query" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "presets", className: "text-[10px] h-5 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary", children: "Presets" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "query", className: "mt-0 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "query",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: "SELECT * FROM users WHERE role = 'admin'",
                    className: "font-mono text-xs min-h-[72px] bg-black/40 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/30",
                    onKeyDown: (e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        executeQuery();
                      }
                    }
                  }
                ),
                queryError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-[10px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3 shrink-0" }),
                  queryError
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: executeQuery,
                      disabled: isExecutingQuery || !query.trim(),
                      size: "sm",
                      className: "h-7 px-3 text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:text-primary",
                      children: isExecutingQuery ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3 h-3 mr-1.5 animate-spin" }),
                        "Executing…"
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3 h-3 mr-1.5" }),
                        "Run Query"
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/40", children: "Ctrl+Enter to run" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "presets", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: PRESET_QUERIES.map((preset) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setQuery(preset.query),
                  className: "px-2.5 py-1 rounded-md text-[10px] font-mono border border-primary/20 bg-primary/5 text-primary/80 hover:bg-primary/15 hover:border-primary/40 hover:text-primary transition-colors",
                  children: preset.label
                },
                preset.label
              )) }) })
            ] }),
            queryResult && queryResult.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground uppercase tracking-wider", children: "Results" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    variant: "outline",
                    className: "text-[10px] h-4 px-1.5 border-emerald-500/30 text-emerald-400 font-mono",
                    children: [
                      queryResult.count,
                      " rows"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border/30 rounded-md overflow-auto max-h-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table$1, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { className: "sticky top-0 bg-muted/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { className: "border-b border-primary/10 hover:bg-transparent", children: queryResult.columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableHead,
                  {
                    className: "whitespace-nowrap text-[10px] font-mono text-primary/70 uppercase tracking-wider h-7 py-0 px-3",
                    children: col
                  },
                  col
                )) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.isArray(queryResult.rows) && queryResult.rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableRow,
                  {
                    className: "border-b border-border/20 hover:bg-primary/5 transition-colors",
                    children: Array.isArray(queryResult.columns) && queryResult.columns.map((col) => {
                      const cellValue = row && typeof row === "object" ? row[col] : null;
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TableCell,
                        {
                          className: "whitespace-nowrap max-w-[280px] truncate text-xs py-1.5 px-3 font-mono",
                          children: cellValue === null || cellValue === void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 italic text-[10px]", children: "NULL" }) : typeof cellValue === "object" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60 text-[10px]", children: [
                            JSON.stringify(cellValue).substring(0, 50),
                            "…"
                          ] }) : String(cellValue)
                        },
                        col
                      );
                    })
                  },
                  idx
                )) })
              ] }) })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  DatabaseViewerScreen
};
