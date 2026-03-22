import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import Footer from "../components/Footer";
import MarketingHeader from "../components/home/MarketingHeader";
import Section from "../components/Section";
import WishlistTopActions from "../components/WishlistTopActions";
import { useWishlist } from "../context/WishlistContext";
import { photographers } from "../data/photographers";
import { venues } from "../data/venues";

function HeartFilled({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function PhotographyWishlistRow({ photographer, onRemove }) {
  return (
    <li className="border-b border-stone-100 last:border-b-0 transition-colors hover:bg-stone-50/90">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-wedding-ink sm:text-lg">{photographer.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{photographer.location}</p>
          <p className="mt-2 text-sm font-semibold text-brand-600">{photographer.price}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={() => onRemove(photographer.id)}
            aria-label={`Remove ${photographer.name} from wishlist`}
            className="flex h-11 w-11 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <HeartFilled className="h-5 w-5" />
          </button>
          <Link
            href={`/photography#${photographer.id}`}
            className="whitespace-nowrap text-sm font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </li>
  );
}

function VenueWishlistRow({ venue, onRemove }) {
  return (
    <li className="border-b border-stone-100 last:border-b-0 transition-colors hover:bg-stone-50/90">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-wedding-ink sm:text-lg">{venue.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{venue.location}</p>
          <p className="mt-2 text-sm">
            <span className="font-semibold text-brand-600">{venue.price}</span>
            <span className="mx-2 text-slate-300" aria-hidden>
              |
            </span>
            <span className="text-slate-600">Capacity: {venue.capacity}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={() => onRemove(venue.id)}
            aria-label={`Remove ${venue.name} from wishlist`}
            className="flex h-11 w-11 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <HeartFilled className="h-5 w-5" />
          </button>
          <Link
            href={`/venues#${venue.id}`}
            className="whitespace-nowrap text-sm font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </li>
  );
}

function CategoryBlock({ title, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm">
      <h2 className="border-b border-stone-100 bg-stone-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:px-5">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export default function WishlistPage() {
  const { wishlist, toggle, togglePhotography } = useWishlist();

  const savedVenues = useMemo(() => {
    return wishlist.venues.map((id) => venues.find((v) => v.id === id)).filter(Boolean);
  }, [wishlist.venues]);

  const savedPhotographers = useMemo(() => {
    return wishlist.photography.map((id) => photographers.find((p) => p.id === id)).filter(Boolean);
  }, [wishlist.photography]);

  const hasVenues = savedVenues.length > 0;
  const hasPhotography = savedPhotographers.length > 0;
  const hasCatering = wishlist.catering.length > 0;
  const hasDecoration = wishlist.decoration.length > 0;
  const hasAnything = hasVenues || hasPhotography || hasCatering || hasDecoration;

  const venueNames = useMemo(() => savedVenues.map((v) => v.name), [savedVenues]);
  const photographyNames = useMemo(() => savedPhotographers.map((p) => p.name), [savedPhotographers]);

  return (
    <>
      <Head>
        <title>Your wishlist | EventEase Kerala</title>
        <meta name="description" content="Venues, photography, and services you have saved on EventEase Kerala." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-wedding-cream">
        <MarketingHeader />

        <main>
          <Section
            className={
              hasAnything
                ? "bg-wedding-cream !pt-5 !pb-14 sm:!pt-6 sm:!pb-16"
                : "bg-wedding-cream !pt-6 !pb-16 sm:!pt-8 sm:!pb-20"
            }
          >
            <div
              className={`mx-auto max-w-3xl ${hasAnything ? "flex flex-col gap-4 sm:gap-5" : ""}`}
            >
              {hasAnything ? (
                <WishlistTopActions
                  venueNames={venueNames}
                  photographyNames={photographyNames}
                  catering={wishlist.catering}
                  decoration={wishlist.decoration}
                />
              ) : null}

              {!hasAnything ? (
                <div className="rounded-xl border border-stone-200/90 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-sm text-slate-600">No items in your wishlist yet</p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      href="/venues"
                      className="inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                    >
                      Browse venues
                    </Link>
                    <Link
                      href="/photography"
                      className="inline-flex rounded-full border-2 border-brand-400 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
                    >
                      Browse photography
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {hasVenues ? (
                    <CategoryBlock title="Venues">
                      <ul aria-label="Saved venues">
                        {savedVenues.map((venue) => (
                          <VenueWishlistRow key={venue.id} venue={venue} onRemove={toggle} />
                        ))}
                      </ul>
                    </CategoryBlock>
                  ) : null}

                  {hasPhotography ? (
                    <CategoryBlock title="Photography">
                      <ul aria-label="Saved photographers">
                        {savedPhotographers.map((p) => (
                          <PhotographyWishlistRow key={p.id} photographer={p} onRemove={togglePhotography} />
                        ))}
                      </ul>
                    </CategoryBlock>
                  ) : null}

                  {hasCatering ? (
                    <CategoryBlock title="Catering">
                      <ul className="divide-y divide-stone-100" aria-label="Saved catering">
                        {wishlist.catering.map((id) => (
                          <li key={id} className="px-4 py-4 text-sm text-slate-700 sm:px-5">
                            {id}
                          </li>
                        ))}
                      </ul>
                    </CategoryBlock>
                  ) : null}

                  {hasDecoration ? (
                    <CategoryBlock title="Decoration">
                      <ul className="divide-y divide-stone-100" aria-label="Saved decoration">
                        {wishlist.decoration.map((id) => (
                          <li key={id} className="px-4 py-4 text-sm text-slate-700 sm:px-5">
                            {id}
                          </li>
                        ))}
                      </ul>
                    </CategoryBlock>
                  ) : null}
                </div>
              )}
            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </>
  );
}
