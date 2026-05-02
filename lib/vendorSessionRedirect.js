import { safeNextPath } from "./safeNextPath";

function pathOnly(p) {
  if (typeof p !== "string") return "";
  return p.split("?")[0] || "";
}

/**
 * Resolves where to send the user after vendor email/password auth (session cookie set).
 * @param {string | string[] | undefined} nextQuery - `router.query.next`
 */
export async function getVendorPostAuthPath(nextQuery) {
  const nextRaw = Array.isArray(nextQuery) ? nextQuery[0] : nextQuery;
  const safe = safeNextPath(nextRaw, null);

  const meRes = await fetch("/api/vendor/me", { credentials: "same-origin" });
  const me = await meRes.json().catch(() => ({}));

  if (!meRes.ok) {
    if (meRes.status === 401) return "/vendor/login";
    if (meRes.status === 403) return "/vendor/login?error=wrong_portal";
    return "/vendor/onboarding";
  }

  const fallback = !me?.hasProfile
    ? "/vendor/onboarding"
    : me?.vendor?.status === "approved"
      ? "/vendor/dashboard"
      : "/vendor/pending";

  if (!safe || !safe.startsWith("/vendor")) {
    return fallback;
  }

  if (!me?.hasProfile) {
    if (pathOnly(safe) === "/vendor/onboarding") return safe;
    return "/vendor/onboarding";
  }

  const st = me?.vendor?.status;
  if (st === "approved") {
    if (
      pathOnly(safe) === "/vendor/dashboard" ||
      pathOnly(safe) === "/vendor/onboarding" ||
      pathOnly(safe) === "/vendor/pending"
    ) {
      return "/vendor/dashboard";
    }
    return "/vendor/dashboard";
  }
  if (pathOnly(safe) === "/vendor/pending" || pathOnly(safe) === "/vendor/onboarding") return safe;
  return "/vendor/pending";
}
