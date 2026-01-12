import { A as createLucideIcon, u as useNavigate, a as useAuth, d as useBranch, a7 as useTabs, r as reactExports, j as jsxRuntimeExports, B as Button, n as Plus, F as Select, G as SelectTrigger, H as SelectValue, J as SelectContent, K as SelectItem, C as CircleAlert, o as Badge, a8 as formatTimeAgo, U as User, g as formatCurrency, p as Trash2, t as Clock } from "./index-CoWz6Mq1.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-DCkQpI_s.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DQ2w5Pip.js";
import { R as RefreshCw } from "./refresh-cw-CMNco9n-.js";
import { F as Filter } from "./filter-CcRWYIs6.js";
import { S as ShoppingBag, P as Pause } from "./shopping-bag-DJ0hFzue.js";
import { P as Play } from "./play-BKHY85kG.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowRight = createLucideIcon("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);
const statusConfig = {
  open: { label: "Open", color: "bg-green-100 text-green-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3 w-3" }) },
  on_hold: {
    label: "On Hold",
    color: "bg-yellow-100 text-yellow-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3 w-3" })
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" })
  }
};
function PosTabsScreen() {
  useNavigate();
  const { user } = useAuth();
  const { currentBranch, branches } = useBranch();
  const {
    tabs,
    isLoading,
    fetchTabs,
    deleteTab,
    setActiveTab
  } = useTabs();
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [selectedBranch, setSelectedBranch] = reactExports.useState(currentBranch?.id);
  const [selectedStatus, setSelectedStatus] = reactExports.useState("all");
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState({
    tab: null,
    open: false
  });
  reactExports.useEffect(() => {
    if (currentBranch?.id) {
      setSelectedBranch(currentBranch.id);
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    const filters = {};
    if (selectedBranch) filters.branchId = selectedBranch;
    if (selectedStatus !== "all") filters.status = selectedStatus;
    fetchTabs(filters);
  }, [selectedBranch, selectedStatus, fetchTabs]);
  const handleCreateTab = async () => {
    if (!selectedBranch) return;
    const newTab = await window.api.salesTabs.create({
      branchId: selectedBranch
    });
    if (newTab?.data) {
      setShowCreateDialog(false);
      const result = await window.api.salesTabs.getById(newTab.data.id);
      if (result.success && result.data) {
        setActiveTab(result.data);
      }
    }
  };
  const handleViewTab = async (tab) => {
    const result = await window.api.salesTabs.getById(tab.id);
    if (result.success && result.data) {
      setActiveTab(result.data);
    }
  };
  const handleToggleHold = async (tab) => {
    const newStatus = tab.status === "open" ? "on_hold" : "open";
    await window.api.salesTabs.update(tab.id, { status: newStatus });
    fetchTabs({
      branchId: selectedBranch,
      status: selectedStatus === "all" ? void 0 : selectedStatus
    });
  };
  const handleDeleteTab = async () => {
    if (deleteConfirm.tab) {
      const success = await deleteTab(deleteConfirm.tab.id);
      if (success) {
        setDeleteConfirm({ tab: null, open: false });
      }
    }
  };
  const openTabs = tabs.filter((t) => t.status === "open");
  const onHoldTabs = tabs.filter((t) => t.status === "on_hold");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "POS Tabs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage open sales tabs and hold transactions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            onClick: () => {
              const filters = {};
              if (selectedBranch) filters.branchId = selectedBranch;
              if (selectedStatus !== "all") filters.status = selectedStatus;
              fetchTabs(filters);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowCreateDialog(true), disabled: !selectedBranch, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Open New Tab"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Filters:" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 sm:flex-1", children: [
        branches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBranch?.toString(), onValueChange: (v) => setSelectedBranch(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Branches" }),
              branches.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id.toString(), children: b.name }, b.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: selectedStatus,
              onValueChange: (v) => setSelectedStatus(v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All statuses" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "on_hold", children: "On Hold" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "closed", children: "Closed" })
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }) }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : selectedStatus === "all" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      openTabs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-xl font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-5 w-5 text-green-600" }),
          "Open Tabs (",
          openTabs.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: openTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabCard,
          {
            tab,
            onView: () => handleViewTab(tab),
            onToggleHold: () => handleToggleHold(tab),
            onDelete: () => setDeleteConfirm({ tab, open: true })
          },
          tab.id
        )) })
      ] }),
      onHoldTabs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-xl font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5 text-yellow-600" }),
          "On Hold Tabs (",
          onHoldTabs.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: onHoldTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabCard,
          {
            tab,
            onView: () => handleViewTab(tab),
            onToggleHold: () => handleToggleHold(tab),
            onDelete: () => setDeleteConfirm({ tab, open: true })
          },
          tab.id
        )) })
      ] }),
      openTabs.length === 0 && onHoldTabs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "mx-auto mb-4 h-16 w-16 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "No tabs yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-muted-foreground", children: "Get started by creating a new sales tab for your branch." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowCreateDialog(true), disabled: !selectedBranch, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Create First Tab"
        ] })
      ] }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TabCard,
        {
          tab,
          onView: () => handleViewTab(tab),
          onToggleHold: () => handleToggleHold(tab),
          onDelete: () => setDeleteConfirm({ tab, open: true })
        },
        tab.id
      )),
      tabs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "col-span-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "mx-auto mb-4 h-16 w-16 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "No tabs found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Try adjusting your filters or create a new tab." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Open New Sales Tab" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Create a new tab for holding items before checkout." })
      ] }),
      !currentBranch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Please select a branch first." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleCreateTab, disabled: !selectedBranch, children: "Create Tab" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deleteConfirm.open, onOpenChange: (open) => setDeleteConfirm((prev) => ({ ...prev, open })), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Tab?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "Are you sure you want to delete tab ",
          deleteConfirm.tab?.tabNumber,
          "? This action cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteTab, className: "bg-destructive text-destructive-foreground", children: "Delete Tab" })
      ] })
    ] }) })
  ] });
}
function TabCard({ tab, onView, onToggleHold, onDelete }) {
  const status = statusConfig[tab.status];
  const navigate = useNavigate();
  const handleCheckout = () => {
    navigate(`/pos-tabs/${tab.id}`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col hover:shadow-lg transition-shadow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: tab.tabNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: status.color, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: status.icon }),
          status.label
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatTimeAgo(tab.createdAt) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      tab.customer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          tab.customer.firstName,
          " ",
          tab.customer.lastName
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Guest" })
      ] }),
      tab.branch && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: tab.branch.name }),
      tab.user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Created by ",
        tab.user.fullName || tab.user.username
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            tab.itemCount,
            " ",
            tab.itemCount === 1 ? "item" : "items"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: formatCurrency(tab.finalAmount) })
      ] }),
      tab.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted p-2 text-xs italic text-muted-foreground", children: tab.notes }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        tab.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: onView, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mr-1 h-3.5 w-3.5" }),
            "View"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "flex-1",
              onClick: onToggleHold,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "mr-1 h-3.5 w-3.5" }),
                "Hold"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: handleCheckout, children: "Checkout" })
        ] }),
        tab.status === "on_hold" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: onView, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mr-1 h-3.5 w-3.5" }),
            "View"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "flex-1",
              onClick: onToggleHold,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-1 h-3.5 w-3.5" }),
                "Resume"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "flex-1 text-destructive hover:text-destructive",
              onClick: onDelete,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        tab.status === "closed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "flex-1",
            onClick: onView,
            disabled: true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-3.5 w-3.5" }),
              "Closed"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  PosTabsScreen
};
