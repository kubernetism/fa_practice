import { u as useBranch, a0 as useCurrency, r as reactExports, j as jsxRuntimeExports, a1 as BadgePercent, T as TooltipProvider, B as Button, P as Plus, a2 as Card, a3 as CardContent, v as DollarSign, w as Clock, a4 as Users, I as Input, X, S as Select, a as SelectTrigger, b as SelectValue, e as SelectContent, f as SelectItem, R as Receipt, i as Badge, k as Tooltip, l as TooltipTrigger, m as TooltipContent, G as RotateCcw, n as Trash2, C as ChevronRight, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, a5 as Tabs, a6 as TabsList, a7 as TabsTrigger, a8 as UserPlus, a9 as TabsContent, L as Label, x as Textarea, t as DialogFooter } from "./index-Cu80Xm8q.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Djk4AHR4.js";
import { R as ReversalRequestModal } from "./reversal-request-modal-kIrGOsh_.js";
import { R as ReversalStatusBadge } from "./reversal-status-badge-DojOtI1m.js";
import { C as CircleCheck } from "./circle-check-DZjyueEm.js";
import { S as Search } from "./search-CFbXpdL1.js";
import { B as Ban } from "./ban-CzfDLQQq.js";
import { T as TrendingUp } from "./trending-up-QWgB5YEU.js";
import { P as Pencil } from "./pencil-DA8DdIjU.js";
import { C as ChevronLeft } from "./chevron-left-DIAUXRGu.js";
import "./triangle-alert-DmAUyCVZ.js";
const initialFormData = {
  saleId: "",
  commissionType: "referral",
  baseAmount: "",
  rate: "",
  referralPersonId: "",
  userId: "",
  notes: ""
};
const ITEMS_PER_PAGE = 12;
function CommissionsScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency } = useCurrency();
  const [commissions, setCommissions] = reactExports.useState([]);
  const [referralPersons, setReferralPersons] = reactExports.useState([]);
  const [availableInvoices, setAvailableInvoices] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [typeFilter, setTypeFilter] = reactExports.useState("all");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingCommission, setEditingCommission] = reactExports.useState(null);
  const [selectedTab, setSelectedTab] = reactExports.useState("referral");
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTarget, setReversalTarget] = reactExports.useState(null);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  reactExports.useEffect(() => {
    if (currentBranch) {
      fetchInitialData();
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);
  const fetchInitialData = async () => {
    await Promise.all([fetchCommissions(), fetchReferralPersons()]);
  };
  const fetchCommissions = async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.commissions.getAll({ page: 1, limit: 100, branchId: currentBranch.id });
      if (response?.success && response?.data) {
        const filteredData = response.data.filter(
          (item) => item.commission.branchId === currentBranch.id
        );
        setCommissions(filteredData.map((item) => ({
          ...item.commission,
          user: item.user,
          referralPerson: item.referralPerson,
          sale: item.sale
        })));
      } else {
        setCommissions([]);
      }
    } catch (error) {
      console.error("Failed to fetch commissions:", error);
      setCommissions([]);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchReferralPersons = async () => {
    try {
      const response = await window.api.referralPersons.getForSelect();
      if (response?.success && response?.data) {
        setReferralPersons(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch referral persons:", error);
    }
  };
  const fetchAvailableInvoices = async (referralPersonId) => {
    try {
      const response = await window.api.commissions.getAvailableInvoices(referralPersonId);
      if (response?.success && response?.data) {
        setAvailableInvoices(response.data);
      } else {
        setAvailableInvoices([]);
      }
    } catch (error) {
      console.error("Failed to fetch available invoices:", error);
      setAvailableInvoices([]);
    }
  };
  const handleOpenDialog = (commission, mode = "referral") => {
    setSelectedTab(mode);
    if (commission) {
      setEditingCommission(commission);
      setFormData({
        saleId: commission.saleId.toString(),
        commissionType: commission.commissionType,
        baseAmount: commission.baseAmount.toString(),
        rate: commission.rate.toString(),
        referralPersonId: commission.referralPersonId?.toString() || "",
        userId: commission.userId?.toString() || "",
        notes: commission.notes || ""
      });
    } else {
      setEditingCommission(null);
      setFormData({
        ...initialFormData,
        commissionType: mode === "referral" ? "referral" : "sale"
      });
    }
    fetchAvailableInvoices();
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCommission(null);
    setFormData(initialFormData);
    setAvailableInvoices([]);
  };
  const handleReferralPersonChange = (referralPersonId) => {
    setFormData({ ...formData, referralPersonId });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentBranch) {
      alert("Please select a branch first");
      return;
    }
    const isReferralCommission = formData.commissionType === "referral";
    if (isReferralCommission && !formData.referralPersonId) {
      alert("Please select a referral person");
      return;
    }
    if (!isReferralCommission && !formData.userId) {
      alert("Please select an employee");
      return;
    }
    if (!formData.saleId) {
      alert("Please select a sale/invoice");
      return;
    }
    if (!formData.baseAmount || !formData.rate) {
      alert("Please fill in base amount and rate");
      return;
    }
    const baseAmount = parseFloat(formData.baseAmount);
    const rate = parseFloat(formData.rate);
    if (baseAmount <= 0 || rate <= 0) {
      alert("Base amount and rate must be greater than 0");
      return;
    }
    try {
      const commissionData = {
        saleId: parseInt(formData.saleId),
        branchId: currentBranch.id,
        commissionType: formData.commissionType,
        baseAmount,
        rate,
        notes: formData.notes || void 0,
        referralPersonId: formData.referralPersonId ? parseInt(formData.referralPersonId) : void 0,
        userId: formData.userId ? parseInt(formData.userId) : void 0
      };
      if (editingCommission) {
        const response = await window.api.commissions.update(editingCommission.id, commissionData);
        if (!response.success) {
          alert(response.message || "Failed to update commission");
          return;
        }
      } else {
        const response = await window.api.commissions.create(commissionData);
        if (!response.success) {
          alert(response.message || "Failed to create commission");
          return;
        }
      }
      await fetchCommissions();
      await fetchReferralPersons();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save commission:", error);
      alert("Failed to save commission. Please try again.");
    }
  };
  const handleDelete = async (commissionId) => {
    if (!confirm("Are you sure you want to delete this commission?")) {
      return;
    }
    try {
      const response = await window.api.commissions.delete(commissionId);
      if (response.success) {
        await fetchCommissions();
        await fetchReferralPersons();
      } else {
        alert(response.message || "Failed to delete commission");
      }
    } catch (error) {
      console.error("Failed to delete commission:", error);
      alert("Failed to delete commission. Please try again.");
    }
  };
  const handleApprove = async (id) => {
    try {
      const response = await window.api.commissions.approve([id]);
      if (response.success) {
        await fetchCommissions();
      } else {
        alert(response.message || "Failed to approve commission");
      }
    } catch (error) {
      console.error("Failed to approve commission:", error);
    }
  };
  const handleMarkPaid = async (id) => {
    try {
      const response = await window.api.commissions.markPaid([id]);
      if (response.success) {
        await fetchCommissions();
        await fetchReferralPersons();
      } else {
        alert(response.message || "Failed to mark commission as paid");
      }
    } catch (error) {
      console.error("Failed to mark commission as paid:", error);
    }
  };
  const filteredCommissions = reactExports.useMemo(() => commissions.filter((commission) => {
    const matchesSearch = commission.sale?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || commission.referralPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || commission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    const matchesType = typeFilter === "all" || commission.commissionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }), [commissions, searchTerm, statusFilter, typeFilter]);
  const stats = reactExports.useMemo(() => {
    const total = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const paid = filteredCommissions.filter((c) => c.status === "paid");
    const paidAmt = paid.reduce((sum, c) => sum + c.commissionAmount, 0);
    const pending = filteredCommissions.filter((c) => c.status === "pending");
    const pendingAmt = pending.reduce((sum, c) => sum + c.commissionAmount, 0);
    const approved = filteredCommissions.filter((c) => c.status === "approved");
    const approvedAmt = approved.reduce((sum, c) => sum + c.commissionAmount, 0);
    const cancelled = filteredCommissions.filter((c) => c.status === "cancelled");
    const referralCount = filteredCommissions.filter((c) => c.commissionType === "referral").length;
    const employeeCount = filteredCommissions.filter((c) => c.commissionType === "sale").length;
    const avgRate = filteredCommissions.length > 0 ? filteredCommissions.reduce((sum, c) => sum + c.rate, 0) / filteredCommissions.length : 0;
    return { total, paid, paidAmt, pending, pendingAmt, approved, approvedAmt, cancelled, referralCount, employeeCount, avgRate };
  }, [filteredCommissions]);
  const paginatedCommissions = reactExports.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCommissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCommissions, currentPage]);
  const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE) || 1;
  const statusConfig = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    approved: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    paid: { icon: CircleCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    cancelled: { icon: Ban, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BadgePercent, { className: "w-6 h-6 animate-pulse text-primary mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading commissions..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t-2 border-primary/30 bg-background border-b border-border px-5 py-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded bg-primary/10 border border-primary/20 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgePercent, { className: "w-4 h-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold leading-tight tracking-wide", children: "Commission Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-tight", children: "Track referral & employee commissions across sales" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8 text-xs shrink-0", onClick: () => handleOpenDialog(void 0, "referral"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
        "New Commission"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1 rounded bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-3 h-3 text-primary" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight", children: formatCurrency(stats.total) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              filteredCommissions.length,
              " entries"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              "Avg ",
              stats.avgRate.toFixed(1),
              "%"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1 rounded bg-emerald-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-emerald-500" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400", children: formatCurrency(stats.paidAmt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-emerald-600 dark:text-emerald-400", children: [
              stats.paid.length,
              " paid"
            ] }),
            stats.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                (stats.paidAmt / stats.total * 100).toFixed(0),
                "% of total"
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1 rounded bg-amber-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 text-amber-500" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400", children: formatCurrency(stats.pendingAmt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-amber-600 dark:text-amber-400", children: [
              stats.pending.length,
              " awaiting"
            ] }),
            stats.approvedAmt > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-blue-500", children: [
                formatCurrency(stats.approvedAmt),
                " approved"
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Breakdown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1 rounded bg-blue-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3 h-3 text-blue-500" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight", children: stats.referralCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Referral" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight", children: stats.employeeCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Employee" })
            ] }),
            stats.cancelled.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-border" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums tracking-tight text-red-500", children: stats.cancelled.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Cancelled" })
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by invoice, person, or employee...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "h-8 pl-8 text-sm"
            }
          ),
          searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSearchTerm(""),
              className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Type" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "referral", children: "Referral" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sale", children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bonus", children: "Bonus" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: filteredCommissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-full bg-muted mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-5 h-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No commissions found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: searchTerm || statusFilter !== "all" || typeFilter !== "all" ? "Try adjusting your filters" : "Create your first commission to get started" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40 hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[40px]", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Person / Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Sale Amt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-center", children: "Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Commission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-center", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-center w-[100px]", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedCommissions.map((commission, idx) => {
          const sc = statusConfig[commission.status] || statusConfig.pending;
          const StatusIcon = sc.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-[11px] text-muted-foreground tabular-nums", children: (currentPage - 1) * ITEMS_PER_PAGE + idx + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1 rounded bg-muted shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-3 h-3 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: commission.sale?.invoiceNumber || `Sale #${commission.saleId}` }),
                commission.sale?.saleDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: new Date(commission.sale.saleDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: commission.commissionType === "referral" ? commission.referralPerson?.name || "—" : commission.user?.fullName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: `text-[9px] px-1.5 py-0 mt-0.5 ${commission.commissionType === "referral" ? "border-violet-500/30 text-violet-600 dark:text-violet-400" : commission.commissionType === "bonus" ? "border-amber-500/30 text-amber-600 dark:text-amber-400" : "border-blue-500/30 text-blue-600 dark:text-blue-400"}`,
                  children: commission.commissionType
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums text-muted-foreground", children: formatCurrency(commission.baseAmount) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-sm tabular-nums font-medium", children: [
              commission.rate,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "%" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tabular-nums text-primary", children: formatCurrency(commission.commissionAmount) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: `text-[10px] px-1.5 py-0 gap-1 ${sc.color} ${sc.bg} ${sc.border}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-2.5 h-2.5" }),
                    commission.status
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "commission", entityId: commission.id })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
              commission.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => handleApprove(commission.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-blue-500" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: "Approve" })
              ] }),
              commission.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => handleMarkPaid(commission.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3.5 w-3.5 text-emerald-500" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: "Mark Paid" })
              ] }),
              commission.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => {
                      setReversalTarget(commission);
                      setIsReversalModalOpen(true);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: "Reversal" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => handleOpenDialog(commission),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: "Edit" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => handleDelete(commission.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: "Delete" })
              ] })
            ] }) })
          ] }, commission.id);
        }) })
      ] }) }),
      filteredCommissions.length > ITEMS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing ",
          (currentPage - 1) * ITEMS_PER_PAGE + 1,
          "–",
          Math.min(currentPage * ITEMS_PER_PAGE, filteredCommissions.length),
          " of ",
          filteredCommissions.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              className: "h-7 w-7",
              disabled: currentPage === 1,
              onClick: () => setCurrentPage((p) => p - 1),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[3rem] text-center tabular-nums", children: [
            currentPage,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              className: "h-7 w-7",
              disabled: currentPage === totalPages,
              onClick: () => setCurrentPage((p) => p + 1),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCommission ? "Edit Commission" : "Create New Commission" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingCommission ? "Update commission information below." : "Select an invoice and referral person/employee to create a commission." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: selectedTab, onValueChange: (v) => setSelectedTab(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "referral", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-2" }),
            "Referral Commission"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "employee", children: "Employee Commission" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "referral", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "referralPerson", children: "Referral Person *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.referralPersonId,
                  onValueChange: handleReferralPersonChange,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select referral person" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: referralPersons.map((rp) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: rp.id.toString(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: rp.name }),
                      rp.commissionRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
                        "(Default: ",
                        rp.commissionRate,
                        "%)"
                      ] })
                    ] }) }, rp.id)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "saleId-referral", children: "Select Invoice *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.saleId,
                  onValueChange: (v) => setFormData({ ...formData, saleId: v }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select invoice" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      availableInvoices.map((sale) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: sale.id.toString(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between w-full pr-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sale.invoiceNumber }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatCurrency(sale.totalAmount || 0) })
                      ] }) }, sale.id)),
                      availableInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-sm text-muted-foreground text-center", children: "No completed invoices available" })
                    ] })
                  ]
                }
              )
            ] }),
            formData.saleId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "baseAmount-referral", children: "Base Amount *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "baseAmount-referral",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.baseAmount,
                    onChange: (e) => setFormData({ ...formData, baseAmount: e.target.value }),
                    placeholder: "0.00",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Amount from sale that commission is based on" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rate-referral", children: "Commission Rate (%) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "rate-referral",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    max: "100",
                    value: formData.rate,
                    onChange: (e) => setFormData({ ...formData, rate: e.target.value }),
                    placeholder: "0.00",
                    required: true
                  }
                ),
                formData.referralPersonId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: referralPersons.find(
                  (rp) => rp.id === parseInt(formData.referralPersonId)
                )?.commissionRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Default for this person:",
                  " ",
                  referralPersons.find(
                    (rp) => rp.id === parseInt(formData.referralPersonId)
                  )?.commissionRate,
                  "%"
                ] }) })
              ] })
            ] }),
            formData.baseAmount && formData.rate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-4 bg-muted rounded-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Commission Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(parseFloat(formData.baseAmount) * parseFloat(formData.rate) / 100) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes-referral", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "notes-referral",
                  value: formData.notes,
                  onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
                  placeholder: "Additional notes about this commission...",
                  rows: 3
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
              editingCommission ? "Update" : "Create",
              " Commission"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "employee", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-muted/50 rounded-md border border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
              'For referral commissions, use the "Referral Commission" tab above.'
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "userId", children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.userId || "none",
                  onValueChange: (v) => setFormData({ ...formData, userId: v === "none" ? "" : v }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee (optional)" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No employee selected" }) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "saleId-employee", children: "Select Invoice *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "saleId-employee",
                  type: "number",
                  value: formData.saleId,
                  onChange: (e) => setFormData({ ...formData, saleId: e.target.value }),
                  placeholder: "Enter sale/invoice ID",
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter the sale/invoice ID to create commission for" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "baseAmount-employee", children: "Base Amount *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "baseAmount-employee",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.baseAmount,
                    onChange: (e) => setFormData({ ...formData, baseAmount: e.target.value }),
                    placeholder: "0.00",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rate-employee", children: "Commission Rate (%) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "rate-employee",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    max: "100",
                    value: formData.rate,
                    onChange: (e) => setFormData({ ...formData, rate: e.target.value }),
                    placeholder: "0.00",
                    required: true
                  }
                )
              ] })
            ] }),
            formData.baseAmount && formData.rate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-muted rounded-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Commission Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(parseFloat(formData.baseAmount) * parseFloat(formData.rate) / 100) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes-employee", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "notes-employee",
                  value: formData.notes,
                  onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
                  placeholder: "Additional notes about this commission...",
                  rows: 3
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
              editingCommission ? "Update" : "Create",
              " Commission"
            ] })
          ] })
        ] }) })
      ] })
    ] }) }),
    reversalTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTarget(null);
        },
        entityType: "commission",
        entityId: reversalTarget.id,
        entityLabel: `Commission #${reversalTarget.id} (${reversalTarget.sale?.invoiceNumber || `Sale #${reversalTarget.saleId}`})`,
        branchId: reversalTarget.branchId,
        onSuccess: fetchCommissions
      }
    )
  ] }) });
}
export {
  CommissionsScreen as default
};
