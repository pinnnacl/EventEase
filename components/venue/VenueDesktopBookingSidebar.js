import {
  Award,
  Building2,
  Car,
  Gem,
  LayoutGrid,
  MapPin,
  Mic,
  Music,
  Snowflake,
  Trophy,
  Users,
  Wine,
} from "lucide-react";
import {
  buildVenueMobileHighlightStats,
  buildVenueMobilePlaceLine,
} from "../../lib/buildVenueMobileSummary";
import { formatVenuePriceDisplay } from "../../lib/formatVenuePrice";
import { parsePositiveInt } from "../../lib/venueHighlights";

function WeddingRingIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="14" r="6" />
      <path d="M9.5 6.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5" />
    </svg>
  );
}

/** @type {Record<string, import("lucide-react").LucideIcon | typeof WeddingRingIcon>} */
const SUITABLE_FOR_ICONS = {
  Weddings: WeddingRingIcon,
  Receptions: Wine,
  Engagements: Gem,
  Conferences: Mic,
  "Cultural Programs": Music,
  "Award Ceremonies": Trophy,
  Exhibitions: LayoutGrid,
  "Banquet Halls": Building2,
};

const STAT_ICONS = {
  capacity: Users,
  location: MapPin,
  parking: Car,
  climate: Snowflake,
};

/**
 * @param {object} venue
 */
function buildSidebarStats(venue) {
  const highlightStats = buildVenueMobileHighlightStats(venue);
  const placeLine = buildVenueMobilePlaceLine(venue);
  const guestStat = highlightStats.find((s) => s.id === "guests");
  const parkingStat = highlightStats.find((s) => s.id === "parking");
  const acStat = highlightStats.find((s) => s.id === "ac");

  const guestNum = parsePositiveInt(venue?.guestCapacity);
  const parkingNum = parsePositiveInt(venue?.parkingCapacity);

  /** @type {{ id: string; label: string; value: string; icon: import("lucide-react").LucideIcon }[]} */
  const items = [];

  const capacityValue = guestStat?.value
    ? `${guestStat.value} guests`
    : venue?.capacity?.trim() || (guestNum != null ? `${guestNum} guests` : "");
  if (capacityValue) {
    items.push({ id: "capacity", label: "Capacity", value: capacityValue, icon: STAT_ICONS.capacity });
  }

  if (placeLine) {
    items.push({ id: "location", label: "Location", value: placeLine, icon: STAT_ICONS.location });
  }

  const parkingValue = parkingStat?.value
    ? `${parkingStat.value} cars`
    : parkingNum != null
      ? `${parkingNum} cars`
      : "";
  if (parkingValue) {
    items.push({ id: "parking", label: "Parking", value: parkingValue, icon: STAT_ICONS.parking });
  }

  if (acStat?.value) {
    items.push({ id: "climate", label: "Climate", value: acStat.value, icon: STAT_ICONS.climate });
  }

  return items.slice(0, 4);
}

/**
 * Sticky desktop booking sidebar (`hidden lg:block` parent).
 *
 * @param {{
 *   venue: object;
 *   priceRange?: string;
 *   demo?: boolean;
 *   sending?: boolean;
 *   onBookNow?: () => void;
 *   onRequestQuote?: () => void;
 * }} props
 */
export default function VenueDesktopBookingSidebar({
  venue,
  priceRange = "",
  demo = false,
  sending = false,
  onBookNow,
  onRequestQuote,
}) {
  const price = formatVenuePriceDisplay(priceRange);
  const priceHeadline = price.amount ? `Rates from ${price.amount}` : price.headline;
  const stats = buildSidebarStats(venue);
  const suitableFor = Array.isArray(venue.suitableFor) ? venue.suitableFor : [];

  return (
    <aside
      className="sticky top-28 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
      aria-label="Venue booking summary"
    >
      <p className="text-2xl font-bold text-zinc-900">{priceHeadline}</p>
      {price.subline ? <p className="mt-1 text-sm text-zinc-400">{price.subline}</p> : null}

      {stats.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{stat.label}</p>
                  <p className="mt-0.5 text-base font-semibold text-zinc-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {suitableFor.length ? (
        <div className="mt-6 border-t border-zinc-100 pt-6">
          <h3 className="text-sm font-bold tracking-tight text-zinc-900">Suitable For</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {suitableFor.map((label) => {
              const Icon = SUITABLE_FOR_ICONS[label] || Award;
              return (
                <span
                  key={label}
                  className="flex items-center justify-start gap-2 rounded-full border border-zinc-200/60 bg-white px-3 py-2"
                >
                  {Icon === WeddingRingIcon ? (
                    <WeddingRingIcon className="size-3.5 shrink-0 text-zinc-400" />
                  ) : (
                    <Icon className="size-3.5 shrink-0 text-zinc-400" strokeWidth={1.5} aria-hidden />
                  )}
                  <span className="text-xs font-medium text-zinc-700">{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-6">
        <button
          type="button"
          onClick={onBookNow}
          className="w-full rounded-full bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Book Now
        </button>
        <button
          type="button"
          disabled={demo || sending}
          onClick={onRequestQuote}
          className="w-full rounded-full border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {demo ? "Preview" : sending ? "Sending…" : "Request Quote"}
        </button>
      </div>
    </aside>
  );
}
