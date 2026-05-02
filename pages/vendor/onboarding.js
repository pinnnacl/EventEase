import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

/** Photography & makeup-first onboarding; venues remain available for hall operators. */
const CATEGORIES = ["Photographer", "Makeup", "Venue"];

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Photographer");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Kerala");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [pricingRange, setPricingRange] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/vendor/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          await router.replace(`/vendor/login?next=${encodeURIComponent("/vendor/onboarding")}`);
          return;
        }
        if (data?.hasProfile) {
          await router.replace(data?.vendor?.status === "approved" ? "/vendor/dashboard" : "/vendor/pending");
          return;
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  const step1Ok = useMemo(() => {
    return businessName.trim().length > 0 && category.trim().length > 0;
  }, [businessName, category]);

  const step2Ok = useMemo(() => {
    return city.trim().length > 0 && state.trim().length > 0 && phone.trim().length > 0;
  }, [city, state, phone]);

  const step3Ok = useMemo(() => {
    return description.trim().length >= 20;
  }, [description]);

  const canSubmit = step1Ok && step2Ok && step3Ok && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          city,
          state,
          phone,
          description,
          pricingRange: pricingRange.trim() || null,
          profileImage: profileImage.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not create vendor profile");
        return;
      }
      await router.push("/vendor/pending?submitted=1");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Vendor Onboarding | THAALI</title>
      </Head>

      <div className="min-h-screen w-full max-w-none bg-background">
        <main className="container-default flex w-full max-w-none justify-center py-10 sm:py-14">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_18px_60px_-34px_rgba(20,43,60,0.35)]">
            <div className="border-b border-stone-200/70 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Vendor onboarding
              </p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">
                Create your vendor profile
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Photographers and makeup artists can list here after signup. Your profile stays pending until our team
                approves it. You can update details anytime after submission.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              {loading ? (
                <p className="text-sm text-stone-600">Loading…</p>
              ) : (
                <>
                  <div className="mb-6 flex items-center gap-2">
                    {[1, 2, 3].map((n) => {
                      const active = n === step;
                      const done = n < step;
                      return (
                        <div
                          key={n}
                          className={`flex items-center gap-2`}
                          aria-current={active ? "step" : undefined}
                        >
                          <div
                            className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                              done
                                ? "bg-brand-600 text-white"
                                : active
                                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                                  : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {n}
                          </div>
                          {n !== 3 ? <div className="h-px w-10 bg-stone-200" aria-hidden /> : null}
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-stone-800" htmlFor="businessName">
                            Business name
                          </label>
                          <input
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                            placeholder="e.g., Lumiere Weddings"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-stone-800" htmlFor="category">
                            Category
                          </label>
                          <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-stone-800" htmlFor="city">
                              City
                            </label>
                            <input
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                              placeholder="Kochi"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-800" htmlFor="state">
                              State
                            </label>
                            <input
                              id="state"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                              placeholder="Kerala"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-stone-800" htmlFor="phone">
                            Contact number
                          </label>
                          <input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                            placeholder="+91 9XXXXXXXXX"
                            required
                          />
                        </div>
                      </div>
                    ) : null}

                    {step === 3 ? (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-stone-800" htmlFor="description">
                            Description
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 min-h-[140px] w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                            placeholder={
                              category === "Photographer"
                                ? "Describe your photography style, coverage, packages, and what couples can expect…"
                                : category === "Makeup"
                                  ? "Describe bridal and party makeup services, trials, team size, and your signature looks…"
                                  : category === "Venue"
                                    ? "Describe the space, capacity, inclusions, and what makes your venue special…"
                                    : "Tell couples what you offer, your style, and what makes you different…"
                            }
                            required
                          />
                          <p className="mt-2 text-xs text-stone-500">Minimum 20 characters.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-stone-800" htmlFor="pricingRange">
                              Pricing range (optional)
                            </label>
                            <input
                              id="pricingRange"
                              value={pricingRange}
                              onChange={(e) => setPricingRange(e.target.value)}
                              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                              placeholder="₹50k–₹2L"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-800" htmlFor="profileImage">
                              Profile image URL (optional)
                            </label>
                            <input
                              id="profileImage"
                              value={profileImage}
                              onChange={(e) => setProfileImage(e.target.value)}
                              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none ring-brand-500/25 transition focus:border-brand-500 focus:ring-2"
                              placeholder="https://…"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {error ? (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        disabled={step === 1 || submitting}
                        className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 ${
                          step === 1 || submitting
                            ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                            : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        Back
                      </button>

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={() => setStep((s) => Math.min(3, s + 1))}
                          disabled={(step === 1 && !step1Ok) || (step === 2 && !step2Ok)}
                          className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                            (step === 1 && step1Ok) || (step === 2 && step2Ok)
                              ? "bg-brand-600 hover:bg-brand-700"
                              : "cursor-not-allowed bg-stone-300"
                          }`}
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!canSubmit}
                          className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                            canSubmit ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-stone-300"
                          }`}
                        >
                          {submitting ? "Saving…" : "Finish setup"}
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

