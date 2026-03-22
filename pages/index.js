import Head from "next/head";
import MarketingHeader from "../components/home/MarketingHeader";
import HomeHero from "../components/home/HomeHero";
import HowItWorksSection from "../components/HowItWorksSection";
import WeddingPackagesSection from "../components/WeddingPackagesSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import VenueCardsSection from "../components/VenueCardsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>EventEase Kerala | Premium Wedding Planning</title>
        <meta
          name="description"
          content="Plan your dream Kerala wedding effortlessly with curated venues, services, and premium wedding packages."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#fafaf9]">
        <MarketingHeader />
        <main>
          <HomeHero />
          <HowItWorksSection />
          <WeddingPackagesSection />
          <WhyChooseUsSection />
          <VenueCardsSection />
          <TestimonialsSection />
        </main>
        <Footer variant="light" />
      </div>
    </>
  );
}
