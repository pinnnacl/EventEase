import { AUTH_COOKIE_NAME } from "../../lib/auth-cookie";

function parseAllowedEmails(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function validCredentials() {
  const rawEmail = process.env.EVENTEASE_LOGIN_EMAIL;
  const password = process.env.EVENTEASE_LOGIN_PASSWORD;
  return { allowedEmails: parseAllowedEmails(rawEmail), password: password || "" };
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { email, password } = req.body || {};
  const { allowedEmails, password: validPassword } = validCredentials();

  if (allowedEmails.length === 0 || !validPassword) {
    return res.status(500).json({
      ok: false,
      error: "Login is not configured. Set EVENTEASE_LOGIN_EMAIL and EVENTEASE_LOGIN_PASSWORD.",
    });
  }

  const submitted = typeof email === "string" ? email.trim().toLowerCase() : "";
  const ok =
    submitted.length > 0 &&
    typeof password === "string" &&
    allowedEmails.includes(submitted) &&
    password === validPassword;

  if (!ok) {
    return res.status(401).json({ ok: false, error: "Invalid email or password" });
  }

  const maxAge = 60 * 60 * 24 * 7;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );

  return res.status(200).json({ ok: true });
}
