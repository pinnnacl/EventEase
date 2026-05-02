import Image from "next/image";
import { parseResponsiveImageField } from "../../lib/imageVariants";

/**
 * Example: next/image with a single URL (large). Use when `remotePatterns` includes the host (e.g. Supabase).
 * Parent must be `relative` with explicit size; this component uses `fill`.
 *
 * @param {{
 *   src: string;
 *   alt?: string;
 *   className?: string;
 *   sizes?: string;
 *   priority?: boolean;
 * }} props
 */
export default function VendorImageNext({ src, alt = "", className = "", sizes = "(max-width: 768px) 100vw, 800px", priority = false }) {
  const primary = parseResponsiveImageField(src)?.large || src;
  if (!primary) return null;

  return (
    <Image
      src={primary}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      style={{ objectFit: "cover" }}
    />
  );
}
