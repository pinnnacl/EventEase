import { Navigation } from "lucide-react";

/**
 * @param {{ points: { label: string; value: string }[] }} props
 */
export default function VenueProximityList({ points }) {
  if (!points?.length) return null;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/40 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">
        <Navigation className="h-4 w-4 text-[#0F766E]" strokeWidth={1.75} aria-hidden />
        Proximity &amp; connectivity
      </h3>
      <ul className="mt-4 space-y-3">
        {points.map((p) => (
          <li key={`${p.label}-${p.value}`} className="flex flex-col gap-0.5 border-l-2 border-[#0F766E]/30 pl-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="text-sm font-bold text-stone-900">{p.label}</span>
            {p.value ? (
              <span className="text-sm font-medium tabular-nums text-stone-600 sm:text-right">{p.value}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
