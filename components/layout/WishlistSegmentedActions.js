import { useCallback, useMemo } from "react";
import { useWishlist } from "../../context/WishlistContext";
import { photographers } from "../../data/photographers";
import { venues } from "../../data/venues";
import {
  buildAvailabilityWhatsAppMessage,
  openWhatsAppWithText,
  readStoredEventDateLabel,
} from "../../lib/wishlistActions";

const TRANSITION = "duration-300 ease-in-out";

const segmentBase =
  "group/seg relative flex min-h-0 min-w-0 flex-1 cursor-pointer items-center justify-center px-3 py-1 text-center outline-none transition-colors duration-200 ease-out sm:px-4";

const segmentFocus =
  "focus-visible:ring-2 focus-visible:ring-[#134E4A]/15 focus-visible:ring-offset-0 sm:focus-visible:ring-inset";

/** Wishlist CTAs using the same pill / segmented chrome as the main search action bar. */
export default function WishlistSegmentedActions() {
  const { wishlist, count } = useWishlist();

  const venueNames = useMemo(
    () => wishlist.venues.map((id) => venues.find((v) => v.id === id)?.name).filter(Boolean),
    [wishlist.venues],
  );
  const photographyNames = useMemo(
    () =>
      wishlist.photography.map((id) => photographers.find((p) => p.id === id)?.name).filter(Boolean),
    [wishlist.photography],
  );

  const handleRequestCallback = useCallback(() => {
    window.alert(
      "Thanks for your interest. Our team will reach out shortly.\n\n(This is a demo — connect this to your booking or CRM flow later.)",
    );
  }, []);

  const handleCheckAvailability = useCallback(() => {
    const text = buildAvailabilityWhatsAppMessage({
      venueNames,
      photographyNames,
      catering: wishlist.catering,
      decoration: wishlist.decoration,
      eventDateLabel: readStoredEventDateLabel(),
    });
    openWhatsAppWithText(text);
  }, [venueNames, photographyNames, wishlist.catering, wishlist.decoration]);

  if (count === 0) return null;

  const segmentDesktop = `h-11 sm:h-12 ${segmentBase} ${segmentFocus}`;

  return (
    <div
      className={`mx-auto w-full max-w-[min(26rem,calc(100vw-2rem))] origin-top transition-transform ${TRANSITION} md:max-w-[min(32rem,36vw)]`}
    >
      {/* Mobile: compact pill — same shell as segmented mobile search */}
      <div
        className={`flex md:hidden ${TRANSITION} h-10 min-h-10 items-stretch overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md hover:shadow-lg`}
        role="toolbar"
        aria-label="Wishlist actions"
      >
        <button
          type="button"
          onClick={handleRequestCallback}
          className="flex min-w-0 flex-1 items-center justify-center px-2 text-center text-[0.7rem] font-semibold leading-tight text-[#222222] transition-colors hover:bg-neutral-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#134E4A]/12"
        >
          Request callback
        </button>
        <div className="h-6 w-px shrink-0 self-center bg-gray-200" aria-hidden />
        <button
          type="button"
          onClick={handleCheckAvailability}
          className="flex min-w-0 flex-1 items-center justify-center bg-[#134E4A] px-2 text-center text-[0.7rem] font-semibold leading-tight text-white transition-colors hover:bg-[#0f3f3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/25"
        >
          Check availability
        </button>
      </div>

      {/* Desktop: segmented bar — mirrors StickySegmentedSearch */}
      <div
        className={`hidden h-11 min-h-11 min-w-0 items-stretch overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md transition-shadow md:flex md:h-12 md:min-h-12 ${TRANSITION} hover:shadow-lg`}
        role="toolbar"
        aria-label="Wishlist actions"
      >
        <button
          type="button"
          onClick={handleRequestCallback}
          className={`${segmentDesktop} min-w-0 flex-1 rounded-l-full hover:bg-neutral-100/90`}
        >
          <span className="text-[0.8125rem] font-semibold leading-tight text-[#222222] sm:text-sm">
            Request callback
          </span>
        </button>

        <div className="w-px shrink-0 self-center bg-gray-200 sm:h-6" aria-hidden />

        <button
          type="button"
          onClick={handleCheckAvailability}
          className={`${segmentDesktop} min-w-0 flex-1 rounded-r-full bg-[#134E4A] hover:bg-[#0f3f3c]`}
        >
          <span className="text-[0.8125rem] font-semibold leading-tight text-white sm:text-sm">
            Check availability
          </span>
        </button>
      </div>
    </div>
  );
}
