import { c as createLucideIcon, bh as useTheme, r as reactExports, j as jsxRuntimeExports, bi as Palette, ad as Badge, a3 as Card, aV as CardHeader, aW as CardTitle, bd as CardDescription, a4 as CardContent, bj as DEFAULT_THEMES, i as Sparkles, bk as Moon, bl as Sun, aC as cn, bm as FONT_SIZE_MAP, R as RotateCcw, w as Check, ak as Plus, B as Button, al as Trash2, a8 as Dialog, a9 as DialogContent, aa as DialogHeader, ab as DialogTitle, ac as DialogDescription, L as Label, I as Input, l as Select, m as SelectTrigger, n as SelectValue, o as SelectContent, p as SelectItem, ag as Separator, am as DialogFooter } from "./index-B52pgjeh.js";
import { I as Info } from "./info-BrkdpxL5.js";
import { M as Monitor } from "./monitor-BRoAapab.js";
import { T as Type } from "./type-BB2ff0Aa.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Maximize2 = createLucideIcon("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MousePointer2 = createLucideIcon("MousePointer2", [
  [
    "path",
    {
      d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
      key: "edeuup"
    }
  ]
]);
const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
  system: Monitor
};
const COLOR_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "accent",
  "accentForeground",
  "muted",
  "mutedForeground",
  "destructive",
  "border",
  "input",
  "ring"
];
const COLOR_LABELS = {
  background: "Background",
  foreground: "Text",
  card: "Card",
  cardForeground: "Card Text",
  primary: "Primary",
  primaryForeground: "Primary Text",
  secondary: "Secondary",
  secondaryForeground: "Secondary Text",
  accent: "Accent",
  accentForeground: "Accent Text",
  muted: "Muted",
  mutedForeground: "Muted Text",
  destructive: "Destructive",
  border: "Border",
  input: "Input",
  ring: "Focus Ring"
};
const DEFAULT_DARK_COLORS = {
  background: "#1a1a1a",
  foreground: "#f5f5f5",
  card: "#222222",
  cardForeground: "#f5f5f5",
  primary: "#3b82f6",
  primaryForeground: "#ffffff",
  secondary: "#2a2a2a",
  secondaryForeground: "#e5e5e5",
  accent: "#374151",
  accentForeground: "#f5f5f5",
  muted: "#2a2a2a",
  mutedForeground: "#999999",
  destructive: "#ef4444",
  border: "#333333",
  input: "#2a2a2a",
  ring: "#3b82f6"
};
const DEFAULT_LIGHT_COLORS = {
  background: "#ffffff",
  foreground: "#1a1a1a",
  card: "#ffffff",
  cardForeground: "#1a1a1a",
  primary: "#1a1a1a",
  primaryForeground: "#ffffff",
  secondary: "#f5f5f5",
  secondaryForeground: "#1a1a1a",
  accent: "#f5f5f5",
  accentForeground: "#1a1a1a",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  destructive: "#ef4444",
  border: "#e5e5e5",
  input: "#e5e5e5",
  ring: "#1a1a1a"
};
const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small", px: "13px" },
  { value: "default", label: "Default", px: "14px" },
  { value: "medium", label: "Medium", px: "15px" },
  { value: "large", label: "Large", px: "16px" }
];
const BUTTON_SIZE_OPTIONS = [
  { value: "compact", label: "Compact", desc: "Smaller buttons, tighter spacing" },
  { value: "default", label: "Default", desc: "Standard button sizing" },
  { value: "large", label: "Large", desc: "Larger buttons, more padding" }
];
const ICON_SIZE_OPTIONS = [
  { value: "small", label: "Small", scale: "85%" },
  { value: "default", label: "Default", scale: "100%" },
  { value: "medium", label: "Medium", scale: "115%" },
  { value: "large", label: "Large", scale: "130%" }
];
const SWATCH_KEYS = ["background", "primary", "accent", "muted", "destructive", "border"];
function ThemeSettingsScreen() {
  const {
    theme,
    setTheme,
    resolvedTheme,
    availableThemes,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    isSystemTheme,
    useSystemTheme,
    fontSize,
    setFontSize,
    buttonSize,
    setButtonSize,
    iconSize,
    setIconSize
  } = useTheme();
  const [isCreateOpen, setIsCreateOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold tracking-tight", children: "Appearance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Customize theme, text size, and button density" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
        "Settings auto-save"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-5 py-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Color Theme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-xs mt-0.5", children: [
              "Choose a color scheme for the interface. Current:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground capitalize", children: resolvedTheme })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
            availableThemes.length,
            " themes"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ThemeCard,
            {
              label: "System",
              icon: Monitor,
              isActive: isSystemTheme,
              onClick: () => useSystemTheme(),
              description: "Follow OS preference",
              swatchColors: null
            }
          ),
          DEFAULT_THEMES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ThemeCard,
            {
              label: t.name,
              icon: THEME_ICONS[t.id] || Palette,
              isActive: theme === t.id && !isSystemTheme,
              onClick: () => setTheme(t.id),
              description: t.type === "light" ? "Light mode" : "Dark mode",
              swatchColors: SWATCH_KEYS.map((k) => t.colors[k])
            },
            t.id
          )),
          customThemes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ThemeCard,
            {
              label: t.name,
              icon: Palette,
              isActive: theme === t.id && !isSystemTheme,
              onClick: () => setTheme(t.id),
              description: "Custom theme",
              swatchColors: SWATCH_KEYS.map((k) => t.colors[k]),
              onDelete: () => removeCustomTheme(t.id)
            },
            t.id
          ))
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Text Size" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs mt-0.5", children: "Adjust the base font size across the application" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border bg-muted/30 p-0.5", children: FONT_SIZE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setFontSize(opt.value),
                className: cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  fontSize === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] opacity-70 mt-0.5", children: opt.px })
                ]
              },
              opt.value
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card/50 p-3 space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider", children: "Preview" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: FONT_SIZE_MAP[fontSize] }, className: "transition-all", children: "The quick brown fox jumps over the lazy dog." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  style: { fontSize: FONT_SIZE_MAP[fontSize] },
                  className: "text-muted-foreground transition-all",
                  children: "0123456789 - ABCDEFGHIJKLM"
                }
              )
            ] }),
            fontSize !== "default" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setFontSize("default"),
                className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
                  "Reset to default"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MousePointer2, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Button Density" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs mt-0.5", children: "Control the size and spacing of buttons" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: BUTTON_SIZE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setButtonSize(opt.value),
                className: cn(
                  "relative rounded-lg border-2 p-3 text-center transition-all",
                  buttonSize === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                ),
                children: [
                  buttonSize === opt.value && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-primary" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: opt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: opt.desc }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: cn(
                        "inline-flex items-center rounded-md bg-primary text-primary-foreground font-medium transition-all",
                        opt.value === "compact" && "px-2 py-0.5 text-[10px]",
                        opt.value === "default" && "px-3 py-1 text-[11px]",
                        opt.value === "large" && "px-4 py-1.5 text-xs"
                      ),
                      children: "Sample"
                    }
                  ) })
                ]
              },
              opt.value
            )) }),
            buttonSize !== "default" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setButtonSize("default"),
                className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
                  "Reset to default"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Icon Size" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs mt-0.5", children: "Scale icons across the app for better readability on large displays" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border bg-muted/30 p-0.5", children: ICON_SIZE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setIconSize(opt.value),
                className: cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                  iconSize === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] opacity-70 mt-0.5", children: opt.scale })
                ]
              },
              opt.value
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card/50 p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider", children: "Preview" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MousePointer2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" })
              ] })
            ] }),
            iconSize !== "default" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setIconSize("default"),
                className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
                  "Reset to default"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Custom Themes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs mt-0.5", children: "Create your own color schemes with custom colors" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => setIsCreateOpen(true),
              className: "h-7 text-xs gap-1.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Create Theme"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: customThemes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-5 w-5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "No custom themes yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Create a custom theme to personalize your workspace" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: customThemes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "relative group rounded-lg border p-3 transition-all",
              theme === t.id && !isSystemTheme ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setTheme(t.id),
                  className: "w-full text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "h-3 w-3 rounded-full border",
                          style: { backgroundColor: t.colors.primary }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium truncate", children: t.name })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-0.5 h-5", children: SWATCH_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "rounded-sm",
                        style: { backgroundColor: t.colors[k] }
                      },
                      k
                    )) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => removeCustomTheme(t.id),
                  className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10",
                  title: "Delete theme",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" })
                }
              )
            ]
          },
          t.id
        )) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "All appearance settings are stored locally and persist across sessions. Use the theme toggle in the sidebar footer for quick switching." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateThemeDialog,
      {
        isOpen: isCreateOpen,
        onClose: () => setIsCreateOpen(false),
        onSave: (newTheme) => {
          addCustomTheme(newTheme);
          setIsCreateOpen(false);
        }
      }
    )
  ] });
}
function ThemeCard({
  label,
  icon: Icon,
  isActive,
  onClick,
  description,
  swatchColors,
  onDelete
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: cn(
        "relative group rounded-lg border-2 p-3 text-left transition-all",
        isActive ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-border hover:border-primary/30"
      ),
      children: [
        isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5 text-primary-foreground" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-2", children: description }),
        swatchColors ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-0.5 h-5 rounded overflow-hidden", children: swatchColors.map((color, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-full h-full",
            style: { backgroundColor: color }
          },
          i
        )) }) : (
          /* System theme: split swatch */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-5 rounded overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-zinc-900" })
          ] })
        ),
        onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            onClick: (e) => {
              e.stopPropagation();
              onDelete();
            },
            className: "absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 cursor-pointer",
            title: "Delete theme",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" })
          }
        )
      ]
    }
  );
}
function CreateThemeDialog({
  isOpen,
  onClose,
  onSave
}) {
  const [name, setName] = reactExports.useState("");
  const [baseType, setBaseType] = reactExports.useState("dark");
  const [colors, setColors] = reactExports.useState({ ...DEFAULT_DARK_COLORS });
  const handleBaseTypeChange = (type) => {
    setBaseType(type);
    setColors(type === "light" ? { ...DEFAULT_LIGHT_COLORS } : { ...DEFAULT_DARK_COLORS });
  };
  const updateColor = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };
  const handleCreate = () => {
    if (!name.trim()) return;
    const newTheme = {
      id: `custom-${Date.now().toString(36)}`,
      name: name.trim(),
      icon: "palette",
      type: baseType === "light" ? "light" : "custom",
      colors: { ...colors, radius: "0.5rem" }
    };
    onSave(newTheme);
    setName("");
    setBaseType("dark");
    setColors({ ...DEFAULT_DARK_COLORS });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[85vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-sm", children: "Create Custom Theme" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: "Define a custom color scheme for your workspace" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-4 pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theme Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "My Custom Theme",
            className: "h-8 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Base Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: baseType, onValueChange: (v) => handleBaseTypeChange(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dark", children: "Dark" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "light", children: "Light" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-2 block", children: "Colors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2", children: COLOR_KEYS.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "color",
              value: colors[key],
              onChange: (e) => updateColor(key, e.target.value),
              className: "h-7 w-7 rounded border border-border cursor-pointer bg-transparent shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium truncate", children: COLOR_LABELS[key] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-mono", children: colors[key] })
          ] })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-2 block", children: "Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-lg border p-3 space-y-2",
            style: {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.foreground
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: "Sample Interface" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-[10px] px-1.5 py-0.5 rounded",
                    style: { backgroundColor: colors.muted, color: colors.mutedForeground },
                    children: "Badge"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "rounded-md p-2 text-xs",
                  style: { backgroundColor: colors.card, color: colors.cardForeground },
                  children: [
                    "Card content area with",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: colors.primary }, className: "font-medium", children: "primary" }),
                    " ",
                    "and",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: colors.destructive }, className: "font-medium", children: "destructive" }),
                    " ",
                    "colors."
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2.5 py-1 rounded text-[11px] font-medium",
                    style: { backgroundColor: colors.primary, color: colors.primaryForeground },
                    children: "Primary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2.5 py-1 rounded text-[11px] font-medium",
                    style: { backgroundColor: colors.secondary, color: colors.secondaryForeground },
                    children: "Secondary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2.5 py-1 rounded text-[11px] font-medium",
                    style: { backgroundColor: colors.accent, color: colors.accentForeground },
                    children: "Accent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-1 rounded-full mt-1",
                  style: {
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.accent}, ${colors.destructive})`
                  }
                }
              )
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleCreate, disabled: !name.trim(), children: "Create Theme" })
    ] })
  ] }) });
}
export {
  ThemeSettingsScreen
};
