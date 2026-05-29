/**
 * FILE 1 — Venue profile loading skeletons (new file).
 * Pure Tailwind animate-pulse placeholders; no props, no extra dependencies.
 */

/** CREATE: full-page venue profile skeleton for ISR fallback / initial paint */
export default function VenueSkeleton() {
  return (
    <div className="w-full animate-pulse bg-white dark:bg-gray-900" aria-hidden>
      {/* CREATE: hero image placeholder — h-[400px] w-full rounded-none */}
      <div className="h-[400px] w-full rounded-none bg-gray-200 dark:bg-gray-700" />

      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* CREATE: title bar — h-8 w-2/3 mt-6 */}
        <div className="mt-6 h-8 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700" />
        {/* CREATE: subtitle bar — h-4 w-1/3 mt-2 */}
        <div className="mt-2 h-4 w-1/3 rounded-md bg-gray-200 dark:bg-gray-700" />

        {/* CREATE: amenities grid — 3 columns, 6 placeholder boxes h-10 */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>

        {/* CREATE: reviews section — 3 rows (avatar circle + two text bars each) */}
        <div className="mt-12 space-y-6">
          <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-gray-700" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-5/6 rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** CREATE: named export — gallery block skeleton (h-[300px] + row of 4 tiles) */
export function GallerySkeleton() {
  return (
    <div className="w-full animate-pulse" aria-hidden>
      {/* CREATE: main gallery area — h-[300px] w-full */}
      <div className="h-[300px] w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
      {/* CREATE: row of 4 equal placeholder tiles */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

/** CREATE: named export — calendar block skeleton (h-[320px] centered box) */
export function CalendarSkeleton() {
  return (
    <div className="flex w-full animate-pulse justify-center" aria-hidden>
      {/* CREATE: calendar placeholder — h-[320px] w-full centered box */}
      <div className="h-[320px] w-full max-w-md rounded-xl bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
