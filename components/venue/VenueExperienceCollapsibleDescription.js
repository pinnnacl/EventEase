import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Mobile-only collapsible venue description (`md:hidden` parent).
 *
 * @param {{ text: string }} props
 */
export default function VenueExperienceCollapsibleDescription({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-full" : "max-h-[140px]"
        }`}
      >
        <p className="whitespace-pre-line text-base leading-[1.75] text-stone-600">{text}</p>
        {!isExpanded ? (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="mt-3 flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-teal-700 transition-colors hover:text-teal-800"
      >
        {isExpanded ? (
          <>
            SHOW LESS
            <ChevronUp className="size-3.5" strokeWidth={2.5} aria-hidden />
          </>
        ) : (
          <>
            SHOW MORE
            <ChevronDown className="size-3.5" strokeWidth={2.5} aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}
