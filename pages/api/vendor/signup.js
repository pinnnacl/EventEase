import { createSupabaseApiClient } from "../../../lib/supabaseApiRoute";
import { upsertUserProfile } from "../../../lib/vendors";
import { isStrongPassword, isValidEmail, normalizeEmail } from "../../../lib/vendorAuth";

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
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ ok: false, error: "Password must be at least 8 characters" });
  }

  try {
    const supabase = createSupabaseApiClient(req, res);
    // With "Confirm email" disabled in Supabase, signUp returns a session immediately (cookies set on res).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "vendor" },
      },
    });

    if (error) {
      return res.status(400).json({ ok: false, error: error.message || "Could not sign up" });
    }

    const user = data?.user;
    if (!user?.id) {
      return res.status(400).json({
        ok: false,
        error:
          "Could not complete signup. In Supabase → Authentication → Email, disable “Confirm email” for instant access.",
      });
    }

    const { error: profileErr } = await upsertUserProfile({
      id: user.id,
      email: user.email || email,
      role: "vendor",
    });
    if (profileErr) {
      return res.status(500).json({ ok: false, error: profileErr.message || "Could not create profile" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("NEXT_PUBLIC_SUPABASE") || msg.includes("SUPABASE")) {
      return res.status(500).json({ ok: false, error: "Server configuration error" });
    }
    return res.status(500).json({ ok: false, error: msg });
  }
}
