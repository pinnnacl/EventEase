/** Preferred callback windows shown in Schedule Callback UI (must match server allow-list). */
export const CALLBACK_TIME_SLOTS = [
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
];

/** @param {string} slot */
export function isAllowedPreferredTimeSlot(slot) {
  return CALLBACK_TIME_SLOTS.includes(String(slot || "").trim());
}

/** Local calendar date as YYYY-MM-DD */
export function todayIsoDateLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {string} iso YYYY-MM-DD
 * @returns {boolean} true if iso is today or future (UTC midnight comparison).
 */
export function isIsoDateOnOrAfterToday(iso) {
  const s = String(iso || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (!Number.isFinite(y) || mo < 0 || mo > 11 || d < 1 || d > 31) return false;
  const chosen = Date.UTC(y, mo, d);
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return chosen >= todayUtc;
}

/**
 * Human-readable date for WhatsApp template body (e.g. "15 Feb 2026").
 * @param {string} iso YYYY-MM-DD
 */
export function formatIsoDateForWhatsAppBody(iso) {
  const s = String(iso || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s || "Not specified";
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (!Number.isFinite(y) || mo < 0 || mo > 11 || d < 1 || d > 31) return "Not specified";
  try {
    const dt = new Date(Date.UTC(y, mo, d));
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(dt);
  } catch {
    return s;
  }
}
