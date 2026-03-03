import { r as reactExports, j as jsxRuntimeExports, B as Button, J as Plus, C as Card, b as CardHeader, c as CardTitle, i as Users, e as CardContent, U as User, I as Input, ae as cn, a4 as Phone, al as Mail, K as Badge, g as Eye, Q as Trash2, aj as ChevronRight, Z as Dialog, _ as DialogContent, $ as DialogHeader, a0 as DialogTitle, a1 as DialogDescription, L as Label, V as Separator, a6 as Select, a7 as SelectTrigger, a8 as SelectValue, a9 as SelectContent, aa as SelectItem, ah as Textarea, a2 as DialogFooter, ai as formatDateTime, ad as CircleCheckBig } from "./index-BI5tINr-.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DGwW5eFk.js";
import { T as TriangleAlert } from "./triangle-alert-CGhCz8Jb.js";
import { S as Search } from "./search-BoOK6eyz.js";
import { P as Pencil } from "./pencil-CzxybZt0.js";
import { C as ChevronLeft } from "./chevron-left-BtGY3O0v.js";
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
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
        "Expired"
      ] });
    }
    if (isLicenseExpiringSoon(customer.licenseExpiryDate)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "warning", className: "gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
        "Expiring Soon"
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage customer information and licenses" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Add Customer"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Customers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.totalCustomers.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All registered customers" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Active Customers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summary.activeCustomers.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Currently active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Expiring Licenses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-warning" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-warning", children: summary.expiringLicenses }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Within 30 days" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Expired Licenses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-destructive" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-destructive", children: summary.expiredLicenses }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Need renewal" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, phone, email, address, or license...",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: showInactive ? "default" : "outline",
          size: "sm",
          onClick: () => {
            setShowInactive(!showInactive);
            setCurrentPage(1);
          },
          children: showInactive ? "Showing All" : "Show Inactive"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: paginatedCustomers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No customers found" }),
      searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: () => setSearchTerm(""), children: "Clear search to see all customers" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "License No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "License Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedCustomers.map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn(!customer.isActive && "opacity-50"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: getFullName(customer) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer.phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: customer.phone })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "N/A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: customer.email })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "N/A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer.firearmLicenseNumber ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: customer.firearmLicenseNumber }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "No License" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getLicenseStatusBadge(customer) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inactive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleViewCustomer(customer),
              title: "View Details",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleOpenDialog(customer),
              title: "Edit Customer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
            }
          ),
          customer.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleOpenDeleteDialog(customer),
              title: "Deactivate Customer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] }) })
      ] }, customer.id)) })
    ] }) }) }),
    sortedCustomers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        " to",
        " ",
        Math.min(currentPage * ITEMS_PER_PAGE, sortedCustomers.length),
        " of ",
        sortedCustomers.length,
        " customers"
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((p) => p - 1),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "mr-1 h-4 w-4" }),
              "Previous"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: currentPage === totalPages,
            onClick: () => setCurrentPage((p) => p + 1),
            children: [
              "Next",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: (open) => {
      if (!open) handleCloseDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
          editingCustomer ? "Edit Customer" : "Add Customer"
        ] }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
          "Customer Details"
        ] }),
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
  ] });
}
export {
  CustomersScreen
};
