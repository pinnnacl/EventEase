/**
 * Client/server: filter listing rows by city/location query (matches venues page behavior).
 * @param {{ city?: string, state?: string, location?: string }} vendor
 * @param {string} locationLabel
 */
export function vendorMatchesLocation(vendor, locationLabel) {
  const q = locationLabel.trim().toLowerCase();
  if (!q || q === "kerala") return true;
  const city = (vendor.city || "").toLowerCase();
  const loc = (vendor.location || "").toLowerCase();
  const state = (vendor.state || "").toLowerCase();
  return (
    city === q ||
    state === q ||
    loc.includes(q) ||
    city.includes(q) ||
    loc.split(",").some((part) => part.trim() === q)
  );
}
