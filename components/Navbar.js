import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import Button from "./Button";
import HeaderHeart from "./HeaderHeart";

const links = [
  { label: "Venues", href: "/venues" },
  { label: "Services", href: "dropdown" },
  { label: "Featured venues", href: "/#featured-venues" },
  { label: "About Us", href: "/#about" },
];

export default function Navbar() {
  const router = useRouter();
  const { count: wishlistCount } = useWishlist();
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
    }
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events, refreshSession]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setLoggedIn(false);
    await router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="px-container-fluid flex h-16 w-full items-center gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md outline-none ring-brand-500/40 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="EVENTiZO"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
              <path d="M20 50a22 22 0 1 1 24 0" fill="none" stroke="#0B2D74" strokeWidth="6" strokeLinecap="round" />
              <path d="M30 52V24h4v28z" fill="#0B2D74" />
              <path d="M34 52V24h4v28z" fill="#25A9FF" />
              <path d="M32 6l3.2 6.7L42 14l-4.8 5.1L38.2 26 32 22.5 25.8 26l1-6.9L22 14l6.8-1.3z" fill="#F9B233" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-wide text-[#0B2D74]">
            EVENT<span className="font-medium lowercase text-[#0B2D74]">i</span>ZO
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
            {links.map((item) =>
              item.href === "dropdown" ? (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    className="inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    {item.label}
                    <svg
                      className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div
                    role="menu"
                    className="pointer-events-none invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  >
                    <div className="min-w-[13.5rem] rounded-lg border border-stone-200/90 bg-white py-1 shadow-[0_12px_40px_-12px_rgba(20,43,60,0.18)] ring-1 ring-black/[0.04]">
                      <Link
                        href="/photography"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        Photography
                      </Link>
                      <Link
                        href="/makeup"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        Makeup
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  {item.label}
                </Link>
              ),
            )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/wishlist"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved items` : "Wishlist"}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-bold shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-4 ${
              wishlistCount > 0
                ? "border-rose-200 bg-white text-brand-900 ring-1 ring-rose-100/80"
                : "border-brand-400 bg-white text-brand-900 ring-1 ring-brand-100/80"
            }`}
          >
            <span className={wishlistCount > 0 ? "text-rose-500" : "text-brand-600"}>
              <HeaderHeart active={wishlistCount > 0} />
            </span>
            <span className="hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 ? (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold tabular-nums text-white sm:text-[0.7rem]">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          {checked && loggedIn ? (
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-5 py-2 text-xs sm:text-sm"
              onClick={handleLogout}
            >
              Log out
            </Button>
          ) : (
            <Link href="/login" className="inline-flex">
              <Button className="rounded-full px-5 py-2 text-xs sm:text-sm">Login / Sign Up</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
