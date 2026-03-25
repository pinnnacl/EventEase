import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "../components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not sign in");
        return;
      }
      const next = typeof router.query.next === "string" ? router.query.next : "/";
      await router.push(next.startsWith("/") ? next : "/");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign in | EventEase Kerala</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen w-full max-w-none">
        <main className="container-default flex w-full max-w-none justify-center py-12 sm:py-16">
          <div className="w-full max-w-md rounded-2xl border border-[#e8decc] bg-white p-8 shadow-card">
            <h1 className="text-2xl font-bold text-wedding-ink">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your EventEase account to continue planning.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-wedding-ink">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-wedding-ink outline-none ring-brand-500/30 transition focus:border-brand-500 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-wedding-ink">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-wedding-ink outline-none ring-brand-500/30 transition focus:border-brand-500 focus:ring-2"
                />
              </div>

              {error ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full rounded-xl py-3" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              <Link href="/" className="font-medium text-brand-600 hover:text-brand-700">
                Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
