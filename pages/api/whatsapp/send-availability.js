import { sendWhatsAppTemplateWithRetry } from "../../../lib/whatsappCloud";
import { insertWhatsAppOutboundLog } from "../../../lib/whatsappOutboundLog";
import {
  buildWhatsAppWishlistTemplateHint,
  extractGraphTemplateErrorCode,
} from "../../../lib/whatsappTemplateHints";
import {
  getWhatsAppAvailabilityTemplateLanguage,
  getWhatsAppAvailabilityTemplateName,
  isWhatsAppCloudConfigured,
} from "../../../lib/whatsappEnv";
import { buildWishlistSummaryForTemplate, dedupeVendorTargetsByPhone } from "../../../lib/whatsappWishlistResolve";
import { getApprovedVendorsByIds } from "../../../lib/vendors";

function parseJsonBody(req) {
  try {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return null;
  }
}

/**
 * POST — same body shape as send-callback (no callbackPass required on this route).
 * Template: WHATSAPP_TEMPLATE_AVAILABILITY (default `availability_request`).
 * BODY must have exactly 3 variables in order: (1) event date, (2) wishlist summary, (3) customer name — approve in Meta Manager.
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

  const wishlist = body.wishlist && typeof body.wishlist === "object" ? body.wishlist : {};
  const venueIds = Array.isArray(wishlist.venues) ? wishlist.venues.filter((x) => typeof x === "string") : [];
  const photographyIds = Array.isArray(wishlist.photography)
    ? wishlist.photography.filter((x) => typeof x === "string")
    : [];
  const catering = Array.isArray(wishlist.catering) ? wishlist.catering.map((x) => String(x)) : [];
  const decoration = Array.isArray(wishlist.decoration) ? wishlist.decoration.map((x) => String(x)) : [];

  const eventDateRaw = typeof body.eventDate === "string" ? body.eventDate.trim() : "";
  const eventDate = eventDateRaw.slice(0, 120) || "Not specified";
  const userName = typeof body.userName === "string" ? body.userName.trim().slice(0, 120) : "Guest";

  const allIds = [...new Set([...venueIds, ...photographyIds])];
  const { data: vendorRows, error: vErr } = await getApprovedVendorsByIds(allIds);
  if (vErr) {
    return res.status(500).json({ ok: false, error: vErr.message || "Could not load vendors" });
  }

  const byId = Object.fromEntries((vendorRows || []).map((v) => [v.id, v]));
  const venueNames = venueIds.map((id) => byId[id]?.businessName).filter(Boolean);
  const photographyNames = photographyIds.map((id) => byId[id]?.businessName).filter(Boolean);

  const summary = buildWishlistSummaryForTemplate({ venueNames, photographyNames, catering, decoration }).slice(
    0,
    1024,
  );

  const templateName = getWhatsAppAvailabilityTemplateName();
  const lang = getWhatsAppAvailabilityTemplateLanguage();

  const targets = dedupeVendorTargetsByPhone(vendorRows || []);
  const results = [];

  function availabilityFailureDetail() {
    const first = results.find((r) => !r.ok);
    const base = (first && first.error) || "Failed to send WhatsApp message.";
    const hint = buildWhatsAppWishlistTemplateHint({
      kind: "availability",
      templateName,
      languageCode: lang,
      graphMessage: first?.error || "",
      graphCode: first && typeof first.errorCode === "number" ? first.errorCode : null,
    });
    return hint ? `${base} ${hint}` : base;
  }

  async function sendOne({ toDigits, vendorId }) {
    const bodyParams = [eventDate, summary, userName];
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
      payload: { kind: "availability", bodyParams },
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
        "No WhatsApp numbers on file for saved vendors (or they could not be normalized). Each vendor must have a valid WhatsApp phone on their profile.",
    });
  }

  for (const t of targets) {
    await sendOne({ toDigits: t.phoneDigits, vendorId: t.id });
  }

  const okCount = results.filter((r) => r.ok).length;
  const anyOk = okCount > 0;
  const defaultMsg =
    okCount === results.length
      ? "Vendors have been notified."
      : `Sent ${okCount} of ${results.length} message(s).`;
  const failDetail = anyOk ? null : availabilityFailureDetail();
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
