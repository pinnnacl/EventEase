import Button from "./Button";
import Section from "./Section";

export default function HeroSection() {
  return (
    <Section className="pt-8 sm:pt-12">
      <div className="relative overflow-hidden rounded-[28px] bg-black shadow-premium">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80"
          alt="Kerala wedding couple"
          className="h-[540px] w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />

        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-3xl px-6 sm:px-10 lg:px-14">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Kerala Wedding Planning Platform
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Plan Your Dream Kerala Wedding Effortlessly
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
              Discover trusted venues, decorators, caterers, and photographers in one elegant platform built for couples and families across Kerala.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button className="rounded-full px-7 py-3 text-sm">Start Planning</Button>
              <Button variant="secondary" className="rounded-full border-white/50 bg-white/10 px-7 py-3 text-sm text-white hover:bg-white/20">
                Explore Venues
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
