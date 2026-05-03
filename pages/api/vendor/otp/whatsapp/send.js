import { createVendorWhatsAppChallengeAndSend } from "../../../../../lib/otp/vendorWhatsAppOtpService";
import { requireVendor, vendorGateErrorMessage } from "../../../../../lib/supabaseAuth";

function parsePagesApiJsonBody(req) {
  const b = req.body;
  if (b == null || b === "") return {};
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(b)) {
    try {
      const t = b.toString("utf8");
      return t ? JSON.parse(t) : {};
    } catch {
      return {};
    }
  }
  if (typeof b === "string") {
    try {
      return b ? JSON.parse(b) : {};
    } catch {
      return {};
    }
  }
  if (typeof b === "object" && !Array.isArray(b)) return b;
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parsePagesApiJsonBody(req);
  const phoneRaw = typeof body.phone === "string" ? body.phone : "";

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const out = await createVendorWhatsAppChallengeAndSend(gate.user.id, { phoneRaw });
    if (!out.ok) {
      console.warn("[api/vendor/otp/whatsapp/send] failed", { userId: gate.user.id, error: out.error });
      return res.status(400).json({ ok: false, error: out.error || "Could not send WhatsApp OTP." });
    }
    console.info("[api/vendor/otp/whatsapp/send] ok", {
      userId: gate.user.id,
      sentToHint: out.sentToHint,
      messageId: out.messageId,
    });
    return res.status(200).json({
      ok: true,
      message: out.message,
      expiresInSec: out.expiresInSec,
      sentToHint: out.sentToHint,
      messageId: out.messageId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[api/vendor/otp/whatsapp/send] exception", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}
