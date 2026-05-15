import { useCallback, useEffect, useRef, useState } from "react";
import { useHomeAiSearch } from "../../context/HomeAiSearchContext";

const SCROLL_HIDE_AFTER = 56;
const MOBILE_LOCATION_OPTIONS = ["Kochi"];

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function LocationIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-6-4.9-6-10a6 6 0 1112 0c0 5.1-6 10-6 10zm0-8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      />
    </svg>
  );
}

/**
 * Compact AI bar for mobile home header; hides when user scrolls down.
 */
export default function MobileHeaderAiSearch() {
  const ctx = useHomeAiSearch();
  const [scrolledDown, setScrolledDown] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const locationMenuRef = useRef(null);

  const onScroll = useCallback(() => {
    setScrolledDown(typeof window !== "undefined" && window.scrollY > SCROLL_HIDE_AFTER);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!locationMenuOpen) return;
    function onPointerDown(e) {
      const el = locationMenuRef.current;
      if (el && !el.contains(e.target)) setLocationMenuOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [locationMenuOpen]);

  if (!ctx) return null;

  const { aiPrompt, setAiPrompt, runAiSearch, aiLoading, aiInputRef } = ctx;
  const pickLocation = (city) => {
    setSelectedLocation(city);
    setAiPrompt(city);
    setLocationMenuOpen(false);
  };

  return (
    <div
      className={`border-t border-stone-200/40 bg-stone-50/90 transition-[max-height,opacity,padding] duration-300 ease-out ${
        scrolledDown
          ? "pointer-events-none max-h-0 overflow-hidden border-t-transparent py-0 opacity-0"
          : "max-h-[7.5rem] overflow-visible py-2 opacity-100"
      }`}
      aria-hidden={scrolledDown ? "true" : "false"}
    >
      <div className="px-container-fluid">
        <div className="flex w-full min-w-0 items-center gap-2 rounded-[12px] border border-[#D8E4E7] bg-white/95 px-2.5 py-1 shadow-sm">
          <input
            ref={aiInputRef}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runAiSearch();
              }
            }}
            placeholder="Search smarter with AI"
            className="min-h-[44px] min-w-0 flex-[1_1_0%] border-0 bg-transparent py-2 pl-1 text-[0.8125rem] font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0"
            aria-label="AI wedding search"
          />
          <div ref={locationMenuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="Choose location"
              aria-haspopup="menu"
              aria-expanded={locationMenuOpen}
              onClick={() => setLocationMenuOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0F766E]/18 bg-[#0F766E]/8 text-[#0F766E] shadow-sm transition active:scale-[0.98]"
            >
              <LocationIcon className="h-4 w-4" />
            </button>
            <div
              role="menu"
              aria-label="Location options"
              className={`absolute right-0 top-[calc(100%+0.45rem)] z-30 min-w-[8.25rem] rounded-xl border border-stone-200/80 bg-white p-1.5 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)] transition ${
                locationMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {MOBILE_LOCATION_OPTIONS.map((city) => {
                const active = selectedLocation === city;
                return (
                  <button
                    key={city}
                    type="button"
                    role="menuitem"
                    onClick={() => pickLocation(city)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      active ? "bg-[#0F766E]/10 text-[#0F766E]" : "text-slate-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>{city}</span>
                    {active ? <span aria-hidden>✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void runAiSearch()}
            disabled={aiLoading}
            aria-label="Curate"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#5A45F5] to-[#4F39F2] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(79,57,242,0.65)] transition duration-200 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]/45 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:opacity-60"
          >
            <span>Curate</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
