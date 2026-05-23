import Link from "next/link";
import { Home, Heart, User } from "lucide-react";
import { useRouter } from "next/router";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";

/** Main tab row: 80dp with icon + label. */
const NAV_ROW_CLASS = "mx-auto flex h-20 min-h-[80px] max-w-lg items-center justify-around px-2";

function NavItem({ href, label, children, onClick, isActive = false }) {
  const color = isActive ? "text-[#0F766E]" : "text-slate-500";
  const cls = `relative flex h-20 min-h-[80px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium leading-none transition-colors duration-200 ${color} hover:text-slate-700`;

  const indicator = isActive ? (
    <span
      className="absolute bottom-2 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-[#0F766E]"
      aria-hidden
    />
  ) : null;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} aria-label={label}>
        {children}
        {indicator}
      </button>
    );
  }

  return (
    <Link href={href} className={cls} aria-label={label} aria-current={isActive ? "page" : undefined}>
      {children}
      {indicator}
    </Link>
  );
}

function NavIconSlot({ children }) {
  return <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">{children}</span>;
}

function WishlistNavIcon({ count, isActive }) {
  const filled = isActive && count > 0;
  return (
    <NavIconSlot>
      <Heart
        className="h-[22px] w-[22px]"
        strokeWidth={1.5}
        fill={filled ? "currentColor" : "none"}
        aria-hidden
      />
      {count > 0 ? (
        <span
          className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#0F766E] ring-2 ring-white"
          aria-label={`${count} saved ${count === 1 ? "venue" : "venues"}`}
        />
      ) : null}
    </NavIconSlot>
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
      className="fixed bottom-0 left-0 right-0 z-[58] isolate border-t border-stone-200/30 bg-white pb-[max(4px,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_-12px_rgba(15,23,42,0.08)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className={NAV_ROW_CLASS}>
        <NavItem href="/" label="Home" isActive={homeActive}>
          <NavIconSlot>
            <Home className="h-[22px] w-[22px]" strokeWidth={1.5} fill={homeActive ? "currentColor" : "none"} aria-hidden />
          </NavIconSlot>
          <span>Home</span>
        </NavItem>

        <NavItem href="/wishlist" label="Wishlist" isActive={wishActive}>
          <WishlistNavIcon count={wishlistCount} isActive={wishActive} />
          <span>Wishlist</span>
        </NavItem>

        {checked && customer ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <NavIconSlot>
              { (customer.name || "").trim() ? (
                <span className="text-[0.75rem] font-semibold uppercase leading-none tracking-tight">
                  {(customer.name || "").trim().charAt(0)}
                </span>
              ) : (
                <User className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
              )}
            </NavIconSlot>
            <span>Profile</span>
          </NavItem>
        ) : checked && legacyLogin ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <NavIconSlot>
              <User className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            </NavIconSlot>
            <span>Account</span>
          </NavItem>
        ) : checked ? (
          <NavItem label="Log in" onClick={() => openLoginModal()} isActive={false}>
            <NavIconSlot>
              <User className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            </NavIconSlot>
            <span>Login</span>
          </NavItem>
        ) : (
          <div className="relative flex h-20 min-h-[80px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium leading-none text-slate-400 opacity-50">
            <NavIconSlot>
              <User className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            </NavIconSlot>
            <span>…</span>
          </div>
        )}
      </div>
    </nav>
  );
}
