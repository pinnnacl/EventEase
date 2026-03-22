import { useEffect, useId, useRef } from "react";
import WishlistToggle from "./WishlistToggle";

function ChevronLeft({ className = "h-6 w-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRight({ className = "h-6 w-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

/**
 * Expanded reel: dimmed backdrop, vertical media, optional autoplay video, prev/next.
 *
 * @param {{
 *   items: Array<{
 *     id: string,
 *     name: string,
 *     location: string,
 *     price?: string,
 *     priceReel?: string,
 *     image: string,
 *     reelVideoUrl?: string,
 *   }>,
 *   activeIndex: number,
 *   onClose: () => void,
 *   onSelectIndex: (index: number) => void,
 * }} props
 */
export default function PhotographyReelModal({ items, activeIndex, onClose, onSelectIndex }) {
  const titleId = useId();
  const videoRef = useRef(null);
  const len = items.length;
  const current = len > 0 ? items[Math.min(Math.max(0, activeIndex), len - 1)] : null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && len > 1) {
        e.preventDefault();
        onSelectIndex((activeIndex - 1 + len) % len);
      }
      if (e.key === "ArrowRight" && len > 1) {
        e.preventDefault();
        onSelectIndex((activeIndex + 1) % len);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, len, onClose, onSelectIndex]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !current?.reelVideoUrl) return;
    el.play().catch(() => {});
  }, [current?.id, current?.reelVideoUrl]);

  if (!current) return null;

  const showVideo = Boolean(current.reelVideoUrl);
  const canNav = len > 1;

  function goPrev(e) {
    e.stopPropagation();
    onSelectIndex((activeIndex - 1 + len) % len);
  }

  function goNext(e) {
    e.stopPropagation();
    onSelectIndex((activeIndex + 1) % len);
  }

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Close reel"
        className="animate-ee-reel-modal-backdrop absolute inset-0 bg-black/88 backdrop-blur-md"
        onClick={onClose}
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 z-[220] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 hover:border-white/35 md:right-5 md:top-5 md:h-12 md:w-12"
        aria-label="Close"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 pb-6 pt-14 md:flex-row md:gap-4 md:px-6 md:pb-6 md:pt-6">
        <div
          className="animate-ee-reel-modal-panel pointer-events-auto flex max-h-full min-h-0 w-full max-w-5xl flex-col items-center justify-center gap-4 md:flex-row md:items-center md:gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          {canNav ? (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous reel"
              className="hidden shrink-0 rounded-full border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md transition hover:border-white/35 hover:bg-black/60 md:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <div className="flex min-h-0 w-full flex-col items-center gap-4">
            <div className="relative aspect-[9/16] h-[min(100dvh-8.5rem,820px)] w-auto max-w-[min(100vw-1rem,420px)] min-w-0 overflow-hidden rounded-2xl bg-neutral-950 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/15 md:h-[min(92vh,860px)] md:max-w-[min(420px,28vw)]">
              {showVideo ? (
                <video
                  ref={videoRef}
                  key={current.id}
                  src={current.reelVideoUrl}
                  poster={current.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img src={current.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-45% to-black/75" />

              <div className="absolute right-2 top-2 z-20 md:right-3 md:top-3">
                <WishlistToggle photographyId={current.id} variant="reel" />
              </div>

              <div className="absolute inset-x-0 bottom-0 px-4 pb-6 pt-20 md:px-5 md:pb-8">
                <div className="space-y-1 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  <h2 id={titleId} className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                    {current.name}
                  </h2>
                  <p className="text-sm font-medium text-white/90 md:text-base">{current.location}</p>
                  <p className="pt-1 text-base font-semibold text-amber-100/95 md:text-lg">
                    {current.priceReel ?? current.price}
                  </p>
                </div>
              </div>
            </div>

            {canNav ? (
              <div className="flex gap-8 md:hidden">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous reel"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-md backdrop-blur-md transition active:scale-95"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next reel"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-md backdrop-blur-md transition active:scale-95"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            ) : null}
          </div>

          {canNav ? (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next reel"
              className="hidden shrink-0 rounded-full border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md transition hover:border-white/35 hover:bg-black/60 md:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
