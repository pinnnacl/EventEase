import crypto from "crypto";
import { mintCallbackPassForPhoneDigits } from "../../../lib/otp/callbackSmsPass";
import { getCustomerAuthDb } from "../../../lib/customerAuthDb";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  hashCustomerOtpCode,
  mintCustomerSessionToken,
} from "../../../lib/customerSession";
import { parsePagesApiJsonBody } from "../../../lib/parsePagesApiJsonBody";
import { maskWhatsAppDestinationDigits, normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";

function isValidIndiaMobile10(d) {
  return /^[6-9]\d{9}$/.test(d);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parsePagesApiJsonBody(req);
  const phoneRaw = typeof body.phone_number === "string" ? body.phone_number.replace(/\D/g, "") : "";
  const otp = typeof body.otp === "string" ? body.otp.replace(/\D/g, "").trim() : "";

  if (!isValidIndiaMobile10(phoneRaw)) {
    return res.status(400).json({ ok: false, error: "Invalid phone number." });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ ok: false, error: "Enter the 6-digit OTP." });
  }

  const phoneDigits = normalizeWhatsAppRecipientDigits(phoneRaw);
  if (!phoneDigits) {
    return res.status(400).json({ ok: false, error: "Invalid phone number." });
  }

  let callbackPass;
  try {
    callbackPass = mintCallbackPassForPhoneDigits(phoneDigits);
  } catch (e) {
    console.error("[api/auth/verify-otp] callback secret missing", e);
    return res.status(500).json({
      ok: false,
      error: "Server is not configured for callbacks. Set CALLBACK_OTP_SECRET (or VENDOR_OTP_SESSION_SECRET).",
    });
  }

  const db = getCustomerAuthDb();
  const row = db
    .prepare(
      `SELECT * FROM customer_otp_challenges WHERE phone_digits = ? ORDER BY id DESC LIMIT 1`,
    )
    .get(phoneDigits);

  if (!row) {
    return res.status(400).json({ ok: false, error: "No active OTP. Request a new code." });
  }

  const expires = Number(row.expires_at) || 0;
  if (Date.now() > expires) {
    db.prepare("DELETE FROM customer_otp_challenges WHERE id = ?").run(row.id);
    return res.status(400).json({ ok: false, error: "OTP expired. Request a new code." });
  }

  const attempts = Number(row.attempts) || 0;
  if (attempts >= 5) {
    db.prepare("DELETE FROM customer_otp_challenges WHERE id = ?").run(row.id);
    return res.status(400).json({ ok: false, error: "Too many attempts. Request a new OTP." });
  }

  const expectedHash = String(row.code_hash || "");
  const gotHash = hashCustomerOtpCode(otp);
  let validHash = false;
  try {
    const a = Buffer.from(expectedHash, "hex");
    const b = Buffer.from(gotHash, "hex");
    validHash = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    validHash = false;
  }
  if (!validHash) {
    db.prepare("UPDATE customer_otp_challenges SET attempts = attempts + 1 WHERE id = ?").run(row.id);
    return res.status(400).json({ ok: false, error: "Invalid OTP. Try again." });
  }

  const name = String(row.name || "").trim();
  const location = row.location != null ? String(row.location).trim() : "";

  db.prepare("DELETE FROM customer_otp_challenges WHERE id = ?").run(row.id);

  const now = Date.now();
  db.prepare(
    `INSERT INTO customers (phone_digits, name, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(phone_digits) DO UPDATE SET
       name = excluded.name,
       location = excluded.location,
       updated_at = excluded.updated_at`,
  ).run(phoneDigits, name, location || null, now, now);

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
    console.error("[api/auth/verify-otp] session mint failed", e);
    return res.status(500).json({
      ok: false,
      error: "Server session is not configured. Set CUSTOMER_SESSION_SECRET (or VENDOR_OTP_SESSION_SECRET).",
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
