import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { serialize } from "cookie";
import { getSupabaseAnonKey, getSupabaseUrl } from "./supabaseEnv";

/**
 * Supabase client for Pages API routes (anon key + request cookies).
 * Do not import from client-side code.
 */
export function createSupabaseApiClient(req, res) {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase URL or anon key. Add to .env.local: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY). See Supabase → Project Settings → API.",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      /** Must match @supabase/ssr expectations (chunked auth cookies, base64url values). */
      getAll: async () => parseCookieHeader(req.headers?.cookie ?? ""),
      setAll(cookiesToSet) {
        if (res.headersSent) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          res.appendHeader(
            "Set-Cookie",
            serialize(name, value, {
              path: "/",
              ...options,
            }),
          );
        });
      },
    },
  });
}

/**
 * Returns the authenticated Supabase user from the session cookie, or null.
 */
export async function getSupabaseUser(req, res) {
  const supabase = createSupabaseApiClient(req, res);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}
