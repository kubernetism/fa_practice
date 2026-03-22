import { K as useBranch, r as reactExports, j as jsxRuntimeExports, B as Button, ag as Plus, I as Input, X, i as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, a9 as Badge, ah as Trash2, C as ChevronRight, a4 as Dialog, a5 as DialogContent, a6 as DialogHeader, a7 as DialogTitle, a8 as DialogDescription, L as Label, o as Textarea, ai as DialogFooter } from "./index-CL8d32zf.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-m7X2WjZM.js";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent } from "./tooltip-DI2L3h3I.js";
import { S as Search } from "./search-jVe_1Vq5.js";
import { P as Pencil } from "./pencil-CPhKtWG_.js";
import { C as ChevronLeft } from "./chevron-left-Bz89RkGd.js";
const ITEMS_PER_PAGE = 10;
const initialFormData = {
  name: "",
  contact: "",
  address: "",
  notes: "",
  commissionRate: "",
  isActive: true
};
function ReferralPersonsScreen() {
  const { currentBranch } = useBranch();
  const [referralPersons, setReferralPersons] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingReferralPerson, setEditingReferralPerson] = reactExports.useState(null);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const fetchData = reactExports.useCallback(async () => {
    if (!currentBranch) return;
    try {
      setIsLoading(true);
      const response = await window.api.referralPersons.getAll({ page: 1, limit: 100, branchId: currentBranch.id });
      if (response?.success && response?.data) {
        const filteredData = response.data.filter(
          (rp) => rp.branchId === currentBranch.id
        );
        setReferralPersons(filteredData);
      } else {
        setReferralPersons([]);
      }
    } catch (error) {
      console.error("Failed to fetch referral persons:", error);
      setReferralPersons([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);
  reactExports.useEffect(() => {
    if (currentBranch) {
      fetchData();
    }
  }, [currentBranch, fetchData]);
  const handleOpenDialog = (referralPerson) => {
    if (referralPerson) {
      setEditingReferralPerson(referralPerson);
      setFormData({
        name: referralPerson.name,
        contact: referralPerson.contact || "",
        address: referralPerson.address || "",
        notes: referralPerson.notes || "",
        commissionRate: referralPerson.commissionRate?.toString() || "",
        isActive: referralPerson.isActive
      });
    } else {
      setEditingReferralPerson(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReferralPerson(null);
    setFormData(initialFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentBranch) {
      alert("Please select a branch first");
      return;
    }
    if (!formData.name.trim()) {
      alert("Please enter a name");
      return;
    }
    try {
      const data = {
        name: formData.name.trim(),
        contact: formData.contact.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
        isActive: formData.isActive,
        branchId: currentBranch.id
      };
      if (editingReferralPerson) {
        const response = await window.api.referralPersons.update(editingReferralPerson.id, data);
        if (!response.success) {
          alert(response.message || "Failed to update referral person");
          return;
        }
      } else {
        const response = await window.api.referralPersons.create(data);
        if (!response.success) {
          alert(response.message || "Failed to create referral person");
          return;
        }
      }
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save referral person:", error);
      alert("Failed to save referral person. Please try again.");
    }
  };
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }
    try {
      const response = await window.api.referralPersons.delete(id);
      if (response.success) {
        await fetchData();
      } else {
        alert(response.message || "Failed to delete referral person");
      }
    } catch (error) {
      console.error("Failed to delete referral person:", error);
      alert("Failed to delete referral person. Please try again.");
    }
  };
  const handleToggleActive = async (referralPerson) => {
    try {
      const response = await window.api.referralPersons.update(referralPerson.id, {
        isActive: !referralPerson.isActive
      });
      if (response.success) {
        await fetchData();
      } else {
        alert(response.message || "Failed to update referral person");
      }
    } catch (error) {
      console.error("Failed to update referral person:", error);
    }
  };
  const filteredReferralPersons = reactExports.useMemo(() => {
    return referralPersons.filter((rp) => {
      const matchesSearch = rp.name.toLowerCase().includes(searchTerm.toLowerCase()) || rp.contact && rp.contact.toLowerCase().includes(searchTerm.toLowerCase()) || rp.address && rp.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || filterStatus === "active" && rp.isActive || filterStatus === "inactive" && !rp.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [referralPersons, searchTerm, filterStatus]);
  const totalCommissionEarned = reactExports.useMemo(
    () => filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionEarned || 0), 0),
    [filteredReferralPersons]
  );
  const totalCommissionPaid = reactExports.useMemo(
    () => filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionPaid || 0), 0),
    [filteredReferralPersons]
  );
  const totalPending = totalCommissionEarned - totalCommissionPaid;
  const activeCount = reactExports.useMemo(
    () => filteredReferralPersons.filter((rp) => rp.isActive).length,
    [filteredReferralPersons]
  );
  const paginatedPersons = reactExports.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReferralPersons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReferralPersons, currentPage]);
  const totalPages = Math.ceil(filteredReferralPersons.length / ITEMS_PER_PAGE) || 1;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading referral persons..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Referral Persons" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            filteredReferralPersons.length,
            " Total"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", children: [
            activeCount,
            " Active"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Rs. ",
            totalCommissionEarned.toFixed(2),
            " Earned"
          ] }),
          totalPending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium", children: [
            "Rs. ",
            totalPending.toFixed(2),
            " Pending"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8", onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-3.5 w-3.5" }),
        "Add Person"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, contact, address...",
            value: searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            },
            className: "h-8 pl-8 text-sm"
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "aria-label": "Clear search",
            onClick: () => {
              setSearchTerm("");
              setCurrentPage(1);
            },
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: (v) => {
        setFilterStatus(v);
        setCurrentPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inactive", children: "Inactive" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: paginatedPersons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center text-sm text-muted-foreground", children: "No referral persons found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Earned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider text-right", children: "Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-[10px] font-semibold uppercase tracking-wider w-[100px]", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedPersons.map((rp) => {
        const pending = (rp.totalCommissionEarned || 0) - (rp.totalCommissionPaid || 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "group h-9", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: rp.name }),
            rp.address && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-muted-foreground truncate max-w-[180px]", children: rp.address })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: rp.contact || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-sm", children: rp.commissionRate ? `${rp.commissionRate}%` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-right text-sm tabular-nums text-green-600 dark:text-green-400", children: [
            "Rs. ",
            (rp.totalCommissionEarned || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-1.5 text-right text-sm tabular-nums text-blue-600 dark:text-blue-400", children: [
            "Rs. ",
            (rp.totalCommissionPaid || 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableCell,
            {
              className: "py-1.5 text-right text-sm tabular-nums font-medium",
              style: { color: pending > 0 ? "var(--color-warning)" : void 0 },
              children: [
                "Rs. ",
                pending.toFixed(2)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: rp.isActive ? "default" : "secondary",
              className: "text-[10px] px-1.5 py-0",
              children: rp.isActive ? "Active" : "Inactive"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: () => handleToggleActive(rp),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 w-2 rounded-full ${rp.isActive ? "bg-green-500" : "bg-gray-400"}` })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: rp.isActive ? "Deactivate" : "Activate" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: () => handleOpenDialog(rp),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: () => handleDelete(rp.id, rp.name),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Delete" })
            ] })
          ] }) })
        ] }, rp.id);
      }) })
    ] }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Showing ",
        (currentPage - 1) * ITEMS_PER_PAGE + 1,
        "–",
        Math.min(currentPage * ITEMS_PER_PAGE, filteredReferralPersons.length),
        " of ",
        filteredReferralPersons.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
            disabled: currentPage === 1,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums px-1", children: [
          currentPage,
          " / ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
            disabled: currentPage === totalPages,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", onOpenAutoFocus: (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("name");
      nameInput?.focus();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingReferralPerson ? "Edit Referral Person" : "Add New Referral Person" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingReferralPerson ? "Update referral person information below." : "Enter details for new referral person." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "name",
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                placeholder: "Enter referral person's name",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "contact",
                value: formData.contact,
                onChange: (e) => setFormData({ ...formData, contact: e.target.value }),
                placeholder: "Phone number or email"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "address",
                value: formData.address,
                onChange: (e) => setFormData({ ...formData, address: e.target.value }),
                placeholder: "Physical address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "commissionRate", children: "Default Commission Rate (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "commissionRate",
                type: "number",
                step: "0.01",
                min: "0",
                max: "100",
                value: formData.commissionRate,
                onChange: (e) => setFormData({ ...formData, commissionRate: e.target.value }),
                placeholder: "Leave empty to use invoice-specific rate"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This rate will be used by default when creating commissions. You can override it per invoice." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "isActive",
                checked: formData.isActive,
                onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "cursor-pointer", children: "Active (can earn commissions)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "notes",
                value: formData.notes,
                onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
                placeholder: "Additional notes about this referral person...",
                rows: 3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
            editingReferralPerson ? "Update" : "Create",
            " Referral Person"
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  ReferralPersonsScreen as default
};
