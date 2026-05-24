import { getVenueDistanceDisplay } from "../../lib/venueDistanceLine";

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
 *   tone?: "default" | "soft";
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
  tone = "default",
}) {
  const muted =
    tone === "soft"
      ? "text-[0.75rem] font-normal leading-snug text-[#666666]"
      : "text-[0.8125rem] font-normal text-stone-500";
  const { line, loading, hint } = getVenueDistanceDisplay({
    venueLat,
    venueLng,
    viewerLat,
    viewerLng,
    viewerAccuracyM,
    status,
    usedFallback,
  });

  if (loading) {
    return <p className={`${muted} ${className}`.trim()}>{hint}</p>;
  }

  if (hint) {
    return <p className={`${muted} ${className}`.trim()}>{hint}</p>;
  }

  if (!line) return null;

  return (
    <p className={`${muted} tabular-nums ${className}`.trim()}>
      {line}
    </p>
  );
}
