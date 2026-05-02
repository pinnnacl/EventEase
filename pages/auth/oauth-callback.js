import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabaseClient";

/**
 * OAuth return URL. @supabase/ssr createBrowserClient runs PKCE exchange inside
 * auth.initialize() (detectSessionInUrl). Do NOT call exchangeCodeForSession again —
 * it removes the code verifier and causes "PKCE code verifier not found".
 */
export default function AuthOAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");
  const ran = useRef(false);

  useEffect(() => {
    if (!router.isReady || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const q =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams(router.asPath.split("?")[1] || "");
        const code =
          (typeof router.query.code === "string" ? router.query.code : null) || q.get("code");
        const flowRaw = router.query.flow ?? q.get("flow");
        const flow = typeof flowRaw === "string" ? flowRaw : Array.isArray(flowRaw) ? flowRaw[0] : null;

        const supabase = createSupabaseBrowserClient();

        await supabase.auth.initialize();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!session) {
          if (!code) {
            await router.replace("/vendor/login?error=oauth_missing_code");
            return;
          }
          const msg = sessionError?.message || "Could not complete sign-in";
          setMessage("Could not complete sign-in");
          await router.replace(`/vendor/login?error=${encodeURIComponent(msg)}`);
          return;
        }

        if (flow === "vendor") {
          const res = await fetch("/api/vendor/oauth-bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ flow: "vendor" }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const err = data.error === "wrong_portal" ? "wrong_portal" : data.error || "bootstrap_failed";
            await router.replace(`/vendor/login?error=${encodeURIComponent(err)}`);
            return;
          }
          const next = typeof data.redirect === "string" ? data.redirect : "/vendor/onboarding";
          await router.replace(next);
          return;
        }

        await router.replace("/");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "oauth_error";
        await router.replace(`/vendor/login?error=${encodeURIComponent(msg)}`);
      }
    })();
  }, [router, router.isReady, router.query.code, router.query.flow]);

  return (
    <>
      <Head>
        <title>Signing in… | THAALI</title>
      </Head>
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <p className="text-sm font-medium text-stone-600">{message}</p>
      </main>
    </>
  );
}
