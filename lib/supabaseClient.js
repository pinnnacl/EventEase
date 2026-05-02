import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./supabaseEnv";

let browserClient = null;

/**
 * Browser-only Supabase client (anon key). Use in React components / client code.
 * For client bundles, prefer NEXT_PUBLIC_* in .env.local so values are available in the browser.
 */
export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (browser requires these names).",
    );
  }
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
