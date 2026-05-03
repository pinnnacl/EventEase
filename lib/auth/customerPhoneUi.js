/**
 * Client-side India mobile helpers for customer phone OTP UI.
 * @param {string | null | undefined} raw
 */
export function isTenDigitIndiaMobile(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(d);
}

/**
 * Full number for OTP subtitle: same digits the user entered after +91 (no masking).
 * @param {string | null | undefined} tenDigits
 */
export function formatOtpPhoneSubtitle(tenDigits) {
  const d = String(tenDigits || "").replace(/\D/g, "").slice(0, 10);
  if (!d) return "+91";
  return `+91 ${d}`;
}
