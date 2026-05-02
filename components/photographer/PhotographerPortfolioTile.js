import { primaryImageUrl } from "../../lib/imageVariants";

/**
 * Single portfolio image tile — fixed aspect, cover fit, rounded corners (reference: photography portfolio grid).
 * @param {{ src: string, alt?: string, aspect?: "4/3" | "1/1" | "4/5", className?: string }} props
 */
export default function PhotographerPortfolioTile({ src, alt = "", aspect = "4/3", className = "" }) {
  const aspectCls = aspect === "1/1" ? "aspect-square" : aspect === "4/5" ? "aspect-[4/5]" : "aspect-[4/3]";
  const imgSrc = primaryImageUrl(src) || (typeof src === "string" && /^https?:\/\//i.test(src.trim()) ? src.trim() : "");
  if (!imgSrc) {
    return (
      <div
        className={`relative w-full self-start overflow-hidden rounded-2xl bg-stone-200/80 shadow-sm ring-1 ring-stone-200/60 ${className}`}
      >
        <div className={`relative w-full ${aspectCls} flex items-center justify-center text-xs text-stone-500`}>
          No image
        </div>
      </div>
    );
  }
  return (
    <div
      className={`relative w-full self-start overflow-hidden rounded-2xl bg-stone-100 shadow-sm ring-1 ring-stone-200/60 ${className}`}
    >
      <div className={`relative w-full ${aspectCls} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}
