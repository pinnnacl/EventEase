import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from "./customerSession";

export const AUTH_COOKIE_NAME = "ee_session";

export { CUSTOMER_SESSION_COOKIE_NAME };

export function readCookieValue(cookieHeader, name) {
  if (!cookieHeader || typeof cookieHeader !== "string") return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

/**
 * @param {string | undefined} cookieHeader
 * @returns {{ phoneDigits: string; name: string; location: string | null; iat?: number; exp: number } | null}
 */
export function readCustomerSessionFromCookie(cookieHeader) {
  const raw = readCookieValue(cookieHeader, CUSTOMER_SESSION_COOKIE_NAME);
  if (!raw) return null;
  return verifyCustomerSessionToken(raw);
}

export function isAuthenticatedRequest(cookieHeader) {
  if (readCookieValue(cookieHeader, AUTH_COOKIE_NAME) === "1") return true;
  return readCustomerSessionFromCookie(cookieHeader) != null;
}
