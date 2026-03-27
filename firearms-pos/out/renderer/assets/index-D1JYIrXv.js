import { r as reactExports, j as jsxRuntimeExports, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, a as LoaderCircle, B as Button, ac as Badge, O as ScrollArea, ad as FileText, ae as Clock, U as User, af as Separator, W as Wrench, ag as CreditCard, Q as useBranch, V as useCurrency, ah as useCurrentBranchSettings, Z as Tabs, _ as TabsList, $ as TabsTrigger, P as Package, I as Input, X, ai as TabsContent, f as CircleAlert, H as Receipt, aj as Plus, ak as Trash2, Y as TooltipProvider, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent, J as Banknote, F as Truck, t as UserPlus, L as Label, al as DialogFooter, am as Ticket, an as Percent, ao as Phone, M as MapPin, a0 as DollarSign, g as Building2, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem } from "./index-D_bEN21S.js";
import { C as Checkbox } from "./checkbox-CyN_8s3s.js";
import { C as CircleCheck } from "./circle-check-DjEhIWd8.js";
import { P as Printer } from "./printer-CucAZ7MG.js";
import { D as Download } from "./download-VznSnvmo.js";
import { S as Search } from "./search-ByeEpRVi.js";
import { M as Minus } from "./minus-Siy3NLK7.js";
import { S as Smartphone } from "./smartphone-CWdQjiaX.js";
function formatCurrency(amount, settings) {
  const symbol = settings.currencySymbol || "Rs.";
  const position = settings.currencyPosition || "prefix";
  const formatted = amount.toLocaleString("en-PK", {
    minimumFractionDigits: settings.decimalPlaces || 2,
    maximumFractionDigits: settings.decimalPlaces || 2
  });
  return position === "prefix" ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}
function getPaymentMethodLabel(method) {
  const labels = {
    cash: "Cash",
    card: "Card",
    credit: "Credit",
    mixed: "Mixed",
    mobile: "Mobile Payment",
    cod: "Cash on Delivery",
    receivable: "Pay Later",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque"
  };
  return labels[method] || method;
}
function getPaymentStatusColor(status) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "partial":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}
function ReceiptPreview({ open, onClose, saleId, receiptPath }) {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [downloading, setDownloading] = reactExports.useState(false);
  const [downloaded, setDownloaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open || !saleId) return;
    setLoading(true);
    setError("");
    setDownloaded(false);
    window.api.receipt.getData(saleId).then((result) => {
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load receipt data");
      }
    }).catch(() => setError("Failed to load receipt")).finally(() => setLoading(false));
  }, [open, saleId]);
  reactExports.useEffect(() => {
    if (!data || !saleId || downloaded) return;
    setDownloading(true);
    window.api.receipt.generate(saleId).then((result) => {
      if (result.success) {
        setDownloaded(true);
      }
    }).catch(() => {
    }).finally(() => setDownloading(false));
  }, [data, saleId, downloaded]);
  const handlePrint = async () => {
    if (!saleId) return;
    try {
      let filePath = receiptPath;
      if (!filePath) {
        const result = await window.api.receipt.generate(saleId);
        if (result.success && result.data?.filePath) {
          filePath = result.data.filePath;
        }
      }
      if (filePath) {
        await window.api.shell.openPath(filePath);
      }
    } catch (err) {
      console.error("Failed to print receipt:", err);
    }
  };
  const saleDate = data ? new Date(data.sale.saleDate).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }) : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-[520px] p-0 gap-0 border-border/40 overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "sr-only", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Receipt Preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Sale receipt preview" })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-sm", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-4", onClick: onClose, children: "Close" })
    ] }),
    data && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 text-white overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 opacity-[0.07]",
            style: {
              backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold tracking-wide", children: "Sale Complete" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-emerald-100 text-xs", children: downloading ? "Downloading receipt..." : downloaded ? "Receipt saved to downloads" : "Processing receipt..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: `shrink-0 border text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(data.sale.paymentStatus)}`,
              children: data.sale.paymentStatus
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[65vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold tracking-wide uppercase text-foreground", children: data.businessSettings.businessName || "Business Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Tax Invoice / Receipt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-foreground", children: [
                "#",
                data.sale.invoiceNumber
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: saleDate })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground truncate max-w-[160px]", children: data.customer?.name || "Walk-in Customer" })
            ] }),
            data.customer?.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: data.customer.phone })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_70px_36px_76px] gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Total" })
          ] }),
          data.items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "grid grid-cols-[1fr_70px_36px_76px] gap-1 py-2 border-b border-border/20 text-xs items-start",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: item.productName }),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-mono", children: [
                    "S/N: ",
                    item.serialNumber
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right font-mono text-muted-foreground tabular-nums", children: formatCurrency(item.unitPrice, data.businessSettings) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center tabular-nums", children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right font-mono font-medium tabular-nums", children: formatCurrency(item.totalPrice, data.businessSettings) })
              ]
            },
            `p-${i}`
          )),
          data.services.map((svc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "grid grid-cols-[1fr_70px_36px_76px] gap-1 py-2 border-b border-border/20 text-xs items-start bg-blue-500/[0.03]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-foreground truncate", children: [
                    svc.serviceName,
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1.5 text-[9px] font-semibold text-blue-400", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "inline h-2.5 w-2.5 mr-0.5 -mt-0.5" }),
                      "SVC"
                    ] })
                  ] }),
                  svc.hours && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                    svc.hours,
                    "hr × ",
                    formatCurrency(svc.unitPrice, data.businessSettings)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right font-mono text-muted-foreground tabular-nums", children: formatCurrency(svc.unitPrice, data.businessSettings) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center tabular-nums", children: svc.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right font-mono font-medium tabular-nums", children: formatCurrency(svc.totalAmount, data.businessSettings) })
              ]
            },
            `s-${i}`
          ))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(data.sale.subtotal, data.businessSettings) })
          ] }),
          data.businessSettings.showTaxOnReceipt && data.sale.taxAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Tax ",
              data.businessSettings.taxRate > 0 ? `(${data.businessSettings.taxRate}%)` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(data.sale.taxAmount, data.businessSettings) })
          ] }),
          data.sale.discountAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono tabular-nums text-emerald-400", children: [
              "-",
              formatCurrency(data.sale.discountAmount, data.businessSettings)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold uppercase tracking-wider", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold font-mono tabular-nums", children: formatCurrency(data.sale.totalAmount, data.businessSettings) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3 w-3" }),
              "Payment Method"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: getPaymentMethodLabel(data.sale.paymentMethod) })
          ] }),
          data.sale.amountPaid > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums font-medium text-emerald-400", children: formatCurrency(data.sale.amountPaid, data.businessSettings) })
          ] }),
          data.sale.changeGiven > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Change" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(data.sale.changeGiven, data.businessSettings) })
          ] }),
          data.sale.amountPaid < data.sale.totalAmount && data.sale.amountPaid > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs pt-1 border-t border-amber-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 font-medium", children: "Balance Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums font-bold text-amber-400", children: formatCurrency(data.sale.totalAmount - data.sale.amountPaid, data.businessSettings) })
          ] })
        ] }),
        (data.businessSettings.receiptCustomField1Label || data.businessSettings.receiptCustomField2Label || data.businessSettings.receiptCustomField3Label) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1 text-[10px] text-muted-foreground", children: [
          data.businessSettings.receiptCustomField1Label && data.businessSettings.receiptCustomField1Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: data.businessSettings.receiptCustomField1Label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: data.businessSettings.receiptCustomField1Value })
          ] }),
          data.businessSettings.receiptCustomField2Label && data.businessSettings.receiptCustomField2Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: data.businessSettings.receiptCustomField2Label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: data.businessSettings.receiptCustomField2Value })
          ] }),
          data.businessSettings.receiptCustomField3Label && data.businessSettings.receiptCustomField3Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: data.businessSettings.receiptCustomField3Label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: data.businessSettings.receiptCustomField3Value })
          ] })
        ] }),
        data.businessSettings.receiptTermsAndConditions && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[10px] text-muted-foreground/70 leading-relaxed", children: data.businessSettings.receiptTermsAndConditions }),
        data.businessSettings.receiptFooter && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] text-center text-muted-foreground/50", children: data.businessSettings.receiptFooter })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pb-4 pt-2 flex gap-2 border-t border-border/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "lg",
            className: "flex-1 h-10 gap-2 text-xs",
            onClick: handlePrint,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
              "Open / Print"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "lg",
            className: "flex-1 h-10 gap-2 text-xs font-semibold",
            onClick: onClose,
            children: [
              downloaded && /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              downloaded ? "Done — Saved" : "Done"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function POSScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency: formatCurrency2 } = useCurrency();
  const { settings } = useCurrentBranchSettings();
  const [activeTab, setActiveTab] = reactExports.useState("products");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [serviceSearchQuery, setServiceSearchQuery] = reactExports.useState("");
  const [allProducts, setAllProducts] = reactExports.useState([]);
  const [allServices, setAllServices] = reactExports.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = reactExports.useState(true);
  const [isLoadingServices, setIsLoadingServices] = reactExports.useState(true);
  const [cart, setCart] = reactExports.useState([]);
  const [showHoursDialog, setShowHoursDialog] = reactExports.useState(false);
  const [pendingHourlyService, setPendingHourlyService] = reactExports.useState(null);
  const [serviceHours, setServiceHours] = reactExports.useState("1");
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [customerSearch, setCustomerSearch] = reactExports.useState("");
  const [customers, setCustomers] = reactExports.useState([]);
  const [allCustomers, setAllCustomers] = reactExports.useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = reactExports.useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = reactExports.useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = reactExports.useState(false);
  const [quickAddFirstName, setQuickAddFirstName] = reactExports.useState("");
  const [quickAddLastName, setQuickAddLastName] = reactExports.useState("");
  const [quickAddPhone, setQuickAddPhone] = reactExports.useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = reactExports.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [showSerialDialog, setShowSerialDialog] = reactExports.useState(false);
  const [pendingSerialProduct, setPendingSerialProduct] = reactExports.useState(null);
  const [serialNumber, setSerialNumber] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [addToReceivable, setAddToReceivable] = reactExports.useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = reactExports.useState(false);
  const [completedSaleId, setCompletedSaleId] = reactExports.useState(null);
  const [completedReceiptPath, setCompletedReceiptPath] = reactExports.useState();
  const [taxSettings, setTaxSettings] = reactExports.useState({
    taxRate: 0,
    taxName: "GST",
    taxNumber: ""
  });
  reactExports.useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        if (settings && settings.taxRate !== void 0 && settings.taxRate > 0) {
          setTaxSettings({
            taxRate: settings.taxRate,
            taxName: settings.taxName ?? "GST",
            taxNumber: settings.taxNumber ?? ""
          });
          return;
        }
        const businessSettings = await window.api.businessSettings.getGlobal();
        if (businessSettings && businessSettings.taxRate !== void 0) {
          setTaxSettings({
            taxRate: businessSettings.taxRate ?? 0,
            taxName: businessSettings.taxName ?? "GST",
            taxNumber: businessSettings.taxNumber ?? ""
          });
        }
      } catch (error2) {
        console.error("Failed to load tax settings:", error2);
      }
    };
    loadTaxSettings();
  }, [settings]);
  const [codName, setCodName] = reactExports.useState("");
  const [codPhone, setCodPhone] = reactExports.useState("");
  const [codAddress, setCodAddress] = reactExports.useState("");
  const [codCity, setCodCity] = reactExports.useState("");
  const [codCharges, setCodCharges] = reactExports.useState("");
  const [showCodDialog, setShowCodDialog] = reactExports.useState(false);
  const [mobileProvider, setMobileProvider] = reactExports.useState("jazzcash");
  const [mobileReceiverPhone, setMobileReceiverPhone] = reactExports.useState("");
  const [mobileSenderPhone, setMobileSenderPhone] = reactExports.useState("");
  const [mobileTransactionId, setMobileTransactionId] = reactExports.useState("");
  const [showMobileDialog, setShowMobileDialog] = reactExports.useState(false);
  const [cardHolderName, setCardHolderName] = reactExports.useState("");
  const [cardLastFourDigits, setCardLastFourDigits] = reactExports.useState("");
  const [showCardDialog, setShowCardDialog] = reactExports.useState(false);
  const [discountAmount, setDiscountAmount] = reactExports.useState("");
  const [voucherCode, setVoucherCode] = reactExports.useState("");
  const [appliedVoucher, setAppliedVoucher] = reactExports.useState(null);
  const [voucherError, setVoucherError] = reactExports.useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = reactExports.useState(false);
  const isCodFormValid = reactExports.useMemo(() => {
    return codName.trim() !== "" && codPhone.trim() !== "" && codAddress.trim() !== "" && codCity.trim() !== "";
  }, [codName, codPhone, codAddress, codCity]);
  const isMobileFormValid = reactExports.useMemo(() => {
    return mobileReceiverPhone.trim() !== "" && mobileSenderPhone.trim() !== "" && mobileTransactionId.trim() !== "";
  }, [mobileReceiverPhone, mobileSenderPhone, mobileTransactionId]);
  const isCardFormValid = reactExports.useMemo(() => {
    return cardHolderName.trim() !== "" && cardLastFourDigits.trim().length === 4;
  }, [cardHolderName, cardLastFourDigits]);
  const mobileProviderLabels = {
    jazzcash: "JazzCash",
    easypaisa: "Easypaisa",
    nayapay: "NayaPay",
    sadapay: "SadaPay",
    other: "Other"
  };
  const handleCodSave = () => {
    if (isCodFormValid) {
      setShowCodDialog(false);
    }
  };
  const handleCodCancel = () => {
    setShowCodDialog(false);
    if (!isCodFormValid) {
      setCodName("");
      setCodPhone("");
      setCodAddress("");
      setCodCity("");
      setCodCharges("");
    }
  };
  const handleMobileSave = () => {
    if (isMobileFormValid) {
      setShowMobileDialog(false);
    }
  };
  const handleMobileCancel = () => {
    setShowMobileDialog(false);
    if (!isMobileFormValid) {
      setMobileProvider("jazzcash");
      setMobileReceiverPhone("");
      setMobileSenderPhone("");
      setMobileTransactionId("");
    }
  };
  const handleCardSave = () => {
    if (isCardFormValid) {
      setShowCardDialog(false);
    }
  };
  const handleCardCancel = () => {
    setShowCardDialog(false);
    if (!isCardFormValid) {
      setCardHolderName("");
      setCardLastFourDigits("");
    }
  };
  const taxRate = taxSettings.taxRate;
  const subtotal = cart.reduce((sum, item) => {
    if (item.type === "product" && item.product) {
      return sum + item.product.sellingPrice * item.quantity;
    } else if (item.type === "service" && item.service) {
      if (item.service.pricingType === "hourly" && item.hours) {
        return sum + item.service.price * item.hours;
      }
      return sum + item.service.price * item.quantity;
    }
    return sum;
  }, 0);
  const discount = parseFloat(discountAmount) || 0;
  const codChargesNum = parseFloat(codCharges) || 0;
  const taxableAmount = subtotal - discount;
  const taxAmount = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0;
  const total = taxableAmount + taxAmount + (paymentMethod === "cod" ? codChargesNum : 0);
  const loadAvailableProducts = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    setIsLoadingProducts(true);
    try {
      const result = await window.api.products.getAvailable({
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
  const loadServices = reactExports.useCallback(async () => {
    setIsLoadingServices(true);
    try {
      const result = await window.api.services.getActive();
      if (result.success && result.data) {
        setAllServices(result.data);
      }
    } catch (error2) {
      console.error("Failed to load services:", error2);
    } finally {
      setIsLoadingServices(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadAvailableProducts();
    loadServices();
  }, [loadAvailableProducts, loadServices]);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if (e.detail?.path === "/pos") {
        loadAvailableProducts();
        loadServices();
      }
    };
    window.addEventListener("screen-activated", handler);
    return () => window.removeEventListener("screen-activated", handler);
  }, [loadAvailableProducts, loadServices]);
  const filteredProducts = searchQuery.trim() ? allProducts.filter(
    (item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.product.code?.toLowerCase().includes(searchQuery.toLowerCase()) || item.product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : allProducts;
  const filteredServices = serviceSearchQuery.trim() ? allServices.filter(
    (service) => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || service.code?.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || service.description?.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  ) : allServices;
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
    const existingInCart = cart.find((item) => item.type === "product" && item.product?.id === product.id);
    const currentCartQty = existingInCart?.quantity ?? 0;
    if (currentCartQty >= availableQty) {
      setError(`Only ${availableQty} units available in stock`);
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.type === "product" && item.product?.id === product.id);
      if (existing) {
        return prevCart.map(
          (item) => item.type === "product" && item.product?.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { type: "product", product, quantity: 1 }];
    });
    setError("");
  };
  const addServiceToCart = (service) => {
    if (service.pricingType === "hourly") {
      setPendingHourlyService(service);
      setServiceHours("1");
      setShowHoursDialog(true);
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.type === "service" && item.service?.id === service.id);
      if (existing) {
        return prevCart.map(
          (item) => item.type === "service" && item.service?.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { type: "service", service, quantity: 1 }];
    });
    setError("");
  };
  const addHourlyServiceToCart = () => {
    if (!pendingHourlyService) return;
    const hours = parseFloat(serviceHours) || 1;
    setCart((prevCart) => [
      ...prevCart,
      { type: "service", service: pendingHourlyService, quantity: 1, hours }
    ]);
    setShowHoursDialog(false);
    setPendingHourlyService(null);
    setServiceHours("1");
    setError("");
  };
  const addSerialTrackedItem = () => {
    if (!pendingSerialProduct || !serialNumber.trim()) return;
    setCart((prevCart) => [
      ...prevCart,
      { type: "product", product: pendingSerialProduct, quantity: 1, serialNumber: serialNumber.trim() }
    ]);
    setShowSerialDialog(false);
    setPendingSerialProduct(null);
    setSerialNumber("");
    setSearchQuery("");
  };
  const updateQuantity = (itemType, itemId, delta) => {
    if (itemType === "product") {
      const productStock = allProducts.find((p) => p.product.id === itemId);
      const availableStock = productStock?.quantity ?? 0;
      setCart(
        (prevCart) => prevCart.map((item) => {
          if (item.type === "product" && item.product?.id === itemId) {
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
    } else {
      setCart(
        (prevCart) => prevCart.map((item) => {
          if (item.type === "service" && item.service?.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        }).filter((item) => item.quantity > 0)
      );
    }
  };
  const removeFromCart = (itemType, itemId, serialNumber2) => {
    setCart(
      (prevCart) => prevCart.filter((item) => {
        if (itemType === "product") {
          return !(item.type === "product" && item.product?.id === itemId && item.serialNumber === serialNumber2);
        } else {
          return !(item.type === "service" && item.service?.id === itemId);
        }
      })
    );
  };
  const validateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherError("");
    try {
      const result = await window.api.vouchers.validate(voucherCode.trim());
      if (result.success && result.data) {
        setAppliedVoucher({
          id: result.data.id,
          code: result.data.code,
          discountAmount: result.data.discountAmount
        });
        setDiscountAmount(String(result.data.discountAmount));
        setVoucherCode("");
      } else {
        setVoucherError(result.message || "Invalid voucher code");
      }
    } catch (error2) {
      console.error("Voucher validation error:", error2);
      setVoucherError("Failed to validate voucher");
    } finally {
      setIsValidatingVoucher(false);
    }
  };
  const removeVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount("");
    setVoucherError("");
  };
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setError("");
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };
  const processPayment = async () => {
    if (!currentBranch) return;
    if (cart.length === 0) return;
    const hasFirearms = cart.some((item) => item.type === "product" && item.product?.isSerialTracked);
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
      } else if (paymentMethod === "mobile") {
        notes = `Mobile Payment Details:
Provider: ${mobileProviderLabels[mobileProvider]}
Receiver: ${mobileReceiverPhone}
Sender: ${mobileSenderPhone}
Transaction ID: ${mobileTransactionId}`;
      } else if (paymentMethod === "card") {
        notes = `Card Payment Details:
Card Holder: ${cardHolderName}
Card: **** **** **** ${cardLastFourDigits}`;
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
      } else if (paymentMethod === "cod") {
        actualAmountPaid = 0;
        paymentStatus = "pending";
      } else {
        actualAmountPaid = total;
      }
      const remainingAmount = Math.max(0, total - actualAmountPaid);
      const changeGiven = actualAmountPaid > total ? actualAmountPaid - total : 0;
      const productItems = cart.filter((item) => item.type === "product" && item.product);
      const serviceItems = cart.filter((item) => item.type === "service" && item.service);
      const saleData = {
        customerId: customerIdToUse,
        branchId: currentBranch.id,
        items: productItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
          serialNumber: item.serialNumber,
          taxRate: item.product.isTaxable ? taxRate : 0
        })),
        services: serviceItems.map((item) => ({
          serviceId: item.service.id,
          serviceName: item.service.name,
          quantity: item.quantity,
          unitPrice: item.service.price,
          hours: item.hours,
          taxRate: item.service.isTaxable ? taxRate : 0
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
        // Mobile payment fields
        mobileProvider: paymentMethod === "mobile" ? mobileProvider : void 0,
        mobileReceiverPhone: paymentMethod === "mobile" ? mobileReceiverPhone : void 0,
        mobileSenderPhone: paymentMethod === "mobile" ? mobileSenderPhone : void 0,
        mobileTransactionId: paymentMethod === "mobile" ? mobileTransactionId : void 0,
        // Card payment fields
        cardHolderName: paymentMethod === "card" ? cardHolderName : void 0,
        cardLastFourDigits: paymentMethod === "card" ? cardLastFourDigits : void 0,
        notes: notes || void 0,
        // Voucher
        voucherId: appliedVoucher?.id
      };
      const result = await window.api.sales.create(saleData);
      if (result.success) {
        clearCart();
        setShowPaymentDialog(false);
        setAmountPaid("");
        setDiscountAmount("");
        setCodName("");
        setCodPhone("");
        setCodAddress("");
        setCodCity("");
        setCodCharges("");
        setMobileProvider("jazzcash");
        setMobileReceiverPhone("");
        setMobileSenderPhone("");
        setMobileTransactionId("");
        setCardHolderName("");
        setCardLastFourDigits("");
        setAddToReceivable(false);
        setAppliedVoucher(null);
        setVoucherCode("");
        setVoucherError("");
        loadAvailableProducts();
        setCompletedSaleId(result.data.id);
        setShowReceiptPreview(true);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full gap-3 -m-6 p-3 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: (value) => {
      const tab = value;
      setActiveTab(tab);
      if (tab === "products") loadAvailableProducts();
      else loadServices();
    }, className: "flex flex-col h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-9 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "products", className: "h-7 px-3 text-xs font-semibold gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5" }),
            "Products",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] tabular-nums text-muted-foreground/70", children: [
              "(",
              filteredProducts.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "services", className: "h-7 px-3 text-xs font-semibold gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-3.5 w-3.5" }),
            "Services",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] tabular-nums text-muted-foreground/70", children: [
              "(",
              filteredServices.length,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: activeTab === "products" ? "Search by name, code, barcode..." : "Search services...",
              value: activeTab === "products" ? searchQuery : serviceSearchQuery,
              onChange: (e) => activeTab === "products" ? setSearchQuery(e.target.value) : setServiceSearchQuery(e.target.value),
              className: "h-9 pl-8 text-sm bg-card border-border/60"
            }
          ),
          (activeTab === "products" ? searchQuery : serviceSearchQuery) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => activeTab === "products" ? setSearchQuery("") : setServiceSearchQuery(""),
              className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "products", className: "flex-1 mt-0 overflow-hidden rounded-lg border border-border bg-card/50", children: isLoadingProducts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : filteredProducts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5 p-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", children: filteredProducts.map((item) => {
        const cartItem = cart.find((c) => c.type === "product" && c.product?.id === item.product.id);
        const inCartQty = cartItem?.quantity ?? 0;
        const remainingStock = item.quantity - inCartQty;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => addToCart(item.product, item.quantity),
            disabled: remainingStock <= 0 && !item.product.isSerialTracked,
            className: `group relative flex flex-col rounded-md border p-2 text-left transition-all
                          hover:border-primary/40 hover:shadow-sm
                          disabled:opacity-40 disabled:cursor-not-allowed
                          ${inCartQty > 0 ? "border-primary/50 bg-primary/[0.04]" : "border-border"}`,
            children: [
              inCartQty > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm", children: inCartQty }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium leading-snug text-xs line-clamp-2 flex-1", children: item.product.name }),
                item.product.isSerialTracked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 mt-0.5 rounded bg-blue-500/10 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400", children: "SN" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-mono text-muted-foreground/70 mb-1.5", children: item.product.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-end justify-between gap-1 pt-1.5 border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold tabular-nums", children: formatCurrency2(item.product.sellingPrice) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] font-medium tabular-nums ${remainingStock <= 5 ? "text-destructive" : "text-muted-foreground/60"}`, children: [
                  remainingStock,
                  " qty"
                ] })
              ] })
            ]
          },
          item.product.id
        );
      }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-8 w-8 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: searchQuery ? `No results for "${searchQuery}"` : "No products in inventory" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "services", className: "flex-1 mt-0 overflow-hidden rounded-lg border border-border bg-card/50", children: isLoadingServices ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }) : filteredServices.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5 p-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", children: filteredServices.map((service) => {
        const cartItem = cart.find((c) => c.type === "service" && c.service?.id === service.id);
        const inCartQty = cartItem?.quantity ?? 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => addServiceToCart(service),
            className: `group relative flex flex-col rounded-md border p-2 text-left transition-all
                          hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.08)]
                          ${inCartQty > 0 ? "border-blue-500/40 bg-blue-500/[0.03]" : "border-border"}`,
            children: [
              inCartQty > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-sm", children: inCartQty }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-3 w-3 text-blue-500 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium leading-snug text-xs line-clamp-2 flex-1", children: service.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-mono text-muted-foreground/70 mb-1", children: service.code }),
              service.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/50 line-clamp-1 mb-1", children: service.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-end justify-between gap-1 pt-1.5 border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400", children: [
                  formatCurrency2(service.price),
                  service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-normal opacity-60", children: "/hr" })
                ] }),
                service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-blue-500/10 px-1 py-0.5 text-[9px] font-semibold text-blue-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "inline h-2.5 w-2.5 mr-0.5" }),
                  "HR"
                ] })
              ] })
            ]
          },
          service.id
        );
      }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-8 w-8 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: serviceSearchQuery ? `No results for "${serviceSearchQuery}"` : "No services available" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-80 xl:w-[22rem] flex flex-col rounded-lg border border-border bg-card overflow-hidden shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Cart" }),
          cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary tabular-nums", children: cart.reduce((sum, item) => sum + item.quantity, 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive", onClick: clearCart, children: "Clear" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 border-b border-border/30", children: selectedCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded bg-muted/50 px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium truncate", children: [
            selectedCustomer.firstName,
            " ",
            selectedCustomer.lastName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "shrink-0 text-muted-foreground hover:text-foreground p-0.5", onClick: () => setSelectedCustomer(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-border/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors",
          onClick: () => setShowCustomerDialog(true),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
            "Select Customer"
          ]
        }
      ) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 mt-1.5 flex items-start gap-1.5 rounded bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-words leading-tight", children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-32 flex-col items-center justify-center text-muted-foreground/40 gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-6 w-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "No items" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: cart.map((item, index) => {
        const isService = item.type === "service";
        const name = isService ? item.service?.name : item.product?.name;
        const price = isService ? item.service?.price ?? 0 : item.product?.sellingPrice ?? 0;
        const lineTotal = isService && item.service?.pricingType === "hourly" && item.hours ? price * item.hours : price * item.quantity;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors
                        ${isService ? "bg-blue-500/[0.04] hover:bg-blue-500/[0.08]" : "hover:bg-muted/50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  isService && /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-2.5 w-2.5 text-blue-500 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatCurrency2(price) }),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
                    "SN:",
                    item.serialNumber
                  ] }),
                  isService && item.service?.pricingType === "hourly" && item.hours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    item.hours,
                    "hr",
                    item.hours > 1 ? "s" : ""
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 shrink-0", children: [
                (item.type === "product" && !item.serialNumber || isService && item.service?.pricingType !== "hourly") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "flex h-5 w-5 items-center justify-center rounded border border-border/60 text-muted-foreground hover:bg-muted transition-colors",
                      onClick: () => updateQuantity(item.type, isService ? item.service.id : item.product.id, -1),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-2.5 w-2.5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 text-center text-[11px] font-bold tabular-nums", children: item.quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "flex h-5 w-5 items-center justify-center rounded border border-border/60 text-muted-foreground hover:bg-muted transition-colors",
                      onClick: () => updateQuantity(item.type, isService ? item.service.id : item.product.id, 1),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-2.5 w-2.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "ml-0.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors",
                    onClick: () => removeFromCart(item.type, isService ? item.service.id : item.product.id, item.serialNumber),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-2.5 w-2.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-right text-[11px] font-semibold tabular-nums shrink-0", children: formatCurrency2(lineTotal) })
            ]
          },
          `${item.type}-${isService ? item.service?.id : item.product?.id}-${item.serialNumber || index}`
        );
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-muted/20 px-3 py-2 space-y-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatCurrency2(subtotal) })
        ] }),
        discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-green-600 dark:text-green-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums", children: [
            "-",
            formatCurrency2(discount)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs cursor-help", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [
              taxSettings.taxName || "GST",
              taxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] opacity-60", children: [
                "(",
                taxRate,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-emerald-600 dark:text-emerald-400", children: formatCurrency2(taxAmount) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "left", className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              taxSettings.taxName || "GST",
              " Details"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rate:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                taxRate,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Taxable Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency2(taxableAmount) })
            ] }),
            taxSettings.taxNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tax ID:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: taxSettings.taxNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency2(taxAmount) })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-baseline pt-1 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold tabular-nums", children: formatCurrency2(total) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-1 pt-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              disabled: cart.length === 0,
              onClick: () => {
                setPaymentMethod("cash");
                setAddToReceivable(false);
                setShowPaymentDialog(true);
              },
              className: "flex flex-col items-center gap-0.5 rounded-md border border-border bg-card py-1.5 text-[10px] font-medium hover:border-green-500/50 hover:bg-green-500/5 disabled:opacity-30 disabled:pointer-events-none transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4 text-green-600 dark:text-green-400" }),
                "Cash"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              disabled: cart.length === 0,
              onClick: () => {
                setPaymentMethod("card");
                setAmountPaid(total.toString());
                setAddToReceivable(false);
                setShowPaymentDialog(true);
              },
              className: "flex flex-col items-center gap-0.5 rounded-md border border-border bg-card py-1.5 text-[10px] font-medium hover:border-blue-500/50 hover:bg-blue-500/5 disabled:opacity-30 disabled:pointer-events-none transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
                "Card"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              disabled: cart.length === 0,
              onClick: () => {
                setPaymentMethod("mobile");
                setAmountPaid(total.toString());
                setAddToReceivable(false);
                setShowPaymentDialog(true);
              },
              className: "flex flex-col items-center gap-0.5 rounded-md border border-border bg-card py-1.5 text-[10px] font-medium hover:border-purple-500/50 hover:bg-purple-500/5 disabled:opacity-30 disabled:pointer-events-none transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" }),
                "Mobile"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              disabled: cart.length === 0,
              onClick: () => {
                setPaymentMethod("cod");
                setAmountPaid(total.toString());
                setAddToReceivable(false);
                setShowPaymentDialog(true);
              },
              className: "flex flex-col items-center gap-0.5 rounded-md border border-border bg-card py-1.5 text-[10px] font-medium hover:border-amber-500/50 hover:bg-amber-500/5 disabled:opacity-30 disabled:pointer-events-none transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
                "COD"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              disabled: cart.length === 0,
              onClick: () => {
                setPaymentMethod("receivable");
                setAmountPaid("0");
                setAddToReceivable(false);
                setShowPaymentDialog(true);
              },
              className: "flex flex-col items-center gap-0.5 rounded-md border border-border bg-card py-1.5 text-[10px] font-medium hover:border-orange-500/50 hover:bg-orange-500/5 disabled:opacity-30 disabled:pointer-events-none transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-orange-600 dark:text-orange-400" }),
                "Credit"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCustomerDialog, onOpenChange: (open) => {
      setShowCustomerDialog(open);
      if (!open) {
        setShowQuickAddCustomer(false);
        setQuickAddFirstName("");
        setQuickAddLastName("");
        setQuickAddPhone("");
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Select Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Search from ",
          allCustomers.length,
          " customers or continue without one"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: showQuickAddCustomer ? "default" : "outline",
              size: "icon",
              onClick: () => setShowQuickAddCustomer(!showQuickAddCustomer),
              title: "Quick add new customer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" })
            }
          )
        ] }),
        showQuickAddCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
            "Quick Add Customer"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quick-first-name", className: "text-xs", children: "First Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "quick-first-name",
                  value: quickAddFirstName,
                  onChange: (e) => setQuickAddFirstName(e.target.value),
                  placeholder: "First name",
                  className: "h-8 text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quick-last-name", className: "text-xs", children: "Last Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "quick-last-name",
                  value: quickAddLastName,
                  onChange: (e) => setQuickAddLastName(e.target.value),
                  placeholder: "Last name",
                  className: "h-8 text-sm"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quick-phone", className: "text-xs", children: "Phone (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "quick-phone",
                value: quickAddPhone,
                onChange: (e) => setQuickAddPhone(e.target.value),
                placeholder: "Phone number",
                className: "h-8 text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "w-full",
              disabled: !quickAddFirstName.trim() || !quickAddLastName.trim() || isCreatingCustomer,
              onClick: async () => {
                try {
                  setIsCreatingCustomer(true);
                  const result = await window.api.customers.create({
                    firstName: quickAddFirstName.trim(),
                    lastName: quickAddLastName.trim(),
                    phone: quickAddPhone.trim() || null
                  });
                  if (result?.success && result.data) {
                    setSelectedCustomer(result.data);
                    setShowCustomerDialog(false);
                    setShowQuickAddCustomer(false);
                    setQuickAddFirstName("");
                    setQuickAddLastName("");
                    setQuickAddPhone("");
                    setCustomerSearch("");
                    loadAllCustomers();
                  } else {
                    alert(result?.message || "Failed to create customer.");
                  }
                } catch (error2) {
                  console.error("Quick add customer failed:", error2);
                  alert("Failed to create customer. Please try again.");
                } finally {
                  setIsCreatingCustomer(false);
                }
              },
              children: [
                isCreatingCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-2" }),
                "Add & Select Customer"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "More details can be added later from the Customers tab." })
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
        )) }) : customerSearch ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full items-center justify-center p-8 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground", children: [
            'No customers found for "',
            customerSearch,
            '"'
          ] }),
          !showQuickAddCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setShowQuickAddCustomer(true),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-2" }),
                "Add New Customer"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "No customers available" }) }) }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showHoursDialog, onOpenChange: setShowHoursDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enter Service Hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          pendingHourlyService?.name,
          " is charged at ",
          formatCurrency2(pendingHourlyService?.price ?? 0),
          "/hour"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "hours", children: "Number of Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "hours",
              type: "number",
              step: "0.5",
              min: "0.5",
              value: serviceHours,
              onChange: (e) => setServiceHours(e.target.value),
              placeholder: "Enter hours"
            }
          )
        ] }),
        parseFloat(serviceHours) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-700", children: [
          "Total: ",
          formatCurrency2((pendingHourlyService?.price ?? 0) * parseFloat(serviceHours))
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowHoursDialog(false);
          setPendingHourlyService(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addHourlyServiceToCart, disabled: !serviceHours || parseFloat(serviceHours) <= 0, children: "Add to Cart" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPaymentDialog, onOpenChange: setShowPaymentDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md p-0 gap-0 border-border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold tracking-wider uppercase", children: "Complete Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-slate-400 mt-0.5 capitalize", children: [
            paymentMethod === "receivable" ? "Pay Later" : paymentMethod,
            " Payment"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] text-slate-500 uppercase tracking-wider", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold font-mono tabular-nums", children: formatCurrency2(total) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "sr-only", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Complete Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Payment details" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4 max-h-[60vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/20 p-3 bg-amber-500/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-4 w-4 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-code", className: "font-medium text-amber-400", children: "Voucher Code" })
          ] }),
          appliedVoucher ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md bg-amber-500/15 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-foreground", children: [
                "Voucher Applied: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: appliedVoucher.code })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs bg-amber-500/20 text-amber-400 border-amber-500/30", children: [
                formatCurrency2(appliedVoucher.discountAmount),
                " off"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-6 w-6",
                onClick: removeVoucher,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "voucher-code",
                value: voucherCode,
                onChange: (e) => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setVoucherError("");
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    validateVoucher();
                  }
                },
                placeholder: "Enter voucher code",
                className: "bg-background font-mono",
                maxLength: 10
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: validateVoucher,
                disabled: isValidatingVoucher || !voucherCode.trim(),
                children: isValidatingVoucher ? "Checking..." : "Apply"
              }
            )
          ] }),
          voucherError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 mt-2", children: voucherError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-green-500/20 p-3 bg-green-500/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "discount", className: "font-medium text-green-400", children: "Apply Discount" })
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
              className: "bg-background",
              disabled: !!appliedVoucher
            }
          ),
          discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-400 mt-2", children: [
            "Discount: ",
            formatCurrency2(discount),
            " | New Total: ",
            formatCurrency2(total)
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
            formatCurrency2(parseFloat(amountPaid) - total)
          ] }),
          parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-400", children: "Partial Payment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-400/80", children: [
                "Remaining: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatCurrency2(total - parseFloat(amountPaid)) }),
                " will be added to Account Receivables."
              ] }),
              !selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-red-600 font-medium", children: "Please select a customer for partial payment!" })
            ] })
          ] }) })
        ] }),
        paymentMethod === "card" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-800 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-blue-900 dark:text-blue-100", children: "Card Payment" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowCardDialog(true),
                className: "border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/50",
                children: isCardFormValid ? "Edit Details" : "Add Details"
              }
            )
          ] }),
          isCardFormValid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-900 dark:text-blue-100", children: cardHolderName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-900 dark:text-blue-100 font-mono", children: [
                "**** **** **** ",
                cardLastFourDigits
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Please add card details to continue" })
          ] })
        ] }),
        paymentMethod === "mobile" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 dark:border-purple-800 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-purple-900 dark:text-purple-100", children: "Mobile Payment" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowMobileDialog(true),
                className: "border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/50",
                children: isMobileFormValid ? "Edit Details" : "Add Details"
              }
            )
          ] }),
          isMobileFormValid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", children: mobileProviderLabels[mobileProvider] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-purple-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-purple-900 dark:text-purple-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "To:" }),
                " ",
                mobileReceiverPhone
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-purple-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-purple-900 dark:text-purple-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "From:" }),
                " ",
                mobileSenderPhone
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 pt-1 border-t border-purple-200 dark:border-purple-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-purple-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-purple-900 dark:text-purple-100 font-mono", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "TxID:" }),
                " ",
                mobileTransactionId
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Please add payment details to continue" })
          ] })
        ] }),
        paymentMethod === "cod" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-amber-500/20 bg-amber-500/5 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Cash on Delivery" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowCodDialog(true),
                className: "border-amber-500/30 hover:bg-amber-500/10",
                children: isCodFormValid ? "Edit Details" : "Add Details"
              }
            )
          ] }),
          isCodFormValid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-amber-500 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: codName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-amber-500 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: codPhone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-amber-500 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                codAddress,
                ", ",
                codCity
              ] })
            ] }),
            codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 pt-1 border-t border-amber-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-amber-500 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium", children: [
                "Delivery: ",
                formatCurrency2(codChargesNum)
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Please add delivery details to continue" })
          ] })
        ] }),
        (paymentMethod === "receivable" || addToReceivable) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 text-yellow-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Payment will be recorded as receivable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
              "The full amount (",
              formatCurrency2(total),
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-border/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "flex-1 h-10", onClick: () => setShowPaymentDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "flex-[2] h-10 font-semibold",
            onClick: processPayment,
            disabled: isProcessing || paymentMethod === "cash" && !addToReceivable && (parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) < total && !selectedCustomer) || paymentMethod === "receivable" && !selectedCustomer || addToReceivable && !selectedCustomer && paymentMethod !== "cod" || addToReceivable && !selectedCustomer && paymentMethod === "cod" && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) || paymentMethod === "cod" && !addToReceivable && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) || paymentMethod === "mobile" && !addToReceivable && !isMobileFormValid || paymentMethod === "card" && !addToReceivable && !isCardFormValid,
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
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCodDialog, onOpenChange: setShowCodDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "pb-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl", children: "Cash on Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter delivery details for COD payment" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-100 dark:border-blue-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-charges-dialog", className: "flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
            "Delivery Charges (Optional)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "cod-charges-dialog",
              type: "number",
              step: "0.01",
              min: "0",
              value: codCharges,
              onChange: (e) => setCodCharges(e.target.value),
              placeholder: "0.00",
              className: "text-lg font-semibold bg-background border-blue-500/20 focus:ring-blue-500"
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-name-dialog", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Full Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-name-dialog",
                value: codName,
                onChange: (e) => setCodName(e.target.value),
                placeholder: "Enter customer's full name",
                className: !codName.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-phone-dialog", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Phone Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-phone-dialog",
                value: codPhone,
                onChange: (e) => setCodPhone(e.target.value),
                placeholder: "Enter contact number",
                className: !codPhone.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-address-dialog", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Delivery Address ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-address-dialog",
                value: codAddress,
                onChange: (e) => setCodAddress(e.target.value),
                placeholder: "Enter complete delivery address",
                className: !codAddress.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cod-city-dialog", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "City ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cod-city-dialog",
                value: codCity,
                onChange: (e) => setCodCity(e.target.value),
                placeholder: "Enter city name",
                className: !codCity.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] })
        ] }),
        codChargesNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Order Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency2(subtotal - discount + taxAmount) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-amber-600 dark:text-amber-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Delivery Charges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency2(codChargesNum) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total to Collect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: formatCurrency2(total) })
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
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showMobileDialog, onOpenChange: setShowMobileDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "pb-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl", children: "Mobile Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter mobile payment details" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            "Payment Provider ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: mobileProvider,
              onValueChange: (value) => setMobileProvider(value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select provider" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "jazzcash", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-red-500" }),
                    "JazzCash"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "easypaisa", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-green-500" }),
                    "Easypaisa"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "nayapay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-blue-500" }),
                    "NayaPay"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sadapay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-purple-500" }),
                    "SadaPay"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-gray-500" }),
                    "Other"
                  ] }) })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-muted-foreground uppercase tracking-wide", children: "Payment Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "mobile-receiver-phone", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Receiver Phone Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "mobile-receiver-phone",
                value: mobileReceiverPhone,
                onChange: (e) => setMobileReceiverPhone(e.target.value),
                placeholder: "Phone number where payment is sent",
                className: !mobileReceiverPhone.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Your account number receiving the payment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "mobile-sender-phone", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Sender Phone Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "mobile-sender-phone",
                value: mobileSenderPhone,
                onChange: (e) => setMobileSenderPhone(e.target.value),
                placeholder: "Customer's phone number",
                className: !mobileSenderPhone.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Customer's account number sending the payment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "mobile-transaction-id", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Transaction ID ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "mobile-transaction-id",
                value: mobileTransactionId,
                onChange: (e) => setMobileTransactionId(e.target.value),
                placeholder: "Enter transaction ID",
                className: `font-mono ${!mobileTransactionId.trim() ? "border-red-200 focus:ring-red-500" : ""}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Transaction reference from payment confirmation" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Payment Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: formatCurrency2(total) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleMobileCancel, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleMobileSave,
            disabled: !isMobileFormValid,
            className: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
              "Confirm Payment"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCardDialog, onOpenChange: setShowCardDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "pb-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl", children: "Card Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter card payment details (non-sensitive info only)" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "card-holder-name", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Card Holder Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "card-holder-name",
                value: cardHolderName,
                onChange: (e) => setCardHolderName(e.target.value),
                placeholder: "Enter name on card",
                className: !cardHolderName.trim() ? "border-red-200 focus:ring-red-500" : ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "card-last-four", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Last 4 Digits of Card ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-mono", children: "**** **** ****" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "card-last-four",
                  value: cardLastFourDigits,
                  onChange: (e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setCardLastFourDigits(value);
                  },
                  placeholder: "1234",
                  maxLength: 4,
                  className: `w-20 font-mono text-center ${cardLastFourDigits.length !== 4 ? "border-red-200 focus:ring-red-500" : ""}`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Only last 4 digits for reference - no sensitive data stored" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Payment Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: formatCurrency2(total) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCardCancel, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleCardSave,
            disabled: !isCardFormValid,
            className: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
              "Confirm Payment"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReceiptPreview,
      {
        open: showReceiptPreview,
        onClose: () => {
          setShowReceiptPreview(false);
          setCompletedSaleId(null);
          setCompletedReceiptPath(void 0);
        },
        saleId: completedSaleId,
        receiptPath: completedReceiptPath
      }
    )
  ] });
}
export {
  POSScreen
};
