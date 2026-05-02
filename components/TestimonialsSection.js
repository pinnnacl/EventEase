import Card from "./Card";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

const testimonials = [
  {
    name: "Aparna & Nithin",
    quote:
      "THAALI made vendor selection incredibly simple. Every recommendation matched our style perfectly.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Riya Joseph",
    quote:
      "The Gold package gave us clarity on budget and helped us book trusted vendors quickly without stress.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Faisal K",
    quote:
      "Professional support, premium options, and smooth communication from planning to the wedding day.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
];

export default function TestimonialsSection() {
  return (
    <Section id="testimonials">
      <SectionHeader
        title="Testimonials"
        subtitle="Loved by couples and families planning weddings across Kerala."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.name} className="p-6">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-wedding-gold/40" />
              <p className="text-sm font-semibold text-wedding-ink">{item.name}</p>
            </div>
            <p className="mt-4 leading-7 text-slate-600">"{item.quote}"</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
