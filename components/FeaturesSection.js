import SectionTitle from "./SectionTitle";

const features = [
  "Curated recommendations based on budget and location",
  "Personalized vendor shortlist for your event style",
  "Quick inquiry and follow-up support from local experts",
  "Transparent pricing to compare options easily"
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-14 sm:py-16">
      <div className="container-default">
        <SectionTitle
          title="Features List Section"
          description="Overview of the platform's key features, such as curated recommendations, personalized planning, and easy vendor discovery."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="rounded-xl border border-brand-100 bg-cloud-50 p-5">
              <p className="font-medium text-slate-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
