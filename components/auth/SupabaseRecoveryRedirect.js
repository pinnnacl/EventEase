import { useEffect } from "react";

/**
 * Supabase recovery emails land on Site URL with either:
 * - Hash: #access_token=...&type=recovery (implicit)
 * - Query: ?code=... (PKCE) — often no "type=recovery" in the URL
 * Forward to /auth/reset-password so tokens are handled in one place.
 */
export default function SupabaseRecoveryRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { pathname, search, hash } = window.location;
    if (pathname === "/auth/reset-password") return;
    // OAuth / PKCE return — must not hijack ?code= meant for exchangeCodeForSession
    if (pathname === "/auth/oauth-callback") return;

    const q = search || "";
    const h = hash || "";
    const params = new URLSearchParams(q);
    const hasCode = params.has("code");
    const hasImplicitRecovery =
      h.includes("access_token") ||
      h.includes("type=recovery") ||
      h.includes("type%3Drecovery");

    if (hasCode || hasImplicitRecovery) {
      window.location.replace(`/auth/reset-password${q}${h}`);
    }
  }, []);

  return null;
}
