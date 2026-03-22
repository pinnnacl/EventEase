import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookingFloatingBar from "../BookingFloatingBar";
import { useWishlist } from "../../context/WishlistContext";
import { photographers } from "../../data/photographers";
import { venues } from "../../data/venues";
import {
  buildAvailabilityWhatsAppMessage,
  openWhatsAppWithText,
  readStoredEventDateLabel,
} from "../../lib/wishlistActions";
import { buildWishlistCategories } from "./buildWishlistCategories";
import WishlistSection from "./WishlistSection";
import WishlistTabs from "./WishlistTabs";

export default function WishlistPage() {
  const { wishlist, toggle, togglePhotography, removeCatering, removeDecoration, count } = useWishlist();

  const categories = useMemo(
    () =>
      buildWishlistCategories({
        wishlist,
        venues,
        photographers,
        toggle,
        togglePhotography,
        removeCatering,
        removeDecoration,
      }),
    [wishlist, toggle, togglePhotography, removeCatering, removeDecoration],
  );

  const [activeKey, setActiveKey] = useState(null);

  const effectiveTabKey = useMemo(() => {
    if (categories.length === 0) return null;
    if (activeKey && categories.some((c) => c.key === activeKey)) return activeKey;
    return categories[0].key;
  }, [categories, activeKey]);

  const activeCategory = categories.find((c) => c.key === effectiveTabKey) ?? null;

  const hasAnything = count > 0;

  const venueNames = useMemo(
    () => wishlist.venues.map((id) => venues.find((v) => v.id === id)?.name).filter(Boolean),
    [wishlist.venues],
  );
  const photographyNames = useMemo(
    () =>
      wishlist.photography.map((id) => photographers.find((p) => p.id === id)?.name).filter(Boolean),
    [wishlist.photography],
  );

  const [eventDateLabel, setEventDateLabel] = useState(null);
  useEffect(() => {
    setEventDateLabel(readStoredEventDateLabel());
    function onStorage(e) {
      if (e.key === "eventease_event_date") setEventDateLabel(readStoredEventDateLabel());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const availabilityText = eventDateLabel
    ? `Available for ${eventDateLabel}`
    : "Add your event date for tailored quotes";

  const handleCheckAvailability = useCallback(() => {
    const text = buildAvailabilityWhatsAppMessage({
      venueNames,
      photographyNames,
      catering: wishlist.catering,
      decoration: wishlist.decoration,
      eventDateLabel: readStoredEventDateLabel(),
    });
    openWhatsAppWithText(text);
  }, [venueNames, photographyNames, wishlist.catering, wishlist.decoration]);

  const handleRequestCallback = useCallback(() => {
    window.alert(
      "Thanks for your interest. Our team will reach out shortly.\n\n(This is a demo — connect this to your booking or CRM flow later.)",
    );
  }, []);

  return (
    <main className={`bg-[#faf8f5] ${hasAnything ? "pb-32 sm:pb-36" : ""}`}>
      <div className="border-b border-stone-200/80 bg-[#faf8f5]">
        <div className="container-default py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <div className="min-w-0 max-w-2xl">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-600">Your collection</p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl lg:text-[2.75rem]">
                My Wishlist
              </h1>
              <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
                You have{" "}
                <span className="font-semibold text-brand-900 tabular-nums">{count}</span> curated{" "}
                {count === 1 ? "item" : "items"} saved for your wedding.
              </p>
            </div>
            {hasAnything ? (
              <div className="shrink-0 lg:pt-1">
                <WishlistTabs tabs={categories} activeKey={effectiveTabKey} onChange={setActiveKey} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-default py-8 sm:py-10 lg:py-12">
        {!hasAnything ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-stone-200/90 bg-white px-6 py-14 text-center shadow-[0_8px_32px_-16px_rgba(20,43,60,0.1)]">
            <p className="text-stone-600">No items in your wishlist yet.</p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
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
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl">
            <WishlistSection category={activeCategory} />
          </div>
        )}
      </div>

      {hasAnything ? (
        <BookingFloatingBar
          availabilityText={availabilityText}
          onCheckAvailability={handleCheckAvailability}
          onRequestCallback={handleRequestCallback}
        />
      ) : null}
    </main>
  );
}
