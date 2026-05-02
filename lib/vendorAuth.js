import crypto from "crypto";
import bcrypt from "bcryptjs";
import { readCookieValue } from "./auth-cookie";

export const VENDOR_SESSION_COOKIE = "ee_vendor_session";

function nowIso() {
  return new Date().toISOString();
}

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(pw) {
  if (typeof pw !== "string") return false;
  // Basic production-friendly minimum. Can be tightened later.
  return pw.length >= 8;
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

function getSessionSecret() {
  const secret = process.env.EVENTEASE_VENDOR_SESSION_SECRET;
  if (secret) return secret;
  // Dev-friendly fallback to avoid local setup footguns. MUST be overridden in production.
  return "dev-insecure-vendor-session-secret-change-me";
}

function sign(payloadJson) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payloadJson).digest("base64url");
}

export function createVendorSessionCookie({ userId, email, role }) {
  const issuedAt = Date.now();
  const maxAgeSec = 60 * 60 * 24 * 7;
  const exp = issuedAt + maxAgeSec * 1000;
  const payload = { v: 1, userId, email, role, iat: issuedAt, exp };
  const payloadJson = JSON.stringify(payload);
  const token = `${Buffer.from(payloadJson).toString("base64url")}.${sign(payloadJson)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${VENDOR_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export function clearVendorSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${VENDOR_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readVendorSession(cookieHeader) {
  const token = readCookieValue(cookieHeader, VENDOR_SESSION_COOKIE);
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const payloadJson = Buffer.from(parts[0], "base64url").toString("utf8");
    const sig = parts[1];
    if (sig !== sign(payloadJson)) return null;
    const payload = JSON.parse(payloadJson);
    if (!payload || payload.v !== 1) return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function vendorUserFromSession(cookieHeader) {
  const s = readVendorSession(cookieHeader);
  if (!s) return null;
  if (s.role !== "vendor") return null;
  return { id: s.userId, email: s.email, role: s.role, createdAt: nowIso() };
}

export function adminUserFromSession(cookieHeader) {
  const s = readVendorSession(cookieHeader);
  if (!s) return null;
  if (s.role !== "admin") return null;
  return { id: s.userId, email: s.email, role: s.role, createdAt: nowIso() };
}

export function isAdminCredentials(email, password) {
  const e = normalizeEmail(email);
  const allowed = normalizeEmail(process.env.EVENTEASE_ADMIN_EMAIL || "");
  const pw = process.env.EVENTEASE_ADMIN_PASSWORD || "";
  return Boolean(allowed) && Boolean(pw) && e === allowed && password === pw;
}

