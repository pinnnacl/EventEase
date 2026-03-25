import Section from "./Section";
import SectionHeader from "./SectionHeader";

const packages = [
  {
    name: "Coastal Breeze",
    description: "Beachside venues, light florals, and quick vendor intros for intimate guest lists.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    price: "INR 1.2L",
  },
  {
    name: "Backwater Glow",
    description: "Houseboat or lakeside settings with mandap styling and bundled photo + glam.",
    image: "https://images.unsplash.com/photo-1606800052052-a4af2a57d137?auto=format&fit=crop&w=600&q=80",
    price: "INR 2.6L",
  },
  {
    name: "Heritage Royale",
    description: "Palace and resort routes with RSVP support and an on-site coordinator.",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
    price: "INR 4.4L",
  },
  {
    name: "Design Your Day",
    description: "Mix five services your way with swaps up to a month out and planner chat.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
    price: "INR 2.2L",
  },
];

export default function WeddingPackagesSection() {
  return (
    <Section id="packages">
      <SectionHeader
        title="Popular packages"
        subtitle="Compact cards—image, summary, and bundle price only."
      />

      <ul className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {packages.map((pkg) => (
          <li key={pkg.name}>
            <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/70 bg-white shadow-sm ring-1 ring-black/[0.02] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300/80 hover:shadow-md">
              <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden">
                <img
                  src={pkg.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
                <h2 className="text-sm font-bold leading-snug tracking-tight text-wedding-ink sm:text-[0.9375rem]">
                  {pkg.name}
                </h2>
                <p className="line-clamp-2 text-[0.6875rem] leading-relaxed text-stone-600 sm:text-xs">
                  {pkg.description}
                </p>
                <div className="mt-auto pt-0.5">
                  <p className="text-[0.6rem] font-medium uppercase tracking-wider text-stone-500">Bundle price</p>
                  <p className="text-sm font-bold tabular-nums text-brand-600 sm:text-base">{pkg.price}</p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
