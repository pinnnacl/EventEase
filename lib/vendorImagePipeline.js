import { randomBytes } from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin } from "./supabaseAdmin";

/** Max decoded image size before processing (bytes) */
export const MAX_INPUT_BYTES = 6 * 1024 * 1024;

export const WIDTH_THUMB = 300;
export const WIDTH_MEDIUM = 800;
export const WIDTH_LARGE = 1920;

const Q_THUMB = 86;
const Q_MEDIUM = 88;
const Q_LARGE = 90;
const Q_LARGE_WEBP_INPUT = 93;
const Q_MEDIUM_WEBP_INPUT = 91;

const WEBP_EFFORT_DEFAULT = 4;
const WEBP_EFFORT_WEBP_IN = 3;

export const ALLOWED_IMAGE_MIME = {
  "image/jpeg": true,
  "image/jpg": true,
  "image/png": true,
  "image/webp": true,
  "image/gif": true,
};

/**
 * @param {string} mime
 */
export function isAllowedImageMime(mime) {
  if (!mime || typeof mime !== "string") return false;
  return Boolean(ALLOWED_IMAGE_MIME[mime.split(";")[0].trim().toLowerCase()]);
}

/**
 * @param {Buffer} buffer
 * @param {import("sharp").Metadata} meta
 */
async function toWebpVariant(buffer, meta, maxWidth, quality, effort) {
  const w = meta.width || 0;
  let pipeline = sharp(buffer, { failOn: "truncated", animated: false }).rotate();
  if (w > maxWidth) {
    pipeline = pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
    });
  }
  return pipeline.webp({ quality, effort, smartSubsample: true }).toBuffer();
}

async function toLargeVariant(buffer, meta, inputIsWebp) {
  const w = meta.width || 0;
  const needsResize = w > WIDTH_LARGE;
  let pipeline = sharp(buffer, { failOn: "truncated", animated: false }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({ width: WIDTH_LARGE, withoutEnlargement: true });
  }
  const q = inputIsWebp && !needsResize ? Q_LARGE_WEBP_INPUT : Q_LARGE;
  const effort = inputIsWebp && !needsResize ? WEBP_EFFORT_WEBP_IN : WEBP_EFFORT_DEFAULT;
  return pipeline.webp({ quality: q, effort, smartSubsample: true }).toBuffer();
}

async function toMediumVariant(buffer, meta, inputIsWebp) {
  const w = meta.width || 0;
  const needsResize = w > WIDTH_MEDIUM;
  let pipeline = sharp(buffer, { failOn: "truncated", animated: false }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({ width: WIDTH_MEDIUM, withoutEnlargement: true });
  }
  const q = inputIsWebp && !needsResize ? Q_MEDIUM_WEBP_INPUT : Q_MEDIUM;
  const effort = inputIsWebp && !needsResize ? WEBP_EFFORT_WEBP_IN : WEBP_EFFORT_DEFAULT;
  return pipeline.webp({ quality: q, effort, smartSubsample: true }).toBuffer();
}

/**
 * Decode buffer → three WebP variants (same logic for file upload and URL ingest).
 * @param {Buffer} buffer
 * @param {{ contentTypeHint?: string }} [opts]
 * @returns {Promise<{
 *   thumbBuf: Buffer;
 *   mediumBuf: Buffer;
 *   largeBuf: Buffer;
 *   meta: import("sharp").Metadata;
 *   inputIsWebp: boolean;
 * }>}
 */
export async function processImageBufferToVariants(buffer, opts = {}) {
  if (!buffer?.length || buffer.length > MAX_INPUT_BYTES) {
    throw new Error("Image too large or empty");
  }

  let meta;
  try {
    meta = await sharp(buffer, { failOn: "truncated" }).metadata();
  } catch {
    throw new Error("Could not read image");
  }

  const inputFormat = (meta.format || "").toLowerCase();
  const inputIsWebp = inputFormat === "webp" || String(opts.contentTypeHint || "").includes("webp");

  const thumbBuf = await toWebpVariant(buffer, meta, WIDTH_THUMB, Q_THUMB, WEBP_EFFORT_DEFAULT);
  const mediumBuf = await toMediumVariant(buffer, meta, inputIsWebp);
  const largeBuf = await toLargeVariant(buffer, meta, inputIsWebp);

  if (!thumbBuf.length || !mediumBuf.length || !largeBuf.length) {
    throw new Error("Optimized output is empty");
  }

  // PERF: blur placeholder for <Image placeholder="blur" /> — save this to vendors.blur_hash (run migration separately)
  // ALTER TABLE vendors ADD COLUMN IF NOT EXISTS blur_hash TEXT;
  const blurBuffer = await sharp(buffer).resize(10, 10).webp({ quality: 20 }).toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  return { thumbBuf, mediumBuf, largeBuf, meta, inputIsWebp, blurDataURL };
}

/**
 * Upload three buffers to vendor-media bucket.
 * @param {{ vendorId: string; thumbBuf: Buffer; mediumBuf: Buffer; largeBuf: Buffer }} p
 */
export async function persistVendorMediaVariants(p) {
  const { vendorId, thumbBuf, mediumBuf, largeBuf } = p;
  const base = `${Date.now()}-${randomBytes(6).toString("hex")}`;
  const admin = getSupabaseAdmin();
  const bucket = admin.storage.from("vendor-media");

  const paths = {
    thumb: `${vendorId}/${base}-thumb.webp`,
    medium: `${vendorId}/${base}-medium.webp`,
    large: `${vendorId}/${base}-large.webp`,
  };

  const uploads = [
    [paths.thumb, thumbBuf],
    [paths.medium, mediumBuf],
    [paths.large, largeBuf],
  ];

  for (const [path, buf] of uploads) {
    const { error: upErr } = await bucket.upload(path, buf, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "31536000",
    });
    if (upErr) {
      const m = String(upErr.message || "");
      if (/bucket not found|not found/i.test(m) || upErr.statusCode === "404") {
        throw new Error(
          'Storage bucket "vendor-media" is missing. In Supabase: Storage → New bucket → id "vendor-media" (public), or run supabase/STORAGE_VENDOR_MEDIA.sql in the SQL Editor.',
        );
      }
      throw new Error(m || "Storage upload failed");
    }
  }

  const urls = {
    thumb: bucket.getPublicUrl(paths.thumb).data.publicUrl,
    medium: bucket.getPublicUrl(paths.medium).data.publicUrl,
    large: bucket.getPublicUrl(paths.large).data.publicUrl,
  };

  return { urls, paths, base };
}

/**
 * Build response meta for logging / API.
 */
export function buildVariantResponseMeta(buffer, meta, thumbBuf, mediumBuf, largeBuf, contentType) {
  return {
    input: {
      bytes: buffer.length,
      width: meta.width ?? null,
      height: meta.height ?? null,
      format: meta.format ?? null,
      contentType: contentType || null,
    },
    variants: {
      thumb: { bytes: thumbBuf.length, maxWidth: WIDTH_THUMB },
      medium: { bytes: mediumBuf.length, maxWidth: WIDTH_MEDIUM },
      large: { bytes: largeBuf.length, maxWidth: WIDTH_LARGE },
    },
  };
}
