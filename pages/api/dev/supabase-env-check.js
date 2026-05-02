import { getSupabaseEnvDiagnostics } from "../../../lib/supabaseEnv";

/**
 * DEV ONLY: confirms what Next.js loaded (lengths + shape — no secret values).
 * Visit: GET /api/dev/supabase-env-check
 */
export default function handler(req, res) {
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Allow", "GET");
    return res.status(404).json({ ok: false, error: "Not found" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const d = getSupabaseEnvDiagnostics();
  const hints = [];
  if (!d.urlPresent) hints.push("NEXT_PUBLIC_SUPABASE_URL is empty in the running process.");
  if (d.urlPresent && !d.urlHttpsOk) {
    hints.push("URL must be a valid https URL (e.g. https://YOUR_REF.supabase.co). No spaces or hidden characters.");
  }
  if (d.urlPresent && d.urlHttpsOk && !d.urlLooksLikeDefaultSupabase) {
    hints.push("If you use a custom domain, ensure it matches the project where these API keys were issued.");
  }
  if (d.anonKeyLength === 0) hints.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is empty.");
  if (d.serviceRoleKeyLength === 0) hints.push("SUPABASE_SERVICE_ROLE_KEY is empty (needed for server DB calls).");
  if (d.anonAndServiceAreIdentical) {
    hints.push("Anon key and service_role key are identical — use anon public for NEXT_PUBLIC_SUPABASE_ANON_KEY and service_role secret for SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (d.anonKeyLength > 0 && !d.anonLooksLikeJwt) {
    hints.push("Anon key usually starts with eyJ… If yours does not, recopy from Supabase → Settings → API.");
  }

  return res.status(200).json({ ok: true, diagnostics: d, hints });
}
