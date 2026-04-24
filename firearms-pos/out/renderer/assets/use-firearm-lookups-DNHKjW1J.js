import { r as reactExports } from "./index-2rq_5YkW.js";
function useFirearmLookups(kind, activeOnly = true) {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const refresh = reactExports.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await window.api.firearmAttrs.list(kind, { activeOnly });
    if (res.success) setRows(res.data);
    else setError(res.message ?? "Failed to load");
    setLoading(false);
  }, [kind, activeOnly]);
  reactExports.useEffect(() => {
    refresh();
  }, [refresh]);
  const create = reactExports.useCallback(
    async (name) => {
      const res = await window.api.firearmAttrs.create(kind, { name });
      if (res.success && res.data) {
        await refresh();
        return res.data;
      }
      setError(res.message ?? "Failed to create");
      return null;
    },
    [kind, refresh]
  );
  return { rows, loading, error, refresh, create };
}
export {
  useFirearmLookups as u
};
