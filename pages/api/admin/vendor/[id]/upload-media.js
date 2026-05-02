import {
  MAX_INPUT_BYTES,
  ALLOWED_IMAGE_MIME,
  buildVariantResponseMeta,
  persistVendorMediaVariants,
  processImageBufferToVariants,
} from "../../../../../lib/vendorImagePipeline";
import { requireAdmin } from "../../../../../lib/supabaseAuth";
import { getVendorById } from "../../../../../lib/vendors";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { reindexVendorMediaToWeaviate } from "../../../../../lib/weaviateIngest";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

/**
 * POST JSON { fileBase64?: string, contentType?: string, target: "profile" | "gallery" }
 * Admin-only: uploads to vendor-media for this vendor id and updates profile or appends gallery.
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

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing id" });
  }

  const target = body?.target === "gallery" ? "gallery" : "profile";

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const existing = await getVendorById(id);
    if (!existing.data) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    if (target === "gallery") {
      const adminPeek = getSupabaseAdmin();
      const { data: grow, error: peekErr } = await adminPeek.from("vendors").select("gallery_images").eq("id", id).single();
      if (peekErr) {
        return res.status(400).json({ ok: false, error: peekErr.message || "Could not read gallery" });
      }
      const curLen = Array.isArray(grow?.gallery_images) ? grow.gallery_images.length : 0;
      if (curLen >= 12) {
        return res.status(400).json({ ok: false, error: "Gallery already has 12 images — remove one first." });
      }
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
        vendorId: id,
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
          : "Upload failed. Ensure the vendor-media bucket exists (see supabase/STORAGE_VENDOR_MEDIA.sql).",
      });
    }

    const storedJson = JSON.stringify({
      thumb: urls.thumb,
      medium: urls.medium,
      large: urls.large,
    });

    const admin = getSupabaseAdmin();

    if (target === "profile") {
      const { error } = await admin.from("vendors").update({ profile_image: storedJson }).eq("id", id).select("id").single();
      if (error) {
        return res.status(400).json({ ok: false, error: error.message || "Could not save profile image" });
      }
      const refreshed = await getVendorById(id);
      reindexVendorMediaToWeaviate(id).catch((e) =>
        console.error("[weaviate-ingest] admin upload-media profile:", e instanceof Error ? e.message : e),
      );
      const metaOut = buildVariantResponseMeta(buffer, meta, thumbBuf, mediumBuf, largeBuf, contentType);
      return res.status(200).json({
        ok: true,
        vendor: refreshed.data,
        urls,
        meta: metaOut,
      });
    }

    const { data: row, error: gErr } = await admin.from("vendors").select("gallery_images").eq("id", id).single();
    if (gErr) {
      return res.status(400).json({ ok: false, error: gErr.message || "Could not load gallery" });
    }
    const cur = Array.isArray(row?.gallery_images) ? row.gallery_images : [];
    const next = [...cur, storedJson].slice(0, 12);

    const { error: upErr } = await admin.from("vendors").update({ gallery_images: next }).eq("id", id).select("id").single();
    if (upErr) {
      return res.status(400).json({ ok: false, error: upErr.message || "Could not save gallery" });
    }

    const refreshed = await getVendorById(id);
    reindexVendorMediaToWeaviate(id).catch((e) =>
      console.error("[weaviate-ingest] admin upload-media gallery:", e instanceof Error ? e.message : e),
    );
    const metaOut = buildVariantResponseMeta(buffer, meta, thumbBuf, mediumBuf, largeBuf, contentType);
    return res.status(200).json({
      ok: true,
      vendor: refreshed.data,
      urls,
      meta: metaOut,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
