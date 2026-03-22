import Link from "next/link";

const quickLinks = [
  { label: "Venues", href: "/venues" },
  { label: "Photography", href: "/photography" },
  { label: "Packages", href: "/#packages" },
  { label: "About", href: "/#about" },
];

export default function Footer({ variant = "dark" }) {
  if (variant === "light") {
    return (
      <footer className="border-t border-stone-200 bg-[#fafaf9] py-14 text-wedding-ink">
        <div className="container-default grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-display text-xl font-semibold text-brand-800">EventEase Kerala</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
              Premium wedding planning support with trusted local venues and service partners.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Quick Links</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="w-fit text-stone-700 transition duration-200 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Follow Us</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Instagram", "Facebook", "YouTube"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm transition hover:border-brand-200 hover:text-brand-800"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="container-default mt-12 border-t border-stone-200/80 pt-8 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} EventEase Kerala. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="bg-brand-900 py-12 text-white">
      <div className="container-default grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-semibold">EventEase Kerala</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
            Premium wedding planning support with trusted local venues and service partners.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/85">
            {quickLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-wedding-softgold">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Follow Us</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-white/30 px-3 py-1">Instagram</span>
            <span className="rounded-full border border-white/30 px-3 py-1">Facebook</span>
            <span className="rounded-full border border-white/30 px-3 py-1">YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
