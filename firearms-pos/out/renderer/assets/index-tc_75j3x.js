import { c as createLucideIcon, r as reactExports, aQ as useComposedRefs, aP as useControllableState, j as jsxRuntimeExports, aM as createContextScope, aO as Primitive, aR as composeEventHandlers, aS as usePrevious, aT as useSize, av as cn, Y as TooltipProvider, a$ as FolderTree, a4 as Tooltip, a5 as TooltipTrigger, B as Button, q as RefreshCw, a6 as TooltipContent, aj as Plus, I as Input, X, O as ScrollArea, ac as Badge, ak as Trash2, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, p as Textarea, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, al as DialogFooter, aL as ChevronDown, C as ChevronRight } from "./index-DYepRutf.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-By1EGUNt.js";
import { S as Search } from "./search-BPXhvM6p.js";
import { P as Pencil } from "./pencil-BdvO1RzJ.js";
import { F as FolderOpen } from "./folder-open-CZI4flpV.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Folder = createLucideIcon("Folder", [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
]);
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
const initialFormData = {
  name: "",
  description: "",
  parentId: "",
  isActive: true
};
function CategoryTreeNode({
  category,
  level = 0,
  onEdit,
  onDelete,
  expandedIds,
  toggleExpand
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted/40 group transition-colors",
          !category.isActive && "opacity-40"
        ),
        style: { paddingLeft: `${level * 20 + 8}px` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => hasChildren && toggleExpand(category.id),
              className: cn(
                "w-4 h-4 flex items-center justify-center shrink-0 rounded-sm transition-colors",
                hasChildren ? "hover:bg-muted/60 text-muted-foreground/60" : "invisible"
              ),
              children: hasChildren && (isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" }))
            }
          ),
          hasChildren && isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-3.5 w-3.5 text-warning/70 shrink-0" }) : hasChildren ? /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-3.5 w-3.5 text-muted-foreground/50 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 shrink-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-1 rounded-full bg-muted-foreground/30" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-xs font-medium truncate", children: category.name }),
          category.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/30 truncate max-w-[150px] hidden xl:block", children: category.description }),
          hasChildren && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] tabular-nums text-muted-foreground/40 font-medium", children: category.children.length }),
          !category.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-3.5 px-1 text-[8px] font-medium border-border/40 text-muted-foreground/50", children: "OFF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-5 w-5", onClick: () => onEdit(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Edit" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-5 w-5 hover:bg-destructive/10 hover:text-destructive", onClick: () => onDelete(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-2.5 w-2.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Delete" })
            ] })
          ] })
        ]
      }
    ),
    hasChildren && isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: category.children.map((child) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      CategoryTreeNode,
      {
        category: child,
        level: level + 1,
        onEdit,
        onDelete,
        expandedIds,
        toggleExpand
      },
      child.id
    )) })
  ] });
}
function CategoriesManagementScreen() {
  const [categories, setCategories] = reactExports.useState([]);
  const [categoryTree, setCategoryTree] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const [selectedCategory, setSelectedCategory] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [expandedIds, setExpandedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [quickAddName, setQuickAddName] = reactExports.useState("");
  const [isQuickAdding, setIsQuickAdding] = reactExports.useState(false);
  const fetchCategories = reactExports.useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setIsLoading(true);
      const [response, treeResponse] = await Promise.all([
        window.api.categories.getAll(),
        window.api.categories.getTree()
      ]);
      if (response?.success) {
        setCategories(response.data || []);
      }
      if (treeResponse?.success) {
        setCategoryTree(treeResponse.data || []);
        if (showSpinner) {
          const rootIds = new Set((treeResponse.data || []).map((c) => c.id));
          setExpandedIds(rootIds);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const expandAll = () => {
    const allIds = new Set(categories.map((c) => c.id));
    setExpandedIds(allIds);
  };
  const collapseAll = () => {
    setExpandedIds(/* @__PURE__ */ new Set());
  };
  const handleOpenCreateDialog = () => {
    setSelectedCategory(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId?.toString() || "",
      isActive: category.isActive
    });
    setIsDialogOpen(true);
  };
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }
    try {
      setIsSaving(true);
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        isActive: formData.isActive
      };
      let response;
      if (selectedCategory) {
        response = await window.api.categories.update(selectedCategory.id, data);
      } else {
        response = await window.api.categories.create(data);
      }
      if (response?.success) {
        await fetchCategories(false);
        setIsDialogOpen(false);
        setFormData(initialFormData);
        setSelectedCategory(null);
      } else {
        alert(response?.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const response = await window.api.categories.delete(selectedCategory.id);
      if (response?.success) {
        await fetchCategories(false);
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        alert(response?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };
  const handleQuickAdd = async () => {
    if (!quickAddName.trim()) return;
    try {
      setIsQuickAdding(true);
      const response = await window.api.categories.create({
        name: quickAddName.trim(),
        description: null,
        parentId: null,
        isActive: true
      });
      if (response?.success) {
        setQuickAddName("");
        await fetchCategories(false);
      } else {
        alert(response?.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Quick add failed:", error);
      alert("Failed to add category");
    } finally {
      setIsQuickAdding(false);
    }
  };
  const filteredCategories = categories.filter(
    (cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || (cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );
  const getParentOptions = () => {
    return categories.filter((cat) => {
      if (!selectedCategory) return cat.isActive;
      if (cat.id === selectedCategory.id) return false;
      if (cat.parentId === selectedCategory.id) return false;
      return cat.isActive;
    });
  };
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    rootLevel: categories.filter((c) => !c.parentId).length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", style: { height: "calc(100vh - 8rem)" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Categories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: "Organize products, services & expenses" })
        ] }),
        !isLoading && stats.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground", children: [
            stats.total,
            " total"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-success", children: [
            stats.active,
            " active"
          ] }),
          stats.inactive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground/60", children: [
            stats.inactive,
            " inactive"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-primary/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-2.5 w-2.5" }),
            stats.rootLevel,
            " root"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8 border-border/40", onClick: fetchCategories, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleOpenCreateDialog, className: "h-8 px-3 text-xs font-semibold gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Add Category"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col rounded-lg border border-border/50 bg-card/40 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/20 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search categories...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "h-7 pl-8 pr-7 text-xs bg-card/80 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              }
            ),
            searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setSearchTerm(""),
                className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-2.5 w-2.5" })
              }
            )
          ] }),
          !searchTerm && categoryTree.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 ml-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2 text-[10px] text-muted-foreground/50 hover:text-foreground", onClick: expandAll, children: "Expand all" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/20 text-[10px]", children: "|" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2 text-[10px] text-muted-foreground/50 hover:text-foreground", onClick: collapseAll, children: "Collapse" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center gap-2 py-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-primary/50 border-t-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/50", children: "Loading categories..." })
        ] }) : searchTerm ? (
          // Filtered flat list
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5", children: filteredCategories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-6 w-6 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
              'No categories match "',
              searchTerm,
              '"'
            ] })
          ] }) : filteredCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted/40 group transition-colors cursor-pointer",
                !category.isActive && "opacity-40"
              ),
              onClick: () => handleEdit(category),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-3.5 w-3.5 text-muted-foreground/40 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-xs font-medium truncate", children: category.name }),
                category.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/30 truncate max-w-[180px] hidden xl:block", children: category.description }),
                category.parentId && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-3.5 px-1 text-[8px] font-medium border-border/30 text-muted-foreground/40", children: "sub" }),
                !category.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "h-3.5 px-1 text-[8px] font-medium border-border/40 text-muted-foreground/50", children: "OFF" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-5 w-5", onClick: () => handleEdit(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-5 w-5 hover:bg-destructive/10 hover:text-destructive", onClick: () => handleDeleteClick(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-2.5 w-2.5" }) })
                ] })
              ]
            },
            category.id
          )) })
        ) : (
          // Tree view
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5", children: categoryTree.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-8 w-8 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "No categories yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: handleOpenCreateDialog, className: "text-xs h-auto p-0 text-primary/70", children: "Create your first category" })
          ] }) : categoryTree.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CategoryTreeNode,
            {
              category,
              onEdit: handleEdit,
              onDelete: handleDeleteClick,
              expandedIds,
              toggleExpand
            },
            category.id
          )) })
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-64 xl:w-72 shrink-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-b border-border/30 bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: "Quick Add" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/50", children: "Add a root category instantly" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Category name...",
                value: quickAddName,
                onChange: (e) => setQuickAddName(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && quickAddName.trim()) {
                    handleQuickAdd();
                  }
                },
                className: "h-8 text-xs bg-card/80 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 flex-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "h-8 px-2.5 shrink-0",
                onClick: handleQuickAdd,
                disabled: !quickAddName.trim() || isQuickAdding,
                children: isQuickAdding ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/30 leading-relaxed", children: 'Press Enter or click + to add. Use "Add Category" button for subcategories and descriptions.' })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: selectedCategory ? "Edit Category" : "Add New Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: selectedCategory ? "Update the category details below" : "Enter the details for the new category" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Category Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "name",
                value: formData.name,
                onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
                placeholder: "Enter category name",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "description",
                value: formData.description,
                onChange: (e) => setFormData((prev) => ({ ...prev, description: e.target.value })),
                placeholder: "Optional description",
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parentId", children: "Parent Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.parentId || "none",
                onValueChange: (value) => setFormData((prev) => ({ ...prev, parentId: value === "none" ? "" : value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select parent (optional)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None (Root Category)" }),
                    getParentOptions().map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cat.id.toString(), children: cat.name }, cat.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", children: "Active Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                id: "isActive",
                checked: formData.isActive,
                onCheckedChange: (checked) => setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isSaving, children: isSaving ? "Saving..." : selectedCategory ? "Update" : "Create" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          selectedCategory?.name,
          '"? This action cannot be undone. The category will be deactivated instead of permanently deleted.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground", children: "Delete" })
      ] })
    ] }) })
  ] }) });
}
export {
  CategoriesManagementScreen,
  CategoriesManagementScreen as default
};
