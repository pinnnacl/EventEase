import Head from "next/head";
import Footer from "../components/Footer";

export default function CateringPage() {
  return (
    <>
      <Head>
        <title>Catering | THAALI</title>
        <meta
          name="description"
          content="Curated wedding catering across Kerala — menus, tastings, and banquet-ready service."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container-default w-full max-w-none py-12 sm:py-16 lg:py-20">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-600">Services</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl">Catering</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
          We&apos;re onboarding premium catering partners across Kerala. Check back soon or use{" "}
          <span className="font-medium text-brand-800">Check availability</span> from your wishlist to reach our team.
        </p>
      </main>

      <Footer variant="light" />
    </>
  );
}
