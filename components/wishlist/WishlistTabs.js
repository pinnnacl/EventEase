/**
 * @param {{
 *   tabs: { key: string, label: string }[],
 *   activeKey: string,
 *   onChange: (key: string) => void,
 * }} props
 */
export default function WishlistTabs({ tabs, activeKey, onChange }) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="-mx-1 flex gap-1 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0"
      role="tablist"
      aria-label="Wishlist categories"
    >
      <div className="flex min-w-min rounded-xl bg-stone-200/60 p-1 ring-1 ring-stone-200/50">
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              id={`wishlist-tab-${tab.key}`}
              onClick={() => onChange(tab.key)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition duration-200 sm:text-sm ${
                active
                  ? "bg-white text-brand-700 shadow-md shadow-stone-300/40 ring-1 ring-stone-200/80"
                  : "text-stone-600 hover:text-brand-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
