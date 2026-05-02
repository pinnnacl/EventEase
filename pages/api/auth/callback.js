/**
 * Legacy redirect: PKCE exchange runs on `/auth/oauth-callback` (browser).
 * Keep this so old Supabase "Redirect URLs" entries still work.
 */
export default function handler(req, res) {
  const q = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return res.redirect(307, `/auth/oauth-callback${q}`);
}
