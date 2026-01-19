import { af as useParams, u as useNavigate, ad as useTabs, d as useBranch, a as useAuth, r as reactExports, K as debounce, j as jsxRuntimeExports, q as Badge, B as Button, U as User, X, I as Input, o as ScrollArea, t as Trash2, v as Separator, Z as formatCurrency, x as Clock, y as Dialog, z as DialogContent, A as DialogHeader, F as DialogTitle, G as DialogDescription, L as Label, H as DialogFooter, P as Package, s as CircleAlert, p as Plus } from "./index-CL7GsgcC.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-Cgrd3ki_.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DfJfVccZ.js";
import { A as ArrowLeft } from "./arrow-left-C4ZfsrJ_.js";
import { P as Pause, S as ShoppingBag } from "./shopping-bag-DpJtsh0X.js";
import { S as Search } from "./search-BJT32TYH.js";
import { M as Minus } from "./minus-MzOx_w3c.js";
function TabDetailScreen() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, updateTabItem, removeFromTab, clearTabItems } = useTabs();
  const { currentBranch, branches } = useBranch();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [products, setProducts] = reactExports.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = reactExports.useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = reactExports.useState(false);
  const [customerSearch, setCustomerSearch] = reactExports.useState("");
  const [customers, setCustomers] = reactExports.useState([]);
  const [showClearConfirm, setShowClearConfirm] = reactExports.useState(false);
  const [showSerialDialog, setShowSerialDialog] = reactExports.useState(false);
  const [pendingSerialProduct, setPendingSerialProduct] = reactExports.useState(null);
  const [serialNumber, setSerialNumber] = reactExports.useState("");
  const [discount, setDiscount] = reactExports.useState(0);
  const [notes, setNotes] = reactExports.useState("");
  const tab = activeTab;
  const tabItems = tab?.items ?? [];
  const refreshTab = reactExports.useCallback(async () => {
    if (tabId) {
      const result = await window.api.salesTabs.getById(Number(tabId));
      if (result.success && result.data) {
        setActiveTab(result.data);
        setDiscount(result.data.discount ?? 0);
        setNotes(result.data.notes ?? "");
      }
    }
  }, [tabId, setActiveTab]);
  reactExports.useEffect(() => {
    if (tabId) {
      const loadTab = async () => {
        const result = await window.api.salesTabs.getById(Number(tabId));
        if (result.success && result.data) {
          setActiveTab(result.data);
          setDiscount(result.data.discount ?? 0);
          setNotes(result.data.notes ?? "");
        }
      };
      loadTab();
    }
  }, [tabId, setActiveTab]);
  const searchProducts = reactExports.useCallback(
    debounce(async (query) => {
      if (!query.trim() || !currentBranch) {
        setProducts([]);
        return;
      }
      setIsLoadingProducts(true);
      try {
        const result = await window.api.salesTabs.getAvailableProducts({
          branchId: currentBranch.id,
          searchQuery: query
        });
        if (result.success && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Product search failed:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    }, 300),
    [currentBranch]
  );
  reactExports.useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);
  const searchCustomers = reactExports.useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setCustomers([]);
        return;
      }
      try {
        const result = await window.api.customers.search(query);
        if (result.success && result.data) {
          setCustomers(result.data);
        }
      } catch (error) {
        console.error("Customer search failed:", error);
      }
    }, 300),
    []
  );
  reactExports.useEffect(() => {
    searchCustomers(customerSearch);
  }, [customerSearch, searchCustomers]);
  const addToTab = async (product, quantity = 1) => {
    if (!tab || product.quantity < 1) return;
    if (product.product.isSerialTracked) {
      setPendingSerialProduct(product);
      setShowSerialDialog(true);
      return;
    }
    const existingItem = tabItems.find(
      (i) => i.productId === product.product.id && !i.serialNumber
    );
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    const result = await window.api.salesTabs.addItem(tab.id, {
      productId: product.product.id,
      quantity: newQuantity
    });
    if (result.success) {
      await refreshTab();
      setSearchQuery("");
      setProducts([]);
    }
  };
  const addSerialTrackedItem = async () => {
    if (!tab || !pendingSerialProduct || !serialNumber.trim()) return;
    const result = await window.api.salesTabs.addItem(tab.id, {
      productId: pendingSerialProduct.product.id,
      quantity: 1,
      serialNumber: serialNumber.trim()
    });
    if (result.success) {
      await refreshTab();
      setShowSerialDialog(false);
      setPendingSerialProduct(null);
      setSerialNumber("");
      setSearchQuery("");
      setProducts([]);
    }
  };
  const updateQuantity = async (item, delta) => {
    if (!tab) return;
    if (item.serialNumber) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    const product = products.find((p) => p.product.id === item.productId);
    if (product && newQuantity > product.quantity) {
      return;
    }
    await updateTabItem(tab.id, item.id, newQuantity);
  };
  const handleRemoveItem = async (item) => {
    if (!tab) return;
    await removeFromTab(tab.id, item.id);
    await refreshTab();
  };
  const handleClearItems = async () => {
    if (tab) {
      await clearTabItems(tab.id);
      await refreshTab();
      setShowClearConfirm(false);
    }
  };
  const updateCustomer = async (customerId) => {
    if (tab) {
      await window.api.salesTabs.update(tab.id, { customerId });
      await refreshTab();
      setShowCustomerDialog(false);
    }
  };
  const updateNotes = async () => {
    if (tab) {
      await window.api.salesTabs.update(tab.id, { notes });
      await refreshTab();
    }
  };
  const handleHold = async () => {
    if (tab && tab.status === "open") {
      await window.api.salesTabs.update(tab.id, { status: "on_hold" });
      await refreshTab();
    }
  };
  const handleBack = () => {
    setActiveTab(null);
    navigate("/pos-tabs");
  };
  const subtotal = reactExports.useMemo(() => tab?.subtotal ?? 0, [tab]);
  const tax = reactExports.useMemo(() => tab?.tax ?? 0, [tab]);
  const finalAmount = reactExports.useMemo(
    () => Math.max(0, subtotal + tax - discount),
    [subtotal, tax, discount]
  );
  const statusBadge = reactExports.useMemo(() => {
    if (!tab) return null;
    const config = {
      open: { label: "Open", color: "bg-green-100 text-green-700" },
      on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
      closed: { label: "Closed", color: "bg-gray-100 text-gray-700" }
    };
    const statusConfig = config[tab.status];
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: statusConfig.color, children: statusConfig.label });
  }, [tab]);
  if (!tab) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[calc(100vh-8rem)] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: handleBack, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: tab.tabNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              statusBadge,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: formatTimeAgo(tab.createdAt) })
            ] })
          ] })
        ] }),
        tab.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleHold, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "mr-2 h-4 w-4" }),
          "Hold"
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Customer" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: tab.customer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                tab.customer.firstName,
                " ",
                tab.customer.lastName
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => updateCustomer(tab.customerId ?? 0),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "w-full",
              onClick: () => setShowCustomerDialog(true),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-2 h-4 w-4" }),
                "Select Customer"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Notes" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              onBlur: updateNotes,
              placeholder: "Add notes...",
              disabled: tab.status !== "open"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Add Products" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "h-full flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search products by name, code, or barcode...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9",
                disabled: tab.status !== "open"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: isLoadingProducts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : products.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: products.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProductCard,
            {
              product: item,
              onAdd: () => addToTab(item),
              disabled: tab.status !== "open" || item.quantity < 1
            },
            item.product.id
          )) }) : searchQuery ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-muted-foreground", children: "No products found" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-muted-foreground", children: "Search for products to add to tab" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3 flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
            "Tab Items (",
            tabItems.length,
            ")"
          ] }),
          tabItems.length > 0 && tab.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => setShowClearConfirm(true),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-64", children: tabItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "mr-2 h-5 w-5" }),
          "No items in tab"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: tabItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabItemCard,
          {
            item,
            onQuantityChange: (delta) => updateQuantity(item, delta),
            onRemove: () => handleRemoveItem(item),
            disabled: tab.status !== "open"
          },
          item.id
        )) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Order Summary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 rounded-lg bg-muted p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Branch:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 font-medium", children: tab.branch?.name ?? "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Created:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 font-medium", children: new Date(tab.createdAt).toLocaleDateString() })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: tab.itemCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(tax) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: discount,
                onChange: (e) => setDiscount(Number(e.target.value)),
                className: "h-7 w-24 text-right",
                disabled: tab.status !== "open"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(finalAmount) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" }),
        tab.status === "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 rounded-lg bg-muted p-4 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This tab has been closed" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "lg",
            className: "w-full",
            disabled: tabItems.length === 0 || tab.status !== "open",
            onClick: () => navigate(`/pos-tabs/${tab.id}/checkout`),
            children: "Proceed to Checkout"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full mt-2", onClick: handleBack, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
          "Back to Tabs"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCustomerDialog, onOpenChange: setShowCustomerDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Select Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Search for an existing customer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, phone, or email...",
            value: customerSearch,
            onChange: (e) => setCustomerSearch(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-60", children: customers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: customers.map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => updateCustomer(customer.id),
            className: "w-full rounded-lg border p-3 text-left hover:bg-accent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                customer.firstName,
                " ",
                customer.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                customer.phone,
                " ",
                customer.email && `| ${customer.email}`
              ] }),
              customer.firearmLicenseNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mt-1 text-xs", children: [
                "License: ",
                customer.firearmLicenseNumber
              ] })
            ]
          },
          customer.id
        )) }) : customerSearch ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "No customers found" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "Start typing to search" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showSerialDialog, onOpenChange: setShowSerialDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enter Serial Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "This product requires a serial number: ",
          pendingSerialProduct?.product.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "serial", children: "Serial Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "serial",
            value: serialNumber,
            onChange: (e) => setSerialNumber(e.target.value),
            placeholder: "Enter serial number"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowSerialDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addSerialTrackedItem, disabled: !serialNumber.trim(), children: "Add to Tab" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showClearConfirm, onOpenChange: setShowClearConfirm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Clear All Items?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "Are you sure you want to remove all items from ",
          tab.tabNumber,
          "? This action cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            onClick: handleClearItems,
            className: "bg-destructive text-destructive-foreground",
            children: "Clear Items"
          }
        )
      ] })
    ] }) })
  ] });
}
function ProductCard({ product, onAdd, disabled }) {
  const { product: p, quantity } = product;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: onAdd,
      disabled,
      className: "flex flex-col rounded-lg border p-3 text-left transition-all hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: p.code })
          ] }),
          p.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs shrink-0", children: "Serial" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Stock: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: quantity })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: formatCurrency(p.sellingPrice) })
        ] }),
        quantity < 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3" }),
          "Out of stock"
        ] })
      ]
    }
  );
}
function TabItemCard({ item, onQuantityChange, onRemove, disabled }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: item.productName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(item.sellingPrice) }),
        item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
          "SN: ",
          item.serialNumber
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      !item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => onQuantityChange(-1),
            disabled: disabled || item.quantity <= 1,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center text-sm", children: item.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => onQuantityChange(1),
            disabled,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" })
          }
        )
      ] }),
      item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center text-sm", children: "1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-7 w-7 text-destructive hover:text-destructive",
          onClick: onRemove,
          disabled,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
        }
      )
    ] })
  ] });
}
function formatTimeAgo(dateString) {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1e3);
  const intervals = [
    { label: "y", seconds: 31536e3 },
    { label: "mo", seconds: 2592e3 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }
  return "Just now";
}
export {
  TabDetailScreen
};
