import { createSupabaseApiClient } from "../../../lib/supabaseApiRoute";
import { getUserProfile, getVendorByUser, upsertUserProfile } from "../../../lib/vendors";

/**
 * After Google OAuth, the browser runs exchangeCodeForSession (PKCE) and sets session cookies.
 * This route assigns vendor role and returns the next path. Requires an active session.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  if (body?.flow !== "vendor") {
    return res.status(400).json({ ok: false, error: "Invalid flow" });
  }

  try {
    const supabase = createSupabaseApiClient(req, res);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user?.id) {
      return res.status(401).json({ ok: false, error: "No session" });
    }

    const { data: profile } = await getUserProfile(user.id);
    if (profile?.role === "admin") {
      return res.status(200).json({ ok: true, redirect: "/admin/vendors" });
    }
    if (profile?.role && profile.role !== "vendor") {
      await supabase.auth.signOut();
      return res.status(403).json({ ok: false, error: "wrong_portal" });
    }

    const { error: upErr } = await upsertUserProfile({
      id: user.id,
      email: user.email || "",
      role: "vendor",
    });
    if (upErr) {
      return res.status(500).json({ ok: false, error: upErr.message || "Could not save profile" });
    }

    const { data: vendor } = await getVendorByUser(user.id);
    let redirect = "/vendor/onboarding";
    if (vendor) {
      if (vendor.status === "approved") redirect = "/vendor/dashboard";
      else redirect = "/vendor/pending";
    }
    return res.status(200).json({ ok: true, redirect });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
