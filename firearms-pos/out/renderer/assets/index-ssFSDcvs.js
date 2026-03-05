import { o as useBranch, p as useCurrency, G as useCurrentBranchSettings, r as reactExports, j as jsxRuntimeExports, t as Tabs, v as TabsList, w as TabsTrigger, P as Package, W as Wrench, H as TabsContent, I as Input, C as Card, e as CardContent, J as ScrollArea, K as Plus, M as Badge, O as Clock, b as CardHeader, c as CardTitle, B as Button, U as User, X, Q as CircleAlert, V as Trash2, A as Percent, Y as Separator, l as Banknote, Z as CreditCard, _ as Dialog, $ as DialogContent, a0 as DialogHeader, a1 as DialogTitle, a2 as DialogDescription, L as Label, a3 as DialogFooter, a4 as Ticket, a5 as Phone, R as Receipt, T as Truck, D as DollarSign, a6 as Building2, a7 as Select, a8 as SelectTrigger, a9 as SelectValue, aa as SelectContent, ab as SelectItem } from "./index-DxR6cCU2.js";
import { C as Checkbox } from "./checkbox-F_DTTMFI.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-ByDwjxl_.js";
import { S as Search } from "./search-BVBJXGCU.js";
import { M as Minus } from "./minus-CkUXlOOH.js";
import { S as Smartphone } from "./smartphone-CVy1EDgS.js";
import { C as CircleCheck } from "./circle-check-CXCvS3is.js";
import { M as MapPin } from "./map-pin-BW2cMPzc.js";
function POSScreen() {
  const { currentBranch } = useBranch();
  const { formatCurrency } = useCurrency();
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
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const [showSerialDialog, setShowSerialDialog] = reactExports.useState(false);
  const [pendingSerialProduct, setPendingSerialProduct] = reactExports.useState(null);
  const [serialNumber, setSerialNumber] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("cash");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [addToReceivable, setAddToReceivable] = reactExports.useState(false);
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
      } else {
        actualAmountPaid = total;
      }
      const remainingAmount = total - actualAmountPaid;
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), className: "flex flex-col h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-4 grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "products", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
          "Products"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "services", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-4 w-4" }),
          "Services"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "products", className: "flex-1 flex flex-col mt-0", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 h-full", children: isLoadingProducts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : filteredProducts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(100vh-24rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filteredProducts.map((item) => {
          const cartItem = cart.find((c) => c.type === "product" && c.product?.id === item.product.id);
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "services", className: "flex-1 flex flex-col mt-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search services by name, code, or description...",
              value: serviceSearchQuery,
              onChange: (e) => setServiceSearchQuery(e.target.value),
              className: "pl-9 text-lg"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 h-full", children: isLoadingServices ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : filteredServices.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(100vh-24rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filteredServices.map((service) => {
          const cartItem = cart.find((c) => c.type === "service" && c.service?.id === service.id);
          const inCartQty = cartItem?.quantity ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => addServiceToCart(service),
              className: "relative flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent hover:shadow-md group border-blue-200 bg-blue-50/30",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-12 w-12 text-blue-600", strokeWidth: 3 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-1 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] bg-blue-100 text-blue-700 border-blue-300 px-1.5 py-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-2.5 w-2.5 mr-0.5" }),
                    "Service"
                  ] }),
                  service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5 mr-0.5" }),
                    "Hourly"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium break-words whitespace-normal leading-tight text-sm", children: service.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: service.code })
                ] }),
                service.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2 line-clamp-2", children: service.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2 border-t", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-blue-700", children: [
                    formatCurrency(service.price),
                    service.pricingType === "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal", children: "/hr" })
                  ] }),
                  inCartQty > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "text-xs bg-blue-600", children: [
                    inCartQty,
                    " in cart"
                  ] })
                ] })
              ]
            },
            service.id
          );
        }) }) }) : serviceSearchQuery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-12 w-12 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            'No services found for "',
            serviceSearchQuery,
            '"'
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-12 w-12 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No services available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Add services in the Services section first" })
        ] }) }) })
      ] })
    ] }) }),
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
            className: `flex items-center gap-2 rounded-lg border p-2 ${item.type === "service" ? "border-blue-200 bg-blue-50/30" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  item.type === "service" && /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-3 w-3 text-blue-600 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm leading-tight break-words", children: item.type === "product" ? item.product?.name : item.service?.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: item.type === "product" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  formatCurrency(item.product?.sellingPrice ?? 0),
                  item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
                    "SN: ",
                    item.serialNumber
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  formatCurrency(item.service?.price ?? 0),
                  item.service?.pricingType === "hourly" && item.hours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
                    "× ",
                    item.hours,
                    " hr",
                    item.hours > 1 ? "s" : ""
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                item.type === "product" && !item.serialNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "icon",
                      className: "h-6 w-6",
                      onClick: () => updateQuantity("product", item.product.id, -1),
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
                      onClick: () => updateQuantity("product", item.product.id, 1),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                item.type === "service" && item.service?.pricingType !== "hourly" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "icon",
                      className: "h-6 w-6",
                      onClick: () => updateQuantity("service", item.service.id, -1),
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
                      onClick: () => updateQuantity("service", item.service.id, 1),
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
                    onClick: () => removeFromCart(
                      item.type,
                      item.type === "product" ? item.product.id : item.service.id,
                      item.serialNumber
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] })
            ]
          },
          `${item.type}-${item.type === "product" ? item.product?.id : item.service?.id}-${item.serialNumber || index}`
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm cursor-help group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-3.5 w-3.5 text-emerald-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: taxSettings.taxName || "GST" }),
                taxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "(",
                  taxRate,
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-emerald-600 group-hover:text-emerald-700", children: formatCurrency(taxAmount) })
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
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(taxableAmount) })
              ] }),
              taxSettings.taxNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tax ID:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: taxSettings.taxNumber })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax Amount:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(taxAmount) })
              ] })
            ] }) })
          ] }) }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showHoursDialog, onOpenChange: setShowHoursDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enter Service Hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          pendingHourlyService?.name,
          " is charged at ",
          formatCurrency(pendingHourlyService?.price ?? 0),
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
          formatCurrency((pendingHourlyService?.price ?? 0) * parseFloat(serviceHours))
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 bg-amber-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-4 w-4 text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "voucher-code", className: "font-medium text-amber-800", children: "Voucher Code" })
          ] }),
          appliedVoucher ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md bg-amber-100 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
                "Voucher Applied: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: appliedVoucher.code })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                formatCurrency(appliedVoucher.discountAmount),
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
                className: "bg-white font-mono",
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
              className: "bg-white",
              disabled: !!appliedVoucher
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
        paymentMethod === "cod" && !addToReceivable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 p-4 space-y-3", children: [
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal - discount + taxAmount) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-amber-600 dark:text-amber-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Delivery Charges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(codChargesNum) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total to Collect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: formatCurrency(total) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: formatCurrency(total) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: formatCurrency(total) })
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
    ] }) })
  ] });
}
export {
  POSScreen
};
