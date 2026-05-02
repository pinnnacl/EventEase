import { requireAuthUser } from "../../../lib/supabaseAuth";
import { getVendorByUser } from "../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const gate = await requireAuthUser(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const { user, profile } = gate;
    if (!profile || profile.role !== "vendor") {
      return res.status(403).json({ ok: false, error: "Not a vendor account" });
    }

    const { data: vendor, error } = await getVendorByUser(user.id);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load vendor" });
    }

    return res.status(200).json({
      ok: true,
      hasProfile: Boolean(vendor),
      vendor: vendor || null,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
