import Link from "next/link";
import { User } from "lucide-react";
import { useRouter } from "next/router";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";
import HeaderHeart from "../HeaderHeart";
import { CATEGORY_NAV_ITEMS } from "./categoryNavConfig";

const homeNavIconSrc = CATEGORY_NAV_ITEMS.find((item) => item.key === "home")?.iconSrc;

/** Main tab row: 80dp with icon + label (accessibility). */
const NAV_ROW_CLASS = "mx-auto flex h-20 min-h-[80px] max-w-lg items-center justify-around px-1";

const NAV_ITEM_CLASS =
  "flex h-20 min-h-[80px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold leading-none transition";

function navItemState(isActive) {
  return isActive ? "text-[#0F766E]" : "text-slate-600 hover:text-[#115E59]";
}

function NavItem({ href, label, children, onClick, isActive = false }) {
  const cls = `${NAV_ITEM_CLASS} ${navItemState(isActive)}`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} aria-label={label}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={label} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
}

/** Open icon slot — 24×24dp visual area, no enclosing circle. */
function NavIconSlot({ children }) {
  return <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">{children}</span>;
}

function WishlistNavIcon({ count, active }) {
  return (
    <NavIconSlot>
      <HeaderHeart active={active} className="h-5 w-5" />
      {count > 0 ? (
        <span
          className={`absolute -right-2 -top-2 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 font-bold leading-none text-white ring-2 ring-white ${
            count > 9 ? "max-w-[20px] text-[8px]" : "max-w-[16px] text-[10px]"
          }`}
          aria-hidden
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </NavIconSlot>
  );
}

function ProfileNavIcon({ customer }) {
  const initial = (customer?.name || "").trim().charAt(0);
  if (initial) {
    return (
      <NavIconSlot>
        <span className="text-[0.8125rem] font-bold uppercase leading-none tracking-tight">{initial}</span>
      </NavIconSlot>
    );
  }
  return (
    <NavIconSlot>
      <User className="h-5 w-5" strokeWidth={2} aria-hidden />
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
      className="fixed bottom-0 left-0 right-0 z-[58] border-t border-stone-200/90 bg-white pb-[max(4px,env(safe-area-inset-bottom))] shadow-[0_-2px_16px_-6px_rgba(15,23,42,0.1)] backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className={NAV_ROW_CLASS}>
        <NavItem href="/" label="Home" isActive={homeActive}>
          <NavIconSlot>
            <span
              aria-hidden
              className="h-5 w-5 shrink-0 select-none bg-current"
              style={{
                WebkitMaskImage: `url(${homeNavIconSrc})`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
                maskImage: `url(${homeNavIconSrc})`,
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
              }}
            />
          </NavIconSlot>
          <span>Home</span>
        </NavItem>

        <NavItem href="/wishlist" label="Wishlist" isActive={wishActive}>
          <WishlistNavIcon count={wishlistCount} active={wishlistCount > 0} />
          <span>Wishlist</span>
        </NavItem>

        {checked && customer ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <ProfileNavIcon customer={customer} />
            <span>Profile</span>
          </NavItem>
        ) : checked && legacyLogin ? (
          <NavItem href="/account" label="Account" isActive={pathname === "/account"}>
            <NavIconSlot>
              <User className="h-5 w-5" strokeWidth={2} aria-hidden />
            </NavIconSlot>
            <span>Account</span>
          </NavItem>
        ) : checked ? (
          <NavItem label="Log in" onClick={() => openLoginModal()} isActive={false}>
            <NavIconSlot>
              <User className="h-5 w-5" strokeWidth={2} aria-hidden />
            </NavIconSlot>
            <span>Login</span>
          </NavItem>
        ) : (
          <div className={`${NAV_ITEM_CLASS} opacity-40 ${navItemState(false)}`}>
            <NavIconSlot>
              <User className="h-5 w-5" strokeWidth={2} aria-hidden />
            </NavIconSlot>
            <span>…</span>
          </div>
        )}
      </div>

      <div className="flex justify-center border-t border-stone-100/90 px-2 py-1">
        <Link
          href="/vendor/login"
          className="py-0.5 text-[10px] font-medium leading-tight text-slate-500 underline-offset-2 hover:text-[#0F766E] hover:underline"
        >
          Vendor login
        </Link>
      </div>
    </nav>
  );
}
