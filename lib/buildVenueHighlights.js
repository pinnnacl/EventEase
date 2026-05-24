import { getPublicVenueDetailRows } from "./venueDetails";

/**
 * @param {string} title
 * @param {ReturnType<typeof getPublicVenueDetailRows>} rows
 */
function rowValue(title, rows) {
  const hit = rows.find((r) => r.title === title);
  if (!hit || hit.description === "Not specified") return null;
  return hit.description.trim();
}

/**
 * Core “at a glance” highlights for venue detail hero.
 * @param {object} venue
 */
export function buildVenueHighlights(venue) {
  const rows = getPublicVenueDetailRows(venue?.venueDetails);
  const facilities = (venue?.facilities || []).map((x) => String(x).trim().toLowerCase());

  const capacity = venue?.capacity?.trim() || rowValue("Capacity", rows);
  const parking = rowValue("Car Park Capacity", rows);
  const ac =
    rowValue("Temperature Control (AC / Non-AC)", rows) ||
    (facilities.some((f) => /ac|air condition/i.test(f)) ? "Air conditioned" : null);
  const place =
    venue?.place?.trim() ||
    [venue?.city, venue?.state].filter(Boolean).join(", ") ||
    venue?.location?.split(",")[0]?.trim() ||
    null;

  /** @type {{ id: string; label: string; value: string }[]} */
  const items = [];
  if (capacity) items.push({ id: "capacity", label: "Capacity", value: capacity });
  if (ac) items.push({ id: "ac", label: "Climate", value: ac });
  if (parking) items.push({ id: "parking", label: "Parking", value: parking });
  if (place) items.push({ id: "place", label: "Location", value: place });

  if (items.length < 2 && facilities.length) {
    for (const f of facilities.slice(0, 4 - items.length)) {
      if (!items.some((i) => i.value.toLowerCase() === f.toLowerCase())) {
        items.push({ id: `f-${f}`, label: "Feature", value: f });
      }
    }
  }

  return items.slice(0, 4);
}
