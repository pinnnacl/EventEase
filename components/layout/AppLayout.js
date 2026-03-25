import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import HeaderHeart from "../HeaderHeart";
import AiSearchExperience from "./AiSearchExperience";
import { CATEGORY_NAV_ITEMS, isCategoryActive } from "./categoryNavConfig";

/** Reference palette: deep forest #002B24, cream #E8E4D1 on dark — inverted for white header */
function LogoThali({ className = "h-8 w-8 shrink-0 text-[#002B24]" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="17.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="26.75" cy="13.25" r="2.35" fill="currentColor" stroke="none" />
      <path
        d="M12.25 12.5c1.65-.35 3.35 1.15 4.1 3.35.45 1.35.35 2.85-.35 4.1-1.9-1.45-3.05-4.05-3.75-7.45z"
        fill="currentColor"
      />
      <path
        d="M13.5 18.5c.85 2.35 2.35 4.15 4.25 5.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.25 25.75c4.85-3.85 13.9-3.85 25.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.25 30.25c4.35-2.65 11.15-2.65 21.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AppLayout({ children }) {
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [headerEl, setHeaderEl] = useState(null);

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
    }
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events, refreshSession]);

  const pathname = router.pathname;

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setLoggedIn(false);
    await router.push("/");
  }

  const navList = (
    <ul className="flex min-w-max justify-start gap-3.5 px-1 sm:min-w-0 sm:w-full sm:justify-center sm:gap-5 sm:px-0">
      {CATEGORY_NAV_ITEMS.map(({ key, label, href, iconSrc }) => {
        const active = isCategoryActive(pathname, href);
        return (
          <li key={key} className="shrink-0">
            <Link
              href={href}
              className={`group relative flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-stone-500 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2 ${
                active ? "text-brand-900" : ""
              }`}
            >
              <span className="relative grid place-items-center">
                <img
                  src={iconSrc}
                  alt=""
                  draggable="false"
                  loading="lazy"
                  className={`relative h-7 w-7 select-none object-contain transition duration-200 sm:h-8 sm:w-8 ${
                    active
                      ? "opacity-100 grayscale-0"
                      : "opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                  }`}
                />
              </span>
              <span className="text-center text-[0.625rem] font-semibold leading-tight tracking-tight sm:text-[0.6875rem]">
                {label}
              </span>
              <span className="pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-brand-600 opacity-0 transition duration-200 ease-in-out group-hover:opacity-40" />
              <span
                className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-brand-600 transition duration-200 ease-in-out ${
                  active ? "opacity-100 shadow-[0_0_18px_rgba(11,94,88,0.35)]" : "opacity-0"
                }`}
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex min-h-0 w-full max-w-none flex-1 flex-col bg-background">
      <header ref={setHeaderEl} className="sticky top-0 z-50 w-full max-w-none p-0 m-0">
        {/* Clean sticky header: top bar + centered category nav */}
        <div className="w-full max-w-none border-b border-stone-200/50 bg-background">
          <div className="relative flex items-center gap-2.5 px-container-fluid pt-2 pb-1 sm:pt-2.5 sm:pb-1.5">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2.5 rounded-lg outline-none ring-brand-500/30 transition duration-200 hover:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <LogoThali className="h-7 w-7 shrink-0 transition-colors duration-200 group-hover:text-[#0b5e58] sm:h-8 sm:w-8" />
              <span className="truncate font-sans text-[0.8125rem] font-bold uppercase tracking-[0.18em] text-[#002B24] transition-colors duration-200 group-hover:text-[#0b5e58] sm:text-[0.9rem]">
                THALI
              </span>
            </Link>

            {/* Desktop: nav centered in header row */}
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <nav
                className="overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Services"
              >
                {navList}
              </nav>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/wishlist"
                aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved items` : "Wishlist"}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-brand-700 shadow-sm ring-1 ring-stone-200/60 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
              >
                <HeaderHeart active={wishlistCount > 0} className="h-5 w-5" />
                {wishlistCount > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[0.65rem] font-bold tabular-nums leading-none text-white ring-2 ring-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                ) : null}
              </Link>

              {checked && loggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-stone-200/80 bg-white/70 px-4 py-1.5 text-[0.8125rem] font-semibold text-brand-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-1.5 text-[0.8125rem] font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="px-container-fluid pb-2 sm:pb-2.5">
            <nav
              className="overflow-x-auto overscroll-x-contain pt-0 pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
              aria-label="Services"
            >
              {navList}
            </nav>
          </div>
        </div>
      </header>

      <AiSearchExperience headerEl={headerEl} />

      <div className="w-full min-w-0 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
