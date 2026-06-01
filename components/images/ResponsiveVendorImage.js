import { motion } from "framer-motion";
import { parseResponsiveImageField } from "../../lib/imageVariants";
import { VENUE_HERO_LAYOUT_TRANSITION } from "../../lib/venueHeroLayoutId";

/**
 * Vendor-uploaded images may have thumb / medium / large URLs (JSON in DB) or a single URL.
 * Uses native `img` + srcset for responsive loading without requiring next/image remote config for every host.
 *
 * @param {{
 *   responsive?: { thumb: string, medium: string, large: string } | null;
 *   src: string;
 *   alt?: string;
 *   className?: string;
 *   sizes?: string;
 *   loading?: "lazy" | "eager";
 *   fetchPriority?: "high" | "low" | "auto";
 *   layoutId?: string | null;
 *   layoutTransition?: import("framer-motion").Transition;
 * }} props
 */
export default function ResponsiveVendorImage({
  responsive,
  src,
  alt = "",
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  fetchPriority,
  layoutId = null,
  layoutTransition = VENUE_HERO_LAYOUT_TRANSITION,
}) {
  const r = responsive || parseResponsiveImageField(src);
  const fallback = (typeof src === "string" && src.trim()) || r?.large;
  if (!fallback) return null;

  const hasVariants = Boolean(r && r.thumb && r.large && r.thumb !== r.large);
  const srcSet = hasVariants ? `${r.thumb} 300w, ${r.medium} 800w, ${r.large} 1920w` : undefined;
  /** Prefer large as default `src` when variants exist so fallback / first paint stays sharp; single-URL rows unchanged. */
  const defaultSrc = hasVariants ? r?.large || fallback : r?.medium || fallback;

  const imageProps = {
    src: defaultSrc,
    srcSet,
    sizes: hasVariants ? sizes : undefined,
    alt,
    className,
    loading,
    decoding: "async",
    fetchPriority,
  };

  if (layoutId) {
    return (
      <motion.img
        layoutId={layoutId}
        transition={layoutTransition}
        {...imageProps}
      />
    );
  }

  return <img {...imageProps} />;
}
