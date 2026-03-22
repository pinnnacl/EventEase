import { isAuthenticatedRequest } from "../../lib/auth-cookie";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const loggedIn = isAuthenticatedRequest(req.headers.cookie);
  return res.status(200).json({ ok: true, loggedIn });
}
