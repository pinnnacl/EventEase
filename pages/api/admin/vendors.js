import { requireAdmin } from "../../../lib/supabaseAuth";
import { getAllVendors } from "../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const { data, error } = await getAllVendors();
    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not load vendors" });
    }

    return res.status(200).json({ ok: true, vendors: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
