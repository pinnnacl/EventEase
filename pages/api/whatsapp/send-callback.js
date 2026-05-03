import { sendWhatsAppTemplateWithRetry } from "../../../lib/whatsappCloud";
import { insertWhatsAppOutboundLog } from "../../../lib/whatsappOutboundLog";
import {
  getWhatsAppCallbackTemplateName,
  getWhatsAppFallbackRecipient,
  getWhatsAppTemplateLanguage,
  isWhatsAppCloudConfigured,
} from "../../../lib/whatsappEnv";
import { normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";
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

/**
 * POST
 * — Wishlist: { wishlist: { venues[], photography[], catering[], decoration[] }, eventDate?, userName? }
 * — Public profile: { vendorId, vendorCategory: "photographer"|"makeup", eventDate?, vendorName? (ignored for send; use DB name) }
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
      error: passCheck.error || "SMS verification required before requesting a callback.",
    });
  }

  const eventDateRaw = typeof body.eventDate === "string" ? body.eventDate.trim() : "";
  const eventDate = eventDateRaw.slice(0, 120) || "Not specified";
  const userName = typeof body.userName === "string" ? body.userName.trim().slice(0, 120) : "";

  const profileVendorId = typeof body.vendorId === "string" ? body.vendorId.trim() : "";

  let vendorRows = [];
  let summary = "";

  if (profileVendorId) {
    const vendorCategory = typeof body.vendorCategory === "string" ? body.vendorCategory.trim().toLowerCase() : "";
    const { data: rows, error: pErr } = await getApprovedVendorsByIds([profileVendorId]);
    if (pErr) {
      return res.status(500).json({ ok: false, error: pErr.message || "Could not load vendor" });
    }
    if (!rows?.length) {
      return res.status(404).json({ ok: false, error: "Vendor not found or not available." });
    }
    const v = rows[0];
    vendorRows = rows;
    const catLabel =
      vendorCategory === "makeup"
        ? "Makeup"
        : vendorCategory === "photographer"
          ? "Photography"
          : String(v.category || "Services").trim() || "Services";
    summary = `THAALI public profile — ${catLabel} listing.`.slice(0, 1024);
    if (userName) {
      summary = `${summary} Customer: ${userName}`.slice(0, 1024);
    }
  } else {
    const wishlist = body.wishlist && typeof body.wishlist === "object" ? body.wishlist : {};
    const venueIds = Array.isArray(wishlist.venues) ? wishlist.venues.filter((x) => typeof x === "string") : [];
    const photographyIds = Array.isArray(wishlist.photography)
      ? wishlist.photography.filter((x) => typeof x === "string")
      : [];
    const catering = Array.isArray(wishlist.catering) ? wishlist.catering.map((x) => String(x)) : [];
    const decoration = Array.isArray(wishlist.decoration) ? wishlist.decoration.map((x) => String(x)) : [];

    const allIds = [...new Set([...venueIds, ...photographyIds])];
    const { data: rows, error: vErr } = await getApprovedVendorsByIds(allIds);
    if (vErr) {
      return res.status(500).json({ ok: false, error: vErr.message || "Could not load vendors" });
    }
    vendorRows = rows || [];

    const byId = Object.fromEntries(vendorRows.map((v) => [v.id, v]));
    const venueNames = venueIds.map((id) => byId[id]?.businessName).filter(Boolean);
    const photographyNames = photographyIds.map((id) => byId[id]?.businessName).filter(Boolean);

    summary = buildWishlistSummaryForTemplate({ venueNames, photographyNames, catering, decoration });
    if (userName) {
      summary = `${summary} | Customer: ${userName}`.slice(0, 1024);
    }
  }

  const templateName = getWhatsAppCallbackTemplateName();
  const lang = getWhatsAppTemplateLanguage();
  const fallbackLabel = (process.env.WHATSAPP_FALLBACK_VENDOR_LABEL || "THAALI").trim().slice(0, 256);

  const targets = dedupeVendorTargetsByPhone(vendorRows);
  /** @type {object[]} */
  const results = [];

  async function sendOne({ toDigits, vendorId, displayName }) {
    const bodyParams = [displayName, eventDate, summary];
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
      payload: { kind: profileVendorId ? "profile_callback" : "callback", bodyParams },
    });

    results.push({
      to: toDigits,
      vendorId,
      ok: attempt.ok,
      messageId: attempt.messageId,
      error: attempt.ok ? null : attempt.error,
    });
  }

  if (targets.length === 0) {
    const fallbackRaw = getWhatsAppFallbackRecipient();
    const fallbackDigits = normalizeWhatsAppRecipientDigits(fallbackRaw);
    if (!fallbackDigits) {
      return res.status(400).json({
        ok: false,
        error:
          "No vendor phone on file, and WHATSAPP_FALLBACK_TO is not set (or invalid).",
      });
    }
    await sendOne({ toDigits: fallbackDigits, vendorId: null, displayName: fallbackLabel });
    const anyOk = results.some((r) => r.ok);
    return res.status(anyOk ? 200 : 502).json({
      ok: anyOk,
      fallback: true,
      results,
      message: anyOk ? "Notification sent to THAALI." : "Failed to send WhatsApp message.",
    });
  }

  for (const t of targets) {
    await sendOne({ toDigits: t.phoneDigits, vendorId: t.id, displayName: t.businessName });
  }

  const okCount = results.filter((r) => r.ok).length;
  const anyOk = okCount > 0;

  const singularProfile = Boolean(profileVendorId);
  const defaultMsg = singularProfile
    ? "Vendor has been notified."
    : okCount === results.length
      ? "Vendors have been notified."
      : `Sent ${okCount} of ${results.length} message(s).`;

  return res.status(anyOk ? 200 : 502).json({
    ok: anyOk,
    fallback: false,
    sent: okCount,
    failed: results.length - okCount,
    results,
    message: anyOk ? defaultMsg : "Failed to send WhatsApp message.",
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};
