import { mintCallbackPassForPhoneDigits } from "../../../lib/otp/callbackSmsPass";
import { readCustomerSessionFromCookie } from "../../../lib/auth-cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const session = readCustomerSessionFromCookie(req.headers.cookie);
  if (!session) {
    return res.status(401).json({ ok: false, error: "Sign in to continue." });
  }

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
