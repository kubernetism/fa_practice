import { d as useBranch, e as useCurrency, n as useCurrentBranchSettings, r as reactExports, j as jsxRuntimeExports, I as Input, o as ScrollArea, p as Plus, q as Badge, P as Package, B as Button, U as User, X, s as CircleAlert, t as Trash2, v as Separator, k as Banknote, w as CreditCard, x as Clock, y as Dialog, z as DialogContent, A as DialogHeader, F as DialogTitle, G as DialogDescription, L as Label, H as DialogFooter, i as Percent, R as Receipt } from "./index-6asCrikz.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-aCbTy8wq.js";
import { C as Checkbox } from "./checkbox-CZVNiTbG.js";
import { S as Search } from "./search-DS7UGivW.js";
import { M as Minus } from "./minus-DLZD-lnl.js";
import { S as Smartphone } from "./smartphone-BGXVLEn1.js";
function POSScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency } = useCurrency();
  const { settings } = useCurrentBranchSettings();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [allProducts, setAllProducts] = reactExports.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = reactExports.useState(true);
  const [cart, setCart] = reactExports.useState([]);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [customerSearch, setCustomerSearch] = reactExports.useState("");
  const [customers, setCustomers] = reactExports.useState([]);
  const [allCustomers, setAllCustomers] = reactExports.useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = reactExports.useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = reactExports.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [showSerialDialog, setShowSerialDialog] = reactExports.useState(false);
  const [pendingSerialProduct, setPendingSerialProduct] = reactExports.useState(null);
  const [serialNumber, setSerialNumber] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [addToReceivable, setAddToReceivable] = reactExports.useState(false);
  const [codName, setCodName] = reactExports.useState("");
  const [codPhone, setCodPhone] = reactExports.useState("");
  const [codAddress, setCodAddress] = reactExports.useState("");
  const [codCity, setCodCity] = reactExports.useState("");
  const [codCharges, setCodCharges] = reactExports.useState("");
  const [discountAmount, setDiscountAmount] = reactExports.useState("");
  const taxRate = settings?.taxRate ?? 0;
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const discount = parseFloat(discountAmount) || 0;
  const codChargesNum = parseFloat(codCharges) || 0;
  const taxableAmount = subtotal - discount;
  const taxAmount = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0;
  const total = taxableAmount + taxAmount + (paymentMethod === "cod" ? codChargesNum : 0);
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
  const loadAllCustomers = reactExports.useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const result = await window.api.customers.getAll({ limit: 1e3, isActive: true });
      if (result.success && result.data) {
        setAllCustomers(result.data);
        setCustomers(result.data);
      }
    } catch (error2) {
      console.error("Failed to load customers:", error2);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers(allCustomers);
      return;
    }
    const query = customerSearch.toLowerCase();
    const filtered = allCustomers.filter(
      (customer) => customer.firstName?.toLowerCase().includes(query) || customer.lastName?.toLowerCase().includes(query) || customer.phone?.toLowerCase().includes(query) || customer.email?.toLowerCase().includes(query) || customer.firearmLicenseNumber?.toLowerCase().includes(query)
    );
    setCustomers(filtered);
  }, [customerSearch, allCustomers]);
  reactExports.useEffect(() => {
    if (showCustomerDialog && allCustomers.length === 0) {
      loadAllCustomers();
    }
  }, [showCustomerDialog, allCustomers.length, loadAllCustomers]);
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
  };
  const updateQuantity = (productId, delta) => {
    const productStock = allProducts.find((p) => p.product.id === productId);
    const availableStock = productStock?.quantity ?? 0;
    setCart(
      (prevCart) => prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          const clampedQty = Math.min(Math.max(0, newQty), availableStock);
          if (delta > 0 && clampedQty === item.quantity) {
            setError(`Only ${availableStock} units available in stock`);
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      }).filter((item) => item.quantity > 0)
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
    if (addToReceivable && !selectedCustomer && paymentMethod !== "cod") {
      setError("Customer selection is required when adding to Account Receivables");
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
      let customerIdToUse = selectedCustomer?.id;
      let newCustomerCreated = false;
      if (paymentMethod === "cod" && addToReceivable && !selectedCustomer) {
        const nameParts = codName.trim().split(" ");
        const firstName = nameParts[0] || codName.trim();
        const lastName = nameParts.slice(1).join(" ") || "";
        const customerResult = await window.api.customers.create({
          firstName,
          lastName,
          phone: codPhone.trim(),
          address: `${codAddress.trim()}, ${codCity.trim()}`,
          isActive: true
        });
        if (customerResult.success && customerResult.data) {
          customerIdToUse = customerResult.data.id;
          newCustomerCreated = true;
          loadAllCustomers();
        } else {
          setError(customerResult.message || "Failed to create customer from COD details");
          setIsProcessing(false);
          return;
        }
      }
      let notes = "";
      if (paymentMethod === "cod") {
        notes = `COD Details:
Name: ${codName}
Phone: ${codPhone}
Address: ${codAddress}, ${codCity}`;
        if (codChargesNum > 0) {
          notes += `
COD Charges: ${codChargesNum}`;
        }
      }
      let actualAmountPaid;
      let paymentStatus = "paid";
      if (paymentMethod === "receivable" || addToReceivable) {
        actualAmountPaid = 0;
        paymentStatus = "pending";
      } else if (paymentMethod === "cash") {
        actualAmountPaid = parseFloat(amountPaid) || 0;
        if (actualAmountPaid < total) {
          paymentStatus = actualAmountPaid > 0 ? "partial" : "pending";
        }
      } else {
        actualAmountPaid = total;
      }
      const remainingAmount = total - actualAmountPaid;
      const saleData = {
        customerId: customerIdToUse,
        branchId: currentBranch.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
          serialNumber: item.serialNumber,
          taxRate: item.product.isTaxable ? taxRate : 0
        })),
        paymentMethod: addToReceivable ? "receivable" : paymentMethod,
        paymentStatus,
        amountPaid: actualAmountPaid,
        discountAmount: discount,
        codCharges: paymentMethod === "cod" ? codChargesNum : 0,
        codName: paymentMethod === "cod" ? codName : void 0,
        codPhone: paymentMethod === "cod" ? codPhone : void 0,
        codAddress: paymentMethod === "cod" ? codAddress : void 0,
        codCity: paymentMethod === "cod" ? codCity : void 0,
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
        setDiscountAmount("");
        setCodName("");
        setCodPhone("");
        setCodAddress("");
        setCodCity("");
        setCodCharges("");
        setAddToReceivable(false);
        loadAvailableProducts();
        let message = `Sale completed! Invoice: ${result.data.invoiceNumber}`;
        if (newCustomerCreated) {
          message += `

New customer "${codName}" created from COD details.`;
        }
        if (paymentMethod === "receivable" || addToReceivable) {
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-96 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
            "Cart (",
            cart.length,
            ")"
          ] }),
          cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: clearCart, children: "Clear" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: selectedCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-muted p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm truncate", children: [
              selectedCustomer.firstName,
              " ",
              selectedCustomer.lastName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "flex-shrink-0", onClick: () => setSelectedCustomer(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-1 flex-col p-4 pt-0 min-h-0", children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-words", children: error })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: "Cart is empty" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pr-2", children: cart.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 rounded-lg border p-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm leading-tight break-words", children: item.product.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  formatCurrency(item.product.sellingPrice),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
                    "SN: ",
                    item.serialNumber
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                !item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "icon",
                      className: "h-6 w-6",
                      onClick: () => updateQuantity(item.product.id, -1),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-xs font-medium", children: item.quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "icon",
                      className: "h-6 w-6",
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
                    className: "h-6 w-6 text-destructive",
                    onClick: () => removeFromCart(item.product.id, item.serialNumber),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] })
            ]
          },
          `${item.product.id}-${item.serialNumber || index}`
        )) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 border-t pt-4 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal) })
          ] }),
          discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "-",
              formatCurrency(discount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              settings?.taxName || "Tax",
              " (",
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "lg",
                variant: "outline",
                disabled: cart.length === 0,
                onClick: () => {
                  setPaymentMethod("cash");
                  setAddToReceivable(false);
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
                  setAddToReceivable(false);
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
                  setPaymentMethod("mobile");
                  setAmountPaid(total.toString());
                  setAddToReceivable(false);
                  setShowPaymentDialog(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "mr-2 h-4 w-4" }),
                  "Mobile"
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
                  setAddToReceivable(false);
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
                  setAddToReceivable(false);
                  setShowPaymentDialog(true);
                },
                className: "col-span-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-2 h-4 w-4" }),
                  "Pay Later (Full Receivable)"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCustomerDialog, onOpenChange: setShowCustomerDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Select Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Search from ",
          allCustomers.length,
          " customers or continue without one"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by name, phone, email, or license...",
              value: customerSearch,
              onChange: (e) => setCustomerSearch(e.target.value),
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-72 border rounded-lg", children: isLoadingCustomers ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : customers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: customers.map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSelectedCustomer(customer);
              setShowCustomerDialog(false);
              setCustomerSearch("");
            },
            className: "w-full rounded-lg border p-3 text-left hover:bg-accent transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                  customer.firstName,
                  " ",
                  customer.lastName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  customer.phone,
                  " ",
                  customer.email && `| ${customer.email}`
                ] })
              ] }),
              customer.firearmLicenseNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs flex-shrink-0", children: [
                "License: ",
                customer.firearmLicenseNumber
              ] })
            ] })
          },
          customer.id
        )) }) : customerSearch ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground", children: [
          'No customers found for "',
          customerSearch,
          '"'
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "No customers available" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
          "Showing ",
          customers.length,
          " of ",
          allCustomers.length,
          " customers"
        ] })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 bg-green-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "discount", className: "font-medium text-green-800", children: "Apply Discount" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "discount",
              type: "number",
              step: "0.01",
              min: "0",
              max: subtotal,
              value: discountAmount,
              onChange: (e) => {
                const value = parseFloat(e.target.value) || 0;
                if (value <= subtotal) {
                  setDiscountAmount(e.target.value);
                }
              },
              placeholder: "Enter discount amount",
              className: "bg-white"
            }
          ),
          discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-700 mt-2", children: [
            "Discount: ",
            formatCurrency(discount),
            " | New Total: ",
            formatCurrency(total)
          ] })
        ] }),
        paymentMethod === "cash" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
        paymentMethod === "card" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "Process card payment on terminal" }),
        paymentMethod === "mobile" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "Process mobile payment (JazzCash, Easypaisa, etc.)" }),
        paymentMethod === "cod" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 bg-blue-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cod-charges", className: "font-medium text-blue-800", children: "COD Charges (Delivery Fee)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-charges",
                type: "number",
                step: "0.01",
                min: "0",
                value: codCharges,
                onChange: (e) => setCodCharges(e.target.value),
                placeholder: "0.00",
                className: "mt-2 bg-white text-lg font-medium"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Added to customer's total. Recorded as expense for courier." }),
            codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-700 mt-2 font-medium", children: [
              "New Total: ",
              formatCurrency(total)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
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
        (paymentMethod === "receivable" || addToReceivable) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-yellow-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Payment will be recorded as receivable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
              "The full amount (",
              formatCurrency(total),
              ") will be added to the customer's balance. Payment is expected later."
            ] }),
            !selectedCustomer && paymentMethod === "cod" && codName.trim() && codPhone.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-blue-600 font-medium", children: "A new customer will be created from COD details." }) : !selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-destructive font-medium", children: "Please select a customer first!" })
          ] })
        ] }) }),
        paymentMethod !== "receivable" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border p-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "add-to-receivable",
              checked: addToReceivable,
              onCheckedChange: (checked) => setAddToReceivable(checked === true)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-to-receivable", className: "font-medium cursor-pointer", children: "Add to Account Receivables" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Check this to record the full amount as a receivable instead of processing payment now. Useful for credit sales or delayed payments." })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowPaymentDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: processPayment,
            disabled: isProcessing || paymentMethod === "cash" && !addToReceivable && (parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) < total && !selectedCustomer) || paymentMethod === "receivable" && !selectedCustomer || addToReceivable && !selectedCustomer && paymentMethod !== "cod" || addToReceivable && !selectedCustomer && paymentMethod === "cod" && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) || paymentMethod === "cod" && !addToReceivable && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()),
            children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }),
              "Processing..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mr-2 h-4 w-4" }),
              addToReceivable ? "Add to Receivables" : "Complete Sale"
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
