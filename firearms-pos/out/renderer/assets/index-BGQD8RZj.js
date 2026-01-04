import { b as useBranch, r as reactExports, j as jsxRuntimeExports, D as DollarSign, f as formatCurrency, S as ShoppingCart, d as formatNumber, B as Button, P as Package, U as Users } from "./index-DQY4_xAv.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, c as CardDescription } from "./card-54GJNHOd.js";
import { T as TrendingUp } from "./trending-up-JIGCNQ6g.js";
import { T as TrendingDown } from "./trending-down-DX5g-Zat.js";
import { T as TriangleAlert } from "./triangle-alert-Bft7mWHh.js";
function DashboardScreen() {
  const { currentBranch } = useBranch();
  const [stats, setStats] = reactExports.useState(null);
  const [lowStockItems, setLowStockItems] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBranch) return;
      setIsLoading(true);
      try {
        const summaryResult = await window.api.sales.getDailySummary(currentBranch.id);
        if (summaryResult.success && summaryResult.data) {
          setStats({
            totalSales: summaryResult.data.totalSales || 0,
            totalRevenue: summaryResult.data.totalRevenue || 0,
            avgOrderValue: summaryResult.data.totalRevenue && summaryResult.data.totalSales ? summaryResult.data.totalRevenue / summaryResult.data.totalSales : 0,
            lowStockCount: 0
          });
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
          setStats((prev) => prev ? { ...prev, lowStockCount: items.length } : null);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentBranch]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Welcome back! Here's what's happening at ",
        currentBranch?.name || "your store",
        " today."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.totalRevenue || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-1 inline h-3 w-3 text-success" }),
            "+12.5% from yesterday"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatNumber(stats?.totalSales || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-1 inline h-3 w-3 text-success" }),
            "+3 from yesterday"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Avg. Order Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats?.avgOrderValue || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "mr-1 inline h-3 w-3 text-destructive" }),
            "-2.1% from yesterday"
          ] })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: lowStockItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "All stock levels are healthy" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/pos", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "mr-2 h-4 w-4" }),
            "New Sale"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/products", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mr-2 h-4 w-4" }),
            "Add Product"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/customers", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
            "Add Customer"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "justify-start", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/inventory", children: [
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
