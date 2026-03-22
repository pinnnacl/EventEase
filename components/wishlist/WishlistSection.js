import WishlistCard from "./WishlistCard";

/**
 * @param {{ category: { key: string, items: unknown[] } | null }} props
 */
export default function WishlistSection({ category }) {
  if (!category || category.items.length === 0) return null;

  return (
    <div role="tabpanel" aria-labelledby={`wishlist-tab-${category.key}`}>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        {category.items.map((item) => (
          <li key={`${item.categoryKey}-${item.id}`}>
            <WishlistCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
