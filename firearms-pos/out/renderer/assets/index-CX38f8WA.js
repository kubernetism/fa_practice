import { r as reactExports, j as jsxRuntimeExports, I as Input, B as Button, p as Plus, t as Trash2, y as Dialog, z as DialogContent, A as DialogHeader, F as DialogTitle, G as DialogDescription, L as Label, V as Select, Y as SelectTrigger, Z as SelectValue, _ as SelectContent, $ as SelectItem, H as DialogFooter } from "./index-BUP8nqp_.js";
import { S as Search } from "./search-CVSyP8rP.js";
import { P as Pencil } from "./pencil-B18yZJH9.js";
const USER_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" }
];
const initialFormData = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  role: "cashier"
};
function UsersScreen() {
  const [users, setUsers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingUser, setEditingUser] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await window.api.users.getAll({ page: 1, limit: 100 });
      if (response?.success && response?.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenDialog = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: "",
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      alert("Username, full name, and email are required");
      return;
    }
    if (!editingUser && !formData.password) {
      alert("Password is required for new users");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      const userData = {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role
      };
      if (formData.password) {
        userData.password = formData.password;
      }
      if (editingUser) {
        const response = await window.api.users.update(editingUser.id, userData);
        if (!response.success) {
          alert(response.message || "Failed to update user");
          return;
        }
      } else {
        userData.password = formData.password;
        const response = await window.api.users.create(userData);
        if (!response.success) {
          alert(response.message || "Failed to create user");
          return;
        }
      }
      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Please try again.");
    }
  };
  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }
    try {
      const response = await window.api.users.delete(userId);
      if (response.success) {
        await fetchUsers();
      } else {
        alert(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Loading users..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "User Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage system users and assign roles" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search users...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add User"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-6 bg-card", children: users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: 'No users yet. Click "Add User" to get started.' }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Found ",
        users.length,
        " user(s)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: user.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", children: user.role })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "@",
            user.username,
            " • ",
            user.email
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Status: ",
            user.isActive ? "Active" : "Inactive",
            " • Last login: ",
            user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleOpenDialog(user), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(user.id, user.fullName), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, user.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingUser ? "Edit User" : "Create New User" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingUser ? "Update user information." : "Create a new user account." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "username",
                value: formData.username,
                onChange: (e) => setFormData({ ...formData, username: e.target.value }),
                placeholder: "Enter username",
                required: true,
                disabled: !!editingUser
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "fullName",
                value: formData.fullName,
                onChange: (e) => setFormData({ ...formData, fullName: e.target.value }),
                placeholder: "Enter full name",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "email",
                type: "email",
                value: formData.email,
                onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                placeholder: "user@example.com",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "password", children: [
              "Password ",
              editingUser ? "(leave blank to keep current)" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "password",
                type: "password",
                value: formData.password,
                onChange: (e) => setFormData({ ...formData, password: e.target.value }),
                placeholder: editingUser ? "Enter new password" : "Minimum 6 characters",
                required: !editingUser,
                minLength: 6
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: "Role *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formData.role, onValueChange: (value) => setFormData({ ...formData, role: value }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select role" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: USER_ROLES.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: role.value, children: role.label }, role.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleCloseDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
            editingUser ? "Update" : "Create",
            " User"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  UsersScreen as default
};
