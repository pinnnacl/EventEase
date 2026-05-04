import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AccountPage() {
  const [data, setData] = useState(/** @type {null | { customer?: object; loggedIn?: boolean }} */ (null));

  const load = useCallback(async () => {
    const res = await fetch("/api/session", { credentials: "same-origin" });
    const j = await res.json().catch(() => ({}));
    setData(j);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const c = data?.customer;

  return (
    <>
      <Head>
        <title>Your profile | EVENTiZO</title>
      </Head>
      <main className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold text-stone-900">Your profile</h1>
        {!c ? (
          <p className="mt-4 text-sm text-stone-600">
            You are not signed in with a phone account.{" "}
            <Link href="/" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Go home
            </Link>{" "}
            and use Login to continue.
          </p>
        ) : (
          <dl className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Name</dt>
              <dd className="mt-1 text-base font-medium text-stone-900">{c.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Phone</dt>
              <dd className="mt-1 text-base text-stone-800">{c.phone_hint}</dd>
            </div>
            {c.location ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Location</dt>
                <dd className="mt-1 text-base text-stone-800">{c.location}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </main>
    </>
  );
}
