import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { updateVendorProfile } from "../../../lib/vendors";
import { reindexVendorMediaToWeaviate } from "../../../lib/weaviateIngest";

export default async function handler(req, res) {
  if (req.method !== "PUT" && req.method !== "PATCH") {
    res.setHeader("Allow", "PUT, PATCH");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const {
      data,
      error,
      richFieldsDropped,
      placeFieldsDropped,
      venueDetailsDropped,
      photographerProfileDropped,
      makeupProfileDropped,
    } = await updateVendorProfile(gate.user.id, body || {});
    if (error) {
      const code = error.message === "No vendor profile" ? 404 : 400;
      return res.status(code).json({ ok: false, error: error.message || "Could not update" });
    }

    const warnings = [];
    if (richFieldsDropped) {
      warnings.push(
        "Facilities and gallery images were not saved: your database is missing optional columns (run supabase/migrations/002_venue_detail_fields.sql in the Supabase SQL editor).",
      );
    }
    if (placeFieldsDropped) {
      warnings.push(
        "Place/area was not saved: add column `place` on public.vendors (run supabase/migrations/006_vendor_place.sql in the Supabase SQL editor), then save again.",
      );
    }
    if (venueDetailsDropped) {
      warnings.push(
        "Venue details were not saved: add column `venue_details` on public.vendors (run supabase/migrations/007_venue_details.sql in the Supabase SQL editor), then save again.",
      );
    }
    if (photographerProfileDropped) {
      warnings.push(
        "Photographer profile fields were not saved: add column `photographer_profile` on public.vendors (run supabase/migrations/008_photographer_profile.sql in the Supabase SQL editor), then save again.",
      );
    }
    if (makeupProfileDropped) {
      warnings.push(
        "Makeup profile fields were not saved: add column `makeup_profile` on public.vendors (run supabase/migrations/009_makeup_profile.sql in the Supabase SQL editor), then save again.",
      );
    }
    const warning = warnings.length ? warnings.join(" ") : undefined;

    if (data?.id) {
      reindexVendorMediaToWeaviate(data.id).catch((e) =>
        console.error("[weaviate-ingest] vendor update:", e instanceof Error ? e.message : e),
      );
    }
    return res.status(200).json({ ok: true, vendor: data, ...(warning ? { warning } : {}) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
