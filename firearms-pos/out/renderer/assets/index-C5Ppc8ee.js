import { Q as useBranch, r as reactExports, j as jsxRuntimeExports, ap as formatCurrency, B as Button, Y as Tabs, Z as TabsList, _ as TabsTrigger, ah as TabsContent, m as Select, n as SelectTrigger, o as SelectValue, p as SelectContent, q as SelectItem, aw as formatDate, g as Eye, a2 as RotateCcw, af as CreditCard, v as ChevronRight, C as Card, b as CardHeader, c as CardTitle, e as CardContent, aa as Badge, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, L as Label, I as Input, al as DialogFooter, i as Building2, ab as ScrollArea, as as CircleX, $ as DollarSign, ad as Clock } from "./index-DIp0wFLY.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-PZPR4TDU.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-Bd6rMPU2.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-DoNdqx_a.js";
import { R as RefreshCw } from "./refresh-cw-CspC7TGi.js";
import { C as ChevronLeft } from "./chevron-left-C0yno5OM.js";
import { T as TriangleAlert } from "./triangle-alert-C9qpqcV_.js";
import { C as CircleCheck } from "./circle-check-DkCLk1IT.js";
import "./ban-BGplpvdr.js";
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) },
  partial: { label: "Partial", color: "bg-blue-100 text-blue-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3" }) },
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }) },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }) }
};
function AccountPayablesScreen() {
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = reactExports.useState("list");
  const [payables, setPayables] = reactExports.useState([]);
  const [agingData, setAgingData] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [summary, setSummary] = reactExports.useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [selectedPayable, setSelectedPayable] = reactExports.useState(null);
  const [paymentAmount, setPaymentAmount] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("bank_transfer");
  const [paymentReference, setPaymentReference] = reactExports.useState("");
  const [paymentNotes, setPaymentNotes] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = reactExports.useState(false);
  const [detailsPayable, setDetailsPayable] = reactExports.useState(null);
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTarget, setReversalTarget] = reactExports.useState(null);
  const fetchPayables = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        branchId: currentBranch?.id
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const result = await window.api.payables.getAll(params);
      if (result.success) {
        setPayables(result.data ?? []);
        setTotalPages(result.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Failed to fetch payables:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, currentBranch?.id]);
  const fetchSummary = reactExports.useCallback(async () => {
    try {
      const result = await window.api.payables.getSummary(currentBranch?.id);
      if (result.success && result.data) {
        setSummary(result.data.totals);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  }, [currentBranch?.id]);
  const fetchAgingReport = reactExports.useCallback(async () => {
    try {
      const result = await window.api.payables.getAgingReport(currentBranch?.id);
      if (result.success && result.data) {
        setAgingData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch aging report:", error);
    }
  }, [currentBranch?.id]);
  reactExports.useEffect(() => {
    fetchPayables();
    fetchSummary();
    fetchAgingReport();
  }, [fetchPayables, fetchSummary, fetchAgingReport]);
  const openPaymentDialog = (payable) => {
    setSelectedPayable(payable);
    setPaymentAmount(payable.remainingAmount.toString());
    setPaymentMethod("bank_transfer");
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentDialog(true);
  };
  const handleRecordPayment = async () => {
    if (!selectedPayable) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (amount > selectedPayable.remainingAmount) {
      alert(`Amount cannot exceed remaining balance of ${formatCurrency(selectedPayable.remainingAmount)}`);
      return;
    }
    setIsProcessing(true);
    try {
      const result = await window.api.payables.recordPayment({
        payableId: selectedPayable.id,
        amount,
        paymentMethod,
        referenceNumber: paymentReference || void 0,
        notes: paymentNotes || void 0
      });
      if (result.success) {
        setShowPaymentDialog(false);
        fetchPayables();
        fetchSummary();
        fetchAgingReport();
        alert("Payment recorded successfully!");
      } else {
        alert(result.message || "Failed to record payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while recording payment");
    } finally {
      setIsProcessing(false);
    }
  };
  const viewDetails = async (payable) => {
    try {
      const result = await window.api.payables.getById(payable.id);
      if (result.success && result.data) {
        setDetailsPayable(result.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error("Failed to fetch details:", error);
    }
  };
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${config.color} flex items-center gap-1`, children: [
      config.icon,
      config.label
    ] });
  };
  const AgingBar = ({ label, amount, total, count }) => {
    const percentage = total > 0 ? amount / total * 100 : 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          formatCurrency(amount),
          " (",
          count,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-primary transition-all",
          style: { width: `${percentage}%` }
        }
      ) })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Account Payables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            summary?.totalPayables ?? 0,
            " Payables"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium", children: [
            formatCurrency(summary?.totalRemaining ?? 0),
            " Owed"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium", children: [
            formatCurrency(summary?.totalPaid ?? 0),
            " Paid"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            "DPO: ",
            agingData?.dpo ?? 0,
            "d"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8", onClick: () => {
        fetchPayables();
        fetchSummary();
        fetchAgingReport();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "list", children: "All Payables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "aging", children: "Aging Report" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "list", className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
          setStatusFilter(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overdue", children: "Overdue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : payables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-sm text-muted-foreground", children: "No payables found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[120px]", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: payables.map((payable) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: payable.invoiceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "payable", entityId: payable.id })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: payable.supplier?.name }),
              payable.supplier?.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-muted-foreground", children: payable.supplier.phone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(payable.totalAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums text-green-600", children: formatCurrency(payable.paidAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums font-medium text-red-600", children: formatCurrency(payable.remainingAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: payable.dueDate ? formatDate(payable.dueDate) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: payable.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => viewDetails(payable), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Details" })
              ] }),
              payable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => {
                      setReversalTarget(payable);
                      setIsReversalModalOpen(true);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Reversal" })
              ] }),
              payable.status !== "paid" && payable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openPaymentDialog(payable), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3.5 w-3.5" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Record Payment" })
              ] })
            ] }) })
          ] }, payable.id)) })
        ] }) }),
        totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Page ",
            page,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: page === 1,
                onClick: () => setPage((p) => p - 1),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[3rem] text-center", children: [
              page,
              " / ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "icon",
                className: "h-7 w-7",
                disabled: page === totalPages,
                onClick: () => setPage((p) => p + 1),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "aging", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Aging Breakdown" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: agingData && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgingBar,
              {
                label: "Current (Not Due)",
                amount: agingData.aging.current.amount,
                total: agingData.totalOutstanding,
                count: agingData.aging.current.count
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgingBar,
              {
                label: "1-30 Days Overdue",
                amount: agingData.aging.days1to30.amount,
                total: agingData.totalOutstanding,
                count: agingData.aging.days1to30.count
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgingBar,
              {
                label: "31-60 Days Overdue",
                amount: agingData.aging.days31to60.amount,
                total: agingData.totalOutstanding,
                count: agingData.aging.days31to60.count
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgingBar,
              {
                label: "61-90 Days Overdue",
                amount: agingData.aging.days61to90.amount,
                total: agingData.totalOutstanding,
                count: agingData.aging.days61to90.count
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgingBar,
              {
                label: "90+ Days Overdue",
                amount: agingData.aging.days90plus.amount,
                total: agingData.totalOutstanding,
                count: agingData.aging.days90plus.count
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Upcoming Payments (Next 7 Days)" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: agingData?.upcomingPayments && agingData.upcomingPayments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: agingData.upcomingPayments.map((payment, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: payment.supplier }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "Due: ",
                formatDate(payment.dueDate),
                " (",
                payment.daysUntilDue,
                " days)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: formatCurrency(payment.amount) })
          ] }, idx)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No upcoming payments" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Top Overdue Suppliers" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: agingData?.topOverdue && agingData.topOverdue.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount Overdue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Oldest Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Days Overdue" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: agingData.topOverdue.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: item.supplier }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-red-600 font-bold", children: formatCurrency(item.amount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(item.oldestDueDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
                item.daysOverdue,
                " days"
              ] }) })
            ] }, idx)) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No overdue payables" }) })
        ] })
      ] }) })
    ] }),
    reversalTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTarget(null);
        },
        entityType: "payable",
        entityId: reversalTarget.id,
        entityLabel: `Payable #${reversalTarget.invoiceNumber}`,
        branchId: reversalTarget.branchId,
        onSuccess: () => {
          fetchPayables();
          fetchSummary();
          fetchAgingReport();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          selectedPayable?.invoiceNumber,
          " | Outstanding: ",
          formatCurrency(selectedPayable?.remainingAmount ?? 0)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payment-amount", children: "Payment Amount *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "payment-amount",
              type: "number",
              step: "0.01",
              value: paymentAmount,
              onChange: (e) => setPaymentAmount(e.target.value),
              placeholder: "Enter amount"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payment-method", children: "Payment Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentMethod, onValueChange: (v) => setPaymentMethod(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cheque", children: "Cheque" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "card", children: "Card" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mobile", children: "Mobile Payment" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payment-reference", children: "Reference Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "payment-reference",
              value: paymentReference,
              onChange: (e) => setPaymentReference(e.target.value),
              placeholder: "Transaction ID, cheque number, etc."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payment-notes", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "payment-notes",
              value: paymentNotes,
              onChange: (e) => setPaymentNotes(e.target.value),
              placeholder: "Optional notes"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowPaymentDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleRecordPayment, disabled: isProcessing, children: isProcessing ? "Processing..." : "Record Payment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDetailsDialog, onOpenChange: setShowDetailsDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Payable Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          detailsPayable?.invoiceNumber
        ] })
      ] }),
      detailsPayable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 rounded-lg bg-muted p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: detailsPayable.supplier?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsPayable.supplier?.phone }),
            detailsPayable.supplier?.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsPayable.supplier?.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Total Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: formatCurrency(detailsPayable.totalAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Amount Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(detailsPayable.paidAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: formatCurrency(detailsPayable.remainingAmount) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-semibold", children: "Payment History" }),
          detailsPayable.payments && detailsPayable.payments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: detailsPayable.payments.map((payment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatCurrency(payment.amount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                payment.paymentMethod.replace("_", " "),
                " - ",
                formatDate(payment.paymentDate)
              ] }),
              payment.referenceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Ref: ",
                payment.referenceNumber
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-sm text-muted-foreground", children: payment.paidByUser?.fullName })
          ] }, payment.id)) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "No payments recorded yet" })
        ] }),
        detailsPayable.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsPayable.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        detailsPayable && detailsPayable.status !== "paid" && detailsPayable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setShowDetailsDialog(false);
          openPaymentDialog(detailsPayable);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
          "Record Payment"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDetailsDialog(false), children: "Close" })
      ] })
    ] }) })
  ] }) });
}
export {
  AccountPayablesScreen
};
