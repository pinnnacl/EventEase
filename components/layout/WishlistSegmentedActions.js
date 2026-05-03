import { useCallback, useEffect, useMemo, useState } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { readStoredEventDateLabel } from "../../lib/wishlistActions";

const TRANSITION = "duration-300 ease-in-out";

const segmentBase =
  "group/seg relative flex min-h-0 min-w-0 flex-1 cursor-pointer items-center justify-center px-3 py-1 text-center outline-none transition-colors duration-200 ease-out sm:px-4";

const segmentFocus =
  "focus-visible:ring-2 focus-visible:ring-[#134E4A]/15 focus-visible:ring-offset-0 sm:focus-visible:ring-inset";

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

/** Wishlist CTAs — WhatsApp Cloud API (server-side templates), no wa.me redirects. */
export default function WishlistSegmentedActions() {
  const { wishlist, count } = useWishlist();
  const { ensureCallbackAuth } = useCustomerAuth();
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

  const sendCallbackWithPass = useCallback(
    async (callbackPass) => {
      setNotice(null);
      setSending("callback");
      try {
        const { res, data } = await postWhatsAppApi("/api/whatsapp/send-callback", {
          ...payloadBase,
          callbackPass,
        });
        if (res.ok && data.ok) {
          setNotice({ type: "success", text: data.message || "Vendors have been notified." });
        } else {
          setNotice({
            type: "error",
            text: data.error || data.message || "Could not send WhatsApp messages. Try again later.",
          });
        }
      } catch {
        setNotice({ type: "error", text: "Network error. Try again." });
      } finally {
        setSending(null);
      }
    },
    [payloadBase],
  );

  const handleRequestCallback = useCallback(() => {
    setNotice(null);
    void ensureCallbackAuth((callbackPass) => sendCallbackWithPass(callbackPass));
  }, [ensureCallbackAuth, sendCallbackWithPass]);

  const handleCheckAvailability = useCallback(async () => {
    setNotice(null);
    setSending("availability");
    try {
      const { res, data } = await postWhatsAppApi("/api/whatsapp/send-availability", payloadBase);
      if (res.ok && data.ok) {
        setNotice({ type: "success", text: data.message || "Vendors have been notified." });
      } else {
        setNotice({
          type: "error",
          text: data.error || data.message || "Could not send WhatsApp messages. Try again later.",
        });
      }
    } catch {
      setNotice({ type: "error", text: "Network error. Try again." });
    } finally {
      setSending(null);
    }
  }, [payloadBase]);

  if (count === 0) return null;

  const segmentDesktop = `h-11 sm:h-12 ${segmentBase} ${segmentFocus}`;
  const busy = sending !== null;

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

      <div
        className={`mx-auto w-full max-w-[min(26rem,calc(100vw-2rem))] origin-top transition-transform ${TRANSITION} md:max-w-[min(32rem,36vw)]`}
      >
        <div
          className={`flex md:hidden ${TRANSITION} h-10 min-h-10 items-stretch overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md hover:shadow-lg`}
          role="toolbar"
          aria-label="Wishlist actions"
        >
          <button
            type="button"
            disabled={busy}
            onClick={handleRequestCallback}
            className="flex min-w-0 flex-1 items-center justify-center px-2 text-center text-[0.7rem] font-semibold leading-tight text-[#222222] transition-colors hover:bg-neutral-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#134E4A]/12 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending === "callback" ? "Sending…" : "Request callback"}
          </button>
          <div className="h-6 w-px shrink-0 self-center bg-gray-200" aria-hidden />
          <button
            type="button"
            disabled={busy}
            onClick={handleCheckAvailability}
            className="flex min-w-0 flex-1 items-center justify-center bg-[#134E4A] px-2 text-center text-[0.7rem] font-semibold leading-tight text-white transition-colors hover:bg-[#0f3f3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending === "availability" ? "Sending…" : "Check availability"}
          </button>
        </div>

        <div
          className={`hidden h-11 min-h-11 min-w-0 items-stretch overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-md backdrop-blur-md transition-shadow md:flex md:h-12 md:min-h-12 ${TRANSITION} hover:shadow-lg`}
          role="toolbar"
          aria-label="Wishlist actions"
        >
          <button
            type="button"
            disabled={busy}
            onClick={handleRequestCallback}
            className={`${segmentDesktop} min-w-0 flex-1 rounded-l-full hover:bg-neutral-100/90 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-[0.8125rem] font-semibold leading-tight text-[#222222] sm:text-sm">
              {sending === "callback" ? "Sending…" : "Request callback"}
            </span>
          </button>

          <div className="w-px shrink-0 self-center bg-gray-200 sm:h-6" aria-hidden />

          <button
            type="button"
            disabled={busy}
            onClick={handleCheckAvailability}
            className={`${segmentDesktop} min-w-0 flex-1 rounded-r-full bg-[#134E4A] hover:bg-[#0f3f3c] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-[0.8125rem] font-semibold leading-tight text-white sm:text-sm">
              {sending === "availability" ? "Sending…" : "Check availability"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
