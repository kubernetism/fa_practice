import { r as reactExports, j as jsxRuntimeExports, n as createContextScope, o as Presence, p as Primitive, q as useControllableState, s as useComposedRefs, t as composeEventHandlers, v as usePrevious, w as useSize, x as cn, C as Check, e as useBranch, f as useCurrency, y as useCurrentBranchSettings, I as Input, z as ScrollArea, A as Plus, F as Badge, P as Package, B as Button, U as User, X, G as CircleAlert, H as Trash2, J as Separator, k as Banknote, K as CreditCard, M as Clock, O as Dialog, Q as DialogContent, V as DialogHeader, Y as DialogTitle, Z as DialogDescription, L as Label, _ as DialogFooter, R as Receipt } from "./index-4oXusK1R.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-CyYnQZc6.js";
import { S as Search } from "./search-DPNiWhCV.js";
import { M as Minus } from "./minus-C6LpIkN3.js";
import { S as Smartphone } from "./smartphone-BO-XB2LB.js";
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
  const {
    __scopeCheckbox,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: CHECKBOX_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    setChecked,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxProviderImpl,
    {
      scope: __scopeCheckbox,
      ...context,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  );
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = reactExports.forwardRef(
  ({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) => {
    const {
      control,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = control?.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [control, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        }),
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxProvider,
      {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxTrigger,
            {
              ...checkboxProps,
              ref: forwardedRef,
              __scopeCheckbox
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxBubbleInput,
            {
              __scopeCheckbox
            }
          )
        ] })
      }
    );
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: { pointerEvents: "none", ...props.style }
          }
        )
      }
    );
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = reactExports.forwardRef(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxIndicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = Checkbox$1.displayName;
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
  const taxRate = settings?.taxRate ?? 0;
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
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
  const loadAllCustomers = reactExports.useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const result = await window.api.customers.getAll();
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
    if (addToReceivable && !selectedCustomer) {
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
      let notes = "";
      if (paymentMethod === "cod") {
        notes = `COD Details:
Name: ${codName}
Phone: ${codPhone}
Address: ${codAddress}, ${codCity}`;
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
        paymentMethod: addToReceivable ? "receivable" : paymentMethod,
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
        setAddToReceivable(false);
        loadAvailableProducts();
        let message = `Sale completed! Invoice: ${result.data.invoiceNumber}`;
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
            !selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-destructive font-medium", children: "Please select a customer first!" })
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
            disabled: isProcessing || paymentMethod === "cash" && !addToReceivable && (parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) < total && !selectedCustomer) || (paymentMethod === "receivable" || addToReceivable) && !selectedCustomer || paymentMethod === "cod" && !addToReceivable && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()),
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
