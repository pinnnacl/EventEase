import { requireAdmin } from "../../../../../lib/supabaseAuth";
import { getVendorById, updateVendorCoordinatesByAdmin } from "../../../../../lib/vendors";

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
    let latitude = body.latitude;
    let longitude = body.longitude;

    if (latitude === "" || longitude === "") {
      return res.status(400).json({ ok: false, error: "Use null to clear both fields, or provide two numbers." });
    }

    if (latitude === null && longitude === null) {
      const { data, error } = await updateVendorCoordinatesByAdmin(id, { latitude: null, longitude: null });
      if (error) {
        return res.status(400).json({ ok: false, error: error.message || "Could not update coordinates" });
      }
      return res.status(200).json({ ok: true, vendor: data });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ ok: false, error: "Send both latitude and longitude" });
    }

    const lat = typeof latitude === "number" ? latitude : parseFloat(latitude);
    const lng = typeof longitude === "number" ? longitude : parseFloat(longitude);

    const { data, error } = await updateVendorCoordinatesByAdmin(id, { latitude: lat, longitude: lng });
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not update coordinates" });
    }

    return res.status(200).json({ ok: true, vendor: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
