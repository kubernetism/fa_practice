import { c as createLucideIcon, a as useAuth, r as reactExports, j as jsxRuntimeExports, a1 as Shield, B as Button, k as Plus, C as CircleAlert, L as Label, v as Select, w as SelectTrigger, x as SelectValue, y as SelectContent, z as SelectItem, E as Building2, H as DollarSign, R as Receipt, P as Package, S as ShoppingCart, n as Clock, a2 as Settings, I as Input, O as Textarea, l as Badge, T as Trash2, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, t as DialogFooter } from "./index-xbqNQ75I.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle, c as CardDescription } from "./card-BaC4FEkF.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-B7iX8N91.js";
import { S as Separator } from "./separator-BhDX07Zw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Fjv0Y2b_.js";
import { R as RefreshCw } from "./refresh-cw-35B_3Dmz.js";
import { C as Copy } from "./copy-RNwTHLUZ.js";
import { M as MapPin } from "./map-pin-B8AGN_1Q.js";
import { P as Printer } from "./printer-C5TLy5rX.js";
import { L as List } from "./list-BwUUoDUa.js";
import { P as Pencil } from "./pencil-DZIfoaUt.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Globe = createLucideIcon("Globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Save = createLucideIcon("Save", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
const BUSINESS_TYPES = ["Retail", "Wholesale", "Mixed"];
const STOCK_VALUATION_METHODS = ["FIFO", "LIFO", "Average"];
const BACKUP_FREQUENCIES = ["daily", "weekly", "monthly"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour", "24-hour"];
const TIMEZONES = ["UTC", "Asia/Karachi", "America/New_York", "Europe/London"];
function BusinessSettingsScreen() {
  const { user } = useAuth();
  const [branches, setBranches] = reactExports.useState([]);
  const [allSettings, setAllSettings] = reactExports.useState([]);
  const [selectedBranchId, setSelectedBranchId] = reactExports.useState(null);
  const [currentSettings, setCurrentSettings] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [dialogMode, setDialogMode] = reactExports.useState("create");
  const [error, setError] = reactExports.useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = reactExports.useState(false);
  const [cloneSourceBranchId, setCloneSourceBranchId] = reactExports.useState(null);
  const [cloneTargetBranchId, setCloneTargetBranchId] = reactExports.useState("");
  const [createBranchId, setCreateBranchId] = reactExports.useState("");
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const fetchData = reactExports.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const branchesResult = await window.api.branches.getActive();
      if (branchesResult.success && branchesResult.data) {
        setBranches(branchesResult.data);
      }
      if (isAdmin && user) {
        try {
          console.log("[BusinessSettings] Fetching all settings for user:", user.userId);
          const settingsData = await window.api.businessSettings.getAll(user.userId);
          console.log("[BusinessSettings] Settings received:", settingsData.length);
          setAllSettings(settingsData);
        } catch (err) {
          console.error("[BusinessSettings] Failed to fetch all settings:", err);
        }
      }
      await handleBranchChange(selectedBranchId);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user, selectedBranchId]);
  const handleBranchChange = async (branchId) => {
    setSelectedBranchId(branchId);
    setIsLoadingSettings(true);
    try {
      const settings = branchId ? await window.api.businessSettings.getByBranch(branchId) : await window.api.businessSettings.getGlobal();
      setCurrentSettings(settings);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings");
    } finally {
      setIsLoadingSettings(false);
    }
  };
  reactExports.useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!currentSettings || !user) return;
    setIsSaving(true);
    setError(null);
    try {
      if (currentSettings.settingId) {
        await window.api.businessSettings.update(user.userId, currentSettings.settingId, currentSettings);
      } else {
        await window.api.businessSettings.create(user.userId, currentSettings);
      }
      await fetchData();
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteSettings = async (settingId) => {
    if (!confirm("Are you sure you want to delete these settings?")) return;
    if (!user) return;
    try {
      await window.api.businessSettings.delete(user.userId, settingId);
      await fetchData();
      alert("Settings deleted successfully!");
    } catch (err) {
      console.error("Error deleting settings:", err);
      alert("Failed to delete settings");
    }
  };
  const handleCloneSettings = async () => {
    if (!user || !cloneSourceBranchId || !cloneTargetBranchId) return;
    try {
      await window.api.businessSettings.clone(
        user.userId,
        cloneSourceBranchId,
        parseInt(cloneTargetBranchId)
      );
      await fetchData();
      setIsDialogOpen(false);
      setCloneSourceBranchId(null);
      setCloneTargetBranchId("");
      alert("Settings cloned successfully!");
    } catch (err) {
      console.error("Error cloning settings:", err);
      alert("Failed to clone settings");
    }
  };
  const handleCreateSettings = async () => {
    if (!user || !createBranchId) return;
    try {
      await window.api.businessSettings.create(user.userId, {
        branchId: parseInt(createBranchId),
        businessName: "",
        businessAddress: "",
        currencySymbol: "Rs.",
        currencyCode: "PKR",
        taxRate: 0,
        taxName: "GST"
      });
      await fetchData();
      setIsDialogOpen(false);
      setCreateBranchId("");
      await handleBranchChange(parseInt(createBranchId));
      alert("Settings created successfully!");
    } catch (err) {
      console.error("Error creating settings:", err);
      alert("Failed to create settings");
    }
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Only administrators can access business settings. Please contact your administrator if you need to modify settings." })
    ] }) });
  }
  if (isLoading && !currentSettings) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading settings..." })
    ] }) });
  }
  if (isLoadingSettings && !currentSettings) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading settings..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Business Settings Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Configure global and branch-specific settings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setDialogMode("clone");
              setIsDialogOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-2" }),
              "Clone Settings"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              setDialogMode("create");
              setIsDialogOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              "Create New Settings"
            ]
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" }),
      error
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "min-w-[140px]", children: "Select Business:" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedBranchId === null ? "global" : selectedBranchId.toString(),
          onValueChange: (val) => handleBranchChange(val === "global" ? null : parseInt(val)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "flex-1 max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch or global settings" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "global", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4" }),
                "Global Settings (Default)"
              ] }) }),
              branches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: branch.id.toString(), children: [
                branch.name,
                " (",
                branch.code,
                ")"
              ] }, branch.id))
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: selectedBranchId === null ? "Editing global default settings" : `Editing settings for ${branches.find((b) => b.id === selectedBranchId)?.name || "Unknown"}` })
    ] }) }) }),
    currentSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveSettings, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "business", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-5 lg:grid-cols-9 mb-6 h-auto gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "business", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Business" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "tax", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Tax" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "receipt", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Receipt" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "customize", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Customize" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "inventory", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Inventory" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "sales", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Sales" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "hours", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "Hours" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "system", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "System" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", className: "flex items-center gap-1 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs", children: "All" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "business", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5" }),
              "Business Information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Basic business details and contact information" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessName", children: "Business Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessName",
                  value: currentSettings.businessName || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessName: e.target.value
                  }),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessRegistrationNo", children: "Registration Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessRegistrationNo",
                  value: currentSettings.businessRegistrationNo || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessRegistrationNo: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessType", children: "Business Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.businessType || "",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, businessType: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BUSINESS_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: type }, type)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessPhone", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessPhone",
                  value: currentSettings.businessPhone || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessPhone: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessEmail", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessEmail",
                  type: "email",
                  value: currentSettings.businessEmail || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessEmail: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessWebsite", children: "Website" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessWebsite",
                  value: currentSettings.businessWebsite || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessWebsite: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessAddress", children: "Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "businessAddress",
                  value: currentSettings.businessAddress || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessAddress: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCity", children: "City" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessCity",
                  value: currentSettings.businessCity || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessCity: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessState", children: "State/Province" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessState",
                  value: currentSettings.businessState || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessState: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCountry", children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessCountry",
                  value: currentSettings.businessCountry || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    businessCountry: e.target.value
                  })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tax", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-5 h-5" }),
              "Tax & Currency Configuration"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure tax rates and currency formatting" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxName", children: "Tax Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxName",
                  value: currentSettings.taxName || "GST",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, taxName: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", children: "Tax Rate (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxRate",
                  type: "number",
                  min: "0",
                  max: "100",
                  step: "0.01",
                  value: currentSettings.taxRate || 0,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    taxRate: parseFloat(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxId", children: "Tax ID / EIN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxId",
                  value: currentSettings.taxId || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, taxId: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyCode", children: "Currency Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "currencyCode",
                  value: currentSettings.currencyCode || "PKR",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, currencyCode: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencySymbol", children: "Currency Symbol" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "currencySymbol",
                  value: currentSettings.currencySymbol || "Rs.",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    currencySymbol: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyPosition", children: "Symbol Position" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.currencyPosition || "prefix",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, currencyPosition: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "prefix", children: "Prefix (e.g., Rs.100)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suffix", children: "Suffix (e.g., 100 Rs.)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "decimalPlaces", children: "Decimal Places" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "decimalPlaces",
                  type: "number",
                  min: "0",
                  max: "4",
                  value: currentSettings.decimalPlaces ?? 2,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    decimalPlaces: parseInt(e.target.value) || 0
                  })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "receipt", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-5 h-5" }),
              "Receipt & Invoice Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure receipt and invoice formatting" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoicePrefix", children: "Invoice Prefix" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "invoicePrefix",
                  value: currentSettings.invoicePrefix || "INV",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, invoicePrefix: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceNumberFormat", children: "Number Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.invoiceNumberFormat || "sequential",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, invoiceNumberFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sequential", children: "Sequential (0001)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "date-based", children: "Date-based (202401010001)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceStartingNumber", children: "Starting Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "invoiceStartingNumber",
                  type: "number",
                  min: "1",
                  value: currentSettings.invoiceStartingNumber || 1,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    invoiceStartingNumber: parseInt(e.target.value) || 1
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptHeader", children: "Receipt Header" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "receiptHeader",
                  value: currentSettings.receiptHeader || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptHeader: e.target.value }),
                  placeholder: "Header text shown at the top of receipts"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptFooter", children: "Receipt Footer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "receiptFooter",
                  value: currentSettings.receiptFooter || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptFooter: e.target.value }),
                  placeholder: "Footer text shown at the bottom of receipts"
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "customize", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-5 h-5" }),
              "Receipt Customization"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure receipt appearance and auto-generation settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptFormat", children: "Receipt Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.receiptFormat || "pdf",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, receiptFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pdf", children: "PDF (A4/Letter)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "thermal", children: "Thermal (80mm)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptPrimaryColor", children: "Primary Color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "receiptPrimaryColor",
                    type: "color",
                    value: currentSettings.receiptPrimaryColor || "#1e40af",
                    onChange: (e) => setCurrentSettings({
                      ...currentSettings,
                      receiptPrimaryColor: e.target.value
                    }),
                    className: "w-12 h-10 p-1 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: currentSettings.receiptPrimaryColor || "#1e40af",
                    onChange: (e) => setCurrentSettings({
                      ...currentSettings,
                      receiptPrimaryColor: e.target.value
                    }),
                    placeholder: "#1e40af",
                    className: "flex-1"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptSecondaryColor", children: "Secondary Color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "receiptSecondaryColor",
                    type: "color",
                    value: currentSettings.receiptSecondaryColor || "#64748b",
                    onChange: (e) => setCurrentSettings({
                      ...currentSettings,
                      receiptSecondaryColor: e.target.value
                    }),
                    className: "w-12 h-10 p-1 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: currentSettings.receiptSecondaryColor || "#64748b",
                    onChange: (e) => setCurrentSettings({
                      ...currentSettings,
                      receiptSecondaryColor: e.target.value
                    }),
                    placeholder: "#64748b",
                    className: "flex-1"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptFontSize", children: "Font Size" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.receiptFontSize || "medium",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, receiptFontSize: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "small", children: "Small" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "large", children: "Large" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "receiptAutoDownload",
                  checked: currentSettings.receiptAutoDownload !== false,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptAutoDownload: e.target.checked
                  }),
                  className: "h-4 w-4 rounded border-gray-300"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptAutoDownload", children: "Auto-download receipt after sale" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "receiptShowBusinessLogo",
                  checked: currentSettings.receiptShowBusinessLogo !== false,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptShowBusinessLogo: e.target.checked
                  }),
                  className: "h-4 w-4 rounded border-gray-300"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptShowBusinessLogo", children: "Show business logo on receipt" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-3", children: "Custom Fields" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField1Label", children: "Custom Field 1 Label" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField1Label",
                  value: currentSettings.receiptCustomField1Label || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField1Label: e.target.value
                  }),
                  placeholder: "e.g., License Number"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField1Value", children: "Custom Field 1 Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField1Value",
                  value: currentSettings.receiptCustomField1Value || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField1Value: e.target.value
                  }),
                  placeholder: "e.g., FFL-12345678"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField2Label", children: "Custom Field 2 Label" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField2Label",
                  value: currentSettings.receiptCustomField2Label || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField2Label: e.target.value
                  }),
                  placeholder: "e.g., Store Hours"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField2Value", children: "Custom Field 2 Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField2Value",
                  value: currentSettings.receiptCustomField2Value || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField2Value: e.target.value
                  }),
                  placeholder: "e.g., Mon-Sat 9AM-6PM"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField3Label", children: "Custom Field 3 Label" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField3Label",
                  value: currentSettings.receiptCustomField3Label || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField3Label: e.target.value
                  }),
                  placeholder: "e.g., Return Policy"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptCustomField3Value", children: "Custom Field 3 Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "receiptCustomField3Value",
                  value: currentSettings.receiptCustomField3Value || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptCustomField3Value: e.target.value
                  }),
                  placeholder: "e.g., 30 days with receipt"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptTermsAndConditions", children: "Terms & Conditions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "receiptTermsAndConditions",
                  value: currentSettings.receiptTermsAndConditions || "",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    receiptTermsAndConditions: e.target.value
                  }),
                  placeholder: "Return policy, warranty information, legal disclaimers, etc.",
                  rows: 4,
                  className: "mt-1"
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inventory", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5" }),
              "Inventory Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure inventory tracking and stock management" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lowStockThreshold", children: "Low Stock Threshold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "lowStockThreshold",
                  type: "number",
                  min: "0",
                  value: currentSettings.lowStockThreshold ?? 10,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    lowStockThreshold: parseInt(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stockValuationMethod", children: "Valuation Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.stockValuationMethod || "FIFO",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, stockValuationMethod: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STOCK_VALUATION_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method, children: method }, method)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoReorderQuantity", children: "Auto Reorder Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "autoReorderQuantity",
                  type: "number",
                  min: "0",
                  value: currentSettings.autoReorderQuantity ?? 50,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    autoReorderQuantity: parseInt(e.target.value) || 0
                  })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sales", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-5 h-5" }),
              "Sales & Payment Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure sales, payment methods, and discounts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "defaultPaymentMethod", children: "Default Payment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "defaultPaymentMethod",
                  value: currentSettings.defaultPaymentMethod || "Cash",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    defaultPaymentMethod: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "allowedPaymentMethods", children: "Allowed Payment Methods" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "allowedPaymentMethods",
                  value: currentSettings.allowedPaymentMethods || "Cash,Card,Bank Transfer,COD",
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    allowedPaymentMethods: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "maxDiscountPercentage", children: "Max Discount (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "maxDiscountPercentage",
                  type: "number",
                  min: "0",
                  max: "100",
                  value: currentSettings.maxDiscountPercentage ?? 50,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    maxDiscountPercentage: parseFloat(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "openingCashBalance", children: "Opening Cash Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "openingCashBalance",
                  type: "number",
                  min: "0",
                  step: "0.01",
                  value: currentSettings.openingCashBalance ?? 0,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    openingCashBalance: parseFloat(e.target.value) || 0
                  })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hours", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5" }),
              "Working Hours"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure operating hours for this business/branch" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "workingDaysStart", children: "Week Starts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.workingDaysStart || "Monday",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, workingDaysStart: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DAYS_OF_WEEK.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: day, children: day }, day)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "workingDaysEnd", children: "Week Ends" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.workingDaysEnd || "Saturday",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, workingDaysEnd: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DAYS_OF_WEEK.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: day, children: day }, day)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "openingTime", children: "Opening Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "openingTime",
                  type: "time",
                  value: currentSettings.openingTime || "09:00",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, openingTime: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "closingTime", children: "Closing Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "closingTime",
                  type: "time",
                  value: currentSettings.closingTime || "18:00",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, closingTime: e.target.value })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "system", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" }),
              "System Preferences"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure date, time, language, and backup settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateFormat", children: "Date Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.dateFormat || "DD/MM/YYYY",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, dateFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DATE_FORMATS.map((format) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: format, children: format }, format)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timeFormat", children: "Time Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.timeFormat || "24-hour",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, timeFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIME_FORMATS.map((format) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: format, children: format }, format)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timezone", children: "Timezone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.timezone || "UTC",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, timezone: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz, children: tz }, tz)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "language", children: "Language" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "language",
                  value: currentSettings.language || "en",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, language: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupFrequency", children: "Backup Frequency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.autoBackupFrequency || "daily",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, autoBackupFrequency: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BACKUP_FREQUENCIES.map((freq) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: freq, children: freq.charAt(0).toUpperCase() + freq.slice(1) }, freq)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "backupRetentionDays", children: "Backup Retention (Days)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "backupRetentionDays",
                  type: "number",
                  min: "1",
                  value: currentSettings.backupRetentionDays ?? 30,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    backupRetentionDays: parseInt(e.target.value) || 30
                  })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "All Business Settings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Overview of all business configurations across branches" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Business Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Branch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tax Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              allSettings.map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: setting.businessName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: setting.branchId === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "flex items-center gap-1 w-fit", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-3 h-3" }),
                  "Global"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: setting.branch?.name || `Branch ${setting.branchId}` }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  setting.currencySymbol,
                  " (",
                  setting.currencyCode,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                  setting.taxRate,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: setting.isActive ? "default" : "destructive",
                    children: setting.isActive ? "Active" : "Inactive"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      onClick: () => handleBranchChange(setting.branchId),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                    }
                  ),
                  setting.branchId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "destructive",
                      size: "sm",
                      onClick: () => handleDeleteSettings(setting.settingId),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] }) })
              ] }, setting.settingId)),
              allSettings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No business settings configured yet. Create global settings first." }) })
            ] })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: fetchData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
          "Reset"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSaving, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
          isSaving ? "Saving..." : "Save Settings"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogMode === "clone" ? "Clone Settings" : "Create New Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: dialogMode === "clone" ? "Select source and target branches to clone settings" : "Create new business settings for a branch" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 py-4", children: dialogMode === "clone" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: cloneSourceBranchId === null ? "global" : cloneSourceBranchId.toString(),
              onValueChange: (val) => setCloneSourceBranchId(val === "global" ? null : parseInt(val)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "global", children: "Global Settings" }),
                  branches.filter((b) => allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cloneTargetBranchId, onValueChange: setCloneTargetBranchId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select target branch" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
          ] }),
          branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "All branches already have settings. Update existing settings instead." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: createBranchId, onValueChange: setCreateBranchId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
        ] }),
        branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "All branches already have settings. Update existing settings instead." })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: dialogMode === "clone" ? handleCloneSettings : handleCreateSettings,
            disabled: dialogMode === "clone" ? !cloneSourceBranchId || !cloneTargetBranchId : !createBranchId,
            children: dialogMode === "clone" ? "Clone Settings" : "Create Settings"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  BusinessSettingsScreen
};
