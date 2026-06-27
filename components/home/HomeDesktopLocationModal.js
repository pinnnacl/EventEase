"use client";

import { Crosshair, Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import locationImage from "../../assets/location_image.jpg";
import { ALL_CITIES } from "../../lib/popularCities";

const FEATURED_CITY = { name: "Kochi", label: "Kochi, Kerala" };

/**
 * Premium desktop-only location picker (portal overlay; header stays unblurred above z-[60]).
 *
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   selectedLabel: string;
 *   onSelect: (label: string) => void;
 *   anchorRef?: import("react").RefObject<HTMLElement | null>;
 * }} props
 */
export default function HomeDesktopLocationModal({
  open,
  onClose,
  selectedLabel,
  onSelect,
  anchorRef,
}) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const [anchorBottom, setAnchorBottom] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    function measureLayout() {
      const header = document.querySelector("header.sticky");
      const anchor = anchorRef?.current;
      setHeaderBottom(header?.getBoundingClientRect().bottom ?? 0);
      setAnchorBottom(anchor?.getBoundingClientRect().bottom ?? 0);
    }

    measureLayout();
    window.addEventListener("resize", measureLayout);
    window.addEventListener("scroll", measureLayout, { passive: true });
    return () => {
      window.removeEventListener("resize", measureLayout);
      window.removeEventListener("scroll", measureLayout);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q),
    );
  }, [query]);

  function pickCity(label) {
    onSelect(label);
    onClose();
  }

  async function detectLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json", "User-Agent": "eventease-kerala/1.0" } },
          );
          if (!res.ok) return;
          const data = await res.json().catch(() => null);
          const addr = data?.address;
          if (!addr) return;
          const city =
            addr.city || addr.town || addr.village || addr.state_district || addr.county || "";
          const state = addr.state || "";
          if (city) {
            pickCity(state ? `${city}, ${state}` : city);
          }
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  if (!mounted || !open || anchorBottom <= 0) return null;

  const modalTop = anchorBottom + 10;

  return createPortal(
    <>
      <div
        aria-hidden
        className="fixed inset-x-0 bottom-0 z-[58] hidden animate-ee-reel-modal-backdrop bg-black/40 backdrop-blur-sm lg:block"
        style={{ top: headerBottom }}
        onClick={onClose}
      />

      <div
        className="fixed z-[65] hidden w-full max-w-[900px] -translate-x-1/2 px-6 lg:block"
        style={{ top: modalTop, left: "50%", maxHeight: `calc(100vh - ${modalTop}px - 1rem)` }}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-desktop-location-title"
          className="animate-ee-dropdown-in pointer-events-auto flex w-full overflow-hidden rounded-2xl bg-white font-sans shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)]"
        >
          {/* Left — featured destination */}
          <div className="relative hidden min-h-[420px] w-1/2 shrink-0 lg:block">
            <img
              src={locationImage.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

            <div className="relative flex h-full min-h-[420px] flex-col justify-end p-8">
              <p className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.22em] text-primary">
                First exclusive destination
              </p>
              <h2
                id="home-desktop-location-title"
                className="mt-3 font-sans text-[2rem] font-bold leading-tight tracking-tight text-white"
              >
                Welcome to {FEATURED_CITY.name}
              </h2>
              <p className="mt-3 max-w-[18rem] font-sans text-sm leading-relaxed text-white/85">
                Discover handpicked experiences in the Queen of the Arabian Sea. From heritage walks to
                backwater retreats.
              </p>
              <button
                type="button"
                onClick={() => pickCity(FEATURED_CITY.label)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 font-sans text-sm font-bold text-black transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
              >
                Enter {FEATURED_CITY.name}
              </button>
            </div>
          </div>

          {/* Right — search & utility */}
          <div className="relative flex min-h-[420px] w-full flex-col bg-white p-8 pt-10 lg:w-1/2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close location picker"
              className="absolute right-5 top-5 z-20 inline-flex size-9 items-center justify-center rounded-full bg-slate-100 font-sans text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>

            <div className="relative z-10 pr-12 font-sans">
              <h3 className="text-xl font-bold tracking-tight text-neutral-900">Looking for elsewhere?</h3>
              <p className="mt-1.5 text-sm font-normal text-neutral-500">
                Search for cities or let us find you.
              </p>
            </div>

            <div className="relative z-10 mt-8 font-sans">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your cities"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-100/90 py-3.5 pl-11 pr-4 font-sans text-sm font-medium text-neutral-800 outline-none backdrop-blur-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200/80"
                aria-label="Search for your cities"
                autoComplete="off"
              />

              {filteredCities.length > 0 ? (
                <ul className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {filteredCities.map((city) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onClick={() => pickCity(city.label)}
                        className={`flex w-full px-4 py-2.5 text-left font-sans text-sm font-medium transition hover:bg-slate-50 ${
                          selectedLabel === city.label ? "bg-primary/10 text-neutral-900" : "text-neutral-700"
                        }`}
                      >
                        {city.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {query.trim() && filteredCities.length === 0 ? (
                <p className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-xl border border-slate-200 bg-white px-4 py-3 font-sans text-sm text-neutral-500 shadow-lg">
                  No cities match your search.
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => void detectLocation()}
              disabled={detecting}
              className="relative z-10 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-sans text-sm font-semibold text-neutral-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <Crosshair className="size-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden />
              {detecting ? "Detecting…" : "Detect my current location"}
            </button>

            <div className="relative z-10 mt-auto border-t border-slate-100 pt-6 font-sans">
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-[4.25rem] shrink-0 items-center" aria-hidden>
                  <span className="absolute left-0 size-8 rounded-full border-2 border-white bg-primary shadow-sm" />
                  <span className="absolute left-5 size-8 rounded-full border-2 border-white bg-slate-300 shadow-sm" />
                  <span className="absolute left-10 size-8 rounded-full border-2 border-white bg-slate-600 shadow-sm" />
                </div>
                <p className="text-sm text-neutral-600">
                  Launching in <span className="font-bold text-neutral-900">12 new cities</span> soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
