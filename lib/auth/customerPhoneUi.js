/**
 * Client-side India mobile helpers for customer SMS OTP UI (not WhatsApp).
 * @param {string | null | undefined} raw
 */
export function isTenDigitIndiaMobile(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(d);
}

/**
 * Masked line for OTP subtitle: "Enter OTP sent to +91 XXXXXXXX" style (SMS only).
 * @param {string | null | undefined} tenDigits
 */
export function formatOtpDestinationLine(tenDigits) {
  const d = String(tenDigits || "").replace(/\D/g, "").slice(0, 10);
  if (d.length !== 10) return "+91 XXXXXXXX";
  const last4 = d.slice(-4);
  return `+91 XXXXXX${last4}`;
}
