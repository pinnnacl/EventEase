import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVenueHeroTransition } from "../../context/VenueHeroTransitionContext";
import ResponsiveVendorImage from "../images/ResponsiveVendorImage";

const MAX_DOTS = 5;
const SWIPE_SUPPRESS_PX = 10;
const SCROLL_SETTLE_MS = 180;
const CLICK_SUPPRESS_MS = 450;

/**
 * @typedef {{ src: string, responsive?: { thumb: string, medium: string, large: string } | null }} CarouselSlide
 */

/**
 * @param {number} total
 * @param {number} active
 * @returns {{ slideIndex: number, variant: "active" | "normal" | "small" }[]}
 */
function buildDotWindow(total, active) {
  if (total <= 1) return [];
  if (total <= MAX_DOTS) {
    return Array.from({ length: total }, (_, i) => ({
      slideIndex: i,
      variant: /** @type {"active" | "normal" | "small"} */ (i === active ? "active" : "normal"),
    }));
  }
  const start = Math.max(0, Math.min(active - 2, total - MAX_DOTS));
  return Array.from({ length: MAX_DOTS }, (_, i) => {
    const slideIndex = start + i;
    const dist = Math.abs(slideIndex - active);
    let variant = "normal";
    if (slideIndex === active) variant = "active";
    else if (dist >= 2) variant = "small";
    return { slideIndex, variant };
  });
}

/**
 * @param {{
 *   slides: CarouselSlide[];
 *   onNavigate: () => void;
 *   onIntent?: () => void;
 *   imageSizes?: string;
 *   alt?: string;
 *   unavailableOnSelectedDate?: boolean;
 *   href?: string;
 * }} props
 */
export default function VenueListingImageCarousel({
  slides,
  onNavigate,
  onIntent,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px",
  alt = "",
  unavailableOnSelectedDate = false,
  href = "",
}) {
  const router = useRouter();
  const { beginVenueHeroTransition } = useVenueHeroTransition();
  const scrollRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const slideRefs = useRef(/** @type {(HTMLDivElement | null)[]} */ ([]));
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const gestureRef = useRef({ startX: 0, startY: 0, didSwipe: false });
  const suppressClickRef = useRef(false);
  const scrollRafRef = useRef(/** @type {number | null} */ (null));
  const scrollSettleRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const suppressTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  const [activeIndex, setActiveIndex] = useState(0);
  const [loadIndices, setLoadIndices] = useState(() => new Set([0]));
  const [recentlyScrolled, setRecentlyScrolled] = useState(false);

  const multi = slides.length > 1;

  const suppressNavigationClick = useCallback(() => {
    suppressClickRef.current = true;
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => {
      suppressClickRef.current = false;
    }, CLICK_SUPPRESS_MS);
  }, []);

  const expandLazyLoad = useCallback(
    (centerIndex) => {
      setLoadIndices((prev) => {
        const next = new Set(prev);
        next.add(centerIndex);
        if (centerIndex > 0) next.add(centerIndex - 1);
        if (centerIndex < slides.length - 1) next.add(centerIndex + 1);
        if (slides.length > 1) next.add(1);
        return next;
      });
    },
    [slides.length],
  );

  const syncActiveIndexFromScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root || !multi) return;
    const w = root.clientWidth;
    if (w <= 0) return;
    const raw = root.scrollLeft / w;
    const idx = Math.max(0, Math.min(slides.length - 1, Math.round(raw)));
    setActiveIndex((prev) => {
      if (prev !== idx) expandLazyLoad(idx);
      return idx;
    });
  }, [expandLazyLoad, multi, slides.length]);

  const scrollToIndex = useCallback(
    (index) => {
      const el = slideRefs.current[index];
      if (!el) return;
      expandLazyLoad(index);
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setActiveIndex(index);
    },
    [expandLazyLoad],
  );

  const goPrev = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      suppressNavigationClick();
      const next = activeIndex <= 0 ? slides.length - 1 : activeIndex - 1;
      scrollToIndex(next);
    },
    [activeIndex, scrollToIndex, slides.length, suppressNavigationClick],
  );

  const goNext = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      suppressNavigationClick();
      const next = activeIndex >= slides.length - 1 ? 0 : activeIndex + 1;
      scrollToIndex(next);
    },
    [activeIndex, scrollToIndex, slides.length, suppressNavigationClick],
  );

  const navigateToVenue = useCallback(() => {
    const slide = slideRefs.current[activeIndex];
    const img = slide?.querySelector("img");
    if (beginVenueHeroTransition && img && href) {
      const started = beginVenueHeroTransition(router, href, img);
      if (started) return;
    }
    onNavigate();
  }, [activeIndex, beginVenueHeroTransition, href, onNavigate, router]);

  /** IntersectionObserver — backup + lazy-load neighbour slides while scrolling */
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !multi) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (!best?.target) return;
        const idx = Number(/** @type {HTMLElement} */ (best.target).dataset.index);
        if (!Number.isFinite(idx)) return;
        setActiveIndex(idx);
        expandLazyLoad(idx);
      },
      { root, threshold: [0.35, 0.5, 0.65, 0.85] },
    );

    slideRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [expandLazyLoad, multi, slides.length]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) expandLazyLoad(0);
      },
      { rootMargin: "120px" },
    );
    viewportObserver.observe(root);

    return () => viewportObserver.disconnect();
  }, [expandLazyLoad]);

  /** Scroll listener — reactive pill during finger drag (rAF-throttled) */
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !multi) return undefined;

    const onScroll = () => {
      if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        syncActiveIndexFromScroll();
      });

      setRecentlyScrolled(true);
      suppressNavigationClick();

      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
      scrollSettleRef.current = setTimeout(() => {
        setRecentlyScrolled(false);
        syncActiveIndexFromScroll();
      }, SCROLL_SETTLE_MS);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    };
  }, [multi, suppressNavigationClick, syncActiveIndexFromScroll]);

  /** Passive touch tracking — detect horizontal swipes for click suppression only (no preventDefault) */
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !multi) return undefined;

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      gestureRef.current = { startX: t.clientX, startY: t.clientY, didSwipe: false };
    }

    function onTouchEnd(e) {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = Math.abs(t.clientX - gestureRef.current.startX);
      const dy = Math.abs(t.clientY - gestureRef.current.startY);
      if (dx > SWIPE_SUPPRESS_PX && dx > dy * 1.1) {
        gestureRef.current.didSwipe = true;
        suppressNavigationClick();
      }
    }

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    root.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [multi, suppressNavigationClick]);

  /** Desktop only: mouse drag to scroll (native touch scroll on mobile) */
  function onPointerDown(e) {
    if (e.button !== 0) return;
    gestureRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      didSwipe: false,
    };

    if (!multi || e.pointerType !== "mouse") return;

    const root = scrollRef.current;
    if (!root) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: root.scrollLeft,
    };
    expandLazyLoad(activeIndex);
    root.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current.active || e.pointerType !== "mouse") return;
    const root = scrollRef.current;
    if (!root) return;

    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > SWIPE_SUPPRESS_PX) {
      gestureRef.current.didSwipe = true;
      suppressNavigationClick();
    }
    root.scrollLeft = dragRef.current.scrollLeft - dx;
  }

  function onPointerUp(e) {
    if (dragRef.current.active) {
      const root = scrollRef.current;
      if (root?.hasPointerCapture(e.pointerId)) {
        root.releasePointerCapture(e.pointerId);
      }
      dragRef.current.active = false;
      syncActiveIndexFromScroll();
    }

    const dx = Math.abs(e.clientX - gestureRef.current.startX);
    const dy = Math.abs(e.clientY - gestureRef.current.startY);
    if (gestureRef.current.didSwipe || (dx > SWIPE_SUPPRESS_PX && dx > dy * 1.1)) {
      suppressNavigationClick();
    }
  }

  function onCarouselClick(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target.closest("[data-carousel-control]")) return;

    if (suppressClickRef.current || recentlyScrolled || gestureRef.current.didSwipe) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const dx = Math.abs(e.clientX - gestureRef.current.startX);
    const dy = Math.abs(e.clientY - gestureRef.current.startY);
    if (dx > SWIPE_SUPPRESS_PX && dx > dy * 1.1) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    navigateToVenue();
  }

  const dots = buildDotWindow(slides.length, activeIndex);

  return (
    <div
      className="relative isolate h-full min-h-0 w-full"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToVenue();
        }
      }}
      role={multi ? "group" : "link"}
      aria-label={
        multi ? `${alt || "Venue"} photos, ${activeIndex + 1} of ${slides.length}` : `${alt || "Venue"} photo`
      }
    >
      {/* Scroll track only — rounded clip lives on parent IMAGE_FRAME (overflow-hidden) */}
      <div
        ref={scrollRef}
        className={`venue-card-carousel flex h-full min-h-0 w-full ${
          multi ? "cursor-grab snap-x snap-mandatory active:cursor-grabbing" : "cursor-pointer"
        } overflow-x-auto overflow-y-hidden overscroll-x-contain`}
        onClick={onCarouselClick}
        onMouseEnter={onIntent}
        onTouchStart={onIntent}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {slides.map((slide, i) => (
          <div
            key={`${slide.src}-${i}`}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-index={i}
            className="venue-card-carousel-slide relative h-full min-w-full w-full max-w-full shrink-0 grow-0 basis-full snap-start snap-always"
          >
            {loadIndices.has(i) ? (
              <ResponsiveVendorImage
                responsive={slide.responsive}
                src={slide.src}
                alt={i === 0 ? alt : ""}
                className="block h-full w-full object-cover object-center"
                sizes={imageSizes}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                draggable={false}
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-stone-100" aria-hidden />
            )}
          </div>
        ))}
      </div>

      {unavailableOnSelectedDate ? (
        <span className="pointer-events-none absolute bottom-3 left-3 z-[3] rounded-lg bg-amber-950/90 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-wide text-white shadow-sm">
          Booked on your date
        </span>
      ) : null}

      {multi ? (
        <>
          <button
            type="button"
            data-carousel-control
            aria-label="Previous photo"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-[4] hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#222222] opacity-0 shadow-md ring-1 ring-black/5 transition duration-200 ease-out hover:bg-white hover:scale-105 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/25 lg:flex lg:group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            data-carousel-control
            aria-label="Next photo"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-[4] hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#222222] opacity-0 shadow-md ring-1 ring-black/5 transition duration-200 ease-out hover:bg-white hover:scale-105 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/25 lg:flex lg:group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[3] flex justify-center gap-1 px-3">
            {dots.map(({ slideIndex, variant }) => (
              <button
                key={slideIndex}
                type="button"
                data-carousel-control
                aria-label={`Go to photo ${slideIndex + 1}`}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  suppressNavigationClick();
                  scrollToIndex(slideIndex);
                }}
                className={`pointer-events-auto rounded-full bg-white transition-[width,opacity,transform] duration-150 ease-out will-change-[width,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 ${
                  variant === "active"
                    ? "h-1.5 w-4 opacity-100"
                    : variant === "small"
                      ? "h-1 w-1 opacity-40"
                      : "h-1.5 w-1.5 opacity-55"
                }`}
              />
            ))}
          </div>

          <div className="sr-only" aria-live="polite">
            Image {activeIndex + 1} of {slides.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
