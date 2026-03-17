import { r as reactExports, j as jsxRuntimeExports, B as Button, a0 as Plus, C as Card, e as CardContent, aV as FolderTree, P as Package, a3 as CircleAlert, b as CardHeader, c as CardTitle, d as CardDescription, I as Input, $ as ScrollArea, ak as cn, a1 as Badge, a4 as Trash2, ap as ChevronRight, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, L as Label, an as Textarea, K as Select, M as SelectTrigger, O as SelectValue, Q as SelectContent, V as SelectItem, ad as DialogFooter, aN as ChevronDown } from "./index-C_D_4RtI.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-C-Ca-CIo.js";
import { S as Switch } from "./switch-rXICCQ3s.js";
import { R as RefreshCw } from "./refresh-cw-DGuJjVCY.js";
import { S as Search } from "./search-BsWtoAus.js";
import { P as Pencil } from "./pencil-BW5o8v0k.js";
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
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent group",
          !category.isActive && "opacity-50"
        ),
        style: { marginLeft: level * 24 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => hasChildren && toggleExpand(category.id),
              className: cn("w-5 h-5 flex items-center justify-center", !hasChildren && "invisible"),
              children: hasChildren && (isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium", children: category.name }),
          !category.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Inactive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "opacity-0 group-hover:opacity-100 flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => onEdit(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => onDelete(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
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
  const fetchCategories = reactExports.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await window.api.categories.getAll();
      if (response?.success) {
        setCategories(response.data || []);
      }
      const treeResponse = await window.api.categories.getTree();
      if (treeResponse?.success) {
        setCategoryTree(treeResponse.data || []);
        const rootIds = new Set((treeResponse.data || []).map((c) => c.id));
        setExpandedIds(rootIds);
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
        await fetchCategories();
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
        await fetchCategories();
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
        await fetchCategories();
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
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading categories..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Categories Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Organize categories for products, purchases, receipts, and cart items" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: fetchCategories, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleOpenCreateDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Add Category"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-blue-100 dark:bg-blue-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: stats.total }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Categories" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-green-100 dark:bg-green-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: stats.active }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: stats.inactive }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Inactive" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-purple-100 dark:bg-purple-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-5 w-5 text-purple-600 dark:text-purple-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: stats.rootLevel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Root Categories" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Category Hierarchy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "View and manage your category structure" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search categories...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "pl-10"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[400px]", children: searchTerm ? (
          // Show filtered flat list when searching
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: filteredCategories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No categories found" }) : filteredCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent group",
                !category.isActive && "opacity-50"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium", children: category.name }),
                category.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground truncate max-w-[200px]", children: category.description }),
                !category.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Inactive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "opacity-0 group-hover:opacity-100 flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEdit(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteClick(category), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
                ] })
              ]
            },
            category.id
          )) })
        ) : (
          // Show tree when not searching
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: categoryTree.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderTree, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No categories yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: 'Click "Add Category" to create your first category' })
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
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Quick Add Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Quickly add a new root category" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Enter category name...",
                value: quickAddName,
                onChange: (e) => setQuickAddName(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && quickAddName.trim()) {
                    handleQuickAdd();
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "w-full",
                onClick: handleQuickAdd,
                disabled: !quickAddName.trim() || isQuickAdding,
                children: isQuickAdding ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Adding..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Add Category"
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: 'Need more options? Use the "Add Category" button for:' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" }),
                "Adding subcategories"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" }),
                "Adding descriptions"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" }),
                "Setting active status"
              ] })
            ] })
          ] })
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
  ] });
}
export {
  CategoriesManagementScreen,
  CategoriesManagementScreen as default
};
