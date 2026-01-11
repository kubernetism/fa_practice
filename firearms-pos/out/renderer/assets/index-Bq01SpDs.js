import { c as createLucideIcon, b as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, k as Plus, P as Package, A as cn, f as formatCurrency, I as Input, v as Select, w as SelectTrigger, E as Building2, x as SelectValue, y as SelectContent, z as SelectItem, l as Badge, T as Trash2, F as ChevronRight, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, L as Label, i as ScrollArea, t as DialogFooter, G as formatDateTime } from "./index-DDxhww62.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-NHahXwy8.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CzOQBzD3.js";
import { S as Separator } from "./separator-ByI8z2rd.js";
import { R as RefreshCw } from "./refresh-cw-ZgPZ5S6S.js";
import { T as TriangleAlert } from "./triangle-alert-DR24cskW.js";
import { S as Search } from "./search-CNJBJ8Ib.js";
import { L as List } from "./list-DO6YbrFe.js";
import { E as Eye } from "./eye-76wX3lSq.js";
import { P as Pencil } from "./pencil-CIqeuQqv.js";
import { C as ChevronLeft } from "./chevron-left-Bwe1BgUq.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Boxes = createLucideIcon("Boxes", [
  [
    "path",
    {
      d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",
      key: "lc1i9w"
    }
  ],
  ["path", { d: "m7 16.5-4.74-2.85", key: "1o9zyk" }],
  ["path", { d: "m7 16.5 5-3", key: "va8pkn" }],
  ["path", { d: "M7 16.5v5.17", key: "jnp8gn" }],
  [
    "path",
    {
      d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",
      key: "8zsnat"
    }
  ],
  ["path", { d: "m17 16.5-5-3", key: "8arw3v" }],
  ["path", { d: "m17 16.5 4.74-2.85", key: "8rfmw" }],
  ["path", { d: "M17 16.5v5.17", key: "k6z78m" }],
  [
    "path",
    {
      d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",
      key: "1xygjf"
    }
  ],
  ["path", { d: "M12 8 7.26 5.15", key: "1vbdud" }],
  ["path", { d: "m12 8 4.74-2.85", key: "3rx089" }],
  ["path", { d: "M12 13.5V8", key: "1io7kd" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChartColumn = createLucideIcon("ChartColumn", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);
const ITEMS_PER_PAGE = 10;
const initialFormData = {
  branchId: "",
  productId: "",
  stockType: "Retail",
  unit: "pcs",
  availability: "0",
  minStockAlert: "5",
  costPricePerBatch: ""
};
function InventoryScreen() {
  const { currentBranch, branches } = useBranch();
  const [inventory, setInventory] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [editingInventory, setEditingInventory] = reactExports.useState(null);
  const [viewingInventory, setViewingInventory] = reactExports.useState(null);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [activeView, setActiveView] = reactExports.useState("summary");
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = reactExports.useState("all");
  const fetchInventory = reactExports.useCallback(async () => {
    try {
      let result;
      if (selectedBranchFilter === "all") {
        result = await window.api.inventory.getAll();
      } else {
        const branchId = parseInt(selectedBranchFilter) || currentBranch?.id;
        result = await window.api.inventory.getByBranch(branchId);
      }
      if (result.success && result.data) {
        const inventoryItems = result.data.map((item) => ({
          ...item.inventory,
          product: item.product,
          branch: item.branch
        }));
        setInventory(inventoryItems);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  }, [currentBranch?.id, selectedBranchFilter]);
  const fetchProducts = reactExports.useCallback(async () => {
    try {
      const result = await window.api.products.getAll({ limit: 1e3, isActive: true });
      if (result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchInventory(), fetchProducts()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchInventory, fetchProducts]);
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };
  const getProductCode = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.code || "N/A";
  };
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || "Unknown Branch";
  };
  const getProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };
  const getStockStatus = (availability, minAlert) => {
    if (availability <= minAlert) return "low";
    if (availability > minAlert * 2) return "good";
    return "normal";
  };
  const getStockStatusBadge = (status) => {
    switch (status) {
      case "low":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Low Stock" });
      case "good":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "In Stock" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "warning", children: "Normal" });
    }
  };
  const getStockStatusColor = (status) => {
    switch (status) {
      case "low":
        return "bg-red-500/5 border-red-500/20 hover:bg-red-500/10";
      case "good":
        return "bg-green-500/5 border-green-500/20 hover:bg-green-500/10";
      default:
        return "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10";
    }
  };
  const filteredInventory = reactExports.useMemo(() => {
    return inventory.filter((item) => {
      const productName = getProductName(item.productId).toLowerCase();
      const productCode = getProductCode(item.productId).toLowerCase();
      const branchName = getBranchName(item.branchId).toLowerCase();
      const search = searchTerm.toLowerCase();
      return productName.includes(search) || productCode.includes(search) || branchName.includes(search);
    });
  }, [inventory, searchTerm, products, branches]);
  const summaryRows = reactExports.useMemo(() => {
    const productMap = /* @__PURE__ */ new Map();
    filteredInventory.forEach((item) => {
      const product = getProduct(item.productId);
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.totalAvailability += item.quantity;
        existing.totalMinAlert += item.minQuantity;
        existing.branchesCount += 1;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: product?.name || "Unknown",
          productCode: product?.code || "N/A",
          totalAvailability: item.quantity,
          totalMinAlert: item.minQuantity,
          branchesCount: 1,
          isSerialTracked: product?.isSerialTracked || false,
          costPrice: product?.costPrice || 0,
          sellingPrice: product?.sellingPrice || 0
        });
      }
    });
    return Array.from(productMap.values()).sort((a, b) => {
      const aIsLow = a.totalAvailability <= a.totalMinAlert;
      const bIsLow = b.totalAvailability <= b.totalMinAlert;
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      return a.productName.localeCompare(b.productName);
    });
  }, [filteredInventory, products]);
  const totalPages = Math.ceil(
    (activeView === "summary" ? summaryRows.length : filteredInventory.length) / ITEMS_PER_PAGE
  );
  const paginatedSummary = summaryRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const lowStockCount = summaryRows.filter(
    (row) => row.totalAvailability <= row.totalMinAlert
  ).length;
  const handleOpenAddDialog = () => {
    setEditingInventory(null);
    setFormData({
      ...initialFormData,
      branchId: currentBranch?.id?.toString() || ""
    });
    setIsDialogOpen(true);
  };
  const handleOpenEditDialog = (item) => {
    setEditingInventory(item);
    setFormData({
      branchId: item.branchId.toString(),
      productId: item.productId.toString(),
      stockType: "Retail",
      unit: "pcs",
      availability: item.quantity.toString(),
      minStockAlert: item.minQuantity.toString(),
      costPricePerBatch: ""
    });
    setIsDialogOpen(true);
  };
  const handleOpenViewDialog = (item) => {
    setViewingInventory(item);
    setIsViewDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInventory(null);
    setFormData(initialFormData);
  };
  const handleSave = async () => {
    if (!formData.branchId || !formData.productId) {
      alert("Please select a branch and product");
      return;
    }
    setIsSaving(true);
    try {
      if (editingInventory) {
        const result = await window.api.inventory.adjust({
          productId: parseInt(formData.productId),
          branchId: parseInt(formData.branchId),
          adjustmentType: "correction",
          quantityChange: parseInt(formData.availability) - editingInventory.quantity,
          reason: "Manual inventory adjustment"
        });
        if (!result.success) {
          alert(result.message || "Failed to update inventory");
          return;
        }
      } else {
        const result = await window.api.inventory.adjust({
          productId: parseInt(formData.productId),
          branchId: parseInt(formData.branchId),
          adjustmentType: "add",
          quantityChange: parseInt(formData.availability),
          reason: "Initial stock entry"
        });
        if (!result.success) {
          alert(result.message || "Failed to add inventory");
          return;
        }
      }
      handleCloseDialog();
      fetchInventory();
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to remove this inventory record for ${getProductName(item.productId)}?`)) {
      return;
    }
    try {
      const result = await window.api.inventory.adjust({
        productId: item.productId,
        branchId: item.branchId,
        adjustmentType: "remove",
        quantityChange: item.quantity,
        reason: "Inventory record removed"
      });
      if (result.success) {
        fetchInventory();
      } else {
        alert(result.message || "Failed to delete inventory");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading inventory..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Inventory Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Track stock levels across branches with low stock alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => fetchInventory(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenAddDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Add Stock"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summaryRows.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "In inventory" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: summaryRows.reduce((sum, row) => sum + row.totalAvailability, 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Units available" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: lowStockCount > 0 ? "border-destructive" : "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Low Stock Alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: cn("h-4 w-4", lowStockCount > 0 ? "text-destructive" : "text-muted-foreground") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("text-2xl font-bold", lowStockCount > 0 && "text-destructive"), children: lowStockCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Products need restock" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Stock Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(
            summaryRows.reduce((sum, row) => sum + row.totalAvailability * row.costPrice, 0)
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "At cost price" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by product, code, or branch...",
              value: searchTerm,
              onChange: (e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              },
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranchFilter, onValueChange: (value) => {
          setSelectedBranchFilter(value);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-48", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Branches" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
            branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: activeView === "summary" ? "default" : "outline",
            size: "sm",
            onClick: () => {
              setActiveView("summary");
              setCurrentPage(1);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "mr-2 h-4 w-4" }),
              "Summary"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: activeView === "transactions" ? "default" : "outline",
            size: "sm",
            onClick: () => {
              setActiveView("transactions");
              setCurrentPage(1);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "mr-2 h-4 w-4" }),
              "Details"
            ]
          }
        )
      ] })
    ] }) }) }),
    activeView === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: paginatedSummary.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "col-span-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex h-40 items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "mx-auto mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No inventory records found" })
    ] }) }) }) : paginatedSummary.map((row) => {
      const status = getStockStatus(row.totalAvailability, row.totalMinAlert);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: cn("cursor-pointer transition-colors", getStockStatusColor(status)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 flex-1 min-w-0", children: [
                status === "low" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-destructive flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base break-words whitespace-normal leading-tight", children: row.productName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-mono", children: row.productCode })
                ] })
              ] }),
              row.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Serial Tracked" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Stock Level" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn(
                    "text-2xl font-bold",
                    status === "low" && "text-destructive",
                    status === "good" && "text-success"
                  ), children: row.totalAvailability })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Min Alert" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-muted-foreground", children: row.totalMinAlert })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  row.branchesCount,
                  " ",
                  row.branchesCount === 1 ? "branch" : "branches"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "Value: ",
                  formatCurrency(row.totalAvailability * row.costPrice)
                ] })
              ] }),
              status === "low" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Below minimum stock level" })
              ] })
            ] })
          ]
        },
        row.productId
      );
    }) }),
    activeView === "transactions" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: paginatedInventory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "mx-auto mb-2 h-12 w-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No inventory records found" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Availability" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Min Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedInventory.map((item) => {
        const status = getStockStatus(item.quantity, item.minQuantity);
        const product = getProduct(item.productId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getProductName(item.productId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-mono", children: getProductCode(item.productId) }),
            product?.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-xs", children: "Serial Tracked" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getBranchName(item.branchId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            status === "low" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-destructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "font-medium",
              status === "low" && "text-destructive",
              status === "good" && "text-success"
            ), children: item.quantity })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: item.minQuantity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStockStatusBadge(status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleOpenViewDialog(item),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleOpenEditDialog(item),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleDelete(item),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
              }
            )
          ] }) })
        ] }, item.id);
      }) })
    ] }) }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
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
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingInventory ? "Edit Inventory" : "Add Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingInventory ? "Update the stock level for this item" : "Add new stock to inventory. If the product already exists at this branch, the quantity will be added to existing stock." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branch", children: "Branch *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.branchId,
              onValueChange: (value) => setFormData({ ...formData, branchId: value }),
              disabled: !!editingInventory,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "product", children: "Product *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.productId,
              onValueChange: (value) => setFormData({ ...formData, productId: value }),
              disabled: !!editingInventory,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-60", children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: product.id.toString(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-muted-foreground mr-2", children: product.code }),
                  product.name
                ] }, product.id)) }) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stockType", children: "Stock Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.stockType,
                onValueChange: (value) => setFormData({ ...formData, stockType: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Retail", children: "Retail" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Wholesale", children: "Wholesale" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Reserve", children: "Reserve" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "unit", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.unit,
                onValueChange: (value) => setFormData({ ...formData, unit: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pcs", children: "Pieces" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "box", children: "Box" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "case", children: "Case" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pack", children: "Pack" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "availability", children: [
              editingInventory ? "New Quantity" : "Quantity to Add",
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "availability",
                type: "number",
                min: "0",
                value: formData.availability,
                onChange: (e) => setFormData({ ...formData, availability: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "minStockAlert", children: "Min Stock Alert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "minStockAlert",
                type: "number",
                min: "0",
                value: formData.minStockAlert,
                onChange: (e) => setFormData({ ...formData, minStockAlert: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "costPricePerBatch", children: "Cost Price Per Batch (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "costPricePerBatch",
              type: "number",
              step: "0.01",
              min: "0",
              value: formData.costPricePerBatch,
              onChange: (e) => setFormData({ ...formData, costPricePerBatch: e.target.value }),
              placeholder: "0.00"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: isSaving, children: isSaving ? "Saving..." : editingInventory ? "Update" : "Add Stock" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }),
        "Inventory Details"
      ] }) }),
      viewingInventory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Status" }),
          getStockStatusBadge(
            getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity)
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Product Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: getProductCode(viewingInventory.productId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getProductName(viewingInventory.productId) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: getBranchName(viewingInventory.branchId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Current Availability" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn(
              "text-3xl font-bold",
              getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity) === "low" && "text-destructive",
              getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity) === "good" && "text-success"
            ), children: viewingInventory.quantity })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Min Stock Alert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-muted-foreground", children: viewingInventory.minQuantity })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Max Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewingInventory.maxQuantity })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Last Restock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewingInventory.lastRestockDate ? formatDateTime(viewingInventory.lastRestockDate) : "N/A" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Last Updated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: formatDateTime(viewingInventory.updatedAt) })
        ] }),
        viewingInventory.quantity <= viewingInventory.minQuantity && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Low Stock Alert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
              "Current stock (",
              viewingInventory.quantity,
              ") is at or below the minimum alert level (",
              viewingInventory.minQuantity,
              "). Consider restocking this item."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Close" }),
        viewingInventory && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setIsViewDialogOpen(false);
          handleOpenEditDialog(viewingInventory);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
          "Edit"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  InventoryScreen
};
