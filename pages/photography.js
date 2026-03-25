import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Footer from "../components/Footer";
import WishlistToggle from "../components/WishlistToggle";
import {
  SORT_FEATURED,
  SORT_PRICE_ASC,
  SORT_PRICE_DESC,
  SORT_RATING,
} from "../lib/listingSortConstants";
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

  const resultsLocation = useMemo(() => {
    if (!router.isReady) return "Kerala";
    const raw = router.query.city ?? router.query.location;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "Kerala";
  }, [router.isReady, router.query.city, router.query.location]);

  const displayedPhotographers = useMemo(() => {
    const sorted = sortPhotographers(photographers, SORT_FEATURED);
    return sorted.filter((p) => photographerMatchesLocation(p, resultsLocation));
  }, [resultsLocation]);

  const total = displayedPhotographers.length;

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

      <div className="min-h-screen w-full max-w-none">
        <main className="w-full max-w-none">
          <section className="py-10 sm:py-12 lg:py-16">
            <div className="container-default w-full max-w-none">
              {total === 0 ? (
                <p className="w-full max-w-none text-center text-sm text-stone-600">
                  No photographers match this area. Try Kerala or another city from the search bar.
                </p>
              ) : (
                <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-5">
                  {displayedPhotographers.map((p) => (
                    <li key={p.id} id={p.id} className="scroll-mt-44 sm:scroll-mt-52">
                      <article className="group relative overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-10px_rgba(20,43,60,0.14)] ring-1 ring-stone-200/50 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(15,118,110,0.16)] hover:ring-stone-300/60">
                        <div className="relative aspect-[4/5] w-full overflow-hidden">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-50% to-black/10" />

                          {isPremiumVendor(p) ? (
                            <p className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-brand-800 shadow-sm backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:text-[0.6rem]">
                              Premium Vendor
                            </p>
                          ) : null}

                          <div className="absolute right-2 top-2 z-10 sm:right-2.5 sm:top-2.5">
                            <WishlistToggle photographyId={p.id} iconOnly className="shadow-md" />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-8 sm:px-3 sm:pb-3 sm:pt-10">
                            <div className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                              <h2 className="text-sm font-bold leading-tight tracking-tight sm:text-base">{p.name}</h2>
                              <p className="mt-0.5 text-[0.65rem] font-medium text-white/90 sm:text-xs">{p.location}</p>
                              <p className="mt-1 text-xs font-semibold tabular-nums text-amber-100 sm:text-sm">
                                {p.priceReel ?? p.price}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-[0.65rem] font-medium text-white/90 sm:text-xs">
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
