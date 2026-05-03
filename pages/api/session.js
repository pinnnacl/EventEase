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
      }
    : null;

  const loggedIn = legacyLogin || Boolean(customer);

  return res.status(200).json({
    ok: true,
    loggedIn,
    legacyLogin,
    customer,
  });
}
