import Link from "next/link";
import WishlistRemoveButton from "./WishlistRemoveButton";

/**
 * @param {{ item: Record<string, unknown> }} props
 */
export default function WishlistCard({ item }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-stone-200/70 bg-white shadow-[0_2px_10px_-5px_rgba(20,43,60,0.1)] ring-1 ring-black/[0.02] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-10px_rgba(15,118,110,0.12)]">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-stone-100">
        <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
        {item.isPremium ? (
          <p className="absolute left-1 top-1 rounded bg-[#e8c547]/95 px-1 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider text-stone-900">
            Premium
          </p>
        ) : item.eyebrow && item.categoryKey === "photography" ? (
          <p className="absolute left-1 top-1 rounded bg-white/90 px-1 py-0.5 text-[0.5rem] font-semibold uppercase tracking-wide text-brand-700 shadow-sm backdrop-blur-sm">
            {item.eyebrow}
          </p>
        ) : null}
        <div className="absolute right-1 top-1 z-10">
          <WishlistRemoveButton label={`Remove ${item.name} from wishlist`} onRemove={item.onRemove} size="xs" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-1.5 pb-1.5 pt-1 sm:px-2 sm:pb-2 sm:pt-1.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-display min-w-0 text-[0.75rem] font-semibold leading-snug text-brand-950 sm:text-[0.8125rem]">
            <Link href={item.detailHref} className="hover:text-brand-700 hover:underline">
              {item.name}
            </Link>
          </h3>
          {item.rating != null ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-50 px-0.5 py-px text-[0.5rem] font-semibold text-brand-800 sm:px-1 sm:py-0.5 sm:text-[0.55rem]">
              <span className="text-amber-500" aria-hidden>
                ★
              </span>
              {Number(item.rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[0.625rem] leading-snug text-stone-500 sm:text-[0.65rem]">{item.location}</p>
        <div className="mt-1">
          {item.pricePrefix ? (
            <p className="text-[0.45rem] font-semibold uppercase tracking-wider text-stone-500 sm:text-[0.5rem]">{item.pricePrefix}</p>
          ) : null}
          <p className="text-[0.6875rem] font-bold tabular-nums text-brand-600 sm:text-xs">{item.price}</p>
        </div>
      </div>
    </article>
  );
}
