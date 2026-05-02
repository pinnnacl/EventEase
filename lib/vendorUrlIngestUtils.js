/**
 * Server + client: detect external URLs that should be ingested (not already optimized JSON / our WebP).
 * @param {unknown} value
 */
export function shouldIngestRemoteImageUrl(value) {
  const s = String(value ?? "").trim();
  if (!s) return false;
  if (s.startsWith("{")) {
    try {
      const o = JSON.parse(s);
      if (o && typeof o === "object" && o.thumb && o.medium && o.large) return false;
    } catch {
      /* continue */
    }
  }
  if (!/^https?:\/\//i.test(s)) return false;
  /** Already on our bucket — no re-fetch/re-encode (covers .webp, .jpg, signed query params, etc.). */
  if (/supabase\.co\/storage\/v1\/object\/public\/vendor-media\//i.test(s)) {
    return false;
  }
  return true;
}
