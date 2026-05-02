"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Manrope, Noto_Serif } from "next/font/google";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  Check,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Sparkles,
  Star,
  User,
  Users,
  Wind,
} from "lucide-react";
import { buildMakeupMarketing } from "../../lib/makeupProfileContent";
import ProfileRequestCallbackBar from "../vendor/ProfileRequestCallbackBar";

import "swiper/css";
import "swiper/css/pagination";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-makeup-body",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-makeup-display",
  weight: ["400", "600", "700"],
  display: "swap",
});

const iconMap = { Heart, User, Users, Wind };

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function BeforeAfter({ before, after }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-3xl">
      <p className="font-makeup-serif text-center text-sm font-semibold uppercase tracking-[0.2em] text-velvet-rose">
        Before &amp; After
      </p>
      <p className="mt-1 text-center text-sm text-stone-600">
        Same session — refined skin texture and a camera-ready finish.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {[
          { src: before, label: "Before" },
          { src: after, label: "After" },
        ].map((side) => (
          <div
            key={side.label}
            className="relative overflow-hidden rounded-[1.25rem] bg-stone-200 shadow-[0_12px_40px_-20px_rgba(60,30,35,0.35)] ring-1 ring-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={side.src} alt="" className="aspect-[3/4] w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {side.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * @param {{ vendor: object, demo?: boolean, showPendingPreviewBanner?: boolean }} props
 */
export default function MakeupProfileView({ vendor, demo = false, showPendingPreviewBanner = false }) {
  const m = useMemo(() => buildMakeupMarketing(vendor), [vendor]);
  const [activeService, setActiveService] = useState(m.services[0]?.id || "bridal");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeBlurb = m.serviceBlurbs[activeService] || "";

  const ActiveServiceIcon = useMemo(() => {
    const row = m.services.find((s) => s.id === activeService);
    return row ? iconMap[row.icon] || Sparkles : Sparkles;
  }, [activeService, m.services]);

  return (
    <div
      className={`${manrope.variable} ${notoSerif.variable} font-makeup-sans min-h-screen bg-velvet-ivory pb-28 text-velvet-ink antialiased sm:pb-24`}
    >
      {showPendingPreviewBanner ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-950">
          Preview — not yet visible to the public
        </div>
      ) : null}
      {demo ? (
        <div className="border-b border-velvet-gold/20 bg-velvet-gold/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-velvet-rose">
          Sample profile — content for demonstration only
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-velvet-gold/15 bg-velvet-ivory/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="font-makeup-serif text-lg font-semibold tracking-tight text-velvet-rose sm:text-xl">
            THAALI
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
            <a href="#portfolio" className="transition hover:text-velvet-rose">
              Portfolio
            </a>
            <a href="#packages" className="transition hover:text-velvet-rose">
              Packages
            </a>
            <a href="#reviews" className="transition hover:text-velvet-rose">
              Reviews
            </a>
            <a href="#studio" className="transition hover:text-velvet-rose">
              Studio
            </a>
          </nav>
          <button
            type="button"
            className="rounded-xl p-2 text-stone-600 sm:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-stone-200/80 bg-velvet-ivory/95 px-4 py-3 sm:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <a href="#portfolio" className="py-1 text-stone-700" onClick={() => setMenuOpen(false)}>
                Portfolio
              </a>
              <a href="#packages" className="py-1 text-stone-700" onClick={() => setMenuOpen(false)}>
                Packages
              </a>
              <a href="#reviews" className="py-1 text-stone-700" onClick={() => setMenuOpen(false)}>
                Reviews
              </a>
              <a href="#studio" className="py-1 text-stone-700" onClick={() => setMenuOpen(false)}>
                Studio
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <section id="portfolio" className="px-4 pt-6 sm:px-6 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-6xl"
          >
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-velvet-gold">{m.eyebrow}</p>
            <h1 className="font-makeup-serif mt-2 text-center text-3xl font-semibold leading-tight text-velvet-rose sm:text-4xl md:text-5xl">
              {m.artist}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-stone-600 sm:text-base">{m.specialty}</p>
          </motion.div>

          <div className="mx-auto mt-8 max-w-6xl md:hidden">
            <Swiper modules={[Pagination]} spaceBetween={12} slidesPerView={1.15} centeredSlides pagination={{ clickable: true }} className="!pb-10">
              {m.portfolio.map((item, i) => (
                <SwiperSlide key={i}>
                  <div className="overflow-hidden rounded-[1.5rem] shadow-[0_20px_50px_-24px_rgba(80,40,45,0.45)] ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.alt} className="aspect-[4/5] w-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mx-auto mt-8 hidden max-w-6xl columns-2 gap-4 sm:columns-3 md:block">
            {m.portfolio.map((item, i) => (
              <motion.figure
                key={i}
                {...fadeUp}
                className="mb-4 break-inside-avoid overflow-hidden rounded-[1.5rem] shadow-[0_16px_44px_-22px_rgba(60,35,40,0.38)] ring-1 ring-black/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`w-full object-cover ${item.span === "tall" ? "min-h-[280px] sm:min-h-[340px]" : "aspect-[4/5]"}`}
                />
              </motion.figure>
            ))}
          </div>

          {m.showBeforeAfter ? (
            <div className="mx-auto mt-10 max-w-6xl">
              <BeforeAfter before={m.beforeAfter.before} after={m.beforeAfter.after} />
            </div>
          ) : null}
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <motion.div
            {...fadeUp}
            className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_20px_60px_-30px_rgba(140,75,85,0.25)] backdrop-blur-md sm:p-10"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-makeup-serif text-2xl font-semibold text-velvet-rose sm:text-3xl">{m.bioTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{m.bio}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-2xl bg-velvet-rose/10 px-4 py-2.5 text-velvet-rose ring-1 ring-velvet-rose/20">
                  <Star className="h-5 w-5 fill-velvet-gold text-velvet-gold" aria-hidden />
                  <span className="text-lg font-bold tabular-nums">{m.rating}</span>
                  <span className="text-sm text-stone-600">({m.review_count} reviews)</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-2xl bg-stone-100/80 px-3 py-3 ring-1 ring-stone-200/80">
                    <p className="text-xs uppercase tracking-wide text-stone-500">Experience</p>
                    <p className="mt-1 font-semibold text-velvet-ink">{m.stats.experience}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-100/80 px-3 py-3 ring-1 ring-stone-200/80">
                    <p className="text-xs uppercase tracking-wide text-stone-500">Weddings</p>
                    <p className="mt-1 font-semibold text-velvet-ink">{m.stats.weddings}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-100/80 px-3 py-3 ring-1 ring-stone-200/80">
                    <p className="text-xs uppercase tracking-wide text-stone-500">Based in</p>
                    <p className="mt-1 font-semibold text-velvet-ink">{m.stats.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {m.showUrgency ? (
          <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
            <motion.div
              {...fadeUp}
              className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-gradient-to-r from-velvet-rose via-[#a85d66] to-velvet-rose px-5 py-4 text-white shadow-lg sm:flex-row sm:items-center sm:px-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/90">{m.urgency.line}</p>
                <p className="mt-1 text-sm text-white/85">{m.urgency.sub}</p>
              </div>
              <a
                href="#packages"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
              >
                View packages
                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>
          </section>
        ) : null}

        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-makeup-serif text-center text-2xl font-semibold text-velvet-rose sm:text-3xl">Expertise</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-stone-600">
              Tap a focus — we tailor products and timing to your celebration.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {m.services.map((s) => {
                const Icon = iconMap[s.icon] || Sparkles;
                const active = activeService === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveService(s.id)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-velvet-gold bg-white text-velvet-rose shadow-md ring-2 ring-velvet-gold/40"
                        : "border-stone-200/90 bg-white/70 text-stone-600 backdrop-blur-sm hover:border-velvet-gold/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-velvet-gold" : "text-stone-400"}`} aria-hidden />
                    {s.label}
                  </button>
                );
              })}
            </div>
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto mt-8 max-w-2xl rounded-[1.5rem] border border-stone-200/80 bg-white/70 p-6 text-center backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-3">
                <ActiveServiceIcon className="h-8 w-8 shrink-0 text-velvet-gold" aria-hidden />
                <p className="text-sm leading-relaxed text-stone-700">{activeBlurb}</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="packages" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-makeup-serif text-center text-2xl font-semibold text-velvet-rose sm:text-3xl">Signature packages</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-stone-600">Transparent tiers — upgrade or add trials anytime.</p>
          </motion.div>
          <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {m.packages.map((pkg) => (
              <motion.article
                key={pkg.name}
                {...fadeUp}
                className="w-[min(100%,320px)] shrink-0 snap-center rounded-[1.75rem] border border-stone-200/80 bg-white/80 p-6 shadow-[0_16px_40px_-28px_rgba(80,45,50,0.35)] backdrop-blur-md sm:w-auto"
              >
                {pkg.tag ? (
                  <span className="inline-block rounded-full bg-velvet-gold/20 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-velvet-rose">
                    {pkg.tag}
                  </span>
                ) : (
                  <span className="inline-block h-6" aria-hidden />
                )}
                <h3 className="font-makeup-serif mt-3 text-xl font-semibold text-velvet-rose">{pkg.name}</h3>
                <p className="mt-2 text-2xl font-bold tabular-nums text-velvet-ink">{pkg.price}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-stone-700">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-velvet-gold" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-velvet-rose via-[#9e5560] to-[#4a2830] px-6 py-10 text-center text-white shadow-2xl sm:px-12 sm:py-14"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-velvet-gold/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <Sparkles className="mx-auto h-10 w-10 text-velvet-gold" aria-hidden />
            <h2 className="font-makeup-serif mt-4 text-2xl font-semibold sm:text-3xl">{m.aiWidget.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/90">{m.aiWidget.body}</p>
            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-velvet-rose shadow-lg transition hover:bg-velvet-ivory"
            >
              {m.aiWidget.cta}
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </section>

        <section id="reviews" className="mx-auto mt-16 max-w-6xl px-4 pb-8 sm:px-6">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-makeup-serif text-2xl font-semibold text-velvet-rose sm:text-3xl">Client love</h2>
            <p className="mt-2 text-sm text-stone-600">Real celebrations — names on file.</p>
          </motion.div>
          {m.testimonials.length ? (
            <div className="mt-8">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 5200, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1.1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 24 },
                }}
                className="client-love-swiper !pb-12"
              >
                {m.testimonials.map((t) => (
                  <SwiperSlide key={t.name}>
                    <blockquote className="h-full rounded-[1.75rem] border border-stone-200/80 bg-white/75 p-6 shadow-card backdrop-blur-md">
                      <div className="flex gap-1 text-velvet-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-stone-700">&ldquo;{t.quote}&rdquo;</p>
                      <footer className="mt-4 flex items-center justify-between text-xs text-stone-500">
                        <span className="font-semibold text-velvet-ink">{t.name}</span>
                        <span>{t.date}</span>
                      </footer>
                    </blockquote>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-stone-500">Reviews coming soon.</p>
          )}

          <motion.div {...fadeUp} id="studio" className="mt-14">
            <h2 className="font-makeup-serif text-center text-2xl font-semibold text-velvet-rose sm:text-3xl">{m.studio.title}</h2>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-stone-600">
              <MapPin className="h-4 w-4 text-velvet-gold" aria-hidden />
              {m.studio.address}
            </p>
            <div className="mt-6 overflow-hidden rounded-[1.75rem] ring-1 ring-stone-200/80">
              <iframe
                title="Studio map"
                className="h-[min(52vh,380px)] w-full border-0"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${m.studio.lon - 0.04}%2C${m.studio.lat - 0.03}%2C${m.studio.lon + 0.04}%2C${m.studio.lat + 0.03}&layer=mapnik&marker=${m.studio.lat}%2C${m.studio.lon}`}
              />
            </div>
          </motion.div>
        </section>
      </main>

      <ProfileRequestCallbackBar
        vendorId={vendor.id}
        vendorName={vendor.businessName || ""}
        category="makeup"
        demo={demo}
        variant="makeup"
      />
    </div>
  );
}
