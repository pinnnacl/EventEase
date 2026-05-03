import crypto from "crypto";
import { signOtpToken, verifyOtpToken } from "./otp/hmacToken";

const COOKIE_NAME = "ee_customer";

function getCustomerSessionSecret() {
  const s =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.VENDOR_OTP_SESSION_SECRET ||
    process.env.CALLBACK_OTP_SECRET;
  if (!s || !String(s).trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CUSTOMER_SESSION_SECRET (or VENDOR_OTP_SESSION_SECRET) must be set in production.");
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

/**
 * @param {{ phoneDigits: string; name: string; location?: string | null }} p
 * @returns {{ token: string; maxAgeSec: number }}
 */
export function mintCustomerSessionToken(p) {
  const maxAgeSec = 60 * 60 * 24 * 30;
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const name = String(p.name || "").trim().slice(0, 120);
  const location = p.location != null ? String(p.location).trim().slice(0, 200) : "";
  const phoneDigits = String(p.phoneDigits || "").replace(/\D/g, "");
  const token = signOtpToken(
    {
      t: "cust_sess",
      phoneDigits,
      name,
      location: location || null,
      exp,
    },
    getCustomerSessionSecret(),
  );
  return { token, maxAgeSec };
}

/**
 * @param {string | undefined} token
 * @returns {{ phoneDigits: string; name: string; location: string | null } | null}
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
  const phoneDigits = typeof payload.phoneDigits === "string" ? payload.phoneDigits.replace(/\D/g, "") : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!phoneDigits || !name) return null;
  const loc = payload.location != null ? String(payload.location).trim() : "";
  return { phoneDigits, name, location: loc || null };
}
