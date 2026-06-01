import { useCallback, useEffect, useMemo, useState } from "react";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import {
  filterVenueGalleryByCategory,
  getVenueGalleryCategories,
  layoutVenueGalleryGrid,
} from "../../lib/venueGallery";

/**
 * Premium 2-column collage with category chips (no page header chrome).
 *
 * @param {{
 *   items: import("../../lib/venueGallery").VenueGalleryItem[];
 *   initialCategory?: string;
 *   onImageClick?: (url: string) => void;
 * }} props
 */
export default function VenueCollageGallery({ items, initialCategory = "All", onImageClick }) {
  const categories = useMemo(() => getVenueGalleryCategories(items), [items]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (categories.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, categories]);

  const filtered = useMemo(
    () => filterVenueGalleryByCategory(items, activeCategory),
    [items, activeCategory],
  );

  const cells = useMemo(() => layoutVenueGalleryGrid(filtered), [filtered]);

  const selectCategory = useCallback((cat) => {
    if (cat === activeCategory) return;
    setVisible(false);
    window.setTimeout(() => {
      setActiveCategory(cat);
      setVisible(true);
    }, 150);
  }, [activeCategory]);

  if (!items.length) {
    return <p className="px-4 py-8 text-center text-sm text-stone-500">No photos uploaded yet.</p>;
  }

  return (
    <div className="w-full bg-white">
      <div className="sticky top-0 z-20 border-b border-stone-100/90 bg-white/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div
          className="flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Photo categories"
        >
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`grid grid-cols-2 items-stretch gap-1 p-1 transition-opacity duration-300 ease-out sm:gap-2 sm:p-2 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {cells.map((cell, index) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => onImageClick?.(cell.url)}
            className={`relative overflow-hidden rounded-sm bg-stone-100 ${
              cell.colSpan === 2 ? "col-span-2" : "col-span-1"
            } ${cell.heightClass}`}
            style={{ minHeight: cell.colSpan === 2 ? 240 : 280 }}
          >
            <ResponsiveVendorImage
              responsive={cell.responsive}
              src={cell.url}
              alt=""
              className="block h-full w-full object-cover"
              sizes={cell.colSpan === 2 ? "100vw" : "50vw"}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
