import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import VenueHeroTransitionOverlay from "../components/venue/VenueHeroTransitionOverlay";
import { snapVenueDetailToTop } from "../lib/venueDetailScroll";
import { parseVenueDetailHref, warmVenueHref } from "../lib/venueRoutePrefetch";

/** @typedef {{ top: number, left: number, width: number, height: number }} ViewRect */

/**
 * @param {HTMLElement} imageEl
 * @returns {{ fromRect: ViewRect, src: string, srcSet?: string, sizes?: string } | null}
 */
export function captureVenueTileImage(imageEl) {
  if (!imageEl || !(imageEl instanceof HTMLImageElement)) return null;
  const r = imageEl.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return {
    fromRect: { top: r.top, left: r.left, width: r.width, height: r.height },
    src: imageEl.currentSrc || imageEl.src,
    srcSet: imageEl.srcset || undefined,
    sizes: imageEl.sizes?.value || imageEl.getAttribute("sizes") || undefined,
  };
}

const VenueHeroTransitionContext = createContext(null);

export function useVenueHeroTransition() {
  const ctx = useContext(VenueHeroTransitionContext);
  if (!ctx) {
    return {
      flight: null,
      beginVenueHeroTransition: null,
      registerHeroTarget: () => {},
      isHeroHidden: () => false,
    };
  }
  return ctx;
}

/**
 * Cross-route hero transition (FLIP overlay). layoutId alone fails on Pages Router
 * because the listing page unmounts before the detail hero mounts.
 */
export function VenueHeroTransitionProvider({ children }) {
  const router = useRouter();
  const [flight, setFlight] = useState(
    /** @type {null | { venueId: string, href: string, fromRect: ViewRect, src: string, srcSet?: string, sizes?: string }} */ (
      null
    ),
  );
  const [toRect, setToRect] = useState(/** @type {ViewRect | null} */ (null));
  const pendingHeroRef = useRef(/** @type {HTMLElement | null} */ (null));

  const clearFlight = useCallback(() => {
    setFlight(null);
    setToRect(null);
    pendingHeroRef.current = null;
  }, []);

  const beginVenueHeroTransition = useCallback(
    (routerInstance, href, imageEl) => {
      const parsed = parseVenueDetailHref(href);
      if (!parsed) {
        void routerInstance.push(href, undefined, { scroll: false });
        return false;
      }

      const captured = captureVenueTileImage(imageEl);
      if (!captured) {
        void routerInstance.push(href, undefined, { scroll: false });
        return false;
      }

      warmVenueHref(routerInstance, href);
      setToRect(null);
      pendingHeroRef.current = null;
      setFlight({
        venueId: parsed.id,
        href,
        ...captured,
      });
      void routerInstance.push(href, undefined, { scroll: false });
      return true;
    },
    [],
  );

  const registerHeroTarget = useCallback(
    (el, venueId) => {
      if (!flight || flight.venueId !== venueId || !el) return;
      pendingHeroRef.current = el;

      const measure = () => {
        snapVenueDetailToTop();
        const node = pendingHeroRef.current;
        if (!node) return;
        const r = node.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        setToRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
    },
    [flight],
  );

  useEffect(() => {
    function onError() {
      clearFlight();
    }
    router.events.on("routeChangeError", onError);
    return () => router.events.off("routeChangeError", onError);
  }, [router.events, clearFlight]);

  useEffect(() => {
    if (!flight) return undefined;
    const timeout = window.setTimeout(clearFlight, 2800);
    return () => window.clearTimeout(timeout);
  }, [flight, clearFlight]);

  const isHeroHidden = useCallback(
    (venueId) => Boolean(flight && flight.venueId === venueId),
    [flight],
  );

  const value = useMemo(
    () => ({
      flight,
      beginVenueHeroTransition,
      registerHeroTarget,
      isHeroHidden,
      clearFlight,
    }),
    [flight, beginVenueHeroTransition, registerHeroTarget, isHeroHidden, clearFlight],
  );

  return (
    <VenueHeroTransitionContext.Provider value={value}>
      {children}
      <VenueHeroTransitionOverlay flight={flight} toRect={toRect} onComplete={clearFlight} />
    </VenueHeroTransitionContext.Provider>
  );
}
