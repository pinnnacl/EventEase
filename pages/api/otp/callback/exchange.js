/**
 * Exchange Firebase SMS Phone Auth ID token for a short-lived callback pass.
 * Used only by the guest "Request Callback" flow — not vendor WhatsApp OTP.
 */
import { mintCallbackPassFromFirebaseIdToken } from "../../../../lib/otp/callbackSmsPass";

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

  const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : "";
  if (!idToken) {
    return res.status(400).json({ ok: false, error: "Missing Firebase ID token from SMS verification." });
  }

  try {
    const out = await mintCallbackPassFromFirebaseIdToken(idToken);
    return res.status(200).json({
      ok: true,
      callbackPass: out.callbackPass,
      expiresAt: out.exp,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    const code = /** @type {any} */ (e)?.statusCode === 400 ? 400 : 500;
    return res.status(code).json({ ok: false, error: msg });
  }
}
