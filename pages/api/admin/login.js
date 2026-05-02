import { createSupabaseApiClient } from "../../../lib/supabaseApiRoute";
import { getUserProfile } from "../../../lib/vendors";
import { isValidEmail, normalizeEmail } from "../../../lib/vendorAuth";

/**
 * Supabase Auth + public.users.role === 'admin'
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

  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ ok: false, error: "Invalid email or password" });
  }

  try {
    const supabase = createSupabaseApiClient(req, res);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user?.id) {
      return res.status(401).json({ ok: false, error: error?.message || "Invalid credentials" });
    }

    const { data: profile, error: profileErr } = await getUserProfile(data.user.id);
    if (profileErr) {
      await supabase.auth.signOut();
      return res.status(500).json({ ok: false, error: "Could not load profile" });
    }
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      return res.status(403).json({ ok: false, error: "Not an administrator" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ ok: false, error: msg });
  }
}
