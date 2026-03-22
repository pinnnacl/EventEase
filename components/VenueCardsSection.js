import Link from "next/link";
import { featuredVenueCount, venues } from "../data/venues";
import Button from "./Button";
import Card from "./Card";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

export default function VenueCardsSection() {
  const featured = venues.slice(0, featuredVenueCount);

  return (
    <Section id="venues" className="bg-wedding-gradient">
      <SectionHeader
        title="Featured Venues"
        subtitle="Explore elegant spaces for ceremonies, receptions, and family celebrations."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((venue) => (
          <Card key={venue.id} className="group overflow-hidden border border-[#eadfcf]">
            <div className="relative">
              <img
                src={venue.image}
                alt=""
                className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700">
                {venue.location}
              </p>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-wedding-ink">{venue.name}</h3>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-600">{venue.price}</span>
                <span className="text-slate-600">{venue.capacity}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/venues">
          <Button variant="secondary" className="rounded-full px-8 py-3 text-sm">
            View all venues
          </Button>
        </Link>
      </div>
    </Section>
  );
}
