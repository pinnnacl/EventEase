import { sendJsonWithEtag } from "../../../../lib/apiCacheHeaders";
import { getPublicVenueGalleryImagesAfterHero } from "../../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing id" });
  }

  try {
    const { data: images, error } = await getPublicVenueGalleryImagesAfterHero(id);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load images" });
    }
    if (images === null) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }
    const body = JSON.stringify({ ok: true, images });
    sendJsonWithEtag(req, res, body, {
      cacheControl: "public, max-age=300, stale-while-revalidate=600",
    });
    return;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
