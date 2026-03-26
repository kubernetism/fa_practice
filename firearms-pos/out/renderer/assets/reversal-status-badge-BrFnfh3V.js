import { r as reactExports, G as RotateCcw, w as Clock, j as jsxRuntimeExports, i as Badge, A as cn } from "./index-CQ_f3o8V.js";
import { B as Ban } from "./ban-BPk5_2UB.js";
import { T as TriangleAlert } from "./triangle-alert-DCrF6f46.js";
import { C as CircleCheck } from "./circle-check-D3nHtTs6.js";
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
  ReversalStatusBadge as R
};
