import { d as useBranch, r as reactExports, j as jsxRuntimeExports, I as Input, B as Button, p as Plus, t as Trash2, y as Dialog, z as DialogContent, A as DialogHeader, F as DialogTitle, G as DialogDescription, L as Label, M as Select, O as SelectTrigger, Q as SelectValue, V as SelectContent, Y as SelectItem, a5 as Textarea, H as DialogFooter } from "./index-6asCrikz.js";
import { S as Search } from "./search-DS7UGivW.js";
import { P as Pencil } from "./pencil-98S-yh6C.js";
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
const PAYMENT_TERMS = [
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
  { value: "Due on Receipt", label: "Due on Receipt" }
];
const initialFormData = {
  category: "other",
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
function ExpensesScreen() {
  const { currentBranch } = useBranch();
  const [expenses, setExpenses] = reactExports.useState([]);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  reactExports.useEffect(() => {
    if (currentBranch) {
      fetchExpenses();
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    fetchSuppliers();
  }, []);
  const fetchExpenses = async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 1e3,
        branchId: currentBranch.id
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
  const fetchSuppliers = async () => {
    try {
      const response = await window.api.suppliers.getAll({
        isActive: true,
        limit: 1e3
      });
      if (response?.success && response?.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
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
    try {
      const expenseData = {
        branchId: currentBranch.id,
        category: formData.category,
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
        if (response.payableCreated) {
          alert("Expense created and account payable generated successfully!");
        } else {
          alert("Expense created successfully!");
        }
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Track and manage all business expenses • ",
        currentBranch?.name || "Select a branch"
      ] })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: expense.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2 py-0.5 text-xs rounded font-medium ${expense.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`,
                children: expense.paymentStatus === "paid" ? "Paid" : "Unpaid"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Rs. ",
            expense.amount.toFixed(2),
            " - ",
            new Date(expense.expenseDate).toLocaleDateString()
          ] }),
          expense.paymentStatus === "unpaid" && expense.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Supplier: ",
            expense.supplier.name,
            expense.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " | Due: ",
              new Date(expense.dueDate).toLocaleDateString()
            ] })
          ] }),
          expense.paymentStatus === "paid" && expense.paymentMethod && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Payment: ",
            expense.paymentMethod,
            expense.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " | Ref: ",
              expense.reference
            ] })
          ] }),
          expense.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: expense.description }),
          expense.payableId && expense.payable && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [
            "Linked Payable #",
            expense.payableId,
            " - Status: ",
            expense.payable.status,
            " - Remaining: Rs. ",
            expense.payable.remainingAmount.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(expense.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, expense.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[85vh] flex flex-col", children: [
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
                placeholder: "Enter expense details...",
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
    ] }) })
  ] });
}
export {
  ExpensesScreen as default
};
