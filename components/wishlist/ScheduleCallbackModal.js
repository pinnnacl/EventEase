"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  CALLBACK_TIME_SLOTS,
  todayIsoDateLocal,
} from "../../lib/wishlistCallbackSchedule";

const eventDateRequired =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_CALLBACK_EVENT_DATE_REQUIRED === "true" ||
    process.env.NEXT_PUBLIC_CALLBACK_EVENT_DATE_REQUIRED === "1");

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onSuccess?: () => void;
 *   vendorId?: string;
 * }} props
 */
export default function ScheduleCallbackModal({ open, onClose, onSuccess, vendorId }) {
  const { wishlist } = useWishlist();
  const { ensureCallbackAuth } = useCustomerAuth();

  const [eventDate, setEventDate] = useState("");
  const [preferredCallbackDate, setPreferredCallbackDate] = useState(() => todayIsoDateLocal());
  const [preferredCallbackTime, setPreferredCallbackTime] = useState(CALLBACK_TIME_SLOTS[0]);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const minDate = todayIsoDateLocal();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setEventDate("");
    setPreferredCallbackDate(todayIsoDateLocal());
    setPreferredCallbackTime(CALLBACK_TIME_SLOTS[0]);
    setMessage("");
    setLocalError("");
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submitWithPass = useCallback(
    async (callbackPass) => {
      const payload = {
        callbackPass,
        preferred_callback_date: preferredCallbackDate.trim(),
        preferred_callback_time: preferredCallbackTime.trim(),
        message: message.trim() || undefined,
      };
      if (eventDate.trim()) {
        payload.event_date = eventDate.trim();
      }
      if (vendorId && typeof vendorId === "string" && vendorId.trim()) {
        payload.vendor_id = vendorId.trim();
      } else {
        payload.wishlist = {
          venues: wishlist.venues,
          photography: wishlist.photography,
          catering: wishlist.catering,
          decoration: wishlist.decoration,
        };
      }

      const res = await fetch("/api/callback/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        return { ok: true };
      }
      return {
        ok: false,
        error: data.error || data.message || "Could not send your request. Try again.",
      };
    },
    [eventDate, preferredCallbackDate, preferredCallbackTime, message, vendorId, wishlist],
  );

  const handleSubmit = useCallback(async () => {
    setLocalError("");
    if (eventDateRequired && !eventDate.trim()) {
      setLocalError("Please enter your event date.");
      return;
    }
    if (eventDate.trim() && eventDate < minDate) {
      setLocalError("Event date cannot be in the past.");
      return;
    }
    if (!preferredCallbackDate.trim()) {
      setLocalError("Choose a preferred callback date.");
      return;
    }
    if (preferredCallbackDate < minDate) {
      setLocalError("Preferred callback date cannot be in the past.");
      return;
    }
    if (!preferredCallbackTime.trim()) {
      setLocalError("Choose a preferred callback time.");
      return;
    }

    setSubmitting(true);
    try {
      const authResult = await ensureCallbackAuth(async (pass) => {
        const out = await submitWithPass(pass);
        if (!out.ok && out.error) {
          setLocalError(out.error);
        } else if (out.ok) {
          onClose();
          onSuccess?.();
        }
      });
      if (authResult && authResult.ok === false && "error" in authResult && authResult.error) {
        setLocalError(authResult.error);
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    eventDate,
    preferredCallbackDate,
    preferredCallbackTime,
    minDate,
    ensureCallbackAuth,
    submitWithPass,
    onClose,
    onSuccess,
  ]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      data-ee-modal="schedule-callback"
      className="fixed inset-0 z-[125] overflow-x-hidden overflow-y-auto bg-black/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-callback-title"
      onClick={onClose}
    >
      <div className="flex min-h-[100dvh] w-full items-center justify-center px-4 py-10 sm:py-14">
        <div
          className="w-full max-w-md -translate-y-2 overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.35)] sm:p-5"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-start justify-between gap-2">
          <h2 id="schedule-callback-title" className="text-lg font-bold leading-snug tracking-tight text-stone-900">
            Schedule a Callback
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-400">Your event</p>

          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-semibold text-stone-800" htmlFor="cb-event-date">
              Event date <span className="text-rose-600">{eventDateRequired ? "*" : ""}</span>
              {!eventDateRequired ? (
                <span className="font-normal text-stone-500"> (optional)</span>
              ) : null}{" "}
              <span aria-hidden>📅</span>
            </label>
            <input
              id="cb-event-date"
              type="date"
              min={minDate}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-400">When to call you</p>

          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-semibold text-stone-800" htmlFor="cb-preferred-date">
              Preferred callback date <span className="text-rose-600">*</span> <span aria-hidden>📅</span>
            </label>
            <input
              id="cb-preferred-date"
              type="date"
              min={minDate}
              value={preferredCallbackDate}
              onChange={(e) => setPreferredCallbackDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-800" htmlFor="cb-preferred-time">
              Preferred callback time <span className="text-rose-600">*</span> <span aria-hidden>🕒</span>
            </label>
            <select
              id="cb-preferred-time"
              value={preferredCallbackTime}
              onChange={(e) => setPreferredCallbackTime(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              required
            >
              {CALLBACK_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-stone-800" htmlFor="cb-note">
            Add a note <span className="font-normal text-stone-500">(optional)</span> <span aria-hidden>💬</span>
          </label>
          <textarea
            id="cb-note"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            rows={2}
            placeholder="Tell the vendor what you're looking for"
            className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm leading-snug outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
          />
        </div>

        {localError ? (
          <div
            className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-rose-100 bg-rose-50/90 px-3 py-2 sm:max-h-40"
            role="alert"
          >
            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-snug text-rose-800">
              {localError}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Request Callback"}
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
