import { K as useBranch, r as reactExports, j as jsxRuntimeExports, $ as DollarSign, B as Button, ag as Plus, I as Input, X, aw as formatDate, a9 as Badge, ar as cn, ah as Trash2, R as RotateCcw, C as ChevronRight, a4 as Dialog, a5 as DialogContent, a6 as DialogHeader, a7 as DialogTitle, a8 as DialogDescription, L as Label, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, o as Textarea, ai as DialogFooter } from "./index-CA2iYu5d.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-D9OT2p2X.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-DMn0AYNG.js";
import { R as ReversalStatusBadge, a as ReversalRequestModal } from "./reversal-status-badge-DL7blB4W.js";
import { S as Search } from "./search-D9rnG89m.js";
import { R as RefreshCw } from "./refresh-cw-CKpWzem-.js";
import { C as Calendar } from "./calendar-CwHFW37R.js";
import { P as Pencil } from "./pencil-Co7t8EMp.js";
import { C as ChevronLeft } from "./chevron-left-GRsHQtC7.js";
import "./ban-DCMU6O9e.js";
import "./triangle-alert-CJB1Jo34.js";
import "./circle-check-BhV1U-tJ.js";
const ITEMS_PER_PAGE = 10;
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "check", label: "Check" },
  { value: "transfer", label: "Bank Transfer" }
];
const PAYMENT_TERMS = [
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
  { value: "Due on Receipt", label: "Due on Receipt" }
];
const initialFormData = {
  categoryId: "",
  amount: "",
  description: "",
  paymentMethod: "cash",
  reference: "",
  expenseDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  paymentStatus: "paid",
  supplierId: "",
  dueDate: "",
  paymentTerms: ""
};
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function ExpensesScreen() {
  const { currentBranch } = useBranch();
  const [expenses, setExpenses] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [isReversalModalOpen, setIsReversalModalOpen] = reactExports.useState(false);
  const [reversalTargetExpense, setReversalTargetExpense] = reactExports.useState(null);
  const fetchExpenses = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 1e3,
        branchId: currentBranch.id
      });
      setExpenses(response?.success && response?.data ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);
  const fetchSuppliers = reactExports.useCallback(async () => {
    try {
      const response = await window.api.suppliers.getAll({ isActive: true, limit: 1e3 });
      if (response?.success && response?.data) setSuppliers(response.data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  }, []);
  const fetchCategories = reactExports.useCallback(async () => {
    try {
      const response = await window.api.categories.getAll();
      if (response?.success && response?.data) setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    if (currentBranch) fetchExpenses();
  }, [currentBranch, fetchExpenses]);
  reactExports.useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, [fetchSuppliers, fetchCategories]);
  const filteredExpenses = reactExports.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const sorted = [...expenses].sort(
      (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
    if (!term) return sorted;
    return sorted.filter((exp) => {
      return exp.category?.name.toLowerCase().includes(term) || exp.description?.toLowerCase().includes(term) || exp.supplier?.name.toLowerCase().includes(term) || exp.reference?.toLowerCase().includes(term) || exp.paymentMethod?.toLowerCase().includes(term);
    });
  }, [expenses, searchTerm]);
  const stats = reactExports.useMemo(() => {
    const total = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paid = expenses.filter((e) => e.paymentStatus === "paid").length;
    const unpaid = expenses.filter((e) => e.paymentStatus === "unpaid").length;
    return { total, totalAmount, paid, unpaid };
  }, [expenses]);
  const { totalPages, safePage, pageStart, pageExpenses } = reactExports.useMemo(() => {
    const totalPages2 = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));
    const safePage2 = Math.min(currentPage, totalPages2);
    const pageStart2 = (safePage2 - 1) * ITEMS_PER_PAGE;
    const pageExpenses2 = filteredExpenses.slice(pageStart2, pageStart2 + ITEMS_PER_PAGE);
    return { totalPages: totalPages2, safePage: safePage2, pageStart: pageStart2, pageExpenses: pageExpenses2 };
  }, [filteredExpenses, currentPage]);
  const handleOpenDialog = () => {
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (formData.paymentStatus === "unpaid") {
      if (!formData.supplierId) {
        alert("Please select a supplier for unpaid expenses");
        return;
      }
      if (!formData.dueDate) {
        alert("Please enter a due date for unpaid expenses");
        return;
      }
    }
    if (!currentBranch) {
      alert("No branch selected");
      return;
    }
    if (!formData.categoryId) {
      alert("Please select a category");
      return;
    }
    try {
      const expenseData = {
        branchId: currentBranch.id,
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        description: formData.description || void 0,
        expenseDate: formData.expenseDate,
        paymentStatus: formData.paymentStatus
      };
      if (formData.paymentStatus === "paid") {
        expenseData.paymentMethod = formData.paymentMethod;
        expenseData.reference = formData.reference || void 0;
      } else {
        expenseData.supplierId = parseInt(formData.supplierId);
        expenseData.dueDate = formData.dueDate;
        expenseData.paymentTerms = formData.paymentTerms || void 0;
      }
      const response = await window.api.expenses.create(expenseData);
      if (response.success) {
        await fetchExpenses();
        handleCloseDialog();
        alert(
          response.payableCreated ? "Expense created and account payable generated successfully!" : "Expense created successfully!"
        );
      } else {
        alert(response.message || "Failed to create expense");
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Failed to save expense. Please try again.");
    }
  };
  const handleDelete = async (expenseId) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const response = await window.api.expenses.delete(expenseId);
      if (response.success) {
        await fetchExpenses();
      } else {
        alert(response.message || "Failed to delete expense");
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading expenses…" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold leading-tight", children: "Expense Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: currentBranch?.name || "Select a branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3" }),
            stats.total,
            " ",
            stats.total === 1 ? "expense" : "expenses"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            "Total: Rs. ",
            stats.totalAmount.toLocaleString("en-PK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-green-500" }),
            stats.paid,
            " paid"
          ] }),
          stats.unpaid > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-yellow-500" }),
            stats.unpaid,
            " unpaid"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenDialog, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        "Add Expense"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by category, description, supplier, reference, payment method…",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 pl-8 pr-8 text-sm"
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
            "aria-label": "Clear search",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-8 w-8 shrink-0",
            onClick: fetchExpenses,
            "aria-label": "Refresh expenses",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 max-w-[180px]", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Payable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 w-[100px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: pageExpenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "h-24 text-center text-sm text-muted-foreground", children: searchTerm ? "No expenses match your search." : 'No expenses yet. Click "Add Expense" to get started.' }) }) : pageExpenses.map((expense) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 shrink-0" }),
          formatDate(expense.expenseDate)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs font-medium", children: expense.category?.name || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Uncategorized" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs max-w-[180px]", children: expense.description ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "block truncate text-muted-foreground",
            title: expense.description,
            children: expense.description
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-xs text-right font-medium tabular-nums", children: [
          "Rs. ",
          expense.amount.toLocaleString("en-PK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: expense.paymentStatus === "paid" ? "default" : "secondary",
              className: cn(
                "text-[10px] px-1.5 py-0 h-4 font-medium",
                expense.paymentStatus === "paid" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20" : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
              ),
              children: expense.paymentStatus === "paid" ? "Paid" : "Unpaid"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReversalStatusBadge, { entityType: "expense", entityId: expense.id })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: expense.paymentStatus === "paid" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          capitalize(expense.paymentMethod),
          expense.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60", children: [
            " ",
            "· ",
            expense.reference
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: expense.paymentStatus === "unpaid" && expense.supplier ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          expense.supplier.name,
          expense.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[10px] text-muted-foreground/60", children: [
            "Due: ",
            formatDate(expense.dueDate)
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs", children: expense.payableId && expense.payable ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-[10px] px-1.5 py-0 h-4 font-medium",
              children: capitalize(expense.payable.status)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[10px] text-muted-foreground/60 mt-0.5", children: [
            "Rs. ",
            expense.payable.remainingAmount.toLocaleString("en-PK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }),
            " rem."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                "aria-label": "Edit expense",
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
                className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: () => handleDelete(expense.id),
                "aria-label": "Delete expense",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Delete" })
          ] }),
          !expense.isVoided && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: () => {
                  setReversalTargetExpense(expense);
                  setIsReversalModalOpen(true);
                },
                "aria-label": "Request reversal",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 text-amber-500" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Request Reversal" })
          ] })
        ] }) })
      ] }, expense.id)) })
    ] }) }),
    filteredExpenses.length > ITEMS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        pageStart + 1,
        "–",
        Math.min(pageStart + ITEMS_PER_PAGE, filteredExpenses.length),
        " of",
        " ",
        filteredExpenses.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: safePage <= 1,
            onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
            "aria-label": "Previous page",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1 tabular-nums", children: [
          safePage,
          " / ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: safePage >= totalPages,
            onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
            "aria-label": "Next page",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    reversalTargetExpense && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReversalRequestModal,
      {
        open: isReversalModalOpen,
        onClose: () => {
          setIsReversalModalOpen(false);
          setReversalTargetExpense(null);
        },
        entityType: "expense",
        entityId: reversalTargetExpense.id,
        entityLabel: `Expense #${reversalTargetExpense.id} — ${reversalTargetExpense.category?.name || "Uncategorized"}`,
        branchId: reversalTargetExpense.branchId,
        onSuccess: fetchExpenses
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        className: "max-w-md max-h-[85vh] flex flex-col",
        onOpenAutoFocus: (e) => {
          e.preventDefault();
          const amountInput = document.getElementById("amount");
          amountInput?.focus();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add New Expense" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the details for the new expense." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col flex-1 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-3 overflow-y-auto px-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentStatus", children: "Payment Status *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.paymentStatus,
                    onValueChange: (value) => setFormData({ ...formData, paymentStatus: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unpaid", children: "Unpaid" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.categoryId,
                    onValueChange: (value) => setFormData({ ...formData, categoryId: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.filter((cat) => cat.isActive).map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cat.id.toString(), children: cat.name }, cat.id)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount (Rs.) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "amount",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.amount,
                    onChange: (e) => setFormData({ ...formData, amount: e.target.value }),
                    placeholder: "0.00",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expenseDate", children: "Expense Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "expenseDate",
                    type: "date",
                    value: formData.expenseDate,
                    onChange: (e) => setFormData({ ...formData, expenseDate: e.target.value }),
                    required: true
                  }
                )
              ] }),
              formData.paymentStatus === "unpaid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "supplier", children: "Supplier *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.supplierId,
                    onValueChange: (value) => setFormData({ ...formData, supplierId: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((supplier) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: supplier.id.toString(), children: supplier.name }, supplier.id)) })
                    ]
                  }
                )
              ] }),
              formData.paymentStatus === "unpaid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dueDate", children: "Due Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "dueDate",
                    type: "date",
                    value: formData.dueDate,
                    onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }),
                    min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                    required: true
                  }
                )
              ] }),
              formData.paymentStatus === "unpaid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.paymentTerms,
                    onValueChange: (value) => setFormData({ ...formData, paymentTerms: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select terms" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_TERMS.map((term) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: term.value, children: term.label }, term.value)) })
                    ]
                  }
                )
              ] }),
              formData.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentMethod", children: "Payment Method *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.paymentMethod,
                    onValueChange: (value) => setFormData({ ...formData, paymentMethod: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select payment method" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method.value, children: method.label }, method.value)) })
                    ]
                  }
                )
              ] }),
              formData.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reference", children: "Reference Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "reference",
                    value: formData.reference,
                    onChange: (e) => setFormData({ ...formData, reference: e.target.value }),
                    placeholder: "Invoice #, Receipt #, etc."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "description",
                    value: formData.description,
                    onChange: (e) => setFormData({ ...formData, description: e.target.value }),
                    placeholder: "Enter expense details…",
                    rows: 2
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Create Expense" })
            ] })
          ] })
        ]
      }
    ) })
  ] }) });
}
export {
  ExpensesScreen as default
};
