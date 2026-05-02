/**
 * Normalize raw phone strings to WhatsApp Cloud API `to` field:
 * digits only, international, no leading + (e.g. 919876543210 for India).
 * @param {string | null | undefined} raw
 * @returns {string} empty if invalid
 */
export function normalizeWhatsAppRecipientDigits(raw) {
  if (raw == null) return "";
  let d = String(raw).replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10 && /^[6-9]/.test(d)) d = `91${d}`;
  if (d.length === 11 && d.startsWith("0")) d = `91${d.slice(1)}`;
  if (d.length < 10 || d.length > 15) return "";
  return d;
}
