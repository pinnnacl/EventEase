import { verifyVendorWhatsAppChallenge } from "../../../../../lib/otp/vendorWhatsAppOtpService";
import { requireVendor, vendorGateErrorMessage } from "../../../../../lib/supabaseAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const code = typeof body?.code === "string" ? body.code.trim() : "";

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const out = await verifyVendorWhatsAppChallenge(gate.user.id, code);
    if (!out.ok) {
      console.warn("[api/vendor/otp/whatsapp/verify] failed", { userId: gate.user.id, error: out.error });
      return res.status(400).json({ ok: false, error: out.error || "Verification failed." });
    }
    console.info("[api/vendor/otp/whatsapp/verify] ok", { userId: gate.user.id });
    return res.status(200).json({
      ok: true,
      vendor: out.vendor,
      vendorOtpSession: out.vendorOtpSession,
      sessionExpiresAt: out.sessionExpiresAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[api/vendor/otp/whatsapp/verify] exception", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}
