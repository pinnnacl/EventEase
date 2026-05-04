import { useCallback, useEffect, useState } from "react";
import { useHomeAiSearch } from "../../context/HomeAiSearchContext";

const SCROLL_HIDE_AFTER = 56;

/**
 * Compact AI bar for mobile home header; hides when user scrolls down.
 */
export default function MobileHeaderAiSearch() {
  const ctx = useHomeAiSearch();
  const [scrolledDown, setScrolledDown] = useState(false);

  const onScroll = useCallback(() => {
    setScrolledDown(typeof window !== "undefined" && window.scrollY > SCROLL_HIDE_AFTER);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  if (!ctx) return null;

  const { aiPrompt, setAiPrompt, runAiSearch, aiLoading, aiInputRef } = ctx;

  return (
    <div
      className={`overflow-hidden border-t border-stone-200/40 bg-stone-50/90 transition-[max-height,opacity,padding] duration-300 ease-out ${
        scrolledDown ? "pointer-events-none max-h-0 border-t-transparent py-0 opacity-0" : "max-h-[5.5rem] py-2 opacity-100"
      }`}
      aria-hidden={scrolledDown ? "true" : "false"}
    >
      <div className="px-container-fluid">
        <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-[#D8E4E7] bg-white/95 px-2.5 py-1 shadow-sm">
          <input
            ref={aiInputRef}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runAiSearch();
              }
            }}
            placeholder="Ask AI to plan your wedding…"
            className="min-h-[44px] min-w-0 flex-1 border-0 bg-transparent py-2 pl-1 text-[0.8125rem] font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0"
            aria-label="AI wedding search"
          />
          <button
            type="button"
            onClick={() => void runAiSearch()}
            disabled={aiLoading}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full bg-[#0F766E] px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          >
            <span>{aiLoading ? "…" : "Curate"}</span>
            <span aria-hidden>⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
}
