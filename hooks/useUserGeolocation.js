import { useEffect, useState } from "react";

/** Kochi city center — optional reference when GPS fails (bonus; see `USE_KOCHI_FALLBACK`). */
const FALLBACK_LAT = 9.9312;
const FALLBACK_LNG = 76.2673;

/**
 * When `true`: if the user denies location or GPS errors, use Kochi coords so an approximate
 * distance still appears (bonus). When `false`: show "Enable location to see distance" only.
 */
const USE_KOCHI_FALLBACK = false;

/** Stop watching once the browser reports this accuracy (meters) or better. */
const ACCURACY_GOOD_ENOUGH_M = 75;

/** Give GPS time to refine after the first coarse fix (especially on mobile / desktop Wi‑Fi). */
const WATCH_MS = 25_000;

/**
 * Client-only: browser geolocation for distance features.
 * Uses `watchPosition` and keeps the most accurate fix (lowest `coords.accuracy`) within `WATCH_MS`.
 *
 * @returns {{
 *   status: 'loading' | 'ready' | 'unsupported' | 'unavailable';
 *   viewerLat: number | null;
 *   viewerLng: number | null;
 *   viewerAccuracyM: number | null;
 *   usedFallback: boolean;
 * }}
 */
export function useUserGeolocation() {
  const [state, setState] = useState(() => ({
    status: /** @type {'loading' | 'ready' | 'unsupported' | 'unavailable'} */ ("loading"),
    viewerLat: /** @type {number | null} */ (null),
    viewerLng: /** @type {number | null} */ (null),
    viewerAccuracyM: /** @type {number | null} */ (null),
    usedFallback: false,
  }));

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        status: "unsupported",
        viewerLat: null,
        viewerLng: null,
        viewerAccuracyM: null,
        usedFallback: false,
      });
      return;
    }

    let cancelled = false;
    let watchId = 0;
    let received = false;
    let timer = 0;

    const clear = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = 0;
      }
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    };

    const applyBetterFix = (lat, lng, accuracyM) => {
      setState((prev) => {
        const prevAcc =
          typeof prev.viewerAccuracyM === "number" && prev.viewerAccuracyM >= 0
            ? prev.viewerAccuracyM
            : Number.POSITIVE_INFINITY;
        if (prev.status === "ready" && accuracyM >= prevAcc) {
          return prev;
        }
        return {
          status: "ready",
          viewerLat: lat,
          viewerLng: lng,
          viewerAccuracyM: accuracyM,
          usedFallback: false,
        };
      });
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        received = true;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const rawAcc = pos.coords.accuracy;
        const accuracyM =
          typeof rawAcc === "number" && Number.isFinite(rawAcc) && rawAcc >= 0 ? rawAcc : 99999;
        applyBetterFix(lat, lng, accuracyM);
        if (accuracyM <= ACCURACY_GOOD_ENOUGH_M) {
          clear();
        }
      },
      () => {
        if (cancelled) return;
        if (USE_KOCHI_FALLBACK) {
          setState({
            status: "ready",
            viewerLat: FALLBACK_LAT,
            viewerLng: FALLBACK_LNG,
            viewerAccuracyM: null,
            usedFallback: true,
          });
        } else if (!received) {
          setState({
            status: "unavailable",
            viewerLat: null,
            viewerLng: null,
            viewerAccuracyM: null,
            usedFallback: false,
          });
        }
        clear();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      },
    );

    timer = window.setTimeout(() => {
      if (cancelled) return;
      clear();
      if (!received) {
        setState({
          status: "unavailable",
          viewerLat: null,
          viewerLng: null,
          viewerAccuracyM: null,
          usedFallback: false,
        });
      }
    }, WATCH_MS);

    return () => {
      cancelled = true;
      clear();
    };
  }, []);

  return state;
}
