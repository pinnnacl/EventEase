import { calculateDistance, isValidLatLng } from "../utils/distance";
import { intentServiceCategories } from "./intentSchema";
import { parseVendorPriceCapInr } from "./aiSearchHeuristics";

/**
 * @param {unknown} cap
 * @returns {number|null}
 */
export function parseVenueCapacityMax(cap) {
  const s = String(cap ?? "").replace(/,/g, " ");
  const nums = s.match(/\d+/g);
  if (!nums?.length) return null;
  const vals = nums.map((n) => Number(n)).filter((x) => Number.isFinite(x) && x > 0);
  if (!vals.length) return null;
  return Math.max(...vals);
}

/**
 * @param {import("./vendors").VendorLike | null | undefined} vendor
 * @returns {number|null} 1–5 or null
 */
export function vendorEffectiveRating(vendor) {
  if (!vendor || typeof vendor !== "object") return null;
  const cat = String(vendor.category || "").toLowerCase();
  if (cat === "photographer") {
    const p = vendor.photographerProfile;
    const r = Number(p?.ratingScore);
    if (Number.isFinite(r) && r > 0) return Math.min(5, Math.max(1, r));
  }
  if (cat === "makeup") {
    const p = vendor.makeupProfile;
    const r = Number(p?.ratingScore);
    if (Number.isFinite(r) && r > 0) return Math.min(5, Math.max(1, r));
  }
  return null;
}

/**
 * @param {import("./intentSchema").Intent} intent
 * @param {unknown} row - search result row with vendor + distance
 * @param {{ originCoord: { lat: number; lng: number } | null }} ctx
 * @returns {number}
 */
export function scoreVendor(intent, row, ctx) {
  const v = row?.vendor;
  const semDist = Number(row?.distance);
  const semantic = Number.isFinite(semDist) ? Math.max(0, 1 - semDist / 0.55) : 0.35;

  let budgetScore = 0.55;
  const cap = Number(intent?.budget);
  const vendorCap = parseVendorPriceCapInr(v);
  if (Number.isFinite(cap) && cap > 0 && Number.isFinite(vendorCap)) {
    if (vendorCap <= cap) budgetScore = 1;
    else budgetScore = Math.max(0, 1 - (vendorCap - cap) / cap);
  } else if (!Number.isFinite(cap) || cap <= 0) {
    budgetScore = 0.65;
  }

  let proximityScore = 0.55;
  const oc = ctx?.originCoord;
  if (oc && v && isValidLatLng(Number(v.lat), Number(v.lng))) {
    const km = calculateDistance(oc.lat, oc.lng, Number(v.lat), Number(v.lng));
    if (Number.isFinite(km)) proximityScore = Math.max(0, 1 - Math.min(km, 150) / 150);
  }

  let categoryScore = 1;
  const cats = intentServiceCategories(intent || {});
  if (cats.length) {
    const c = String(v?.category || "");
    categoryScore = cats.includes(c) ? 1 : 0.28;
  }

  let qualityScore = 0.5;
  const r = vendorEffectiveRating(v);
  if (Number.isFinite(r)) qualityScore = r / 5;

  return (
    0.32 * semantic +
    0.22 * budgetScore +
    0.2 * proximityScore +
    0.14 * categoryScore +
    0.12 * qualityScore
  );
}

/**
 * @param {unknown[]} rows
 * @param {import("./intentSchema").Intent} intent
 * @param {{ originCoord: { lat: number; lng: number } | null }} ctx
 * @returns {unknown[]}
 */
export function sortResultsByIntentScore(rows, intent, ctx) {
  const input = Array.isArray(rows) ? rows : [];
  const scored = input.map((row) => ({
    ...row,
    rankScore: scoreVendor(intent, row, ctx),
  }));
  scored.sort((a, b) => Number(b.rankScore) - Number(a.rankScore));
  return scored;
}

/**
 * Strip internal ranking field before sending to client.
 * @param {unknown[]} rows
 */
export function stripRankScores(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    if (!row || typeof row !== "object") return row;
    const { rankScore: _r, ...rest } = /** @type {Record<string, unknown>} */ (row);
    return rest;
  });
}
