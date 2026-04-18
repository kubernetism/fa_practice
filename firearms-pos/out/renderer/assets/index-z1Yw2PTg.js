import { r as reactExports, ap as debounce, j as jsxRuntimeExports, a0 as DollarSign, ae as Clock, B as Button, aj as Plus, I as Input, X, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, W as Wrench, Y as TooltipProvider, aq as formatCurrency, ac as Badge, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, ak as Trash2, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, p as Textarea, al as DialogFooter } from "./index-DYepRutf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DhpXmfGL.js";
import { S as Search } from "./search-BPXhvM6p.js";
import { F as Filter } from "./filter-B8xeu-zn.js";
import { S as SquarePen } from "./square-pen-Ckm8F4SU.js";
import { C as ChevronLeft } from "./chevron-left-CgdaxhKk.js";
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
  const totalServices = services.length;
  const flatCount = services.filter((s) => s.pricingType === "flat").length;
  const hourlyCount = services.filter((s) => s.pricingType === "hourly").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: "Repairs, maintenance, customization & testing" })
        ] }),
        !isLoading && totalServices > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            totalServices,
            " total"
          ] }),
          flatCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-primary/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-2.5 w-2.5" }),
            flatCount,
            " flat"
          ] }),
          hourlyCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
            hourlyCount,
            " hourly"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleNewService, className: "h-8 px-3 text-xs font-semibold gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        "Add Service"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search services...",
            className: "h-8 pl-8 pr-8 text-xs bg-card border-border/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40",
            onChange: (e) => debouncedSearch(e.target.value)
          }
        ),
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchQuery("");
              setPage(1);
            },
            className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-44 text-xs border-border/50 bg-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-3 w-3 mr-1.5 text-muted-foreground/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
              categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id))
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-info/50 border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/50", children: "Loading services..." })
    ] }) : services.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground/50 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-8 w-8 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: searchQuery ? `No results for "${searchQuery}"` : "No services found" }),
      !searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: handleNewService, className: "text-xs h-auto p-0 text-primary/70", children: "Add your first service" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-border/40 bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[100px]", children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60", children: "Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[120px]", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[100px]", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[80px]", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[80px]", children: "Duration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[60px]", children: "Tax" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: services.map((service) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          className: "group border-border/30 hover:bg-muted/20 transition-colors h-9 cursor-pointer",
          onClick: () => handleEditService(service),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-muted-foreground/70", children: service.code }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium leading-tight truncate max-w-[260px]", children: service.name }),
              service.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/40 leading-tight truncate max-w-[260px]", children: service.description })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground/60 truncate", children: categories.find((c) => c.id === service.categoryId)?.name || "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 px-3 text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold tabular-nums", children: formatCurrency(service.price) }),
              service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground/40 ml-0.5", children: "/hr" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "outline",
                className: `h-4 px-1.5 text-[9px] font-semibold gap-0.5 ${service.pricingType === "hourly" ? "border-info/30 text-info bg-info/5" : "border-border/40 text-muted-foreground/60 bg-transparent"}`,
                children: [
                  service.pricingType === "hourly" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-2.5 w-2.5" }),
                  service.pricingType
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] tabular-nums text-muted-foreground/50", children: service.estimatedDuration ? `${service.estimatedDuration}m` : "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: service.isTaxable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "h-4 px-1 text-[9px] font-medium border-border/40 text-muted-foreground/50 bg-transparent", children: [
              service.taxRate,
              "%"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/30", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-6 w-6",
                    onClick: () => handleEditService(service),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3 w-3" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Edit" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-6 w-6 hover:bg-destructive/10 hover:text-destructive",
                    onClick: () => handleDeleteService(service),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Deactivate" })
              ] })
            ] }) })
          ]
        },
        service.id
      )) })
    ] }) }) }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between shrink-0 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground/50 tabular-nums", children: [
        "Page ",
        page,
        " of ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7 border-border/40",
            disabled: page === 1,
            onClick: () => setPage((p) => p - 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7 border-border/40",
            disabled: page === totalPages,
            onClick: () => setPage((p) => p + 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
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
