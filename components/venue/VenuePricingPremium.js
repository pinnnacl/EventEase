import { useMemo, useState } from "react";
import { formatVenuePriceDisplay } from "../../lib/formatVenuePrice";

/**
 * @param {{
 *   priceRange: string;
 *   bullets?: string[];
 *   capacity?: string | null;
 *   facilities?: string[];
 * }} props
 */
export default function VenuePricingPremium({ priceRange, bullets = [], capacity, facilities = [] }) {
  const price = useMemo(() => formatVenuePriceDisplay(priceRange), [priceRange]);

  const tiers = useMemo(() => {
    const baseBullets = bullets.slice(0, 4);
    const decorBullets = bullets.slice(4, 8);
    const facilityLines = facilities.slice(0, 4).map((f) => String(f).trim()).filter(Boolean);

    return [
      {
        id: "base",
        name: "Base venue hire",
        tagline: capacity ? `Up to ${capacity}` : "Essential hall access",
        items:
          baseBullets.length > 0
            ? baseBullets
            : ["Exclusive use of the main event space", "Standard seating layout", "On-site coordination support"],
      },
      {
        id: "premium",
        name: "Premium experience",
        tagline: "Decor, dining & guest comfort",
        items:
          decorBullets.length > 0
            ? decorBullets
            : facilityLines.length > 0
              ? facilityLines
              : ["Enhanced décor options", "Dedicated dining arrangements", "Priority host support"],
      },
    ];
  }, [bullets, capacity, facilities]);

  const [activeTier, setActiveTier] = useState("base");
  const active = tiers.find((t) => t.id === activeTier) || tiers[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200/80 bg-gradient-to-br from-stone-50 to-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.18)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Investment</p>
        <p className="font-display mt-2 text-2xl font-semibold leading-tight tracking-tight text-[#1A1A1A] sm:text-3xl">
          {price.headline}
        </p>
        {price.subline ? <p className="mt-2 text-sm leading-relaxed text-stone-600">{price.subline}</p> : null}
      </div>

      <div className="flex gap-2 rounded-2xl bg-stone-100/80 p-1.5">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => setActiveTier(tier.id)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
              activeTier === tier.id
                ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tier.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F766E]">{active.name}</p>
        <p className="mt-1 text-sm text-stone-600">{active.tagline}</p>
        <ul className="mt-5 space-y-3">
          {active.items.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-stone-700">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0F766E]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-stone-500">
          Final pricing depends on date, guest count, and add-ons. Our team will share a detailed quote after you inquire.
        </p>
      </div>
    </div>
  );
}
