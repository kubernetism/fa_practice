import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, a7 as Dialog, a8 as DialogContent, a9 as DialogHeader, aa as DialogTitle, ab as DialogDescription, a as LoaderCircle, L as Label, B as Button, ak as Trash2, k as Select, l as SelectTrigger, m as SelectValue, n as SelectContent, o as SelectItem, I as Input, aj as Plus, al as DialogFooter, q as RefreshCw, Y as TooltipProvider, aD as UserCog, a2 as Card, a3 as CardContent, A as Users, S as Shield, aE as ShieldCheck, U as User, aA as Mail, ac as Badge, ae as Clock, a4 as Tooltip, a5 as TooltipTrigger, a6 as TooltipContent } from "./index-C-vZEr4O.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BUD-KYyc.js";
import { S as ShieldQuestion } from "./shield-question-DWqTuKZy.js";
import { C as CircleCheck } from "./circle-check-DFpHmNJ_.js";
import { T as TriangleAlert } from "./triangle-alert-BTf9fNlN.js";
import { U as UserCheck } from "./user-check-46IoAf_C.js";
import { S as Search } from "./search-DwoYSzUW.js";
import { P as Pencil } from "./pencil-DE2WA8pg.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UserX = createLucideIcon("UserX", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
]);
function SecurityQuestionsDialog({
  open,
  onOpenChange,
  userId,
  userName
}) {
  const [questions, setQuestions] = reactExports.useState([
    { question: "", answer: "", isCustom: false },
    { question: "", answer: "", isCustom: false }
  ]);
  const [suggestedQuestions, setSuggestedQuestions] = reactExports.useState([]);
  const [hasExisting, setHasExisting] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!open) return;
    setMessage(null);
    setIsLoading(true);
    Promise.all([
      window.api.recovery.getSuggestedQuestions(),
      window.api.recovery.hasQuestions(userId),
      window.api.recovery.getQuestions(userId)
    ]).then(([suggestedRes, hasRes, existingRes]) => {
      if (suggestedRes.success && suggestedRes.data) {
        setSuggestedQuestions(suggestedRes.data);
      }
      setHasExisting(hasRes.success && hasRes.data);
      if (existingRes.success && existingRes.data && existingRes.data.length > 0) {
        setQuestions(
          existingRes.data.map((q) => ({
            question: q.question,
            answer: "",
            // Answers are hashed, user must re-enter
            isCustom: false
          }))
        );
      } else {
        setQuestions([
          { question: "", answer: "", isCustom: false },
          { question: "", answer: "", isCustom: false }
        ]);
      }
    }).catch(() => {
    }).finally(() => setIsLoading(false));
  }, [open, userId]);
  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const addQuestion = () => {
    if (questions.length >= 3) return;
    setQuestions((prev) => [...prev, { question: "", answer: "", isCustom: false }]);
  };
  const removeQuestion = (index) => {
    if (questions.length <= 2) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSave = async () => {
    setMessage(null);
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setMessage({ type: "error", text: `Question ${i + 1} is required` });
        return;
      }
      if (!questions[i].answer.trim()) {
        setMessage({ type: "error", text: `Answer for question ${i + 1} is required` });
        return;
      }
      if (questions[i].answer.trim().length < 2) {
        setMessage({ type: "error", text: `Answer ${i + 1} must be at least 2 characters` });
        return;
      }
    }
    const questionTexts = questions.map((q) => q.question.trim().toLowerCase());
    if (new Set(questionTexts).size !== questionTexts.length) {
      setMessage({ type: "error", text: "Each question must be unique" });
      return;
    }
    setIsSaving(true);
    try {
      const result = await window.api.recovery.setQuestions(
        userId,
        questions.map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
      );
      if (result.success) {
        setMessage({ type: "success", text: "Security questions saved successfully" });
        setHasExisting(true);
        setTimeout(() => onOpenChange(false), 1500);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  };
  const getAvailableQuestions = (currentIndex) => {
    const selectedQuestions = questions.filter((_, i) => i !== currentIndex).map((q) => q.question);
    return suggestedQuestions.filter((q) => !selectedQuestions.includes(q));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldQuestion, { className: "h-5 w-5 text-primary" }),
        "Security Questions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: hasExisting ? `Update recovery questions for ${userName}. Answers must be re-entered.` : `Set up recovery questions for ${userName} to enable password reset.` })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      message && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${message.type === "success" ? "border-green-500/30 bg-green-500/5 text-green-600" : "border-destructive/30 bg-destructive/5 text-destructive"}`,
          children: [
            message.type === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0" }),
            message.text
          ]
        }
      ),
      questions.map((q, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-border/50 bg-muted/10 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: [
            "Question ",
            idx + 1
          ] }),
          questions.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-6 w-6 p-0 text-muted-foreground hover:text-destructive",
              onClick: () => removeQuestion(idx),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: q.question,
            onValueChange: (val) => {
              if (val === "__custom__") {
                updateQuestion(idx, "question", "");
                updateQuestion(idx, "isCustom", true);
              } else {
                updateQuestion(idx, "question", val);
                updateQuestion(idx, "isCustom", false);
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a question..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                getAvailableQuestions(idx).map((sq) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: sq, className: "text-xs", children: sq }, sq)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", className: "text-xs font-medium text-primary", children: "Write my own question..." })
              ] })
            ]
          }
        ),
        q.isCustom && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            placeholder: "Type your custom question",
            value: q.question,
            onChange: (e) => updateQuestion(idx, "question", e.target.value),
            className: "h-9 text-xs bg-background"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            placeholder: "Your answer (case-insensitive)",
            value: q.answer,
            onChange: (e) => updateQuestion(idx, "answer", e.target.value),
            className: "h-9 text-xs bg-background"
          }
        )
      ] }, idx)),
      questions.length < 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "w-full h-8 text-xs gap-1.5",
          onClick: addQuestion,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            "Add Question (",
            questions.length,
            "/3)"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-relaxed", children: "Minimum 2 questions required. Answers are stored securely (hashed). The user will need to answer all questions correctly to reset their password." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          className: "gap-1.5",
          onClick: handleSave,
          disabled: isSaving || isLoading,
          children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
            " Saving..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldQuestion, { className: "h-3.5 w-3.5" }),
            " Save Questions"
          ] })
        }
      )
    ] })
  ] }) });
}
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
function getRoleBadge(role) {
  const map = {
    admin: { className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20", icon: Shield },
    manager: { className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: ShieldCheck },
    cashier: { className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20", icon: User }
  };
  const cfg = map[role.toLowerCase()] ?? { className: "bg-zinc-500/15 text-zinc-500 border-zinc-500/20", icon: User };
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
    role.charAt(0).toUpperCase() + role.slice(1)
  ] });
}
function formatRelativeDate(iso) {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
function UsersScreen() {
  const [users, setUsers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filterRole, setFilterRole] = reactExports.useState("all");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [editingUser, setEditingUser] = reactExports.useState(null);
  const [securityQuestionsUser, setSecurityQuestionsUser] = reactExports.useState(null);
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
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole;
    return matchesSearch && matchesRole;
  });
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role.toLowerCase() === "admin").length;
  const managerCount = users.filter((u) => u.role.toLowerCase() === "manager").length;
  const cashierCount = users.filter((u) => u.role.toLowerCase() === "cashier").length;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: "User Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Manage system users, roles and access" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleOpenDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1.5" }),
        "Add User"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold mt-1", children: totalUsers })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5 text-green-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-600 dark:text-green-400 mt-1", children: activeUsers })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Inactive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-3.5 h-3.5 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-red-600 dark:text-red-400 mt-1", children: inactiveUsers })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-400/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Admins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3.5 h-3.5 text-red-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold mt-1", children: adminCount })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-400/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Managers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-blue-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold mt-1", children: managerCount })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-400/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Cashiers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-green-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold mt-1", children: cashierCount })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, username, or email...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-8 h-8 text-xs"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Role:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterRole, onValueChange: setFilterRole, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Roles" }),
            USER_ROLES.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: role.value, children: role.label }, role.value))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filteredUsers.length,
        " user",
        filteredUsers.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: filteredUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-10 h-10 mb-3 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: searchTerm || filterRole !== "all" ? "No users match your filters" : "No users yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: searchTerm || filterRole !== "all" ? "Try adjusting your search" : 'Click "Add User" to get started' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-8", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Full Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-20", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Last Login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs w-24", children: "Created" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right w-20", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredUsers.map((user, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px] text-muted-foreground py-2", children: idx + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: user.fullName }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-muted-foreground", children: [
          "@",
          user.username
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3 h-3" }),
          user.email
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: getRoleBadge(user.role) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: `text-[10px] px-1.5 py-0 ${user.isActive ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20"}`,
            children: user.isActive ? "Active" : "Inactive"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
          formatRelativeDate(user.lastLogin)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => setSecurityQuestionsUser({ id: user.id, name: user.fullName }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldQuestion, { className: "h-3.5 w-3.5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Security Questions" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => handleOpenDialog(user), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Edit" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => handleDelete(user.id, user.fullName), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Delete" })
          ] })
        ] }) })
      ] }, user.id)) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingUser ? "Edit User" : "Create New User" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingUser ? "Update user information." : "Create a new user account." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: "Role *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formData.role, onValueChange: (value) => setFormData({ ...formData, role: value }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select role" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: USER_ROLES.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: role.value, children: role.label }, role.value)) })
              ] })
            ] })
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
    ] }) }),
    securityQuestionsUser && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SecurityQuestionsDialog,
      {
        open: !!securityQuestionsUser,
        onOpenChange: (open) => {
          if (!open) setSecurityQuestionsUser(null);
        },
        userId: securityQuestionsUser.id,
        userName: securityQuestionsUser.name
      }
    )
  ] }) });
}
export {
  UsersScreen as default
};
