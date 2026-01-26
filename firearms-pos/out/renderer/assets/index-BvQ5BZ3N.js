import { d as useBranch, e as useCurrency, r as reactExports, j as jsxRuntimeExports, B as Button, C as Check, T as Tabs, f as TabsList, g as TabsTrigger, R as Receipt, W as Wallet, P as Package, h as formatNumber, S as ShoppingCart, i as Percent, D as DollarSign, k as Banknote, l as Link, m as Users } from "./index-Cuq0DYP8.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, c as CardDescription } from "./card-CbshtfGd.js";
import { C as Copy } from "./copy-Cai6hzJH.js";
import { T as TrendingUp } from "./trending-up-vP0-P2eA.js";
import { R as RotateCcw } from "./rotate-ccw-CS68wFcz.js";
import { C as CircleArrowDown, a as CircleArrowUp } from "./circle-arrow-up-DJwuxyMj.js";
import { T as TriangleAlert } from "./triangle-alert-Rx2UUpsP.js";
const TIME_PERIOD_LABELS = {
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year"
};
function DashboardScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = reactExports.useState(null);
  const [lowStockItems, setLowStockItems] = reactExports.useState([]);
  const [timePeriod, setTimePeriod] = reactExports.useState("daily");
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isCopied, setIsCopied] = reactExports.useState(false);
  const handleCopyDashboard = async () => {
    if (!stats || !currentBranch) return;
    const text = `
═══════════════════════════════════════════════════════
                    DASHBOARD REPORT
═══════════════════════════════════════════════════════
Branch: ${currentBranch.name}
Period: ${TIME_PERIOD_LABELS[timePeriod]}
Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}
═══════════════════════════════════════════════════════

📊 FINANCIAL OVERVIEW
───────────────────────────────────────────────────────
Total Revenue:        ${formatCurrency(stats.totalRevenue)}
Total Cost:           ${formatCurrency(stats.totalCost)}
Total Profit:         ${formatCurrency(stats.totalProfit)}
Total Purchases:      ${formatCurrency(stats.totalPurchases)}
Total Expenses:       ${formatCurrency(stats.totalExpense)}

💰 TAX & COMMISSION
───────────────────────────────────────────────────────
Tax Collected:        ${formatCurrency(stats.totalTaxCollected)}
Commission Paid:      ${formatCurrency(stats.totalCommission)}

📦 SALES & INVENTORY
───────────────────────────────────────────────────────
Total Sales:          ${formatNumber(stats.totalSalesCount)} transactions
Products Sold:        ${formatNumber(stats.totalProductsSold)} units
Total Products:       ${formatNumber(stats.totalProducts)} items
Total Returns:        ${formatCurrency(stats.totalReturns)}
Low Stock Items:      ${formatNumber(stats.lowStockCount)} items

💳 RECEIVABLES & PAYABLES
───────────────────────────────────────────────────────
AR Pending:           ${formatCurrency(stats.receivablesPending)}
AR Received:          ${formatCurrency(stats.receivablesReceived)}
AP Pending:           ${formatCurrency(stats.payablesPending)}
AP Paid:              ${formatCurrency(stats.payablesPaid)}

💵 CASH POSITION
───────────────────────────────────────────────────────
Cash In Hand:         ${formatCurrency(stats.cashInHand)}

${lowStockItems.length > 0 ? `
⚠️ LOW STOCK ALERTS (${lowStockItems.length} items)
───────────────────────────────────────────────────────
${lowStockItems.slice(0, 10).map((item) => `• ${item.productName} (${item.productCode}): ${item.quantity}/${item.minQuantity}`).join("\n")}
${lowStockItems.length > 10 ? `... and ${lowStockItems.length - 10} more items` : ""}
` : ""}
═══════════════════════════════════════════════════════
`.trim();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2e3);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  reactExports.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBranch) return;
      setIsLoading(true);
      try {
        const statsResult = await window.api.dashboard.getStats({
          branchId: currentBranch.id,
          timePeriod
        });
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
        const lowStockResult = await window.api.inventory.getLowStock(currentBranch.id);
        if (lowStockResult.success && lowStockResult.data) {
          const items = lowStockResult.data.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productCode: item.product.code,
            quantity: item.inventory.quantity,
            minQuantity: item.inventory.minQuantity
          }));
          setLowStockItems(items);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentBranch, timePeriod]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Welcome back! Here's what's happening at ",
          currentBranch?.name || "your store",
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleCopyDashboard,
            disabled: !stats,
            className: "gap-2",
            children: isCopied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-500" }),
              "Copied!"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
              "Copy Report"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: timePeriod, onValueChange: (v) => setTimePeriod(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: Object.keys(TIME_PERIOD_LABELS).map((period) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: period, children: TIME_PERIOD_LABELS[period] }, period)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold text-muted-foreground", children: "Financial Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Profit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`, children: formatCurrency(stats?.totalProfit || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Revenue - Cost - Commission - Tax" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Purchases" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-purple-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.totalPurchases || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Purchase orders value" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Expense" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-red-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.totalExpense || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Operating expenses" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold text-muted-foreground", children: "Sales & Inventory" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Products" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatNumber(stats?.totalProducts || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active products in catalog" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Products Sold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 text-indigo-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatNumber(stats?.totalProductsSold || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Units sold in period" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Returns" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 text-orange-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.totalReturns || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Returned goods value" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold text-muted-foreground", children: "Receivables & Payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "AR Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "h-4 w-4 text-yellow-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.receivablesPending || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Outstanding customer dues" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "AR Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "h-4 w-4 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.receivablesReceived || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collected in period" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "AP Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4 text-red-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.payablesPending || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Outstanding supplier dues" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "AP Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.payablesPaid || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Paid in period" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold text-muted-foreground", children: "Tax & Commission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Tax Collected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(stats?.totalTaxCollected || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total tax collected from sales" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Commission Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-amber-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-600", children: formatCurrency(stats?.totalCommission || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sales commissions paid out" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold text-muted-foreground", children: "Cash & Alerts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Cash In Hand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4 text-emerald-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.cashInHand || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Current cash register balance" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Low Stock Alerts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-warning" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatNumber(stats?.lowStockCount || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Items need restock" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-warning" }),
            "Low Stock Items"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Products that need to be restocked" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: lowStockItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-muted-foreground", children: "All stock levels are healthy" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          lowStockItems.slice(0, 5).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: item.productCode })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-destructive", children: [
                item.quantity,
                " left"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "Min: ",
                item.minQuantity
              ] })
            ] })
          ] }, item.productId)),
          lowStockItems.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", children: [
            "View All (",
            lowStockItems.length,
            " items)"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Quick Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Common tasks you can do right now" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/pos", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "mr-2 h-4 w-4" }),
            "New Sale"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/products", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mr-2 h-4 w-4" }),
            "Add Product"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/customers", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
            "Add Customer"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/inventory", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mr-2 h-4 w-4" }),
            "Stock Adjustment"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DashboardScreen
};
