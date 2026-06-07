import {
  Award,
  BadgeCheck,
  Building2,
  Car,
  Gem,
  LayoutGrid,
  MapPin,
  Mic,
  Music,
  Snowflake,
  Trophy,
  Users,
  Utensils,
  Wine,
} from "lucide-react";
import {
  buildVenueMobileHighlightStats,
  buildVenueMobilePlaceLine,
  buildVenueMobileRating,
  qualifiesForTopRatedBadge,
  resolveVenueVerifiedForDisplay,
} from "../../lib/buildVenueMobileSummary";
import { getVenueDistanceDisplay } from "../../lib/venueDistanceLine";

const STAT_ICONS = {
  guests: Users,
  dining: Utensils,
  parking: Car,
  ac: Snowflake,
};

/** Minimal wedding ring line icon (lucide Ring unavailable in current package). */
function WeddingRingIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="14" r="6" />
      <path d="M9.5 6.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5" />
    </svg>
  );
}

/** @type {Record<string, import("lucide-react").LucideIcon | typeof WeddingRingIcon>} */
const SUITABLE_FOR_ICONS = {
  Weddings: WeddingRingIcon,
  Receptions: Wine,
  Engagements: Gem,
  Conferences: Mic,
  "Cultural Programs": Music,
  "Award Ceremonies": Trophy,
  Exhibitions: LayoutGrid,
  "Banquet Halls": Building2,
};

/**
 * @param {string} label
 */
function SuitableForSection({ suitableFor }) {
  if (!suitableFor || suitableFor.length === 0) return null;

  const iconClassName = "size-4 shrink-0 text-zinc-400";

  return (
    <>
      <div className="border-t border-zinc-100/80 mt-6 mb-5" />
      <section aria-label="Suitable for">
        <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-3.5">Suitable For</h3>
        <div className="grid w-full grid-cols-2 gap-x-3.5 gap-y-3">
          {suitableFor.map((label) => {
            const Icon = SUITABLE_FOR_ICONS[label] || Award;
            return (
              <span
                key={label}
                className="flex w-full items-center justify-start gap-3 rounded-full border border-zinc-200/60 bg-white px-4 py-2.5"
              >
                {Icon === WeddingRingIcon ? (
                  <WeddingRingIcon className={iconClassName} />
                ) : (
                  <Icon className={iconClassName} strokeWidth={1.5} aria-hidden />
                )}
                <span className="text-[13px] font-medium text-zinc-700 tracking-normal">{label}</span>
              </span>
            );
          })}
        </div>
      </section>
    </>
  );
}

/**
 * Premium floating summary card for mobile venue profile (max-width: 768px).
 * Header metadata + clean 2×2 highlights grid only — pricing lives in the sticky CTA bar.
 *
 * @param {{
 *   venue: object;
 *   reviews?: { rating?: number }[];
 *   viewerLat?: number | null;
 *   viewerLng?: number | null;
 *   viewerAccuracyM?: number | null;
 *   geoStatus?: 'loading' | 'ready' | 'unsupported' | 'unavailable';
 *   geoUsedFallback?: boolean;
 * }} props
 */
export default function VenueMobileFloatingSummaryCard({
  venue,
  reviews = [],
  viewerLat = null,
  viewerLng = null,
  viewerAccuracyM = null,
  geoStatus = "unavailable",
  geoUsedFallback = false,
}) {
  const placeLine = buildVenueMobilePlaceLine(venue);
  const rating = buildVenueMobileRating(venue, reviews);
  const highlightStats = buildVenueMobileHighlightStats(venue);
  const isVerified = resolveVenueVerifiedForDisplay(venue);
  const eyebrowLabel = qualifiesForTopRatedBadge(rating) ? "★ TOP RATED" : "★ PREMIUM VENUE";

  const distanceDisplay = getVenueDistanceDisplay({
    venueLat: venue.lat,
    venueLng: venue.lng,
    viewerLat,
    viewerLng,
    viewerAccuracyM,
    status: geoStatus,
    usedFallback: geoUsedFallback,
  });

  const distanceSecondary = distanceDisplay.loading
    ? "Calculating distance…"
    : distanceDisplay.line || distanceDisplay.hint || null;

  return (
    <div className="relative z-10 -mt-8 mx-4 mb-2 sm:mx-6 md:hidden">
      <article className="relative h-auto rounded-2xl border border-zinc-100/80 bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.07),0_12px_24px_-8px_rgba(0,0,0,0.04),0_0_40px_0_rgba(0,0,0,0.02)] sm:p-7">
        {/* Verified — absolute top-right, aligned with eyebrow row */}
        {isVerified ? (
          <BadgeCheck
            className="absolute top-5 right-5 h-[1.125rem] w-[1.125rem] text-emerald-600 sm:top-7 sm:right-7 sm:h-5 sm:w-5"
            strokeWidth={2}
            aria-label="Verified venue"
          />
        ) : null}

        {/* Header text stack (Option 2) */}
        <header className="flex flex-col pr-8 sm:pr-10">
          {/* Row 1 — eyebrow */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px] sm:tracking-[0.2em]">
            {eyebrowLabel}
          </p>

          {/* Row 2 — main title */}
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight tracking-tight text-zinc-950 sm:mt-1 sm:text-3xl sm:leading-tight">
            {venue.businessName}
          </h1>

          {/* Row 3 — location + distance */}
          {placeLine || distanceSecondary ? (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-light leading-snug text-zinc-400 sm:mt-1.5 sm:text-[11px]">
              <MapPin className="h-3 w-3 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
              <span>
                {placeLine}
                {placeLine && distanceSecondary ? (
                  <>
                    <span className="mx-1.5 text-zinc-300" aria-hidden>
                      •
                    </span>
                    <span className="tabular-nums">{distanceSecondary}</span>
                  </>
                ) : distanceSecondary ? (
                  <span className="tabular-nums">{distanceSecondary}</span>
                ) : null}
              </span>
            </p>
          ) : null}
        </header>

        {/* Highlights grid */}
        {highlightStats.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-x-1 gap-y-5 border-t border-zinc-100 pt-5 sm:mt-7 sm:pt-6">
            {highlightStats.map((stat) => {
              const Icon = STAT_ICONS[stat.id] || Users;
              const statLabel = stat.label || (stat.variant === "text" ? "Climate" : "");
              return (
                <li key={stat.id} className="flex flex-col items-center px-2 py-0.5 text-center">
                  <Icon className="h-5 w-5 text-zinc-500" strokeWidth={1.5} aria-hidden />
                  {stat.variant === "number" ? (
                    <>
                      <span className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {statLabel}
                      </span>
                      <span className="mt-1 text-[1.375rem] font-semibold leading-none tracking-tight text-zinc-900">
                        {stat.value}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {statLabel}
                      </span>
                      <span className="mt-1 text-base font-semibold leading-tight text-zinc-900">{stat.value}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}

        <SuitableForSection suitableFor={venue.suitableFor} />
      </article>
    </div>
  );
}
