"use client";

import { useCallback, useEffect, useState } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { readStoredEventDateLabel } from "../../lib/wishlistActions";

/**
 * Single server-driven callback CTA for public vendor profiles (no phone / WhatsApp / tel exposed).
 *
 * @param {{
 *   vendorId: string,
 *   vendorName?: string,
 *   category: "makeup" | "photographer",
 *   demo?: boolean,
 *   variant: "makeup" | "photographer",
 * }} props
 */
export default function ProfileRequestCallbackBar({
  vendorId,
  vendorName = "",
  category,
  demo = false,
  variant,
}) {
  const { ensureCallbackAuth } = useCustomerAuth();
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(/** @type {null | { type: "success" | "error"; text: string }} */ (null));

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const sendWithPass = useCallback(
    async (callbackPass) => {
      if (demo || !vendorId) return;
      setSending(true);
      setNotice(null);
      try {
        const res = await fetch("/api/whatsapp/send-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            vendorId,
            vendorCategory: category,
            vendorName: vendorName || "",
            eventDate: readStoredEventDateLabel() || "",
            callbackPass,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          setNotice({ type: "success", text: "Vendor has been notified." });
        } else {
          setNotice({ type: "error", text: data.error || "Something went wrong. Try again." });
        }
      } catch {
        setNotice({ type: "error", text: "Something went wrong. Try again." });
      } finally {
        setSending(false);
      }
    },
    [vendorId, vendorName, category, demo],
  );

  const onRequest = useCallback(() => {
    if (demo || !vendorId) return;
    setNotice(null);
    void ensureCallbackAuth((callbackPass) => sendWithPass(callbackPass));
  }, [demo, vendorId, ensureCallbackAuth, sendWithPass]);

  const bar =
    variant === "makeup"
      ? "border-t border-white/30 bg-velvet-ivory/85 backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      : "border-t border-stone-200/90 bg-white/95 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]";

  const btn =
    variant === "makeup"
      ? "w-full rounded-2xl bg-velvet-rose py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      : "w-full rounded-2xl bg-[#0F766E] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0c655e] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      {notice ? (
        <div
          role="status"
          className={`fixed bottom-[5.25rem] left-0 right-0 z-[60] mx-auto max-w-lg px-4 sm:bottom-[5.5rem] ${variant === "makeup" ? "sm:px-6" : ""}`}
        >
          <p
            className={`rounded-xl border px-3 py-2 text-center text-xs font-medium shadow-sm sm:text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {notice.text}
          </p>
        </div>
      ) : null}

      <div className={`fixed bottom-0 left-0 right-0 z-50 px-4 py-3 ${bar}`}>
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={demo || sending || !vendorId}
            onClick={onRequest}
            className={btn}
          >
            {demo ? "Preview — callback unavailable" : sending ? "Sending…" : "Request Callback"}
          </button>
        </div>
      </div>
    </>
  );
}
