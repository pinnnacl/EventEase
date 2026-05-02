import { extractVendorMediaEntries, listWeaviateVendorObjects } from "../../../lib/weaviateIngest";
import { getVendorById } from "../../../lib/vendors";
import { getWeaviateConfig, isWeaviateConfigured } from "../../../lib/weaviateClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const vendorId = typeof req.query.vendorId === "string" ? req.query.vendorId.trim() : "";
  if (!vendorId) {
    return res.status(400).json({ ok: false, error: "Send ?vendorId=<uuid>" });
  }

  if (!isWeaviateConfigured()) {
    return res.status(503).json({ ok: false, error: "Weaviate not configured", className: getWeaviateConfig().className });
  }

  try {
    const { data: vendor, error } = await getVendorById(vendorId);
    if (error || !vendor) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    const expected = extractVendorMediaEntries(vendor).map((e) => ({
      mediaKey: e.mediaKey,
      imageUrl: e.imageUrl,
    }));
    const objects = await listWeaviateVendorObjects(vendorId);

    return res.status(200).json({
      ok: true,
      className: getWeaviateConfig().className,
      vendorId,
      expectedCount: expected.length,
      indexedCount: objects.length,
      expected,
      indexed: objects.map((r) => ({
        mediaId: r.mediaId || null,
        imageUrl: r.imageUrl || null,
        objectId: r?._additional?.id || null,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
