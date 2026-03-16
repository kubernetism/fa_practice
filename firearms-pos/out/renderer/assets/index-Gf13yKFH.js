import { r as reactExports, ad as debounce, j as jsxRuntimeExports, I as Input, a8 as Select, a9 as SelectTrigger, aa as SelectValue, ab as SelectContent, ac as SelectItem, B as Button, K as Plus, C as Card, e as CardContent, W as Wrench, ae as formatCurrency, M as Badge, D as DollarSign, O as Clock, V as Trash2, _ as Dialog, $ as DialogContent, a0 as DialogHeader, a1 as DialogTitle, a2 as DialogDescription, L as Label, aj as Textarea, a4 as DialogFooter } from "./index-fpI7poSv.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-B1q-844N.js";
import { S as Search } from "./search-BEschOK6.js";
import { S as SquarePen } from "./square-pen-1ktW8lKp.js";
function ServicesScreen() {
  const [services, setServices] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("");
  const [showServiceDialog, setShowServiceDialog] = reactExports.useState(false);
  const [editingService, setEditingService] = reactExports.useState(null);
  const [serviceFormData, setServiceFormData] = reactExports.useState({
    code: "",
    name: "",
    description: "",
    categoryId: "",
    price: "",
    pricingType: "flat",
    estimatedDuration: "60",
    isTaxable: true,
    taxRate: "0"
  });
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const fetchServices = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.api.services.getAll({
        page,
        limit: 20,
        search: searchQuery,
        categoryId: selectedCategory ? parseInt(selectedCategory) : void 0,
        isActive: true
      });
      if (result.success && result.data) {
        setServices(result.data);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedCategory]);
  const fetchCategories = reactExports.useCallback(async () => {
    try {
      const result = await window.api.services.getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch service categories:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);
  const debouncedSearch = reactExports.useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setPage(1);
    }, 300),
    []
  );
  const handleNewService = () => {
    setEditingService(null);
    setServiceFormData({
      code: "",
      name: "",
      description: "",
      categoryId: "",
      price: "",
      pricingType: "flat",
      estimatedDuration: "60",
      isTaxable: true,
      taxRate: "0"
    });
    setShowServiceDialog(true);
  };
  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      code: service.code,
      name: service.name,
      description: service.description || "",
      categoryId: service.categoryId?.toString() || "",
      price: service.price.toString(),
      pricingType: service.pricingType,
      estimatedDuration: service.estimatedDuration?.toString() || "60",
      isTaxable: service.isTaxable,
      taxRate: service.taxRate.toString()
    });
    setShowServiceDialog(true);
  };
  const handleSaveService = async () => {
    setIsSaving(true);
    try {
      const serviceData = {
        code: serviceFormData.code,
        name: serviceFormData.name,
        description: serviceFormData.description || null,
        categoryId: serviceFormData.categoryId ? parseInt(serviceFormData.categoryId) : null,
        price: parseFloat(serviceFormData.price),
        pricingType: serviceFormData.pricingType,
        estimatedDuration: parseInt(serviceFormData.estimatedDuration),
        isTaxable: serviceFormData.isTaxable,
        taxRate: parseFloat(serviceFormData.taxRate)
      };
      let result;
      if (editingService) {
        result = await window.api.services.update(editingService.id, serviceData);
      } else {
        result = await window.api.services.create(serviceData);
      }
      if (result.success) {
        setShowServiceDialog(false);
        fetchServices();
      } else {
        alert(result.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Save service error:", error);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteService = async (service) => {
    if (!confirm(`Are you sure you want to deactivate "${service.name}"?`)) return;
    try {
      const result = await window.api.services.delete(service.id);
      if (result.success) {
        fetchServices();
      } else {
        alert(result.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Delete service error:", error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Services" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage your service offerings like repairs, maintenance, customization, and testing" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search services...",
                className: "pl-9",
                onChange: (e) => debouncedSearch(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: selectedCategory,
              onValueChange: (value) => {
                setSelectedCategory(value === "all" ? "" : value);
                setPage(1);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
                  categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNewService, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Add Service"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : services.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-64 flex-col items-center justify-center text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "mb-2 h-12 w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No services found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: handleNewService, children: "Add your first service" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Pricing Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tax" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: services.map((service) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: service.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: service.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: categories.find((c) => c.id === service.categoryId)?.name || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right font-medium", children: [
            formatCurrency(service.price),
            service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "/hr" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: service.pricingType === "flat" ? "default" : "secondary", children: [
            service.pricingType === "flat" ? /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "mr-1 h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-3 w-3" }),
            service.pricingType
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: service.estimatedDuration ? `${service.estimatedDuration} min` : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: service.isTaxable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            service.taxRate,
            "%"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "N/A" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleEditService(service),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleDeleteService(service),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
              }
            )
          ] })
        ] }, service.id)) })
      ] }) }) }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: page === 1,
            onClick: () => setPage((p) => p - 1),
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
            disabled: page === totalPages,
            onClick: () => setPage((p) => p + 1),
            children: "Next"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showServiceDialog, onOpenChange: setShowServiceDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingService ? "Edit Service" : "New Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingService ? "Update service information" : "Add a new service to your catalog" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "code", children: "Service Code *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "code",
                value: serviceFormData.code,
                onChange: (e) => setServiceFormData({ ...serviceFormData, code: e.target.value }),
                placeholder: "SRV-001"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: serviceFormData.categoryId,
                onValueChange: (value) => setServiceFormData({ ...serviceFormData, categoryId: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id)) })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Service Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "name",
              value: serviceFormData.name,
              onChange: (e) => setServiceFormData({ ...serviceFormData, name: e.target.value }),
              placeholder: "e.g., Weapon Repair, Part Replacement"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "description",
              value: serviceFormData.description,
              onChange: (e) => setServiceFormData({ ...serviceFormData, description: e.target.value }),
              placeholder: "Describe the service...",
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "price", children: "Price *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "price",
                type: "number",
                step: "0.01",
                value: serviceFormData.price,
                onChange: (e) => setServiceFormData({ ...serviceFormData, price: e.target.value }),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pricingType", children: "Pricing Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: serviceFormData.pricingType,
                onValueChange: (value) => setServiceFormData({ ...serviceFormData, pricingType: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flat", children: "Flat Rate" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hourly", children: "Hourly Rate" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "estimatedDuration", children: "Est. Duration (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "estimatedDuration",
                type: "number",
                value: serviceFormData.estimatedDuration,
                onChange: (e) => setServiceFormData({ ...serviceFormData, estimatedDuration: e.target.value }),
                placeholder: "60"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "isTaxable",
                checked: serviceFormData.isTaxable,
                onChange: (e) => setServiceFormData({ ...serviceFormData, isTaxable: e.target.checked }),
                className: "h-4 w-4 rounded border-gray-300"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isTaxable", children: "Taxable" })
          ] }),
          serviceFormData.isTaxable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", children: "Tax Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "taxRate",
                type: "number",
                step: "0.01",
                value: serviceFormData.taxRate,
                onChange: (e) => setServiceFormData({ ...serviceFormData, taxRate: e.target.value }),
                placeholder: "0"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowServiceDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSaveService,
            disabled: isSaving || !serviceFormData.code || !serviceFormData.name || !serviceFormData.price,
            children: isSaving ? "Saving..." : editingService ? "Update Service" : "Create Service"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ServicesScreen
};
