/**
 * Structured venue details for `vendors.venue_details` (JSON array).
 * Each item: { title: string, description: string, isCustom: boolean }
 */

export const PREDEFINED_VENUE_DETAIL_TITLES = [
  "Capacity",
  "Dining Capacity",
  "Car Park Capacity",
  "Seating & Dining Arrangement",
  "Temperature Control (AC / Non-AC)",
  "Power Backup",
  "Stage Availability",
  "Rooms / Changing Rooms",
  "Kitchen / Catering Policy",
  "Toilets",
  "Access for Elderly & Handicapped",
  "Lift / Elevator",
];

const TITLE_SET = new Set(PREDEFINED_VENUE_DETAIL_TITLES);

/**
 * @param {unknown} raw
 * @returns {{ title: string, description: string, isCustom: boolean }[]}
 */
export function parseVenueDetailsArray(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const title = item.title != null ? String(item.title).trim() : "";
    const description = item.description != null ? String(item.description).trim() : "";
    const isCustom = Boolean(item.isCustom);
    if (!title) continue;
    out.push({ title, description, isCustom });
  }
  return out;
}

/**
 * Initial map title → description for vendor form (predefined keys only).
 * @param {unknown} rawSaved
 */
export function buildPredefinedDescriptionMap(rawSaved) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const t of PREDEFINED_VENUE_DETAIL_TITLES) map[t] = "";
  const arr = parseVenueDetailsArray(rawSaved);
  for (const row of arr) {
    if (!row.isCustom && TITLE_SET.has(row.title)) {
      map[row.title] = row.description;
    }
  }
  return map;
}

/**
 * Custom rows for vendor form.
 * @param {unknown} rawSaved
 */
export function extractCustomVenueDetails(rawSaved) {
  return parseVenueDetailsArray(rawSaved).filter((r) => r.isCustom);
}

/**
 * Build payload array: predefined first (fixed order), then custom.
 * @param {Record<string, string>} predefinedMap
 * @param {{ title: string, description: string }[]} customRows
 */
export function buildVenueDetailsPayload(predefinedMap, customRows) {
  const predefined = PREDEFINED_VENUE_DETAIL_TITLES.map((title) => ({
    title,
    description: (predefinedMap[title] != null ? String(predefinedMap[title]) : "").trim(),
    isCustom: false,
  }));
  const custom = (customRows || [])
    .map((r) => ({
      title: r.title != null ? String(r.title).trim() : "",
      description: r.description != null ? String(r.description).trim() : "",
      isCustom: true,
    }))
    .filter((r) => r.title && r.description);
  return [...predefined, ...custom];
}

/**
 * Server-side validation for Venue category saves.
 * @param {unknown} raw
 * @returns {{ ok: true, data: ReturnType<typeof buildVenueDetailsPayload> } | { ok: false, error: string }}
 */
/**
 * Admin bulk import: merge partial predefined rows + custom; missing predefined descriptions default to "".
 * Public pages still show "Not specified" for empty predefined rows.
 * @param {unknown[]} rawRows — items like `{ title, description, isCustom? }`
 * @returns {{ ok: true, data: ReturnType<typeof buildVenueDetailsPayload> } | { ok: false, error: string }}
 */
export function normalizeVenueDetailsForAdminBulkImport(rawRows) {
  if (!Array.isArray(rawRows)) {
    return { ok: false, error: "venueDetails must be an array" };
  }
  const parsed = parseVenueDetailsArray(rawRows);
  /** @type {Record<string, string>} */
  const preMap = {};
  for (const t of PREDEFINED_VENUE_DETAIL_TITLES) preMap[t] = "";
  for (const row of parsed) {
    if (!row.isCustom && TITLE_SET.has(row.title)) {
      preMap[row.title] = row.description;
    }
  }
  const custom = extractCustomVenueDetails(parsed);
  const data = buildVenueDetailsPayload(preMap, custom);
  return { ok: true, data };
}

export function validateAndNormalizeVenueDetailsPayload(raw) {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "venueDetails must be an array" };
  }
  const parsed = parseVenueDetailsArray(raw);
  const preMap = buildPredefinedDescriptionMap(parsed);
  const custom = extractCustomVenueDetails(parsed);

  for (const t of PREDEFINED_VENUE_DETAIL_TITLES) {
    if (!preMap[t]?.trim()) {
      return { ok: false, error: `Missing description for: ${t}` };
    }
  }
  for (const c of custom) {
    if (!c.title.trim() || !c.description.trim()) {
      return { ok: false, error: "Custom venue details require both title and description" };
    }
  }

  const data = buildVenueDetailsPayload(preMap, custom);
  return { ok: true, data };
}

/**
 * Rows for public UI: all predefined with fallback, then custom (non-empty only).
 * @param {unknown} raw
 */
export function getPublicVenueDetailRows(raw) {
  const parsed = parseVenueDetailsArray(raw);
  const preMap = buildPredefinedDescriptionMap(parsed);
  const predefinedRows = PREDEFINED_VENUE_DETAIL_TITLES.map((title) => {
    const d = preMap[title]?.trim();
    return {
      title,
      description: d || "Not specified",
      isCustom: false,
    };
  });
  const customRows = parsed
    .filter((r) => r.isCustom && r.title.trim() && r.description.trim())
    .map((r) => ({ title: r.title.trim(), description: r.description.trim(), isCustom: true }));
  return [...predefinedRows, ...customRows];
}
