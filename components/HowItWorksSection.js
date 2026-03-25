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
      className="-mt-6 !pt-5 !pb-[clamp(40px,6vw,120px)] sm:-mt-8 sm:!pt-6"
    >
      <div className="mb-12 w-full text-center sm:mb-16">
        <h2 className="text-fluid-section-title font-bold tracking-tight text-[#0f766e]">
          How it works
        </h2>
      </div>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
        {steps.map((step) => {
          const Graphic = step.Illustration;
          return (
            <article
              key={step.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200/70 bg-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-1 flex-col px-4 pb-3 pt-5 sm:px-5 sm:pt-6">
                <h3 className="text-base font-bold leading-snug text-[#0f766e] sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {step.description}
                </p>
              </div>

              <div className="group/illustration relative mt-auto min-h-[120px] flex-1 overflow-hidden bg-white px-4 pb-4 pt-2 sm:min-h-[140px] sm:px-5 sm:pb-4">
                <div className="flex h-full min-h-[100px] items-center justify-center transition duration-300 ease-out group-hover/illustration:scale-[1.02]">
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
