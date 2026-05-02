import Link from "next/link";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import WishlistToggle from "../WishlistToggle";

const FALLBACK =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80";

/**
 * Portrait grid card for Photographer / Makeup listings (matches legacy /photography layout).
 * @param {{
 *   vendor: {
 *     id: string;
 *     businessName?: string;
 *     city?: string;
 *     state?: string;
 *     location?: string;
 *     profileImage?: string | null;
 *     profileImageResponsive?: { thumb: string; medium: string; large: string } | null;
 *     priceRange?: string;
 *   };
 *   href: string;
 * }} props
 */
export default function ServicePortraitCard({ vendor, href }) {
  const title = vendor.businessName || "Vendor";
  const loc = vendor.place?.trim() || vendor.city?.trim() || "—";
  const img = vendor.profileImage?.trim() || FALLBACK;
  const responsive = vendor.profileImageResponsive;
  const price = vendor.priceRange?.trim() || "Ask for quote";

  return (
    <li id={vendor.id} className="scroll-mt-44 sm:scroll-mt-52">
      <article className="group relative overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-10px_rgba(20,43,60,0.14)] ring-1 ring-stone-200/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(15,118,110,0.16)] hover:ring-stone-300/60">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2">
            <ResponsiveVendorImage
              responsive={responsive}
              src={img}
              alt=""
              className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 280px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-45% to-transparent" />
          </Link>

          <div className="absolute right-2 top-2 z-10 sm:right-2.5 sm:top-2.5">
            <WishlistToggle photographyId={vendor.id} iconOnly className="shadow-md" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-2 pt-8 sm:px-3 sm:pb-3 sm:pt-10">
            <Link
              href={href}
              className="pointer-events-auto block text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_2px_12px_rgba(0,0,0,0.55)]"
            >
              {/* Explicit colors: global base `h2` / `p` would otherwise override inherited white */}
              <h2 className="text-sm font-bold leading-tight tracking-tight text-white sm:text-base">{title}</h2>
              <p className="mt-0.5 text-[0.65rem] font-medium text-white sm:text-xs">{loc}</p>
              <p className="mt-1 text-xs font-semibold tabular-nums text-amber-200 sm:text-sm">{price}</p>
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}
