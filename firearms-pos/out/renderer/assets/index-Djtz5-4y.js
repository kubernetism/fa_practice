import { Z as useBranch, r as reactExports, j as jsxRuntimeExports, aq as formatCurrency, B as Button, I as Input, X, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, ax as formatDate, c as Eye, f as LoaderCircle, R as RotateCcw, ah as CreditCard, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, am as DialogFooter, U as User, ad as ScrollArea, ac as Badge, at as CircleX, a2 as DollarSign, af as Clock } from "./index-s8JdVLLx.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DQd2rjgS.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-Dpe2KkHg.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-BCr279uK.js";
import { R as RefreshCw } from "./refresh-cw-DImJ1IXQ.js";
import { S as Search } from "./search-D7jY4GnR.js";
import { D as Download } from "./download-B8lrG0oj.js";
import { C as ChevronLeft } from "./chevron-left-CC1uaXGj.js";
import { T as TriangleAlert } from "./triangle-alert-CX_Ygm4Q.js";
import { C as CircleCheck } from "./circle-check-BeM1E8_k.js";
import "./ban-zx7Rg-qv.js";
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) },
  partial: { label: "Partial", color: "bg-blue-100 text-blue-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3" }) },
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }) },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }) }
};
function StatusBadge({ status }) {
  const config = statusConfig[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${config.color} flex items-center gap-1`, children: [
    config.icon,
    config.label
  ] });
}
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Account Receivables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            summary?.totalReceivables ?? 0,
            " Receivables"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium", children: [
            formatCurrency(summary?.totalPaid ?? 0),
            " Collected"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium", children: [
            formatCurrency(summary?.totalRemaining ?? 0),
            " Outstanding"
          ] }),
          (summary?.todayCollected ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium", children: [
            formatCurrency(summary?.todayCollected ?? 0),
            " Today"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8", onClick: () => {
        fetchReceivables();
        fetchSummary();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by invoice, customer, phone...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "h-8 pl-8 text-sm"
          }
        ),
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "aria-label": "Clear search",
            onClick: () => setSearchQuery(""),
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: statusFilter,
          onValueChange: (v) => {
            setStatusFilter(v);
            setPage(1);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overdue", children: "Overdue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : filteredReceivables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-sm text-muted-foreground", children: "No receivables found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Remaining" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[130px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredReceivables.map((receivable) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: receivable.invoiceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "receivable", entityId: receivable.id })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            receivable.customer?.firstName,
            " ",
            receivable.customer?.lastName
          ] }),
          receivable.customer?.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-muted-foreground", children: receivable.customer.phone })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(receivable.totalAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums text-green-600", children: formatCurrency(receivable.paidAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums font-medium text-yellow-600", children: formatCurrency(receivable.remainingAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: receivable.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-muted-foreground", children: formatDate(receivable.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => viewDetails(receivable),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Details" })
          ] }),
          receivable.paidAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => downloadReceipt(receivable.id),
                disabled: isDownloadingReceipt,
                children: isDownloadingReceipt ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Download Receipt" })
          ] }),
          receivable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => {
                  setReversalTarget(receivable);
                  setIsReversalModalOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Reversal" })
          ] }),
          receivable.status !== "paid" && receivable.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => openPaymentDialog(receivable),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Record Payment" })
          ] })
        ] }) })
      ] }, receivable.id)) })
    ] }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "icon",
          className: "h-7 w-7",
          onClick: () => setPage((p) => Math.max(1, p - 1)),
          disabled: page === 1,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 text-xs text-muted-foreground tabular-nums", children: [
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
          onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
          disabled: page === totalPages,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
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
  ] }) });
}
export {
  AccountReceivablesScreen
};
