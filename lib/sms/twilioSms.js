/**
 * Outbound SMS via Twilio REST API (no SDK dependency).
 * For local dev without credentials, logs only when allowed (never returns OTP in HTTP responses).
 */

function isDevSmsLogAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.CUSTOMER_SMS_DEV_LOG === "1";
}

/**
 * @param {{ toE164: string; body: string }} opts
 * @returns {Promise<{ ok: boolean; error?: string; skipped?: boolean }>}
 */
export async function sendSmsViaTwilio({ toE164, body }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_SMS_FROM?.trim();

  if (!accountSid || !authToken || !from) {
    if (isDevSmsLogAllowed()) {
      console.info("[twilioSms] skipping send (no TWILIO_* env). SMS body:", body, "→", toE164);
      return { ok: true, skipped: true };
    }
    return {
      ok: false,
      error:
        "SMS is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SMS_FROM, or enable CUSTOMER_SMS_DEV_LOG=1 for development.",
    };
  }

  const to = toE164.startsWith("+") ? toE164 : `+${toE164}`;
  const params = new URLSearchParams();
  params.set("To", to);
  params.set("From", from);
  params.set("Body", body);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    console.warn("[twilioSms] Twilio error", res.status, text.slice(0, 500));
    return { ok: false, error: "Could not send SMS. Try again later." };
  }
  return { ok: true };
}
