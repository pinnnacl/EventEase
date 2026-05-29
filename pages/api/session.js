import { sendJsonWithEtag } from "../../lib/apiCacheHeaders";
import {
  readCookieValue,
  readCustomerSessionFromCookie,
  AUTH_COOKIE_NAME,
} from "../../lib/auth-cookie";
import { maskWhatsAppDestinationDigits } from "../../lib/whatsappPhone";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const legacyLogin = readCookieValue(req.headers.cookie, AUTH_COOKIE_NAME) === "1";
  const cust = readCustomerSessionFromCookie(req.headers.cookie);
  const customer = cust
    ? {
        name: cust.name,
        location: cust.location || "",
        phone_hint: maskWhatsAppDestinationDigits(cust.phoneDigits),
        sessionExpiresAtSec: cust.exp,
      }
    : null;

  const loggedIn = legacyLogin || Boolean(customer);

  const body = JSON.stringify({
    ok: true,
    loggedIn,
    legacyLogin,
    customer,
  });

  sendJsonWithEtag(req, res, body, {
    cacheControl: "private, max-age=60, stale-while-revalidate=120",
  });
}
