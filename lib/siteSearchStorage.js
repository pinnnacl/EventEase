const KEY_LOCATION = "eventease_search_location";
const KEY_GUESTS = "eventease_guest_count";

/** @returns {string} */
export function readStoredLocationLabel() {
  if (typeof window === "undefined") return "Kochi, Kerala";
  try {
    const v = window.localStorage.getItem(KEY_LOCATION);
    return v && v.trim() ? v.trim() : "Kochi, Kerala";
  } catch {
    return "Kochi, Kerala";
  }
}

/** @param {string} label */
export function writeStoredLocationLabel(label) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_LOCATION, String(label).trim() || "Kochi, Kerala");
  } catch {
    /* ignore */
  }
}

/** @returns {string | null} */
export function readStoredGuestCount() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY_GUESTS);
  } catch {
    return null;
  }
}

/** @param {string | null} count */
export function writeStoredGuestCount(count) {
  if (typeof window === "undefined") return;
  try {
    if (count == null || String(count).trim() === "") {
      window.localStorage.removeItem(KEY_GUESTS);
      return;
    }
    window.localStorage.setItem(KEY_GUESTS, String(count).trim());
  } catch {
    /* ignore */
  }
}

/**
 * Map display label to venues/photography `city` query value.
 * @param {string} label
 * @returns {string}
 */
export function locationLabelToCityParam(label) {
  const t = String(label || "").trim();
  if (!t || /^kerala$/i.test(t)) return "Kerala";
  const first = t.split(",")[0].trim();
  return first || "Kerala";
}
