import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import SearchSuggestions from "./SearchSuggestions";
import WishlistSegmentedActions from "./WishlistSegmentedActions";
import {
  locationLabelToCityParam,
  readStoredGuestCount,
  readStoredLocationLabel,
  writeStoredGuestCount,
  writeStoredLocationLabel,
} from "../../lib/siteSearchStorage";
import { parseEventDateLabelToYmd } from "../../lib/eventDateYmd";
import {
  readStoredEventDateLabel,
  writeStoredEventDateLabel,
} from "../../lib/wishlistActions";
import VenueListingCard from "../venues/VenueListingCard";
import ServicePortraitCard from "../service/ServicePortraitCard";

/** Gap between header bottom and floating action bar on home (px) */
const BAR_TOP_GAP_PX = 12;

/** Tighter gap on other routes — sits the action bar slightly higher under the header */
const BAR_TOP_GAP_NON_HOME_PX = 4;

const TRANSITION = "duration-300 ease-in-out";

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

/**
 * @param {{
 *  value: string;
 *  onChange: (v: string) => void;
 *  onSubmit: () => void;
 *  loading?: boolean;
 *  inputRef?: import("react").RefObject<HTMLInputElement | null>
 * }} props
 */
function AiSearchHeroBar({ value, onChange, onSubmit, loading = false, inputRef }) {
  return (
    <div className={`w-full origin-top transition-transform ${TRANSITION}`}>
      <div
        className={`group relative w-full overflow-hidden rounded-full border border-[#D8E4E7] bg-white/85 shadow-[0_10px_30px_-22px_rgba(20,43,60,0.25)] backdrop-blur-md transition ${TRANSITION} hover:shadow-[0_14px_36px_-22px_rgba(20,43,60,0.32)] focus-within:border-[#0F766E]/45 focus-within:shadow-[0_12px_34px_-22px_rgba(20,43,60,0.3)]`}
      >
        <div className="flex items-center gap-3 px-5 py-3.5 sm:gap-3.5 sm:px-6 sm:py-4">
          <span className="shrink-0 text-slate-500" aria-hidden>
            <svg className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l.7 2.1L8 15l-2.3.9L5 18l-.7-2.1L2 15l2.3-.9L5 12z" />
            </svg>
          </span>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Ask AI to plan your dream wedding..."
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0 sm:text-base"
          />

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(15,118,110,0.55)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#0E6A64] hover:shadow-[0_14px_28px_-14px_rgba(15,118,110,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99]"
          >
            <span>{loading ? "Curating..." : "Curate"}</span>
            <span aria-hidden className="text-white/90">
              ⚡
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function aiResultHref(vendor) {
  if (!vendor?.id) return "/venues";
  const category = String(vendor.category || "").trim();
  if (category === "Photographer") return `/photography/${vendor.id}`;
  if (category === "Makeup") return `/makeup/${vendor.id}`;
  if (category === "Venue") return `/venue/${vendor.id}`;
  return `/venue/${vendor.id}`;
}

function AiVendorResultTile({ row, idx }) {
  const vendor = row?.vendor;
  if (!vendor?.id) {
    const fallbackTitle = String(row?.mediaId || "AI match");
    const fallbackImg = String(row?.imageUrl || "").trim();
    return (
      <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="aspect-[4/3] w-full bg-stone-100">
          {fallbackImg ? <img src={fallbackImg} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="p-3">
          <p className="line-clamp-1 text-sm font-semibold text-slate-900">{fallbackTitle}</p>
          <p className="mt-0.5 text-xs text-slate-500">Vendor</p>
        </div>
      </article>
    );
  }
  const href = aiResultHref(vendor);
  const category = String(vendor.category || "").trim().toLowerCase();
  const cardVendor = {
    ...vendor,
    // Prefer canonical vendor profile image so tile matches listing pages.
    profileImage: vendor.profileImage || row?.imageUrl || "",
    aiDistanceKm: Number.isFinite(Number(row?.distanceKm)) ? Number(row.distanceKm) : null,
    aiDistanceFrom: typeof row?.distanceFrom === "string" ? row.distanceFrom : "",
  };

  if (category === "venue") {
    return (
      <VenueListingCard
        key={`${vendor.id}-${idx}`}
        vendor={cardVendor}
        href={href}
        variant="grid"
      />
    );
  }

  return (
    <ServicePortraitCard
      key={`${vendor.id}-${idx}`}
      vendor={cardVendor}
      href={href}
    />
  );
}

function StickySegmentedSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("Kochi, Kerala");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState("");

  const hydrate = useCallback(() => {
    setLocation(readStoredLocationLabel());
    const d = readStoredEventDateLabel();
    setEventDate(d || "");
    const g = readStoredGuestCount();
    setGuests(g || "");
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.pathname !== "/venues" && router.pathname !== "/photography") return;
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) {
      const c = raw.trim();
      setLocation(c === "Kerala" ? "Kerala" : `${c}, Kerala`);
    }
  }, [router.isReady, router.pathname, router.query.city, router.query.location]);

  const runSearch = useCallback(() => {
    writeStoredLocationLabel(location);
    writeStoredEventDateLabel(eventDate.trim() || null);
    writeStoredGuestCount(guests.trim() || null);
    const city = locationLabelToCityParam(location);
    const path = router.pathname === "/photography" ? "/photography" : "/venues";
    const ymd = parseEventDateLabelToYmd(eventDate.trim());
    const query = {};
    if (city && city !== "Kerala") query.city = city;
    if (ymd) query.date = ymd;
    router.push({ pathname: path, query });
  }, [eventDate, guests, location, router]);

  const segmentBase =
    "group/seg relative flex min-w-0 cursor-pointer flex-col justify-center px-3 py-1 text-left outline-none transition-colors duration-200 ease-out hover:bg-neutral-100/90 focus-within:bg-neutral-100/80 sm:px-4";

  const segmentFocus =
    "focus-within:ring-2 focus-within:ring-[#0F766E]/20 focus-within:ring-offset-0 sm:focus-within:ring-inset";

  const segmentDesktop = `h-11 sm:h-12 ${segmentBase} ${segmentFocus}`;

  const labelCls =
    "text-[0.58rem] font-semibold uppercase leading-none tracking-[0.14em] text-slate-500";

  const inputCls =
    "mt-0.5 w-full min-w-0 border-0 bg-transparent p-0 text-[0.8125rem] font-semibold leading-tight text-slate-900 outline-none ring-0 placeholder:font-normal placeholder:text-slate-500 focus:ring-0 sm:text-sm";

  const searchButtonClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-[0_4px_12px_-4px_rgba(15,118,110,0.4)] transition duration-200 ease-out hover:scale-105 hover:bg-[#0E6A64] hover:shadow-[0_6px_16px_-4px_rgba(15,118,110,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/35 focus-visible:ring-offset-2 active:scale-95 sm:h-8 sm:w-8";

  return (
    <div
      className={`mx-auto w-full max-w-[min(26rem,calc(100vw-2rem))] origin-top transition-transform ${TRANSITION} md:max-w-[min(32rem,36vw)]`}
    >
      {/* Mobile: single-line search bar */}
      <div
        className={`flex md:hidden ${TRANSITION} h-10 min-h-10 items-center overflow-hidden rounded-full border border-[#D8E4E7] bg-white/85 shadow-md backdrop-blur-md`}
        role="search"
      >
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-0 transition-colors hover:bg-neutral-100/90 focus-within:bg-neutral-100/80 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#0F766E]/12">
          <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0"
            autoComplete="off"
          />
        </label>
        <div className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />
        <div className="flex shrink-0 items-center p-1 pr-1.5">
          <button type="button" onClick={runSearch} aria-label="Search" className={searchButtonClass}>
            <SearchIcon className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Desktop: segmented Airbnb-style bar */}
      <div
        role="search"
        className={`hidden h-11 min-h-11 min-w-0 items-stretch overflow-hidden rounded-full border border-[#D8E4E7] bg-white/85 shadow-md backdrop-blur-md transition-shadow md:flex md:h-12 md:min-h-12 ${TRANSITION} hover:shadow-lg`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-stretch">
          <label className={`${segmentDesktop} min-w-0 flex-1 rounded-l-full`}>
            <span className={labelCls}>Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
              placeholder="Where"
              autoComplete="off"
            />
          </label>

          <div className="w-px shrink-0 self-center bg-gray-200 sm:h-6" aria-hidden />

          <label className={`${segmentDesktop} min-w-0 flex-1`}>
            <span className={labelCls}>Event date</span>
            <input
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputCls}
              placeholder="Add dates"
            />
          </label>

          <div className="w-px shrink-0 self-center bg-gray-200 sm:h-6" aria-hidden />

          <label className={`${segmentDesktop} min-w-0 flex-1`}>
            <span className={labelCls}>Guests</span>
            <input
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              inputMode="numeric"
              className={inputCls}
              placeholder="Add guests"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center border-l border-gray-200 bg-white/80 p-1 pr-1.5 backdrop-blur-md sm:pr-2">
          <button type="button" onClick={runSearch} aria-label="Search" className={searchButtonClass}>
            <SearchIcon className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ headerEl: HTMLElement | null }} props
 */
export default function AiSearchExperience({ headerEl }) {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const isWishlist = router.pathname === "/wishlist";
  const { count: wishlistCount } = useWishlist();

  const [headerH, setHeaderH] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);
  const aiInputRef = useRef(null);

  const handleSuggestionSelect = useCallback((text) => {
    setAiPrompt(text);
    requestAnimationFrame(() => {
      aiInputRef.current?.focus();
      aiInputRef.current?.setSelectionRange(text.length, text.length);
    });
  }, []);

  const runAiSearch = useCallback(async () => {
    const q = aiPrompt.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    setAiSearched(true);
    try {
      const res = await fetch("/api/ai/search/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ query: q, limit: 6 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setAiResults([]);
        setAiAnswer("");
        setAiError(data?.error || "Could not run AI search right now.");
        return;
      }
      setAiResults(Array.isArray(data.results) ? data.results : []);
      setAiAnswer(typeof data.answer === "string" ? data.answer : "");
    } catch {
      setAiResults([]);
      setAiAnswer("");
      setAiError("Network error while running AI search.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiLoading]);

  const barTopGap = isHome ? BAR_TOP_GAP_PX : BAR_TOP_GAP_NON_HOME_PX;
  const stickyBarTopPx = headerH ? headerH + barTopGap : barTopGap;

  useEffect(() => {
    if (!headerEl) {
      setHeaderH(0);
      return;
    }
    const ro = new ResizeObserver(() => {
      setHeaderH(headerEl.getBoundingClientRect().height);
    });
    ro.observe(headerEl);
    setHeaderH(headerEl.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [headerEl]);

  if (!isHome) {
    if (isWishlist && wishlistCount === 0) {
      return null;
    }

    return (
      <section
        className="sticky z-40 w-full border-0 bg-transparent shadow-none"
        style={{ top: stickyBarTopPx }}
        data-ai-search-sticky={isWishlist ? "wishlist-actions" : "segmented"}
      >
        <div className="px-container-fluid pt-1.5 pb-1.5 sm:pt-2 sm:pb-2">
          {isWishlist ? <WishlistSegmentedActions /> : <StickySegmentedSearch />}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full border-0 bg-transparent shadow-none">
        <div className={`grid transition-[grid-template-rows] ${TRANSITION} grid-rows-[1fr]`}>
          <div className="min-h-0 overflow-hidden">
            <div className={`px-container-fluid transition ${TRANSITION} translate-y-0 pt-16 pb-10 opacity-100 sm:pt-20 sm:pb-12`}>
              <div
                className={`mx-auto w-full max-w-4xl transition ${TRANSITION} will-change-transform scale-100`}
              >
                <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-7">
                  <h1 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-4xl">
                    Plan your dream wedding with AI
                  </h1>
                  <p className="mx-auto mt-2.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                    Tell us your style, date, and budget — we’ll curate venues and services that fit.
                  </p>
                </div>
                <div>
                  <AiSearchHeroBar
                    value={aiPrompt}
                    onChange={setAiPrompt}
                    onSubmit={runAiSearch}
                    loading={aiLoading}
                    inputRef={aiInputRef}
                  />
                </div>
                <SearchSuggestions onSelect={handleSuggestionSelect} />
                {aiSearched ? (
                  <div className="mt-5">
                    {aiError ? (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
                        {aiError}
                      </p>
                    ) : aiLoading ? (
                      <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                        Curating results with AI...
                      </p>
                    ) : aiResults.length === 0 ? (
                      <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                        No matches yet. Try a different style prompt.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {aiAnswer ? (
                          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                            {aiAnswer}
                          </p>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {aiResults.map((row, idx) => (
                            <AiVendorResultTile key={`${row?.vendorId || row?.mediaId || "m"}-${idx}`} row={row} idx={idx} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home page: segmented sticky action bar removed by request. */}
    </>
  );
}
