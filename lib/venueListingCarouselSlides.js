import { parseResponsiveImageField } from "./imageVariants";

export const VENUE_LISTING_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f29da1c0c9?w=1200&q=80";

const MAX_SLIDES = 8;

/**
 * @param {string | null | undefined} raw
 * @param {{ thumb: string, medium: string, large: string } | null | undefined} responsive
 */
function pushSlide(slides, seen, raw, responsive) {
  const parsed = responsive || parseResponsiveImageField(raw);
  const url = parsed?.large || (typeof raw === "string" ? raw.trim() : "");
  if (!url || seen.has(url)) return;
  seen.add(url);
  slides.push({ src: url, responsive: parsed });
}

/**
 * Deduplicated image slides for listing cards (profile first, then gallery).
 * @param {{
 *   profileImage?: string | null;
 *   profileImageResponsive?: { thumb: string; medium: string; large: string } | null;
 *   galleryImages?: string[] | null;
 * }} vendor
 * @param {{ maxSlides?: number }} [options]
 * @returns {{ src: string, responsive: ReturnType<typeof parseResponsiveImageField> }[]}
 */
export function buildVenueListingCarouselSlides(vendor, options = {}) {
  const maxSlides = options.maxSlides ?? MAX_SLIDES;
  /** @type {{ src: string, responsive: ReturnType<typeof parseResponsiveImageField> }[]} */
  const slides = [];
  const seen = new Set();

  pushSlide(slides, seen, vendor.profileImage, vendor.profileImageResponsive);
  if (Array.isArray(vendor.galleryImages)) {
    for (const raw of vendor.galleryImages) {
      if (slides.length >= maxSlides) break;
      pushSlide(slides, seen, raw, null);
    }
  }

  if (slides.length === 0) {
    slides.push({ src: VENUE_LISTING_FALLBACK_IMAGE, responsive: null });
  }

  return slides;
}
