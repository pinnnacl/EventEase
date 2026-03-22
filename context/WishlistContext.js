import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eventease_wishlist";

const EMPTY = { venues: [], photography: [], catering: [], decoration: [] };

function normalizeWishlist(parsed) {
  if (Array.isArray(parsed)) {
    return {
      ...EMPTY,
      venues: parsed.filter((x) => typeof x === "string"),
    };
  }
  if (parsed && typeof parsed === "object") {
    return {
      venues: Array.isArray(parsed.venues) ? parsed.venues.filter((x) => typeof x === "string") : [],
      photography: Array.isArray(parsed.photography)
        ? parsed.photography.filter((x) => typeof x === "string")
        : [],
      catering: Array.isArray(parsed.catering) ? parsed.catering.filter((x) => typeof x === "string") : [],
      decoration: Array.isArray(parsed.decoration) ? parsed.decoration.filter((x) => typeof x === "string") : [],
    };
  }
  return { ...EMPTY };
}

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlist(normalizeWishlist(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist, ready]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        setWishlist(normalizeWishlist(JSON.parse(e.newValue)));
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((venueId) => {
    if (typeof venueId !== "string") return;
    setWishlist((prev) => ({
      ...prev,
      venues: prev.venues.includes(venueId) ? prev.venues.filter((x) => x !== venueId) : [...prev.venues, venueId],
    }));
  }, []);

  const togglePhotography = useCallback((photographerId) => {
    if (typeof photographerId !== "string") return;
    setWishlist((prev) => ({
      ...prev,
      photography: prev.photography.includes(photographerId)
        ? prev.photography.filter((x) => x !== photographerId)
        : [...prev.photography, photographerId],
    }));
  }, []);

  const has = useCallback((venueId) => wishlist.venues.includes(venueId), [wishlist.venues]);

  const hasPhotography = useCallback(
    (photographerId) => wishlist.photography.includes(photographerId),
    [wishlist.photography],
  );

  const totalCount =
    wishlist.venues.length +
    wishlist.photography.length +
    wishlist.catering.length +
    wishlist.decoration.length;

  const value = useMemo(
    () => ({
      wishlist,
      /** @deprecated use wishlist.venues — kept for any direct consumers */
      ids: wishlist.venues,
      ready,
      count: totalCount,
      toggle,
      togglePhotography,
      has,
      hasPhotography,
    }),
    [wishlist, ready, totalCount, toggle, togglePhotography, has, hasPhotography],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
