import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { warmVenueHref } from "../lib/venueRoutePrefetch";

/**
 * Prefetch venue detail route + API on hover/touch and when card enters viewport.
 * @param {string} href
 * @param {string} [venueId]
 */
export default function useVenueCardPrefetch(href, venueId) {
  const router = useRouter();
  const rootRef = useRef(/** @type {HTMLElement | null} */ (null));
  const warmedRef = useRef(false);

  const warm = useCallback(() => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    warmVenueHref(router, href);
  }, [router, href]);

  useEffect(() => {
    warmedRef.current = false;
  }, [href, venueId]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !venueId) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) warm();
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [venueId, warm]);

  return {
    rootRef,
    onIntent: warm,
  };
}
