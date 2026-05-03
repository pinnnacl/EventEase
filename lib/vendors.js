import { parseResponsiveImageField } from "./imageVariants";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { parsePhotographyPackagePrice } from "./photographerProfileContent";
import { normalizeWhatsAppRecipientDigits } from "./whatsappPhone";
import {
  normalizeVenueDetailsForAdminBulkImport,
  parseVenueDetailsArray,
  validateAndNormalizeVenueDetailsPayload,
  PREDEFINED_VENUE_DETAIL_TITLES,
} from "./venueDetails";

/** PostgREST when `facilities` / `gallery_images` jsonb columns are not migrated yet */
function isMissingRichColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const mentionsRich =
    m.includes("facilities") || m.includes("gallery_images") || m.includes("gallery");
  return (
    mentionsRich &&
    (m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist"))
  );
}

/**
 * `vendors.place` — supabase/migrations/006_vendor_place.sql
 * Must not use `m.includes("place")`: that matches the substring inside "re**place**" and caused false
 * retries that stripped `place` from PATCH payloads while other errors were fixed.
 */
function isMissingPlaceColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const refersToPlaceColumn =
    m.includes('"place"') || m.includes("'place'") || /\bplace\b/.test(m);
  if (!refersToPlaceColumn) return false;
  return m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist");
}

function stripRichVenueFields(obj) {
  const next = { ...obj };
  delete next.gallery_images;
  delete next.facilities;
  return next;
}

function stripPlaceField(obj) {
  const next = { ...obj };
  delete next.place;
  return next;
}

function stripVenueDetailsField(obj) {
  const next = { ...obj };
  delete next.venue_details;
  return next;
}

function stripPhotographerProfileField(obj) {
  const next = { ...obj };
  delete next.photographer_profile;
  return next;
}

function stripMakeupProfileField(obj) {
  const next = { ...obj };
  delete next.makeup_profile;
  return next;
}

function stripPhoneVerifiedFields(obj) {
  const next = { ...obj };
  delete next.phone_verified_at;
  delete next.phone_verified_e164;
  return next;
}

function isMissingVenueDetailsColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const refers =
    m.includes('"venue_details"') || m.includes("'venue_details'") || /\bvenue_details\b/.test(m);
  if (!refers) return false;
  return m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist");
}

function isMissingPhotographerProfileColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const refers =
    m.includes('"photographer_profile"') ||
    m.includes("'photographer_profile'") ||
    /\bphotographer_profile\b/.test(m);
  if (!refers) return false;
  return m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist");
}

function isMissingMakeupProfileColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const refers =
    m.includes('"makeup_profile"') || m.includes("'makeup_profile'") || /\bmakeup_profile\b/.test(m);
  if (!refers) return false;
  return m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist");
}

function isMissingPhoneVerifiedColumnError(err) {
  const m = String(err?.message ?? err ?? "").toLowerCase();
  if (!m.includes("column")) return false;
  const refers =
    m.includes('"phone_verified_at"') ||
    m.includes("'phone_verified_at'") ||
    m.includes('"phone_verified_e164"') ||
    m.includes("'phone_verified_e164'") ||
    /\bphone_verified_at\b/.test(m) ||
    /\bphone_verified_e164\b/.test(m);
  if (!refers) return false;
  return m.includes("schema cache") || m.includes("could not find") || m.includes("does not exist");
}

/**
 * @param {object} p - raw makeup profile from client
 */
function normalizeMakeupProfileForDb(p) {
  const next = { ...p };
  delete next.startingPrice;
  if (Array.isArray(next.gallery)) {
    next.gallery = next.gallery.map((u) => String(u).trim()).filter(Boolean).slice(0, 12);
  }
  if (next.ratingScore !== undefined && next.ratingScore !== null && next.ratingScore !== "") {
    const rs = Number(next.ratingScore);
    next.ratingScore = Number.isFinite(rs) && rs > 0 ? Math.min(5, Math.max(1, rs)) : null;
  }
  if (next.reviewCount !== undefined && next.reviewCount !== null && next.reviewCount !== "") {
    const rc = Number(next.reviewCount);
    next.reviewCount = Number.isFinite(rc) && rc >= 0 ? Math.floor(rc) : 0;
  }
  if (Array.isArray(next.packages)) {
    const normalized = [];
    for (const pkg of next.packages) {
      const name = String(pkg?.name || "").trim();
      const priceNum = parsePhotographyPackagePrice(pkg?.price);
      if (!name && priceNum == null) continue;
      if (name && priceNum == null) {
        throw new Error("Each makeup package needs a valid price");
      }
      if (priceNum != null && !name) {
        throw new Error("Each makeup package needs a name");
      }
      normalized.push({
        name,
        price: priceNum,
        tag: String(pkg?.tag || "").trim() || null,
        features: Array.isArray(pkg?.features)
          ? pkg.features.map((f) => String(f || "").trim()).filter(Boolean)
          : [],
      });
    }
    next.packages = normalized;
  }
  if (Array.isArray(next.testimonials)) {
    next.testimonials = next.testimonials
      .map((r) => {
        const author = String(r?.author || r?.name || "").trim();
        const quote = String(r?.quote || r?.text || "").trim();
        const date = String(r?.date || "").trim();
        if (!author || !quote) return null;
        return { author, quote, date: date || "Recent" };
      })
      .filter(Boolean);
  }
  if (next.studio && typeof next.studio === "object") {
    const lat = Number(next.studio.lat);
    const lon = Number(next.studio.lon);
    next.studio = {
      title: String(next.studio.title || "").trim() || "Studio Location",
      address: String(next.studio.address || "").trim(),
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
    };
  }
  if (next.beforeAfter && typeof next.beforeAfter === "object") {
    next.beforeAfter = {
      before: String(next.beforeAfter.before || "").trim() || null,
      after: String(next.beforeAfter.after || "").trim() || null,
    };
  }
  if (next.urgency && typeof next.urgency === "object") {
    next.urgency = {
      line: String(next.urgency.line || "").trim(),
      sub: String(next.urgency.sub || "").trim(),
    };
  }
  if (next.stats && typeof next.stats === "object") {
    next.stats = {
      experience: String(next.stats.experience || "").trim(),
      weddings: String(next.stats.weddings || "").trim(),
      location: String(next.stats.location || "").trim(),
    };
  }
  if (next.serviceBlurbs && typeof next.serviceBlurbs === "object") {
    next.serviceBlurbs = {
      bridal: String(next.serviceBlurbs.bridal || "").trim(),
      groom: String(next.serviceBlurbs.groom || "").trim(),
      family: String(next.serviceBlurbs.family || "").trim(),
      airbrush: String(next.serviceBlurbs.airbrush || "").trim(),
    };
  }
  if (next.whatsapp != null) {
    next.whatsapp = String(next.whatsapp).replace(/\D/g, "") || null;
  }
  if (next.aiWidget && typeof next.aiWidget === "object") {
    next.aiWidget = {
      title: String(next.aiWidget.title || "").trim(),
      body: String(next.aiWidget.body || "").trim(),
      cta: String(next.aiWidget.cta || "").trim(),
    };
  }
  if (next.bioTitle != null) next.bioTitle = String(next.bioTitle || "").trim();
  if (next.bio != null) next.bio = String(next.bio || "").trim();
  if (next.specialty != null) next.specialty = String(next.specialty || "").trim();
  if (next.tagline != null) next.tagline = String(next.tagline || "").trim();
  return next;
}

/** Public `place` label — only from `vendors.place` (see supabase/migrations/006_vendor_place.sql). */
function derivePublicPlace(row) {
  if (!row) return "";
  return row.place != null && String(row.place).trim() ? String(row.place).trim() : "";
}

const VENUE_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1519167758481-83f29da1c0c9?w=1600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80",
  "https://images.unsplash.com/photo-1523438880610-6e5fd7a2d7a8?w=1600&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80",
];

export const DEFAULT_FACILITIES = [
  "Air Conditioning",
  "Parking",
  "Dining hall",
  "Bridal room",
  "Stage",
  "Generator backup",
];

function parseAdminCoord(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapVendorRow(row) {
  if (!row) return null;
  const loc = typeof row.location === "string" ? row.location : "";
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  const cityCol = row.city != null && String(row.city).trim() ? String(row.city).trim() : "";
  const stateCol = row.state != null && String(row.state).trim() ? String(row.state).trim() : "";
  const rawGallery = row.gallery_images;
  const rawFacilities = row.facilities;
  const rawVenueDetails = row.venue_details;
  const rawPhotographerProfile = row.photographer_profile;
  const rawMakeupProfile = row.makeup_profile;
  const profileParsed = parseResponsiveImageField(row.profile_image);
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    category: row.category,
    location: loc,
    city: cityCol || parts[0] || "",
    state: stateCol || (parts.length >= 2 ? parts[parts.length - 1] : "") || parts[1] || "",
    place: derivePublicPlace(row),
    phone: row.phone ?? "",
    description: row.description ?? "",
    pricingRange: row.price_range ?? "",
    priceRange: row.price_range ?? "",
    /** Primary URL for listings, OG, and `<img src>` (large variant when JSON stored) */
    profileImage: profileParsed?.large ?? row.profile_image ?? null,
    /** Raw DB value (plain URL or JSON string); use for vendor profile form */
    profileImageStored: row.profile_image ?? null,
    profileImageResponsive: profileParsed,
    status: row.status,
    claimed: Boolean(row.claimed),
    capacity: row.capacity ?? null,
    createdAt: row.created_at,
    galleryImages: Array.isArray(rawGallery) ? rawGallery.map((u) => String(u).trim()).filter(Boolean).slice(0, 12) : [],
    facilities: Array.isArray(rawFacilities)
      ? rawFacilities.map((f) => String(f).trim()).filter(Boolean)
      : [],
    venueDetails: parseVenueDetailsArray(rawVenueDetails),
    photographerProfile:
      rawPhotographerProfile && typeof rawPhotographerProfile === "object" && !Array.isArray(rawPhotographerProfile)
        ? rawPhotographerProfile
        : {},
    makeupProfile:
      rawMakeupProfile && typeof rawMakeupProfile === "object" && !Array.isArray(rawMakeupProfile)
        ? rawMakeupProfile
        : {},
    /** WGS84 — admin-managed in DB only; used for distance on listings */
    lat: parseAdminCoord(row.latitude),
    lng: parseAdminCoord(row.longitude),
    phoneVerifiedAt: row.phone_verified_at ?? null,
    phoneVerifiedE164: row.phone_verified_e164 ?? null,
  };
}

/**
 * Gallery URLs for detail UI: DB `gallery_images` JSON array, else profile + tasteful fallbacks.
 */
export function buildVenueGalleryImages(row) {
  if (!row) return [];
  const raw = row.gallery_images;
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((u) => parseResponsiveImageField(String(u).trim())?.large || String(u).trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  const cat = String(row.category || "").trim();
  if (cat === "Photographer" || cat === "Makeup") {
    const primary = row.profile_image
      ? parseResponsiveImageField(String(row.profile_image))?.large || String(row.profile_image).trim()
      : "";
    return primary ? [primary] : [];
  }
  const primary = row.profile_image ? parseResponsiveImageField(String(row.profile_image))?.large || String(row.profile_image).trim() : "";
  const pool = [primary, ...VENUE_IMAGE_FALLBACKS].filter(Boolean);
  return [...new Set(pool)].slice(0, 5);
}

/** Facilities list: DB JSON array or sensible defaults for venues only */
export function buildVenueFacilities(row) {
  if (!row) return [];
  const raw = row.facilities;
  if (Array.isArray(raw) && raw.length) {
    return raw.map((f) => String(f).trim()).filter(Boolean);
  }
  if (String(row.category || "").trim() === "Venue") {
    return DEFAULT_FACILITIES;
  }
  return [];
}

/** Public detail shape for /venue/[id] */
export function mapVenueDetail(row) {
  const base = mapVendorRow(row);
  if (!base) return null;
  const rawGallery = row.gallery_images;
  const galleryImagesResponsive =
    Array.isArray(rawGallery) && rawGallery.length
      ? rawGallery.map((u) => parseResponsiveImageField(String(u).trim())).filter(Boolean).slice(0, 12)
      : [];
  return {
    ...base,
    galleryImages: buildVenueGalleryImages(row),
    galleryImagesResponsive,
    facilities: buildVenueFacilities(row),
  };
}

/**
 * @param {object} data
 * @param {string} data.userId - auth user id
 * @param {object} data.payload
 */
export async function createVendor({ userId, payload }) {
  const admin = getSupabaseAdmin();
  const location =
    typeof payload.location === "string" && payload.location.trim()
      ? payload.location.trim()
      : [payload.city, payload.state].filter(Boolean).join(", ");

  const placeVal =
    payload.place != null && String(payload.place).trim() ? String(payload.place).trim() : null;

  const insert = {
    user_id: userId,
    business_name: String(payload.businessName || "").trim(),
    category: String(payload.category || "").trim(),
    location,
    ...(placeVal != null ? { place: placeVal } : {}),
    phone: payload.phone != null ? String(payload.phone).trim() : null,
    price_range: payload.pricingRange != null ? String(payload.pricingRange).trim() : null,
    capacity: payload.capacity != null ? String(payload.capacity).trim() : null,
    description: String(payload.description || "").trim(),
    profile_image: payload.profileImage != null ? String(payload.profileImage).trim() : null,
    gallery_images: Array.isArray(payload.galleryImages)
      ? payload.galleryImages.map((u) => String(u).trim()).filter(Boolean).slice(0, 12)
      : [],
    facilities: Array.isArray(payload.facilities)
      ? payload.facilities.map((f) => String(f).trim()).filter(Boolean)
      : [],
    venue_details: [],
    photographer_profile: {},
    makeup_profile: {},
    status: "pending",
    claimed: false,
  };

  let insertAttempt = insert;
  let richDropped = false;
  let placeDropped = false;
  let venueDetailsDropped = false;
  let photographerProfileDropped = false;
  let makeupProfileDropped = false;

  for (let i = 0; i < 8; i++) {
    let { data, error } = await admin.from("vendors").insert(insertAttempt).select("*").single();
    if (!error) {
      return {
        data: mapVendorRow(data),
        error: null,
        richFieldsDropped: richDropped,
        placeFieldsDropped: placeDropped,
        venueDetailsDropped,
        photographerProfileDropped,
        makeupProfileDropped,
      };
    }
    if (isMissingRichColumnError(error) && ("gallery_images" in insertAttempt || "facilities" in insertAttempt)) {
      insertAttempt = stripRichVenueFields(insertAttempt);
      richDropped = true;
      continue;
    }
    if (isMissingPlaceColumnError(error) && "place" in insertAttempt) {
      insertAttempt = stripPlaceField(insertAttempt);
      placeDropped = true;
      continue;
    }
    if (isMissingVenueDetailsColumnError(error) && "venue_details" in insertAttempt) {
      insertAttempt = stripVenueDetailsField(insertAttempt);
      venueDetailsDropped = true;
      continue;
    }
    if (isMissingPhotographerProfileColumnError(error) && "photographer_profile" in insertAttempt) {
      insertAttempt = stripPhotographerProfileField(insertAttempt);
      photographerProfileDropped = true;
      continue;
    }
    if (isMissingMakeupProfileColumnError(error) && "makeup_profile" in insertAttempt) {
      insertAttempt = stripMakeupProfileField(insertAttempt);
      makeupProfileDropped = true;
      continue;
    }
    return { data: null, error };
  }
  return { data: null, error: new Error("Could not create vendor profile") };
}

/** Categories allowed for admin bulk-created listings (must match app usage). */
export const ADMIN_IMPORT_VENDOR_CATEGORIES = [
  "Photographer",
  "Makeup",
  "Venue",
  "Catering",
  "Decoration",
  "Transport",
];

const ADMIN_IMPORT_CATEGORY_SET = new Set(ADMIN_IMPORT_VENDOR_CATEGORIES);

/**
 * @param {unknown} v
 * @returns {unknown[]}
 */
function coerceAdminImportVenueDetailsArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (!Array.isArray(parsed)) throw new Error("venueDetails JSON must be an array");
      return parsed;
    } catch (e) {
      if (e instanceof Error && e.message.includes("venueDetails")) throw e;
      throw new Error("venueDetails must be valid JSON array when provided as a string");
    }
  }
  return [];
}

/**
 * @param {object} raw
 * @returns {boolean}
 */
function adminImportRowDeclaresVenueDetails(raw) {
  const v = raw?.venueDetails ?? raw?.venue_details;
  if (typeof v === "string" && v.trim()) return true;
  if (Array.isArray(v) && v.length > 0) return true;
  const bt = raw?.venueDetailsByTitle;
  if (bt != null && typeof bt === "object" && !Array.isArray(bt) && Object.keys(bt).length > 0) return true;
  const ex = raw?.venueDetailsCustom;
  if (Array.isArray(ex) && ex.length > 0) return true;
  return false;
}

/**
 * Build a single list of venue detail rows for bulk import (JSON or CSV string column).
 * Prefers `venueDetails` / `venue_details` when non-empty; else `venueDetailsByTitle` + `venueDetailsCustom`.
 * @param {object} raw
 */
function parseVenueDetailsInputForAdminImport(raw) {
  const fromMain = coerceAdminImportVenueDetailsArray(raw?.venueDetails ?? raw?.venue_details);
  if (fromMain.length > 0) return fromMain;

  /** @type {{ title: string, description: string, isCustom: boolean }[]} */
  const out = [];
  const byTitle = raw?.venueDetailsByTitle;
  if (byTitle != null && typeof byTitle === "object" && !Array.isArray(byTitle)) {
    for (const t of PREDEFINED_VENUE_DETAIL_TITLES) {
      if (Object.prototype.hasOwnProperty.call(byTitle, t)) {
        out.push({ title: t, description: String(byTitle[t] ?? "").trim(), isCustom: false });
      }
    }
  }
  const extra = Array.isArray(raw?.venueDetailsCustom) ? raw.venueDetailsCustom : [];
  for (const c of extra) {
    if (!c || typeof c !== "object") continue;
    const title = String(c.title ?? "").trim();
    const description = String(c.description ?? "").trim();
    if (!title && !description) continue;
    out.push({ title, description, isCustom: true });
  }
  return out;
}

/**
 * Normalize and validate one admin import row (throws on invalid input).
 * @param {object} raw
 * @param {"pending"|"approved"|"rejected"} defaultStatus
 */
export function normalizeAdminVendorImportRow(raw, defaultStatus = "pending") {
  const businessName = String(raw?.businessName ?? "").trim();
  const category = String(raw?.category ?? "").trim();
  const city = String(raw?.city ?? "").trim();
  const state = String(raw?.state ?? "").trim();
  const place = raw?.place != null ? String(raw.place).trim() : "";
  const phone = String(raw?.phone ?? "").trim();
  const description = String(raw?.description ?? "").trim();
  const pricingRange = raw?.pricingRange != null ? String(raw.pricingRange).trim() : "";
  const capacity = raw?.capacity != null ? String(raw.capacity).trim() : "";
  const profileImage = raw?.profileImage != null ? String(raw.profileImage).trim() : null;

  if (!businessName) throw new Error("businessName is required");
  if (!ADMIN_IMPORT_CATEGORY_SET.has(category)) {
    throw new Error(`category must be one of: ${ADMIN_IMPORT_VENDOR_CATEGORIES.join(", ")}`);
  }
  if (!city || !state) throw new Error("city and state are required");
  if (!phone) throw new Error("phone is required");
  if (description.length < 20) throw new Error("description must be at least 20 characters");

  let status = String(raw?.status ?? defaultStatus).trim().toLowerCase();
  if (!["pending", "approved", "rejected"].includes(status)) status = defaultStatus;

  const location = [city, state].filter(Boolean).join(", ");
  const placeVal = place || null;

  let gallery_images = [];
  if (Array.isArray(raw?.galleryImages)) {
    gallery_images = raw.galleryImages.map((u) => String(u).trim()).filter(Boolean).slice(0, 12);
  } else if (typeof raw?.galleryImages === "string" && raw.galleryImages.trim()) {
    gallery_images = raw.galleryImages
      .split(/[,|\n]/)
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  let facilities = [];
  if (Array.isArray(raw?.facilities)) {
    facilities = raw.facilities.map((f) => String(f).trim()).filter(Boolean).slice(0, 32);
  } else if (typeof raw?.facilities === "string" && raw.facilities.trim()) {
    facilities = raw.facilities
      .split(/[,|\n]/)
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 32);
  }

  if (category !== "Venue" && adminImportRowDeclaresVenueDetails(raw)) {
    throw new Error("venueDetails is only supported when category is Venue");
  }

  let venue_details = [];
  if (category === "Venue") {
    const detailRows = parseVenueDetailsInputForAdminImport(raw);
    if (detailRows.length > 0) {
      const vnorm = normalizeVenueDetailsForAdminBulkImport(detailRows);
      if (!vnorm.ok) {
        throw new Error(vnorm.error || "Invalid venueDetails");
      }
      venue_details = vnorm.data;
    }
  }

  return {
    user_id: null,
    business_name: businessName,
    category,
    location,
    city,
    state,
    ...(placeVal ? { place: placeVal } : {}),
    phone,
    price_range: pricingRange || null,
    capacity: capacity || null,
    description,
    profile_image: profileImage || null,
    gallery_images,
    facilities,
    venue_details,
    photographer_profile: {},
    makeup_profile: {},
    status,
    claimed: false,
  };
}

/**
 * Admin-only: insert multiple vendor rows without a linked vendor auth user (`user_id` NULL).
 * Requires DB migration `010_vendor_null_user_admin_imports.sql`.
 * @param {object[]} rows
 * @param {{ defaultStatus?: "pending"|"approved"|"rejected", maxRows?: number }} [options]
 */
export async function adminBulkCreateVendors(rows, options = {}) {
  const maxRows = Math.min(Math.max(Number(options.maxRows) || 50, 1), 100);
  const defaultStatus = ["pending", "approved", "rejected"].includes(options.defaultStatus)
    ? options.defaultStatus
    : "pending";

  if (!Array.isArray(rows) || rows.length === 0) {
    return { created: [], errors: [{ index: 0, error: "No rows to import" }] };
  }

  const slice = rows.slice(0, maxRows);
  const admin = getSupabaseAdmin();
  /** @type {ReturnType<typeof mapVendorRow>[]} */
  const created = [];
  /** @type {{ index: number, businessName?: string, error: string }[]} */
  const errors = [];

  for (let i = 0; i < slice.length; i++) {
    const raw = slice[i];
    let insertAttempt;
    try {
      insertAttempt = normalizeAdminVendorImportRow(raw, defaultStatus);
    } catch (e) {
      errors.push({
        index: i + 1,
        businessName: typeof raw?.businessName === "string" ? raw.businessName : undefined,
        error: e instanceof Error ? e.message : String(e),
      });
      continue;
    }

    let attempt = { ...insertAttempt };
    let inserted = false;

    for (let r = 0; r < 8; r++) {
      const { data, error } = await admin.from("vendors").insert(attempt).select("*").single();
      if (!error && data) {
        created.push(mapVendorRow(data));
        inserted = true;
        break;
      }
      if (isMissingRichColumnError(error) && ("gallery_images" in attempt || "facilities" in attempt)) {
        attempt = stripRichVenueFields(attempt);
        continue;
      }
      if (isMissingPlaceColumnError(error) && "place" in attempt) {
        attempt = stripPlaceField(attempt);
        continue;
      }
      if (isMissingVenueDetailsColumnError(error) && "venue_details" in attempt) {
        attempt = stripVenueDetailsField(attempt);
        continue;
      }
      if (isMissingPhotographerProfileColumnError(error) && "photographer_profile" in attempt) {
        attempt = stripPhotographerProfileField(attempt);
        continue;
      }
      if (isMissingMakeupProfileColumnError(error) && "makeup_profile" in attempt) {
        attempt = stripMakeupProfileField(attempt);
        continue;
      }
      errors.push({
        index: i + 1,
        businessName: insertAttempt.business_name,
        error: error?.message || "Insert failed",
      });
      break;
    }

    if (!inserted) {
      const already = errors.some((e) => e.index === i + 1);
      if (!already) {
        errors.push({
          index: i + 1,
          businessName: insertAttempt.business_name,
          error: "Could not insert vendor after retries",
        });
      }
    }
  }

  return { created, errors };
}

/**
 * @param {{ category?: string }} [filters]
 */
export async function getApprovedVendors(filters = {}) {
  const admin = getSupabaseAdmin();
  let q = admin.from("vendors").select("*").eq("status", "approved").order("created_at", { ascending: false });
  if (filters.category) {
    q = q.eq("category", filters.category);
  }
  const { data, error } = await q;
  if (error) return { data: [], error };
  return { data: (data || []).map(mapVendorRow), error: null };
}

/** All vendors for admin moderation (service role). */
export async function getAllVendors() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").select("*").order("created_at", { ascending: false });
  if (error) return { data: [], error };
  return { data: (data || []).map(mapVendorRow), error: null };
}

export async function getVendorByUser(userId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").select("*").eq("user_id", userId).maybeSingle();
  if (error) return { data: null, error };
  return { data: data ? mapVendorRow(data) : null, error: null };
}

export async function getVendorById(id) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").select("*").eq("id", id).maybeSingle();
  if (error) return { data: null, error };
  return { data: data ? mapVendorRow(data) : null, error: null };
}

/**
 * Approved vendors matching id list (for server-side batch messaging).
 * @param {string[]} ids
 */
export async function getApprovedVendorsByIds(ids) {
  const admin = getSupabaseAdmin();
  const uniq = [...new Set((ids || []).filter((x) => typeof x === "string" && x.trim()))];
  if (uniq.length === 0) return { data: [], error: null };
  const { data, error } = await admin.from("vendors").select("*").in("id", uniq).eq("status", "approved");
  if (error) return { data: [], error };
  return { data: (data || []).map(mapVendorRow), error: null };
}

export async function updateVendorStatus(id, status) {
  if (!["pending", "approved", "rejected"].includes(status)) {
    return { data: null, error: new Error("Invalid status") };
  }
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").update({ status }).eq("id", id).select("*").single();
  if (error) return { data: null, error };
  return { data: mapVendorRow(data), error: null };
}

export async function approveVendor(id) {
  return updateVendorStatus(id, "approved");
}

export async function rejectVendor(id) {
  return updateVendorStatus(id, "rejected");
}

export async function deleteVendorByAdmin(id) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").delete().eq("id", id).select("*").maybeSingle();
  if (error) return { data: null, error };
  return { data: data ? mapVendorRow(data) : null, error: null };
}

/**
 * Admin-only: set or clear WGS84 coordinates (vendors cannot call this from their dashboard).
 * Pass `{ latitude: null, longitude: null }` to clear.
 */
export async function updateVendorCoordinatesByAdmin(id, { latitude, longitude }) {
  if (latitude === null && longitude === null) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("vendors")
      .update({ latitude: null, longitude: null })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return { data: null, error };
    return { data: mapVendorRow(data), error: null };
  }

  const lat = typeof latitude === "number" ? latitude : Number(latitude);
  const lng = typeof longitude === "number" ? longitude : Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { data: null, error: new Error("Invalid coordinates") };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { data: null, error: new Error("Coordinates out of valid range") };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendors")
    .update({ latitude: lat, longitude: lng })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error };
  return { data: mapVendorRow(data), error: null };
}

/**
 * Admin-only: set `profile_image` and/or `gallery_images` (same storage rules as vendor dashboard:
 * plain URL or JSON string with thumb/medium/large per slot).
 * Pass `profileImage: null` to clear the profile image.
 */
export async function updateVendorMediaByAdmin(id, { profileImage, galleryImages }) {
  const admin = getSupabaseAdmin();
  const { data: existing, error: exErr } = await admin.from("vendors").select("id").eq("id", id).maybeSingle();
  if (exErr) return { data: null, error: exErr };
  if (!existing) return { data: null, error: new Error("Vendor not found") };

  const patch = {};
  if (profileImage !== undefined) {
    if (profileImage === null) {
      patch.profile_image = null;
    } else {
      const s = String(profileImage).trim();
      patch.profile_image = s || null;
    }
  }
  if (galleryImages !== undefined) {
    const arr = Array.isArray(galleryImages) ? galleryImages : [];
    patch.gallery_images = arr.map((u) => String(u).trim()).filter(Boolean).slice(0, 12);
  }

  if (Object.keys(patch).length === 0) {
    return getVendorById(id);
  }

  const { data, error } = await admin.from("vendors").update(patch).eq("id", id).select("*").single();
  if (error) return { data: null, error };
  return { data: mapVendorRow(data), error: null };
}

/**
 * Vendor self-service: mark profile phone as verified via Firebase OTP.
 * `phoneDigits` should be international digits-only (e.g. 919876543210).
 */
export async function markVendorPhoneVerifiedByUserId(userId, phoneDigits, draftPhoneRaw) {
  const admin = getSupabaseAdmin();
  const digits = normalizeWhatsAppRecipientDigits(phoneDigits);
  if (!digits) return { data: null, error: new Error("Invalid phone number for verification") };

  const { data: existing, error: exErr } = await admin
    .from("vendors")
    .select("id, phone")
    .eq("user_id", userId)
    .maybeSingle();
  if (exErr) return { data: null, error: exErr };
  if (!existing?.id) return { data: null, error: new Error("No vendor profile") };

  const draftDigits = draftPhoneRaw != null ? normalizeWhatsAppRecipientDigits(String(draftPhoneRaw)) : "";
  const currentDigits = normalizeWhatsAppRecipientDigits(existing.phone || "");
  const effectiveDigits = draftDigits || currentDigits;
  if (!effectiveDigits || effectiveDigits !== digits) {
    return { data: null, error: new Error("OTP phone does not match your current profile phone") };
  }

  const { data, error } = await admin
    .from("vendors")
    .update({
      phone: draftPhoneRaw != null ? String(draftPhoneRaw).trim() : existing.phone,
      phone_verified_at: new Date().toISOString(),
      phone_verified_e164: digits,
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) {
    if (isMissingPhoneVerifiedColumnError(error)) {
      return {
        data: null,
        error: new Error(
          "Phone verification columns are missing. Run supabase/migrations/013_vendor_phone_verification.sql in Supabase SQL editor.",
        ),
      };
    }
    return { data: null, error };
  }
  return { data: mapVendorRow(data), error: null };
}

/**
 * After WhatsApp OTP verify: set `vendors.phone` to the number the vendor entered and mark verified.
 * @param {string} userId
 * @param {string} destinationDigits international digits only (must match Cloud API recipient)
 * @param {string | null | undefined} clientPhoneRaw value from profile form (trimmed); stored as `phone`
 */
export async function applyVendorPhoneVerifiedAfterWhatsAppOtp(userId, destinationDigits, clientPhoneRaw) {
  const admin = getSupabaseAdmin();
  const digits = normalizeWhatsAppRecipientDigits(destinationDigits);
  if (!digits) {
    return { data: null, error: new Error("Invalid verified phone number") };
  }
  const raw = clientPhoneRaw != null ? String(clientPhoneRaw).trim() : "";
  const fromClient = normalizeWhatsAppRecipientDigits(raw);
  if (raw && fromClient && fromClient !== digits) {
    return { data: null, error: new Error("Verified phone does not match the number you submitted") };
  }

  const phoneToStore = raw || `+${digits}`;

  const { data: existing, error: exErr } = await admin.from("vendors").select("id").eq("user_id", userId).maybeSingle();
  if (exErr) return { data: null, error: exErr };
  if (!existing?.id) return { data: null, error: new Error("No vendor profile") };

  const { data, error } = await admin
    .from("vendors")
    .update({
      phone: phoneToStore,
      phone_verified_at: new Date().toISOString(),
      phone_verified_e164: digits,
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) {
    if (isMissingPhoneVerifiedColumnError(error)) {
      return {
        data: null,
        error: new Error(
          "Phone verification columns are missing. Run supabase/migrations/013_vendor_phone_verification.sql in Supabase SQL editor.",
        ),
      };
    }
    return { data: null, error };
  }
  return { data: mapVendorRow(data), error: null };
}

export async function updateVendorProfile(userId, payload) {
  const admin = getSupabaseAdmin();
  const { data: existing, error: exErr } = await admin.from("vendors").select("id, category, phone").eq("user_id", userId).maybeSingle();
  if (exErr) return { data: null, error: exErr };
  if (!existing) return { data: null, error: new Error("No vendor profile") };

  const effectiveCategory =
    payload.category !== undefined ? String(payload.category || "").trim() : String(existing.category || "").trim();

  const patch = {};
  if (payload.businessName !== undefined) patch.business_name = String(payload.businessName || "").trim();
  if (payload.category !== undefined) patch.category = String(payload.category || "").trim();
  if (payload.place !== undefined) {
    const p = payload.place != null ? String(payload.place).trim() : "";
    patch.place = p || null;
  }

  const hasAddress =
    payload.location !== undefined || payload.city !== undefined || payload.state !== undefined;
  if (hasAddress) {
    const fullLine =
      typeof payload.location === "string" && payload.location.trim() ? payload.location.trim() : "";
    const city = payload.city != null ? String(payload.city).trim() : "";
    const state = payload.state != null ? String(payload.state).trim() : "";
    const loc = fullLine || [city, state].filter(Boolean).join(", ");
    if (loc) patch.location = loc;
  }
  if (payload.phone !== undefined) {
    const newP = payload.phone != null ? String(payload.phone).trim() : null;
    patch.phone = newP;
    const oldDigits = normalizeWhatsAppRecipientDigits(existing.phone || "");
    const newDigits = normalizeWhatsAppRecipientDigits(newP || "");
    if (oldDigits !== newDigits) {
      patch.phone_verified_at = null;
      patch.phone_verified_e164 = null;
    }
  }
  if (payload.pricingRange !== undefined) {
    patch.price_range = payload.pricingRange != null ? String(payload.pricingRange).trim() : null;
  }
  if (payload.capacity !== undefined) patch.capacity = payload.capacity != null ? String(payload.capacity).trim() : null;
  if (payload.description !== undefined) patch.description = String(payload.description || "").trim();
  if (payload.profileImage !== undefined) {
    const s = String(payload.profileImage || "").trim();
    patch.profile_image = s || null;
  }
  if (payload.galleryImages !== undefined) {
    const arr = Array.isArray(payload.galleryImages) ? payload.galleryImages : [];
    patch.gallery_images = arr.map((u) => String(u).trim()).filter(Boolean).slice(0, 12);
  }
  if (payload.facilities !== undefined) {
    const arr = Array.isArray(payload.facilities) ? payload.facilities : [];
    patch.facilities = arr.map((f) => String(f).trim()).filter(Boolean).slice(0, 32);
  }

  if (payload.venueDetails !== undefined) {
    if (effectiveCategory !== "Venue") {
      return { data: null, error: new Error("venueDetails is only valid for Venue category") };
    }
    const v = validateAndNormalizeVenueDetailsPayload(payload.venueDetails);
    if (!v.ok) return { data: null, error: new Error(v.error) };
    patch.venue_details = v.data;
  }

  if (payload.photographerProfile !== undefined) {
    const p = payload.photographerProfile;
    if (p == null || typeof p !== "object" || Array.isArray(p)) {
      return { data: null, error: new Error("photographerProfile must be an object") };
    }
    if (effectiveCategory === "Photographer") {
      const next = { ...p };
      delete next.startingPrice;
      if (Array.isArray(next.packages)) {
        const normalized = [];
        for (const pkg of next.packages) {
          const name = String(pkg?.name || "").trim();
          const priceNum = parsePhotographyPackagePrice(pkg?.price);
          if (!name || priceNum == null) {
            return { data: null, error: new Error("Each package needs a name and a valid price") };
          }
          normalized.push({
            name,
            price: priceNum,
            duration: String(pkg?.duration || pkg?.per || "1 day").trim() || "1 day",
            description: String(pkg?.description || "").trim(),
            features: Array.isArray(pkg?.features)
              ? pkg.features.map((f) => String(f || "").trim()).filter(Boolean)
              : [],
            recommended: Boolean(pkg?.recommended),
          });
        }
        next.packages = normalized;
      }
      patch.photographer_profile = next;
    } else {
      patch.photographer_profile = p;
    }
  }

  if (payload.makeupProfile !== undefined) {
    const p = payload.makeupProfile;
    if (p == null || typeof p !== "object" || Array.isArray(p)) {
      return { data: null, error: new Error("makeupProfile must be an object") };
    }
    if (effectiveCategory === "Makeup") {
      try {
        patch.makeup_profile = normalizeMakeupProfileForDb({ ...p });
      } catch (e) {
        return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
      }
    }
  }

  if (effectiveCategory !== "Venue") {
    patch.venue_details = [];
  }
  if (effectiveCategory !== "Photographer") {
    patch.photographer_profile = {};
  }
  if (effectiveCategory !== "Makeup") {
    patch.makeup_profile = {};
  }

  let attempt = { ...patch };
  let richDropped = false;
  let placeDropped = false;
  let venueDetailsDropped = false;
  let photographerProfileDropped = false;
  let makeupProfileDropped = false;
  let phoneVerificationFieldsDropped = false;

  for (let i = 0; i < 8; i++) {
    let { data, error } = await admin.from("vendors").update(attempt).eq("user_id", userId).select("*").single();
    if (!error) {
      return {
        data: mapVendorRow(data),
        error: null,
        richFieldsDropped: richDropped,
        placeFieldsDropped: placeDropped,
        venueDetailsDropped,
        photographerProfileDropped,
        makeupProfileDropped,
        phoneVerificationFieldsDropped,
      };
    }

    if (isMissingRichColumnError(error) && ("gallery_images" in attempt || "facilities" in attempt)) {
      attempt = stripRichVenueFields(attempt);
      richDropped = true;
      continue;
    }
    if (isMissingPlaceColumnError(error) && "place" in attempt) {
      attempt = stripPlaceField(attempt);
      placeDropped = true;
      continue;
    }
    if (isMissingVenueDetailsColumnError(error) && "venue_details" in attempt) {
      attempt = stripVenueDetailsField(attempt);
      venueDetailsDropped = true;
      continue;
    }
    if (isMissingPhotographerProfileColumnError(error) && "photographer_profile" in attempt) {
      attempt = stripPhotographerProfileField(attempt);
      photographerProfileDropped = true;
      continue;
    }
    if (isMissingMakeupProfileColumnError(error) && "makeup_profile" in attempt) {
      attempt = stripMakeupProfileField(attempt);
      makeupProfileDropped = true;
      continue;
    }
    if (
      isMissingPhoneVerifiedColumnError(error) &&
      ("phone_verified_at" in attempt || "phone_verified_e164" in attempt)
    ) {
      attempt = stripPhoneVerifiedFields(attempt);
      phoneVerificationFieldsDropped = true;
      continue;
    }
    return { data: null, error };
  }

  return { data: null, error: new Error("Could not update vendor profile") };
}

export async function deleteVendorByUserId(userId) {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("vendors").delete().eq("user_id", userId);
  return { error };
}

export async function getUserProfile(userId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function upsertUserProfile({ id, email, role }) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .upsert({ id, email, role }, { onConflict: "id" })
    .select("*")
    .single();
  return { data, error };
}

/** Approved vendor only — for public venue detail */
export async function getPublicVenueById(id) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendors")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };
  return { data: mapVenueDetail(data), error: null };
}

/** Any status — admin preview of the public venue page (same shape as getPublicVenueById) */
export async function getVenueDetailByIdAnyStatus(id) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("vendors").select("*").eq("id", id).maybeSingle();
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };
  return { data: mapVenueDetail(data), error: null };
}

/** Similar listings: same category first, else any approved (excludes id) */
export async function getSimilarVenues(excludeId, category, limit = 4) {
  const admin = getSupabaseAdmin();
  if (category) {
    const { data: byCat, error: errCat } = await admin
      .from("vendors")
      .select("*")
      .eq("status", "approved")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(limit);
    if (errCat) return { data: [], error: errCat };
    if (byCat?.length) return { data: byCat.map(mapVendorRow), error: null };
  }
  const { data, error } = await admin
    .from("vendors")
    .select("*")
    .eq("status", "approved")
    .neq("id", excludeId)
    .limit(limit);
  if (error) return { data: [], error };
  return { data: (data || []).map(mapVendorRow), error: null };
}
