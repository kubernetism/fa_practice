import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, I as Input, B as Button, ak as Plus, ad as Badge, a8 as Dialog, a9 as DialogContent, aa as DialogHeader, ab as DialogTitle, L as Label, am as DialogFooter, a3 as Card, aV as CardHeader, aW as CardTitle, a4 as CardContent, _ as Tabs, $ as TabsList, a0 as TabsTrigger, aj as TabsContent } from "./index-2rq_5YkW.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-XkqVqf4i.js";
import { u as useFirearmLookups } from "./use-firearm-lookups-DNHKjW1J.js";
import { A as ArrowUp, a as ArrowDown } from "./arrow-up-I0gh_aIa.js";
import { P as Pencil } from "./pencil-BhCBNUkR.js";
import { B as Ban } from "./ban-C0hUJ2Dg.js";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Undo2 = createLucideIcon("Undo2", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
]);
function LookupTableEditor({ kind }) {
  const { rows, loading, refresh } = useFirearmLookups(kind, false);
  const [filter, setFilter] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [formName, setFormName] = reactExports.useState("");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const filtered = rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));
  const openAdd = () => {
    setEditing(null);
    setFormName("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setFormName(row.name);
    setErr(null);
    setDialogOpen(true);
  };
  const save = async () => {
    setSaving(true);
    setErr(null);
    const name = formName.trim();
    if (!name) {
      setErr("Name required");
      setSaving(false);
      return;
    }
    const res = editing ? await window.api.firearmAttrs.update(kind, editing.id, { name }) : await window.api.firearmAttrs.create(kind, { name });
    setSaving(false);
    if (!res.success) {
      setErr(res.message ?? "Save failed");
      return;
    }
    setDialogOpen(false);
    await refresh();
  };
  const toggleActive = async (row) => {
    const res = row.isActive ? await window.api.firearmAttrs.deactivate(kind, row.id) : await window.api.firearmAttrs.update(kind, row.id, { isActive: true });
    if (res.success) await refresh();
  };
  const changeSort = async (row, delta) => {
    const res = await window.api.firearmAttrs.update(kind, row.id, {
      sortOrder: row.sortOrder + delta
    });
    if (res.success) await refresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: `Search ${kind}…`,
          value: filter,
          onChange: (e) => setFilter(e.target.value),
          className: "max-w-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-16", children: "Sort" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-48 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, children: "Loading…" }) }),
        !loading && filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, children: "No records." }) }),
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: !r.isActive ? "opacity-50" : "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => changeSort(r, -1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => changeSort(r, 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3 w-3" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.isActive ? "default" : "outline", children: r.isActive ? "Active" : "Inactive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3 mr-1" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => toggleActive(r), children: r.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3 w-3 mr-1" }),
              "Deactivate"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-3 w-3 mr-1" }),
              "Reactivate"
            ] }) })
          ] })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " ",
        kind.slice(0, -1)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "name",
            autoFocus: true,
            value: formName,
            onChange: (e) => setFormName(e.target.value)
          }
        ),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: err })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving || !formName.trim(), onClick: save, children: saving ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function FirearmAttributesScreen() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Firearm Attributes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage the dropdown lists used when registering firearm products." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Lookups" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "models", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "models", children: "Models" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "calibers", children: "Calibers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "shapes", children: "Shapes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "designs", children: "Designs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "models", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LookupTableEditor, { kind: "models" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "calibers", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LookupTableEditor, { kind: "calibers" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "shapes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LookupTableEditor, { kind: "shapes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "designs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LookupTableEditor, { kind: "designs" }) })
      ] }) })
    ] })
  ] });
}
export {
  FirearmAttributesScreen as default
};
