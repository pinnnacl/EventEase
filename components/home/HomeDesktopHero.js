import Link from "next/link";
import { ArrowRight, Calendar, Check, TrendingUp } from "lucide-react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const glassCard =
  "rounded-[1.25rem] border border-white/40 bg-white/40 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md";

/** @type {{ id: string; bars: [string, string] }} */
const VENDOR_ROWS = [
  { id: "v1", bars: ["w-full", "w-[72%]"] },
  { id: "v2", bars: ["w-[88%]", "w-[58%]"] },
];

/**
 * Desktop home hero — premium banner matching design reference (`hidden lg:block`).
 */
export default function HomeDesktopHero() {
  return (
    <section
      className={`hidden w-full bg-surface lg:block ${manrope.className}`}
      aria-label="Hero"
      data-home-desktop-hero
    >
      <div className="mx-auto w-full max-w-[1521px]">
        <div className="relative mx-auto h-[516px] w-full max-w-[1521px] overflow-hidden bg-gradient-to-br from-surface via-surface-muted to-surface lg:w-[1521px]">
          {/* Subtle neural flow — low opacity to preserve surface tone */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-muted to-surface" />
            <div className="absolute -left-[8%] top-[12%] size-[52%] animate-neural-drift-a rounded-full bg-primary/20 opacity-25 blur-[88px]" />
            <div className="absolute right-[2%] bottom-[8%] size-[42%] animate-neural-drift-b rounded-full bg-violet-200/40 opacity-20 blur-[96px]" />
            <div className="absolute left-[56%] top-1/2 size-[26rem] -translate-y-1/2 animate-neural-drift-a rounded-full bg-surface-muted opacity-30 blur-[80px] [animation-duration:20s]" />
            <div className="absolute left-[64%] top-[38%] size-[18rem] animate-neural-drift-b rounded-full bg-primary/15 opacity-20 blur-[72px] [animation-delay:3s]" />
          </div>

          <div className="relative z-10 flex h-full">
            {/* Left — marketing */}
            <div className="flex w-[46%] shrink-0 flex-col justify-center pl-14 pr-8 xl:pl-20">
              <h1 className="max-w-[34rem] text-[2.75rem] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#000000] xl:text-[3.25rem]">
                Plan Your{" "}
                <span className="text-primary">Perfect Event</span>, Down to the Last Detail.
              </h1>
              <p className="mt-6 max-w-[29rem] text-[1.05rem] leading-[1.65] text-neutral-500">
                Discover top venues, elite photographers, and master caterers. Elevate your celebration
                with our signature planning tools and curated vendor network.
              </p>
              <div className="mt-9 flex items-center gap-4">
                <Link
                  href="/venues"
                  className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-[0.9375rem] font-bold text-black shadow-[0_10px_28px_-10px_rgba(255,221,0,0.75)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                >
                  Start Planning
                  <ArrowRight className="size-[1.125rem]" strokeWidth={2.5} aria-hidden />
                </Link>
                <Link
                  href="/venues"
                  className="inline-flex items-center rounded-full border border-black bg-white px-7 py-3.5 text-[0.9375rem] font-semibold text-black transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                >
                  View Venues
                </Link>
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="relative min-w-0 flex-1">
              {/* Card A — Exclusive Offers (top-right) */}
              <div
                className={`absolute right-6 top-10 w-[15.75rem] animate-float-slow ${glassCard} px-5 py-4 xl:right-10`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.8125rem] font-medium text-neutral-500">Exclusive Offers</p>
                  <TrendingUp className="size-[1.125rem] shrink-0 text-[#C9A227]" strokeWidth={2} aria-hidden />
                </div>
                <p className="mt-1.5 text-[1.75rem] font-extrabold leading-tight tracking-tight text-black">
                  Save up to 40%
                </p>
                <div className="mt-4 rounded-xl bg-[#F3EDE3] px-4 py-3">
                  <p className="text-[0.8125rem] font-semibold text-[#B8941F]">Premium Package Deals</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Unbeatable Vendor Pricing</p>
                </div>
              </div>

              {/* Card B — Vendor Matching (center, largest) */}
              <div
                className={`absolute left-4 top-[34%] w-[19.5rem] animate-float-medium ${glassCard} px-5 py-5 xl:left-10 xl:w-[21rem]`}
              >
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Vendor Matching
                </p>
                <ul className="mt-4 space-y-4">
                  {VENDOR_ROWS.map(({ id, bars }, index) => (
                    <li key={id} className="flex items-center gap-3">
                      <span
                        className="inline-flex size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80"
                        aria-hidden
                      >
                        <span
                          className={`block size-full bg-gradient-to-br ${
                            index === 0
                              ? "from-[#D4C4B0] via-[#B8A088] to-[#8B7355]"
                              : "from-[#C5CCD6] via-[#9AA5B5] to-[#6B7789]"
                          }`}
                        />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className={`h-2 rounded-full bg-neutral-200/90 ${bars[0]}`} />
                        <span className={`h-2 rounded-full bg-neutral-200/70 ${bars[1]}`} />
                      </div>
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
                        <Check className="size-3.5 text-black" strokeWidth={3} aria-hidden />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card C — Timeline (bottom-right) */}
              <div
                className={`absolute bottom-10 right-16 w-[13.5rem] animate-float-fast ${glassCard} px-5 py-4 xl:right-24`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-[1.125rem] text-[#C9A227]" strokeWidth={2} aria-hidden />
                  <p className="text-[0.9375rem] font-bold text-neutral-900">Timeline</p>
                </div>
                <div className="mt-4 flex gap-3.5">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                    <span className="my-1 h-7 w-px bg-neutral-300/80" />
                    <span className="size-2 shrink-0 rounded-full bg-neutral-300" />
                    <span className="my-1 h-6 w-px bg-neutral-200" />
                    <span className="size-2 shrink-0 rounded-full bg-neutral-200" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-[1.125rem] pt-0.5">
                    <span className="h-2 w-full rounded-full bg-neutral-200/90" />
                    <span className="h-2 w-[78%] rounded-full bg-neutral-200/75" />
                    <span className="h-2 w-[52%] rounded-full bg-neutral-200/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
