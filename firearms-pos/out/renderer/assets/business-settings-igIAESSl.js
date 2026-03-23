import { v as createLucideIcon, r as reactExports, j as jsxRuntimeExports, a5 as Dialog, a6 as DialogContent, a7 as DialogHeader, a8 as DialogTitle, a9 as DialogDescription, aD as Database, B as Button, e as LoaderCircle, ad as Separator, L as Label, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, K as ScrollArea, D as Settings, G as ShoppingCart, a0 as DollarSign, A as Users, P as Package, as as cn, aE as ChevronDown, C as ChevronRight, aa as Badge, ar as CircleCheckBig, at as CircleX, aj as DialogFooter, a as useAuth, S as Shield, p as RefreshCw, M as MapPin, q as Copy, ah as Plus, d as CircleAlert, V as Tabs, Y as TabsList, Z as TabsTrigger, f as Building2, H as Receipt, ac as Clock, ag as TabsContent, _ as Card, ao as CardHeader, ap as CardTitle, aB as CardDescription, $ as CardContent, I as Input, o as Textarea, c as Eye, E as EyeOff, ab as FileText, ai as Trash2 } from "./index-DXbUu2xA.js";
import { C as Checkbox } from "./checkbox-CJZJepLc.js";
import { T as TriangleAlert } from "./triangle-alert-D1-hia1k.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BSItO8iL.js";
import { G as Globe } from "./globe-DBshNB40.js";
import { P as Printer } from "./printer-D3nkfN_2.js";
import { L as List } from "./list-B7de24sL.js";
import { T as Type } from "./type-6S85hBqr.js";
import { D as Download } from "./download-D7P34J40.js";
import { P as Pencil } from "./pencil-CYdAHCZR.js";
import { F as FolderOpen } from "./folder-open-CWtka0RO.js";
import { U as Upload } from "./upload-Ch5AJt60.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FileArchive = createLucideIcon("FileArchive", [
  ["path", { d: "M10 12v-1", key: "v7bkov" }],
  ["path", { d: "M10 18v-2", key: "1cjy8d" }],
  ["path", { d: "M10 7V6", key: "dljcrl" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01", key: "gkbcor" }
  ],
  ["circle", { cx: "10", cy: "20", r: "2", key: "1xzdoj" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HardDrive = createLucideIcon("HardDrive", [
  ["line", { x1: "22", x2: "2", y1: "12", y2: "12", key: "1y58io" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ],
  ["line", { x1: "6", x2: "6.01", y1: "16", y2: "16", key: "sgf278" }],
  ["line", { x1: "10", x2: "10.01", y1: "16", y2: "16", key: "1l4acy" }]
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
const categoryIcons = {
  inventory: Package,
  management: Users,
  finance: DollarSign,
  sales: ShoppingCart,
  system: Settings
};
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}
function ImportPreviewDialog({
  open,
  onOpenChange,
  onImportComplete
}) {
  const [step, setStep] = reactExports.useState("select");
  const [previewData, setPreviewData] = reactExports.useState(null);
  const [selectedCategories, setSelectedCategories] = reactExports.useState(/* @__PURE__ */ new Set());
  const [mergeMode, setMergeMode] = reactExports.useState("replace");
  const [expandedCategories, setExpandedCategories] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [importResult, setImportResult] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (open) {
      setStep("select");
      setPreviewData(null);
      setSelectedCategories(/* @__PURE__ */ new Set());
      setExpandedCategories(/* @__PURE__ */ new Set());
      setError(null);
      setImportResult(null);
    }
  }, [open]);
  const handleSelectFile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.api.backup.preview();
      if (result.success && result.data) {
        setPreviewData(result.data);
        const defaultSelected = new Set(
          result.data.categories.filter((c) => c.id !== "system" && c.totalRecords > 0).map((c) => c.id)
        );
        setSelectedCategories(defaultSelected);
        setStep("preview");
      } else {
        if (result.message !== "File selection cancelled") {
          setError(result.message || "Failed to preview backup file");
        }
      }
    } catch (err) {
      console.error("Preview failed:", err);
      setError("Failed to read backup file");
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };
  const handleToggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };
  const handleSelectAll = () => {
    if (previewData) {
      const allCategories = previewData.categories.filter((c) => c.totalRecords > 0).map((c) => c.id);
      setSelectedCategories(new Set(allCategories));
    }
  };
  const handleSelectNone = () => {
    setSelectedCategories(/* @__PURE__ */ new Set());
  };
  const handleImport = async () => {
    if (!previewData || selectedCategories.size === 0) return;
    setStep("importing");
    setError(null);
    try {
      const result = await window.api.backup.importSelective({
        filePath: previewData.filePath,
        categories: Array.from(selectedCategories),
        mergeMode
      });
      if (result.success) {
        setImportResult({
          message: result.message,
          imported: result.imported
        });
        setStep("complete");
        onImportComplete?.();
      } else {
        setError(result.message || "Import failed");
        setStep("error");
      }
    } catch (err) {
      console.error("Import failed:", err);
      setError("An unexpected error occurred during import");
      setStep("error");
    }
  };
  const totalSelectedRecords = previewData ? previewData.categories.filter((c) => selectedCategories.has(c.id)).reduce((sum, c) => sum + c.totalRecords, 0) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className: "h-5 w-5" }),
        step === "select" && "Import Backup",
        step === "preview" && "Select Data to Import",
        step === "importing" && "Importing Data...",
        step === "complete" && "Import Complete",
        step === "error" && "Import Error"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        step === "select" && "Select a backup file to preview and import data from.",
        step === "preview" && "Choose which categories of data you want to import.",
        step === "importing" && "Please wait while your data is being imported.",
        step === "complete" && "Your data has been successfully imported.",
        step === "error" && "There was a problem importing your data."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-hidden py-4", children: [
      step === "select" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-16 w-16 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium", children: "Choose Backup File" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "Select a backup file (.db) to preview its contents. You'll be able to choose which data categories to import." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSelectFile, disabled: isLoading, size: "lg", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
          "Reading Backup..."
        ] }) : "Select Backup File" }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-2", children: error })
      ] }),
      step === "preview" && previewData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-3 bg-muted rounded-lg text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "File:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: previewData.filePath.split("/").pop() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Size:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatBytes(previewData.backupSize) })
          ] }),
          previewData.backupDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Last Data:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatDate(previewData.backupDate) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Import Mode:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mergeMode, onValueChange: (v) => setMergeMode(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "replace", children: "Replace Existing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "merge", children: "Merge (Add New)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleSelectAll, children: "Select All" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleSelectNone, children: "Clear" })
          ] })
        ] }),
        mergeMode === "replace" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-yellow-600 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-yellow-700 dark:text-yellow-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Replace mode" }),
            " will delete existing data in selected categories before importing. A safety backup will be created automatically."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[280px] border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: previewData.categories.map((category) => {
          const Icon = categoryIcons[category.id] || Database;
          const isExpanded = expandedCategories.has(category.id);
          const isSelected = selectedCategories.has(category.id);
          const hasData = category.totalRecords > 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer",
                  isSelected && "bg-primary/10"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked: isSelected,
                      disabled: !hasData,
                      onCheckedChange: () => handleToggleCategory(category.id)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleToggleExpand(category.id),
                      className: "p-0.5",
                      children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex-1",
                      onClick: () => hasData && handleToggleCategory(category.id),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: category.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: hasData ? "default" : "secondary", children: [
                            category.totalRecords.toLocaleString(),
                            " records"
                          ] }),
                          category.id === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Caution" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: category.description })
                      ]
                    }
                  )
                ]
              }
            ),
            isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-14 pl-4 border-l-2 border-muted mb-2", children: category.tables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between py-1 text-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: table.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: table.count.toLocaleString() })
                ]
              },
              table.name
            )) })
          ] }, category.id);
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedCategories.size }),
            " categories selected"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: totalSelectedRecords.toLocaleString() }),
            " records to import"
          ] })
        ] })
      ] }),
      step === "importing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-16 w-16 text-primary animate-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium", children: "Importing Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please wait while your data is being imported. This may take a few moments." })
        ] })
      ] }),
      step === "complete" && importResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-16 w-16 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-green-600", children: "Import Successful" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: importResult.message })
          ] })
        ] }),
        importResult.imported && importResult.imported.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "Import Summary:" }),
          importResult.imported.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
              item.records,
              " records"
            ] })
          ] }, index))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-blue-600 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-700 dark:text-blue-400", children: "You may need to refresh the page or restart the application to see all imported data." })
        ] })
      ] }),
      step === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-16 w-16 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-destructive", children: "Import Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: error })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStep("preview"), children: "Try Again" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      step === "select" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      step === "preview" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStep("select"), children: "Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleImport,
            disabled: selectedCategories.size === 0,
            children: [
              "Import ",
              selectedCategories.size > 0 && `(${totalSelectedRecords.toLocaleString()} records)`
            ]
          }
        )
      ] }),
      step === "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onOpenChange(false), children: "Done" }),
      step === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" })
    ] })
  ] }) });
}
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
  const [isResetDialogOpen, setIsResetDialogOpen] = reactExports.useState(false);
  const [resetConfirmationText, setResetConfirmationText] = reactExports.useState("");
  const [resetAdminUsername, setResetAdminUsername] = reactExports.useState("");
  const [resetAdminPassword, setResetAdminPassword] = reactExports.useState("");
  const [isResetting, setIsResetting] = reactExports.useState(false);
  const [resetStep, setResetStep] = reactExports.useState("warning");
  const [backupConfig, setBackupConfig] = reactExports.useState({
    autoBackupEnabled: false,
    autoBackupOnClose: false,
    autoBackupFrequency: "daily",
    autoBackupTime: "23:00",
    autoBackupDay: 0,
    backupRetentionDays: 30,
    lastBackupTime: null
  });
  const [backupList, setBackupList] = reactExports.useState([]);
  const [isBackingUp, setIsBackingUp] = reactExports.useState(false);
  const [isRestoring, setIsRestoring] = reactExports.useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = reactExports.useState(false);
  const [backupDirectory, setBackupDirectory] = reactExports.useState("");
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = reactExports.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = reactExports.useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = reactExports.useState(null);
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
  const handleOpenResetDialog = () => {
    setIsResetDialogOpen(true);
    setResetStep("warning");
    setResetConfirmationText("");
    setResetAdminUsername("");
    setResetAdminPassword("");
  };
  const loadBackupData = async () => {
    setIsLoadingBackups(true);
    try {
      const [configResult, listResult, dirResult] = await Promise.all([
        window.api.backup.getConfig(),
        window.api.backup.list(),
        window.api.backup.getDirectory()
      ]);
      if (configResult.success && configResult.data) {
        setBackupConfig(configResult.data);
      }
      if (listResult.success && listResult.data) {
        setBackupList(listResult.data);
      }
      if (dirResult.success && dirResult.data) {
        setBackupDirectory(dirResult.data);
      }
    } catch (err) {
      console.error("Failed to load backup data:", err);
    } finally {
      setIsLoadingBackups(false);
    }
  };
  const handleCreateBackup = async () => {
    if (!user) return;
    setIsBackingUp(true);
    try {
      const result = await window.api.backup.create(user.userId);
      if (result.success) {
        alert(result.message);
        await loadBackupData();
      } else {
        alert(result.message || "Failed to create backup");
      }
    } catch (err) {
      console.error("Backup creation failed:", err);
      alert("Failed to create backup");
    } finally {
      setIsBackingUp(false);
    }
  };
  const handleExportBackup = async () => {
    if (!user) return;
    try {
      const result = await window.api.backup.export(user.userId);
      if (result.success) {
        alert(result.message);
      } else {
        if (result.message !== "Export cancelled") {
          alert(result.message || "Failed to export backup");
        }
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export backup");
    }
  };
  const handleImportBackup = () => {
    setIsImportDialogOpen(true);
  };
  const handleImportComplete = () => {
    fetchBackups();
  };
  const handleRestoreBackup = async (backup) => {
    setSelectedBackupForRestore(backup);
    setIsRestoreDialogOpen(true);
  };
  const confirmRestoreBackup = async () => {
    if (!user || !selectedBackupForRestore) return;
    setIsRestoring(true);
    try {
      const result = await window.api.backup.restore(selectedBackupForRestore.path, user.userId);
      if (result.success) {
        alert(result.message + "\n\nThe application will now restart.");
        setIsRestoreDialogOpen(false);
        window.location.reload();
      } else {
        alert(result.message || "Failed to restore backup");
      }
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore backup");
    } finally {
      setIsRestoring(false);
    }
  };
  const handleDeleteBackup = async (backup) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete this backup?

${backup.name}`)) {
      return;
    }
    try {
      const result = await window.api.backup.delete(backup.path, user.userId);
      if (result.success) {
        alert(result.message);
        await loadBackupData();
      } else {
        alert(result.message || "Failed to delete backup");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete backup");
    }
  };
  const handleUpdateBackupConfig = async (updates) => {
    if (!user) return;
    try {
      const newConfig = { ...backupConfig, ...updates };
      const result = await window.api.backup.updateConfig(newConfig, user.userId);
      if (result.success && result.data) {
        setBackupConfig(result.data);
        if ("autoBackupEnabled" in updates) {
          console.log(updates.autoBackupEnabled ? "Scheduled automatic backups enabled" : "Scheduled automatic backups disabled");
        }
        if ("autoBackupOnClose" in updates) {
          console.log(updates.autoBackupOnClose ? "Backup on close enabled" : "Backup on close disabled");
        }
      } else {
        alert(result.message || "Failed to update backup configuration");
      }
    } catch (err) {
      console.error("Config update failed:", err);
      alert("Failed to update backup configuration");
    }
  };
  const handleCleanOldBackups = async () => {
    if (!confirm(`This will delete all backups older than ${backupConfig.backupRetentionDays} days. Continue?`)) {
      return;
    }
    try {
      const result = await window.api.backup.cleanOld(backupConfig.backupRetentionDays);
      if (result.success) {
        alert(result.message);
        await loadBackupData();
      } else {
        alert(result.message || "Failed to clean old backups");
      }
    } catch (err) {
      console.error("Clean failed:", err);
      alert("Failed to clean old backups");
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const formatDate2 = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  reactExports.useEffect(() => {
    if (isAdmin) {
      loadBackupData();
    }
  }, [isAdmin]);
  const handleResetDialogNext = () => {
    if (resetStep === "warning") {
      setResetStep("confirm");
    } else if (resetStep === "confirm") {
      if (resetConfirmationText === "RESET") {
        setResetStep("auth");
      } else {
        alert('Please type "RESET" exactly to continue.');
      }
    }
  };
  const handleHardReset = async () => {
    if (!resetAdminUsername || !resetAdminPassword) {
      alert("Please enter admin credentials");
      return;
    }
    setIsResetting(true);
    setResetStep("progress");
    try {
      const verifyResult = await window.api.database.verifyAdmin(
        resetAdminUsername,
        resetAdminPassword
      );
      if (!verifyResult.success) {
        alert(verifyResult.message || "Invalid admin credentials");
        setIsResetting(false);
        setResetStep("auth");
        return;
      }
      const result = await window.api.database.hardReset(resetConfirmationText);
      if (result.success) {
        alert(result.message + "\n\nThe application will now restart.");
        setIsResetDialogOpen(false);
        await window.api.auth.logout();
        window.location.reload();
      } else {
        alert(result.message || "Failed to reset database");
        setResetStep("auth");
      }
    } catch (err) {
      console.error("Hard reset error:", err);
      alert("An error occurred during database reset");
      setResetStep("auth");
    } finally {
      setIsResetting(false);
    }
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 text-red-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-2 text-foreground", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Only administrators can access business settings. Please contact your administrator if you need to modify settings." })
    ] }) });
  }
  if (isLoading && !currentSettings) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin mx-auto mb-3 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Loading settings..." })
    ] }) });
  }
  if (isLoadingSettings && !currentSettings) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin mx-auto mb-3 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Loading settings..." })
    ] }) });
  }
  const selectedBranchLabel = selectedBranchId === null ? "Global Settings" : branches.find((b) => b.id === selectedBranchId)?.name ?? "Unknown Branch";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t-2 border-primary/30 bg-background border-b border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 rounded bg-primary/10 border border-primary/20 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold leading-tight tracking-wide truncate", children: "Business Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-tight", children: "Configure global and branch-specific settings" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:ml-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-primary shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedBranchId === null ? "global" : selectedBranchId.toString(),
            onValueChange: (val) => handleBranchChange(val === "global" ? null : parseInt(val)),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-[200px] border-primary/20 bg-primary/5 focus:ring-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch or global" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "global", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-3.5 h-3.5" }),
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
        isLoadingSettings && /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin text-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 sm:ml-auto shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs border-primary/20 hover:border-primary/40 hover:bg-primary/5",
            onClick: () => {
              setDialogMode("clone");
              setIsDialogOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Clone"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-0",
            onClick: () => {
              setDialogMode("create");
              setIsDialogOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1.5" }),
              "New Settings"
            ]
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-3 bg-destructive/10 border border-destructive/40 text-destructive px-3 py-2 rounded-md flex items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 shrink-0" }),
      error
    ] }),
    currentSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveSettings, className: "relative flex flex-col flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-5 pt-4 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "business", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8 bg-muted/50 border border-border p-0.5 mb-5 w-full grid grid-cols-5 lg:grid-cols-10 gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "business",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Business" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "tax",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Tax" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "receipt",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Receipt" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "customize",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Customize" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "inventory",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Inventory" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "sales",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Sales" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "hours",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Hours" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "system",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "System" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "all",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "All" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "danger",
              className: "h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-red-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none text-red-500/70",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: "Danger" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "business", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-primary" }),
              "Business Information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Basic business details and contact information" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessName", className: "text-xs font-medium mb-1 block", children: "Business Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessName",
                  className: "h-8 text-sm",
                  value: currentSettings.businessName || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessName: e.target.value }),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessRegistrationNo", className: "text-xs font-medium mb-1 block", children: "Registration Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessRegistrationNo",
                  className: "h-8 text-sm",
                  value: currentSettings.businessRegistrationNo || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessRegistrationNo: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessType", className: "text-xs font-medium mb-1 block", children: "Business Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.businessType || "",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, businessType: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BUSINESS_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type, children: type }, type)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessPhone", className: "text-xs font-medium mb-1 block", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessPhone",
                  className: "h-8 text-sm",
                  value: currentSettings.businessPhone || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessPhone: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessEmail", className: "text-xs font-medium mb-1 block", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessEmail",
                  type: "email",
                  className: "h-8 text-sm",
                  value: currentSettings.businessEmail || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessEmail: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessWebsite", className: "text-xs font-medium mb-1 block", children: "Website" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessWebsite",
                  className: "h-8 text-sm",
                  value: currentSettings.businessWebsite || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessWebsite: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessAddress", className: "text-xs font-medium mb-1 block", children: "Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "businessAddress",
                  className: "text-sm resize-none",
                  rows: 2,
                  value: currentSettings.businessAddress || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessAddress: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCity", className: "text-xs font-medium mb-1 block", children: "City" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessCity",
                  className: "h-8 text-sm",
                  value: currentSettings.businessCity || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessCity: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessState", className: "text-xs font-medium mb-1 block", children: "State / Province" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessState",
                  className: "h-8 text-sm",
                  value: currentSettings.businessState || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessState: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "businessCountry", className: "text-xs font-medium mb-1 block", children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "businessCountry",
                  className: "h-8 text-sm",
                  value: currentSettings.businessCountry || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, businessCountry: e.target.value })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tax", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-primary" }),
              "Tax & Currency Configuration"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure tax rates and currency formatting" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxName", className: "text-xs font-medium mb-1 block", children: "Tax Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxName",
                  className: "h-8 text-sm",
                  value: currentSettings.taxName || "GST",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, taxName: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxRate", className: "text-xs font-medium mb-1 block", children: "Tax Rate (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxRate",
                  type: "number",
                  min: "0",
                  max: "100",
                  step: "0.01",
                  className: "h-8 text-sm",
                  value: currentSettings.taxRate || 0,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    taxRate: parseFloat(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "taxId", className: "text-xs font-medium mb-1 block", children: "Tax ID / EIN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "taxId",
                  className: "h-8 text-sm",
                  value: currentSettings.taxId || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, taxId: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyCode", className: "text-xs font-medium mb-1 block", children: "Currency Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "currencyCode",
                  className: "h-8 text-sm",
                  value: currentSettings.currencyCode || "PKR",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, currencyCode: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencySymbol", className: "text-xs font-medium mb-1 block", children: "Currency Symbol" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "currencySymbol",
                  className: "h-8 text-sm",
                  value: currentSettings.currencySymbol || "Rs.",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, currencySymbol: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currencyPosition", className: "text-xs font-medium mb-1 block", children: "Symbol Position" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.currencyPosition || "prefix",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, currencyPosition: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "prefix", children: "Prefix (e.g., Rs.100)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suffix", children: "Suffix (e.g., 100 Rs.)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "decimalPlaces", className: "text-xs font-medium mb-1 block", children: "Decimal Places" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "decimalPlaces",
                  type: "number",
                  min: "0",
                  max: "4",
                  className: "h-8 text-sm",
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "receipt", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4 text-primary" }),
              "Receipt & Invoice Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure receipt and invoice formatting" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoicePrefix", className: "text-xs font-medium mb-1 block", children: "Invoice Prefix" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "invoicePrefix",
                  className: "h-8 text-sm",
                  value: currentSettings.invoicePrefix || "INV",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, invoicePrefix: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceNumberFormat", className: "text-xs font-medium mb-1 block", children: "Number Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.invoiceNumberFormat || "sequential",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, invoiceNumberFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sequential", children: "Sequential (0001)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "date-based", children: "Date-based (202401010001)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceStartingNumber", className: "text-xs font-medium mb-1 block", children: "Starting Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "invoiceStartingNumber",
                  type: "number",
                  min: "1",
                  className: "h-8 text-sm",
                  value: currentSettings.invoiceStartingNumber || 1,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    invoiceStartingNumber: parseInt(e.target.value) || 1
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptHeader", className: "text-xs font-medium mb-1 block", children: "Receipt Header" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "receiptHeader",
                  className: "text-sm resize-none",
                  rows: 2,
                  value: currentSettings.receiptHeader || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptHeader: e.target.value }),
                  placeholder: "Header text shown at the top of receipts"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "receiptFooter", className: "text-xs font-medium mb-1 block", children: "Receipt Footer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "receiptFooter",
                  className: "text-sm resize-none",
                  rows: 2,
                  value: currentSettings.receiptFooter || "",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptFooter: e.target.value }),
                  placeholder: "Footer text shown at the bottom of receipts"
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "customize", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.receiptFormat || "pdf",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, receiptFormat: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-[120px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pdf", children: "PDF (A4)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "thermal", children: "Thermal (80mm)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "color",
                  value: currentSettings.receiptPrimaryColor || "#1e40af",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptPrimaryColor: e.target.value }),
                  className: "w-7 h-7 p-0.5 cursor-pointer rounded border-border",
                  title: "Primary Color"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: currentSettings.receiptPrimaryColor || "#1e40af",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptPrimaryColor: e.target.value }),
                  className: "h-7 text-[10px] font-mono w-[72px]"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "color",
                  value: currentSettings.receiptSecondaryColor || "#64748b",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptSecondaryColor: e.target.value }),
                  className: "w-7 h-7 p-0.5 cursor-pointer rounded border-border",
                  title: "Secondary Color"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: currentSettings.receiptSecondaryColor || "#64748b",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, receiptSecondaryColor: e.target.value }),
                  className: "h-7 text-[10px] font-mono w-[72px]"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.receiptFontSize || "medium",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, receiptFontSize: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-[90px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "small", children: "Small" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "large", children: "Large" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setCurrentSettings({ ...currentSettings, receiptShowBusinessLogo: !currentSettings.receiptShowBusinessLogo }),
                className: `flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${currentSettings.receiptShowBusinessLogo !== false ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"}`,
                title: "Toggle business logo",
                children: [
                  currentSettings.receiptShowBusinessLogo !== false ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3" }),
                  "Logo"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setCurrentSettings({ ...currentSettings, receiptAutoDownload: !currentSettings.receiptAutoDownload }),
                className: `flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${currentSettings.receiptAutoDownload !== false ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"}`,
                title: "Auto-download after sale",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3" }),
                  "Auto"
                ]
              }
            )
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "py-2 px-4 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }),
                "Live Preview"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("link", { href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Pinyon+Script&display=swap", rel: "stylesheet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-full max-w-[480px] shadow-lg border rounded-sm",
                    style: {
                      background: "#f5f5f5",
                      borderColor: "#e5e5e5",
                      fontFamily: "'IBM Plex Mono', 'Consolas', 'Monaco', monospace"
                    },
                    children: (() => {
                      const primaryColor = currentSettings.receiptPrimaryColor || "#1e40af";
                      currentSettings.receiptSecondaryColor || "#64748b";
                      const fontSize = currentSettings.receiptFontSize || "medium";
                      const sizes = fontSize === "small" ? { base: 10, header: 15, title: 28, caption: 8 } : fontSize === "large" ? { base: 13, header: 19, title: 36, caption: 10 } : { base: 11, header: 17, title: 32, caption: 9 };
                      const currencySymbol = currentSettings.currencySymbol || "Rs.";
                      const subtotal = 97200;
                      const taxAmt = Math.round(subtotal * ((currentSettings.taxRate ?? 0) / 100));
                      const total = subtotal + taxAmt;
                      const fmtCurrency = (amt) => `${currencySymbol} ${amt.toLocaleString("en-PK", { minimumFractionDigits: currentSettings.decimalPlaces ?? 2, maximumFractionDigits: currentSettings.decimalPlaces ?? 2 })}`;
                      const today = /* @__PURE__ */ new Date();
                      const formattedDate = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" });
                      const dueDate = new Date(today);
                      dueDate.setDate(dueDate.getDate() + 7);
                      const formattedDueDate = dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" });
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 28px", color: "#1a1a1a", fontSize: `${sizes.base}px`, lineHeight: 1.5 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 }, children: [
                          currentSettings.receiptShowBusinessLogo !== false && currentSettings.businessLogo && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: currentSettings.businessLogo,
                              alt: "Logo",
                              style: { width: 40, height: 40, objectFit: "contain" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${sizes.header}px`, fontWeight: 700, letterSpacing: 0.5, color: "#1a1a1a" }, children: currentSettings.businessName || "Business Name" }),
                            currentSettings.receiptHeader ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${sizes.caption}px`, color: "#444", lineHeight: 1.3 }, children: currentSettings.receiptHeader }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: `${sizes.caption}px`, color: "#444", lineHeight: 1.3 }, children: [
                              "Point of Sales",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                              "Inventory Management",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                              "System"
                            ] })
                          ] })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${sizes.title}px`, fontWeight: 400, fontStyle: "italic", letterSpacing: 2, color: "#1a1a1a" }, children: "Invoice" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", fontSize: `${sizes.base}px`, lineHeight: 1.4 }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600 }, children: "Walk-in Customer" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#666" }, children: "03001234567" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: `${sizes.base}px` }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              "No: ",
                              currentSettings.invoicePrefix || "INV",
                              "-00001"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "To: Walk-in Customer" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              "Date: ",
                              formattedDate
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              "Due Date: ",
                              formattedDueDate
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "2px solid #1a1a1a", margin: "8px 0" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: `${sizes.base}px` }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #1a1a1a" }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 4px", textAlign: "left", fontWeight: 600, width: 28 }, children: "No" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 4px", textAlign: "left", fontWeight: 600 }, children: "Description" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 4px", textAlign: "left", fontWeight: 600, width: 70 }, children: "Price" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 4px", textAlign: "center", fontWeight: 600, width: 34 }, children: "Qty" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 4px", textAlign: "right", fontWeight: 600, width: 76 }, children: "Total" })
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
                            { name: "Glock 19 Gen5", sn: "SN: GLK19-28374", price: 85e3, qty: 1 },
                            { name: "9mm Ammo Box (50)", price: 4500, qty: 2 },
                            { name: "Cleaning Kit Pro", price: 3200, qty: 1, isSvc: true }
                          ].map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: item.isSvc ? { background: "rgba(37, 99, 235, 0.05)" } : void 0, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "8px 4px", verticalAlign: "top" }, children: [
                              i + 1,
                              "."
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "8px 4px", verticalAlign: "top" }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 500 }, children: [
                                item.name,
                                item.isSvc && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: `${sizes.caption - 1}px`, color: primaryColor, fontWeight: 600, marginLeft: 4 }, children: "[SERVICE]" })
                              ] }),
                              item.sn && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${sizes.caption}px`, color: "#666", marginTop: 1 }, children: item.sn })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 4px", textAlign: "left", verticalAlign: "top" }, children: fmtCurrency(item.price) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 4px", textAlign: "center", verticalAlign: "top" }, children: item.qty }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 4px", textAlign: "right", verticalAlign: "top", fontWeight: 500 }, children: fmtCurrency(item.price * item.qty) })
                          ] }, i)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "2px solid #1a1a1a", marginTop: 8, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, fontStyle: "italic", fontSize: `${sizes.caption + 1}px`, lineHeight: 1.4, maxWidth: 200, paddingRight: 16, color: "#333" }, children: currentSettings.receiptTermsAndConditions || /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontStyle: "italic" }, children: "Important:" }),
                            " The invoice amount must be paid no later than 7 business days after issuance."
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", fontSize: `${sizes.base}px` }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 3 }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SUBTOTAL" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                ": ",
                                fmtCurrency(subtotal)
                              ] })
                            ] }),
                            currentSettings.showTaxOnReceipt !== false && (currentSettings.taxRate ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 3 }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "TAX (",
                                currentSettings.taxRate,
                                "%)"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                ": ",
                                fmtCurrency(taxAmt)
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 24, fontWeight: 700, fontSize: `${sizes.base + 1}px`, marginTop: 6, paddingTop: 6, borderTop: "1px solid #1a1a1a" }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TOTAL" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                ": ",
                                fmtCurrency(total)
                              ] })
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "2px solid #1a1a1a", marginTop: 16, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: `${sizes.base}px`, lineHeight: 1.5 }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, marginBottom: 3 }, children: "Payment Information:" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#333" }, children: "Payment Method: Cash" }),
                            currentSettings.receiptCustomField1Label && currentSettings.receiptCustomField1Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#333" }, children: [
                              currentSettings.receiptCustomField1Label,
                              ": ",
                              currentSettings.receiptCustomField1Value
                            ] }),
                            currentSettings.receiptCustomField2Label && currentSettings.receiptCustomField2Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#333" }, children: [
                              currentSettings.receiptCustomField2Label,
                              ": ",
                              currentSettings.receiptCustomField2Value
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#333" }, children: [
                              "Amount Paid: ",
                              fmtCurrency(total)
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "'Pinyon Script', cursive", fontSize: 30, color: "#1a1a1a" }, children: "Thank You" })
                        ] }),
                        currentSettings.receiptCustomField3Label && currentSettings.receiptCustomField3Value && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, fontSize: `${sizes.caption + 1}px`, color: "#666" }, children: [
                          currentSettings.receiptCustomField3Label,
                          ": ",
                          currentSettings.receiptCustomField3Value
                        ] }),
                        currentSettings.receiptFooter && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 20, paddingTop: 12, borderTop: "1px solid #ccc", textAlign: "center", fontSize: `${sizes.caption}px`, color: "#888", lineHeight: 1.4 }, children: currentSettings.receiptFooter })
                      ] });
                    })()
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "py-2 px-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 text-primary" }),
                  "Custom Fields"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 space-y-3", children: [1, 2, 3].map((n) => {
                  const labelKey = `receiptCustomField${n}Label`;
                  const valueKey = `receiptCustomField${n}Value`;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_2fr] gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        className: "h-8 text-sm",
                        value: currentSettings[labelKey] || "",
                        onChange: (e) => setCurrentSettings({ ...currentSettings, [labelKey]: e.target.value }),
                        placeholder: `Field ${n} Label`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        className: "h-8 text-sm",
                        value: currentSettings[valueKey] || "",
                        onChange: (e) => setCurrentSettings({ ...currentSettings, [valueKey]: e.target.value }),
                        placeholder: `Field ${n} Value`
                      }
                    )
                  ] }, n);
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "py-2 px-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 text-primary" }),
                  "Terms & Conditions"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    className: "text-sm resize-none",
                    value: currentSettings.receiptTermsAndConditions || "",
                    onChange: (e) => setCurrentSettings({ ...currentSettings, receiptTermsAndConditions: e.target.value }),
                    placeholder: "Return policy, warranty information, legal disclaimers, etc.",
                    rows: 3
                  }
                ) })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inventory", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-primary" }),
              "Inventory Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure inventory tracking and stock management" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lowStockThreshold", className: "text-xs font-medium mb-1 block", children: "Low Stock Threshold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "lowStockThreshold",
                  type: "number",
                  min: "0",
                  className: "h-8 text-sm",
                  value: currentSettings.lowStockThreshold ?? 10,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    lowStockThreshold: parseInt(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stockValuationMethod", className: "text-xs font-medium mb-1 block", children: "Valuation Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.stockValuationMethod || "FIFO",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, stockValuationMethod: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STOCK_VALUATION_METHODS.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: method, children: method }, method)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoReorderQuantity", className: "text-xs font-medium mb-1 block", children: "Auto Reorder Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "autoReorderQuantity",
                  type: "number",
                  min: "0",
                  className: "h-8 text-sm",
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sales", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-4 h-4 text-primary" }),
              "Sales & Payment Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure sales, payment methods, and discounts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "defaultPaymentMethod", className: "text-xs font-medium mb-1 block", children: "Default Payment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "defaultPaymentMethod",
                  className: "h-8 text-sm",
                  value: currentSettings.defaultPaymentMethod || "Cash",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, defaultPaymentMethod: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "allowedPaymentMethods", className: "text-xs font-medium mb-1 block", children: "Allowed Payment Methods" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "allowedPaymentMethods",
                  className: "h-8 text-sm",
                  value: currentSettings.allowedPaymentMethods || "Cash,Card,Bank Transfer,COD",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, allowedPaymentMethods: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "maxDiscountPercentage", className: "text-xs font-medium mb-1 block", children: "Max Discount (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "maxDiscountPercentage",
                  type: "number",
                  min: "0",
                  max: "100",
                  className: "h-8 text-sm",
                  value: currentSettings.maxDiscountPercentage ?? 50,
                  onChange: (e) => setCurrentSettings({
                    ...currentSettings,
                    maxDiscountPercentage: parseFloat(e.target.value) || 0
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "openingCashBalance", className: "text-xs font-medium mb-1 block", children: "Opening Cash Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "openingCashBalance",
                  type: "number",
                  min: "0",
                  step: "0.01",
                  className: "h-8 text-sm",
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hours", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-primary" }),
              "Working Hours"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure operating hours for this business / branch" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "workingDaysStart", className: "text-xs font-medium mb-1 block", children: "Week Starts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.workingDaysStart || "Monday",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, workingDaysStart: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DAYS_OF_WEEK.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: day, children: day }, day)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "workingDaysEnd", className: "text-xs font-medium mb-1 block", children: "Week Ends" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: currentSettings.workingDaysEnd || "Saturday",
                  onValueChange: (val) => setCurrentSettings({ ...currentSettings, workingDaysEnd: val }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DAYS_OF_WEEK.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: day, children: day }, day)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "openingTime", className: "text-xs font-medium mb-1 block", children: "Opening Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "openingTime",
                  type: "time",
                  className: "h-8 text-sm",
                  value: currentSettings.openingTime || "09:00",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, openingTime: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "closingTime", className: "text-xs font-medium mb-1 block", children: "Closing Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "closingTime",
                  type: "time",
                  className: "h-8 text-sm",
                  value: currentSettings.closingTime || "18:00",
                  onChange: (e) => setCurrentSettings({ ...currentSettings, closingTime: e.target.value })
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "system", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4 text-primary" }),
                "System Preferences"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Configure date, time, language, and locale settings" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateFormat", className: "text-xs font-medium mb-1 block", children: "Date Format" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: currentSettings.dateFormat || "DD/MM/YYYY",
                    onValueChange: (val) => setCurrentSettings({ ...currentSettings, dateFormat: val }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DATE_FORMATS.map((format) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: format, children: format }, format)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timeFormat", className: "text-xs font-medium mb-1 block", children: "Time Format" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: currentSettings.timeFormat || "24-hour",
                    onValueChange: (val) => setCurrentSettings({ ...currentSettings, timeFormat: val }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIME_FORMATS.map((format) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: format, children: format }, format)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timezone", className: "text-xs font-medium mb-1 block", children: "Timezone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: currentSettings.timezone || "UTC",
                    onValueChange: (val) => setCurrentSettings({ ...currentSettings, timezone: val }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz, children: tz }, tz)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "language", className: "text-xs font-medium mb-1 block", children: "Language" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "language",
                    className: "h-8 text-sm",
                    value: currentSettings.language || "en",
                    onChange: (e) => setCurrentSettings({ ...currentSettings, language: e.target.value })
                  }
                )
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "w-4 h-4 text-primary" }),
                "Backup & Restore"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Create backups, restore from backups, and configure automatic backup settings" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Quick Actions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      className: "h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-0",
                      onClick: handleCreateBackup,
                      disabled: isBackingUp,
                      children: [
                        isBackingUp ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5 mr-1.5" }),
                        isBackingUp ? "Creating..." : "Create Backup"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      className: "h-8 text-xs",
                      onClick: handleExportBackup,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "w-3.5 h-3.5 mr-1.5" }),
                        "Export to File"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      className: "h-8 text-xs",
                      onClick: handleImportBackup,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5 mr-1.5" }),
                        "Import Data"
                      ]
                    }
                  )
                ] }),
                backupConfig.lastBackupTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-2", children: [
                  "Last backup: ",
                  formatDate2(backupConfig.lastBackupTime)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Automatic Backup" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 col-span-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        id: "autoBackupOnClose",
                        checked: backupConfig.autoBackupOnClose,
                        onChange: (e) => handleUpdateBackupConfig({ autoBackupOnClose: e.target.checked }),
                        className: "h-4 w-4 rounded border-gray-300 accent-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupOnClose", className: "text-xs cursor-pointer", children: "Create backup when application closes" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 col-span-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        id: "autoBackupEnabled",
                        checked: backupConfig.autoBackupEnabled,
                        onChange: (e) => handleUpdateBackupConfig({ autoBackupEnabled: e.target.checked }),
                        className: "h-4 w-4 rounded border-gray-300 accent-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupEnabled", className: "text-xs cursor-pointer", children: "Enable scheduled automatic backups" })
                  ] }),
                  backupConfig.autoBackupEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupFrequency", className: "text-xs font-medium mb-1 block", children: "Backup Frequency" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: backupConfig.autoBackupFrequency,
                          onValueChange: (val) => handleUpdateBackupConfig({ autoBackupFrequency: val }),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: "Daily" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" })
                            ] })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupTime", className: "text-xs font-medium mb-1 block", children: "Backup Time" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "autoBackupTime",
                          type: "time",
                          className: "h-8 text-sm",
                          value: backupConfig.autoBackupTime,
                          onChange: (e) => handleUpdateBackupConfig({ autoBackupTime: e.target.value })
                        }
                      )
                    ] }),
                    backupConfig.autoBackupFrequency === "weekly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupDay", className: "text-xs font-medium mb-1 block", children: "Day of Week" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: backupConfig.autoBackupDay.toString(),
                          onValueChange: (val) => handleUpdateBackupConfig({ autoBackupDay: parseInt(val) }),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "Sunday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "Monday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "Tuesday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "Wednesday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "Thursday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "Friday" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "6", children: "Saturday" })
                            ] })
                          ]
                        }
                      )
                    ] }),
                    backupConfig.autoBackupFrequency === "monthly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autoBackupDayMonth", className: "text-xs font-medium mb-1 block", children: "Day of Month" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "autoBackupDayMonth",
                          type: "number",
                          min: "1",
                          max: "28",
                          className: "h-8 text-sm",
                          value: backupConfig.autoBackupDay,
                          onChange: (e) => handleUpdateBackupConfig({ autoBackupDay: parseInt(e.target.value) || 1 })
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "backupRetentionDays", className: "text-xs font-medium mb-1 block", children: "Keep Backups For (Days)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "backupRetentionDays",
                        type: "number",
                        min: "1",
                        max: "365",
                        className: "h-8 text-sm",
                        value: backupConfig.backupRetentionDays,
                        onChange: (e) => handleUpdateBackupConfig({ backupRetentionDays: parseInt(e.target.value) || 30 })
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Existing Backups" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-7 text-xs",
                        onClick: loadBackupData,
                        disabled: isLoadingBackups,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3 h-3 mr-1 ${isLoadingBackups ? "animate-spin" : ""}` }),
                          "Refresh"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-7 text-xs",
                        onClick: handleCleanOldBackups,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 mr-1" }),
                          "Clean Old"
                        ]
                      }
                    )
                  ] })
                ] }),
                backupDirectory && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-2 font-mono truncate", children: backupDirectory }),
                isLoadingBackups ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5 animate-spin text-primary" }) }) : backupList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: "No backups found" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Create your first backup using the button above" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Backup Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Created" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Size" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto text-right w-20", children: "Actions" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: backupList.map((backup) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-primary/5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 font-mono text-xs", children: backup.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: formatDate2(backup.createdAt) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-xs text-muted-foreground", children: formatFileSize(backup.size) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          variant: "ghost",
                          size: "sm",
                          className: "h-6 w-6 p-0 hover:text-primary",
                          onClick: () => handleRestoreBackup(backup),
                          disabled: isRestoring,
                          title: "Restore this backup",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          variant: "ghost",
                          size: "sm",
                          className: "h-6 w-6 p-0 hover:text-destructive",
                          onClick: () => handleDeleteBackup(backup),
                          title: "Delete this backup",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                        }
                      )
                    ] }) })
                  ] }, backup.path)) })
                ] }) })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-2 border-l-primary/20 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4 text-primary" }),
              "All Business Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: "Overview of all business configurations across branches" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto pl-4", children: "Business Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Branch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Tax Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 h-auto text-right pr-4", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              allSettings.map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableRow,
                {
                  className: `hover:bg-primary/5 ${setting.branchId === selectedBranchId ? "bg-primary/10" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-xs font-medium pl-4", children: setting.businessName || "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-xs", children: setting.branchId === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] h-5 px-1.5 border-primary/40 text-primary", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-3 h-3 mr-1" }),
                      "Global"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: setting.branch?.name || `Branch ${setting.branchId}` }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-2 text-xs text-muted-foreground", children: [
                      setting.currencySymbol,
                      " (",
                      setting.currencyCode,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-2 text-xs text-muted-foreground", children: [
                      setting.taxRate,
                      "%"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        variant: setting.isActive ? "default" : "destructive",
                        className: "text-[10px] h-5 px-1.5",
                        children: setting.isActive ? "Active" : "Inactive"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-right pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          variant: "ghost",
                          size: "sm",
                          className: "h-6 w-6 p-0 hover:text-primary",
                          onClick: () => handleBranchChange(setting.branchId),
                          title: "Edit this settings",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                        }
                      ),
                      setting.branchId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          variant: "ghost",
                          size: "sm",
                          className: "h-6 w-6 p-0 hover:text-destructive",
                          onClick: () => handleDeleteSettings(setting.settingId),
                          title: "Delete this settings",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                        }
                      )
                    ] }) })
                  ]
                },
                setting.settingId
              )),
              allSettings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-xs text-muted-foreground py-8", children: "No business settings configured yet. Create global settings first." }) })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "danger", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-red-800/40 bg-red-950/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 border-b border-red-800/30 bg-red-950/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2 text-red-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
              "Danger Zone"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs text-red-400/70", children: "Dangerous operations that can permanently affect your data. Use with extreme caution." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-red-700/40 rounded-lg p-5 bg-red-950/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-5 h-5 text-red-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-red-400 mb-1", children: "Hard Reset Database" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "This will permanently delete all data from the database and return the application to a fresh install state. Only the default admin account (username: admin, password: admin123) will remain." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/40 border border-border rounded-md p-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2 text-foreground", children: "What will be deleted:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-muted-foreground space-y-0.5 list-disc list-inside", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All sales, purchases, expenses, and returns" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All products, categories, and inventory records" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All customers, suppliers, and referral persons" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All user accounts (except the default admin)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All branches and business settings" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All audit logs, commissions, and financial records" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All cash register sessions and transactions" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All messages, todos, and chart of accounts" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-500/10 border border-amber-500/40 rounded-md p-3 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary mb-0.5", children: "Warning: This action cannot be undone!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-400/80", children: "All data will be permanently deleted. Make sure you have a backup before proceeding. The application will restart after the reset." })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "destructive",
                  size: "sm",
                  className: "h-8 text-xs bg-red-700 hover:bg-red-800",
                  onClick: handleOpenResetDialog,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1.5" }),
                    "Reset Database"
                  ]
                }
              )
            ] })
          ] }) }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm px-5 py-2.5 flex justify-end gap-2 z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
          "Editing: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-medium", children: selectedBranchLabel })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "h-8 text-xs",
            onClick: fetchData,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Reset"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "submit",
            size: "sm",
            className: "h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-0",
            disabled: isSaving,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5 mr-1.5" }),
              isSaving ? "Saving..." : "Save Settings"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "border-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "flex items-center gap-2 text-sm", children: dialogMode === "clone" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 text-primary" }),
          " Clone Settings"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 text-primary" }),
          " Create New Settings"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: dialogMode === "clone" ? "Select source and target branches to clone settings" : "Create new business settings for a branch" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 py-3", children: dialogMode === "clone" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium mb-1 block", children: "Source Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: cloneSourceBranchId === null ? "global" : cloneSourceBranchId.toString(),
              onValueChange: (val) => setCloneSourceBranchId(val === "global" ? null : parseInt(val)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "global", children: "Global Settings" }),
                  branches.filter((b) => allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium mb-1 block", children: "Target Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cloneTargetBranchId, onValueChange: setCloneTargetBranchId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select target branch" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
          ] }),
          branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "All branches already have settings. Update existing settings instead." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium mb-1 block", children: "Select Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: createBranchId, onValueChange: setCreateBranchId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select branch" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: branch.id.toString(), children: branch.name }, branch.id)) })
        ] }),
        branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "All branches already have settings. Update existing settings instead." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "h-8 text-xs", onClick: () => setIsDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            className: "h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-0",
            onClick: dialogMode === "clone" ? handleCloneSettings : handleCreateSettings,
            disabled: dialogMode === "clone" ? !cloneSourceBranchId || !cloneTargetBranchId : !createBranchId,
            children: dialogMode === "clone" ? "Clone Settings" : "Create Settings"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isRestoreDialogOpen, onOpenChange: setIsRestoreDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "border-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-sm text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          "Confirm Restore"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: "Are you sure you want to restore from this backup?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-500/10 border border-amber-500/40 rounded-md p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary mb-0.5", children: "Warning: This will replace all current data!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-400/80", children: "A safety backup will be created before restoring. The application will restart after the restore is complete." })
          ] })
        ] }) }),
        selectedBackupForRestore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium mb-1", children: selectedBackupForRestore.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Created: ",
            formatDate2(selectedBackupForRestore.createdAt)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Size: ",
            formatFileSize(selectedBackupForRestore.size)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-8 text-xs",
            onClick: () => {
              setIsRestoreDialogOpen(false);
              setSelectedBackupForRestore(null);
            },
            disabled: isRestoring,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            className: "h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-0",
            onClick: confirmRestoreBackup,
            disabled: isRestoring,
            children: isRestoring ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
              "Restoring..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Restore Backup"
            ] })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ImportPreviewDialog,
      {
        open: isImportDialogOpen,
        onOpenChange: setIsImportDialogOpen,
        onImportComplete: handleImportComplete
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isResetDialogOpen, onOpenChange: setIsResetDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg border-red-700/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-sm text-red-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          "Hard Reset Database"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-xs text-muted-foreground", children: [
          resetStep === "warning" && "Read the warning carefully before proceeding",
          resetStep === "confirm" && "Type RESET to confirm this action",
          resetStep === "auth" && "Enter admin credentials to authorize",
          resetStep === "progress" && "Resetting database..."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-1", children: [
        ["warning", "confirm", "auth", "progress"].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${resetStep === step ? "bg-red-600 text-white" : ["warning", "confirm", "auth", "progress"].indexOf(resetStep) > i ? "bg-red-900/50 text-red-400" : "bg-muted text-muted-foreground"}`, children: i + 1 }),
          i < 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-px bg-border" })
        ] }, step)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[11px] text-muted-foreground capitalize", children: resetStep })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2", children: [
        resetStep === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-950/30 border border-red-700/40 rounded-md p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold text-red-400 mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
              "DANGER: This action cannot be undone!"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "This will permanently delete ALL data in the database, including:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-muted-foreground space-y-0.5 list-disc list-inside ml-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All sales, purchases, expenses, and financial records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All products, categories, inventory, and stock records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All customers, suppliers, and referral persons" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All user accounts (a new default admin will be created)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All branches and business settings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All audit logs and system history" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-400 mt-2", children: "Only the default admin account (username: admin, password: admin123) will remain." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-500/10 border border-amber-500/40 rounded-md p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-400/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Important:" }),
            " Make sure you have a complete backup before proceeding. The application will restart after the reset is complete."
          ] }) })
        ] }),
        resetStep === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 border border-border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mb-3", children: [
            "To confirm this action, please type",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-400 font-mono", children: "RESET" }),
            " ",
            "in the box below:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: resetConfirmationText,
              onChange: (e) => setResetConfirmationText(e.target.value),
              placeholder: "Type RESET here",
              className: "h-8 text-sm font-mono border-red-500/30 focus:border-red-500/60",
              autoFocus: true
            }
          )
        ] }),
        resetStep === "auth" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 border border-border rounded-md p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "For security, please enter your admin credentials to authorize this operation:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reset-username", className: "text-xs font-medium mb-1 block", children: "Admin Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "reset-username",
                className: "h-8 text-sm",
                value: resetAdminUsername,
                onChange: (e) => setResetAdminUsername(e.target.value),
                placeholder: "Enter admin username",
                autoFocus: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reset-password", className: "text-xs font-medium mb-1 block", children: "Admin Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "reset-password",
                type: "password",
                className: "h-8 text-sm",
                value: resetAdminPassword,
                onChange: (e) => setResetAdminPassword(e.target.value),
                placeholder: "Enter admin password"
              }
            )
          ] })
        ] }),
        resetStep === "progress" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-10 h-10 text-red-500 animate-spin mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-1", children: "Resetting Database..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
            "Please wait while all data is being deleted. This may take a few moments.",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Do not close this window."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: resetStep !== "progress" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-8 text-xs",
            onClick: () => {
              setIsResetDialogOpen(false);
              setResetStep("warning");
              setResetConfirmationText("");
              setResetAdminUsername("");
              setResetAdminPassword("");
            },
            disabled: isResetting,
            children: "Cancel"
          }
        ),
        resetStep === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 text-xs", onClick: handleResetDialogNext, children: "Continue" }),
        resetStep === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            className: "h-8 text-xs",
            onClick: handleResetDialogNext,
            disabled: resetConfirmationText !== "RESET",
            children: "Next"
          }
        ),
        resetStep === "auth" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            size: "sm",
            className: "h-8 text-xs bg-red-700 hover:bg-red-800",
            onClick: handleHardReset,
            disabled: !resetAdminUsername || !resetAdminPassword || isResetting,
            children: isResetting ? "Resetting..." : "Reset Database"
          }
        )
      ] }) })
    ] }) })
  ] });
}
export {
  BusinessSettingsScreen
};
