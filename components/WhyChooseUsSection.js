import Section from "./Section";
import SectionHeader from "./SectionHeader";

const items = [
  {
    icon: "✅",
    title: "Verified Vendors",
    text: "Trusted professionals with real reviews and transparent service quality.",
  },
  {
    icon: "📍",
    title: "Kerala-Focused",
    text: "Strong local network across Kochi, Trivandrum, Calicut, Thrissur, and more.",
  },
  {
    icon: "💛",
    title: "Personalized Support",
    text: "Recommendations crafted around your style, budget, and family preferences.",
  },
  {
    icon: "⏱️",
    title: "Faster Planning",
    text: "Compare and shortlist quickly, avoiding endless calls and manual follow-ups.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <Section id="about" className="bg-white">
      <SectionHeader
        title="Why Couples Choose EventEase"
        subtitle="A premium planning experience designed to feel simple, trustworthy, and joyful."
      />

      <div className="grid gap-6 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#efe4d1] bg-white p-6 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-premium"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">
              {item.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-wedding-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
