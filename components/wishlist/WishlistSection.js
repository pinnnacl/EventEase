import WishlistCard from "./WishlistCard";

/**
 * @param {{ category: { key: string, items: unknown[] } | null }} props
 */
export default function WishlistSection({ category }) {
  if (!category || category.items.length === 0) return null;

  return (
    <div role="tabpanel" aria-labelledby={`wishlist-tab-${category.key}`}>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-3 lg:grid-cols-5 lg:gap-3">
        {category.items.map((item) => (
          <li key={`${item.categoryKey}-${item.id}`}>
            <WishlistCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
