import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import Footer from "../components/Footer";
import MarketingHeader from "../components/home/MarketingHeader";
import PhotographyReelModal from "../components/PhotographyReelModal";
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

function PlayReelIcon({ compact = false }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-black/35 text-white ring-1 ring-white/30 backdrop-blur-sm ${compact ? "p-1.5" : "p-3"}`}
      aria-hidden
    >
      <svg
        className={compact ? "h-2.5 w-2.5 translate-x-px" : "h-7 w-7 translate-x-0.5"}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
    </div>
  );
}

export default function PhotographyPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState(SORT_FEATURED);
  const [openIndex, setOpenIndex] = useState(null);

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

  const modalOpen = openIndex !== null && openIndex >= 0 && openIndex < displayedPhotographers.length;

  return (
    <>
      <Head>
        <title>Photography | EventEase Kerala</title>
        <meta
          name="description"
          content="Discover wedding photographers in a reel-style, visual-first experience—Kerala studios and packages."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0c0b0a]">
        <MarketingHeader />

        <main>
          <div className="w-full min-w-0 shrink-0 bg-[#0c0b0a]">
            <div className="container-default">
              <ResultsBar
                tone="dark"
                className="!py-1 sm:!py-1.5"
                totalResults={total}
                location={resultsLocation}
                onLocationChange={handleLocationChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultLabel="photographers"
              />
            </div>
            <div className="h-px w-full bg-white/10" aria-hidden />
            <div className="container-default pt-3 pb-1 text-center sm:pt-3.5 sm:pb-1.5">
              <h1 className="font-serif text-base font-semibold text-white sm:text-lg">Photography</h1>
            </div>
          </div>

          <section className="relative bg-gradient-to-b from-[#0c0b0a] via-[#12100e] to-[#0c0b0a] pt-5 pb-3 sm:pt-6 sm:pb-4">
            <div className="container-default">
              {total === 0 ? (
                <p className="mx-auto max-w-md text-center text-sm text-white/60">
                  No photographers match this area. Try Kerala or another city from the menu above.
                </p>
              ) : (
                <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-y-5 gap-x-4 min-[480px]:grid-cols-2 min-[480px]:gap-x-5 min-[480px]:gap-y-6 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-7">
                  {displayedPhotographers.map((p, i) => (
                    <li
                      key={p.id}
                      id={p.id}
                      className="flex w-full justify-center scroll-mt-24 min-[480px]:max-w-none"
                    >
                      <article className="relative w-full max-w-[min(100%,184px)] min-[480px]:max-w-[11.5rem] lg:max-w-[12rem]">
                        <button
                          type="button"
                          onClick={() => setOpenIndex(i)}
                          className="group block min-h-[44px] w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 text-left transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a] hover:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.5)]"
                          aria-label={`Open reel: ${p.name}`}
                        >
                          <div className="relative aspect-[5/8] w-full overflow-hidden rounded-xl bg-neutral-900 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition duration-300 ease-out group-hover:ring-white/20 group-hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]">
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent via-45% to-black/75 transition-opacity duration-300 group-hover:to-black/82" />

                            {p.reelVideoStyle ? (
                              <div className="pointer-events-none absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-90">
                                <PlayReelIcon compact />
                              </div>
                            ) : null}

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/40 to-transparent px-1.5 pb-1.5 pt-4">
                              <div className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                                <h2 className="line-clamp-2 text-[0.6rem] font-semibold leading-[1.14] tracking-tight sm:text-[0.625rem]">
                                  {p.name}
                                </h2>
                                <p className="mt-px text-[0.57rem] font-medium leading-tight text-white/85 sm:text-[0.6rem]">
                                  {p.location}
                                </p>
                                <p className="mt-px text-[0.57rem] font-semibold tabular-nums leading-tight text-amber-100/95 sm:text-[0.6rem]">
                                  {p.priceReel ?? p.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="pointer-events-auto absolute right-0.5 top-0.5 z-20 origin-top-right scale-[0.75] sm:right-1 sm:top-1 sm:scale-[0.79]">
                          <WishlistToggle photographyId={p.id} variant="reel" />
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>

        <Footer />

        {modalOpen ? (
          <PhotographyReelModal
            items={displayedPhotographers}
            activeIndex={openIndex}
            onClose={() => setOpenIndex(null)}
            onSelectIndex={setOpenIndex}
          />
        ) : null}
      </div>
    </>
  );
}
