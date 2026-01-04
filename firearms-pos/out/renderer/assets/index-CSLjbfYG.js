import { r as reactExports, j as jsxRuntimeExports, B as Button, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem } from "./index-DQY4_xAv.js";
import { I as Input } from "./input-Yj7sP-j0.js";
import { L as Label } from "./label-C4WTSklC.js";
import { T as Textarea } from "./textarea-BQhSVuxB.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-BOBgMWOm.js";
import { S as Search } from "./search-DCNx_w_N.js";
import { P as Plus } from "./plus-DBeYZr4j.js";
import { P as Pencil } from "./pencil-DdsMh364.js";
import { T as Trash2 } from "./trash-2-DV4_LIwm.js";
import "./index-BgVtRTYu.js";
import "./x-md1kSZXd.js";
const EXPENSE_CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "salaries", label: "Salaries" },
  { value: "supplies", label: "Supplies" },
  { value: "maintenance", label: "Maintenance" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" }
];
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "check", label: "Check" },
  { value: "transfer", label: "Bank Transfer" }
];
const initialFormData = {
  category: "other",
  amount: "",
  description: "",
  paymentMethod: "cash",
  reference: "",
  expenseDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
};
function ExpensesScreen() {
  const [expenses, setExpenses] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  reactExports.useEffect(() => {
    fetchExpenses();
  }, []);
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 20
      });
      if (response?.success && response?.data) {
        setExpenses(response.data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };
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
    try {
      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || void 0,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || void 0,
        expenseDate: formData.expenseDate
      };
      const response = await window.api.expenses.create(expenseData);
      if (response.success) {
        await fetchExpenses();
        handleCloseDialog();
      } else {
        alert(response.message || "Failed to create expense");
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Failed to save expense. Please try again.");
    }
  };
  const handleDelete = async (expenseId) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading expenses..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Expense Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Track and manage all business expenses" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search expenses...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenDialog, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add Expense"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-6 bg-card", children: expenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: 'No expenses yet. Click "Add Expense" to get started.' }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Found ",
        expenses.length,
        " expense(s)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: expenses.map((expense) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: expense.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Rs. ",
            expense.amount.toFixed(2),
            " - ",
            new Date(expense.expenseDate).toLocaleDateString()
          ] }),
          expense.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: expense.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(expense.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, expense.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add New Expense" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the details for the new expense." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.category,
                onValueChange: (value) => setFormData({ ...formData, category: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EXPENSE_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cat.value, children: cat.label }, cat.value)) })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expenseDate", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "expenseDate",
                type: "date",
                value: formData.expenseDate,
                onChange: (e) => setFormData({ ...formData, expenseDate: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentMethod", children: "Payment Method" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
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
                placeholder: "Enter expense details...",
                rows: 3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Create Expense" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ExpensesScreen as default
};
