const PLACEHOLDER_VENUE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&h=560&q=75";
const PLACEHOLDER_SERVICE =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=75";

/**
 * Build only categories that have ≥1 item. Order: venues → photography → catering → decoration.
 */
export function buildWishlistCategories({
  wishlist,
  venues,
  photographers,
  toggle,
  togglePhotography,
  removeCatering,
  removeDecoration,
}) {
  const out = [];

  const venueItems = wishlist.venues
    .map((id) => venues.find((v) => v.id === id))
    .filter(Boolean)
    .map((v) => ({
      categoryKey: "venues",
      id: v.id,
      name: v.name,
      location: v.area || v.location,
      price: v.price,
      pricePrefix: "Starting from",
      image: v.image,
      rating: v.rating,
      isPremium: v.rating >= 4.85,
      detailHref: `/venues#${v.id}`,
      imageLayout: "wide",
      eyebrow: null,
      onRemove: () => toggle(v.id),
    }));

  if (venueItems.length) out.push({ key: "venues", label: "Venues", items: venueItems });

  const photoItems = wishlist.photography
    .map((id) => photographers.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ({
      categoryKey: "photography",
      id: p.id,
      name: p.name,
      location: p.area || p.location,
      price: p.priceReel ?? p.price,
      pricePrefix: "From",
      image: p.image,
      rating: p.rating,
      isPremium: p.rating >= 4.85,
      detailHref: `/photography#${p.id}`,
      imageLayout: "portrait",
      eyebrow: "Photography",
      onRemove: () => togglePhotography(p.id),
    }));

  if (photoItems.length) out.push({ key: "photography", label: "Photography", items: photoItems });

  const cateringItems = wishlist.catering.map((id) => ({
    categoryKey: "catering",
    id,
    name: id,
    location: "Kerala",
    price: "Contact for quote",
    pricePrefix: "",
    image: PLACEHOLDER_SERVICE,
    rating: null,
    isPremium: false,
    detailHref: "/#packages",
    imageLayout: "wide",
    eyebrow: "Catering",
    onRemove: () => removeCatering(id),
  }));

  if (cateringItems.length) out.push({ key: "catering", label: "Catering", items: cateringItems });

  const decorationItems = wishlist.decoration.map((id) => ({
    categoryKey: "decoration",
    id,
    name: id,
    location: "Kerala",
    price: "Contact for quote",
    pricePrefix: "",
    image: PLACEHOLDER_VENUE,
    rating: null,
    isPremium: false,
    detailHref: "/#packages",
    eyebrow: "Decoration",
    onRemove: () => removeDecoration(id),
  }));

  if (decorationItems.length) out.push({ key: "decoration", label: "Decoration", items: decorationItems });

  return out;
}
