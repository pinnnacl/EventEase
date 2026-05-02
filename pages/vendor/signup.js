import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import VendorGoogleSignIn from "../../components/auth/VendorGoogleSignIn";
import { getVendorPostAuthPath } from "../../lib/vendorSessionRedirect";

export default function VendorSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.length > 0 && password.length >= 8 && !submitting;
  }, [email, password, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not create account");
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
        <title>Become a Vendor | THAALI</title>
        <meta
          name="description"
          content="Join THAALI as a vendor and reach couples planning premium weddings."
        />
      </Head>

      <div className="min-h-screen w-full max-w-none bg-background">
        <main className="container-default flex w-full max-w-none justify-center py-12 sm:py-16">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)]">
            <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Vendor Portal
              </p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                Create your vendor account
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Join THAALI and start receiving inquiries from couples planning premium weddings.
              </p>
            </div>

            <div className="px-6 pb-7 sm:px-8 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="vendor-signup-email" className="block text-sm font-semibold text-stone-800">
                    Email
                  </label>
                  <input
                    id="vendor-signup-email"
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
                    <label htmlFor="vendor-signup-password" className="block text-sm font-semibold text-stone-800">
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
                    id="vendor-signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                    placeholder="At least 8 characters"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    Use at least 8 characters. You can update it later.
                  </p>
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
                  {submitting ? "Creating account…" : "Create account"}
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
                  Already have an account?{" "}
                  <Link href="/vendor/login" className="font-semibold text-brand-700 hover:text-brand-800">
                    Vendor Login
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
