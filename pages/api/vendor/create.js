import { ingestRemoteImageForVendor } from "../../../lib/vendorRemoteImageIngestServer";
import { shouldIngestRemoteImageUrl } from "../../../lib/vendorUrlIngestUtils";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { createVendor, getVendorByUser } from "../../../lib/vendors";
import { reindexVendorMediaToWeaviate } from "../../../lib/weaviateIngest";

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
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const { user } = gate;
    const existing = await getVendorByUser(user.id);
    if (existing.data) {
      return res.status(409).json({ ok: false, error: "Vendor profile already exists" });
    }

    const businessName = typeof body?.businessName === "string" ? body.businessName.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const city = typeof body?.city === "string" ? body.city.trim() : "";
    const state = typeof body?.state === "string" ? body.state.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";

    if (!businessName || !category || !city || !state || !phone) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }
    if (description.length < 20) {
      return res.status(400).json({ ok: false, error: "Description must be at least 20 characters" });
    }

    const { data, error } = await createVendor({
      userId: user.id,
      payload: {
        businessName,
        category,
        city,
        state,
        phone,
        description,
        pricingRange: body?.pricingRange,
        profileImage: body?.profileImage,
      },
    });

    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not create vendor" });
    }

    let vendorOut = data;
    if (data?.id && shouldIngestRemoteImageUrl(body?.profileImage)) {
      try {
        const { storedJson } = await ingestRemoteImageForVendor(data.id, String(body.profileImage).trim());
        const admin = getSupabaseAdmin();
        const { error: upErr } = await admin.from("vendors").update({ profile_image: storedJson }).eq("id", data.id);
        if (upErr) throw new Error(upErr.message);
        const { data: refreshed } = await getVendorByUser(user.id);
        if (refreshed) vendorOut = refreshed;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Profile image import failed";
        return res.status(400).json({ ok: false, error: msg });
      }
    }

    if (vendorOut?.id) {
      reindexVendorMediaToWeaviate(vendorOut.id).catch((e) =>
        console.error("[weaviate-ingest] vendor create:", e instanceof Error ? e.message : e),
      );
    }

    return res.status(200).json({ ok: true, vendor: vendorOut });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
