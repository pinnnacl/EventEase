/**
 * Shimmer layout shown instantly while /venue/[id] SSR page loads.
 */
export default function VenueDetailPageSkeleton() {
  return (
    <div className="w-full animate-pulse bg-white" aria-hidden>
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 lg:left-0 lg:w-full lg:translate-x-0">
        <div className="aspect-[4/3] w-full bg-stone-200 lg:aspect-[2.2/1]" />
      </div>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="h-3 w-20 rounded-full bg-stone-200" />
        <div className="h-9 w-4/5 max-w-sm rounded-lg bg-stone-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-stone-100" />
          ))}
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-4 w-11/12 rounded bg-stone-100" />
          <div className="h-4 w-4/5 rounded bg-stone-100" />
        </div>
        <div className="h-48 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}
