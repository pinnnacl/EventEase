/**
 * Reusable amenity / tag chips (pill style used elsewhere on venue page).
 */
export default function AmenityChips({ items, activeIndex = 0, onSelect, emptyLabel = "No amenities listed yet." }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((tag, i) => (
        <button
          key={`${tag}-${i}`}
          type="button"
          onClick={() => onSelect?.(i)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeIndex === i
              ? "bg-[#0F766E] text-white shadow-sm ring-1 ring-[#0F766E]/30"
              : "bg-stone-100 text-stone-700 ring-1 ring-stone-200/80 hover:bg-stone-50"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
