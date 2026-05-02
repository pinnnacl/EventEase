import { ingestRemoteImageForVendor } from "../../../../../lib/vendorRemoteImageIngestServer";
import { shouldIngestRemoteImageUrl } from "../../../../../lib/vendorUrlIngestUtils";
import { requireAdmin } from "../../../../../lib/supabaseAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getVendorById, updateVendorMediaByAdmin } from "../../../../../lib/vendors";
import { reindexVendorMediaToWeaviate } from "../../../../../lib/weaviateIngest";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};

/**
 * POST JSON { imageUrl: string, target?: "profile" | "gallery" }
 * Admin-only: same behavior as vendor profile — remote fetch + WebP variants, or store plain/JSON URL when allowed.
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
  const raw = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const existing = await getVendorById(id);
    if (!existing.data) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    if (!raw) {
      return res.status(400).json({ ok: false, error: "Missing imageUrl" });
    }

    if (target === "gallery") {
      const admin = getSupabaseAdmin();
      const { data: grow, error: peekErr } = await admin.from("vendors").select("gallery_images").eq("id", id).single();
      if (peekErr) {
        return res.status(400).json({ ok: false, error: peekErr.message || "Could not read gallery" });
      }
      const curLen = Array.isArray(grow?.gallery_images) ? grow.gallery_images.length : 0;
      if (curLen >= 12) {
        return res.status(400).json({ ok: false, error: "Gallery already has 12 images — remove one first." });
      }
    }

    if (raw.startsWith("{")) {
      try {
        const o = JSON.parse(raw);
        if (o && typeof o === "object" && o.thumb && o.medium && o.large) {
          const stored = JSON.stringify({
            thumb: String(o.thumb).trim(),
            medium: String(o.medium).trim(),
            large: String(o.large).trim(),
          });
          if (target === "profile") {
            const { data, error } = await updateVendorMediaByAdmin(id, { profileImage: stored });
            if (error) return res.status(400).json({ ok: false, error: error.message || "Could not save" });
            reindexVendorMediaToWeaviate(id).catch((e) =>
              console.error("[weaviate-ingest] admin ingest-url profile json:", e instanceof Error ? e.message : e),
            );
            return res.status(200).json({ ok: true, vendor: data, fromJson: true });
          }
          const admin = getSupabaseAdmin();
          const { data: row } = await admin.from("vendors").select("gallery_images").eq("id", id).single();
          const cur = Array.isArray(row?.gallery_images) ? row.gallery_images : [];
          const next = [...cur, stored].slice(0, 12);
          const { data, error } = await updateVendorMediaByAdmin(id, { galleryImages: next });
          if (error) return res.status(400).json({ ok: false, error: error.message || "Could not save" });
          reindexVendorMediaToWeaviate(id).catch((e) =>
            console.error("[weaviate-ingest] admin ingest-url gallery json:", e instanceof Error ? e.message : e),
          );
          return res.status(200).json({ ok: true, vendor: data, fromJson: true });
        }
      } catch {
        return res.status(400).json({ ok: false, error: "Invalid JSON for responsive image" });
      }
    }

    if (!shouldIngestRemoteImageUrl(raw)) {
      if (!/^https?:\/\//i.test(raw)) {
        return res.status(400).json({ ok: false, error: "Enter a valid https image URL or responsive JSON" });
      }
      if (target === "profile") {
        const { data, error } = await updateVendorMediaByAdmin(id, { profileImage: raw });
        if (error) return res.status(400).json({ ok: false, error: error.message || "Could not save" });
        reindexVendorMediaToWeaviate(id).catch((e) =>
          console.error("[weaviate-ingest] admin ingest-url profile plain:", e instanceof Error ? e.message : e),
        );
        return res.status(200).json({ ok: true, vendor: data, plainUrl: true });
      }
      const admin = getSupabaseAdmin();
      const { data: row, error: gErr } = await admin.from("vendors").select("gallery_images").eq("id", id).single();
      if (gErr) return res.status(400).json({ ok: false, error: gErr.message || "Could not load gallery" });
      const cur = Array.isArray(row?.gallery_images) ? row.gallery_images : [];
      const next = [...cur, raw].slice(0, 12);
      const { data, error } = await updateVendorMediaByAdmin(id, { galleryImages: next });
      if (error) return res.status(400).json({ ok: false, error: error.message || "Could not save" });
      reindexVendorMediaToWeaviate(id).catch((e) =>
        console.error("[weaviate-ingest] admin ingest-url gallery plain:", e instanceof Error ? e.message : e),
      );
      return res.status(200).json({ ok: true, vendor: data, plainUrl: true });
    }

    const { storedJson, urls, meta } = await ingestRemoteImageForVendor(id, raw);

    if (target === "profile") {
      const { data, error } = await updateVendorMediaByAdmin(id, { profileImage: storedJson });
      if (error) {
        return res.status(400).json({ ok: false, error: error.message || "Could not save profile image" });
      }
      reindexVendorMediaToWeaviate(id).catch((e) =>
        console.error("[weaviate-ingest] admin ingest-url profile:", e instanceof Error ? e.message : e),
      );
      return res.status(200).json({ ok: true, vendor: data, urls, meta, ingested: true });
    }

    const admin = getSupabaseAdmin();
    const { data: row, error: gErr } = await admin.from("vendors").select("gallery_images").eq("id", id).single();
    if (gErr) {
      return res.status(400).json({ ok: false, error: gErr.message || "Could not load gallery" });
    }
    const cur = Array.isArray(row?.gallery_images) ? row.gallery_images : [];
    const next = [...cur, storedJson].slice(0, 12);
    const { data, error } = await updateVendorMediaByAdmin(id, { galleryImages: next });
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not save gallery" });
    }
    reindexVendorMediaToWeaviate(id).catch((e) =>
      console.error("[weaviate-ingest] admin ingest-url gallery:", e instanceof Error ? e.message : e),
    );
    return res.status(200).json({ ok: true, vendor: data, urls, meta, ingested: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("abort") || msg.includes("timeout")) {
      return res.status(408).json({ ok: false, error: "Download timed out" });
    }
    return res.status(400).json({ ok: false, error: msg });
  }
}
