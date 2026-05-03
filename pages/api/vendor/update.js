import {
  isVendorOtpEnforcementDisabled,
  isVendorProfileSessionSigningConfigured,
  verifyVendorProfileSessionPass,
} from "../../../lib/otp/vendorSessionPass";
import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { updateVendorProfile } from "../../../lib/vendors";
import { normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";
import { reindexVendorMediaToWeaviate } from "../../../lib/weaviateIngest";

const LOG_PREFIX = "[vendor-whatsapp-otp]";

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

    if (!isVendorOtpEnforcementDisabled()) {
      if (!isVendorProfileSessionSigningConfigured()) {
        console.error(`${LOG_PREFIX} PATCH /api/vendor/update: VENDOR_OTP_SESSION_SECRET (or CALLBACK_OTP_SECRET) not set`);
        return res.status(503).json({
          ok: false,
          error:
            "Vendor profile updates are temporarily unavailable: server missing VENDOR_OTP_SESSION_SECRET (or CALLBACK_OTP_SECRET).",
        });
      }

      /** Vendor profile saves use WhatsApp OTP only — require this header (or same token in body for tests). */
      const headerRaw =
        typeof req.headers["x-vendor-whatsapp-otp-session"] === "string"
          ? req.headers["x-vendor-whatsapp-otp-session"]
          : "";
      const session =
        headerRaw.trim() ||
        (typeof body?.vendorOtpSession === "string" ? body.vendorOtpSession.trim() : "");

      if (!session) {
        console.warn(`${LOG_PREFIX} PATCH rejected: missing x-vendor-whatsapp-otp-session`, { userId: gate.user.id });
        return res.status(403).json({
          ok: false,
          error:
            "Missing x-vendor-whatsapp-otp-session. Send WhatsApp OTP, verify the code, then save with that header.",
        });
      }

      const sess = verifyVendorProfileSessionPass(session, gate.user.id);
      if (!sess.ok) {
        console.warn(`${LOG_PREFIX} PATCH rejected: invalid or expired session`, {
          userId: gate.user.id,
          reason: sess.error,
        });
        return res.status(403).json({
          ok: false,
          error:
            sess.error ||
            "WhatsApp OTP session invalid or expired. Request a new code, verify, and try saving again.",
        });
      }

      if (sess.ok && sess.verifiedPhoneDigits && body && typeof body === "object" && "phone" in body) {
        const pd = normalizeWhatsAppRecipientDigits(String(body.phone ?? ""));
        if (pd && pd !== sess.verifiedPhoneDigits) {
          console.warn(`${LOG_PREFIX} PATCH rejected: phone differs from WhatsApp-verified number`, {
            userId: gate.user.id,
          });
          return res.status(403).json({
            ok: false,
            error:
              "The phone in this save does not match the number you verified with WhatsApp. Send OTP again for the new number, verify, then save—or keep the same phone you verified.",
          });
        }
      }
    }

    const patch = body && typeof body === "object" ? { ...body } : {};
    delete patch.vendorOtpSession;

    const {
      data,
      error,
      richFieldsDropped,
      placeFieldsDropped,
      venueDetailsDropped,
      photographerProfileDropped,
      makeupProfileDropped,
    } = await updateVendorProfile(gate.user.id, patch);
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
