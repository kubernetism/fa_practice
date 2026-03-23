import { c as createLucideIcon, r as reactExports, K as KeyRound, j as jsxRuntimeExports, L as Label, U as User, I as Input, B as Button, a as LoaderCircle, E as EyeOff, b as Eye, u as useNavigate, d as useAuth, N as Navigate, S as Shield, T as ThemeToggle, e as Lock, C as ChevronRight } from "./index-Mzvdnc6O.js";
import { C as CircleCheck } from "./circle-check-C67HqHcj.js";
import { S as ShieldQuestion } from "./shield-question-BCNR1g45.js";
import { S as Search } from "./search-DIg5duXv.js";
import { T as TriangleAlert } from "./triangle-alert-De0HB-n-.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowLeft = createLucideIcon("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
function ForgotPassword({ onBack }) {
  const [step, setStep] = reactExports.useState("username");
  const [username, setUsername] = reactExports.useState("");
  const [userData, setUserData] = reactExports.useState(null);
  const [answers, setAnswers] = reactExports.useState({});
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const handleLookup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await window.api.recovery.lookupUser(username.trim());
      if (result.success && result.data) {
        setUserData(result.data);
        const initialAnswers = {};
        result.data.questions.forEach((q) => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);
        setStep("questions");
      } else {
        setError(result.message || "User not found");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyAnswers = async (e) => {
    e.preventDefault();
    setError("");
    const emptyAnswer = userData?.questions.find((q) => !answers[q.id]?.trim());
    if (emptyAnswer) {
      setError("Please answer all security questions");
      return;
    }
    setStep("newPassword");
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const result = await window.api.recovery.resetPassword({
        userId: userData.userId,
        answers: Object.entries(answers).map(([qId, answer]) => ({
          questionId: Number(qId),
          answer
        })),
        newPassword
      });
      if (result.success) {
        setStep("success");
      } else {
        setError(result.message || "Failed to reset password");
        if (result.message?.includes("incorrect")) {
          setStep("questions");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const stepConfig = {
    username: {
      icon: Search,
      title: "Find Your Account",
      subtitle: "Enter your username to begin the recovery process"
    },
    questions: {
      icon: ShieldQuestion,
      title: "Verify Identity",
      subtitle: `Answer the security questions for ${userData?.fullName || "your account"}`
    },
    newPassword: {
      icon: KeyRound,
      title: "Create New Password",
      subtitle: "Choose a strong password for your account"
    },
    success: {
      icon: CircleCheck,
      title: "Password Reset",
      subtitle: "Your password has been changed successfully"
    }
  };
  const currentStep = stepConfig[step];
  const StepIcon = currentStep.icon;
  const stepIndex = ["username", "questions", "newPassword", "success"].indexOf(step);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[400px] space-y-6", children: [
    step !== "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: step === "username" ? onBack : () => setStep(step === "newPassword" ? "questions" : "username"),
        className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" }),
          step === "username" ? "Back to login" : "Previous step"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-1 flex-1 rounded-full transition-all duration-500 ${i <= stepIndex ? "bg-primary" : "bg-muted"}`
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${step === "success" ? "bg-green-500/10 border-green-500/20" : "bg-primary/5 border-primary/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepIcon, { className: `h-5 w-5 ${step === "success" ? "text-green-500" : "text-primary"}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: currentStep.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: currentStep.subtitle })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-destructive shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
    ] }),
    step === "username" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLookup, className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "recovery-username", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "recovery-username",
              type: "text",
              placeholder: "Enter your username",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              className: "pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors",
              required: true,
              disabled: isLoading,
              autoFocus: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          className: "w-full h-11 font-semibold text-sm gap-2",
          disabled: isLoading || !username.trim(),
          children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Looking up..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
            " Find Account"
          ] })
        }
      )
    ] }),
    step === "questions" && userData && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleVerifyAnswers, className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: userData.fullName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "@",
            userData.username
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: userData.questions.map((q, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: [
          "Question ",
          idx + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground font-medium leading-snug", children: q.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            placeholder: "Your answer",
            value: answers[q.id] || "",
            onChange: (e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value })),
            className: "h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors",
            required: true,
            autoFocus: idx === 0
          }
        )
      ] }, q.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "submit",
          className: "w-full h-11 font-semibold text-sm gap-2",
          disabled: Object.values(answers).some((a) => !a.trim()),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldQuestion, { className: "h-4 w-4" }),
            "Verify Answers"
          ]
        }
      )
    ] }),
    step === "newPassword" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResetPassword, className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-password", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "New Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "new-password",
              type: showPassword ? "text" : "password",
              placeholder: "Enter new password",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              className: "pl-10 pr-11 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors",
              required: true,
              autoFocus: true,
              minLength: 6
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPassword(!showPassword),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-0.5",
              tabIndex: -1,
              children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Minimum 6 characters" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm-password", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Confirm Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "confirm-password",
              type: showPassword ? "text" : "password",
              placeholder: "Confirm new password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              className: "pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors",
              required: true,
              minLength: 6
            }
          )
        ] }),
        confirmPassword && newPassword !== confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-destructive", children: "Passwords do not match" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          className: "w-full h-11 font-semibold text-sm gap-2",
          disabled: isLoading || newPassword.length < 6 || newPassword !== confirmPassword,
          children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Resetting..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
            " Reset Password"
          ] })
        }
      )
    ] }),
    step === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-green-500/20 bg-green-500/5 p-5 text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-10 w-10 text-green-500 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Password changed successfully!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You can now sign in with your new password." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "w-full h-11 font-semibold text-sm gap-2",
          onClick: onBack,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back to Login"
          ]
        }
      )
    ] })
  ] });
}
function LoginScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [businessName, setBusinessName] = reactExports.useState("POS System");
  const [mounted, setMounted] = reactExports.useState(false);
  const [showForgotPassword, setShowForgotPassword] = reactExports.useState(false);
  reactExports.useEffect(() => {
    window.api.businessSettings.getGlobal().then((settings) => {
      if (settings?.businessName) setBusinessName(settings.businessName);
    }).catch(() => {
    });
    requestAnimationFrame(() => setMounted(true));
  }, []);
  if (authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
  }
  if (isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-primary overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.07]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100%", height: "100%", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pattern", { id: "grid", width: "60", height: "60", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 60 0 L 0 0 0 60", fill: "none", stroke: "currentColor", strokeWidth: "0.5" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", fill: "url(#grid)", className: "text-primary-foreground" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]",
          style: {
            transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
            opacity: mounted ? 0.06 : 0,
            transform: mounted ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "400", height: "400", viewBox: "0 0 400 400", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "200", cy: "200", r: "150", stroke: "currentColor", strokeWidth: "1", className: "text-primary-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "200", cy: "200", r: "100", stroke: "currentColor", strokeWidth: "0.7", className: "text-primary-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "200", cy: "200", r: "50", stroke: "currentColor", strokeWidth: "0.5", className: "text-primary-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "200", y1: "20", x2: "200", y2: "380", stroke: "currentColor", strokeWidth: "0.5", className: "text-primary-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "20", y1: "200", x2: "380", y2: "200", stroke: "currentColor", strokeWidth: "0.5", className: "text-primary-foreground" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col justify-between w-full p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              transitionDelay: "0.2s",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(-20px)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary-foreground" }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "space-y-6",
            style: {
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              transitionDelay: "0.4s",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h1",
                  {
                    className: "text-4xl xl:text-5xl font-bold tracking-tight animate-shimmer bg-clip-text text-transparent",
                    style: {
                      backgroundImage: "linear-gradient(110deg, var(--color-primary-foreground) 35%, rgba(255,255,255,0.6) 50%, var(--color-primary-foreground) 65%)",
                      backgroundSize: "200% 100%"
                    },
                    children: businessName
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-px w-20 bg-primary-foreground/20" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/60 text-base leading-relaxed max-w-sm", children: "Secure point-of-sale management system. Track inventory, manage sales, and streamline your operations." })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 text-primary-foreground/30 text-xs",
            style: {
              transition: "opacity 0.8s ease-out",
              transitionDelay: "0.6s",
              opacity: mounted ? 1 : 0
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "v1.0.0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Secure Access" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: businessName })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center px-6 pb-10", children: showForgotPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            opacity: 1,
            transform: "translateY(0)"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPassword, { onBack: () => setShowForgotPassword(false) })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-[380px] space-y-8",
          style: {
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            transitionDelay: "0.3s",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Welcome back" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your credentials to access the system" })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-destructive shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Username" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "username",
                      type: "text",
                      placeholder: "Enter your username",
                      value: username,
                      onChange: (e) => setUsername(e.target.value),
                      className: "pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors",
                      required: true,
                      disabled: isLoading,
                      autoFocus: true
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Password" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowForgotPassword(true),
                      className: "text-[10px] font-medium text-primary/70 hover:text-primary transition-colors uppercase tracking-wider",
                      children: "Forgot Password?"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "password",
                      type: showPassword ? "text" : "password",
                      placeholder: "Enter your password",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      className: "pl-10 pr-11 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors",
                      required: true,
                      disabled: isLoading
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPassword(!showPassword),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-0.5",
                      tabIndex: -1,
                      children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full h-11 font-semibold text-sm tracking-wide gap-2 group",
                  disabled: isLoading,
                  children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }),
                    "Signing in..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    "Sign In",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-border/50" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50", children: "Quick Access" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border/40 bg-muted/20 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium", children: "Default Credentials" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-muted-foreground/50" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono text-foreground/70", children: "admin" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-px bg-border/50" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3 text-muted-foreground/50" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono text-foreground/70", children: "admin123" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground",
                  onClick: () => {
                    setUsername("admin");
                    setPassword("admin123");
                  },
                  children: "Auto-fill"
                }
              )
            ] }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/40 tracking-wide", children: "Secure session · All activity is monitored" }) })
    ] })
  ] });
}
export {
  LoginScreen
};
