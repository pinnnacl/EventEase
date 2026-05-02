/**
 * Meta WhatsApp Cloud API (Graph) — server-only.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

function trim(v) {
  return v == null ? "" : String(v).trim();
}

export function getWhatsAppAccessToken() {
  return trim(process.env.WHATSAPP_ACCESS_TOKEN);
}

export function getWhatsAppPhoneNumberId() {
  return trim(process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function getWhatsAppBusinessAccountId() {
  return trim(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
}

/** E.164 digits only, no + (e.g. 9198xxxxxxxx) — company inbox for fallback sends */
export function getWhatsAppFallbackRecipient() {
  return trim(process.env.WHATSAPP_FALLBACK_TO || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "");
}

export function getWhatsAppGraphVersion() {
  return trim(process.env.WHATSAPP_GRAPH_VERSION) || "v19.0";
}

export function getWhatsAppCallbackTemplateName() {
  return trim(process.env.WHATSAPP_TEMPLATE_CALLBACK) || "callback_request";
}

export function getWhatsAppAvailabilityTemplateName() {
  return trim(process.env.WHATSAPP_TEMPLATE_AVAILABILITY) || "availability_request";
}

export function getWhatsAppTemplateLanguage() {
  return trim(process.env.WHATSAPP_TEMPLATE_LANG) || "en";
}

export function isWhatsAppCloudConfigured() {
  return Boolean(getWhatsAppAccessToken() && getWhatsAppPhoneNumberId());
}
