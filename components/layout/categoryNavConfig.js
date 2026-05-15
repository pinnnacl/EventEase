import homeIcon from "../../assets/Home.svg";
import venuesIcon from "../../assets/venues.svg";
import photographyIcon from "../../assets/photography.svg";
import makeupIcon from "../../assets/makeup.svg";

export const CATEGORY_NAV_ITEMS = [
  { key: "home", label: "Home", href: "/", iconSrc: homeIcon.src },
  { key: "venues", label: "Venues", href: "/venues", iconSrc: venuesIcon.src },
  { key: "photography", label: "Photography", href: "/photography", iconSrc: photographyIcon.src },
  { key: "makeup", label: "Makeup", href: "/makeup", iconSrc: makeupIcon.src },
];

/** Mobile header: Venues, Photography, Makeup (Home lives in bottom nav). */
export const MOBILE_HEADER_NAV_ITEMS = CATEGORY_NAV_ITEMS.filter((i) => i.key !== "home");

/**
 * @param {string} pathname
 * @param {string} [href]
 */
export function isCategoryActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
