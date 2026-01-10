import { c as createLucideIcon, _ as useParams, u as useNavigate, Y as useTabs, a as useAuth, r as reactExports, j as jsxRuntimeExports, f as formatCurrency, B as Button, i as ScrollArea, I as Input, L as Label, C as CircleAlert, X, R as Receipt, e as Banknote, m as CreditCard, P as Package } from "./index-xbqNQ75I.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-BaC4FEkF.js";
import { S as Separator } from "./separator-BhDX07Zw.js";
import { C as CircleCheck } from "./circle-check-C6bhI5kg.js";
import { A as ArrowLeft } from "./arrow-left-BLRYXLzi.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Smartphone = createLucideIcon("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);
const paymentMethods = [
  { value: "cash", label: "Cash", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" }) },
  {
    value: "card",
    label: "Credit Card",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" })
  },
  {
    value: "debit_card",
    label: "Debit Card",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" })
  },
  {
    value: "mobile",
    label: "Mobile Payment",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" })
  },
  { value: "cod", label: "COD", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }) },
  {
    value: "receivable",
    label: "Pay Later / Receivable",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4" })
  }
];
function TabCheckoutScreen() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const { activeTab, checkoutTab } = useTabs();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [discount, setDiscount] = reactExports.useState(0);
  const [notes, setNotes] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [showSuccess, setShowSuccess] = reactExports.useState(false);
  const [checkoutResult, setCheckoutResult] = reactExports.useState(null);
  const [codName, setCodName] = reactExports.useState("");
  const [codPhone, setCodPhone] = reactExports.useState("");
  const [codAddress, setCodAddress] = reactExports.useState("");
  const [codCity, setCodCity] = reactExports.useState("");
  const tab = activeTab;
  const tabItems = tab?.items ?? [];
  reactExports.useEffect(() => {
    if (tab) {
      setDiscount(tab.discount ?? 0);
    }
  }, [tab]);
  const subtotal = reactExports.useMemo(() => tab?.subtotal ?? 0, [tab]);
  const tax = reactExports.useMemo(() => tab?.tax ?? 0, [tab]);
  const totalAmount = reactExports.useMemo(() => Math.max(0, subtotal + tax - discount), [subtotal, tax, discount]);
  const amountPaidNum = amountPaid === "" ? 0 : parseFloat(amountPaid);
  const changeReturned = Math.max(0, amountPaidNum - totalAmount);
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === "cash") {
      setAmountPaid("");
    } else if (method === "receivable") {
      setAmountPaid("0");
    } else {
      setAmountPaid(totalAmount.toString());
    }
  };
  const isValid = reactExports.useMemo(() => {
    if (tabItems.length === 0) return false;
    if (paymentMethod === "cod") {
      return codName.trim() !== "" && codPhone.trim() !== "" && codAddress.trim() !== "" && codCity.trim() !== "";
    }
    if (paymentMethod === "receivable" && !tab?.customerId) {
      return false;
    }
    return true;
  }, [tabItems.length, paymentMethod, codName, codPhone, codAddress, codCity, tab?.customerId]);
  const handleCheckout = async () => {
    if (!tab || !user) return;
    setIsProcessing(true);
    const checkoutData = {
      paymentMethod,
      discount,
      amountPaid: paymentMethod === "receivable" ? 0 : amountPaidNum
    };
    if (paymentMethod === "cod") {
      checkoutData.codName = codName.trim();
      checkoutData.codPhone = codPhone.trim();
      checkoutData.codAddress = codAddress.trim();
      checkoutData.codCity = codCity.trim();
    }
    if (notes.trim()) {
      checkoutData.notes = notes.trim();
    }
    const result = await checkoutTab(tab.id, checkoutData);
    setIsProcessing(false);
    if (result && result.invoiceNumber) {
      setCheckoutResult({
        invoiceNumber: result.invoiceNumber,
        totalAmount: result.totalAmount ?? totalAmount,
        changeReturned: result.changeReturned ?? changeReturned
      });
      setShowSuccess(true);
    }
  };
  const handleComplete = () => {
    setShowSuccess(false);
    navigate("/pos-tabs");
  };
  const handleBack = () => {
    navigate(`/pos-tabs/${tabId}`);
  };
  if (!tab) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }) });
  }
  if (showSuccess && checkoutResult) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[calc(100vh-8rem)] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md w-full text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-12 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-green-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold", children: "Checkout Complete!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-6 text-muted-foreground", children: [
        "Sale ",
        checkoutResult.invoiceNumber,
        " has been processed successfully."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 space-y-2 rounded-lg bg-muted p-4 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Invoice:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: checkoutResult.invoiceNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency(checkoutResult.totalAmount) })
        ] }),
        checkoutResult.changeReturned > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Change Returned:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency(checkoutResult.changeReturned) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "w-full", onClick: handleComplete, children: "Done" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto flex h-[calc(100vh-8rem)] gap-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: handleBack, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl", children: [
            "Checkout ",
            tab.tabNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 text-sm text-muted-foreground", children: [
            tab.customer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              tab.customer.firstName,
              " ",
              tab.customer.lastName
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Guest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.branch?.name ?? "N/A" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-1 flex-col p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          tabItems.length,
          " ",
          tabItems.length === 1 ? "Item" : "Items"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: tabItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.productName }),
            item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "SN: ",
              item.serialNumber
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatCurrency(item.sellingPrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Qty: ",
              item.quantity
            ] })
          ] })
        ] }, item.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 pt-4", children: [
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
                min: 0
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xl font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TOTAL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(totalAmount) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Payment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-3 block", children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: paymentMethods.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handlePaymentMethodChange(method.value),
              className: `flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${paymentMethod === method.value ? "border-primary bg-primary/5" : "border-input hover:border-primary"}`,
              children: [
                method.icon,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: method.label })
              ]
            },
            method.value
          )) })
        ] }),
        paymentMethod === "cod" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block", children: "COD Details" }),
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
        paymentMethod === "receivable" && !tab?.customerId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-yellow-500 bg-yellow-500/10 p-3 text-yellow-600 dark:text-yellow-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "A customer must be assigned to the tab for Pay Later / Receivable payments. Please go back and assign a customer first." })
        ] }),
        paymentMethod === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount-paid", children: "Amount Received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "amount-paid",
              type: "number",
              step: "0.01",
              min: "0",
              value: amountPaid,
              onChange: (e) => setAmountPaid(e.target.value),
              placeholder: "Enter amount",
              className: "text-lg"
            }
          ),
          amountPaidNum >= totalAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center justify-center gap-1 text-sm text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
            "Change: ",
            formatCurrency(changeReturned)
          ] }),
          amountPaidNum > 0 && amountPaidNum < totalAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center gap-1 text-sm text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            "Remaining: ",
            formatCurrency(totalAmount - amountPaidNum)
          ] })
        ] }),
        paymentMethod === "receivable" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-yellow-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Payment will be recorded as receivable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "The customer balance will be updated. Full payment is expected later." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "notes",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              placeholder: "Add any notes for this sale...",
              className: "min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "flex-1",
              onClick: handleBack,
              disabled: isProcessing,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-2 h-4 w-4" }),
                "Cancel"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "flex-1",
              onClick: handleCheckout,
              disabled: !isValid || isProcessing,
              children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }),
                "Processing..."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mr-2 h-4 w-4" }),
                "Complete Sale"
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold", children: formatCurrency(totalAmount) })
        ] })
      ] })
    ] })
  ] });
}
export {
  TabCheckoutScreen
};
