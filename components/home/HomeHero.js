import Link from "next/link";

/**
 * Hero section lives in this file: `components/home/HomeHero.js`
 *
 * Spacing cheat sheet (visual balance text ↔ images):
 * 1) HERO_GRID — Tailwind `gap-*` on the grid parent = space between the text column and image column.
 *    Smaller gap = image sits closer to copy (same on all breakpoints that use the grid).
 * 2) HERO_IMAGE_COLUMN — On large screens, horizontal position in the right column is mostly `ml-*` / `mr-*`
 *    on the image wrapper. `ml-auto` pushes the block toward the viewport right; `ml-0 mr-auto` hugs the
 *    column edge nearest the text; add `lg:ml-*` (e.g. ml-4) to nudge both images slightly right.
 * Image dimensions (`max-w-*` on HERO_IMAGE_COLUMN) are unchanged here — only position/gap.
 */

/**
 * Main hero — 4:5 portrait. Traditional South Indian wedding celebration (warm golds & reds; swap for your kasavu/mundu shots).
 */
const MAIN_IMAGE =
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&h=1500&q=92";
/** Inset — perfect 1:1 square; golden wedding reception / event detail (rings, florals, candlelight). */
const INSET_IMAGE =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=960&h=960&q=90";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#fafaf9] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
      <div className="container-default">
        {/* HERO_GRID: column gap between copy and images — reduce lg/xl gap-* to pull the image block toward the text */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="order-2 max-w-xl lg:order-1">
            <p className="font-arial text-[0.7rem] font-normal not-italic uppercase tracking-[0.2em] text-[#b8953c] sm:text-xs">
              CURATING KERALA&apos;S FINEST MOMENTS
            </p>
            <h1 className="font-arial mt-4 text-[2rem] font-normal not-italic leading-[1.15] tracking-tight text-brand-800 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Plan your wedding without the chaos
            </h1>
            <p className="font-arial mt-6 text-base font-normal not-italic leading-relaxed text-stone-600 sm:text-lg sm:leading-relaxed">
              Find trusted venues and services tailored to your budget and date. Experience the heritage of Kerala with
              modern ease.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/venues"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Start Planning
              </Link>
              <Link
                href="/venues"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-stone-200/90 px-7 py-3 text-sm font-semibold text-wedding-ink transition duration-300 hover:-translate-y-0.5 hover:bg-stone-300/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/50 focus-visible:ring-offset-2"
              >
                Explore
              </Link>
            </div>
          </div>

          {/* HERO_IMAGE_COLUMN: translate-x / ml-* = horizontal; -translate-y-* = move main + inset up (more negative = higher). */}
          <div className="relative order-1 mx-auto w-full max-w-[min(100%,21rem)] -translate-y-2 translate-x-7 sm:max-w-[22.5rem] sm:-translate-y-2.5 sm:translate-x-8 lg:order-2 lg:-translate-y-3 lg:ml-16 lg:mr-auto lg:translate-x-5 xl:ml-20 lg:max-w-[25rem] xl:max-w-[26rem]">
            <div className="relative w-full overflow-hidden rounded-3xl shadow-[0_24px_60px_-20px_rgba(15,118,110,0.2)] ring-1 ring-stone-200/60">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src={MAIN_IMAGE}
                  alt=""
                  className="h-full w-full object-cover object-[center_45%] sm:object-[center_42%]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-950/20 via-transparent to-amber-50/10 sm:from-black/20"
                  aria-hidden
                />
              </div>
            </div>
            {/* HERO_INSET: -translate-x-* moves only the secondary image left (primary unchanged). */}
            <div
              className="absolute -bottom-4 left-0 z-10 w-[78%] max-w-[19rem] -translate-x-7 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18)] sm:-bottom-6 sm:max-w-[22rem] sm:border-[5px] sm:-translate-x-7 lg:left-0 lg:w-[68%] lg:max-w-[24rem] lg:-translate-x-8"
            >
              <div className="aspect-[1/1] w-full">
                <img src={INSET_IMAGE} alt="" className="h-full w-full object-cover object-center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
