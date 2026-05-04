import { calculateDistance, isValidLatLng } from "../utils/distance";
import { intentServiceCategories } from "./intentSchema";

export function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function queryHasBudgetIntent(query) {
  const q = normalizeText(query);
  if (!q) return false;
  return /\b(budget|below|under|within|upto|up to|price|pricing|lakh|lack|lac|lacs|crore|cr)\b/.test(q);
}

export function queryLooksVenueSpecific(query) {
  const q = normalizeText(query);
  if (!q) return false;
  const tokens = [
    "venue",
    "venues",
    "auditorium",
    "hall",
    "beach wedding",
    "beach",
    "resort",
    "banquet",
    "wedding hall",
  ];
  return tokens.some((t) => q.includes(t));
}

export function extractConstraintTokens(query) {
  const q = normalizeText(query);
  if (!q) return [];
  const stop = new Set([
    "find",
    "show",
    "list",
    "list out",
    "me",
    "the",
    "a",
    "an",
    "for",
    "in",
    "on",
    "at",
    "near",
    "from",
    "with",
    "and",
    "or",
    "to",
    "of",
    "is",
    "this",
    "that",
    "i",
    "need",
    "want",
    "wedding",
    "venue",
    "venues",
    "kerala",
    "budget",
    "below",
    "under",
    "within",
    "upto",
    "price",
    "pricing",
    "lakh",
    "lakhs",
    "lack",
    "lacs",
  ]);
  return q
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !stop.has(t));
}

export function vendorSearchableText(vendor) {
  if (!vendor || typeof vendor !== "object") return "";
  return normalizeText(
    [
      vendor.businessName,
      vendor.category,
      vendor.city,
      vendor.state,
      vendor.place,
      vendor.description,
      vendor.pricingRange,
      vendor.capacity,
      ...(Array.isArray(vendor.facilities) ? vendor.facilities : []),
      ...(Array.isArray(vendor.venueDetails) ? vendor.venueDetails.map((d) => `${d?.title || ""} ${d?.description || ""}`) : []),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

export function isBroadRegion(label) {
  const t = normalizeText(label);
  return t === "kerala" || t === "india" || t === "south india";
}

/**
 * @param {string} query
 * @param {unknown[]} rows
 * @param {import("./intentSchema").Intent} [intent]
 */
export function filterRelevantResults(query, rows, intent) {
  const input = Array.isArray(rows) ? rows : [];
  if (input.length === 0) return [];
  let wantsVenue = queryLooksVenueSpecific(query);
  const cats = intent ? intentServiceCategories(intent) : [];
  if (cats.length > 0 && !cats.includes("Venue")) wantsVenue = false;
  if (cats.length === 1 && cats[0] === "Venue") wantsVenue = true;
  const hasExplicitLocation = Boolean(extractOriginPlace(query));
  const budgetIntent = queryHasBudgetIntent(query);
  const distanceThreshold = budgetIntent ? 0.5 : 0.36;
  const constraintTokens = extractConstraintTokens(query);
  return input.filter((r) => {
    const d = Number(r?.distance);
    if (!Number.isFinite(d) || d > distanceThreshold) return false;
    if (wantsVenue) {
      const cat = String(r?.vendor?.category || "").toLowerCase();
      if (cat !== "venue") return false;
    }
    if (constraintTokens.length > 0 && !hasExplicitLocation) {
      const text = vendorSearchableText(r?.vendor);
      if (!text) return false;
      const matchedAnyConstraint = constraintTokens.some((token) => text.includes(token));
      if (!matchedAnyConstraint) return false;
    }
    return true;
  });
}

export function extractRadiusKm(query) {
  const q = String(query || "").toLowerCase();
  if (!q) return null;
  const m = q.match(/(\d+(?:\.\d+)?)\s*km\b/);
  if (m?.[1]) {
    const km = Number(m[1]);
    if (Number.isFinite(km) && km > 0) return Math.min(km, 200);
  }
  if (/\bnear\b/i.test(q)) return 5;
  return null;
}

export function parseMoneyToInr(amount, unit) {
  const n = Number(String(amount || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  const u = String(unit || "").toLowerCase().trim();
  if (!u) return Math.round(n);
  if (u === "k" || u === "thousand") return Math.round(n * 1_000);
  if (u === "lakh" || u === "lakhs" || u === "lack" || u === "lac" || u === "lacs") return Math.round(n * 100_000);
  if (u === "cr" || u === "crore" || u === "crores") return Math.round(n * 10_000_000);
  return Math.round(n);
}

export function extractBudgetCapInr(query) {
  const q = String(query || "").toLowerCase();
  if (!q) return null;
  const patterns = [
    /(?:below|under|less than|within|up to|upto|max(?:imum)?)\s*₹?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lack|lac|lacs|cr|crore|crores)?/i,
    /budget[^0-9]{0,20}([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lack|lac|lacs|cr|crore|crores)?/i,
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m?.[1]) {
      const inr = parseMoneyToInr(m[1], m[2]);
      if (Number.isFinite(inr) && inr > 0) return inr;
    }
  }
  return null;
}

export function parseVendorPriceCapInr(vendor) {
  const raw = String(vendor?.pricingRange || vendor?.priceRange || "").toLowerCase();
  if (!raw) return null;
  const s = raw.replace(/[₹,\s]/g, "");
  const token = /(\d+(?:\.\d+)?)(crores?|cr|lakhs?|k|thousand)?/g;
  /** @type {number[]} */
  const vals = [];
  let m;
  while ((m = token.exec(s)) !== null) {
    const inr = parseMoneyToInr(m[1], m[2]);
    if (Number.isFinite(inr) && inr > 0) vals.push(inr);
  }
  if (vals.length === 0) return null;
  return Math.max(...vals);
}

export function estimateDriveMinutes(km) {
  if (!Number.isFinite(km)) return null;
  const roadKm = km * 1.28;
  const mins = Math.round((roadKm / 28) * 60);
  return Math.max(2, mins);
}

export function toTitleCasePlace(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function extractOriginPlace(query) {
  const q = String(query || "").trim();
  if (!q) return "";
  const stopWords =
    "(?:with|under|below|within|upto|up\\s+to|budget|price|prize|cost|around|for|that|which|and)";
  const patterns = [
    new RegExp(`\\bfrom\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
    new RegExp(`\\bnear\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
    new RegExp(`\\bin\\s+([a-zA-Z][a-zA-Z\\s.-]{1,60}?)(?=\\s+${stopWords}\\b|\\?|,|\\.|$)`, "i"),
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m?.[1]) return toTitleCasePlace(m[1]);
  }
  return "";
}

export async function geocodePlace(place) {
  const q = String(place || "").trim();
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
    `${q}, Kerala, India`
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "eventease-kerala/1.0",
    },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => []);
  const first = Array.isArray(data) ? data[0] : null;
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);
  if (!isValidLatLng(lat, lon)) return null;
  return { lat, lng: lon };
}

function formatKm(km) {
  if (!Number.isFinite(km)) return null;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export async function buildAnswer(query, results) {
  const trimmed = String(query || "").trim();
  if (!Array.isArray(results) || results.length === 0) {
    return `No matching vendor is available in the application for "${trimmed}" right now. Please try a different location/style or add more details.`;
  }

  const top = results.slice(0, 2);
  const names = top.map((r) => String(r?.vendor?.businessName || "").trim()).filter(Boolean);
  const nameText = names.length === 2 ? `${names[0]} and ${names[1]}` : names[0] || "the top venues";

  const origin = extractOriginPlace(trimmed);
  if (!origin) {
    return `Top matches for "${trimmed}" are ${nameText}. Add "from <place>" in your query if you want exact distance and travel-time estimates.`;
  }
  if (isBroadRegion(origin)) {
    return `I found ${nameText}, but I cannot provide meaningful point-to-point distance from a broad region like "${origin}". Please mention a specific town/locality (for example, "from Ambadimala").`;
  }

  let originCoord = null;
  try {
    originCoord = await geocodePlace(origin);
  } catch {
    originCoord = null;
  }
  if (!originCoord) {
    return `I found ${nameText}, but I could not resolve "${origin}" accurately to calculate distance. Try a nearby landmark or a fuller location name.`;
  }

  const withDistance = top
    .map((r) => {
      const v = r?.vendor;
      const lat = Number(v?.lat);
      const lng = Number(v?.lng);
      if (!isValidLatLng(lat, lng)) return null;
      const km = calculateDistance(originCoord.lat, originCoord.lng, lat, lng);
      if (!Number.isFinite(km)) return null;
      return { name: String(v?.businessName || "Venue"), km };
    })
    .filter(Boolean);

  if (withDistance.length === 0) {
    return `I found ${nameText}, but those vendors do not yet have map coordinates saved, so I cannot compute exact distance from ${origin}.`;
  }

  const primary = withDistance[0];
  const mins = estimateDriveMinutes(primary.km);
  const extra = withDistance[1]
    ? ` Another nearby option is ${withDistance[1].name} at about ${formatKm(withDistance[1].km)}.`
    : "";
  const minsText = mins ? ` and roughly ${mins} minutes by road` : "";
  return `${primary.name} is approximately ${formatKm(primary.km)} from ${origin}${minsText}.${extra}`;
}
