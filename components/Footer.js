import Link from "next/link";

const quickLinks = [
  { label: "Venues", href: "/venues" },
  { label: "Photography", href: "/photography" },
  { label: "Featured venues", href: "/#featured-venues" },
  { label: "About", href: "/#about" },
];

const socialLinks = ["Instagram", "Facebook", "YouTube"];

const TAGLINE =
  "Premium wedding planning support with trusted local venues and service partners.";

function EventizoLogo({ className = "" }) {
  return (
    <p className={`font-sans font-medium ${className}`}>
      eventizo<span className="text-wedding-softgold">.</span>
    </p>
  );
}

function QuickLinksColumn({ variant }) {
  const isLight = variant === "light";
  const headingClass = isLight
    ? "text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"
    : "text-sm font-semibold uppercase tracking-wide text-white/70";
  const linkClass = isLight
    ? "w-fit text-stone-700 transition duration-200 hover:text-brand-700"
    : "transition hover:text-wedding-softgold";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm md:hidden">
        {quickLinks.map((item, index) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span className={isLight ? "text-stone-400" : "text-white/40"} aria-hidden>
                ·
              </span>
            ) : null}
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </span>
        ))}
      </div>

      <div className="hidden md:block">
        <p className={headingClass}>Quick Links</p>
        <div className={`mt-3 flex flex-col gap-2.5 text-sm ${isLight ? "" : "text-white/85"}`}>
          {quickLinks.map((item) => (
            <Link key={item.label} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function FollowUsColumn({ variant }) {
  const isLight = variant === "light";
  const headingClass = isLight
    ? "text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"
    : "text-sm font-semibold uppercase tracking-wide text-white/70";
  const pillClass = isLight
    ? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 shadow-sm transition hover:border-brand-200 hover:text-brand-800 md:min-h-0 md:min-w-0 md:px-3 md:py-1.5"
    : "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/30 px-3 text-sm transition hover:border-wedding-softgold hover:text-wedding-softgold md:min-h-0 md:min-w-0";

  return (
    <>
      <p className={headingClass}>Follow Us</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
        {socialLinks.map((label) => (
          <span key={label} className={pillClass}>
            {label}
          </span>
        ))}
      </div>
    </>
  );
}

function FooterContent({ variant }) {
  const isLight = variant === "light";
  const taglineClass = isLight
    ? "mt-3 max-w-[260px] text-[13px] leading-[1.6] text-stone-500"
    : "mt-3 max-w-[260px] text-[13px] leading-[1.6] text-white/80";
  const copyrightClass = isLight ? "text-xs text-stone-500" : "text-xs text-white/60";
  const logoClass = isLight ? "text-lg text-brand-800 lg:text-[20px]" : "text-lg text-white lg:text-[20px]";

  return (
    <div className="container-default w-full max-w-none">
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="order-1 md:col-start-1 md:row-span-2 lg:row-span-1">
          <EventizoLogo className={logoClass} />
          <p className={taglineClass}>{TAGLINE}</p>
          <p className={`mt-8 hidden lg:block ${copyrightClass}`}>
            © 2026 eventizo. All rights reserved.
          </p>
        </div>

        <div className="order-2 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1">
          <FollowUsColumn variant={variant} />
        </div>

        <div className="order-3 md:col-start-2 md:row-start-1 lg:col-start-2 lg:row-start-1">
          <QuickLinksColumn variant={variant} />
        </div>
      </div>

      <p className={`order-4 mt-8 text-left text-xs lg:hidden ${copyrightClass}`}>
        © 2026 eventizo. All rights reserved.
      </p>
    </div>
  );
}

export default function Footer({ variant = "dark" }) {
  if (variant === "light") {
    return (
      <footer className="w-full border-t border-stone-200 bg-background pt-7 pb-5 text-wedding-ink md:pt-9 md:pb-6 lg:pt-12 lg:pb-8">
        <FooterContent variant="light" />
      </footer>
    );
  }

  return (
    <footer className="w-full bg-brand-900 pt-7 pb-5 text-white md:pt-9 md:pb-6 lg:pt-12 lg:pb-8">
      <FooterContent variant="dark" />
    </footer>
  );
}
