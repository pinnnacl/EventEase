/**
 * Browser-only helpers for vendor image URL → optimized WebP JSON (via /api/vendor/ingest-image-url).
 */

import { shouldIngestRemoteImageUrl } from "./vendorUrlIngestUtils";

export const needsUrlIngestion = shouldIngestRemoteImageUrl;

export function optimizedPayloadFromIngest(data, sourceUrl) {
  const base = {
    thumb: data.urls.thumb,
    medium: data.urls.medium,
    large: data.urls.large,
  };
  if (sourceUrl && String(sourceUrl).trim()) {
    base.sourceUrl = String(sourceUrl).trim();
  }
  return JSON.stringify(base);
}

/**
 * @param {string} imageUrl
 * @returns {Promise<string>} JSON string for DB (thumb/medium/large + optional sourceUrl)
 */
export async function ingestImageFromUrl(imageUrl) {
  const res = await fetch("/api/vendor/ingest-image-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ imageUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.urls?.large) {
    throw new Error(data.error || "Could not import image from URL");
  }
  return optimizedPayloadFromIngest(data, data.sourceUrl || imageUrl);
}
