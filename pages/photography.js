import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Footer from "../components/Footer";
import ServicePortraitCard from "../components/service/ServicePortraitCard";
import { vendorMatchesLocation } from "../lib/vendorListingFilters";
import { loadApprovedVenuesForListing } from "../lib/venueListServer";

const ONBOARDING_PHOTO = "/vendor/signup?next=" + encodeURIComponent("/vendor/onboarding?category=Photographer");

export default function PhotographyPage({ vendors = [], loadError = false }) {
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
        <title>Photography | THAALI</title>
        <meta
          name="description"
          content="Browse approved wedding photographers on THAALI—portfolios, packages, and direct inquiries."
        />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <section className="py-10 sm:py-12 lg:py-16">
            <div className="container-default w-full max-w-none">
              {loadError ? (
                <p className="w-full max-w-none text-center text-sm text-stone-600">
                  We couldn&apos;t load photographers right now. Please try again shortly.
                </p>
              ) : total === 0 ? (
                <div className="mx-auto max-w-lg rounded-2xl border border-stone-200/90 bg-stone-50/80 px-6 py-10 text-center">
                  <p className="text-sm text-stone-700">
                    No approved photographers in this area yet, or none match your search. Try Kerala or another city
                    from the search bar.
                  </p>
                  <p className="mt-4 text-sm text-stone-600">
                    Are you a photographer? Complete vendor onboarding to go live after approval.
                  </p>
                  <Link
                    href={ONBOARDING_PHOTO}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Start vendor onboarding
                  </Link>
                  <p className="mt-6 text-sm text-stone-600">
                    Want to preview the booking-focused profile layout?{" "}
                    <Link href="/photography/demo" className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800">
                      Open sample profile (demo)
                    </Link>
                  </p>
                </div>
              ) : (
                <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-5">
                  {displayed.map((v) => (
                    <ServicePortraitCard key={v.id} vendor={v} href={`/photography/${v.id}`} />
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

export async function getServerSideProps() {
  const { venues, error } = await loadApprovedVenuesForListing({ category: "Photographer" });
  return {
    props: {
      vendors: venues ?? [],
      loadError: Boolean(error),
    },
  };
}
