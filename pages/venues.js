import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Footer from "../components/Footer";
import Section from "../components/Section";
import VenueListingCard from "../components/venues/VenueListingCard";
import { useUserGeolocation } from "../hooks/useUserGeolocation";
import { isValidYmd } from "../lib/eventDateYmd";
import { vendorMatchesLocation } from "../lib/vendorListingFilters";
import { loadApprovedVenuesForListing } from "../lib/venueListServer";

function buildVenueHref(venueId, selectedDate) {
  if (selectedDate && isValidYmd(selectedDate)) {
    return `/venue/${venueId}?date=${encodeURIComponent(selectedDate)}`;
  }
  return `/venue/${venueId}`;
}

export default function VenuesPage({ vendors = [], loadError = false }) {
  const router = useRouter();
  const geo = useUserGeolocation();
  const selectedDate = useMemo(() => {
    if (!router.isReady) return null;
    const dateRaw = typeof router.query.date === "string" ? router.query.date.trim().slice(0, 10) : null;
    return dateRaw && isValidYmd(dateRaw) ? dateRaw : null;
  }, [router.isReady, router.query.date]);

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayedVenues = useMemo(() => {
    return vendors.filter((v) => vendorMatchesLocation(v, resultsLocation));
  }, [vendors, resultsLocation]);

  return (
    <>
      <Head>
        <title>Wedding Venues in Kerala | THAALI</title>
        <meta
          name="description"
          content="Browse curated wedding venues across Kerala—capacities, packages, and amenities in one place."
        />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <Section className="!pt-8 !pb-16 bg-white sm:!pt-10 sm:!pb-20">
            {loadError ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm font-medium text-amber-900">
                We couldn&apos;t load venues right now. Please refresh the page.
              </p>
            ) : displayedVenues.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-12 text-center text-sm font-medium text-stone-600">
                No venues available yet.
              </p>
            ) : (
              <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4">
                {displayedVenues.map((venue) => (
                  <li key={venue.id} id={venue.id} className="scroll-mt-44 sm:scroll-mt-52">
                    <VenueListingCard
                      vendor={venue}
                      href={buildVenueHref(venue.id, selectedDate)}
                      variant="grid"
                      showWishlistToggle
                      unavailableOnSelectedDate={Boolean(venue.unavailableOnSelectedDate)}
                      viewerLat={geo.viewerLat}
                      viewerLng={geo.viewerLng}
                      viewerAccuracyM={geo.viewerAccuracyM}
                      geoStatus={geo.status}
                      geoUsedFallback={geo.usedFallback}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { venues, error } = await loadApprovedVenuesForListing({ category: "Venue" });

  return {
    props: {
      vendors: JSON.parse(JSON.stringify(venues)),
      loadError: Boolean(error),
    },
    revalidate: 60,
  };
}
