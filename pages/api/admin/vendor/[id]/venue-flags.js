import { requireAdmin } from "../../../../../lib/supabaseAuth";
import { getVendorById, updateVenueAdminFlagsByAdmin } from "../../../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    res.setHeader("Allow", "PATCH, PUT");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing id" });
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

    const body = typeof req.body === "object" && req.body != null ? req.body : {};
    const patch = {};
    if (body.featuredVenue !== undefined) patch.featuredVenue = body.featuredVenue;
    if (body.verifiedVenue !== undefined) patch.verifiedVenue = body.verifiedVenue;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ ok: false, error: "Send featuredVenue and/or verifiedVenue" });
    }

    const { data, error } = await updateVenueAdminFlagsByAdmin(id, patch);
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not update venue flags" });
    }

    return res.status(200).json({ ok: true, vendor: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
