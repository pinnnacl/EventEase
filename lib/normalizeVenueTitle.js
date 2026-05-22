/**
 * Display-time fixes for known venue name typos (DB may still store the original).
 * @param {string | null | undefined} name
 * @returns {string}
 */
export function normalizeVenueTitle(name) {
  const raw = String(name || "").trim();
  if (!raw) return "Venue";

  return raw
    .replace(/\bSt\.?\s*Raphel's\b/gi, "St. Raphael's")
    .replace(/\bRaphel's\b/gi, "Raphael's")
    .replace(/\bRaphel\b/gi, "Raphael");
}
