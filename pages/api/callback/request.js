import { sendWhatsAppTemplateWithRetry } from "../../../lib/whatsappCloud";
import { insertWhatsAppOutboundLog } from "../../../lib/whatsappOutboundLog";
import {
  buildWhatsAppWishlistTemplateHint,
  extractGraphTemplateErrorCode,
} from "../../../lib/whatsappTemplateHints";
import {
  getWhatsAppCallbackTemplateLanguage,
  getWhatsAppCallbackTemplateName,
  isWhatsAppCloudConfigured,
} from "../../../lib/whatsappEnv";
import {
  formatIsoDateForWhatsAppBody,
  isAllowedPreferredTimeSlot,
  isIsoDateOnOrAfterToday,
} from "../../../lib/wishlistCallbackSchedule";
import { buildWishlistSummaryForTemplate, dedupeVendorTargetsByPhone } from "../../../lib/whatsappWishlistResolve";
import { getApprovedVendorsByIds } from "../../../lib/vendors";
import { verifyCallbackPass } from "../../../lib/otp/callbackSmsPass";

function parseJsonBody(req) {
  try {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return null;
  }
}

function truthyEnv(v) {
  const s = String(v || "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

/**
 * POST — Schedule a vendor WhatsApp callback (3 body variables; no location).
 * Body (snake_case preferred; camelCase aliases accepted):
 * - callbackPass (required)
 * - event_date (optional unless CALLBACK_EVENT_DATE_REQUIRED), YYYY-MM-DD
 * - preferred_callback_date (required), preferred_callback_time (required, allowed slot)
 * - message (optional)
 * - vendor_id OR wishlist
 *
 * WhatsApp template (e.g. eventizo_callback_request): {{1}} event date, {{2}} preferred callback time (slot),
 * {{3}} message (includes formatted preferred callback date so vendors know which day to call).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isWhatsAppCloudConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "WhatsApp Cloud API is not configured (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID).",
    });
  }

  const body = parseJsonBody(req);
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const callbackPass =
    typeof body.callbackPass === "string"
      ? body.callbackPass.trim()
      : typeof body.callbackSmsPass === "string"
        ? body.callbackSmsPass.trim()
        : "";
  const passCheck = verifyCallbackPass(callbackPass);
  if (!passCheck.ok) {
    return res.status(401).json({
      ok: false,
      error: passCheck.error || "Sign in to schedule a callback.",
    });
  }

  const requireEventDate = truthyEnv(process.env.CALLBACK_EVENT_DATE_REQUIRED);

  const eventDateRaw =
    typeof body.event_date === "string"
      ? body.event_date.trim()
      : typeof body.eventDate === "string"
        ? body.eventDate.trim()
        : "";
  if (requireEventDate && !eventDateRaw) {
    return res.status(400).json({ ok: false, error: "Event date is required." });
  }
  if (eventDateRaw && !isIsoDateOnOrAfterToday(eventDateRaw)) {
    return res.status(400).json({
      ok: false,
      error: "Event date must be today or a future date (YYYY-MM-DD).",
    });
  }

  const preferredDateRaw =
    typeof body.preferred_callback_date === "string"
      ? body.preferred_callback_date.trim()
      : typeof body.preferredCallbackDate === "string"
        ? body.preferredCallbackDate.trim()
        : typeof body.preferred_date === "string"
          ? body.preferred_date.trim()
          : typeof body.preferredDate === "string"
            ? body.preferredDate.trim()
            : "";
  if (!preferredDateRaw || !isIsoDateOnOrAfterToday(preferredDateRaw)) {
    return res.status(400).json({
      ok: false,
      error: "Preferred callback date must be today or a future date (YYYY-MM-DD).",
    });
  }

  const preferredTimeRaw =
    typeof body.preferred_callback_time === "string"
      ? body.preferred_callback_time.trim()
      : typeof body.preferredCallbackTime === "string"
        ? body.preferredCallbackTime.trim()
        : typeof body.preferred_time === "string"
          ? body.preferred_time.trim()
          : typeof body.preferredTime === "string"
            ? body.preferredTime.trim()
            : "";
  if (!preferredTimeRaw || !isAllowedPreferredTimeSlot(preferredTimeRaw)) {
    return res.status(400).json({
      ok: false,
      error: "Choose a valid preferred callback time slot.",
    });
  }

  const noteRaw =
    typeof body.message === "string"
      ? body.message.trim().slice(0, 2000)
      : typeof body.note === "string"
        ? body.note.trim().slice(0, 2000)
        : "";

  const vendorIdRaw =
    typeof body.vendor_id === "string"
      ? body.vendor_id.trim()
      : typeof body.vendorId === "string"
        ? body.vendorId.trim()
        : "";

  let vendorRows = [];
  let summaryBase = "";

  if (vendorIdRaw) {
    const { data: rows, error: pErr } = await getApprovedVendorsByIds([vendorIdRaw]);
    if (pErr) {
      return res.status(500).json({ ok: false, error: pErr.message || "Could not load vendor" });
    }
    if (!rows?.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found or not available." });
    }
    vendorRows = rows;
    const v = rows[0];
    summaryBase = `THAALI scheduled callback — ${String(v.category || "Vendor").trim()}`.slice(0, 1024);
  } else {
    const wishlist = body.wishlist && typeof body.wishlist === "object" ? body.wishlist : {};
    const venueIds = Array.isArray(wishlist.venues) ? wishlist.venues.filter((x) => typeof x === "string") : [];
    const photographyIds = Array.isArray(wishlist.photography)
      ? wishlist.photography.filter((x) => typeof x === "string")
      : [];
    const catering = Array.isArray(wishlist.catering) ? wishlist.catering.map((x) => String(x)) : [];
    const decoration = Array.isArray(wishlist.decoration) ? wishlist.decoration.map((x) => String(x)) : [];

    const allIds = [...new Set([...venueIds, ...photographyIds])];
    if (!allIds.length) {
      return res.status(400).json({
        ok: false,
        error: "Add at least one saved venue or photographer to schedule a callback.",
      });
    }

    const { data: rows, error: vErr } = await getApprovedVendorsByIds(allIds);
    if (vErr) {
      return res.status(500).json({ ok: false, error: vErr.message || "Could not load vendors" });
    }
    vendorRows = rows || [];

    const byId = Object.fromEntries(vendorRows.map((v) => [v.id, v]));
    const venueNames = venueIds.map((id) => byId[id]?.businessName).filter(Boolean);
    const photographyNames = photographyIds.map((id) => byId[id]?.businessName).filter(Boolean);

    summaryBase = buildWishlistSummaryForTemplate({ venueNames, photographyNames, catering, decoration });
  }

  /** {{1}} Event date — formatted for display (e.g. "15 Feb 2026") */
  const templateEventDate = (
    eventDateRaw && isIsoDateOnOrAfterToday(eventDateRaw)
      ? formatIsoDateForWhatsAppBody(eventDateRaw)
      : "Not specified"
  ).slice(0, 1024);

  /** {{2}} Preferred callback time — slot only (e.g. "4:00 PM – 6:00 PM") */
  const templatePreferredTime = preferredTimeRaw.slice(0, 1024);

  /** {{3}} Message — includes preferred callback calendar day (only one date line in template {{2}}) */
  const callOn = formatIsoDateForWhatsAppBody(preferredDateRaw);
  const templateMessage = (
    noteRaw ? `${noteRaw} — Call on ${callOn}` : `Please call on ${callOn}.`
  ).slice(0, 1024);

  const templateName = getWhatsAppCallbackTemplateName();
  const lang = getWhatsAppCallbackTemplateLanguage();

  const targets = dedupeVendorTargetsByPhone(vendorRows);
  /** @type {object[]} */
  const results = [];

  function failureDetail() {
    const first = results.find((r) => !r.ok);
    const base = (first && first.error) || "Failed to send WhatsApp message.";
    const hint = buildWhatsAppWishlistTemplateHint({
      kind: "scheduled_callback",
      templateName,
      languageCode: lang,
      graphMessage: first?.error || "",
      graphCode: first && typeof first.errorCode === "number" ? first.errorCode : null,
    });
    return hint ? `${base} ${hint}` : base;
  }

  async function sendOne({ toDigits, vendorId }) {
    const bodyParams = [templateEventDate, templatePreferredTime, templateMessage];
    const attempt = await sendWhatsAppTemplateWithRetry(
      {
        toDigits,
        templateName,
        languageCode: lang,
        bodyParameters: bodyParams,
      },
      { maxAttempts: 3 },
    );

    await insertWhatsAppOutboundLog({
      toDigits,
      templateName,
      status: attempt.ok ? "sent" : "failed",
      vendorId,
      messageId: attempt.messageId,
      errorMessage: attempt.ok ? null : attempt.error,
      attempts: attempt.attempts,
      payload: {
        kind: "scheduled_callback",
        bodyParams,
        meta: {
          wishlistSummary: summaryBase.slice(0, 1024),
          event_date: eventDateRaw || null,
          preferred_callback_date: preferredDateRaw,
          preferred_callback_time: preferredTimeRaw,
          message: noteRaw || null,
        },
      },
    });

    results.push({
      to: toDigits,
      vendorId,
      ok: attempt.ok,
      messageId: attempt.messageId,
      error: attempt.ok ? null : attempt.error,
      errorCode: attempt.ok ? null : extractGraphTemplateErrorCode(attempt.raw),
    });
  }

  if (targets.length === 0) {
    return res.status(400).json({
      ok: false,
      error:
        "No WhatsApp number on file for this vendor (or it could not be normalized). Add a valid WhatsApp phone on the vendor profile.",
    });
  }

  for (const t of targets) {
    await sendOne({ toDigits: t.phoneDigits, vendorId: t.id });
  }

  const okCount = results.filter((r) => r.ok).length;
  const anyOk = okCount > 0;
  const defaultMsg =
    okCount === results.length
      ? "Your callback request has been sent."
      : `Your callback request has been sent (${okCount} of ${results.length}).`;

  const failDetail = anyOk ? null : failureDetail();
  return res.status(anyOk ? 200 : 502).json({
    ok: anyOk,
    sent: okCount,
    failed: results.length - okCount,
    results,
    message: anyOk ? defaultMsg : failDetail,
    ...(anyOk ? {} : { error: failDetail }),
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};
