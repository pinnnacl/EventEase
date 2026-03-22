import {
  buildAvailabilityWhatsAppMessage,
  openWhatsAppWithText,
  readStoredEventDateLabel,
} from "../lib/wishlistActions";

/**
 * Centered premium CTA for wishlist actions (all saved items).
 *
 * @param {{
 *   venueNames: string[],
 *   photographyNames?: string[],
 *   catering: string[],
 *   decoration: string[]
 * }} props
 */
export default function WishlistTopActions({ venueNames, photographyNames = [], catering, decoration }) {
  function handleRequestCallback() {
    window.alert(
      "Thanks for your interest. Our team will reach out shortly.\n\n(This is a demo — connect this to your booking or CRM flow later.)",
    );
  }

  function handleCheckAvailability() {
    const eventDateLabel = readStoredEventDateLabel();
    const text = buildAvailabilityWhatsAppMessage({
      venueNames,
      photographyNames,
      catering,
      decoration,
      eventDateLabel,
    });
    openWhatsAppWithText(text);
  }

  const btnBase =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold leading-tight tracking-tight transition duration-200 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto sm:px-5 sm:py-2.5";

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-[#e6e0d4] bg-gradient-to-b from-[#fdfbf7] via-[#faf6ef] to-[#f3ece2] p-4 shadow-[0_8px_32px_-14px_rgba(20,43,60,0.16)] ring-1 ring-black/[0.03] sm:p-5">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-2.5">
        <button
          type="button"
          onClick={handleRequestCallback}
          className={`${btnBase} order-2 border border-brand-200/90 bg-white/90 text-wedding-ink shadow-sm backdrop-blur-sm hover:border-brand-300 hover:bg-white hover:shadow sm:order-1`}
        >
          <span className="text-[0.95rem] leading-none" aria-hidden>
            📞
          </span>
          Request Callback
        </button>
        <button
          type="button"
          onClick={handleCheckAvailability}
          className={`${btnBase} order-1 bg-brand-500 text-white shadow-[0_4px_14px_-3px_rgba(15,118,110,0.42)] hover:bg-brand-600 hover:shadow-[0_6px_20px_-4px_rgba(15,118,110,0.5)] sm:order-2`}
        >
          <span className="text-[0.95rem] leading-none" aria-hidden>
            📲
          </span>
          Check Availability
        </button>
      </div>
    </div>
  );
}
