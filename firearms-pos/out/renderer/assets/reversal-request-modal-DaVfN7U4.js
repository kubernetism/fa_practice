import { r as reactExports, j as jsxRuntimeExports, a8 as Dialog, a9 as DialogContent, aa as DialogHeader, ab as DialogTitle, R as RotateCcw, ac as DialogDescription, L as Label, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, p as SelectItem, q as Textarea, am as DialogFooter, B as Button } from "./index-2rq_5YkW.js";
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
export {
  ReversalRequestModal as R
};
