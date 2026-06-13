import { useState } from "react";
import {
  Accessibility,
  Armchair,
  ArrowUpRight,
  Battery,
  Bath,
  CalendarDays,
  Car,
  ChefHat,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Layers,
  Mic2,
  Snowflake,
  Users,
  Utensils,
} from "lucide-react";
import { getPublicVenueDetailRows } from "../../lib/venueDetails";

/** @type {Record<string, import("lucide-react").LucideIcon>} */
const VENUE_DETAIL_ICONS = {
  Capacity: Users,
  "Dining Capacity": Utensils,
  "Car Park Capacity": Car,
  "Seating & Dining Arrangement": Armchair,
  "Temperature Control (AC / Non-AC)": Snowflake,
  "Power Backup": Battery,
  "Stage Availability": Mic2,
  "Rooms / Changing Rooms": DoorOpen,
  "Kitchen / Catering Policy": ChefHat,
  Toilets: Bath,
  "Access for Elderly & Handicapped": Accessibility,
  "Lift / Elevator": Layers,
  "Event Suitability & Restrictions": CalendarDays,
};

/**
 * Borderless mobile accordion for public venue details (`md:hidden` parent).
 *
 * @param {{
 *   venueDetails?: unknown;
 *   onContact?: () => void;
 *   contactDisabled?: boolean;
 * }} props
 */
export default function VenueDetailsMobileAccordion({
  venueDetails,
  onContact,
  contactDisabled = false,
}) {
  const rows = getPublicVenueDetailRows(venueDetails).filter(
    (row) => row.description?.trim() && row.description !== "Not specified",
  );

  const [openKeys, setOpenKeys] = useState(() => new Set());

  if (!rows.length) return null;

  function toggle(key) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <header className="mb-5 flex items-start gap-2.5">
        <ClipboardList className="mt-0.5 size-5 shrink-0 text-zinc-400" strokeWidth={1.5} aria-hidden />
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Venue Details</h2>
          <p className="mt-0.5 text-xs font-normal text-zinc-400">All the technical details about the venue</p>
        </div>
      </header>

      <div>
        {rows.map((row, i) => {
          const key = `${row.isCustom ? "c" : "p"}-${row.title}-${i}`;
          const isOpen = openKeys.has(key);
          const Icon = VENUE_DETAIL_ICONS[row.title] || ClipboardList;

          return (
            <div key={key} className="border-b border-zinc-100/90 last:border-0">
              <button
                type="button"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                className="group flex w-full cursor-pointer items-center justify-between px-1 py-4 text-left"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Icon className="size-[18px] shrink-0 text-zinc-400" strokeWidth={1.5} aria-hidden />
                  <span className="text-[15px] font-medium text-zinc-800 transition-colors group-hover:text-zinc-900">
                    {row.title}
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>

              {isOpen ? (
                <div className="mb-3 mt-1 rounded-xl bg-zinc-50/60 px-4 py-3.5">
                  <p className="text-sm font-normal leading-relaxed text-zinc-600">{row.description}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-100/70 bg-zinc-50/40 p-5">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Need more details?</p>
          <p className="mt-0.5 text-xs text-zinc-500">Our team will be happy to assist you.</p>
        </div>
        <button
          type="button"
          onClick={onContact}
          disabled={contactDisabled}
          className="flex shrink-0 items-center gap-1 border-b border-transparent text-xs font-bold uppercase tracking-wider text-teal-700 transition-all hover:border-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          CONTACT US
          <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
