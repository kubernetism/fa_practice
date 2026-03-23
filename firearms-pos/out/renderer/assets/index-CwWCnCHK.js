import { r as reactExports, j as jsxRuntimeExports, B as Button, ah as Plus, I as Input, X, as as cn, aa as Badge, c as Eye, ai as Trash2, C as ChevronRight, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, L as Label, ad as Separator, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, o as Textarea, aj as DialogFooter, au as formatDateTime, ar as CircleCheckBig } from "./index-DXbUu2xA.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BSItO8iL.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-pmxoAh34.js";
import { S as Search } from "./search-BdMn6Hff.js";
import { P as Pencil } from "./pencil-CYdAHCZR.js";
import { C as ChevronLeft } from "./chevron-left-YJm91nXQ.js";
import { T as TriangleAlert } from "./triangle-alert-D1-hia1k.js";
const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  governmentIdType: "",
  governmentIdNumber: "",
  firearmLicenseNumber: "",
  licenseExpiryDate: "",
  dateOfBirth: "",
  notes: ""
};
const GOVERNMENT_ID_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
  { value: "military_id", label: "Military ID" },
  { value: "other", label: "Other" }
];
const ITEMS_PER_PAGE = 10;
function CustomersScreen() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const [editingCustomer, setEditingCustomer] = reactExports.useState(null);
  const [viewingCustomer, setViewingCustomer] = reactExports.useState(null);
  const [deletingCustomer, setDeletingCustomer] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const [summary, setSummary] = reactExports.useState({
    totalCustomers: 0,
    activeCustomers: 0,
    expiringLicenses: 0,
    expiredLicenses: 0
  });
  const fetchCustomers = reactExports.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await window.api.customers.getAll({ limit: 1e3 });
      if (result.success && result.data) {
        setCustomers(result.data);
        calculateSummary(result.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  const calculateSummary = (customersData) => {
    const today = /* @__PURE__ */ new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1e3);
    const activeCustomers = customersData.filter((c) => c.isActive);
    let expiringLicenses = 0;
    let expiredLicenses = 0;
    activeCustomers.forEach((c) => {
      if (c.licenseExpiryDate) {
        const expiryDate = new Date(c.licenseExpiryDate);
        if (expiryDate < today) {
          expiredLicenses++;
        } else if (expiryDate < thirtyDaysFromNow) {
          expiringLicenses++;
        }
      }
    });
    setSummary({
      totalCustomers: customersData.length,
      activeCustomers: activeCustomers.length,
      expiringLicenses,
      expiredLicenses
    });
  };
  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < /* @__PURE__ */ new Date();
  };
  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = /* @__PURE__ */ new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1e3);
    return expiry < thirtyDaysFromNow && expiry > today;
  };
  const getLicenseStatusBadge = (customer) => {
    if (!customer.firearmLicenseNumber) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "No License" });
    }
    if (isLicenseExpired(customer.licenseExpiryDate)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-[10px] px-1.5 py-0 gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
        "Expired"
      ] });
    }
    if (isLicenseExpiringSoon(customer.licenseExpiryDate)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "warning", className: "text-[10px] px-1.5 py-0 gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
        "Expiring Soon"
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "text-[10px] px-1.5 py-0 gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-2.5 w-2.5" }),
      "Valid"
    ] });
  };
  const getFullName = (customer) => {
    return `${customer.firstName} ${customer.lastName}`.trim();
  };
  const getFullAddress = (customer) => {
    const parts = [customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean);
    return parts.join(", ") || "N/A";
  };
  const getIdTypeLabel = (type) => {
    if (!type) return "N/A";
    const found = GOVERNMENT_ID_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };
  const filteredCustomers = reactExports.useMemo(() => {
    return customers.filter((customer) => {
      if (!showInactive && !customer.isActive) return false;
      const search = searchTerm.toLowerCase();
      const matchesSearch = customer.firstName.toLowerCase().includes(search) || customer.lastName.toLowerCase().includes(search) || (customer.phone || "").toLowerCase().includes(search) || (customer.email || "").toLowerCase().includes(search) || (customer.address || "").toLowerCase().includes(search) || (customer.governmentIdNumber || "").toLowerCase().includes(search) || (customer.firearmLicenseNumber || "").toLowerCase().includes(search);
      return matchesSearch;
    });
  }, [customers, searchTerm, showInactive]);
  const sortedCustomers = reactExports.useMemo(() => {
    return [...filteredCustomers].sort(
      (a, b) => getFullName(a).localeCompare(getFullName(b))
    );
  }, [filteredCustomers]);
  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const handleOpenDialog = (customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        zipCode: customer.zipCode || "",
        governmentIdType: customer.governmentIdType || "",
        governmentIdNumber: customer.governmentIdNumber || "",
        firearmLicenseNumber: customer.firearmLicenseNumber || "",
        licenseExpiryDate: customer.licenseExpiryDate?.split("T")[0] || "",
        dateOfBirth: customer.dateOfBirth?.split("T")[0] || "",
        notes: customer.notes || ""
      });
    } else {
      setEditingCustomer(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
  };
  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
    setIsViewDialogOpen(true);
  };
  const handleOpenDeleteDialog = (customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First name and last name are required");
      return;
    }
    try {
      setIsSubmitting(true);
      const customerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null,
        governmentIdType: formData.governmentIdType || null,
        governmentIdNumber: formData.governmentIdNumber.trim() || null,
        firearmLicenseNumber: formData.firearmLicenseNumber.trim() || null,
        licenseExpiryDate: formData.licenseExpiryDate || null,
        dateOfBirth: formData.dateOfBirth || null,
        notes: formData.notes.trim() || null
      };
      let result;
      if (editingCustomer) {
        result = await window.api.customers.update(editingCustomer.id, customerData);
      } else {
        result = await window.api.customers.create(customerData);
      }
      if (result.success) {
        handleCloseDialog();
        fetchCustomers();
      } else {
        alert(result.message || "Failed to save customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("An error occurred while saving the customer");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      setIsDeleting(true);
      const result = await window.api.customers.delete(deletingCustomer.id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        setDeletingCustomer(null);
        fetchCustomers();
      } else {
        alert(result.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("An error occurred while deleting the customer");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading customers..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            summary.totalCustomers,
            " Total"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            summary.activeCustomers,
            " Active"
          ] }),
          summary.expiringLicenses > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium", children: [
            summary.expiringLicenses,
            " Expiring"
          ] }),
          summary.expiredLicenses > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium", children: [
            summary.expiredLicenses,
            " Expired"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Add Customer"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, phone, email, license...",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 pl-8 text-sm"
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: showInactive ? "default" : "outline",
          size: "sm",
          className: "h-8 text-xs",
          onClick: () => {
            setShowInactive(!showInactive);
            setCurrentPage(1);
          },
          children: showInactive ? "Showing All" : "Show Inactive"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: paginatedCustomers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-sm text-muted-foreground", children: "No customers found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "License" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[100px] text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedCustomers.map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn("group h-9", !customer.isActive && "opacity-50"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: getFullName(customer) }),
          customer.governmentIdNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[11px] text-muted-foreground", children: [
            getIdTypeLabel(customer.governmentIdType),
            ": ",
            customer.governmentIdNumber
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: customer.phone || "—" }),
          customer.email && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-muted-foreground truncate max-w-[180px]", children: customer.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: customer.firearmLicenseNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: customer.firearmLicenseNumber }),
          getLicenseStatusBadge(customer)
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "No License" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: customer.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", className: "text-[10px] px-1.5 py-0", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "Inactive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleViewCustomer(customer), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View Details" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleOpenDialog(customer), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit" })
          ] }),
          customer.isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleOpenDeleteDialog(customer), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Deactivate" })
          ] })
        ] }) })
      ] }, customer.id)) })
    ] }) }),
    sortedCustomers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        sortedCustomers.length,
        " customer",
        sortedCustomers.length !== 1 ? "s" : ""
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[3rem] text-center text-xs", children: [
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: (open) => {
      if (!open) handleCloseDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCustomer ? "Edit Customer" : "Add Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingCustomer ? "Update customer information" : "Enter customer details to create a new record" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-muted-foreground", children: "Basic Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "firstName", children: "First Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "firstName",
                  value: formData.firstName,
                  onChange: (e) => handleInputChange("firstName", e.target.value),
                  placeholder: "John",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lastName", children: "Last Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "lastName",
                  value: formData.lastName,
                  onChange: (e) => handleInputChange("lastName", e.target.value),
                  placeholder: "Doe",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "phone",
                  value: formData.phone,
                  onChange: (e) => handleInputChange("phone", e.target.value),
                  placeholder: "+1 234 567 8900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  value: formData.email,
                  onChange: (e) => handleInputChange("email", e.target.value),
                  placeholder: "john@example.com"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Street Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "address",
                value: formData.address,
                onChange: (e) => handleInputChange("address", e.target.value),
                placeholder: "123 Main St"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "city", children: "City" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "city",
                  value: formData.city,
                  onChange: (e) => handleInputChange("city", e.target.value),
                  placeholder: "New York"
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
                  placeholder: "NY"
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
                  placeholder: "10001"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateOfBirth", children: "Date of Birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "dateOfBirth",
                type: "date",
                value: formData.dateOfBirth,
                onChange: (e) => handleInputChange("dateOfBirth", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-muted-foreground", children: "Identification & License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "governmentIdType", children: "Government ID Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.governmentIdType,
                  onValueChange: (value) => handleInputChange("governmentIdType", value),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select ID type" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GOVERNMENT_ID_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type.value, children: type.label }, type.value)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "governmentIdNumber", children: "Government ID Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "governmentIdNumber",
                  value: formData.governmentIdNumber,
                  onChange: (e) => handleInputChange("governmentIdNumber", e.target.value),
                  placeholder: "ID Number"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "firearmLicenseNumber", children: "Firearm License Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "firearmLicenseNumber",
                  value: formData.firearmLicenseNumber,
                  onChange: (e) => handleInputChange("firearmLicenseNumber", e.target.value),
                  placeholder: "LIC-123456"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "licenseExpiryDate", children: "License Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "licenseExpiryDate",
                  type: "date",
                  value: formData.licenseExpiryDate,
                  onChange: (e) => handleInputChange("licenseExpiryDate", e.target.value)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-muted-foreground", children: "Additional Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "notes",
                value: formData.notes,
                onChange: (e) => handleInputChange("notes", e.target.value),
                placeholder: "Additional customer information...",
                rows: 3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Customer Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: viewingCustomer && getFullName(viewingCustomer) })
      ] }),
      viewingCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getFullName(viewingCustomer) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Status" }),
            viewingCustomer.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inactive" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer.phone || "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer.email || "N/A" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getFullAddress(viewingCustomer) })
        ] }),
        viewingCustomer.dateOfBirth && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Date of Birth" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: new Date(viewingCustomer.dateOfBirth).toLocaleDateString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Identification & License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Government ID Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getIdTypeLabel(viewingCustomer.governmentIdType) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Government ID Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewingCustomer.governmentIdNumber || "N/A" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Firearm License Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewingCustomer.firearmLicenseNumber || "N/A" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License Expiry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewingCustomer.licenseExpiryDate ? new Date(viewingCustomer.licenseExpiryDate).toLocaleDateString() : "N/A" }),
                viewingCustomer.firearmLicenseNumber && getLicenseStatusBadge(viewingCustomer)
              ] })
            ] })
          ] })
        ] }),
        viewingCustomer.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: viewingCustomer.notes })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDateTime(viewingCustomer.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Last Updated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDateTime(viewingCustomer.updatedAt) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Close" }),
        viewingCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setIsViewDialogOpen(false);
          handleOpenDialog(viewingCustomer);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
          "Edit Customer"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }),
          "Deactivate Customer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Are you sure you want to deactivate this customer? They will be marked as inactive but their records will be preserved." })
      ] }),
      deletingCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getFullName(deletingCustomer) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          deletingCustomer.phone || "No phone",
          " • ",
          deletingCustomer.email || "No email"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsDeleteDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: handleDelete,
            disabled: isDeleting,
            children: isDeleting ? "Deactivating..." : "Deactivate Customer"
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  CustomersScreen
};
