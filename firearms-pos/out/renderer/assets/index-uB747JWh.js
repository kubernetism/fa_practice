import { h as createLucideIcon, t as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, a0 as Plus, C as Card, b as CardHeader, c as CardTitle, e as CardContent, a6 as CreditCard, y as Tabs, z as TabsList, A as TabsTrigger, _ as TabsContent, d as CardDescription, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, a1 as Badge, am as FileText, aj as CircleCheckBig, al as CircleX, o as Receipt, D as DollarSign, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, I as Input, an as Textarea, ad as DialogFooter, G as Wallet } from "./index-C_D_4RtI.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-De4R63KH.js";
import { R as RefreshCw } from "./refresh-cw-DGuJjVCY.js";
import { B as Building } from "./building-CRp9GDx1.js";
import { T as TrendingUp } from "./trending-up-CBAw3Fhk.js";
import { T as TriangleAlert } from "./triangle-alert-2Pk65uWP.js";
import { P as Pencil } from "./pencil-BW5o8v0k.js";
import { T as TrendingDown } from "./trending-down-AW1Z58fM.js";
import { f as format } from "./format-Bgkn8bop.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Calculator = createLucideIcon("Calculator", [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const PiggyBank = createLucideIcon("PiggyBank", [
  [
    "path",
    {
      d: "M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z",
      key: "1ivx2i"
    }
  ],
  ["path", { d: "M2 9v1c0 1.1.9 2 2 2h1", key: "nm575m" }],
  ["path", { d: "M16 11h.01", key: "xkw8gn" }]
]);
function ChartOfAccountsScreen() {
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = reactExports.useState("accounts");
  const [accounts, setAccounts] = reactExports.useState([]);
  const [balanceSheet, setBalanceSheet] = reactExports.useState(null);
  const [incomeStatement, setIncomeStatement] = reactExports.useState(null);
  const [trialBalance, setTrialBalance] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [createDialog, setCreateDialog] = reactExports.useState(false);
  const [editDialog, setEditDialog] = reactExports.useState(false);
  const [adjustDialog, setAdjustDialog] = reactExports.useState(false);
  const [selectedAccount, setSelectedAccount] = reactExports.useState(null);
  const [adjustTarget, setAdjustTarget] = reactExports.useState("");
  const [adjustReason, setAdjustReason] = reactExports.useState("");
  const [recalculating, setRecalculating] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    accountCode: "",
    accountName: "",
    accountType: "",
    accountSubType: "",
    parentAccountId: "",
    description: "",
    normalBalance: ""
  });
  const [typeFilter, setTypeFilter] = reactExports.useState("all");
  const branchId = currentBranch?.id;
  reactExports.useEffect(() => {
    if (currentBranch) {
      loadData();
    }
  }, [branchId]);
  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, balanceSheetData, trialBalanceData] = await Promise.all([
        window.api.chartOfAccounts.getAll(),
        window.api.chartOfAccounts.getBalanceSheet(branchId),
        window.api.chartOfAccounts.getTrialBalance()
      ]);
      setAccounts(accountsData || []);
      setBalanceSheet(balanceSheetData);
      setTrialBalance(trialBalanceData);
      const now = /* @__PURE__ */ new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      const incomeData = await window.api.chartOfAccounts.getIncomeStatement(startOfMonth, endOfMonth, branchId);
      setIncomeStatement(incomeData);
    } catch (error) {
      console.error("Failed to load chart of accounts data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateAccount = async () => {
    if (!formData.accountCode || !formData.accountName || !formData.accountType || !formData.normalBalance) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await window.api.chartOfAccounts.create({
        accountCode: formData.accountCode,
        accountName: formData.accountName,
        accountType: formData.accountType,
        accountSubType: formData.accountSubType || void 0,
        parentAccountId: formData.parentAccountId && formData.parentAccountId !== "none" ? parseInt(formData.parentAccountId) : void 0,
        description: formData.description || void 0,
        normalBalance: formData.normalBalance
      });
      setCreateDialog(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to create account:", error);
      alert("Failed to create account: " + error.message);
    }
  };
  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;
    try {
      await window.api.chartOfAccounts.update(selectedAccount.id, {
        accountName: formData.accountName,
        accountSubType: formData.accountSubType || void 0,
        description: formData.description || void 0
      });
      setEditDialog(false);
      setSelectedAccount(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to update account:", error);
      alert("Failed to update account: " + error.message);
    }
  };
  const handleDeleteAccount = async (account) => {
    if (account.isSystemAccount) {
      alert("System accounts cannot be deleted");
      return;
    }
    if (!confirm(`Are you sure you want to delete account "${account.accountName}"?`)) {
      return;
    }
    try {
      await window.api.chartOfAccounts.delete(account.id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account: " + error.message);
    }
  };
  const openEditDialog = (account) => {
    setSelectedAccount(account);
    setFormData({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubType: account.accountSubType || "",
      parentAccountId: account.parentAccountId?.toString() || "",
      description: account.description || "",
      normalBalance: account.normalBalance
    });
    setEditDialog(true);
  };
  const handleRecalculateBalances = async () => {
    if (!confirm("Recalculate all account balances from journal entries? This will fix any balance discrepancies.")) {
      return;
    }
    setRecalculating(true);
    try {
      const result = await window.api.chartOfAccounts.recalculateBalances();
      if (result.success) {
        const { totalAccounts, adjustedCount, adjustments } = result.data;
        if (adjustedCount === 0) {
          alert(`All ${totalAccounts} accounts are already correct. No adjustments needed.`);
        } else {
          const details = adjustments.map((a) => `${a.accountCode}: ${formatCurrency(a.oldBalance)} → ${formatCurrency(a.newBalance)}`).join("\n");
          alert(`Recalculated ${adjustedCount} of ${totalAccounts} accounts:

${details}`);
        }
        await loadData();
      } else {
        alert("Failed to recalculate: " + result.message);
      }
    } catch (error) {
      console.error("Recalculate balances error:", error);
      alert("Failed to recalculate balances: " + error.message);
    } finally {
      setRecalculating(false);
    }
  };
  const openAdjustDialog = (account) => {
    setSelectedAccount(account);
    setAdjustTarget(account.currentBalance.toString());
    setAdjustReason("");
    setAdjustDialog(true);
  };
  const handleAdjustBalance = async () => {
    if (!selectedAccount) return;
    const target = parseFloat(adjustTarget);
    if (isNaN(target)) {
      alert("Please enter a valid number");
      return;
    }
    if (!adjustReason.trim()) {
      alert("Please provide a reason for the adjustment");
      return;
    }
    try {
      const result = await window.api.chartOfAccounts.adjustBalance(
        selectedAccount.id,
        target,
        adjustReason.trim(),
        1
        // postedBy — system/admin
      );
      if (result.success) {
        if (result.data.adjusted) {
          alert(`Balance adjusted from ${formatCurrency(result.data.oldBalance)} to ${formatCurrency(result.data.newBalance)}.
Journal entry: ${result.data.journalEntry}`);
        } else {
          alert(result.message || "Balance is already correct");
        }
        setAdjustDialog(false);
        setSelectedAccount(null);
        await loadData();
      } else {
        alert("Failed to adjust: " + result.message);
      }
    } catch (error) {
      console.error("Adjust balance error:", error);
      alert("Failed to adjust balance: " + error.message);
    }
  };
  const resetForm = () => {
    setFormData({
      accountCode: "",
      accountName: "",
      accountType: "",
      accountSubType: "",
      parentAccountId: "",
      description: "",
      normalBalance: ""
    });
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getAccountTypeIcon = (type) => {
    switch (type) {
      case "asset":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-4 w-4 text-blue-500" });
      case "liability":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-red-500" });
      case "equity":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-4 w-4 text-purple-500" });
      case "revenue":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
      case "expense":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-orange-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" });
    }
  };
  const getAccountTypeBadge = (type) => {
    const colors = {
      asset: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      liability: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      equity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      revenue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expense: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: colors[type] || "bg-gray-100 text-gray-800", children: type.charAt(0).toUpperCase() + type.slice(1) });
  };
  const filteredAccounts = typeFilter === "all" ? accounts : accounts.filter((a) => a.accountType === typeFilter);
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    const type = account.accountType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Chart of Accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Manage your accounting structure and view financial reports",
          currentBranch && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-medium", children: [
            " - ",
            currentBranch.name
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleRecalculateBalances, variant: "outline", disabled: recalculating, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4 mr-2" }),
          recalculating ? "Recalculating..." : "Recalculate Balances"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => loadData(), variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreateDialog(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Add Account"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Assets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-4 w-4 text-blue-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(balanceSheet?.assets.total || 0) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Liabilities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(balanceSheet?.liabilities.total || 0) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Equity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-4 w-4 text-purple-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-purple-600", children: formatCurrency(balanceSheet?.equity.total || 0) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Net Income (MTD)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"}`, children: formatCurrency(incomeStatement?.netIncome || 0) }) })
      ] })
    ] }),
    balanceSheet && !balanceSheet.isBalanced && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-yellow-700 dark:text-yellow-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Balance Sheet is not balanced!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
        "Assets (",
        formatCurrency(balanceSheet.assets.total),
        ") should equal Liabilities + Equity (",
        formatCurrency(balanceSheet.totalLiabilitiesAndEquity),
        ")"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "accounts", children: "Accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "balance-sheet", children: "Balance Sheet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "income-statement", children: "Income Statement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "trial-balance", children: "Trial Balance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "accounts", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "All Accounts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Chart of accounts organized by type" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asset", children: "Assets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "liability", children: "Liabilities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "equity", children: "Equity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "revenue", children: "Revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expenses" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: Object.entries(groupedAccounts).map(([type, typeAccounts]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            getAccountTypeIcon(type),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold capitalize", children: [
              type,
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              "(",
              typeAccounts.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Account Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sub Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Normal Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Current Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: typeAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode)).map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: account.accountCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                account.accountName,
                account.isSystemAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "System" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: account.accountSubType?.replace(/_/g, " ") || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: account.normalBalance }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `text-right font-medium ${account.currentBalance >= 0 ? "text-foreground" : "text-red-600"}`, children: formatCurrency(account.currentBalance) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inactive" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => openAdjustDialog(account),
                    title: "Adjust balance",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3 mr-1" }),
                      "Adjust"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => openEditDialog(account),
                    children: "Edit"
                  }
                ),
                !account.isSystemAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "text-red-600",
                    onClick: () => handleDeleteAccount(account),
                    children: "Delete"
                  }
                )
              ] }) })
            ] }, account.id)) })
          ] })
        ] }, type)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "balance-sheet", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }),
            "Balance Sheet"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "As of ",
            format(/* @__PURE__ */ new Date(), "MMMM d, yyyy")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-5 w-5 text-blue-500" }),
              "Assets"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              balanceSheet?.assets.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(account.currentBalance) })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-bold", children: "Total Assets" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-blue-600", children: formatCurrency(balanceSheet?.assets.total || 0) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5 text-red-500" }),
              "Liabilities"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              balanceSheet?.liabilities.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(account.currentBalance) })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-bold", children: "Total Liabilities" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-red-600", children: formatCurrency(balanceSheet?.liabilities.total || 0) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold mb-4 mt-6 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-5 w-5 text-purple-500" }),
              "Equity"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              balanceSheet?.equity.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(account.currentBalance) })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-bold", children: "Total Equity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-purple-600", children: formatCurrency(balanceSheet?.equity.total || 0) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Liabilities + Equity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-2", children: balanceSheet?.isBalanced ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "Balanced" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-red-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "Not Balanced" })
              ] }) })
            ] })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "income-statement", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-5 w-5" }),
            "Income Statement (Profit & Loss)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "For the period ",
            incomeStatement?.startDate,
            " to ",
            incomeStatement?.endDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-green-500" }),
              "Revenue"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              incomeStatement?.revenue.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium text-green-600", children: formatCurrency(account.currentBalance) })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 bg-green-50 dark:bg-green-950", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-bold", children: "Total Revenue" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-green-600", children: formatCurrency(incomeStatement?.revenue.total || 0) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-5 w-5 text-red-500" }),
              "Expenses"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              incomeStatement?.expenses.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium text-red-600", children: formatCurrency(account.currentBalance) })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 bg-red-50 dark:bg-red-950", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-bold", children: "Total Expenses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-bold text-red-600", children: formatCurrency(incomeStatement?.expenses.total || 0) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold", children: "Net Income" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-2xl font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"}`, children: formatCurrency(incomeStatement?.netIncome || 0) })
          ] }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "trial-balance", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5" }),
            "Trial Balance"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "As of ",
            trialBalance?.asOfDate || format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Account Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Debit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Credit" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              trialBalance?.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: account.accountCode }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getAccountTypeBadge(account.accountType) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: account.debit > 0 ? formatCurrency(account.debit) : "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: account.credit > 0 ? formatCurrency(account.credit) : "-" })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 font-bold bg-muted", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(trialBalance?.totalDebits || 0) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(trialBalance?.totalCredits || 0) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex items-center justify-center gap-2", children: trialBalance?.isBalanced ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-medium", children: "Trial Balance is balanced" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-medium", children: [
              "Trial Balance is NOT balanced (Difference: ",
              formatCurrency(Math.abs((trialBalance?.totalDebits || 0) - (trialBalance?.totalCredits || 0))),
              ")"
            ] })
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: createDialog, onOpenChange: setCreateDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { onOpenAutoFocus: (e) => e.preventDefault(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create New Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Add a new account to the chart of accounts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Code *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., 1100",
                value: formData.accountCode,
                onChange: (e) => setFormData({ ...formData, accountCode: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.accountType,
                onValueChange: (v) => setFormData({
                  ...formData,
                  accountType: v,
                  normalBalance: ["asset", "expense"].includes(v) ? "debit" : "credit"
                }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asset", children: "Asset" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "liability", children: "Liability" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "equity", children: "Equity" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "revenue", children: "Revenue" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expense" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., Accounts Receivable",
              value: formData.accountName,
              onChange: (e) => setFormData({ ...formData, accountName: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sub Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., accounts_receivable",
                value: formData.accountSubType,
                onChange: (e) => setFormData({ ...formData, accountSubType: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Normal Balance *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.normalBalance,
                onValueChange: (v) => setFormData({ ...formData, normalBalance: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "debit", children: "Debit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "credit", children: "Credit" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parent Account (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.parentAccountId,
              onValueChange: (v) => setFormData({ ...formData, parentAccountId: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select parent account" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None" }),
                  accounts.filter((a) => a.accountType === formData.accountType).map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: account.id.toString(), children: [
                    account.accountCode,
                    " - ",
                    account.accountName
                  ] }, account.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Account description...",
              value: formData.description,
              onChange: (e) => setFormData({ ...formData, description: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setCreateDialog(false);
          resetForm();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreateAccount, children: "Create Account" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editDialog, onOpenChange: setEditDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { onOpenAutoFocus: (e) => e.preventDefault(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Update account details" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formData.accountCode, disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formData.accountType, disabled: true, className: "capitalize" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: formData.accountName,
              onChange: (e) => setFormData({ ...formData, accountName: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sub Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: formData.accountSubType,
              onChange: (e) => setFormData({ ...formData, accountSubType: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: formData.description,
              onChange: (e) => setFormData({ ...formData, description: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditDialog(false);
          setSelectedAccount(null);
          resetForm();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleUpdateAccount, children: "Save Changes" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjustDialog, onOpenChange: setAdjustDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { onOpenAutoFocus: (e) => e.preventDefault(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Adjust Account Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: selectedAccount && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Set the actual balance for ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            selectedAccount.accountCode,
            " - ",
            selectedAccount.accountName
          ] }),
          ". An adjusting journal entry will be created automatically."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current Balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: selectedAccount ? formatCurrency(selectedAccount.currentBalance) : "",
                disabled: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Balance *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                placeholder: "Enter actual balance",
                value: adjustTarget,
                onChange: (e) => setAdjustTarget(e.target.value)
              }
            )
          ] })
        ] }),
        selectedAccount && adjustTarget && !isNaN(parseFloat(adjustTarget)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg ${parseFloat(adjustTarget) - selectedAccount.currentBalance >= 0 ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"}`, children: [
          "Adjustment: ",
          formatCurrency(parseFloat(adjustTarget) - selectedAccount.currentBalance)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "e.g., Bank reconciliation, opening balance correction, physical count adjustment...",
              value: adjustReason,
              onChange: (e) => setAdjustReason(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAdjustDialog(false);
          setSelectedAccount(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAdjustBalance, children: "Apply Adjustment" })
      ] })
    ] }) })
  ] });
}
export {
  ChartOfAccountsScreen as default
};
