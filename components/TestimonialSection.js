import SectionTitle from "./SectionTitle";

const testimonials = [
  {
    name: "Anjali & Rohit",
    text: "EventEase Kerala helped us find a perfect venue and amazing decorators in just two days."
  },
  {
    name: "Fathima N",
    text: "Simple process, trusted options, and quick responses from local vendors."
  },
  {
    name: "Nikhil M",
    text: "The curated suggestions saved us a lot of time and planning stress."
  }
];

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="w-full py-14 sm:py-16">
      <div className="container-default w-full max-w-none">
        <SectionTitle
          title="Testimonial Section"
          description="Customer testimonials and experiences with the platform and its verified vendors."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="glass-card p-6 shadow-cloud">
              <p className="text-slate-700">"{item.text}"</p>
              <p className="mt-4 font-semibold text-brand-700">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
