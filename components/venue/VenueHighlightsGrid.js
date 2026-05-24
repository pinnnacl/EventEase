import { Car, MapPin, Snowflake, Users } from "lucide-react";

const ICONS = {
  capacity: Users,
  ac: Snowflake,
  parking: Car,
  place: MapPin,
};

/**
 * @param {{ items: { id: string; label: string; value: string }[] }} props
 */
export default function VenueHighlightsGrid({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => {
        const Icon = ICONS[item.id] || MapPin;
        return (
          <li
            key={item.id}
            className="flex flex-col items-center rounded-2xl border border-stone-200/70 bg-stone-50/60 px-3 py-4 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-sm ring-1 ring-stone-200/60">
              <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="mt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-stone-900 line-clamp-2">{item.value}</p>
          </li>
        );
      })}
    </ul>
  );
}
