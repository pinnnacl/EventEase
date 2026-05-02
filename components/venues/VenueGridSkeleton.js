/** Pulse placeholders matching venue grid layout */
export default function VenueGridSkeleton({ count = 8 }) {
  return (
    <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-xl border border-stone-200/60 bg-white">
          <div className="aspect-[5/3] w-full bg-stone-200" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-3 w-2/3 rounded bg-stone-100" />
            <div className="mt-2 h-5 w-24 rounded bg-stone-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
