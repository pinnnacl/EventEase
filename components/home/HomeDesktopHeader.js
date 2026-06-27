import Link from "next/link";
import { Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logoSvg from "../../assets/logo.svg";
import HeaderHeart from "../HeaderHeart";
import HomeDesktopCategoryNav from "./HomeDesktopCategoryNav";
import HomeDesktopLocationModal from "./HomeDesktopLocationModal";
import HomeDesktopNavbarSearch from "./HomeDesktopNavbarSearch";
import { readStoredLocationLabel, writeStoredLocationLabel } from "../../lib/siteSearchStorage";

const SCROLL_SHRINK_THRESHOLD = 20;

const signInBtnClass =
  "inline-flex h-[35px] items-center justify-center rounded-[22px] bg-[#F4C430] px-3 py-2.5 text-sm font-semibold text-black transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2";

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
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Kochi, Kerala");
  const searchAnchorRef = useRef(null);

  useEffect(() => {
    setLocationLabel(readStoredLocationLabel());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_SHRINK_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const vendorMenu = checked ? (
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
        className={`${utilityPillBtn} ${customer || legacyLogin ? "rounded-r-full" : "rounded-full"}`}
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
  ) : null;

  return (
    <div
      className={`bg-white transition-all duration-300 ease-in-out will-change-[box-shadow] lg:border-b lg:border-gray-100 ${
        isScrolled ? "lg:shadow-md" : "lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="relative w-full">
        <Link
          href="/"
          className="group absolute left-[max(1rem,calc(var(--ee-container-px)-1.5rem))] top-1/2 z-10 flex -translate-y-1/2 items-center rounded-lg outline-none transition-opacity duration-300 ease-in-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <img
            src={logoSvg.src}
            alt="EVENTiZO"
            className="h-6 w-auto shrink-0"
          />
        </Link>

        <div className="absolute right-[max(1rem,calc(var(--ee-container-px)-1.5rem))] top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
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

          {checked && customer ? (
            <div className="inline-flex items-center rounded-full border border-zinc-900/90 bg-white transition-all duration-300 ease-in-out hover:bg-zinc-50 lg:border-gray-200 lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:hover:shadow-md">
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
              <span className="h-6 w-px shrink-0 bg-zinc-300 lg:bg-gray-200" aria-hidden />
              {vendorMenu}
            </div>
          ) : checked && legacyLogin ? (
            <div className="inline-flex items-center rounded-full border border-zinc-900/90 bg-white transition-all duration-300 ease-in-out hover:bg-zinc-50 lg:border-gray-200 lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:hover:shadow-md">
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
              <span className="h-6 w-px shrink-0 bg-zinc-300 lg:bg-gray-200" aria-hidden />
              {vendorMenu}
            </div>
          ) : checked ? (
            <button type="button" onClick={() => openLoginModal()} className={signInBtnClass}>
              Sign In
            </button>
          ) : null}
        </div>

        <div
          ref={searchAnchorRef}
          data-home-desktop-search-anchor
          className="absolute left-1/2 top-1/2 z-[5] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-6"
        >
          <HomeDesktopNavbarSearch
            isScrolled={isScrolled}
            locationLabel={locationLabel}
            locationOpen={locationOpen}
            onLocationOpen={() => setLocationOpen((open) => !open)}
          />
        </div>

        <div className="relative mx-auto max-w-7xl overflow-visible px-6">
          <div
            className={`py-4 transition-all duration-300 ease-in-out will-change-[padding] lg:py-5 ${
              isScrolled ? "lg:py-2.5" : ""
            }`}
          >
            <div aria-hidden className="pointer-events-none invisible mx-auto flex w-full max-w-2xl items-center gap-3">
              <div className={`min-h-[44px] flex-1 lg:min-h-[48px] ${isScrolled ? "lg:min-h-[40px]" : ""}`} />
              <div className={`min-h-[44px] w-[8.5rem] shrink-0 lg:min-h-[48px] ${isScrolled ? "lg:min-h-[40px]" : ""}`} />
            </div>
          </div>
        </div>

        <HomeDesktopLocationModal
          open={locationOpen}
          onClose={() => setLocationOpen(false)}
          selectedLabel={locationLabel}
          anchorRef={searchAnchorRef}
          onSelect={(label) => {
            setLocationLabel(label);
            writeStoredLocationLabel(label);
          }}
        />
      </div>

      <HomeDesktopCategoryNav isScrolled={isScrolled} />
    </div>
  );
}
