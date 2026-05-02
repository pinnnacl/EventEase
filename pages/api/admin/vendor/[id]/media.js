import { requireAdmin } from "../../../../../lib/supabaseAuth";
import { updateVendorMediaByAdmin } from "../../../../../lib/vendors";
import { reindexVendorMediaToWeaviate } from "../../../../../lib/weaviateIngest";

/**
 * PATCH JSON { profileImage?: string | null, galleryImages?: string[] }
 * Admin-only: replace profile image and/or full gallery list (omit a key to leave it unchanged).
 */
export default async function handler(req, res) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    res.setHeader("Allow", "PATCH, PUT");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing id" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const profileImage = body?.profileImage !== undefined ? body.profileImage : undefined;
    const galleryImages = body?.galleryImages !== undefined ? body.galleryImages : undefined;

    if (profileImage === undefined && galleryImages === undefined) {
      return res.status(400).json({ ok: false, error: "Send profileImage and/or galleryImages" });
    }

    const { data, error } = await updateVendorMediaByAdmin(id, { profileImage, galleryImages });
    if (error) {
      const code = error.message === "Vendor not found" ? 404 : 400;
      return res.status(code).json({ ok: false, error: error.message || "Could not update media" });
    }

    reindexVendorMediaToWeaviate(id).catch((e) =>
      console.error("[weaviate-ingest] admin media patch:", e instanceof Error ? e.message : e),
    );
    return res.status(200).json({ ok: true, vendor: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
