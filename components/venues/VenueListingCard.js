import Link from "next/link";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import WishlistToggle from "../WishlistToggle";
import { normalizeVenueTitle } from "../../lib/normalizeVenueTitle";
import { getVenueDistanceDisplay } from "../../lib/venueDistanceLine";
import VenueListingPrice from "./VenueListingPrice";

export const VENUE_LISTING_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f29da1c0c9?w=1200&q=80";

/** Fixed image height — full-bleed top section (mobile-first). */
const IMAGE_HEIGHT_CLASS = "h-[220px] sm:h-[230px]";

const CARD_SHELL =
  "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white transition-colors duration-200 ease-out hover:border-[#D8D8D8]";

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
  const title = normalizeVenueTitle(vendor.businessName);
  const loc = vendor.place?.trim() || vendor.city?.trim() || "—";
  const img = vendor.profileImage?.trim() || VENUE_LISTING_FALLBACK_IMAGE;
  const responsive = vendor.profileImageResponsive;
  const price = vendor.priceRange?.trim() || "Ask for quote";
  const cap = vendor.capacity?.trim() || null;
  const aiDistanceKm = Number(vendor.aiDistanceKm);
  const hasAiDistance = Number.isFinite(aiDistanceKm) && aiDistanceKm >= 0;
  const aiDistanceText = hasAiDistance ? `${aiDistanceKm.toFixed(2)} km away` : "";

  const distanceDisplay =
    geoStatus != null
      ? getVenueDistanceDisplay({
          venueLat: vendor.lat,
          venueLng: vendor.lng,
          viewerLat,
          viewerLng,
          viewerAccuracyM,
          status: geoStatus,
          usedFallback: geoUsedFallback,
        })
      : { line: null, loading: false, hint: null };

  const imageSizes =
    variant === "featured"
      ? "(max-width: 1024px) 100vw, 400px"
      : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px";

  function metaSecondary() {
    if (distanceDisplay.loading) return "Calculating distance…";
    if (distanceDisplay.line) return distanceDisplay.line;
    if (distanceDisplay.hint) return distanceDisplay.hint;
    if (hasAiDistance) return aiDistanceText;
    return null;
  }

  const secondary = metaSecondary();
  const showMetaDivider = Boolean(loc && secondary);

  /** Image fills card top edge — no padding, corners clip via card overflow-hidden. */
  function VenueCardMedia({ linked = true }) {
    const media = (
      <>
        <ResponsiveVendorImage
          responsive={responsive}
          src={img}
          alt=""
          className="block h-full w-full min-h-full min-w-full object-cover object-center"
          sizes={imageSizes}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-transparent"
          aria-hidden
        />
        {unavailableOnSelectedDate ? (
          <span className="absolute bottom-3 left-3 z-[1] rounded-lg bg-amber-950/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-white shadow-sm">
            Booked on your date
          </span>
        ) : null}
      </>
    );

    return (
      <div className={`relative w-full shrink-0 overflow-hidden bg-stone-200 ${IMAGE_HEIGHT_CLASS}`}>
        {linked ? (
          <Link
            href={href}
            className="relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400/50"
          >
            {media}
          </Link>
        ) : (
          <div className="relative h-full w-full">{media}</div>
        )}
        {showWishlistToggle ? (
          <WishlistToggle venueId={vendor.id} iconOnly className="absolute right-3 top-3 z-10" />
        ) : null}
      </div>
    );
  }

  function VenueCardBody({ TitleTag = "h2", asLink = true }) {
    const body = (
      <div className="flex flex-col gap-2 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <TitleTag className="min-w-0 flex-1 font-sans text-[0.9375rem] font-semibold leading-snug tracking-tight text-[#222222]">
            {title}
          </TitleTag>
          <VenueListingPrice price={price} align="right" className="shrink-0" />
        </div>

        <div className="flex min-h-[1.125rem] items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[0.8125rem] font-normal leading-relaxed text-[#717171]">
            {loc}
            {showMetaDivider ? (
              <>
                <span className="mx-1.5 text-[#D4D4D4]" aria-hidden>
                  •
                </span>
                <span className="tabular-nums text-[#717171]">{secondary}</span>
              </>
            ) : secondary ? (
              <span className="tabular-nums text-[#717171]"> {secondary}</span>
            ) : null}
          </p>
          {cap ? (
            <span className="shrink-0 text-[0.6875rem] font-normal text-[#717171]">{cap}</span>
          ) : null}
        </div>
      </div>
    );

    if (!asLink) return body;

    return (
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400/40"
      >
        {body}
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={href} className="block h-full w-full text-left">
        <article className={CARD_SHELL}>
          <VenueCardMedia linked={false} />
          <VenueCardBody TitleTag="h3" asLink={false} />
        </article>
      </Link>
    );
  }

  return (
    <article className={CARD_SHELL}>
      <VenueCardMedia />
      <VenueCardBody />
    </article>
  );
}
