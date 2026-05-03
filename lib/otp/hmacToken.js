import crypto from "crypto";

/**
 * URL-safe signed token: base64url(payload).hmac
 * @param {object} payload
 * @param {string} secret
 */
export function signOtpToken(payload, secret) {
  if (!secret || typeof secret !== "string") {
    throw new Error("signOtpToken: missing secret");
  }
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/**
 * @param {string} token
 * @param {string} secret
 * @returns {object | null}
 */
export function verifyOtpToken(token, secret) {
  if (!token || typeof token !== "string" || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
