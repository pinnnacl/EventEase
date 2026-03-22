export const AUTH_COOKIE_NAME = "ee_session";

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

export function isAuthenticatedRequest(cookieHeader) {
  return readCookieValue(cookieHeader, AUTH_COOKIE_NAME) === "1";
}
