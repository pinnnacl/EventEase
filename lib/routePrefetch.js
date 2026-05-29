/** @type {Set<string>} */
const prefetchedHrefs = new Set();

/**
 * Prefetch a Next.js route data file once per full page load.
 * Targets duplicate `venues.json` / `index.json` fetches from repeated `router.prefetch` calls.
 *
 * @param {import("next/router").NextRouter} router
 * @param {string} href
 */
export function prefetchRouteOnce(router, href) {
  if (typeof window === "undefined" || !href) return;
  if (prefetchedHrefs.has(href)) return;
  prefetchedHrefs.add(href);
  void router.prefetch(href);
}

/**
 * Prefetch multiple listing routes concurrently (not sequentially).
 *
 * @param {import("next/router").NextRouter} router
 * @param {string[]} hrefs
 */
export function prefetchRoutesParallel(router, hrefs) {
  if (typeof window === "undefined") return;
  for (const href of hrefs) {
    prefetchRouteOnce(router, href);
  }
}
