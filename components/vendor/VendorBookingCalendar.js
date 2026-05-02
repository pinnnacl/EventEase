import { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function toYmd(d) {
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {{ onBookingsChanged?: () => void }} props
 */
export default function VendorBookingCalendar({ onBookingsChanged }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dayDate, setDayDate] = useState(null);
  const [eventNameInput, setEventNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const bookingByYmd = useMemo(() => {
    const m = new Map();
    for (const b of bookings) {
      m.set(b.date, b);
    }
    return m;
  }, [bookings]);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/vendor/bookings", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFetchError(data.error || "Could not load bookings");
        setBookings([]);
        return;
      }
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch {
      setFetchError("Could not load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openDay(day) {
    setDayDate(day);
    const ymd = toYmd(day);
    const existing = bookingByYmd.get(ymd);
    setEventNameInput(existing?.eventName || "");
    setActionError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setDayDate(null);
    setActionError("");
  }

  async function handleAddOrUpdate() {
    if (!dayDate) return;
    const ymd = toYmd(dayDate);
    const existing = bookingByYmd.get(ymd);
    setSaving(true);
    setActionError("");
    try {
      const res = await fetch("/api/vendor/bookings", {
        method: existing?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(
          existing?.id
            ? { id: existing.id, eventName: eventNameInput.trim() || null }
            : { date: ymd, eventName: eventNameInput.trim() || null },
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.error || "Could not save");
        return;
      }
      await load();
      onBookingsChanged?.();
      closeModal();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    const ymd = dayDate ? toYmd(dayDate) : "";
    const b = bookingByYmd.get(ymd);
    if (!b?.id) return;
    setSaving(true);
    setActionError("");
    try {
      const res = await fetch(`/api/vendor/bookings?id=${encodeURIComponent(b.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.error || "Could not remove");
        return;
      }
      await load();
      onBookingsChanged?.();
      closeModal();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const ymd = toYmd(date);
    if (bookingByYmd.has(ymd)) return "vendor-cal-booked";
    return null;
  };

  const existingForModal = dayDate ? bookingByYmd.get(toYmd(dayDate)) : null;

  return (
    <div className="vendor-calendar-wrap rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">Availability</h2>
          <p className="mt-1 text-sm text-stone-600">
            Days without a mark are <strong className="font-semibold text-stone-700">available</strong> for new inquiries.
            Mark dates when you&apos;re <strong className="font-semibold text-stone-700">not available</strong> (already committed).
            Tap a day to block or clear it.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-stone-500 sm:mt-0 sm:max-w-[14rem] sm:justify-end">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-stone-100 ring-1 ring-stone-300/80" aria-hidden />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-100 ring-1 ring-rose-200" aria-hidden />
            Unavailable
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm border-2 border-brand-600 bg-white"
              aria-hidden
            />
            Today
          </span>
        </div>
      </div>

      {fetchError ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {fetchError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 animate-pulse space-y-3" aria-busy="true" aria-label="Loading calendar">
          <div className="h-48 rounded-xl bg-stone-100 sm:h-64" />
          <div className="h-4 w-2/3 rounded bg-stone-100" />
        </div>
      ) : (
        <>
          {!fetchError && bookings.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-6 text-center text-sm text-stone-600">
              All dates are available until you block one. Select a day you&apos;re already booked to mark it unavailable.
            </p>
          ) : null}

          <div className="vendor-calendar-inner mt-4 max-w-full overflow-x-auto pb-1">
            <Calendar
              onClickDay={(value) => openDay(value)}
              tileClassName={tileClassName}
              calendarType="iso8601"
              minDetail="month"
              defaultActiveStartDate={new Date()}
              className="vendor-calendar mx-auto w-full max-w-md border-0 sm:max-w-none"
            />
          </div>
        </>
      )}

      {modalOpen && dayDate ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="fade-up w-full max-w-md rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-day-title"
          >
            <h3 id="booking-day-title" className="font-display text-lg font-semibold text-brand-950">
              {toYmd(dayDate)}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              {existingForModal
                ? "This date is marked unavailable for new bookings."
                : "Mark this date unavailable (e.g. already committed to an event)."}
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-stone-800" htmlFor="booking-event-name">
                Label (optional)
              </label>
              <input
                id="booking-event-name"
                value={eventNameInput}
                onChange={(e) => setEventNameInput(e.target.value)}
                placeholder="e.g. Wedding — Priya & Arjun"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              />
            </div>

            {actionError ? (
              <p className="mt-3 text-sm font-medium text-red-700" role="alert">
                {actionError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              {existingForModal ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleRemove}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                >
                  {saving ? "Removing…" : "Clear — show as available"}
                </button>
              ) : null}
              <button
                type="button"
                disabled={saving}
                onClick={handleAddOrUpdate}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : existingForModal ? "Update label" : "Mark unavailable"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
