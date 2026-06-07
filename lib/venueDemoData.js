/** Static data for /venue/demo — no Supabase required. */

import { buildVenueDetailsPayload, PREDEFINED_VENUE_DETAIL_TITLES } from "./venueDetails";

const IMG = (id) => `https://images.unsplash.com/${id}?w=1600&q=80`;

const demoVenueDetailMap = {};
for (const t of PREDEFINED_VENUE_DETAIL_TITLES) {
  demoVenueDetailMap[t] = "Demo copy — replace with your venue specifics in the vendor portal.";
}

const DEMO_VENUE_DETAILS = buildVenueDetailsPayload(demoVenueDetailMap, [
  { title: "Flooring", description: "Premium granite in the main hall and carpeted pre-function areas." },
]);

export const DEMO_VENUE = {
  id: "00000000-0000-4000-8000-000000000001",
  userId: null,
  businessName: "Azure Bay Convention Centre",
  category: "Venue",
  location: "Marine Drive, Kochi, Kerala",
  place: "Marine Drive, Kochi",
  city: "Kochi",
  state: "Kerala",
  phone: "+91 98765 43210",
  description:
    "Azure Bay pairs waterfront views with a polished indoor hall for receptions and ceremonies. Our team handles stage lighting, guest seating, and vendor coordination so you can focus on the day.\n\nEvening events get soft uplighting and optional live band staging. Weekday packages are available for corporate offsites and milestone celebrations.\n\nCochin International Airport: ~1 hour drive\nVytilla Junction: 12 km\nTripunithura Town: 4 km",
  pricingRange: "Starts from ₹1,50,000",
  priceRange: "Starts from ₹1,50,000",
  profileImage: IMG("photo-1519167758481-83f29da1c0c9"),
  status: "approved",
  claimed: true,
  capacity: "500 guests",
  venueType: "Convention Centre",
  yearsInBusiness: 12,
  guestCapacity: 500,
  diningCapacity: 350,
  parkingCapacity: 120,
  airConditioned: true,
  stageAvailable: true,
  wheelchairAccessible: true,
  suitableFor: ["Weddings", "Receptions", "Conferences", "Banquet Halls"],
  featuredVenue: true,
  verifiedVenue: true,
  ratingScore: 4.9,
  reviewCount: 128,
  createdAt: null,
  galleryImages: [
    IMG("photo-1519167758481-83f29da1c0c9"),
    IMG("photo-1464366400600-7168b8af9bc3"),
    IMG("photo-1523438880610-6e5fd7a2d7a8"),
    IMG("photo-1530103862676-de8c9debad1d"),
    IMG("photo-1465495976277-438a4a4c0a27"),
  ],
  facilities: [
    "Air Conditioning",
    "Parking",
    "Dining hall",
    "Bridal room",
    "Stage",
    "Generator backup",
  ],
  venueDetails: DEMO_VENUE_DETAILS,
};

export const DEMO_SIMILAR = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    businessName: "Heritage Grand Auditorium",
    location: "Calicut, Kerala",
    place: "Calicut",
    city: "Calicut",
    state: "Kerala",
    profileImage: IMG("photo-1505236858219-8359eb29e329"),
    priceRange: "Starts from ₹1,20,000",
    category: "Auditorium",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    businessName: "Palm Grove Beach Lawn",
    location: "Alleppey, Kerala",
    place: "Alleppey",
    city: "Alleppey",
    state: "Kerala",
    profileImage: IMG("photo-1544161515-4ab6ce6db874"),
    priceRange: "Starts from ₹2,00,000",
    category: "Beach",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    businessName: "Lotus Indoor Arena",
    location: "Trivandrum, Kerala",
    place: "Trivandrum",
    city: "Trivandrum",
    state: "Kerala",
    profileImage: IMG("photo-1514933651103-005eec54c56b"),
    priceRange: "Ask for quote",
    category: "Auditorium",
  },
];
