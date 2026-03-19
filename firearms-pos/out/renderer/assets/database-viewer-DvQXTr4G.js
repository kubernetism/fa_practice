import { h as createLucideIcon, a as useAuth, r as reactExports, j as jsxRuntimeExports, k as Shield, B as Button, ai as CircleAlert, aq as CircleCheckBig, C as Card, b as CardHeader, c as CardTitle, ay as Database, d as CardDescription, e as CardContent, L as Label, m as Select, n as SelectTrigger, o as SelectValue, p as SelectContent, q as SelectItem, aa as Badge, v as ChevronRight, Y as Tabs, Z as TabsList, _ as TabsTrigger, ah as TabsContent, T as Textarea, R as React } from "./index-CRSsXg7z.js";
import { T as Table$1, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BK8sjFSH.js";
import { R as RefreshCw } from "./refresh-cw-CQaIxx3w.js";
import { C as ChevronLeft } from "./chevron-left-Bd5Nortg.js";
import { P as Play } from "./play-DC3BZ7Qm.js";
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Only administrators can access the database viewer. Please contact your administrator if you need to view database contents." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Database Viewer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "View and query database tables (Admin Only)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: loadTables, disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" }),
      error
    ] }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5" }),
      success
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-5 h-5" }),
            "Tables"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            tables.length,
            " tables in database"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading && !tables.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 max-h-[600px] overflow-y-auto", children: tables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: selectedTable === table.name ? "secondary" : "ghost",
            className: "w-full justify-start",
            onClick: () => handleTableSelect(table.name),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-4 h-4 mr-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: table.name })
            ]
          },
          table.name
        )) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-5 h-5" }),
              selectedTable || "Select a Table"
            ] }),
            selectedTable && dbInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
              dbInfo.tableCounts.find((t) => t.name === selectedTable)?.count.toLocaleString() || 0,
              " rows"
            ] })
          ] }),
          selectedTable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Rows per page:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: pageSize.toString(), onValueChange: (v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
              if (selectedTable) loadTableData(selectedTable, 1);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "25", children: "25" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "50", children: "50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "100", children: "100" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "500", children: "500" })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          !selectedTable ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-16 h-16 mb-4 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Select a table from the list to view its data" })
          ] }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) : !tableData || tableData.rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-16 h-16 mb-4 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This table is empty" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: tableColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: col.pk ? "default" : "outline",
                className: "text-xs",
                children: [
                  col.name,
                  col.type && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 opacity-60", children: [
                    "(",
                    col.type,
                    ")"
                  ] })
                ]
              },
              col.name
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-auto max-h-[500px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table$1, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { className: "sticky top-0 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: Array.isArray(tableData.columns) && tableData.columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "whitespace-nowrap", children: col }, col)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.isArray(tableData.rows) && tableData.rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: Array.isArray(tableData.columns) && tableData.columns.map((col) => {
                const cellValue = row && typeof row === "object" ? row[col] : null;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap max-w-[300px] truncate", children: cellValue === null || cellValue === void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "NULL" }) : typeof cellValue === "object" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs", children: [
                  JSON.stringify(cellValue).substring(0, 50),
                  "..."
                ] }) : String(cellValue) }, col);
              }) }, idx)) })
            ] }) })
          ] }) }),
          tableData && tableData.totalPages && tableData.totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
              "Page ",
              tableData.page,
              " of ",
              tableData.totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handlePageChange(currentPage - 1),
                  disabled: currentPage === 1,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }),
                    "Previous"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handlePageChange(currentPage + 1),
                  disabled: currentPage === tableData.totalPages,
                  children: [
                    "Next",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "w-5 h-5" }),
          "SQL Query Runner"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Execute custom SELECT queries to view data (read-only)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "query", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "query", children: "Query" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "presets", children: "Presets" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "query", className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "query", children: "SQL Query (SELECT only)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "query",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  placeholder: "SELECT * FROM users WHERE role = 'admin'",
                  className: "font-mono min-h-[100px]"
                }
              )
            ] }),
            queryError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" }),
              queryError
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: executeQuery,
                disabled: isExecutingQuery || !query.trim(),
                children: isExecutingQuery ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
                  "Executing..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
                  "Execute Query"
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "presets", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT * FROM users"),
                children: "SELECT * FROM users"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT * FROM branches"),
                children: "SELECT * FROM branches"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT * FROM products LIMIT 50"),
                children: "SELECT * FROM products LIMIT 50"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT * FROM customers LIMIT 50"),
                children: "SELECT * FROM customers LIMIT 50"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT * FROM sales ORDER BY created_at DESC LIMIT 50"),
                children: "Recent Sales (50)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "justify-start font-mono text-sm",
                onClick: () => setQuery("SELECT name, sql FROM sqlite_master WHERE type='table'"),
                children: "Show All Tables Schema"
              }
            )
          ] }) })
        ] }),
        queryResult && queryResult.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-2", children: [
            "Query Results (",
            queryResult.count,
            " rows)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-auto max-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table$1, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { className: "sticky top-0 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: queryResult.columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "whitespace-nowrap", children: col }, col)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.isArray(queryResult.rows) && queryResult.rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: Array.isArray(queryResult.columns) && queryResult.columns.map((col) => {
              const cellValue = row && typeof row === "object" ? row[col] : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap max-w-[300px] truncate", children: cellValue === null || cellValue === void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "NULL" }) : typeof cellValue === "object" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs", children: [
                JSON.stringify(cellValue).substring(0, 50),
                "..."
              ] }) : String(cellValue) }, col);
            }) }, idx)) })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DatabaseViewerScreen
};
