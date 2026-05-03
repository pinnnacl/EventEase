import { readCustomerSessionFromCookie } from "../auth-cookie";

/** @param {import("http").IncomingMessage} req */
export function getCustomerSessionFromRequest(req) {
  return readCustomerSessionFromCookie(req?.headers?.cookie);
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
export function requireCustomerSession(req, res) {
  const session = getCustomerSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Sign in to continue." });
    return null;
  }
  return session;
}
