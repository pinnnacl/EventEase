/**
 * Profile / gallery DB fields may be a plain URL or JSON: { thumb, medium, large, sourceUrl? }.
 * @param {unknown} raw
 * @returns {{ thumb: string, medium: string, large: string, sourceUrl?: string } | null}
 */
export function parseResponsiveImageField(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.startsWith("{")) {
    try {
      const o = JSON.parse(s);
      if (o && typeof o === "object") {
        const large = o.large || o.medium || o.thumb;
        const medium = o.medium || o.large || o.thumb;
        const thumb = o.thumb || o.medium || o.large;
        if (large) {
          const out = { thumb: thumb || large, medium: medium || large, large };
          if (typeof o.sourceUrl === "string" && o.sourceUrl.trim()) {
            out.sourceUrl = o.sourceUrl.trim();
          }
          return out;
        }
      }
    } catch {
      /* fall through */
    }
  }
  return { thumb: s, medium: s, large: s };
}

/**
 * Best URL for Open Graph / single-URL consumers.
 * @param {unknown} raw
 */
export function primaryImageUrl(raw) {
  return parseResponsiveImageField(raw)?.large ?? (typeof raw === "string" ? raw.trim() || null : null);
}

/**
 * Text input display: show a single https URL instead of raw `{"thumb":"…","medium":"…","large":"…"}` JSON.
 * Editing replaces the stored value with whatever the user types (plain URL or new JSON).
 */
export function inputDisplayImageUrl(stored) {
  if (stored == null) return "";
  const s = String(stored).trim();
  if (!s) return "";
  if (s.startsWith("{")) {
    const url = primaryImageUrl(s);
    return url || s;
  }
  return s;
}
