import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { fetchJsonCached } from "../../lib/clientFetchCache";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";

const VenueHeroSwiperClient = dynamic(() => import("./VenueHeroSwiperClient"), {
  ssr: false,
  loading: () => null,
});

/** @returns {boolean} */
function useIsLgViewport() {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isLg;
}

/**
 * Responsive photo grid for venue gallery.
 */
export default function VenueGallery({ images, galleryResponsive, onImageClick }) {
  if (!images?.length) {
    return <p className="text-sm text-slate-500">No photos uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
      {images.map((src, i) => (
        <button
          key={`${src}-${i}`}
          type="button"
          onClick={() => onImageClick?.(src)}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-100/80"
        >
          <ResponsiveVendorImage
            responsive={galleryResponsive?.[i]}
            src={src}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            loading="lazy"
            fetchPriority="low"
          />
        </button>
      ))}
    </div>
  );
}

/** @typedef {{ url: string; responsive?: { thumb: string; medium: string; large: string } | null }} VenueHeroSlide */

/**
 * Shared hero gallery state (call once per page — avoids duplicate image fetches on mobile + desktop).
 * @param {string} venueId
 * @param {string | null | undefined} heroSrc
 * @param {{ thumb: string; medium: string; large: string } | null | undefined} heroResponsive
 */
export function useVenueHeroGallery(venueId, heroSrc, heroResponsive) {
  const initialSlides = useMemo(() => {
    const src = typeof heroSrc === "string" ? heroSrc.trim() : "";
    if (!src) return /** @type {VenueHeroSlide[]} */ ([]);
    return [{ url: src, responsive: heroResponsive || null }];
  }, [heroSrc, heroResponsive]);

  const [slides, setSlides] = useState(initialSlides);
  const [swiperEnabled, setSwiperEnabled] = useState(false);

  useEffect(() => {
    setSlides(initialSlides);
    setSwiperEnabled(false);
  }, [initialSlides]);

  useEffect(() => {
    if (!venueId || !heroSrc) return undefined;

    let cancelled = false;

    const loadMore = () => {
      const imagesUrl = `/api/venues/${encodeURIComponent(venueId)}/images`;
      fetchJsonCached(imagesUrl, { ttlMs: 300_000 })
        .then((data) => {
          if (cancelled || !data?.ok || !Array.isArray(data.images) || data.images.length === 0) return;
          const extra = data.images
            .map((img) => ({
              url: String(img.url || "").trim(),
              responsive: img.responsive || null,
            }))
            .filter((img) => img.url);
          if (!extra.length) return;
          setSlides((prev) => {
            const seen = new Set(prev.map((s) => s.url));
            const merged = [...prev];
            for (const img of extra) {
              if (!seen.has(img.url)) {
                seen.add(img.url);
                merged.push(img);
              }
            }
            return merged;
          });
          setSwiperEnabled(true);
        })
        .catch(() => {});
    };

    if (typeof requestIdleCallback === "function") {
      const idleId = requestIdleCallback(loadMore, { timeout: 2000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(idleId);
      };
    }

    const timerId = setTimeout(loadMore, 1);
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [venueId, heroSrc]);

  return { slides, swiperEnabled };
}

/**
 * Hero carousel UI — use with {@link useVenueHeroGallery} inside the existing hero container.
 *
 * @param {{
 *   slides: VenueHeroSlide[];
 *   swiperEnabled: boolean;
 *   active?: boolean;
 *   imageClassName?: string;
 * }} props
 */
export function VenueHeroGallery({ slides, swiperEnabled, active = true, imageClassName = "" }) {
  if (!slides.length) {
    return (
      <div className={`flex items-center justify-center bg-stone-200 text-sm text-stone-500 ${imageClassName}`}>
        No image
      </div>
    );
  }

  if (!active || !swiperEnabled || slides.length <= 1) {
    return (
      <ResponsiveVendorImage
        responsive={slides[0].responsive}
        src={slides[0].url}
        alt=""
        className={imageClassName}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
    );
  }

  return <VenueHeroSwiperClient slides={slides} imageClassName={imageClassName} />;
}

export { useIsLgViewport };
