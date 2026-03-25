import Head from "next/head";
import Footer from "../components/Footer";

export default function DecorationPage() {
  return (
    <>
      <Head>
        <title>Decoration | EventEase Kerala</title>
        <meta name="description" content="Floral, stage, and lighting design for Kerala weddings." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container-default w-full max-w-none py-12 sm:py-16 lg:py-20">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-600">Services</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl">Decoration</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
          Mandap, florals, and lighting collections are coming to EventEase. Save venues and message us for bespoke
          décor briefs in the meantime.
        </p>
      </main>

      <Footer variant="light" />
    </>
  );
}
