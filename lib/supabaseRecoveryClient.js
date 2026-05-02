import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./supabaseEnv";

/**
 * Recovery / hash-based email links (e.g. from Dashboard) often use implicit tokens in the URL hash.
 * The default SSR browser client forces PKCE, which requires a code_verifier only present when reset
 * is started from this app via resetPasswordForEmail. This client parses implicit fragments correctly.
 */
export function createSupabaseRecoveryClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("Missing Supabase URL or anon key");
  }
  return createClient(url, key, {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
