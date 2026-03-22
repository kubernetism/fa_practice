import { t as createLucideIcon, r as reactExports, j as jsxRuntimeExports, a4 as Dialog, a5 as DialogContent, a6 as DialogHeader, a7 as DialogTitle, aM as Key, a8 as DialogDescription, L as Label, I as Input, aq as CircleCheckBig, as as CircleX, d as CircleAlert, ai as DialogFooter, B as Button, Z as Card, an as CardHeader, ao as CardTitle, _ as CardContent, a9 as Badge, a as useAuth, S as Shield, p as Copy, aA as CardDescription, ab as Clock } from "./index-ENY36Th-.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter } from "./alert-dialog-DrkYQxUi.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-lsoyBIDb.js";
import { H as History } from "./history-wCj_Qg4F.js";
import { R as RefreshCw } from "./refresh-cw-ff8Z_wwg.js";
import { C as CircleCheck } from "./circle-check-hun_AGmj.js";
import { T as TriangleAlert } from "./triangle-alert-CTFBKWYe.js";
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
    if (formatted.length === 64 || formatted.length === 100) {
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
    if (licenseKey.length !== 64 && licenseKey.length !== 100) {
      setError("Please enter a valid license key (64 or 100 characters)");
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
            placeholder: "Enter license key",
            maxLength: 100,
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
const DEACTIVATION_CONSEQUENCES = [
  "Remove your full license from this machine",
  "Revert the application to trial mode (30 days)",
  "Require you to generate a new license key to continue"
];
function LicenseSettingsScreen() {
  const { user } = useAuth();
  const [licenseInfo, setLicenseInfo] = reactExports.useState(null);
  const [licenseHistory, setLicenseHistory] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isActivating, setIsActivating] = reactExports.useState(false);
  const [isDeactivating, setIsDeactivating] = reactExports.useState(false);
  const [showActivateDialog, setShowActivateDialog] = reactExports.useState(false);
  const [machineId, setMachineId] = reactExports.useState("");
  const [toast, setToast] = reactExports.useState(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = reactExports.useState(false);
  const [deactivateClickCount, setDeactivateClickCount] = reactExports.useState(0);
  const [showFinalWarning, setShowFinalWarning] = reactExports.useState(false);
  const showToast = reactExports.useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3e3);
  }, []);
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
      }
    } catch (error) {
      console.error("Failed to fetch license info:", error);
      showToast("Failed to load license information", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  reactExports.useEffect(() => {
    fetchLicenseInfo();
  }, [fetchLicenseInfo]);
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md border border-red-500/30 bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-red-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-7 w-7 text-red-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 dark:text-red-400 font-semibold text-lg tracking-wide", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500/70 text-sm", children: "Administrator clearance required" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm border-l-2 border-red-500/50 pl-3", children: "You do not have permission to access the license settings. Only administrators can manage application licensing." })
    ] }) }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-[60vh] gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-7 h-7 animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm tracking-widest uppercase text-xs", children: "Loading License Data" })
    ] });
  }
  const getStatusConfig = () => {
    switch (licenseInfo?.status) {
      case "TRIAL_ACTIVE":
        return {
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500",
          label: "Trial Active",
          icon: Clock,
          progressColor: "bg-amber-500"
        };
      case "TRIAL_EXPIRED":
        return {
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500",
          label: "Trial Expired",
          icon: CircleX,
          progressColor: "bg-orange-500"
        };
      case "LICENSE_ACTIVE":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500",
          label: "Licensed",
          icon: CircleCheck,
          progressColor: "bg-emerald-500"
        };
      case "LICENSE_EXPIRED":
        return {
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500",
          label: "License Expired",
          icon: CircleX,
          progressColor: "bg-red-500"
        };
      default:
        return {
          color: "text-muted-foreground",
          bg: "bg-zinc-500/10",
          border: "border-zinc-500",
          label: "Unknown",
          icon: Shield,
          progressColor: "bg-zinc-500"
        };
    }
  };
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const maxDays = 365;
  const daysRemaining = licenseInfo?.daysRemaining ?? 0;
  const progressPct = Math.min(Math.max(daysRemaining / maxDays * 100, 0), 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t-2 border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 max-w-7xl mx-auto space-y-5", children: [
    toast && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium border transition-all ${toast.type === "success" ? "bg-card border-primary/50 text-primary shadow-primary/10" : "bg-card border-red-500/50 text-red-500 dark:text-red-400 shadow-red-500/10"}`,
        children: [
          toast.type === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0" }),
          toast.message
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold text-foreground tracking-wide", children: "License Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Manage application licensing and trial status" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: fetchLicenseInfo,
          disabled: isLoading,
          className: "border-border text-muted-foreground hover:text-primary hover:border-primary/50 bg-transparent text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}` }),
            "Refresh"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-l-4 ${statusConfig.border} border-border bg-card`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 pb-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${statusConfig.color}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-1.5 rounded-md ${statusConfig.bg}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm tracking-wide", children: statusConfig.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                className: `text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} bg-opacity-10`,
                children: licenseInfo?.isActivated ? "ACTIVATED" : licenseInfo?.isTrial ? "TRIAL" : "INACTIVE"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-3 py-2.5 rounded-md ${statusConfig.bg} border ${statusConfig.border} border-opacity-30`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-medium ${statusConfig.color}`, children: licenseInfo?.message }),
            licenseInfo?.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Expires ",
              new Date(licenseInfo.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            ] })
          ] }),
          daysRemaining > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Days Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-semibold tabular-nums ${statusConfig.color}`, children: [
                daysRemaining,
                "d"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `h-full rounded-full transition-all ${statusConfig.progressColor}`,
                style: { width: `${progressPct}%` }
              }
            ) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "w-3.5 h-3.5 text-primary" }),
            "Machine Identifier"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-4 pb-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "block w-full p-2.5 rounded-md bg-muted border border-border text-xs font-mono text-foreground break-all leading-relaxed pr-9", children: machineId || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: handleCopyMachineId,
                  className: "absolute top-1.5 right-1.5 h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10",
                  title: "Copy Machine ID",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3 h-3" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "w-full text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 bg-transparent",
                onClick: handleGenerateRequest,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5 mr-1.5" }),
                  "Copy ID & Generate License"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3 flex flex-col gap-4", children: licenseInfo?.isActivated && licenseInfo.status === "LICENSE_ACTIVE" ? (
        /* Full License Details */
        /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 pt-4 px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-emerald-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold text-foreground", children: "Full License Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs text-muted-foreground", children: "Your license is valid and operational" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-5 pb-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License Key" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "block p-1.5 rounded bg-muted border border-border text-xs font-mono text-muted-foreground break-all", children: licenseInfo.licenseStartDate ? "••••  ••••  ••••  ••••" : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Subscription License" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "Installation Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo.installationDate ? new Date(licenseInfo.installationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "Days Remaining" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-emerald-400", children: [
                  licenseInfo.daysRemaining,
                  " days"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License Start Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo.licenseStartDate ? new Date(licenseInfo.licenseStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License End Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo.licenseEndDate ? new Date(licenseInfo.licenseEndDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "Machine ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "block p-1.5 rounded bg-muted border border-border text-xs font-mono text-muted-foreground break-all", children: machineId })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                size: "sm",
                onClick: handleDeactivate,
                disabled: isDeactivating,
                className: "gap-2 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "w-3.5 h-3.5" }),
                  isDeactivating ? "Deactivating..." : "Deactivate License"
                ]
              }
            ) })
          ] })
        ] }) })
      ) : (
        /* Trial / Non-activated Details */
        /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3 pt-4 px-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold text-foreground", children: "License Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs text-muted-foreground", children: "Current license and trial information" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-5 pb-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "Installation Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo?.installationDate ? new Date(licenseInfo.installationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "Trial End Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo?.trialEndDate ? new Date(licenseInfo.trialEndDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
              ] }),
              licenseInfo?.isActivated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License Start" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo.licenseStartDate ? new Date(licenseInfo.licenseStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-medium", children: "License End" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: licenseInfo.licenseEndDate ? new Date(licenseInfo.licenseEndDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-border flex gap-2", children: licenseInfo?.isTrial ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: () => setShowActivateDialog(true),
                className: "gap-2 text-xs bg-primary hover:bg-primary/80 text-primary-foreground font-semibold",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-3.5 h-3.5" }),
                  "Activate License"
                ]
              }
            ) : licenseInfo?.isActivated ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                size: "sm",
                onClick: handleDeactivate,
                disabled: isDeactivating,
                className: "gap-2 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "w-3.5 h-3.5" }),
                  isDeactivating ? "Deactivating..." : "Deactivate License"
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: () => setShowActivateDialog(true),
                className: "gap-2 text-xs bg-primary hover:bg-primary/80 text-primary-foreground font-semibold",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-3.5 h-3.5" }),
                  "Activate License"
                ]
              }
            ) })
          ] })
        ] }) })
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseHistory, { history: licenseHistory }) }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deactivateConfirmOpen, onOpenChange: setDeactivateConfirmOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "bg-card border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-primary" }) }),
          "Deactivate License?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "text-muted-foreground text-sm", children: [
          "Are you sure you want to deactivate the license? This will revert the application to trial mode and you will need to activate a new license to continue using all features.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary/80 font-medium", children: [
            "Click the button ",
            5 - deactivateClickCount,
            " more time(s) before deactivation proceeds."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: cancelDeactivate,
            className: "border-border text-muted-foreground hover:text-foreground bg-transparent",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: confirmDeactivate, children: "Yes, Deactivate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showFinalWarning, onOpenChange: handleFinalWarningClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "max-w-md bg-card border border-red-500/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-red-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded-md bg-red-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-500" }) }),
          "WARNING: Final Confirmation Required"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-muted-foreground text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "You are about to deactivate your license!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This action will:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 pl-1", children: DEACTIVATION_CONSEQUENCES.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" }),
            item
          ] }, item)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground pt-1", children: "Are you absolutely sure you want to proceed?" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleFinalWarningClose,
            className: "border-border text-muted-foreground hover:text-foreground bg-transparent",
            children: "No, Keep License"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: confirmDeactivate, children: "Yes, Deactivate License" })
      ] })
    ] }) })
  ] }) });
}
export {
  LicenseSettingsScreen
};
