# Firearms POS — Theme Specification

**Source inspiration:** https://agentfactory.panaversity.org/
**Captured:** 2026-04-13
**Target app:** `firearms-pos` (Electron desktop)
**Status:** Specification — implementation deferred

This document translates the visual language of the Agent Factory site into a
theme system for the Firearms POS desktop application. It's intentionally
framework-agnostic: values are expressed as CSS custom properties so they can
be consumed from vanilla CSS, Tailwind, or any shadcn/ui-based setup.

---

## 1. Design DNA

What defines the source theme:

- **Flat, architectural, low-ornament.** Border radius is `0px` globally —
  edges are crisp and rectangular. This reads as technical and serious,
  appropriate for a transactional POS.
- **Deep navy as anchor.** Primary color is a saturated dark blue
  (`#002855`) used for actions, links, and emphasis, paired with near-white
  surfaces in light mode and near-black in dark mode.
- **Warm amber/gold accents.** A restrained use of `#f49f1e` / `#eca407` for
  highlights, achievement states, and attention-drawing UI (e.g. low-stock
  warnings, due-date flags).
- **Inter for UI, JetBrains Mono for numbers / SKUs.** A geometric sans for
  chrome and a clean monospace for codes, totals, and log-style data.
- **Shadow depth is soft and low.** Multiple small shadows layered
  (`0 1px 2px`, `0 4px 12px`) rather than a single heavy drop shadow.
- **Dual-mode first-class.** Light and dark are parallel, not afterthoughts —
  every token has a defined value in both modes.

---

## 2. Color Tokens

All colors are defined as CSS variables on `:root` (light) and
`html[data-theme="dark"]` (dark). Names follow the shadcn convention so the
theme is portable across component libraries.

### 2.1 Light mode

```css
:root {
  /* Surfaces */
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;

  /* Brand */
  --primary: #002855;           /* deep navy */
  --primary-foreground: #edfdf5;

  /* Neutrals */
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #171717;

  /* Borders / inputs / focus */
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #a1a1a1;

  /* Status */
  --info:    #39aaed;
  --success: #57b04f;
  --warning: #eca407;
  --destructive: #df2225;

  /* Sidebar (nav shell) */
  --sidebar: #fafafa;
  --sidebar-foreground: #0a0a0a;
  --sidebar-primary: #002855;
  --sidebar-primary-foreground: #edfdf5;
  --sidebar-accent: #f5f5f5;
  --sidebar-accent-foreground: #171717;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #a1a1a1;

  /* Data-viz (charts) */
  --chart-1: #a8d2ff;
  --chart-2: #7fb7ff;
  --chart-3: #659dfb;
  --chart-4: #4682cc;
  --chart-5: #4a649f;

  /* Shape */
  --radius: 0px;
}
```

### 2.2 Dark mode

```css
html[data-theme="dark"] {
  --background: #000000;
  --foreground: #fafafa;
  --card: #060606;
  --card-foreground: #fafafa;
  --popover: #060606;
  --popover-foreground: #fafafa;

  --primary: #4f91e2;            /* brighter blue for contrast on black */
  --primary-foreground: #edfdf5;

  --secondary: #161619;
  --secondary-foreground: #fafafa;
  --muted: #161616;
  --muted-foreground: #a1a1a1;
  --accent: #222222;
  --accent-foreground: #fafafa;

  --border: rgba(255, 255, 255, 0.10);
  --input:  rgba(255, 255, 255, 0.15);
  --ring:   #737373;

  --info:    #2098db;
  --success: #4da745;
  --warning: #e59e00;
  --destructive: #ff6568;

  --sidebar: #171717;
  --sidebar-foreground: #fafafa;
  --sidebar-primary: #4f91e2;
  --sidebar-primary-foreground: #002c22;
  --sidebar-accent: #262626;
  --sidebar-accent-foreground: #fafafa;
  --sidebar-border: rgba(255, 255, 255, 0.10);
  --sidebar-ring: #737373;
}
```

### 2.3 POS-specific semantic tokens

Layer these on top of the base palette so POS-domain meaning is encoded once:

```css
:root {
  /* Transaction states */
  --tx-sale:     var(--success);   /* completed sale */
  --tx-refund:   var(--destructive);
  --tx-pending:  var(--warning);
  --tx-layaway:  var(--info);

  /* Inventory states */
  --stock-ok:       var(--success);
  --stock-low:      var(--warning);
  --stock-out:      var(--destructive);
  --stock-reserved: var(--info);

  /* Compliance (ATF/4473-sensitive fields) */
  --compliance-required: #f49f1e;   /* gold — needs attention */
  --compliance-ok:       var(--success);
  --compliance-hold:     var(--destructive);

  /* Financial */
  --money-positive: var(--success);
  --money-negative: var(--destructive);
  --money-neutral:  var(--muted-foreground);
}
```

### 2.4 Accent / achievement palette (optional)

Kept for report badges, cashier performance panels, or training mode:

```
Gold   #f49f1e   (light) / #ffb24f (dark)
Silver #a7aebb   (light) / #b3bfd2 (dark)
Bronze #b06d47   (light) / #c97847 (dark)
```

---

## 3. Typography

### 3.1 Font stacks

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-display: "Inter", system-ui, sans-serif;  /* tighter tracking at large sizes */
}
```

**Rationale for POS:**
- `--font-sans` for labels, buttons, menu items, form fields.
- `--font-mono` for **all numeric columns**: price, quantity, totals, receipt
  lines, serial numbers, SKU codes, 4473 reference numbers. Tabular figures
  make dense tables scannable.
- `--font-display` is the same family; reserve for dashboard tiles and
  modal titles.

### 3.2 Scale

Matches the source (no fractional sizes — every step is a whole pixel):

| Token           | Size  | Weight | Use                                      |
| --------------- | ----- | ------ | ---------------------------------------- |
| `--text-xs`     | 11px  | 500    | Badges, captions, keyboard hints         |
| `--text-sm`     | 13px  | 500    | Table cells, form labels                 |
| `--text-base`   | 14px  | 400    | Body, default button text                |
| `--text-md`     | 16px  | 400    | Dialog body, paragraph                   |
| `--text-lg`     | 18px  | 500    | Section labels                           |
| `--text-xl`     | 20px  | 600    | Card titles                              |
| `--text-2xl`    | 24px  | 600    | H3 — panel headings                      |
| `--text-3xl`    | 30px  | 600    | H2 — page sections                       |
| `--text-4xl`    | 36px  | 700    | H1 — page titles, big totals             |

### 3.3 Numeric display rules

- Always use `font-variant-numeric: tabular-nums` on any column containing
  money, quantity, or dates.
- For the grand-total field on the sale screen, use `--text-4xl` with
  `--font-mono` and `font-weight: 700`.

---

## 4. Shape, Spacing, Elevation

### 4.1 Radius

The source uses `--radius: 0px`. Keep the **global** radius at `0` and
introduce a single opt-in for the few places where a soft corner reads better:

```css
:root {
  --radius:       0px;     /* default — all chrome, buttons, inputs, cards */
  --radius-pill:  9999px;  /* only: status chips, filter tokens */
}
```

Do **not** round buttons, cards, tables, dialogs, or inputs.

### 4.2 Spacing scale

Standard 4-pt grid:

```
--space-0: 0;       --space-5: 20px;
--space-1: 4px;     --space-6: 24px;
--space-2: 8px;     --space-8: 32px;
--space-3: 12px;   --space-10: 40px;
--space-4: 16px;   --space-12: 48px;
```

Dense-table rows: vertical padding `--space-2` (8px). Form field vertical
padding: `--space-2` + `--space-3` label gap.

### 4.3 Shadows

Soft, short-range only. No colored glows on primary UI:

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.10);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.08);

  /* Primary-tinted elevation for dialogs and menus */
  --shadow-primary: 0 4px 12px rgba(0, 40, 85, 0.10);
}
```

Dark mode uses the same tokens but increases alpha:
```css
html[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.40);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.55);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.45);
}
```

### 4.4 Borders

`1px solid var(--border)` is the default. Never use a thicker rule for
decoration — reserve `2px` for focus states and `3px+` for dividers between
major app zones (e.g. sidebar / content).

---

## 5. Motion

Minimal, fast, functional. No hero animations in a POS.

```css
:root {
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-exit:     cubic-bezier(0.4, 0, 1, 1);

  --dur-fast:   120ms;   /* hover, focus */
  --dur-base:   180ms;   /* dialog, popover open */
  --dur-slow:   240ms;   /* page / view switch */
}
```

Disable all motion when `prefers-reduced-motion: reduce`.

---

## 6. Component recipes

The source site's real component samples informed these.

### 6.1 Button (primary)

```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid var(--primary);
  border-radius: var(--radius);
  font: 500 14px/1 var(--font-sans);
  transition: background var(--dur-fast) var(--ease-standard);
}
.btn-primary:hover  { background: color-mix(in srgb, var(--primary) 90%, black); }
.btn-primary:active { background: color-mix(in srgb, var(--primary) 80%, black); }
.btn-primary:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### 6.2 Button (secondary — matches the captured button sample)

```css
.btn-secondary {
  height: 36px;
  padding: 8px 16px;
  background: var(--background);
  color: var(--muted-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: 500 14px/1 var(--font-sans);
}
```

### 6.3 Input

```css
.input {
  height: 36px;
  padding: 8px 12px;
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--input);
  border-radius: var(--radius);
  font: 400 14px/1 var(--font-sans);
}
.input:focus {
  border-color: var(--primary);
  outline: 2px solid color-mix(in srgb, var(--primary) 40%, transparent);
  outline-offset: 0;
}
```

### 6.4 Data table (POS line items)

- Header row: `background: var(--muted); font-weight: 600; font-size: 13px;`
- Body row: border-bottom `1px solid var(--border)`, hover
  `background: var(--accent)`.
- Numeric columns right-aligned, `font-family: var(--font-mono)`,
  `font-variant-numeric: tabular-nums`.

### 6.5 Card / panel

```css
.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
```

### 6.6 Sidebar (main nav)

- Width: `260px` (source uses `300px` for docs sidebar; POS compresses to 260
  to preserve screen area for transactions).
- Background: `var(--sidebar)`.
- Active item: `background: var(--sidebar-primary); color:
  var(--sidebar-primary-foreground);` with no rounded corners.
- Icon + label rows 40px tall, 12px horizontal padding.

### 6.7 Status badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: var(--radius-pill);
  font: 500 11px/1 var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge--success { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
.badge--warning { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
.badge--danger  { background: color-mix(in srgb, var(--destructive) 15%, transparent); color: var(--destructive); }
```

---

## 7. POS-screen specific guidance

| Screen              | Key theme decisions                                                               |
| ------------------- | --------------------------------------------------------------------------------- |
| **Sale / checkout** | Grand total in `--font-mono`, 36px, 700. Tender buttons use `--primary`. Tax line uses `--muted-foreground`. |
| **Inventory grid**  | Low-stock rows tinted with `--stock-low` at 8% alpha in the row background.        |
| **4473 / compliance** | Required fields get a 2px left border in `--compliance-required` until filled. |
| **Reports**         | Charts use `--chart-1` through `--chart-5`. Axis labels `--muted-foreground`.      |
| **Receipts (print)**| Force light palette regardless of app mode; `@media print` overrides to white bg, black text, `--font-mono` for line items. |
| **Dialogs / modals**| Backdrop: `rgba(0,0,0,0.45)`. Dialog has `--shadow-xl` + `1px solid var(--border)`. |

---

## 8. Accessibility

- Minimum contrast: 4.5:1 for body text, 3:1 for large text and UI icons.
  Navy-on-white (`#002855` / `#ffffff`) = 13.9:1 — safe.
- Focus indicator is the `--ring` token as a 2px outline with 2px offset — do
  not remove or replace with a box-shadow-only approach, it's too subtle for
  touchscreen POS terminals.
- Never encode state with color alone. Low stock = color *and* icon *and*
  text label.
- Honor `prefers-color-scheme` on first run, then persist the user's explicit
  choice.

---

## 9. Implementation notes (for the later update)

1. Add these tokens to a single file: `src/renderer/src/styles/theme.css`
   and `@import` it at the top of the renderer entry point.
2. Wire theme switching: write `data-theme="dark" | "light"` onto
   `document.documentElement` from a Zustand store; persist the choice via
   `electron-store`.
3. If adopting shadcn/ui, the variable names above are already compatible —
   point `tailwind.config` at these CSS variables rather than hard-coded
   Tailwind colors.
4. Load Inter and JetBrains Mono **locally** (bundle the woff2 files under
   `src/renderer/src/assets/fonts/`) — the desktop app should not depend on
   Google Fonts at runtime.
5. Migrate in this order: (a) tokens + fonts, (b) buttons + inputs,
   (c) sidebar + header shell, (d) tables + cards, (e) dialogs and badges.
6. Visually regression-test the receipt preview before shipping — printed
   output must stay black-on-white.

---

## 10. Open questions

- Touchscreen target sizing: POS terminals often need 44px minimum hit
  targets. Revisit button height (`36px` above) if the deployment is
  touch-first.
- Brand override: does the firearm retailer want their own primary color
  (e.g. tactical olive, blaze orange)? The token design makes this a single
  variable swap.
- Bilingual receipts (English/Urdu): if added, confirm Inter's Urdu coverage
  or add a fallback like Noto Nastaliq for the `--font-sans` stack in
  receipt-only contexts.
