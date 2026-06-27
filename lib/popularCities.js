/** @typedef {{ id: string; name: string; label: string }} CityOption */

/** @type {CityOption[]} */
export const POPULAR_CITIES = [
  { id: "mumbai", name: "Mumbai", label: "Mumbai, Maharashtra" },
  { id: "delhi", name: "Delhi-NCR", label: "Delhi, India" },
  { id: "bengaluru", name: "Bengaluru", label: "Bengaluru, Karnataka" },
  { id: "hyderabad", name: "Hyderabad", label: "Hyderabad, Telangana" },
  { id: "chandigarh", name: "Chandigarh", label: "Chandigarh, India" },
  { id: "ahmedabad", name: "Ahmedabad", label: "Ahmedabad, Gujarat" },
  { id: "pune", name: "Pune", label: "Pune, Maharashtra" },
  { id: "chennai", name: "Chennai", label: "Chennai, Tamil Nadu" },
  { id: "kolkata", name: "Kolkata", label: "Kolkata, West Bengal" },
  { id: "kochi", name: "Kochi", label: "Kochi, Kerala" },
];

/** @type {CityOption[]} */
export const ALL_CITIES = [
  ...POPULAR_CITIES,
  { id: "jaipur", name: "Jaipur", label: "Jaipur, Rajasthan" },
  { id: "lucknow", name: "Lucknow", label: "Lucknow, Uttar Pradesh" },
  { id: "goa", name: "Goa", label: "Goa, India" },
  { id: "indore", name: "Indore", label: "Indore, Madhya Pradesh" },
  { id: "bhopal", name: "Bhopal", label: "Bhopal, Madhya Pradesh" },
  { id: "nagpur", name: "Nagpur", label: "Nagpur, Maharashtra" },
  { id: "visakhapatnam", name: "Visakhapatnam", label: "Visakhapatnam, Andhra Pradesh" },
  { id: "coimbatore", name: "Coimbatore", label: "Coimbatore, Tamil Nadu" },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", label: "Thiruvananthapuram, Kerala" },
  { id: "kozhikode", name: "Kozhikode", label: "Kozhikode, Kerala" },
];

/** @param {string} label */
export function locationDisplayName(label) {
  const t = String(label || "").trim();
  if (!t) return "Kochi";
  const popular = POPULAR_CITIES.find((c) => c.label === t);
  if (popular) return popular.name;
  return t.split(",")[0].trim() || "Kochi";
}
