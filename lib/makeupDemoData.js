/** Sample data for the Velvet & Gilded makeup artist profile demo (sample content only). */

function digitsPrice(s) {
  const d = String(s || "").replace(/[^\d]/g, "");
  return d ? parseInt(d, 10) : null;
}

/**
 * Fake vendor row + `makeup_profile` for `/makeup/demo` — mirrors saved vendor shape.
 * @returns {object}
 */
export function getDemoMakeupVendor() {
  const d = MAKEUP_DEMO_ARTIST;
  return {
    id: "demo-makeup",
    businessName: d.artist,
    category: "Makeup",
    city: "Kochi",
    state: "Kerala",
    place: "Panampilly Nagar",
    location: "Kochi, Kerala",
    phone: "9876543210",
    description:
      "Editorial technique with on-the-day calm. Every look is calibrated for Kerala light, humidity, and the emotional arc of your celebration — from first look to final portrait.",
    galleryImages: d.portfolio.map((p) => p.src),
    profileImage: d.portfolio[0]?.src || null,
    makeupProfile: {
      tagline: "The Curated Atelier",
      specialty: d.specialty,
      bioTitle: "Bridal artistry, distilled.",
      bio:
        "Editorial technique with on-the-day calm. Every look is calibrated for Kerala light, humidity, and the emotional arc of your celebration — from first look to final portrait.",
      ratingScore: d.rating,
      reviewCount: d.review_count,
      stats: d.stats,
      urgency: d.urgency,
      whatsapp: d.whatsapp,
      beforeAfter: d.beforeAfter,
      serviceBlurbs: d.serviceBlurbs,
      packages: d.packages.map((pkg) => ({
        name: pkg.name,
        price: digitsPrice(pkg.price),
        tag: pkg.tag || null,
        features: pkg.features,
      })),
      testimonials: d.testimonials.map((t) => ({
        author: t.name,
        quote: t.quote,
        date: t.date,
      })),
      studio: {
        title: d.studio.title,
        address: d.studio.address,
        lat: d.studio.lat,
        lon: d.studio.lon,
      },
      gallery: d.portfolio.map((p) => p.src),
      aiWidget: {
        title: "Find Your Signature Look",
        body:
          "Answer a few prompts — we'll match palettes, draping, and timeline to your venue & outfits.",
        cta: "Start AI match",
      },
    },
  };
}

export const MAKEUP_DEMO_ARTIST = {
  artist: "Aiswarya Lakshmi",
  specialty: "Bridal Artistry Specialist",
  rating: 4.8,
  review_count: 124,
  stats: {
    experience: "8+ Years",
    weddings: "300+",
    location: "Kochi, KL",
  },
  urgency: {
    line: "Only 3 slots left for Dec 2026",
    sub: "Secure your trial before the festive rush.",
  },
  whatsapp: "919876543210",
  portfolio: [
    {
      src: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=80",
      alt: "Bridal makeup portrait",
      span: "tall",
    },
    {
      src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      alt: "Soft glam look",
      span: "short",
    },
    {
      src: "https://images.unsplash.com/photo-1516975086694-ed04fc6f5ed3?auto=format&fit=crop&w=800&q=80",
      alt: "Traditional bridal",
      span: "short",
    },
    {
      src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80",
      alt: "Editorial bridal",
      span: "tall",
    },
    {
      src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
      alt: "Makeup detail",
      span: "short",
    },
    {
      src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      alt: "Bridal prep",
      span: "short",
    },
  ],
  beforeAfter: {
    before: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
    after: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80",
  },
  services: [
    { id: "bridal", label: "Bridal", icon: "Heart" },
    { id: "groom", label: "Groom", icon: "User" },
    { id: "family", label: "Family", icon: "Users" },
    { id: "airbrush", label: "Airbrush", icon: "Wind" },
  ],
  serviceBlurbs: {
    bridal:
      "Full-day HD bridal with skin prep, contour tailored to lighting, and tear-proof finish — timed to your muhurtham.",
    groom:
      "Natural mattifying and even tone for cameras and close-ups — quick sessions that fit the baraat timeline.",
    family:
      "Coordinated palettes for mothers & sisters so the album feels cohesive without matching copy-paste looks.",
    airbrush:
      "Silicone-based airbrush for humid Kerala venues — featherlight, buildable, and flash-friendly.",
  },
  packages: [
    {
      name: "Luxury HD Bridal",
      price: "₹45,000",
      tag: "Most booked",
      features: ["Premium HD Makeup", "Advanced Hair Styling", "Saree Draping", "Touch-up kit"],
    },
    {
      name: "Classic Bridal",
      price: "₹32,000",
      tag: null,
      features: ["HD Makeup", "Hair Styling", "Dupatta setting"],
    },
    {
      name: "Intimate Ceremony",
      price: "₹22,000",
      tag: "Intimate weddings",
      features: ["Soft glam HD", "Half-up hair", "2h on-site"],
    },
  ],
  testimonials: [
    {
      name: "Anjali & Rahul",
      quote: "She understood my skin better than I do — I still looked like myself, just the best-lit version.",
      date: "Nov 2025",
    },
    {
      name: "Meera K.",
      quote: "Calm on a chaotic morning. The airbrush held through humidity and three outfit changes.",
      date: "Jan 2026",
    },
    {
      name: "Priya S.",
      quote: "Trials felt like a collaboration, not a sales pitch. The album shots are unreal.",
      date: "Dec 2025",
    },
  ],
  studio: {
    title: "Studio Location",
    address: "Panampilly Nagar, Kochi, Kerala",
    lat: 9.9405,
    lon: 76.2653,
  },
};
