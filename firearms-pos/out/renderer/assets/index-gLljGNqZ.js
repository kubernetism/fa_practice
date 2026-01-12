import { a as useAuth, r as reactExports, j as jsxRuntimeExports, N as Navigate, L as Label, F as Select, G as SelectTrigger, H as SelectValue, J as SelectContent, K as SelectItem, I as Input, P as Package, Y as DollarSign, R as Receipt, S as ShoppingCart, a5 as BadgePercent, k as Users, O as Building2, i as Banknote, B as Button, a6 as LoaderCircle, Z as FileText } from "./index-CoWz6Mq1.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-DCkQpI_s.js";
import { T as TrendingUp } from "./trending-up-CKlySH4b.js";
import { R as RotateCcw } from "./rotate-ccw-Djxa3bEb.js";
import { H as History } from "./history-C_Jsvz0I.js";
import { D as Download } from "./download-Vp0Albat.js";
const reportCards = [
  {
    type: "sales",
    title: "Sales Report",
    description: "Comprehensive sales analysis with revenue, transactions, and top products",
    icon: TrendingUp,
    color: "text-green-600"
  },
  {
    type: "inventory",
    title: "Inventory Report",
    description: "Current stock levels, valuations, and low stock alerts",
    icon: Package,
    color: "text-blue-600"
  },
  {
    type: "profit-loss",
    title: "Profit & Loss",
    description: "Financial summary with revenue, expenses, and profit calculations",
    icon: DollarSign,
    color: "text-purple-600"
  },
  {
    type: "expenses",
    title: "Expense Report",
    description: "Detailed expense tracking and analysis by category",
    icon: Receipt,
    color: "text-red-600"
  },
  {
    type: "purchases",
    title: "Purchase Report",
    description: "Supplier purchase analysis and payment tracking",
    icon: ShoppingCart,
    color: "text-orange-600"
  },
  {
    type: "returns",
    title: "Returns Report",
    description: "Product returns analysis and refund tracking",
    icon: RotateCcw,
    color: "text-yellow-600"
  },
  {
    type: "commissions",
    title: "Commission Report",
    description: "Sales commission tracking by salesperson",
    icon: BadgePercent,
    color: "text-pink-600"
  },
  {
    type: "tax",
    title: "Tax Report",
    description: "Tax collection summary and compliance tracking",
    icon: Receipt,
    color: "text-indigo-600"
  },
  {
    type: "customer",
    title: "Customer Report",
    description: "Customer analytics and purchase history",
    icon: Users,
    color: "text-teal-600"
  },
  {
    type: "branch-performance",
    title: "Branch Performance",
    description: "Multi-branch comparison and performance metrics",
    icon: Building2,
    color: "text-cyan-600"
  },
  {
    type: "cash-flow",
    title: "Cash Flow Report",
    description: "Money in/out tracking and cash position",
    icon: Banknote,
    color: "text-emerald-600"
  },
  {
    type: "audit-trail",
    title: "Audit Trail",
    description: "System activity and user action logs",
    icon: History,
    color: "text-gray-600"
  }
];
function ReportsScreen() {
  const { user } = useAuth();
  const [branches, setBranches] = reactExports.useState([]);
  const [selectedReport, setSelectedReport] = reactExports.useState(null);
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
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
      const params = {
        startDate,
        endDate
      };
      if (selectedBranch !== "all") {
        params.branchId = parseInt(selectedBranch);
      }
      let response;
      const channelMap = {
        "sales": "reports:sales-report",
        "inventory": "reports:inventory-report",
        "profit-loss": "reports:profit-loss",
        "expenses": "reports:expenses-report",
        "purchases": "reports:purchases-report",
        "returns": "reports:returns-report",
        "commissions": "reports:commissions-report",
        "tax": "reports:tax-report",
        "customer": "reports:customer-report",
        "branch-performance": "reports:branch-performance",
        "cash-flow": "reports:cash-flow",
        "audit-trail": "reports:audit-trail"
      };
      const channel = channelMap[reportType];
      if (!channel) {
        throw new Error(`Unknown report type: ${reportType}`);
      }
      response = await window.api.reports[reportType](params);
      if (response?.success && response?.data) {
        setReportData(response.data);
      } else {
        setError(response?.message || "Failed to generate report");
      }
    } catch (error2) {
      console.error("Failed to generate report:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to generate report. Please try again.");
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
      const result = await window.api.reports.exportPDF({
        reportType: selectedReport,
        data: reportData,
        filters: {
          timePeriod,
          startDate,
          endDate,
          branchName
        }
      });
      if (result?.success && result?.filePath) {
        alert(`Report downloaded successfully!

Location: ${result.filePath}`);
      } else {
        setError(result?.message || "Failed to download PDF");
      }
    } catch (error2) {
      console.error("Failed to download PDF:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  const renderSummaryCards = () => {
    if (!reportData) return null;
    const summary = reportData.summary;
    if (!summary) return null;
    if (selectedReport === "sales") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Total Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.totalSales || 0 })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Total Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
            "Rs. ",
            (summary.totalRevenue || 0).toFixed(2)
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Avg Order Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
            "Rs. ",
            (summary.avgOrderValue || 0).toFixed(2)
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Tax Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            "Rs. ",
            (summary.totalTax || 0).toFixed(2)
          ] })
        ] }) })
      ] });
    }
    if (selectedReport === "profit-loss") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
            "Rs. ",
            (summary.revenue || reportData.revenue || 0).toFixed(2)
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Gross Profit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
            "Rs. ",
            (summary.grossProfit || reportData.grossProfit || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            (summary.grossMargin || reportData.grossMargin || 0).toFixed(2),
            "% margin"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Net Profit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-2xl font-bold ${(reportData.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`, children: [
            "Rs. ",
            (summary.netProfit || reportData.netProfit || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            (summary.netMargin || reportData.netMargin || 0).toFixed(2),
            "% margin"
          ] })
        ] }) })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: Object.entries(summary).slice(0, 3).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1 capitalize", children: key.replace(/([A-Z])/g, " $1").trim() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: typeof value === "number" ? value.toFixed(2) : value })
    ] }) }, key)) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Reports & Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Generate comprehensive business reports and download as PDF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium", children: "Admin Only" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Report Configuration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Select time period and branch to filter reports" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timePeriod", children: "Time Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timePeriod, onValueChange: (value) => setTimePeriod(value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: "Daily" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yearly", children: "Yearly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all-time", children: "All Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom Range" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "startDate",
              type: "date",
              value: startDate,
              onChange: (e) => {
                setStartDate(e.target.value);
                setTimePeriod("custom");
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "endDate", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "endDate",
              type: "date",
              value: endDate,
              onChange: (e) => {
                setEndDate(e.target.value);
                setTimePeriod("custom");
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branch", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranch, onValueChange: setSelectedBranch, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Branches" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
              branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: branch.id.toString(), children: [
                branch.code,
                " - ",
                branch.name
              ] }, branch.id))
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: reportCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: `cursor-pointer transition-all hover:shadow-lg ${selectedReport === card.type ? "ring-2 ring-primary" : ""}`,
        onClick: () => !isGenerating && handleGenerateReport(card.type),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { className: `h-5 w-5 ${card.color}` }),
            card.title
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: card.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: (e) => {
                  e.stopPropagation();
                  handleGenerateReport(card.type);
                },
                disabled: isGenerating,
                className: "w-full",
                size: "sm",
                children: isGenerating && selectedReport === card.type ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Generating..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 mr-2" }),
                  "Generate Report"
                ] })
              }
            )
          ] })
        ]
      },
      card.type
    )) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-red-200 bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: error }) }) }),
    reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
            reportCards.find((r) => r.type === selectedReport)?.title || "Report",
            " Summary"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1),
            " report from ",
            startDate,
            " to",
            " ",
            endDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleDownloadPDF, disabled: isDownloading, children: isDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
          "Downloading..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
          "Download PDF"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        renderSummaryCards(),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-4", children: 'Report generated successfully. Click "Download PDF" to save a detailed copy.' })
      ] })
    ] })
  ] });
}
export {
  ReportsScreen as default
};
