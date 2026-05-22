import { calculateDistance, isValidLatLng } from "../utils/distance";

/**
 * @param {number} km
 * @param {number | null | undefined} accuracyM
 */
function formatKmLine(km, accuracyM) {
  const acc =
    typeof accuracyM === "number" && Number.isFinite(accuracyM) && accuracyM > 0 ? accuracyM : null;
  if (acc != null && acc > 2500) {
    return `${Math.round(km)} km away`;
  }
  if (acc != null && acc > 800) {
    return `${(Math.round(km * 10) / 10).toFixed(1)} km away`;
  }
  return `${(Math.round(km * 100) / 100).toFixed(2)} km away`;
}

/**
 * @param {{
 *   venueLat?: number | null;
 *   venueLng?: number | null;
 *   viewerLat?: number | null;
 *   viewerLng?: number | null;
 *   viewerAccuracyM?: number | null;
 *   status: 'loading' | 'ready' | 'unsupported' | 'unavailable';
 *   usedFallback?: boolean;
 * }} props
 * @returns {{ line: string | null; loading: boolean; hint: string | null }}
 */
export function getVenueDistanceDisplay({ venueLat, venueLng, viewerLat, viewerLng, viewerAccuracyM, status, usedFallback = false }) {
  if (!isValidLatLng(venueLat, venueLng)) {
    return { line: null, loading: false, hint: null };
  }

  if (status === "loading") {
    return { line: null, loading: true, hint: "Calculating distance…" };
  }

  if (status === "unsupported" || status === "unavailable") {
    return { line: null, loading: false, hint: "Enable location to see distance" };
  }

  if (status === "ready") {
    if (!isValidLatLng(viewerLat, viewerLng)) {
      return { line: null, loading: false, hint: "Enable location to see distance" };
    }

    const km = calculateDistance(viewerLat, viewerLng, venueLat, venueLng);
    if (!Number.isFinite(km)) {
      return { line: null, loading: false, hint: null };
    }

    const line = formatKmLine(km, usedFallback ? null : viewerAccuracyM);
    const suffix = usedFallback ? " (approx.)" : "";
    return { line: `${line}${suffix}`, loading: false, hint: null };
  }

  return { line: null, loading: false, hint: null };
}
