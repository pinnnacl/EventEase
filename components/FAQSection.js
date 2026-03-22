import SectionTitle from "./SectionTitle";

const faqs = [
  {
    q: "How do I find the best vendors in Kerala?",
    a: "Use EventEase filters to compare vendor ratings, pricing, and availability quickly."
  },
  {
    q: "Can I request custom quotes?",
    a: "Yes, you can submit your event details and receive tailored options."
  },
  {
    q: "Are vendors verified?",
    a: "Our platform highlights trusted vendors with complete profile details."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-white py-14 sm:py-16">
      <div className="container-default">
        <SectionTitle
          title="FAQ Section"
          description="Common questions and answers about using EventEase Kerala for event planning."
        />
        <div className="mx-auto grid max-w-4xl gap-4">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-xl border border-brand-100 p-5">
              <h3 className="font-semibold text-brand-700">{faq.q}</h3>
              <p className="mt-2 text-slate-600">{faq.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
