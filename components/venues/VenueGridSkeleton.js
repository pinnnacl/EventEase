/** Pulse placeholders matching venue listing card layout */
export default function VenueGridSkeleton({ count = 8 }) {
  return (
    <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white">
          <div className="h-[220px] w-full bg-[#F3F3F3] sm:h-[230px]" />
          <div className="space-y-2.5 px-4 py-4">
            <div className="flex justify-between gap-4">
              <div className="h-4 flex-1 rounded bg-[#F3F3F3]" />
              <div className="h-4 w-20 rounded bg-[#F3F3F3]" />
            </div>
            <div className="h-3 w-3/5 rounded bg-[#F3F3F3]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
