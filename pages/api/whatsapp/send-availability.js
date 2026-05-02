import { sendWhatsAppTemplateWithRetry } from "../../../lib/whatsappCloud";
import { insertWhatsAppOutboundLog } from "../../../lib/whatsappOutboundLog";
import {
  getWhatsAppAvailabilityTemplateName,
  getWhatsAppFallbackRecipient,
  getWhatsAppTemplateLanguage,
  isWhatsAppCloudConfigured,
} from "../../../lib/whatsappEnv";
import { normalizeWhatsAppRecipientDigits } from "../../../lib/whatsappPhone";
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
 * POST — same body shape as send-callback.
 * Template: WHATSAPP_TEMPLATE_AVAILABILITY (default availability_request).
 * Body parameters: [ eventDate, wishlistSummary, customerName ]
 * Create a matching approved template in Meta Business Manager.
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
  const lang = getWhatsAppTemplateLanguage();
  const fallbackLabel = (process.env.WHATSAPP_FALLBACK_VENDOR_LABEL || "THAALI").trim().slice(0, 256);

  const targets = dedupeVendorTargetsByPhone(vendorRows || []);
  const results = [];

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
    });
  }

  if (targets.length === 0) {
    const fallbackDigits = normalizeWhatsAppRecipientDigits(getWhatsAppFallbackRecipient());
    if (!fallbackDigits) {
      return res.status(400).json({
        ok: false,
        error:
          "No vendors with phone numbers in your wishlist, and WHATSAPP_FALLBACK_TO is not set (or invalid).",
      });
    }
    await sendOne({ toDigits: fallbackDigits, vendorId: null });
    const anyOk = results.some((r) => r.ok);
    return res.status(anyOk ? 200 : 502).json({
      ok: anyOk,
      fallback: true,
      results,
      message: anyOk ? "Notification sent to THAALI." : "Failed to send WhatsApp message.",
    });
  }

  for (const t of targets) {
    await sendOne({ toDigits: t.phoneDigits, vendorId: t.id });
  }

  const okCount = results.filter((r) => r.ok).length;
  const anyOk = okCount > 0;
  return res.status(anyOk ? 200 : 502).json({
    ok: anyOk,
    fallback: false,
    sent: okCount,
    failed: results.length - okCount,
    results,
    message:
      okCount === results.length
        ? "Vendors have been notified."
        : `Sent ${okCount} of ${results.length} message(s).`,
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};
