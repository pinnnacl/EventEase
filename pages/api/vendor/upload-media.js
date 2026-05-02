import { randomBytes } from "crypto";
import sharp from "sharp";
import {
  MAX_INPUT_BYTES,
  ALLOWED_IMAGE_MIME,
  buildVariantResponseMeta,
  persistVendorMediaVariants,
  processImageBufferToVariants,
} from "../../../lib/vendorImagePipeline";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { getVendorByUser } from "../../../lib/vendors";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

function shouldLog() {
  return process.env.NODE_ENV !== "production" || process.env.LOG_IMAGE_UPLOAD === "1";
}

/**
 * POST JSON { fileBase64?: string, contentType?: string }
 * Stores thumb / medium / large WebP in Supabase; returns URLs + optional debug meta.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const { data: vendor, error: vErr } = await getVendorByUser(gate.user.id);
    if (vErr || !vendor) {
      return res.status(404).json({ ok: false, error: "No vendor profile" });
    }

    const raw = body?.fileBase64;
    if (typeof raw !== "string" || !raw.trim()) {
      return res.status(400).json({ ok: false, error: "Missing fileBase64" });
    }

    let contentType = typeof body?.contentType === "string" ? body.contentType.toLowerCase().trim() : "";
    let b64 = raw.trim();
    const dataUrl = /^data:([^;]+);base64,(.+)$/i.exec(b64);
    if (dataUrl) {
      contentType = dataUrl[1].split(";")[0].trim().toLowerCase();
      b64 = dataUrl[2];
    }

    if (!contentType || !ALLOWED_IMAGE_MIME[contentType]) {
      return res.status(400).json({ ok: false, error: "Use JPEG, PNG, WebP, or GIF" });
    }

    let buffer;
    try {
      buffer = Buffer.from(b64, "base64");
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid base64" });
    }

    if (buffer.length > MAX_INPUT_BYTES) {
      return res.status(400).json({ ok: false, error: "Image too large (max 6MB before processing)" });
    }

    let variants;
    try {
      variants = await processImageBufferToVariants(buffer, { contentTypeHint: contentType });
    } catch {
      return res.status(400).json({ ok: false, error: "Could not process image. Try a different file." });
    }

    const { thumbBuf, mediumBuf, largeBuf, meta } = variants;

    let urls;
    try {
      const out = await persistVendorMediaVariants({
        vendorId: vendor.id,
        thumbBuf,
        mediumBuf,
        largeBuf,
      });
      urls = out.urls;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      return res.status(500).json({
        ok: false,
        error: msg.includes("Storage")
          ? msg
          : "Upload failed. Create the vendor-media bucket in Supabase (see migration 004).",
      });
    }

    const metaOut = buildVariantResponseMeta(buffer, meta, thumbBuf, mediumBuf, largeBuf, contentType);

    if (shouldLog()) {
      console.log("[upload-media]", JSON.stringify(metaOut));
    }

    return res.status(200).json({
      ok: true,
      url: urls.large,
      urls,
      format: "webp",
      meta: metaOut,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
