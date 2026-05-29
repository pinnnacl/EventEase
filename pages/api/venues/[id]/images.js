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

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  try {
    const { data: images, error } = await getPublicVenueGalleryImagesAfterHero(id);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load images" });
    }
    if (images === null) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }
    return res.status(200).json({ ok: true, images });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
