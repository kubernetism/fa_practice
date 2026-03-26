import { c as createLucideIcon, u as useBranch, ah as useAuth, r as reactExports, j as jsxRuntimeExports, K as RefreshCw, B as Button, P as Plus, a2 as Card, ad as CardHeader, ae as CardTitle, aB as ClipboardList, a3 as CardContent, O as CircleCheckBig, h as formatCurrency, A as cn, ac as CircleX, _ as FileText, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, L as Label, S as Select, a as SelectTrigger, b as SelectValue, e as SelectContent, f as SelectItem, I as Input, x as Textarea, t as DialogFooter, ab as ScrollArea, E as formatDateTime, i as Badge, T as TooltipProvider, g as Package, k as Tooltip, l as TooltipTrigger, m as TooltipContent, X, Q as Building2, F as Eye, n as Trash2, C as ChevronRight, z as Separator } from "./index-CQ_f3o8V.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DlXrGh-I.js";
import { P as Play } from "./play-7WBAcku3.js";
import { T as TriangleAlert } from "./triangle-alert-DCrF6f46.js";
import { A as ArrowUpDown } from "./arrow-up-down-h1MnkuPw.js";
import { S as Search } from "./search-BsjKBveU.js";
import { C as ChartColumn } from "./chart-column-nnBZzNZY.js";
import { L as List } from "./list-C2wYJ-wa.js";
import { P as Pencil } from "./pencil-b2-ac2xY.js";
import { C as ChevronLeft } from "./chevron-left-N63bQRh9.js";
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
function CycleCountManager() {
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const [counts, setCounts] = reactExports.useState([]);
  const [selectedCount, setSelectedCount] = reactExports.useState(null);
  const [countItems, setCountItems] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = reactExports.useState(false);
  const [isCountDialogOpen, setIsCountDialogOpen] = reactExports.useState(false);
  const [isVarianceDialogOpen, setIsVarianceDialogOpen] = reactExports.useState(false);
  const [varianceReport, setVarianceReport] = reactExports.useState(null);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [createForm, setCreateForm] = reactExports.useState({
    countType: "cycle",
    scheduledDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    notes: ""
  });
  const fetchCounts = reactExports.useCallback(async () => {
    if (!currentBranch?.id) return;
    try {
      setIsLoading(true);
      const result = await window.api.inventoryCounts.list(currentBranch.id);
      if (result.success && result.data) {
        setCounts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch?.id]);
  reactExports.useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);
  const handleCreateCount = async () => {
    if (!currentBranch?.id) {
      alert("Please select a branch first");
      return;
    }
    if (!user?.userId) {
      alert("User not logged in");
      return;
    }
    try {
      console.log("Creating count with:", {
        branchId: currentBranch.id,
        countType: createForm.countType,
        scheduledDate: createForm.scheduledDate,
        notes: createForm.notes,
        userId: user.userId
      });
      const result = await window.api.inventoryCounts.create({
        branchId: currentBranch.id,
        countType: createForm.countType,
        scheduledDate: createForm.scheduledDate,
        notes: createForm.notes,
        userId: user.userId
      });
      console.log("Create count result:", result);
      if (result.success) {
        setIsCreateDialogOpen(false);
        setCreateForm({
          countType: "cycle",
          scheduledDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          notes: ""
        });
        fetchCounts();
      } else {
        alert(result.message || "Failed to create count");
      }
    } catch (error) {
      console.error("Failed to create count:", error);
      alert("Failed to create count: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  const handleStartCount = async (countId) => {
    if (!user?.userId) return;
    try {
      const result = await window.api.inventoryCounts.start(countId, user.userId);
      if (result.success) {
        fetchCounts();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to start count:", error);
    }
  };
  const handleOpenCount = async (count) => {
    try {
      const result = await window.api.inventoryCounts.get(count.id);
      if (result.success && result.data) {
        setSelectedCount(result.data);
        setCountItems(result.data.items || []);
        setIsCountDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to get count:", error);
    }
  };
  const handleRecordCount = async (itemId, countedQuantity) => {
    if (!user?.userId) return;
    try {
      const result = await window.api.inventoryCounts.recordCount({
        countItemId: itemId,
        countedQuantity,
        userId: user.userId
      });
      if (result.success) {
        setCountItems(
          (prev) => prev.map(
            (item) => item.id === itemId ? {
              ...item,
              countedQuantity,
              varianceQuantity: result.data?.varianceQuantity,
              varianceValue: result.data?.varianceValue,
              variancePercent: result.data?.variancePercent
            } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to record count:", error);
    }
  };
  const handleCompleteCount = async () => {
    if (!selectedCount || !user?.userId) return;
    try {
      const result = await window.api.inventoryCounts.complete(selectedCount.id, user.userId);
      if (result.success) {
        setIsCountDialogOpen(false);
        fetchCounts();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to complete count:", error);
    }
  };
  const handleCancelCount = async (countId) => {
    if (!user?.userId) return;
    if (!confirm("Are you sure you want to cancel this count?")) return;
    try {
      const result = await window.api.inventoryCounts.cancel(countId, user.userId);
      if (result.success) {
        fetchCounts();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to cancel count:", error);
    }
  };
  const handleViewVarianceReport = async (countId) => {
    try {
      const result = await window.api.inventoryCounts.varianceReport(countId);
      if (result.success && result.data) {
        setVarianceReport(result.data);
        setIsVarianceDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to get variance report:", error);
    }
  };
  const handleApplyAdjustments = async (countId) => {
    if (!user?.userId) return;
    if (!confirm("This will update inventory quantities based on count variances. Continue?")) return;
    try {
      const result = await window.api.inventoryCounts.applyAdjustments(countId, user.userId);
      if (result.success) {
        alert(`Applied ${result.data?.adjustedCount} inventory adjustments`);
        fetchCounts();
        if (varianceReport) {
          handleViewVarianceReport(countId);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to apply adjustments:", error);
    }
  };
  const filteredItems = countItems.filter(
    (item) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Draft" });
      case "in_progress":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", children: "In Progress" });
      case "completed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-600", children: "Completed" });
      case "cancelled":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Cancelled" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: status });
    }
  };
  const getCountTypeLabel = (type) => {
    switch (type) {
      case "full":
        return "Full Inventory";
      case "cycle":
        return "Cycle Count";
      case "spot":
        return "Spot Check";
      case "annual":
        return "Annual Count";
      default:
        return type;
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "Cycle Counts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage inventory counts and reconciliation" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsCreateDialogOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "New Count"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Counts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: counts.length }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "In Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 text-blue-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: counts.filter((c) => c.status === "in_progress").length }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: counts.filter((c) => c.status === "completed").length }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Variance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-orange-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(
          counts.filter((c) => c.status === "completed").reduce((sum, c) => sum + (c.varianceValue || 0), 0)
        ) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Count Sessions" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: counts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-12 w-12 text-muted-foreground mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No cycle counts yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Create a new count to start reconciling inventory" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Count #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Scheduled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Variance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: counts.map((count) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: count.countNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getCountTypeLabel(count.countType) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStatusBadge(count.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: count.scheduledDate ? new Date(count.scheduledDate).toLocaleDateString() : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: count.totalItems }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-center", children: [
            count.itemsCounted,
            "/",
            count.totalItems
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: count.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "font-medium",
                (count.varianceValue || 0) < 0 ? "text-red-600" : (count.varianceValue || 0) > 0 ? "text-green-600" : ""
              ),
              children: formatCurrency(count.varianceValue || 0)
            }
          ) : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
            count.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => handleStartCount(count.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => handleCancelCount(count.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" })
                }
              )
            ] }),
            count.status === "in_progress" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "default",
                onClick: () => handleOpenCount(count),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mr-1 h-4 w-4" }),
                  "Count"
                ]
              }
            ),
            count.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => handleViewVarianceReport(count.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "default",
                  onClick: () => handleApplyAdjustments(count.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }) })
        ] }, count.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create New Count" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Start a new inventory count session. All active products will be included." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Count Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: createForm.countType,
              onValueChange: (value) => setCreateForm((prev) => ({ ...prev, countType: value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full Inventory Count" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cycle", children: "Cycle Count" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spot", children: "Spot Check" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "annual", children: "Annual Count" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheduled Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: createForm.scheduledDate,
              onChange: (e) => setCreateForm((prev) => ({ ...prev, scheduledDate: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: createForm.notes,
              onChange: (e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value })),
              placeholder: "Any notes about this count..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsCreateDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreateCount, children: "Create Count" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isCountDialogOpen, onOpenChange: setIsCountDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Count: ",
          selectedCount?.countNumber,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: getStatusBadge(selectedCount?.status || "") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the actual counted quantities for each product" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search products...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Progress: ",
            countItems.filter((i) => i.countedQuantity !== null).length,
            "/",
            countItems.length,
            " items"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-primary transition-all",
              style: {
                width: `${countItems.filter((i) => i.countedQuantity !== null).length / countItems.length * 100}%`
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "SKU" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Expected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Counted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Variance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              className: cn(
                item.varianceQuantity !== null && item.varianceQuantity !== 0 ? item.varianceQuantity < 0 ? "bg-red-50" : "bg-green-50" : ""
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: item.product?.name || `Product #${item.productId}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: item.product?.sku || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.expectedQuantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    className: "w-20 text-center",
                    value: item.countedQuantity ?? "",
                    onChange: (e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleRecordCount(item.id, value);
                    },
                    placeholder: "-"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.varianceQuantity !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: cn(
                      "font-medium",
                      item.varianceQuantity < 0 ? "text-red-600" : item.varianceQuantity > 0 ? "text-green-600" : ""
                    ),
                    children: [
                      item.varianceQuantity > 0 ? "+" : "",
                      item.varianceQuantity
                    ]
                  }
                ) : "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: item.varianceValue !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      item.varianceValue < 0 ? "text-red-600" : item.varianceValue > 0 ? "text-green-600" : ""
                    ),
                    children: formatCurrency(item.varianceValue)
                  }
                ) : "-" })
              ]
            },
            item.id
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsCountDialogOpen(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleCompleteCount,
            disabled: countItems.some((i) => i.countedQuantity === null),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "mr-2 h-4 w-4" }),
              "Complete Count"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isVarianceDialogOpen, onOpenChange: setIsVarianceDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Variance Report: ",
          varianceReport?.summary.countNumber
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Completed: ",
          varianceReport?.summary.completedAt ? formatDateTime(varianceReport.summary.completedAt) : "-"
        ] })
      ] }),
      varianceReport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Expected Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: formatCurrency(varianceReport.summary.totalExpectedValue) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Counted Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: formatCurrency(varianceReport.summary.totalCountedValue) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Total Variance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "text-xl font-bold",
                  varianceReport.summary.totalVarianceValue < 0 ? "text-red-600" : varianceReport.summary.totalVarianceValue > 0 ? "text-green-600" : ""
                ),
                children: formatCurrency(varianceReport.summary.totalVarianceValue)
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Items with Variance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: varianceReport.summary.itemsWithVariance })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-200 bg-green-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-green-600 text-sm font-medium", children: "Positive Variance (Surplus)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-green-700", children: [
              varianceReport.summary.positiveVarianceCount,
              " items |",
              " ",
              formatCurrency(varianceReport.summary.positiveVarianceValue)
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm font-medium", children: "Negative Variance (Shortage)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-red-700", children: [
              varianceReport.summary.negativeVarianceCount,
              " items |",
              " ",
              formatCurrency(varianceReport.summary.negativeVarianceValue)
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Items with Variance" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[250px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "SKU" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Expected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Counted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Variance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Adjusted" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: varianceReport.items.filter((i) => i.varianceQuantity !== 0).map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: item.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: item.sku }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.expectedQuantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.countedQuantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: cn(
                    "font-medium",
                    item.varianceQuantity < 0 ? "text-red-600" : "text-green-600"
                  ),
                  children: [
                    item.varianceQuantity > 0 ? "+" : "",
                    item.varianceQuantity
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    item.varianceValue < 0 ? "text-red-600" : "text-green-600"
                  ),
                  children: formatCurrency(item.varianceValue)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: item.adjustmentCreated ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-600 mx-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-muted-foreground mx-auto" }) })
            ] }, idx)) })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsVarianceDialogOpen(false), children: "Close" }) })
    ] }) })
  ] });
}
const ITEMS_PER_PAGE = 10;
const initialFormData = {
  branchId: "",
  productId: "",
  stockType: "Retail",
  unit: "pcs",
  availability: "0",
  minStockAlert: "5",
  costPricePerBatch: "",
  fundingSource: "owner_capital"
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
  const productMap = reactExports.useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );
  const branchMap = reactExports.useMemo(
    () => new Map(branches.map((b) => [b.id, b])),
    [branches]
  );
  const getProductName = reactExports.useCallback(
    (productId) => productMap.get(productId)?.name ?? "Unknown Product",
    [productMap]
  );
  const getProductCode = reactExports.useCallback(
    (productId) => productMap.get(productId)?.code ?? "N/A",
    [productMap]
  );
  const getBranchName = reactExports.useCallback(
    (branchId) => branchMap.get(branchId)?.name ?? "Unknown Branch",
    [branchMap]
  );
  const getProduct = reactExports.useCallback(
    (productId) => productMap.get(productId),
    [productMap]
  );
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
  const filteredInventory = reactExports.useMemo(() => {
    const search = searchTerm.toLowerCase();
    if (!search) return inventory;
    return inventory.filter((item) => {
      return getProductName(item.productId).toLowerCase().includes(search) || getProductCode(item.productId).toLowerCase().includes(search) || getBranchName(item.branchId).toLowerCase().includes(search);
    });
  }, [inventory, searchTerm, getProductName, getProductCode, getBranchName]);
  const summaryRows = reactExports.useMemo(() => {
    const aggregateMap = /* @__PURE__ */ new Map();
    filteredInventory.forEach((item) => {
      const product = getProduct(item.productId);
      const existing = aggregateMap.get(item.productId);
      if (existing) {
        existing.totalAvailability += item.quantity;
        existing.totalMinAlert += item.minQuantity;
        existing.branchesCount += 1;
      } else {
        aggregateMap.set(item.productId, {
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
    return Array.from(aggregateMap.values()).sort((a, b) => {
      const aIsLow = a.totalAvailability <= a.totalMinAlert;
      const bIsLow = b.totalAvailability <= b.totalMinAlert;
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      return a.productName.localeCompare(b.productName);
    });
  }, [filteredInventory, getProduct]);
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
  const totalUnits = summaryRows.reduce((sum, row) => sum + row.totalAvailability, 0);
  const totalStockValue = summaryRows.reduce((sum, row) => sum + row.totalAvailability * row.costPrice, 0);
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
          reason: "Initial stock entry",
          fundingSource: formData.fundingSource
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight", children: "Inventory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: "Stock levels across all branches" })
        ] }),
        summaryRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-2.5 w-2.5" }),
            summaryRows.length,
            " products"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-2.5 w-2.5" }),
            totalUnits.toLocaleString(),
            " units"
          ] }),
          lowStockCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
            lowStockCount,
            " low stock"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-2.5 w-2.5" }),
            formatCurrency(totalStockValue)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "h-8", onClick: () => fetchInventory(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Refresh inventory" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: handleOpenAddDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Add Stock"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search product, code, branch...",
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
            "aria-label": "Clear search",
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedBranchFilter,
          onValueChange: (value) => {
            setSelectedBranchFilter(value);
            setCurrentPage(1);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-44 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-1.5 h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Branches" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
              branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-md border bg-muted/30 p-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: activeView === "summary" ? "secondary" : "ghost",
              size: "sm",
              className: "h-7 px-2.5 text-xs",
              onClick: () => {
                setActiveView("summary");
                setCurrentPage(1);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "mr-1 h-3.5 w-3.5" }),
                "Summary"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Product-level summary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: activeView === "transactions" ? "secondary" : "ghost",
              size: "sm",
              className: "h-7 px-2.5 text-xs",
              onClick: () => {
                setActiveView("transactions");
                setCurrentPage(1);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "mr-1 h-3.5 w-3.5" }),
                "Details"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Per-branch stock detail" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: activeView === "cycle-counts" ? "secondary" : "ghost",
              size: "sm",
              className: "h-7 px-2.5 text-xs",
              onClick: () => {
                setActiveView("cycle-counts");
                setCurrentPage(1);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mr-1 h-3.5 w-3.5" }),
                "Cycle Counts"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Physical count sessions" })
        ] })
      ] })
    ] }),
    activeView === "cycle-counts" && /* @__PURE__ */ jsxRuntimeExports.jsx(CycleCountManager, {}),
    activeView === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Min Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Cost Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Sell Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Stock Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Branches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 w-[60px]" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedSummary.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "h-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-8 w-8 opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No inventory records found" }),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSearchTerm(""),
            className: "text-xs text-primary hover:underline",
            children: "Clear search"
          }
        )
      ] }) }) }) : paginatedSummary.map((row) => {
        const status = getStockStatus(row.totalAvailability, row.totalMinAlert);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9 py-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-medium text-sm max-w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
            status === "low" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-destructive flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: row.productName }),
            row.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: "text-[9px] px-1 py-0 h-4 font-normal flex-shrink-0",
                children: "S/N"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: row.productCode }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "text-sm font-semibold tabular-nums",
                status === "low" && "text-destructive",
                status === "good" && "text-success",
                status === "normal" && "text-warning"
              ),
              children: row.totalAvailability.toLocaleString()
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm text-muted-foreground tabular-nums", children: row.totalMinAlert }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(row.costPrice) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(row.sellingPrice) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium tabular-nums", children: formatCurrency(row.totalAvailability * row.costPrice) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
            row.branchesCount
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right w-[60px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: () => {
                  const item = filteredInventory.find(
                    (i) => i.productId === row.productId
                  );
                  if (item) handleOpenViewDialog(item);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "View details" })
          ] }) }) })
        ] }, row.productId);
      }) })
    ] }) }),
    activeView === "transactions" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Min Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Cost Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Sell Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right", children: "Cost Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 w-[80px]" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedInventory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "h-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-8 w-8 opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No inventory records found" }),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSearchTerm(""),
            className: "text-xs text-primary hover:underline",
            children: "Clear search"
          }
        )
      ] }) }) }) : paginatedInventory.map((item) => {
        const status = getStockStatus(item.quantity, item.minQuantity);
        const product = getProduct(item.productId);
        const costValue = item.quantity * (product?.costPrice || 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9 py-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 max-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
            status === "low" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-destructive flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm truncate leading-none", children: getProductName(item.productId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground leading-none mt-0.5", children: getProductCode(item.productId) })
            ] }),
            product?.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: "text-[9px] px-1 py-0 h-4 font-normal flex-shrink-0",
                children: "S/N"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-muted-foreground", children: getBranchName(item.branchId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "text-sm font-semibold tabular-nums",
                status === "low" && "text-destructive",
                status === "good" && "text-success",
                status === "normal" && "text-warning"
              ),
              children: item.quantity.toLocaleString()
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm text-muted-foreground tabular-nums", children: item.minQuantity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(product?.costPrice || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm tabular-nums", children: formatCurrency(product?.sellingPrice || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium tabular-nums", children: formatCurrency(costValue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getStockStatusBadge(status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right w-[80px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: () => handleOpenViewDialog(item),
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
                  className: "h-7 w-7",
                  onClick: () => handleOpenEditDialog(item),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit stock" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: () => handleDelete(item),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Remove record" })
            ] })
          ] }) })
        ] }, item.id);
      }) })
    ] }) }),
    totalPages > 1 && activeView !== "cycle-counts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 shrink-0 py-1", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
        "Page ",
        currentPage,
        " of ",
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
        ] }),
        !editingInventory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fundingSource", children: "Funding Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "fundingSource",
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              value: formData.fundingSource,
              onChange: (e) => setFormData({ ...formData, fundingSource: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "owner_capital", children: "Owner Capital" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "accounts_payable", children: "Supplier Credit (Payable)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "surplus", children: "Surplus Found (Count Adjustment)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Determines how this stock addition is recorded in accounting" })
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
  ] }) });
}
export {
  InventoryScreen
};
