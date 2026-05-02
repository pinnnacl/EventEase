import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import VendorBookingCalendar from "../../components/vendor/VendorBookingCalendar";

function ymdToday() {
  const x = new Date();
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const d = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshBookingStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/vendor/bookings", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.bookings)) {
        setTotalBookings(0);
        setUpcomingBookings(0);
        return;
      }
      const list = data.bookings;
      const t = ymdToday();
      setTotalBookings(list.length);
      setUpcomingBookings(list.filter((b) => b.date >= t).length);
    } catch {
      setTotalBookings(0);
      setUpcomingBookings(0);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/vendor/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          await router.replace(`/vendor/login?next=${encodeURIComponent("/vendor/dashboard")}`);
          return;
        }
        if (!data?.hasProfile) {
          await router.replace("/vendor/onboarding");
          return;
        }
        if (data?.vendor?.status !== "approved") {
          await router.replace("/vendor/pending");
          return;
        }
        if (active) setVendor(data.vendor);
      } catch {
        if (active) setError("Could not load vendor profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!vendor) return;
    refreshBookingStats();
  }, [vendor, refreshBookingStats]);

  const statusLabel = vendor?.status === "approved" ? "Approved" : vendor?.status || "—";

  return (
    <>
      <Head>
        <title>Vendor Dashboard | THAALI</title>
      </Head>

      <div className="min-h-screen w-full max-w-none bg-gradient-to-b from-stone-50/80 to-background">
        <main className="container-default w-full max-w-none py-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            {/* Header */}
            <div className="fade-up flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Vendor portal</p>
                <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                  Dashboard
                </h1>
                <p className="mt-1 max-w-xl text-sm text-stone-600">
                  Manage your availability, bookings, and business profile in one place.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-10 shrink-0 items-center justify-center self-start rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 sm:self-auto"
              >
                Back to home
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4 rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm">
                <div className="h-6 w-48 rounded bg-stone-200" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-stone-100" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
            ) : (
              <>
                {/* Overview */}
                <section className="fade-up space-y-4" aria-labelledby="overview-heading">
                  <h2 id="overview-heading" className="sr-only">
                    Overview
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Business</p>
                      <p className="mt-2 font-display text-lg font-semibold text-brand-950">{vendor?.businessName}</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Status</p>
                      <p className="mt-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                            vendor?.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Category</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">{vendor?.category}</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Location</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {vendor?.city}, {vendor?.state}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Unavailable dates</p>
                      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-brand-950">
                        {statsLoading ? "—" : totalBookings}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">Days marked not available</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Upcoming blocks</p>
                      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-brand-950">
                        {statsLoading ? "—" : upcomingBookings}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">Today and future unavailable days</p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-3">
                  {/* Calendar — primary */}
                  <div className="min-w-0 space-y-6 lg:col-span-2">
                    <VendorBookingCalendar onBookingsChanged={refreshBookingStats} />
                  </div>

                  {/* Profile + actions */}
                  <div className="space-y-6 lg:col-span-1">
                    <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm" aria-labelledby="profile-heading">
                      <h2 id="profile-heading" className="font-display text-lg font-semibold text-brand-950">
                        Profile
                      </h2>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Phone</dt>
                          <dd className="mt-0.5 font-medium text-stone-900">{vendor?.phone || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Description</dt>
                          <dd className="mt-0.5 line-clamp-4 text-stone-700">{vendor?.description || "—"}</dd>
                        </div>
                      </dl>
                      <Link
                        href="/vendor/profile"
                        className="mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                      >
                        Edit profile
                      </Link>
                    </section>

                    <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm" aria-labelledby="actions-heading">
                      <h2 id="actions-heading" className="font-display text-lg font-semibold text-brand-950">
                        Actions
                      </h2>
                      <div className="mt-4 flex flex-col gap-2">
                        <Link
                          href="/"
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                        >
                          Back to home
                        </Link>
                        <Link
                          href="/vendor/profile"
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                        >
                          Edit profile
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = window.confirm(
                              "Delete vendor profile?\n\nThis will remove your business profile and booking calendar from THAALI. You can create a new profile later.",
                            );
                            if (!ok) return;
                            setDeleteError("");
                            setDeleting(true);
                            try {
                              const res = await fetch("/api/vendor/delete", { method: "DELETE" });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok) {
                                setDeleteError(data.error || "Could not delete profile");
                                return;
                              }
                              await router.push("/vendor/onboarding");
                            } catch {
                              setDeleteError("Something went wrong. Try again.");
                            } finally {
                              setDeleting(false);
                            }
                          }}
                          disabled={deleting}
                          className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2 ${
                            deleting
                              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                              : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          {deleting ? "Deleting…" : "Delete profile"}
                        </button>
                      </div>
                      {deleteError ? (
                        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
                          {deleteError}
                        </p>
                      ) : null}
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
