import { requireVendor, vendorGateErrorMessage } from "../../../lib/supabaseAuth";
import { getFirebaseAdminAuth } from "../../../lib/firebaseAdmin";
import { markVendorPhoneVerifiedByUserId } from "../../../lib/vendors";
import { normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";

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

  const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : "";
  const draftPhone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!idToken) {
    return res.status(400).json({ ok: false, error: "Missing Firebase ID token" });
  }

  try {
    const gate = await requireVendor(req, res);
    if (!gate.ok) {
      return res.status(gate.status).json({ ok: false, error: vendorGateErrorMessage(gate.status) });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const phoneNumber = typeof decoded?.phone_number === "string" ? decoded.phone_number : "";
    const phoneDigits = normalizeWhatsAppRecipientDigits(phoneNumber);
    if (!phoneDigits) {
      return res.status(400).json({ ok: false, error: "Verified token does not include a valid phone number" });
    }

    const { data, error } = await markVendorPhoneVerifiedByUserId(gate.user.id, phoneDigits, draftPhone || null);
    if (error) {
      const code = error.message === "No vendor profile" ? 404 : 400;
      return res.status(code).json({ ok: false, error: error.message || "Could not verify phone" });
    }

    return res.status(200).json({ ok: true, vendor: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
