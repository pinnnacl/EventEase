import Head from "next/head";
import VenueCardsSection from "../components/VenueCardsSection";
import Footer from "../components/Footer";
import { loadApprovedVenuesForListing } from "../lib/venueListServer";

export default function HomePage({ featuredVenues = [], loadError = false }) {
  return (
    <>
      <Head>
        <title>THAALI | Premium Wedding Planning</title>
        <meta
          name="description"
          content="Plan your dream Kerala wedding effortlessly with curated venues, services, and featured spaces across Kerala."
        />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <VenueCardsSection venues={featuredVenues} loadError={loadError} className="mt-2 lg:mt-6" />
        </main>
        <Footer variant="light" />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { venues, error } = await loadApprovedVenuesForListing({ category: "Venue" });
  return {
    props: {
      featuredVenues: JSON.parse(JSON.stringify(venues.slice(0, 6))),
      loadError: Boolean(error),
    },
    revalidate: 60,
  };
}
