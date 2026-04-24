import { r as reactExports, j as jsxRuntimeExports, Z as TooltipProvider, b6 as Contact, B as Button, ak as Plus, I as Input, X, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, p as SelectItem, a5 as Tooltip, a6 as TooltipTrigger, s as RefreshCw, a7 as TooltipContent, ad as Badge, aC as cn, al as Trash2, C as ChevronRight, a8 as Dialog, a9 as DialogContent, aa as DialogHeader, ab as DialogTitle, ac as DialogDescription, L as Label, q as Textarea, am as DialogFooter } from "./index-2rq_5YkW.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-XkqVqf4i.js";
import { S as Search } from "./search-BuJtneNW.js";
import { L as Link2 } from "./link-2-B5bjRldE.js";
import { P as Pencil } from "./pencil-BhCBNUkR.js";
import { C as ChevronLeft } from "./chevron-left-CUuk1mkU.js";
const PAYEE_TYPES = [
  { value: "landlord", label: "Landlord" },
  { value: "utility", label: "Utility" },
  { value: "employee", label: "Employee" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" }
];
const ALL_FILTER_TYPES = [
  { value: "all", label: "All types" },
  { value: "vendor", label: "Vendor" },
  ...PAYEE_TYPES
];
const initialFormData = {
  name: "",
  payeeType: "other",
  contactPhone: "",
  contactEmail: "",
  address: "",
  notes: "",
  isActive: true
};
const typeBadgeColors = {
  vendor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  landlord: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
  utility: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  employee: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  government: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  other: "bg-muted text-muted-foreground border-muted"
};
function PayeesScreen() {
  const [payees, setPayees] = reactExports.useState([]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [typeFilter, setTypeFilter] = reactExports.useState("all");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [totalPayees, setTotalPayees] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingPayee, setEditingPayee] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [errors, setErrors] = reactExports.useState({});
  const itemsPerPage = 20;
  const fetchPayees = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await window.api.payees.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || void 0,
        payeeType: typeFilter !== "all" ? typeFilter : void 0
      });
      if (response.success && response.data) {
        setPayees(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalPayees(response.total || 0);
      } else {
        setPayees([]);
      }
    } catch (error) {
      console.error("Failed to fetch payees:", error);
      setPayees([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, typeFilter]);
  reactExports.useEffect(() => {
    fetchPayees();
  }, [fetchPayees]);
  const handleOpenCreateDialog = () => {
    setEditingPayee(null);
    setFormData(initialFormData);
    setErrors({});
    setIsDialogOpen(true);
  };
  const handleOpenEditDialog = (payee) => {
    if (payee.payeeType === "vendor") {
      alert("Vendor payees are managed from the Suppliers screen.");
      return;
    }
    setEditingPayee(payee);
    setFormData({
      name: payee.name,
      payeeType: payee.payeeType,
      contactPhone: payee.contactPhone || "",
      contactEmail: payee.contactEmail || "",
      address: payee.address || "",
      notes: payee.notes || "",
      isActive: payee.isActive
    });
    setErrors({});
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPayee(null);
    setFormData(initialFormData);
    setErrors({});
  };
  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.payeeType) next.payeeType = "Type is required";
    if (formData.payeeType === "vendor") {
      next.payeeType = "Vendor payees are auto-created from the Suppliers screen";
    }
    if (formData.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.contactEmail)) {
      next.contactEmail = "Invalid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: formData.name.trim(),
      payeeType: formData.payeeType,
      contactPhone: formData.contactPhone.trim() || void 0,
      contactEmail: formData.contactEmail.trim() || void 0,
      address: formData.address.trim() || void 0,
      notes: formData.notes.trim() || void 0,
      isActive: formData.isActive
    };
    try {
      const response = editingPayee ? await window.api.payees.update(editingPayee.id, payload) : await window.api.payees.create(payload);
      if (response.success) {
        handleCloseDialog();
        await fetchPayees();
      } else {
        alert(response.message || "Failed to save payee");
      }
    } catch (error) {
      console.error("Failed to save payee:", error);
      alert("Failed to save payee. Please try again.");
    }
  };
  const handleDelete = async (payee) => {
    if (payee.payeeType === "vendor") {
      alert("Vendor payees are managed from the Suppliers screen. Deactivate the supplier instead.");
      return;
    }
    if (!confirm(`Deactivate payee "${payee.name}"? This will hide them from expense entry.`)) return;
    try {
      const response = await window.api.payees.delete(payee.id);
      if (response.success) {
        await fetchPayees();
      } else {
        alert(response.message || "Failed to deactivate payee");
      }
    } catch (error) {
      console.error("Failed to delete payee:", error);
      alert("Failed to deactivate payee. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold leading-tight", children: "Payees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Recipients of expense payments (vendors, landlords, utilities, employees, government, etc.)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Contact, { className: "h-3 w-3" }),
          totalPayees,
          " ",
          totalPayees === 1 ? "payee" : "payees"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenCreateDialog, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        "Add Payee"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name…",
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
            className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            "aria-label": "Clear search",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: typeFilter,
          onValueChange: (v) => {
            setTypeFilter(v);
            setCurrentPage(1);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[160px] text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ALL_FILTER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-8 w-8 shrink-0",
            onClick: fetchPayees,
            "aria-label": "Refresh payees",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase h-8 py-0 w-[100px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "h-24 text-center text-sm text-muted-foreground", children: "Loading payees…" }) }) : payees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "h-24 text-center text-sm text-muted-foreground", children: searchTerm || typeFilter !== "all" ? "No payees match your filters." : 'No payees yet. Click "Add Payee" to get started.' }) }) : payees.map((payee) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-9 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          payee.name,
          payee.linkedSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3 w-3" }),
              "supplier"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { children: [
              "Linked to supplier: ",
              payee.linkedSupplier.name
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: cn(
              "text-[10px] px-1.5 py-0 h-4 font-medium capitalize",
              typeBadgeColors[payee.payeeType] || typeBadgeColors.other
            ),
            children: payee.payeeType
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: payee.contactPhone || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: payee.contactEmail || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: payee.isActive ? "default" : "secondary",
            className: cn(
              "text-[10px] px-1.5 py-0 h-4 font-medium",
              payee.isActive ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20" : "bg-muted text-muted-foreground"
            ),
            children: payee.isActive ? "Active" : "Inactive"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: () => handleOpenEditDialog(payee),
                disabled: payee.payeeType === "vendor",
                "aria-label": "Edit payee",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: payee.payeeType === "vendor" ? "Edit via Suppliers screen" : "Edit" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: () => handleDelete(payee),
                disabled: payee.payeeType === "vendor",
                "aria-label": "Deactivate payee",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: payee.payeeType === "vendor" ? "Deactivate via Suppliers" : "Deactivate" })
          ] })
        ] }) })
      ] }, payee.id)) })
    ] }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Page ",
        currentPage,
        " of ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: currentPage >= totalPages,
            onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: (open) => open ? setIsDialogOpen(true) : handleCloseDialog(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[85vh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingPayee ? "Edit Payee" : "Add New Payee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingPayee ? "Update payee details. Vendor-type payees are managed via the Suppliers screen." : "Enter the details for the new payee. For suppliers, add them via the Suppliers screen instead." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col flex-1 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-3 overflow-y-auto px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-name", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "payee-name",
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                placeholder: "e.g. KE (Karachi Electric)",
                required: true
              }
            ),
            errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-type", children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.payeeType,
                onValueChange: (v) => setFormData({ ...formData, payeeType: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYEE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
                ]
              }
            ),
            errors.payeeType && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.payeeType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-phone", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "payee-phone",
                value: formData.contactPhone,
                onChange: (e) => setFormData({ ...formData, contactPhone: e.target.value }),
                placeholder: "+92 300 1234567"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-email", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "payee-email",
                type: "email",
                value: formData.contactEmail,
                onChange: (e) => setFormData({ ...formData, contactEmail: e.target.value }),
                placeholder: "contact@example.com"
              }
            ),
            errors.contactEmail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.contactEmail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-address", children: "Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "payee-address",
                value: formData.address,
                onChange: (e) => setFormData({ ...formData, address: e.target.value }),
                placeholder: "Street, city, state…",
                rows: 2
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-notes", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "payee-notes",
                value: formData.notes,
                onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
                placeholder: "Internal notes",
                rows: 2
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "payee-active",
                type: "checkbox",
                checked: formData.isActive,
                onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }),
                className: "h-4 w-4 rounded border-input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "payee-active", className: "font-normal", children: "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editingPayee ? "Save Changes" : "Create Payee" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  PayeesScreen as default
};
