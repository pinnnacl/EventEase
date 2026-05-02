import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0 && !submitting, [email, password, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not sign in");
        return;
      }
      await router.push("/admin/vendors");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    const em = email.trim();
    if (!em) {
      setForgotErr("Enter your email above first.");
      return;
    }
    setForgotErr("");
    setForgotMsg("");
    setForgotSending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: fe } = await supabase.auth.resetPasswordForEmail(em, {
        redirectTo: `${origin}/auth/reset-password`,
      });
      if (fe) {
        setForgotErr(fe.message);
        return;
      }
      setForgotMsg("Check your email for a reset link. Open it in this browser, then set a new password.");
      setForgotOpen(false);
    } catch {
      setForgotErr("Could not send reset email.");
    } finally {
      setForgotSending(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | THAALI</title>
      </Head>
      <main className="container-default flex w-full max-w-none justify-center py-12 sm:py-16">
        <div className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">Admin login</h1>
          <p className="mt-2 text-sm text-stone-600">Review and moderate vendor onboarding requests.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              placeholder="Admin email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 focus:border-brand-500 focus:ring-2"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotOpen((o) => !o);
                  setForgotErr("");
                  setForgotMsg("");
                }}
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Forgot password?
              </button>
            </div>
            {forgotOpen ? (
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-4 text-sm">
                <p className="text-stone-600">
                  Sends a reset link to the email above. Use this instead of the Supabase Dashboard reset so the link works in your
                  browser.
                </p>
                <button
                  type="button"
                  disabled={forgotSending || !email.trim()}
                  onClick={handleForgotPassword}
                  className={`mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                    forgotSending || !email.trim() ? "cursor-not-allowed bg-stone-300" : "bg-brand-600 hover:bg-brand-700"
                  }`}
                >
                  {forgotSending ? "Sending…" : "Send reset link"}
                </button>
                {forgotErr ? <p className="mt-2 text-sm font-medium text-red-700">{forgotErr}</p> : null}
              </div>
            ) : null}
            {forgotMsg ? <p className="text-sm font-medium text-emerald-800">{forgotMsg}</p> : null}
            {error ? (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
            <button
              disabled={!canSubmit}
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                canSubmit ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-stone-300"
              }`}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            <Link href="/" className="font-semibold text-stone-700 hover:text-stone-900">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
