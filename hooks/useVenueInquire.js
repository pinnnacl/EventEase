"use client";

import { useCallback, useEffect, useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { readStoredEventDateLabel } from "../lib/wishlistActions";

/**
 * WhatsApp inquire flow for public venue detail pages.
 * @param {{ vendorId: string; vendorName?: string; demo?: boolean }} opts
 */
export default function useVenueInquire({ vendorId, vendorName = "", demo = false }) {
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
            vendorCategory: "venue",
            vendorName: vendorName || "",
            eventDate: readStoredEventDateLabel() || "",
            callbackPass,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          setNotice({ type: "success", text: "Venue host has been notified." });
        } else {
          setNotice({ type: "error", text: data.error || "Something went wrong. Try again." });
        }
      } catch {
        setNotice({ type: "error", text: "Something went wrong. Try again." });
      } finally {
        setSending(false);
      }
    },
    [vendorId, vendorName, demo],
  );

  const inquire = useCallback(async () => {
    if (demo || !vendorId) return;
    setNotice(null);
    const r = await ensureCallbackAuth((callbackPass) => sendWithPass(callbackPass));
    if (r && r.ok === false && "error" in r && r.error) {
      setNotice({ type: "error", text: r.error });
    }
  }, [demo, vendorId, ensureCallbackAuth, sendWithPass]);

  return { inquire, sending, notice, clearNotice: () => setNotice(null) };
}
