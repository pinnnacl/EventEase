import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import WishlistToggle from "../WishlistToggle";
import useVenueCardPrefetch from "../../hooks/useVenueCardPrefetch";
import { normalizeVenueTitle } from "../../lib/normalizeVenueTitle";
import { getVenueDistanceDisplay } from "../../lib/venueDistanceLine";
import { buildVenueListingCarouselSlides } from "../../lib/venueListingCarouselSlides";
import { navigateToVenueHref } from "../../lib/venueRoutePrefetch";
import VenueListingPrice from "./VenueListingPrice";
import VenueListingImageCarousel from "./VenueListingImageCarousel";

export { VENUE_LISTING_FALLBACK_IMAGE } from "../../lib/venueListingCarouselSlides";

/** Floating card: framed 4:3 image carousel, copy on page background below. */
const IMAGE_ASPECT = "aspect-[4/3]";
/** Rounded mask — scroll track inside carousel must not use overflow-hidden on the same node. */
const IMAGE_FRAME = "relative w-full shrink-0 overflow-hidden rounded-2xl bg-stone-100 group/carousel";
const LISTING_SHELL = "group flex h-full w-full flex-col";
/** Gap between framed image and title (12–16px). */
const CONTENT_GAP = "pt-4";

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
 *     galleryImages?: string[] | null;
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
  const router = useRouter();
  const { rootRef, onIntent } = useVenueCardPrefetch(href, vendor.id);
  const [tapPending, setTapPending] = useState(false);

  const title = normalizeVenueTitle(vendor.businessName);
  const loc = vendor.place?.trim() || vendor.city?.trim() || "—";
  const price = vendor.priceRange?.trim() || "Ask for quote";
  const cap = vendor.capacity?.trim() || null;
  const aiDistanceKm = Number(vendor.aiDistanceKm);
  const hasAiDistance = Number.isFinite(aiDistanceKm) && aiDistanceKm >= 0;
  const aiDistanceText = hasAiDistance ? `${aiDistanceKm.toFixed(2)} km away` : "";

  const carouselSlides = useMemo(() => buildVenueListingCarouselSlides(vendor), [vendor]);

  const navigateToVenue = useCallback(() => {
    navigateToVenueHref(router, href, {
      onStart: () => setTapPending(true),
    });
  }, [router, href]);

  useEffect(() => {
    function clearPending() {
      setTapPending(false);
    }
    router.events.on("routeChangeComplete", clearPending);
    router.events.on("routeChangeError", clearPending);
    return () => {
      router.events.off("routeChangeComplete", clearPending);
      router.events.off("routeChangeError", clearPending);
    };
  }, [router.events]);

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

  function VenueCardMedia() {
    return (
      <div className={`${IMAGE_FRAME} ${IMAGE_ASPECT}`}>
        <VenueListingImageCarousel
          slides={carouselSlides}
          onNavigate={navigateToVenue}
          onIntent={onIntent}
          imageSizes={imageSizes}
          alt={title}
          unavailableOnSelectedDate={unavailableOnSelectedDate}
        />
        {showWishlistToggle ? (
          <WishlistToggle
            venueId={vendor.id}
            variant="overlay"
            iconOnly
            className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4"
          />
        ) : null}
      </div>
    );
  }

  function VenueCardCopy({ TitleTag = "h2" }) {
    return (
      <div className="flex flex-col gap-1.5">
        <TitleTag className="font-sans text-base font-bold leading-snug tracking-tight text-[#222222]">
          {title}
        </TitleTag>

        <p className="text-sm font-normal leading-snug text-[#717171]">
          {loc}
          {showMetaDivider ? (
            <>
              <span className="mx-1.5 text-[#D4D4D4]" aria-hidden>
                •
              </span>
              <span className="tabular-nums">{secondary}</span>
            </>
          ) : secondary ? (
            <span className="tabular-nums"> {secondary}</span>
          ) : null}
        </p>

        {cap ? (
          <p className="flex items-center gap-1.5 text-sm font-normal text-[#717171]">
            <Users className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="tabular-nums leading-none">{cap}</span>
            <span className="sr-only">guest capacity</span>
          </p>
        ) : null}

        <div className="pt-0.5">
          <VenueListingPrice price={price} align="left" />
        </div>
      </div>
    );
  }

  function VenueCardBody({ TitleTag = "h2" }) {
    return (
      <Link
        href={href}
        prefetch
        scroll={false}
        onMouseEnter={onIntent}
        onTouchStart={onIntent}
        onClick={() => {
          setTapPending(true);
          onIntent();
        }}
        className={`block ${CONTENT_GAP} focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2`}
      >
        <VenueCardCopy TitleTag={TitleTag} />
      </Link>
    );
  }

  return (
    <article
      ref={rootRef}
      className={`${LISTING_SHELL} transition-[opacity,transform] duration-150 ease-out ${
        tapPending ? "scale-[0.99] opacity-80" : ""
      }`}
      onMouseEnter={onIntent}
      onTouchStart={onIntent}
    >
      <VenueCardMedia />
      <VenueCardBody TitleTag={variant === "featured" ? "h3" : "h2"} />
    </article>
  );
}
