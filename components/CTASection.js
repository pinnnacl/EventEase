export default function CTASection() {
  return (
    <section className="w-full py-16">
      <div className="container-default w-full max-w-none">
        <div className="w-full rounded-3xl bg-brand-500 px-6 py-12 text-center text-white shadow-cloud sm:px-12">
          <h2 className="text-3xl font-bold">CTA Section</h2>
          <p className="mt-3 w-full max-w-none text-brand-50">
            Prompt encouraging visitors to start planning their event or explore vendor options.
          </p>
          <button className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
            Start Your Event Plan
          </button>
        </div>
      </div>
    </section>
  );
}
