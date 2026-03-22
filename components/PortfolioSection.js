import SectionTitle from "./SectionTitle";

const portfolio = [
  { title: "Lakeside Wedding, Kochi", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80" },
  { title: "Traditional Hall Setup, Thrissur", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80" },
  { title: "Beachside Reception, Calicut", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80" }
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-14 sm:py-16">
      <div className="container-default">
        <SectionTitle
          title="Portfolio List Section"
          description="Featured venues and real event highlights to inspire visitors and showcase vendor quality."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {portfolio.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-cloud">
              <img src={item.image} alt={item.title} className="h-52 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-brand-700">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
