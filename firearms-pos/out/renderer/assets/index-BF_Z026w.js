import { c as createLucideIcon, z as React, j as jsxRuntimeExports, Q as useBranch, r as reactExports, q as RefreshCw, Y as TooltipProvider, B as Button, a as LoaderCircle, v as Check, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, aj as Plus, Z as Tabs, _ as TabsList, $ as TabsTrigger, ai as TabsContent, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, ac as Badge, a0 as DollarSign, ak as Trash2, a2 as Card, ar as CardHeader, as as CardTitle, ad as FileText, aI as CardDescription, a3 as CardContent, ag as CreditCard, au as CircleCheckBig, aw as CircleX, H as Receipt, aJ as Wallet, I as Input, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, p as Textarea, al as DialogFooter } from "./index-DYepRutf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DhpXmfGL.js";
import { t as toPng, C as Camera } from "./index-5fY1HXmU.js";
import { C as Calculator } from "./calculator-BSgS4qL0.js";
import { T as TriangleAlert } from "./triangle-alert-CwlMuCO8.js";
import { P as Pencil } from "./pencil-BdvO1RzJ.js";
import { B as Building } from "./building-BCZyioUA.js";
import { T as TrendingUp } from "./trending-up-lKLAlp9u.js";
import { T as TrendingDown } from "./trending-down-e6v2IUuT.js";
import { S as Search } from "./search-BPXhvM6p.js";
import { f as format, a as CircleArrowDown, C as CircleArrowUp } from "./format-CrOFbCJF.js";
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
const CoaReportCard = React.forwardRef(
  ({ businessName, branchName, generatedAt, formatCurrency, balanceSheet, cashFlowData, cashFlowPeriod }, ref) => {
    const netIncome = balanceSheet?.netIncome ?? 0;
    const netIncomeColor = netIncome >= 0 ? "#16a34a" : "#dc2626";
    const totalEquity = (balanceSheet?.equity.total ?? 0) + netIncome;
    const s = {
      root: {
        width: 520,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
        color: "#e2e8f0",
        borderRadius: 16,
        overflow: "hidden",
        position: "absolute",
        left: -9999,
        top: -9999
      },
      header: {
        padding: "20px 24px 16px",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderBottom: "1px solid rgba(148,163,184,0.15)"
      },
      bizName: {
        fontSize: 18,
        fontWeight: 700,
        color: "#f8fafc",
        margin: 0,
        letterSpacing: "0.02em"
      },
      metaRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6
      },
      metaText: {
        fontSize: 11,
        fontWeight: 700,
        color: "#f8fafc",
        margin: 0
      },
      badge: {
        fontSize: 10,
        fontWeight: 600,
        color: "#38bdf8",
        background: "rgba(56,189,248,0.12)",
        padding: "3px 10px",
        borderRadius: 20,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
      },
      // Summary hero
      heroRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 1,
        background: "rgba(148,163,184,0.08)"
      },
      heroCell: {
        padding: "14px 12px",
        background: "#0f172a",
        textAlign: "center"
      },
      heroLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "0 0 6px"
      },
      heroValue: {
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.02em"
      },
      // Section
      section: {
        padding: "14px 24px",
        borderBottom: "1px solid rgba(148,163,184,0.08)"
      },
      sectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        margin: "0 0 10px"
      },
      row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "3px 0"
      },
      rowLabel: {
        fontSize: 11,
        color: "#94a3b8",
        margin: 0
      },
      rowValue: {
        fontSize: 12,
        fontWeight: 600,
        color: "#e2e8f0",
        margin: 0,
        fontVariantNumeric: "tabular-nums"
      },
      totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0 2px",
        borderTop: "1px solid rgba(148,163,184,0.15)",
        marginTop: 4
      },
      totalLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#f8fafc",
        margin: 0
      },
      totalValue: {
        fontSize: 13,
        fontWeight: 700,
        margin: 0,
        fontVariantNumeric: "tabular-nums"
      },
      // Footer
      footer: {
        padding: "12px 24px 10px",
        borderTop: "1px solid rgba(148,163,184,0.08)"
      },
      footerMain: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      },
      footerDate: {
        fontSize: 10,
        fontWeight: 700,
        color: "#f8fafc",
        margin: 0
      },
      footerBrand: {
        fontSize: 10,
        fontWeight: 700,
        color: "#f8fafc",
        margin: 0
      },
      devInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid rgba(148,163,184,0.06)",
        textAlign: "center"
      },
      devText: {
        fontSize: 9,
        color: "#475569",
        margin: 0,
        lineHeight: 1.5
      }
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, style: s.root, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.header, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.bizName, children: businessName || "POS System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.metaRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.metaText, children: branchName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: s.badge, children: "Chart of Accounts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.heroRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.heroCell, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.heroLabel, children: "Assets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.heroValue, color: "#38bdf8" }, children: formatCurrency(balanceSheet?.assets.total ?? 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.heroCell, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.heroLabel, children: "Liabilities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.heroValue, color: "#f87171" }, children: formatCurrency(balanceSheet?.liabilities.total ?? 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.heroCell, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.heroLabel, children: "Equity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.heroValue, color: "#a78bfa" }, children: formatCurrency(totalEquity) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.heroCell, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.heroLabel, children: "Net Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.heroValue, color: netIncomeColor }, children: formatCurrency(netIncome) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.section, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.sectionTitle, children: "Assets" }),
        balanceSheet?.assets.accounts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowLabel, children: a.accountName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowValue, children: formatCurrency(a.currentBalance) })
        ] }, a.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.totalRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.totalLabel, children: "Total Assets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.totalValue, color: "#38bdf8" }, children: formatCurrency(balanceSheet?.assets.total ?? 0) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.section, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.sectionTitle, children: "Liabilities" }),
        balanceSheet?.liabilities.accounts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowLabel, children: a.accountName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowValue, children: formatCurrency(a.currentBalance) })
        ] }, a.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.totalRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.totalLabel, children: "Total Liabilities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.totalValue, color: "#f87171" }, children: formatCurrency(balanceSheet?.liabilities.total ?? 0) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...s.section, borderBottom: "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.sectionTitle, children: "Equity" }),
        balanceSheet?.equity.accounts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowLabel, children: a.accountName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.rowValue, children: formatCurrency(a.currentBalance) })
        ] }, a.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowLabel, fontStyle: "italic" }, children: "Current Net Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowValue, color: netIncomeColor }, children: formatCurrency(netIncome) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.totalRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.totalLabel, children: "Total Equity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.totalValue, color: "#a78bfa" }, children: formatCurrency(totalEquity) })
        ] })
      ] }),
      cashFlowData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.section, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: s.sectionTitle, children: [
          "Cash Flow Summary ",
          cashFlowPeriod ? `(${cashFlowPeriod})` : ""
        ] }),
        Object.entries(cashFlowData.summaryByType).map(([type, data]) => {
          const isInflow = ["sale", "ar_collection", "deposit", "adjustment_add"].includes(type);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: s.rowLabel, children: [
              type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              " (",
              data.count,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { ...s.rowValue, color: isInflow ? "#34d399" : "#f87171" }, children: [
              isInflow ? "+" : "-",
              formatCurrency(Math.abs(data.totalAmount))
            ] })
          ] }, type);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid rgba(148,163,184,0.15)", margin: "6px 0" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowLabel, fontWeight: 600 }, children: "Total Inflows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowValue, color: "#34d399" }, children: formatCurrency(cashFlowData.totalInflows) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.row, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowLabel, fontWeight: 600 }, children: "Total Outflows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.rowValue, color: "#f87171" }, children: formatCurrency(cashFlowData.totalOutflows) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.totalRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.totalLabel, children: "Net Cash Flow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { ...s.totalValue, color: cashFlowData.netCashFlow >= 0 ? "#34d399" : "#f87171" }, children: formatCurrency(cashFlowData.netCashFlow) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.footer, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: s.footerMain, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.footerDate, children: generatedAt }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.footerBrand, children: businessName || "POS System" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: s.devInfo, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: s.devText, children: "Developed by Syed Safdar Ali Shah · programmersafdar@live.com · 0316-0917600" }) })
      ] })
    ] });
  }
);
CoaReportCard.displayName = "CoaReportCard";
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
  const [isCopying, setIsCopying] = reactExports.useState(false);
  const [isCopied, setIsCopied] = reactExports.useState(false);
  const [businessName, setBusinessName] = reactExports.useState("");
  const reportRef = reactExports.useRef(null);
  const [cashFlowData, setCashFlowData] = reactExports.useState(null);
  const [cashFlowLoading, setCashFlowLoading] = reactExports.useState(false);
  const [cfStartDate, setCfStartDate] = reactExports.useState(() => {
    const now = /* @__PURE__ */ new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [cfEndDate, setCfEndDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
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
  const loadData = reactExports.useCallback(async () => {
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
  }, [branchId]);
  const loadCashFlow = reactExports.useCallback(async () => {
    if (!branchId) return;
    setCashFlowLoading(true);
    try {
      const result = await window.api.chartOfAccounts.getCashFlowDetail({
        branchId,
        startDate: cfStartDate,
        endDate: cfEndDate
      });
      if (result.success && result.data) {
        const summaryMap = {};
        if (Array.isArray(result.data.summaryByType)) {
          for (const item of result.data.summaryByType) {
            summaryMap[item.transactionType] = {
              count: Number(item.count),
              totalAmount: Number(item.totalAmount)
            };
          }
        } else {
          Object.assign(summaryMap, result.data.summaryByType);
        }
        setCashFlowData({
          transactions: result.data.transactions || [],
          summaryByType: summaryMap,
          totalInflows: result.data.totalInflows,
          totalOutflows: result.data.totalOutflows,
          netCashFlow: result.data.netCashFlow
        });
      }
    } catch (error) {
      console.error("Failed to load cash flow data:", error);
    } finally {
      setCashFlowLoading(false);
    }
  }, [branchId, cfStartDate, cfEndDate]);
  reactExports.useEffect(() => {
    if (activeTab === "cash-flow" && branchId) {
      loadCashFlow();
    }
  }, [activeTab, loadCashFlow]);
  reactExports.useEffect(() => {
    const fetchBizName = async () => {
      try {
        const result = await window.api.businessSettings.getGlobal();
        if (result.success && result.data?.businessName) {
          setBusinessName(result.data.businessName);
        }
      } catch {
      }
    };
    fetchBizName();
  }, []);
  const handleCopySnapshot = reactExports.useCallback(async () => {
    if (!balanceSheet || !reportRef.current || isCopying) return;
    setIsCopying(true);
    try {
      const node = reportRef.current;
      const prevPos = node.style.position;
      const prevLeft = node.style.left;
      const prevTop = node.style.top;
      node.style.position = "fixed";
      node.style.left = "0px";
      node.style.top = "0px";
      node.style.zIndex = "-1";
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#0f172a"
      });
      node.style.position = prevPos;
      node.style.left = prevLeft;
      node.style.top = prevTop;
      node.style.zIndex = "";
      await window.api.clipboard.copyImage(dataUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (error) {
      console.error("Failed to capture COA snapshot:", error);
    } finally {
      setIsCopying(false);
    }
  }, [balanceSheet, isCopying]);
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
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-4 w-4 text-blue-400" });
      case "liability":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-red-400" });
      case "equity":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-4 w-4 text-purple-400" });
      case "revenue":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-400" });
      case "expense":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-orange-400" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" });
    }
  };
  const getAccountTypeBadge = (type) => {
    const colors = {
      asset: "bg-blue-500/10 text-blue-400",
      liability: "bg-red-500/10 text-red-400",
      equity: "bg-purple-500/10 text-purple-400",
      revenue: "bg-green-500/10 text-green-400",
      expense: "bg-orange-500/10 text-orange-400"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${colors[type] || "bg-muted text-muted-foreground"} text-[10px] px-1.5 py-0`, children: type.charAt(0).toUpperCase() + type.slice(1) });
  };
  const filteredAccounts = reactExports.useMemo(
    () => typeFilter === "all" ? accounts : accounts.filter((a) => a.accountType === typeFilter),
    [accounts, typeFilter]
  );
  const groupedAccounts = reactExports.useMemo(
    () => filteredAccounts.reduce((acc, account) => {
      const type = account.accountType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {}),
    [filteredAccounts]
  );
  const accountStats = reactExports.useMemo(() => ({
    assets: balanceSheet?.assets.total || 0,
    liabilities: balanceSheet?.liabilities.total || 0,
    equity: (balanceSheet?.equity.total || 0) + (balanceSheet?.netIncome || 0),
    netIncome: balanceSheet?.netIncome ?? incomeStatement?.netIncome ?? 0
  }), [balanceSheet, incomeStatement]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Chart of Accounts" }),
        currentBranch && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground", children: currentBranch.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400", children: [
          "Assets ",
          formatCurrency(accountStats.assets)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400", children: [
          "Liabilities ",
          formatCurrency(accountStats.liabilities)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400", children: [
          "Equity ",
          formatCurrency(accountStats.equity)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-medium ${accountStats.netIncome >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`, children: [
          "Net Income ",
          formatCurrency(accountStats.netIncome)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleCopySnapshot,
            disabled: !balanceSheet || isCopying,
            className: "h-8 px-2 gap-1.5 text-xs",
            children: isCopying ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
              " Capturing..."
            ] }) : isCopied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-green-500" }),
              " Copied!"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5" }),
              " Screenshot"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleRecalculateBalances, variant: "outline", size: "sm", disabled: recalculating, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: recalculating ? "Recalculating..." : "Recalculate Balances" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => loadData(), variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreateDialog(true), size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Account"
        ] })
      ] })
    ] }),
    balanceSheet && !balanceSheet.isBalanced && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-yellow-400 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Balance Sheet is not balanced!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-yellow-400/80", children: [
        "Assets (",
        formatCurrency(balanceSheet.assets.total),
        ") should equal Liabilities + Equity (",
        formatCurrency(balanceSheet.totalLiabilitiesAndEquity),
        ")"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "accounts", className: "h-6 px-2 text-xs", children: "Accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "balance-sheet", className: "h-6 px-2 text-xs", children: "Balance Sheet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "income-statement", className: "h-6 px-2 text-xs", children: "Income Statement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "trial-balance", className: "h-6 px-2 text-xs", children: "Trial Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cash-flow", className: "h-6 px-2 text-xs", children: "Cash Flow" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "accounts", className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-muted-foreground", children: [
            filteredAccounts.length,
            " account",
            filteredAccounts.length !== 1 ? "s" : ""
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asset", children: "Assets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "liability", children: "Liabilities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "equity", children: "Equity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "revenue", children: "Revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expenses" })
            ] })
          ] })
        ] }),
        Object.entries(groupedAccounts).map(([type, typeAccounts]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            getAccountTypeIcon(type),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold capitalize", children: [
              type,
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground", children: typeAccounts.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Sub Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Normal Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Current Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: typeAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode)).map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-mono text-xs", children: account.accountCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
                account.accountName,
                account.isSystemAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "System" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 capitalize text-xs text-muted-foreground", children: account.accountSubType?.replace(/_/g, " ") || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0", children: account.normalBalance }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `py-1.5 text-right text-sm font-medium ${account.currentBalance >= 0 ? "text-foreground" : "text-red-500"}`, children: formatCurrency(account.currentBalance) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: account.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500/10 text-green-400 text-[10px] px-1.5 py-0", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "Inactive" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-7 w-7",
                      onClick: () => openAdjustDialog(account),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3.5 w-3.5" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Adjust Balance" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-7 w-7",
                      onClick: () => openEditDialog(account),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit Account" })
                ] }),
                !account.isSystemAccount && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-7 w-7 text-red-500 hover:text-red-400",
                      onClick: () => handleDeleteAccount(account),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Delete Account" })
                ] })
              ] }) })
            ] }, account.id)) })
          ] }) })
        ] }, type))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "balance-sheet", className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            "Balance Sheet"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-xs", children: [
            "As of ",
            format(/* @__PURE__ */ new Date(), "MMMM d, yyyy")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-4 w-4 text-blue-400" }),
              "Assets"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Balance" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                balanceSheet?.assets.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium", children: formatCurrency(account.currentBalance) })
                ] }, account.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-bold text-sm", children: "Total Assets" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-bold text-sm text-blue-500", children: formatCurrency(balanceSheet?.assets.total || 0) })
                ] })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-red-400" }),
                "Liabilities"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Balance" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                  balanceSheet?.liabilities.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium", children: formatCurrency(account.currentBalance) })
                  ] }, account.id)),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 h-9", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-bold text-sm", children: "Total Liabilities" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-bold text-sm text-red-500", children: formatCurrency(balanceSheet?.liabilities.total || 0) })
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-4 w-4 text-purple-400" }),
                "Equity"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Balance" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                  balanceSheet?.equity.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium", children: formatCurrency(account.currentBalance) })
                  ] }, account.id)),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm italic", children: "Current Net Income" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `py-1.5 text-right text-sm font-medium ${(balanceSheet?.netIncome || 0) >= 0 ? "text-green-500" : "text-red-500"}`, children: formatCurrency(balanceSheet?.netIncome || 0) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 h-9", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-bold text-sm", children: "Total Equity" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-bold text-sm text-purple-500", children: formatCurrency((balanceSheet?.equity.total || 0) + (balanceSheet?.netIncome || 0)) })
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Liabilities + Equity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-1.5", children: balanceSheet?.isBalanced ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-500 text-sm", children: "Balanced" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 text-sm", children: "Not Balanced" })
              ] }) })
            ] })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "income-statement", className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4" }),
            "Income Statement (Profit & Loss)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-xs", children: [
            "For the period ",
            incomeStatement?.startDate,
            " to ",
            incomeStatement?.endDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-400" }),
              "Revenue"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Amount" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                incomeStatement?.revenue.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium text-green-500", children: formatCurrency(account.currentBalance) })
                ] }, account.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 bg-green-500/10 h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-bold text-sm", children: "Total Revenue" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-bold text-sm text-green-500", children: formatCurrency(incomeStatement?.revenue.total || 0) })
                ] })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-red-400" }),
              "Expenses"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Amount" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                incomeStatement?.expenses.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium text-red-500", children: formatCurrency(account.currentBalance) })
                ] }, account.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 bg-red-500/10 h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-bold text-sm", children: "Total Expenses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right font-bold text-sm text-red-500", children: formatCurrency(incomeStatement?.expenses.total || 0) })
                ] })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-lg bg-blue-500/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold", children: "Net Income" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-lg font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? "text-green-500" : "text-red-500"}`, children: formatCurrency(incomeStatement?.netIncome || 0) })
          ] }) }),
          incomeStatement && (() => {
            const totalRevenue = incomeStatement.revenue.total || 0;
            const totalExpenses = incomeStatement.expenses.total || 0;
            const netIncome = incomeStatement.netIncome || 0;
            const cogsAccount = incomeStatement.expenses.accounts.find((a) => a.accountCode === "5000");
            const cogsAmount = cogsAccount?.currentBalance || 0;
            const grossProfit = totalRevenue - cogsAmount;
            const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue * 100 : 0;
            const operatingExpenses = totalExpenses - cogsAmount;
            const isNegative = netIncome < 0;
            const deficit = Math.abs(netIncome);
            const sortedExpenses = [...incomeStatement.expenses.accounts].filter((a) => a.currentBalance > 0).sort((a, b) => b.currentBalance - a.currentBalance);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-3.5 w-3.5" }),
                  "Profitability Analysis"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sales Revenue" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-500", children: formatCurrency(totalRevenue) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cost of Goods Sold" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-red-500", children: formatCurrency(cogsAmount) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Gross Profit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${grossProfit >= 0 ? "text-green-500" : "text-red-500"}`, children: formatCurrency(grossProfit) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Gross Margin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${grossMargin >= 30 ? "text-green-500" : grossMargin >= 15 ? "text-yellow-500" : "text-red-500"}`, children: [
                      grossMargin.toFixed(1),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Operating Expenses" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-red-500", children: formatCurrency(operatingExpenses) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between p-2 rounded bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Net Margin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${netIncome >= 0 ? "text-green-500" : "text-red-500"}`, children: [
                      totalRevenue > 0 ? (netIncome / totalRevenue * 100).toFixed(1) : "0.0",
                      "%"
                    ] })
                  ] })
                ] })
              ] }),
              totalExpenses > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
                  "Expense Breakdown by Impact"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: sortedExpenses.map((account) => {
                  const pct = account.currentBalance / totalExpenses * 100;
                  const pctOfRevenue = totalRevenue > 0 ? account.currentBalance / totalRevenue * 100 : 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground truncate mr-2", children: [
                        account.accountName,
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60 ml-1", children: [
                          "(",
                          account.accountCode,
                          ")"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                          pct.toFixed(1),
                          "% of expenses"
                        ] }),
                        totalRevenue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `${pctOfRevenue > 50 ? "text-red-400" : "text-muted-foreground/60"}`, children: [
                          "(",
                          pctOfRevenue.toFixed(1),
                          "% of revenue)"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium w-24 text-right", children: formatCurrency(account.currentBalance) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted/30 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `h-full rounded-full transition-all ${pctOfRevenue > 50 ? "bg-red-500" : pctOfRevenue > 25 ? "bg-yellow-500" : "bg-blue-500/60"}`,
                        style: { width: `${Math.min(pct, 100)}%` }
                      }
                    ) })
                  ] }, account.id);
                }) })
              ] }),
              isNegative && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-400 text-sm font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
                  "Net Loss Detected: ",
                  formatCurrency(deficit)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: grossProfit < 0 ? `Cost of goods sold (${formatCurrency(cogsAmount)}) exceeds total revenue (${formatCurrency(totalRevenue)}). Your product cost prices may be higher than selling prices, or returns have reduced revenue significantly.` : operatingExpenses > grossProfit ? `Gross profit of ${formatCurrency(grossProfit)} is not enough to cover operating expenses of ${formatCurrency(operatingExpenses)}. Consider reducing expenses or increasing prices/volume.` : `Total expenses of ${formatCurrency(totalExpenses)} exceed total revenue of ${formatCurrency(totalRevenue)}.` })
              ] })
            ] });
          })()
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "trial-balance", className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
            "Trial Balance"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-xs", children: [
            "As of ",
            trialBalance?.asOfDate || format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Account Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Debit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Credit" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              trialBalance?.accounts.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-mono text-xs", children: account.accountCode }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: account.accountName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getAccountTypeBadge(account.accountType) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm", children: account.debit > 0 ? formatCurrency(account.debit) : "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm", children: account.credit > 0 ? formatCurrency(account.credit) : "-" })
              ] }, account.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-t-2 font-bold bg-muted h-9", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "py-1.5 text-sm", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm", children: formatCurrency(trialBalance?.totalDebits || 0) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm", children: formatCurrency(trialBalance?.totalCredits || 0) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center justify-center gap-2", children: trialBalance?.isBalanced ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-500 font-medium text-sm", children: "Trial Balance is balanced" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-medium text-sm", children: [
              "Trial Balance is NOT balanced (Difference: ",
              formatCurrency(Math.abs((trialBalance?.totalDebits || 0) - (trialBalance?.totalCredits || 0))),
              ")"
            ] })
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cash-flow", className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }),
              "Cash Flow Summary"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Detailed cash transactions for selected period" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: cfStartDate,
                onChange: (e) => setCfStartDate(e.target.value),
                className: "h-8 w-36 text-xs"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "to" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: cfEndDate,
                onChange: (e) => setCfEndDate(e.target.value),
                className: "h-8 w-36 text-xs"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8", onClick: loadCashFlow, disabled: cashFlowLoading, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 mr-1" }),
              "Filter"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: cashFlowLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : cashFlowData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-green-500/5 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "h-4 w-4 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Total Inflows" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-green-500", children: formatCurrency(cashFlowData.totalInflows) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-red-500/5 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4 text-red-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Total Outflows" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-red-500", children: formatCurrency(cashFlowData.totalOutflows) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-blue-500/5 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-blue-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Net Cash Flow" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${cashFlowData.netCashFlow >= 0 ? "text-green-500" : "text-red-500"}`, children: formatCurrency(cashFlowData.netCashFlow) })
            ] })
          ] }),
          Object.keys(cashFlowData.summaryByType).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Breakdown by Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-center", children: "Transactions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Total Amount" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Object.entries(cashFlowData.summaryByType).map(([type, data]) => {
                const isInflow = ["sale", "ar_collection", "deposit", "adjustment_add"].includes(type);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm capitalize", children: type.replace(/_/g, " ") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-center text-sm", children: data.count }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: `py-1.5 text-right text-sm font-medium ${isInflow ? "text-green-500" : "text-red-500"}`, children: [
                    isInflow ? "+" : "-",
                    formatCurrency(Math.abs(data.totalAmount))
                  ] })
                ] }, type);
              }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2", children: [
              "Transactions (",
              cashFlowData.transactions.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden max-h-[400px] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 sticky top-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Inflow" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-right", children: "Outflow" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase", children: "Reference" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: cashFlowData.transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground text-sm", children: "No transactions found for this period" }) }) : cashFlowData.transactions.map((txn) => {
                const isInflow = ["sale", "ar_collection", "deposit", "adjustment_add"].includes(txn.transactionType);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs", children: format(new Date(txn.transactionDate || txn.sessionDate), "MMM d, yyyy") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 capitalize", children: txn.transactionType.replace(/_/g, " ") }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground max-w-[200px] truncate", children: txn.description || "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium text-green-500", children: isInflow ? formatCurrency(Math.abs(txn.amount)) : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium text-red-500", children: !isInflow ? formatCurrency(Math.abs(txn.amount)) : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: txn.referenceType ? `${txn.referenceType}${txn.referenceId ? `#${txn.referenceId}` : ""}` : "-" })
                ] }, txn.id);
              }) })
            ] }) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32 text-muted-foreground text-sm", children: "Select a date range and click Filter to load cash flow data" }) })
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
        selectedAccount && adjustTarget && !isNaN(parseFloat(adjustTarget)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg text-sm ${parseFloat(adjustTarget) - selectedAccount.currentBalance >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`, children: [
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
    ] }) }),
    balanceSheet && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CoaReportCard,
      {
        ref: reportRef,
        businessName,
        branchName: currentBranch?.name || "Branch",
        generatedAt: (/* @__PURE__ */ new Date()).toLocaleString(),
        formatCurrency,
        balanceSheet,
        cashFlowData: cashFlowData || void 0,
        cashFlowPeriod: cashFlowData ? `${cfStartDate} to ${cfEndDate}` : void 0
      }
    )
  ] }) });
}
export {
  ChartOfAccountsScreen as default
};
