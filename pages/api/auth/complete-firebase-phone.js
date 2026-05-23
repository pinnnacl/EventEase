import { mintCallbackPassForPhoneDigits } from "../../../lib/otp/callbackSmsPass";
import { getCustomerAuthDb } from "../../../lib/customerAuthDb";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  mintCustomerSessionToken,
} from "../../../lib/customerSession";
import { getFirebaseAdminAuth } from "../../../lib/firebaseAdmin";
import { parsePagesApiJsonBody } from "../../../lib/parsePagesApiJsonBody";
import { maskWhatsAppDestinationDigits, normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";

/**
 * After Firebase Phone Auth in the browser, exchange ID token for app session + callback pass.
 * SMS is sent by Firebase (not Twilio).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parsePagesApiJsonBody(req);
  const idToken = typeof body.idToken === "string" ? body.idToken.trim() : "";
  const nameFromBody = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const locationRaw = typeof body.location === "string" ? body.location.trim().slice(0, 200) : "";
  const location = locationRaw || null;

  if (!idToken) {
    return res.status(400).json({ ok: false, error: "Missing authentication token." });
  }

  let phoneDigits;
  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const phoneNumber = typeof decoded.phone_number === "string" ? decoded.phone_number : "";
    phoneDigits = normalizeWhatsAppRecipientDigits(phoneNumber);
    if (!phoneDigits || phoneDigits.length < 12) {
      return res.status(400).json({ ok: false, error: "Verified sign-in did not include a valid phone number." });
    }
  } catch (e) {
    console.error("[api/auth/complete-firebase-phone] verifyIdToken", e);
    return res.status(401).json({ ok: false, error: "Invalid or expired sign-in. Try again." });
  }

  const db = getCustomerAuthDb();
  let name = nameFromBody;
  if (!name) {
    try {
      const row = db.prepare(`SELECT name FROM customers WHERE phone_digits = ?`).get(phoneDigits);
      name = typeof row?.name === "string" ? row.name.trim() : "";
    } catch {
      /* fall through */
    }
  }
  if (!name) {
    return res.status(400).json({ ok: false, error: "Please enter your full name." });
  }

  let callbackPass;
  try {
    callbackPass = mintCallbackPassForPhoneDigits(phoneDigits);
  } catch (e) {
    console.error("[api/auth/complete-firebase-phone] callback secret missing", e);
    return res.status(500).json({
      ok: false,
      error: "Server is not configured for callbacks. Set CALLBACK_OTP_SECRET (or VENDOR_OTP_SESSION_SECRET).",
    });
  }

  const now = Date.now();
  try {
    db.prepare(
      `INSERT INTO customers (phone_digits, name, location, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(phone_digits) DO UPDATE SET
         name = CASE WHEN excluded.name != '' THEN excluded.name ELSE customers.name END,
         location = COALESCE(excluded.location, customers.location),
         updated_at = excluded.updated_at`,
    ).run(phoneDigits, name, location || null, now, now);
  } catch (e) {
    console.error("[api/auth/complete-firebase-phone] db", e);
    return res.status(500).json({ ok: false, error: "Could not save your profile. Try again." });
  }

  let token;
  let maxAgeSec;
  try {
    const out = mintCustomerSessionToken({
      phoneDigits,
      name,
      location: location || null,
    });
    token = out.token;
    maxAgeSec = out.maxAgeSec;
  } catch (e) {
    console.error("[api/auth/complete-firebase-phone] session mint failed", e);
    return res.status(500).json({
      ok: false,
      error:
        "Server session is not configured. Set AUTH_SESSION_SECRET or CUSTOMER_SESSION_SECRET (or VENDOR_OTP_SESSION_SECRET).",
    });
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${CUSTOMER_SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`,
  );

  return res.status(200).json({
    ok: true,
    user: {
      name,
      location: location || null,
      phone_hint: maskWhatsAppDestinationDigits(phoneDigits),
    },
    callbackPass,
  });
}
