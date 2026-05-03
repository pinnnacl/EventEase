/**
 * Meta WhatsApp Cloud API (Graph) — server-only.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const LOG_PREFIX = "[whatsapp-cloud]";

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

export function getWhatsAppGraphVersion() {
  return trim(process.env.WHATSAPP_GRAPH_VERSION) || "v19.0";
}

export function getWhatsAppCallbackTemplateName() {
  return trim(process.env.WHATSAPP_TEMPLATE_CALLBACK) || "callback_request";
}

export function getWhatsAppAvailabilityTemplateName() {
  return trim(process.env.WHATSAPP_TEMPLATE_AVAILABILITY) || "availability_request";
}

/**
 * Template with one body variable: the 6-digit OTP (must match name in WhatsApp Manager).
 * Default matches project template `eventizo_wa_auth`.
 */
export function getWhatsAppVendorOtpTemplateName() {
  return trim(process.env.WHATSAPP_TEMPLATE_VENDOR_OTP) || "eventizo_wa_auth";
}

export function getWhatsAppTemplateLanguage() {
  return trim(process.env.WHATSAPP_TEMPLATE_LANG) || "en";
}

/**
 * Locale for wishlist / profile **callback** template only (#132001 if wrong).
 * Defaults to `en_US` when unset — many WABAs approve English (US), not `en`.
 */
export function getWhatsAppCallbackTemplateLanguage() {
  const o = trim(process.env.WHATSAPP_TEMPLATE_CALLBACK_LANG);
  if (o) return o;
  const global = trim(process.env.WHATSAPP_TEMPLATE_LANG);
  if (global) return global;
  return "en_US";
}

/**
 * Locale for **availability** template (if you still use that route).
 */
export function getWhatsAppAvailabilityTemplateLanguage() {
  const o = trim(process.env.WHATSAPP_TEMPLATE_AVAILABILITY_LANG);
  if (o) return o;
  const global = trim(process.env.WHATSAPP_TEMPLATE_LANG);
  if (global) return global;
  return "en_US";
}

/**
 * Language code for the vendor OTP template only — must match the template’s approved locale in Meta
 * (error #132001 if name or language mismatch). Use WHATSAPP_TEMPLATE_VENDOR_OTP_LANG to override, e.g. en_US
 */
export function getWhatsAppVendorOtpTemplateLanguage() {
  const o = trim(process.env.WHATSAPP_TEMPLATE_VENDOR_OTP_LANG);
  if (o) return o;
  return getWhatsAppTemplateLanguage();
}

/**
 * Human-readable reasons WhatsApp Cloud API cannot be used (never includes secret values).
 * @returns {string[]}
 */
export function describeWhatsAppCloudMisconfiguration() {
  const issues = [];
  const token = getWhatsAppAccessToken();
  const phoneId = getWhatsAppPhoneNumberId();

  if (!token) {
    issues.push("WHATSAPP_ACCESS_TOKEN is missing or empty");
  } else if (token.length < 20) {
    issues.push("WHATSAPP_ACCESS_TOKEN looks invalid (too short — use a valid System User / Cloud API token)");
  }

  if (!phoneId) {
    issues.push("WHATSAPP_PHONE_NUMBER_ID is missing or empty");
  } else if (!/^\d{8,25}$/.test(phoneId)) {
    issues.push(
      "WHATSAPP_PHONE_NUMBER_ID must be digits only (Meta Graph Phone Number ID, typically 10–16 digits)",
    );
  }

  return issues;
}

/**
 * Logs configuration problems (or dev-only OK) without printing tokens.
 * @param {string} [context] e.g. "vendor-otp-send"
 */
export function logWhatsAppCloudConfigStatus(context = "") {
  const tag = context ? `${LOG_PREFIX} ${context}` : LOG_PREFIX;
  const issues = describeWhatsAppCloudMisconfiguration();
  if (issues.length) {
    console.warn(tag, "Configuration incomplete:", issues.join("; "));
  } else if (process.env.NODE_ENV !== "production") {
    console.info(tag, "WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set (values not logged).");
  }
}

/**
 * True when both access token and phone number ID are present and pass basic sanity checks.
 * Meta tokens are long strings; phone number IDs are numeric.
 */
export function isWhatsAppCloudConfigured() {
  const token = getWhatsAppAccessToken();
  const phoneId = getWhatsAppPhoneNumberId();
  if (!token || !phoneId) return false;
  if (token.length < 20) return false;
  if (!/^\d{8,25}$/.test(phoneId)) return false;
  return true;
}
