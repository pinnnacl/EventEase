import Link from "next/link";
import { Home, User } from "lucide-react";
import { useRouter } from "next/router";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";
import HeaderHeart from "../HeaderHeart";

function NavItem({ href, label, children, onClick, isActive = false }) {
  const cls = `flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-0.5 text-[0.6rem] font-semibold leading-none transition ${
    isActive ? "text-[#0F766E]" : "text-slate-600 hover:text-[#115E59]"
  }`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} aria-label={label}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={label}>
      {children}
    </Link>
  );
}

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const { count: wishlistCount } = useWishlist();
  const { loading, loggedIn, legacyLogin, customer, openLoginModal } = useCustomerAuth();
  const checked = !loading;

  const homeActive = pathname === "/";
  const wishActive = pathname === "/wishlist";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[58] border-t border-stone-200/90 bg-white pb-[max(2px,env(safe-area-inset-bottom))] pt-1 shadow-[0_-2px_16px_-6px_rgba(15,23,42,0.1)] backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5">
        <NavItem href="/" label="Home" isActive={homeActive}>
          <Home className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
          <span>Home</span>
        </NavItem>

        <NavItem href="/wishlist" label="Wishlist" isActive={wishActive}>
          <span className="relative inline-flex h-9 w-9 items-center justify-center">
            <HeaderHeart active={wishlistCount > 0} className="h-5 w-5" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-0.5 text-[0.55rem] font-bold tabular-nums leading-none text-white ring-1 ring-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </span>
          <span>Wishlist</span>
        </NavItem>

        {checked && customer ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0F766E] to-[#0a5c56] text-xs font-bold uppercase text-white shadow ring-1 ring-white/90">
              {(customer.name || "").trim() ? (customer.name || "").trim().charAt(0) : <User className="h-4 w-4" strokeWidth={2.25} aria-hidden />}
            </span>
            <span>Profile</span>
          </NavItem>
        ) : checked && legacyLogin ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200/90 text-[#115E59] shadow ring-1 ring-stone-300/70">
              <User className="h-4 w-4" aria-hidden />
            </span>
            <span>Account</span>
          </NavItem>
        ) : checked ? (
          <NavItem label="Log in" onClick={() => openLoginModal()} isActive={false}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-[#115E59] shadow-sm">
              <User className="h-4 w-4" aria-hidden />
            </span>
            <span>Login</span>
          </NavItem>
        ) : (
          <div className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 opacity-40">
            <User className="h-5 w-5" aria-hidden />
            <span className="text-[0.6rem] font-semibold leading-none">…</span>
          </div>
        )}
      </div>
      <div className="flex justify-center border-t border-stone-100/90 px-2 pt-0.5">
        <Link
          href="/vendor/login"
          className="py-0.5 text-[0.58rem] font-medium leading-tight text-slate-500 underline-offset-2 hover:text-[#0F766E] hover:underline"
        >
          Vendor login
        </Link>
      </div>
    </nav>
  );
}
