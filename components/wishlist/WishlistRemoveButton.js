function HeartFilled({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

/**
 * @param {{ label: string, onRemove: () => void, className?: string, size?: "md" | "sm" | "xs" }} props
 */
export default function WishlistRemoveButton({ label, onRemove, className = "", size = "md" }) {
  const box = size === "xs" ? "h-7 w-7" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "xs" ? "h-3 w-3" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md ring-1 ring-stone-200/80 transition hover:scale-105 hover:bg-white hover:text-rose-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${box} ${className}`.trim()}
    >
      <HeartFilled className={icon} />
    </button>
  );
}
