/** Static vendor row for /photography/demo — no Supabase required. */

const IMG = (id) => `https://images.unsplash.com/${id}?w=1600&q=80`;

export const DEMO_PHOTOGRAPHER = {
  id: "00000000-0000-4000-8000-000000000101",
  userId: null,
  businessName: "Arjun Suresh Photography",
  category: "Photographer",
  location: "Kochi, Kerala",
  place: "Kochi",
  city: "Kochi",
  state: "Kerala",
  phone: "+91 98765 43210",
  description:
    "Specializing in documenting the soul of South Indian weddings. I focus on the unscripted moments, the heavy emotions, and the architectural beauty of Kerala's heritage. Every frame is crafted to tell a timeless story that breathes with life and authenticity.",
  pricingRange: "₹75,000",
  priceRange: "₹75,000 / day",
  profileImage: IMG("photo-1519741497674-611481863552"),
  status: "approved",
  claimed: true,
  createdAt: null,
  galleryImages: [
    IMG("photo-1519741497674-611481863552"),
    IMG("photo-1606216794074-735e91aa2c92"),
    IMG("photo-1465495976277-438a4a4c0a27"),
    IMG("photo-1522673607200-164d1b6ce486"),
    IMG("photo-1583939003579-7303910dffe3"),
    IMG("photo-1469371670807-013ccf25f16a"),
  ],
  photographerProfile: {
    tagline: "Cinematic & emotional storytelling",
    description:
      "Specializing in documenting the soul of South Indian weddings. I focus on unscripted moments, honest emotion, and timeless frames.",
    locations: ["Kochi", "Ernakulam", "Thrissur"],
    packages: [
      {
        name: "Heritage",
        price: 75000,
        duration: "1 day",
        description: "Ideal for single-day celebrations with full coverage.",
        features: ["1 lead photographer", "250+ edited photos", "Digital delivery"],
        recommended: false,
      },
      {
        name: "Royal Legacy",
        price: 125000,
        duration: "1 day",
        description: "Most couples choose this for full wedding weekends.",
        features: [
          "2 photographers + 1 videographer",
          "500+ edited photos",
          "4K cinematic highlight reel",
          "Coffee table album",
        ],
        recommended: true,
      },
      {
        name: "Signature",
        price: 200000,
        duration: "1 day",
        description: "Complete crew for large weddings and multi-day events.",
        features: [
          "Full squad (4 members)",
          "RAW + 700+ edited photos",
          "Long documentary film",
          "Luxury leather-bound album",
        ],
        recommended: false,
      },
    ],
    heroImage: IMG("photo-1519741497674-611481863552"),
    gallery: [
      IMG("photo-1519741497674-611481863552"),
      IMG("photo-1606216794074-735e91aa2c92"),
      IMG("photo-1465495976277-438a4a4c0a27"),
      IMG("photo-1522673607200-164d1b6ce486"),
      IMG("photo-1583939003579-7303910dffe3"),
      IMG("photo-1469371670807-013ccf25f16a"),
    ],
    deliverables: [
      { icon: "clock", label: "4–6 weeks delivery time" },
      { icon: "photo", label: "400+ post-processed photos" },
      { icon: "raw", label: "RAW photos available (add-on)" },
      { icon: "video", label: "4K cinematic highlight reel" },
    ],
    ratingScore: 4.9,
    reviewCount: 128,
    trust: { years: "10+ years", events: "500+ events", verified: true },
  },
};
