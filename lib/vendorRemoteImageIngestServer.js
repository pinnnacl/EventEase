import {
  MAX_INPUT_BYTES,
  buildVariantResponseMeta,
  isAllowedImageMime,
  persistVendorMediaVariants,
  processImageBufferToVariants,
} from "./vendorImagePipeline";
import { isUrlSafeForServerFetch } from "./safeImageUrl";

const FETCH_TIMEOUT_MS = 15000;

/**
 * Download → Sharp WebP variants → Supabase. Returns JSON string for DB + urls + meta.
 * @param {string} vendorId
 * @param {string} imageUrl
 * @returns {Promise<{ storedJson: string; urls: { thumb: string; medium: string; large: string }; meta: object }>}
 */
export async function ingestRemoteImageForVendor(vendorId, imageUrl) {
  const trimmed = String(imageUrl).trim();
  if (!trimmed || !isUrlSafeForServerFetch(trimmed)) {
    throw new Error("URL not allowed");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let fetchRes;
  try {
    fetchRes = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png,image/webp,image/gif;q=0.9,*/*;q=0.1",
        "User-Agent": "THAALI/1.0 (vendor image ingest)",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    if (msg.includes("abort")) throw new Error("Download timed out");
    throw new Error("Could not download image");
  } finally {
    clearTimeout(timeout);
  }

  if (!fetchRes.ok) {
    throw new Error(`Download failed (${fetchRes.status})`);
  }

  const ctHeader = fetchRes.headers.get("content-type") || "";
  const mime = ctHeader.split(";")[0].trim().toLowerCase();
  if (mime && !isAllowedImageMime(mime)) {
    throw new Error("Not an allowed image type");
  }

  const lenHeader = fetchRes.headers.get("content-length");
  if (lenHeader) {
    const n = Number(lenHeader);
    if (Number.isFinite(n) && n > MAX_INPUT_BYTES) {
      throw new Error("Image too large");
    }
  }

  const ab = await fetchRes.arrayBuffer();
  let buffer = Buffer.from(ab);
  if (buffer.length > MAX_INPUT_BYTES) {
    buffer = buffer.subarray(0, MAX_INPUT_BYTES);
  }

  const variants = await processImageBufferToVariants(buffer, { contentTypeHint: mime });
  const { thumbBuf, mediumBuf, largeBuf, meta } = variants;

  const { urls } = await persistVendorMediaVariants({
    vendorId,
    thumbBuf,
    mediumBuf,
    largeBuf,
  });

  const metaOut = buildVariantResponseMeta(buffer, meta, thumbBuf, mediumBuf, largeBuf, mime);

  const storedJson = JSON.stringify({
    thumb: urls.thumb,
    medium: urls.medium,
    large: urls.large,
    sourceUrl: trimmed,
  });

  return { storedJson, urls, meta: metaOut };
}
