import { O as useCurrency, r as reactExports, j as jsxRuntimeExports, B as Button, ag as Plus, I as Input, X, Q as Tabs, V as TabsList, Y as TabsTrigger, p as Copy, ah as Trash2, C as ChevronRight, a4 as Dialog, a5 as DialogContent, a6 as DialogHeader, a7 as DialogTitle, a8 as DialogDescription, L as Label, ai as DialogFooter, a9 as Badge } from "./index-CL8d32zf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-m7X2WjZM.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-DI2L3h3I.js";
import { S as Search } from "./search-jVe_1Vq5.js";
import { C as ChevronLeft } from "./chevron-left-Bz89RkGd.js";
import { R as RefreshCw } from "./refresh-cw-Bir9JcXs.js";
import { C as Calendar } from "./calendar-DdlHkf5M.js";
function VouchersScreen() {
  const { formatCurrency } = useCurrency();
  const [vouchers, setVouchers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [total, setTotal] = reactExports.useState(0);
  const [formCode, setFormCode] = reactExports.useState("");
  const [formDescription, setFormDescription] = reactExports.useState("");
  const [formAmount, setFormAmount] = reactExports.useState("");
  const [formExpiresAt, setFormExpiresAt] = reactExports.useState("");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const fetchVouchers = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.api.vouchers.getAll({
        page,
        limit: 20,
        search: searchQuery,
        filter
      });
      if (result.success && result.data) {
        setVouchers(result.data);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filter]);
  reactExports.useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);
  const handleGenerateCode = async () => {
    try {
      const result = await window.api.vouchers.generateCode();
      if (result.success && result.data) {
        setFormCode(result.data);
      }
    } catch (error) {
      console.error("Failed to generate code:", error);
    }
  };
  const handleOpenCreateDialog = async () => {
    setFormCode("");
    setFormDescription("");
    setFormAmount("");
    setFormExpiresAt("");
    setShowCreateDialog(true);
    await handleGenerateCode();
  };
  const handleCreate = async () => {
    if (!formCode.trim() || !formAmount) return;
    setIsSaving(true);
    try {
      const result = await window.api.vouchers.create({
        code: formCode.trim(),
        description: formDescription.trim() || void 0,
        discountAmount: parseFloat(formAmount),
        expiresAt: formExpiresAt || void 0
      });
      if (result.success) {
        setShowCreateDialog(false);
        fetchVouchers();
      } else {
        alert(result.message || "Failed to create voucher");
      }
    } catch (error) {
      console.error("Failed to create voucher:", error);
      alert("Failed to create voucher");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deactivate this voucher?")) return;
    try {
      const result = await window.api.vouchers.delete(id);
      if (result.success) {
        fetchVouchers();
      } else {
        alert(result.message || "Failed to delete voucher");
      }
    } catch (error) {
      console.error("Failed to delete voucher:", error);
    }
  };
  const copyCode = reactExports.useCallback((code) => {
    navigator.clipboard.writeText(code);
  }, []);
  const getStatusBadge = (voucher) => {
    if (voucher.isUsed) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "Used" });
    }
    if (!voucher.isActive) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-[10px] px-1.5 py-0", children: "Inactive" });
    }
    if (voucher.expiresAt && new Date(voucher.expiresAt) < /* @__PURE__ */ new Date()) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-[10px] px-1.5 py-0", children: "Expired" });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0", children: "Active" });
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Vouchers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
          total,
          " Total"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: handleOpenCreateDialog, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Create Voucher"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by code or description...",
            value: searchQuery,
            onChange: (e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            },
            className: "h-8 pl-8 text-sm"
          }
        ),
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "aria-label": "Clear search",
            onClick: () => {
              setSearchQuery("");
              setPage(1);
            },
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tabs,
        {
          value: filter,
          onValueChange: (v) => {
            setFilter(v);
            setPage(1);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", className: "text-xs h-6 px-2", children: "All" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "active", className: "text-xs h-6 px-2", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "used", className: "text-xs h-6 px-2", children: "Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "expired", className: "text-xs h-6 px-2", children: "Expired" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Expiry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Created" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[80px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "h-24 text-center text-sm text-muted-foreground", children: "Loading..." }) }) : vouchers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "h-24 text-center text-sm text-muted-foreground", children: "No vouchers found" }) }) : vouchers.map((voucher) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold", children: voucher.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: () => copyCode(voucher.code),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Copy Code" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-muted-foreground truncate max-w-[180px]", children: voucher.description || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right text-sm font-medium tabular-nums", children: formatCurrency(voucher.discountAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: getStatusBadge(voucher) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-muted-foreground", children: formatDate(voucher.expiresAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm text-muted-foreground", children: formatDate(voucher.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: !voucher.isUsed && voucher.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7",
              onClick: () => handleDelete(voucher.id),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Deactivate" })
        ] }) }) })
      ] }, voucher.id)) })
    ] }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        (page - 1) * 20 + 1,
        "–",
        Math.min(page * 20, total),
        " of ",
        total
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: page <= 1,
            onClick: () => setPage((p) => p - 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[3rem] text-center", children: [
          page,
          " / ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            disabled: page >= totalPages,
            onClick: () => setPage((p) => p + 1),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create Voucher" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Create a new discount voucher with a unique code." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-code", children: "Voucher Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "voucher-code",
                value: formCode,
                onChange: (e) => setFormCode(e.target.value.toUpperCase()),
                placeholder: "10-digit code",
                maxLength: 10,
                className: "font-mono"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon",
                onClick: handleGenerateCode,
                title: "Regenerate Code",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-desc", children: "Description (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "voucher-desc",
              value: formDescription,
              onChange: (e) => setFormDescription(e.target.value),
              placeholder: "e.g., Eid Sale, Loyalty Reward"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-amount", children: "Discount Amount (Rs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "voucher-amount",
              type: "number",
              step: "0.01",
              min: "1",
              value: formAmount,
              onChange: (e) => setFormAmount(e.target.value),
              placeholder: "Enter discount amount"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-expiry", children: "Expiry Date (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "voucher-expiry",
                type: "date",
                className: "pl-10",
                value: formExpiresAt,
                onChange: (e) => setFormExpiresAt(e.target.value),
                min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowCreateDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleCreate,
            disabled: isSaving || !formCode.trim() || !formAmount || parseFloat(formAmount) <= 0,
            children: isSaving ? "Creating..." : "Create Voucher"
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  VouchersScreen
};
