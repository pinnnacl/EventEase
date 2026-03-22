import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import Button from "../Button";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "VENUES", href: "/venues" },
  { label: "PLANNING TOOLS", href: "/#how-it-works" },
];

/** Same entries as Navbar → Services (venues / inner pages). */
const serviceMenuItems = [
  { label: "Photography", href: "/photography" },
  { label: "Catering (Food)", href: "/#packages" },
];

function HamburgerIcon({ open, className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      )}
    </svg>
  );
}

export default function MarketingHeader() {
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json().catch(() => ({}));
      setLoggedIn(Boolean(data.loggedIn));
    } catch {
      setLoggedIn(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function onRoute() {
      refreshSession();
      setMobileOpen(false);
    }
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events, refreshSession]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setLoggedIn(false);
    await router.push("/");
  }

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    if (href.startsWith("/#")) return false;
    return router.pathname === href || router.asPath.split("?")[0] === href;
  }

  const wishlistActive = router.pathname === "/wishlist";
  const servicesActive = router.pathname === "/photography";

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-shadow duration-300">
      <div className="container-default">
        <div className="flex h-[4.25rem] items-center justify-between gap-4 lg:h-[4.5rem]">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:min-w-[12rem] lg:flex-none">
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-brand-700 transition hover:bg-stone-100 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="marketing-mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
            <Link
              href="/"
              className="font-display min-w-0 text-lg font-semibold tracking-tight text-brand-700 transition hover:text-brand-800 sm:text-xl"
            >
              EventEase Kerala
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-10 lg:flex" aria-label="Primary">
            {navItems.slice(0, 2).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative py-1 text-xs font-semibold tracking-[0.12em] transition duration-200 ${
                    active ? "text-brand-700" : "text-stone-600 hover:text-brand-700"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-600" aria-hidden />
                  ) : (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-600/50 transition duration-200 group-hover:scale-x-100" aria-hidden />
                  )}
                </Link>
              );
            })}
            <div className="group/services relative py-1">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded="false"
                className={`text-xs font-semibold tracking-[0.12em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                  servicesActive ? "text-brand-700" : "text-stone-600 hover:text-brand-700"
                }`}
              >
                SERVICES
              </button>
              {servicesActive ? (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-600" aria-hidden />
              ) : (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-600/50 transition duration-200 group-hover/services:scale-x-100" aria-hidden />
              )}
              <div
                role="menu"
                className="pointer-events-none invisible absolute left-1/2 top-full z-[60] mt-2 w-max min-w-[13.5rem] -translate-x-1/2 pt-0.5 opacity-0 transition-all duration-200 ease-out group-hover/services:visible group-hover/services:pointer-events-auto group-hover/services:opacity-100 group-focus-within/services:visible group-focus-within/services:pointer-events-auto group-focus-within/services:opacity-100"
              >
                <div className="rounded-lg border border-stone-200/90 bg-white py-1 shadow-[0_12px_40px_-12px_rgba(20,43,60,0.18)] ring-1 ring-black/[0.04]">
                  {serviceMenuItems.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      role="menuitem"
                      className="block px-4 py-2.5 text-xs font-medium tracking-wide text-stone-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {navItems.slice(2).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative py-1 text-xs font-semibold tracking-[0.12em] transition duration-200 ${
                    active ? "text-brand-700" : "text-stone-600 hover:text-brand-700"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-600" aria-hidden />
                  ) : (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-600/50 transition duration-200 group-hover:scale-x-100" aria-hidden />
                  )}
                </Link>
              );
            })}
            <Link
              href="/wishlist"
              aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved items` : "Wishlist"}
              className={`group relative py-1 text-xs font-semibold tracking-[0.12em] transition duration-200 ${
                wishlistActive ? "text-brand-700" : "text-stone-600 hover:text-brand-700"
              }`}
            >
              WISHLIST
              {wishlistCount > 0 ? (
                <span
                  className="ml-1.5 inline-flex min-h-[1.375rem] min-w-[1.375rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#e5c76b] to-[#b8953c] px-1 text-[0.7rem] font-bold tabular-nums leading-none text-white shadow-sm ring-2 ring-[#f5e6b8]"
                  aria-hidden
                >
                  {wishlistCount}
                </span>
              ) : null}
              {wishlistActive ? (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-600" aria-hidden />
              ) : (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-600/50 transition duration-200 group-hover:scale-x-100" aria-hidden />
              )}
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-2.5 lg:min-w-[12rem] lg:flex-none">
            {checked && loggedIn ? (
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold sm:text-sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            ) : (
              <Link href="/login" className="inline-flex">
                <span className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-5 sm:text-sm">
                  Login / Sign Up
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        id="marketing-mobile-nav"
        className={`fixed inset-0 top-[4.25rem] z-40 bg-white/98 backdrop-blur-md transition duration-300 ease-out lg:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="container-default flex flex-col gap-1 py-6" aria-label="Mobile primary">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.1em] transition ${
                    active ? "bg-brand-50 text-brand-800" : "text-stone-700 hover:bg-stone-50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.href === "/venues" ? (
                  <div className="mb-1 ml-4 border-l-2 border-brand-200/70 pl-3">
                    <p className="px-1 py-2 text-xs font-semibold tracking-[0.14em] text-stone-500">SERVICES</p>
                    {serviceMenuItems.map((s) => {
                      const subActive = router.pathname === "/photography" && s.href === "/photography";
                      return (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`mb-0.5 block rounded-lg px-3 py-2.5 text-sm font-medium tracking-wide transition last:mb-1 ${
                            subActive ? "bg-brand-50 text-brand-800" : "text-stone-700 hover:bg-stone-50"
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          <Link
            href="/wishlist"
            className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.1em] transition ${
              wishlistActive ? "bg-brand-50 text-brand-800" : "text-stone-700 hover:bg-stone-50"
            }`}
            onClick={() => setMobileOpen(false)}
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved items` : "Wishlist"}
          >
            <span>WISHLIST</span>
            {wishlistCount > 0 ? (
              <span className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#e5c76b] to-[#b8953c] px-2 text-sm font-bold tabular-nums leading-none text-white shadow-sm ring-2 ring-[#f5e6b8]">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
