import { normalizeWhatsAppRecipientDigits } from "./whatsappPhone";

/**
 * Single string for template variable {{3}} (wishlist summary).
 */
export function buildWishlistSummaryForTemplate({ venueNames = [], photographyNames = [], catering = [], decoration = [] }) {
  const parts = [];
  if (venueNames.length) parts.push(`Venues: ${venueNames.join(", ")}`);
  if (photographyNames.length) parts.push(`Photo & makeup: ${photographyNames.join(", ")}`);
  if (catering.length) parts.push(`Catering: ${catering.join(", ")}`);
  if (decoration.length) parts.push(`Decoration: ${decoration.join(", ")}`);
  const s = parts.join(" | ") || "General inquiry";
  return s.length > 900 ? `${s.slice(0, 897)}...` : s;
}

/**
 * @param {Array<{ id: string, businessName?: string, phone?: string | null }>} vendors
 * @returns {{ id: string, businessName: string, phoneDigits: string }[]}
 */
export function dedupeVendorTargetsByPhone(vendors) {
  /** @type {Map<string, { id: string, businessName: string, phoneDigits: string }>} */
  const map = new Map();
  for (const v of vendors) {
    const digits = normalizeWhatsAppRecipientDigits(v.phone);
    if (!digits) continue;
    if (!map.has(digits)) {
      map.set(digits, {
        id: v.id,
        businessName: (v.businessName && String(v.businessName).trim()) || "Vendor",
        phoneDigits: digits,
      });
    }
  }
  return [...map.values()];
}
