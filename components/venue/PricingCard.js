/**
 * Price range + bullet highlights.
 */
export default function PricingCard({ priceRange, bullets = [] }) {
  const display = priceRange?.trim() || "Ask for quote";

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Starting from</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-[#0F766E] sm:text-3xl">{display}</p>
      {bullets.length ? (
        <ul className="mt-5 space-y-2.5 border-t border-stone-100 pt-5">
          {bullets.map((line) => (
            <li key={line} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F766E]/80" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
