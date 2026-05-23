/** In-memory warm cache for venue detail JSON (API prefetch). */
const venueDataCache = new Map();
const CACHE_TTL_MS = 120_000;
const inflight = new Map();

/**
 * @param {string} href
 * @returns {{ id: string; pathname: string } | null}
 */
export function parseVenueDetailHref(href) {
  if (typeof href !== "string" || !href.startsWith("/venue/")) return null;
  const id = href.split("?")[0].slice("/venue/".length).trim();
  if (!id || id === "demo") return null;
  return { id, pathname: `/venue/${id}` };
}

/**
 * @param {string} id
 */
export function getCachedVenuePayload(id) {
  const hit = venueDataCache.get(id);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    venueDataCache.delete(id);
    return null;
  }
  return hit.data;
}

/**
 * @param {import("next/router").NextRouter} router
 * @param {string} href
 */
export function warmVenueHref(router, href) {
  const parsed = parseVenueDetailHref(href);
  if (!parsed) return;

  void router.prefetch(href);

  if (getCachedVenuePayload(parsed.id) || inflight.has(parsed.id)) return;

  const promise = fetch(`/api/public/venue/${encodeURIComponent(parsed.id)}`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
    .then((res) => res.json().catch(() => ({})))
    .then((data) => {
      if (data?.ok && data.venue) {
        venueDataCache.set(parsed.id, { at: Date.now(), data });
      }
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(parsed.id);
    });

  inflight.set(parsed.id, promise);
}

/**
 * @param {import("next/router").NextRouter} router
 * @param {string} href
 * @param {{ onStart?: () => void }} [options]
 */
export function navigateToVenueHref(router, href, options = {}) {
  warmVenueHref(router, href);
  options.onStart?.();
  void router.push(href);
}
