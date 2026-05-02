import { useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabaseClient";

function formatOAuthError(err) {
  const raw = err?.message || String(err || "");
  if (/not enabled|Unsupported provider|validation_failed/i.test(raw)) {
    return "Google sign-in is not enabled for this project. In Supabase Dashboard → Authentication → Providers, turn on Google and add your Google OAuth client ID and secret.";
  }
  if (/PKCE|code verifier/i.test(raw)) {
    return "Sign-in session expired or cookies blocked. Try again, use the same browser tab, and allow cookies for this site.";
  }
  return raw;
}

/**
 * Google OAuth for vendor portal. Requires Google provider enabled in Supabase
 * and redirect URL: `{origin}/auth/oauth-callback` in Supabase Auth settings.
 */
export default function VendorGoogleSignIn({ disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/oauth-callback?flow=vendor`;
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oAuthError) {
        setError(formatOAuthError(oAuthError));
        setLoading(false);
      }
    } catch (e) {
      setError(formatOAuthError(e instanceof Error ? e : { message: String(e) }));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2 ${
          disabled || loading ? "cursor-not-allowed opacity-60" : "hover:bg-stone-50"
        }`}
      >
        {loading ? (
          "Redirecting…"
        ) : (
          <>
            <GoogleGlyph className="h-5 w-5 shrink-0" aria-hidden />
            Continue with Google
          </>
        )}
      </button>
      {error ? (
        <p className="text-center text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
