import { Q as useBranch, r as reactExports, ap as debounce, j as jsxRuntimeExports, B as Button, aj as Plus, I as Input, X, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, P as Package, Y as TooltipProvider, aq as formatCurrency, ac as Badge, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, ak as Trash2, C as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, al as DialogFooter } from "./index-DYepRutf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DhpXmfGL.js";
import { T as TriangleAlert } from "./triangle-alert-CwlMuCO8.js";
import { S as Search } from "./search-BPXhvM6p.js";
import { F as Filter } from "./filter-B8xeu-zn.js";
import { S as SquarePen } from "./square-pen-Ckm8F4SU.js";
import { C as ChevronLeft } from "./chevron-left-CgdaxhKk.js";
function ProductsScreen() {
  const { currentBranch } = useBranch();
  const [products, setProducts] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("");
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [editingProduct, setEditingProduct] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    code: "",
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    costPrice: "",
    sellingPrice: "",
    reorderLevel: "10",
    unit: "pcs",
    isSerialTracked: false,
    isTaxable: true,
    taxRate: "8.5",
    barcode: ""
  });
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const fetchProducts = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    setIsLoading(true);
    try {
      const [productsResult, inventoryResult] = await Promise.all([
        window.api.products.getAll({
          page,
          limit: 20,
          search: searchQuery,
          categoryId: selectedCategory ? parseInt(selectedCategory) : void 0,
          isActive: true
        }),
        window.api.inventory.getByBranch(currentBranch.id)
      ]);
      if (productsResult.success && productsResult.data) {
        const inventoryMap = /* @__PURE__ */ new Map();
        if (inventoryResult.success && inventoryResult.data) {
          inventoryResult.data.forEach((item) => {
            inventoryMap.set(item.inventory.productId, item.inventory.quantity);
          });
        }
        const productsWithInventory = productsResult.data.map((product) => ({
          ...product,
          stock: inventoryMap.get(product.id) || 0
        }));
        setProducts(productsWithInventory);
        setTotalPages(productsResult.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedCategory, currentBranch]);
  const fetchCategories = reactExports.useCallback(async () => {
    try {
      const result = await window.api.categories.getAll();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);
  const debouncedSearch = reactExports.useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setPage(1);
    }, 300),
    []
  );
  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      categoryId: "",
      brand: "",
      costPrice: "",
      sellingPrice: "",
      reorderLevel: "10",
      unit: "pcs",
      isSerialTracked: false,
      isTaxable: true,
      taxRate: "8.5",
      barcode: ""
    });
    fetchCategories();
    setShowDialog(true);
  };
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    fetchCategories();
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId?.toString() || "",
      brand: product.brand || "",
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      reorderLevel: product.reorderLevel.toString(),
      unit: product.unit,
      isSerialTracked: product.isSerialTracked,
      isTaxable: product.isTaxable,
      taxRate: product.taxRate.toString(),
      barcode: product.barcode || ""
    });
    setShowDialog(true);
  };
  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const productData = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brand: formData.brand || null,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        reorderLevel: parseInt(formData.reorderLevel),
        unit: formData.unit,
        isSerialTracked: formData.isSerialTracked,
        isTaxable: formData.isTaxable,
        taxRate: parseFloat(formData.taxRate),
        barcode: formData.barcode || null
      };
      let result;
      if (editingProduct) {
        result = await window.api.products.update(editingProduct.id, productData);
      } else {
        result = await window.api.products.create(productData);
      }
      if (result.success) {
        setShowDialog(false);
        fetchProducts();
      } else {
        alert(result.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Save product error:", error);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to deactivate "${product.name}"?`)) return;
    try {
      const result = await window.api.products.delete(product.id);
      if (result.success) {
        fetchProducts();
      } else {
        alert(result.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock !== void 0 && p.stock > 0 && p.stock < p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/70", children: [
            currentBranch?.name || "All branches",
            " inventory"
          ] })
        ] }),
        !isLoading && totalProducts > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            totalProducts,
            " total"
          ] }),
          lowStockCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
            lowStockCount,
            " low"
          ] }),
          outOfStockCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-destructive", children: [
            outOfStockCount,
            " out"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleNewProduct, className: "h-8 px-3 text-xs font-semibold gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        "Add Product"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, code, barcode...",
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedCategory, onValueChange: (value) => {
        setSelectedCategory(value === "all" ? "" : value);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-44 text-xs border-border/50 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-3 w-3 mr-1.5 text-muted-foreground/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
          categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-primary/50 border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/50", children: "Loading products..." })
    ] }) : products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground/50 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-8 w-8 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: searchQuery ? `No results for "${searchQuery}"` : "No products found" }),
      !searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: handleNewProduct, className: "text-xs h-auto p-0 text-primary/70", children: "Add your first product" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-border/40 bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[100px]", children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[120px]", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[90px]", children: "Cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[90px]", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[80px]", children: "Flags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: products.map((product) => {
        const isOutOfStock = product.stock === 0;
        const isLowStock = !isOutOfStock && product.stock !== void 0 && product.stock < product.reorderLevel;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: "group border-border/30 hover:bg-muted/20 transition-colors h-9 cursor-pointer",
            onClick: () => handleEditProduct(product),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-muted-foreground/70", children: product.code }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium leading-tight truncate max-w-[240px]", children: product.name }),
                product.brand && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/40 leading-tight", children: product.brand })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground/60 truncate", children: categories.find((c) => c.id === product.categoryId)?.name || "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 px-3 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium tabular-nums ${isOutOfStock ? "text-destructive" : isLowStock ? "text-warning" : "text-foreground/80"}`, children: product.stock ?? 0 }),
                isLowStock && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline-block ml-1 h-2.5 w-2.5 text-warning/70" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] tabular-nums text-muted-foreground/50", children: formatCurrency(product.costPrice) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold tabular-nums", children: formatCurrency(product.sellingPrice) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                product.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-4 px-1 text-[9px] font-semibold border-info/30 text-info bg-info/5", children: "SN" }),
                product.isTaxable && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-4 px-1 text-[9px] font-medium border-border/40 text-muted-foreground/50 bg-transparent", children: "TAX" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 px-3 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-6 w-6",
                      onClick: () => handleEditProduct(product),
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
                      onClick: () => handleDeleteProduct(product),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Deactivate" })
                ] })
              ] }) })
            ]
          },
          product.id
        );
      }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingProduct ? "Edit Product" : "New Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingProduct ? "Update product information" : "Add a new product to your catalog" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "code", children: "Product Code *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "code",
                value: formData.code,
                onChange: (e) => setFormData({ ...formData, code: e.target.value }),
                placeholder: "SKU-001"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "barcode", children: "Barcode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "barcode",
                value: formData.barcode,
                onChange: (e) => setFormData({ ...formData, barcode: e.target.value }),
                placeholder: "123456789"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "name",
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              placeholder: "Enter product name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.categoryId,
                onValueChange: (value) => setFormData({ ...formData, categoryId: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "brand", children: "Brand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "brand",
                value: formData.brand,
                onChange: (e) => setFormData({ ...formData, brand: e.target.value }),
                placeholder: "Brand name"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "costPrice", children: "Cost Price *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "costPrice",
                type: "number",
                step: "0.01",
                value: formData.costPrice,
                onChange: (e) => setFormData({ ...formData, costPrice: e.target.value }),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellingPrice", children: "Selling Price *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sellingPrice",
                type: "number",
                step: "0.01",
                value: formData.sellingPrice,
                onChange: (e) => setFormData({ ...formData, sellingPrice: e.target.value }),
                placeholder: "0.00"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reorderLevel", children: "Reorder Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "reorderLevel",
                type: "number",
                value: formData.reorderLevel,
                onChange: (e) => setFormData({ ...formData, reorderLevel: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "unit", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "unit",
                value: formData.unit,
                onChange: (e) => setFormData({ ...formData, unit: e.target.value }),
                placeholder: "pcs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", children: "Tax Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "taxRate",
                type: "number",
                step: "0.01",
                value: formData.taxRate,
                onChange: (e) => setFormData({ ...formData, taxRate: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: formData.isSerialTracked,
                onChange: (e) => setFormData({ ...formData, isSerialTracked: e.target.checked }),
                className: "h-4 w-4 rounded border-gray-300"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Serial Number Tracking (for firearms)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: formData.isTaxable,
                onChange: (e) => setFormData({ ...formData, isTaxable: e.target.checked }),
                className: "h-4 w-4 rounded border-gray-300"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Taxable" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSaveProduct,
            disabled: isSaving || !formData.code || !formData.name || !formData.costPrice || !formData.sellingPrice,
            children: isSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ProductsScreen
};
