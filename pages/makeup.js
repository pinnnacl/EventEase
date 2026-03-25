import Head from "next/head";
import Footer from "../components/Footer";

export default function MakeupPage() {
  return (
    <>
      <Head>
        <title>Makeup | EventEase Kerala</title>
        <meta name="description" content="Bridal and party makeup artists across Kerala." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container-default w-full max-w-none py-12 sm:py-16 lg:py-20">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-600">Services</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl">Makeup</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
          Hand-picked bridal and party makeup artists are joining the platform. Browse photography and venues today —
          we&apos;ll loop in beauty pros for your dates.
        </p>
      </main>

      <Footer variant="light" />
    </>
  );
}
