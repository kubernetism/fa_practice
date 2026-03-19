import { r as reactExports, j as jsxRuntimeExports, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a2 as RotateCcw, a9 as DialogDescription, L as Label, m as Select, n as SelectTrigger, o as SelectValue, p as SelectContent, q as SelectItem, T as Textarea, al as DialogFooter, B as Button, ad as Clock, aa as Badge, ar as cn } from "./index-CRSsXg7z.js";
import { B as Ban } from "./ban-BuI4cMcs.js";
import { T as TriangleAlert } from "./triangle-alert-BKzviBI6.js";
import { C as CircleCheck } from "./circle-check-KAX5jJPo.js";
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];
function ReversalRequestModal({
  open,
  onClose,
  entityType,
  entityId,
  entityLabel,
  branchId,
  onSuccess
}) {
  const [reason, setReason] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState("medium");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const [successMessage, setSuccessMessage] = reactExports.useState(null);
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      handleClose();
    }
  };
  const handleClose = () => {
    setReason("");
    setPriority("medium");
    setIsSubmitting(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };
  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMessage("Please provide a reason for the reversal request.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const result = await window.api.reversals.create({
        entityType,
        entityId,
        reason: reason.trim(),
        priority,
        branchId
      });
      if (result?.success) {
        setSuccessMessage("Reversal request submitted successfully.");
        onSuccess?.();
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setErrorMessage(result?.message || "Failed to submit reversal request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting reversal request:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-5 w-5" }),
        "Request Reversal"
      ] }),
      entityLabel && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: entityLabel })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reversal-priority", children: "Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: priority,
            onValueChange: (value) => setPriority(value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "reversal-priority", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select priority" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRIORITY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "reversal-reason", children: [
          "Reason ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "reversal-reason",
            value: reason,
            onChange: (e) => setReason(e.target.value),
            placeholder: "Describe why this transaction should be reversed...",
            rows: 4,
            disabled: isSubmitting
          }
        )
      ] }),
      errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive", children: errorMessage }),
      successMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400", children: successMessage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, disabled: isSubmitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: isSubmitting || !reason.trim(), children: isSubmitting ? "Submitting..." : "Submit Request" })
    ] })
  ] }) });
}
const STATUS_CONFIG = {
  pending: {
    label: "Reversal Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    label: "Reversal Approved",
    icon: RotateCcw,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  completed: {
    label: "Reversed",
    icon: CircleCheck,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  failed: {
    label: "Reversal Failed",
    icon: TriangleAlert,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  },
  rejected: {
    label: "Reversal Rejected",
    icon: Ban,
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
  }
};
function ReversalStatusBadge({ entityType, entityId, className }) {
  const [status, setStatus] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const result = await window.api.reversals.check({ entityType, entityId });
        if (!cancelled && result?.success && result.data) {
          setStatus(result.data.status);
        }
      } catch {
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);
  if (!status) return null;
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: cn("gap-1 border-0 font-medium", config.className, className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
    config.label
  ] });
}
export {
  ReversalStatusBadge as R,
  ReversalRequestModal as a
};
