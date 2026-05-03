import { requireCustomerSession } from "../../../lib/auth/requireCustomerSession";
import { mintCallbackPassForPhoneDigits } from "../../../lib/otp/callbackSmsPass";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const session = requireCustomerSession(req, res);
  if (!session) return;

  let callbackPass;
  try {
    callbackPass = mintCallbackPassForPhoneDigits(session.phoneDigits);
  } catch (e) {
    console.error("[api/auth/mint-callback-pass]", e);
    return res.status(500).json({
      ok: false,
      error: "Server is not configured for callbacks. Set CALLBACK_OTP_SECRET (or VENDOR_OTP_SESSION_SECRET).",
    });
  }

  return res.status(200).json({ ok: true, callbackPass });
}
