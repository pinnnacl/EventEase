import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";

function HeartOutline({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function HeartFilled({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

/**
 * @param {{ venueId?: string, photographyId?: string, className?: string, variant?: "default" | "reel" | "overlay", iconOnly?: boolean }} props
 */
export default function WishlistToggle({ venueId, photographyId, className = "", variant = "default", iconOnly = false }) {
  const { toggle, has, togglePhotography, hasPhotography } = useWishlist();
  const isPhotography = typeof photographyId === "string" && photographyId.length > 0;
  const id = isPhotography ? photographyId : venueId;
  const saved = isPhotography ? hasPhotography(id) : has(id);
  const [bump, setBump] = useState(false);
  const isReel = variant === "reel";
  const isOverlay = variant === "overlay";

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isPhotography) togglePhotography(id);
    else if (typeof venueId === "string") toggle(venueId);
    setBump(true);
    window.setTimeout(() => setBump(false), 320);
  }

  const reelClasses =
    "min-h-[44px] min-w-[44px] border border-white/35 bg-black/40 px-0 py-0 shadow-lg shadow-black/30 backdrop-blur-md hover:border-white/55 hover:bg-black/55 hover:shadow-xl focus-visible:ring-white/60 focus-visible:ring-offset-0";

  const overlayClasses =
    "h-8 w-8 shrink-0 border-0 bg-transparent p-0 shadow-none hover:scale-110 focus-visible:ring-white/80 focus-visible:ring-offset-0";

  const defaultClasses = iconOnly
    ? "h-9 w-9 shrink-0 border border-white/70 bg-white/90 p-0 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.18)] backdrop-blur-sm hover:scale-[1.04] hover:bg-white hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.2)]"
    : "min-h-[44px] min-w-[44px] gap-2 border border-white/80 bg-white/95 px-3 py-2 text-sm font-semibold shadow-md backdrop-blur-sm hover:scale-[1.03] hover:border-brand-200 hover:shadow-lg sm:px-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.97] ${
        isReel ? reelClasses : isOverlay ? overlayClasses : defaultClasses
      } ${
        isReel
          ? saved
            ? "text-rose-300"
            : "text-white"
          : isOverlay
            ? saved
              ? "text-rose-500"
              : "text-white"
            : saved
              ? "text-rose-500 hover:text-rose-600"
              : "text-slate-600 hover:text-slate-800"
      } ${bump ? "scale-[1.18]" : "scale-100"} ${className}`.trim()}
    >
      {saved ? (
        <HeartFilled
          className={`shrink-0 transition-transform duration-200 ${
            isReel
              ? "h-6 w-6 text-rose-400 drop-shadow-md"
              : isOverlay
                ? "h-[22px] w-[22px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
                : "h-5 w-5 text-rose-500"
          }`}
        />
      ) : (
        <HeartOutline
          className={`shrink-0 transition-transform duration-200 ${
            isReel
              ? "h-6 w-6 text-white drop-shadow-md"
              : isOverlay
                ? "h-[22px] w-[22px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
                : "h-5 w-5 text-slate-600"
          }`}
        />
      )}
      {!isReel && !isOverlay && !iconOnly ? (
        <span className="hidden max-w-[9.5rem] truncate sm:inline">{saved ? "Saved" : "Add to Wishlist"}</span>
      ) : null}
    </button>
  );
}
