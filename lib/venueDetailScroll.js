/**
 * Venue detail path (not /photos sub-route).
 * @param {string} url
 */
export function isVenueDetailPath(url) {
  if (typeof url !== "string") return false;
  const path = url.split("?")[0];
  return /^\/venue\/[^/]+$/.test(path) && path !== "/venue/demo";
}

/** Jump to page top instantly — no smooth scroll (used with router scroll: false). */
export function snapVenueDetailToTop() {
  if (typeof window === "undefined") return;
  const opts = { top: 0, left: 0, behavior: "instant" };
  try {
    window.scrollTo(opts);
  } catch {
    window.scrollTo(0, 0);
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
