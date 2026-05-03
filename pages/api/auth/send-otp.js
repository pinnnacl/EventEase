import crypto from "crypto";
import { getCustomerAuthDb } from "../../../lib/customerAuthDb";
import { hashCustomerOtpCode } from "../../../lib/customerSession";
import { parsePagesApiJsonBody } from "../../../lib/parsePagesApiJsonBody";
import { sendSmsViaTwilio } from "../../../lib/sms/twilioSms";
import { normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";

const OTP_TTL_MS = 10 * 60 * 1000;

function isValidIndiaMobile10(d) {
  return /^[6-9]\d{9}$/.test(d);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parsePagesApiJsonBody(req);
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const locationRaw = typeof body.location === "string" ? body.location.trim().slice(0, 200) : "";
  const location = locationRaw || null;
  const phoneRaw = typeof body.phone_number === "string" ? body.phone_number.replace(/\D/g, "") : "";

  if (!name) {
    return res.status(400).json({ ok: false, error: "Please enter your full name." });
  }
  if (!isValidIndiaMobile10(phoneRaw)) {
    return res.status(400).json({ ok: false, error: "Enter a valid 10-digit Indian mobile number." });
  }

  const phoneDigits = normalizeWhatsAppRecipientDigits(phoneRaw);
  if (!phoneDigits || phoneDigits.length < 12) {
    return res.status(400).json({ ok: false, error: "Invalid phone number." });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = hashCustomerOtpCode(code);
  const expiresAt = Date.now() + OTP_TTL_MS;
  const now = Date.now();

  try {
    const db = getCustomerAuthDb();
    db.prepare("DELETE FROM customer_otp_challenges WHERE phone_digits = ?").run(phoneDigits);
    db.prepare(
      `INSERT INTO customer_otp_challenges (phone_digits, code_hash, expires_at, attempts, name, location, created_at)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
    ).run(phoneDigits, codeHash, expiresAt, name, location, now);
  } catch (e) {
    console.error("[api/auth/send-otp] db error", e);
    return res.status(500).json({ ok: false, error: "Could not start verification. Try again." });
  }

  const e164 = `+${phoneDigits}`;
  const smsBody = `Your EVENTiZO verification code is ${code}. Valid for 10 minutes. Do not share this code.`;

  const sent = await sendSmsViaTwilio({ toE164: e164, body: smsBody });
  if (!sent.ok) {
    try {
      const db = getCustomerAuthDb();
      db.prepare("DELETE FROM customer_otp_challenges WHERE phone_digits = ?").run(phoneDigits);
    } catch {
      /* ignore */
    }
    return res.status(503).json({ ok: false, error: sent.error || "SMS could not be sent." });
  }

  return res.status(200).json({
    ok: true,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    message: sent.skipped
      ? "OTP recorded (SMS not sent — configure Twilio or check server logs in dev)."
      : "OTP sent by SMS.",
    smsSkipped: Boolean(sent.skipped),
  });
}
