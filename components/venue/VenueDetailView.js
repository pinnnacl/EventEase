import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import VenueDistanceText from "../venues/VenueDistanceText";
import useVenueInquire from "../../hooks/useVenueInquire";
import { useUserGeolocation } from "../../hooks/useUserGeolocation";
import { buildVenueHighlights } from "../../lib/buildVenueHighlights";
import { formatVenuePriceDisplay } from "../../lib/formatVenuePrice";
import { isValidYmd } from "../../lib/eventDateYmd";
import { parseVenueProximityPoints } from "../../lib/parseVenueProximity";
import { snapVenueDetailToTop } from "../../lib/venueDetailScroll";
import { readStoredEventDateYmd } from "../../lib/wishlistActions";
import { getPublicVenueDetailRows } from "../../lib/venueDetails";
import AmenityChips from "./AmenityChips";
import ReviewList from "./ReviewList";
import SectionContainer from "./SectionContainer";
import SectionTabs from "./SectionTabs";
import VenueDetailStickyBar from "./VenueDetailStickyBar";
import VenueGallery, { useIsLgViewport, useVenueHeroGallery, VenueHeroGallery } from "./VenueGallery";
import VenueDetailsRows from "./VenueDetailsRows";
import VenueHighlightsGrid from "./VenueHighlightsGrid";
import VenueMapEmbed from "./VenueMapEmbed";
import VenueMobileFloatingSummaryCard from "./VenueMobileFloatingSummaryCard";
import VenuePricingPremium from "./VenuePricingPremium";
import VenueProximityList from "./VenueProximityList";

function IconUsers({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function IconTag({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function IconLines({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function IconStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/** @param {string} ymd */
function formatYmdLong(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

const VENUE_SECTION_TABS = [
  { id: "venue-section-about", label: "About" },
  { id: "venue-section-venue-details", label: "Venue Details" },
  { id: "venue-section-photos", label: "Photos" },
  { id: "venue-section-pricing", label: "Pricing" },
  { id: "venue-section-reviews", label: "Reviews" },
];

export default function VenueDetailView({
  venue,
  similar,
  demo = false,
  availability: availabilityProp = { date: null, unavailableSelf: false, similarUnavailableIds: [] },
  showPendingPreviewBanner = false,
}) {
  const images = useMemo(() => (Array.isArray(venue.galleryImages) ? venue.galleryImages : []), [venue.galleryImages]);
  const galleryResponsive = useMemo(
    () => (Array.isArray(venue.galleryImagesResponsive) ? venue.galleryImagesResponsive : []),
    [venue.galleryImagesResponsive],
  );
  const [activeTag, setActiveTag] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState("venue-section-about");
  const heroResponsive = useMemo(
    () => galleryResponsive[0] || venue.profileImageResponsive || null,
    [galleryResponsive, venue.profileImageResponsive],
  );
  const isLgViewport = useIsLgViewport();
  const { slides: heroSlides, swiperEnabled: heroSwiperEnabled } = useVenueHeroGallery(
    venue.id,
    images[0],
    heroResponsive,
  );
  const [lightbox, setLightbox] = useState(null);

  const geo = useUserGeolocation();
  const router = useRouter();

  useEffect(() => {
    snapVenueDetailToTop();
  }, [venue.id]);

  const avDate = availabilityProp?.date ?? null;
  const avSimilarKey = Array.isArray(availabilityProp?.similarUnavailableIds)
    ? availabilityProp.similarUnavailableIds.join(",")
    : "";
  const av = useMemo(
    () => ({
      date: avDate,
      unavailableSelf: Boolean(availabilityProp?.unavailableSelf),
      similarUnavailableIds: Array.isArray(availabilityProp?.similarUnavailableIds)
        ? availabilityProp.similarUnavailableIds
        : [],
    }),
    [avDate, avSimilarKey, availabilityProp?.unavailableSelf],
  );

  const similarIdsKey = useMemo(() => similar.map((s) => s.id).join(","), [similar]);

  const [storedYmd, setStoredYmd] = useState(null);
  useEffect(() => {
    setStoredYmd(readStoredEventDateYmd());
  }, []);

  const urlYmd = useMemo(() => {
    if (!router.isReady) return null;
    const d = router.query.date;
    if (typeof d !== "string") return null;
    const s = d.trim().slice(0, 10);
    return isValidYmd(s) ? s : null;
  }, [router.isReady, router.query.date]);

  const effectiveYmd = urlYmd ?? storedYmd;
  const useServer = Boolean(effectiveYmd) && Boolean(av.date) && effectiveYmd === av.date;

  const [availabilityPending, setAvailabilityPending] = useState(false);
  const [fetchedSelfUnavailable, setFetchedSelfUnavailable] = useState(/** @type {boolean | null} */ (null));
  const [fetchedUnavailableSet, setFetchedUnavailableSet] = useState(/** @type {Set<string> | null} */ (null));

  useEffect(() => {
    if (demo || !effectiveYmd) {
      setAvailabilityPending(false);
      setFetchedSelfUnavailable(null);
      setFetchedUnavailableSet(null);
      return;
    }
    if (useServer) {
      setAvailabilityPending(false);
      setFetchedSelfUnavailable(null);
      setFetchedUnavailableSet(null);
      return;
    }
    const ids = [venue.id, ...similar.map((s) => s.id)].filter(Boolean);
    if (!ids.length) return;
    setAvailabilityPending(true);
    setFetchedSelfUnavailable(null);
    setFetchedUnavailableSet(null);
    let cancelled = false;
    const q = new URLSearchParams();
    q.set("date", effectiveYmd);
    q.set("ids", ids.join(","));
    fetch(`/api/public/venues-availability?${q.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        const u = new Set(data.unavailableIds || []);
        setFetchedSelfUnavailable(u.has(venue.id));
        setFetchedUnavailableSet(u);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedSelfUnavailable(false);
          setFetchedUnavailableSet(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [demo, effectiveYmd, useServer, venue.id, similarIdsKey, av.date]);

  const unavailableOnSelectedDate = demo
    ? false
    : useServer
      ? av.unavailableSelf
      : availabilityPending
        ? null
        : Boolean(fetchedSelfUnavailable);

  const similarUnavailable = useCallback(
    (id) => {
      if (demo) return false;
      if (useServer) return av.similarUnavailableIds.includes(id);
      if (availabilityPending) return false;
      return fetchedUnavailableSet?.has(id) ?? false;
    },
    [demo, useServer, av.similarUnavailableIds, availabilityPending, fetchedUnavailableSet],
  );

  const eventDateLabel = effectiveYmd ? formatYmdLong(effectiveYmd) : null;

  const similarHref = useCallback(
    (vid) => {
      if (demo) return "/venue/demo";
      const base =
        venue.category === "Photographer"
          ? `/photography/${vid}`
          : venue.category === "Makeup"
            ? `/makeup/${vid}`
            : `/venue/${vid}`;
      return effectiveYmd ? `${base}?date=${encodeURIComponent(effectiveYmd)}` : base;
    },
    [demo, effectiveYmd, venue.category],
  );

  const isVenue = venue.category === "Venue";

  const sectionTabsForNav = useMemo(
    () =>
      VENUE_SECTION_TABS.map((t) =>
        t.id === "venue-section-venue-details" ? { ...t, label: isVenue ? "Venue Details" : "Highlights" } : t,
      ),
    [isVenue],
  );

  const highlights = useMemo(() => {
    const f = (venue.facilities || []).slice(0, 3);
    if (f.length || !isVenue) return f;
    const rows = getPublicVenueDetailRows(venue.venueDetails);
    return rows
      .filter((r) => r.description !== "Not specified")
      .slice(0, 3)
      .map((r) => r.title);
  }, [venue.facilities, venue.venueDetails, isVenue]);
  const heroEyebrow = isVenue ? "Venue" : venue.category || "Vendor";

  const locationLabel = [venue.city, venue.state].filter(Boolean).join(", ") || venue.location || "";
  /** Location card + map caption: vendor `place` only (e.g. Thiruvankulam). Never venue name or full address. */
  const primaryPlaceLabel = venue.place?.trim() || "";
  const mapQuery = encodeURIComponent(
    venue.lat != null && venue.lng != null
      ? `${venue.lat},${venue.lng}`
      : venue.location?.trim() || venue.place?.trim() || locationLabel,
  );

  const tagPills = useMemo(() => {
    const f = venue.facilities || [];
    if (f.length) {
      return f
        .slice(0, 8)
        .map((x) => String(x).trim())
        .filter(Boolean);
    }
    if (isVenue) {
      const rows = getPublicVenueDetailRows(venue.venueDetails);
      const fromDetails = rows
        .filter((r) => r.description !== "Not specified")
        .slice(0, 8)
        .map((r) => r.title);
      if (fromDetails.length) return fromDetails;
    }
    const loc =
      venue.place?.trim() ||
      [venue.city, venue.state].filter(Boolean).join(", ") ||
      "";
    return [venue.category, loc.split(",")[0]?.trim()].filter(Boolean).slice(0, 4);
  }, [venue.facilities, venue.category, venue.city, venue.state, venue.place, venue.venueDetails, isVenue]);

  const amenityItems = useMemo(() => {
    if (isVenue) {
      const rows = getPublicVenueDetailRows(venue.venueDetails);
      const labels = rows.filter((r) => r.description !== "Not specified").map((r) => r.title);
      if (labels.length) return labels;
    }
    const f = (venue.facilities || []).map((x) => String(x).trim()).filter(Boolean);
    if (f.length) return f;
    return tagPills;
  }, [venue.facilities, venue.venueDetails, tagPills, isVenue]);

  const pricingBullets = useMemo(() => {
    const lines = [];
    const cap = venue.capacity?.trim();
    if (cap) lines.push(`Hosts up to ${cap} guests`);
    if (isVenue) {
      getPublicVenueDetailRows(venue.venueDetails)
        .filter((r) => r.description !== "Not specified")
        .slice(0, 4)
        .forEach((r) => lines.push(`${r.title}: ${r.description}`));
    } else {
      (venue.facilities || []).forEach((x) => {
        const s = String(x).trim();
        if (s) lines.push(s);
      });
    }
    const out = [...new Set(lines)];
    const extras = ["Custom packages tailored to your event", "Contact the host for a detailed quote"];
    for (const e of extras) {
      if (out.length >= 6) break;
      if (!out.includes(e)) out.push(e);
    }
    return out.slice(0, 6);
  }, [venue.capacity, venue.facilities, venue.venueDetails, isVenue]);

  const reviewItems = useMemo(() => {
    if (demo) {
      return [
        {
          id: "demo-r1",
          author: "Anjali & Rahul",
          rating: 5,
          text: "Beautiful space and a responsive team. Our families loved the layout and flow of the day.",
          date: "Dec 2024",
        },
        {
          id: "demo-r2",
          author: "Meera K.",
          rating: 4.5,
          text: "Great value for our reception. Clear communication and smooth coordination.",
          date: "Nov 2024",
        },
      ];
    }
    return [];
  }, [demo]);

  const scrollToSection = useCallback((id) => {
    setActiveSectionId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const elements = sectionTabsForNav.map((t) => document.getElementById(t.id)).filter(Boolean);
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.06)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target?.id;
        if (id) setActiveSectionId(id);
      },
      { root: null, rootMargin: "-12% 0px -48% 0px", threshold: [0, 0.12, 0.25, 0.45] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [venue.id, sectionTabsForNav]);

  const priceDisplay = venue.priceRange?.trim() || "Ask for quote";
  const priceFormatted = useMemo(() => formatVenuePriceDisplay(priceDisplay), [priceDisplay]);
  const glanceHighlights = useMemo(() => (isVenue ? buildVenueHighlights(venue) : []), [isVenue, venue]);
  const proximityPoints = useMemo(() => parseVenueProximityPoints(venue), [venue]);
  const { inquire, sending: inquireSending, notice: inquireNotice } = useVenueInquire({
    vendorId: venue.id,
    vendorName: venue.businessName,
    demo,
  });

  const scrollToPricing = useCallback(() => scrollToSection("venue-section-pricing"), [scrollToSection]);
  const scrollToPhotos = useCallback(() => scrollToSection("venue-section-photos"), [scrollToSection]);

  const openGallery = useCallback(() => {
    if (demo || !images.length) return;
    const q = new URLSearchParams();
    if (effectiveYmd) q.set("date", effectiveYmd);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    void router.push(`/venue/${venue.id}/photos${suffix}`);
  }, [demo, images.length, effectiveYmd, router, venue.id]);

  const heroImageClassName = "h-full w-full object-cover object-center transition duration-500 ease-out";

  return (
    <div className="w-full overflow-x-hidden bg-white text-slate-800">
      {showPendingPreviewBanner ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-950"
          role="status"
        >
          Admin preview — this listing is not public yet (status: {venue.status}). This is the same page couples will
          see after approval.
        </div>
      ) : null}
      {/* Mobile: hero + floating summary card (≤768px) */}
      <section className="relative overflow-x-hidden bg-white lg:hidden">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 touch-pan-y">
            <VenueHeroGallery
              slides={heroSlides}
              swiperEnabled={heroSwiperEnabled}
              active={!isLgViewport}
              imageClassName={heroImageClassName}
              onOpenGallery={openGallery}
            />
          </div>

          {isVenue ? (
            <VenueMobileFloatingSummaryCard
              venue={venue}
              reviews={reviewItems}
              viewerLat={geo.viewerLat}
              viewerLng={geo.viewerLng}
              viewerAccuracyM={geo.viewerAccuracyM}
              geoStatus={geo.status}
              geoUsedFallback={geo.usedFallback}
            />
          ) : null}
        </div>

        <div
          className={`mx-auto max-w-6xl px-5 pb-8 ${isVenue ? "max-md:pb-4 md:pt-7" : "pt-7"}`}
        >
          <div className={isVenue ? "hidden md:block" : undefined}>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#0F766E]">{heroEyebrow}</p>

            <div className="mt-2">
              <h1 className="font-display text-[1.65rem] font-medium leading-[1.2] tracking-tight text-stone-900">
                {venue.businessName}
              </h1>
              <p className="mt-1 text-[0.8125rem] font-normal leading-snug text-[#666666]">
                {primaryPlaceLabel || locationLabel || "Kerala"}
              </p>
              <VenueDistanceText
                venueLat={venue.lat}
                venueLng={venue.lng}
                viewerLat={geo.viewerLat}
                viewerLng={geo.viewerLng}
                viewerAccuracyM={geo.viewerAccuracyM}
                status={geo.status}
                usedFallback={geo.usedFallback}
                tone="soft"
                className="mt-0.5 block"
              />
            </div>

            <div className="mt-8 border-t border-stone-100 pt-7">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#666666]">Rates</p>
              <p className="font-display mt-2 text-xl font-medium leading-snug tracking-tight text-stone-900">
                {priceFormatted.headline}
              </p>
              {priceFormatted.subline ? (
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[#666666]">{priceFormatted.subline}</p>
              ) : null}
            </div>

            {isVenue && glanceHighlights.length ? (
              <div className="mt-8">
                <VenueHighlightsGrid items={glanceHighlights} />
              </div>
            ) : null}
          </div>

          {effectiveYmd && !demo ? (
            availabilityPending ? (
              <p className="mt-6 text-sm text-stone-600">Checking availability for {eventDateLabel}…</p>
            ) : unavailableOnSelectedDate ? (
              <div
                className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950"
                role="status"
              >
                Not available on <span className="whitespace-nowrap">{eventDateLabel}</span>.
              </div>
            ) : null
          ) : null}
        </div>
      </section>

      {/* Desktop: floating card hero */}
      <section className="relative hidden border-b border-stone-200/80 bg-white lg:block">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 lg:px-8">
          <div className="pb-[clamp(6rem,16vw,8.5rem)]">
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] ring-1 ring-stone-200/60">
                <div className="relative aspect-[2.2/1] w-full">
                  <VenueHeroGallery
                    slides={heroSlides}
                    swiperEnabled={heroSwiperEnabled}
                    active={isLgViewport}
                    imageClassName={heroImageClassName}
                    onOpenGallery={openGallery}
                  />
                  <div className="pointer-events-auto absolute right-5 top-5 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-md ring-1 ring-white/40">
                      <IconStar className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                      THAALI
                    </span>
                  </div>
                  {images.length > 0 ? (
                    <button
                      type="button"
                      onClick={scrollToPhotos}
                      className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-stone-900 shadow-lg ring-1 ring-white/50"
                    >
                      <LayoutGrid className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                      View all photos ({images.length})
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-[88%] z-20 flex justify-center px-4">
                <div className="pointer-events-auto w-full max-w-4xl">
                  <div className="rounded-[1.25rem] border border-slate-200/90 bg-white/90 px-8 py-6 shadow-[0_24px_56px_-16px_rgba(15,23,42,0.2)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-10">
                      <div className="min-w-0 flex-1 max-w-[28rem]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0F766E]">{heroEyebrow}</p>
                        <h1 className="font-display mt-2 text-[2rem] font-semibold leading-tight tracking-tight text-slate-900">
                          {venue.businessName}
                        </h1>
                      </div>
                      <div className="flex flex-nowrap items-stretch justify-end gap-4">
                        {isVenue ? (
                          <div className="flex min-w-[9.5rem] items-start gap-3 rounded-xl bg-slate-50/90 px-4 py-3.5 ring-1 ring-slate-200/70">
                            <IconUsers className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]" aria-hidden />
                            <div>
                              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Capacity</p>
                              <p className="mt-0.5 text-[0.9375rem] font-semibold text-slate-900">
                                {venue.capacity?.trim() || "On request"}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex min-w-[9.5rem] items-start gap-3 rounded-xl bg-slate-50/90 px-4 py-3.5 ring-1 ring-slate-200/70">
                          <IconTag className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]" aria-hidden />
                          <div>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Rates</p>
                            <p className="mt-0.5 text-[0.9375rem] font-semibold text-slate-900">{priceFormatted.headline}</p>
                          </div>
                        </div>
                        <div className="flex max-w-[14rem] min-w-[11rem] items-start gap-3 rounded-xl bg-slate-50/90 px-4 py-3.5 ring-1 ring-slate-200/70">
                          <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]" aria-hidden />
                          <div className="min-w-0">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Location</p>
                            <p className="mt-0.5 text-[0.9375rem] font-semibold leading-snug text-slate-900">
                              {primaryPlaceLabel || <span className="font-medium text-slate-400">Area not listed</span>}
                            </p>
                            <VenueDistanceText
                              venueLat={venue.lat}
                              venueLng={venue.lng}
                              viewerLat={geo.viewerLat}
                              viewerLng={geo.viewerLng}
                              viewerAccuracyM={geo.viewerAccuracyM}
                              status={geo.status}
                              usedFallback={geo.usedFallback}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-stone-100 bg-white">
        <div className="sticky top-0 z-20 border-b border-stone-100/90 bg-white/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionTabs tabs={sectionTabsForNav} activeId={activeSectionId} onSelect={scrollToSection} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:space-y-20 sm:px-6 lg:px-8 lg:py-14 lg:pb-32">
          <SectionContainer
            id="venue-section-about"
            title={
              <span className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.65rem]">
                {isVenue ? "The experience" : "About"}
              </span>
            }
          >
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
              <div className="space-y-8">
                <p className="whitespace-pre-line text-base leading-[1.75] text-stone-600">
                  {venue.description?.trim() ||
                    (isVenue
                      ? "This venue is listed on THAALI. Contact the host for full details, packages, and availability."
                      : "This vendor is listed on THAALI. Review pricing and portfolio details below.")}
                </p>
                {highlights.length ? (
                  <ul className="space-y-3">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-center gap-3 text-sm font-medium text-stone-800">
                        <IconCheck className="h-4 w-4 shrink-0 text-[#0F766E]" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {proximityPoints.length ? <VenueProximityList points={proximityPoints} /> : null}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-stone-900">Where you&apos;ll celebrate</h3>
                <div className="mt-4">
                  <VenueMapEmbed
                    lat={venue.lat}
                    lng={venue.lng}
                    mapQuery={mapQuery}
                    placeLabel={primaryPlaceLabel || locationLabel}
                    title={isVenue ? "Venue location" : "Service area"}
                  />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                  {primaryPlaceLabel || <span className="text-stone-400">Area not listed</span>}
                </p>
              </div>
            </div>
          </SectionContainer>

          <SectionContainer
            id="venue-section-venue-details"
            title={
              isVenue ? (
                <span className="flex items-center gap-2">
                  <IconLines className="h-6 w-6 shrink-0 text-[#0F766E]" aria-hidden />
                  Venue Details
                </span>
              ) : (
                "Highlights"
              )
            }
          >
            {isVenue ? (
              <VenueDetailsRows venueDetails={venue.venueDetails} />
            ) : (
              <AmenityChips items={amenityItems} activeIndex={activeTag} onSelect={setActiveTag} />
            )}
          </SectionContainer>

          <SectionContainer
            id="venue-section-photos"
            title={
              <span className="font-display text-2xl font-semibold tracking-tight text-stone-900">Gallery</span>
            }
          >
            <VenueGallery
              images={images}
              galleryResponsive={galleryResponsive}
              onImageClick={(src) => setLightbox(src)}
            />
          </SectionContainer>

          <SectionContainer
            id="venue-section-pricing"
            title={
              <span className="font-display text-2xl font-semibold tracking-tight text-stone-900">
                Packages &amp; rates
              </span>
            }
          >
            <VenuePricingPremium
              priceRange={priceDisplay}
              bullets={pricingBullets}
              capacity={venue.capacity}
              facilities={venue.facilities}
            />
          </SectionContainer>

          <SectionContainer
            id="venue-section-reviews"
            title={
              <span className="font-display text-2xl font-semibold tracking-tight text-stone-900">Guest stories</span>
            }
          >
            <ReviewList
              reviews={reviewItems}
              venueName={venue.businessName}
              onInquire={inquire}
              demo={demo}
            />
          </SectionContainer>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        {/* Similar */}
        {similar?.length ? (
          <section className="mt-14 border-t border-slate-100 pt-12">
            <h2 className="font-sans text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {isVenue ? "Similar venues" : "Similar listings"}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((v) => (
                <Link
                  key={v.id}
                  href={similarHref(v.id)}
                  className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {v.profileImage ? (
                      <ResponsiveVendorImage
                        responsive={v.profileImageResponsive}
                        src={v.profileImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 240px"
                        loading="lazy"
                        fetchPriority="low"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                    {similarUnavailable(v.id) ? (
                      <div className="absolute inset-x-0 bottom-0 bg-amber-950/85 px-2 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                        Booked on this date
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{v.businessName}</h3>
                    <p className="mt-1 text-xs text-slate-500">{v.place?.trim() || v.city?.trim() || "—"}</p>
                    <p className="mt-2 text-sm font-semibold text-[#0F766E]">{v.priceRange?.trim() || "Ask for quote"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Close image"
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
        </button>
      ) : null}

      {isVenue ? (
        <VenueDetailStickyBar
          priceRange={priceDisplay}
          demo={demo}
          sending={inquireSending}
          notice={inquireNotice}
          onInquire={inquire}
          onCheckAvailability={scrollToPricing}
        />
      ) : null}
    </div>
  );
}
