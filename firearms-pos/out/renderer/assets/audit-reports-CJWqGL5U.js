import { a as useAuth, r as reactExports, j as jsxRuntimeExports, Z as Card, _ as CardContent, d as CircleAlert, aB as FileChartColumnIncreasing, a9 as Badge, S as Shield, L as Label, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, I as Input, B as Button, e as LoaderCircle, aa as FileText, G as Receipt, $ as DollarSign, P as Package, an as CardHeader, ao as CardTitle, ad as CreditCard, ab as Clock, U as User } from "./index-GFsPmaGz.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QXqjqAE8.js";
import { D as Download } from "./download-DYJsh-wC.js";
import { C as Calendar } from "./calendar-CyKXJwiR.js";
import { T as TrendingUp } from "./trending-up-BoDz8ykQ.js";
import { C as ChartColumn } from "./chart-column-BUxQ0bLF.js";
function getActionBadge(action) {
  const map = {
    INSERT: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
    UPDATE: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    DELETE: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
    CREATE: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20"
  };
  const cls = map[action.toUpperCase()] ?? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `${cls} text-[10px] px-1.5 py-0 font-mono`, children: action });
}
function AuditReportsScreen() {
  const { user } = useAuth();
  const [branches, setBranches] = reactExports.useState([]);
  const [timePeriod, setTimePeriod] = reactExports.useState("monthly");
  const [selectedBranch, setSelectedBranch] = reactExports.useState("all");
  const [startDate, setStartDate] = reactExports.useState(
    new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [isDownloading, setIsDownloading] = reactExports.useState(false);
  const [reportData, setReportData] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  if (!user || user.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/30 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6 text-destructive" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "Access Denied" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Admin privileges required" })
      ] })
    ] }) }) }) });
  }
  reactExports.useEffect(() => {
    fetchBranches();
  }, []);
  reactExports.useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    switch (timePeriod) {
      case "daily":
        setStartDate(now.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
        break;
      case "weekly":
        const weekStart = new Date(now);
        const dayOfWeek = weekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(weekStart.getDate() + diff);
        setStartDate(weekStart.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
        break;
      case "monthly":
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]);
        break;
      case "yearly":
        setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]);
        setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0]);
        break;
      case "all-time":
        setStartDate("2000-01-01");
        setEndDate(now.toISOString().split("T")[0]);
        break;
    }
  }, [timePeriod]);
  const fetchBranches = async () => {
    try {
      const response = await window.api.branches.getAll();
      if (response?.success && response?.data) {
        setBranches(response.data);
      } else if (response?.data) {
        setBranches(response.data);
      } else {
        setBranches([]);
      }
    } catch (error2) {
      console.error("Failed to fetch branches:", error2);
      setBranches([]);
    }
  };
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setReportData(null);
    try {
      const params = { timePeriod, startDate, endDate };
      if (selectedBranch !== "all") {
        params.branchId = parseInt(selectedBranch);
      }
      const response = await window.api.reports.comprehensiveAudit(params);
      if (response?.success && response?.data) {
        setReportData(response.data);
      } else {
        setError(response?.message || "Failed to generate audit report");
      }
    } catch (error2) {
      console.error("Failed to generate audit report:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to generate audit report.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setIsDownloading(true);
    setError(null);
    try {
      const branchName = selectedBranch === "all" ? "All Branches" : branches.find((b) => b.id.toString() === selectedBranch)?.name || "Unknown Branch";
      const result = await window.api.reports.exportPDF({
        reportType: "audit-trail",
        data: reportData,
        filters: { timePeriod, startDate, endDate, branchName }
      });
      if (result?.success && result?.filePath) {
        alert(`Audit Report downloaded!

Location: ${result.filePath}`);
      } else {
        setError(result?.message || "Failed to download PDF");
      }
    } catch (error2) {
      console.error("Failed to download PDF:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumnIncreasing, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: "Comprehensive Audit Report" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-0.5" }),
            "Admin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sales, inventory, expenses, and financial audit data" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timePeriod, onValueChange: (value) => setTimePeriod(value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: "Daily" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yearly", children: "Yearly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all-time", children: "All Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom" })
          ] })
        ] })
      ] }),
      timePeriod === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "h-8 w-[140px] text-xs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "h-8 w-[140px] text-xs" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranch, onValueChange: setSelectedBranch, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[160px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Branches" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: branch.id.toString(), children: [
              branch.code,
              " - ",
              branch.name
            ] }, branch.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleGenerateReport, disabled: isGenerating, className: "h-8", children: [
        isGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" }),
        isGenerating ? "Generating..." : "Generate"
      ] }),
      reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleDownloadPDF, disabled: isDownloading, className: "h-8", children: [
        isDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
        "Download PDF"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }),
        startDate,
        " to ",
        endDate
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-destructive shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
    ] }) }),
    reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Total Sales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: reportData.salesSummary?.totalSales || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-green-600 dark:text-green-400 font-medium", children: [
            "Rs. ",
            (reportData.salesSummary?.totalRevenue || 0).toFixed(2)
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Total Expenses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-3.5 h-3.5 text-red-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-red-600 dark:text-red-400", children: [
            "Rs. ",
            (reportData.expensesSummary?.totalExpenses || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            reportData.expensesSummary?.expenseCount || 0,
            " transactions"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-${(reportData.financialSummary?.netProfit || 0) >= 0 ? "green" : "red"}-500/20`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Net Profit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: `w-3.5 h-3.5 ${(reportData.financialSummary?.netProfit || 0) >= 0 ? "text-green-500" : "text-red-500"}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xl font-bold ${(reportData.financialSummary?.netProfit || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: [
            "Rs. ",
            (reportData.financialSummary?.netProfit || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            (reportData.financialSummary?.profitMargin || 0).toFixed(1),
            "% margin"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Inventory Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 text-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-600 dark:text-blue-400", children: [
            "Rs. ",
            (reportData.inventorySummary?.totalValue || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            reportData.inventorySummary?.totalProducts || 0,
            " products"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        reportData.salesSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }),
            "Sales Analysis"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 pt-0 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
              { label: "Total Sales", value: String(reportData.salesSummary.totalSales) },
              { label: "Revenue", value: `Rs. ${reportData.salesSummary.totalRevenue.toFixed(2)}`, color: "text-green-600 dark:text-green-400" },
              { label: "Avg Order", value: `Rs. ${reportData.salesSummary.avgOrderValue.toFixed(2)}` },
              { label: "Tax Collected", value: `Rs. ${reportData.salesSummary.totalTax.toFixed(2)}` }
            ].map(({ label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-muted/40 border border-border/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold ${color || ""}`, children: value })
            ] }, label)) }),
            reportData.salesByPaymentMethod && reportData.salesByPaymentMethod.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide", children: "By Payment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: reportData.salesByPaymentMethod.map((pm) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1 px-2 rounded bg-muted/30 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-3 h-3 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: pm.paymentMethod })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                    "Rs. ",
                    pm.total.toFixed(2)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1.5", children: [
                    "(",
                    pm.count,
                    ")"
                  ] })
                ] })
              ] }, pm.paymentMethod)) })
            ] })
          ] })
        ] }),
        reportData.financialSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-4 h-4 text-blue-500" }),
            "Financial Summary"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3 pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5 text-xs", children: [
            [
              { label: "Gross Revenue", value: reportData.financialSummary.grossRevenue, color: "text-green-600 dark:text-green-400", bold: true },
              { label: "Returns/Refunds", value: -reportData.financialSummary.refunds, color: "text-red-600 dark:text-red-400", prefix: "- " },
              { label: "Net Revenue", value: reportData.financialSummary.netRevenue, color: "text-blue-600 dark:text-blue-400", bold: true, highlight: true },
              { label: "Cost of Goods Sold", value: -reportData.financialSummary.cogs, color: "text-red-600 dark:text-red-400", prefix: "- " },
              { label: "Gross Profit", value: reportData.financialSummary.grossProfit, color: "text-blue-600 dark:text-blue-400", bold: true, highlight: true },
              { label: "Operating Expenses", value: -reportData.financialSummary.expenses, color: "text-red-600 dark:text-red-400", prefix: "- " },
              { label: "Net Profit", value: reportData.financialSummary.netProfit, color: reportData.financialSummary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400", bold: true, highlight: true, large: true }
            ].map(({ label, value, color, bold, highlight, large, prefix }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex justify-between items-center py-1.5 px-2 rounded ${highlight ? "bg-muted/50" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bold ? "font-semibold" : "", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `${color} ${bold ? "font-bold" : "font-medium"} ${large ? "text-sm" : ""}`, children: [
                prefix || "",
                "Rs. ",
                Math.abs(value).toFixed(2)
              ] })
            ] }, label)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1.5 px-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Profit Margin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                reportData.financialSummary.profitMargin.toFixed(1),
                "%"
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      reportData.topProducts && reportData.topProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-blue-500" }),
          "Top 10 Selling Products"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-8", children: "#" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-28", children: "Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right w-20", children: "Qty Sold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right w-28", children: "Revenue" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: reportData.topProducts.map((product, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] text-muted-foreground py-1.5", children: idx + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px] py-1.5", children: product.productCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs py-1.5", children: product.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-right font-semibold py-1.5", children: product.quantitySold }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs text-right text-green-600 dark:text-green-400 font-semibold py-1.5", children: [
              "Rs. ",
              product.revenue.toFixed(2)
            ] })
          ] }, idx)) })
        ] }) })
      ] }),
      reportData.auditLogs && reportData.auditLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-muted-foreground" }),
            "Recent Audit Logs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
            "Last ",
            reportData.auditLogs.length
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-36", children: "Date/Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-28", children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-20", children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Table" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: reportData.auditLogs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
              new Date(log.timestamp).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-muted-foreground" }),
              log.userName
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getActionBadge(log.action) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px] text-muted-foreground py-1.5", children: log.tableName })
          ] }, log.id)) })
        ] }) })
      ] })
    ] }),
    !reportData && !error && !isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumnIncreasing, { className: "w-12 h-12 mx-auto mb-3 text-muted-foreground/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "No report generated yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: 'Select filters and click "Generate" to create an audit report' })
    ] }) })
  ] });
}
export {
  AuditReportsScreen as default
};
