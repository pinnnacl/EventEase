import Section from "./Section";
import {
  IllustrationPlanning,
  IllustrationDiscovery,
  IllustrationConnect,
} from "./illustrations/HowItWorksIllustrations";

const steps = [
  {
    label: "Step one",
    title: "Tell us what you need",
    description:
      "Share your event date, budget, and requirements in our planning form.",
    Illustration: IllustrationPlanning,
  },
  {
    label: "Step two",
    title: "Find available vendors",
    description:
      "See which vendors are available for your event date and requirements.",
    Illustration: IllustrationDiscovery,
  },
  {
    label: "Step three",
    title: "Connect and book with confidence",
    description:
      "Review profiles, check ratings, and reach out to vendors directly.",
    Illustration: IllustrationConnect,
  },
];

export default function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="bg-[#f8f5f0]">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">
          Simple
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0f766e] sm:text-4xl lg:text-5xl">
          How it works
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          Three straightforward steps to find your perfect vendors.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step) => {
          const Graphic = step.Illustration;
          return (
            <article
              key={step.label}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-1 flex-col px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                <p className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  {step.label}
                </p>
                <h3 className="mt-3 text-xl font-bold leading-snug text-[#0f766e] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 sm:text-base">
                  {step.description}
                </p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0f766e] transition hover:gap-2 hover:text-[#0b5e58]"
                >
                  Learn
                  <span aria-hidden="true" className="text-lg">
                    ›
                  </span>
                </a>
              </div>

              <div
                className="group/illustration relative mt-auto min-h-[200px] flex-1 overflow-hidden bg-gradient-to-b from-[#f8f5f0] via-[#fef9e8]/80 to-[#e6fffa]/40 px-6 pb-6 pt-4 sm:min-h-[220px]"
              >
                <div className="flex h-full min-h-[168px] items-center justify-center transition duration-300 ease-out group-hover/illustration:scale-[1.03]">
                  <Graphic />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
