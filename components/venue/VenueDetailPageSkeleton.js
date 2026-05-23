/**
 * Shimmer layout shown instantly while /venue/[id] SSR page loads.
 */
export default function VenueDetailPageSkeleton() {
  return (
    <div className="w-full animate-pulse bg-white" aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="pb-[clamp(6rem,16vw,8.5rem)]">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 sm:aspect-[2.2/1] sm:min-h-[320px]" />
        </div>
        <div className="relative -mt-24 px-3 sm:-mt-28 sm:px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200/90 bg-white p-5 shadow-lg sm:p-8">
            <div className="h-3 w-24 rounded-full bg-stone-200" />
            <div className="mt-3 h-8 w-4/5 max-w-md rounded-lg bg-stone-200" />
            <div className="mt-6 flex gap-3">
              <div className="h-16 flex-1 rounded-xl bg-stone-100" />
              <div className="h-16 flex-1 rounded-xl bg-stone-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="h-10 w-72 max-w-full rounded-lg bg-stone-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-4 w-11/12 rounded bg-stone-100" />
          <div className="h-4 w-4/5 rounded bg-stone-100" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-stone-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
