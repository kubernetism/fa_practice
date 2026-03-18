import { t as useBranch, r as reactExports, ay as debounce, j as jsxRuntimeExports, B as Button, aq as Plus, C as Card, e as CardContent, I as Input, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, P as Package, az as formatCurrency, ai as Badge, as as Trash2, ad as Dialog, ae as DialogContent, af as DialogHeader, ag as DialogTitle, ah as DialogDescription, L as Label, au as DialogFooter } from "./index-DH-ZMwKK.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DpKJnqzE.js";
import { S as Search } from "./search-ChvnPRy-.js";
import { S as SquarePen } from "./square-pen-DWViWBvA.js";
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
    setShowDialog(true);
  };
  const handleEditProduct = (product) => {
    setEditingProduct(product);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Manage your product catalog • Stock levels for ",
          currentBranch?.name || "selected branch"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNewProduct, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Add Product"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search products...",
            className: "pl-9",
            onChange: (e) => debouncedSearch(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedCategory, onValueChange: (value) => {
        setSelectedCategory(value === "all" ? "" : value);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
          categories.filter((c) => c.isActive).map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category.id.toString(), children: category.name }, category.id))
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-64 flex-col items-center justify-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No products found" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: product.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: product.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: categories.find((c) => c.id === product.categoryId)?.name || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: product.stock === 0 ? "text-destructive" : product.stock && product.stock < product.reorderLevel ? "text-warning" : "", children: product.stock ?? 0 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatCurrency(product.costPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(product.sellingPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: product.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Serial Tracked" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleEditProduct(product),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleDeleteProduct(product),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] })
      ] }, product.id)) })
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
