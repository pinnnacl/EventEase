import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import VendorGoogleSignIn from "../../components/auth/VendorGoogleSignIn";
import { getVendorPostAuthPath } from "../../lib/vendorSessionRedirect";

const OAUTH_ERROR_HINTS = {
  oauth_missing_code: "Sign-in was cancelled or did not complete.",
  wrong_portal: "This account is not for the vendor portal. Use the correct login.",
  no_session: "Could not establish a session. Try again.",
};

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.error;
    const code = typeof q === "string" ? q : Array.isArray(q) ? q[0] : "";
    if (!code) return;
    let decoded = code;
    try {
      decoded = decodeURIComponent(code);
    } catch {
      /* keep raw */
    }
    const hint = OAUTH_ERROR_HINTS[code] || OAUTH_ERROR_HINTS[decoded] || decoded;
    setError(hint);
  }, [router.isReady, router.query.error]);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not sign in");
        return;
      }
      const dest = await getVendorPostAuthPath(router.query.next);
      await router.push(dest);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Vendor Login | THAALI</title>
        <meta name="description" content="Vendor login for THAALI." />
      </Head>

      <div className="min-h-screen w-full max-w-none bg-background">
        <main className="container-default flex w-full max-w-none justify-center py-12 sm:py-16">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)]">
            <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Vendor Portal
              </p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                Sign in to your vendor account
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Manage your listings, respond to inquiries, and track leads from couples across Kerala.
              </p>
            </div>

            <div className="px-6 pb-7 sm:px-8 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="vendor-email" className="block text-sm font-semibold text-stone-800">
                    Email
                  </label>
                  <input
                    id="vendor-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="vendor-password" className="block text-sm font-semibold text-stone-800">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-xs font-semibold text-brand-700 transition hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="vendor-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                    placeholder="Enter your password"
                  />
                </div>

                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                    canSubmit ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-stone-300"
                  }`}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide">
                  <span className="bg-white px-3 text-stone-500">or</span>
                </div>
              </div>

              <VendorGoogleSignIn disabled={submitting} />

              <div className="mt-6 flex flex-col gap-3 text-center">
                <p className="text-sm text-stone-600">
                  New to THAALI?{" "}
                  <Link href="/vendor/signup" className="font-semibold text-brand-700 hover:text-brand-800">
                    Become a Vendor
                  </Link>
                </p>
                <Link href="/" className="text-sm font-semibold text-stone-700 transition hover:text-stone-900">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
