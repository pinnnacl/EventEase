/**
 * Horizontal section tabs — squarish buttons, active highlight.
 * @param {{
 *   tabs: { id: string; label: string }[];
 *   activeId: string;
 *   onSelect: (id: string) => void;
 * }} props
 */
export default function SectionTabs({ tabs, activeId, onSelect }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Venue sections"
    >
      {tabs.map((tab) => {
        const selected = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`tab-${tab.id}`}
            aria-controls={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`shrink-0 rounded-[10px] border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/35 focus-visible:ring-offset-2 ${
              selected
                ? "border-[#0F766E] bg-[#0F766E]/10 text-[#0b5c56] shadow-sm"
                : "border-stone-200/90 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50/90"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
