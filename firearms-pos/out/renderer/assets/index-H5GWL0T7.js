import { u as useNavigate, a as useAuth, r as reactExports, j as jsxRuntimeExports, N as Navigate, S as Shield, T as ThemeToggle, L as Label, U as User, I as Input, b as Lock, E as EyeOff, c as Eye, B as Button, C as ChevronRight } from "./index-CL8d32zf.js";
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center px-6 pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Password" }),
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
