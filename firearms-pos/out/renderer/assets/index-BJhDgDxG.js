import { V as useCurrency, r as reactExports, j as jsxRuntimeExports, B as Button, aj as Plus, C as Card, e as CardContent, I as Input, Y as Tabs, Z as TabsList, _ as TabsTrigger, am as Ticket, s as Copy, ak as Trash2, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, L as Label, al as DialogFooter, aa as Badge } from "./index-6gzCF98u.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DDzcUmC-.js";
import { S as Search } from "./search-CGtBq7b_.js";
import { R as RefreshCw } from "./refresh-cw-BQjolnay.js";
import { C as Calendar } from "./calendar-D7_AxESk.js";
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
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };
  const getStatusBadge = (voucher) => {
    if (voucher.isUsed) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Used" });
    }
    if (!voucher.isActive) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Inactive" });
    }
    if (voucher.expiresAt && new Date(voucher.expiresAt) < /* @__PURE__ */ new Date()) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Expired" });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Active" });
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Vouchers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Create and manage discount vouchers" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenCreateDialog, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Create Voucher"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by code or description...",
            className: "pl-10",
            value: searchQuery,
            onChange: (e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }
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
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "active", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "used", children: "Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "expired", children: "Expired" })
          ] })
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "h-24 text-center", children: "Loading..." }) }) : vouchers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "h-24 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-8 w-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No vouchers found" })
        ] }) }) }) : vouchers.map((voucher) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-2 py-1 text-sm font-mono font-semibold", children: voucher.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-6 w-6",
                onClick: () => copyCode(voucher.code),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: voucher.description || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium", children: formatCurrency(voucher.discountAmount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getStatusBadge(voucher) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(voucher.expiresAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(voucher.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: !voucher.isUsed && voucher.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => handleDelete(voucher.id),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          ) })
        ] }, voucher.id)) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Showing ",
          (page - 1) * 20 + 1,
          "-",
          Math.min(page * 20, total),
          " of ",
          total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: page <= 1,
              onClick: () => setPage((p) => p - 1),
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: page >= totalPages,
              onClick: () => setPage((p) => p + 1),
              children: "Next"
            }
          )
        ] })
      ] })
    ] }) }),
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
  ] });
}
export {
  VouchersScreen
};
