/**
 * Allow only same-origin relative paths (prevents open redirects).
 * @param {unknown} raw
 * @param {string} [fallback]
 * @returns {string | null}
 */
export function safeNextPath(raw, fallback = null) {
  if (typeof raw !== "string") return fallback;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return fallback;
  if (s.includes("://")) return fallback;
  const pathPart = s.split("?")[0];
  if (!pathPart.startsWith("/") || pathPart.startsWith("//")) return fallback;
  return s;
}
