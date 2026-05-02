import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function VendorPendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch("/api/vendor/me");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await router.replace("/vendor/login?next=/vendor/pending");
        return;
      }
      if (!data?.hasProfile) {
        await router.replace("/vendor/onboarding");
        return;
      }
      if (data?.vendor?.status === "approved") {
        await router.replace("/vendor/dashboard");
        return;
      }
      if (active) {
        setVendor(data.vendor);
        setStatus(data.vendor?.status || "pending");
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <>
      <Head><title>Vendor Review Status | THAALI</title></Head>
      <main className="container-default w-full max-w-none py-12 sm:py-16">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
          {loading ? (
            <p className="text-sm text-stone-600">Loading…</p>
          ) : (
            <>
              {router.query.submitted === "1" && status !== "rejected" ? (
                <p
                  className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
                  role="status"
                >
                  Your profile is under review — we&apos;ll email you when it&apos;s approved.
                </p>
              ) : null}
              <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                {status === "rejected" ? "Your profile needs updates" : "Your profile is under review"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                {status === "rejected"
                  ? "Your submission was not approved yet. You can edit and resubmit your profile."
                  : "We’ll notify you once your vendor profile is approved."}
              </p>

              <div className="mt-6 rounded-xl border border-stone-200/70 bg-stone-50/60 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">Submitted profile</p>
                <p className="mt-2 text-sm font-semibold text-stone-900">{vendor?.businessName}</p>
                <p className="mt-1 text-sm text-stone-700">{vendor?.category} · {vendor?.city}, {vendor?.state}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Status: {status}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/vendor/profile" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                  Edit profile
                </Link>
                <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                  Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

