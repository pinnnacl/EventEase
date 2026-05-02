import { requireAdmin } from "../../../lib/supabaseAuth";
import { approveVendor, getVendorById } from "../../../lib/vendors";

/**
 * POST /api/vendors/approve  body: { id: vendorUuid }
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

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing vendor id" });
  }

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const existing = await getVendorById(id);
    if (!existing.data) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }

    const { data, error } = await approveVendor(id);
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not approve" });
    }

    return res.status(200).json({ ok: true, vendor: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
