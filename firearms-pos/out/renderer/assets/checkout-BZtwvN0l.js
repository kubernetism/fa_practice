import { h as createLucideIcon, ar as useParams, u as useNavigate, ap as useTabs, a as useAuth, r as reactExports, j as jsxRuntimeExports, C as Card, e as CardContent, V as Separator, ac as formatCurrency, B as Button, b as CardHeader, c as CardTitle, H as ScrollArea, z as Percent, I as Input, L as Label, T as Truck, U as User, a4 as Phone, D as DollarSign, O as CircleAlert, Q as Trash2, a6 as Select, a7 as SelectTrigger, a8 as SelectValue, a9 as SelectContent, aa as SelectItem, J as Plus, X, R as Receipt, Z as Dialog, _ as DialogContent, $ as DialogHeader, a0 as DialogTitle, a1 as DialogDescription, a5 as Building2, a2 as DialogFooter, l as Banknote, Y as CreditCard, P as Package } from "./index-BkpLGJhj.js";
import { S as Switch } from "./switch-Baomd7mK.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-CgagfirT.js";
import { C as CircleCheck } from "./circle-check-nuMr7y9W.js";
import { A as ArrowLeft } from "./arrow-left-DhlPmRqV.js";
import { M as MapPin } from "./map-pin-Bl_qKm96.js";
import { S as Smartphone } from "./smartphone-Bby0lOoe.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Split = createLucideIcon("Split", [
  ["path", { d: "M16 3h5v5", key: "1806ms" }],
  ["path", { d: "M8 3H3v5", key: "15dfkv" }],
  ["path", { d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3", key: "1qrqzj" }],
  ["path", { d: "m15 9 6-6", key: "ko1vev" }]
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
const splitPaymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "mobile", label: "Mobile Payment" },
  { value: "cheque", label: "Cheque" },
  { value: "bank_transfer", label: "Bank Transfer" }
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
  const [isSplitPayment, setIsSplitPayment] = reactExports.useState(false);
  const [splitPayments, setSplitPayments] = reactExports.useState([
    { id: 1, method: "cash", amount: "", referenceNumber: "" }
  ]);
  const [codName, setCodName] = reactExports.useState("");
  const [codPhone, setCodPhone] = reactExports.useState("");
  const [codAddress, setCodAddress] = reactExports.useState("");
  const [codCity, setCodCity] = reactExports.useState("");
  const [codCharges, setCodCharges] = reactExports.useState("0");
  const [showCodDialog, setShowCodDialog] = reactExports.useState(false);
  const [taxSettings, setTaxSettings] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        const settings = await window.api.settings.get();
        if (settings) {
          setTaxSettings({
            taxRate: settings.taxRate ?? 0,
            taxName: settings.taxName ?? "GST",
            taxNumber: settings.taxNumber ?? ""
          });
        }
      } catch (error) {
        console.error("Failed to load tax settings:", error);
      }
    };
    loadTaxSettings();
  }, []);
  const tab = activeTab;
  const tabItems = tab?.items ?? [];
  reactExports.useEffect(() => {
    if (tab) {
      setDiscount(tab.discount ?? 0);
    }
  }, [tab]);
  const subtotal = reactExports.useMemo(() => tab?.subtotal ?? 0, [tab]);
  const tax = reactExports.useMemo(() => tab?.tax ?? 0, [tab]);
  const codChargesNum = codCharges === "" ? 0 : parseFloat(codCharges);
  const totalAmount = reactExports.useMemo(() => {
    const base = subtotal + tax - discount;
    if (paymentMethod === "cod") {
      return Math.max(0, base + codChargesNum);
    }
    return Math.max(0, base);
  }, [subtotal, tax, discount, paymentMethod, codChargesNum]);
  const splitPaymentTotal = reactExports.useMemo(() => {
    return splitPayments.reduce((sum, p) => {
      const amount = p.amount === "" ? 0 : parseFloat(p.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [splitPayments]);
  const splitPaymentRemaining = totalAmount - splitPaymentTotal;
  const splitPaymentChange = splitPaymentTotal > totalAmount ? splitPaymentTotal - totalAmount : 0;
  const amountPaidNum = amountPaid === "" ? 0 : parseFloat(amountPaid);
  const changeReturned = Math.max(0, amountPaidNum - totalAmount);
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setIsSplitPayment(false);
    if (method === "cash") {
      setAmountPaid("");
    } else if (method === "receivable") {
      setAmountPaid("0");
    } else {
      setAmountPaid(totalAmount.toString());
    }
    if (method === "cod") {
      setShowCodDialog(true);
    }
  };
  const isCodFormValid = reactExports.useMemo(() => {
    return codName.trim() !== "" && codPhone.trim() !== "" && codAddress.trim() !== "" && codCity.trim() !== "";
  }, [codName, codPhone, codAddress, codCity]);
  const handleCodSave = () => {
    if (isCodFormValid) {
      setShowCodDialog(false);
    }
  };
  const handleCodCancel = () => {
    setShowCodDialog(false);
    if (!isCodFormValid) {
      setPaymentMethod("cash");
      setCodName("");
      setCodPhone("");
      setCodAddress("");
      setCodCity("");
      setCodCharges("0");
    }
  };
  const handleSplitPaymentToggle = (enabled) => {
    setIsSplitPayment(enabled);
    if (enabled) {
      setPaymentMethod("mixed");
      setSplitPayments([{ id: 1, method: "cash", amount: "", referenceNumber: "" }]);
    } else {
      setPaymentMethod("cash");
      setAmountPaid("");
    }
  };
  const addSplitPayment = () => {
    const newId = Math.max(...splitPayments.map((p) => p.id)) + 1;
    setSplitPayments([...splitPayments, { id: newId, method: "card", amount: "", referenceNumber: "" }]);
  };
  const removeSplitPayment = (id) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter((p) => p.id !== id));
    }
  };
  const updateSplitPayment = (id, field, value) => {
    setSplitPayments(splitPayments.map(
      (p) => p.id === id ? { ...p, [field]: value } : p
    ));
  };
  const setRemainingToPayment = (id) => {
    const otherTotal = splitPayments.filter((p) => p.id !== id).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const remaining = Math.max(0, totalAmount - otherTotal);
    updateSplitPayment(id, "amount", remaining.toFixed(2));
  };
  const isValid = reactExports.useMemo(() => {
    if (tabItems.length === 0) return false;
    if (paymentMethod === "cod") {
      return codName.trim() !== "" && codPhone.trim() !== "" && codAddress.trim() !== "" && codCity.trim() !== "";
    }
    if (paymentMethod === "receivable" && !tab?.customerId) {
      return false;
    }
    if (isSplitPayment) {
      const hasValidPayment = splitPayments.some((p) => parseFloat(p.amount) > 0);
      if (!hasValidPayment) return false;
      if (splitPaymentTotal < totalAmount) return false;
    }
    return true;
  }, [tabItems.length, paymentMethod, codName, codPhone, codAddress, codCity, tab?.customerId, isSplitPayment, splitPayments, splitPaymentTotal, totalAmount]);
  const handleCheckout = async () => {
    if (!tab || !user) return;
    setIsProcessing(true);
    const checkoutData = {
      paymentMethod: isSplitPayment ? "mixed" : paymentMethod,
      discount,
      amountPaid: isSplitPayment ? splitPaymentTotal : paymentMethod === "receivable" ? 0 : amountPaidNum
    };
    if (isSplitPayment) {
      checkoutData.payments = splitPayments.filter((p) => parseFloat(p.amount) > 0).map((p) => ({
        method: p.method,
        amount: parseFloat(p.amount),
        referenceNumber: p.referenceNumber || void 0
      }));
    }
    if (paymentMethod === "cod") {
      checkoutData.codName = codName.trim();
      checkoutData.codPhone = codPhone.trim();
      checkoutData.codAddress = codAddress.trim();
      checkoutData.codCity = codCity.trim();
      checkoutData.codCharges = codChargesNum;
    }
    if (notes.trim()) {
      checkoutData.notes = notes.trim();
    }
    const result = await checkoutTab(tab.id, checkoutData);
    setIsProcessing(false);
    if (result && result.invoiceNumber) {
      setCheckoutResult({
        invoiceNumber: result.invoiceNumber,
        totalAmount: result.sale?.totalAmount ?? totalAmount,
        changeReturned: isSplitPayment ? splitPaymentChange : result.sale?.changeGiven ?? changeReturned
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm cursor-help group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-3.5 w-3.5 text-emerald-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: taxSettings?.taxName ?? "Tax" }),
                taxSettings?.taxRate !== void 0 && taxSettings.taxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "(",
                  taxSettings.taxRate,
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-emerald-600 group-hover:text-emerald-700", children: formatCurrency(tax) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "left", className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
                taxSettings?.taxName ?? "Tax",
                " Details"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rate:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  taxSettings?.taxRate ?? 0,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "On Subtotal:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal) })
              ] }),
              taxSettings?.taxNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tax ID:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: taxSettings.taxNumber })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax Amount:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(tax) })
              ] })
            ] }) })
          ] }) }),
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
          paymentMethod === "cod" && codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-blue-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "COD Charges" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "+",
              formatCurrency(codChargesNum)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xl font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TOTAL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(totalAmount) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-[420px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "split-payment", className: "text-sm font-normal cursor-pointer", children: "Split Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              id: "split-payment",
              checked: isSplitPayment,
              onCheckedChange: handleSplitPaymentToggle
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        !isSplitPayment ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
          paymentMethod === "cod" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-900 dark:text-amber-100", children: "Cash on Delivery" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setShowCodDialog(true),
                  className: "border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50",
                  children: isCodFormValid ? "Edit Details" : "Add Details"
                }
              )
            ] }),
            isCodFormValid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-amber-600 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-900 dark:text-amber-100", children: codName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-amber-600 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-900 dark:text-amber-100", children: codPhone })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-amber-600 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-900 dark:text-amber-100", children: [
                  codAddress,
                  ", ",
                  codCity
                ] })
              ] }),
              codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 pt-1 border-t border-amber-200 dark:border-amber-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-amber-600 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-900 dark:text-amber-100 font-medium", children: [
                  "Delivery: ",
                  formatCurrency(codChargesNum)
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Please add delivery details to continue" })
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
          ] }) })
        ] }) : (
          /* Split Payment UI */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Split, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add multiple payment methods" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: splitPayments.map((payment, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
                  "Payment ",
                  index + 1
                ] }),
                splitPayments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-6 w-6 ml-auto",
                    onClick: () => removeSplitPayment(payment.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: payment.method,
                    onValueChange: (value) => updateSplitPayment(payment.id, "method", value),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: splitPaymentMethods.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      placeholder: "Amount",
                      value: payment.amount,
                      onChange: (e) => updateSplitPayment(payment.id, "amount", e.target.value)
                    }
                  ),
                  splitPaymentRemaining > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "link",
                      size: "sm",
                      className: "absolute right-1 top-1/2 -translate-y-1/2 h-auto py-0 px-1 text-xs",
                      onClick: () => setRemainingToPayment(payment.id),
                      children: "Fill"
                    }
                  )
                ] })
              ] }),
              ["card", "debit_card", "cheque", "bank_transfer"].includes(payment.method) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Reference # (optional)",
                  value: payment.referenceNumber,
                  onChange: (e) => updateSplitPayment(payment.id, "referenceNumber", e.target.value),
                  className: "text-sm"
                }
              )
            ] }, payment.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "w-full",
                onClick: addSplitPayment,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Add Payment Method"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Paid:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatCurrency(splitPaymentTotal) })
              ] }),
              splitPaymentRemaining > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remaining:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatCurrency(splitPaymentRemaining) })
              ] }),
              splitPaymentChange > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Change:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatCurrency(splitPaymentChange) })
              ] })
            ] })
          ] })
        ),
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
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCodDialog, onOpenChange: setShowCodDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "pb-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl", children: "Cash on Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter delivery details for COD payment" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-100 dark:border-blue-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-charges", className: "flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
            "Delivery Charges (Optional)"
          ] }),
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
              className: "text-lg font-semibold bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-start gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mt-0.5 flex-shrink-0" }),
            "This amount will be added to the total and recorded as delivery expense"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-muted-foreground uppercase tracking-wide", children: "Customer Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-name", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Full Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-name",
                value: codName,
                onChange: (e) => setCodName(e.target.value),
                placeholder: "Enter customer's full name",
                className: !codName.trim() && showCodDialog ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-phone", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Phone Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-phone",
                value: codPhone,
                onChange: (e) => setCodPhone(e.target.value),
                placeholder: "Enter contact number",
                className: !codPhone.trim() && showCodDialog ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-address", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Delivery Address ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-address",
                value: codAddress,
                onChange: (e) => setCodAddress(e.target.value),
                placeholder: "Enter complete delivery address",
                className: !codAddress.trim() && showCodDialog ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-city", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "City ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-city",
                value: codCity,
                onChange: (e) => setCodCity(e.target.value),
                placeholder: "Enter city name",
                className: !codCity.trim() && showCodDialog ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] })
        ] }),
        codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Order Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal + tax - discount) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-amber-600 dark:text-amber-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Delivery Charges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(codChargesNum) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total to Collect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: formatCurrency(totalAmount) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCodCancel, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleCodSave,
            disabled: !isCodFormValid,
            className: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
              "Confirm Details"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  TabCheckoutScreen
};
