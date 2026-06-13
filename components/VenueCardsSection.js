import Link from "next/link";
import Button from "./Button";
import Section from "./Section";
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
    <Section
      id="featured-venues"
      className={`scroll-mt-24 !py-6 sm:!py-8 lg:!py-[clamp(40px,6vw,120px)] ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <div className="mb-4 w-full text-left sm:mb-5 lg:mb-10 lg:text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-wedding-ink sm:text-[1.7rem] lg:text-fluid-section-title lg:font-bold">
            Featured Venues
          </h2>
        </div>

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
            <div className="-mx-[var(--ee-container-px)] min-w-0 lg:hidden">
              <div className="overflow-x-auto overflow-y-visible pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                <ul className="flex w-max snap-x snap-mandatory gap-4 py-1 pl-[var(--ee-container-px)] pr-[var(--ee-container-px)] sm:gap-5">
                  {featured.map((venue) => (
                    <li key={venue.id} className="w-[min(17.5rem,82vw)] shrink-0 snap-start sm:w-[17.5rem]">
                      <VenueListingCard
                        vendor={venue}
                        href={`/venue/${venue.id}`}
                        variant="grid"
                        showWishlistToggle
                        unavailableOnSelectedDate={Boolean(venue.unavailableOnSelectedDate)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
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
