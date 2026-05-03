/**
 * Vendor profile verification — WhatsApp OTP only (no SMS).
 */
import crypto from "crypto";
import { getSupabaseAdmin } from "../supabaseAdmin";
import { applyVendorPhoneVerifiedAfterWhatsAppOtp } from "../vendors";
import { sendWhatsAppTemplateOnce } from "../whatsappCloud";
import {
  describeWhatsAppCloudMisconfiguration,
  getWhatsAppVendorOtpTemplateLanguage,
  getWhatsAppVendorOtpTemplateName,
  isWhatsAppCloudConfigured,
  logWhatsAppCloudConfigStatus,
} from "../whatsappEnv";
import { maskWhatsAppDestinationDigits, normalizeWhatsAppRecipientDigits } from "../whatsappPhone";
import { tryMintVendorProfileSessionPass } from "./vendorSessionPass";

const LOG_PREFIX = "[vendor-whatsapp-otp]";

function getPepper() {
  return String(process.env.OTP_CODE_PEPPER || process.env.VENDOR_OTP_SESSION_SECRET || "dev-pepper-change").trim();
}

function hashCode(code) {
  return crypto.createHmac("sha256", getPepper()).update(String(code).trim()).digest("hex");
}

function randomSixDigit() {
  return String(crypto.randomInt(100000, 1000000));
}

function isMissingOtpTableError(err) {
  const msg = String(err?.message || "");
  const code = String(err?.code || "");
  return (
    code === "42P01" ||
    msg.includes("vendor_whatsapp_otp_challenges") ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

function otpTableMissingMessage() {
  return "OTP table missing. Run supabase/migrations/014_vendor_whatsapp_otp_challenges.sql (and 015_vendor_whatsapp_otp_destination.sql) in Supabase SQL editor.";
}

function otpDestinationColumnMissingMessage() {
  return "OTP destination columns missing. Run supabase/migrations/015_vendor_whatsapp_otp_destination.sql in Supabase SQL editor.";
}

/**
 * Send WhatsApp OTP for vendor profile phone verification.
 * Uses `phoneRaw` from the profile form when provided; otherwise falls back to `vendors.phone` in the database.
 * @param {string} userId
 * @param {{ phoneRaw?: string | null }} [opts]
 */
export async function createVendorWhatsAppChallengeAndSend(userId, opts = {}) {
  if (!isWhatsAppCloudConfigured()) {
    logWhatsAppCloudConfigStatus("vendor-otp:createVendorWhatsAppChallengeAndSend");
    const detail = describeWhatsAppCloudMisconfiguration().join(" ");
    console.warn(`${LOG_PREFIX} send blocked: WhatsApp Cloud not configured`, detail || "(no detail)");
    return {
      ok: false,
      error: `WhatsApp Cloud API is not configured. ${detail || "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID."}`,
    };
  }

  const admin = getSupabaseAdmin();
  const { data: vendor, error: vErr } = await admin
    .from("vendors")
    .select("id, phone, user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (vErr) {
    console.warn(`${LOG_PREFIX} vendor lookup failed`, vErr.message);
    return { ok: false, error: vErr.message || "Database error" };
  }

  const savedPhone = vendor?.phone != null ? String(vendor.phone).trim() : "";
  const requestedPhone = typeof opts.phoneRaw === "string" ? opts.phoneRaw.trim() : "";
  /** Prefer the number in the profile form when the client sends it; else saved `vendors.phone`. */
  const phoneRaw = requestedPhone || savedPhone;
  if (!phoneRaw) {
    console.warn(`${LOG_PREFIX} send blocked: no phone (form + DB empty) for user`, userId);
    return {
      ok: false,
      error: "No phone number on file. Save a phone number on your vendor profile before requesting WhatsApp OTP.",
    };
  }

  const toDigits = normalizeWhatsAppRecipientDigits(phoneRaw);
  if (!toDigits || toDigits.length < 10) {
    console.warn(`${LOG_PREFIX} send blocked: invalid vendors.phone after normalize`, { len: toDigits?.length });
    return {
      ok: false,
      error: "Invalid phone number on profile. Use a valid mobile number (e.g. 10-digit India or international).",
    };
  }

  const code = randomSixDigit();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await admin.from("vendor_whatsapp_otp_challenges").delete().eq("user_id", userId);

  const clientPhoneInput = requestedPhone || savedPhone || null;
  const { error: insErr } = await admin.from("vendor_whatsapp_otp_challenges").insert({
    user_id: userId,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
    destination_digits: toDigits,
    client_phone_input: clientPhoneInput,
  });
  if (insErr) {
    if (isMissingOtpTableError(insErr)) {
      console.error(`${LOG_PREFIX} insert challenge failed: table missing`, insErr.message);
      return { ok: false, error: otpTableMissingMessage() };
    }
    const msg = String(insErr.message || "");
    if (msg.includes("destination_digits") || msg.includes("client_phone_input")) {
      console.error(`${LOG_PREFIX} insert challenge failed: OTP destination columns missing`, insErr.message);
      return { ok: false, error: otpDestinationColumnMissingMessage() };
    }
    console.error(`${LOG_PREFIX} insert challenge failed`, insErr.message);
    return { ok: false, error: insErr.message || "Could not start OTP challenge." };
  }

  const templateName = getWhatsAppVendorOtpTemplateName();
  const lang = getWhatsAppVendorOtpTemplateLanguage();
  /** Meta AUTH templates: body OTP + same OTP in button component (#131008 if omitted). */
  const attempt = await sendWhatsAppTemplateOnce({
    toDigits,
    templateName,
    languageCode: lang,
    bodyParameters: [code],
    includeAuthenticationOtpButton: true,
  });

  if (!attempt.ok) {
    await admin.from("vendor_whatsapp_otp_challenges").delete().eq("user_id", userId);
    console.warn(`${LOG_PREFIX} WhatsApp template send failed`, {
      template: templateName,
      languageCode: lang,
      error: attempt.error,
      hint: "Meta #132001: use exact template name and language as in WhatsApp Manager; set WHATSAPP_TEMPLATE_VENDOR_OTP_LANG if needed (e.g. en_US).",
    });
    return { ok: false, error: attempt.error || "Could not send WhatsApp OTP." };
  }

  const sentToHint = maskWhatsAppDestinationDigits(toDigits);

  console.info(`${LOG_PREFIX} OTP sent`, {
    userId,
    template: templateName,
    messageId: attempt.messageId,
    sentToHint,
  });

  return {
    ok: true,
    expiresInSec: 600,
    message: `WhatsApp accepted the OTP send to ${sentToHint}. After you verify, this number will be saved on your profile.`,
    sentToHint,
    messageId: attempt.messageId || null,
  };
}

/**
 * @param {string} userId
 * @param {string} rawCode
 */
export async function verifyVendorWhatsAppChallenge(userId, rawCode) {
  const admin = getSupabaseAdmin();
  const code = String(rawCode || "").replace(/\D/g, "").trim();
  if (code.length !== 6) {
    console.warn(`${LOG_PREFIX} verify rejected: bad code length`, { userId });
    return { ok: false, error: "Enter the 6-digit code from WhatsApp." };
  }

  const { data: row, error: fetchErr } = await admin
    .from("vendor_whatsapp_otp_challenges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) {
    if (isMissingOtpTableError(fetchErr)) {
      console.error(`${LOG_PREFIX} verify failed: OTP table missing`, fetchErr.message);
      return { ok: false, error: otpTableMissingMessage() };
    }
    console.error(`${LOG_PREFIX} verify fetch failed`, fetchErr.message);
    return { ok: false, error: fetchErr.message || "Could not verify OTP." };
  }
  if (!row) {
    console.warn(`${LOG_PREFIX} verify rejected: no active challenge`, { userId });
    return { ok: false, error: "No active OTP. Request a new code." };
  }

  const expires = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (Date.now() > expires) {
    await admin.from("vendor_whatsapp_otp_challenges").delete().eq("id", row.id);
    console.warn(`${LOG_PREFIX} verify rejected: expired`, { userId });
    return { ok: false, error: "OTP expired. Request a new WhatsApp code." };
  }

  const attempts = Number(row.attempts) || 0;
  if (attempts >= 5) {
    await admin.from("vendor_whatsapp_otp_challenges").delete().eq("id", row.id);
    console.warn(`${LOG_PREFIX} verify rejected: too many prior attempts`, { userId });
    return { ok: false, error: "Too many attempts. Request a new WhatsApp code." };
  }

  const expectedHash = row.code_hash;
  const gotHash = hashCode(code);
  if (expectedHash !== gotHash) {
    await admin.from("vendor_whatsapp_otp_challenges").update({ attempts: attempts + 1 }).eq("id", row.id);
    console.warn(`${LOG_PREFIX} verify rejected: wrong code`, { userId, attempts: attempts + 1 });
    return { ok: false, error: "Incorrect code. Try again." };
  }

  const destDigits = row.destination_digits
    ? normalizeWhatsAppRecipientDigits(String(row.destination_digits))
    : null;
  const { data: vendorRow } = await admin.from("vendors").select("phone").eq("user_id", userId).maybeSingle();
  const fallbackDigits = normalizeWhatsAppRecipientDigits(vendorRow?.phone || "");
  const effectiveDest = destDigits || fallbackDigits;
  if (!effectiveDest) {
    await admin.from("vendor_whatsapp_otp_challenges").delete().eq("user_id", userId);
    return { ok: false, error: "Could not resolve verified phone. Request a new code." };
  }

  const clientRaw =
    row.client_phone_input != null && String(row.client_phone_input).trim() !== ""
      ? String(row.client_phone_input).trim()
      : String(vendorRow?.phone || "").trim() || null;

  await admin.from("vendor_whatsapp_otp_challenges").delete().eq("user_id", userId);

  const verifyMark = await applyVendorPhoneVerifiedAfterWhatsAppOtp(userId, effectiveDest, clientRaw);
  if (verifyMark.error) {
    console.error(`${LOG_PREFIX} apply verified phone failed`, verifyMark.error.message);
    return { ok: false, error: verifyMark.error.message || "Could not save verified phone." };
  }

  const session = tryMintVendorProfileSessionPass(userId, effectiveDest);
  if (!session.ok) {
    console.error(`${LOG_PREFIX} verify succeeded but session mint failed`, session.error);
    return { ok: false, error: session.error };
  }

  console.info(`${LOG_PREFIX} verify ok, session minted`, { userId, sessionExp: session.exp });
  return {
    ok: true,
    vendor: verifyMark.data,
    vendorOtpSession: session.vendorOtpSession,
    sessionExpiresAt: session.exp,
  };
}
