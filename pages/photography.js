import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import Footer from "../components/Footer";
import MarketingHeader from "../components/home/MarketingHeader";
import WishlistToggle from "../components/WishlistToggle";
import ResultsBar, {
  SORT_FEATURED,
  SORT_PRICE_ASC,
  SORT_PRICE_DESC,
  SORT_RATING,
} from "../components/ResultsBar";
import { photographers } from "../data/photographers";

function sortPhotographers(list, sortBy) {
  const next = [...list];
  switch (sortBy) {
    case SORT_PRICE_ASC:
      return next.sort((a, b) => a.priceLakh - b.priceLakh);
    case SORT_PRICE_DESC:
      return next.sort((a, b) => b.priceLakh - a.priceLakh);
    case SORT_RATING:
      return next.sort((a, b) => b.rating - a.rating);
    default:
      return next;
  }
}

function photographerMatchesLocation(photographer, locationLabel) {
  const q = locationLabel.trim().toLowerCase();
  if (!q || q === "kerala") return true;
  return (
    photographer.location.toLowerCase() === q ||
    photographer.area.toLowerCase().includes(q)
  );
}

function isPremiumVendor(p) {
  return p.rating >= 4.85;
}

export default function PhotographyPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState(SORT_FEATURED);

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayedPhotographers = useMemo(() => {
    const sorted = sortPhotographers(photographers, sortBy);
    return sorted.filter((p) => photographerMatchesLocation(p, resultsLocation));
  }, [sortBy, resultsLocation]);

  const total = displayedPhotographers.length;

  const handleLocationChange = useCallback(
    (next) => {
      if (next === "Kerala") {
        router.push({ pathname: "/photography" }, undefined, { scroll: false });
        return;
      }
      router.push({ pathname: "/photography", query: { city: next } }, undefined, { scroll: false });
    },
    [router],
  );

  return (
    <>
      <Head>
        <title>Photography | EventEase Kerala</title>
        <meta
          name="description"
          content="Browse curated wedding photographers across Kerala—editorial portfolios, packages, and ratings."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5]">
        <MarketingHeader />

        <main>
          {/* Top bar: explore + controls */}
          <div className="border-b border-stone-200/90 bg-[#faf8f5]">
            <div className="container-default py-5 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Explore Talent</p>
                  <p className="mt-2 text-base leading-snug text-stone-700 sm:text-lg">
                    <span className="font-display text-xl font-semibold tabular-nums text-brand-900 sm:text-2xl">{total}</span>
                    <span className="text-stone-600"> photographers in </span>
                    <span className="font-medium text-stone-800">{resultsLocation}</span>
                  </p>
                </div>
                <div className="shrink-0 lg:min-w-[20rem]">
                  <ResultsBar
                    layout="controlsOnly"
                    tone="light"
                    className="!py-0"
                    totalResults={total}
                    location={resultsLocation}
                    onLocationChange={handleLocationChange}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    resultLabel="photographers"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editorial title */}
          <div className="border-b border-stone-200/80 bg-[#f6f3ed]">
            <div className="container-default py-10 text-center sm:py-14 lg:py-16">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#8a7d62]">
                The Portfolio Collection
              </p>
              <h1 className="font-display mt-4 text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl lg:text-[3.25rem]">
                Photography
              </h1>
            </div>
          </div>

          {/* Portfolio grid */}
          <section className="bg-[#f0ece4] py-10 sm:py-12 lg:py-16">
            <div className="container-default">
              {total === 0 ? (
                <p className="mx-auto max-w-md text-center text-sm text-stone-600">
                  No photographers match this area. Try Kerala or another city from the menu above.
                </p>
              ) : (
                <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
                  {displayedPhotographers.map((p) => (
                    <li key={p.id} id={p.id} className="scroll-mt-28">
                      <article className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_6px_28px_-12px_rgba(20,43,60,0.14)] ring-1 ring-stone-200/50 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_48px_-18px_rgba(15,118,110,0.18)] hover:ring-stone-300/60">
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-50% to-black/10" />

                          {isPremiumVendor(p) ? (
                            <p className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-brand-800 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[0.65rem]">
                              Premium Vendor
                            </p>
                          ) : null}

                          <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
                            <WishlistToggle photographyId={p.id} iconOnly className="shadow-md" />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-16">
                            <div className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                              <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">{p.name}</h2>
                              <p className="mt-1 text-xs font-medium text-white/90 sm:text-sm">{p.location}</p>
                              <p className="mt-2 text-sm font-semibold tabular-nums text-amber-100 sm:text-base">
                                {p.priceReel ?? p.price}
                              </p>
                              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-white/90 sm:text-sm">
                                <span className="text-amber-200" aria-hidden>
                                  ★
                                </span>
                                <span className="tabular-nums">{p.rating.toFixed(1)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
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
