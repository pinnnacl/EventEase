/**
 * Short-lived session proof after vendor completes WhatsApp OTP (used for PATCH /api/vendor/update).
 * Signing uses VENDOR_OTP_SESSION_SECRET (preferred) or CALLBACK_OTP_SECRET fallback.
 */
import { signOtpToken, verifyOtpToken } from "./hmacToken";
import { normalizeWhatsAppRecipientDigits } from "../whatsappPhone";

const LOG_PREFIX = "[vendor-whatsapp-otp]";

/**
 * @returns {string | null}
 */
export function getVendorProfileSigningSecret() {
  const s = process.env.VENDOR_OTP_SESSION_SECRET || process.env.CALLBACK_OTP_SECRET;
  if (!s || !String(s).trim()) return null;
  return String(s).trim();
}

export function isVendorProfileSessionSigningConfigured() {
  return Boolean(getVendorProfileSigningSecret());
}

export function getVendorSessionTtlSec() {
  const n = Number(process.env.VENDOR_OTP_SESSION_TTL_SEC);
  if (Number.isFinite(n) && n >= 300 && n <= 86400) return Math.floor(n);
  return 1800;
}

/**
 * Mint session token after successful WhatsApp OTP. Returns structured error if signing secret missing.
 * @param {string} userId
 * @param {string | undefined} verifiedPhoneDigits international digits only — PATCH must save this same number (or omit phone).
 * @returns {{ ok: true, vendorOtpSession: string, exp: number } | { ok: false, error: string, vendorOtpSession: "", exp: 0 }}
 */
export function tryMintVendorProfileSessionPass(userId, verifiedPhoneDigits) {
  const secret = getVendorProfileSigningSecret();
  if (!secret) {
    console.error(
      `${LOG_PREFIX} tryMintVendorProfileSessionPass: missing VENDOR_OTP_SESSION_SECRET (or CALLBACK_OTP_SECRET)`,
    );
    return {
      ok: false,
      error:
        "Server configuration: set VENDOR_OTP_SESSION_SECRET (recommended) or CALLBACK_OTP_SECRET to issue profile save sessions after WhatsApp OTP.",
      vendorOtpSession: "",
      exp: 0,
    };
  }
  const ttl = getVendorSessionTtlSec();
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const ver = verifiedPhoneDigits != null ? normalizeWhatsAppRecipientDigits(String(verifiedPhoneDigits)) : "";
  /** @type {{ p: string, sub: string, exp: number, ver?: string }} */
  const payload = { p: "vendor_whatsapp_profile", sub: String(userId), exp };
  if (ver) payload.ver = ver;
  const vendorOtpSession = signOtpToken(payload, secret);
  return { ok: true, vendorOtpSession, exp };
}

/**
 * @param {string} userId
 * @throws {Error} if signing secret is not configured
 */
export function mintVendorProfileSessionPass(userId, verifiedPhoneDigits) {
  const r = tryMintVendorProfileSessionPass(userId, verifiedPhoneDigits);
  if (!r.ok) {
    throw new Error(r.error);
  }
  return { vendorOtpSession: r.vendorOtpSession, exp: r.exp };
}

/**
 * @param {string | undefined} token
 * @param {string} expectedUserId
 * @returns {{ ok: true, verifiedPhoneDigits?: string | null } | { ok: false, error: string, verifiedPhoneDigits?: null }}
 */
export function verifyVendorProfileSessionPass(token, expectedUserId) {
  if (!token || typeof token !== "string" || !expectedUserId) {
    return { ok: false, error: "Missing x-vendor-whatsapp-otp-session. Verify WhatsApp OTP before saving." };
  }

  const secret = getVendorProfileSigningSecret();
  if (!secret) {
    console.error(`${LOG_PREFIX} verifyVendorProfileSessionPass: signing secret not configured`);
    return {
      ok: false,
      error:
        "Server misconfiguration: VENDOR_OTP_SESSION_SECRET (or CALLBACK_OTP_SECRET) is not set. Profile updates cannot be verified.",
    };
  }

  let payload;
  try {
    payload = verifyOtpToken(token.trim(), secret);
  } catch {
    return { ok: false, error: "Invalid vendor WhatsApp OTP session." };
  }
  if (!payload || payload.p !== "vendor_whatsapp_profile" || String(payload.sub) !== String(expectedUserId)) {
    return { ok: false, error: "Invalid vendor WhatsApp OTP session." };
  }
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) {
    return { ok: false, error: "Vendor WhatsApp OTP session expired. Request a new code and verify again." };
  }
  const verifiedPhoneDigits =
    typeof payload.ver === "string" && payload.ver.trim() ? normalizeWhatsAppRecipientDigits(payload.ver) : null;
  return { ok: true, verifiedPhoneDigits };
}

export function isVendorOtpEnforcementDisabled() {
  return String(process.env.VENDOR_OTP_ENFORCE || "1").trim() === "0";
}
