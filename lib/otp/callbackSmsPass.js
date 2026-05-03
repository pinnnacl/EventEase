/**
 * User-facing "Request Callback" flow — SMS only (Firebase Phone Auth).
 * Issues a short-lived signed pass after Firebase ID token verification.
 */
import { getFirebaseAdminAuth } from "../firebaseAdmin";
import { normalizeWhatsAppRecipientDigits } from "../whatsappPhone";
import { signOtpToken, verifyOtpToken } from "./hmacToken";

function getCallbackSecret() {
  const s = process.env.CALLBACK_OTP_SECRET || process.env.VENDOR_OTP_SESSION_SECRET;
  if (!s || !String(s).trim()) {
    throw new Error(
      "CALLBACK_OTP_SECRET is not set. Add it to .env (generate a long random string).",
    );
  }
  return String(s).trim();
}

export function getCallbackPassTtlSec() {
  const n = Number(process.env.CALLBACK_OTP_TTL_SEC);
  if (Number.isFinite(n) && n >= 60 && n <= 3600) return Math.floor(n);
  return 900;
}

/**
 * Verify Firebase ID token from SMS OTP and mint callback pass.
 * @param {string} idToken
 * @returns {{ callbackPass: string, phoneDigits: string, exp: number }}
 */
/**
 * Mint the same callback pass shape as Firebase SMS verify, after server-side SMS OTP.
 * @param {string} phoneDigits international digits only (e.g. 919876543210)
 */
export function mintCallbackPassForPhoneDigits(phoneDigits) {
  const d = String(phoneDigits || "").replace(/\D/g, "");
  if (!d || d.length < 10) {
    throw new Error("mintCallbackPassForPhoneDigits: invalid phoneDigits");
  }
  const ttl = getCallbackPassTtlSec();
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = {
    p: "callback_sms",
    phoneDigits: d,
    exp,
  };
  return signOtpToken(payload, getCallbackSecret());
}

export async function mintCallbackPassFromFirebaseIdToken(idToken) {
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const phoneNumber = typeof decoded.phone_number === "string" ? decoded.phone_number : "";
  const phoneDigits = normalizeWhatsAppRecipientDigits(phoneNumber);
  if (!phoneDigits) {
    const err = new Error("Verified SMS login did not include a valid phone number.");
    /** @type {any} */ (err).statusCode = 400;
    throw err;
  }
  const ttl = getCallbackPassTtlSec();
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = {
    p: "callback_sms",
    phoneDigits,
    exp,
  };
  const callbackPass = signOtpToken(payload, getCallbackSecret());
  return { callbackPass, phoneDigits, exp };
}

/**
 * @param {string | undefined} callbackPass
 * @returns {{ ok: boolean, phoneDigits?: string, error?: string }}
 */
export function verifyCallbackPass(callbackPass) {
  if (!callbackPass || typeof callbackPass !== "string") {
    return { ok: false, error: "Missing callback verification. Complete SMS OTP first." };
  }
  let payload;
  try {
    payload = verifyOtpToken(callbackPass.trim(), getCallbackSecret());
  } catch {
    return { ok: false, error: "Invalid callback verification token." };
  }
  if (!payload || payload.p !== "callback_sms") {
    return { ok: false, error: "Invalid callback verification." };
  }
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) {
    return { ok: false, error: "SMS verification expired. Request a new OTP and try again." };
  }
  const phoneDigits = typeof payload.phoneDigits === "string" ? payload.phoneDigits.trim() : "";
  if (!phoneDigits) {
    return { ok: false, error: "Invalid callback verification payload." };
  }
  return { ok: true, phoneDigits };
}
