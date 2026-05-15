import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Footer from "../components/Footer";
import ServicePortraitCard from "../components/service/ServicePortraitCard";
import { vendorMatchesLocation } from "../lib/vendorListingFilters";
import { loadApprovedVenuesForListing } from "../lib/venueListServer";

const ONBOARDING_MAKEUP = "/vendor/signup?next=" + encodeURIComponent("/vendor/onboarding?category=Makeup");

export default function MakeupPage({ vendors = [], loadError = false }) {
  const router = useRouter();

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayed = useMemo(() => {
    return vendors.filter((v) => vendorMatchesLocation(v, resultsLocation));
  }, [vendors, resultsLocation]);

  const total = displayed.length;

  return (
    <>
      <Head>
        <title>Makeup | THAALI</title>
        <meta name="description" content="Bridal and party makeup artists on THAALI—browse approved vendors." />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <section className="border-b border-stone-100 bg-white/80 py-8 sm:py-10">
            <div className="container-default max-w-3xl">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-600">Makeup</p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                Bridal &amp; party makeup artists
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
                Artists below have completed vendor onboarding and been approved to appear publicly.
              </p>
              <Link
                href={ONBOARDING_MAKEUP}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                List your makeup services
              </Link>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-16">
            <div className="container-default w-full max-w-none">
              {loadError ? (
                <p className="w-full max-w-none text-center text-sm text-stone-600">
                  We couldn&apos;t load makeup artists right now. Please try again shortly.
                </p>
              ) : total === 0 ? (
                <div className="mx-auto max-w-lg rounded-2xl border border-stone-200/90 bg-stone-50/80 px-6 py-10 text-center">
                  <p className="text-sm text-stone-700">
                    No approved makeup artists in this area yet, or none match your search. Try Kerala or another city
                    from the search bar.
                  </p>
                  <p className="mt-4 text-sm text-stone-600">
                    Are you a makeup artist? Complete vendor onboarding to appear here after approval.
                  </p>
                  <Link
                    href={ONBOARDING_MAKEUP}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Start vendor onboarding
                  </Link>
                  <p className="mt-6 text-sm text-stone-600">
                    Preview the premium profile layout?{" "}
                    <Link
                      href="/makeup/demo"
                      className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      Open makeup artist demo
                    </Link>
                  </p>
                </div>
              ) : (
                <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-5">
                  {displayed.map((v) => (
                    <ServicePortraitCard key={v.id} vendor={v} href={`/makeup/${v.id}`} />
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>

        <Footer variant="light" />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { venues, error } = await loadApprovedVenuesForListing({ category: "Makeup" });
  return {
    props: {
      vendors: venues ?? [],
      loadError: Boolean(error),
    },
    revalidate: 60,
  };
}
