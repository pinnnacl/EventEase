import Head from "next/head";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Use | EVENTiZO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold text-stone-900">Terms of Use</h1>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          This page is a placeholder. Replace this content with your terms of use, acceptable use policy, and
          disclaimers before production.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </>
  );
}
