import Link from "next/link";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import WishlistToggle from "../WishlistToggle";
import VenueDistanceText from "./VenueDistanceText";

export const VENUE_LISTING_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f29da1c0c9?w=1200&q=80";

/**
 * @param {{
 *   vendor: {
 *     id: string;
 *     businessName?: string;
 *     location?: string;
 *     place?: string;
 *     city?: string;
 *     state?: string;
 *     profileImage?: string | null;
 *     profileImageResponsive?: { thumb: string; medium: string; large: string } | null;
 *     category?: string;
 *     priceRange?: string;
 *     capacity?: string | null;
 *     lat?: number | null;
 *     lng?: number | null;
 *     aiDistanceKm?: number | null;
 *     aiDistanceFrom?: string | null;
 *   };
 *   href: string;
 *   variant?: "featured" | "grid";
 *   showWishlistToggle?: boolean;
 *   unavailableOnSelectedDate?: boolean;
 *   viewerLat?: number | null;
 *   viewerLng?: number | null;
 *   viewerAccuracyM?: number | null;
 *   geoStatus?: 'loading' | 'ready' | 'unsupported' | 'unavailable';
 *   geoUsedFallback?: boolean;
 * }} props
 */
export default function VenueListingCard({
  vendor,
  href,
  variant = "grid",
  showWishlistToggle = false,
  unavailableOnSelectedDate = false,
  viewerLat = null,
  viewerLng = null,
  viewerAccuracyM = null,
  geoStatus,
  geoUsedFallback = false,
}) {
  const title = vendor.businessName || "Venue";
  /** Subtitle: vendor place/area only — not full address or venue name. */
  const loc = vendor.place?.trim() || vendor.city?.trim() || "—";
  const img = vendor.profileImage?.trim() || VENUE_LISTING_FALLBACK_IMAGE;
  const responsive = vendor.profileImageResponsive;
  const price = vendor.priceRange?.trim() || "Ask for quote";
  const cap = vendor.capacity?.trim() || null;
  const aiDistanceKm = Number(vendor.aiDistanceKm);
  const aiDistanceFrom = String(vendor.aiDistanceFrom || "").trim();
  const hasAiDistance = Number.isFinite(aiDistanceKm) && aiDistanceKm >= 0;
  const aiDistanceText = hasAiDistance ? `${aiDistanceKm.toFixed(1)} km from ${aiDistanceFrom || "your search location"}` : "";

  if (variant === "featured") {
    return (
      <Link href={href} className="block h-full text-left">
        <div className="group h-full overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm transition hover:shadow-md">
          <div className="relative overflow-hidden rounded-t-2xl bg-stone-100 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <ResponsiveVendorImage
                responsive={responsive}
                src={img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700">{loc}</p>
            </div>
            {unavailableOnSelectedDate ? (
              <p className="absolute right-3 top-3 rounded-full bg-amber-950/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                Booked on date
              </p>
            ) : null}
          </div>

          <div className="p-6">
            <h3 className="text-base font-semibold leading-snug text-wedding-ink sm:text-lg">{title}</h3>
            {geoStatus != null ? (
              <VenueDistanceText
                venueLat={vendor.lat}
                venueLng={vendor.lng}
                viewerLat={viewerLat}
                viewerLng={viewerLng}
                viewerAccuracyM={viewerAccuracyM}
                status={geoStatus}
                usedFallback={geoUsedFallback}
                className="mt-2"
              />
            ) : null}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-brand-600">{price}</span>
              {cap ? <span className="text-slate-600">{cap}</span> : <span className="text-slate-400">—</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/60 bg-white shadow-[0_3px_18px_-8px_rgba(20,43,60,0.12)] ring-1 ring-black/[0.02] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300/70 hover:shadow-[0_14px_36px_-14px_rgba(15,118,110,0.12)]">
      <div className="relative w-full shrink-0 overflow-hidden rounded-t-xl bg-stone-100 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Link
            href={href}
            className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-inset"
          >
            <ResponsiveVendorImage
              responsive={responsive}
              src={img}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
            {unavailableOnSelectedDate ? (
              <span className="absolute bottom-2 left-2 rounded-md bg-amber-950/85 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                Booked on your date
              </span>
            ) : null}
          </Link>
        </div>
        {showWishlistToggle ? (
          <WishlistToggle venueId={vendor.id} iconOnly className="absolute right-2 top-2 z-10 sm:right-2.5 sm:top-2.5" />
        ) : null}
      </div>

      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/30 sm:p-3"
      >
        <h2 className="text-base font-bold leading-snug tracking-tight text-wedding-ink sm:text-[1.0625rem]">{title}</h2>
        <p className="line-clamp-1 text-[0.7rem] font-medium text-stone-500 sm:text-xs">{loc}</p>
        {hasAiDistance ? (
          <p className="line-clamp-1 text-[0.68rem] font-semibold text-teal-700 sm:text-[0.72rem]">{aiDistanceText}</p>
        ) : null}
        {geoStatus != null ? (
          <VenueDistanceText
            venueLat={vendor.lat}
            venueLng={vendor.lng}
            viewerLat={viewerLat}
            viewerLng={viewerLng}
            viewerAccuracyM={viewerAccuracyM}
            status={geoStatus}
            usedFallback={geoUsedFallback}
            className="mt-0.5"
          />
        ) : null}
        <p className="mt-auto pt-0.5 text-base font-bold tabular-nums tracking-tight text-brand-600 sm:text-lg">{price}</p>
      </Link>
    </article>
  );
}
