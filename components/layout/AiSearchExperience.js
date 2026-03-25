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
import {
  readStoredEventDateLabel,
  writeStoredEventDateLabel,
} from "../../lib/wishlistActions";

/** Scroll threshold (px) — Airbnb-style handoff from hero → sticky bar */
const SCROLL_COMPACT_PX = 100;

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
 * @param {{ value: string; onChange: (v: string) => void; inputRef?: import("react").RefObject<HTMLInputElement | null> }} props
 */
function AiSearchHeroBar({ value, onChange, inputRef }) {
  return (
    <div className={`w-full origin-top transition-transform ${TRANSITION}`}>
      <div
        className={`group relative w-full overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md transition ${TRANSITION} hover:shadow-lg focus-within:border-gray-300 focus-within:shadow-md`}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 sm:gap-3 sm:px-5 sm:py-3">
          <span className="shrink-0 text-[#717171]" aria-hidden>
            <svg className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l.7 2.1L8 15l-2.3.9L5 18l-.7-2.1L2 15l2.3-.9L5 12z" />
            </svg>
          </span>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask AI to plan your dream wedding..."
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#222222] outline-none placeholder:text-[#B0B0B0] focus:ring-0 sm:text-base"
          />

          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#134E4A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(19,78,74,0.45)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#0f3f3c] hover:shadow-[0_6px_18px_-4px_rgba(19,78,74,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134E4A]/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] sm:px-5"
          >
            <span>Curate</span>
            <span aria-hidden className="text-white/90">
              ⚡
            </span>
          </button>
        </div>
      </div>
    </div>
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
    router.push({ pathname: path, query: city && city !== "Kerala" ? { city } : {} });
  }, [eventDate, guests, location, router]);

  const segmentBase =
    "group/seg relative flex min-w-0 cursor-pointer flex-col justify-center px-3 py-1 text-left outline-none transition-colors duration-200 ease-out hover:bg-neutral-100/90 focus-within:bg-neutral-100/80 sm:px-4";

  const segmentFocus =
    "focus-within:ring-2 focus-within:ring-[#134E4A]/15 focus-within:ring-offset-0 sm:focus-within:ring-inset";

  const segmentDesktop = `h-11 sm:h-12 ${segmentBase} ${segmentFocus}`;

  const labelCls =
    "text-[0.58rem] font-semibold uppercase leading-none tracking-[0.14em] text-[#717171]";

  const inputCls =
    "mt-0.5 w-full min-w-0 border-0 bg-transparent p-0 text-[0.8125rem] font-semibold leading-tight text-[#222222] outline-none ring-0 placeholder:font-normal placeholder:text-[#B0B0B0] focus:ring-0 sm:text-sm";

  const searchButtonClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#134E4A] text-white shadow-[0_4px_12px_-4px_rgba(19,78,74,0.4)] transition duration-200 ease-out hover:scale-105 hover:bg-[#0f3f3c] hover:shadow-[0_6px_16px_-4px_rgba(19,78,74,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134E4A]/35 focus-visible:ring-offset-2 active:scale-95 sm:h-8 sm:w-8";

  return (
    <div
      className={`mx-auto w-full max-w-[min(26rem,calc(100vw-2rem))] origin-top transition-transform ${TRANSITION} md:max-w-[min(32rem,36vw)]`}
    >
      {/* Mobile: single-line search bar */}
      <div
        className={`flex md:hidden ${TRANSITION} h-10 min-h-10 items-center overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md`}
        role="search"
      >
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-0 transition-colors hover:bg-neutral-100/90 focus-within:bg-neutral-100/80 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#134E4A]/12">
          <SearchIcon className="h-4 w-4 shrink-0 text-[#717171]" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm font-medium text-[#222222] outline-none placeholder:text-[#B0B0B0] focus:ring-0"
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
        className={`hidden h-11 min-h-11 min-w-0 items-stretch overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md transition-shadow md:flex md:h-12 md:min-h-12 ${TRANSITION} hover:shadow-lg`}
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

  const [compact, setCompact] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const aiInputRef = useRef(null);

  const handleSuggestionSelect = useCallback((text) => {
    setAiPrompt(text);
    requestAnimationFrame(() => {
      aiInputRef.current?.focus();
      aiInputRef.current?.setSelectionRange(text.length, text.length);
    });
  }, []);

  useEffect(() => {
    if (!isHome) {
      setCompact(false);
      return;
    }

    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setCompact(window.scrollY >= SCROLL_COMPACT_PX);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

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
        className="sticky z-[51] w-full border-0 bg-transparent shadow-none"
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
        <div
          className={`grid transition-[grid-template-rows] ${TRANSITION} ${
            compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`px-container-fluid transition ${TRANSITION} ${
                compact ? "translate-y-1 py-0 opacity-0" : "translate-y-0 pt-10 pb-5 opacity-100 sm:pt-14 sm:pb-6"
              }`}
            >
              <div
                className={`mx-auto w-full max-w-4xl transition ${TRANSITION} will-change-transform ${
                  compact ? "pointer-events-none scale-95" : "scale-100"
                }`}
              >
                <AiSearchHeroBar value={aiPrompt} onChange={setAiPrompt} inputRef={aiInputRef} />
                {!compact ? <SearchSuggestions onSelect={handleSuggestionSelect} /> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed left-0 right-0 z-[52] border-0 bg-transparent px-container-fluid shadow-none will-change-transform ${TRANSITION} ${
          compact ? "pointer-events-none translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-3 scale-[0.97] opacity-0"
        }`}
        style={{ top: stickyBarTopPx }}
        aria-hidden={!compact}
        data-ai-search-sticky={compact ? "true" : "false"}
      >
        <div className={`mx-auto w-full max-w-4xl ${compact ? "pointer-events-auto" : "pointer-events-none"}`}>
          <StickySegmentedSearch />
        </div>
      </div>
    </>
  );
}
