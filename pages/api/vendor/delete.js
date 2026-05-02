import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { deleteVendorByUserId } from "../../../lib/vendors";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const { error } = await deleteVendorByUserId(gate.user.id);
    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not delete" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
