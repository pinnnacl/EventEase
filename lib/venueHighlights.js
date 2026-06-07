/** @typedef {typeof VENUE_TYPE_OPTIONS[number]} VenueType */

export const VENUE_TYPE_OPTIONS = [
  "Auditorium",
  "Wedding Hall",
  "Banquet Hall",
  "Convention Centre",
  "Resort Venue",
  "Cultural Venue",
  "Conference Venue",
  "Luxury Venue",
];

const VENUE_TYPE_SET = new Set(VENUE_TYPE_OPTIONS);

export const SUITABLE_FOR_OPTIONS = [
  "Weddings",
  "Receptions",
  "Engagements",
  "Conferences",
  "Cultural Programs",
  "Award Ceremonies",
  "Exhibitions",
  "Banquet Halls",
];

const SUITABLE_FOR_SET = new Set(SUITABLE_FOR_OPTIONS);

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export function parseSuitableForArray(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const s = String(item).trim();
    if (SUITABLE_FOR_SET.has(s) && !out.includes(s)) out.push(s);
  }
  return out;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function parsePositiveInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/**
 * @param {unknown} value
 */
export function parseOptionalBool(value) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return false;
}

/**
 * Map DB row → camelCase highlight fields for API responses.
 * @param {object | null | undefined} row
 */
export function mapVenueHighlightsFromRow(row) {
  if (!row) {
    return {
      venueType: null,
      yearsInBusiness: null,
      guestCapacity: null,
      diningCapacity: null,
      parkingCapacity: null,
      airConditioned: false,
      stageAvailable: false,
      wheelchairAccessible: false,
      featuredVenue: false,
      verifiedVenue: false,
      suitableFor: [],
    };
  }

  const venueType = row.venue_type != null ? String(row.venue_type).trim() : "";
  return {
    venueType: VENUE_TYPE_SET.has(venueType) ? venueType : venueType || null,
    yearsInBusiness: parsePositiveInt(row.years_in_business),
    guestCapacity: parsePositiveInt(row.guest_capacity),
    diningCapacity: parsePositiveInt(row.dining_capacity),
    parkingCapacity: parsePositiveInt(row.parking_capacity),
    airConditioned: Boolean(row.air_conditioned),
    stageAvailable: Boolean(row.stage_available),
    wheelchairAccessible: Boolean(row.wheelchair_accessible),
    featuredVenue: Boolean(row.featured_venue),
    verifiedVenue: Boolean(row.verified_venue),
    suitableFor: parseSuitableForArray(row.suitable_for),
  };
}

/**
 * Vendor-editable highlight payload (excludes admin flags).
 * @param {unknown} raw
 * @param {{ requireAll?: boolean }} [opts]
 */
export function validateVenueHighlightsPayload(raw, opts = {}) {
  const requireAll = opts.requireAll !== false;
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "venueHighlights must be an object" };
  }

  const venueType = raw.venueType != null ? String(raw.venueType).trim() : "";
  if (requireAll && !venueType) {
    return { ok: false, error: "Venue type is required" };
  }
  if (venueType && !VENUE_TYPE_SET.has(venueType)) {
    return { ok: false, error: "Invalid venue type" };
  }

  const guestCapacity = parsePositiveInt(raw.guestCapacity);
  if (requireAll && (guestCapacity == null || guestCapacity < 1)) {
    return { ok: false, error: "Guest capacity is required (minimum 1)" };
  }
  if (raw.guestCapacity != null && raw.guestCapacity !== "" && guestCapacity == null) {
    return { ok: false, error: "Guest capacity must be a valid number" };
  }

  const yearsInBusiness = parsePositiveInt(raw.yearsInBusiness);
  if (raw.yearsInBusiness != null && raw.yearsInBusiness !== "" && yearsInBusiness == null) {
    return { ok: false, error: "Years in business must be a valid number" };
  }

  const diningCapacity = parsePositiveInt(raw.diningCapacity);
  if (raw.diningCapacity != null && raw.diningCapacity !== "" && diningCapacity == null) {
    return { ok: false, error: "Dining capacity must be a valid number" };
  }

  const parkingCapacity = parsePositiveInt(raw.parkingCapacity);
  if (raw.parkingCapacity != null && raw.parkingCapacity !== "" && parkingCapacity == null) {
    return { ok: false, error: "Parking capacity must be a valid number" };
  }

  const suitableFor = parseSuitableForArray(raw.suitableFor ?? raw.suitable_for);

  return {
    ok: true,
    data: {
      venue_type: venueType || null,
      years_in_business: yearsInBusiness,
      guest_capacity: guestCapacity,
      dining_capacity: diningCapacity,
      parking_capacity: parkingCapacity,
      air_conditioned: parseOptionalBool(raw.airConditioned),
      stage_available: parseOptionalBool(raw.stageAvailable),
      wheelchair_accessible: parseOptionalBool(raw.wheelchairAccessible),
      suitable_for: suitableFor,
    },
  };
}

/**
 * @param {number | null | undefined} years
 */
export function formatYearsInBusinessLabel(years) {
  const n = parsePositiveInt(years);
  if (n == null || n < 1) return null;
  return `${n}+ Years Hosting Events`;
}
