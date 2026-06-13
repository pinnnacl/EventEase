import { Filter, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useHomeAiSearch } from "../../context/HomeAiSearchContext";

/**
 * Desktop home navbar search — rounded input + separate Filter button.
 *
 * @param {{ isScrolled?: boolean }} props
 */
export default function HomeDesktopNavbarSearch({ isScrolled = false }) {
  const homeAi = useHomeAiSearch();
  const value = homeAi?.aiPrompt ?? "";
  const onChange = homeAi?.setAiPrompt ?? (() => {});
  const onSubmit = homeAi?.runAiSearch ?? (() => {});
  const loading = homeAi?.aiLoading ?? false;

  return (
    <div className="flex w-full max-w-2xl items-center justify-center gap-3 transition-all duration-300 ease-in-out">
      <div
        className={`flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-full border border-zinc-900/90 bg-white px-4 py-2.5 transition-all duration-300 ease-in-out lg:border-gray-200 lg:px-5 lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:min-h-[48px] ${
          isScrolled ? "lg:min-h-[40px] lg:py-2" : ""
        }`}
      >
        <Search className="size-4 shrink-0 text-zinc-900 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />

        <input
          id="home-ai-desktop-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void onSubmit();
            }
          }}
          placeholder="Search smarter with AI"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 lg:placeholder-gray-400"
        />

        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={loading}
          aria-label="Run AI search"
          className="inline-flex shrink-0 items-center justify-center text-zinc-900 transition hover:opacity-70 disabled:opacity-50"
        >
          <Sparkles className="size-4 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <Link
        href="/venues"
        className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-zinc-900/90 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-all duration-300 ease-in-out hover:bg-zinc-50 lg:border-gray-200 lg:bg-gray-50/80 lg:font-medium lg:shadow-[0_2px_12px_rgba(0,0,0,0.08)] lg:hover:bg-gray-50 lg:min-h-[48px] ${
          isScrolled ? "lg:min-h-[40px] lg:py-2" : ""
        }`}
      >
        <Filter className="size-4 lg:stroke-[1.5]" strokeWidth={1.5} aria-hidden />
        Filter
      </Link>
    </div>
  );
}
