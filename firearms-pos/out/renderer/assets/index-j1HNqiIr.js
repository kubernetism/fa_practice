import { o as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, C as Card, b as CardHeader, c as CardTitle, ai as FileText, e as CardContent, D as DollarSign, ae as formatCurrency, I as Input, a8 as Select, a9 as SelectTrigger, aa as SelectValue, ab as SelectContent, ac as SelectItem, aI as formatDate, g as Eye, ap as LoaderCircle, z as RotateCcw, Z as CreditCard, _ as Dialog, $ as DialogContent, a0 as DialogHeader, a1 as DialogTitle, a2 as DialogDescription, L as Label, a4 as DialogFooter, U as User, J as ScrollArea, M as Badge, ah as CircleX, O as Clock } from "./index-BGwMd-NG.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BdN2VnkE.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-CdP5i3X0.js";
import { R as RefreshCw } from "./refresh-cw-CIcNFtHf.js";
import { C as CircleCheck } from "./circle-check-CM0ieqUp.js";
import { T as TrendingUp } from "./trending-up-S_4ZLQ_9.js";
import { T as TriangleAlert } from "./triangle-alert-DMZ7GLAo.js";
import { S as Search } from "./search-BpxEfj5I.js";
import { F as Filter } from "./filter-DieXPt54.js";
import { D as Download } from "./download-4wWR5eRk.js";
import "./ban-Cp6eJuGQ.js";
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) },
  partial: { label: "Partial", color: "bg-blue-100 text-blue-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3" }) },
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }) },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }) }
};
function AccountReceivablesScreen() {
  const { currentBranch } = useBranch();
  const [receivables, setReceivables] = reactExports.useState([]);
  const [summary, setSummary] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [selectedReceivable, setSelectedReceivable] = reactExports.useState(null);
  const [paymentAmount, setPaymentAmount] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [paymentReference, setPaymentReference] = reactExports.useState("");
  const [paymentNotes, setPaymentNotes] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = reactExports.useState(false);
  const [detailsReceivable, setDetailsReceivable] = reactExports.useState(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = reactExports.useState(false);
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTarget, setReversalTarget] = reactExports.useState(null);
  const fetchReceivables = reactExports.useCallback(async () => {
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
      const result = await window.api.receivables.getAll(params);
      if (result.success) {
        setReceivables(result.data ?? []);
        setTotalPages(result.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Failed to fetch receivables:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, currentBranch?.id]);
  const fetchSummary = reactExports.useCallback(async () => {
    try {
      const result = await window.api.receivables.getSummary(currentBranch?.id);
      if (result.success && result.data) {
        setSummary(result.data.totals);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  }, [currentBranch?.id]);
  reactExports.useEffect(() => {
    fetchReceivables();
    fetchSummary();
  }, [fetchReceivables, fetchSummary]);
  const filteredReceivables = reactExports.useMemo(() => {
    if (!searchQuery.trim()) return receivables;
    const query = searchQuery.toLowerCase().trim();
    return receivables.filter((receivable) => {
      const invoiceMatch = receivable.invoiceNumber.toLowerCase().includes(query);
      const customerName = `${receivable.customer?.firstName ?? ""} ${receivable.customer?.lastName ?? ""}`.toLowerCase();
      const customerMatch = customerName.includes(query);
      const phoneMatch = receivable.customer?.phone?.toLowerCase().includes(query) ?? false;
      return invoiceMatch || customerMatch || phoneMatch;
    });
  }, [receivables, searchQuery]);
  const openPaymentDialog = (receivable) => {
    setSelectedReceivable(receivable);
    setPaymentAmount(receivable.remainingAmount.toString());
    setPaymentMethod("cash");
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentDialog(true);
  };
  const handleRecordPayment = async () => {
    if (!selectedReceivable) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (amount > selectedReceivable.remainingAmount) {
      alert(`Amount cannot exceed remaining balance of ${formatCurrency(selectedReceivable.remainingAmount)}`);
      return;
    }
    setIsProcessing(true);
    try {
      const result = await window.api.receivables.recordPayment({
        receivableId: selectedReceivable.id,
        amount,
        paymentMethod,
        referenceNumber: paymentReference || void 0,
        notes: paymentNotes || void 0
      });
      if (result.success) {
        const receivableId = selectedReceivable.id;
        const isFullyPaid = amount >= selectedReceivable.remainingAmount;
        setShowPaymentDialog(false);
        fetchReceivables();
        fetchSummary();
        if (isFullyPaid) {
          alert("Payment recorded successfully! Receivable is now fully paid.\n\nGenerating payment history receipt...");
          await downloadReceipt(receivableId);
        } else {
          alert("Payment recorded successfully!");
        }
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
  const viewDetails = async (receivable) => {
    try {
      const result = await window.api.receivables.getById(receivable.id);
      if (result.success && result.data) {
        setDetailsReceivable(result.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error("Failed to fetch details:", error);
    }
  };
  const downloadReceipt = async (receivableId) => {
    setIsDownloadingReceipt(true);
    try {
      const result = await window.api.receipt.generatePaymentHistory(receivableId);
      if (result.success && result.data) {
        alert(`Receipt downloaded successfully!
Saved to: ${result.data.filePath}`);
      } else {
        console.error("Receipt generation failed:", result.message);
        alert(result.message || "Failed to generate receipt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to download receipt:", errorMessage);
      alert(`An error occurred while generating receipt: ${errorMessage}`);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${config.color} flex items-center gap-1`, children: [
      config.icon,
      config.label
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Account Receivables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage customer credit and pending payments" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
        fetchReceivables();
        fetchSummary();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Receivables" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary?.totalReceivables ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active receivables" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(summary?.totalAmount ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Original amount owed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Amount Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(summary?.totalPaid ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total payments received" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Today's Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-blue-600" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(summary?.todayCollected ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collected today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Outstanding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-yellow-600" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-yellow-600", children: formatCurrency(summary?.totalRemaining ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Amount pending" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[250px] max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by invoice, customer name, or phone...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
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
      ] }),
      searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSearchQuery(""), children: "Clear Search" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-60 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : filteredReceivables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-60 flex-col items-center justify-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mb-4 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: searchQuery ? "No receivables match your search" : "No receivables found" }),
      searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: () => setSearchQuery(""), children: "Clear search" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Remaining" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredReceivables.map((receivable) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          receivable.invoiceNumber,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "receivable", entityId: receivable.id })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            receivable.customer?.firstName,
            " ",
            receivable.customer?.lastName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: receivable.customer?.phone })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatCurrency(receivable.totalAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-green-600", children: formatCurrency(receivable.paidAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium text-yellow-600", children: formatCurrency(receivable.remainingAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: receivable.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(receivable.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => viewDetails(receivable), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
          receivable.paidAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => downloadReceipt(receivable.id),
              disabled: isDownloadingReceipt,
              title: "Download Payment History Receipt",
              children: isDownloadingReceipt ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
            }
          ),
          receivable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => {
                setReversalTarget(receivable);
                setIsReversalModalOpen(true);
              },
              title: "Request Reversal",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 text-amber-500" })
            }
          ),
          receivable.status !== "paid" && receivable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => openPaymentDialog(receivable), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mr-1 h-4 w-4" }),
            "Pay"
          ] })
        ] }) })
      ] }, receivable.id)) })
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
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          selectedReceivable?.invoiceNumber,
          " | Outstanding: ",
          formatCurrency(selectedReceivable?.remainingAmount ?? 0)
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "card", children: "Card" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mobile", children: "Mobile Payment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cheque", children: "Cheque" })
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
    reversalTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTarget(null);
        },
        entityType: "receivable",
        entityId: reversalTarget.id,
        entityLabel: `Receivable #${reversalTarget.invoiceNumber}`,
        branchId: reversalTarget.branchId,
        onSuccess: () => {
          fetchReceivables();
          fetchSummary();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDetailsDialog, onOpenChange: setShowDetailsDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Receivable Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Invoice: ",
          detailsReceivable?.invoiceNumber
        ] })
      ] }),
      detailsReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 rounded-lg bg-muted p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              detailsReceivable.customer?.firstName,
              " ",
              detailsReceivable.customer?.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsReceivable.customer?.phone }),
            detailsReceivable.customer?.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsReceivable.customer?.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Total Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: formatCurrency(detailsReceivable.totalAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Amount Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(detailsReceivable.paidAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-600", children: formatCurrency(detailsReceivable.remainingAmount) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-semibold", children: "Payment History" }),
          detailsReceivable.payments && detailsReceivable.payments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: detailsReceivable.payments.map((payment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatCurrency(payment.amount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                payment.paymentMethod.replace("_", " "),
                " • ",
                formatDate(payment.paymentDate)
              ] }),
              payment.referenceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Ref: ",
                payment.referenceNumber
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-sm text-muted-foreground", children: payment.receivedByUser?.fullName })
          ] }, payment.id)) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "No payments recorded yet" })
        ] }),
        detailsReceivable.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: detailsReceivable.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        detailsReceivable && detailsReceivable.payments && detailsReceivable.payments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "secondary",
            onClick: () => downloadReceipt(detailsReceivable.id),
            disabled: isDownloadingReceipt,
            children: [
              isDownloadingReceipt ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
              isDownloadingReceipt ? "Generating..." : "Download Receipt"
            ]
          }
        ),
        detailsReceivable && detailsReceivable.status !== "paid" && detailsReceivable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setShowDetailsDialog(false);
          openPaymentDialog(detailsReceivable);
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
  AccountReceivablesScreen
};
