import Link from "next/link";
import Button from "./Button";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import VenueGridSkeleton from "./venues/VenueGridSkeleton";
import VenueListingCard from "./venues/VenueListingCard";

const FEATURED_COUNT = 6;

/**
 * @param {{
 *   venues: Array<Record<string, unknown>>;
 *   loadError?: boolean;
 *   loading?: boolean;
 *   className?: string;
 * }} props
 */
export default function VenueCardsSection({ venues = [], loadError = false, loading = false, className = "" }) {
  const featured = venues.slice(0, FEATURED_COUNT);

  return (
    <Section id="featured-venues" className={`scroll-mt-24 ${className}`.trim()}>
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader title="Featured Venues" subtitle="Top venues curated for your event." />

        {loading ? (
          <VenueGridSkeleton count={FEATURED_COUNT} />
        ) : loadError ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
            We couldn&apos;t load venues right now. Please refresh the page.
          </p>
        ) : featured.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm font-medium text-stone-600">
            No venues available yet. Check back soon.
          </p>
        ) : (
          <>
            {/* Mobile & tablet: horizontal snap scroll (below lg) */}
            <div className="lg:hidden overflow-x-auto overflow-y-visible pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
              <ul className="mx-auto flex w-max snap-x snap-mandatory justify-center gap-6 px-0.5 py-1">
                {featured.map((venue) => (
                  <li key={venue.id} className="w-[min(17.5rem,calc(100vw-2.5rem))] shrink-0 snap-start sm:w-[17.5rem]">
                    <VenueListingCard
                      vendor={venue}
                      href={`/venue/${venue.id}`}
                      variant="grid"
                      unavailableOnSelectedDate={Boolean(venue.unavailableOnSelectedDate)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop (lg+): grid unchanged */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
              {featured.map((venue) => (
                <VenueListingCard
                  key={venue.id}
                  vendor={venue}
                  href={`/venue/${venue.id}`}
                  variant="featured"
                  unavailableOnSelectedDate={Boolean(venue.unavailableOnSelectedDate)}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link href="/venues">
            <Button variant="secondary" className="rounded-full px-8 py-3 text-sm">
              View all venues
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
