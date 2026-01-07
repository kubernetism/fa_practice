import { r as reactExports, j as jsxRuntimeExports, O as UserPlus, D as DollarSign, I as Input, v as Select, w as SelectTrigger, x as SelectValue, y as SelectContent, z as SelectItem, B as Button, h as Plus, i as Badge, T as Trash2, n as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, s as DialogDescription, L as Label, M as Textarea, t as DialogFooter } from "./index-CIpOrWu4.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DRnjrw6m.js";
import { T as TrendingUp } from "./trending-up-BhqVgz6g.js";
import { S as Search } from "./search-Bx0szun4.js";
import { P as Phone } from "./phone-Dg-0BeIJ.js";
import { M as MapPin } from "./map-pin-51Sf-Zsx.js";
import { P as Pencil } from "./pencil-DQEEsnNZ.js";
const initialFormData = {
  name: "",
  contact: "",
  address: "",
  notes: "",
  commissionRate: "",
  isActive: true
};
function ReferralPersonsScreen() {
  const [referralPersons, setReferralPersons] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingReferralPerson, setEditingReferralPerson] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await window.api.referralPersons.getAll({ page: 1, limit: 100 });
      if (response?.success && response?.data) {
        setReferralPersons(response.data);
      } else {
        setReferralPersons([]);
      }
    } catch (error) {
      console.error("Failed to fetch referral persons:", error);
      setReferralPersons([]);
    } finally {
      setIsLoading(false);
    }
  };
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
        isActive: formData.isActive
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
  const filteredReferralPersons = referralPersons.filter((rp) => {
    const matchesSearch = rp.name.toLowerCase().includes(searchTerm.toLowerCase()) || rp.contact && rp.contact.toLowerCase().includes(searchTerm.toLowerCase()) || rp.address && rp.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || filterStatus === "active" && rp.isActive || filterStatus === "inactive" && !rp.isActive;
    return matchesSearch && matchesStatus;
  });
  const totalCommissionEarned = filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionEarned || 0), 0);
  const totalCommissionPaid = filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionPaid || 0), 0);
  const totalPending = totalCommissionEarned - totalCommissionPaid;
  const activeCount = filteredReferralPersons.filter((rp) => rp.isActive).length;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading referral persons..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Referral Persons" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage commission referral persons and track their earnings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Referral Persons" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: filteredReferralPersons.length })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Active Persons" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: activeCount })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Commission Earned" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
            "Rs. ",
            totalCommissionEarned.toFixed(2)
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Pending Payments" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
            "Rs. ",
            totalPending.toFixed(2)
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search referral persons...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: (v) => setFilterStatus(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active Only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inactive", children: "Inactive Only" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add Referral Person"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-6 bg-card flex-1 overflow-auto", children: filteredReferralPersons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: searchTerm || filterStatus !== "all" ? "No referral persons match your search." : 'No referral persons yet. Click "Add Referral Person" to get started.' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Found ",
        filteredReferralPersons.length,
        " referral person(s)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredReferralPersons.map((referralPerson) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-semibold", children: referralPerson.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: referralPerson.isActive ? "default" : "secondary", children: referralPerson.isActive ? "Active" : "Inactive" }),
              referralPerson.commissionRate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                referralPerson.commissionRate,
                "% default rate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => handleToggleActive(referralPerson),
              title: referralPerson.isActive ? "Deactivate" : "Activate",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-2 w-2 rounded-full ${referralPerson.isActive ? "bg-green-500" : "bg-gray-400"}`
                }
              )
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
          referralPerson.contact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: referralPerson.contact })
          ] }),
          referralPerson.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-muted-foreground mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: referralPerson.address })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Earned:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-600 dark:text-green-400", children: [
                "Rs. ",
                (referralPerson.totalCommissionEarned || 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Paid:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-blue-600 dark:text-blue-400", children: [
                "Rs. ",
                (referralPerson.totalCommissionPaid || 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Pending:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: `${(referralPerson.totalCommissionEarned || 0) - (referralPerson.totalCommissionPaid || 0) > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`,
                  children: [
                    "Rs.",
                    " ",
                    ((referralPerson.totalCommissionEarned || 0) - (referralPerson.totalCommissionPaid || 0)).toFixed(2)
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => handleOpenDialog(referralPerson),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => handleDelete(referralPerson.id, referralPerson.name),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] })
      ] }, referralPerson.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
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
                required: true,
                autoFocus: true
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
  ] });
}
export {
  ReferralPersonsScreen as default
};
