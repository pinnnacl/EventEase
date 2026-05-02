import Section from "./Section";
import {
  IllustrationPlanning,
  IllustrationDiscovery,
  IllustrationConnect,
} from "./illustrations/HowItWorksIllustrations";

const steps = [
  {
    title: "Tell us what you need",
    description:
      "Share your event date, budget, and requirements in our planning form.",
    Illustration: IllustrationPlanning,
  },
  {
    title: "Find available vendors",
    description:
      "See which vendors are available for your event date and requirements.",
    Illustration: IllustrationDiscovery,
  },
  {
    title: "Connect and book with confidence",
    description:
      "Review profiles, check ratings, and reach out to vendors directly.",
    Illustration: IllustrationConnect,
  },
];

export default function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      className="!pt-5 !pb-[clamp(40px,6vw,120px)] sm:!pt-6"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 w-full text-center sm:mb-12">
          <h2 className="text-fluid-section-title font-bold tracking-tight text-[#0f766e]">
            How it works
          </h2>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Graphic = step.Illustration;
            return (
              <article
                key={step.title}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_36px_-28px_rgba(20,43,60,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_18px_44px_-28px_rgba(20,43,60,0.34)]"
              >
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="text-[0.95rem] font-bold leading-snug text-[#0f766e] sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>

                <div className="mt-auto border-t border-stone-200/70 bg-stone-50/60 px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex items-center justify-center transition duration-300 ease-out group-hover:scale-[1.015]">
                    <div className="w-full max-w-[220px]">
                      <Graphic />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
