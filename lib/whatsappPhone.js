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

/**
 * Human-readable hint for which WhatsApp destination was used (no full number in UI).
 * For India (+91), shows first 4 and last 4 of the 10-digit national part so **8891…7048** and **9496…7048**
 * are not confused (last-4-only hints collide).
 * @param {string} toDigits digits only, e.g. 919496587048
 */
export function maskWhatsAppDestinationDigits(toDigits) {
  const d = String(toDigits || "").replace(/\D/g, "");
  if (d.length < 8) return "saved profile number";
  if (d.startsWith("91") && d.length >= 12) {
    const national = d.slice(2);
    const head = national.slice(0, 4);
    const tail = national.slice(-4);
    return `+91 ${head}…${tail}`;
  }
  if (d.startsWith("1") && d.length >= 11) {
    const national = d.slice(1);
    const head = national.slice(0, 3);
    const tail = national.slice(-4);
    return `+1 ${head}…${tail}`;
  }
  const last4 = d.slice(-4);
  return `+…${last4}`;
}
