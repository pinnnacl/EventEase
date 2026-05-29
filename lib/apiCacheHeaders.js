import { createHash } from "crypto";

/**
 * @param {import("http").ServerResponse} res
 * @param {string} body
 * @param {import("http").IncomingMessage} req
 * @param {{ cacheControl: string }} options
 * @returns {boolean} true when 304 was sent
 */
export function sendJsonWithEtag(req, res, body, { cacheControl }) {
  const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", cacheControl);
  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return true;
  }
  res.status(200).send(body);
  return false;
}
