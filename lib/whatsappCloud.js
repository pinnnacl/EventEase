import {
  getWhatsAppAccessToken,
  getWhatsAppGraphVersion,
  getWhatsAppPhoneNumberId,
  logWhatsAppCloudConfigStatus,
} from "./whatsappEnv";

const DEFAULT_RETRIES = 3;
const RETRY_DELAYS_MS = [400, 1200, 2800];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {object} payload
 * @returns {Promise<{ ok: boolean, status: number, json: object | null, text: string }>}
 */
async function graphFetch(payload) {
  const token = getWhatsAppAccessToken();
  const phoneNumberId = getWhatsAppPhoneNumberId();
  const version = getWhatsAppGraphVersion();
  if (!token || !phoneNumberId) {
    logWhatsAppCloudConfigStatus("graphFetch");
    return { ok: false, status: 500, json: null, text: "WhatsApp Cloud API is not configured" };
  }

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, json, text };
}

/**
 * Send a template message (required for business-initiated / outside 24h window).
 * For AUTHENTICATION / OTP copy-code templates, set `includeAuthenticationOtpButton: true` so the
 * same OTP is sent in body and button — Meta requires this or returns (#131008).
 *
 * @param {{
 *   toDigits: string,
 *   templateName: string,
 *   languageCode?: string,
 *   bodyParameters: string[],
 *   includeAuthenticationOtpButton?: boolean,
 * }} opts
 */
export async function sendWhatsAppTemplateOnce(opts) {
  const { toDigits, templateName, languageCode = "en", bodyParameters, includeAuthenticationOtpButton } = opts;
  if (!toDigits || !templateName || !Array.isArray(bodyParameters)) {
    return { ok: false, error: "Invalid template send options", messageId: null, raw: null };
  }

  const bodyParams = bodyParameters.map((t) => ({
    type: "text",
    text: String(t).slice(0, 1024),
  }));

  /** @type {object[]} */
  const components = [
    {
      type: "body",
      parameters: bodyParams,
    },
  ];

  if (includeAuthenticationOtpButton) {
    const otp = String(bodyParameters[0] ?? "").slice(0, 15);
    if (!otp) {
      return { ok: false, error: "Authentication template requires a non-empty OTP in bodyParameters[0].", messageId: null, raw: null };
    }
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: otp }],
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toDigits,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const { ok, status, json } = await graphFetch(payload);
  if (ok && json?.messages?.[0]?.id) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[whatsapp-cloud] template send ok", {
        template: templateName,
        messageId: json.messages[0].id,
      });
    }
    return { ok: true, error: null, messageId: json.messages[0].id, raw: json };
  }
  const errMsg =
    json?.error?.message || json?.error?.error_user_msg || `HTTP ${status}` || "WhatsApp send failed";
  console.warn("[whatsapp-cloud] template send failed", {
    template: templateName,
    status,
    error: errMsg,
    code: json?.error?.code,
  });
  return { ok: false, error: errMsg, messageId: null, raw: json };
}

/**
 * @param {Parameters<typeof sendWhatsAppTemplateOnce>[0]} opts
 * @param {{ maxAttempts?: number }} [retryOpts]
 */
export async function sendWhatsAppTemplateWithRetry(opts, retryOpts = {}) {
  const maxAttempts = Math.min(Math.max(retryOpts.maxAttempts ?? DEFAULT_RETRIES, 1), 5);
  let last = /** @type {Awaited<ReturnType<typeof sendWhatsAppTemplateOnce>>} */ ({
    ok: false,
    error: "No attempts",
    messageId: null,
    raw: null,
  });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    last = await sendWhatsAppTemplateOnce(opts);
    if (last.ok) return { ...last, attempts: attempt + 1 };
    if (attempt < maxAttempts - 1) {
      const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)] ?? 1000;
      await sleep(delay);
    }
  }
  return { ...last, attempts: maxAttempts };
}
