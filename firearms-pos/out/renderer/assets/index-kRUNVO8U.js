import { Q as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, aj as Plus, I as Input, X, m as Select, n as SelectTrigger, o as SelectValue, p as SelectContent, q as SelectItem, aa as Badge, $ as DollarSign, a2 as RotateCcw, ak as Trash2, v as ChevronRight, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, Y as Tabs, Z as TabsList, _ as TabsTrigger, t as UserPlus, ah as TabsContent, L as Label, T as Textarea, al as DialogFooter } from "./index-DIp0wFLY.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-Bd6rMPU2.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-PZPR4TDU.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-DoNdqx_a.js";
import { S as Search } from "./search-Cj-ulJC9.js";
import { T as TrendingUp } from "./trending-up-DkzUno21.js";
import { P as Pencil } from "./pencil-p1bQKJCT.js";
import { C as ChevronLeft } from "./chevron-left-C0yno5OM.js";
import "./ban-BGplpvdr.js";
import "./triangle-alert-C9qpqcV_.js";
import "./circle-check-DkCLk1IT.js";
const initialFormData = {
  saleId: "",
  commissionType: "referral",
  baseAmount: "",
  rate: "",
  referralPersonId: "",
  userId: "",
  notes: ""
};
const ITEMS_PER_PAGE = 10;
function CommissionsScreen() {
  const { currentBranch } = useBranch();
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
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[status] || colors.pending;
  };
  const filteredCommissions = reactExports.useMemo(() => commissions.filter((commission) => {
    const matchesSearch = commission.sale?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || commission.referralPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || commission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    const matchesType = typeFilter === "all" || commission.commissionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }), [commissions, searchTerm, statusFilter, typeFilter]);
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidCommissions = filteredCommissions.filter((c) => c.status === "paid");
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const pendingCommissions = filteredCommissions.filter((c) => c.status === "pending");
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paginatedCommissions = reactExports.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCommissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCommissions, currentPage]);
  const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE) || 1;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading commissions..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Commissions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            filteredCommissions.length,
            " Total"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            "Rs. ",
            totalCommission.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Rs. ",
            totalPaid.toFixed(2),
            " Paid"
          ] }),
          totalPending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Rs. ",
            totalPending.toFixed(2),
            " Pending"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: () => handleOpenDialog(void 0, "referral"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Create Commission"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search commissions...",
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: filteredCommissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-sm text-muted-foreground", children: "No commissions found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Type / Person" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Base Amt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Commission" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[120px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedCommissions.map((commission) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: commission.sale?.invoiceNumber || `Sale #${commission.saleId}` }),
          commission.sale?.saleDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-muted-foreground", children: new Date(commission.sale.saleDate).toLocaleDateString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0", children: commission.commissionType }),
          commission.commissionType === "referral" && commission.referralPerson && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: commission.referralPerson.name }),
          commission.commissionType === "sale" && commission.user && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: commission.user.fullName })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: [
          "Rs. ",
          commission.baseAmount.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: [
          commission.rate,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-right text-sm font-medium tabular-nums text-primary", children: [
          "Rs. ",
          commission.commissionAmount.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-[10px] px-1.5 py-0 ${getStatusBadge(commission.status)}`, children: commission.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "commission", entityId: commission.id })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Approve" })
          ] }),
          commission.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => handleMarkPaid(commission.id),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3.5 w-3.5 text-green-500" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Mark Paid" })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Reversal" })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit" })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Delete" })
          ] })
        ] }) })
      ] }, commission.id)) })
    ] }) }),
    filteredCommissions.length > ITEMS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        filteredCommissions.length,
        " commission",
        filteredCommissions.length !== 1 ? "s" : ""
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[3rem] text-center", children: [
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
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                          "Rs. ",
                          (sale.totalAmount || 0).toFixed(2)
                        ] })
                      ] }) }, sale.id)),
                      availableInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-sm text-muted-foreground text-center", children: "No completed invoices available" })
                    ] })
                  ]
                }
              )
            ] }),
            formData.saleId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "baseAmount-referral", children: "Base Amount (Rs.) *" }),
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
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Amount from sale invoice that commission is based on" })
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-primary", children: [
                "Rs. ",
                (parseFloat(formData.baseAmount) * parseFloat(formData.rate) / 100).toFixed(2)
              ] })
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "baseAmount-employee", children: "Base Amount (Rs.) *" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-primary", children: [
                "Rs. ",
                (parseFloat(formData.baseAmount) * parseFloat(formData.rate) / 100).toFixed(2)
              ] })
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
