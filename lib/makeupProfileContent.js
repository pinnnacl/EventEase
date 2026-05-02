/**
 * Builds the public makeup profile view model from vendor row + `makeup_profile` JSON.
 */

import { primaryImageUrl } from "./imageVariants";
import { formatInrPrice, parsePhotographyPackagePrice } from "./photographerProfileContent";

export const MAKEUP_SERVICE_TABS = [
  { id: "bridal", label: "Bridal", icon: "Heart" },
  { id: "groom", label: "Groom", icon: "User" },
  { id: "family", label: "Family", icon: "Users" },
  { id: "airbrush", label: "Airbrush", icon: "Wind" },
];

function toDisplayUrl(raw) {
  const u = primaryImageUrl(raw);
  if (u && /^https?:\/\//i.test(String(u).trim())) return String(u).trim();
  return "";
}

/**
 * @param {object} vendor - mapped vendor (includes makeupProfile, galleryImages, place, city, …)
 */
export function buildMakeupMarketing(vendor) {
  const profile =
    vendor.makeupProfile && typeof vendor.makeupProfile === "object" && !Array.isArray(vendor.makeupProfile)
      ? vendor.makeupProfile
      : {};

  const galleryRaw = Array.isArray(profile.gallery) && profile.gallery.length ? profile.gallery : vendor.galleryImages || [];
  const urls = galleryRaw.map((x) => toDisplayUrl(x)).filter(Boolean);

  const FALLBACK_PORTFOLIO = [
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516975086694-ed04fc6f5ed3?auto=format&fit=crop&w=800&q=80",
  ];

  const list = urls.length ? urls : FALLBACK_PORTFOLIO;
  const portfolio = list.map((src, i) => ({
    src,
    alt: `Portfolio ${i + 1}`,
    span: i % 3 === 0 ? "tall" : "short",
  }));

  const place = [vendor.place, vendor.city].filter(Boolean).join(", ") || vendor.location?.split(",")[0]?.trim() || "";
  const statePart = vendor.state?.trim();
  const defaultLoc = [place, statePart].filter(Boolean).join(", ") || "Kerala";

  const stats = {
    experience: String(profile.stats?.experience || "").trim() || "—",
    weddings: String(profile.stats?.weddings || "").trim() || "—",
    location: String(profile.stats?.location || "").trim() || defaultLoc,
  };

  const rating = Number(profile.ratingScore);
  const reviewCount = Number(profile.reviewCount);
  const ratingSafe = Number.isFinite(rating) && rating > 0 ? Math.min(5, Math.max(1, rating)) : 4.9;
  const reviewCountSafe = Number.isFinite(reviewCount) && reviewCount >= 0 ? Math.floor(reviewCount) : 0;

  const beforeAfter = {
    before: toDisplayUrl(profile.beforeAfter?.before || profile.beforeAfter?.beforeUrl || ""),
    after: toDisplayUrl(profile.beforeAfter?.after || profile.beforeAfter?.afterUrl || ""),
  };

  const urgency = {
    line: String(profile.urgency?.line || "").trim(),
    sub: String(profile.urgency?.sub || "").trim(),
  };

  const blurbs = {
    bridal: String(profile.serviceBlurbs?.bridal || profile.blurbs?.bridal || "").trim(),
    groom: String(profile.serviceBlurbs?.groom || profile.blurbs?.groom || "").trim(),
    family: String(profile.serviceBlurbs?.family || profile.blurbs?.family || "").trim(),
    airbrush: String(profile.serviceBlurbs?.airbrush || profile.blurbs?.airbrush || "").trim(),
  };

  const defaultBlurb =
    "We tailor products and timing to your celebration — tell us your venue, outfits, and timeline.";
  const serviceBlurbs = {
    bridal: blurbs.bridal || defaultBlurb,
    groom: blurbs.groom || defaultBlurb,
    family: blurbs.family || defaultBlurb,
    airbrush: blurbs.airbrush || defaultBlurb,
  };

  const rawPkgs = Array.isArray(profile.packages) ? profile.packages : [];
  const packages = rawPkgs
    .map((p) => {
      const name = String(p?.name || "").trim();
      const priceNum = parsePhotographyPackagePrice(p?.price);
      if (!name || priceNum == null) return null;
      const features = Array.isArray(p?.features)
        ? p.features.map((f) => String(f || "").trim()).filter(Boolean)
        : [];
      return {
        name,
        price: formatInrPrice(priceNum),
        priceSort: priceNum,
        tag: String(p?.tag || "").trim() || null,
        features: features.length ? features : ["Details on enquiry"],
      };
    })
    .filter(Boolean);
  packages.sort((a, b) => a.priceSort - b.priceSort);

  const rawReviews = Array.isArray(profile.testimonials) ? profile.testimonials : [];
  const testimonials = rawReviews
    .map((r) => {
      const name = String(r?.author || r?.name || "").trim();
      const quote = String(r?.quote || r?.text || "").trim();
      const date = String(r?.date || "").trim() || "Recent";
      if (!name || !quote) return null;
      return { name, quote, date };
    })
    .filter(Boolean);

  const studioLat = Number(profile.studio?.lat);
  const studioLon = Number(profile.studio?.lon);
  const studio = {
    title: String(profile.studio?.title || "Studio Location").trim() || "Studio Location",
    address: String(profile.studio?.address || "").trim() || [place, statePart].filter(Boolean).join(", ") || defaultLoc,
    lat: Number.isFinite(studioLat) ? studioLat : 9.94,
    lon: Number.isFinite(studioLon) ? studioLon : 76.27,
  };

  const whatsapp = String(profile.whatsapp || "").replace(/\D/g, "") || "";

  return {
    eyebrow: String(profile.tagline || "The Curated Atelier").trim() || "The Curated Atelier",
    artist: String(vendor.businessName || "Artist").trim() || "Artist",
    specialty: String(profile.specialty || "").trim() || "Bridal makeup artist",
    bioTitle: String(profile.bioTitle || "Bridal artistry, distilled.").trim(),
    bio: String(profile.bio || vendor.description || "")
      .trim()
      .slice(0, 2000),
    rating: ratingSafe,
    review_count: reviewCountSafe,
    stats,
    portfolio,
    beforeAfter,
    showBeforeAfter: Boolean(beforeAfter.before && beforeAfter.after),
    urgency,
    showUrgency: Boolean(urgency.line),
    whatsapp,
    serviceBlurbs,
    packages,
    testimonials,
    studio,
    services: MAKEUP_SERVICE_TABS,
    aiWidget: {
      title: String(profile.aiWidget?.title || "Find Your Signature Look").trim(),
      body:
        String(profile.aiWidget?.body || "").trim() ||
        "Answer a few prompts — we'll match palettes, draping, and timeline to your venue & outfits.",
      cta: String(profile.aiWidget?.cta || "Start AI match").trim(),
    },
  };
}
