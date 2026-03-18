import { r as reactExports, j as jsxRuntimeExports, ax as Building2, I as Input, B as Button, aq as Plus, ai as Badge, aw as Phone, aG as Mail, as as Trash2, ad as Dialog, ae as DialogContent, af as DialogHeader, ag as DialogTitle, ah as DialogDescription, L as Label, au as DialogFooter } from "./index-PBsCfLo2.js";
import { S as Search } from "./search-WRDBsvTG.js";
import { M as MapPin } from "./map-pin-Uo9O-l2L.js";
import { P as Pencil } from "./pencil-PuwsTywe.js";
const initialFormData = {
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  licenseNumber: ""
};
function BranchesScreen() {
  const [branches, setBranches] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingBranch, setEditingBranch] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchBranches();
  }, []);
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await window.api.branches.getAll();
      if (response?.success && response?.data) {
        setBranches(response.data);
      } else if (response?.data) {
        setBranches(response.data);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenDialog = (branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        licenseNumber: branch.licenseNumber || ""
      });
    } else {
      setEditingBranch(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBranch(null);
    setFormData(initialFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Branch code and name are required");
      return;
    }
    try {
      const branchData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        address: formData.address.trim() || void 0,
        phone: formData.phone.trim() || void 0,
        email: formData.email.trim() || void 0,
        licenseNumber: formData.licenseNumber.trim() || void 0
      };
      if (editingBranch) {
        const response = await window.api.branches.update(editingBranch.id, branchData);
        if (!response.success) {
          alert(response.message || "Failed to update branch");
          return;
        }
      } else {
        const response = await window.api.branches.create(branchData);
        if (!response.success) {
          alert(response.message || "Failed to create branch");
          return;
        }
      }
      await fetchBranches();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save branch:", error);
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        alert("Branch code already exists. Please use a different code.");
      } else {
        alert("Failed to save branch. Please try again.");
      }
    }
  };
  const handleDelete = async (branchId, branchName) => {
    if (!confirm(`Are you sure you want to delete branch "${branchName}"?`)) {
      return;
    }
    try {
      const response = await window.api.branches.delete(branchId);
      if (response.success) {
        await fetchBranches();
      } else {
        alert(response.message || "Failed to delete branch");
      }
    } catch (error) {
      console.error("Failed to delete branch:", error);
      alert("Failed to delete branch. Please try again.");
    }
  };
  const filteredBranches = branches.filter(
    (branch) => branch.code.toLowerCase().includes(searchTerm.toLowerCase()) || branch.name.toLowerCase().includes(searchTerm.toLowerCase()) || branch.email?.toLowerCase().includes(searchTerm.toLowerCase()) || branch.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeCount = branches.filter((b) => b.isActive).length;
  const inactiveCount = branches.filter((b) => !b.isActive).length;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading branches..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Branch Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage multiple business locations" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card p-4 rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Total Branches" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: branches.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8 text-muted-foreground" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-4 rounded-lg border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Active Branches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: activeCount })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-4 rounded-lg border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Inactive Branches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: inactiveCount })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search branches...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add Branch"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-6 bg-card", children: filteredBranches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-16 w-16 mx-auto mb-4 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: searchTerm ? "No branches found matching your search." : 'No branches yet. Click "Add Branch" to get started.' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Found ",
        filteredBranches.length,
        " branch(es)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredBranches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: branch.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 rounded font-mono bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", children: branch.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: branch.isActive ? "default" : "secondary", children: branch.isActive ? "Active" : "Inactive" }),
            branch.isMain && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Main" })
          ] }),
          branch.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
            branch.address
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground mt-1", children: [
            branch.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
              branch.phone
            ] }),
            branch.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
              branch.email
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleOpenDialog(branch), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          !branch.isMain && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(branch.id, branch.name), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, branch.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingBranch ? "Edit Branch" : "Create New Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingBranch ? "Update branch information." : "Create a new branch location." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "code", children: "Branch Code *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "code",
                  value: formData.code,
                  onChange: (e) => setFormData({ ...formData, code: e.target.value.toUpperCase() }),
                  placeholder: "e.g., BR001, NYC",
                  required: true,
                  maxLength: 20,
                  disabled: !!editingBranch
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Branch Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "name",
                  value: formData.name,
                  onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                  placeholder: "e.g., Main Office",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "address",
                value: formData.address,
                onChange: (e) => setFormData({ ...formData, address: e.target.value }),
                placeholder: "Street address, city, state, zip"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "phone",
                  type: "tel",
                  value: formData.phone,
                  onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                  placeholder: "+1 (555) 123-4567"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  value: formData.email,
                  onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                  placeholder: "branch@company.com"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "licenseNumber", children: "License Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "licenseNumber",
                value: formData.licenseNumber,
                onChange: (e) => setFormData({ ...formData, licenseNumber: e.target.value }),
                placeholder: "Business/trade license number"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
            editingBranch ? "Update" : "Create",
            " Branch"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  BranchesScreen as default
};
