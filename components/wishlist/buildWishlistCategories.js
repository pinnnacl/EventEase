import { parseResponsiveImageField } from "../../lib/imageVariants";

const PLACEHOLDER_VENUE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&h=560&q=75";
const PLACEHOLDER_SERVICE =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=75";

/**
 * Map Supabase/API venue row or legacy static shape to wishlist card fields.
 * @param {object} v
 */
function normalizeVenueRow(v) {
  if (!v) return null;
  const name = v.businessName ?? v.name ?? "Venue";
  const loc =
    v.location?.trim() ||
    [v.city, v.state].filter(Boolean).join(", ").trim() ||
    v.area ||
    "Kerala";
  const rawImg = v.profileImage ?? v.image;
  const image = parseResponsiveImageField(rawImg)?.medium || rawImg || PLACEHOLDER_VENUE;
  const price = v.priceRange ?? v.pricingRange ?? v.price ?? "Ask for quote";
  const rating = typeof v.rating === "number" ? v.rating : null;
  return {
    id: v.id,
    name,
    location: loc,
    price,
    image,
    rating,
    category: v.category ?? null,
  };
}

/**
 * Build only categories that have ≥1 item. Order: venues → photography → catering → decoration.
 * @param {{ venues: object[], serviceVendors: object[] }} args — API-approved vendors for name resolution
 */
export function buildWishlistCategories({
  wishlist,
  venues,
  serviceVendors,
  toggle,
  togglePhotography,
  removeCatering,
  removeDecoration,
}) {
  const out = [];

  const venueItems = wishlist.venues.map((id) => {
    const raw = venues.find((x) => x.id === id);
    const v = normalizeVenueRow(raw);
    if (!v) {
      return {
        categoryKey: "venues",
        id,
        name: "Saved venue",
        location: "Kerala",
        price: "View listing",
        pricePrefix: "",
        image: PLACEHOLDER_VENUE,
        rating: null,
        isPremium: false,
        detailHref: `/venue/${id}`,
        imageLayout: "wide",
        eyebrow: null,
        onRemove: () => toggle(id),
      };
    }
    return {
      categoryKey: "venues",
      id: v.id,
      name: v.name,
      location: v.location,
      price: v.price,
      pricePrefix: "Starting from",
      image: v.image,
      rating: v.rating,
      isPremium: (v.rating ?? 0) >= 4.85,
      detailHref: `/venue/${v.id}`,
      imageLayout: "wide",
      eyebrow: v.category || null,
      onRemove: () => toggle(v.id),
    };
  });

  if (venueItems.length) out.push({ key: "venues", label: "Venues", items: venueItems });

  const photoItems = wishlist.photography.map((id) => {
    const raw = serviceVendors.find((v) => v.id === id);
    const v = raw ? normalizeVenueRow(raw) : null;
    if (!v) {
      return {
        categoryKey: "photography",
        id,
        name: "Saved listing",
        location: "Kerala",
        price: "View listing",
        pricePrefix: "",
        image: PLACEHOLDER_SERVICE,
        rating: null,
        isPremium: false,
        detailHref: "/photography",
        imageLayout: "portrait",
        eyebrow: "Photo & makeup",
        onRemove: () => togglePhotography(id),
      };
    }
    const eyebrow = raw.category === "Makeup" ? "Makeup" : "Photography";
    const detailHref =
      raw.category === "Photographer"
        ? `/photography/${v.id}`
        : raw.category === "Makeup"
          ? `/makeup/${v.id}`
          : `/venue/${v.id}`;
    return {
      categoryKey: "photography",
      id: v.id,
      name: v.name,
      location: v.location,
      price: v.price,
      pricePrefix: "From",
      image: v.image,
      rating: v.rating,
      isPremium: false,
      detailHref,
      imageLayout: "portrait",
      eyebrow,
      onRemove: () => togglePhotography(v.id),
    };
  });

  if (photoItems.length) out.push({ key: "photography", label: "Photo & makeup", items: photoItems });

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
    imageLayout: "wide",
    eyebrow: "Decoration",
    onRemove: () => removeDecoration(id),
  }));

  if (decorationItems.length) out.push({ key: "decoration", label: "Decoration", items: decorationItems });

  return out;
}
