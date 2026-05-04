/**
 * Unified wedding-planning intent (LLM + rule-based fallback).
 *
 * @typedef {Object} Intent
 * @property {string} [event_type]
 * @property {string} [location]
 * @property {number} [guest_count]
 * @property {number} [budget]
 * @property {string[]} [services_needed]
 * @property {string|null} [event_date]
 * @property {string[]} [preferences]
 * @property {'indoor'|'outdoor'|'both'|null|string} [indoor_outdoor]
 */

/** Service slugs from the model → DB `vendors.category` */
export const SERVICE_SLUG_TO_CATEGORY = {
  venue: "Venue",
  hall: "Venue",
  resort: "Venue",
  auditorium: "Venue",
  banquet: "Venue",
  photography: "Photographer",
  photographer: "Photographer",
  makeup: "Makeup",
  mehndi: "Makeup",
  catering: null,
  decor: null,
  decoration: null,
  planner: null,
  music: null,
  transport: null,
};

/**
 * @returns {Intent}
 */
export function emptyIntent() {
  return {
    event_type: "wedding",
    location: "",
    guest_count: undefined,
    budget: undefined,
    services_needed: [],
    event_date: null,
    preferences: [],
    indoor_outdoor: null,
  };
}

/**
 * Coerce unknown JSON into a safe Intent shape.
 * @param {unknown} raw
 * @returns {Intent}
 */
export function normalizeIntent(raw) {
  const base = emptyIntent();
  if (!raw || typeof raw !== "object") return base;

  const o = /** @type {Record<string, unknown>} */ (raw);

  if (typeof o.event_type === "string" && o.event_type.trim()) base.event_type = o.event_type.trim().toLowerCase();
  if (typeof o.location === "string" && o.location.trim()) base.location = o.location.trim();

  const gc = Number(o.guest_count);
  if (Number.isFinite(gc) && gc > 0 && gc < 50000) base.guest_count = Math.floor(gc);

  const b = Number(o.budget);
  if (Number.isFinite(b) && b > 0) base.budget = Math.round(b);

  if (Array.isArray(o.services_needed)) {
    base.services_needed = o.services_needed
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
  }

  if (o.event_date === null) base.event_date = null;
  else if (typeof o.event_date === "string" && o.event_date.trim()) base.event_date = o.event_date.trim();
  else base.event_date = null;

  if (Array.isArray(o.preferences)) {
    base.preferences = o.preferences.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean);
  }

  if (o.indoor_outdoor === null || o.indoor_outdoor === undefined) base.indoor_outdoor = null;
  else if (typeof o.indoor_outdoor === "string") {
    const io = o.indoor_outdoor.trim().toLowerCase();
    if (io === "indoor" || io === "outdoor" || io === "both") base.indoor_outdoor = io;
    else base.indoor_outdoor = null;
  }

  return base;
}

/**
 * Map intent service slugs to unique DB categories (non-null only).
 * @param {Intent} intent
 * @returns {string[]}
 */
export function intentServiceCategories(intent) {
  const slugs = Array.isArray(intent?.services_needed) ? intent.services_needed : [];
  const out = new Set();
  for (const slug of slugs) {
    const c = SERVICE_SLUG_TO_CATEGORY[slug];
    if (c) out.add(c);
  }
  return [...out];
}
