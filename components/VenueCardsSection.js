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
 * }} props
 */
export default function VenueCardsSection({ venues = [], loadError = false, loading = false }) {
  const featured = venues.slice(0, FEATURED_COUNT);

  return (
    <Section id="venues">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          title="Featured Venues"
          subtitle="Explore elegant spaces for ceremonies, receptions, and family celebrations."
        />

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8">
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
        )}

        <div className="mt-12 flex justify-center">
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
