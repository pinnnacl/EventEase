import { useCallback, useEffect, useState } from "react";
import ScheduleCallbackModal from "./wishlist/ScheduleCallbackModal";

/**
 * Centered premium CTA for wishlist actions (all saved items).
 */
export default function WishlistTopActions() {
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

  const btnPrimary =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold leading-tight tracking-tight transition duration-200 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 sm:py-2.5";

  return (
    <div className="mx-auto w-full max-w-xl">
      <ScheduleCallbackModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSuccess={handleSuccess}
      />

      {notice ? (
        <p
          role="status"
          className={`mb-3 rounded-xl border px-3 py-2 text-center text-xs font-medium sm:text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-md ring-1 ring-black/[0.03] sm:p-5">
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className={`${btnPrimary} bg-brand-500 text-white shadow-[0_4px_14px_-3px_rgba(15,118,110,0.42)] hover:bg-brand-600 hover:shadow-[0_6px_20px_-4px_rgba(15,118,110,0.5)]`}
          >
            <span className="text-[0.95rem] leading-none" aria-hidden>
              📅
            </span>
            Schedule Callback
          </button>
        </div>
      </div>
    </div>
  );
}
