import { Sparkles } from "lucide-react";

function StarRow({ rating }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <div className="flex gap-0.5 text-amber-500" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   reviews: { id: string; author: string; rating: number; text: string; date?: string }[];
 *   venueName?: string;
 *   onInquire?: () => void;
 *   demo?: boolean;
 * }} props
 */
export default function ReviewList({ reviews, venueName = "this venue", onInquire, demo = false }) {
  if (!reviews?.length) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-gradient-to-br from-stone-50 to-white px-6 py-10 text-center sm:px-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
          <Sparkles className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="font-display mt-5 text-xl font-semibold leading-snug text-stone-900">
          Be among the first to host a masterpiece event
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          {venueName
            ? `Couples are discovering ${venueName}. Speak with our venue planners to hear what makes celebrations here unforgettable.`
            : "Speak with our venue planners to plan your celebration."}
        </p>
        {onInquire ? (
          <button
            type="button"
            disabled={demo}
            onClick={onInquire}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50"
          >
            {demo ? "Preview — inquire unavailable" : "Speak with venue host"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-900">{r.author}</p>
            <div className="flex items-center gap-2">
              <StarRow rating={r.rating} />
              <span className="text-sm font-semibold tabular-nums text-slate-700">{r.rating.toFixed(1)}</span>
            </div>
          </div>
          {r.date ? <p className="mt-0.5 text-xs text-slate-500">{r.date}</p> : null}
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}
