import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import Footer from "../components/Footer";
import WishlistToggle from "../components/WishlistToggle";
import {
  SORT_FEATURED,
  SORT_PRICE_ASC,
  SORT_PRICE_DESC,
  SORT_RATING,
} from "../lib/listingSortConstants";
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

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayedVenues = useMemo(() => {
    const sorted = sortVenues(venues, SORT_FEATURED);
    return sorted.filter((v) => venueMatchesLocation(v, resultsLocation));
  }, [resultsLocation]);

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

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <Section className="!pt-8 !pb-16 sm:!pt-10 sm:!pb-20">
            <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-5">
              {displayedVenues.map((venue) => (
                <li key={venue.id} id={venue.id} className="scroll-mt-44 sm:scroll-mt-52">
                  <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/60 bg-white shadow-[0_3px_18px_-8px_rgba(20,43,60,0.12)] ring-1 ring-black/[0.02] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300/70 hover:shadow-[0_14px_36px_-14px_rgba(15,118,110,0.12)]">
                    <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden">
                      <Link
                        href={venueCardHref(venue.id)}
                        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        <img
                          src={venue.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                      </Link>
                      <WishlistToggle
                        venueId={venue.id}
                        iconOnly
                        className="absolute right-2 top-2 z-10 sm:right-2.5 sm:top-2.5"
                      />
                    </div>

                    <Link
                      href={venueCardHref(venue.id)}
                      className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/30 sm:p-3"
                    >
                      <h2 className="text-base font-bold leading-snug tracking-tight text-wedding-ink sm:text-[1.0625rem]">
                        {venue.name}
                      </h2>
                      <p className="line-clamp-2 text-[0.7rem] leading-relaxed text-stone-600 sm:text-xs">
                        {venue.description}
                      </p>
                      <p className="mt-auto pt-0.5 text-base font-bold tabular-nums tracking-tight text-brand-600 sm:text-lg">
                        {venue.price}
                      </p>
                    </Link>
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
