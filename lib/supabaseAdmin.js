import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./supabaseEnv";

let singleton;

/**
 * Server-only admin client (service role). Bypasses RLS. Never import in client bundles.
 */
export function getSupabaseAdmin() {
  if (singleton) return singleton;
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase URL or service role key. Add NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    );
  }
  singleton = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return singleton;
}
