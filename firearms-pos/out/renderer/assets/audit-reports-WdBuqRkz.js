import { a as useAuth, r as reactExports, j as jsxRuntimeExports, C as Card, e as CardContent, O as CircleAlert, b as CardHeader, c as CardTitle, d as CardDescription, L as Label, a5 as Select, a6 as SelectTrigger, a7 as SelectValue, a8 as SelectContent, a9 as SelectItem, I as Input, B as Button, an as LoaderCircle, af as FileText, R as Receipt, D as DollarSign, P as Package } from "./index-huiv511I.js";
import { D as Download } from "./download-BYQNkzm5.js";
import { T as TrendingUp } from "./trending-up-DjMQJ7XY.js";
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-semibold", children: "Access Denied: Admin Only" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 mt-2", children: "You do not have permission to access this page. Only administrators can view and generate audit reports." })
    ] }) }) });
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
      const params = {
        timePeriod,
        startDate,
        endDate
      };
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
      setError(error2 instanceof Error ? error2.message : "Failed to generate audit report. Please try again.");
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
        filters: {
          timePeriod,
          startDate,
          endDate,
          branchName
        }
      });
      if (result?.success && result?.filePath) {
        alert(`Audit Report downloaded successfully!

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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Comprehensive Audit Reports" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Generate detailed business audit reports with sales, inventory, expenses, and financial data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium", children: "Admin Only" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Report Filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Select time period and branch to generate comprehensive audit report" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
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
          timePeriod === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "startDate",
                  type: "date",
                  value: startDate,
                  onChange: (e) => setStartDate(e.target.value)
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
                  onChange: (e) => setEndDate(e.target.value)
                }
              )
            ] })
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
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleGenerateReport, disabled: isGenerating, children: isGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
            "Generating Report..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 mr-2" }),
            "Generate Audit Report"
          ] }) }),
          reportData && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleDownloadPDF, disabled: isDownloading, variant: "outline", children: isDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
            "Downloading..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
            "Download PDF"
          ] }) })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-red-200 bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: error })
    ] }) }) }),
    reportData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Sales" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-slate-900 dark:text-gray-100", children: reportData.salesSummary?.totalSales || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 dark:text-gray-400 mt-1", children: [
              "Rs. ",
              (reportData.salesSummary?.totalRevenue || 0).toFixed(2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-red-600 dark:text-red-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Expenses" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: [
              "Rs. ",
              (reportData.expensesSummary?.totalExpenses || 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 dark:text-gray-400 mt-1", children: [
              reportData.expensesSummary?.expenseCount || 0,
              " transactions"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-green-600 dark:text-green-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Net Profit" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-2xl font-bold ${(reportData.financialSummary?.netProfit || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: [
              "Rs. ",
              (reportData.financialSummary?.netProfit || 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 dark:text-gray-400 mt-1", children: [
              (reportData.financialSummary?.profitMargin || 0).toFixed(2),
              "% margin"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Inventory Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400", children: [
              "Rs. ",
              (reportData.inventorySummary?.totalValue || 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 dark:text-gray-400 mt-1", children: [
              reportData.inventorySummary?.totalProducts || 0,
              " products"
            ] })
          ] })
        ] })
      ] }),
      reportData.salesSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Sales Analysis" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-gray-300", children: "Total Sales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900 dark:text-gray-100", children: reportData.salesSummary.totalSales })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-gray-300", children: "Total Revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-green-600 dark:text-green-400", children: [
                "Rs. ",
                reportData.salesSummary.totalRevenue.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-gray-300", children: "Avg Order Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-slate-900 dark:text-gray-100", children: [
                "Rs. ",
                reportData.salesSummary.avgOrderValue.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-gray-300", children: "Tax Collected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-slate-900 dark:text-gray-100", children: [
                "Rs. ",
                reportData.salesSummary.totalTax.toFixed(2)
              ] })
            ] })
          ] }),
          reportData.salesByPaymentMethod && reportData.salesByPaymentMethod.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2 text-slate-900 dark:text-gray-100", children: "Sales by Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2", children: reportData.salesByPaymentMethod.map((pm) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-900 dark:text-gray-100", children: pm.paymentMethod }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-slate-900 dark:text-gray-100", children: [
                  "Rs. ",
                  pm.total.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600 dark:text-gray-400", children: [
                  pm.count,
                  " sales"
                ] })
              ] })
            ] }, pm.paymentMethod)) })
          ] })
        ] }) })
      ] }),
      reportData.topProducts && reportData.topProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Top 10 Selling Products" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "Product Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100", children: "Qty Sold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100", children: "Revenue" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: reportData.topProducts.map((product, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-mono text-xs text-slate-900 dark:text-gray-100", children: product.productCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-slate-900 dark:text-gray-100", children: product.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100", children: product.quantitySold }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-green-600 dark:text-green-400 font-semibold", children: [
              "Rs. ",
              product.revenue.toFixed(2)
            ] })
          ] }, idx)) })
        ] }) }) })
      ] }),
      reportData.financialSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Financial Summary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900 dark:text-gray-100", children: "Gross Revenue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600 dark:text-green-400 font-bold", children: [
              "Rs. ",
              reportData.financialSummary.grossRevenue.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-gray-100", children: "Returns/Refunds" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 dark:text-red-400", children: [
              "- Rs. ",
              reportData.financialSummary.refunds.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900 dark:text-gray-100", children: "Net Revenue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600 dark:text-blue-400 font-bold", children: [
              "Rs. ",
              reportData.financialSummary.netRevenue.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-gray-100", children: "Cost of Goods Sold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 dark:text-red-400", children: [
              "- Rs. ",
              reportData.financialSummary.cogs.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900 dark:text-gray-100", children: "Gross Profit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600 dark:text-blue-400 font-bold", children: [
              "Rs. ",
              reportData.financialSummary.grossProfit.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-gray-100", children: "Operating Expenses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 dark:text-red-400", children: [
              "- Rs. ",
              reportData.financialSummary.expenses.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900 dark:text-gray-100", children: "Net Profit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-lg ${reportData.financialSummary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: [
              "Rs. ",
              reportData.financialSummary.netProfit.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-gray-100", children: "Profit Margin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-900 dark:text-gray-100", children: [
              reportData.financialSummary.profitMargin.toFixed(2),
              "%"
            ] })
          ] })
        ] }) })
      ] }),
      reportData.auditLogs && reportData.auditLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Recent System Audit Logs (Last 50)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "Date/Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100", children: "Table" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: reportData.auditLogs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-slate-900 dark:text-gray-100", children: new Date(log.timestamp).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-slate-900 dark:text-gray-100", children: log.userName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium", children: log.action }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-mono text-xs text-slate-900 dark:text-gray-100", children: log.tableName })
          ] }, log.id)) })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  AuditReportsScreen as default
};
