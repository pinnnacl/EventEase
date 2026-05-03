/**
 * Human hints when Graph template sends fail (name/language/body mismatch).
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 */

/** @param {unknown} raw Graph API JSON body on failed template send */
export function extractGraphTemplateErrorCode(raw) {
  if (!raw || typeof raw !== "object") return null;
  const c = /** @type {{ error?: { code?: unknown } }} */ (raw).error?.code;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

/** @param {unknown} n */
function num(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : NaN;
}

/**
 * @param {{
 *   kind: "callback" | "availability" | "scheduled_callback";
 *   templateName: string;
 *   languageCode: string;
 *   graphMessage?: string | null;
 *   graphCode?: number | null;
 * }} p
 * @returns {string} short hint (empty if nothing to add)
 */
export function buildWhatsAppWishlistTemplateHint(p) {
  const msg = String(p.graphMessage || "").trim();
  const code = p.graphCode != null ? num(p.graphCode) : NaN;

  const isScheduled = p.kind === "scheduled_callback";
  const isAvailability = p.kind === "availability";

  const envKey = isAvailability ? "WHATSAPP_TEMPLATE_AVAILABILITY" : "WHATSAPP_TEMPLATE_CALLBACK";
  const langEnvKey = isAvailability
    ? "WHATSAPP_TEMPLATE_AVAILABILITY_LANG"
    : "WHATSAPP_TEMPLATE_CALLBACK_LANG";
  const defaultName = isAvailability ? "availability_request" : isScheduled ? "eventizo_callback_request" : "callback_request";

  const bodyOrder = isAvailability
    ? "event date, wishlist summary, customer name"
    : isScheduled
      ? "event date, preferred callback time, message"
      : "vendor display name, event date, wishlist summary";

  const varCount = 3;

  const hints = [];

  if (
    code === 132001 ||
    code === 132000 ||
    /132001|132000|template name|does not exist|not found|translation/i.test(msg)
  ) {
    hints.push(
      `Template "${p.templateName}" / language "${p.languageCode}" must exist and be approved in WhatsApp Manager. Set ${envKey} to the exact template name and ${langEnvKey} (or WHATSAPP_TEMPLATE_LANG) to the exact locale shown in Manager (e.g. en_US, en, hi).`,
    );
  }

  if (/parameter|variable|placeholder|component|mismatch|invalid/i.test(msg) || code === 131008) {
    hints.push(`Approved template BODY needs exactly ${varCount} variables in this order: ${bodyOrder}.`);
  }

  if (hints.length === 0 && msg) {
    hints.push(
      `Check ${envKey} (default ${defaultName}), ${langEnvKey} / WHATSAPP_TEMPLATE_LANG, and that the template BODY has ${varCount} variables: ${bodyOrder}.`,
    );
  }

  return hints.join(" ");
}
