import Link from "next/link";
import WishlistRemoveButton from "./WishlistRemoveButton";

/**
 * @param {{ item: Record<string, unknown> }} props
 */
export default function WishlistCard({ item }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/70 bg-white shadow-[0_2px_16px_-8px_rgba(20,43,60,0.1)] ring-1 ring-black/[0.02] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-14px_rgba(15,118,110,0.12)]">
      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-stone-100 sm:h-36">
        <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
        {item.isPremium ? (
          <p className="absolute left-2 top-2 rounded bg-[#e8c547]/95 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-stone-900">
            Premium
          </p>
        ) : item.eyebrow && item.categoryKey === "photography" ? (
          <p className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-brand-700 shadow-sm backdrop-blur-sm">
            {item.eyebrow}
          </p>
        ) : null}
        <div className="absolute right-2 top-2 z-10">
          <WishlistRemoveButton label={`Remove ${item.name} from wishlist`} onRemove={item.onRemove} size="sm" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display min-w-0 text-sm font-semibold leading-snug text-brand-950 sm:text-base">
            <Link href={item.detailHref} className="hover:text-brand-700 hover:underline">
              {item.name}
            </Link>
          </h3>
          {item.rating != null ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[0.6rem] font-semibold text-brand-800">
              <span className="text-amber-500" aria-hidden>
                ★
              </span>
              {Number(item.rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{item.location}</p>
        <div className="mt-2">
          {item.pricePrefix ? (
            <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-stone-500">{item.pricePrefix}</p>
          ) : null}
          <p className="text-sm font-bold tabular-nums text-brand-600">{item.price}</p>
        </div>
      </div>
    </article>
  );
}
