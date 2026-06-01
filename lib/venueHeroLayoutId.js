/** Shared layout id for list tile → venue detail hero (framer-motion). */
export function getVenueHeroLayoutId(venueId) {
  const id = typeof venueId === "string" ? venueId.trim() : String(venueId || "").trim();
  if (!id) return null;
  return `venue-image-${id}`;
}

export const VENUE_HERO_LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 0.85,
};
