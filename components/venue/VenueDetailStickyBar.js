"use client";

import { formatVenuePriceDisplay } from "../../lib/formatVenuePrice";

const LABEL_CLASS = "text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#666666]";

/**
 * Mobile sticky CTA: starting price + inquire.
 * @param {{
 *   priceRange?: string;
 *   demo?: boolean;
 *   sending?: boolean;
 *   notice?: { type: "success" | "error"; text: string } | null;
 *   onInquire: () => void;
 *   onCheckAvailability?: () => void;
 * }} props
 */
export default function VenueDetailStickyBar({
  priceRange = "",
  demo = false,
  sending = false,
  notice = null,
  onInquire,
  onCheckAvailability,
}) {
  const price = formatVenuePriceDisplay(priceRange);
  const amountDisplay = price.amount || (price.headline.includes("request") ? "On request" : price.headline);

  return (
    <>
      {notice ? (
        <div
          role="status"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-[62] mx-auto max-w-lg px-5 lg:hidden"
        >
          <p
            className={`rounded-xl border px-3 py-2 text-center text-xs font-medium shadow-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {notice.text}
          </p>
        </div>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-[61] border-t border-stone-200/80 bg-white/98 px-5 py-4 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <button type="button" onClick={onCheckAvailability} className="min-w-0 flex-1 text-left">
            <p className={LABEL_CLASS}>Starting from</p>
            <p className="font-display mt-1 truncate text-lg font-medium tabular-nums tracking-tight text-stone-900">
              {amountDisplay}
            </p>
          </button>
          <button
            type="button"
            disabled={demo || sending}
            onClick={onInquire}
            className="shrink-0 rounded-full bg-[#2C2C2C] px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] transition hover:bg-[#1A1A1A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {demo ? "Preview" : sending ? "Sending…" : "Inquire now"}
          </button>
        </div>
      </div>
    </>
  );
}
