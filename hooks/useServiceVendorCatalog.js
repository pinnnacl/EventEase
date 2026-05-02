import { useEffect, useState } from "react";

/**
 * Approved Photographer + Makeup vendors for wishlist name resolution (client fetch).
 */
export function useServiceVendorCatalog() {
  const [serviceVendors, setServiceVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/vendors/list?category=Photographer"),
          fetch("/api/vendors/list?category=Makeup"),
        ]);
        const [d1, d2] = await Promise.all([r1.json().catch(() => ({})), r2.json().catch(() => ({}))]);
        if (!active) return;
        const a = r1.ok && d1.ok && Array.isArray(d1.vendors) ? d1.vendors : [];
        const b = r2.ok && d2.ok && Array.isArray(d2.vendors) ? d2.vendors : [];
        if (!r1.ok || !r2.ok) setError(true);
        const merged = [...a, ...b];
        const seen = new Set();
        setServiceVendors(merged.filter((v) => (seen.has(v.id) ? false : seen.add(v.id))));
      } catch {
        if (active) {
          setServiceVendors([]);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { serviceVendors, loading, error };
}
