import { useCallback, useEffect, useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import ScheduleCallbackModal from "../wishlist/ScheduleCallbackModal";

const TRANSITION = "duration-300 ease-in-out";

/** Wishlist CTA — opens Schedule Callback modal (WhatsApp delivery via POST /api/callback/request). */
export default function WishlistSegmentedActions() {
  const { count } = useWishlist();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [notice, setNotice] = useState(/** @type {null | { type: "success" | "error"; text: string }} */ (null));

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const handleSuccess = useCallback(() => {
    setNotice({ type: "success", text: "Your callback request has been sent." });
  }, []);

  if (count === 0) return null;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {notice ? (
        <div
          role="status"
          className={`w-full max-w-[min(26rem,calc(100vw-2rem))] rounded-xl border px-3 py-2 text-center text-xs font-medium sm:text-sm md:max-w-[min(32rem,36vw)] ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <ScheduleCallbackModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSuccess={handleSuccess}
      />

      <div
        className={`mx-auto w-full max-w-[min(26rem,calc(100vw-2rem))] origin-top transition-transform ${TRANSITION} md:max-w-[min(32rem,36vw)]`}
      >
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className={`flex h-11 w-full min-h-11 items-center justify-center rounded-full bg-[#134E4A] px-4 text-center text-sm font-semibold leading-tight text-white shadow-md backdrop-blur-md transition-colors hover:bg-[#0f3f3c] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134E4A]/25 focus-visible:ring-offset-2 md:h-12 md:min-h-12`}
        >
          Schedule Callback
        </button>
      </div>
    </div>
  );
}
