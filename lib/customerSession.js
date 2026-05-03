import crypto from "crypto";
import { signOtpToken, verifyOtpToken } from "./otp/hmacToken";

const COOKIE_NAME = "ee_customer";

/** Default customer browser session length (seconds). */
export const CUSTOMER_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function getCustomerSessionSecret() {
  const s =
    process.env.AUTH_SESSION_SECRET ||
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.VENDOR_OTP_SESSION_SECRET ||
    process.env.CALLBACK_OTP_SECRET;
  if (!s || !String(s).trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SESSION_SECRET or CUSTOMER_SESSION_SECRET (or VENDOR_OTP_SESSION_SECRET) must be set in production.",
      );
    }
    return "dev-customer-session-secret-change-me";
  }
  return String(s).trim();
}

function getOtpPepper() {
  return String(
    process.env.CUSTOMER_OTP_PEPPER || process.env.OTP_CODE_PEPPER || getCustomerSessionSecret(),
  ).trim();
}

export { COOKIE_NAME as CUSTOMER_SESSION_COOKIE_NAME };

export function hashCustomerOtpCode(code) {
  return crypto.createHmac("sha256", getOtpPepper()).update(String(code).trim()).digest("hex");
}

function sessionMaxAgeSecFromEnv() {
  const raw = process.env.CUSTOMER_SESSION_MAX_AGE_DAYS;
  if (raw == null || raw === "") return CUSTOMER_SESSION_MAX_AGE_SEC;
  const days = Number(String(raw).trim());
  if (!Number.isFinite(days) || days <= 0 || days > 365) return CUSTOMER_SESSION_MAX_AGE_SEC;
  return Math.floor(days * 24 * 60 * 60);
}

/**
 * @param {{ phoneDigits: string; name: string; location?: string | null }} p
 * @returns {{ token: string; maxAgeSec: number }}
 */
export function mintCustomerSessionToken(p) {
  const maxAgeSec = sessionMaxAgeSecFromEnv();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + maxAgeSec;
  const name = String(p.name || "").trim().slice(0, 120);
  const location = p.location != null ? String(p.location).trim().slice(0, 200) : "";
  const phoneDigits = String(p.phoneDigits || "").replace(/\D/g, "");
  const token = signOtpToken(
    {
      t: "cust_sess",
      sub: phoneDigits,
      user_id: phoneDigits,
      phoneDigits,
      name,
      location: location || null,
      iat,
      exp,
    },
    getCustomerSessionSecret(),
  );
  return { token, maxAgeSec };
}

/**
 * @param {string | undefined} token
 * @returns {{ phoneDigits: string; name: string; location: string | null; iat?: number; exp: number } | null}
 */
export function verifyCustomerSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  let payload;
  try {
    payload = verifyOtpToken(token.trim(), getCustomerSessionSecret());
  } catch {
    return null;
  }
  if (!payload || payload.t !== "cust_sess") return null;
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp) || Math.floor(Date.now() / 1000) > exp) return null;
  const fromSub =
    typeof payload.sub === "string"
      ? payload.sub.replace(/\D/g, "")
      : typeof payload.user_id === "string"
        ? payload.user_id.replace(/\D/g, "")
        : "";
  const fromPhone =
    typeof payload.phoneDigits === "string" ? payload.phoneDigits.replace(/\D/g, "") : "";
  const phoneDigits = fromPhone || fromSub;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!phoneDigits || !name) return null;
  const loc = payload.location != null ? String(payload.location).trim() : "";
  const iat = Number(payload.iat);
  return {
    phoneDigits,
    name,
    location: loc || null,
    ...(Number.isFinite(iat) ? { iat } : {}),
    exp,
  };
}
