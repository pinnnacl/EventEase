/** Pulse placeholders matching floating venue listing layout */
export default function VenueGridSkeleton({ count = 8 }) {
  return (
    <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse">
          <div className="aspect-[4/3] w-full rounded-2xl bg-[#F3F3F3]" />
          <div className="flex flex-col gap-2 pt-4">
            <div className="h-4 w-4/5 rounded bg-[#F3F3F3]" />
            <div className="h-3.5 w-3/5 rounded bg-[#F3F3F3]" />
            <div className="h-3.5 w-1/4 rounded bg-[#F3F3F3]" />
            <div className="mt-1 h-4 w-24 rounded bg-[#F3F3F3]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
