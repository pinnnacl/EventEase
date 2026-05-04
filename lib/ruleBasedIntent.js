import {
  extractBudgetCapInr,
  extractOriginPlace,
  normalizeText,
} from "./aiSearchHeuristics";
import { emptyIntent, normalizeIntent } from "./intentSchema";

function extractGuestCount(query) {
  const q = String(query || "");
  const m1 = q.match(/\b(\d{1,5})\s*(?:guests|guest|people|pax|attendees)\b/i);
  if (m1?.[1]) {
    const n = Number(m1[1]);
    if (Number.isFinite(n) && n > 0 && n < 50000) return Math.floor(n);
  }
  const m2 = q.match(/\b(?:for|about|around)\s+(\d{1,5})\s+(?:guests|people)\b/i);
  if (m2?.[1]) {
    const n = Number(m2[1]);
    if (Number.isFinite(n) && n > 0 && n < 50000) return Math.floor(n);
  }
  return undefined;
}

function extractEventDateYmd(query) {
  const q = String(query || "");
  const iso = q.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = q.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2})\b/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    return `${dmy[3]}-${mm}-${dd}`;
  }
  return null;
}

function extractServicesFromQuery(query) {
  const q = normalizeText(query);
  if (!q) return [];
  /** @type {string[]} */
  const found = [];
  const add = (slug) => {
    if (!found.includes(slug)) found.push(slug);
  };
  if (/\bvenue|hall|resort|auditorium|banquet|mandap|beach wedding\b/.test(q)) add("venue");
  if (/\bphoto|photograph|wedding shoot|pre.wedding\b/.test(q)) add("photography");
  if (/\bmakeup|mehndi|bridal glam|hmua\b/.test(q)) add("makeup");
  if (/\bcater|food\b/.test(q)) add("catering");
  if (/\bdecor|floral|flower\b/.test(q)) add("decor");
  if (/\bplanner|coordination\b/.test(q)) add("planner");
  return found;
}

function extractPreferences(query) {
  const q = normalizeText(query);
  const prefs = [];
  const map = [
    ["traditional", /\btraditional|temple|nair|hindu ceremony\b/],
    ["beach", /\bbeach|coastal|seaside\b/],
    ["heritage", /\bheritage|palace|historic\b/],
    ["luxury", /\bluxury|premium|5 star|five star\b/],
    ["minimal", /\bminimal|minimalist|intimate\b/],
    ["outdoor", /\bgarden|lawn|outdoor ceremony\b/],
  ];
  for (const [label, re] of map) {
    if (re.test(q)) prefs.push(label);
  }
  return prefs;
}

function extractIndoorOutdoor(query) {
  const q = normalizeText(query);
  if (/\boutdoor|open.air|garden wedding|beach\b/.test(q)) return "outdoor";
  if (/\bindoor|ac hall|banquet hall\b/.test(q)) return "indoor";
  return null;
}

function extractEventType(query) {
  const q = normalizeText(query);
  if (/\bengagement\b/.test(q)) return "engagement";
  if (/\breception\b/.test(q)) return "reception";
  if (/\bsangeet|mehndi\b/.test(q)) return "pre_wedding";
  return "wedding";
}

/**
 * Rule-based intent (fallback when LLM parsing fails).
 * @param {string} query
 * @returns {Intent}
 */
export function buildRuleBasedIntent(query) {
  const trimmed = String(query || "").trim();
  const locFromPatterns = extractOriginPlace(trimmed);
  const budget = extractBudgetCapInr(trimmed) ?? undefined;
  const guest = extractGuestCount(trimmed);
  const services = extractServicesFromQuery(trimmed);
  const merged = normalizeIntent({
    event_type: extractEventType(trimmed),
    location: locFromPatterns || "",
    guest_count: guest,
    budget,
    services_needed: services.length ? services : [],
    event_date: extractEventDateYmd(trimmed),
    preferences: extractPreferences(trimmed),
    indoor_outdoor: extractIndoorOutdoor(trimmed),
  });
  if (!merged.location && trimmed) {
    const loose = trimmed.match(/\b(?:wedding|event)\s+in\s+([a-zA-Z][a-zA-Z\s.-]{1,48})\b/i);
    if (loose?.[1]) merged.location = loose[1].trim();
  }
  if (!merged.services_needed?.length) merged.services_needed = [];
  return merged;
}

/**
 * Merge LLM intent with rule-based gaps (budget/location from text).
 * @param {import("./intentSchema").Intent | Record<string, unknown>} llmIntent
 * @param {string} query
 * @returns {import("./intentSchema").Intent}
 */
export function mergeIntentWithHeuristics(llmIntent, query) {
  const rules = buildRuleBasedIntent(query);
  const base = normalizeIntent(llmIntent || emptyIntent());
  if (!base.budget && rules.budget) base.budget = rules.budget;
  if (!base.location?.trim() && rules.location) base.location = rules.location;
  if (!base.guest_count && rules.guest_count) base.guest_count = rules.guest_count;
  if (!base.event_date && rules.event_date) base.event_date = rules.event_date;
  if (!base.services_needed?.length && rules.services_needed?.length) {
    base.services_needed = rules.services_needed;
  }
  if (!base.preferences?.length && rules.preferences?.length) base.preferences = rules.preferences;
  if (!base.indoor_outdoor && rules.indoor_outdoor) base.indoor_outdoor = rules.indoor_outdoor;
  if (!base.event_type && rules.event_type) base.event_type = rules.event_type;
  return base;
}
