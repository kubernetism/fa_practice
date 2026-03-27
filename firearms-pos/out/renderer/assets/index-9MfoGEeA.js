import { r as reactExports, j as jsxRuntimeExports, R as RotateCcw, f as CircleAlert, B as Button, a as LoaderCircle, g as Building2, h as Sparkles, S as Shield, i as useSetup, L as Label, I as Input, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, p as Textarea, M as MapPin, q as RefreshCw, s as Copy, t as UserPlus, u as useNavigate, v as Check, T as ThemeToggle, C as ChevronRight } from "./index-D_bEN21S.js";
import { C as Crosshair } from "./crosshair--GZEgAY4.js";
import { C as CircleCheck } from "./circle-check-DjEhIWd8.js";
import { U as Upload } from "./upload-D_7d7cNy.js";
import { C as ChevronLeft } from "./chevron-left-CsQHKIuE.js";
function WelcomeStep({ onRestoreComplete }) {
  const [isRestoring, setIsRestoring] = reactExports.useState(false);
  const [restoreResult, setRestoreResult] = reactExports.useState(null);
  const handleRestore = async () => {
    setIsRestoring(true);
    setRestoreResult(null);
    try {
      const result = await window.api.backup.import();
      if (result.success) {
        setRestoreResult({ success: true, message: "Database restored successfully. Reloading..." });
        setTimeout(() => {
          onRestoreComplete?.();
        }, 3e3);
      } else {
        if (result.message === "Import cancelled") {
          setRestoreResult(null);
        } else {
          setRestoreResult({ success: false, message: result.message || "Restore failed." });
        }
      }
    } catch (err) {
      setRestoreResult({
        success: false,
        message: `Restore failed: ${err instanceof Error ? err.message : "Unknown error"}`
      });
    } finally {
      setIsRestoring(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight text-foreground", children: "Welcome to Your POS System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Complete Point of Sale & Inventory Management" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border-2 border-dashed border-primary/25 bg-primary/[0.03] p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Restore from Backup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Have an existing database backup? Restore it to skip the setup process and continue where you left off. A safety backup of the current state will be created automatically." }),
        restoreResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs ${restoreResult.success ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`,
            children: [
              restoreResult.success ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: restoreResult.message })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleRestore,
            disabled: isRestoring || restoreResult?.success,
            className: "mt-3 gap-2 text-xs border-primary/30 hover:bg-primary/5",
            children: isRestoring ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
              "Restoring..."
            ] }) : restoreResult?.success ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
              "Restored — Redirecting..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
              "Select Backup File"
            ] })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-border/50" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50", children: "Or start fresh" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-foreground", children: "Multi-Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed mt-0.5", children: "Manage multiple store locations with centralized control" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-foreground", children: "Easy to Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed mt-0.5", children: "Intuitive interface designed for daily operations" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-foreground", children: "Secure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed mt-0.5", children: "Role-based access control & comprehensive audit logs" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted/30 border border-border/30 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
      "This wizard will guide you through configuring your business details, setting up your primary branch, and creating an admin account. Click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Next" }),
      " to begin the fresh setup."
    ] }) })
  ] });
}
const BUSINESS_TYPES = ["Retail", "Wholesale", "Mixed"];
function BusinessInfoStep() {
  const { businessInfo, updateBusinessInfo } = useSetup();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4.5 w-4.5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight", children: "Business Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter your business details" })
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4.5 w-4.5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight", children: "Branch & Financial Setup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Configure your primary location and financial settings" })
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4.5 w-4.5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight", children: "Create Admin Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Set up your administrator credentials" })
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
  { number: 2, title: "Business", description: "Business Details" },
  { number: 3, title: "Branch & Tax", description: "Location & Finance" },
  { number: 4, title: "Admin", description: "Create Admin User" }
];
function SetupWizardScreen() {
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, completeSetup, isLoading, error, businessInfo, adminAccountInfo } = useSetup();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
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
  const handleRestoreComplete = reactExports.useCallback(() => {
    navigate("/login");
  }, [navigate]);
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeStep, { onRestoreComplete: handleRestoreComplete });
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessInfoStep, {});
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BranchTaxStep, {});
      case 4:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminAccountStep, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeStep, { onRestoreComplete: handleRestoreComplete });
    }
  };
  const progressPercent = (currentStep - 1) / (STEPS.length - 1) * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex lg:w-[260px] xl:w-[280px] relative bg-primary flex-col overflow-hidden shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.06]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100%", height: "100%", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pattern", { id: "wizard-grid", width: "40", height: "40", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: "currentColor", strokeWidth: "0.5" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", fill: "url(#wizard-grid)", className: "text-primary-foreground" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col h-full p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mb-10",
            style: {
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
              transitionDelay: "0.1s",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(-12px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 border border-primary-foreground/10 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-primary-foreground tracking-tight", children: "Initial Setup" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary-foreground/50 mt-1", children: "Configure your system" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 space-y-1", children: STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                transitionDelay: `${0.15 + index * 0.08}s`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(-16px)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${isCompleted ? "bg-primary-foreground text-primary" : isCurrent ? "bg-primary-foreground/20 text-primary-foreground ring-2 ring-primary-foreground/40" : "bg-primary-foreground/5 text-primary-foreground/30 border border-primary-foreground/10"}`,
                      children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }) : step.number
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: `text-sm font-medium truncate transition-colors ${isCurrent ? "text-primary-foreground" : isCompleted ? "text-primary-foreground/70" : "text-primary-foreground/30"}`,
                        children: step.title
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: `text-[10px] truncate transition-colors ${isCurrent ? "text-primary-foreground/50" : "text-primary-foreground/20"}`,
                        children: step.description
                      }
                    )
                  ] })
                ] }),
                index < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-[15px] h-4 w-px", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-full w-full transition-colors duration-300 ${currentStep > step.number ? "bg-primary-foreground/40" : "bg-primary-foreground/10"}`
                  }
                ) })
              ]
            },
            step.number
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "text-[10px] text-primary-foreground/25 font-mono",
            style: {
              transition: "opacity 0.6s ease-out",
              transitionDelay: "0.5s",
              opacity: mounted ? 1 : 0
            },
            children: "v1.0.0"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-3 border-b border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
            "Step ",
            currentStep,
            " of ",
            STEPS.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "— ",
            STEPS[currentStep - 1].title
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
          "Step ",
          currentStep,
          " of ",
          STEPS.length
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden h-0.5 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-primary transition-all duration-500 ease-out",
          style: { width: `${progressPercent}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto px-6 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            transitionDelay: "0.2s",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)"
          },
          children: [
            error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-destructive shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
            ] }),
            renderStep()
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 bg-card/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block h-0.5 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full bg-primary transition-all duration-500 ease-out",
            style: { width: `${progressPercent}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handlePrev,
              disabled: currentStep === 1 || isLoading,
              className: "gap-1.5 text-xs",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" }),
                "Previous"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/50 hidden sm:block", children: "Initial Setup Wizard" }),
          currentStep < 4 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              onClick: handleNext,
              disabled: !canProceed() || isLoading,
              className: "gap-1.5 text-xs",
              children: [
                "Next",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              onClick: handleComplete,
              disabled: !canProceed() || isLoading,
              className: "gap-1.5 text-xs",
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                "Setting up..."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                "Complete Setup"
              ] })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  SetupWizardScreen
};
