import { requireAdmin } from "../../../../lib/supabaseAuth";
import { adminBulkCreateVendors } from "../../../../lib/vendors";

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

  try {
    const gate = await requireAdmin(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: "Unauthorized" });
    }

    const rows = Array.isArray(body?.vendors) ? body.vendors : null;
    if (!rows) {
      return res.status(400).json({ ok: false, error: "Body must include a vendors array" });
    }

    const defaultStatus =
      body.defaultStatus === "approved" || body.defaultStatus === "rejected" || body.defaultStatus === "pending"
        ? body.defaultStatus
        : "pending";

    const maxRows = typeof body.maxRows === "number" && body.maxRows > 0 ? Math.min(body.maxRows, 100) : 50;

    const { created, errors } = await adminBulkCreateVendors(rows, { defaultStatus, maxRows });

    const migrationHint = errors.some(
      (e) =>
        typeof e.error === "string" &&
        (e.error.toLowerCase().includes("user_id") || e.error.toLowerCase().includes("null value")),
    );

    return res.status(200).json({
      ok: true,
      createdCount: created.length,
      errorCount: errors.length,
      created,
      errors,
      ...(migrationHint
        ? {
            hint: "If inserts fail on user_id, run supabase/migrations/010_vendor_null_user_admin_imports.sql in the Supabase SQL editor.",
          }
        : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
