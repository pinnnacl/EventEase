import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseRecoveryClient } from "../../lib/supabaseRecoveryClient";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    let sub;
    let cancelled = false;

    async function init() {
      setInitError("");
      if (typeof window === "undefined") return;

      const supabase = createSupabaseRecoveryClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // PKCE: only works if reset was started in this browser (e.g. Forgot password on our site)
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) {
          if (!cancelled) {
            setInitError(
              `${exErr.message} If you used “Reset password” from the Supabase Dashboard, use “Forgot password?” on the admin login page instead so the link works in your browser.`,
            );
            setLoading(false);
          }
          return;
        }
        window.history.replaceState({}, "", "/auth/reset-password");
      }

      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setReady(true);
          setLoading(false);
        }
      });
      sub = data.subscription;

      const trySession = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        return Boolean(session);
      };

      if (await trySession()) {
        if (!cancelled) {
          setReady(true);
          setLoading(false);
        }
        return;
      }

      for (const ms of [150, 400, 900, 1600]) {
        await new Promise((r) => setTimeout(r, ms));
        if (cancelled) return;
        if (await trySession()) {
          if (!cancelled) {
            setReady(true);
            setLoading(false);
          }
          return;
        }
      }

      if (!cancelled) setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = createSupabaseRecoveryClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <Head>
        <title>Set new password | THAALI</title>
      </Head>

      <div className="min-h-screen w-full max-w-none bg-background">
        <main className="container-default flex w-full max-w-none justify-center py-12 sm:py-16">
          {loading ? (
            <p className="text-sm text-stone-600">Verifying reset link…</p>
          ) : done ? (
            <div className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
              <h1 className="font-display text-xl font-semibold text-brand-950">Password updated</h1>
              <p className="mt-2 text-sm text-stone-600">You can sign in with your new password.</p>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/admin/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Admin login
                </Link>
                <Link href="/vendor/login" className="text-center text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Vendor login
                </Link>
              </div>
            </div>
          ) : initError ? (
            <div className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
              <h1 className="font-display text-xl font-semibold text-brand-950">Could not verify link</h1>
              <p className="mt-2 text-sm text-stone-600">{initError}</p>
              <p className="mt-4 text-sm text-stone-600">
                Add <code className="rounded bg-stone-100 px-1 text-xs">http://localhost:3000/**</code> under Authentication → URL
                Configuration → Redirect URLs.
              </p>
              <Link href="/admin/login" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800">
                Back to admin login
              </Link>
            </div>
          ) : !ready ? (
            <div className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
              <h1 className="font-display text-xl font-semibold text-brand-950">Link invalid or expired</h1>
              <p className="mt-2 text-sm text-stone-600">
                Do not use “Reset password” from the Supabase Dashboard for local testing — it sends a link that often cannot complete
                PKCE in your browser. Instead open{" "}
                <Link href="/admin/login" className="font-semibold text-brand-700 underline">
                  Admin login
                </Link>{" "}
                and use <strong>Forgot password?</strong> with your email. Ensure Redirect URLs includes{" "}
                <code className="rounded bg-stone-100 px-1 text-xs">http://localhost:3000/**</code>.
              </p>
              <Link href="/admin/login" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800">
                Back to admin login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md space-y-5 rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8"
            >
              <h1 className="font-display text-xl font-semibold text-brand-950">Set a new password</h1>
              <p className="text-sm text-stone-600">Choose a strong password for your account.</p>

              <div>
                <label htmlFor="new-pw" className="block text-sm font-semibold text-stone-800">
                  New password
                </label>
                <input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="confirm-pw" className="block text-sm font-semibold text-stone-800">
                  Confirm password
                </label>
                <input
                  id="confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Update password
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  );
}
