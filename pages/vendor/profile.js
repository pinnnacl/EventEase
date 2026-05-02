import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import VendorProfileForm from "../../components/vendor/VendorProfileForm";

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/me", { credentials: "same-origin", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        await router.replace(`/vendor/login?next=${encodeURIComponent("/vendor/profile")}`);
        return;
      }
      // Some proxy/cache layers can return 304 without a fresh JSON body.
      // Treat this as a transient non-auth state instead of forcing redirect.
      if (!res.ok) {
        setError("Could not refresh your profile right now. Please retry.");
        return;
      }
      if (!data?.hasProfile) {
        await router.replace("/vendor/onboarding");
        return;
      }
      setVendor(data.vendor);
    } catch {
      setError("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const onSaved = useCallback((v) => {
    setVendor(v);
  }, []);

  return (
    <>
      <Head>
        <title>Edit vendor profile | THAALI</title>
      </Head>

      <div className="min-h-screen w-full max-w-none bg-gradient-to-b from-stone-50/80 to-background">
        <main className="container-default w-full max-w-none py-8 sm:py-12">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Vendor portal</p>
                <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                  Edit profile
                </h1>
                <p className="mt-2 max-w-xl text-sm text-stone-600">
                  Everything you add here powers your public listing — the same kind of details as the sample venue page
                  (hero image, gallery, facilities, capacity, and pricing).
                </p>
              </div>
              <Link
                href={vendor?.status === "approved" ? "/vendor/dashboard" : "/vendor/pending"}
                className="inline-flex min-h-10 shrink-0 items-center justify-center self-start rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 sm:self-auto"
              >
                {vendor?.status === "approved" ? "Back to dashboard" : "Back to status"}
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4 rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm">
                <div className="h-6 w-48 rounded bg-stone-200" />
                <div className="h-32 rounded-xl bg-stone-100" />
              </div>
            ) : error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
            ) : vendor ? (
              <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)] sm:p-8">
                <VendorProfileForm key={vendor.id} vendor={vendor} onSaved={onSaved} />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </>
  );
}
