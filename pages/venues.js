import Head from "next/head";
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
            <ul className="mx-auto flex max-w-5xl flex-col gap-7 sm:gap-8">
              {displayedVenues.map((venue) => (
                <li key={venue.id} id={venue.id} className="scroll-mt-24">
                  <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_2px_12px_-4px_rgba(20,43,60,0.12)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-stone-300/80 hover:shadow-[0_16px_40px_-12px_rgba(20,43,60,0.18)] lg:flex-row lg:items-stretch">
                    <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-[min(42%,20rem)] lg:min-h-[17.5rem]">
                      <img
                        src={venue.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/10 lg:to-black/35" />
                      <p className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-[2px]">
                        {venue.location}
                      </p>
                      <WishlistToggle venueId={venue.id} className="absolute right-4 top-4 z-10" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 p-5 sm:p-7 lg:py-8 lg:pl-8 lg:pr-10">
                      <div className="min-w-0 space-y-4">
                        <header className="space-y-1">
                          <h2 className="text-xl font-bold leading-snug tracking-tight text-wedding-ink sm:text-2xl">
                            {venue.name}
                          </h2>
                          <p className="text-sm text-slate-500">{venue.area}</p>
                        </header>
                        <p className="text-sm leading-relaxed text-slate-600">{venue.description}</p>
                        <ul className="flex flex-wrap gap-2 pt-1">
                          {venue.amenities.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-stone-100 pt-5">
                        <div className="min-w-0 space-y-1">
                          <p className="text-2xl font-bold tracking-tight text-brand-600 sm:text-[1.65rem]">
                            {venue.price}
                          </p>
                          <p className="text-xs leading-snug text-slate-500">{venue.priceNote}</p>
                          <p className="pt-1 text-sm font-medium text-slate-700">Capacity: {venue.capacity}</p>
                        </div>
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
