import Card from "./Card";
import Button from "./Button";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

const packages = [
  {
    name: "Silver",
    price: "INR 1.8L",
    features: ["Venue shortlisting", "Basic decor planning", "Vendor coordination"],
  },
  {
    name: "Gold",
    price: "INR 3.2L",
    features: ["Premium venue curation", "Full decor concept", "Catering + photo support"],
    highlighted: true,
  },
  {
    name: "Platinum",
    price: "INR 5.5L",
    features: ["Luxury vendor concierge", "Complete planning support", "On-day event management"],
  },
  {
    name: "Custom",
    price: "Tailored",
    features: ["Build your own package", "Flexible vendor mix", "Personal planner support"],
  },
];

export default function WeddingPackagesSection() {
  return (
    <Section id="packages">
      <SectionHeader
        title="Wedding Packages"
        subtitle="Flexible package tiers designed for intimate ceremonies to grand celebrations."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <Card
            key={pkg.name}
            className={`p-6 ${
              pkg.highlighted
                ? "scale-[1.03] border-2 border-wedding-gold bg-gold-wash shadow-premium"
                : "border border-[#efe4d1]"
            }`}
          >
            <p className={`text-sm font-semibold ${pkg.highlighted ? "text-[#9c7718]" : "text-slate-500"}`}>
              {pkg.name}
            </p>
            <p className="mt-2 text-3xl font-bold text-wedding-ink">{pkg.price}</p>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
              {pkg.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Button variant={pkg.highlighted ? "gold" : "secondary"} className="mt-6 w-full rounded-full">
              Choose {pkg.name}
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
