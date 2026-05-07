import Link from "next/link";
import { User } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";
import HeaderHeart from "../HeaderHeart";
import AiSearchExperience from "./AiSearchExperience";
import MobileBottomNav from "./MobileBottomNav";
import MobileHeaderAiSearch from "./MobileHeaderAiSearch";
import { CATEGORY_NAV_ITEMS, MOBILE_HEADER_NAV_ITEMS, isCategoryActive } from "./categoryNavConfig";

/** Inline EVENTiZO logo mark + wordmark */
function LogoEventizo({ className = "h-10 w-auto shrink-0 text-[#0B2D74]" }) {
  return (
    <svg className={className} viewBox="0 0 360 64" fill="none" aria-hidden>
      <path d="M34 54a22 22 0 1 1 24 0" fill="none" stroke="#0B2D74" strokeWidth="6" strokeLinecap="round" />
      <path d="M44 54V26h4v28z" fill="#0B2D74" />
      <path d="M48 54V26h4v28z" fill="#25A9FF" />
      <path
        d="M46 8l3.2 6.7L56 16l-4.8 5.1L52.2 28 46 24.5 39.8 28l1-6.9L36 16l6.8-1.3z"
        fill="#F9B233"
      />
      <text
        x="84"
        y="46"
        fill="#0B2D74"
        fontSize="42"
        fontWeight="800"
        letterSpacing="1"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
      >
        EVENT
      </text>
      <text
        x="232"
        y="46"
        fill="#0B2D74"
        fontSize="42"
        fontWeight="500"
        letterSpacing="0.5"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
      >
        iZO
      </text>
    </svg>
  );
}

export default function AppLayout({ children }) {
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();
  const { loading, loggedIn, legacyLogin, customer, refreshSession, openLoginModal } = useCustomerAuth();
  const checked = !loading;
  const [headerEl, setHeaderEl] = useState(null);
  const [vendorMenuOpen, setVendorMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const vendorMenuRef = useRef(null);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function onRoute() {
      void refreshSession();
    }
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events, refreshSession]);

  useEffect(() => {
    if (!vendorMenuOpen && !accountMenuOpen) return;

    function onKeyDown(e) {
      if (e.key === "Escape") {
        setVendorMenuOpen(false);
        setAccountMenuOpen(false);
      }
    }

    function onPointerDown(e) {
      const vEl = vendorMenuRef.current;
      if (vEl && !vEl.contains(e.target)) setVendorMenuOpen(false);
      const aEl = accountMenuRef.current;
      if (aEl && !aEl.contains(e.target)) setAccountMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [vendorMenuOpen, accountMenuOpen]);

  useEffect(() => {
    function closeOnRouteStart() {
      setVendorMenuOpen(false);
      setAccountMenuOpen(false);
    }
    router.events.on("routeChangeStart", closeOnRouteStart);
    return () => router.events.off("routeChangeStart", closeOnRouteStart);
  }, [router.events]);

  const pathname = router.pathname;
  const isHome = pathname === "/";
  const isVendorRoute = pathname.startsWith("/vendor");
  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isVenueDetailRoute = pathname.startsWith("/venue");
  const isPhotographyDetailRoute = pathname === "/photography/demo" || pathname === "/photography/[id]";

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    setAccountMenuOpen(false);
    await refreshSession();
    await router.push("/");
  }

  function MenuIcon({ className = "h-5 w-5" }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    );
  }

  const navList = (
    <ul className="flex min-w-max justify-start gap-3.5 px-1 sm:min-w-0 sm:w-full sm:justify-center sm:gap-5 sm:px-0">
      {CATEGORY_NAV_ITEMS.map(({ key, label, href, iconSrc }) => {
        const active = isCategoryActive(pathname, href);
        return (
          <li key={key} className="shrink-0">
            <Link
              href={href}
              className={`group relative flex flex-col items-center justify-center gap-0 rounded-lg px-1.5 py-1 text-slate-600 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2 ${
                active ? "text-[#0F766E]" : ""
              }`}
            >
              <span className="relative grid place-items-center">
                <img
                  src={iconSrc}
                  alt=""
                  draggable="false"
                  loading="lazy"
                  className="relative h-[3.125rem] w-[3.125rem] select-none object-contain opacity-100 [filter:none] sm:h-[3.375rem] sm:w-[3.375rem]"
                />
              </span>
              <span className="-mt-1 text-center text-[0.625rem] font-semibold leading-tight tracking-tight sm:text-[0.6875rem]">
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

  const mobileHeaderNavList = (
    <ul className="flex min-w-max items-stretch justify-center gap-4 px-2 text-center">
      {MOBILE_HEADER_NAV_ITEMS.map(({ key, label, href, iconSrc }) => {
        const active = isCategoryActive(pathname, href);
        return (
          <li key={key} className="shrink-0">
            <Link
              href={href}
              className={`group relative flex min-h-[52px] min-w-[68px] flex-col items-center justify-center gap-0 rounded-xl px-2.5 py-0.5 text-slate-600 transition duration-200 ease-in-out hover:bg-stone-100/90 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2 ${
                active ? "text-[#0F766E]" : ""
              }`}
            >
              <span className="relative grid place-items-center">
                <img
                  src={iconSrc}
                  alt=""
                  draggable="false"
                  loading="lazy"
                  className="relative h-[3.375rem] w-[3.375rem] select-none object-contain opacity-100 [filter:none]"
                />
              </span>
              <span className="-mt-1 max-w-[5.25rem] text-center text-[0.65rem] font-semibold leading-tight tracking-tight">
                {label}
              </span>
              <span
                className={`pointer-events-none absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-600 transition duration-200 ease-in-out ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
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
      <header
        ref={setHeaderEl}
        className="sticky top-0 z-[60] isolate w-full max-w-none p-0 m-0"
      >
        <div className="w-full max-w-none border-b border-stone-200/50 bg-background">
          {/* Mobile & small tablet: nav + optional AI (home); no logo, wishlist, account, vendor menu */}
          <div className="lg:hidden">
            <div className="px-container-fluid pt-1.5 pb-1">
              <nav
                className="flex justify-center overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Services"
              >
                {mobileHeaderNavList}
              </nav>
            </div>
            {isHome ? <MobileHeaderAiSearch /> : null}
          </div>

          {/* Desktop (lg+): unchanged — logo, full nav, wishlist, account, vendor menu */}
          <div className="hidden lg:block">
            <div className="relative flex items-center gap-2.5 px-container-fluid pt-2 pb-1 sm:pt-2.5 sm:pb-1.5">
              <Link
                href="/"
                className="group flex min-w-0 items-center rounded-lg outline-none ring-brand-500/30 transition duration-200 hover:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <LogoEventizo className="h-10 w-auto shrink-0 text-[#0B2D74] transition-opacity duration-200 group-hover:opacity-90 sm:h-11" />
              </Link>

              <div className="flex min-w-0 flex-1 justify-center">
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
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-[#115E59] shadow-sm ring-1 ring-stone-200/60 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                >
                  <HeaderHeart active={wishlistCount > 0} className="h-5 w-5" />
                  {wishlistCount > 0 ? (
                    <span className="absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[0.65rem] font-bold tabular-nums leading-none text-white ring-2 ring-white">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  ) : null}
                </Link>

                {checked && customer ? (
                  <div ref={accountMenuRef} className="relative">
                    <button
                      type="button"
                      aria-label="Account menu"
                      aria-haspopup="menu"
                      aria-expanded={accountMenuOpen}
                      onClick={() => {
                        setAccountMenuOpen((o) => !o);
                        setVendorMenuOpen(false);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0F766E] to-[#0a5c56] text-sm font-bold uppercase text-white shadow-md ring-2 ring-white/90 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                    >
                      {(customer.name || "").trim() ? (
                        (customer.name || "").trim().charAt(0)
                      ) : (
                        <User className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                      )}
                    </button>
                    <div
                      role="menu"
                      aria-label="Account"
                      className={`absolute right-0 z-[75] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-stone-200/70 bg-white/95 p-1.5 shadow-[0_14px_44px_-26px_rgba(20,43,60,0.36)] backdrop-blur-md transition duration-200 ${
                        accountMenuOpen
                          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                          : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                      }`}
                    >
                      <Link
                        href="/account"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                      >
                        View Profile
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          void handleLogout();
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : checked && legacyLogin ? (
                  <div ref={accountMenuRef} className="relative">
                    <button
                      type="button"
                      aria-label="Account menu"
                      aria-haspopup="menu"
                      aria-expanded={accountMenuOpen}
                      onClick={() => {
                        setAccountMenuOpen((o) => !o);
                        setVendorMenuOpen(false);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-200/90 text-[#115E59] shadow-sm ring-1 ring-stone-300/70 transition hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                    >
                      <User className="h-5 w-5" aria-hidden />
                    </button>
                    <div
                      role="menu"
                      aria-label="Account"
                      className={`absolute right-0 z-[75] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-stone-200/70 bg-white/95 p-1.5 shadow-[0_14px_44px_-26px_rgba(20,43,60,0.36)] backdrop-blur-md transition duration-200 ${
                        accountMenuOpen
                          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                          : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                      }`}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          void handleLogout();
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : checked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setVendorMenuOpen(false);
                      openLoginModal();
                    }}
                    className="inline-flex rounded-full border border-stone-200/80 bg-white/80 px-3 py-2 text-xs font-bold text-[#115E59] shadow-sm transition hover:bg-white sm:px-3.5"
                  >
                    Login
                  </button>
                ) : null}

                <div ref={vendorMenuRef} className="relative">
                  <button
                    type="button"
                    aria-label={vendorMenuOpen ? "Close vendor menu" : "Open vendor menu"}
                    aria-haspopup="menu"
                    aria-expanded={vendorMenuOpen}
                    onClick={() => {
                      setVendorMenuOpen((v) => !v);
                      setAccountMenuOpen(false);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-[#115E59] shadow-sm ring-1 ring-stone-200/60 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                  >
                    <MenuIcon />
                  </button>

                  <div
                    role="menu"
                    aria-label="Vendor menu"
                    className={`absolute right-0 z-[70] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-stone-200/70 bg-white/95 p-1.5 shadow-[0_14px_44px_-26px_rgba(20,43,60,0.36)] backdrop-blur-md transition duration-200 ${
                      vendorMenuOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                    }`}
                  >
                    <Link
                      href="/vendor/login"
                      role="menuitem"
                      onClick={() => setVendorMenuOpen(false)}
                      className="block w-full rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                    >
                      Vendor Login
                    </Link>
                    <Link
                      href="/vendor/signup"
                      role="menuitem"
                      onClick={() => setVendorMenuOpen(false)}
                      className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:ring-offset-2"
                    >
                      Help / Learn more
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isVendorRoute || isAuthRoute || isAdminRoute || isVenueDetailRoute || isPhotographyDetailRoute ? null : (
        <AiSearchExperience headerEl={headerEl} />
      )}

      <div
        className={`flex min-w-0 w-full flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0 ${
          isHome ? "pt-0 sm:pt-3 lg:pt-16" : ""
        }`}
      >
        {children}
      </div>

      <MobileBottomNav />
    </div>
  );
}
