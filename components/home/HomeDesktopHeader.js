import Link from "next/link";
import { Menu, User } from "lucide-react";
import { useEffect, useState } from "react";
import logoSvg from "../../assets/logo.svg";
import HeaderHeart from "../HeaderHeart";
import HomeDesktopCategoryNav from "./HomeDesktopCategoryNav";
import HomeDesktopNavbarSearch from "./HomeDesktopNavbarSearch";

const SCROLL_SHRINK_THRESHOLD = 20;

const utilityPillBtn =
  "inline-flex h-10 items-center justify-center border-0 bg-transparent px-3 text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2";

/**
 * Desktop home header — logo | search+filter | utility icons, then category row.
 */
export default function HomeDesktopHeader({
  wishlistCount,
  checked,
  customer,
  legacyLogin,
  accountMenuOpen,
  setAccountMenuOpen,
  vendorMenuOpen,
  setVendorMenuOpen,
  accountMenuRef,
  vendorMenuRef,
  openLoginModal,
  handleLogout,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_SHRINK_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`bg-white transition-all duration-300 ease-in-out will-change-[box-shadow] lg:border-b lg:border-gray-100 ${
        isScrolled ? "lg:shadow-md" : "lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div
        className={`mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-6 py-4 transition-all duration-300 ease-in-out will-change-[padding] lg:py-5 ${
          isScrolled ? "lg:py-2.5" : ""
        }`}
      >
        <Link
          href="/"
          className="group flex min-w-0 items-center rounded-lg outline-none transition-all duration-300 ease-in-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <img
            src={logoSvg.src}
            alt="EVENTiZO"
            className={`h-7 w-auto shrink-0 transition-all duration-300 ease-in-out lg:h-8 ${isScrolled ? "lg:h-6" : ""}`}
          />
        </Link>

        <HomeDesktopNavbarSearch isScrolled={isScrolled} />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/wishlist"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved items` : "Wishlist"}
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-zinc-900/90 text-zinc-900 transition-all duration-300 ease-in-out hover:bg-zinc-50 lg:border-gray-200 lg:text-gray-700 lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:hover:shadow-md"
          >
            <HeaderHeart active={wishlistCount > 0} className="size-5" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white lg:bg-[#0F766E]">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          <div className="inline-flex items-center rounded-full border border-zinc-900/90 bg-white transition-all duration-300 ease-in-out hover:bg-zinc-50 lg:border-gray-200 lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:hover:shadow-md">
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
                  className={`${utilityPillBtn} rounded-l-full`}
                >
                  {(customer.name || "").trim() ? (
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      {(customer.name || "").trim().charAt(0)}
                    </span>
                  ) : (
                    <User className="size-5 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
                  )}
                </button>
                <div
                  role="menu"
                  aria-label="Account"
                  className={`absolute right-0 z-[75] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition duration-200 ${
                    accountMenuOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                  }`}
                >
                  <Link
                    href="/account"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block w-full rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
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
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
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
                  className={`${utilityPillBtn} rounded-l-full`}
                >
                  <User className="size-5 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
                </button>
                <div
                  role="menu"
                  aria-label="Account"
                  className={`absolute right-0 z-[75] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition duration-200 ${
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
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : checked ? (
              <button
                type="button"
                aria-label="Login"
                onClick={() => {
                  setVendorMenuOpen(false);
                  openLoginModal();
                }}
                className={`${utilityPillBtn} rounded-l-full`}
              >
                <User className="size-5 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
              </button>
            ) : null}

            {checked ? <span className="h-6 w-px shrink-0 bg-zinc-300 lg:bg-gray-200" aria-hidden /> : null}

            <div ref={vendorMenuRef} className="relative">
              <button
                type="button"
                aria-label={vendorMenuOpen ? "Close menu" : "Open menu"}
                aria-haspopup="menu"
                aria-expanded={vendorMenuOpen}
                onClick={() => {
                  setVendorMenuOpen((v) => !v);
                  setAccountMenuOpen(false);
                }}
                className={`${utilityPillBtn} ${checked ? "rounded-r-full" : "rounded-full"}`}
              >
                <Menu className="size-5 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
              </button>
              <div
                role="menu"
                aria-label="Menu"
                className={`absolute right-0 z-[70] mt-2 w-[min(14rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition duration-200 ${
                  vendorMenuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                }`}
              >
                <Link
                  href="/vendor/login"
                  role="menuitem"
                  onClick={() => setVendorMenuOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                >
                  Vendor Login
                </Link>
                <Link
                  href="/vendor/signup"
                  role="menuitem"
                  onClick={() => setVendorMenuOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
                >
                  Help / Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeDesktopCategoryNav isScrolled={isScrolled} />
    </div>
  );
}
