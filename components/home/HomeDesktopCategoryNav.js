import Link from "next/link";
import { useRouter } from "next/router";
import { DESKTOP_HOME_CATEGORY_ITEMS, isCategoryActive } from "../layout/categoryNavConfig";

/**
 * Secondary full-width category row for desktop home (below top header).
 *
 * @param {{ isScrolled?: boolean }} props
 */
export default function HomeDesktopCategoryNav({ isScrolled = false }) {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <nav className="bg-white lg:border-none" aria-label="Event categories">
      <ul
        className={`mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 py-3.5 transition-all duration-300 ease-in-out will-change-[padding,gap] xl:gap-12 lg:py-4 ${
          isScrolled ? "lg:gap-6 lg:py-2 xl:gap-8" : "lg:gap-10"
        }`}
      >
        {DESKTOP_HOME_CATEGORY_ITEMS.map((item) => {
          const { key, label, href, iconSrc, Icon } = item;
          const active = isCategoryActive(pathname, href);
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                className={`group inline-flex items-center gap-2.5 transition-all duration-300 ease-in-out ${
                  active ? "lg:text-gray-900" : "lg:text-gray-700 lg:hover:text-gray-900"
                } ${isScrolled ? "lg:gap-2" : "lg:gap-3"}`}
              >
                {iconSrc ? (
                  <span
                    aria-hidden
                    className={`relative shrink-0 bg-current transition-all duration-300 ease-in-out size-5 lg:size-6 ${
                      isScrolled ? "lg:size-5" : ""
                    }`}
                    style={{
                      WebkitMaskImage: `url(${iconSrc})`,
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskImage: `url(${iconSrc})`,
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                      maskSize: "contain",
                    }}
                  />
                ) : Icon ? (
                  <Icon
                    className={`size-5 shrink-0 transition-all duration-300 ease-in-out lg:size-6 lg:stroke-[1.5] ${
                      isScrolled ? "lg:size-5" : ""
                    }`}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={`text-sm font-semibold tracking-tight transition-all duration-300 ease-in-out lg:text-sm lg:font-medium lg:text-gray-700 ${
                    isScrolled ? "lg:text-xs" : ""
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
