import { parseResponsiveImageField } from "./imageVariants";

/** @typedef {{ id: string; url: string; responsive: { thumb: string; medium: string; large: string } | null; category: string; isLandscape: boolean }} VenueGalleryItem */

const DEFAULT_CATEGORIES = ["Main Hall", "Dining", "Exterior", "Stage"];

/**
 * Build gallery items from mapped venue detail props.
 * Categories: venue facilities when present, else sensible defaults.
 * @param {object} venue
 * @returns {VenueGalleryItem[]}
 */
export function buildVenueGalleryItems(venue) {
  const urls = Array.isArray(venue?.galleryImages)
    ? venue.galleryImages.map((u) => String(u).trim()).filter(Boolean)
    : [];
  const responsiveList = Array.isArray(venue?.galleryImagesResponsive) ? venue.galleryImagesResponsive : [];
  const facilities = (Array.isArray(venue?.facilities) ? venue.facilities : [])
    .map((f) => String(f).trim())
    .filter(Boolean);

  const categoryPool = facilities.length ? facilities : DEFAULT_CATEGORIES;

  return urls.map((url, index) => {
    const responsive = responsiveList[index] || parseResponsiveImageField(url);
    const category = categoryPool[index % categoryPool.length] || "Gallery";
    const isLandscape = inferLandscape(responsive, index);

    return {
      id: `${index}-${url.slice(-24)}`,
      url,
      responsive,
      category,
      isLandscape,
    };
  });
}

/**
 * Unique category chips for filter UI (always includes "All").
 * @param {VenueGalleryItem[]} items
 */
export function getVenueGalleryCategories(items) {
  const seen = new Set();
  const cats = [];
  for (const item of items) {
    const c = item.category?.trim();
    if (!c || seen.has(c)) continue;
    seen.add(c);
    cats.push(c);
  }
  return ["All", ...cats];
}

/**
 * @param {{ thumb: string; medium: string; large: string } | null} responsive
 * @param {number} index
 */
function inferLandscape(responsive, index) {
  if (index === 0) return true;
  if (!responsive) return false;
  return false;
}

/**
 * Layout cells for 2-column Google Photos-style grid.
 * @param {VenueGalleryItem[]} items
 * @returns {(VenueGalleryItem & { colSpan: 1 | 2; heightClass: string })[]}
 */
export function layoutVenueGalleryGrid(items) {
  return items.map((item, index) => {
    const isWide = index === 0 || item.isLandscape;
    return {
      ...item,
      colSpan: isWide ? 2 : 1,
      heightClass: isWide ? "h-[240px]" : "h-[280px]",
    };
  });
}

/**
 * @param {VenueGalleryItem[]} items
 * @param {string} activeCategory
 */
export function filterVenueGalleryByCategory(items, activeCategory) {
  if (!activeCategory || activeCategory === "All") return items;
  return items.filter((item) => item.category === activeCategory);
}
