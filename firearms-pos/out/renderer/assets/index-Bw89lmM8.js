import { b as useBranch, r as reactExports, h as debounce, j as jsxRuntimeExports, I as Input, i as ScrollArea, k as Plus, l as Badge, f as formatCurrency, P as Package, B as Button, U as User, X, C as CircleAlert, T as Trash2, e as Banknote, m as CreditCard, n as Clock, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, L as Label, t as DialogFooter, R as Receipt } from "./index-DDxhww62.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-NHahXwy8.js";
import { S as Separator } from "./separator-ByI8z2rd.js";
import { S as Search } from "./search-CNJBJ8Ib.js";
import { M as Minus } from "./minus-DBUb5x6r.js";
function POSScreen() {
  const { currentBranch } = useBranch();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [allProducts, setAllProducts] = reactExports.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = reactExports.useState(true);
  const [cart, setCart] = reactExports.useState([]);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [customerSearch, setCustomerSearch] = reactExports.useState("");
  const [customers, setCustomers] = reactExports.useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = reactExports.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [showSerialDialog, setShowSerialDialog] = reactExports.useState(false);
  const [pendingSerialProduct, setPendingSerialProduct] = reactExports.useState(null);
  const [serialNumber, setSerialNumber] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [codName, setCodName] = reactExports.useState("");
  const [codPhone, setCodPhone] = reactExports.useState("");
  const [codAddress, setCodAddress] = reactExports.useState("");
  const [codCity, setCodCity] = reactExports.useState("");
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const taxRate = 8.5;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const loadAvailableProducts = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    setIsLoadingProducts(true);
    try {
      const result = await window.api.salesTabs.getAvailableProducts({
        branchId: currentBranch.id,
        limit: 500
      });
      if (result.success && result.data) {
        setAllProducts(result.data);
      }
    } catch (error2) {
      console.error("Failed to load products:", error2);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    loadAvailableProducts();
  }, [loadAvailableProducts]);
  const filteredProducts = searchQuery.trim() ? allProducts.filter(
    (item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.product.code?.toLowerCase().includes(searchQuery.toLowerCase()) || item.product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : allProducts;
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
      } catch (error2) {
        console.error("Customer search failed:", error2);
      }
    }, 300),
    []
  );
  reactExports.useEffect(() => {
    searchCustomers(customerSearch);
  }, [customerSearch, searchCustomers]);
  const addToCart = (product, availableQty) => {
    if (product.isSerialTracked) {
      setPendingSerialProduct(product);
      setShowSerialDialog(true);
      return;
    }
    const existingInCart = cart.find((item) => item.product.id === product.id);
    const currentCartQty = existingInCart?.quantity ?? 0;
    if (currentCartQty >= availableQty) {
      setError(`Only ${availableQty} units available in stock`);
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map(
          (item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setError("");
  };
  const addSerialTrackedItem = () => {
    if (!pendingSerialProduct || !serialNumber.trim()) return;
    setCart((prevCart) => [
      ...prevCart,
      { product: pendingSerialProduct, quantity: 1, serialNumber: serialNumber.trim() }
    ]);
    setShowSerialDialog(false);
    setPendingSerialProduct(null);
    setSerialNumber("");
    setSearchQuery("");
    setProducts([]);
  };
  const updateQuantity = (productId, delta) => {
    setCart(
      (prevCart) => prevCart.map(
        (item) => item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      ).filter((item) => item.quantity > 0)
    );
  };
  const removeFromCart = (productId, serialNumber2) => {
    setCart(
      (prevCart) => prevCart.filter(
        (item) => !(item.product.id === productId && item.serialNumber === serialNumber2)
      )
    );
  };
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setError("");
  };
  const processPayment = async () => {
    if (!currentBranch) return;
    if (cart.length === 0) return;
    const hasFirearms = cart.some((item) => item.product.isSerialTracked);
    if (hasFirearms && !selectedCustomer) {
      setError("Customer selection is required for firearm purchases");
      return;
    }
    if (paymentMethod === "receivable" && !selectedCustomer) {
      setError("Customer selection is required for Pay Later / Receivable");
      return;
    }
    const paidAmount = paymentMethod === "cash" ? parseFloat(amountPaid) || 0 : total;
    const isPartialPayment = paymentMethod === "cash" && paidAmount > 0 && paidAmount < total;
    if (isPartialPayment && !selectedCustomer) {
      setError("Customer selection is required for partial payments. The remaining amount will be added to Account Receivables.");
      return;
    }
    if (paymentMethod === "cod") {
      if (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) {
        setError("All COD fields are required");
        return;
      }
    }
    setIsProcessing(true);
    setError("");
    try {
      let notes = "";
      if (paymentMethod === "cod") {
        notes = `COD Details:
Name: ${codName}
Phone: ${codPhone}
Address: ${codAddress}, ${codCity}`;
      }
      const actualAmountPaid = paymentMethod === "receivable" ? 0 : paymentMethod === "cash" ? parseFloat(amountPaid) || 0 : total;
      const remainingAmount = total - actualAmountPaid;
      let paymentStatus = "paid";
      if (paymentMethod === "receivable") {
        paymentStatus = "pending";
      } else if (actualAmountPaid < total) {
        paymentStatus = actualAmountPaid > 0 ? "partial" : "pending";
      }
      const saleData = {
        customerId: selectedCustomer?.id,
        branchId: currentBranch.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
          serialNumber: item.serialNumber,
          taxRate: item.product.isTaxable ? taxRate : 0
        })),
        paymentMethod,
        paymentStatus,
        amountPaid: actualAmountPaid,
        notes: notes || void 0
      };
      const result = await window.api.sales.create(saleData);
      if (result.success) {
        try {
          const receiptResult = await window.api.receipt.generate(result.data.id);
          if (receiptResult.success) {
            console.log("Receipt generated:", receiptResult.data.filePath);
          } else {
            console.error("Receipt generation failed:", receiptResult.message);
          }
        } catch (receiptError) {
          console.error("Receipt generation error:", receiptError);
        }
        clearCart();
        setShowPaymentDialog(false);
        setAmountPaid("");
        setCodName("");
        setCodPhone("");
        setCodAddress("");
        setCodCity("");
        loadAvailableProducts();
        let message = `Sale completed! Invoice: ${result.data.invoiceNumber}`;
        if (paymentMethod === "receivable") {
          message += `

Full amount (${formatCurrency(total)}) added to customer's receivables.`;
        } else if (paymentStatus === "partial") {
          message += `

Paid: ${formatCurrency(actualAmountPaid)}
Remaining: ${formatCurrency(remainingAmount)} added to customer's receivables.`;
        }
        alert(message);
      } else {
        setError(result.message || "Failed to process sale");
      }
    } catch (error2) {
      console.error("Payment processing error:", error2);
      setError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[calc(100vh-8rem)] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search products by name, code, or barcode...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9 text-lg"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 h-full", children: isLoadingProducts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : filteredProducts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(100vh-20rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filteredProducts.map((item) => {
        const cartItem = cart.find((c) => c.product.id === item.product.id);
        const inCartQty = cartItem?.quantity ?? 0;
        const remainingStock = item.quantity - inCartQty;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => addToCart(item.product, item.quantity),
            disabled: remainingStock <= 0 && !item.product.isSerialTracked,
            className: "relative flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-full group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-12 w-12 text-green-600", strokeWidth: 3 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium break-words whitespace-normal leading-tight text-sm", children: item.product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: item.product.code })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
                  item.product.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Serial" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: remainingStock <= 5 ? "destructive" : "secondary",
                      className: "text-xs whitespace-nowrap",
                      children: [
                        remainingStock,
                        " left"
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2 border-t", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: formatCurrency(item.product.sellingPrice) }),
                inCartQty > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "text-xs", children: [
                  inCartQty,
                  " in cart"
                ] })
              ] })
            ]
          },
          item.product.id
        );
      }) }) }) : searchQuery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          'No products found for "',
          searchQuery,
          '"'
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No products available in inventory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Add products to inventory first" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-96 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Cart" }),
          cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: clearCart, children: "Clear" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: selectedCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-muted p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              selectedCustomer.firstName,
              " ",
              selectedCustomer.lastName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setSelectedCustomer(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-full",
            onClick: () => setShowCustomerDialog(true),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-2 h-4 w-4" }),
              "Select Customer"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-1 flex-col overflow-hidden p-4 pt-0", children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 -mx-4 px-4", children: cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: "Cart is empty" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: cart.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 rounded-lg border p-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: item.product.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  formatCurrency(item.product.sellingPrice),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs", children: [
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
                      onClick: () => updateQuantity(item.product.id, -1),
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
                      onClick: () => updateQuantity(item.product.id, 1),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 text-destructive",
                    onClick: () => removeFromCart(item.product.id, item.serialNumber),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] })
            ]
          },
          `${item.product.id}-${item.serialNumber || index}`
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Tax (",
              taxRate,
              "%)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(taxAmount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(total) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "lg",
                variant: "outline",
                disabled: cart.length === 0,
                onClick: () => {
                  setPaymentMethod("cash");
                  setShowPaymentDialog(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "mr-2 h-4 w-4" }),
                  "Cash"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "lg",
                variant: "outline",
                disabled: cart.length === 0,
                onClick: () => {
                  setPaymentMethod("card");
                  setAmountPaid(total.toString());
                  setShowPaymentDialog(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
                  "Card"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "lg",
                variant: "outline",
                disabled: cart.length === 0,
                onClick: () => {
                  setPaymentMethod("cod");
                  setAmountPaid(total.toString());
                  setShowPaymentDialog(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mr-2 h-4 w-4" }),
                  "COD"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "lg",
                variant: "outline",
                disabled: cart.length === 0,
                onClick: () => {
                  setPaymentMethod("receivable");
                  setAmountPaid("0");
                  setShowPaymentDialog(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-2 h-4 w-4" }),
                  "Pay Later"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCustomerDialog, onOpenChange: setShowCustomerDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Select Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Search for an existing customer or continue without one" })
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
            onClick: () => {
              setSelectedCustomer(customer);
              setShowCustomerDialog(false);
              setCustomerSearch("");
              setCustomers([]);
            },
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
          pendingSerialProduct?.name
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addSerialTrackedItem, disabled: !serialNumber.trim(), children: "Add to Cart" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Complete Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Total: ",
          formatCurrency(total),
          " | Method: ",
          paymentMethod === "receivable" ? "Pay Later" : paymentMethod.toUpperCase()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        paymentMethod === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount Received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "amount",
              type: "number",
              step: "0.01",
              value: amountPaid,
              onChange: (e) => setAmountPaid(e.target.value),
              placeholder: "Enter amount"
            }
          ),
          parseFloat(amountPaid) > 0 && parseFloat(amountPaid) >= total && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-green-600", children: [
            "Change: ",
            formatCurrency(parseFloat(amountPaid) - total)
          ] }),
          parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-800", children: "Partial Payment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-700", children: [
                "Remaining: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatCurrency(total - parseFloat(amountPaid)) }),
                " will be added to Account Receivables."
              ] }),
              !selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-red-600 font-medium", children: "Please select a customer for partial payment!" })
            ] })
          ] }) })
        ] }),
        paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "Process card payment on terminal" }),
        paymentMethod === "cod" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter delivery details for COD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cod-name", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-name",
                value: codName,
                onChange: (e) => setCodName(e.target.value),
                placeholder: "Customer name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cod-phone", children: "Phone *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-phone",
                value: codPhone,
                onChange: (e) => setCodPhone(e.target.value),
                placeholder: "Phone number"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cod-address", children: "Address *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-address",
                value: codAddress,
                onChange: (e) => setCodAddress(e.target.value),
                placeholder: "Delivery address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cod-city", children: "City *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-city",
                value: codCity,
                onChange: (e) => setCodCity(e.target.value),
                placeholder: "City"
              }
            )
          ] })
        ] }),
        paymentMethod === "receivable" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-yellow-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Payment will be recorded as receivable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "The amount will be added to the customer's balance. Full payment is expected later." }),
            !selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-destructive font-medium", children: "Please select a customer first!" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowPaymentDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: processPayment,
            disabled: isProcessing || paymentMethod === "cash" && (parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) < total && !selectedCustomer) || paymentMethod === "receivable" && !selectedCustomer || paymentMethod === "cod" && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()),
            children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }),
              "Processing..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mr-2 h-4 w-4" }),
              "Complete Sale"
            ] })
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  POSScreen
};
