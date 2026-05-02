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
 * @param {{ reviews: { id: string; author: string; rating: number; text: string; date?: string }[] }} props
 */
export default function ReviewList({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-600">No reviews yet</p>
        <p className="mt-1 text-xs text-slate-500">Reviews will appear here after couples share feedback.</p>
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
