import Link from "next/link";
import { HOME_DESKTOP_FEATURE_CARDS } from "./homeDesktopFeatureConfig";

/**
 * Desktop home feature grid — 4 columns, premium category capsules (`hidden lg:block` scope).
 */
export default function HomeDesktopFeatureGrid() {
  return (
    <section className="hidden w-full bg-white lg:block" aria-label="Trending wedding categories">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
          {HOME_DESKTOP_FEATURE_CARDS.map(({ key, title, subtext, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-5 py-4 transition-all duration-200 hover:cursor-pointer hover:border-gray-200 hover:shadow-md lg:rounded-2xl"
            >
              <div className="min-w-0 pr-4 text-left">
                <p className="text-sm font-semibold tracking-tight text-gray-800">{title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{subtext}</p>
              </div>
              <Icon className="size-5 shrink-0 text-gray-400 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
