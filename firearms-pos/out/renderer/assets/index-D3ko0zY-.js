import { r as reactExports, j as jsxRuntimeExports, i as Building2, I as Input, X, B as Button, ar as cn, aj as Plus, U as User, an as Phone, av as Mail, ac as FileText, aa as Badge, g as Eye, ak as Trash2, v as ChevronRight, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, L as Label, ae as Separator, T as Textarea, al as DialogFooter, at as formatDateTime } from "./index-BqJlja6h.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Cg9dBpzM.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-BQSJNg88.js";
import { S as Search } from "./search-1wvWjOyx.js";
import { R as RefreshCw } from "./refresh-cw-KY1No_OF.js";
import { M as MapPin } from "./map-pin-CXKPikmF.js";
import { P as Pencil } from "./pencil-DG4sw8nu.js";
import { C as ChevronLeft } from "./chevron-left-nUdnTpj4.js";
const initialFormData = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  taxId: "",
  paymentTerms: "",
  notes: ""
};
function buildFullAddress(supplier) {
  return [supplier.address, supplier.city, supplier.state, supplier.zipCode].filter(Boolean).join(", ");
}
function SuppliersScreen() {
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [totalSuppliers, setTotalSuppliers] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [editingSupplier, setEditingSupplier] = reactExports.useState(null);
  const [viewingSupplier, setViewingSupplier] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [errors, setErrors] = reactExports.useState({});
  const itemsPerPage = 20;
  const fetchSuppliers = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await window.api.suppliers.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        isActive: true
      });
      if (response.success && response.data) {
        setSuppliers(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalSuppliers(response.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);
  reactExports.useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleOpenDialog = (supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zipCode: supplier.zipCode || "",
        taxId: supplier.taxId || "",
        paymentTerms: supplier.paymentTerms || "",
        notes: supplier.notes || ""
      });
    } else {
      setEditingSupplier(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    setFormData(initialFormData);
    setErrors({});
  };
  const handleViewSupplier = (supplier) => {
    setViewingSupplier(supplier);
    setIsViewDialogOpen(true);
  };
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingSupplier(null);
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (editingSupplier) {
        const response = await window.api.suppliers.update(editingSupplier.id, formData);
        if (!response.success) {
          alert(response.message || "Failed to update supplier");
          return;
        }
      } else {
        const response = await window.api.suppliers.create(formData);
        if (!response.success) {
          alert(response.message || "Failed to create supplier");
          return;
        }
      }
      await fetchSuppliers();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      alert("Failed to save supplier. Please try again.");
    }
  };
  const handleDelete = async (supplierId) => {
    if (!confirm("Are you sure you want to deactivate this supplier? This action will mark them as inactive.")) {
      return;
    }
    try {
      const response = await window.api.suppliers.delete(supplierId);
      if (!response.success) {
        alert(response.message || "Failed to delete supplier");
        return;
      }
      await fetchSuppliers();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      alert("Failed to delete supplier. It may have associated purchase transactions.");
    }
  };
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: void 0 }));
    }
  };
  const activeCount = suppliers.filter((s) => s.isActive).length;
  const inactiveCount = totalSuppliers - activeCount;
  const handleAddNew = () => handleOpenDialog();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold shrink-0", children: "Suppliers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
          totalSuppliers,
          " total"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-green-500" }),
          activeCount,
          " active this page"
        ] }),
        inactiveCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground", children: [
          inactiveCount,
          " inactive"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search suppliers...",
              value: searchTerm,
              onChange: (e) => handleSearch(e.target.value),
              className: "h-8 pl-8 pr-8 w-56 text-sm"
            }
          ),
          searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSearch(""),
              className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
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
              className: "h-8 w-8",
              onClick: fetchSuppliers,
              disabled: isLoading,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-3.5 w-3.5", isLoading && "animate-spin") })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: handleAddNew, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1.5" }),
          "Add Supplier"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-muted-foreground", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-muted-foreground", children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-muted-foreground", children: "Business Info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold tracking-wider uppercase text-muted-foreground w-[100px] text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center py-8 text-sm text-muted-foreground", children: "Loading suppliers..." }) }) : suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center py-8 text-sm text-muted-foreground", children: searchTerm ? "No suppliers found matching your search." : "No suppliers yet. Add your first supplier to get started." }) }) : suppliers.map((supplier) => {
          const address = buildFullAddress(supplier);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm leading-tight", children: supplier.name }),
              address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground leading-tight flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-2.5 w-2.5 shrink-0" }),
                address
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: supplier.contactPerson || supplier.phone || supplier.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              supplier.contactPerson && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium leading-tight flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
                supplier.contactPerson
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                supplier.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-2.5 w-2.5 shrink-0" }),
                  supplier.phone
                ] }),
                supplier.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-2.5 w-2.5 shrink-0" }),
                  supplier.email
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "-" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: supplier.taxId || supplier.paymentTerms ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
              supplier.taxId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-2.5 w-2.5 shrink-0" }),
                "Tax: ",
                supplier.taxId
              ] }),
              supplier.paymentTerms && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                "Terms: ",
                supplier.paymentTerms
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "-" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: supplier.isActive ? "default" : "secondary",
                className: "text-[10px] px-1.5 py-0",
                children: supplier.isActive ? "Active" : "Inactive"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                    onClick: () => handleViewSupplier(supplier),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View details" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                    onClick: () => handleOpenDialog(supplier),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit supplier" })
              ] }),
              supplier.isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                    onClick: () => handleDelete(supplier.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Deactivate supplier" })
              ] })
            ] }) })
          ] }, supplier.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-t bg-muted/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: suppliers.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalSuppliers)} of ${totalSuppliers} suppliers` : "No suppliers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              className: "h-7 w-7",
              onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
              disabled: currentPage === 1,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground px-1 tabular-nums", children: [
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
              onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
              disabled: currentPage === totalPages || totalPages === 0,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingSupplier ? "Edit Supplier" : "Add New Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingSupplier ? "Update the supplier information below." : "Enter the details for the new supplier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Basic Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "name", children: [
                  "Supplier Name ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "name",
                    value: formData.name,
                    onChange: (e) => handleInputChange("name", e.target.value),
                    placeholder: "Enter supplier company name",
                    className: cn(errors.name && "border-destructive")
                  }
                ),
                errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contactPerson", children: "Contact Person" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "contactPerson",
                    value: formData.contactPerson,
                    onChange: (e) => handleInputChange("contactPerson", e.target.value),
                    placeholder: "Enter contact person name"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "phone",
                    value: formData.phone,
                    onChange: (e) => handleInputChange("phone", e.target.value),
                    placeholder: "Enter phone number"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "email",
                    type: "email",
                    value: formData.email,
                    onChange: (e) => handleInputChange("email", e.target.value),
                    placeholder: "Enter email address",
                    className: cn(errors.email && "border-destructive")
                  }
                ),
                errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.email })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Address Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Street Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "address",
                    value: formData.address,
                    onChange: (e) => handleInputChange("address", e.target.value),
                    placeholder: "Enter street address"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "city", children: "City" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "city",
                    value: formData.city,
                    onChange: (e) => handleInputChange("city", e.target.value),
                    placeholder: "Enter city"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "state", children: "State" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "state",
                    value: formData.state,
                    onChange: (e) => handleInputChange("state", e.target.value),
                    placeholder: "Enter state"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "zipCode", children: "ZIP Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "zipCode",
                    value: formData.zipCode,
                    onChange: (e) => handleInputChange("zipCode", e.target.value),
                    placeholder: "Enter ZIP code"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Business Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxId", children: "Tax ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "taxId",
                    value: formData.taxId,
                    onChange: (e) => handleInputChange("taxId", e.target.value),
                    placeholder: "Enter tax ID number"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "paymentTerms",
                    value: formData.paymentTerms,
                    onChange: (e) => handleInputChange("paymentTerms", e.target.value),
                    placeholder: "e.g., Net 30, Net 60"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "notes",
                    value: formData.notes,
                    onChange: (e) => handleInputChange("notes", e.target.value),
                    placeholder: "Additional notes about this supplier",
                    rows: 3
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
            editingSupplier ? "Update" : "Create",
            " Supplier"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Supplier Details" }) }),
      viewingSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
            "Basic Information"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Supplier Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: viewingSupplier.isActive ? "default" : "secondary", children: viewingSupplier.isActive ? "Active" : "Inactive" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Contact Person" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.contactPerson || "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.phone || "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.email || "-" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            "Address"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.address || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: [viewingSupplier.city, viewingSupplier.state, viewingSupplier.zipCode].filter(Boolean).join(", ") || "-" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            "Business Information"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Tax ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.taxId || "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Payment Terms" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingSupplier.paymentTerms || "-" })
            ] }),
            viewingSupplier.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: viewingSupplier.notes })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDateTime(viewingSupplier.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Last Updated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDateTime(viewingSupplier.updatedAt) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCloseViewDialog, children: "Close" }),
        viewingSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              handleCloseViewDialog();
              handleOpenDialog(viewingSupplier);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 mr-2" }),
              "Edit"
            ]
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  SuppliersScreen as default
};
