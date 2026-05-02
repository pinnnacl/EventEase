import { getPublicVenueDetailRows } from "../../lib/venueDetails";

/**
 * Horizontal key–value rows for public venue page (desktop: 2 columns; mobile: stacked).
 * @param {{ venueDetails?: unknown }} props
 */
export default function VenueDetailsRows({ venueDetails }) {
  const rows = getPublicVenueDetailRows(venueDetails);

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-2 shadow-sm sm:px-6 sm:py-4">
      <ul className="divide-y divide-stone-200/80">
        {rows.map((row, i) => (
          <li
            key={`${row.isCustom ? "c" : "p"}-${row.title}-${i}`}
            className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[minmax(200px,250px)_minmax(0,1fr)] sm:gap-8 sm:py-4"
          >
            <div className="text-sm font-bold leading-snug text-slate-900">{row.title}</div>
            <div className="text-sm leading-relaxed text-slate-600 sm:pt-0">{row.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
