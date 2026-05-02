import { useMemo, useState } from "react";
import Link from "next/link";
import { useWishlist } from "../../context/WishlistContext";
import VenueGridSkeleton from "../venues/VenueGridSkeleton";
import { useServiceVendorCatalog } from "../../hooks/useServiceVendorCatalog";
import { useVenueCatalog } from "../../hooks/useVenueCatalog";
import { buildWishlistCategories } from "./buildWishlistCategories";
import WishlistSection from "./WishlistSection";
import WishlistTabs from "./WishlistTabs";

export default function WishlistPage() {
  const { wishlist, toggle, togglePhotography, removeCatering, removeDecoration, count } = useWishlist();
  const { venues: venueCatalog, loading: venueCatalogLoading } = useVenueCatalog();
  const { serviceVendors, loading: serviceCatalogLoading } = useServiceVendorCatalog();

  const categories = useMemo(
    () =>
      buildWishlistCategories({
        wishlist,
        venues: venueCatalog,
        serviceVendors,
        toggle,
        togglePhotography,
        removeCatering,
        removeDecoration,
      }),
    [wishlist, venueCatalog, serviceVendors, toggle, togglePhotography, removeCatering, removeDecoration],
  );

  const [activeKey, setActiveKey] = useState(null);

  const effectiveTabKey = useMemo(() => {
    if (categories.length === 0) return null;
    if (activeKey && categories.some((c) => c.key === activeKey)) return activeKey;
    return categories[0].key;
  }, [categories, activeKey]);

  const activeCategory = categories.find((c) => c.key === effectiveTabKey) ?? null;

  const hasAnything = count > 0;
  const showVenueSkeleton =
    hasAnything && wishlist.venues.length > 0 && venueCatalogLoading && activeCategory?.key === "venues";
  const showServiceSkeleton =
    hasAnything &&
    wishlist.photography.length > 0 &&
    serviceCatalogLoading &&
    activeCategory?.key === "photography";

  return (
    <main className="w-full max-w-none pb-12 sm:pb-16 lg:pb-20">
      <div className="container-default w-full max-w-none py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 max-w-none">
            <p className="text-[0.9375rem] leading-snug text-stone-600 sm:text-base sm:leading-relaxed">
              You have{" "}
              <span className="font-semibold text-brand-900 tabular-nums">{count}</span> curated{" "}
              {count === 1 ? "item" : "items"} saved for your wedding.
            </p>
          </div>
          {hasAnything ? (
            <div className="shrink-0">
              <WishlistTabs tabs={categories} activeKey={effectiveTabKey} onChange={setActiveKey} />
            </div>
          ) : null}
        </div>

        <div className="mt-6 sm:mt-7 lg:mt-8">
          {!hasAnything ? (
            <div className="flex w-full justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-stone-200/90 bg-white px-6 py-10 text-center shadow-[0_8px_32px_-16px_rgba(20,43,60,0.1)] sm:py-12">
                <p className="text-stone-600">No items in your wishlist yet.</p>
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/venues"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Browse venues
                  </Link>
                  <Link
                    href="/photography"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
                  >
                    Browse photography
                  </Link>
                  <Link
                    href="/makeup"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
                  >
                    Browse makeup
                  </Link>
                </div>
              </div>
            </div>
          ) : showVenueSkeleton || showServiceSkeleton ? (
            <VenueGridSkeleton count={4} />
          ) : (
            <WishlistSection category={activeCategory} />
          )}
        </div>
      </div>
    </main>
  );
}
