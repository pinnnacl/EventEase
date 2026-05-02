"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";
import ProfileRequestCallbackBar from "../vendor/ProfileRequestCallbackBar";
import PhotographerPortfolioTile from "./PhotographerPortfolioTile";
import {
  buildPhotographerMarketing,
  displayNameShort,
  PHOTO_PORTFOLIO_FILTERS,
} from "../../lib/photographerProfileContent";

function IconStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconPin({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
    </svg>
  );
}

function IconClock({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCamera({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.558-.646 1.16-.778 1.804-.092.443-.138.89-.138 1.337v6.02c0 1.008.403 1.975 1.118 2.686a3.88 3.88 0 002.748 1.114h8.128c1.008 0 1.975-.403 2.686-1.118a3.88 3.88 0 001.114-2.748V10.37c0-.447-.046-.894-.138-1.337a5.147 5.147 0 00-.778-1.804 2.31 2.31 0 00-1.641-1.055c-.517-.073-1.04-.11-1.563-.11h-1.226a1.884 1.884 0 01-1.648-.948l-.351-.702A1.884 1.884 0 0010.742 3h-2.847a1.884 1.884 0 00-1.648.948l-.351.702a1.884 1.884 0 01-1.648.948H3.19z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function deliverableIcon(type) {
  const c = "h-5 w-5 shrink-0 text-[#0F766E]";
  switch (type) {
    case "clock":
      return <IconClock className={c} />;
    case "photo":
      return <IconCamera className={c} />;
    case "raw":
      return <span className="text-xs font-bold text-[#0F766E]">RAW</span>;
    case "video":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    default:
      return <IconCamera className={c} />;
  }
}

/**
 * @param {{ vendor: object, demo?: boolean }} props — `demo` skips real lead API (sample profile only).
 */
export default function PhotographerProfileView({ vendor, demo = false }) {
  const m = useMemo(() => buildPhotographerMarketing(vendor), [vendor]);
  const [portfolioTab, setPortfolioTab] = useState("ALL");

  const nameShort = displayNameShort(vendor.businessName || "");
  const filteredPortfolio = useMemo(() => {
    if (portfolioTab === "ALL") return m.portfolio;
    return m.portfolio.filter((p) => p.tag === portfolioTab);
  }, [m.portfolio, portfolioTab]);

  const aboutShort = useMemo(() => {
    const lines = m.about.split(/\n+/).slice(0, 1).join(" ");
    return lines.length > 320 ? `${lines.slice(0, 317)}…` : lines;
  }, [m.about]);

  const scrollToPackages = useCallback(() => {
    document.getElementById("photo-packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const heroImg = m.hero || vendor.profileImage;
  const heroUsesProfileResponsive =
    Boolean(vendor.profileImage) && heroImg === vendor.profileImage;

  return (
    <div className="min-h-screen bg-[#f6f7f6] pb-28 text-slate-800 sm:pb-24">
      {demo ? (
        <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950 sm:text-sm">
          Sample profile — preview only. Not a live vendor listing.
        </div>
      ) : null}
      {/* Hero */}
      <section className="relative isolate h-[56vh] w-full overflow-hidden bg-slate-900 sm:h-[60vh] lg:h-[70vh]">
        {heroImg ? (
          <ResponsiveVendorImage
            responsive={heroUsesProfileResponsive ? vendor.profileImageResponsive : null}
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full scale-[1.06] object-cover object-center opacity-95 will-change-transform motion-safe:animate-[heroKenBurns_18s_ease-out_infinite_alternate]"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/42 to-black/16" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_8%,rgba(255,255,255,0.14),transparent_45%)]" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-amber-900/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-amber-500/30">
                <IconStar className="h-3.5 w-3.5 text-amber-300" />
                {m.offerPill}
              </p>
              <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
                {nameShort}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <IconPin className="h-4 w-4 text-amber-400" />
                  {m.locationLine}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconStar className="h-4 w-4 text-amber-400" />
                  {m.rating.score} ({m.rating.count} reviews)
                </span>
                <span className="font-semibold text-amber-200">Starting from {m.startingFromPrice || m.price}</span>
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>
        </div>
      </section>

      {/* Overlap card: about + deliverables */}
      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 rounded-[1.75rem] border border-stone-200/80 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.2)] sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0d4f4a] sm:text-2xl">{m.aboutHeadline}</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{aboutShort}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-slate-700">
                  <IconShield className="h-5 w-5 text-[#0F766E]" />
                  <span>
                    <span className="block font-semibold uppercase tracking-wide text-slate-500">Identity</span>
                    <span className="font-semibold text-slate-900">{m.trust.verified ? "Verified Pro" : "Listed"}</span>
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-slate-700">
                  <IconClock className="h-5 w-5 text-[#0F766E]" />
                  <span>
                    <span className="block font-semibold uppercase tracking-wide text-slate-500">Experience</span>
                    <span className="font-semibold text-slate-900">{m.trust.years}</span>
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-slate-700">
                  <IconCamera className="h-5 w-5 text-[#0F766E]" />
                  <span>
                    <span className="block font-semibold uppercase tracking-wide text-slate-500">Delivered</span>
                    <span className="font-semibold text-slate-900">{m.trust.events}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-6 sm:p-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0d4f4a]">The deliverables</p>
              <ul className="mt-5 space-y-4">
                {m.deliverables.map((d) => (
                  <li key={d.label} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-stone-200/80">
                      {deliverableIcon(d.icon)}
                    </span>
                    <span className="pt-1 leading-snug">{d.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#0d4f4a] sm:text-3xl">The portfolio</h2>
            <p className="mt-1 text-sm text-slate-500">A curated selection of our finest moments.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PHOTO_PORTFOLIO_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPortfolioTab(f)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  portfolioTab === f
                    ? "bg-[#0F766E] text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-4">
          {filteredPortfolio.map((item, i) => (
            <PhotographerPortfolioTile
              key={`${item.src}-${i}`}
              src={item.src}
              aspect={i === 0 ? "4/3" : i % 3 === 1 ? "4/5" : "1/1"}
              className={i === 0 ? "col-span-2 row-span-1 lg:col-span-2" : ""}
            />
          ))}
        </div>
        {filteredPortfolio.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">No images in this category yet.</p>
        ) : null}
      </section>

      {/* Pricing */}
      <section id="photo-packages" className="scroll-mt-24 border-y border-stone-200/80 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-[#0d4f4a] sm:text-3xl">Investment packages</h2>
            <p className="mt-2 text-sm text-slate-500">Choose a collection that suits your celebration.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {m.packages.map((pkg, pi) => (
              <div
                key={`${pkg.name}-${pi}`}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition ${
                  pkg.highlight
                    ? "border-[#0F766E] bg-[#0b3d36] text-white ring-2 ring-[#0F766E]/30 lg:scale-[1.02]"
                    : "border-stone-200 bg-white"
                }`}
              >
                {pkg.badge ? (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
                      pkg.highlight ? "bg-amber-400 text-slate-900" : "bg-brand-100 text-brand-900"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                ) : null}
                <h3 className={`text-lg font-semibold ${pkg.highlight ? "text-amber-100" : "text-[#0d4f4a]"}`}>
                  {pkg.name}
                </h3>
                {pkg.description ? (
                  <p className={`mt-2 text-sm leading-relaxed ${pkg.highlight ? "text-white/85" : "text-slate-600"}`}>
                    {pkg.description}
                  </p>
                ) : null}
                <p className={`mt-3 font-display text-2xl font-bold tabular-nums ${pkg.highlight ? "text-white" : "text-slate-900"}`}>
                  {pkg.price}
                  <span className={`text-base font-normal ${pkg.highlight ? "text-white/80" : "text-slate-500"}`}>
                    {" "}
                    {pkg.per}
                  </span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className={pkg.highlight ? "text-amber-300" : "text-amber-600"}>✓</span>
                      <span className={pkg.highlight ? "text-white/95" : "text-slate-600"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={scrollToPackages}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition ${
                    pkg.highlight
                      ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                      : "bg-[#0F766E] text-white hover:bg-[#0c655e]"
                  }`}
                >
                  Enquire
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#064036] p-6 shadow-xl sm:p-10 lg:flex lg:items-center lg:gap-10 lg:p-12">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">{m.offer.badge}</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-amber-100 sm:text-3xl">{m.offer.title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">{m.offer.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                {m.offer.secondaryCta}
              </span>
              <button
                type="button"
                onClick={scrollToPackages}
                className="inline-flex rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                {m.offer.primaryCta}
              </button>
            </div>
          </div>
          <div className="mt-8 shrink-0 lg:mt-0 lg:w-[220px]">
            <div className="relative aspect-square overflow-hidden rounded-2xl ring-2 ring-white/10">
              <img
                src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[#f0f4f3] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h2 className="font-display text-2xl font-semibold text-[#0d4f4a] sm:text-3xl">Reviews</h2>
            <p className="text-sm text-slate-600">
              Average <strong className="text-slate-900">{m.rating.score}</strong> from {m.rating.count}+ couples
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {m.reviews.map((r) => (
              <blockquote
                key={r.author}
                className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className={`h-4 w-4 ${i < Math.floor(r.rating) ? "opacity-100" : "opacity-25"}`} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{r.text}&rdquo;</p>
                <footer className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{r.author}</span>
                  <span>{r.date}</span>
                </footer>
                {r.verified ? (
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700">Verified booking</p>
                ) : null}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-14 text-center sm:px-6 lg:px-8">
        <Link href="/photography" className="text-sm font-medium text-[#0F766E] underline underline-offset-2 hover:text-[#0c655e]">
          ← Back to photographers
        </Link>
      </div>

      <ProfileRequestCallbackBar
        vendorId={vendor.id}
        vendorName={vendor.businessName || ""}
        category="photographer"
        demo={demo}
        variant="photographer"
      />
    </div>
  );
}
