/**
 * Parse JSON body for Next.js Pages API routes (object, string, or Buffer).
 * @param {import("http").IncomingMessage} req
 * @returns {Record<string, unknown>}
 */
export function parsePagesApiJsonBody(req) {
  const b = req.body;
  if (b == null || b === "") return {};
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(b)) {
    try {
      const t = b.toString("utf8");
      return t ? JSON.parse(t) : {};
    } catch {
      return {};
    }
  }
  if (typeof b === "string") {
    try {
      return b ? JSON.parse(b) : {};
    } catch {
      return {};
    }
  }
  if (typeof b === "object" && !Array.isArray(b)) return /** @type {Record<string, unknown>} */ (b);
  return {};
}
