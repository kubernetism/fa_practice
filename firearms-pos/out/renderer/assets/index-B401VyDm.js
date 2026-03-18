import { h as createLucideIcon, t as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, aq as Plus, al as Clock, C as Card, b as CardHeader, c as CardTitle, G as Wallet, e as CardContent, D as DollarSign, y as Tabs, z as TabsList, A as TabsTrigger, ap as TabsContent, d as CardDescription, aA as CircleCheckBig, ad as Dialog, ae as DialogContent, af as DialogHeader, ag as DialogTitle, ah as DialogDescription, L as Label, I as Input, au as DialogFooter, aC as Textarea, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, ai as Badge } from "./index-DH-ZMwKK.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DpKJnqzE.js";
import { R as RefreshCw } from "./refresh-cw-DLlGFvyV.js";
import { f as format } from "./format-Bgkn8bop.js";
import { T as TrendingUp } from "./trending-up-D0__QOb4.js";
import { T as TrendingDown } from "./trending-down-DQCEoHOl.js";
import { C as Calendar } from "./calendar-DULKc6wN.js";
import { T as TriangleAlert } from "./triangle-alert-CgRsMfIy.js";
import { a as CircleArrowUp, C as CircleArrowDown } from "./circle-arrow-up-BH4a9C03.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleDollarSign = createLucideIcon("CircleDollarSign", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }]
]);
function CashRegisterScreen() {
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = reactExports.useState("current");
  const [currentSession, setCurrentSession] = reactExports.useState(null);
  const [sessionHistory, setSessionHistory] = reactExports.useState([]);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [cashFlowSummary, setCashFlowSummary] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [openSessionDialog, setOpenSessionDialog] = reactExports.useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = reactExports.useState(false);
  const [transactionDialog, setTransactionDialog] = reactExports.useState(false);
  const [adjustmentDialog, setAdjustmentDialog] = reactExports.useState(false);
  const [openingBalance, setOpeningBalance] = reactExports.useState("");
  const [actualBalance, setActualBalance] = reactExports.useState("");
  const [closingNotes, setClosingNotes] = reactExports.useState("");
  const [transactionType, setTransactionType] = reactExports.useState("cash_in");
  const [transactionAmount, setTransactionAmount] = reactExports.useState("");
  const [transactionDescription, setTransactionDescription] = reactExports.useState("");
  const [adjustmentAmount, setAdjustmentAmount] = reactExports.useState("");
  const [adjustmentReason, setAdjustmentReason] = reactExports.useState("");
  const branchId = currentBranch?.id || 1;
  reactExports.useEffect(() => {
    if (currentBranch) {
      loadData();
    }
  }, [branchId, currentBranch]);
  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionResult, historyResult, flowResult] = await Promise.all([
        window.api.cashRegister.getCurrentSession(branchId),
        window.api.cashRegister.getHistory({ branchId, limit: 30 }),
        window.api.cashRegister.getCashFlowSummary({ branchId })
      ]);
      const session = sessionResult?.success ? sessionResult.data : null;
      const history = historyResult?.success ? historyResult.data : [];
      const flow = flowResult?.success ? flowResult.data : null;
      setCurrentSession(session);
      setSessionHistory(history || []);
      if (flow) {
        setCashFlowSummary({
          openingBalance: session?.openingBalance || 0,
          totalCashIn: flow.periodSummary?.totalInflows || 0,
          totalCashOut: flow.periodSummary?.totalOutflows || 0,
          netCashFlow: flow.periodSummary?.netCashFlow || 0,
          expectedBalance: session ? session.openingBalance + (session.totalIn || 0) - (session.totalOut || 0) : 0,
          byType: flow.transactionBreakdown?.reduce((acc, t) => {
            acc[t.transactionType] = t.totalAmount || 0;
            return acc;
          }, {}) || {}
        });
      }
      if (session) {
        const txResult = await window.api.cashRegister.getTransactions(session.id);
        setTransactions(txResult?.success ? txResult.data : []);
      }
    } catch (error) {
      console.error("Failed to load cash register data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenSession = async () => {
    try {
      const balance = parseFloat(openingBalance) || 0;
      const result = await window.api.cashRegister.openSession({
        branchId,
        openingBalance: balance
      });
      if (!result?.success) {
        alert(result?.message || "Failed to open session");
        return;
      }
      setOpenSessionDialog(false);
      setOpeningBalance("");
      await loadData();
    } catch (error) {
      console.error("Failed to open session:", error);
      alert("Failed to open session: " + error.message);
    }
  };
  const handleCloseSession = async () => {
    if (!currentSession) return;
    try {
      const actual = parseFloat(actualBalance) || 0;
      const result = await window.api.cashRegister.closeSession({
        sessionId: currentSession.id,
        actualBalance: actual,
        notes: closingNotes || void 0
      });
      if (!result?.success) {
        alert(result?.message || "Failed to close session");
        return;
      }
      setCloseSessionDialog(false);
      setActualBalance("");
      setClosingNotes("");
      await loadData();
    } catch (error) {
      console.error("Failed to close session:", error);
      alert("Failed to close session: " + error.message);
    }
  };
  const handleRecordTransaction = async () => {
    if (!currentSession) return;
    try {
      const amount = parseFloat(transactionAmount) || 0;
      const result = await window.api.cashRegister.recordTransaction({
        sessionId: currentSession.id,
        branchId,
        transactionType,
        amount,
        description: transactionDescription || void 0
      });
      if (!result?.success) {
        alert(result?.message || "Failed to record transaction");
        return;
      }
      setTransactionDialog(false);
      setTransactionType("cash_in");
      setTransactionAmount("");
      setTransactionDescription("");
      await loadData();
    } catch (error) {
      console.error("Failed to record transaction:", error);
      alert("Failed to record transaction: " + error.message);
    }
  };
  const handleAdjustment = async () => {
    if (!currentSession) return;
    try {
      const amount = parseFloat(adjustmentAmount) || 0;
      const result = await window.api.cashRegister.adjust({
        sessionId: currentSession.id,
        amount,
        reason: adjustmentReason
      });
      if (!result?.success) {
        alert(result?.message || "Failed to make adjustment");
        return;
      }
      setAdjustmentDialog(false);
      setAdjustmentAmount("");
      setAdjustmentReason("");
      await loadData();
    } catch (error) {
      console.error("Failed to make adjustment:", error);
      alert("Failed to make adjustment: " + error.message);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500", children: "Open" });
      case "closed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-blue-500", children: "Closed" });
      case "reconciled":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-purple-500", children: "Reconciled" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: status });
    }
  };
  const getTransactionIcon = (type) => {
    switch (type) {
      case "cash_in":
      case "sale":
      case "deposit":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "h-4 w-4 text-green-500" });
      case "cash_out":
      case "refund":
      case "expense":
      case "withdrawal":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4 text-red-500" });
      case "adjustment":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 text-yellow-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "h-4 w-4" });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Cash Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Manage daily cash sessions and transactions ",
          currentBranch && `- ${currentBranch.name}`
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        !currentSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpenSessionDialog(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Open Session"
        ] }),
        currentSession && currentSession.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setTransactionDialog(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "h-4 w-4 mr-2" }),
            "Record Transaction"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setAdjustmentDialog(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
            "Adjustment"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => setCloseSessionDialog(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 mr-2" }),
            "Close Session"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Session Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: currentSession ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          getStatusBadge(currentSession.status),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
            "Opened: ",
            format(new Date(currentSession.openedAt), "MMM d, h:mm a")
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No active session" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Opening Balance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: currentSession ? formatCurrency(currentSession.openingBalance) : "-" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Cash In" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: cashFlowSummary ? formatCurrency(cashFlowSummary.totalCashIn) : "-" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Cash Out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: cashFlowSummary ? formatCurrency(cashFlowSummary.totalCashOut) : "-" }) })
      ] })
    ] }),
    currentSession && cashFlowSummary && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Expected Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold", children: formatCurrency(cashFlowSummary.expectedBalance) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Net Cash Flow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-2xl font-bold ${cashFlowSummary.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`, children: [
          cashFlowSummary.netCashFlow >= 0 ? "+" : "",
          formatCurrency(cashFlowSummary.netCashFlow)
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "current", children: "Today's Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Session History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "summary", children: "Cash Flow Summary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "current", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Today's Transactions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "All cash movements for the current session" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No transactions recorded yet" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: transactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: format(new Date(tx.transactionDate), "h:mm a") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getTransactionIcon(tx.transactionType),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: tx.transactionType.replace("_", " ") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: tx.description || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: tx.referenceType ? `${tx.referenceType} #${tx.referenceId}` : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: `text-right font-medium ${["cash_in", "sale", "deposit", "ar_collection", "petty_cash_in"].includes(tx.transactionType) ? "text-green-600" : "text-red-600"}`, children: [
              ["cash_in", "sale", "deposit", "ar_collection", "petty_cash_in"].includes(tx.transactionType) ? "+" : "-",
              formatCurrency(Math.abs(tx.amount))
            ] })
          ] }, tx.id)) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Session History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Past 30 days of cash register sessions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: sessionHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No session history found" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Opened By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Opening" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Closing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Variance" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sessionHistory.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: format(new Date(session.sessionDate), "MMM d, yyyy") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStatusBadge(session.status) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: session.openedByUser?.fullName || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(session.openingBalance) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: session.closingBalance !== null ? formatCurrency(session.closingBalance) : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `text-right font-medium ${session.variance === null ? "" : session.variance === 0 ? "text-green-600" : session.variance > 0 ? "text-blue-600" : "text-red-600"}`, children: session.variance !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: session.variance === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
              "Balanced"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              session.variance > 0 ? "+" : "",
              formatCurrency(session.variance)
            ] }) }) : "-" })
          ] }, session.id)) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "summary", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Cash Flow by Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Breakdown of cash movements by transaction type" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: cashFlowSummary && cashFlowSummary.byType ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(cashFlowSummary.byType).map(([type, amount]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            getTransactionIcon(type),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium capitalize", children: type.replace("_", " ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: formatCurrency(amount) })
        ] }) }, type)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No cash flow data available" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openSessionDialog, onOpenChange: setOpenSessionDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Open Cash Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Start a new daily cash register session" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opening Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0.00",
            value: openingBalance,
            onChange: (e) => setOpeningBalance(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Enter the cash amount currently in the register" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenSessionDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleOpenSession, children: "Open Session" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: closeSessionDialog, onOpenChange: setCloseSessionDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Close Cash Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "End the current session and count the cash" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        cashFlowSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Expected Balance:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatCurrency(cashFlowSummary.expectedBalance) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Based on opening balance and all transactions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Cash Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "0.00",
              value: actualBalance,
              onChange: (e) => setActualBalance(e.target.value)
            }
          )
        ] }),
        actualBalance && cashFlowSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-4 rounded-lg ${parseFloat(actualBalance) === cashFlowSummary.expectedBalance ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          parseFloat(actualBalance) === cashFlowSummary.expectedBalance ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-yellow-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "Variance: ",
            formatCurrency(parseFloat(actualBalance) - cashFlowSummary.expectedBalance)
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Any notes about the session...",
              value: closingNotes,
              onChange: (e) => setClosingNotes(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCloseSessionDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: handleCloseSession, children: "Close Session" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: transactionDialog, onOpenChange: setTransactionDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Transaction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record a cash movement in the register" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transaction Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: transactionType, onValueChange: setTransactionType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash_in", children: "Cash In" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash_out", children: "Cash Out" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expense" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deposit", children: "Deposit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawal", children: "Withdrawal" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "0.00",
              value: transactionAmount,
              onChange: (e) => setTransactionAmount(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Description of the transaction...",
              value: transactionDescription,
              onChange: (e) => setTransactionDescription(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTransactionDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleRecordTransaction, children: "Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjustmentDialog, onOpenChange: setAdjustmentDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cash Adjustment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Make an adjustment to the cash balance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Adjustment Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "0.00 (positive or negative)",
              value: adjustmentAmount,
              onChange: (e) => setAdjustmentAmount(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Use negative for reduction, positive for addition" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Reason for the adjustment...",
              value: adjustmentReason,
              onChange: (e) => setAdjustmentReason(e.target.value),
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdjustmentDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAdjustment, disabled: !adjustmentReason, children: "Apply Adjustment" })
      ] })
    ] }) })
  ] });
}
export {
  CashRegisterScreen as default
};
