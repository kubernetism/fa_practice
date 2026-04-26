import { r as reactExports, j as jsxRuntimeExports, a3 as Card, aV as CardHeader, aW as CardTitle, a4 as CardContent, L as Label, I as Input, aZ as formatCurrency } from "./index-B52pgjeh.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-cijvxAEp.js";
function defaultRange() {
  const end = /* @__PURE__ */ new Date();
  const start = new Date(end.getTime() - 30 * 24 * 3600 * 1e3);
  return { start: start.toISOString(), end: end.toISOString() };
}
function SalesByMakeReport() {
  const [range, setRange] = reactExports.useState(defaultRange());
  const [rows, setRows] = reactExports.useState([]);
  reactExports.useEffect(() => {
    window.api.firearmReports.salesByMake(range).then((r) => {
      if (r.success && r.data) setRows(r.data);
    }).catch(() => {
    });
  }, [range]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Sales by Make (Local vs Imported)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: range.start.slice(0, 10),
              onChange: (e) => setRange({ ...range, start: new Date(e.target.value).toISOString() })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: range.end.slice(0, 10),
              onChange: (e) => setRange({ ...range, end: new Date(e.target.value).toISOString() })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Make" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Sales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Units" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Margin" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground", children: "No sales in range." }) }),
          rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.make }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.sale_count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: r.units_sold }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCurrency(r.revenue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCurrency(r.margin) })
          ] }, r.make))
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SalesByMakeReport as default
};
