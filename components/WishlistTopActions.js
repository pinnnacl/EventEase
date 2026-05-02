import { useCallback, useEffect, useMemo, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { readStoredEventDateLabel } from "../lib/wishlistActions";

async function postWhatsAppApi(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/**
 * Centered premium CTA for wishlist actions (all saved items).
 * Uses WhatsApp Cloud API — no client redirects.
 */
export default function WishlistTopActions() {
  const { wishlist } = useWishlist();
  const [sending, setSending] = useState(/** @type {null | "callback" | "availability"} */ (null));
  const [notice, setNotice] = useState(/** @type {null | { type: "success" | "error"; text: string }} */ (null));

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const payloadBase = useMemo(
    () => ({
      wishlist: {
        venues: wishlist.venues,
        photography: wishlist.photography,
        catering: wishlist.catering,
        decoration: wishlist.decoration,
      },
      eventDate: readStoredEventDateLabel(),
    }),
    [wishlist],
  );

  const run = useCallback(
    async (kind) => {
      setNotice(null);
      setSending(kind);
      const path = kind === "callback" ? "/api/whatsapp/send-callback" : "/api/whatsapp/send-availability";
      try {
        const { res, data } = await postWhatsAppApi(path, payloadBase);
        if (res.ok && data.ok) {
          setNotice({ type: "success", text: data.message || "Vendors have been notified." });
        } else {
          setNotice({
            type: "error",
            text: data.error || data.message || "Could not send WhatsApp messages.",
          });
        }
      } catch {
        setNotice({ type: "error", text: "Network error." });
      } finally {
        setSending(null);
      }
    },
    [payloadBase],
  );

  const busy = sending !== null;

  const btnBase =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold leading-tight tracking-tight transition duration-200 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 sm:py-2.5";

  return (
    <div className="mx-auto w-full max-w-xl">
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
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => run("callback")}
            className={`${btnBase} order-2 border border-brand-200/90 bg-white/90 text-wedding-ink shadow-sm backdrop-blur-sm hover:border-brand-300 hover:bg-white hover:shadow sm:order-1`}
          >
            <span className="text-[0.95rem] leading-none" aria-hidden>
              📞
            </span>
            {sending === "callback" ? "Sending…" : "Request Callback"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run("availability")}
            className={`${btnBase} order-1 bg-brand-500 text-white shadow-[0_4px_14px_-3px_rgba(15,118,110,0.42)] hover:bg-brand-600 hover:shadow-[0_6px_20px_-4px_rgba(15,118,110,0.5)] sm:order-2`}
          >
            <span className="text-[0.95rem] leading-none" aria-hidden>
              📲
            </span>
            {sending === "availability" ? "Sending…" : "Check Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}
