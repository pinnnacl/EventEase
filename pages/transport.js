import Head from "next/head";
import Footer from "../components/Footer";

export default function TransportPage() {
  return (
    <>
      <Head>
        <title>Transport | THAALI</title>
        <meta name="description" content="Guest shuttles, bridal cars, and logistics for Kerala weddings." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container-default w-full max-w-none py-12 sm:py-16 lg:py-20">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-600">Services</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl">Transport</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
          Fleet partners and route planning will be available here soon. Share your event date in the search bar so we
          can prioritize your inquiry.
        </p>
      </main>

      <Footer variant="light" />
    </>
  );
}
