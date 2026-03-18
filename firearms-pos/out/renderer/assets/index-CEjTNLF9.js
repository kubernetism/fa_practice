import { h as createLucideIcon, j as jsxRuntimeExports, ax as Building2, aQ as Sparkles, aL as Shield, aR as useSetup, L as Label, I as Input, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, aC as Textarea, B as Button, aM as Copy, at as UserPlus, u as useNavigate, r as reactExports, C as Card, e as CardContent, aE as ChevronRight, w as LoaderCircle, x as Check } from "./index-PBsCfLo2.js";
import { M as MapPin } from "./map-pin-Uo9O-l2L.js";
import { R as RefreshCw } from "./refresh-cw-Cx8B1de5.js";
import { C as ChevronLeft } from "./chevron-left-Dt_Fzeez.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Crosshair = createLucideIcon("Crosshair", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }]
]);
function WelcomeStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-12 h-12 text-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Welcome to Firearms POS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground max-w-md mx-auto", children: "Your complete Point of Sale solution for firearms retail management" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center p-4 rounded-lg bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 text-primary mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Multi-Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Manage multiple store locations" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center p-4 rounded-lg bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-8 h-8 text-primary mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Easy to Use" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Intuitive interface for daily operations" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center p-4 rounded-lg bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 text-primary mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Secure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Role-based access control & audit logs" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block p-4 rounded-lg bg-primary/5 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "This wizard will help you configure your business settings in just a few steps.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Next" }),
      " to get started."
    ] }) }) })
  ] });
}
const BUSINESS_TYPES = ["Retail", "Wholesale", "Mixed"];
function BusinessInfoStep() {
  const { businessInfo, updateBusinessInfo } = useSetup();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Business Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your business details" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "businessName", children: [
          "Business Name ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "businessName",
            placeholder: "Enter your business name",
            value: businessInfo.businessName,
            onChange: (e) => updateBusinessInfo({ businessName: e.target.value }),
            autoComplete: "off",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessRegistrationNo", children: "Registration Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessRegistrationNo",
              placeholder: "Business registration number",
              value: businessInfo.businessRegistrationNo,
              onChange: (e) => updateBusinessInfo({ businessRegistrationNo: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessType", children: "Business Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: businessInfo.businessType,
              onValueChange: (value) => updateBusinessInfo({ businessType: value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select business type" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BUSINESS_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: type }, type)) })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessAddress", children: "Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "businessAddress",
            placeholder: "Enter your business address",
            value: businessInfo.businessAddress,
            onChange: (e) => updateBusinessInfo({ businessAddress: e.target.value }),
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCity", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessCity",
              placeholder: "City",
              value: businessInfo.businessCity,
              onChange: (e) => updateBusinessInfo({ businessCity: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessState", children: "State/Province" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessState",
              placeholder: "State",
              value: businessInfo.businessState,
              onChange: (e) => updateBusinessInfo({ businessState: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCountry", children: "Country" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessCountry",
              placeholder: "Country",
              value: businessInfo.businessCountry,
              onChange: (e) => updateBusinessInfo({ businessCountry: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessPhone", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessPhone",
              placeholder: "Business phone number",
              value: businessInfo.businessPhone,
              onChange: (e) => updateBusinessInfo({ businessPhone: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessEmail", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "businessEmail",
              type: "email",
              placeholder: "Business email address",
              value: businessInfo.businessEmail,
              onChange: (e) => updateBusinessInfo({ businessEmail: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessWebsite", children: "Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "businessWebsite",
            placeholder: "https://www.example.com",
            value: businessInfo.businessWebsite,
            onChange: (e) => updateBusinessInfo({ businessWebsite: e.target.value })
          }
        )
      ] })
    ] })
  ] });
}
const COMMON_CURRENCIES = [
  { code: "PKR", symbol: "Rs.", name: "Pakistani Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" }
];
const CURRENCY_POSITIONS = [
  { value: "prefix", label: "Before amount (e.g., Rs.100)" },
  { value: "suffix", label: "After amount (e.g., 100 Rs.)" }
];
function BranchTaxStep() {
  const {
    branchInfo,
    updateBranchInfo,
    taxCurrencyInfo,
    updateTaxCurrencyInfo,
    businessInfo,
    generateBranchCode
  } = useSetup();
  const handleRegenerateCode = async () => {
    if (businessInfo.businessName) {
      const code = await generateBranchCode(businessInfo.businessName);
      if (code) {
        updateBranchInfo({ code });
      }
    }
  };
  const handleCopyFromBusiness = () => {
    updateBranchInfo({
      address: businessInfo.businessAddress,
      phone: businessInfo.businessPhone,
      email: businessInfo.businessEmail
    });
  };
  const handleCurrencyChange = (code) => {
    const currency = COMMON_CURRENCIES.find((c) => c.code === code);
    if (currency) {
      updateTaxCurrencyInfo({
        currencyCode: currency.code,
        currencySymbol: currency.symbol
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Branch & Financial Setup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Configure your primary location and financial settings" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm", children: "This will be your main branch. You can add more branches later from the settings." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "branchName", children: [
            "Branch Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "branchName",
              placeholder: "Main Store",
              value: branchInfo.name,
              onChange: (e) => updateBranchInfo({ name: e.target.value }),
              autoComplete: "off",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "branchCode", children: [
            "Branch Code ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "branchCode",
                placeholder: "MAIN01",
                value: branchInfo.code,
                onChange: (e) => updateBranchInfo({ code: e.target.value.toUpperCase() }),
                className: "uppercase",
                required: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon",
                onClick: handleRegenerateCode,
                title: "Regenerate code",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Unique identifier for this branch (auto-generated)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: handleCopyFromBusiness, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-1" }),
        "Copy from Business Info"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchAddress", children: "Branch Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "branchAddress",
            placeholder: "Enter branch address",
            value: branchInfo.address,
            onChange: (e) => updateBranchInfo({ address: e.target.value }),
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchPhone", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "branchPhone",
              placeholder: "Branch phone number",
              value: branchInfo.phone,
              onChange: (e) => updateBranchInfo({ phone: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchEmail", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "branchEmail",
              type: "email",
              placeholder: "Branch email address",
              value: branchInfo.email,
              onChange: (e) => updateBranchInfo({ email: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "licenseNumber", children: "Firearms License Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "licenseNumber",
            placeholder: "FFL-XXXXXXXX",
            value: branchInfo.licenseNumber,
            onChange: (e) => updateBranchInfo({ licenseNumber: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Federal Firearms License (FFL) number for this location" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-6 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-muted-foreground uppercase tracking-wide", children: "Currency" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyCode", children: "Currency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: taxCurrencyInfo.currencyCode, onValueChange: handleCurrencyChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select currency" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMMON_CURRENCIES.map((currency) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: currency.code, children: [
              currency.code,
              " - ",
              currency.name
            ] }, currency.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencySymbol", children: "Symbol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "currencySymbol",
              placeholder: "Rs.",
              value: taxCurrencyInfo.currencySymbol,
              onChange: (e) => updateTaxCurrencyInfo({ currencySymbol: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyPosition", children: "Symbol Position" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: taxCurrencyInfo.currencyPosition,
              onValueChange: (value) => updateTaxCurrencyInfo({ currencyPosition: value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CURRENCY_POSITIONS.map((pos) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: pos.value, children: pos.label }, pos.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "decimalPlaces", children: "Decimal Places" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: String(taxCurrencyInfo.decimalPlaces),
              onValueChange: (value) => updateTaxCurrencyInfo({ decimalPlaces: parseInt(value) }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "0 (e.g., Rs.100)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 (e.g., Rs.100.00)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 (e.g., Rs.100.000)" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/50 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Preview: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-lg", children: taxCurrencyInfo.currencyPosition === "prefix" ? `${taxCurrencyInfo.currencySymbol}1,234${taxCurrencyInfo.decimalPlaces > 0 ? "." + "0".repeat(taxCurrencyInfo.decimalPlaces) : ""}` : `1,234${taxCurrencyInfo.decimalPlaces > 0 ? "." + "0".repeat(taxCurrencyInfo.decimalPlaces) : ""} ${taxCurrencyInfo.currencySymbol}` })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-muted-foreground uppercase tracking-wide", children: "Tax Configuration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxName", children: "Tax Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "taxName",
              placeholder: "GST",
              value: taxCurrencyInfo.taxName,
              onChange: (e) => updateTaxCurrencyInfo({ taxName: e.target.value }),
              autoComplete: "off"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", children: "Tax Rate (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "taxRate",
              type: "number",
              min: "0",
              max: "100",
              step: "0.01",
              placeholder: "0",
              value: taxCurrencyInfo.taxRate,
              onChange: (e) => updateTaxCurrencyInfo({ taxRate: parseFloat(e.target.value) || 0 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxId", children: "Tax ID / EIN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "taxId",
              placeholder: "Tax identification number",
              value: taxCurrencyInfo.taxId,
              onChange: (e) => updateTaxCurrencyInfo({ taxId: e.target.value })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function AdminAccountStep() {
  const { adminAccountInfo, updateAdminAccountInfo } = useSetup();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Create Admin Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Set up your administrator credentials" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm", children: "This will be the main administrator account. You can add more users after setup is complete." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "fullName", children: [
            "Full Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "fullName",
              placeholder: "Enter your full name",
              value: adminAccountInfo.fullName,
              onChange: (e) => updateAdminAccountInfo({ fullName: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "username", children: [
            "Username ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "username",
              placeholder: "admin",
              value: adminAccountInfo.username,
              onChange: (e) => updateAdminAccountInfo({ username: e.target.value }),
              autoComplete: "off",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "admin@yourstore.com",
              value: adminAccountInfo.email,
              onChange: (e) => updateAdminAccountInfo({ email: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "phone",
              placeholder: "Phone number",
              value: adminAccountInfo.phone,
              onChange: (e) => updateAdminAccountInfo({ phone: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "password", children: [
            "Password ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "password",
              type: "password",
              placeholder: "Minimum 6 characters",
              value: adminAccountInfo.password,
              onChange: (e) => updateAdminAccountInfo({ password: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "confirmPassword", children: [
            "Confirm Password ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "confirmPassword",
              type: "password",
              placeholder: "Re-enter password",
              value: adminAccountInfo.confirmPassword,
              onChange: (e) => updateAdminAccountInfo({ confirmPassword: e.target.value }),
              required: true
            }
          )
        ] })
      ] }),
      adminAccountInfo.password.length > 0 && adminAccountInfo.confirmPassword.length > 0 && adminAccountInfo.password !== adminAccountInfo.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Passwords do not match" })
    ] })
  ] });
}
const STEPS = [
  { number: 1, title: "Welcome", description: "Getting Started" },
  { number: 2, title: "Business", description: "Business Information" },
  { number: 3, title: "Branch & Tax", description: "Branch & Financial Setup" },
  { number: 4, title: "Admin Account", description: "Create Admin User" }
];
function StepIndicator({
  step,
  currentStep
}) {
  const isCompleted = currentStep > step.number;
  const isCurrent = currentStep === step.number;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted ? "bg-primary border-primary text-primary-foreground" : isCurrent ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"}`,
        children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5" }) : step.number
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 hidden sm:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: `text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`,
          children: step.title
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: step.description })
    ] })
  ] });
}
function SetupWizardScreen() {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, completeSetup, isLoading, error, businessInfo, adminAccountInfo } = useSetup();
  const canProceed = reactExports.useCallback(() => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return businessInfo.businessName.trim() !== "";
      case 3:
        return true;
      case 4:
        return adminAccountInfo.fullName.trim() !== "" && adminAccountInfo.username.trim() !== "" && adminAccountInfo.password.length >= 6 && adminAccountInfo.password === adminAccountInfo.confirmPassword;
      default:
        return true;
    }
  }, [currentStep, businessInfo.businessName, adminAccountInfo]);
  const handleNext = reactExports.useCallback(() => {
    if (currentStep < 4 && canProceed()) {
      nextStep();
    }
  }, [currentStep, canProceed, nextStep]);
  const handlePrev = reactExports.useCallback(() => {
    if (currentStep > 1) {
      prevStep();
    }
  }, [currentStep, prevStep]);
  const handleComplete = reactExports.useCallback(async () => {
    const success = await completeSetup();
    if (success) {
      navigate("/login");
    }
  }, [completeSetup, navigate]);
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeStep, {});
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessInfoStep, {});
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BranchTaxStep, {});
      case 4:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminAccountStep, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeStep, {});
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl mx-auto px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-2 overflow-x-auto pb-2", children: STEPS.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { step, currentStep }),
      index < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `hidden sm:block w-12 h-0.5 mx-2 ${currentStep > step.number ? "bg-primary" : "bg-muted-foreground/30"}`
        }
      )
    ] }, step.number)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-3xl shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 sm:p-8", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm", children: error }),
      renderStep(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-8 pt-6 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: handlePrev,
            disabled: currentStep === 1 || isLoading,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }),
              "Previous"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Step ",
          currentStep,
          " of ",
          STEPS.length
        ] }) }),
        currentStep < 4 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNext, disabled: !canProceed() || isLoading, children: [
          "Next",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 ml-1" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleComplete, disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Setting up..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 mr-1" }),
          "Complete Setup"
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t bg-background/80 backdrop-blur-sm py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground", children: "Firearms POS - Initial Setup Wizard" }) })
  ] });
}
export {
  SetupWizardScreen
};
