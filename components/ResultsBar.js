import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export const SORT_FEATURED = "featured";
export const SORT_PRICE_ASC = "price_asc";
export const SORT_PRICE_DESC = "price_desc";
export const SORT_RATING = "rating";

export const DEFAULT_LOCATION_OPTIONS = ["Kerala", "Kochi", "Trivandrum", "Calicut", "Thrissur", "Munnar"];

const SORT_OPTIONS = [
  { value: SORT_FEATURED, label: "Featured" },
  { value: SORT_PRICE_ASC, label: "Price: Low to High" },
  { value: SORT_PRICE_DESC, label: "Price: High to Low" },
  { value: SORT_RATING, label: "Rating" },
];

function buildLocationOptions(currentLabel, propOptions) {
  const base = propOptions?.length ? [...propOptions] : [...DEFAULT_LOCATION_OPTIONS];
  const cur = (currentLabel || "Kerala").trim();
  if (!cur || base.includes(cur)) return base;
  return [cur, ...base];
}

/**
 * Tight marketplace-style results strip: inline location + sort.
 * Place inside `container-default`; full-width `border-b` on a parent for edge-to-edge divider.
 *
 * @param {{ tone?: "light" | "dark", layout?: "default" | "controlsOnly" }} props
 */
export default function ResultsBar({
  totalResults,
  location = "",
  onLocationChange,
  locationOptions,
  onSortChange,
  sortBy: sortByControlled,
  resultLabel = "venues",
  className = "",
  tone = "light",
  layout = "default",
}) {
  const listboxId = useId();
  const locationId = useId();
  const [internalSort, setInternalSort] = useState(SORT_FEATURED);
  const sortBy = sortByControlled ?? internalSort;
  const [sortOpen, setSortOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const barRef = useRef(null);
  const sortTriggerRef = useRef(null);
  const locationTriggerRef = useRef(null);

  const isDark = tone === "dark";
  const lineMuted = isDark ? "text-white/75" : "text-slate-600";
  const ink = isDark ? "text-white" : "text-wedding-ink";
  const sortHint = isDark ? "text-white/50" : "text-slate-500";
  const locOpenArrow = isDark ? "text-amber-200/90" : "text-brand-500";
  const locBtn =
    "group inline-flex items-baseline gap-0.5 rounded-sm px-0.5 -mx-0.5 font-medium underline-offset-[3px] transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 " +
    (isDark
      ? "text-amber-200/95 hover:text-amber-100 focus-visible:ring-amber-400/40 focus-visible:ring-offset-0"
      : "text-brand-600 hover:text-brand-700 focus-visible:ring-brand-500/35");
  const sortTriggerCls =
    "inline-flex max-w-[10.5rem] items-center gap-1 rounded border px-2 py-1 text-left text-xs font-medium transition sm:max-w-none sm:px-2.5 sm:text-sm " +
    (isDark
      ? "border-white/20 bg-white/10 text-white hover:border-white/30"
      : "border-slate-200/90 bg-white text-wedding-ink hover:border-slate-300");
  const sortChevron = isDark ? "text-white/60" : "text-slate-500";

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Featured";

  const displayLocation = (typeof location === "string" && location.trim()) || "Kerala";
  const options = useMemo(
    () => buildLocationOptions(displayLocation, locationOptions),
    [displayLocation, locationOptions],
  );

  const setSort = useCallback(
    (value) => {
      if (sortByControlled === undefined) setInternalSort(value);
      onSortChange?.(value);
      setSortOpen(false);
      sortTriggerRef.current?.focus();
    },
    [onSortChange, sortByControlled],
  );

  const pickLocation = useCallback(
    (value) => {
      onLocationChange?.(value);
      setLocationOpen(false);
      locationTriggerRef.current?.focus();
    },
    [onLocationChange],
  );

  useEffect(() => {
    if (!sortOpen && !locationOpen) return;
    function onDocMouseDown(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setSortOpen(false);
        setLocationOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setSortOpen(false);
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen, locationOpen]);

  const safeTotal = Math.max(0, totalResults);
  const noun = safeTotal === 1 ? resultLabel.replace(/s$/, "") : resultLabel;
  const locationInteractive = typeof onLocationChange === "function";

  const locationTrigger = locationInteractive ? (
    <span className="relative inline-flex align-baseline">
      <button
        ref={locationTriggerRef}
        type="button"
        id={`${locationId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={locationOpen}
        aria-controls={`${locationId}-listbox`}
        onClick={() => {
          setLocationOpen((o) => !o);
          setSortOpen(false);
        }}
        className={locBtn}
      >
        <span>{displayLocation}</span>
        <span
          className={`select-none transition-transform duration-200 ${locOpenArrow} ${locationOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {locationOpen ? (
        <ul
          id={`${locationId}-listbox`}
          role="listbox"
          aria-labelledby={`${locationId}-trigger`}
          className="animate-ee-dropdown-in absolute left-1/2 top-full z-[60] mt-1.5 w-[calc(100vw-2rem)] max-w-xs -translate-x-1/2 rounded-lg border border-slate-200/90 bg-white py-1 shadow-lg shadow-black/[0.08] sm:left-0 sm:w-48 sm:max-w-none sm:translate-x-0"
        >
          {options.map((opt) => {
            const active = opt === displayLocation;
            return (
              <li key={opt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pickLocation(opt)}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors sm:min-h-0 sm:py-2 ${
                    active ? "bg-brand-50 font-medium text-brand-800" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt}</span>
                  {active ? (
                    <svg className="h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </span>
  ) : (
    <span className={`font-medium ${ink}`}>{displayLocation}</span>
  );

  const sortBlock = (
    <div className="flex shrink-0 items-center gap-2">
      <span className={`text-xs ${layout === "controlsOnly" ? "" : "hidden sm:inline"} ${sortHint}`}>Sort</span>
      <div className="relative">
            <button
              ref={sortTriggerRef}
              type="button"
              id={`${listboxId}-trigger`}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-controls={`${listboxId}-listbox`}
              onClick={() => {
                setSortOpen((o) => !o);
                setLocationOpen(false);
              }}
              className={sortTriggerCls}
            >
              <span className="truncate">{selectedLabel}</span>
              <svg
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 sm:h-4 sm:w-4 ${sortChevron} ${sortOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {sortOpen ? (
              <ul
                id={`${listboxId}-listbox`}
                role="listbox"
                aria-labelledby={`${listboxId}-trigger`}
                className="animate-ee-dropdown-in absolute right-0 z-50 mt-1 w-max min-w-[11rem] max-w-[min(18rem,calc(100vw-2rem))] rounded-md border border-slate-200 bg-white py-0.5 shadow-md"
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = opt.value === sortBy;
                  return (
                    <li key={opt.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => setSort(opt.value)}
                        className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs sm:px-2.5 sm:text-sm ${
                          active ? "bg-slate-50 font-medium text-wedding-ink" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {active ? (
                          <svg className="h-3.5 w-3.5 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
    </div>
  );

  if (layout === "controlsOnly") {
    return (
      <div ref={barRef} className={`w-full py-0 ${className}`.trim()}>
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${sortHint}`}>Location</span>
            {locationInteractive ? locationTrigger : <span className={`text-sm font-medium ${ink}`}>{displayLocation}</span>}
          </div>
          {sortBlock}
        </div>
      </div>
    );
  }

  return (
    <div ref={barRef} className={`w-full py-2 sm:py-2.5 ${className}`.trim()}>
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className={`flex min-w-0 flex-1 flex-nowrap items-baseline gap-x-1 text-sm leading-snug ${lineMuted}`}>
          {safeTotal === 0 ? (
            <>
              <span className="min-w-0 shrink truncate">No {resultLabel} in</span>
              <span className="shrink-0">{locationTrigger}</span>
            </>
          ) : (
            <>
              <span className="min-w-0 shrink truncate">
                Showing <span className={`font-medium ${ink}`}>{safeTotal}</span> {noun} in
              </span>
              <span className="shrink-0">{locationTrigger}</span>
            </>
          )}
        </div>

        {sortBlock}
      </div>
    </div>
  );
}
