import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import Footer from "../components/Footer";
import MarketingHeader from "../components/home/MarketingHeader";
import WishlistToggle from "../components/WishlistToggle";
import ResultsBar, {
  SORT_FEATURED,
  SORT_PRICE_ASC,
  SORT_PRICE_DESC,
  SORT_RATING,
} from "../components/ResultsBar";
import Section from "../components/Section";
import { venues } from "../data/venues";

function sortVenues(list, sortBy) {
  const next = [...list];
  switch (sortBy) {
    case SORT_PRICE_ASC:
      return next.sort((a, b) => a.priceLakh - b.priceLakh);
    case SORT_PRICE_DESC:
      return next.sort((a, b) => b.priceLakh - a.priceLakh);
    case SORT_RATING:
      return next.sort((a, b) => b.rating - a.rating);
    default:
      return next;
  }
}

function venueMatchesLocation(venue, locationLabel) {
  const q = locationLabel.trim().toLowerCase();
  if (!q || q === "kerala") return true;
  return (
    venue.location.toLowerCase() === q ||
    venue.area.toLowerCase().includes(q)
  );
}

export default function VenuesPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState(SORT_FEATURED);

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayedVenues = useMemo(() => {
    const sorted = sortVenues(venues, sortBy);
    return sorted.filter((v) => venueMatchesLocation(v, resultsLocation));
  }, [sortBy, resultsLocation]);

  const total = displayedVenues.length;

  const handleLocationChange = useCallback(
    (next) => {
      if (next === "Kerala") {
        router.push({ pathname: "/venues" }, undefined, { scroll: false });
        return;
      }
      router.push({ pathname: "/venues", query: { city: next } }, undefined, { scroll: false });
    },
    [router],
  );

  const venueCardHref = useCallback(
    (venueId) => {
      const params = new URLSearchParams();
      const city = router.query.city ?? router.query.location;
      if (typeof city === "string" && city.trim()) params.set("city", city.trim());
      const qs = params.toString();
      return `/venues${qs ? `?${qs}` : ""}#${venueId}`;
    },
    [router.query.city, router.query.location],
  );

  return (
    <>
      <Head>
        <title>Wedding Venues in Kerala | EventEase Kerala</title>
        <meta
          name="description"
          content="Browse curated wedding venues across Kerala—capacities, packages, and amenities in one place."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-wedding-cream">
        <MarketingHeader />

        <main>
          <div className="w-full min-w-0 border-b border-neutral-200 bg-wedding-cream">
            <div className="container-default">
              <ResultsBar
                totalResults={total}
                location={resultsLocation}
                onLocationChange={handleLocationChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>

          <Section className="bg-[#f3f1ec] !pt-8 !pb-16 sm:!pt-10 sm:!pb-20">
            <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
              {displayedVenues.map((venue) => (
                <li key={venue.id} id={venue.id} className="scroll-mt-28">
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-[0_4px_24px_-8px_rgba(20,43,60,0.12)] ring-1 ring-black/[0.02] transition duration-300 ease-out hover:-translate-y-1 hover:border-stone-300/70 hover:shadow-[0_20px_48px_-16px_rgba(15,118,110,0.14)]">
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                      <img
                        src={venue.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                      <p className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-800 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                        {venue.location}
                      </p>
                      <WishlistToggle
                        venueId={venue.id}
                        iconOnly
                        className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4"
                      />
                    </div>

                    {/* Body */}
                    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
                      <div className="min-w-0 flex-1 space-y-3">
                        <header className="space-y-1">
                          <h2 className="text-lg font-bold leading-snug tracking-tight text-wedding-ink sm:text-xl">
                            {venue.name}
                          </h2>
                          <p className="text-sm text-stone-500">{venue.area}</p>
                        </header>
                        <ul className="flex flex-wrap gap-1.5 pt-1">
                          {venue.amenities.slice(0, 4).map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-stone-200/80 bg-stone-50/80 px-2 py-0.5 text-[0.65rem] font-medium text-stone-600 sm:px-2.5 sm:text-xs"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-stone-100 pt-4">
                        <div className="flex flex-wrap items-end justify-between gap-2 gap-y-1">
                          <div>
                            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-stone-500">
                              Starting from
                            </p>
                            <p className="text-lg font-bold tracking-tight text-brand-600 sm:text-xl">{venue.price}</p>
                          </div>
                          <p className="text-right text-xs text-stone-500 sm:text-sm">{venue.capacity}</p>
                        </div>
                        <p className="line-clamp-1 text-xs text-stone-400">{venue.priceNote}</p>
                        <Link
                          href={venueCardHref(venue.id)}
                          className="inline-flex w-full items-center justify-center rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-center text-xs font-semibold text-brand-700 transition duration-200 hover:border-brand-200/80 hover:bg-brand-50/60 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </Section>
        </main>

        <Footer />
      </div>
    </>
  );
}
