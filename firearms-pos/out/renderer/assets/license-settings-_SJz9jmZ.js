import { h as createLucideIcon, r as reactExports, j as jsxRuntimeExports, Z as Dialog, _ as DialogContent, $ as DialogHeader, a0 as DialogTitle, aO as Key, a1 as DialogDescription, L as Label, I as Input, ad as CircleCheckBig, af as CircleX, O as CircleAlert, a2 as DialogFooter, B as Button, C as Card, b as CardHeader, c as CardTitle, e as CardContent, K as Badge, a as useAuth, aK as Shield, s as Copy, d as CardDescription } from "./index-BI5tINr-.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter } from "./alert-dialog-rashgYUa.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DGwW5eFk.js";
import { H as History } from "./history-Baw7FApp.js";
import { R as RefreshCw } from "./refresh-cw-CqtCU2zs.js";
import { T as TriangleAlert } from "./triangle-alert-CGhCz8Jb.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Power = createLucideIcon("Power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Terminal = createLucideIcon("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
function ActivateLicenseDialog({
  open,
  onOpenChange,
  onActivate,
  isActivating,
  machineId
}) {
  const [licenseKey, setLicenseKey] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const [isValidating, setIsValidating] = reactExports.useState(false);
  const [validationResult, setValidationResult] = reactExports.useState(null);
  const formatLicenseKey = (value) => {
    return value.toUpperCase().replace(/\s/g, "");
  };
  const handleKeyChange = async (e) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError(null);
    setValidationResult(null);
    if (formatted.length === 32 || formatted.length === 64) {
      setIsValidating(true);
      try {
        const result = await window.api.license.validateKey(formatted);
        if (result.success) {
          setValidationResult(result.data);
        }
      } catch (err) {
        console.error("Validation error:", err);
      } finally {
        setIsValidating(false);
      }
    }
  };
  const handleActivate = async () => {
    if (licenseKey.length !== 32 && licenseKey.length !== 64) {
      setError("Please enter a valid license key (32 or 64 characters)");
      return;
    }
    setError(null);
    await onActivate(licenseKey);
  };
  const handleClose = () => {
    setLicenseKey("");
    setError(null);
    setValidationResult(null);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-5 h-5" }),
        "Activate License"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the license key to activate your application. The license key is tied to this machine." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "licenseKey", children: "License Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "licenseKey",
            value: licenseKey,
            onChange: handleKeyChange,
            placeholder: "Enter 64-character license key",
            maxLength: 64,
            className: "font-mono",
            disabled: isActivating
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Machine ID: ",
          machineId.substring(0, 8),
          "..."
        ] })
      ] }),
      validationResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center gap-2 p-3 rounded-md ${validationResult.isValid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,
          children: [
            validationResult.isValid ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: validationResult.message })
          ]
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: error })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, disabled: isActivating, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleActivate, disabled: isActivating || isValidating, children: isActivating ? "Activating..." : "Activate License" })
    ] })
  ] }) });
}
function LicenseHistory({ history }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "EXPIRED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };
  const getTypeBadge = (type) => {
    switch (type) {
      case "FULL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "TRIAL":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-5 h-5" }),
      "License History"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No license history available" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activated By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activated At" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expires At" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: history.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: getTypeBadge(item.type), children: item.type }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: getStatusBadge(item.status), children: item.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.activatedBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.activatedAt ? new Date(item.activatedAt).toLocaleDateString() : "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "-" })
      ] }, item.id)) })
    ] }) })
  ] });
}
function LicenseSettingsScreen() {
  const { user } = useAuth();
  const [licenseInfo, setLicenseInfo] = reactExports.useState(null);
  const [licenseHistory, setLicenseHistory] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isActivating, setIsActivating] = reactExports.useState(false);
  const [isDeactivating, setIsDeactivating] = reactExports.useState(false);
  const [showActivateDialog, setShowActivateDialog] = reactExports.useState(false);
  const [machineId, setMachineId] = reactExports.useState("");
  const [instructions, setInstructions] = reactExports.useState("");
  const [toast, setToast] = reactExports.useState(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = reactExports.useState(false);
  const [deactivateClickCount, setDeactivateClickCount] = reactExports.useState(0);
  const [showFinalWarning, setShowFinalWarning] = reactExports.useState(false);
  const fetchLicenseInfo = reactExports.useCallback(async () => {
    try {
      setIsLoading(true);
      const [appInfoResult, historyResult, requestResult] = await Promise.all([
        window.api.license.getApplicationInfo(),
        window.api.license.getHistory(),
        window.api.license.generateLicenseRequest()
      ]);
      if (appInfoResult.success && appInfoResult.data) {
        setLicenseInfo(appInfoResult.data);
      }
      if (historyResult.success && historyResult.data) {
        setLicenseHistory(historyResult.data);
      }
      if (requestResult.success && requestResult.data) {
        setMachineId(requestResult.data.machineId || "");
        setInstructions(requestResult.data.instructions || "");
      }
    } catch (error) {
      console.error("Failed to fetch license info:", error);
      showToast("Failed to load license information", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchLicenseInfo();
  }, [fetchLicenseInfo]);
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3e3);
  };
  const handleCopyMachineId = () => {
    if (machineId) {
      navigator.clipboard.writeText(machineId);
      showToast("Machine ID copied to clipboard", "success");
    }
  };
  const handleGenerateRequest = async () => {
    if (machineId) {
      await navigator.clipboard.writeText(machineId);
      showToast("Machine ID copied to clipboard. Now run the license generator script.", "success");
    }
  };
  const handleActivate = async (licenseKey) => {
    setIsActivating(true);
    try {
      const result = await window.api.license.activate(licenseKey);
      if (result.success) {
        showToast("License activated successfully for 1 year!", "success");
        setShowActivateDialog(false);
        await fetchLicenseInfo();
      } else {
        showToast(result.message || "Failed to activate license", "error");
      }
    } catch (error) {
      console.error("Activate license error:", error);
      showToast("Failed to activate license", "error");
    } finally {
      setIsActivating(false);
    }
  };
  const handleDeactivate = async () => {
    const newCount = deactivateClickCount + 1;
    setDeactivateClickCount(newCount);
    if (newCount < 5) {
      setDeactivateConfirmOpen(true);
      return;
    }
    setShowFinalWarning(true);
    return;
  };
  const confirmDeactivate = async () => {
    setDeactivateConfirmOpen(false);
    setIsDeactivating(true);
    try {
      const result = await window.api.license.deactivate();
      if (result.success) {
        showToast("License deactivated successfully", "success");
        await fetchLicenseInfo();
      } else {
        showToast(result.message || "Failed to deactivate license", "error");
      }
    } catch (error) {
      console.error("Deactivate license error:", error);
      showToast("Failed to deactivate license", "error");
    } finally {
      setIsDeactivating(false);
      setDeactivateClickCount(0);
    }
  };
  const cancelDeactivate = () => {
    setDeactivateConfirmOpen(false);
  };
  const handleFinalWarningClose = () => {
    setShowFinalWarning(false);
    setDeactivateClickCount(0);
  };
  if (user?.role?.toLowerCase() !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-semibold text-lg", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "Admin Only Access" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: "You do not have permission to access the license settings. Only administrators can manage application licensing." })
    ] }) }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-muted-foreground" }) });
  }
  const getStatusConfig = () => {
    switch (licenseInfo?.status) {
      case "TRIAL_ACTIVE":
        return { color: "text-yellow-600", bg: "bg-yellow-100", label: "Trial Period", icon: Shield };
      case "TRIAL_EXPIRED":
        return { color: "text-orange-600", bg: "bg-orange-100", label: "Trial Expired", icon: Shield };
      case "LICENSE_ACTIVE":
        return { color: "text-green-600", bg: "bg-green-100", label: "Licensed", icon: Shield };
      case "LICENSE_EXPIRED":
        return { color: "text-red-600", bg: "bg-red-100", label: "License Expired", icon: Shield };
      default:
        return { color: "text-gray-600", bg: "bg-gray-100", label: "Unknown", icon: Shield };
    }
  };
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8" }),
          "Application Licence Settings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage your application license and trial status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: fetchLicenseInfo, disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    toast && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`,
        children: toast.message
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: `w-5 h-5 ${statusConfig.color}` }),
          "License Status"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${statusConfig.bg} ${statusConfig.color}`, children: statusConfig.label }),
            licenseInfo?.daysRemaining !== void 0 && licenseInfo.daysRemaining > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              licenseInfo.daysRemaining,
              " days remaining"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: licenseInfo?.message }),
            licenseInfo?.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "Expires: ",
              new Date(licenseInfo.expiresAt).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Machine ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "flex-1 p-2 rounded bg-muted text-xs font-mono break-all", children: [
                machineId.substring(0, 20),
                "..."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCopyMachineId, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: handleGenerateRequest, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "w-4 h-4 mr-2" }),
            "Copy Machine ID & Generate License"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "License Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: licenseInfo?.isActivated ? "Your full license information" : "Current license information and actions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: licenseInfo?.isActivated && licenseInfo.status === "LICENSE_ACTIVE" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-800 dark:text-green-200", children: "Full License Activated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 dark:text-green-300", children: "Your license is valid and active" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex items-center gap-2 p-2 rounded bg-muted text-xs font-mono break-all", children: licenseInfo.licenseStartDate ? "••••••••••••••••" : "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Annual License (1 Year)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Installation Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo.installationDate ? new Date(licenseInfo.installationDate).toLocaleDateString() : "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License Start Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo.licenseStartDate ? new Date(licenseInfo.licenseStartDate).toLocaleDateString() : "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License End Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo.licenseEndDate ? new Date(licenseInfo.licenseEndDate).toLocaleDateString() : "-" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Days Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-green-600", children: [
                licenseInfo.daysRemaining,
                " days"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Machine ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex items-center gap-2 p-2 rounded bg-muted text-xs font-mono break-all", children: machineId })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "destructive",
              onClick: handleDeactivate,
              disabled: isDeactivating,
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "w-4 h-4" }),
                isDeactivating ? "Deactivating..." : "Deactivate License"
              ]
            }
          ) })
        ] }) : (
          /* Trial Details */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Installation Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo?.installationDate ? new Date(licenseInfo.installationDate).toLocaleDateString() : "-" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Trial End Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo?.trialEndDate ? new Date(licenseInfo.trialEndDate).toLocaleDateString() : "-" })
              ] }),
              licenseInfo?.isActivated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License Start" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo.licenseStartDate ? new Date(licenseInfo.licenseStartDate).toLocaleDateString() : "-" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "License End" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenseInfo.licenseEndDate ? new Date(licenseInfo.licenseEndDate).toLocaleDateString() : "-" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-blue-800 dark:text-blue-200 mb-2", children: "How to Generate License Key:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Click "Copy Machine ID" button above' }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Open terminal in the application folder" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "Run: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-1 bg-blue-100 dark:bg-blue-900 rounded", children: "node generate-license.js [paste_machine_id]" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Copy the generated license key" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Paste it in the Activate License dialog below" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 pt-4", children: licenseInfo?.isTrial ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowActivateDialog(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-4 h-4 mr-2" }),
              "Activate License"
            ] }) : licenseInfo?.isActivated ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleDeactivate, disabled: isDeactivating, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "w-4 h-4 mr-2" }),
              isDeactivating ? "Deactivating..." : "Deactivate License"
            ] }) }) : null })
          ] })
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseHistory, { history: licenseHistory }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ActivateLicenseDialog,
      {
        open: showActivateDialog,
        onOpenChange: setShowActivateDialog,
        onActivate: handleActivate,
        isActivating,
        machineId
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deactivateConfirmOpen, onOpenChange: setDeactivateConfirmOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" }),
          "Deactivate License?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "Are you sure you want to deactivate the license? This will revert the application to trial mode and you will need to activate a new license to continue using all features.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "You have clicked the button ",
          5 - deactivateClickCount,
          " more time(s) before deactivation."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: cancelDeactivate, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: confirmDeactivate, children: "Yes, Deactivate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showFinalWarning, onOpenChange: handleFinalWarningClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-red-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6" }),
          "WARNING: Final Confirmation Required"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-foreground", children: "You are about to deactivate your license!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This action will:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Remove your full license from this machine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Revert the application to trial mode (30 days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Require you to generate a new license key to continue" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground pt-2", children: "Are you absolutely sure you want to proceed?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleFinalWarningClose, children: "No, Keep License" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: confirmDeactivate, children: "Yes, Deactivate License" })
      ] })
    ] }) })
  ] });
}
export {
  LicenseSettingsScreen
};
