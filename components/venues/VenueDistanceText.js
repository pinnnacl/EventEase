import { calculateDistance, isValidLatLng } from "../../utils/distance";

const muted = "text-[0.7rem] font-medium text-stone-500 sm:text-xs";

/**
 * How many km to show — uses browser accuracy (metres) only to avoid implying false precision.
 * Not shown in the UI; coarse GPS → rounder numbers.
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
 * Read-only distance from viewer to venue (venue coords come from admin / DB).
 * Straight-line (Haversine), not driving distance.
 *
 * @param {{
 *   venueLat?: number | null;
 *   venueLng?: number | null;
 *   viewerLat?: number | null;
 *   viewerLng?: number | null;
 *   viewerAccuracyM?: number | null;
 *   status: 'loading' | 'ready' | 'unsupported' | 'unavailable';
 *   usedFallback?: boolean;
 *   className?: string;
 * }} props
 */
export default function VenueDistanceText({
  venueLat,
  venueLng,
  viewerLat,
  viewerLng,
  viewerAccuracyM = null,
  status,
  usedFallback = false,
  className = "",
}) {
  if (!isValidLatLng(venueLat, venueLng)) {
    return null;
  }

  if (status === "loading") {
    return <p className={`${muted} ${className}`.trim()}>Calculating distance…</p>;
  }

  if (status === "unsupported" || status === "unavailable") {
    return <p className={`${muted} ${className}`.trim()}>Enable location to see distance</p>;
  }

  if (status === "ready") {
    if (!isValidLatLng(viewerLat, viewerLng)) {
      return <p className={`${muted} ${className}`.trim()}>Enable location to see distance</p>;
    }

    const km = calculateDistance(viewerLat, viewerLng, venueLat, venueLng);
    if (!Number.isFinite(km)) {
      return null;
    }

    const line = formatKmLine(km, usedFallback ? null : viewerAccuracyM);

    return (
      <p className={`${muted} tabular-nums ${className}`.trim()}>
        📍 {line}
        {usedFallback ? " (approx.)" : ""}
      </p>
    );
  }

  return null;
}
