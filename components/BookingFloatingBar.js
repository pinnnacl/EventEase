import { useEffect, useRef, useState } from "react";

/** Matches the minimum bottom inset used in CSS (before safe-area), for lift math. */
const BASE_BOTTOM_PX = 20;

/**
 * @param {React.RefObject<HTMLElement | null>} barRef
 * @returns {number} Extra bottom offset (px) so the bar sits above the footer when it enters the viewport.
 */
function useLiftAboveFooter(barRef) {
  const [liftPx, setLiftPx] = useState(0);

  useEffect(() => {
    function measure() {
      const footer = document.querySelector("footer");
      if (!footer) {
        setLiftPx(0);
        return;
      }
      const fr = footer.getBoundingClientRect();
      const vh = window.innerHeight;
      const gap = 10;
      // Bar bottom (from viewport bottom) should be at least vh - fr.top + gap so the bar clears the footer top.
      const desiredBottom = Math.max(BASE_BOTTOM_PX, vh - fr.top + gap);
      setLiftPx(Math.max(0, desiredBottom - BASE_BOTTOM_PX));
    }

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const ro = barRef.current && typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (barRef.current && ro) ro.observe(barRef.current);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [barRef]);

  return liftPx;
}

/**
 * Premium floating booking bar (fixed, bottom-center). Stacks on small screens.
 *
 * @param {{
 *   availabilityText?: string | null,
 *   onCheckAvailability: () => void,
 *   onRequestCallback: () => void,
 *   className?: string,
 * }} props
 */
export default function BookingFloatingBar({
  availabilityText,
  onCheckAvailability,
  onRequestCallback,
  className = "",
}) {
  const barRef = useRef(null);
  const liftPx = useLiftAboveFooter(barRef);

  const btnPrimary =
    "inline-flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_3px_12px_-4px_rgba(11,94,88,0.28)] transition duration-200 ease-out hover:bg-brand-700 hover:shadow-[0_5px_16px_-6px_rgba(11,94,88,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto sm:min-h-[42px] sm:px-6 sm:py-2.5";

  const btnSecondary =
    "inline-flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-full border border-brand-200/90 bg-white/90 px-5 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-900 shadow-[0_1px_6px_-2px_rgba(20,43,60,0.08)] transition duration-200 ease-out hover:border-brand-300 hover:bg-white hover:shadow-[0_4px_14px_-6px_rgba(20,43,60,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto sm:min-h-[42px] sm:px-6 sm:py-2.5";

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 z-40 flex justify-stretch px-[var(--ee-container-px)] ${className}`}
      style={{
        bottom: `calc(max(1rem, env(safe-area-inset-bottom, 0px)) + ${liftPx}px)`,
      }}
      role="region"
      aria-label="Quick booking actions"
    >
      <div
        ref={barRef}
        className="pointer-events-auto w-full max-w-none rounded-[1.75rem] border border-stone-200/70 bg-white/95 px-4 py-3 shadow-md backdrop-blur-md sm:rounded-full sm:px-5 sm:py-3"
      >
        <div
          className={`flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5 ${availabilityText ? "sm:justify-between" : "sm:justify-end"}`}
        >
          {availabilityText ? (
            <div className="flex min-w-0 items-start gap-2 sm:max-w-[14rem]">
              <span className="mt-0.5 shrink-0 text-brand-500/90" aria-hidden>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-current">
                  <path
                    d="M8 2v3M16 2v3M3.5 9h17M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[0.7rem] leading-snug text-brand-700/75">{availabilityText}</span>
            </div>
          ) : null}

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
            <button type="button" className={btnSecondary} onClick={onRequestCallback}>
              Request callback
            </button>
            <button type="button" className={btnPrimary} onClick={onCheckAvailability}>
              Check availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
