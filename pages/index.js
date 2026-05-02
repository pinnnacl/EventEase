import Head from "next/head";
import HowItWorksSection from "../components/HowItWorksSection";
import WeddingPackagesSection from "../components/WeddingPackagesSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import VenueCardsSection from "../components/VenueCardsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";
import { loadApprovedVenuesForListing } from "../lib/venueListServer";

export default function HomePage({ featuredVenues = [], loadError = false }) {
  return (
    <>
      <Head>
        <title>THAALI | Premium Wedding Planning</title>
        <meta
          name="description"
          content="Plan your dream Kerala wedding effortlessly with curated venues, services, and premium wedding packages."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <HowItWorksSection />
          <WeddingPackagesSection />
          <WhyChooseUsSection />
          <VenueCardsSection venues={featuredVenues} loadError={loadError} />
          <TestimonialsSection />
        </main>
        <Footer variant="light" />
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const { venues, error } = await loadApprovedVenuesForListing({ category: "Venue" });
  return {
    props: {
      featuredVenues: JSON.parse(JSON.stringify(venues.slice(0, 6))),
      loadError: Boolean(error),
    },
  };
}
