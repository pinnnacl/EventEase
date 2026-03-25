/**
 * @param {{
 *   venueNames?: string[],
 *   photographyNames?: string[],
 *   catering?: string[],
 *   decoration?: string[],
 *   eventDateLabel?: string | null
 * }} parts
 */
export function buildAvailabilityWhatsAppMessage(parts) {
  const {
    venueNames = [],
    photographyNames = [],
    catering = [],
    decoration = [],
    eventDateLabel,
  } = parts;
  const date =
    eventDateLabel && String(eventDateLabel).trim() ? String(eventDateLabel).trim() : "[your preferred date]";

  if (
    venueNames.length === 0 &&
    photographyNames.length === 0 &&
    catering.length === 0 &&
    decoration.length === 0
  ) {
    return `Hi, I would like to check availability on ${date} for my EventEase Kerala wishlist.`;
  }

  const lines = [`Hi, I would like to check availability on ${date} for the following services:`, ""];

  if (venueNames.length > 0) {
    lines.push("Venues:");
    lines.push(...venueNames.map((n) => `• ${n}`));
  }
  if (photographyNames.length > 0) {
    if (venueNames.length > 0) lines.push("");
    lines.push("Photography:");
    lines.push(...photographyNames.map((n) => `• ${n}`));
  }
  if (catering.length > 0) {
    if (venueNames.length > 0 || photographyNames.length > 0) lines.push("");
    lines.push("Catering:");
    lines.push(...catering.map((c) => `• ${c}`));
  }
  if (decoration.length > 0) {
    lines.push("");
    lines.push("Decoration:");
    lines.push(...decoration.map((c) => `• ${c}`));
  }

  return lines.join("\n");
}

/** @param {string} text */
export function openWhatsAppWithText(text) {
  if (typeof window === "undefined") return;
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phone = raw ? String(raw).replace(/\D/g, "") : "";
  const encoded = encodeURIComponent(text);
  const url = phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function readStoredEventDateLabel() {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem("eventease_event_date");
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

/** @param {string | null | undefined} label */
export function writeStoredEventDateLabel(label) {
  if (typeof window === "undefined") return;
  try {
    const t = label != null ? String(label).trim() : "";
    if (!t) window.localStorage.removeItem("eventease_event_date");
    else window.localStorage.setItem("eventease_event_date", t);
  } catch {
    /* ignore */
  }
}
