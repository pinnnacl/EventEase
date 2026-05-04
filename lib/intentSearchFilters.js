import { intentServiceCategories } from "./intentSchema";
import { parseVenueCapacityMax } from "./vendorIntentRanking";

/**
 * @param {unknown[]} rows
 * @param {import("./intentSchema").Intent} intent
 */
export function filterRowsByIntentServices(rows, intent) {
  const input = Array.isArray(rows) ? rows : [];
  const cats = intentServiceCategories(intent || {});
  if (!cats.length) return input;
  return input.filter((r) => cats.includes(String(r?.vendor?.category || "")));
}

/**
 * @param {unknown[]} rows
 * @param {import("./intentSchema").Intent} intent
 */
export function filterRowsByGuestCount(rows, intent) {
  const input = Array.isArray(rows) ? rows : [];
  const g = Number(intent?.guest_count);
  if (!Number.isFinite(g) || g <= 0) return input;
  return input.filter((r) => {
    const cat = String(r?.vendor?.category || "").toLowerCase();
    if (cat !== "venue") return true;
    const maxCap = parseVenueCapacityMax(r?.vendor?.capacity);
    if (maxCap === null) return true;
    return maxCap >= g;
  });
}
