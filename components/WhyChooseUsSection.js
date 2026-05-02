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
    <Section id="about">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          title="Why Couples Choose THAALI"
          subtitle="A premium planning experience designed to feel simple, trustworthy, and joyful."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="group flex h-full flex-col items-center rounded-2xl border border-stone-200/70 bg-white p-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_36px_-28px_rgba(20,43,60,0.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_18px_44px_-28px_rgba(20,43,60,0.3)] sm:p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl ring-1 ring-brand-100/60">
                {item.icon}
              </div>
              <h3 className="mt-5 text-base font-semibold leading-snug text-wedding-ink sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
