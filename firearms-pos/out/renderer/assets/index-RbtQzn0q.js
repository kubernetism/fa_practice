import { a as useAuth, O as useBranch, r as reactExports, j as jsxRuntimeExports, N as Navigate, a0 as DollarSign, H as Receipt, J as Banknote, P as Package, G as ShoppingCart, R as RotateCcw, A as Users, ay as BadgePercent, f as Building2, ab as FileText, aa as Badge, S as Shield, L as Label, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, I as Input, V as Tabs, Y as TabsList, Z as TabsTrigger, _ as Card, $ as CardContent, e as LoaderCircle, C as ChevronRight, ao as CardHeader, ap as CardTitle, aB as CardDescription, B as Button } from "./index-DXbUu2xA.js";
import { T as TrendingUp } from "./trending-up-BpyzB42y.js";
import { H as History } from "./history-Dqk0gKOF.js";
import { C as Calendar } from "./calendar-x0B5pNz9.js";
import { C as ChartColumn } from "./chart-column-B3sNtLIU.js";
import { D as Download } from "./download-D7P34J40.js";
const reportCards = [
  {
    type: "sales",
    title: "Sales Report",
    description: "Revenue, transactions, top products",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    category: "financial"
  },
  {
    type: "profit-loss",
    title: "Profit & Loss",
    description: "Revenue, expenses, profit calculations",
    icon: DollarSign,
    color: "text-purple-600 dark:text-purple-400",
    category: "financial"
  },
  {
    type: "expenses",
    title: "Expense Report",
    description: "Expense tracking by category",
    icon: Receipt,
    color: "text-red-600 dark:text-red-400",
    category: "financial"
  },
  {
    type: "cash-flow",
    title: "Cash Flow",
    description: "Money in/out and cash position",
    icon: Banknote,
    color: "text-emerald-600 dark:text-emerald-400",
    category: "financial"
  },
  {
    type: "tax",
    title: "Tax Report",
    description: "Tax collection and compliance",
    icon: Receipt,
    color: "text-indigo-600 dark:text-indigo-400",
    category: "financial"
  },
  {
    type: "inventory",
    title: "Inventory Report",
    description: "Stock levels, valuations, alerts",
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    category: "operations"
  },
  {
    type: "purchases",
    title: "Purchase Report",
    description: "Supplier purchases and payments",
    icon: ShoppingCart,
    color: "text-orange-600 dark:text-orange-400",
    category: "operations"
  },
  {
    type: "returns",
    title: "Returns Report",
    description: "Product returns and refunds",
    icon: RotateCcw,
    color: "text-yellow-600 dark:text-yellow-400",
    category: "operations"
  },
  {
    type: "customer",
    title: "Customer Report",
    description: "Customer analytics and history",
    icon: Users,
    color: "text-teal-600 dark:text-teal-400",
    category: "analytics"
  },
  {
    type: "commissions",
    title: "Commissions",
    description: "Sales commission by person",
    icon: BadgePercent,
    color: "text-pink-600 dark:text-pink-400",
    category: "analytics"
  },
  {
    type: "branch-performance",
    title: "Branch Performance",
    description: "Multi-branch comparison metrics",
    icon: Building2,
    color: "text-cyan-600 dark:text-cyan-400",
    category: "analytics"
  },
  {
    type: "audit-trail",
    title: "Audit Trail",
    description: "System activity and user logs",
    icon: History,
    color: "text-gray-600 dark:text-gray-400",
    category: "analytics"
  }
];
const CATEGORY_LABELS = {
  financial: { label: "Financial", icon: DollarSign },
  operations: { label: "Operations", icon: Package },
  analytics: { label: "Analytics", icon: ChartColumn }
};
function ReportsScreen() {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  const [branches, setBranches] = reactExports.useState([]);
  const [selectedReport, setSelectedReport] = reactExports.useState(null);
  const [timePeriod, setTimePeriod] = reactExports.useState("monthly");
  const [selectedBranch, setSelectedBranch] = reactExports.useState(currentBranch?.id?.toString() || "all");
  const [startDate, setStartDate] = reactExports.useState(
    new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [isDownloading, setIsDownloading] = reactExports.useState(false);
  const [reportData, setReportData] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [activeCategory, setActiveCategory] = reactExports.useState("financial");
  if (!user || user.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  reactExports.useEffect(() => {
    fetchBranches();
  }, []);
  reactExports.useEffect(() => {
    if (currentBranch && selectedBranch === "all") {
      setSelectedBranch(currentBranch.id.toString());
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    switch (timePeriod) {
      case "daily":
        setStartDate(now.toISOString().split("T")[0]);
        setEndDate(now.toISOString().split("T")[0]);
        break;
      case "weekly":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
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
  const handleGenerateReport = async (reportType) => {
    setSelectedReport(reportType);
    setIsGenerating(true);
    setError(null);
    setReportData(null);
    try {
      const params = { startDate, endDate };
      if (selectedBranch !== "all") {
        params.branchId = parseInt(selectedBranch);
      }
      const response = await window.api.reports[reportType](params);
      if (response?.success && response?.data) {
        setReportData(response.data);
      } else {
        setError(response?.message || "Failed to generate report");
      }
    } catch (error2) {
      console.error("Failed to generate report:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!selectedReport || !reportData) return;
    setIsDownloading(true);
    setError(null);
    try {
      const branchName = selectedBranch === "all" ? "All Branches" : branches.find((b) => b.id.toString() === selectedBranch)?.name || "Unknown Branch";
      let pdfData = reportData;
      if (selectedReport === "audit-trail") {
        const auditParams = { timePeriod, startDate, endDate };
        if (selectedBranch !== "all") {
          auditParams.branchId = parseInt(selectedBranch);
        }
        const comprehensiveResponse = await window.api.reports.comprehensiveAudit(auditParams);
        if (comprehensiveResponse?.success && comprehensiveResponse?.data) {
          pdfData = comprehensiveResponse.data;
        }
      }
      const result = await window.api.reports.exportPDF({
        reportType: selectedReport,
        data: pdfData,
        filters: { timePeriod, startDate, endDate, branchName }
      });
      if (result?.success && result?.filePath) {
        alert(`Report downloaded!

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
  const renderSummaryCards = () => {
    if (!reportData) return null;
    const summary = reportData.summary;
    if (!summary) return null;
    if (selectedReport === "sales") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Total Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold mt-0.5", children: summary.totalSales || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-600 dark:text-green-400 mt-0.5", children: [
            "Rs. ",
            (summary.totalRevenue || 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Avg Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5", children: [
            "Rs. ",
            (summary.avgOrderValue || 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Tax Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold mt-0.5", children: [
            "Rs. ",
            (summary.totalTax || 0).toFixed(2)
          ] })
        ] })
      ] });
    }
    if (selectedReport === "profit-loss") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-600 dark:text-green-400 mt-0.5", children: [
            "Rs. ",
            (summary.revenue || reportData.revenue || 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Gross Profit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5", children: [
            "Rs. ",
            (summary.grossProfit || reportData.grossProfit || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            (summary.grossMargin || reportData.grossMargin || 0).toFixed(1),
            "% margin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Net Profit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-lg font-bold mt-0.5 ${(reportData.netProfit || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: [
            "Rs. ",
            (summary.netProfit || reportData.netProfit || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            (summary.netMargin || reportData.netMargin || 0).toFixed(1),
            "% margin"
          ] })
        ] })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: Object.entries(summary).slice(0, 3).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: key.replace(/([A-Z])/g, " $1").trim() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold mt-0.5", children: typeof value === "number" ? value.toFixed(2) : String(value) })
    ] }, key)) });
  };
  const filteredReports = reportCards.filter((c) => c.category === activeCategory);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: "Reports & Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-0.5" }),
            "Admin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Generate business reports and download as PDF" })
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: startDate,
            onChange: (e) => {
              setStartDate(e.target.value);
              setTimePeriod("custom");
            },
            className: "h-8 w-[140px] text-xs"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] text-muted-foreground", children: "To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: endDate,
            onChange: (e) => {
              setEndDate(e.target.value);
              setTimePeriod("custom");
            },
            className: "h-8 w-[140px] text-xs"
          }
        )
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }),
        startDate,
        " to ",
        endDate
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeCategory, onValueChange: setActiveCategory, className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "w-fit", children: Object.entries(CATEGORY_LABELS).map(([key, { label, icon: Icon }]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: key, className: "text-xs gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
        label,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[9px] px-1 py-0 ml-0.5", children: reportCards.filter((c) => c.category === key).length })
      ] }, key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex-1 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3", children: filteredReports.map((card) => {
        const isActive = selectedReport === card.type;
        const isCurrentlyGenerating = isGenerating && selectedReport === card.type;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `cursor-pointer transition-all hover:shadow-md group ${isActive ? "ring-1 ring-primary shadow-md" : "hover:border-primary/30"}`,
            onClick: () => !isGenerating && handleGenerateReport(card.type),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-muted/80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { className: `h-4 w-4 ${card.color}` }) }),
                isCurrentlyGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold leading-tight", children: card.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5 leading-tight", children: card.description })
            ] })
          },
          card.type
        );
      }) }) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error }) }) }),
    reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "p-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm", children: [
            reportCards.find((r) => r.type === selectedReport)?.title || "Report",
            " Summary"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-[11px]", children: [
            timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1),
            " · ",
            startDate,
            " to ",
            endDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleDownloadPDF, disabled: isDownloading, className: "h-7 text-xs", children: [
          isDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
          isDownloading ? "Downloading..." : "Download PDF"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 pt-0", children: [
        renderSummaryCards(),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-3", children: 'Report generated. Click "Download PDF" for a detailed copy.' })
      ] })
    ] })
  ] });
}
export {
  ReportsScreen as default
};
