export const CATEGORY_NAV_ITEMS = [
  { key: "home", label: "Home", href: "/", iconSrc: "/nav/home.png" },
  { key: "venues", label: "Venues", href: "/venues", iconSrc: "/nav/venues.png" },
  { key: "photography", label: "Photography", href: "/photography", iconSrc: "/nav/photography.png" },
  { key: "makeup", label: "Makeup", href: "/makeup", iconSrc: "/nav/makeup.png" },
];

/**
 * @param {string} pathname
 * @param {string} [href]
 */
export function isCategoryActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
