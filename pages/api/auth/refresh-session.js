import { readCustomerSessionFromCookie } from "../../../lib/auth-cookie";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  mintCustomerSessionToken,
} from "../../../lib/customerSession";

/**
 * Sliding renewal: re-issues the HttpOnly customer session cookie with a fresh
 * expiry when the current token is still valid. Call occasionally from the client.
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const sess = readCustomerSessionFromCookie(req.headers.cookie);
  if (!sess) {
    return res.status(401).json({ ok: false, error: "No active session." });
  }

  let token;
  let maxAgeSec;
  try {
    const out = mintCustomerSessionToken({
      phoneDigits: sess.phoneDigits,
      name: sess.name,
      location: sess.location,
    });
    token = out.token;
    maxAgeSec = out.maxAgeSec;
  } catch (e) {
    console.error("[api/auth/refresh-session]", e);
    return res.status(500).json({ ok: false, error: "Could not refresh session." });
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${CUSTOMER_SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`,
  );

  return res.status(200).json({ ok: true, maxAgeSec });
}
