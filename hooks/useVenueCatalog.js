import { useEffect, useState } from "react";

/**
 * Approved Venue vendors for wishlist name resolution (client fetch).
 */
export function useVenueCatalog() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/vendors/list?category=Venue");
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && data.ok && Array.isArray(data.vendors)) {
          setVenues(data.vendors);
        } else {
          setVenues([]);
          setError(true);
        }
      } catch {
        if (active) {
          setVenues([]);
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

  return { venues, loading, error };
}
