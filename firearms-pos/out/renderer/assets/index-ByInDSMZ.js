import { d as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, Z as FileText, g as formatCurrency, T as Tabs, e as TabsList, f as TabsTrigger, a4 as TabsContent, F as Select, G as SelectTrigger, H as SelectValue, J as SelectContent, K as SelectItem, aa as formatDate, c as Eye, s as CreditCard, o as Badge, D as Dialog, v as DialogContent, w as DialogHeader, x as DialogTitle, y as DialogDescription, L as Label, I as Input, z as DialogFooter, O as Building2, m as ScrollArea, Y as DollarSign, t as Clock } from "./index-CoWz6Mq1.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DCkQpI_s.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-mJziSGbj.js";
import { R as RefreshCw } from "./refresh-cw-CMNco9n-.js";
import { T as TrendingDown } from "./trending-down-zSoj3g1Y.js";
import { C as CircleCheck } from "./circle-check--Hpnm7QG.js";
import { C as Calendar } from "./calendar-BidOtXbH.js";
import { F as Filter } from "./filter-CcRWYIs6.js";
import { C as CircleX } from "./circle-x-Ba3Dstl8.js";
import { T as TriangleAlert } from "./triangle-alert-DjXdpkA5.js";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Account Payables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage supplier invoices and payments" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
        fetchPayables();
        fetchSummary();
        fetchAgingReport();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Payables" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary?.totalPayables ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active payables" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Owed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-red-600" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(summary?.totalRemaining ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Outstanding amount" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Amount Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(summary?.totalPaid ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Payments made" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "DPO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            agingData?.dpo ?? 0,
            " days"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Days Payable Outstanding" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "list", children: "All Payables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "aging", children: "Aging Report" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "list", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
            setStatusFilter(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overdue", children: "Overdue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
            ] })
          ] })
        ] }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-60 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : payables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-60 flex-col items-center justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mb-4 h-12 w-12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No payables found" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: payables.map((payable) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: payable.invoiceNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: payable.supplier?.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: payable.supplier?.phone })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatCurrency(payable.totalAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-green-600", children: formatCurrency(payable.paidAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium text-red-600", children: formatCurrency(payable.remainingAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: payable.dueDate ? formatDate(payable.dueDate) : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: payable.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => viewDetails(payable), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
              payable.status !== "paid" && payable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => openPaymentDialog(payable), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mr-1 h-4 w-4" }),
                "Pay"
              ] })
            ] }) })
          ] }, payable.id)) })
        ] }) }) }),
        totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.max(1, p - 1)),
              disabled: page === 1,
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
            "Page ",
            page,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
              disabled: page === totalPages,
              children: "Next"
            }
          )
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
  ] });
}
export {
  AccountPayablesScreen
};
