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
                className={`group relative inline-flex items-center gap-2 pb-0.5 transition-colors duration-200 ease-in-out ${
                  active ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {iconSrc ? (
                  <span
                    aria-hidden
                    className="relative size-5 shrink-0 bg-current transition-colors duration-200 ease-in-out"
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
                    className="size-5 shrink-0 transition-colors duration-200 ease-in-out lg:stroke-[1.5]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : null}
                <span className="text-sm font-medium tracking-tight transition-colors duration-200 ease-in-out lg:text-base">
                  {label}
                </span>
                <span
                  className={`pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-neutral-900 transition-transform duration-200 ease-in-out group-hover:scale-x-100 ${
                    active ? "scale-x-100" : ""
                  }`}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
