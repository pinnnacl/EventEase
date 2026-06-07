import { formatVenuePriceDisplay } from "./formatVenuePrice";
import { getPublicVenueDetailRows } from "./venueDetails";
import { VENUE_TYPE_OPTIONS, formatYearsInBusinessLabel, parsePositiveInt } from "./venueHighlights";

/** Minimum average rating to show the Top Rated trust badge. */
export const VENUE_TOP_RATED_MIN_SCORE = 4.5;
/** Minimum review count to show the Top Rated trust badge. */
export const VENUE_TOP_RATED_MIN_REVIEWS = 5;

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
 * Pull a compact numeric or short label from venue detail copy (legacy fallback).
 * @param {string | null | undefined} raw
 */
export function compactHighlightValue(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/ac|air condition/i.test(s)) return "Fully AC";

  const range = s.match(/([\d,]+)\s*(?:-|–|to)\s*([\d,]+)/i);
  if (range) {
    const low = range[1].replace(/,/g, "");
    const high = range[2].replace(/,/g, "");
    return low === high ? low : `${low}–${high}`;
  }

  const single = s.match(/([\d,]+)/);
  if (single) return single[1].replace(/,/g, "");

  return s.length > 14 ? `${s.slice(0, 14)}…` : s;
}

/**
 * @param {string | number | null | undefined} raw
 */
function formatHighlightNumber(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/,/g, ""));
  if (Number.isFinite(n) && n > 0) return n.toLocaleString("en-IN");
  const s = String(raw).trim();
  return s || null;
}

/**
 * @param {object} venue
 */
export function buildVenueLocationLine(venue) {
  const businessName = venue?.businessName?.trim().toLowerCase() || "";
  const parts = [venue?.place, venue?.city, venue?.state]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .filter((p) => p.toLowerCase() !== businessName);
  if (parts.length) return [...new Set(parts)].join(", ");
  return venue?.location?.trim() || "Kerala";
}

/**
 * Compact place + city line for mobile cards (matches listing tile format).
 * @param {object} venue
 */
export function buildVenueMobilePlaceLine(venue) {
  const businessName = venue?.businessName?.trim().toLowerCase() || "";
  const parts = [venue?.place, venue?.city]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .filter((p) => p.toLowerCase() !== businessName);
  if (parts.length) return [...new Set(parts)].join(", ");
  const city = venue?.city?.trim();
  if (city) return city;
  const loc = venue?.location?.trim();
  if (loc) return loc.split(",")[0]?.trim() || loc;
  return "Kerala";
}

/**
 * @param {string | null | undefined} priceRange
 * @returns {string | null}
 */
export function buildVenueMobilePriceLine(priceRange) {
  const raw = priceRange?.trim();
  if (!raw || /^(ask|contact|enquir)/i.test(raw)) return null;

  const formatted = formatVenuePriceDisplay(priceRange);
  if (formatted.amount) return `Starting from ${formatted.amount}`;
  if (/^rates on request/i.test(formatted.headline)) return null;
  return formatted.headline.replace(/^rates\s+/i, "Starting from ");
}

/**
 * @param {object} venue
 * @param {{ rating?: number }[]} [reviews]
 * @returns {{ score: number; count: number } | null}
 */
export function buildVenueMobileRating(venue, reviews = []) {
  if (Array.isArray(reviews) && reviews.length > 0) {
    const ratings = reviews
      .map((r) => Number(r?.rating))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!ratings.length) return null;
    const score = ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
    return { score: Math.min(5, Math.max(1, score)), count: reviews.length };
  }

  const score = Number(venue?.ratingScore);
  const count = Number(venue?.reviewCount);
  if (Number.isFinite(score) && score > 0 && Number.isFinite(count) && count > 0) {
    return { score: Math.min(5, Math.max(1, score)), count: Math.floor(count) };
  }

  return null;
}

/**
 * @param {{ score: number; count: number } | null} rating
 */
export function qualifiesForTopRatedBadge(rating) {
  if (!rating) return false;
  return rating.score >= VENUE_TOP_RATED_MIN_SCORE && rating.count >= VENUE_TOP_RATED_MIN_REVIEWS;
}

/**
 * Infer venue subtype from structured field, name, or description (legacy fallback).
 * @param {object} venue
 * @returns {string | null}
 */
export function resolveVenueType(venue) {
  const structured = typeof venue?.venueType === "string" ? venue.venueType.trim() : "";
  if (structured) return structured;

  const corpus = [venue?.businessName, venue?.description, venue?.tagline]
    .filter((x) => typeof x === "string" && x.trim())
    .join(" ")
    .toLowerCase();

  if (!corpus) return null;

  for (const type of VENUE_TYPE_OPTIONS) {
    if (corpus.includes(type.toLowerCase())) return type;
  }

  const keywordMap = [
    [/auditorium/i, "Auditorium"],
    [/wedding\s*hall|marriage\s*hall/i, "Wedding Hall"],
    [/banquet/i, "Banquet Hall"],
    [/convention/i, "Convention Centre"],
    [/resort/i, "Resort Venue"],
    [/conference/i, "Conference Venue"],
    [/cultural/i, "Cultural Venue"],
    [/luxury/i, "Luxury Venue"],
  ];

  for (const [pattern, type] of keywordMap) {
    if (pattern.test(corpus)) return type;
  }

  return null;
}

/**
 * Uppercase venue-type subheader for mobile floating card (e.g. "AUDITORIUM & CULTURAL CENTRE").
 * @param {object} venue
 * @returns {string | null}
 */
export function buildVenueMobileTypeHeaderLine(venue) {
  const type = resolveVenueType(venue);
  if (!type) return null;

  const corpus = [venue?.businessName, venue?.description, venue?.tagline]
    .filter((x) => typeof x === "string" && x.trim())
    .join(" ")
    .toLowerCase();

  if (type === "Auditorium" && /cultural|centre|center/i.test(corpus)) {
    return "AUDITORIUM & CULTURAL CENTRE";
  }
  if (type === "Convention Centre") return "CONVENTION CENTRE";
  return type.toUpperCase();
}

/**
 * Display label for the dedicated venue-type row (e.g. "Premium Auditorium").
 * @param {object} venue
 * @returns {string | null}
 */
export function buildVenueMobileVenueTypeLabel(venue) {
  const type = resolveVenueType(venue);
  if (!type) return null;
  if (/^premium\s/i.test(type) || type === "Luxury Venue") return type;
  return `Premium ${type}`;
}

/**
 * @param {object} venue
 * @returns {number | null}
 */
export function resolveYearsInBusiness(venue) {
  const structured = parsePositiveInt(venue?.yearsInBusiness);
  if (structured != null && structured > 0) return structured;

  const desc = typeof venue?.description === "string" ? venue.description : "";
  const patterns = [
    /(\d{1,2})\+?\s*years?\s*(?:of\s*)?(?:hosting|experience|in\s*business|serving)/i,
    /over\s*(\d{1,2})\s*years/i,
    /established\s*(?:for\s*)?(\d{1,2})\+?\s*years/i,
  ];

  for (const pattern of patterns) {
    const match = desc.match(pattern);
    if (!match) continue;
    const n = parseInt(match[1], 10);
    if (Number.isFinite(n) && n > 0 && n < 100) return n;
  }

  const sinceMatch = desc.match(/\bsince\s*(19\d{2}|20\d{2})\b/i);
  if (sinceMatch) {
    const year = parseInt(sinceMatch[1], 10);
    const years = new Date().getFullYear() - year;
    if (years > 0 && years < 100) return years;
  }

  return null;
}

/**
 * Whether the verified trust badge should display.
 * Uses structured flag first; approved public venues as legacy fallback.
 * @param {object} venue
 */
export function resolveVenueVerifiedForDisplay(venue) {
  if (venue?.verifiedVenue) return true;
  return venue?.status === "approved" && venue?.category === "Venue";
}

/**
 * Large feature cards for the mobile highlights grid.
 * Prefers structured highlight fields; legacy parsing as fallback.
 * @param {object} venue
 * @returns {{ id: string; value: string; label: string | null; variant: "number" | "text" }[]}
 */
export function buildVenueMobileHighlightStats(venue) {
  const guestStructured = parsePositiveInt(venue?.guestCapacity);
  const diningStructured = parsePositiveInt(venue?.diningCapacity);
  const parkingStructured = parsePositiveInt(venue?.parkingCapacity);
  const acStructured = venue?.airConditioned === true;

  const rows = getPublicVenueDetailRows(venue?.venueDetails);
  const facilities = (venue?.facilities || []).map((x) => String(x).trim().toLowerCase());

  const capacityLegacy = venue?.capacity?.trim() || rowValue("Capacity", rows);
  const diningLegacy = rowValue("Dining Capacity", rows);
  const parkingLegacy = rowValue("Car Park Capacity", rows);
  const acLegacy =
    rowValue("Temperature Control (AC / Non-AC)", rows) ||
    (facilities.some((f) => /ac|air condition/i.test(f)) ? "Fully AC" : null);

  /** @type {{ id: string; value: string; label: string | null; variant: "number" | "text" }[]} */
  const stats = [];

  const guests =
    guestStructured != null ? formatHighlightNumber(guestStructured) : formatHighlightNumber(compactHighlightValue(capacityLegacy));
  if (guests) stats.push({ id: "guests", value: guests, label: "Guests", variant: "number" });

  const dining =
    diningStructured != null ? formatHighlightNumber(diningStructured) : formatHighlightNumber(compactHighlightValue(diningLegacy));
  if (dining) stats.push({ id: "dining", value: dining, label: "Dining", variant: "number" });

  const parking =
    parkingStructured != null ? formatHighlightNumber(parkingStructured) : formatHighlightNumber(compactHighlightValue(parkingLegacy));
  if (parking) stats.push({ id: "parking", value: parking, label: "Parking", variant: "number" });

  const ac = acStructured ? "Fully AC" : compactHighlightValue(acLegacy);
  if (ac) stats.push({ id: "ac", value: ac, label: null, variant: "text" });

  return stats.slice(0, 4);
}

/**
 * Hydrate vendor portal highlight fields from structured DB columns, with legacy
 * venue_details / capacity fallbacks when structured columns are empty.
 * @param {object | null | undefined} venue
 */
export function resolveVendorFormVenueHighlights(venue) {
  if (!venue || venue.category !== "Venue") {
    return {
      venueType: "",
      yearsInBusiness: null,
      guestCapacity: null,
      diningCapacity: null,
      parkingCapacity: null,
      airConditioned: false,
      stageAvailable: false,
      wheelchairAccessible: false,
      suitableFor: [],
    };
  }

  const rows = getPublicVenueDetailRows(venue.venueDetails);
  const facilities = (venue.facilities || []).map((x) => String(x).trim().toLowerCase());

  const venueType = (typeof venue.venueType === "string" && venue.venueType.trim()) || resolveVenueType(venue) || "";

  let guestCapacity = parsePositiveInt(venue.guestCapacity);
  if (guestCapacity == null) {
    guestCapacity = parsePositiveInt(
      compactHighlightValue(venue.capacity?.trim() || rowValue("Capacity", rows)),
    );
  }

  let diningCapacity = parsePositiveInt(venue.diningCapacity);
  if (diningCapacity == null) {
    diningCapacity = parsePositiveInt(compactHighlightValue(rowValue("Dining Capacity", rows)));
  }

  let parkingCapacity = parsePositiveInt(venue.parkingCapacity);
  if (parkingCapacity == null) {
    parkingCapacity = parsePositiveInt(compactHighlightValue(rowValue("Car Park Capacity", rows)));
  }

  let airConditioned = venue.airConditioned === true;
  if (!airConditioned) {
    const acText = rowValue("Temperature Control (AC / Non-AC)", rows);
    airConditioned =
      /fully\s*ac|full\s*ac|100%\s*ac|\byes\b/i.test(acText || "") ||
      facilities.some((f) => /ac|air condition/i.test(f));
  }

  let stageAvailable = venue.stageAvailable === true;
  if (!stageAvailable) {
    const stageText = rowValue("Stage Availability", rows);
    stageAvailable = /yes|available|on.?prem/i.test(stageText || "");
  }

  let wheelchairAccessible = venue.wheelchairAccessible === true;
  if (!wheelchairAccessible) {
    const accessText = rowValue("Access for Elderly & Handicapped", rows);
    wheelchairAccessible = /wheelchair|accessible|ramp|\byes\b/i.test(accessText || "");
  }

  return {
    venueType,
    yearsInBusiness: parsePositiveInt(venue.yearsInBusiness),
    guestCapacity,
    diningCapacity,
    parkingCapacity,
    airConditioned,
    stageAvailable,
    wheelchairAccessible,
    suitableFor: Array.isArray(venue.suitableFor) ? venue.suitableFor : [],
  };
}

/**
 * Trust & quality badges — verified, top rated, years in business only.
 * Venue type is shown in its own row above this section.
 * @param {object} venue
 * @param {{ score: number; count: number } | null} [rating]
 * @returns {{ id: string; label: string; icon: "check" | "star" | "calendar" }[]}
 */
export function buildVenueMobileTrustBadges(venue, rating = null) {
  /** @type {{ id: string; label: string; icon: "check" | "star" | "calendar" }[]} */
  const badges = [];

  if (resolveVenueVerifiedForDisplay(venue)) {
    badges.push({ id: "verified", label: "Verified Venue", icon: "check" });
  }
  if (qualifiesForTopRatedBadge(rating)) {
    badges.push({ id: "topRated", label: "Top Rated", icon: "star" });
  }

  const yearsLabel = formatYearsInBusinessLabel(resolveYearsInBusiness(venue));
  if (yearsLabel) {
    badges.push({ id: "years", label: yearsLabel, icon: "calendar" });
  }

  return badges;
}

/**
 * Tagline from the first line of description only.
 * @param {object} venue
 * @returns {string | null}
 */
export function buildVenueMobileTagline(venue) {
  const desc = venue?.description?.trim();
  if (!desc) return null;
  const first = desc.split(/\n+/)[0].trim();
  return first || null;
}

/** @deprecated Use buildVenueMobileHighlightStats */
export function buildVenueMobileStatChips(venue) {
  return buildVenueMobileHighlightStats(venue).map((stat) => ({
    id: stat.id,
    label: stat.label ? `${stat.value} ${stat.label}` : stat.value,
  }));
}

/** @deprecated Use buildVenueMobileHighlightStats */
export function buildVenueMobileSummaryHighlights(venue) {
  return buildVenueMobileHighlightStats(venue).map((stat) => ({
    id: stat.id,
    label: stat.label || stat.value,
    value: stat.value,
  }));
}

/** @deprecated Use buildVenueMobileTrustBadges */
export function buildVenueMobileBadges(venue) {
  return buildVenueMobileTrustBadges(venue).map((b) => ({
    id: b.id,
    label: b.label,
    tone: b.id === "verified" ? "teal" : b.id === "topRated" ? "gold" : "slate",
  }));
}
